import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, ScrollView, RefreshControl } from 'react-native';
import { Text, YStack, XStack, Card, H4, H5, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import SatisfactionSurvey from '../../src/components/ui/SatisfactionSurvey';
import { RespuestaItem } from '../../src/components/historial/RespuestaItem';
import { EvidenciaViewerModal } from '../../src/components/historial/EvidenciaViewerModal';
import { HistorialDenuncia, Respuesta, Evidencia } from '../../src/types/historial';
import { formatearFecha, formatearFechaCompleta, getEstadoColor, getEstadoTexto } from '../../src/utils/formatters';
import LoadingSpinner from '../../src/components/ui/Loading';
import { historialService } from '../../src/services/historial';

export default function DenunciaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Estados principales
  const [denuncia, setDenuncia] = useState<HistorialDenuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para evidencias
  const [evidenciaVisible, setEvidenciaVisible] = useState(false);
  const [evidenciaSeleccionada, setEvidenciaSeleccionada] = useState<Evidencia | null>(null);

  useEffect(() => {
    if (id) {
      cargarDetalleDenuncia();
    } else {
      setError('ID de denuncia no proporcionado');
      setLoading(false);
    }
  }, [id]);

  const cargarDetalleDenuncia = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [DETALLE] Cargando denuncia ID:', id);

      // Usar el servicio real de historial
      const denunciaData = await historialService.obtenerDenunciaPorId(id!);
      
      if (denunciaData) {
        setDenuncia(denunciaData);
        console.log('✅ [DETALLE] Denuncia cargada exitosamente');
        
        // Marcar respuestas como leídas si existen
        const respuestasNoLeidas = denunciaData.respuestas.filter(r => !r.leida);
        if (respuestasNoLeidas.length > 0) {
          await historialService.marcarRespuestaLeida(respuestasNoLeidas[0].id);
        }
      } else {
        setError('Denuncia no encontrada');
      }
    } catch (error: any) {
      console.error('❌ [DETALLE] Error cargando detalle:', error);
      setError(error.message || 'Error al cargar la denuncia');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarDetalleDenuncia();
    setRefreshing(false);
  };

  // Función para manejar la calificación
  const handleSatisfactionRating = async (rating: number) => {
    if (!denuncia) return;

    try {
      // Actualizar estado local inmediatamente para feedback visual
      setDenuncia(prev => prev ? { ...prev, satisfaccionCiudadano: rating } : null);

      console.log(`[API] Enviando calificación: ${rating} para denuncia ${id}`);

      // Llamar al servicio real
      await historialService.calificarSatisfaccion(denuncia.id, rating as 1 | 2 | 3 | 4 | 5);

      Alert.alert('¡Gracias!', 'Tu calificación ha sido registrada.');
    } catch (error: any) {
      console.error('[API] Error enviando calificación:', error);
      // Revertir cambio local si hay error
      setDenuncia(prev => prev ? { ...prev, satisfaccionCiudadano: undefined } : null);
      Alert.alert('Error', 'No se pudo enviar la calificación. Intenta nuevamente.');
    }
  };

  // Manejar visualización de evidencias
  const handleVerEvidencia = (evidencia: Evidencia) => {
    setEvidenciaSeleccionada(evidencia);
    setEvidenciaVisible(true);
  };

  // Manejar marcar respuesta como leída
  const handleMarcarRespuestaLeida = async (respuestaId: string) => {
    try {
      // Actualizar estado local
      setDenuncia(prev => {
        if (!prev) return null;

        const respuestasActualizadas = prev.respuestas.map(resp =>
          resp.id === respuestaId ? { ...resp, leida: true } : resp
        );

        return { ...prev, respuestas: respuestasActualizadas };
      });

      // Llamada al servicio
      await historialService.marcarRespuestaLeida(respuestaId);

    } catch (error) {
      console.error('Error marcando respuesta como leída:', error);
    }
  };

  // Pantalla de loading
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <AppHeader
          screenTitle="Cargando..."
          screenSubtitle="Obteniendo detalles"
          screenIcon="document-text"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <LoadingSpinner size="large" />
          <Text fontSize="$4" color="$gray9">
            Cargando detalles de la denuncia...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  // Pantalla de error
  if (error || !denuncia) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <AppHeader
          screenTitle="Error"
          screenSubtitle="No se pudo cargar"
          screenIcon="alert-circle"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <YStack flex={1} justifyContent="center" alignItems="center" p="$4" gap="$4">
          <Ionicons name="document-text" size={64} color="#ccc" />
          <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
            {error || 'Denuncia no encontrada'}
          </Text>
          <Text fontSize="$3" color="$textSecondary" textAlign="center">
            No se pudo cargar la información de esta denuncia
          </Text>
          <Button
            onPress={handleRefresh}
            variant="outlined"
            size="$4"
          >
            <Ionicons name="refresh" size={20} />
            <Text>Intentar nuevamente</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const respuestasNoLeidas = denuncia.respuestas.filter(r => !r.leida).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <AppHeader
        screenTitle={`Folio #${denuncia.numeroFolio}`}
        screenSubtitle={getEstadoTexto(denuncia.estado)}
        screenIcon="document-text"
        showBackButton={true}
        onBackPress={() => router.back()}
        showNotifications={respuestasNoLeidas > 0}
        notificationCount={respuestasNoLeidas}
      />

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E67E22']}
            tintColor="#E67E22"
          />
        }
      >
        <YStack gap="$4" p="$4">

          {/* Información principal */}
          <Card elevate p="$4" gap="$3">
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack flex={1} gap="$2">
                <H4 color="$textPrimary">{denuncia.titulo}</H4>
                <Text fontSize="$3" color="$textSecondary" lineHeight="$4">
                  {denuncia.descripcion}
                </Text>
              </YStack>
              <Card
                bg={getEstadoColor(denuncia.estado)}
                px="$3"
                py="$1"
                br="$3"
                ml="$3"
              >
                <Text color="white" fontSize="$2" fontWeight="bold">
                  {getEstadoTexto(denuncia.estado).toUpperCase()}
                </Text>
              </Card>
            </XStack>

            {/* Información adicional */}
            <YStack gap="$2">
              <XStack justifyContent="space-between">
                <Text fontSize="$2" color="$textSecondary">Fecha de creación</Text>
                <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                  {formatearFechaCompleta(denuncia.fechaCreacion)}
                </Text>
              </XStack>

              {denuncia.categoria && (
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$textSecondary">Categoría</Text>
                  <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                    {denuncia.categoria.nombre}
                  </Text>
                </XStack>
              )}

              {denuncia.departamentoAsignado && (
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$textSecondary">Departamento</Text>
                  <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                    {denuncia.departamentoAsignado.nombre}
                  </Text>
                </XStack>
              )}

              <XStack justifyContent="space-between">
                <Text fontSize="$2" color="$textSecondary">Prioridad</Text>
                <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                  {denuncia.prioridad.charAt(0).toUpperCase() + denuncia.prioridad.slice(1)}
                </Text>
              </XStack>
            </YStack>
          </Card>

          {/* Ubicación */}
          {denuncia.ubicacion && (
            <Card elevate p="$4" gap="$3">
              <H5 color="$textPrimary">📍 Ubicación</H5>
              <Text fontSize="$3" color="$textSecondary">
                {denuncia.ubicacion.direccion}
              </Text>
              {(denuncia.ubicacion.latitud && denuncia.ubicacion.longitud) && (
                <XStack gap="$2">
                  <Text fontSize="$2" color="$textSecondary">
                    Coordenadas: {denuncia.ubicacion.latitud.toFixed(6)}, {denuncia.ubicacion.longitud.toFixed(6)}
                  </Text>
                </XStack>
              )}
            </Card>
          )}

          {/* Evidencias iniciales */}
          {denuncia.evidenciasIniciales && denuncia.evidenciasIniciales.length > 0 && (
            <Card elevate p="$4" gap="$3">
              <H5 color="$textPrimary">📎 Evidencias iniciales</H5>
              <YStack gap="$2">
                {denuncia.evidenciasIniciales.map((evidencia) => (
                  <XStack
                    key={evidencia.id}
                    alignItems="center"
                    gap="$3"
                    p="$2"
                    bg="$gray1"
                    br="$3"
                    pressStyle={{ bg: "$gray2" }}
                    onPress={() => handleVerEvidencia(evidencia)}
                  >
                    <Ionicons name="image" size={20} color="#667eea" />
                    <Text flex={1} fontSize="$3" color="$textPrimary">
                      {evidencia.nombre}
                    </Text>
                    <Ionicons name="eye" size={16} color="#999" />
                  </XStack>
                ))}
              </YStack>
            </Card>
          )}

          {/* Respuestas */}
          <Card elevate p="$4" gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H5 color="$textPrimary">💬 Respuestas ({denuncia.respuestas.length})</H5>
              {respuestasNoLeidas > 0 && (
                <Card bg="$red10" px="$2" py="$1" br="$2">
                  <Text color="white" fontSize="$1" fontWeight="bold">
                    {respuestasNoLeidas} NUEVA{respuestasNoLeidas > 1 ? 'S' : ''}
                  </Text>
                </Card>
              )}
            </XStack>

            {denuncia.respuestas.length === 0 ? (
              <YStack alignItems="center" py="$4" gap="$2">
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text fontSize="$3" color="$textSecondary" textAlign="center">
                  Aún no hay respuestas de la municipalidad
                </Text>
                <Text fontSize="$2" color="$textSecondary" textAlign="center">
                  Te notificaremos cuando recibas una respuesta
                </Text>
              </YStack>
            ) : (
              <YStack gap="$3">
                {denuncia.respuestas.map((respuesta, index) => (
                  <RespuestaItem
                    key={respuesta.id}
                    respuesta={respuesta}
                    isFirst={index === 0}
                    isLast={index === denuncia.respuestas.length - 1}
                    onVerEvidencia={handleVerEvidencia}
                    onMarcarLeida={() => handleMarcarRespuestaLeida(respuesta.id)}
                  />
                ))}
              </YStack>
            )}
          </Card>

          {/* Encuesta de satisfacción */}
          {denuncia.estado === 'resuelto' && (
            <SatisfactionSurvey
              currentRating={denuncia.satisfaccionCiudadano}
              onRatingSubmit={handleSatisfactionRating}
            />
          )}

        </YStack>
      </ScrollView>

      {/* Modal para ver evidencias */}
      {evidenciaSeleccionada && (
        <EvidenciaViewerModal
          visible={evidenciaVisible}
          evidencia={evidenciaSeleccionada}
          onClose={() => {
            setEvidenciaVisible(false);
            setEvidenciaSeleccionada(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

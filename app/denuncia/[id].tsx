// app/denuncia/[id].tsx - ACTUALIZADO CON RESPUESTAS MUNICIPALES
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Text, YStack, XStack, Card, H4, H5, Button, Tabs, TabsTab, TabsContent } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import SatisfactionSurvey from '../../src/components/ui/SatisfactionSurvey';
import { RespuestaItem } from '../../src/components/historial/RespuestaItem';
import { EvidenciaViewerModal } from '../../src/components/historial/EvidenciaViewerModal';
import { RespuestaMunicipalCard } from '../../src/components/respuestas/RespuestaMunicipalCard';
import { HistorialDenuncia, Respuesta, Evidencia } from '../../src/types/historial';
import { formatearFecha, formatearFechaCompleta, getEstadoColor, getEstadoTexto } from '../../src/utils/formatters';
import LoadingSpinner from '../../src/components/ui/Loading';
import { historialService } from '../../src/services/historial';
import { useRespuestasMunicipales } from '../../src/hooks/useRespuestasMunicipales';

export default function DenunciaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Estados principales
  const [denuncia, setDenuncia] = useState<HistorialDenuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tabActiva, setTabActiva] = useState<'detalles' | 'respuestas'>('detalles');

  // Estados para evidencias
  const [evidenciaVisible, setEvidenciaVisible] = useState(false);
  const [evidenciaSeleccionada, setEvidenciaSeleccionada] = useState<Evidencia | null>(null);

  // Hook para respuestas municipales
  const {
    respuestas: respuestasMunicipales,
    loading: loadingRespuestas,
    error: errorRespuestas,
    hayRespuestas,
    totalRespuestas,
    refresh: refreshRespuestas,
    calificarRespuesta,
  } = useRespuestasMunicipales({ 
    publicacionId: Number(id), 
    autoLoad: true 
  });

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
    await Promise.all([
      cargarDetalleDenuncia(),
      refreshRespuestas()
    ]);
    setRefreshing(false);
  };

  // Función para manejar la calificación de la denuncia (existente)
  const handleSatisfactionRating = async (rating: number) => {
    if (!denuncia) return;

    try {
      setDenuncia(prev => prev ? { ...prev, satisfaccionCiudadano: rating } : null);
      console.log(`[API] Enviando calificación: ${rating} para denuncia ${id}`);
      await historialService.calificarSatisfaccion(denuncia.id, rating as 1 | 2 | 3 | 4 | 5);
      Alert.alert('¡Gracias!', 'Tu calificación ha sido registrada.');
    } catch (error: any) {
      console.error('[API] Error enviando calificación:', error);
      setDenuncia(prev => prev ? { ...prev, satisfaccionCiudadano: undefined } : null);
      Alert.alert('Error', 'No se pudo enviar la calificación. Intenta nuevamente.');
    }
  };

  // Función para manejar la calificación de respuestas municipales
  const handleCalificarRespuestaMunicipal = async (respuestaId: number, puntuacion: 1 | 2 | 3 | 4 | 5) => {
    try {
      await calificarRespuesta(respuestaId, puntuacion);
      Alert.alert('¡Gracias!', 'Tu calificación de la respuesta municipal ha sido registrada.');
    } catch (error: any) {
      console.error('Error calificando respuesta municipal:', error);
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
      setDenuncia(prev => {
        if (!prev) return null;
        const respuestasActualizadas = prev.respuestas.map(resp =>
          resp.id === respuestaId ? { ...resp, leida: true } : resp
        );
        return { ...prev, respuestas: respuestasActualizadas };
      });
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
        <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
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
        <YStack flex={1} justifyContent="center" alignItems="center" p="$4" space="$4">
          <Ionicons name="document-text" size={64} color="#ccc" />
          <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
            {error || 'Denuncia no encontrada'}
          </Text>
          <Text fontSize="$3" color="$textSecondary" textAlign="center">
            No se pudo cargar la información de esta denuncia
          </Text>
          <Button onPress={handleRefresh} variant="outlined" size="$4">
            <Ionicons name="refresh" size={20} />
            <Text>Reintentar</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  // Renderizado de contenido de detalles (existente)
  const renderDetallesContent = () => (
    <YStack space="$4">
      {/* Información básica */}
      <Card elevate bordered>
        <YStack padding="$4" space="$3">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1}>
              <Text fontSize="$2" color="$gray11" fontWeight="500" marginBottom="$1">
                {denuncia.numeroFolio}
              </Text>
              <H4 color="$textPrimary" marginBottom="$2">
                {denuncia.titulo}
              </H4>
              <Text fontSize="$3" color="$textSecondary" lineHeight="$5">
                {denuncia.descripcion}
              </Text>
            </YStack>
            <Text 
              fontSize="$2" 
              color="white"
              backgroundColor={getEstadoColor(denuncia.estado).main}
              paddingHorizontal="$3" 
              paddingVertical="$2" 
              borderRadius="$3"
              fontWeight="600"
            >
              {getEstadoTexto(denuncia.estado)}
            </Text>
          </XStack>
        </YStack>
      </Card>

      {/* Información adicional */}
      <Card elevate bordered>
        <YStack padding="$4" space="$3">
          <H5 color="$textPrimary">Información Adicional</H5>
          
          <XStack space="$4" flexWrap="wrap">
            <YStack space="$1">
              <Text fontSize="$2" color="$gray11">Categoría</Text>
              <Text fontSize="$3" color="$textPrimary" fontWeight="500">
                {denuncia.categoria}
              </Text>
            </YStack>
            
            <YStack space="$1">
              <Text fontSize="$2" color="$gray11">Fecha de Creación</Text>
              <Text fontSize="$3" color="$textPrimary">
                {formatearFechaCompleta(denuncia.fechaCreacion)}
              </Text>
            </YStack>
            
            {denuncia.departamentoAsignado && (
              <YStack space="$1">
                <Text fontSize="$2" color="$gray11">Departamento</Text>
                <Text fontSize="$3" color="$textPrimary">
                  {denuncia.departamentoAsignado}
                </Text>
              </YStack>
            )}
          </XStack>

          {denuncia.ubicacion && (
            <YStack space="$2">
              <Text fontSize="$3" fontWeight="500" color="$textPrimary">
                Ubicación
              </Text>
              <XStack alignItems="center" space="$2">
                <Ionicons name="location" size={16} color="#666" />
                <Text fontSize="$3" color="$textSecondary" flex={1}>
                  {denuncia.ubicacion.direccion}
                </Text>
              </XStack>
            </YStack>
          )}
        </YStack>
      </Card>

      {/* Evidencias */}
      {denuncia.evidencias.length > 0 && (
        <Card elevate bordered>
          <YStack padding="$4" space="$3">
            <H5 color="$textPrimary">Evidencias ({denuncia.evidencias.length})</H5>
            <XStack space="$2" flexWrap="wrap">
              {denuncia.evidencias.map((evidencia, index) => (
                <Pressable
                  key={evidencia.id}
                  onPress={() => handleVerEvidencia(evidencia)}
                >
                  <YStack
                    backgroundColor="$gray4"
                    padding="$3"
                    borderRadius="$3"
                    alignItems="center"
                    space="$2"
                    width={100}
                  >
                    <Ionicons 
                      name={evidencia.tipo === 'imagen' ? 'image' : 'document'} 
                      size={32} 
                      color="#666" 
                    />
                    <Text fontSize="$2" color="$textSecondary" textAlign="center">
                      {evidencia.nombre || `Evidencia ${index + 1}`}
                    </Text>
                  </YStack>
                </Pressable>
              ))}
            </XStack>
          </YStack>
        </Card>
      )}

      {/* Respuestas del sistema (historial interno) */}
      {denuncia.respuestas.length > 0 && (
        <Card elevate bordered>
          <YStack padding="$4" space="$3">
            <H5 color="$textPrimary">Seguimiento de la Denuncia</H5>
            {denuncia.respuestas.map((respuesta) => (
              <RespuestaItem
                key={respuesta.id}
                respuesta={respuesta}
                onMarcarLeida={handleMarcarRespuestaLeida}
                onVerEvidencia={handleVerEvidencia}
              />
            ))}
          </YStack>
        </Card>
      )}

      {/* Calificación de satisfacción */}
      {denuncia.estado === 'resuelto' && (
        <Card elevate bordered>
          <YStack padding="$4">
            <SatisfactionSurvey
              currentRating={denuncia.satisfaccionCiudadano}
              onRatingChange={handleSatisfactionRating}
            />
          </YStack>
        </Card>
      )}
    </YStack>
  );

  // Renderizado de contenido de respuestas municipales
  const renderRespuestasContent = () => (
    <YStack space="$4">
      {loadingRespuestas ? (
        <YStack alignItems="center" space="$4" padding="$6">
          <LoadingSpinner size="large" />
          <Text fontSize="$4" color="$gray9">
            Cargando respuestas municipales...
          </Text>
        </YStack>
      ) : errorRespuestas ? (
        <YStack alignItems="center" space="$4" padding="$6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text fontSize="$4" color="$red11" textAlign="center">
            Error al cargar respuestas
          </Text>
          <Text fontSize="$3" color="$gray9" textAlign="center">
            {errorRespuestas}
          </Text>
          <Button variant="outlined" onPress={refreshRespuestas}>
            <Ionicons name="refresh" size={20} />
            <Text>Reintentar</Text>
          </Button>
        </YStack>
      ) : !hayRespuestas ? (
        <YStack alignItems="center" space="$4" padding="$6">
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text fontSize="$4" color="$gray11" textAlign="center">
            Sin respuestas municipales
          </Text>
          <Text fontSize="$3" color="$gray9" textAlign="center">
            Aún no se han emitido respuestas oficiales para esta denuncia
          </Text>
        </YStack>
      ) : (
        <YStack space="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <H5 color="$textPrimary">
              Respuestas Municipales ({totalRespuestas})
            </H5>
            <Button size="$3" variant="outlined" onPress={refreshRespuestas}>
              <Ionicons name="refresh" size={16} />
            </Button>
          </XStack>
          
          {respuestasMunicipales.map((respuesta) => (
            <RespuestaMunicipalCard
              key={respuesta.id}
              respuesta={respuesta}
              onCalificar={handleCalificarRespuestaMunicipal}
              mostrarPublicacion={false} // No mostrar info de la publicación ya que estamos en su detalle
              compacto={false}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <AppHeader
        screenTitle="Detalle de Denuncia"
        screenSubtitle={denuncia.numeroFolio}
        screenIcon="document-text"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {/* Sistema de pestañas */}
      <Tabs
        value={tabActiva}
        onValueChange={(value) => setTabActiva(value as 'detalles' | 'respuestas')}
        orientation="horizontal"
        flexDirection="column"
        backgroundColor="$background"
      >
        {/* Header de pestañas */}
        <XStack backgroundColor="white" borderBottomWidth={1} borderColor="$borderColor">
          <TabsTab
            flex={1}
            value="detalles"
            paddingVertical="$3"
            borderBottomWidth={tabActiva === 'detalles' ? 2 : 0}
            borderBottomColor="$blue10"
          >
            <XStack alignItems="center" space="$2">
              <Ionicons 
                name="document-text" 
                size={18} 
                color={tabActiva === 'detalles' ? '#0066cc' : '#666'} 
              />
              <Text 
                color={tabActiva === 'detalles' ? '$blue10' : '$color'}
                fontWeight={tabActiva === 'detalles' ? '600' : '400'}
              >
                Detalles
              </Text>
            </XStack>
          </TabsTab>
          
          <TabsTab
            flex={1}
            value="respuestas"
            paddingVertical="$3"
            borderBottomWidth={tabActiva === 'respuestas' ? 2 : 0}
            borderBottomColor="$blue10"
          >
            <XStack alignItems="center" space="$2">
              <Ionicons 
                name="chatbubbles" 
                size={18} 
                color={tabActiva === 'respuestas' ? '#0066cc' : '#666'} 
              />
              <Text 
                color={tabActiva === 'respuestas' ? '$blue10' : '$color'}
                fontWeight={tabActiva === 'respuestas' ? '600' : '400'}
              >
                Respuestas
                {hayRespuestas && (
                  <Text fontSize="$2" color="$blue10">
                    {' '}({totalRespuestas})
                  </Text>
                )}
              </Text>
            </XStack>
          </TabsTab>
        </XStack>

        {/* Contenido de pestañas */}
        <TabsContent value="detalles" flex={1}>
          <ScrollView
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
            <YStack padding="$4">
              {renderDetallesContent()}
            </YStack>
          </ScrollView>
        </TabsContent>

        <TabsContent value="respuestas" flex={1}>
          <ScrollView
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
            <YStack padding="$4">
              {renderRespuestasContent()}
            </YStack>
          </ScrollView>
        </TabsContent>
      </Tabs>

      {/* Modal de evidencias */}
      <EvidenciaViewerModal
        visible={evidenciaVisible}
        evidencia={evidenciaSeleccionada}
        onClose={() => setEvidenciaVisible(false)}
      />
    </SafeAreaView>
  );
}
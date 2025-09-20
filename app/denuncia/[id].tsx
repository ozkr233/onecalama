// app/denuncia/[id].tsx - VERSIÓN CON DEBUG DE EVIDENCIAS
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, ScrollView, RefreshControl } from 'react-native';
import { Text, YStack, XStack, Card, H4, H5, Button, Tabs } from 'tamagui';
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
  const [tabActiva, setTabActiva] = useState<'detalles' | 'respuestas'>('detalles');

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

      const denunciaData = await historialService.obtenerDenunciaPorId(id!);
      
      if (denunciaData) {
        setDenuncia(denunciaData);
        console.log('✅ [DETALLE] Denuncia cargada exitosamente');
        
        // 🔍 DEBUG: Evidencias
        console.log('📎 [DEBUG] Evidencias encontradas:', denunciaData.evidencias?.length || 0);
        denunciaData.evidencias?.forEach((evidencia, index) => {
          console.log(`📷 [DEBUG] Evidencia ${index + 1}:`, {
            id: evidencia.id,
            nombre: evidencia.nombre,
            tipo: evidencia.tipo,
            url: evidencia.url,
            size: evidencia.size,
            fechaSubida: evidencia.fechaSubida
          });
        });
        
        // Marcar respuestas como leídas si existen
        const respuestasNoLeidas = denunciaData.respuestas?.filter(r => !r.leida) || [];
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

  // Función para manejar la calificación de la denuncia
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

  // Manejar visualización de evidencias CON DEBUG
  const handleVerEvidencia = (evidencia: Evidencia) => {
    console.log('👁️ [DEBUG] Abriendo evidencia:', {
      id: evidencia.id,
      nombre: evidencia.nombre,
      tipo: evidencia.tipo,
      url: evidencia.url,
      urlCompleta: construirUrlCompleta(evidencia.url)
    });
    
    // Crear una evidencia con URL completa para el modal
    const evidenciaConUrlCompleta = {
      ...evidencia,
      url: construirUrlCompleta(evidencia.url)
    };
    
    setEvidenciaSeleccionada(evidenciaConUrlCompleta);
    setEvidenciaVisible(true);
  };

  // Función para construir URL completa de Cloudinary
  const construirUrlCompleta = (rutaRelativa: string): string => {
    if (!rutaRelativa) return '';
    if (rutaRelativa.startsWith('http')) return rutaRelativa;
    
    // URL base de Cloudinary según tu configuración
    return `https://res.cloudinary.com/de06451wd/${rutaRelativa}`;
  };

  // Manejar marcar respuesta como leída
  const handleMarcarRespuestaLeida = async (respuestaId: string) => {
    try {
      setDenuncia(prev => {
        if (!prev) return null;
        const respuestasActualizadas = prev.respuestas?.map(resp =>
          resp.id === respuestaId ? { ...resp, leida: true } : resp
        ) || [];
        return { ...prev, respuestas: respuestasActualizadas };
      });
      await historialService.marcarRespuestaLeida(respuestaId);
    } catch (error) {
      console.error('Error marcando respuesta como leída:', error);
    }
  };

  // Función para debugging de evidencias
  const debugEvidencias = () => {
    if (!denuncia?.evidencias) {
      Alert.alert('Debug', 'No hay evidencias para debuggear');
      return;
    }

    console.log('🔍 [DEBUG] === ANÁLISIS DE EVIDENCIAS ===');
    denuncia.evidencias.forEach((evidencia, index) => {
      const urlCompleta = construirUrlCompleta(evidencia.url);
      console.log(`📷 Evidencia ${index + 1}:`, {
        id: evidencia.id,
        nombre: evidencia.nombre,
        tipo: evidencia.tipo,
        urlOriginal: evidencia.url,
        urlCompleta: urlCompleta,
        size: evidencia.size,
        mimeType: evidencia.mimeType,
        fechaSubida: evidencia.fechaSubida
      });
    });

    Alert.alert(
      'Debug Evidencias', 
      `Se encontraron ${denuncia.evidencias.length} evidencias. Revisa la consola para detalles completos.`
    );
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
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
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

  // Renderizado de contenido de detalles
  const renderDetallesContent = () => (
    <YStack gap="$4">
      {/* Información básica */}
      <Card elevate bordered>
        <YStack padding="$4" gap="$3">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1}>
              <Text fontSize="$2" color="$gray11" fontWeight="500" marginBottom="$1">
                {denuncia.codigo}
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
        <YStack padding="$4" gap="$3">
          <H5 color="$textPrimary">Información Adicional</H5>
          
          <XStack gap="$4" flexWrap="wrap">
            <YStack gap="$1">
              <Text fontSize="$2" color="$gray11">Categoría</Text>
              <Text fontSize="$3" color="$textPrimary" fontWeight="500">
                {denuncia.categoria}
              </Text>
            </YStack>
            
            <YStack gap="$1">
              <Text fontSize="$2" color="$gray11">Fecha de Creación</Text>
              <Text fontSize="$3" color="$textPrimary" fontWeight="500">
                {formatearFechaCompleta(denuncia.fechaCreacion)}
              </Text>
            </YStack>
            
            {denuncia.departamentoAsignado && (
              <YStack gap="$1">
                <Text fontSize="$2" color="$gray11">Departamento Asignado</Text>
                <Text fontSize="$3" color="$textPrimary" fontWeight="500">
                  {denuncia.departamentoAsignado}
                </Text>
              </YStack>
            )}
          </XStack>
        </YStack>
      </Card>

      {/* Ubicación */}
      <Card elevate bordered>
        <YStack padding="$4" gap="$3">
          <XStack alignItems="center" gap="$2">
            <Ionicons name="map" size={20} color="#E67E22" />
            <H5 color="$textPrimary">Ubicación</H5>
          </XStack>
          
          <YStack gap="$2">
            {/* Mostrar datos crudos del backend para debugging */}
            <XStack justifyContent="space-between">
              <Text fontSize="$2" color="$gray11">Nombre Calle:</Text>
              <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                {(denuncia as any).nombreCalle || 'No especificado'}
              </Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text fontSize="$2" color="$gray11">Número Calle:</Text>
              <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                {(denuncia as any).numeroCalle || 'No especificado'}
              </Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text fontSize="$2" color="$gray11">Junta Vecinal:</Text>
              <Text fontSize="$2" color="$textPrimary" fontWeight="500">
                {(denuncia as any).juntaVecinal || 'No especificada'}
              </Text>
            </XStack>

            {/* Coordenadas directas del backend */}
            <XStack justifyContent='space-between'>
              <Text fontSize="$2" color="$blue11" fontWeight="500">
                Coordenadas:
              </Text>
              <Text fontSize="$2" color="$blue10" fontFamily="$mono">
                Latitud: {(denuncia as any).latitud || 'No disponible'}
              </Text>
              <Text fontSize="$2" color="$blue10" fontFamily="$mono">
                Longitud: {(denuncia as any).longitud || 'No disponible'}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </Card>

      {/* Evidencias CON DEBUG MEJORADO */}
      <Card elevate bordered>
        <YStack padding="$4" gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="attach" size={20} color="#E67E22" />
              <H5 color="$textPrimary">
                Evidencias ({denuncia.evidencias?.length || 0})
              </H5>
            </XStack>
            
            {/* Botón de debug */}
            <Button size="$2" variant="outlined" onPress={debugEvidencias}>
              <Ionicons name="bug" size={16} />
              <Text fontSize="$2">Debug</Text>
            </Button>
          </XStack>
          
          {denuncia.evidencias && denuncia.evidencias.length > 0 ? (
            <YStack gap="$2">
              {denuncia.evidencias.map((evidencia, index) => (
                <Card
                  key={evidencia.id || index}
                  backgroundColor="$gray2"
                  padding="$3"
                  borderRadius="$3"
                  pressStyle={{ backgroundColor: '$gray3' }}
                  onPress={() => handleVerEvidencia(evidencia)}
                >
                  <XStack alignItems="center" gap="$3">
                    <Ionicons
                      name={evidencia.tipo === 'imagen' ? 'image' : 
                            evidencia.tipo === 'video' ? 'videocam' : 'document-text'}
                      size={24}
                      color="#667eea"
                    />
                    <YStack flex={1}>
                      <Text fontSize="$3" fontWeight="500">
                        {evidencia.nombre}
                      </Text>
                      <Text fontSize="$2" color="$gray9">
                        {evidencia.tipo.charAt(0).toUpperCase() + evidencia.tipo.slice(1)}
                        {evidencia.size && ` • ${Math.round(evidencia.size / 1024)} KB`}
                      </Text>
                      <Text fontSize="$1" color="$gray8" fontFamily="$mono">
                        URL: {evidencia.url}
                      </Text>
                    </YStack>
                    <YStack alignItems="center" gap="$1">
                      <Button
                        size="$2"
                        variant="outlined"
                        onPress={() => {
                          const urlCompleta = construirUrlCompleta(evidencia.url);
                          console.log('🔗 [DEBUG] URL completa:', urlCompleta);
                          Alert.alert('URL Debug', urlCompleta);
                        }}
                      >
                        <Text fontSize="$1">URL</Text>
                      </Button>
                      <Ionicons name="chevron-forward" size={16} color="#ccc" />
                    </YStack>
                  </XStack>
                </Card>
              ))}
            </YStack>
          ) : (
            <YStack alignItems="center" padding="$4" backgroundColor="$gray2" borderRadius="$3">
              <Ionicons name="image-outline" size={48} color="#ccc" />
              <Text fontSize="$3" color="$gray11" textAlign="center">
                No hay evidencias disponibles
              </Text>
              <Text fontSize="$2" color="$gray9" textAlign="center">
                Esta denuncia no tiene archivos adjuntos
              </Text>
            </YStack>
          )}
        </YStack>
      </Card>

      {/* Respuestas del historial */}
      {denuncia.respuestas && denuncia.respuestas.length > 0 && (
        <Card elevate bordered>
          <YStack padding="$4" gap="$3">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="chatbubbles" size={20} color="#E67E22" />
              <H5 color="$textPrimary">Respuestas ({denuncia.respuestas.length})</H5>
            </XStack>
            
            <YStack gap="$3">
              {denuncia.respuestas.map((respuesta, index) => (
                <RespuestaItem
                  key={respuesta.id || index}
                  respuesta={respuesta}
                  onMarcarComoLeida={handleMarcarRespuestaLeida}
                  onVerEvidencia={handleVerEvidencia}
                />
              ))}
            </YStack>
          </YStack>
        </Card>
      )}

      {/* Calificación de satisfacción */}
      {denuncia.estado === 'resuelto' && (
        <Card elevate bordered>
          <YStack padding="$4" gap="$3">
            <H5 color="$textPrimary">Calificar Servicio</H5>
            <SatisfactionSurvey
              onRate={handleSatisfactionRating}
              currentRating={denuncia.satisfaccionCiudadano}
              disabled={!!denuncia.satisfaccionCiudadano}
            />
          </YStack>
        </Card>
      )}
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <AppHeader
        screenTitle="Detalle de Denuncia"
        screenSubtitle={denuncia.codigo}
        screenIcon="document-text"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {/* Sistema de pestañas */}
      <Tabs
        defaultValue="detalles"
        value={tabActiva}
        onValueChange={(value) => setTabActiva(value as 'detalles' | 'respuestas')}
        orientation="horizontal"
        flexDirection="column"
        flex={1}
      >
        {/* Header de pestañas */}
        <Tabs.List
          backgroundColor="white"
          borderBottomWidth={1}
          borderColor="$borderColor"
          paddingHorizontal="$0"
          space="$0"
        >
          <Tabs.Trigger
            flex={1}
            value="detalles"
            paddingVertical="$3"
            backgroundColor={tabActiva === 'detalles' ? '$blue2' : 'transparent'}
            borderBottomWidth={tabActiva === 'detalles' ? 2 : 0}
            borderBottomColor="$blue10"
            unstyled
          >
            <XStack alignItems="center" gap="$2">
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
          </Tabs.Trigger>
          
          <Tabs.Trigger
            flex={1}
            value="respuestas"
            paddingVertical="$3"
            backgroundColor={tabActiva === 'respuestas' ? '$blue2' : 'transparent'}
            borderBottomWidth={tabActiva === 'respuestas' ? 2 : 0}
            borderBottomColor="$blue10"
            unstyled
          >
            <XStack alignItems="center" gap="$2">
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
                {denuncia.respuestas && denuncia.respuestas.length > 0 && (
                  <Text fontSize="$2" color="$blue10">
                    {' '}({denuncia.respuestas.length})
                  </Text>
                )}
              </Text>
            </XStack>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Contenido de pestañas */}
        <Tabs.Content value="detalles" flex={1}>
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
        </Tabs.Content>

        <Tabs.Content value="respuestas" flex={1}>
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
              {(!denuncia.respuestas || denuncia.respuestas.length === 0) ? (
                <YStack alignItems="center" gap="$4" padding="$6">
                  <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                  <Text fontSize="$4" color="$gray11" textAlign="center">
                    Sin respuestas aún
                  </Text>
                  <Text fontSize="$3" color="$gray9" textAlign="center">
                    Aún no se han emitido respuestas para esta denuncia
                  </Text>
                </YStack>
              ) : (
                <YStack gap="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H5 color="$textPrimary">
                      Respuestas ({denuncia.respuestas.length})
                    </H5>
                    <Button size="$3" variant="outlined" onPress={handleRefresh}>
                      <Ionicons name="refresh" size={16} />
                    </Button>
                  </XStack>
                  
                  {denuncia.respuestas.map((respuesta, index) => (
                    <RespuestaItem
                      key={respuesta.id || index}
                      respuesta={respuesta}
                      onMarcarComoLeida={handleMarcarRespuestaLeida}
                      onVerEvidencia={handleVerEvidencia}
                    />
                  ))}
                </YStack>
              )}
            </YStack>
          </ScrollView>
        </Tabs.Content>
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
// app/denuncia/[id].tsx - VERSIÓN CON DEBUG DE EVIDENCIAS
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { Text, YStack, XStack, Card, H4, H5, Button, Tabs } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import { EvidenciaViewerModal } from '../../src/components/historial/EvidenciaViewerModal';
import { HistorialDenuncia, Evidencia, Respuesta } from '../../src/types/historial';
import LoadingSpinner from '../../src/components/ui/Loading';
import { DenunciaDetailsTab } from '../../src/components/denuncia/DenunciaDetailsTab';
import { DenunciaResponsesTab } from '../../src/components/denuncia/DenunciaResponsesTab';
import { historialService } from '../../src/services/historial';
import { useRespuestasMunicipales } from '../../src/hooks/useRespuestasMunicipales';
import { RespuestaMunicipalFormateada } from '../../src/services/respuestasMunicipales';

const EXTENSIONES_IMAGEN = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']);
const EXTENSIONES_VIDEO = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm']);
const EXTENSIONES_DOCUMENTO = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']);

const obtenerTipoEvidenciaDesdeExtension = (extension?: string): Evidencia['tipo'] => {
  const ext = (extension || '').toLowerCase();
  if (EXTENSIONES_IMAGEN.has(ext)) return 'imagen';
  if (EXTENSIONES_VIDEO.has(ext)) return 'video';
  return 'documento';
};

const determinarTipoRespuestaDesdeSituacion = (situacionNueva?: string): Respuesta['tipo'] => {
  if (!situacionNueva) return 'respuesta';
  const situacion = situacionNueva.toLowerCase();
  if (situacion.includes('resuel') || situacion.includes('cerr')) {
    return 'resolucion';
  }
  if (situacion.includes('proceso') || situacion.includes('curso') || situacion.includes('actualiz')) {
    return 'actualizacion';
  }
  return 'respuesta';
};

const obtenerNombreEvidencia = (url: string, index: number, extension?: string) => {
  if (url) {
    const partes = url.split('/');
    const ultimo = partes[partes.length - 1];
    if (ultimo) {
      return ultimo;
    }
  }
  const sufijo = extension ? '.' + extension : '';
  return `evidencia_${index + 1}${sufijo}`;
};


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
  const publicacionId = useMemo(() => {
    if (!id) return null;
    const parsedId = Number(id);
    return Number.isNaN(parsedId) ? null : parsedId;
  }, [id]);

  const {
    respuestas: respuestasMunicipales,
    loading: respuestasLoading,
    error: respuestasError,
    refreshing: respuestasRefreshing,
    cargarRespuestas: cargarRespuestasMunicipales,
    refresh: refreshRespuestas,
    calificarRespuesta: calificarRespuestaMunicipal,
  } = useRespuestasMunicipales({
    publicacionId: publicacionId ?? undefined,
    autoLoad: false,
  });

  const [respuestasVista, setRespuestasVista] = useState<Respuesta[]>([]);

  useEffect(() => {
    setRespuestasVista([]);
  }, [publicacionId]);

  useEffect(() => {
    if (tabActiva === 'respuestas' && publicacionId !== null) {
      cargarRespuestasMunicipales();
    }
  }, [tabActiva, publicacionId, cargarRespuestasMunicipales]);

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
        
        // Eliminado: marcado de respuestas como leídas (backend no soporta)
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
    if (tabActiva === 'respuestas' && publicacionId !== null) {
      await refreshRespuestas();
    }
    setRefreshing(false);
  };
  const handleRefreshRespuestas = useCallback(async () => {
    if (publicacionId === null) return;
    await refreshRespuestas();
  }, [publicacionId, refreshRespuestas]);


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
  const construirUrlCompleta = useCallback((entrada: string): string => {
  if (!entrada) return '';
  // extraer http(s) en cualquier parte y forzar https
  const match = entrada.match(/https?:\/\/[^\s]+/);
  if (match) {
    return match[0].replace(/^http:\/\//, 'https://');
  }
  const path = entrada.replace(/^\/+/, '');
  return `https://res.cloudinary.com/de06451wd/${path}`;
}, []);

  const transformarRespuestasMunicipales = useCallback((items: RespuestaMunicipalFormateada[]): Respuesta[] => {
    return items.map((item) => {
      const partesMensaje: string[] = [];
      if (item.descripcion) partesMensaje.push(item.descripcion.trim());
      if (item.acciones) partesMensaje.push(`Acciones realizadas: ${item.acciones}`.trim());
      if (item.situacionAnterior || item.situacionNueva) {
        partesMensaje.push(`Situacion: ${item.situacionAnterior || 'Sin informacion'} -> ${item.situacionNueva || 'Sin informacion'}`);
      }

      const mensaje = partesMensaje.filter(Boolean).join('\n\n') || 'Sin informacion disponible';

      const evidencias = (item.evidencias || []).map((evidencia, evidenciaIndex) => {
        const extension = (evidencia.tipo || '').toLowerCase();
        return {
          id: evidencia.id?.toString() ?? `${item.id}-${evidenciaIndex}`,
          tipo: obtenerTipoEvidenciaDesdeExtension(extension),
          url: construirUrlCompleta(evidencia.url),
          nombre: obtenerNombreEvidencia(evidencia.url, evidenciaIndex, extension),
          fechaSubida: evidencia.fecha,
        } as Evidencia;
      });

      return {
        id: item.id.toString(),
        autor: item.funcionarioNombre || 'Municipalidad',
        mensaje,
        fechaRespuesta: item.fechaRespuesta,
        tipo: determinarTipoRespuestaDesdeSituacion(item.situacionNueva),
        esOficial: true,
        leida: false,
        evidencias,
        puntuacion: item.puntuacion ?? null,
      };
    });
  }, [construirUrlCompleta]);

  useEffect(() => {
    setRespuestasVista((prev) => {
      const mapeadas = transformarRespuestasMunicipales(respuestasMunicipales);
      return mapeadas.map((respuesta) => {
        const anterior = prev.find((prevRespuesta) => prevRespuesta.id === respuesta.id);
        return anterior ? { ...respuesta, leida: anterior.leida } : respuesta;
      });
    });
  }, [respuestasMunicipales, transformarRespuestasMunicipales]);

  const denunciaRender = useMemo(() => {
    if (!denuncia) return null;
    return { ...denuncia, respuestas: respuestasVista };
  }, [denuncia, respuestasVista]);

  // Eliminado: función para marcar respuesta como leída

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

  if (!denunciaRender) {
    return null;
  }

  const denunciaActual = denunciaRender;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <AppHeader
        screenTitle="Detalle de Denuncia"
        screenSubtitle={denunciaActual.codigo}
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
                {respuestasVista.length > 0 && (
                  <Text fontSize="$2" color="$blue10">
                    {' '}({respuestasVista.length})
                  </Text>
                )}
              </Text>
            </XStack>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Contenido de pestañas */}
        <Tabs.Content value="detalles" flex={1}>
          <DenunciaDetailsTab
            denuncia={denunciaActual}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onRate={handleSatisfactionRating}
            onVerEvidencia={handleVerEvidencia}
            onDebugEvidencias={debugEvidencias}
            buildEvidenceUrl={construirUrlCompleta}
          />
        </Tabs.Content>

        <Tabs.Content value="respuestas" flex={1}>
          <DenunciaResponsesTab
            respuestas={respuestasVista}
            loading={respuestasLoading && respuestasVista.length === 0}
            refreshing={respuestasRefreshing}
            error={respuestasError}
            onRefresh={handleRefreshRespuestas}
            onVerEvidencia={handleVerEvidencia}
            onCalificarMunicipal={(rid, p) => calificarRespuestaMunicipal(Number(rid), p)}
          />
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



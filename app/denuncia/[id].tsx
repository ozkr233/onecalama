// app/denuncia/[id].tsx - VERSIÓN CON DEBUG DE EVIDENCIAS
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { Text, YStack, XStack, Card, H4, H5, Button, Tabs } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import { EvidenciaViewerModal } from '../../src/components/historial/EvidenciaViewerModal';
import { HistorialDenuncia, Evidencia } from '../../src/types/historial';
import LoadingSpinner from '../../src/components/ui/Loading';
import { DenunciaDetailsTab } from '../../src/components/denuncia/DenunciaDetailsTab';
import { DenunciaResponsesTab } from '../../src/components/denuncia/DenunciaResponsesTab';
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
          <DenunciaDetailsTab
            denuncia={denuncia}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onRate={handleSatisfactionRating}
            onVerEvidencia={handleVerEvidencia}
            onMarcarRespuestaLeida={handleMarcarRespuestaLeida}
            onDebugEvidencias={debugEvidencias}
            buildEvidenceUrl={construirUrlCompleta}
          />
        </Tabs.Content>

        <Tabs.Content value="respuestas" flex={1}>
          <DenunciaResponsesTab
            respuestas={denuncia.respuestas}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onMarcarRespuestaLeida={handleMarcarRespuestaLeida}
            onVerEvidencia={handleVerEvidencia}
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


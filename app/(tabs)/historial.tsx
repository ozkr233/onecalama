// app/(tabs)/historial.tsx - ACTUALIZADO CON MANEJO DE EVIDENCIAS
import React, { useState } from 'react';
import { SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack, H4, H5, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import { ResumenEstadistico } from '../../src/components/historial/ResumenEstadistico';
import HistorialCard from '../../src/components/ui/HistorialCard';
import LoadingSpinner from '../../src/components/ui/Loading';
import { EvidenciaViewerModal } from '../../src/components/historial/EvidenciaViewerModal';
import { useHistorial } from '../../src/hooks/useHistorial';
import { HistorialDenuncia, Evidencia } from '../../src/types/historial';

export default function HistorialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Estados para el modal de evidencias
  const [evidenciaVisible, setEvidenciaVisible] = useState(false);
  const [evidenciaSeleccionada, setEvidenciaSeleccionada] = useState<Evidencia | null>(null);

  // Hook principal
  const {
    denuncias,
    estadisticas,
    loading,
    error,
    isRefreshing,
    isBackendConnected,
    notificacionesNoLeidas,
    totalDenuncias,
    hayDatos,
    hayError,
    hayFiltrosActivos,
    refresh,
    recargarCompleto,
    limpiarFiltros
  } = useHistorial();

  // Debug: Verificar qué datos llegan
  console.log('🔍 [SCREEN] Estado del historial:', {
    denunciasLength: denuncias?.length || 0,
    loading,
    error,
    hayDatos,
    primerasDenuncias: denuncias?.slice(0, 2).map(d => ({
      id: d?.id,
      codigo: d?.codigo,
      titulo: d?.titulo,
      evidencias: d?.evidencias?.length || 0,
      isNull: d === null,
      isUndefined: d === undefined
    }))
  });

  // Navegación a detalle de denuncia
  const handleCardPress = (denuncia: HistorialDenuncia) => {
    console.log('🔗 [SCREEN] Navegando a detalle:', denuncia.id);
    router.push(`/denuncia/${denuncia.id}`);
  };

  // Función para construir URL completa de Cloudinary
  const construirUrlCompleta = (rutaRelativa: string): string => {
    if (!rutaRelativa) return '';
    if (rutaRelativa.startsWith('http')) return rutaRelativa;
    return `https://res.cloudinary.com/de06451wd/${rutaRelativa}`;
  };

  // Manejar click en evidencia desde la tarjeta del historial
  const handleEvidenciaPress = (evidencia: Evidencia) => {
    console.log('[HISTORIAL] Abriendo evidencia desde historial:', {
      id: evidencia.id,
      nombre: evidencia.nombre,
      tipo: evidencia.tipo,
      url: evidencia.url
    });
    
    // Crear una evidencia con URL completa
    const evidenciaConUrlCompleta = {
      ...evidencia,
      url: construirUrlCompleta(evidencia.url)
    };
    
    setEvidenciaSeleccionada(evidenciaConUrlCompleta);
    setEvidenciaVisible(true);
  };



  // Validar datos antes de renderizar
  const denunciasValidas = denuncias?.filter(d => d && d.id) || [];

  // Renderizar cada item de denuncia
  const renderDenuncia = ({ item, index }: { item: HistorialDenuncia; index: number }) => (
    <HistorialCard
      denuncia={item}
      onPress={handleCardPress}
      onEvidenciaPress={handleEvidenciaPress}
      isFirst={index === 0}
      isLast={index === denunciasValidas.length - 1}
    />
  );

  // Componente de loading
  const LoadingState = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
      <LoadingSpinner size="large" />
      <Text fontSize="$4" color="$gray9">
        Cargando historial...
      </Text>
    </YStack>
  );

  // Componente de error
  const ErrorState = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
      <Ionicons name="alert-circle" size={64} color="#ef4444" />
      <Text fontSize="$5" fontWeight="heavy" color="$red11" textAlign="center">
        Error al cargar historial
      </Text>
      <Text fontSize="$3" color="$gray9" textAlign="center">
        {error || 'No se pudo cargar el historial de denuncias'}
      </Text>
      <Button onPress={recargarCompleto} variant="outlined" size="$4">
        <Ionicons name="refresh" size={20} />
        <Text>Reintentar</Text>
      </Button>
    </YStack>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text fontSize="$5" fontWeight="heavy" color="$gray11" textAlign="center">
        No hay denuncias aún
      </Text>
      <Text fontSize="$3" color="$gray9" textAlign="center">
        Cuando realices denuncias aparecerán aquí
      </Text>
      <Button onPress={() => router.push('/denuncias')} size="$4">
        <Ionicons name="add" size={20} />
        <Text>Crear primera denuncia</Text>
      </Button>
    </YStack>
  );

  // Header de la lista con estadísticas
  const ListHeader = () => (
    <YStack gap="$4" paddingBottom="$4">
      {/* Resumen estadístico si hay datos */}
      {estadisticas && hayDatos && (
        <ResumenEstadistico 
          estadisticas={estadisticas}
        />
      )}

      {/* Filtros activos */}
      {hayFiltrosActivos && (
        <XStack 
          justifyContent="space-between" 
          alignItems="center"
          backgroundColor="$blue2"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderRadius="$3"
          marginHorizontal="$4"
        >
          <XStack alignItems="center" gap="$2">
            <Ionicons name="filter" size={16} color="#0066cc" />
            <Text fontSize="$3" color="$blue11" fontWeight="500">
              Filtros aplicados
            </Text>
          </XStack>
          <Button 
            size="$2" 
            variant="outlined" 
            borderColor="$blue7"
            onPress={limpiarFiltros}
          >
            <Text fontSize="$2" color="$blue11">Limpiar</Text>
          </Button>
        </XStack>
      )}

      {/* Header de denuncias */}
      <XStack 
        justifyContent="space-between" 
        alignItems="center"
        paddingHorizontal="$4"
      >
        <H4 color="$textPrimary">
          Mis Denuncias ({denunciasValidas.length})
        </H4>
        
        {/* Notificaciones si hay respuestas no leídas */}
        {notificacionesNoLeidas > 0 && (
          <XStack alignItems="center" gap="$2">
            <Ionicons name="notifications" size={16} color="#ef4444" />
            <Text fontSize="$3" color="$red11" fontWeight="600">
              {notificacionesNoLeidas} nueva{notificacionesNoLeidas !== 1 ? 's' : ''}
            </Text>
          </XStack>
        )}
      </XStack>
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <AppHeader
        screenTitle="Historial"
        screenSubtitle={hayDatos ? 
          `${totalDenuncias} denuncias` : "Mis denuncias"}
        screenIcon="time"
        showBackButton={false}
      />

      {/* Indicador de conexión */}

      {loading && !isRefreshing ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : !hayDatos ? (
        <EmptyState />
      ) : (
        <FlatList
          data={denunciasValidas}
          renderItem={renderDenuncia}
          keyExtractor={(item, index) => `historial-${item?.id || index}`}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20 + insets.bottom,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={['#E67E22']}
              tintColor="#E67E22"
            />
          }
          ItemSeparatorComponent={() => <YStack height="$1" />}
          ListEmptyComponent={() => (
            <YStack padding="$4" alignItems="center">
              <Text fontSize="$3" color="$gray9" textAlign="center">
                No se pueden mostrar las denuncias en este momento
              </Text>
              <Button
                size="$3"
                variant="outlined"
                onPress={recargarCompleto}
                marginTop="$3"
              >
                <Ionicons name="refresh" size={16} />
                <Text>Reintentar</Text>
              </Button>
            </YStack>
          )}
        />
      )}

      {/* Modal de evidencias */}
      <EvidenciaViewerModal
        visible={evidenciaVisible}
        evidencia={evidenciaSeleccionada}
        onClose={() => setEvidenciaVisible(false)}
      />
    </SafeAreaView>
  );
}

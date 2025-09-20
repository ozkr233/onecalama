// app/(tabs)/historial.tsx - ACTUALIZADO PARA USAR EL CARD ORIGINAL
import React from 'react';
import { SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { Text, YStack, XStack, H4, H5, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import { ResumenEstadistico } from '../../src/components/historial/ResumenEstadistico';
import HistorialCard from '../../src/components/ui/HistorialCard';
import LoadingSpinner from '../../src/components/ui/Loading';
import { useHistorial } from '../../src/hooks/useHistorial';
import { HistorialDenuncia } from '../../src/types/historial';

export default function HistorialScreen() {
  const router = useRouter();

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
      isNull: d === null,
      isUndefined: d === undefined
    }))
  });

  // ✅ NAVEGACIÓN CORREGIDA PARA EL CARD ORIGINAL
  const handleCardPress = (denuncia: HistorialDenuncia) => {
    console.log('🔗 [SCREEN] Navegando a detalle:', denuncia.id);
    router.push(`/denuncia/${denuncia.id}`);
  };

  // Componente de indicador de conexión
  const ConnectionIndicator = () => (
    <XStack 
      justifyContent="space-between" 
      alignItems="center" 
      paddingHorizontal="$4"
      paddingVertical="$2"
      backgroundColor={isBackendConnected ? "$green2" : "$red2"}
      borderRadius="$3"
      marginHorizontal="$4"
      marginBottom="$3"
    >
      <XStack alignItems="center" space="$2">
        <Ionicons 
          name={isBackendConnected ? "wifi" : "wifi-off"} 
          size={16} 
          color={isBackendConnected ? "#22c55e" : "#ef4444"} 
        />
        <Text fontSize="$2" color={isBackendConnected ? "$green11" : "$red11"}>
          {isBackendConnected ? "Conectado" : "Sin conexión"}
        </Text>
      </XStack>
      
      {hayFiltrosActivos && (
        <Button
          size="$2"
          chromeless
          color="$blue10"
          onPress={limpiarFiltros}
        >
          <Ionicons name="close-circle" size={16} />
          <Text fontSize="$2">Limpiar</Text>
        </Button>
      )}
    </XStack>
  );

  // Componente de loading inicial
  const LoadingState = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
      <LoadingSpinner size="large" />
      <Text fontSize="$4" color="$gray9">Cargando historial...</Text>
      <Text fontSize="$2" color="$gray7">
        {isBackendConnected ? "Obteniendo datos..." : "Verificando conexión..."}
      </Text>
    </YStack>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <YStack 
      flex={1} 
      justifyContent="center" 
      alignItems="center" 
      space="$4"
      paddingHorizontal="$6"
    >
      <Ionicons name="document-text-outline" size={64} color="#666" />
      
      <YStack alignItems="center" space="$2">
        <H4 textAlign="center" color="$gray11">
          {hayFiltrosActivos ? "Sin resultados" : "Sin denuncias"}
        </H4>
        <Text fontSize="$3" textAlign="center" color="$gray9">
          {hayFiltrosActivos 
            ? "No se encontraron denuncias con los filtros aplicados"
            : "Aún no has realizado ninguna denuncia"
          }
        </Text>
      </YStack>

      {hayFiltrosActivos ? (
        <Button
          size="$4"
          theme="blue"
          onPress={limpiarFiltros}
        >
          <Ionicons name="refresh" size={20} />
          <Text>Limpiar filtros</Text>
        </Button>
      ) : (
        <Button
          size="$4"
          theme="orange"
          onPress={() => router.push('/denuncias')}
        >
          <Ionicons name="add" size={20} />
          <Text>Crear denuncia</Text>
        </Button>
      )}
    </YStack>
  );

  // Componente de estado de error
  const ErrorState = () => (
    <YStack 
      flex={1} 
      justifyContent="center" 
      alignItems="center" 
      space="$4"
      paddingHorizontal="$6"
    >
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
      
      <YStack alignItems="center" space="$2">
        <H4 textAlign="center" color="$red11">
          Error al cargar
        </H4>
        <Text fontSize="$3" textAlign="center" color="$gray9">
          {error}
        </Text>
      </YStack>

      <XStack space="$3">
        <Button
          size="$4"
          variant="outlined"
          onPress={recargarCompleto}
        >
          <Ionicons name="refresh" size={20} />
          <Text>Reintentar</Text>
        </Button>
      </XStack>
    </YStack>
  );

  // Componente de header de lista
  const ListHeader = () => (
    <YStack space="$4" paddingBottom="$4">
      {/* Resumen estadístico */}
      {estadisticas && (
        <YStack paddingHorizontal="$4">
          <ResumenEstadistico 
            estadisticas={estadisticas}
            isLoading={loading}
          />
        </YStack>
      )}

      {/* Header de denuncias */}
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        paddingHorizontal="$4"
        paddingTop="$2"
      >
        <YStack>
          <H5 color="$gray12">
            {hayFiltrosActivos ? "Resultados" : "Mis denuncias"}
          </H5>
          <Text fontSize="$2" color="$gray10">
            {totalDenuncias} {totalDenuncias === 1 ? 'denuncia' : 'denuncias'}
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );

  // ✅ FUNCIÓN DE RENDERIZADO ADAPTADA PARA EL CARD ORIGINAL
  const renderDenuncia = ({ item, index }: { item: HistorialDenuncia; index: number }) => {
    // Debug del item específico
    console.log(`🎯 [SCREEN] Renderizando item ${index}:`, {
      id: item?.id,
      codigo: item?.codigo,
      titulo: item?.titulo,
      isNull: item === null,
      isUndefined: item === undefined
    });

    // ✅ VALIDACIÓN: Verificar que el item existe y tiene datos válidos
    if (!item) {
      console.warn(`⚠️ [SCREEN] Item ${index} es null/undefined`);
      return null;
    }

    if (!item.id) {
      console.warn(`⚠️ [SCREEN] Item ${index} no tiene ID válido:`, item);
      return null;
    }

    // ✅ RENDERIZAR CON EL CARD ORIGINAL (props adaptadas)
    return (
      <HistorialCard
        key={`denuncia-${item.id}-${index}`}
        denuncia={item}                    // ✅ CORREGIDO: denuncia en lugar de item
        onPress={handleCardPress}          // ✅ CORREGIDO: función que recibe la denuncia completa
        isFirst={index === 0}              // ✅ AGREGADO: para estilo de primer elemento
        isLast={index === denunciasValidas.length - 1} // ✅ AGREGADO: para estilo de último elemento
      />
    );
  };

  // ✅ FILTRAR DATOS VÁLIDOS ANTES DE RENDERIZAR
  const denunciasValidas = React.useMemo(() => {
    if (!Array.isArray(denuncias)) {
      console.warn('⚠️ [SCREEN] denuncias no es un array:', typeof denuncias);
      return [];
    }

    const validas = denuncias.filter((denuncia, index) => {
      const esValida = denuncia && 
                      typeof denuncia === 'object' && 
                      denuncia.id && 
                      denuncia.codigo;
      
      if (!esValida) {
        console.warn(`⚠️ [SCREEN] Denuncia ${index} es inválida:`, denuncia);
      }
      
      return esValida;
    });

    console.log(`✅ [SCREEN] Denuncias válidas: ${validas.length} de ${denuncias.length}`);
    return validas;
  }, [denuncias]);

  // Render principal
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <AppHeader
        screenTitle="Historial"
        screenSubtitle={hayDatos ? `${totalDenuncias} denuncias` : "Mis denuncias"}
        screenIcon="time"
        showBackButton={false}
      />

      {/* Indicador de conexión */}
      <ConnectionIndicator />

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
            paddingBottom: 20,
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
    </SafeAreaView>
  );
}
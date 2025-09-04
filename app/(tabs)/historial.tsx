// app/(tabs)/historial.tsx - PANTALLA DESDE CERO
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

  // Navegación a detalle
  const handleNavigateToDetail = (denunciaId: string) => {
    console.log('🔗 [SCREEN] Navegando a detalle:', denunciaId);
    router.push(`/denuncias/${denunciaId}`);
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
          onPress={() => router.push('/denuncias/nueva')}
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
            {totalDenuncias} {totalDenuncias === 1 ? "denuncia" : "denuncias"}
          </Text>
        </YStack>

        <Button
          size="$3"
          variant="outlined"
          chromeless
          onPress={() => {
            // TODO: Implementar modal de filtros
            console.log('🔍 [SCREEN] Abrir filtros');
          }}
        >
          <Ionicons name="options-outline" size={16} />
          <Text fontSize="$2">Filtros</Text>
          {hayFiltrosActivos && (
            <YStack
              backgroundColor="$orange9"
              width={8}
              height={8}
              borderRadius={4}
              marginLeft="$1"
            />
          )}
        </Button>
      </XStack>
    </YStack>
  );

  // Loading inicial
  if (loading && !hayDatos && !hayError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <AppHeader 
          screenTitle="Mi Historial"
          showNotifications={true}
          notificationCount={notificacionesNoLeidas}
        />
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <AppHeader 
        screenTitle="Mi Historial"
        showNotifications={true}
        notificationCount={notificacionesNoLeidas}
      />

      {/* Indicador de conexión */}
      <ConnectionIndicator />

      {/* Lista principal */}
      <FlatList
        data={denuncias}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={['#E67E22']}
            tintColor="#E67E22"
          />
        }
        ListHeaderComponent={<ListHeader />}
        renderItem={({ item, index }) => (
          <YStack paddingHorizontal="$4" paddingBottom="$3">
            <HistorialCard
              item={item}
              onPress={() => handleNavigateToDetail(item.id)}
              isFirst={index === 0}
              isLast={index === denuncias.length - 1}
            />
          </YStack>
        )}
        ListEmptyComponent={() => {
          // Mostrar error si hay error y no hay datos
          if (hayError && !hayDatos) {
            return <ErrorState />;
          }
          
          // Mostrar estado vacío
          if (!hayDatos) {
            return <EmptyState />;
          }
          
          return null;
        }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100
        }}
      />

      {/* Toast de error flotante si hay datos pero también error */}
      {hayError && hayDatos && (
        <YStack
          position="absolute"
          bottom="$10"
          left="$4"
          right="$4"
          backgroundColor="$red9"
          padding="$3"
          borderRadius="$4"
          elevation={5}
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={3.84}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" space="$2" flex={1}>
              <Ionicons name="warning" size={20} color="white" />
              <Text fontSize="$3" color="white" numberOfLines={2}>
                {error}
              </Text>
            </XStack>
            
            <Button
              size="$2"
              chromeless
              color="white"
              onPress={recargarCompleto}
            >
              <Ionicons name="refresh" size={16} color="white" />
            </Button>
          </XStack>
        </YStack>
      )}
    </SafeAreaView>
  );
}
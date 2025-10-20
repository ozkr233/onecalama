// app/(tabs)/anuncios.tsx - VERSIÓN MEJORADA CON BACKEND
import React, { useState } from 'react';
import { Text, YStack, XStack, Button, Card, Spinner } from 'tamagui';
import { SafeAreaView, ScrollView, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../src/components/layout/AppHeader';
import AnuncioCard from '../../src/components/ui/AnuncioCard';
import { Badge } from '../../src/components/ui/Badge';
import { useAnuncios } from '../../src/hooks/useAnuncios';

export default function AnunciosScreen() {
  const { 
    anuncios, 
    loading, 
    error, 
    isConnected,
    connectionStatus,
    statistics,
    refetch,
    testConnection
  } = useAnuncios();
  
  const [testingConnection, setTestingConnection] = useState(false);

  // Función para manejar test de conexión manual
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await testConnection();
      Alert.alert(
        result ? '✅ Conexión Exitosa' : '❌ Sin Conexión',
        result 
          ? 'La conexión con el servidor funciona correctamente'
          : 'No se pudo conectar con el servidor. Verifica tu internet.',
        [{ text: 'OK' }]
      );
    } finally {
      setTestingConnection(false);
    }
  };


  // Componente de estadísticas mejorado
  const StatisticsRow = () => {
    if (!statistics) return null;

    return (
      <XStack jc="space-around" p="$3" bg="$background" br="$3" mb="$3">
        <YStack ai="center">
          <Text fontSize="$5" fontWeight="bold" color="$primary">
            {statistics.total}
          </Text>
          <Text fontSize="$2" color="$textSecondary">Total</Text>
        </YStack>
        <YStack ai="center">
          <Text fontSize="$5" fontWeight="bold" color="$green9">
            {statistics.activos}
          </Text>
          <Text fontSize="$2" color="$textSecondary">Activos</Text>
        </YStack>
        <YStack ai="center">
          <Text fontSize="$5" fontWeight="bold" color="$blue9">
            {statistics.programados}
          </Text>
          <Text fontSize="$2" color="$textSecondary">Programados</Text>
        </YStack>
        <YStack ai="center">
          <Text fontSize="$5" fontWeight="bold" color="$gray9">
            {statistics.finalizados}
          </Text>
          <Text fontSize="$2" color="$textSecondary">Finalizados</Text>
        </YStack>
      </XStack>
    );
  };

  // Componente de estado vacío
  const EmptyState = () => (
    <Card
      bg="white"
      p="$6"
      br="$4"
      ai="center"
      gap="$4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <YStack ai="center" gap="$3">
        <Ionicons name="megaphone-outline" size={64} color="#E0E0E0" />
        <Text fontSize="$5" fontWeight="bold" color="$textSecondary" ta="center">
          No hay anuncios disponibles
        </Text>
        <Text fontSize="$4" color="$textSecondary" ta="center" maxWidth={280}>
          {isConnected 
            ? 'No hay anuncios municipales publicados en este momento'
            : 'Sin conexión al servidor. Los anuncios se mostrarán cuando se restablezca la conexión.'
          }
        </Text>
      </YStack>

      <Button
        size="$4"
        bg="$primary"
        color="white"
        onPress={refetch}
        disabled={loading}
        pressStyle={{
          bg: "#D35400",
          scale: 0.95
        }}
      >
        <XStack ai="center" gap="$2">
          <Ionicons name="refresh" size={16} color="white" />
          <Text color="white" fontWeight="bold">
            {isConnected ? 'Actualizar' : 'Reintentar conexión'}
          </Text>
        </XStack>
      </Button>
    </Card>
  );

  // Componente de error mejorado
  const ErrorState = () => (
    <Card
      bg="white"
      p="$6"
      br="$4"
      ai="center"
      gap="$4"
      borderWidth={1}
      borderColor="$red8"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <YStack ai="center" gap="$3">
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text fontSize="$5" fontWeight="bold" color="$red10" ta="center">
          Error al cargar anuncios
        </Text>
        <Text fontSize="$4" color="$textSecondary" ta="center" maxWidth={280}>
          {error || 'Ocurrió un error inesperado al obtener los anuncios'}
        </Text>
      </YStack>

      <XStack gap="$2">
        <Button
          size="$4"
          bg="$red8"
          color="white"
          onPress={refetch}
          disabled={loading}
          pressStyle={{
            bg: "$red9",
            scale: 0.95
          }}
          flex={1}
        >
          <XStack ai="center" gap="$2">
            <Ionicons name="refresh" size={16} color="white" />
            <Text color="white" fontWeight="bold">
              Reintentar
            </Text>
          </XStack>
        </Button>

        <Button
          size="$4"
          variant="outlined"
          borderColor="$blue8"
          color="$blue9"
          onPress={handleTestConnection}
          disabled={testingConnection}
          flex={1}
        >
          <XStack ai="center" gap="$2">
            <Ionicons name="checkmark-circle-outline" size={16} color="#3B82F6" />
            <Text color="$blue9" fontWeight="bold">
              Test API
            </Text>
          </XStack>
        </Button>
      </XStack>
    </Card>
  );

  // Componente de carga inicial
  const LoadingState = () => (
    <Card
      bg="white"
      p="$6"
      br="$4"
      ai="center"
      gap="$4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <YStack ai="center" gap="$4">
        <Spinner size="large" color="$primary" />
        <Text fontSize="$5" fontWeight="bold" color="$textSecondary" ta="center">
          Cargando anuncios...
        </Text>
        <Text fontSize="$4" color="$textSecondary" ta="center">
          {connectionStatus === 'testing' 
            ? 'Conectando con el servidor...'
            : 'Obteniendo la información más reciente'
          }
        </Text>
      </YStack>
    </Card>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        {/* Header unificado */}
        <AppHeader
          screenTitle="Anuncios Municipales"
          screenSubtitle="Información oficial y noticias"
          screenIcon="megaphone"
          showAppInfo={false}
        />

        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={['#E67E22']}
              tintColor="#E67E22"
            />
          }
        >
          <YStack f={1} p="$4" gap="$4">
            

            {/* Header de contenido */}
            <XStack ai="center" jc="space-between">
              <YStack>
                <Text fontSize="$6" fontWeight="bold" color="$textPrimary">
                  Últimos Anuncios
                </Text>
                  <XStack ai="center" gap="$2">
                    <Text fontSize="$3" color="$textSecondary">
                      {anuncios.length} anuncio{anuncios.length !== 1 ? 's' : ''} disponible{anuncios.length !== 1 ? 's' : ''}
                    </Text>
                    {!isConnected && (
                      <Badge variant="warning" size="sm">
                        OFFLINE
                      </Badge>
                    )}
                  </XStack>
              </YStack>

              <Button
                size="$3"
                variant="outlined"
                bg="transparent"
                borderColor="$primary"
                color="$primary"
                onPress={refetch}
                disabled={loading}
                pressStyle={{
                  bg: "$primary",
                  borderColor: "$primary",
                  scale: 0.95
                }}
              >
                <XStack ai="center" gap="$1">
                  <Ionicons
                    name="refresh"
                    size={14}
                    color={loading ? "#ccc" : "#E67E22"}
                  />
                  <Text fontSize="$3" fontWeight="600">
                    Actualizar
                  </Text>
                </XStack>
              </Button>
            </XStack>

            {/* Estados condicionales */}
            {loading && anuncios.length === 0 ? (
              <LoadingState />
            ) : error && anuncios.length === 0 ? (
              <ErrorState />
            ) : anuncios.length === 0 ? (
              <EmptyState />
            ) : (
              /* Lista de anuncios */
              <YStack gap="$3">
                {anuncios.map((anuncio) => (
                  <AnuncioCard 
                    key={anuncio.id} 
                    anuncio={anuncio}
                    isOffline={!isConnected}
                  />
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
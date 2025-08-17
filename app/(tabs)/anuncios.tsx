// app/(tabs)/anuncios.tsx
import React from 'react';
import { Text, YStack, XStack, Button, Card, Spinner } from 'tamagui';
import { SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../src/components/layout/AppHeader';
import AnuncioCard from '../../src/components/ui/AnuncioCard';
import { useAnuncios } from '../../src/hooks/useAnuncios';

export default function AnunciosScreen() {
  const { anuncios, loading, error, refetch } = useAnuncios();

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
          Por el momento no hay anuncios municipales publicados
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
            Actualizar
          </Text>
        </XStack>
      </Button>
    </Card>
  );

  // Componente de error
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
      >
        <XStack ai="center" gap="$2">
          <Ionicons name="refresh" size={16} color="white" />
          <Text color="white" fontWeight="bold">
            Reintentar
          </Text>
        </XStack>
      </Button>
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
          Obteniendo la información más reciente
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
            {/* Header de estadísticas */}
            <XStack ai="center" jc="space-between">
              <YStack>
                <Text fontSize="$6" fontWeight="bold" color="$textPrimary">
                  Últimos Anuncios
                </Text>
                <Text fontSize="$3" color="$textSecondary">
                  {anuncios.length} anuncio{anuncios.length !== 1 ? 's' : ''} disponible{anuncios.length !== 1 ? 's' : ''}
                </Text>
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
              <YStack gap="$4">
                {anuncios.map((anuncio) => (
                  <AnuncioCard key={anuncio.id} anuncio={anuncio} />
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
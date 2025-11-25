// app/(tabs)/index.tsx - PANTALLA PRINCIPAL ACTUALIZADA CON ANUNCIOS
import React from 'react';
import { Text, YStack, XStack, Button, Card, H4, H5, Spinner } from 'tamagui';
import { SafeAreaView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import { WelcomeSection } from '../../src/components/ui/WelcomeSection';
import AnuncioCard from '../../src/components/ui/AnuncioCard';
import { useAuth } from '../../src/hooks/useAuth';
import { useAnuncios } from '../../src/hooks/useAnuncios';
import { useEstadisticas } from '../../src/hooks/useApiData';
import { DEFAULT_HISTORIAL_PAGE_SIZE } from '../../src/services/historial';
import PushTest from '../../src/components/debug/PushTest';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { anuncios, loading: anunciosLoading } = useAnuncios();
  const {
    data: estadisticas,
    loading: estadisticasLoading,
    error: estadisticasError,
    refresh: refreshEstadisticas
  } = useEstadisticas({ historialLimit: DEFAULT_HISTORIAL_PAGE_SIZE });
  const [isConnected, setIsConnected] = React.useState(true); // Estado de conexión
  const insets = useSafeAreaInsets();

  // Si no está autenticado, mostrar mensaje de carga
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Text fontSize="$4" color="$textSecondary">
            Verificando autenticación...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }
  const anunciosRecientes = anuncios.slice(0, 1);
  const statsActivas =
    estadisticas?.activas ??
    ((estadisticas?.pendientes ?? 0) + (estadisticas?.enProceso ?? 0));
  const statsResueltas = estadisticas?.resueltas ?? 0;
  const statsEnProceso = estadisticas?.enProceso ?? 0;
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header con información de la app y usuario */}
      <AppHeader
        screenTitle="Inicio"
        screenSubtitle="Panel principal"
        screenIcon="home"
        showAppInfo={true}
        showLogout={true}
        showNotifications={true}
        notificationCount={0} // 
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (insets?.bottom || 0) + 70 }}
      >
        <YStack p="$4" gap="$4">
          {/* Sección de bienvenida personalizada */}
          <WelcomeSection />

          {/* Acciones Rápidas */}
          <Card
            bg="white"
            p="$4"
            borderRadius="$4"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={3}
          >
            <H4 mb="$4" color="$textPrimary" fontWeight="bold">
              Acciones Rápidas
            </H4>

            <YStack gap="$3">
              {/* Botón principal: Nueva Denuncia */}
              <Button
                size="$5"
                bg="$primary"
                color="white"
                fontWeight="bold"
                onPress={() => router.push('/denuncias')}
                pressStyle={{ 
                  bg: "$primaryDark", 
                  scale: 0.98 
                }}
                shadowColor="$primary"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.3}
                shadowRadius={8}
                elevation={8}
              >
                <XStack alignItems="center" gap="$3">
                  <Ionicons name="add-circle" size={24} color="white" />
                  <Text color="white" fontSize="$5" fontWeight="bold">
                    Nueva Denuncia
                  </Text>
                </XStack>
              </Button>

              {/* Botones secundarios */}
              <XStack gap="$3">
                <Button
                  flex={1}
                  size="$4"
                  bg="$secondary"
                  color="white"
                  fontWeight="600"
                  onPress={() => router.push('/historial')}
                  pressStyle={{ 
                    bg: "$secondaryDark", 
                    scale: 0.98 
                  }}
                >
                  <XStack alignItems="center" gap="$2">
                    <Ionicons name="time" size={18} color="white" />
                    <Text color="white" fontSize="$4" fontWeight="600">
                      Historial
                    </Text>
                  </XStack>
                </Button>

                <Button
                  flex={1}
                  size="$4"
                  bg="$info"
                  color="white"
                  fontWeight="600"
                  onPress={() => router.push('/anuncios')}
                  pressStyle={{ 
                    bg: "#1976D2", 
                    scale: 0.98 
                  }}
                >
                  <XStack alignItems="center" gap="$2">
                    <Ionicons name="megaphone" size={18} color="white" />
                    <Text color="white" fontSize="$4" fontWeight="600">
                      Anuncios
                    </Text>
                  </XStack>
                </Button>
              </XStack>
            </YStack>
          </Card>

          {/* Estadísticas Rápidas */}
          <Card
            bg="white"
            p="$4"
            borderRadius="$4"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={3}
          >
            <H4 mb="$4" color="$textPrimary" fontWeight="bold">
              Resumen
            </H4>

            {estadisticasError && (
              <XStack ai="center" gap="$2" mb="$2">
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text fontSize="$3" color="$red10" flexShrink={1}>
                  No se pudieron cargar las estadísticas. {estadisticasError}
                </Text>
                <Button
                  size="$2"
                  variant="outlined"
                  onPress={refreshEstadisticas}
                  disabled={estadisticasLoading}
                >
                  <Text fontSize="$2" color="$primary">
                    Reintentar
                  </Text>
                </Button>
              </XStack>
            )}

            <XStack gap="$3">
              {[
                {
                  label: 'Denuncias Activas',
                  value: statsActivas,
                  color: '$primary',
                  bg: '$statusReceived'
                },
                {
                  label: 'Resueltas',
                  value: statsResueltas,
                  color: '$success',
                  bg: '$statusResolved'
                },
                {
                  label: 'En Proceso',
                  value: statsEnProceso,
                  color: '$info',
                  bg: '$statusInProgress'
                }
              ].map((item) => (
                <YStack
                  key={item.label}
                  flex={1}
                  alignItems="center"
                  gap="$2"
                  p="$3"
                  backgroundColor={item.bg}
                  borderRadius="$3"
                >
                  {estadisticasLoading ? (
                    <Spinner size="small" color={item.color} />
                  ) : (
                    <Text fontSize="$6" fontWeight="bold" color={item.color}>
                      {item.value ?? 0}
                    </Text>
                  )}
                  <Text fontSize="$3" color="$textSecondary" textAlign="center">
                    {item.label}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </Card>
          {/* Sección de Últimos Anuncios */}
          <Card
            bg="white"
            p="$4"
            borderRadius="$4"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={3}
          >
            <XStack ai="center" jc="space-between" mb="$4">
              <YStack>
                <H4 color="$textPrimary" fontWeight="bold">
                  Últimos Anuncios
                </H4>
                <Text fontSize="$3" color="$textSecondary">
                  Información municipal reciente
                </Text>
              </YStack>

              <Button
                size="$3"
                variant="outlined"
                bg="transparent"
                borderColor="$primary"
                color="$primary"
                onPress={() => router.push('/anuncios')}
                pressStyle={{
                  bg: "$primary",
                  borderColor: "$primary",
                  scale: 0.95
                }}
              >
                <XStack ai="center" gap="$1">
                  <Text fontSize="$3" fontWeight="600" color="$primary">
                    Ver todos
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#E67E22" />
                </XStack>
              </Button>
            </XStack>

            {/* Estados de los anuncios */}
            {anunciosLoading ? (
              // Estado de carga
              <YStack ai="center" jc="center" py="$6" gap="$3">
                <YStack
                  w={40}
                  h={40}
                  br={20}
                  bg="$primary"
                  ai="center"
                  jc="center"
                  animation="quick"
                  style={{
                    transform: [{ rotate: '360deg' }]
                  }}
                >
                  <Ionicons name="megaphone" size={20} color="white" />
                </YStack>
                <Text fontSize="$4" color="$textSecondary" fontWeight="500">
                  Cargando anuncios...
                </Text>
              </YStack>
            ) : anunciosRecientes.length > 0 ? (
              // Mostrar anuncios recientes
              <YStack gap="$3">
                {anunciosRecientes.map((anuncio) => (
                  <AnuncioCard 
                    key={anuncio.id} 
                    anuncio={anuncio}
                    isOffline={!isConnected}
                  />
                ))}

                {anuncios.length > 2 && (
                  <Card 
                    bg="$gray2" 
                    p="$3" 
                    br="$3" 
                    borderWidth={1} 
                    borderColor="$borderColor"
                  >
                    <XStack ai="center" jc="center" gap="$2">
                      <Ionicons name="information-circle-outline" size={18} color="#666" />
                      <Text fontSize="$3" color="$textSecondary">
                        {anuncios.length - 2} anuncio{anuncios.length - 2 !== 1 ? 's' : ''} más disponible{anuncios.length - 2 !== 1 ? 's' : ''}
                      </Text>
                    </XStack>
                  </Card>
                )}
              </YStack>
            ) : (
              // Estado vacío
              <YStack ai="center" jc="center" py="$6" gap="$3">
                <YStack
                  w={50}
                  h={50}
                  br={25}
                  bg="$gray5"
                  ai="center"
                  jc="center"
                >
                  <Ionicons name="megaphone-outline" size={24} color="#999" />
                </YStack>
                <Text fontSize="$4" color="$textSecondary" fontWeight="500" ta="center">
                  No hay anuncios disponibles
                </Text>
                <Text fontSize="$3" color="$textSecondary" ta="center" maxWidth={280}>
                  {isConnected 
                    ? 'No hay anuncios municipales publicados en este momento'
                    : 'Verifica tu conexión para ver los anuncios más recientes'
                  }
                </Text>
              </YStack>
            )}
            </Card>
          {/* Información del usuario (solo para admin) */}
          {user?.es_administrador && (
            <Card
              bg="$success"
              p="$4"
              borderRadius="$4"
              shadowColor="$success"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.3}
              shadowRadius={4}
              elevation={4}
            >
              <XStack alignItems="center" gap="$3">
                <Ionicons name="shield-checkmark" size={24} color="white" />
                <YStack flex={1}>
                  <Text color="white" fontSize="$4" fontWeight="bold">
                    Panel de Administrador
                  </Text>
                  <Text color="rgba(255,255,255,0.8)" fontSize="$3">
                    Tienes acceso a funciones administrativas
                  </Text>
                </YStack>
              </XStack>
            </Card>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}




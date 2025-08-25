// app/(tabs)/index.tsx - PANTALLA PRINCIPAL CON AUTENTICACIÓN
import React from 'react';
import { Text, YStack, XStack, Button, Card, H4, H5 } from 'tamagui';
import { SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import { WelcomeSection } from '../../src/components/ui/WelcomeSection';
import { useAuth } from '../../src/hooks/useAuth';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

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
        notificationCount={0} // Aquí puedes conectar notificaciones reales
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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

            <XStack gap="$3">
              <YStack 
                flex={1} 
                alignItems="center" 
                gap="$2"
                p="$3"
                backgroundColor="$statusReceived"
                borderRadius="$3"
              >
                <Text fontSize="$6" fontWeight="bold" color="$primary">
                  0
                </Text>
                <Text fontSize="$3" color="$textSecondary" textAlign="center">
                  Denuncias Activas
                </Text>
              </YStack>

              <YStack 
                flex={1} 
                alignItems="center" 
                gap="$2"
                p="$3"
                backgroundColor="$statusResolved"
                borderRadius="$3"
              >
                <Text fontSize="$6" fontWeight="bold" color="$success">
                  0
                </Text>
                <Text fontSize="$3" color="$textSecondary" textAlign="center">
                  Resueltas
                </Text>
              </YStack>

              <YStack 
                flex={1} 
                alignItems="center" 
                gap="$2"
                p="$3"
                backgroundColor="$statusInProgress"
                borderRadius="$3"
              >
                <Text fontSize="$6" fontWeight="bold" color="$info">
                  0
                </Text>
                <Text fontSize="$3" color="$textSecondary" textAlign="center">
                  En Proceso
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Último Anuncio Municipal */}
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
            <XStack justifyContent="space-between" alignItems="center" mb="$3">
              <H5 color="$textPrimary" fontWeight="bold">
                Último Anuncio
              </H5>
              <Button 
                size="$2" 
                variant="outlined" 
                borderColor="$primary"
                onPress={() => router.push('/anuncios')}
              >
                <Text color="$primary" fontSize="$3">Ver todos</Text>
              </Button>
            </XStack>

            <XStack alignItems="center" gap="$3">
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="$secondary"
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="megaphone" size={20} color="white" />
              </YStack>

              <YStack flex={1} gap="$1">
                <Text fontWeight="600" color="$textPrimary">
                  Información importante
                </Text>
                <Text fontSize="$3" color="$textSecondary">
                  No hay anuncios recientes disponibles
                </Text>
              </YStack>

              <YStack
                backgroundColor="$info"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$2"
              >
                <Text color="white" fontSize="$2" fontWeight="600">
                  Nuevo
                </Text>
              </YStack>
            </XStack>
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
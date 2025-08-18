import React from 'react';
import { Text, YStack, XStack, Button, Card, H4 } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import AppHeader from '../../src/components/layout/AppHeader';

export default function HomeScreen() {
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        {/* Header unificado - Solo en pantalla principal muestra logo y nombre */}
        <AppHeader
          screenTitle="Inicio"
          screenSubtitle="Panel principal"
          screenIcon="home"
          showAppInfo={true}
        />

        <ScrollView style={{ flex: 1 }}>
          <YStack p="$4" gap="$5">

            {/* Componente de prueba de API - TEMPORAL <ApiTest /> */}


            {/* Acciones Rápidas */}
            <Card
              bg="white"
              p="$4"
              br="$4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <H4 mb="$4" color="$textPrimary">Acciones Rápidas</H4>

              <XStack gap="$3">
                {/* Botón Nueva Denuncia - Principal con relieve */}
                <Button
                  f={1}
                  size="$5"
                  bg="$primary"
                  color="white"
                  fontWeight="bold"
                  br="$3"
                  h={80}
                  onPress={() => console.log('Nueva denuncia')}
                  style={{
                    shadowColor: '#E67E22',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 8,
                  }}
                  pressStyle={{
                    scale: 0.98,
                    shadowOpacity: 0.2,
                    elevation: 4,
                  }}
                >
                  <YStack ai="center" gap="$2">
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text color="white" fontWeight="bold">Nueva Denuncia</Text>
                  </YStack>
                </Button>

                {/* Botón Mi Historial - Secundario con relieve */}
                <Button
                  f={1}
                  size="$5"
                  bg="white"
                  borderColor="$secondary"
                  borderWidth={2}
                  br="$3"
                  h={80}
                  onPress={() => console.log('Mi historial')}
                  style={{
                    shadowColor: '#009688',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  pressStyle={{
                    scale: 0.98,
                    backgroundColor: '#F0F9FF',
                    shadowOpacity: 0.1,
                    elevation: 2,
                  }}
                >
                  <YStack ai="center" gap="$2">
                    <Ionicons name="time-outline" size={24} color="#009688" />
                    <Text color="$secondary" fontWeight="bold">Mi Historial</Text>
                  </YStack>
                </Button>
              </XStack>
            </Card>

            {/* Actividad Reciente */}
            <Card
              bg="white"
              p="$4"
              br="$4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <H4 mb="$4" color="$textPrimary">Actividad Reciente</H4>

              <YStack gap="$3">
                <Card
                  bg="$statusInProgress"
                  p="$3"
                  br="$3"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <XStack jc="space-between" ai="center">
                    <YStack f={1}>
                      <Text fontWeight="600" color="$textPrimary">
                        Bache en la vía
                      </Text>
                      <Text fontSize="$3" color="$textSecondary">
                        Calle 18 de Sep, 16
                      </Text>
                    </YStack>
                    <Card
                      bg="#2196F3"
                      px="$3"
                      py="$1"
                      br="$6"
                      style={{
                        shadowColor: '#2196F3',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Text color="white" fontSize="$2" fontWeight="bold">
                        En proceso
                      </Text>
                    </Card>
                  </XStack>
                </Card>

                <Card
                  bg="$statusResolved"
                  p="$3"
                  br="$3"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <XStack jc="space-between" ai="center">
                    <YStack f={1}>
                      <Text fontWeight="600" color="$textPrimary">
                        Luminaria dañada
                      </Text>
                      <Text fontSize="$3" color="$textSecondary">
                        Av. Argentina, 245
                      </Text>
                    </YStack>
                    <Card
                      bg="#4CAF50"
                      px="$3"
                      py="$1"
                      br="$6"
                      style={{
                        shadowColor: '#4CAF50',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Text color="white" fontSize="$2" fontWeight="bold">
                        Resuelto
                      </Text>
                    </Card>
                  </XStack>
                </Card>
              </YStack>
            </Card>

            {/* Últimos Anuncios */}
            <Card
              bg="white"
              p="$4"
              br="$4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <H4 mb="$4" color="$textPrimary">Últimos Anuncios</H4>

              <YStack gap="$3">
                <Card
                  bg="$background"
                  p="$3"
                  br="$3"
                  borderLeftColor="$error"
                  borderLeftWidth={4}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <XStack jc="space-between" ai="flex-start">
                    <YStack f={1} gap="$1">
                      <Text fontWeight="600" color="$textPrimary">
                        Jornada de vacunación gratuita
                      </Text>
                      <Text fontSize="$3" color="$textSecondary">
                        Este sábado 20 de enero en el parque principal
                      </Text>
                    </YStack>
                    <Card
                      bg="$error"
                      px="$2"
                      py="$1"
                      br="$3"
                      style={{
                        shadowColor: '$error',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Text color="white" fontSize="$1" fontWeight="bold">
                        Salud
                      </Text>
                    </Card>
                  </XStack>
                </Card>

                <Card
                  bg="$background"
                  p="$3"
                  br="$3"
                  borderLeftColor="$secondary"
                  borderLeftWidth={4}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <XStack jc="space-between" ai="flex-start">
                    <YStack f={1} gap="$1">
                      <Text fontWeight="600" color="$textPrimary">
                        Corte de agua programado
                      </Text>
                      <Text fontSize="$3" color="$textSecondary">
                        Mantenimiento en sector norte el domingo 21 de enero
                      </Text>
                    </YStack>
                    <Card
                      bg="$secondary"
                      px="$2"
                      py="$1"
                      br="$3"
                      style={{
                        shadowColor: '$secondary',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <Text color="white" fontSize="$1" fontWeight="bold">
                        Servicios
                      </Text>
                    </Card>
                  </XStack>
                </Card>
              </YStack>
            </Card>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// app/test-api.tsx - PANTALLA TEMPORAL PARA PROBAR LA API
{/*import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import ApiTestComponent from '../../src/components/debug/ApiTestComponent';

export default function TestApiScreen() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <ApiTestComponent />
      </SafeAreaView>
    </>
  );
}*/}

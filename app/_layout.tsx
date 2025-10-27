// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack, SplashScreen, router } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import { Text, YStack, Spinner } from 'tamagui';
import { SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../src/tamagui.config';
import { NotificationsProvider } from '../src/providers/NotificationsProvider';

// Evitar que la splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Verificando estado de autenticación...');
      
      // Pequeño delay para asegurar que el layout está listo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const token = await AsyncStorage.getItem('authToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (token && userInfo) {
        console.log('✅ Usuario autenticado encontrado');
        setInitialRoute('/(tabs)');
      } else {
        console.log('❌ No hay sesión activa');
        setInitialRoute('/auth/login');
      }
      
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      setInitialRoute('/auth/login');
    } finally {
      setIsLoading(false);
      // Ocultar splash screen
      SplashScreen.hideAsync();
    }
  };

  // Redirigir después de determinar el estado de auth
  useEffect(() => {
    if (!isLoading && initialRoute) {
      // Usar setTimeout para asegurar que el layout está montado
      const timer = setTimeout(() => {
        router.replace(initialRoute as any);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, initialRoute]);

  // Mostrar spinner mientras se verifica auth
  if (isLoading) {
    return (
      <TamaguiProvider config={config} defaultTheme="calama">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            gap="$4"
          >
            <Spinner size="large" color="#E67E22" />
            <Text fontSize="$4" color="#757575" fontFamily="System">
              Cargando OneCañama...
            </Text>
          </YStack>
        </SafeAreaView>
      </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider config={config} defaultTheme="calama">
      <NotificationsProvider autoRegister={initialRoute === '/(tabs)'}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAFAFA' },
        }}
      >
        {/* Pantallas de autenticación - rutas individuales */}
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
        
        <Stack.Screen 
          name="auth/register" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        
        {/* Grupo de tabs principales */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
        
        {/* Pantalla de detalle de denuncia */}
        <Stack.Screen 
          name="denuncia/[id]" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        
        {/* Pantalla 404 */}
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            title: 'Página no encontrada',
            presentation: 'modal',
          }} 
        />
      </Stack>
      </NotificationsProvider>
    </TamaguiProvider>
  );
}

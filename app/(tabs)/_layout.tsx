// app/(tabs)/_layout.tsx
import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { usePushNotifications } from '../../src/hooks/usePushNotifications';

export default function TabLayout() {
  const { user, isAuthenticated } = useAuth();
  const { ensureRegistered } = usePushNotifications();

  useEffect(() => {
    // Asegurar registro de notificaciones cuando entra a las pestañas
    ensureRegistered().catch(() => {});
  }, []);

  // Si no está autenticado, no mostrar nada (el root layout debería redirigir)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E67E22',
        tabBarInactiveTintColor: '#757575',
        headerShown: false, // Mantenemos oculto porque usas AppHeader
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E0E0E0',
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: -3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="denuncias"
        options={{
          title: 'Denunciar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="anuncios"
        options={{
          title: 'Anuncios',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'megaphone' : 'megaphone-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

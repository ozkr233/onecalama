// src/components/ui/WelcomeSection.tsx
import React from 'react';
import { Text, YStack, XStack, Card, H4 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

export function WelcomeSection() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Buenos días';
    if (hour < 18) return '☀️ Buenas tardes';
    return '🌙 Buenas noches';
  };

  const getMotivationalMessage = () => {
    const messages = [
      '¿Qué problema quieres reportar hoy?',
      'Ayudemos a mejorar nuestra comuna',
      'Tu reporte hace la diferencia',
      'Juntos construimos una mejor ciudad',
      'Cada denuncia cuenta para el progreso'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Card
      p="$4"
      backgroundColor="white"
      borderRadius="$4"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
      marginBottom="$4"
    >
      <XStack alignItems="center" gap="$3">
        {/* Avatar del usuario */}
        <YStack
          width={56}
          height={56}
          borderRadius={28}
          backgroundColor="$primary"
          justifyContent="center"
          alignItems="center"
          shadowColor="$primary"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.3}
          shadowRadius={4}
          elevation={4}
        >
          <Text color="white" fontSize="$6" fontWeight="bold">
            {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </YStack>
        
        <YStack flex={1} gap="$1">
          <Text fontSize="$3" color="$textSecondary" fontWeight="500">
            {getGreeting()}
          </Text>
          <H4 color="$textPrimary" fontWeight="bold" marginBottom="$1">
            {user.nombre?.split(' ')[0] || 'Usuario'}
          </H4>
          <Text fontSize="$3" color="$textSecondary" lineHeight="$4">
            {getMotivationalMessage()}
          </Text>
        </YStack>

        {/* Indicadores de estado */}
        <YStack alignItems="center" gap="$2">
          {user.es_administrador && (
            <XStack alignItems="center" gap="$1" 
              backgroundColor="$success" 
              paddingHorizontal="$2" 
              paddingVertical="$1" 
              borderRadius="$2"
            >
              <Ionicons name="shield-checkmark" size={12} color="white" />
              <Text fontSize="$1" color="white" fontWeight="600">
                Admin
              </Text>
            </XStack>
          )}
          
          <XStack alignItems="center" gap="$1">
            <YStack 
              width={8} 
              height={8} 
              borderRadius={4} 
              backgroundColor="$success" 
            />
            <Text fontSize="$2" color="$success" fontWeight="500">
              Conectado
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </Card>
  );
}
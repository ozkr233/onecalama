// src/components/ui/UserDisplay.tsx - Componentes para mostrar información del usuario
import React from 'react';
import { Text, YStack, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

interface UserDisplayProps {
  variant?: 'full' | 'first-name' | 'initials';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showAdmin?: boolean;
  fallback?: string;
}

export function UserDisplay({ 
  variant = 'first-name',
  size = 'medium',
  color,
  showAdmin = true,
  fallback = 'Usuario'
}: UserDisplayProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostrar loading
  if (isLoading) {
    return (
      <Text 
        fontSize={size === 'small' ? '$3' : size === 'large' ? '$5' : '$4'} 
        color={color || "$textSecondary"}
      >
        Cargando...
      </Text>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated || !user) {
    return (
      <Text 
        fontSize={size === 'small' ? '$3' : size === 'large' ? '$5' : '$4'} 
        color={color || "$textSecondary"}
      >
        {fallback}
      </Text>
    );
  }

  // Función para obtener el texto según la variante
  const getUserText = (): string => {
    switch (variant) {
      case 'full':
        return user.nombre || fallback;
      
      case 'first-name':
        if (!user.nombre) return fallback;
        return user.nombre.split(' ')[0];
      
      case 'initials':
        if (!user.nombre) return fallback.charAt(0);
        const names = user.nombre.split(' ');
        if (names.length >= 2) {
          return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
        }
        return names[0].charAt(0).toUpperCase();
      
      default:
        return user.nombre?.split(' ')[0] || fallback;
    }
  };

  const fontSize = size === 'small' ? '$3' : size === 'large' ? '$5' : '$4';

  return (
    <XStack alignItems="center" gap="$1">
      <Text 
        fontSize={fontSize}
        color={color || "$textPrimary"}
        fontWeight={size === 'large' ? 'bold' : '500'}
      >
        {getUserText()}
      </Text>
      
      {showAdmin && user.es_administrador && (
        <Ionicons 
          name="shield-checkmark" 
          size={size === 'small' ? 12 : size === 'large' ? 18 : 14} 
          color="#10b981" 
        />
      )}
    </XStack>
  );
}

// Componente Avatar del usuario
export function UserAvatar({ size = 32 }: { size?: number }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <YStack
        width={size}
        height={size}
        borderRadius={size / 2}
        backgroundColor="$gray8"
        justifyContent="center"
        alignItems="center"
      >
        <Text color="white" fontSize={size > 40 ? '$4' : '$3'} fontWeight="bold">
          ?
        </Text>
      </YStack>
    );
  }

  const initials = user.nombre 
    ? user.nombre.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor="$primary"
      justifyContent="center"
      alignItems="center"
      shadowColor="$primary"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.3}
      shadowRadius={4}
      elevation={4}
    >
      <Text 
        color="white" 
        fontSize={size > 40 ? '$4' : '$3'} 
        fontWeight="bold"
      >
        {initials}
      </Text>
    </YStack>
  );
}

// Componente de información completa del usuario
export function UserInfo({ showEmail = false, showRut = false, showPhone = false }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <YStack gap="$1">
        <Text fontSize="$4" color="$textSecondary">Usuario no identificado</Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$1">
      <UserDisplay variant="full" size="medium" />
      {showEmail && user.email && (
        <Text fontSize="$3" color="$textSecondary">{user.email}</Text>
      )}
      {showRut && user.rut && (
        <Text fontSize="$3" color="$textSecondary">RUT: {user.rut}</Text>
      )}
      {showPhone && user.numero_telefonico_movil && (
        <Text fontSize="$3" color="$textSecondary">Tel: {user.numero_telefonico_movil}</Text>
      )}
    </YStack>
  );
}

// Componente de saludo personalizado
export function UserGreeting() {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <YStack gap="$1">
      <Text fontSize="$3" color="rgba(255,255,255,0.8)">
        {getGreeting()}
      </Text>
      <Text fontSize="$4" color="white" fontWeight="600">
        <UserDisplay variant="first-name" color="white" />
      </Text>
    </YStack>
  );
}
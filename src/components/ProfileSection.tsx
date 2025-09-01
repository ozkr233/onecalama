// src/components/ProfileSection.tsx - Componente de perfil para mostrar en alguna pantalla
import React from 'react';
import { Alert } from 'react-native';
import { Text, YStack, XStack, Button, Card, H4 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export function ProfileSection() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <Card
      elevate
      p="$4"
      m="$4"
      backgroundColor="white"
      borderRadius="$4"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
    >
      {/* Header con avatar y info básica */}
      <XStack alignItems="center" gap="$4" marginBottom="$4">
        <YStack
          width={60}
          height={60}
          borderRadius={30}
          backgroundColor="$primary"
          justifyContent="center"
          alignItems="center"
        >
          <Text color="white" fontSize="$6" fontWeight="bold">
            {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </YStack>
        
        <YStack flex={1} gap="$1">
          <H4 color="$textPrimary" fontWeight="bold">
            {user.nombre}
          </H4>
          <Text fontSize="$3" color="$textSecondary">
            {user.email}
          </Text>
          {user.es_administrador && (
            <XStack alignItems="center" gap="$2">
              <Card
                backgroundColor="$success"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$2"
              >
                <Text color="white" fontSize="$2" fontWeight="600">
                  Administrador
                </Text>
              </Card>
            </XStack>
          )}
        </YStack>
      </XStack>

      {/* Detalles del usuario */}
      <YStack gap="$3" marginBottom="$4">
        <XStack alignItems="center" gap="$3">
          <Ionicons name="card-outline" size={16} color="#6b7280" />
          <Text fontSize="$3" color="$textSecondary" minWidth={60}>
            RUT:
          </Text>
          <Text fontSize="$3" color="$textPrimary" flex={1}>
            {user.rut || 'No disponible'}
          </Text>
        </XStack>
        
        <XStack alignItems="center" gap="$3">
          <Ionicons name="mail-outline" size={16} color="#6b7280" />
          <Text fontSize="$3" color="$textSecondary" minWidth={60}>
            Email:
          </Text>
          <Text fontSize="$3" color="$textPrimary" flex={1} numberOfLines={1}>
            {user.email}
          </Text>
        </XStack>
      </YStack>

      {/* Botón de logout */}
      <Button
        size="$4"
        backgroundColor="$red2"
        borderColor="$red6"
        borderWidth={1}
        onPress={handleLogout}
        pressStyle={{ 
          backgroundColor: "$red3", 
          scale: 0.98 
        }}
      >
        <XStack alignItems="center" gap="$2">
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text color="$red10" fontSize="$4" fontWeight="600">
            Cerrar Sesión
          </Text>
        </XStack>
      </Button>
    </Card>
  );
}
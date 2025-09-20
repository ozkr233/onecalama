// src/components/ui/Loading.tsx - COMPONENTE DE CARGA
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { YStack, Text, XStack } from 'tamagui';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export default function LoadingSpinner({
  size = 'large',
  color = '#3B82F6',
  text,
  overlay = false
}: LoadingSpinnerProps) {
  const content = (
    <YStack alignItems="center" justifyContent="center" space="$3">
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text fontSize="$3" color="$gray10" textAlign="center">
          {text}
        </Text>
      )}
    </YStack>
  );

  if (overlay) {
    return (
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0,0,0,0.5)"
        justifyContent="center"
        alignItems="center"
        zIndex={1000}
      >
        <YStack
          backgroundColor="white"
          padding="$6"
          borderRadius="$4"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={8}
        >
          {content}
        </YStack>
      </YStack>
    );
  }

  return content;
}

// Componente para botones con estado de carga
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: 'small' | 'large';
}

export function LoadingButton({
  loading,
  children,
  loadingText = 'Cargando...',
  size = 'small'
}: LoadingButtonProps) {
  if (loading) {
    return (
      <XStack alignItems="center" justifyContent="center" space="$2">
        <ActivityIndicator size={size} color="white" />
        <Text color="white">{loadingText}</Text>
      </XStack>
    );
  }

  return <>{children}</>;
}

// Componente para estados de carga en listas
export function ListLoadingState() {
  return (
    <YStack padding="$6" alignItems="center" space="$3">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text fontSize="$3" color="$gray10">
        Cargando datos...
      </Text>
    </YStack>
  );
}

// Componente para refresh de listas
export function RefreshLoadingState() {
  return (
    <YStack padding="$4" alignItems="center">
      <ActivityIndicator size="small" color="#3B82F6" />
    </YStack>
  );
}
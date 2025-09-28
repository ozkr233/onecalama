// src/components/forms/LoginButton.tsx
import React from 'react';
import { Button, XStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { LoadingButton } from '../ui/Loading';

interface LoginButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: '$4' | '$5' | '$6';
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function LoginButton({
  onPress,
  loading = false,
  disabled = false,
  size = '$5',
  fullWidth = true,
  variant = 'primary'
}: LoginButtonProps) {
  
  // Configuración de estilos por variante
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '$gray8',
          color: 'white',
          pressStyle: { backgroundColor: '$gray9', scale: 0.98 },
          shadowColor: '$gray8'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: '$primary',
          borderWidth: 2,
          color: '$primary',
          pressStyle: { backgroundColor: '$primary2', scale: 0.98 },
          shadowColor: 'transparent'
        };
      default: // primary
        return {
          backgroundColor: '$primary',
          color: 'white',
          pressStyle: { backgroundColor: '$primaryDark', scale: 0.98 },
          shadowColor: '$primary'
        };
    }
  };

  const buttonStyles = getButtonStyles();
  const isDisabled = loading || disabled;

  return (
    <Button
      size={size}
      width={fullWidth ? '100%' : undefined}
      onPress={onPress}
      disabled={isDisabled}
      opacity={isDisabled ? 0.6 : 1}
      fontWeight="bold"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.3}
      shadowRadius={8}
      elevation={8}
      marginTop="$2"
      {...buttonStyles}
    >
      <LoadingButton
        loading={loading}
        loadingText="Iniciando sesión..."
        size="$4"
      >
        <XStack alignItems="center" gap="$2">
          <Ionicons 
            name="log-in" 
            size={size === '$4' ? 18 : size === '$5' ? 20 : 22} 
            color={variant === 'outline' ? '#009688' : 'white'} 
          />
          <Text 
            color={variant === 'outline' ? '$primary' : 'white'} 
            fontWeight="bold"
            fontSize={size === '$4' ? '$3' : size === '$5' ? '$4' : '$5'}
          >
            Iniciar Sesión
          </Text>
        </XStack>
      </LoadingButton>
    </Button>
  );
}

// Variantes específicas para casos comunes
export function PrimaryLoginButton(props: Omit<LoginButtonProps, 'variant'>) {
  return <LoginButton {...props} variant="primary" />;
}

export function SecondaryLoginButton(props: Omit<LoginButtonProps, 'variant'>) {
  return <LoginButton {...props} variant="secondary" />;
}

export function OutlineLoginButton(props: Omit<LoginButtonProps, 'variant'>) {
  return <LoginButton {...props} variant="outline" />;
}
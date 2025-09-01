// src/components/forms/RegisterButton.tsx
import React from 'react';
import { Alert } from 'react-native';
import { Text, XStack, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface RegisterButtonProps {
  isValid: boolean;
  loading: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const RegisterButton: React.FC<RegisterButtonProps> = ({ 
  isValid, 
  loading, 
  onPress, 
  disabled = false 
}) => {
  const handlePress = () => {
    if (!isValid && !loading) {
      Alert.alert(
        '⚠️ Formulario incompleto',
        'Por favor completa todos los campos correctamente antes de continuar.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    if (isValid && !loading) {
      Alert.alert(
        '🌟 Confirmar registro',
        '¿Estás seguro de que deseas crear tu cuenta? Verifica que todos los datos sean correctos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Crear cuenta', style: 'default', onPress }
        ]
      );
    }
  };

  const getButtonState = () => {
    if (loading) {
      return {
        bg: '#009688',
        icon: 'refresh' as keyof typeof Ionicons.glyphMap,
        text: 'Creando cuenta...',
        color: 'white'
      };
    }

    if (isValid) {
      return {
        bg: '#009688',
        icon: 'person-add' as keyof typeof Ionicons.glyphMap,
        text: 'Crear Cuenta',
        color: 'white'
      };
    }

    return {
      bg: '#9ca3af',
      icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      text: 'Completa los campos',
      color: 'white'
    };
  };

  const buttonState = getButtonState();
  const isDisabled = disabled || loading;

  return (
    <Button
      size="$5"
      bg={buttonState.bg}
      color={buttonState.color}
      fontWeight="bold"
      onPress={handlePress}
      disabled={isDisabled}
      opacity={isDisabled ? 0.7 : 1}
      pressStyle={{ scale: 0.98 }}
      style={{
        shadowColor: isValid ? '#009688' : '#999',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <XStack alignItems="center" gap="$2">
        {loading ? (
          <Ionicons name="refresh" size={20} color="white" />
        ) : (
          <Ionicons name={buttonState.icon} size={20} color="white" />
        )}
        <Text color="white" fontWeight="bold" fontSize="$5">
          {buttonState.text}
        </Text>
      </XStack>
    </Button>
  );
};

export default RegisterButton;
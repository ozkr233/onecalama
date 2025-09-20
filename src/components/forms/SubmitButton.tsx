// src/components/forms/SubmitButton.tsx
import React from 'react';
import { Alert } from 'react-native';
import { Text, YStack, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface SubmitButtonProps {
  isValid: boolean;
  loading: boolean;
  onSubmit: () => void;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isValid,
  loading,
  onSubmit,
  disabled = false
}) => {
  // Manejar click del botón
  const handlePress = () => {
    if (!isValid) {
      Alert.alert(
        '⚠️ Formulario incompleto',
        'Por favor completa todos los campos obligatorios antes de enviar tu denuncia.',
        [
          {
            text: 'Entendido',
            style: 'default'
          }
        ]
      );
      return;
    }

    // Confirmación antes de enviar
    Alert.alert(
      '📤 Confirmar envío',
      '¿Estás seguro de que deseas enviar esta denuncia? Una vez enviada, recibirás un código de seguimiento.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Enviar denuncia',
          style: 'default',
          onPress: onSubmit
        }
      ]
    );
  };

  // Determinar el estado visual del botón
  const getButtonState = () => {
    if (loading) {
      return {
        bg: '$primary',
        icon: 'refresh',
        text: 'Enviando...',
        color: 'white'
      };
    }

    if (isValid) {
      return {
        bg: '$primary',
        icon: 'paper-plane',
        text: 'Enviar Denuncia',
        color: 'white'
      };
    }

    return {
      bg: '$gray8',
      icon: 'alert-circle',
      text: 'Completa el formulario',
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
        shadowColor: isValid ? '#E67E22' : '#999',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {loading ? (
        <>
          <Ionicons name="refresh" size={20} color="white" />
          <Text color="white" ml="$2" fontWeight="bold" fontSize="$5">
            {buttonState.text}
          </Text>
        </>
      ) : (
        <>
          <Ionicons name={buttonState.icon as any} size={20} color="white" />
          <Text color="white" fontWeight="bold" ml="$2" fontSize="$5">
            {buttonState.text}
          </Text>
        </>
      )}
    </Button>
  );
};

export default SubmitButton;
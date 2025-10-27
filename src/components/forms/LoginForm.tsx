// src/components/forms/LoginForm.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Text, YStack, XStack, Button, Input, Card, Spinner } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePushNotifications } from '../../hooks/usePushNotifications';


interface LoginFormProps {
  onSuccess?: () => void;
}

interface FormErrors {
  rut?: string;
  password?: string;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  
  const { login, isLoading } = useAuth();
  const { ensureRegistered } = usePushNotifications();

  // Formatear RUT mientras se escribe
  const formatRUT = (text: string) => {
    // Remover caracteres no válidos
    const cleaned = text.replace(/[^0-9kK]/g, '');
    
    // Agregar guión antes del último dígito
    if (cleaned.length > 1) {
      const rutNumber = cleaned.slice(0, -1);
      const dv = cleaned.slice(-1);
      return `${rutNumber}-${dv}`;
    }
    return cleaned;
  };

  const handleRutChange = (text: string) => {
    const formatted = formatRUT(text);
    setRut(formatted);
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors.rut) {
      setErrors(prev => ({ ...prev, rut: undefined }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar RUT
    if (!rut.trim()) {
      newErrors.rut = 'El RUT es obligatorio';
    } else {
      const rutRegex = /^[0-9]+-[0-9kK]$/;
      if (!rutRegex.test(rut)) {
        newErrors.rut = 'RUT inválido (formato: 12345678-9)';
      }
    }

    // Validar contraseña
    if (!password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 3) {
      newErrors.password = 'La contraseña es muy corta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar inicio de sesión
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔐 Intentando login con RUT:', rut);
      
      const result = await login(rut.trim(), password);

      if (result.success) {
        console.log('✅ Login exitoso');
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert('Error', result.error || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('❌ Error inesperado en login:', error);
      Alert.alert('Error', 'Error inesperado al iniciar sesión');
    }
  };

  const goToRegister = () => {
    router.push('/auth/register');
  };

  // Verificar si el formulario es válido para habilitar el botón
  const isFormValid = rut.trim() && password.trim() && Object.keys(errors).length === 0;

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
    >
      <YStack gap="$4">
        {/* Campo RUT */}
        <YStack gap="$2">
          <XStack alignItems="center" gap="$2">
            <Text fontSize="$4" fontWeight="600" color="$textPrimary">
              RUT
            </Text>
            <Text fontSize="$3" color="$red10">*</Text>
          </XStack>
          <Input
            placeholder="12345678-9"
            value={rut}
            onChangeText={handleRutChange}
            autoCapitalize="none"
            backgroundColor={errors.rut ? "$red2" : "$gray2"}
            borderColor={errors.rut ? "$red6" : "$gray6"}
            focusStyle={{ borderColor: errors.rut ? '$red6' : '$primary' }}
            size="$4"
            maxLength={12}
          />
          {errors.rut && (
            <XStack alignItems="center" gap="$1">
              <Ionicons name="alert-circle" size={14} color="#dc2626" />
              <Text fontSize="$3" color="$red10">
                {errors.rut}
              </Text>
            </XStack>
          )}
        </YStack>

        {/* Campo Contraseña */}
        <YStack gap="$2">
          <XStack alignItems="center" gap="$2">
            <Text fontSize="$4" fontWeight="600" color="$textPrimary">
              Contraseña
            </Text>
            <Text fontSize="$3" color="$red10">*</Text>
          </XStack>
          <Input
            placeholder="Tu contraseña"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoComplete="password"
            backgroundColor={errors.password ? "$red2" : "$gray2"}
            borderColor={errors.password ? "$red6" : "$gray6"}
            focusStyle={{ borderColor: errors.password ? '$red6' : '$primary' }}
            size="$4"
          />
          {errors.password && (
            <XStack alignItems="center" gap="$1">
              <Ionicons name="alert-circle" size={14} color="#dc2626" />
              <Text fontSize="$3" color="$red10">
                {errors.password}
              </Text>
            </XStack>
          )}
        </YStack>

        {/* Botón de Login con Loading integrado */}
        <Button
          size="$5"
          backgroundColor="$primary"
          color="white"
          fontWeight="bold"
          onPress={handleLogin}
          disabled={isLoading || !isFormValid}
          pressStyle={{ backgroundColor: "$primaryDark", scale: 0.98 }}
          shadowColor="$primary"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={8}
          marginTop="$2"
          opacity={isLoading || !isFormValid ? 0.6 : 1}
        >
          {isLoading ? (
            <XStack alignItems="center" gap="$2">
              <Spinner size="small" color="white" />
              <Text color="white" fontWeight="bold">Iniciando sesión...</Text>
            </XStack>
          ) : (
            <XStack alignItems="center" gap="$2">
              <Ionicons name="log-in" size={20} color="white" />
              <Text color="white" fontWeight="bold">Iniciar Sesión</Text>
            </XStack>
          )}
        </Button>

        {/* Link a registro */}
        <YStack alignItems="center" marginTop="$2">
          <Text fontSize="$3" color="$textSecondary">
            ¿No tienes cuenta?{' '}
            <Text
              color="$primary"
              fontWeight="600"
              pressStyle={{ opacity: 0.7 }}
              onPress={goToRegister}
            >
              Regístrate aquí
            </Text>
          </Text>
        </YStack>
      </YStack>
    </Card>
  );
}

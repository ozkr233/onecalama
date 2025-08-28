// app/auth/login.tsx
import React, { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, Alert } from 'react-native';
import { Text, YStack, Button, Input, H2, Card ,Image} from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import icon from '../../assets/images/icon.png';

export default function LoginScreen() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

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
  };

  const handleLogin = async () => {
    if (!rut.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar formato básico de RUT
    const rutRegex = /^[0-9]+-[0-9kK]$/;
    if (!rutRegex.test(rut)) {
      Alert.alert('Error', 'Por favor ingresa un RUT válido (formato: 12345678-9)');
      return;
    }

    const result = await login(rut.trim(), password);
    
    if (result.success) {
      console.log('✅ Login exitoso');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', result.error || 'Error al iniciar sesión');
    }
  };

  const goToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <YStack flex={1} p="$4" justifyContent="center" gap="$6">
        {/* Header */}
        <YStack alignItems="center" gap="$4">
          <Card
            width={120}
            height={120}
            borderRadius={50}
            backgroundColor="$primary"
            justifyContent="center"
            alignItems="center"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.3}
            shadowRadius={4}
            elevation={5}
          >
            <Image
              source ={icon}
               style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
          </Card>
          
          <YStack alignItems="center" gap="$2">
            <H2 color="$textPrimary" fontWeight="bold">
              Iniciar Sesión
            </H2>
            <Text
              fontSize="$4"
              color="$textSecondary"
              textAlign="center"
              lineHeight="$5"
              maxWidth={300}
            >
              Ingresa a OneCañama para reportar problemas en tu comuna
            </Text>
          </YStack>
        </YStack>

        {/* Formulario */}
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
            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="600" color="$textPrimary">
                RUT
              </Text>
              <Input
                placeholder="12345678-9"
                value={rut}
                onChangeText={handleRutChange}
                autoCapitalize="none"
                backgroundColor="$gray2"
                borderColor="$gray6"
                focusStyle={{ borderColor: '$primary' }}
                size="$4"
                maxLength={12}
              />
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$4" fontWeight="600" color="$textPrimary">
                Contraseña
              </Text>
              <Input
                placeholder="Tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                backgroundColor="$gray2"
                borderColor="$gray6"
                focusStyle={{ borderColor: '$primary' }}
                size="$4"
              />
            </YStack>

            <Button
              size="$5"
              backgroundColor="$primary"
              color="white"
              fontWeight="bold"
              onPress={handleLogin}
              disabled={isLoading}
              pressStyle={{ backgroundColor: "$primaryDark", scale: 0.98 }}
              shadowColor="$primary"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={8}
              elevation={8}
            >
              {isLoading ? (
                <YStack flexDirection="row" alignItems="center" gap="$2">
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text color="white" fontWeight="bold">Iniciando sesión...</Text>
                </YStack>
              ) : (
                <YStack flexDirection="row" alignItems="center" gap="$2">
                  <Ionicons name="log-in" size={20} color="white" />
                  <Text color="white" fontWeight="bold">Iniciar Sesión</Text>
                </YStack>
              )}
            </Button>
          </YStack>
        </Card>

        {/* Footer */}
        <YStack alignItems="center">
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
    </SafeAreaView>
  );
}
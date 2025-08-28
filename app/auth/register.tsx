// app/auth/register.tsx
import React, { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, Alert, ScrollView } from 'react-native';
import { Text, YStack, XStack, Button, Input, H2, Card } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';

interface RegisterForm {
  rut: string;
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  rut?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  
  const [form, setForm] = useState<RegisterForm>({
    rut: '',
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Actualizar campo del formulario
  const updateField = (field: keyof RegisterForm) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
    updateField('rut')(formatted);
  };

  // Validar formulario completo
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar RUT
    if (!form.rut.trim()) {
      newErrors.rut = 'El RUT es obligatorio';
    } else {
      const rutRegex = /^[0-9]+-[0-9kK]$/;
      if (!rutRegex.test(form.rut)) {
        newErrors.rut = 'RUT inválido (formato: 12345678-9)';
      }
    }

    // Validar nombre
    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (form.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar email
    if (!form.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    // Validar teléfono
    if (!form.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else {
      const phoneRegex = /^[0-9]{8,9}$/;
      if (!phoneRegex.test(form.telefono.replace(/\s/g, ''))) {
        newErrors.telefono = 'Teléfono inválido (8-9 dígitos)';
      }
    }

    // Validar contraseña
    if (!form.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Errores en el formulario', 'Por favor corrige los errores marcados');
      return;
    }

    try {
      console.log('📝 Registrando nuevo usuario...');
      
      const userData = {
        rut: form.rut.trim(),
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        numero_telefonico_movil: form.telefono.trim(),
        password: form.password,
      };
      
      const result = await register(userData);
      
      if (result.success) {
        console.log('✅ Usuario registrado exitosamente');
        
        Alert.alert(
          '¡Registro Exitoso!',
          'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión con tu RUT.',
          [
            { 
              text: 'Iniciar Sesión', 
              onPress: () => router.replace('/auth/login') 
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Error al crear la cuenta');
      }
      
    } catch (error: any) {
      console.error('❌ Error inesperado en registro:', error);
      Alert.alert('Error', 'Error inesperado al crear la cuenta');
    }
  };

  const goToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$6" paddingTop="$4">
          {/* Header */}
          <YStack alignItems="center" gap="$4">
            <YStack
              width={64}
              height={64}
              borderRadius={32}
              backgroundColor="$success"
              justifyContent="center"
              alignItems="center"
              shadowColor="$success"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={8}
              elevation={8}
            >
              <Ionicons name="person-add" size={32} color="white" />
            </YStack>
            
            <YStack alignItems="center" gap="$2">
              <H2 color="$textPrimary" fontWeight="bold">
                Crear Cuenta
              </H2>
              <Text
                fontSize="$4"
                color="$textSecondary"
                textAlign="center"
                lineHeight="$5"
                maxWidth={300}
              >
                Únete a OneCañama y reporta problemas en tu comuna
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
                  value={form.rut}
                  onChangeText={handleRutChange}
                  autoCapitalize="none"
                  backgroundColor={errors.rut ? "$red2" : "$gray2"}
                  borderColor={errors.rut ? "$red6" : "$gray6"}
                  focusStyle={{ borderColor: errors.rut ? '$red6' : '$success' }}
                  size="$4"
                  maxLength={12}
                />
                {errors.rut && (
                  <Text fontSize="$3" color="$red10">
                    {errors.rut}
                  </Text>
                )}
              </YStack>

              {/* Campo Nombre */}
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize="$4" fontWeight="600" color="$textPrimary">
                    Nombre Completo
                  </Text>
                  <Text fontSize="$3" color="$red10">*</Text>
                </XStack>
                <Input
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChangeText={updateField('nombre')}
                  autoCapitalize="words"
                  backgroundColor={errors.nombre ? "$red2" : "$gray2"}
                  borderColor={errors.nombre ? "$red6" : "$gray6"}
                  focusStyle={{ borderColor: errors.nombre ? '$red6' : '$success' }}
                  size="$4"
                />
                {errors.nombre && (
                  <Text fontSize="$3" color="$red10">
                    {errors.nombre}
                  </Text>
                )}
              </YStack>

              {/* Campo Email */}
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize="$4" fontWeight="600" color="$textPrimary">
                    Email
                  </Text>
                  <Text fontSize="$3" color="$red10">*</Text>
                </XStack>
                <Input
                  placeholder="tu@email.com"
                  value={form.email}
                  onChangeText={updateField('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  backgroundColor={errors.email ? "$red2" : "$gray2"}
                  borderColor={errors.email ? "$red6" : "$gray6"}
                  focusStyle={{ borderColor: errors.email ? '$red6' : '$success' }}
                  size="$4"
                />
                {errors.email && (
                  <Text fontSize="$3" color="$red10">
                    {errors.email}
                  </Text>
                )}
              </YStack>

              {/* Campo Teléfono */}
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize="$4" fontWeight="600" color="$textPrimary">
                    Teléfono
                  </Text>
                  <Text fontSize="$3" color="$red10">*</Text>
                </XStack>
                <Input
                  placeholder="987654321"
                  value={form.telefono}
                  onChangeText={updateField('telefono')}
                  keyboardType="phone-pad"
                  backgroundColor={errors.telefono ? "$red2" : "$gray2"}
                  borderColor={errors.telefono ? "$red6" : "$gray6"}
                  focusStyle={{ borderColor: errors.telefono ? '$red6' : '$success' }}
                  size="$4"
                  maxLength={9}
                />
                {errors.telefono && (
                  <Text fontSize="$3" color="$red10">
                    {errors.telefono}
                  </Text>
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
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChangeText={updateField('password')}
                  secureTextEntry
                  autoComplete="new-password"
                  backgroundColor={errors.password ? "$red2" : "$gray2"}
                  borderColor={errors.password ? "$red6" : "$gray6"}
                  focusStyle={{ borderColor: errors.password ? '$red6' : '$success' }}
                  size="$4"
                />
                {errors.password && (
                  <Text fontSize="$3" color="$red10">
                    {errors.password}
                  </Text>
                )}
              </YStack>

              {/* Campo Confirmar Contraseña */}
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize="$4" fontWeight="600" color="$textPrimary">
                    Confirmar Contraseña
                  </Text>
                  <Text fontSize="$3" color="$red10">*</Text>
                </XStack>
                <Input
                  placeholder="Repite tu contraseña"
                  value={form.confirmPassword}
                  onChangeText={updateField('confirmPassword')}
                  secureTextEntry
                  autoComplete="new-password"
                  backgroundColor={errors.confirmPassword ? "$red2" : "$gray2"}
                  borderColor={errors.confirmPassword ? "$red6" : "$gray6"}
                  focusStyle={{ borderColor: errors.confirmPassword ? '$red6' : '$success' }}
                  size="$4"
                />
                {errors.confirmPassword && (
                  <Text fontSize="$3" color="$red10">
                    {errors.confirmPassword}
                  </Text>
                )}
              </YStack>

              {/* Botón de registro */}
              <Button
                size="$5"
                backgroundColor="$success"
                color="white"
                fontWeight="bold"
                onPress={handleRegister}
                disabled={isLoading}
                pressStyle={{ backgroundColor: "$successDark", scale: 0.98 }}
                shadowColor="$success"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.3}
                shadowRadius={8}
                elevation={8}
                marginTop="$2"
              >
                {isLoading ? (
                  <XStack alignItems="center" gap="$2">
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text color="white" fontWeight="bold">Creando cuenta...</Text>
                  </XStack>
                ) : (
                  <XStack alignItems="center" gap="$2">
                    <Ionicons name="person-add" size={20} color="white" />
                    <Text color="white" fontWeight="bold">Crear Cuenta</Text>
                  </XStack>
                )}
              </Button>
            </YStack>
          </Card>

          {/* Footer */}
          <YStack alignItems="center">
            <Text fontSize="$3" color="$textSecondary">
              ¿Ya tienes cuenta?{' '}
              <Text
                color="$primary"
                fontWeight="600"
                pressStyle={{ opacity: 0.7 }}
                onPress={goToLogin}
              >
                Inicia sesión aquí
              </Text>
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
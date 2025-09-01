// app/auth/register.tsx - Pantalla principal de registro
import React, { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView, Alert, ScrollView, Pressable } from 'react-native';
import { Text, YStack, XStack, H2, Card } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

// Hooks
import { useAuth } from '../../src/hooks/useAuth';

// Componentes
import FormInput from '../../src/components/forms/FormInput';
import FormProgress from '../../src/components/forms/FormProgress';
import RegisterButton from '../../src/components/forms/RegisterButton';

// Utilidades
import {
  RegisterForm,
  FormErrors,
  formatRUT,
  validateRegisterForm,
  getCompletedFields,
  getFieldsWithContent,
  getFieldStatuses,
  FORM_FIELDS
} from '../../src/utils/registerValidation';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  
  // Estados del formulario
  const [form, setForm] = useState<RegisterForm>({
    rut: '',
    nombre: '',
    email: '',
    numero_telefonico_movil: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Actualizar campo del formulario con validación en tiempo real
  const updateField = (field: keyof RegisterForm) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validar campo individual cuando pierde el foco
  const validateSingleField = (field: keyof RegisterForm, value: string) => {
    const tempForm = { ...form, [field]: value };
    const allErrors = validateRegisterForm(tempForm);
    
    if (allErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: allErrors[field] }));
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar cambio de RUT con formato
  const handleRutChange = (text: string) => {
    const formatted = formatRUT(text);
    updateField('rut')(formatted);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors = validateRegisterForm(form);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Registrar usuario
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
        numero_telefonico_movil: form.numero_telefonico_movil.trim(),
        password: form.password,
      };
      
      const result = await register(userData);
      
      if (result.success) {
        console.log('✅ Usuario registrado exitosamente');
        
        Alert.alert(
          '🎉 ¡Bienvenido a OneCalama!',
          'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
          [
            {
              text: 'Continuar',
              onPress: () => router.push('/auth/login')
            }
          ]
        );
      } else {
        throw new Error(result.message || 'Error en el registro');
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      
      Alert.alert(
        'Error en el Registro',
        error.message || 'No se pudo crear tu cuenta. Intenta nuevamente.',
        [{ text: 'Reintentar', style: 'default' }]
      );
    }
  };

  // Calcular progreso usando los errores actuales del estado
  const completedFields = getCompletedFields(form, errors); // Usa errores actuales
  const fieldsWithContent = getFieldsWithContent(form);
  const fieldStatuses = getFieldStatuses(form, errors); // Usa errores actuales
  const isFormValid = Object.keys(validateRegisterForm(form)).length === 0 && completedFields.length === 6;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$5">
          {/* Header con navegación */}
          <XStack alignItems="center" gap="$3">
            <Pressable onPress={() => router.push('/auth/login')}>
              <Ionicons name="arrow-back" size={28} color="#009688" />
            </Pressable>
            
            <YStack flex={1} alignItems="center">
              <H2 color="$secondary" fontWeight="bold">
                Crear Cuenta
              </H2>
              <Text fontSize="$4" color="$textSecondary">
                Únete a la comunidad de Calama
              </Text>
            </YStack>
          </XStack>
          
          {/* Icono principal */}
          <YStack alignItems="center">
            <YStack
              width={80}
              height={80}
              bg="$secondary"
              borderRadius="$6"
              alignItems="center"
              justifyContent="center"
              style={{
                shadowColor: '#009688',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Ionicons name="person-add" size={40} color="white" />
            </YStack>
          </YStack>

          {/* Progreso del formulario */}
          <FormProgress
            completedFields={completedFields.length}
            totalFields={6}
            hasErrors={hasErrors}
            fieldStatuses={fieldStatuses}
          />

          {/* Formulario principal */}
          <Card bg="$surface" p="$5" elevate>
            <YStack gap="$4">
              <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
                📝 Información Personal
              </Text>
              
              <FormInput
                label="RUT"
                value={form.rut}
                onChangeText={handleRutChange}
                onBlur={() => validateSingleField('rut', form.rut)}
                placeholder="12345678-9"
                error={errors.rut}
                icon="card"
                maxLength={12}
                required
              />

              <FormInput
                label="Nombre Completo"
                value={form.nombre}
                onChangeText={updateField('nombre')}
                onBlur={() => validateSingleField('nombre', form.nombre)}
                placeholder="Ingresa tu nombre completo"
                error={errors.nombre}
                icon="person"
                required
              />

              <FormInput
                label="Correo Electrónico"
                value={form.email}
                onChangeText={updateField('email')}
                onBlur={() => validateSingleField('email', form.email)}
                placeholder="tu@email.com"
                error={errors.email}
                icon="mail"
                keyboardType="email-address"
                required
              />

              <FormInput
                label="Teléfono Móvil"
                value={form.numero_telefonico_movil}
                onChangeText={updateField('numero_telefonico_movil')}
                onBlur={() => validateSingleField('numero_telefonico_movil', form.numero_telefonico_movil)}
                placeholder="9 8765 4321"
                error={errors.numero_telefonico_movil}
                icon="call"
                keyboardType="phone-pad"
                maxLength={9}
                showPhonePrefix={true}
                required
              />

              <FormInput
                label="Contraseña"
                value={form.password}
                onChangeText={updateField('password')}
                onBlur={() => validateSingleField('password', form.password)}
                placeholder="Mínimo 6 caracteres"
                error={errors.password}
                icon="lock-closed"
                secureTextEntry
                required
              />

              <FormInput
                label="Confirmar Contraseña"
                value={form.confirmPassword}
                onChangeText={updateField('confirmPassword')}
                onBlur={() => validateSingleField('confirmPassword', form.confirmPassword)}
                placeholder="Repite tu contraseña"
                error={errors.confirmPassword}
                icon="lock-closed"
                secureTextEntry
                required
              />
            </YStack>
          </Card>

          {/* Botón de registro */}
          <RegisterButton
            isValid={isFormValid}
            loading={isLoading}
            onPress={handleRegister}
          />

          {/* Links de navegación */}
          <YStack alignItems="center" gap="$3">
            <YStack height={1} bg="$gray6" width="100%" />
            
            <Text fontSize="$4" color="$textSecondary">
              ¿Ya tienes una cuenta?
            </Text>
            
            <Pressable onPress={() => router.push('/auth/login')}>
              <Text fontSize="$4" color="$secondary" fontWeight="bold">
                Iniciar Sesión
              </Text>
            </Pressable>
          </YStack>

          {/* Información de seguridad */}
          <Card 
            bg="rgba(0, 150, 136, 0.08)" 
            borderColor="$secondary" 
            borderWidth={1} 
            p="$4"
          >
            <XStack alignItems="center" gap="$3">
              <Ionicons name="shield-checkmark" size={24} color="#009688" />
              <YStack flex={1}>
                <Text fontSize="$4" fontWeight="600" color="$secondary">
                  🔒 Tus datos están seguros
                </Text>
                <Text fontSize="$3" color="$textSecondary">
                  Tu información está protegida y se usa únicamente para brindarte un mejor servicio municipal.
                </Text>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
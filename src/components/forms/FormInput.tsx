// src/components/forms/FormInput.tsx
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, YStack, XStack, Input } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  maxLength?: number;
  required?: boolean;
  showPhonePrefix?: boolean;
  onBlur?: () => void; // Nueva prop para validación
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  required = false,
  showPhonePrefix = false,
  onBlur
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return "#F44336";
    if (isFocused) return "#009688";
    if (value) return "#26A69A";
    return "#d1d5db";
  };

  const getIconColor = () => {
    if (error) return "#F44336";
    if (value || isFocused) return "#009688";
    return "#BDBDBD";
  };

  return (
    <YStack gap="$2">
      <XStack alignItems="center" gap="$1">
        <Text fontSize="$4" fontWeight="600" color="$textPrimary">
          {label}
        </Text>
        {required && (
          <Text fontSize="$4" color="$error">*</Text>
        )}
      </XStack>
      
      <XStack
        bg="white"
        borderColor={getBorderColor()}
        borderWidth={error ? 2 : 1}
        borderRadius="$4"
        alignItems="center"
        paddingHorizontal="$3"
        height={52}
        style={{
          shadowColor: error ? '#F44336' : value ? '#009688' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: error ? 0.15 : value ? 0.1 : 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={getIconColor()}
          style={{ marginRight: 12 }}
        />
        
        {showPhonePrefix && (
          <Text fontSize="$4" color="$textPrimary" fontWeight="500" mr="$1">
            +56
          </Text>
        )}
        
        <Input
          flex={1}
          fontSize="$4"
          placeholder={placeholder}
          placeholderTextColor="$textDisabled"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.(); // Llamar validación cuando pierde el foco
          }}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          maxLength={maxLength}
          bg="transparent"
          borderWidth={0}
          focusStyle={{ borderWidth: 0 }}
          color="$textPrimary"
        />
        
        {secureTextEntry && (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#009688"
            />
          </Pressable>
        )}
      </XStack>
      
      {error && (
        <XStack alignItems="center" gap="$2">
          <Ionicons name="alert-circle" size={14} color="#F44336" />
          <Text fontSize="$3" color="$error">
            {error}
          </Text>
        </XStack>
      )}
    </YStack>
  );
};

export default FormInput;
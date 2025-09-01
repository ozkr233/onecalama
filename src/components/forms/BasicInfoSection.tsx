// src/components/forms/BasicInfoSection.tsx
import React from 'react';
import { Text, YStack, XStack, Card, H4, Input, TextArea } from 'tamagui';
import { DenunciaFormData } from '../../types';

interface BasicInfoSectionProps {
  formData: DenunciaFormData;
  onChange: (field: keyof DenunciaFormData, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onChange
}) => {
  return (
    <Card elevate p="$4" gap="$4">
      <H4 color="$textPrimary">📝 Información Básica</H4>

      <YStack gap="$3">
        {/* Campo: Título */}
        <YStack gap="$2">
          <XStack jc="space-between" ai="center">
            <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
              Título
            </Text>
            <Text fontSize="$3" color="$red10">
              * Obligatorio
            </Text>
          </XStack>

          <Input
            placeholder="Describe brevemente el problema (ej: Luminaria dañada en Av. Brasil)"
            value={formData.titulo}
            onChangeText={(text) => onChange('titulo', text)}
            bg="white"
            borderColor={formData.titulo.length >= 10 ? "$success" : "$textDisabled"}
            borderWidth={1}
            focusStyle={{ borderColor: '$primary' }}
            fontSize="$4"
            p="$3"
          />

          {/* Indicadores de validación para título */}
          {formData.titulo.length > 0 && formData.titulo.length < 10 && (
            <Text fontSize="$3" color="$warning">
              💡 Agrega más detalles al título (mínimo 10 caracteres)
            </Text>
          )}

          {formData.titulo.length >= 10 && (
            <Text fontSize="$3" color="$success">
              ✅ Título completado correctamente
            </Text>
          )}
        </YStack>

        {/* Campo: Descripción */}
        <YStack gap="$2">
          <XStack jc="space-between" ai="center">
            <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
              Descripción del Problema
            </Text>
            <XStack ai="center" gap="$2">
              <Text fontSize="$3" color="$textSecondary">
                {formData.descripcion.length}/500
              </Text>
              <Text fontSize="$3" color="$red10">
                * Obligatorio
              </Text>
            </XStack>
          </XStack>

          <TextArea
            placeholder="Explica en detalle el problema: cuándo ocurre, cómo afecta, ubicación específica, etc."
            value={formData.descripcion}
            onChangeText={(text) => onChange('descripcion', text)}
            numberOfLines={4}
            maxLength={500}
            bg="white"
            borderColor={formData.descripcion.length >= 20 ? "$success" : "$textDisabled"}
            borderWidth={1}
            focusStyle={{ borderColor: '$primary' }}
            fontSize="$4"
            p="$3"
          />

          {/* Indicadores de validación para descripción */}
          {formData.descripcion.length > 0 && formData.descripcion.length < 20 && (
            <Text fontSize="$3" color="$warning">
              💡 Agrega más detalles (mínimo 20 caracteres para sugerencias precisas)
            </Text>
          )}

          {formData.descripcion.length >= 20 && (
            <Text fontSize="$3" color="$success">
              ✅ Descripción completada correctamente
            </Text>
          )}
        </YStack>
      </YStack>
    </Card>
  );
};

export default BasicInfoSection;
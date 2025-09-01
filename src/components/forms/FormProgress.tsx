// src/components/forms/FormProgress.tsx
import React from 'react';
import { Text, YStack, XStack, Card } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface FieldStatus {
  key: string;
  label: string;
  completed: boolean;
  hasContent: boolean;
  hasError: boolean;
  errorMessage?: string;
}

interface FormProgressProps {
  completedFields: number;
  totalFields: number;
  hasErrors: boolean;
  fieldStatuses: FieldStatus[];
}

const FormProgress: React.FC<FormProgressProps> = ({
  completedFields,
  totalFields,
  hasErrors,
  fieldStatuses
}) => {
  const progress = (completedFields / totalFields) * 100;
  const fieldsWithErrors = fieldStatuses.filter(field => field.hasError);

  const getProgressColor = () => {
    if (hasErrors) return "#FF9800";
    if (progress === 100) return "#4CAF50";
    return "#009688";
  };

  return (
    <Card bg="$surface" p="$4" elevate>
      <YStack gap="$4">
        {/* Header del progreso */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$4" fontWeight="600" color="$textPrimary">
            Progreso del Registro
          </Text>
          <XStack alignItems="center" gap="$2">
            {progress === 100 && !hasErrors && (
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            )}
            <Text fontSize="$4" fontWeight="bold" color={getProgressColor()}>
              {Math.round(progress)}%
            </Text>
          </XStack>
        </XStack>
        
        {/* Barra de progreso */}
        <YStack
          height={8}
          bg="$gray2"
          borderRadius="$4"
          overflow="hidden"
        >
          <YStack
            height="100%"
            bg={getProgressColor()}
            width={`${progress}%`}
            borderRadius="$4"
          />
        </YStack>
        
        {/* Estado del progreso */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$3" color="$textSecondary">
            {completedFields} de {totalFields} campos completados correctamente
          </Text>
          
          {hasErrors && (
            <XStack alignItems="center" gap="$1">
              <Ionicons name="warning" size={14} color="#FF9800" />
              <Text fontSize="$3" color="$warning">
                {fieldsWithErrors.length} error{fieldsWithErrors.length !== 1 ? 'es' : ''}
              </Text>
            </XStack>
          )}
        </XStack>

        {/* Lista de campos con estado */}
        <YStack gap="$3">
          <Text fontSize="$3" fontWeight="600" color="$textPrimary">
            Estado de los campos:
          </Text>
          
          <XStack flexWrap="wrap" gap="$2">
            {fieldStatuses.map(field => {
              const getFieldColor = () => {
                if (field.hasError) return "#F44336";
                if (field.completed) return "#009688";
                if (field.hasContent) return "#FF9800"; // Naranja para contenido con error
                return "#999";
              };

              const getFieldBg = () => {
                if (field.hasError) return "rgba(244, 67, 54, 0.1)";
                if (field.completed) return "rgba(0, 150, 136, 0.1)";
                if (field.hasContent) return "rgba(255, 152, 0, 0.1)"; // Naranja para contenido con error
                return "$gray2";
              };

              const getFieldIcon = () => {
                if (field.hasError) return "close-circle";
                if (field.completed) return "checkmark-circle";
                if (field.hasContent) return "warning"; // Cambio de alert-circle a warning
                return "ellipse-outline";
              };
              
              return (
                <XStack
                  key={field.key}
                  alignItems="center"
                  gap="$1"
                  bg={getFieldBg()}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Ionicons
                    name={getFieldIcon() as any}
                    size={12}
                    color={getFieldColor()}
                  />
                  <Text 
                    fontSize="$2" 
                    color={getFieldColor()}
                    fontWeight={field.completed ? "600" : "400"}
                  >
                    {field.label}
                  </Text>
                </XStack>
              );
            })}
          </XStack>
        </YStack>

        {/* Sección de errores específicos */}
        {hasErrors && fieldsWithErrors.length > 0 && (
          <Card bg="rgba(244, 67, 54, 0.05)" borderColor="#F44336" borderWidth={1} p="$3">
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="alert-circle" size={16} color="#F44336" />
                <Text fontSize="$4" fontWeight="600" color="#F44336">
                  Errores a corregir:
                </Text>
              </XStack>
              
              <YStack gap="$1">
                {fieldsWithErrors.map(field => (
                  <XStack key={field.key} alignItems="center" gap="$2" pl="$4">
                    <Text fontSize="$2" color="#F44336">•</Text>
                    <Text fontSize="$3" color="#F44336">
                      <Text fontWeight="600">{field.label}:</Text> {field.errorMessage}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </Card>
        )}

        {/* Mensaje de éxito */}
        {progress === 100 && !hasErrors && (
          <Card bg="rgba(76, 175, 80, 0.1)" borderColor="#4CAF50" borderWidth={1} p="$3">
            <XStack alignItems="center" gap="$2">
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text fontSize="$3" fontWeight="600" color="#4CAF50">
                ¡Perfecto! Todos los campos están completos y correctos
              </Text>
            </XStack>
          </Card>
        )}
      </YStack>
    </Card>
  );
};

export default FormProgress;
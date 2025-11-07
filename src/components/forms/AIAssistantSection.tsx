// src/components/forms/AIAssistantSection.tsx
import React, { useRef } from 'react';
import { Text, YStack, Button, Card, H4, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { DenunciaFormData } from '../../types';
import AIAssistant, { AIAssistantRef } from '../ai/AIAssistant';

interface AIAssistantSectionProps {
  formData: DenunciaFormData;
  onApplySuggestion: (suggestions: Partial<DenunciaFormData>) => void;
  categorias: any[];
  departamentos: any[];
}

const AIAssistantSection: React.FC<AIAssistantSectionProps> = ({
  formData,
  onApplySuggestion,
  categorias,
  departamentos
}) => {
  const aiAssistantRef = useRef<AIAssistantRef>(null);

  const handleAnalyze = () => {
    if (aiAssistantRef.current) {
      aiAssistantRef.current.analyze();
    }
  };

  return (
    <Card elevate p="$4" gap="$4" borderColor="$gray6" borderWidth={1} backgroundColor="$surface">
      <H4 color="$textPrimary">✨ Asistente Inteligente</H4>

      <Text fontSize="$4" color="$textSecondary" lineHeight="$1">
        Obtén sugerencias automáticas para completar tu denuncia de manera más efectiva y acelerar su procesamiento.
      </Text>

      {/* Botón del Asistente IA - alto contraste */}
      <Button
        size="$4"
        bg="$primary"
        color="white"
        fontWeight="700"
        borderRadius="$4"
        onPress={handleAnalyze}
        hoverStyle={{ bg: '$primaryDark' }}
        pressStyle={{ bg: '$primaryDark', scale: 0.98 }}
        elevate
      >
        <XStack alignItems="center" gap="$2">
          <Ionicons name="sparkles" size={20} color="white" />
          <Text color="white" fontWeight="700" fontSize="$4">
            Obtener sugerencias IA
          </Text>
        </XStack>
      </Button>

      {/* Tips para el usuario */}
      <YStack gap="$1" p="$3" bg="$gray2" borderRadius="$3" borderWidth={1} borderColor="$gray6">
        <Text fontSize="$3" color="$textPrimary" fontWeight="600">
          💡 Palabras que el asistente reconoce:
        </Text>
        <Text fontSize="$2" color="$textSecondary">
          luz, bache, basura, ruido, parque, señal, tráfico, alumbrado
        </Text>
      </YStack>

      {/* Componente AIAssistant (solo maneja el modal) */}
      <AIAssistant
        ref={aiAssistantRef}
        formData={formData}
        onApplySuggestion={onApplySuggestion}
        categorias={categorias}
        departamentos={departamentos}
      />
    </Card>
  );
};

export default AIAssistantSection;

// src/components/forms/AIAssistantSection.tsx
import React, { useRef } from 'react';
import { Text, YStack, Button, Card, H4 } from 'tamagui';
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
    <Card elevate p="$4" gap="$4">
      <H4 color="$textPrimary">✨ Asistente Inteligente</H4>

      <Text fontSize="$4" color="$textSecondary" lineHeight="$1">
        Obtén sugerencias automáticas para completar tu denuncia de manera más efectiva y acelerar su procesamiento.
      </Text>

      {/* Botón del Asistente IA */}
      <Button
        size="$4"
        bg="linear-gradient(45deg, #667eea, #764ba2)"
        color="white"
        fontWeight="bold"
        onPress={handleAnalyze}
        pressStyle={{ scale: 0.95 }}
        style={{
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <Ionicons name="sparkles" size={20} color="white" />
        <Text color="white" ml="$2" fontWeight="bold" fontSize="$4">
          Obtener Sugerencias IA
        </Text>
      </Button>

      {/* Tips para el usuario */}
      <YStack gap="$1" p="$2" bg="$blue2" borderRadius="$3">
        <Text fontSize="$3" color="$blue11" fontWeight="600">
          💡 Palabras que el asistente reconoce:
        </Text>
        <Text fontSize="$2" color="$blue10">
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
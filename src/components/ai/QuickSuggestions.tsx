// src/components/ai/QuickSuggestions.tsx
import React, { useState, useEffect } from 'react';
import { Text, YStack, XStack, Button, Card } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { AIService } from '../../services/aiService';

interface QuickSuggestionsProps {
  inputText: string;
  onSuggestionSelect: (suggestion: string) => void;
  placeholder?: string;
  maxSuggestions?: number;
}

const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({
  inputText,
  onSuggestionSelect,
  placeholder = "Empieza a escribir para ver sugerencias...",
  maxSuggestions = 3
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (inputText.length >= 3) {
        // Buscar palabras clave en el texto
        const words = inputText.toLowerCase().split(' ');
        const allSuggestions: string[] = [];

        words.forEach(word => {
          const quickSuggestions = AIService.getQuickSuggestions(word);
          allSuggestions.push(...quickSuggestions);
        });

        // Filtrar duplicados y limitar cantidad
        const uniqueSuggestions = [...new Set(allSuggestions)]
          .filter(suggestion =>
            !inputText.toLowerCase().includes(suggestion.toLowerCase().substring(0, 10))
          )
          .slice(0, maxSuggestions);

        setSuggestions(uniqueSuggestions);
        setIsVisible(uniqueSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setIsVisible(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [inputText, maxSuggestions]);

  if (!isVisible) {
    return null;
  }

  return (
    <Card
      p="$3"
      mt="$2"
      bg="$blue1"
      borderColor="$blue6"
      borderWidth={1}
      style={{
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <XStack ai="center" gap="$2" mb="$3">
        <Ionicons name="flash" size={16} color="#667eea" />
        <Text fontSize="$3" fontWeight="bold" color="$blue11">
          Sugerencias rápidas
        </Text>
      </XStack>

      <YStack gap="$2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            size="$3"
            bg="white"
            borderColor="$blue6"
            borderWidth={1}
            color="$blue11"
            fontWeight="normal"
            justifyContent="flex-start"
            onPress={() => onSuggestionSelect(suggestion)}
            pressStyle={{
              bg: "$blue3",
              scale: 0.98
            }}
          >
            <XStack ai="center" gap="$2" f={1}>
              <Ionicons name="add-circle-outline" size={14} color="#667eea" />
              <Text
                fontSize="$2"
                color="$blue11"
                numberOfLines={2}
                textAlign="left"
                f={1}
              >
                {suggestion}
              </Text>
            </XStack>
          </Button>
        ))}
      </YStack>

      <Text
        fontSize="$1"
        color="$blue10"
        mt="$2"
        textAlign="center"
        style={{ fontStyle: 'italic' }}
      >
        Toca una sugerencia para agregarla a tu descripción
      </Text>
    </Card>
  );
};

export default QuickSuggestions;
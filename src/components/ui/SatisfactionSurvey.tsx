// src/components/ui/SatisfactionSurvey.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Text, YStack, XStack, H5 } from 'tamagui';
import GlassCard from './GlassCard';
import ConfettiAnimation from './ConfettiAnimation';

interface SatisfactionSurveyProps {
  currentRating?: number;
  onRatingChange: (rating: number) => void;
  title?: string;
  subtitle?: string;
  showCommentField?: boolean;
  existingComment?: string;
  onCommentPress?: () => void;
}

const RATING_OPTIONS = [
  { emoji: '😡', value: 1, label: 'Muy malo' },
  { emoji: '😕', value: 2, label: 'Malo' },
  { emoji: '😐', value: 3, label: 'Regular' },
  { emoji: '😊', value: 4, label: 'Bueno' },
  { emoji: '😍', value: 5, label: 'Excelente' }
];

export default function SatisfactionSurvey({
  currentRating,
  onRatingChange,
  title = "¿Cómo calificas el servicio?",
  subtitle = "Tu opinión nos ayuda a mejorar el servicio",
  showCommentField = true,
  existingComment,
  onCommentPress
}: SatisfactionSurveyProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const getSatisfactionLabel = (rating: number): string => {
    const option = RATING_OPTIONS.find(opt => opt.value === rating);
    return option?.label || 'Desconocido';
  };

  const handleRatingPress = (rating: number, label: string) => {
    onRatingChange(rating);

    // ¡CONFETTI MÁGICO para calificación perfecta! 🎉
    if (rating === 5) {
      setShowConfetti(true);

      // Mensaje especial para 5 estrellas
      setTimeout(() => {
        Alert.alert(
          '🎉 ¡INCREÍBLE!',
          `¡Gracias por esa calificación de "${label}"! Eres fantástico/a. 💫`,
          [{ text: '¡De nada! 😊' }]
        );
      }, 500);
    } else {
      // Mensaje normal para otras calificaciones
      Alert.alert(
        '¡Gracias!',
        `Has calificado como "${label}". Tu opinión nos ayuda a mejorar.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  return (
    <>
      {/* Confetti Animation Overlay */}
      <ConfettiAnimation
        show={showConfetti}
        onComplete={handleConfettiComplete}
        duration={4000}
        particleCount={60}
      />

      <GlassCard variant="default" intensity="medium" animated>
        <YStack padding="$4" space="$4">
          {/* Header con gradiente sutil */}
          <YStack space="$2" alignItems="center">
            <H5 textAlign="center" color="$gray12" fontWeight="700">
              {title}
            </H5>
            <Text fontSize="$3" color="$gray10" textAlign="center" opacity={0.8}>
              {subtitle}
            </Text>
          </YStack>

          {/* Selector de emojis con efectos mejorados */}
          <XStack justifyContent="space-around" paddingVertical="$3">
            {RATING_OPTIONS.map((option) => {
              const isSelected = currentRating === option.value;
              const isPerfect = option.value === 5 && isSelected;

              return (
                <YStack
                  key={option.value}
                  alignItems="center"
                  space="$1"
                  paddingVertical="$3"
                  paddingHorizontal="$2"
                  borderRadius="$4"
                  backgroundColor={
                    isPerfect ? "rgba(34, 197, 94, 0.2)" :
                    isSelected ? "$blue2" : "transparent"
                  }
                  borderWidth={isSelected ? 2 : 0}
                  borderColor={
                    isPerfect ? "$green8" : "$blue8"
                  }
                  shadowColor={isPerfect ? "$green8" : isSelected ? "$blue8" : "transparent"}
                  shadowOpacity={isSelected ? 0.3 : 0}
                  shadowRadius={isSelected ? 8 : 0}
                  elevation={isSelected ? 4 : 0}
                  pressStyle={{
                    backgroundColor: isPerfect ? "rgba(34, 197, 94, 0.3)" : "$gray2",
                    scale: 0.9
                  }}
                  hoverStyle={{
                    scale: 1.1,
                    y: -2
                  }}
                  animation="bouncy"
                  onPress={() => handleRatingPress(option.value, option.label)}
                >
                  <Text
                    fontSize="$9"
                    animation="bouncy"
                    scale={isSelected ? 1.2 : 1}
                  >
                    {option.emoji}
                  </Text>
                  <Text
                    fontSize="$1"
                    color={
                      isPerfect ? "$green10" :
                      isSelected ? "$blue10" : "$gray10"
                    }
                    textAlign="center"
                    fontWeight={isSelected ? "700" : "500"}
                    animation="quick"
                  >
                    {option.label}
                  </Text>
                </YStack>
              );
            })}
          </XStack>

          {/* Mensaje de agradecimiento con glass effect */}
          {currentRating && (
            <GlassCard
              variant={currentRating === 5 ? "success" : "primary"}
              intensity="light"
            >
              <YStack padding="$3">
                <Text
                  color={currentRating === 5 ? "$green11" : "$blue11"}
                  textAlign="center"
                  fontSize="$3"
                  fontWeight="600"
                >
                  {currentRating === 5 ? '🌟 ' : ''}
                  ¡Gracias por calificar como "{getSatisfactionLabel(currentRating)}"!
                  {currentRating === 5 ? ' ¡Eres increíble!' : ' Tu opinión es muy importante para nosotros.'}
                </Text>
                {existingComment && (
                  <Text
                    color={currentRating === 5 ? "$green10" : "$blue10"}
                    textAlign="center"
                    fontSize="$2"
                    marginTop="$2"
                    fontStyle="italic"
                  >
                    "{existingComment}"
                  </Text>
                )}
              </YStack>
            </GlassCard>
          )}

          {/* Campo para comentarios con glass effect */}
          {showCommentField && currentRating && !existingComment && (
            <YStack space="$2">
              <Text fontSize="$3" fontWeight="600" color="$gray11">
                ¿Quieres agregar un comentario? (opcional)
              </Text>
              <GlassCard variant="default" intensity="light" animated>
                <YStack
                  padding="$4"
                  minHeight={80}
                  justifyContent="center"
                  pressStyle={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  onPress={onCommentPress}
                >
                  <Text fontSize="$3" color="$gray9" textAlign="center">
                    💬 Toca aquí para agregar un comentario
                  </Text>
                </YStack>
              </GlassCard>
            </YStack>
          )}
        </YStack>
      </GlassCard>
    </>
  );
}
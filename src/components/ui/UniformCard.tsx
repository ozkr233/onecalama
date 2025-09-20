// src/components/ui/UniformCard.tsx
import React from 'react';
import { Card, H4, XStack, YStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface UniformCardProps {
  title?: string;
  titleIcon?: string;
  titleColor?: string;
  children: React.ReactNode;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  onPress?: () => void;
  pressable?: boolean;
  gradient?: boolean;
  compact?: boolean;
}

const UniformCard: React.FC<UniformCardProps> = ({
  title,
  titleIcon,
  titleColor = "$textPrimary",
  children,
  bg = "white",
  borderColor,
  borderWidth,
  onPress,
  pressable = false,
  gradient = false,
  compact = false
}) => {
  const cardBg = gradient
    ? "linear-gradient(135deg, #f0f8ff, #e6f3ff)"
    : bg;

  const cardBorderColor = gradient
    ? "$blue6"
    : borderColor || "$gray5";

  return (
    <Card
      elevate
      p={compact ? "$3" : "$4"}
      bg={cardBg}
      borderWidth={borderWidth || 1}
      borderColor={cardBorderColor}
      borderRadius="$4"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
      pressStyle={pressable ? { scale: 0.98 } : undefined}
      onPress={onPress}
      style={{
        shadowColor: gradient ? '#667eea' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: gradient ? 0.15 : 0.1,
        shadowRadius: gradient ? 8 : 4,
        elevation: gradient ? 4 : 3,
      }}
    >
      <YStack gap={compact ? "$2" : "$3"}>
        {title && (
          <XStack ai="center" gap="$2" mb={compact ? "$1" : "$2"}>
            {titleIcon && (
              <Ionicons
                name={titleIcon as any}
                size={compact ? 18 : 20}
                color={titleColor === "$textPrimary" ? "#333" : titleColor}
              />
            )}
            <H4
              color={titleColor}
              fontSize={compact ? "$4" : "$5"}
              fontWeight="700"
            >
              {title}
            </H4>
          </XStack>
        )}
        {children}
      </YStack>
    </Card>
  );
};

export default UniformCard;
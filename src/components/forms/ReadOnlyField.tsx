// src/components/forms/ReadOnlyField.tsx
import React from 'react';
import { Text, YStack, Card, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface ReadOnlyFieldProps {
  title: string;
  value: string;
  placeholder: string;
  color?: 'primary' | 'secondary';
  icon?: keyof typeof Ionicons.glyphMap;
  description?: string;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  title,
  value,
  placeholder,
  color = 'primary',
  icon,
  description
}) => {
  const getColorValue = () => {
    return color === 'primary' ? '$primary' : '$secondary';
  };

  const getIconColor = () => {
    return color === 'primary' ? '#E67E22' : '#009688';
  };

  return (
    <YStack gap="$2">
      <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
        {title}
      </Text>

      <Card
        bg="$gray2"
        borderColor="$gray6"
        borderWidth={1}
        borderRadius="$3"
        h={50}
        px="$3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
          elevation: 1,
        }}
      >
        <XStack ai="center" jc="space-between" h="100%">
          <XStack ai="center" gap="$2" flex={1}>
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={value ? getIconColor() : "#999"}
              />
            )}
            <Text
              fontSize="$4"
              color={value ? "$textPrimary" : "$textSecondary"}
              flex={1}
            >
              {value || placeholder}
            </Text>
          </XStack>

          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#999"
          />
        </XStack>
      </Card>

      {description && (
        <Text fontSize="$3" color="$textSecondary" style={{ fontStyle: 'italic' }}>
          ℹ️ {description}
        </Text>
      )}
    </YStack>
  );
};

export default ReadOnlyField;
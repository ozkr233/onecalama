// src/components/forms/Selector.tsx
import React, { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text, YStack, XStack, Button, Card, H4 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { OptionItem } from '../../types';

interface SelectorProps {
  title: string;
  placeholder: string;
  selectedValue: string;
  options: OptionItem[];
  onSelect: (value: string) => void;
  isLoading?: boolean;
  error?: string | null;
  color?: 'primary' | 'secondary';
}

const Selector: React.FC<SelectorProps> = ({
  title,
  placeholder,
  selectedValue,
  options,
  onSelect,
  isLoading = false,
  error = null,
  color = 'primary'
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getSelectedName = () => {
    const selected = options.find(option => option.id === selectedValue);
    return selected ? selected.nombre : placeholder;
  };

  const handleSelect = (option: OptionItem) => {
    onSelect(option.id);
    setIsModalVisible(false);
  };

  const getColorValue = () => {
    return color === 'primary' ? '$primary' : '$secondary';
  };

  const getColorHex = () => {
    return color === 'primary' ? '#E67E22' : '#009688';
  };

  return (
    <YStack gap="$2">
      <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
        {title} *
      </Text>

      <TouchableOpacity
        onPress={() => !isLoading && setIsModalVisible(true)}
        disabled={isLoading}
      >
        <Card
          bg="white"
          borderColor={error ? "$error" : "$textDisabled"}
          borderWidth={1}
          borderRadius="$3"
          h={50}
          px="$3"
          opacity={isLoading ? 0.7 : 1}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <XStack ai="center" jc="space-between" h="100%">
            <Text
              fontSize="$4"
              color={selectedValue ? "$textPrimary" : "$textSecondary"}
            >
              {isLoading ? "Cargando..." : getSelectedName()}
            </Text>
            {isLoading ? (
              <Ionicons name="hourglass" size={20} color="#757575" />
            ) : (
              <Ionicons name="chevron-down" size={20} color="#757575" />
            )}
          </XStack>
        </Card>
      </TouchableOpacity>

      {error && (
        <Text fontSize="$3" color="$error">{error}</Text>
      )}

      {/* Modal de opciones */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <YStack f={1} bg="rgba(0,0,0,0.5)" jc="center" ai="center" p="$4">
          <Card
            bg="white"
            p="$4"
            br="$4"
            w="90%"
            maxHeight="70%"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <YStack gap="$4">
              <XStack jc="space-between" ai="center">
                <H4 color="$textPrimary">{title}</H4>
                <Button
                  size="$3"
                  circular
                  bg="$textDisabled"
                  onPress={() => setIsModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color="white" />
                </Button>
              </XStack>

              <ScrollView style={{ maxHeight: 400 }}>
                <YStack gap="$2">
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => handleSelect(option)}
                    >
                      <Card
                        bg={selectedValue === option.id ? getColorValue() : "white"}
                        borderColor={selectedValue === option.id ? getColorValue() : "$textDisabled"}
                        borderWidth={1}
                        p="$3"
                        style={{
                          shadowColor: selectedValue === option.id ? getColorHex() : '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: selectedValue === option.id ? 0.3 : 0.1,
                          shadowRadius: 4,
                          elevation: selectedValue === option.id ? 5 : 2,
                        }}
                      >
                        <Text
                          fontSize="$4"
                          color={selectedValue === option.id ? "white" : "$textPrimary"}
                          fontWeight={selectedValue === option.id ? "bold" : "normal"}
                        >
                          {option.nombre}
                        </Text>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </YStack>
              </ScrollView>
            </YStack>
          </Card>
        </YStack>
      </Modal>
    </YStack>
  );
};

export default Selector;
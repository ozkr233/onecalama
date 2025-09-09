// src/components/forms/UbicacionSection.tsx
import React from 'react';
import { Text, YStack, XStack, Button, Card, H4, Input } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { LocationData } from '../../types';

interface UbicacionSectionProps {
  direccion: string;
  ubicacion?: LocationData;
  error?: string;
  onDireccionChange: (value: string) => void;
  onOpenMap: () => void;
  onRemoveLocation: () => void;
}

const UbicacionSection: React.FC<UbicacionSectionProps> = ({
  direccion,
  ubicacion,
  error,
  onDireccionChange,
  onOpenMap,
  onRemoveLocation
}) => {
  return (
    <Card elevate p="$4" gap="$4">
      <H4 color="$textPrimary">📍 Ubicación</H4>

      <YStack gap="$3">
        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
            Dirección
          </Text>
          <Input
            placeholder="Escribe la dirección manualmente"
            value={direccion}
            onChangeText={onDireccionChange}
            bg="white"
            borderColor={error ? "$error" : "$textDisabled"}
            focusStyle={{ borderColor: '$primary' }}
          />
          {error && (
            <Text fontSize="$3" color="$error">{error}</Text>
          )}
        </YStack>

        {/* Botón para abrir mapa */}
        <Button
          size="$4"
          bg="$secondary"
          color="white"
          fontWeight="bold"
          onPress={onOpenMap}
          style={{
            shadowColor: '#009688',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="map" size={20} color="white" />
          <Text color="white" fontWeight="bold" ml="$2">
            Seleccionar en Mapa
          </Text>
        </Button>

        {/* Mostrar ubicación seleccionada */}
        {ubicacion && (
          <Card
            bg="$background"
            p="$3"
            borderColor="$secondary"
            borderWidth={1}
            style={{
              shadowColor: '#009688',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <YStack gap="$2">
              <XStack jc="space-between" ai="center">
                <Text fontSize="$4" fontWeight="bold" color="$secondary">
                  📍 Ubicación del mapa
                </Text>
                <Button
                  size="$2"
                  circular
                  bg="$error"
                  onPress={onRemoveLocation}
                >
                  <Ionicons name="close" size={16} color="white" />
                </Button>
              </XStack>

              <Text fontSize="$3" color="$textSecondary">
                {ubicacion.address || 'Ubicación seleccionada'}
              </Text>

              <XStack gap="$4">
                <Text fontSize="$2" color="$textSecondary">
                  Lat: {ubicacion.latitud.toFixed(6)}
                </Text>
                <Text fontSize="$2" color="$textSecondary">
                  Lng: {ubicacion.longitud.toFixed(6)}
                </Text>
              </XStack>
            </YStack>
          </Card>
        )}
      </YStack>
    </Card>
  );
};

export default UbicacionSection;
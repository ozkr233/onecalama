// src/components/forms/UbicacionSection.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Text, YStack, XStack, Button, Card, Input } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface LocationData {
  latitud: number;
  longitud: number;
  address?: string;
}

interface UbicacionSectionProps {
  direccion: string;
  ubicacion?: LocationData;
  onDireccionChange: (direccion: string) => void;
  onOpenMap: () => void;
  onRemoveLocation: () => void;
  error?: string;
}

const UbicacionSection: React.FC<UbicacionSectionProps> = ({
  direccion,
  ubicacion,
  onDireccionChange,
  onOpenMap,
  onRemoveLocation,
  error
}) => {
  const [isGettingQuickLocation, setIsGettingQuickLocation] = useState(false);

  // Función para obtener ubicación rápida (sin abrir el mapa)
  const getQuickLocation = async () => {
    setIsGettingQuickLocation(true);
    
    try {
      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Para usar la ubicación automática necesitamos acceso a tu GPS.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Usar mapa', onPress: onOpenMap }
          ]
        );
        return;
      }

      // Obtener ubicación
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Obtener dirección
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        let address = '';
        if (addresses.length > 0) {
          const addr = addresses[0];
          const street = addr.street || '';
          const streetNumber = addr.streetNumber || '';
          const district = addr.district || addr.subregion || '';
          const city = addr.city || 'Calama';
          
          address = `${street} ${streetNumber}${street && streetNumber ? ',' : ''} ${district}${district ? ',' : ''} ${city}`.trim();
          address = address.replace(/,\s*,/g, ',').replace(/^,|,$/g, '');
        }

        // Actualizar la dirección de texto
        onDireccionChange(address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);

        Alert.alert(
          '✅ Ubicación obtenida',
          'Tu ubicación actual se ha establecido como dirección.',
          [
            { text: 'OK' },
            { text: 'Abrir mapa', onPress: onOpenMap }
          ]
        );

      } catch (geocodeError) {
        console.error('Error en geocodificación:', geocodeError);
        onDireccionChange(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        
        Alert.alert(
          'Ubicación obtenida',
          'Se establecieron las coordenadas, pero no pudimos obtener la dirección exacta.',
          [
            { text: 'OK' },
            { text: 'Abrir mapa', onPress: onOpenMap }
          ]
        );
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error de ubicación',
        'No pudimos obtener tu ubicación. Por favor, usa el mapa para seleccionar manualmente.',
        [
          { text: 'OK' },
          { text: 'Abrir mapa', onPress: onOpenMap }
        ]
      );
    } finally {
      setIsGettingQuickLocation(false);
    }
  };

  return (
    <Card elevate p="$4" gap="$3">
      {/* Título de la sección */}
      <YStack gap="$2">
        <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
          📍 Ubicación de la denuncia
        </Text>
        <Text fontSize="$3" color="$textSecondary">
          Especifica dónde ocurrió el problema que quieres reportar
        </Text>
      </YStack>

      {/* Campo de dirección manual */}
      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="600" color="$textPrimary">
          Dirección o descripción del lugar
        </Text>
        <Input
          placeholder="Ej: Av. Brasil 1234, Centro, Calama"
          value={direccion}
          onChangeText={onDireccionChange}
          multiline
          numberOfLines={2}
          borderColor={error ? "$error" : "$textDisabled"}
          focusStyle={{ borderColor: '$primary' }}
          fontSize="$3"
          bg="white"
        />
        {error && (
          <Text fontSize="$3" color="$error">{error}</Text>
        )}
      </YStack>

      {/* Botones de ubicación */}
      <YStack gap="$3">
        <Text fontSize="$4" fontWeight="600" color="$textPrimary">
          O selecciona la ubicación automáticamente
        </Text>

        {/* Botones de acción */}
        <XStack gap="$3">
          {/* Botón ubicación rápida */}
          <Button
            f={1}
            size="$4"
            bg="$primary"
            color="white"
            fontWeight="bold"
            onPress={getQuickLocation}
            disabled={isGettingQuickLocation}
            style={{
              shadowColor: '#E67E22',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            {isGettingQuickLocation ? (
              <Text color="white">Obteniendo...</Text>
            ) : (
              <>
                <Ionicons name="locate" size={20} color="white" />
                <Text color="white" fontWeight="bold" ml="$2">
                  Mi ubicación
                </Text>
              </>
            )}
          </Button>

          {/* Botón para abrir mapa */}
          <Button
            f={1}
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
              Abrir Mapa
            </Text>
          </Button>
        </XStack>
      </YStack>

      {/* Mostrar ubicación seleccionada del mapa */}
      {ubicacion && (
        <Card
          bg="$background"
          p="$3"
          borderColor="$secondary"
          borderWidth={2}
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
                🗺️ Ubicación del mapa
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
              {ubicacion.address || 'Ubicación seleccionada en el mapa'}
            </Text>

            <XStack gap="$4" flexWrap="wrap">
              <Text fontSize="$2" color="$textSecondary">
                📍 Lat: {ubicacion.latitud.toFixed(6)}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                📍 Lng: {ubicacion.longitud.toFixed(6)}
              </Text>
            </XStack>

            <Text fontSize="$2" color="$success" fontWeight="bold">
              ✅ Esta ubicación se usará para tu denuncia
            </Text>
          </YStack>
        </Card>
      )}

      {/* Información adicional */}
      <Card bg="$gray2" p="$3">
        <YStack gap="$2">
          <Text fontSize="$3" fontWeight="bold" color="$textPrimary">
            💡 Consejos para una mejor ubicación:
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            • Puedes escribir la dirección manualmente si la conoces
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            • Usa "Mi ubicación" si estás en el lugar del problema
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            • Usa el mapa para ubicaciones precisas o si no estás en el lugar
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            • Las ubicaciones del mapa tienen prioridad sobre el texto
          </Text>
        </YStack>
      </Card>
    </Card>
  );
};

export default UbicacionSection;
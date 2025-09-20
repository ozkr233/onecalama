// src/components/forms/MapSelector.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, YStack, XStack, Button, Card, H4 } from 'tamagui';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface MapSelectorProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  onClose: () => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

// Coordenadas por defecto de Calama, Chile
const CALAMA_DEFAULT = {
  latitude: -22.4667,
  longitude: -68.9333,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  onClose,
  initialLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);

  const [region, setRegion] = useState<Region>(CALAMA_DEFAULT);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setRegion({
        ...initialLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Para usar el GPS necesitamos acceso a tu ubicación'
        );
        setIsGettingLocation(false);
        return;
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setSelectedLocation({ latitude, longitude });

    } catch (error) {
      Alert.alert(
        'Error de GPS',
        'No pudimos obtener tu ubicación actual'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Selecciona una ubicación', 'Toca el mapa para marcar una ubicación');
      return;
    }

    try {
      // Intentar obtener la dirección usando geocodificación inversa
      const addresses = await Location.reverseGeocodeAsync({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      let address = '';
      if (addresses.length > 0) {
        const addr = addresses[0];
        address = `${addr.street || ''} ${addr.streetNumber || ''}, ${addr.district || ''}, Calama`.trim();
      }

      onLocationSelect({
        ...selectedLocation,
        address: address || 'Ubicación seleccionada en mapa',
      });
    } catch (error) {
      // Si falla la geocodificación, enviar solo las coordenadas
      onLocationSelect({
        ...selectedLocation,
        address: 'Ubicación seleccionada en mapa',
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header del modal */}
      <Card
        bg="$municipal"
        p="$4"
        style={styles.header}
      >
        <XStack jc="space-between" ai="center">
          <H4 color="white">Seleccionar Ubicación</H4>
          <Button
            size="$3"
            circular
            bg="rgba(255,255,255,0.2)"
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="white" />
          </Button>
        </XStack>
      </Card>

      {/* Instrucciones */}
      <Card bg="white" p="$3" mx="$3" mt="$2">
        <Text fontSize="$3" color="$textSecondary" textAlign="center">
          📍 Toca el mapa para seleccionar la ubicación de tu denuncia
        </Text>
      </Card>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Ubicación seleccionada"
              description="Ubicación de la denuncia"
              pinColor="#E67E22"
            />
          )}
        </MapView>

        {/* Botón GPS flotante */}
        <View style={styles.gpsButtonContainer}>
          <Button
            size="$4"
            circular
            bg="$primary"
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
            style={styles.gpsButton}
          >
            <Ionicons
              name={isGettingLocation ? "hourglass" : "locate"}
              size={24}
              color="white"
            />
          </Button>
        </View>
      </View>

      {/* Información de ubicación seleccionada */}
      {selectedLocation && (
        <Card bg="white" p="$3" mx="$3">
          <YStack gap="$2">
            <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
              Ubicación seleccionada:
            </Text>
            <Text fontSize="$3" color="$textSecondary">
              Lat: {selectedLocation.latitude.toFixed(6)}
            </Text>
            <Text fontSize="$3" color="$textSecondary">
              Lng: {selectedLocation.longitude.toFixed(6)}
            </Text>
          </YStack>
        </Card>
      )}

      {/* Botones de acción */}
      <Card bg="white" p="$4" mx="$3" mb="$3">
        <XStack gap="$3">
          <Button
            f={1}
            size="$4"
            bg="$textDisabled"
            color="$textPrimary"
            onPress={onClose}
          >
            Cancelar
          </Button>

          <Button
            f={2}
            size="$4"
            bg="$primary"
            color="white"
            fontWeight="bold"
            onPress={handleConfirmLocation}
            disabled={!selectedLocation}
            style={{
              shadowColor: '#E67E22',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text color="white" fontWeight="bold" ml="$2">
              Confirmar Ubicación
            </Text>
          </Button>
        </XStack>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapContainer: {
    flex: 1,
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  gpsButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  gpsButton: {
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default MapSelector;
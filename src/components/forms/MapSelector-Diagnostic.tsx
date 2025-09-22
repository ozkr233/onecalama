// src/components/forms/MapSelector.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, YStack, XStack, Button, Card, H4, Spinner } from 'tamagui';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface MapSelectorProps {
  onLocationSelect: (location: {
    latitud: number;
    longitud: number;
    address?: string;
  }) => void;
  onClose: () => void;
  initialLocation?: {
    latitud: number;
    longitud: number;
  };
}

// Coordenadas por defecto de Calama, Chile
const CALAMA_DEFAULT = {
  latitude: -22.4667,
  longitude: -68.9333,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// Límites de Calama para validar ubicaciones
const CALAMA_BOUNDS = {
  north: -22.40,
  south: -22.52,
  east: -68.85,
  west: -69.05,
};

const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  onClose,
  initialLocation,
}) => {
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitud: number;
    longitud: number;
  } | null>(initialLocation || null);

  const [region, setRegion] = useState<Region>(CALAMA_DEFAULT);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      const newRegion = {
        latitude: initialLocation.latitud,
        longitude: initialLocation.longitud,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  // Verificar si una ubicación está dentro de los límites de Calama
  const isLocationInCalama = (lat: number, lng: number): boolean => {
    return lat >= CALAMA_BOUNDS.south && 
           lat <= CALAMA_BOUNDS.north && 
           lng >= CALAMA_BOUNDS.west && 
           lng <= CALAMA_BOUNDS.east;
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Para usar el GPS necesitamos acceso a tu ubicación',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Configurar', 
              onPress: () => Location.requestForegroundPermissionsAsync() 
            }
          ]
        );
        return;
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      });

      const { latitude, longitude } = location.coords;

      // Verificar si está en Calama
      if (!isLocationInCalama(latitude, longitude)) {
        Alert.alert(
          'Ubicación fuera de Calama',
          'Tu ubicación actual está fuera de los límites de Calama. ¿Deseas continuar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Continuar', 
              onPress: () => {
                const newRegion = {
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                };
                setRegion(newRegion);
                setSelectedLocation({ latitud: latitude, longitud: longitude });
                
                if (mapRef.current) {
                  mapRef.current.animateToRegion(newRegion, 1000);
                }
              }
            }
          ]
        );
        return;
      }

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setSelectedLocation({ latitud: latitude, longitud: longitude });

      // Animar a la nueva región
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error de GPS',
        'No pudimos obtener tu ubicación actual. Verifica que tengas el GPS activado.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    // Verificar si la ubicación está en Calama
    if (!isLocationInCalama(latitude, longitude)) {
      Alert.alert(
        'Ubicación fuera de Calama',
        'Por favor selecciona una ubicación dentro de los límites de Calama.'
      );
      return;
    }

    setSelectedLocation({ latitud: latitude, longitud: longitude });
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Selecciona una ubicación', 'Toca el mapa para marcar una ubicación');
      return;
    }

    setIsLoadingAddress(true);
    
    try {
      // Intentar obtener la dirección usando geocodificación inversa
      const addresses = await Location.reverseGeocodeAsync({
        latitude: selectedLocation.latitud,
        longitude: selectedLocation.longitud,
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

      onLocationSelect({
        ...selectedLocation,
        address: address || 'Ubicación seleccionada en mapa',
      });

    } catch (error) {
      console.error('Error getting address:', error);
      // Si falla la geocodificación, continuar sin dirección
      onLocationSelect({
        ...selectedLocation,
        address: 'Ubicación seleccionada en mapa',
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const centerOnCalama = () => {
    const calamaRegion = {
      ...CALAMA_DEFAULT,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setRegion(calamaRegion);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion(calamaRegion, 1000);
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
        <Text fontSize="$2" color="$textSecondary" textAlign="center" mt="$1">
          Solo se permiten ubicaciones dentro de Calama
        </Text>
      </Card>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {!isMapReady && (
          <View style={styles.loadingOverlay}>
            <Spinner size="large" color="$primary" />
            <Text mt="$2" color="$textSecondary">Cargando mapa...</Text>
          </View>
        )}
        
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={region}
          onPress={handleMapPress}
          onMapReady={() => setIsMapReady(true)}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          showsBuildings={true}
          showsTraffic={false}
          mapType="standard"
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
          loadingEnabled={true}
          loadingIndicatorColor="#E67E22"
          loadingBackgroundColor="#f5f5f5"
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitud,
                longitude: selectedLocation.longitud,
              }}
              title="Ubicación seleccionada"
              description="Ubicación de la denuncia"
              pinColor="#E67E22"
            />
          )}
        </MapView>

        {/* Botones flotantes */}
        <View style={styles.floatingButtons}>
          {/* Botón GPS */}
          <Button
            size="$4"
            circular
            bg="$primary"
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
            style={[styles.floatingButton, { bottom: 80 }]}
          >
            {isGettingLocation ? (
              <Spinner size="small" color="white" />
            ) : (
              <Ionicons name="locate" size={24} color="white" />
            )}
          </Button>

          {/* Botón centrar en Calama */}
          <Button
            size="$4"
            circular
            bg="$secondary"
            onPress={centerOnCalama}
            style={[styles.floatingButton, { bottom: 20 }]}
          >
            <Ionicons name="home" size={24} color="white" />
          </Button>
        </View>
      </View>

      {/* Información de ubicación seleccionada */}
      {selectedLocation && (
        <Card bg="white" p="$3" mx="$3">
          <YStack gap="$2">
            <XStack jc="space-between" ai="center">
              <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
                📍 Ubicación seleccionada
              </Text>
              {isLocationInCalama(selectedLocation.latitud, selectedLocation.longitud) ? (
                <Text fontSize="$2" color="$success" fontWeight="bold">✓ En Calama</Text>
              ) : (
                <Text fontSize="$2" color="$warning" fontWeight="bold">⚠ Fuera de Calama</Text>
              )}
            </XStack>
            <Text fontSize="$3" color="$textSecondary">
              Lat: {selectedLocation.latitud.toFixed(6)} | Lng: {selectedLocation.longitud.toFixed(6)}
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
            disabled={isLoadingAddress}
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
            disabled={!selectedLocation || isLoadingAddress}
            style={{
              shadowColor: '#E67E22',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            {isLoadingAddress ? (
              <Spinner size="small" color="white" />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color="white" />
            )}
            <Text color="white" fontWeight="bold" ml="$2">
              {isLoadingAddress ? 'Obteniendo dirección...' : 'Confirmar Ubicación'}
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
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingButtons: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  floatingButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 10,
  },
});

export default MapSelector;
// src/components/forms/MapSelector.tsx - CON GOOGLE MAPS HABILITADO
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, YStack, XStack, Button, Card, H4 } from 'tamagui';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // CON GOOGLE PROVIDER
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

const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  onClose,
  initialLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  console.log('🗺️ MapSelector renderizado con initialLocation:', initialLocation);

  const getCurrentLocation = async () => {
    console.log('📍 Solicitando ubicación actual...');
    setGettingLocation(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Necesitamos acceso a tu ubicación');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('✅ Ubicación obtenida:', location.coords);

      setSelectedLocation({
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
      });

    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('👆 Usuario tocó el mapa:', { latitude, longitude });
    setSelectedLocation({ latitud: latitude, longitud: longitude });
  };

  const confirmLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Selecciona una ubicación primero');
      return;
    }

    console.log('🔄 Confirmando ubicación:', selectedLocation);
    setLoadingAddress(true);

    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: selectedLocation.latitud,
        longitude: selectedLocation.longitud,
      });

      let address = 'Ubicación seleccionada';
      if (addresses.length > 0) {
        const addr = addresses[0];
        address = `${addr.street || ''} ${addr.streetNumber || ''}, Calama`.trim();
      }

      console.log('✅ Dirección obtenida:', address);

      onLocationSelect({
        ...selectedLocation,
        address,
      });

    } catch (error) {
      console.error('⚠️ Error en geocodificación:', error);
      onLocationSelect({
        ...selectedLocation,
        address: 'Ubicación seleccionada',
      });
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card bg="$municipal" p="$4">
        <XStack jc="space-between" ai="center">
          <H4 color="white">Seleccionar Ubicación</H4>
          <Button size="$3" circular bg="rgba(255,255,255,0.2)" onPress={onClose}>
            <Ionicons name="close" size={20} color="white" />
          </Button>
        </XStack>
      </Card>

      {/* Instrucciones */}
      <Card bg="white" p="$3" mx="$3" mt="$2">
        <Text fontSize="$4" color="$success" textAlign="center" fontWeight="bold">
          ✅ MAPA FUNCIONANDO - GOOGLE MAPS
        </Text>
        <Text fontSize="$3" color="$textSecondary" textAlign="center">
          📍 Toca el mapa para marcar la ubicación
        </Text>
      </Card>

      {/* Mapa - CON GOOGLE PROVIDER */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} // ← GOOGLE HABILITADO
          initialRegion={initialLocation ? {
            latitude: initialLocation.latitud,
            longitude: initialLocation.longitud,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          } : CALAMA_DEFAULT}
          onPress={handleMapPress}
          onMapReady={() => {
            console.log('✅ Google Maps cargado correctamente');
          }}
          showsUserLocation={true}
          mapType="standard"
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitud,
                longitude: selectedLocation.longitud,
              }}
              title="Ubicación seleccionada"
              pinColor="#E67E22"
            />
          )}
        </MapView>

        {/* Botón GPS flotante */}
        <View style={styles.floatingButton}>
          <Button
            size="$4"
            circular
            bg="$primary"
            onPress={getCurrentLocation}
            disabled={gettingLocation}
          >
            <Ionicons 
              name={gettingLocation ? "refresh" : "locate"} 
              size={24} 
              color="white" 
            />
          </Button>
        </View>
      </View>

      {/* Info de ubicación */}
      {selectedLocation && (
        <Card bg="white" p="$3" mx="$3">
          <Text fontSize="$4" fontWeight="bold" color="$success">
            ✅ Ubicación marcada correctamente
          </Text>
          <Text fontSize="$3" color="$textSecondary">
            Lat: {selectedLocation.latitud.toFixed(6)}
          </Text>
          <Text fontSize="$3" color="$textSecondary">
            Lng: {selectedLocation.longitud.toFixed(6)}
          </Text>
        </Card>
      )}

      {/* Botones de acción */}
      <Card bg="white" p="$4" mx="$3" mb="$3">
        <XStack gap="$3">
          <Button f={1} size="$4" bg="$gray8" color="white" onPress={onClose}>
            Cancelar
          </Button>
          
          <Button 
            f={2} 
            size="$4" 
            bg="$primary" 
            color="white" 
            onPress={confirmLocation}
            disabled={!selectedLocation || loadingAddress}
          >
            {loadingAddress ? (
              <Text color="white">Procesando...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text color="white" ml="$2">Confirmar</Text>
              </>
            )}
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
  mapContainer: {
    flex: 1,
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default MapSelector;
// src/hooks/useLocation.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationData {
  latitud: number;
  longitud: number;
  address?: string;
}

export interface UseLocationReturn {
  currentLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationData | null>;
  requestPermissions: () => Promise<boolean>;
  reverseGeocode: (lat: number, lng: number) => Promise<string>;
  isLocationInCalama: (lat: number, lng: number) => boolean;
}

// Límites de Calama, Chile
const CALAMA_BOUNDS = {
  north: -22.40,
  south: -22.52,
  east: -68.85,
  west: -69.05,
};

export const useLocation = (): UseLocationReturn => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar si una ubicación está dentro de los límites de Calama
  const isLocationInCalama = (lat: number, lng: number): boolean => {
    return lat >= CALAMA_BOUNDS.south && 
           lat <= CALAMA_BOUNDS.north && 
           lng >= CALAMA_BOUNDS.west && 
           lng <= CALAMA_BOUNDS.east;
  };

  // Solicitar permisos de ubicación
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permisos de ubicación denegados');
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError('Error al solicitar permisos');
      return false;
    }
  };

  // Geocodificación inversa para obtener dirección
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        const street = addr.street || '';
        const streetNumber = addr.streetNumber || '';
        const district = addr.district || addr.subregion || '';
        const city = addr.city || 'Calama';
        
        let address = `${street} ${streetNumber}${street && streetNumber ? ',' : ''} ${district}${district ? ',' : ''} ${city}`.trim();
        address = address.replace(/,\s*,/g, ',').replace(/^,|,$/g, '');
        
        return address || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
      }

      return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } catch (err) {
      console.error('Error in reverse geocoding:', err);
      return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    }
  };

  // Solicitar ubicación actual
  const requestLocation = async (): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar permisos
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Obtener ubicación
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      });

      const { latitude, longitude } = location.coords;

      // Obtener dirección
      const address = await reverseGeocode(latitude, longitude);

      const locationData: LocationData = {
        latitud: latitude,
        longitud: longitude,
        address,
      };

      setCurrentLocation(locationData);
      return locationData;

    } catch (err) {
      console.error('Error getting location:', err);
      const errorMessage = 'No se pudo obtener la ubicación. Verifica que el GPS esté activado.';
      setError(errorMessage);
      
      Alert.alert(
        'Error de ubicación',
        errorMessage,
        [{ text: 'OK' }]
      );
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar permisos al inicializar
  useEffect(() => {
    const checkInitialPermissions = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setError(null);
      }
    };

    checkInitialPermissions();
  }, []);

  return {
    currentLocation,
    isLoading,
    error,
    requestLocation,
    requestPermissions,
    reverseGeocode,
    isLocationInCalama,
  };
};
// MapSelector.tsx - ESTILOS MEJORADOS
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Alert } from 'react-native';
import Constants from 'expo-constants';
import { Text, YStack, XStack, Button, Card, H4 } from 'tamagui';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

type LocationData = { latitud: number; longitud: number; address?: string };

interface MapSelectorProps {
  onLocationSelect: (loc: LocationData) => void;
  onClose: () => void;
  initialLocation?: { latitud: number; longitud: number };
}

/* --------------------------- ENV SWITCH --------------------------- */
const isExpoGoAndroid =
  Platform.OS === 'android' && Constants.appOwnership === 'expo';

export default function MapSelector(props: MapSelectorProps) {
  return isExpoGoAndroid ? (
    <MapSelectorWeb {...props} />
  ) : (
    <MapSelectorNative {...props} />
  );
}

/* =======================  FALLBACK WEB (Leaflet)  ======================= */
function MapSelectorWeb({
  onLocationSelect,
  onClose,
  initialLocation,
}: MapSelectorProps) {
  const webRef = useRef<WebView>(null);
  const [selected, setSelected] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    initialLocation
      ? { latitude: initialLocation.latitud, longitude: initialLocation.longitud }
      : null
  );
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  const center = useMemo(() => {
    // Default: Calama (ajusta si quieres otro centro)
    const lat = initialLocation?.latitud ?? -22.468735;
    const lng = initialLocation?.longitud ?? -68.933723;
    return { lat, lng };
  }, [initialLocation]);

  const html = useMemo(() => {
    // HTML mejorado con estilos personalizados para OneCalama
    return `
<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    html,body,#map { 
      height: 100%; 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .leaflet-container { 
      background: #f5f5f5;
      border-radius: 12px;
    }
    .leaflet-control-zoom {
      border: none !important;
      border-radius: 8px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    }
    .leaflet-control-zoom a {
      background: #E67E22 !important;
      color: white !important;
      border: none !important;
      border-radius: 6px !important;
      font-weight: bold !important;
      font-size: 16px !important;
      line-height: 28px !important;
      width: 32px !important;
      height: 32px !important;
      transition: all 0.2s ease !important;
    }
    .leaflet-control-zoom a:hover {
      background: #d35400 !important;
      transform: scale(1.05);
    }
    .leaflet-popup-content-wrapper {
      background: white !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
    .leaflet-popup-tip {
      background: white !important;
    }
    /* Custom marker styles */
    .custom-marker {
      background: #E67E22;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: grab;
    }
    .custom-marker:active {
      cursor: grabbing;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const RN = window.ReactNativeWebView;
    function send(lat, lng) {
      RN.postMessage(JSON.stringify({ type: 'select', latitude: lat, longitude: lng }));
    }

    const center = [${center.lat}, ${center.lng}];
    window.map = L.map('map', {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: false,
      dragging: true
    }).setView(center, 16);

    // Usar tiles con mejor estilo
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap | OneCalama',
      className: 'custom-tiles'
    }).addTo(window.map);

    // Crear marker personalizado
    const customIcon = L.divIcon({
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    window.marker = L.marker(center, { 
      draggable: true,
      icon: customIcon,
      opacity: 0.9
    }).addTo(window.map);

    // Añadir popup al marker
    window.marker.bindPopup(
      '<div style="text-align:center; font-weight:bold; color:#E67E22;">📍 Ubicación Seleccionada</div>'
    );

    window.marker.on('dragend', () => {
      const p = window.marker.getLatLng();
      send(p.lat, p.lng);
      window.marker.openPopup();
    });

    window.map.on('click', (e) => {
      window.marker.setLatLng(e.latlng);
      window.marker.openPopup();
      send(e.latlng.lat, e.latlng.lng);
    });

    // Notificar posición inicial
    send(center[0], center[1]);
    
    // Abrir popup inicial
    setTimeout(() => {
      window.marker.openPopup();
    }, 500);
  </script>
</body>
</html>`;
  }, [center.lat, center.lng]);

  const handleMessage = async (ev: any) => {
    try {
      const msg = JSON.parse(ev?.nativeEvent?.data ?? '{}');
      if (msg?.type === 'select') {
        setSelected({ latitude: msg.latitude, longitude: msg.longitude });
      }
    } catch {}
  };

  const confirm = async () => {
    if (!selected) {
      Alert.alert(
        'Selecciona ubicación', 
        'Por favor selecciona un punto en el mapa antes de continuar'
      );
      return;
    }
    try {
      const addrs = await Location.reverseGeocodeAsync({
        latitude: selected.latitude,
        longitude: selected.longitude,
      });
      const a = addrs[0];
      const address = a
        ? `${a.street || ''} ${a.streetNumber || ''}, ${a.district || a.city || ''}, Calama`.trim()
        : 'Ubicación seleccionada en mapa';

      onLocationSelect({
        latitud: selected.latitude,
        longitud: selected.longitude,
        address,
      });
    } catch {
      onLocationSelect({
        latitud: selected.latitude,
        longitud: selected.longitude,
        address: 'Ubicación seleccionada en mapa',
      });
    }
  };

  const goToMyLocation = async () => {
    setIsLoadingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Para usar el GPS necesitamos acceso a tu ubicación'
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = pos.coords;
      
      // Mover mapa/marker desde el HTML
      webRef.current?.injectJavaScript(`
        (function(){
          const lat=${latitude}, lng=${longitude};
          window.map.setView([lat, lng], 17);
          window.marker.setLatLng([lat, lng]);
          window.marker.openPopup();
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'select', latitude:lat, longitude:lng}));
        })();
        true;
      `);
    } catch (error) {
      Alert.alert(
        'Error de GPS',
        'No pudimos obtener tu ubicación actual. Intenta nuevamente.'
      );
    } finally {
      setIsLoadingGPS(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header mejorado */}
      <Card 
        bg="$municipal" 
        p="$4" 
        style={styles.header}
        borderRadius={0}
      >
        <XStack ai="center" jc="space-between">
          <YStack>
            <H4 color="white" fontSize="$6">
              Seleccionar Ubicación
            </H4>
            <Text color="rgba(255,255,255,0.8)" fontSize="$3">
              📍 Toca el mapa o arrastra el marcador
            </Text>
          </YStack>
          <Button
            chromeless
            onPress={onClose}
            size="$4"
            circular
            bg="rgba(255,255,255,0.2)"
            pressStyle={{ bg: 'rgba(255,255,255,0.3)' }}
          >
            <Ionicons name="close" size={24} color="white" />
          </Button>
        </XStack>
      </Card>

      {/* Badge informativo para modo web */}
      <Card bg="$secondary" p="$3" mx="$3" mt="$3" borderRadius="$4">
        <XStack ai="center" gap="$3">
          <View style={styles.webBadge}>
            <Ionicons name="globe-outline" size={16} color="white" />
          </View>
          <YStack f={1}>
            <Text fontSize="$3" fontWeight="bold" color="white">
              Modo Mapa Web Activo
            </Text>
            <Text fontSize="$2" color="rgba(255,255,255,0.9)">
              Usando OpenStreetMap por compatibilidad
            </Text>
          </YStack>
        </XStack>
      </Card>

      {/* Contenedor del mapa */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          style={styles.webView}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Botón GPS flotante mejorado */}
        <View style={styles.gpsButtonContainer}>
          <Button
            onPress={goToMyLocation}
            circular
            size="$5"
            bg="$primary"
            disabled={isLoadingGPS}
            pressStyle={{ 
              bg: '$primaryPress',
              transform: [{ scale: 0.95 }]
            }}
            style={styles.gpsButton}
          >
            <Ionicons 
              name={isLoadingGPS ? "hourglass" : "locate"} 
              size={24} 
              color="white" 
            />
          </Button>
        </View>
      </View>

      {/* Panel de información mejorado */}
      <Card 
        elevate 
        p="$4" 
        mx="$3" 
        mb="$3"
        bg="white"
        borderRadius="$4"
        style={styles.infoCard}
      >
        <YStack gap="$3">
          <XStack ai="center" gap="$2">
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={16} color="#E67E22" />
            </View>
            <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
              Ubicación Seleccionada
            </Text>
          </XStack>
          
          {selected ? (
            <Card bg="$background" p="$3" borderRadius="$3">
              <YStack gap="$1">
                <XStack ai="center" jc="space-between">
                  <Text fontSize="$3" color="$textSecondary">
                    Latitud:
                  </Text>
                  <Text fontSize="$3" fontWeight="bold" color="$textPrimary">
                    {selected.latitude.toFixed(6)}
                  </Text>
                </XStack>
                <XStack ai="center" jc="space-between">
                  <Text fontSize="$3" color="$textSecondary">
                    Longitud:
                  </Text>
                  <Text fontSize="$3" fontWeight="bold" color="$textPrimary">
                    {selected.longitude.toFixed(6)}
                  </Text>
                </XStack>
              </YStack>
            </Card>
          ) : (
            <Text fontSize="$3" color="$textSecondary" textAlign="center">
              Toca el mapa para seleccionar una ubicación
            </Text>
          )}

          {/* Botones de acción mejorados */}
          <XStack gap="$3" mt="$2">
            <Button
              f={1}
              onPress={onClose}
              bg="$textDisabled"
              color="$textPrimary"
              size="$4"
              borderRadius="$4"
              pressStyle={{ bg: '$textDisabledPress' }}
            >
              <Ionicons name="close-circle" size={18} color="$textPrimary" />
              <Text color="$textPrimary" ml="$2" fontWeight="600">
                Cancelar
              </Text>
            </Button>
            
            <Button
              f={2}
              onPress={confirm}
              bg="$primary"
              color="white"
              size="$4"
              borderRadius="$4"
              disabled={!selected}
              pressStyle={{ bg: '$primaryPress' }}
              style={styles.confirmButton}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text color="white" ml="$2" fontWeight="bold">
                Confirmar Ubicación
              </Text>
            </Button>
          </XStack>
        </YStack>
      </Card>
    </View>
  );
}

/* =======================  NATIVO (tu mapa actual)  ======================= */
function MapSelectorNative({
  onLocationSelect,
  onClose,
  initialLocation,
}: MapSelectorProps) {
  const DEFAULT = {
    latitude: initialLocation?.latitud ?? -22.468735,
    longitude: initialLocation?.longitud ?? -68.933723,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState<Region>(DEFAULT as Region);
  const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation
      ? { latitude: initialLocation.latitud, longitude: initialLocation.longitud }
      : null
  );
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  useEffect(() => {
    // Si cambian initialLocation al abrir el modal
    if (initialLocation) {
      setRegion((r) => ({
        ...r,
        latitude: initialLocation.latitud,
        longitude: initialLocation.longitud,
      }));
      setSelected({ latitude: initialLocation.latitud, longitude: initialLocation.longitud });
    }
  }, [initialLocation]);

  const onConfirm = async () => {
    if (!selected) {
      Alert.alert(
        'Selecciona ubicación',
        'Por favor selecciona un punto en el mapa antes de continuar'
      );
      return;
    }
    try {
      const addrs = await Location.reverseGeocodeAsync({
        latitude: selected.latitude,
        longitude: selected.longitude,
      });
      const a = addrs[0];
      const address = a
        ? `${a.street || ''} ${a.streetNumber || ''}, ${a.district || a.city || ''}, Calama`.trim()
        : 'Ubicación seleccionada en mapa';

      onLocationSelect({
        latitud: selected.latitude,
        longitud: selected.longitude,
        address,
      });
    } catch {
      onLocationSelect({
        latitud: selected.latitude,
        longitud: selected.longitude,
        address: 'Ubicación seleccionada en mapa',
      });
    }
  };

  const goToMyLocation = async () => {
    setIsLoadingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Para usar el GPS necesitamos acceso a tu ubicación'
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = pos.coords;
      setRegion((r) => ({ ...r, latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }));
      setSelected({ latitude, longitude });
    } catch (error) {
      Alert.alert(
        'Error de GPS',
        'No pudimos obtener tu ubicación actual. Intenta nuevamente.'
      );
    } finally {
      setIsLoadingGPS(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header mejorado */}
      <Card 
        bg="$municipal" 
        p="$4" 
        style={styles.header}
        borderRadius={0}
      >
        <XStack ai="center" jc="space-between">
          <YStack>
            <H4 color="white" fontSize="$6">
              Seleccionar Ubicación
            </H4>
            <Text color="rgba(255,255,255,0.8)" fontSize="$3">
              📍 Toca el mapa para seleccionar ubicación
            </Text>
          </YStack>
          <Button
            chromeless
            onPress={onClose}
            size="$4"
            circular
            bg="rgba(255,255,255,0.2)"
            pressStyle={{ bg: 'rgba(255,255,255,0.3)' }}
          >
            <Ionicons name="close" size={24} color="white" />
          </Button>
        </XStack>
      </Card>

      {/* Badge para modo nativo */}
      <Card bg="$primary" p="$3" mx="$3" mt="$3" borderRadius="$4">
        <XStack ai="center" gap="$3">
          <View style={styles.nativeBadge}>
            <Ionicons name="map" size={16} color="white" />
          </View>
          <YStack f={1}>
            <Text fontSize="$3" fontWeight="bold" color="white">
              Google Maps Nativo
            </Text>
            <Text fontSize="$2" color="rgba(255,255,255,0.9)">
              Experiencia completa de mapas
            </Text>
          </YStack>
        </XStack>
      </Card>

      {/* Contenedor del mapa */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.nativeMap}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setSelected({ latitude, longitude });
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
          pitchEnabled={false}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {selected && (
            <Marker 
              coordinate={selected} 
              pinColor="#E67E22"
              title="Ubicación seleccionada"
              description="Ubicación de la denuncia"
            />
          )}
        </MapView>

        {/* Botón GPS flotante mejorado */}
        <View style={styles.gpsButtonContainer}>
          <Button
            onPress={goToMyLocation}
            circular
            size="$5"
            bg="$primary"
            disabled={isLoadingGPS}
            pressStyle={{ 
              bg: '$primaryPress',
              transform: [{ scale: 0.95 }]
            }}
            style={styles.gpsButton}
          >
            <Ionicons 
              name={isLoadingGPS ? "hourglass" : "locate"} 
              size={24} 
              color="white" 
            />
          </Button>
        </View>
      </View>

      {/* Panel de información mejorado */}
      <Card 
        elevate 
        p="$4" 
        mx="$3" 
        mb="$3"
        bg="white"
        borderRadius="$4"
        style={styles.infoCard}
      >
        <YStack gap="$3">
          <XStack ai="center" gap="$2">
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={16} color="#E67E22" />
            </View>
            <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
              Ubicación Seleccionada
            </Text>
          </XStack>
          
          {selected ? (
            <Card bg="$background" p="$3" borderRadius="$3">
              <YStack gap="$1">
                <XStack ai="center" jc="space-between">
                  <Text fontSize="$3" color="$textSecondary">
                    Latitud:
                  </Text>
                  <Text fontSize="$3" fontWeight="bold" color="$textPrimary">
                    {selected.latitude.toFixed(6)}
                  </Text>
                </XStack>
                <XStack ai="center" jc="space-between">
                  <Text fontSize="$3" color="$textSecondary">
                    Longitud:
                  </Text>
                  <Text fontSize="$3" fontWeight="bold" color="$textPrimary">
                    {selected.longitude.toFixed(6)}
                  </Text>
                </XStack>
              </YStack>
            </Card>
          ) : (
            <Text fontSize="$3" color="$textSecondary" textAlign="center">
              Toca el mapa para seleccionar una ubicación
            </Text>
          )}

          {/* Botones de acción mejorados */}
          <XStack gap="$3" mt="$2">
            <Button
              f={1}
              onPress={onClose}
              bg="$textDisabled"
              color="$textPrimary"
              size="$4"
              borderRadius="$4"
              pressStyle={{ bg: '$textDisabledPress' }}
            >
              <Ionicons name="close-circle" size={18} color="$textPrimary" />
              <Text color="$textPrimary" ml="$2" fontWeight="600">
                Cancelar
              </Text>
            </Button>
            
            <Button
              f={2}
              onPress={onConfirm}
              bg="$primary"
              color="white"
              size="$4"
              borderRadius="$4"
              disabled={!selected}
              pressStyle={{ bg: '$primaryPress' }}
              style={styles.confirmButton}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text color="white" ml="$2" fontWeight="bold">
                Confirmar Ubicación
              </Text>
            </Button>
          </XStack>
        </YStack>
      </Card>
    </View>
  );
}

/* ------------------------------- ESTILOS MEJORADOS ------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  mapContainer: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  webView: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  nativeMap: {
    flex: 1,
  },
  gpsButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  gpsButton: {
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  infoCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButton: {
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  webBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
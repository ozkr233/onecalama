// app/(tabs)/historial.tsx - CON RESUMEN ESTADÍSTICO
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, FlatList, RefreshControl } from 'react-native';
import { Text, YStack, XStack, H4, H5 } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppHeader from '../../src/components/layout/AppHeader';
import { ResumenEstadistico } from '../../src/components/historial/ResumenEstadistico';
import HistorialCard from '../../src/components/ui/HistorialCard';
import LoadingSpinner from '../../src/components/ui/Loading';
import { HistorialDenuncia, EstadisticasHistorial } from '../../src/types/historial';
import { formatearFecha, getEstadoColor, getEstadoTexto } from '../../src/utils/formatters';
import {
  denunciasPlaceholder,
  estadisticasPlaceholder,
  obtenerDenunciasFiltradas,
  obtenerRespuestasNoLeidas
} from '../../src/data/historialData';

export default function HistorialScreen() {
  const router = useRouter();

  // Estados principales
  const [denuncias, setDenuncias] = useState<HistorialDenuncia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasHistorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar datos (simula API)
  const cargarDatos = async (isRefresh: boolean = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      // Simular carga de API
      await new Promise(resolve => setTimeout(resolve, 800));

      // Cargar datos placeholder
      setDenuncias(denunciasPlaceholder);
      setEstadisticas(estadisticasPlaceholder);

      console.log('[HISTORIAL] Datos cargados exitosamente:', {
        denuncias: denunciasPlaceholder.length,
        estadisticas: estadisticasPlaceholder
      });
    } catch (error) {
      console.error('[HISTORIAL] Error cargando datos:', error);
      setError('No se pudieron cargar las denuncias');
      Alert.alert('Error', 'No se pudieron cargar las denuncias. Intenta nuevamente.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  // Manejar refresh
  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos(true);
  };

  // Navegar al detalle de denuncia
  const handleVerDetalle = (denuncia: HistorialDenuncia) => {
    console.log('[HISTORIAL] Navegando a detalle:', denuncia.id);
    router.push(`/denuncia/${denuncia.id}`);
  };

  // Calcular notificaciones no leídas
  const getNotificacionesNoLeidas = (): number => {
    return obtenerRespuestasNoLeidas();
  };

  // Renderizar item de denuncia
  const renderDenunciaItem = ({ item }: { item: HistorialDenuncia }) => (
    <HistorialCard item={item} onPress={handleVerDetalle} />
  );

  // Renderizar estado vacío
  const renderEmpty = () => (
    <YStack flex={1} justifyContent="center" alignItems="center" p="$8">
      <YStack alignItems="center" gap="$4" bg="white" p="$6" br="$4" elevation={2}>
        <Text fontSize="$9">📝</Text>
        <H4 color="$textPrimary" textAlign="center">
          No tienes denuncias registradas
        </H4>
        <Text fontSize="$3" color="$textSecondary" textAlign="center" lineHeight="$4">
          Cuando envíes tu primera denuncia aparecerá aquí para que puedas seguir su progreso
        </Text>
      </YStack>
    </YStack>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <AppHeader
          screenTitle="Historial"
          screenSubtitle="Cargando..."
          screenIcon="time-outline"
          showNotifications={false}
        />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner />
          <Text mt="$4" color="$textSecondary" fontSize="$4">
            Cargando historial...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  // Render principal
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <AppHeader
        screenTitle="Historial"
        screenSubtitle={`${denuncias.length} denuncias registradas`}
        screenIcon="time-outline"
        showNotifications={getNotificacionesNoLeidas() > 0}
      />

      <YStack flex={1}>
        {/* Mensaje de error */}
        {error && (
          <YStack bg="$red2" mx="$4" mb="$4" p="$3" br="$3" borderWidth={1} borderColor="$red6">
            <Text color="$red11" textAlign="center" fontWeight="600">
              {error}
            </Text>
          </YStack>
        )}

        {/* Lista principal */}
        <FlatList
          data={denuncias}
          renderItem={renderDenunciaItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <YStack>
              {/* Resumen estadístico */}
              {estadisticas && <ResumenEstadistico estadisticas={estadisticas} />}

              {/* Header de la lista */}
              {denuncias.length > 0 && (
                <YStack px="$4" pb="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H5 color="$textPrimary">Mis denuncias</H5>
                    <Text fontSize="$3" color="$textSecondary">
                      {denuncias.length} total{denuncias.length !== 1 ? 'es' : ''}
                    </Text>
                  </XStack>
                </YStack>
              )}
            </YStack>
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E67E22']}
              tintColor="#E67E22"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 24
          }}
          ItemSeparatorComponent={() => <YStack h="$2" />}
        />
      </YStack>
    </SafeAreaView>
  );
}
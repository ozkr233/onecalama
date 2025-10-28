// src/hooks/useAnuncios.ts - CORREGIDO con funciones de conexión
import { useState, useEffect, useCallback } from 'react';
import { AnuncioMunicipal } from '../types/denuncias';
import AnunciosService from '../services/anuncios';
import AuthHelper from '../utils/authHelper';
import { ACTIVE_CONFIG, ENDPOINTS } from '../constants/api';

interface UseAnunciosReturn {
  anuncios: AnuncioMunicipal[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  connectionStatus: 'online' | 'offline' | 'testing';
  statistics: {
    total: number;
    activos: number;
    programados: number;
    finalizados: number;
  } | null;
  refetch: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

export const useAnuncios = (): UseAnunciosReturn => {
  const [anuncios, setAnuncios] = useState<AnuncioMunicipal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'testing'>('testing');
  const [statistics, setStatistics] = useState<any>(null);

  // Función principal para obtener anuncios - SIMPLIFICADA
  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('testing');

      console.log('🔄 Obteniendo anuncios municipales...');
      
      const data = await AnunciosService.obtenerAnuncios();

      // Verificar si realmente obtuvimos datos del backend
      const hasRealData = data && data.length > 0;
      const hasBackendData = hasRealData && data.some(anuncio => 
        anuncio.id && typeof anuncio.id === 'number' && anuncio.id > 0
      );

      if (hasBackendData) {
        console.log(`✅ ${data.length} anuncios obtenidos desde backend`);
        setAnuncios(data);
        setIsConnected(true);
        setConnectionStatus('online');
        setError(null);

        // Calcular estadísticas desde los datos obtenidos
        const stats = {
          total: data.length,
          activos: data.filter(a => a.estado.toLowerCase().includes('activo')).length,
          programados: data.filter(a => a.estado.toLowerCase().includes('programado')).length,
          finalizados: data.filter(a => a.estado.toLowerCase().includes('finalizado')).length,
        };
        setStatistics(stats);
        console.log('✅ Estadísticas calculadas:', stats);

      } else {
        // Si no hay datos reales, probablemente estamos offline o sin datos
        console.log('⚠️ No se obtuvieron datos reales del backend');
        setAnuncios([]);
        setIsConnected(false);
        setConnectionStatus('offline');
        setError('No se pudieron obtener anuncios del servidor');
        setStatistics(null);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error obteniendo anuncios:', errorMessage);
      
      setError(`Error conectando con el backend: ${errorMessage}`);
      setIsConnected(false);
      setConnectionStatus('offline');
      setAnuncios([]);
      setStatistics(null);

    } finally {
      setLoading(false);
    }
  };

  // Test de conexión simple - SIN usar métodos problemáticos del servicio
  const testConnection = useCallback(async (): Promise<boolean> => {
    setConnectionStatus('testing');
    console.log('🧪 Probando conexión con anuncios (método directo)...');

    // Test directo al endpoint sin usar el servicio
    const token = await AuthHelper.getToken();
    const url = `${ACTIVE_CONFIG.baseURL}${ENDPOINTS.ANUNCIOS}`;

    const controller = new AbortController();
    const timeoutMs = 5000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      const isConnected = response.ok;

      if (isConnected) {
        console.log(`✅ Test de conexión exitoso (${response.status})`);
        setIsConnected(true);
        setConnectionStatus('online');
        setError(null);
      } else {
        console.log(`❌ Test de conexión falló (${response.status})`);
        setIsConnected(false);
        setConnectionStatus('offline');
        setError(`Error HTTP: ${response.status}`);
      }

      return isConnected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      if ((error as any)?.name === 'AbortError') {
        console.error('❌ Test de conexión falló: timeout');
        setError('Test de conexión falló: timeout');
      } else {
        console.error('❌ Test de conexión falló:', errorMessage);
        setError(`Test de conexión falló: ${errorMessage}`);
      }

      setIsConnected(false);
      setConnectionStatus('offline');
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  // Refetch que no depende de testConnection
  const refetch = useCallback(async () => {
    console.log('🔄 Refrescando anuncios...');
    await fetchAnuncios();
  }, []);

  // Efecto inicial
  useEffect(() => {
    fetchAnuncios();
  }, []);

  // Log de estado para debug
  useEffect(() => {
    console.log('📊 Estado useAnuncios:', {
      anunciosCount: anuncios.length,
      loading,
      error,
      connectionStatus,
      isConnected
    });
  }, [anuncios.length, loading, error, connectionStatus, isConnected]);

  return {
    anuncios,
    loading,
    error,
    isConnected,
    connectionStatus,
    statistics,
    refetch,
    testConnection
  };
};
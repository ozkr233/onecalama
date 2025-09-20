// src/hooks/useRespuestasMunicipales.ts
import { useState, useEffect, useCallback } from 'react';
import { respuestasMunicipalesService, RespuestaMunicipalFormateada } from '../services/respuestasMunicipales';

interface UseRespuestasMunicipalesOptions {
  publicacionId?: number;
  autoLoad?: boolean;
}

interface UseRespuestasMunicipalesReturn {
  respuestas: RespuestaMunicipalFormateada[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  totalRespuestas: number;
  hayRespuestas: boolean;
  estadisticas: {
    totalRespuestas: number;
    puntuacionPromedio: number;
    distribucionPuntuaciones: Record<string, number>;
  } | null;
  
  // Funciones
  cargarRespuestas: () => Promise<void>;
  refresh: () => Promise<void>;
  calificarRespuesta: (respuestaId: number, puntuacion: 1 | 2 | 3 | 4 | 5) => Promise<void>;
  obtenerRespuestaPorId: (id: number) => Promise<RespuestaMunicipalFormateada | null>;
}

export const useRespuestasMunicipales = ({
  publicacionId,
  autoLoad = true
}: UseRespuestasMunicipalesOptions = {}): UseRespuestasMunicipalesReturn => {
  
  // Estados principales
  const [respuestas, setRespuestas] = useState<RespuestaMunicipalFormateada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [estadisticas, setEstadisticas] = useState<{
    totalRespuestas: number;
    puntuacionPromedio: number;
    distribucionPuntuaciones: Record<string, number>;
  } | null>(null);

  // Estados derivados
  const totalRespuestas = respuestas.length;
  const hayRespuestas = totalRespuestas > 0;

  /**
   * Cargar respuestas
   */
  const cargarRespuestas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [HOOK] Cargando respuestas municipales...', { publicacionId });

      let respuestasData: RespuestaMunicipalFormateada[];

      if (publicacionId) {
        // Cargar respuestas para una publicación específica
        respuestasData = await respuestasMunicipalesService.obtenerRespuestasPorPublicacion(publicacionId);
      } else {
        // Cargar todas las respuestas
        respuestasData = await respuestasMunicipalesService.obtenerRespuestas();
      }

      setRespuestas(respuestasData);
      console.log('✅ [HOOK] Respuestas cargadas:', respuestasData.length);

      // Cargar estadísticas solo si no es para una publicación específica
      if (!publicacionId) {
        try {
          const stats = await respuestasMunicipalesService.obtenerEstadisticas();
          setEstadisticas(stats);
        } catch (statsError) {
          console.warn('⚠️ [HOOK] Error cargando estadísticas:', statsError);
        }
      }

    } catch (error: any) {
      console.error('❌ [HOOK] Error cargando respuestas:', error);
      setError(error.message || 'Error al cargar las respuestas municipales');
      setRespuestas([]);
    } finally {
      setLoading(false);
    }
  }, [publicacionId]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await cargarRespuestas();
    setRefreshing(false);
  }, [cargarRespuestas]);

  /**
   * Calificar una respuesta
   */
  const calificarRespuesta = useCallback(async (respuestaId: number, puntuacion: 1 | 2 | 3 | 4 | 5) => {
    try {
      console.log('🔄 [HOOK] Calificando respuesta:', respuestaId, 'Puntuación:', puntuacion);

      await respuestasMunicipalesService.calificarRespuesta(respuestaId, puntuacion);

      // Actualizar la respuesta en el estado local
      setRespuestas(prevRespuestas => 
        prevRespuestas.map(respuesta => 
          respuesta.id === respuestaId 
            ? { ...respuesta, puntuacion }
            : respuesta
        )
      );

      console.log('✅ [HOOK] Respuesta calificada exitosamente');
    } catch (error: any) {
      console.error('❌ [HOOK] Error calificando respuesta:', error);
      throw error;
    }
  }, []);

  /**
   * Obtener una respuesta específica por ID
   */
  const obtenerRespuestaPorId = useCallback(async (id: number): Promise<RespuestaMunicipalFormateada | null> => {
    try {
      console.log('🔄 [HOOK] Obteniendo respuesta por ID:', id);
      
      // Primero buscar en las respuestas ya cargadas
      const respuestaLocal = respuestas.find(r => r.id === id);
      if (respuestaLocal) {
        console.log('✅ [HOOK] Respuesta encontrada en cache local');
        return respuestaLocal;
      }

      // Si no está en cache, buscar en el servidor
      const respuesta = await respuestasMunicipalesService.obtenerRespuestaPorId(id);
      console.log('✅ [HOOK] Respuesta obtenida del servidor');
      
      return respuesta;
    } catch (error: any) {
      console.error('❌ [HOOK] Error obteniendo respuesta por ID:', error);
      throw error;
    }
  }, [respuestas]);

  // Efecto para cargar datos automáticamente
  useEffect(() => {
    if (autoLoad) {
      cargarRespuestas();
    }
  }, [cargarRespuestas, autoLoad]);

  return {
    respuestas,
    loading,
    error,
    refreshing,
    totalRespuestas,
    hayRespuestas,
    estadisticas,
    cargarRespuestas,
    refresh,
    calificarRespuesta,
    obtenerRespuestaPorId,
  };
};
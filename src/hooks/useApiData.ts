// src/hooks/useApiData.ts - HOOK COMPLETO Y CORREGIDO
import { useState, useEffect, useCallback } from 'react';
import { denunciasService } from '../services/denuncias';
import {
  Categoria,
  DepartamentoMunicipal,
  JuntaVecinal,
  SituacionPublicacion,
  Publicacion,
  DenunciaFormData,
  Evidence,
  EstadisticasDenunciasResumen
} from '../types/denuncias';
import { historialService, DEFAULT_HISTORIAL_PAGE_SIZE } from '../services/historial';

// Interface genérica para estados de carga
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Hook para categorías
export const useCategorias = (): ApiState<Categoria[]> => {
  const [data, setData] = useState<Categoria[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const categorias = await denunciasService.getCategorias();
      setData(categorias);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      console.error('Error en useCategorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return {
    data,
    loading,
    error,
    refresh: fetchCategorias,
  };
};

// Hook para departamentos municipales
export const useDepartamentos = (): ApiState<DepartamentoMunicipal[]> => {
  const [data, setData] = useState<DepartamentoMunicipal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartamentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const departamentos = await denunciasService.getDepartamentos();
      setData(departamentos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar departamentos');
      console.error('Error en useDepartamentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartamentos();
  }, [fetchDepartamentos]);

  return {
    data,
    loading,
    error,
    refresh: fetchDepartamentos,
  };
};

// Hook para juntas vecinales
export const useJuntasVecinales = (): ApiState<JuntaVecinal[]> => {
  const [data, setData] = useState<JuntaVecinal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJuntasVecinales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const juntas = await denunciasService.getJuntasVecinales();
      setData(juntas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar juntas vecinales');
      console.error('Error en useJuntasVecinales:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJuntasVecinales();
  }, [fetchJuntasVecinales]);

  return {
    data,
    loading,
    error,
    refresh: fetchJuntasVecinales,
  };
};

// Hook para situaciones
export const useSituaciones = (): ApiState<SituacionPublicacion[]> => {
  const [data, setData] = useState<SituacionPublicacion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSituaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const situaciones = await denunciasService.getSituaciones();
      setData(situaciones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar situaciones');
      console.error('Error en useSituaciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSituaciones();
  }, [fetchSituaciones]);

  return {
    data,
    loading,
    error,
    refresh: fetchSituaciones,
  };
};

// Hook para publicaciones con paginación
export const usePublicaciones = (initialPage: number = 1) => {
  const [data, setData] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPublicaciones = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const response = await denunciasService.getPublicaciones(pageNum);

      if (append) {
        setData(prev => [...prev, ...response.results]);
      } else {
        setData(response.results);
      }

      setTotalCount(response.count);
      setHasMore(!!response.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar publicaciones');
      console.error('Error en usePublicaciones:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPublicaciones(nextPage, true);
    }
  }, [hasMore, loading, page, fetchPublicaciones]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPublicaciones(1, false);
  }, [fetchPublicaciones]);

  useEffect(() => {
    fetchPublicaciones(page);
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    refreshing,
    totalCount,
    loadMore,
    refresh,
  };
};

// Hook para obtener una publicación específica
export const usePublicacion = (id: number | null) => {
  const [data, setData] = useState<Publicacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicacion = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const publicacion = await denunciasService.getPublicacionById(id);
      setData(publicacion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la publicación');
      console.error('Error en usePublicacion:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPublicacion();
  }, [fetchPublicacion]);

  return {
    data,
    loading,
    error,
    refresh: fetchPublicacion,
  };
};

// Hook para crear publicaciones
export const useCreatePublicacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPublicacion = useCallback(async (
    formData: DenunciaFormData,
    evidencias: Evidence[] = []
  ): Promise<Publicacion | null> => {
    try {
      setLoading(true);
      setError(null);

      const nuevaPublicacion = await denunciasService.crearPublicacionCompleta(formData, evidencias);
      console.log('✅ Publicación creada exitosamente:', nuevaPublicacion.id);
      return nuevaPublicacion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la publicación';
      setError(errorMessage);
      console.error('Error en useCreatePublicacion:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPublicacion,
    loading,
    error,
  };
};

// Hook para estadísticas
export const useEstadisticas = (options?: { historialLimit?: number; pagina?: number }) => {
  const [data, setData] = useState<EstadisticasDenunciasResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const historialLimit = options?.historialLimit;
  const historialPagina = options?.pagina ?? 1;

  const fetchEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const mapHistorialToResumen = (histStats: any): EstadisticasDenunciasResumen => ({
        total: histStats.totalDenuncias,
        activas: (histStats.pendientes ?? 0) + (histStats.enProceso ?? 0),
        resueltas: histStats.resueltas,
        enProceso: histStats.enProceso,
        pendientes: histStats.pendientes,
        rechazadas: histStats.rechazadas,
        cerradas: histStats.cerradas,
        ultimaActualizacion: new Date().toISOString()
      });

      // Si se pide usar un límite específico, calcular directo desde historial con ese tope
      if (typeof historialLimit === 'number') {
        const histStats = await historialService.obtenerEstadisticas({
          limite: historialLimit,
          pagina: historialPagina
        });
        setData(mapHistorialToResumen(histStats));
        return;
      }

      let estadisticas = await denunciasService.getEstadisticas();

      const isEmpty =
        !estadisticas ||
        [
          estadisticas.total,
          estadisticas.resueltas,
          estadisticas.enProceso,
          estadisticas.pendientes,
          estadisticas.rechazadas,
          estadisticas.cerradas
        ].every((n) => (n ?? 0) === 0);

      // Fallback: si el endpoint de resumen no entrega datos, calcular desde el historial limitado
      if (isEmpty) {
        try {
          const histStats = await historialService.obtenerEstadisticas({
            limite: DEFAULT_HISTORIAL_PAGE_SIZE,
            pagina: 1
          });
          estadisticas = mapHistorialToResumen(histStats);
        } catch (fallbackErr) {
          console.warn('Fallback de estadísticas desde historial falló:', fallbackErr);
        }
      }

      setData(estadisticas);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadisticas';
      setError(message);
      setData(null);
      console.error('Error en useEstadisticas:', err);
    } finally {
      setLoading(false);
    }
  }, [historialLimit, historialPagina]);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return {
    data,
    loading,
    error,
    refresh: fetchEstadisticas,
  };
};

// Hook para probar la conexión con la API
export const useConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);

  const testConnection = useCallback(async () => {
    setTesting(true);
    try {
      // Intentar obtener categorías como test de conexión
      await denunciasService.getCategorias();
      setIsConnected(true);
      console.log('✅ Conexión con API exitosa');
    } catch (error) {
      setIsConnected(false);
      console.error('❌ Error de conexión con API:', error);
    } finally {
      setTesting(false);
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return {
    isConnected,
    testing,
    testConnection
  };
};

// Hook combinado para cargar todos los datos maestros
export const useMasterData = () => {
  const categorias = useCategorias();
  const departamentos = useDepartamentos();
  const juntasVecinales = useJuntasVecinales();
  const situaciones = useSituaciones();

  const loading = categorias.loading || departamentos.loading || juntasVecinales.loading || situaciones.loading;
  const error = categorias.error || departamentos.error || juntasVecinales.error || situaciones.error;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      categorias.refresh(),
      departamentos.refresh(),
      juntasVecinales.refresh(),
      situaciones.refresh(),
    ]);
  }, [categorias.refresh, departamentos.refresh, juntasVecinales.refresh, situaciones.refresh]);

  return {
    categorias: categorias.data || [],
    departamentos: departamentos.data || [],
    juntasVecinales: juntasVecinales.data || [],
    situaciones: situaciones.data || [],
    loading,
    error,
    refreshAll,
  };
};

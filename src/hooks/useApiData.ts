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
  Evidence
} from '../types/denuncias';

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
export const useEstadisticas = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const estadisticas = await denunciasService.getEstadisticas();
      setData(estadisticas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      console.error('Error en useEstadisticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
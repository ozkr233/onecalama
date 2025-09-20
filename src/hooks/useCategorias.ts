// src/hooks/useApiData.ts - HOOK useCategorias MEJORADO

export const useCategorias = (): ApiState<Categoria[]> => {
  const [data, setData] = useState<Categoria[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'offline'>('unknown');

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando carga de categorías...');
      
      // Intento de carga desde el backend
      const categorias = await denunciasService.getCategorias();
      
      if (categorias && categorias.length > 0) {
        setData(categorias);
        setConnectionStatus('connected');
        console.log(`✅ ${categorias.length} categorías cargadas exitosamente`);
        
        // Log de las categorías para debug
        categorias.forEach(cat => {
          console.log(`📋 Categoría: ${cat.nombre} (ID: ${cat.id}) - Depto: ${cat.departamento.nombre}`);
        });
      } else {
        throw new Error('No se recibieron categorías del servidor');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar categorías';
      setError(errorMessage);
      setConnectionStatus('offline');
      
      console.error('❌ Error en useCategorias:', {
        error: errorMessage,
        details: err
      });
      
      // Si hay error, mostrar notificación al usuario
      console.warn('⚠️ Trabajando con datos de respaldo por error de conexión');
      
    } finally {
      setLoading(false);
    }
  }, []);

  // Reintento automático
  const retryFetch = useCallback(async () => {
    console.log('🔄 Reintentando carga de categorías...');
    await fetchCategorias();
  }, [fetchCategorias]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return {
    data,
    loading,
    error,
    connectionStatus, // Estado adicional
    refresh: fetchCategorias,
    retry: retryFetch, // Método adicional
  };
};

// HOOK COMBINADO PARA FORMULARIO (con todas las dependencias)
export const useFormData = () => {
  const categorias = useCategorias();
  const departamentos = useDepartamentos();
  const juntasVecinales = useJuntasVecinales();

  const isFormDataReady = !categorias.loading && 
                         !departamentos.loading && 
                         !juntasVecinales.loading &&
                         categorias.data && 
                         departamentos.data;

  const hasErrors = categorias.error || departamentos.error || juntasVecinales.error;

  const refreshAll = useCallback(async () => {
    console.log('🔄 Refrescando todos los datos del formulario...');
    await Promise.all([
      categorias.refresh(),
      departamentos.refresh(),
      juntasVecinales.refresh(),
    ]);
  }, [categorias.refresh, departamentos.refresh, juntasVecinales.refresh]);

  return {
    categorias: categorias.data || [],
    departamentos: departamentos.data || [],
    juntasVecinales: juntasVecinales.data || [],
    loading: categorias.loading || departamentos.loading || juntasVecinales.loading,
    isReady: isFormDataReady,
    error: hasErrors,
    connectionStatus: categorias.connectionStatus,
    refreshAll,
    retryAll: refreshAll,
  };
};
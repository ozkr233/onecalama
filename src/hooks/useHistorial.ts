// src/hooks/useHistorial.ts - HOOK DESDE CERO
import { useState, useEffect, useCallback } from 'react';
import {
  HistorialDenuncia,
  EstadisticasHistorial,
  FiltrosHistorial
} from '../types/historial';
import { historialService } from '../services/historial';

interface UseHistorialReturn {
  // Estado principal
  denuncias: HistorialDenuncia[];
  estadisticas: EstadisticasHistorial | null;
  loading: boolean;
  error: string | null;
  filtros: FiltrosHistorial;
  
  // Estados auxiliares
  isRefreshing: boolean;
  isBackendConnected: boolean;
  notificacionesNoLeidas: number;
  
  // Datos calculados
  totalDenuncias: number;
  denunciasPendientes: number;
  denunciasResueltas: number;
  hayDatos: boolean;
  hayError: boolean;
  hayFiltrosActivos: boolean;
  
  // Acciones
  cargarHistorial: () => Promise<void>;
  cargarEstadisticas: () => Promise<void>;
  aplicarFiltros: (filtros: FiltrosHistorial) => void;
  limpiarFiltros: () => void;
  marcarRespuestaComoLeida: (respuestaId: string) => Promise<void>;
  calificarSatisfaccion: (denunciaId: string, calificacion: 1 | 2 | 3 | 4 | 5, comentario?: string) => Promise<void>;
  obtenerDenunciaPorId: (id: string) => Promise<HistorialDenuncia | null>;
  refresh: () => Promise<void>;
  recargarCompleto: () => Promise<void>;
}

export function useHistorial(): UseHistorialReturn {
  // Estados principales
  const [denuncias, setDenuncias] = useState<HistorialDenuncia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasHistorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosHistorial>({});
  
  // Estados auxiliares
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  // Cargar historial
  const cargarHistorial = useCallback(async () => {
    try {
      console.log('🔄 [HOOK] Cargando historial...');
      
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);

      // Verificar conectividad
      const conectado = await historialService.verificarConexion();
      setIsBackendConnected(conectado);

      if (!conectado) {
        throw new Error('Sin conexión al servidor');
      }

      // Cargar datos
      const historialData = await historialService.obtenerHistorial(filtros);
      setDenuncias(historialData);
      
      // Calcular notificaciones no leídas
      const noLeidas = historialData.reduce((total, denuncia) => {
        const respuestasNoLeidas = denuncia.respuestas.filter(r => !r.leida).length;
        return total + respuestasNoLeidas;
      }, 0);
      setNotificacionesNoLeidas(noLeidas);

      console.log(`✅ [HOOK] ${historialData.length} denuncias cargadas, ${noLeidas} respuestas no leídas`);
      
    } catch (err: any) {
      console.error('❌ [HOOK] Error cargando historial:', err.message);
      setError(err.message);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filtros, isRefreshing]);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      console.log('📊 [HOOK] Cargando estadísticas...');
      
      const estadisticasData = await historialService.obtenerEstadisticas();
      setEstadisticas(estadisticasData);
      
      console.log('✅ [HOOK] Estadísticas cargadas');
      
    } catch (err: any) {
      console.error('❌ [HOOK] Error cargando estadísticas:', err.message);
      
      // En caso de error, usar estadísticas vacías
      if (!estadisticas) {
        setEstadisticas({
          totalDenuncias: 0,
          resueltas: 0,
          pendientes: 0,
          enProceso: 0,
          rechazadas: 0,
          cerradas: 0,
          tiempoPromedioRespuesta: 0,
          satisfaccionPromedio: 0,
          porcentajeResolucion: 0,
          denunciasPorCategoria: {},
          denunciasPorMes: {},
          tendencia: 'sin_datos'
        });
      }
    }
  }, [estadisticas]);

  // Aplicar filtros
  const aplicarFiltros = useCallback((nuevosFiltros: FiltrosHistorial) => {
    console.log('🔍 [HOOK] Aplicando filtros:', nuevosFiltros);
    setFiltros(nuevosFiltros);
  }, []);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    console.log('🧹 [HOOK] Limpiando filtros');
    setFiltros({});
  }, []);

  // Marcar respuesta como leída
  const marcarRespuestaComoLeida = useCallback(async (respuestaId: string) => {
    try {
      console.log('📖 [HOOK] Marcando respuesta como leída:', respuestaId);
      
      await historialService.marcarRespuestaLeida(respuestaId);
      
      // Actualizar estado local
      setDenuncias(prev => prev.map(denuncia => ({
        ...denuncia,
        respuestas: denuncia.respuestas.map(respuesta =>
          respuesta.id === respuestaId
            ? { ...respuesta, leida: true }
            : respuesta
        )
      })));

      // Actualizar contador de notificaciones
      setNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
      
      console.log('✅ [HOOK] Respuesta marcada como leída');
      
    } catch (err: any) {
      console.error('❌ [HOOK] Error marcando respuesta:', err.message);
      // No lanzar error - operación no crítica
    }
  }, []);

  // Calificar satisfacción
  const calificarSatisfaccion = useCallback(async (
    denunciaId: string,
    calificacion: 1 | 2 | 3 | 4 | 5,
    comentario?: string
  ) => {
    try {
      console.log('⭐ [HOOK] Enviando calificación:', { denunciaId, calificacion });
      
      await historialService.calificarSatisfaccion(denunciaId, calificacion, comentario);
      
      // Actualizar estado local
      setDenuncias(prev => prev.map(denuncia =>
        denuncia.id === denunciaId 
          ? { 
              ...denuncia, 
              satisfaccionCiudadano: calificacion,
              comentarioSatisfaccion: comentario
            }
          : denuncia
      ));
      
      console.log('✅ [HOOK] Calificación enviada');
      
    } catch (err: any) {
      console.error('❌ [HOOK] Error enviando calificación:', err.message);
      throw err;
    }
  }, []);

  // Obtener denuncia por ID
  const obtenerDenunciaPorId = useCallback(async (id: string): Promise<HistorialDenuncia | null> => {
    try {
      console.log('🔎 [HOOK] Obteniendo denuncia por ID:', id);
      
      // Buscar primero en estado local
      const denunciaLocal = denuncias.find(d => d.id === id);
      if (denunciaLocal) {
        console.log('✅ [HOOK] Denuncia encontrada en estado local');
        return denunciaLocal;
      }
      
      // Si no está local, buscar en backend
      const denunciaBackend = await historialService.obtenerDenunciaPorId(id);
      
      if (denunciaBackend) {
        console.log('✅ [HOOK] Denuncia obtenida del backend');
        return denunciaBackend;
      }
      
      console.log('⚠️ [HOOK] Denuncia no encontrada');
      return null;
      
    } catch (err: any) {
      console.error('❌ [HOOK] Error obteniendo denuncia:', err.message);
      return null;
    }
  }, [denuncias]);

  // Refresh (pull to refresh)
  const refresh = useCallback(async () => {
    console.log('🔄 [HOOK] Refrescando datos...');
    setIsRefreshing(true);
    
    await Promise.all([
      cargarHistorial(),
      cargarEstadisticas()
    ]);
    
    console.log('✅ [HOOK] Refresh completado');
  }, [cargarHistorial, cargarEstadisticas]);

  // Recarga completa (para recuperarse de errores)
  const recargarCompleto = useCallback(async () => {
    console.log('🔄 [HOOK] Recarga completa...');
    
    setLoading(true);
    setError(null);
    setIsRefreshing(false);
    
    try {
      await Promise.all([
        cargarHistorial(),
        cargarEstadisticas()
      ]);
    } catch (err: any) {
      console.error('❌ [HOOK] Error en recarga completa:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cargarHistorial, cargarEstadisticas]);

  // Efectos
  useEffect(() => {
    console.log('🚀 [HOOK] Inicializando useHistorial...');
    cargarHistorial();
    cargarEstadisticas();
  }, []); // Solo al montar

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (Object.keys(filtros).length > 0) {
      console.log('🔍 [HOOK] Filtros cambiaron, recargando...');
      cargarHistorial();
    }
  }, [filtros, cargarHistorial]);

  // Datos calculados
  const totalDenuncias = denuncias.length;
  const denunciasPendientes = denuncias.filter(d => d.estado === 'pendiente').length;
  const denunciasResueltas = denuncias.filter(d => d.estado === 'resuelto').length;
  const hayDatos = totalDenuncias > 0;
  const hayError = !!error;
  const hayFiltrosActivos = Object.keys(filtros).some(key => {
    const value = filtros[key as keyof FiltrosHistorial];
    return Array.isArray(value) ? value.length > 0 : !!value;
  });

  return {
    // Estado principal
    denuncias,
    estadisticas,
    loading,
    error,
    filtros,
    
    // Estados auxiliares
    isRefreshing,
    isBackendConnected,
    notificacionesNoLeidas,
    
    // Datos calculados
    totalDenuncias,
    denunciasPendientes,
    denunciasResueltas,
    hayDatos,
    hayError,
    hayFiltrosActivos,
    
    // Acciones
    cargarHistorial,
    cargarEstadisticas,
    aplicarFiltros,
    limpiarFiltros,
    marcarRespuestaComoLeida,
    calificarSatisfaccion,
    obtenerDenunciaPorId,
    refresh,
    recargarCompleto
  };
}
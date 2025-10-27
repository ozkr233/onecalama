// src/services/respuestasMunicipales.ts
import { apiService } from './api';
import { ENDPOINTS } from '../constants/api';

// Tipos para respuestas municipales
export interface RespuestaMunicipalAPI {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    rut: string;
    email?: string;
  };
  publicacion: {
    id: number;
    codigo: string;
    titulo: string;
    categoria: {
      id: number;
      nombre: string;
    };
    departamento: {
      id: number;
      nombre: string;
    };
  };
  fecha: string;
  descripcion: string;
  acciones: string;
  situacion_inicial: string;
  situacion_posterior: string;
  puntuacion?: number; // 1-5 estrellas si el usuario calificó
  evidencias?: Array<{
    id: number;
    archivo: string;
    fecha: string;
    extension: string;
  }>;
}

export interface RespuestaMunicipalFormateada {
  id: number;
  funcionarioNombre: string;
  funcionarioEmail?: string;
  publicacion: {
    id: number;
    codigo: string;
    titulo: string;
    categoria: string;
    departamento: string;
  };
  fechaRespuesta: string;
  descripcion: string;
  acciones: string;
  situacionAnterior: string;
  situacionNueva: string;
  puntuacion?: number;
  evidencias: Array<{
    id: number;
    url: string;
    fecha: string;
    tipo: string;
  }>;
}

class RespuestasMunicipalesService {
  
  /**
   * Obtener todas las respuestas municipales
   */
  async obtenerRespuestas(): Promise<RespuestaMunicipalFormateada[]> {
    try {
      console.log('🔄 [RESPUESTAS] Obteniendo respuestas municipales...');
      
      const response = await apiService.get<{ results: RespuestaMunicipalAPI[] }>(
        ENDPOINTS.RESPUESTAS_MUNICIPALES, 
        true
      );

      const respuestas = response.results || response as any || [];
      console.log('✅ [RESPUESTAS] Respuestas obtenidas:', respuestas.length);

      return respuestas.map(this.formatearRespuesta);
    } catch (error) {
      console.error('❌ [RESPUESTAS] Error obteniendo respuestas:', error);
      throw new Error('Error al cargar las respuestas municipales');
    }
  }

  /**
   * Obtener respuestas para una publicación específica
   */
  async obtenerRespuestasPorPublicacion(publicacionId: number): Promise<RespuestaMunicipalFormateada[]> {
    try {
      console.log('🔄 [RESPUESTAS] Obteniendo respuestas para publicación:', publicacionId);
      
      const url = ENDPOINTS.RESPUESTAS_MUNICIPALES_POR_PUBLICACION(publicacionId);
      const response = await apiService.get<RespuestaMunicipalAPI[] | { results: RespuestaMunicipalAPI[] }>(url, true);

      const respuestas = Array.isArray(response)
        ? response
        : response?.results || [];
      console.log('✅ [RESPUESTAS] Respuestas encontradas:', respuestas.length);

      const formateadas = respuestas.map(this.formatearRespuesta);

      // Fallback: si alguna respuesta no trae evidencias, intentar cargarlas por endpoint dedicado
      const completadas = await Promise.all(
        formateadas.map(async (item) => {
          if (item.evidencias && item.evidencias.length > 0) return item;
          try {
            // Endpoint real: router.register('evidencia-respuesta', ...)
            let res: any = await apiService.get(`/evidencia-respuesta/?respuesta=${item.id}`, true);
            let evs = (res?.results ?? res ?? []) as any[];

            // Si no hay resultados, intentar con "respuesta_id" como alternativa de filtro
            if (!Array.isArray(evs) ? !(evs?.length > 0) : evs.length === 0) {
              try {
                res = await apiService.get(`/evidencia-respuesta/?respuesta_id=${item.id}`, true);
                evs = (res?.results ?? res ?? []) as any[];
              } catch {}
            }

            const evidenciasMap = (Array.isArray(evs) ? evs : []).map((ev: any) => ({
              id: ev.id,
              url: ev.archivo,
              fecha: ev.fecha,
              tipo: ev.extension,
            }));

            console.log('📎 [RESPUESTAS] Evidencias para respuesta', item.id, ':', evidenciasMap.length);
            return { ...item, evidencias: evidenciasMap } as RespuestaMunicipalFormateada;
          } catch (e) {
            console.warn('⚠️ [RESPUESTAS] No se pudieron cargar evidencias de respuesta', item.id, e);
            return item;
          }
        })
      );

      return completadas;
    } catch (error) {
      console.error('❌ [RESPUESTAS] Error obteniendo respuestas por publicación:', error);
      throw new Error('Error al cargar las respuestas de esta publicación');
    }
  }

  /**
   * Obtener una respuesta específica por ID
   */
  async obtenerRespuestaPorId(id: number): Promise<RespuestaMunicipalFormateada | null> {
    try {
      console.log('🔄 [RESPUESTAS] Obteniendo respuesta ID:', id);
      
      const response = await apiService.get<RespuestaMunicipalAPI>(
        `${ENDPOINTS.RESPUESTAS_MUNICIPALES}${id}/`, 
        true
      );

      if (!response) {
        console.log('⚠️ [RESPUESTAS] Respuesta no encontrada');
        return null;
      }

      console.log('✅ [RESPUESTAS] Respuesta obtenida');
      return this.formatearRespuesta(response);
    } catch (error) {
      console.error('❌ [RESPUESTAS] Error obteniendo respuesta por ID:', error);
      if (error.message?.includes('404')) {
        return null;
      }
      throw new Error('Error al cargar la respuesta municipal');
    }
  }

  /**
   * Calificar una respuesta municipal
   */
  async calificarRespuesta(respuestaId: number, puntuacion: 1 | 2 | 3 | 4 | 5): Promise<void> {
    try {
      console.log('🔄 [RESPUESTAS] Calificando respuesta:', respuestaId, 'Puntuación:', puntuacion);
      
      const url = `${ENDPOINTS.RESPUESTA_DETALLE(respuestaId)}puntuar/`;
      await apiService.patch(url, { puntuacion }, true);

      console.log('✅ [RESPUESTAS] Respuesta calificada exitosamente');
    } catch (error) {
      console.error('❌ [RESPUESTAS] Error calificando respuesta:', error);
      throw new Error('Error al calificar la respuesta');
    }
  }

  /**
   * Formatear respuesta del API al formato de la app
   */
  private formatearRespuesta(respuesta: RespuestaMunicipalAPI): RespuestaMunicipalFormateada {
    return {
      id: respuesta.id,
      funcionarioNombre: respuesta.usuario.nombre,
      funcionarioEmail: respuesta.usuario.email,
      publicacion: {
        id: respuesta.publicacion.id,
        codigo: respuesta.publicacion.codigo,
        titulo: respuesta.publicacion.titulo,
        categoria: respuesta.publicacion.categoria.nombre,
        departamento: respuesta.publicacion.departamento.nombre,
      },
      fechaRespuesta: respuesta.fecha,
      descripcion: respuesta.descripcion,
      acciones: respuesta.acciones,
      situacionAnterior: respuesta.situacion_inicial,
      situacionNueva: respuesta.situacion_posterior,
      puntuacion: respuesta.puntuacion,
      evidencias: (respuesta.evidencias || []).map((evidencia: any) => ({
        id: evidencia.id,
        url: (evidencia.archivo || evidencia.url),
        fecha: evidencia.fecha,
        tipo: evidencia.extension,
      })),
    };
  }

  /**
   * Obtener estadísticas de respuestas
   */
  async obtenerEstadisticas(): Promise<{
    totalRespuestas: number;
    puntuacionPromedio: number;
    distribucionPuntuaciones: Record<string, number>;
  }> {
    try {
      console.log('🔄 [RESPUESTAS] Obteniendo estadísticas...');
      
      // Usar endpoint de estadísticas si existe
      const response : any = await apiService.get('/estadisticas-respuestas/', true);
      
      return {
        totalRespuestas: response.total_respuestas_puntuadas || 0,
        puntuacionPromedio: response.puntuacion_promedio || 0,
        distribucionPuntuaciones: response.distribucion_puntuaciones || {},
      };
    } catch (error) {
      console.error('❌ [RESPUESTAS] Error obteniendo estadísticas:', error);
      // Devolver estadísticas vacías si no hay endpoint
      return {
        totalRespuestas: 0,
        puntuacionPromedio: 0,
        distribucionPuntuaciones: {},
      };
    }
  }
}

export const respuestasMunicipalesService = new RespuestasMunicipalesService();


// src/services/historial.ts
import api from './api';
import { HistorialDenuncia, FiltrosHistorial, EstadisticasHistorial, Respuesta } from '../types/historial';

export class HistorialService {
  /**
   * Obtiene el historial de denuncias del usuario
   */
  static async obtenerHistorial(filtros?: FiltrosHistorial): Promise<HistorialDenuncia[]> {
    try {
      const params = new URLSearchParams();

      if (filtros?.estado?.length) {
        params.append('estado', filtros.estado.join(','));
      }
      if (filtros?.categoria?.length) {
        params.append('categoria', filtros.categoria.join(','));
      }
      if (filtros?.fechaDesde) {
        params.append('fecha_desde', filtros.fechaDesde);
      }
      if (filtros?.fechaHasta) {
        params.append('fecha_hasta', filtros.fechaHasta);
      }
      if (filtros?.busqueda) {
        params.append('busqueda', filtros.busqueda);
      }

      const response : any = await api.get(`/historial/denuncias?${params.toString()}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw new Error('No se pudo cargar el historial de denuncias');
    }
  }

  /**
   * Obtiene una denuncia específica con todas sus respuestas
   */
  static async obtenerDenunciaPorId(id: string): Promise<HistorialDenuncia> {
    try {
      const response:any = await api.get(`/historial/denuncias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener denuncia:', error);
      throw new Error('No se pudo cargar los detalles de la denuncia');
    }
  }

  /**
   * Obtiene las respuestas de una denuncia específica
   */
  static async obtenerRespuestasDenuncia(denunciaId: string): Promise<Respuesta[]> {
    try {
      const response:any = await api.get(`/historial/denuncias/${denunciaId}/respuestas`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
      throw new Error('No se pudieron cargar las respuestas');
    }
  }

  /**
   * Marca una respuesta como leída
   */
  static async marcarRespuestaComoLeida(respuestaId: string): Promise<void> {
    try {
      await api.patch(`/historial/respuestas/${respuestaId}/leida`);
    } catch (error) {
      console.error('Error al marcar respuesta como leída:', error);
    }
  }

  /**
   * Califica la satisfacción con una respuesta
   */
  static async calificarSatisfaccion(
    denunciaId: string,
    calificacion: 1 | 2 | 3 | 4 | 5,
    comentario?: string
  ): Promise<void> {
    try {
      await api.post(`/historial/denuncias/${denunciaId}/satisfaccion`, {
        calificacion,
        comentario
      });
    } catch (error) {
      console.error('Error al calificar satisfacción:', error);
      throw new Error('No se pudo enviar la calificación');
    }
  }

  /**
   * Obtiene estadísticas del historial
   */
  static async obtenerEstadisticas(): Promise<EstadisticasHistorial> {
    try {
      const response:any = await api.get('/historial/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalDenuncias: 0,
        resueltas: 0,
        pendientes: 0,
        enProceso: 0,
        tiempoPromedioRespuesta: 0,
        satisfaccionPromedio: 0
      };
    }
  }

  /**
   * Descarga una evidencia
   */
  static async descargarEvidencia(evidenciaId: string): Promise<string> {
    try {
      const response :any= await api.get(`/historial/evidencias/${evidenciaId}/download`, {
        responseType: 'blob'
      });
      // En una app real, esto devolvería la URL o el blob para mostrar/descargar
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Error al descargar evidencia:', error);
      throw new Error('No se pudo descargar la evidencia');
    }
  }

  /**
   * Obtiene notificaciones de respuestas no leídas
   */
  static async obtenerNotificacionesNoLeidas(): Promise<number> {
    try {
      const response : any = await api.get('/historial/notificaciones/no-leidas');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return 0;
    }
  }
}
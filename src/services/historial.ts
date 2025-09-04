// src/services/historial.ts - BASADO EN TU CÓDIGO FUNCIONAL ANTERIOR
import { HistorialDenuncia, FiltrosHistorial, EstadisticasHistorial } from '../types/historial';
import { apiService } from './api';
import AuthHelper from '../utils/authHelper';

class HistorialService {
  
  /**
   * Obtener historial usando el parámetro ?usuario=${userId} como en tu código anterior
   */
  async obtenerHistorial(filtros?: FiltrosHistorial): Promise<HistorialDenuncia[]> {
    try {
      console.log('🔄 [HISTORIAL] Iniciando obtención de historial...');
      
      // 1. Obtener ID del usuario actual
      const usuarioId = await this.obtenerUsuarioId();
      console.log('👤 [HISTORIAL] Usuario ID obtenido:', usuarioId);
      
      // 2. Construir URL con parámetro usuario como en tu código anterior
      const params = new URLSearchParams();
      params.append('usuario', usuarioId.toString());
      
      // Agregar filtros adicionales si existen
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
      
      // 3. Hacer petición con el filtro de usuario
      const url = `/publicaciones/?${params.toString()}`;
      console.log('🔍 [HISTORIAL] URL construida:', url);
      
      const response = await apiService.get(url, true);
      console.log('📡 [HISTORIAL] Respuesta recibida:', {
        hasResults: !!response.results,
        resultsLength: response.results?.length || 0,
        isArray: Array.isArray(response),
        arrayLength: Array.isArray(response) ? response.length : 0,
        totalCount: response.count
      });
      
      // 4. Extraer publicaciones (usar .results como en tu código anterior)
      const publicaciones = response.results || response || [];
      console.log('📋 [HISTORIAL] Publicaciones del usuario obtenidas:', publicaciones.length);
      
      // 5. Debug: Mostrar estructura de primera publicación
      if (publicaciones.length > 0) {
        console.log('🔍 [HISTORIAL] Estructura de primera publicación:', {
          id: publicaciones[0].id,
          codigo: publicaciones[0].codigo,
          titulo: publicaciones[0].titulo?.substring(0, 30),
          usuario: publicaciones[0].usuario,
          situacion: publicaciones[0].situacion,
          categoria: publicaciones[0].categoria,
          keys: Object.keys(publicaciones[0])
        });
      }
      
      // 6. Transformar al formato de historial
      const historial = publicaciones.map((pub: any) => this.transformarAHistorial(pub));
      
      // 7. Ordenar por fecha (más recientes primero)
      historial.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
      
      console.log('🎉 [HISTORIAL] Historial procesado exitosamente:', historial.length);
      return historial;
      
    } catch (error: any) {
      console.error('❌ [HISTORIAL] Error obteniendo historial:', error.message);
      throw new Error(`Error al cargar historial: ${error.message}`);
    }
  }

  /**
   * Obtener una denuncia específica por ID
   */
  async obtenerDenunciaPorId(id: string): Promise<HistorialDenuncia | null> {
    try {
      console.log('🔍 [HISTORIAL] Buscando denuncia ID:', id);
      
      const publicacion = await apiService.get(`/publicaciones/${id}/`, true);
      
      if (!publicacion) {
        return null;
      }
      
      return this.transformarAHistorial(publicacion);
      
    } catch (error: any) {
      console.error('❌ [HISTORIAL] Error obteniendo denuncia:', error.message);
      return null;
    }
  }

  /**
   * Obtener estadísticas del historial
   */
  async obtenerEstadisticas(): Promise<EstadisticasHistorial> {
    try {
      console.log('📊 [HISTORIAL] Calculando estadísticas...');
      
      const denuncias = await this.obtenerHistorial();
      const estadisticas = this.calcularEstadisticas(denuncias);
      
      console.log('✅ [HISTORIAL] Estadísticas calculadas');
      return estadisticas;
      
    } catch (error: any) {
      console.error('❌ [HISTORIAL] Error calculando estadísticas:', error.message);
      return this.estadisticasVacias();
    }
  }

  /**
   * Marcar respuesta como leída
   */
  async marcarRespuestaLeida(respuestaId: string): Promise<void> {
    try {
      console.log('📖 [HISTORIAL] Marcando respuesta como leída:', respuestaId);
      
      try {
        await apiService.patch(`/respuestas/${respuestaId}/leida/`, {}, true);
        console.log('✅ [HISTORIAL] Respuesta marcada en backend');
      } catch (error) {
        console.log('⚠️ [HISTORIAL] Backend no soporta marcar respuestas');
      }
      
    } catch (error: any) {
      console.error('❌ [HISTORIAL] Error marcando respuesta:', error.message);
    }
  }

  /**
   * Calificar satisfacción
   */
  async calificarSatisfaccion(
    denunciaId: string, 
    calificacion: 1 | 2 | 3 | 4 | 5, 
    comentario?: string
  ): Promise<void> {
    try {
      console.log('⭐ [HISTORIAL] Enviando calificación:', { denunciaId, calificacion });
      
      await apiService.post(`/publicaciones/${denunciaId}/satisfaccion/`, {
        calificacion,
        comentario
      }, true);
      
      console.log('✅ [HISTORIAL] Calificación enviada exitosamente');
      
    } catch (error: any) {
      console.error('❌ [HISTORIAL] Error enviando calificación:', error.message);
      throw new Error('No se pudo enviar la calificación');
    }
  }

  /**
   * Verificar conectividad con el backend
   */
  async verificarConexion(): Promise<boolean> {
    try {
      await apiService.get('/categorias/', true);
      return true;
    } catch (error) {
      return false;
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Obtener ID del usuario actual - SIMPLIFICADO
   */
  private async obtenerUsuarioId(): Promise<number> {
    console.log('🔍 [HISTORIAL] Obteniendo ID del usuario...');
    
    // Estrategia 1: Desde el perfil cacheado
    try {
      const perfil = await apiService.getProfile();
      if (perfil?.id) {
        console.log('✅ [HISTORIAL] Usuario ID desde perfil:', perfil.id);
        return perfil.id;
      }
    } catch (error) {
      console.log('⚠️ [HISTORIAL] Error obteniendo perfil:', error);
    }

    // Estrategia 2: Desde el token JWT
    try {
      const userInfo = await AuthHelper.getUserInfoFromToken();
      if (userInfo?.userId) {
        console.log('✅ [HISTORIAL] Usuario ID desde token:', userInfo.userId);
        return userInfo.userId;
      }
    } catch (error) {
      console.log('⚠️ [HISTORIAL] Error obteniendo info del token:', error);
    }

    // Estrategia 3: Buscar por RUT en usuarios
    try {
      const userInfo = await AuthHelper.getUserInfoFromToken();
      if (userInfo?.rut) {
        console.log('🔑 [HISTORIAL] Buscando usuario por RUT:', userInfo.rut);
        
        const usuarios = await apiService.get('/usuarios/', true);
        const usuariosList = usuarios.results || usuarios;
        
        const usuario = usuariosList.find((u: any) => u.rut === userInfo.rut);
        if (usuario?.id) {
          console.log('✅ [HISTORIAL] Usuario encontrado por RUT:', usuario.id);
          return usuario.id;
        }
      }
    } catch (error) {
      console.log('⚠️ [HISTORIAL] Error buscando por RUT:', error);
    }

    // Estrategia 4: Fallback para desarrollo (RUT conocido)
    try {
      const userInfo = await AuthHelper.getUserInfoFromToken();
      if (userInfo?.rut === '20123930-5') {
        console.log('🔧 [HISTORIAL] Usando ID de desarrollo para RUT conocido');
        return 1; // El ID que corresponda a este RUT en tu BD
      }
    } catch (error) {
      console.log('⚠️ [HISTORIAL] Error en fallback:', error);
    }

    throw new Error('No se pudo obtener el ID del usuario actual');
  }

  /**
   * Transformar publicación del backend al formato de historial
   * Basado en la estructura que ya conoces: { usuario: { id, nombre }, situacion: { nombre }, ... }
   */
  private transformarAHistorial(publicacion: any): HistorialDenuncia {
    return {
      id: publicacion.id?.toString() || '',
      numeroFolio: publicacion.codigo || `CAL-${publicacion.id}`,
      titulo: publicacion.titulo || 'Sin título',
      descripcion: publicacion.descripcion || 'Sin descripción',
      categoria: publicacion.categoria?.nombre || 'Sin categoría',
      estado: this.mapearEstado(publicacion.situacion?.nombre),
      prioridad: this.mapearPrioridad(publicacion.prioridad || 'media'),
      fechaCreacion: publicacion.fecha_publicacion || new Date().toISOString(),
      fechaActualizacion: publicacion.fecha_actualizacion || publicacion.fecha_publicacion,
      fechaResolucion: publicacion.fecha_resolucion || null,
      ubicacion: {
        direccion: publicacion.ubicacion || publicacion.direccion || '',
        coordenadas: this.extraerCoordenadas(publicacion),
        referencias: publicacion.referencias || ''
      },
      evidencias: this.transformarEvidencias(publicacion.evidencias || []),
      respuestas: this.transformarRespuestas(publicacion.respuestas || []),
      satisfaccionCiudadano: publicacion.satisfaccion_ciudadano || null,
      comentarioSatisfaccion: publicacion.comentario_satisfaccion || null,
      departamentoAsignado: publicacion.departamento?.nombre || publicacion.categoria?.departamento?.nombre || null,
      tiempoRespuesta: this.calcularTiempoRespuesta(
        publicacion.fecha_publicacion,
        publicacion.fecha_primera_respuesta
      )
    };
  }

  /**
   * Mapear estado del backend al formato de la app
   * Basado en los estados que vi en tu código: "recibido", "en curso", "resuelto", "pendiente", "no resuelto"
   */
  private mapearEstado(estado: string): HistorialDenuncia['estado'] {
    if (!estado) return 'pendiente';
    
    const estadoLower = estado.toLowerCase();
    
    if (estadoLower.includes('resuelto') && !estadoLower.includes('no')) return 'resuelto';
    if (estadoLower.includes('en curso') || estadoLower.includes('proceso')) return 'en_proceso';
    if (estadoLower.includes('pendiente') || estadoLower.includes('recibido')) return 'pendiente';
    if (estadoLower.includes('no resuelto') || estadoLower.includes('rechazado')) return 'rechazado';
    if (estadoLower.includes('cerrado')) return 'cerrado';
    
    return 'pendiente';
  }

  /**
   * Mapear prioridad del backend al formato de la app
   * TEMPORAL: Como el backend aún no tiene prioridades, devolver 'sin_priorizar'
   */
  private mapearPrioridad(prioridad: string): HistorialDenuncia['prioridad'] {
    // Mientras el backend no tenga prioridades implementadas
    if (!prioridad) return 'sin_priorizar';
    
    const prioridadLower = prioridad.toLowerCase();
    
    if (prioridadLower.includes('baja')) return 'baja';
    if (prioridadLower.includes('alta') || prioridadLower.includes('critica') || prioridadLower.includes('urgente')) return 'alta';
    if (prioridadLower.includes('media') || prioridadLower.includes('normal')) return 'media';
    
    // Por defecto, sin priorizar hasta que se implemente en backend
    return 'sin_priorizar';
  }

  /**
   * Extraer coordenadas de la publicación
   */
  private extraerCoordenadas(publicacion: any): { lat: number; lng: number } | null {
    const lat = publicacion.latitud || publicacion.lat;
    const lng = publicacion.longitud || publicacion.lng || publicacion.lon;
    
    if (lat != null && lng != null) {
      return {
        lat: typeof lat === 'string' ? parseFloat(lat) : lat,
        lng: typeof lng === 'string' ? parseFloat(lng) : lng
      };
    }
    
    return null;
  }

  /**
   * Transformar evidencias del backend - MEJORADO PARA CLOUDINARY
   */
  private transformarEvidencias(evidencias: any[]): any[] {
    return evidencias.map(evidencia => {
      const archivo = evidencia.archivo || evidencia.url || '';
      const urlCompleta = this.construirUrlCloudinary(archivo);
      
      return {
        id: evidencia.id?.toString() || '',
        tipo: this.determinarTipoEvidencia(archivo),
        url: urlCompleta,
        nombre: evidencia.nombre || this.extraerNombreArchivo(archivo),
        fechaSubida: evidencia.fecha_subida || evidencia.fecha_creacion || evidencia.fecha || new Date().toISOString(),
        descripcion: evidencia.descripcion || '',
        size: evidencia.size || 0,
        mimeType: evidencia.mime_type || evidencia.content_type || this.determinarMimeType(archivo)
      };
    });
  }

  /**
   * Construir URL completa de Cloudinary
   */
  private construirUrlCloudinary(imagePath: string): string {
    if (!imagePath) return '';
    
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si es una ruta relativa, construir la URL completa de Cloudinary
    const cloudinaryBase = 'https://res.cloudinary.com/de06451wd';
    
    // Limpiar la ruta (remover slash inicial si existe)
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    return `${cloudinaryBase}/${cleanPath}`;
  }

  /**
   * Determinar MIME type basado en la extensión
   */
  private determinarMimeType(url: string): string {
    if (!url) return 'application/octet-stream';
    
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'webm': 'video/webm',
      '3gp': 'video/3gpp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Transformar respuestas municipales
   */
  private transformarRespuestas(respuestas: any[]): any[] {
    return respuestas.map(respuesta => ({
      id: respuesta.id?.toString() || '',
      autor: respuesta.autor || respuesta.autor_nombre || 'Municipalidad',
      mensaje: respuesta.mensaje || respuesta.contenido || respuesta.texto || '',
      fechaRespuesta: respuesta.fecha_respuesta || respuesta.fecha_creacion || new Date().toISOString(),
      tipo: respuesta.tipo || 'respuesta',
      esOficial: true,
      leida: respuesta.leida || false,
      evidencias: this.transformarEvidencias(respuesta.evidencias || [])
    }));
  }

  /**
   * Determinar tipo de evidencia por extensión
   */
  private determinarTipoEvidencia(url: string): 'imagen' | 'video' | 'documento' {
    if (!url) return 'documento';
    
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'imagen';
    }
    
    if (['mp4', 'mov', 'avi', 'webm', '3gp'].includes(extension)) {
      return 'video';
    }
    
    return 'documento';
  }

  /**
   * Extraer nombre de archivo de URL
   */
  private extraerNombreArchivo(url: string): string {
    if (!url) return 'archivo';
    
    try {
      const segments = url.split('/');
      const filename = segments[segments.length - 1];
      return filename.split('?')[0] || 'archivo';
    } catch {
      return 'archivo';
    }
  }

  /**
   * Calcular tiempo de respuesta en días
   */
  private calcularTiempoRespuesta(fechaCreacion: string, fechaRespuesta?: string): number | null {
    if (!fechaRespuesta) return null;
    
    try {
      const creacion = new Date(fechaCreacion);
      const respuesta = new Date(fechaRespuesta);
      const diferencia = respuesta.getTime() - creacion.getTime();
      const dias = diferencia / (1000 * 60 * 60 * 24);
      return Math.round(dias * 10) / 10;
    } catch {
      return null;
    }
  }

  /**
   * Calcular estadísticas desde las denuncias
   */
  private calcularEstadisticas(denuncias: HistorialDenuncia[]): EstadisticasHistorial {
    const total = denuncias.length;
    
    if (total === 0) {
      return this.estadisticasVacias();
    }

    const resueltas = denuncias.filter(d => d.estado === 'resuelto').length;
    const pendientes = denuncias.filter(d => d.estado === 'pendiente').length;
    const enProceso = denuncias.filter(d => d.estado === 'en_proceso').length;
    const rechazadas = denuncias.filter(d => d.estado === 'rechazado').length;
    const cerradas = denuncias.filter(d => d.estado === 'cerrado').length;

    // Tiempo promedio de respuesta
    const tiemposRespuesta = denuncias
      .map(d => d.tiempoRespuesta)
      .filter((tiempo): tiempo is number => tiempo !== null);
    
    const tiempoPromedio = tiemposRespuesta.length > 0
      ? tiemposRespuesta.reduce((sum, tiempo) => sum + tiempo, 0) / tiemposRespuesta.length
      : 0;

    // Satisfacción promedio
    const satisfacciones = denuncias
      .map(d => d.satisfaccionCiudadano)
      .filter((satisfaccion): satisfaccion is number => satisfaccion !== null);
    
    const satisfaccionPromedio = satisfacciones.length > 0
      ? satisfacciones.reduce((sum, sat) => sum + sat, 0) / satisfacciones.length
      : 0;

    // Denuncias por categoría
    const denunciasPorCategoria: Record<string, number> = {};
    denuncias.forEach(denuncia => {
      denunciasPorCategoria[denuncia.categoria] = 
        (denunciasPorCategoria[denuncia.categoria] || 0) + 1;
    });

    // Denuncias por mes
    const denunciasPorMes: Record<string, number> = {};
    denuncias.forEach(denuncia => {
      const fecha = new Date(denuncia.fechaCreacion);
      const mesAno = `${fecha.toLocaleString('es-ES', { month: 'long' })} ${fecha.getFullYear()}`;
      denunciasPorMes[mesAno] = (denunciasPorMes[mesAno] || 0) + 1;
    });

    return {
      totalDenuncias: total,
      resueltas,
      pendientes,
      enProceso,
      rechazadas,
      cerradas,
      tiempoPromedioRespuesta: Math.round(tiempoPromedio * 10) / 10,
      satisfaccionPromedio: Math.round(satisfaccionPromedio * 10) / 10,
      porcentajeResolucion: Math.round((resueltas / total) * 100),
      denunciasPorCategoria,
      denunciasPorMes,
      tendencia: resueltas > pendientes ? 'mejorando' : resueltas === pendientes ? 'estable' : 'empeorando'
    };
  }

  /**
   * Retornar estadísticas vacías
   */
  private estadisticasVacias(): EstadisticasHistorial {
    return {
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
    };
  }
}

// Exportar instancia singleton
export const historialService = new HistorialService();
export default historialService;
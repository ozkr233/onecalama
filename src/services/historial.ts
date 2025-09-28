// src/services/historial.ts - CORREGIDO CON NUEVO PARÁMETRO usuario_id
import { HistorialDenuncia, FiltrosHistorial, EstadisticasHistorial } from '../types/historial';
import { apiService } from './api';
import AuthHelper from '../utils/authHelper';

class HistorialService {
  
  /**
   * Verificar conexión con el backend
   */
  async verificarConexion(): Promise<boolean> {
    try {
      console.log('🔌 [HISTORIAL] Verificando conexión...');
      
      // Intentar hacer una petición simple al backend
      await apiService.get('/categorias/', true);
      console.log('✅ [HISTORIAL] Conexión establecida');
      return true;
      
    } catch (error: any) {
      console.error('❌ [HISTORIAL] Sin conexión al backend:', error.message);
      return false;
    }
  }

  /**
   * ✅ CORREGIDO: Obtener historial usando el parámetro ?usuario_id=${userId}
   */
  async obtenerHistorial(filtros?: FiltrosHistorial): Promise<HistorialDenuncia[]> {
    try {
      console.log('🔄 [HISTORIAL] Iniciando obtención de historial...');
      
      // 1. Obtener ID del usuario actual
      const usuarioId = await this.obtenerUsuarioId();
      console.log('👤 [HISTORIAL] Usuario ID obtenido:', usuarioId);
      
      // 2. Construir URL con parámetro usuario_id (CORREGIDO)
      const params = new URLSearchParams();
      params.append('usuario_id', usuarioId.toString()); // ✅ CAMBIO: usuario_id en lugar de usuario
      
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
      console.log('🎯 [HISTORIAL] Ejemplo esperado: /publicaciones/?usuario_id=1');
      
      const response = await apiService.get(url, true);
      // Asignar tipo explícito para evitar errores de 'unknown'
      const respObj = response as { results?: any[]; count?: number } | any[];
      console.log('📡 [HISTORIAL] Respuesta recibida:', {
        hasResults: Array.isArray(respObj) ? false : !!respObj.results,
        resultsLength: Array.isArray(respObj) ? respObj.length : respObj.results?.length || 0,
        isArray: Array.isArray(respObj),
        arrayLength: Array.isArray(respObj) ? respObj.length : 0,
        totalCount: Array.isArray(respObj) ? respObj.length : respObj.count
      });
      
      // 4. Extraer publicaciones (usar .results como en tu código anterior)
      const publicaciones: any[] = Array.isArray(respObj)
        ? respObj
        : Array.isArray(respObj.results)
          ? respObj.results
          : [];
      console.log('📋 [HISTORIAL] Publicaciones del usuario obtenidas:', publicaciones.length);

      // 5. Debug: Mostrar estructura de primera publicación
      if (publicaciones.length > 0) {
        const primeraPublicacion = publicaciones[0];
        console.log('🔍 [HISTORIAL] Estructura de primera publicación:', {
          id: primeraPublicacion.id,
          codigo: primeraPublicacion.codigo,
          titulo: primeraPublicacion.titulo?.substring(0, 30),
          usuario: primeraPublicacion.usuario,
          situacion: primeraPublicacion.situacion,
          categoria: primeraPublicacion.categoria,
          keys: Object.keys(primeraPublicacion)
        });
      }
      
      // 6. Transformar al formato de historial
      const historial = publicaciones.map((pub: any) => this.transformarAHistorial(pub));
      
      // 7. Ordenar por fecha (más recientes primero)
      historial.sort((a: { fechaCreacion: string | number | Date; }, b: { fechaCreacion: string | number | Date; }) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
      
      console.log('🎉 [HISTORIAL] Historial procesado exitosamente:', historial.length);
      console.log('✅ [HISTORIAL] URL final utilizada:', url);
      return historial;
      
    } catch (error: any) {
      console.error('❌ [HISTORIAL] Error obteniendo historial:', error.message);
      console.error('🔍 [HISTORIAL] URL que falló:', `/publicaciones/?usuario_id=${await this.obtenerUsuarioId().catch(() => 'UNKNOWN')}`);
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
        console.log('⚠️ [HISTORIAL] Publicación no encontrada');
        return null;
      }
      
      console.log('✅ [HISTORIAL] Publicación encontrada, transformando...');
      return this.transformarAHistorial(publicacion);
      
    } catch (error: any) {
      console.error('❌ [HISTORIAL] Error obteniendo denuncia:', error.message);
      if (error.message?.includes('404')) {
        return null;
      }
      throw new Error(`Error al cargar denuncia: ${error.message}`);
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

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Obtener ID del usuario actual - MÉTODO OPTIMIZADO
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
        const usuariosObj = usuarios as { results?: any[] } | any[];
        const usuariosList = Array.isArray(usuariosObj) ? usuariosObj : usuariosObj.results || [];
        
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
   */
  private transformarAHistorial(publicacion: any): HistorialDenuncia {
    // Debug: Mostrar estructura recibida
    console.log('🔍 [HISTORIAL] Transformando publicación:', {
      id: publicacion?.id,
      codigo: publicacion?.codigo,
      titulo: publicacion?.titulo,
      situacion: publicacion?.situacion,
      categoria: publicacion?.categoria,
      keys: publicacion ? Object.keys(publicacion) : 'publicacion is null/undefined'
    });

    // Validar que publicacion no sea null/undefined
    if (!publicacion) {
      console.error('❌ [HISTORIAL] Publicación es null/undefined');
      throw new Error('Datos de publicación inválidos');
    }

    // Construir dirección completa
    const direccion = this.construirDireccion(
      publicacion.nombre_calle,
      publicacion.numero_calle,
      publicacion.junta_vecinal?.nombre_junta || publicacion.junta_vecinal?.villa
    );

    // Extraer coordenadas
    const coordenadas = this.extraerCoordenadas(publicacion);

    // Extraer nombre de la situación (puede venir como objeto o string)
    const situacionNombre = typeof publicacion.situacion === 'object' 
      ? publicacion.situacion?.nombre 
      : publicacion.situacion;

    // Extraer nombre de la categoría (puede venir como objeto o string)
    const categoriaNombre = typeof publicacion.categoria === 'object'
      ? publicacion.categoria?.nombre
      : publicacion.categoria;

    console.log('🎯 [HISTORIAL] Datos procesados para ubicación:', {
      direccion,
      coordenadas,
      situacionNombre,
      categoriaNombre
    });

    try {
      const resultado: HistorialDenuncia = {
        id: publicacion.id?.toString() || '',
        codigo: publicacion.codigo || `P-${publicacion.id}`,
        titulo: publicacion.titulo || 'Sin título',
        descripcion: publicacion.descripcion || 'Sin descripción',
        categoria: categoriaNombre || 'Sin categoría',
        estado: this.mapearEstado(situacionNombre),
        prioridad: this.mapearPrioridad(publicacion.prioridad),
        fechaCreacion: publicacion.fecha_publicacion || new Date().toISOString(),
        fechaActualizacion: publicacion.fecha_actualizacion || publicacion.fecha_publicacion,
        fechaResolucion: publicacion.fecha_resolucion || null,
        ubicacion: {
          direccion: direccion,
          coordenadas: coordenadas ?? undefined,
          referencias: publicacion.referencias || ''
        },
        evidencias: this.transformarEvidencias(publicacion.evidencias || publicacion.evidencia_set || []),
        respuestas: this.transformarRespuestas(publicacion.respuestas || []),
        satisfaccionCiudadano: publicacion.satisfaccion_ciudadano || null,
        comentarioSatisfaccion: publicacion.comentario_satisfaccion || null,
        departamentoAsignado: this.extraerDepartamento(publicacion),
        tiempoRespuesta: this.calcularTiempoRespuesta(
          publicacion.fecha_publicacion,
          publicacion.fecha_primera_respuesta
        ),
        
        // Campos adicionales del backend para debugging
        nombreCalle: publicacion.nombre_calle || null,
        numeroCalle: publicacion.numero_calle || null,
        juntaVecinal: publicacion.junta_vecinal?.nombre_junta || publicacion.junta_vecinal?.villa || null,
        fechaPublicacion: publicacion.fecha_publicacion || null,
        
        // Agregar coordenadas directas para debugging
        latitud: publicacion.latitud || null,
        longitud: publicacion.longitud || null,
      };

      console.log('✅ [HISTORIAL] Publicación transformada exitosamente:', {
        id: resultado.id,
        codigo: resultado.codigo,
        titulo: resultado.titulo.substring(0, 30),
        ubicacion: resultado.ubicacion,
        coordenadas: resultado.ubicacion.coordenadas
      });

      return resultado;

    } catch (error) {
      console.error('❌ [HISTORIAL] Error transformando publicación:', error);
      console.error('🔍 [HISTORIAL] Datos de la publicación:', publicacion);
      throw new Error('Error procesando datos de la publicación');
    }
  }

  // [Resto de métodos privados permanecen igual...]
  
  private construirDireccion(nombreCalle?: string, numeroCalle?: string | number, juntaVecinal?: string): string {
    const partes: string[] = [];
    
    if (nombreCalle) partes.push(nombreCalle);
    if (numeroCalle) partes.push(`#${numeroCalle}`);
    if (juntaVecinal) partes.push(`- ${juntaVecinal}`);
    
    return partes.length > 0 ? partes.join(' ') : 'Dirección no especificada';
  }

  private extraerDepartamento(publicacion: any): string | null {
    if (publicacion.departamento?.nombre) {
      return publicacion.departamento.nombre;
    }
    
    if (publicacion.categoria?.departamento?.nombre) {
      return publicacion.categoria.departamento.nombre;
    }
    
    return null;
  }

  private mapearEstado(estado?: string): HistorialDenuncia['estado'] {
    if (!estado) return 'pendiente';
    
    const estadoLower = estado.toLowerCase();
    
    if (estadoLower.includes('resuelto')) return 'resuelto';
    if (estadoLower.includes('en curso') || estadoLower.includes('proceso')) return 'en_proceso';
    if (estadoLower.includes('recibido')) return 'pendiente';
    if (estadoLower.includes('pendiente')) return 'pendiente';
    if (estadoLower.includes('no resuelto') || estadoLower.includes('rechazado') || estadoLower.includes('denegado')) return 'rechazado';
    if (estadoLower.includes('cerrado') || estadoLower.includes('finalizado')) return 'cerrado';
    
    console.warn('⚠️ [HISTORIAL] Estado no reconocido del backend:', estado);
    return 'pendiente';
  }

  private mapearPrioridad(prioridad?: string): HistorialDenuncia['prioridad'] {
    if (!prioridad) return 'sin_priorizar';
    
    const prioridadLower = prioridad.toLowerCase();
    
    if (prioridadLower.includes('baja')) return 'baja';
    if (prioridadLower.includes('alta') || prioridadLower.includes('critica') || prioridadLower.includes('urgente')) return 'alta';
    if (prioridadLower.includes('media') || prioridadLower.includes('normal')) return 'media';
    
    return 'sin_priorizar';
  }

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

  // [Métodos adicionales de transformación y cálculos permanecen iguales...]
  private transformarEvidencias(evidencias: any[]): any[] {
    return evidencias.map((evidencia: any) => ({
      id: evidencia.id?.toString(),
      tipo: evidencia.tipo || 'imagen',
      url: evidencia.archivo || evidencia.url,
      nombre: evidencia.nombre || 'Sin nombre',
      fechaSubida: evidencia.fecha_subida || evidencia.created_at,
      tamaño: evidencia.tamaño || null
    }));
  }

  private transformarRespuestas(respuestas: any[]): any[] {
    return respuestas.map((respuesta: any) => ({
      id: respuesta.id?.toString(),
      contenido: respuesta.respuesta || respuesta.contenido,
      fechaRespuesta: respuesta.fecha_respuesta || respuesta.created_at,
      autor: respuesta.autor || 'Municipal',
      leida: respuesta.leida || false,
      evidencias: this.transformarEvidencias(respuesta.evidencias || [])
    }));
  }

  private calcularTiempoRespuesta(fechaCreacion?: string, fechaPrimeraRespuesta?: string): number | null {
    if (!fechaCreacion || !fechaPrimeraRespuesta) return null;
    
    const creacion = new Date(fechaCreacion);
    const respuesta = new Date(fechaPrimeraRespuesta);
    
    return Math.ceil((respuesta.getTime() - creacion.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calcularEstadisticas(denuncias: HistorialDenuncia[]): EstadisticasHistorial {
    const total = denuncias.length;
    const resueltas = denuncias.filter(d => d.estado === 'resuelto').length;
    const pendientes = denuncias.filter(d => d.estado === 'pendiente').length;
    const enProceso = denuncias.filter(d => d.estado === 'en_proceso').length;
    const rechazadas = denuncias.filter(d => d.estado === 'rechazado').length;
    const cerradas = denuncias.filter(d => d.estado === 'cerrado').length;
    
    const tiemposRespuesta = denuncias
      .filter(d => d.tiempoRespuesta !== null)
      .map(d => d.tiempoRespuesta!);
    
    const tiempoPromedio = tiemposRespuesta.length > 0
      ? tiemposRespuesta.reduce((sum, tiempo) => sum + tiempo, 0) / tiemposRespuesta.length
      : 0;
    
    const satisfacciones = denuncias
      .filter(d => d.satisfaccionCiudadano !== null)
      .map(d => d.satisfaccionCiudadano!);
    
    const satisfaccionPromedio = satisfacciones.length > 0
      ? satisfacciones.reduce((sum, sat) => sum + sat, 0) / satisfacciones.length
      : 0;
    
    return {
      totalDenuncias: total,
      resueltas,
      pendientes,
      enProceso,
      rechazadas,
      cerradas,
      tiempoPromedioRespuesta: Math.round(tiempoPromedio),
      satisfaccionPromedio: Math.round(satisfaccionPromedio * 10) / 10,
      porcentajeResolucion: total > 0 ? Math.round((resueltas / total) * 100) : 0,
      denunciasPorCategoria: this.agruparPorCategoria(denuncias),
      denunciasPorMes: this.agruparPorMes(denuncias),
      tendencia: this.calcularTendencia(denuncias)
    };
  }

  private agruparPorCategoria(denuncias: HistorialDenuncia[]): Record<string, number> {
    return denuncias.reduce((acc, denuncia) => {
      acc[denuncia.categoria] = (acc[denuncia.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private agruparPorMes(denuncias: HistorialDenuncia[]): Record<string, number> {
    return denuncias.reduce((acc, denuncia) => {
      const fecha = new Date(denuncia.fechaCreacion);
      const mes = fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calcularTendencia(denuncias: HistorialDenuncia[]): 'aumentando' | 'disminuyendo' | 'estable' | 'sin_datos' {
    if (denuncias.length < 2) return 'sin_datos';
    
    const ahora = new Date();
    const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    
    const denunciasMesActual = denuncias.filter(d => 
      new Date(d.fechaCreacion) >= new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    ).length;
    
    const denunciasMesAnterior = denuncias.filter(d => {
      const fecha = new Date(d.fechaCreacion);
      return fecha >= mesAnterior && fecha < new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    }).length;
    
    if (denunciasMesActual > denunciasMesAnterior) return 'aumentando';
    if (denunciasMesActual < denunciasMesAnterior) return 'disminuyendo';
    return 'estable';
  }

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

export const historialService = new HistorialService();
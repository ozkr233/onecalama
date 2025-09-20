// src/services/historial.ts - COMPLETO CON MÉTODO ORIGINAL DE USUARIO
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
   * Obtener historial usando el parámetro ?usuario=${userId} - MÉTODO ORIGINAL
   */
  async obtenerHistorial(filtros?: FiltrosHistorial): Promise<HistorialDenuncia[]> {
    try {
      console.log('🔄 [HISTORIAL] Iniciando obtención de historial...');
      
      // 1. Obtener ID del usuario actual - USANDO MÉTODO ORIGINAL
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
   * Calificar satisfacción - MÉTODO ORIGINAL
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
   * ✅ MÉTODO ORIGINAL QUE FUNCIONABA - NO MODIFICADO
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

    // Estrategia 3: Buscar por RUT en usuarios - ORIGINAL
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

    // Estrategia 4: Fallback para desarrollo (RUT conocido) - ORIGINAL
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
   * ✅ CORREGIDO: Usa el campo 'codigo' en lugar de 'numeroFolio'
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

    // Extraer nombre de la situación (puede venir como objeto o string)
    const situacionNombre = typeof publicacion.situacion === 'object' 
      ? publicacion.situacion?.nombre 
      : publicacion.situacion;

    // Extraer nombre de la categoría (puede venir como objeto o string)
    const categoriaNombre = typeof publicacion.categoria === 'object'
      ? publicacion.categoria?.nombre
      : publicacion.categoria;

    // Construir dirección desde los campos del backend
    const direccion = this.construirDireccion(publicacion);

    try {
      // ✅ CORREGIDO: Mapear a la estructura correcta del type HistorialDenuncia
      const resultado: HistorialDenuncia = {
        id: publicacion.id?.toString() || '',
        codigo: publicacion.codigo || `P-${publicacion.id}`, // ✅ Campo correcto del type
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
          coordenadas: this.extraerCoordenadas(publicacion) ?? undefined,
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
        
        // ✅ NUEVO: Campos adicionales del backend
        nombreCalle: publicacion.nombre_calle || null,
        numeroCalle: publicacion.numero_calle || null,
        juntaVecinal: publicacion.junta_vecinal?.nombre_junta || publicacion.junta_vecinal?.villa || null,
        fechaPublicacion: publicacion.fecha_publicacion || null,
      };

      console.log('✅ [HISTORIAL] Publicación transformada exitosamente:', {
        id: resultado.id,
        codigo: resultado.codigo,
        titulo: resultado.titulo.substring(0, 30)
      });

      return resultado;

    } catch (error: any) {
      console.error('❌ [HISTORIAL] Error transformando publicación:', error);
      console.error('❌ [HISTORIAL] Datos recibidos:', publicacion);
      throw new Error(`Error transformando datos: ${error.message}`);
    }
  }

  /**
   * Construir dirección desde los campos del backend
   */
  private construirDireccion(publicacion: any): string {
    const partes = [];
    
    if (publicacion.nombre_calle) {
      partes.push(publicacion.nombre_calle);
    }
    
    if (publicacion.numero_calle) {
      partes.push(publicacion.numero_calle.toString());
    }
    
    // Agregar información de junta vecinal si existe
    if (publicacion.junta_vecinal?.villa) {
      partes.push(publicacion.junta_vecinal.villa);
    }
    
    return partes.length > 0 ? partes.join(' ') : 'Dirección no especificada';
  }

  /**
   * Extraer nombre del departamento
   */
  private extraerDepartamento(publicacion: any): string | null {
    // Puede venir desde el departamento directo o desde la categoría
    if (publicacion.departamento?.nombre) {
      return publicacion.departamento.nombre;
    }
    
    if (publicacion.categoria?.departamento?.nombre) {
      return publicacion.categoria.departamento.nombre;
    }
    
    return null;
  }

  /**
   * Mapear estado del backend al formato de la app
   */
private mapearEstado(estado?: string): HistorialDenuncia['estado'] {
  if (!estado) return 'pendiente';
  
  const estadoLower = estado.toLowerCase();
  
  // ✅ CORREGIDO: Mapear según los estados reales del backend
  if (estadoLower.includes('resuelto')) return 'resuelto';
  if (estadoLower.includes('en curso') || estadoLower.includes('proceso')) return 'en_proceso';
  if (estadoLower.includes('recibido')) return 'pendiente'; // ✅ "Recibido" → 'pendiente'
  if (estadoLower.includes('pendiente')) return 'pendiente';
  if (estadoLower.includes('no resuelto') || estadoLower.includes('rechazado') || estadoLower.includes('denegado')) return 'rechazado';
  if (estadoLower.includes('cerrado') || estadoLower.includes('finalizado')) return 'cerrado';
  
  // ✅ Log para debug de estados no reconocidos
  console.warn('⚠️ [HISTORIAL] Estado no reconocido del backend:', estado);
  return 'pendiente';
}

  /**
   * Mapear prioridad del backend al formato de la app
   */
  private mapearPrioridad(prioridad?: string): HistorialDenuncia['prioridad'] {
    if (!prioridad) return 'sin_priorizar';
    
    const prioridadLower = prioridad.toLowerCase();
    
    if (prioridadLower.includes('baja')) return 'baja';
    if (prioridadLower.includes('alta') || prioridadLower.includes('critica') || prioridadLower.includes('urgente')) return 'alta';
    if (prioridadLower.includes('media') || prioridadLower.includes('normal')) return 'media';
    
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
   * Transformar evidencias del backend
   */
  private transformarEvidencias(evidencias: any[]): HistorialDenuncia['evidencias'] {
    if (!Array.isArray(evidencias)) {
      return [];
    }
    
    return evidencias.map((evidencia, index) => ({
      id: evidencia.id?.toString() || index.toString(),
      tipo: this.determinarTipoEvidencia(evidencia.extension || evidencia.archivo),
      url: evidencia.archivo || evidencia.url || '',
      nombre: evidencia.nombre || `Evidencia ${index + 1}`,
      fechaSubida: evidencia.fecha || new Date().toISOString(),
      descripcion: evidencia.descripcion || '',
      size: evidencia.size || 0,
      mimeType: evidencia.mime_type || evidencia.extension || ''
    }));
  }

  /**
   * Determinar tipo de evidencia por extensión
   */
  private determinarTipoEvidencia(extension: string): 'imagen' | 'documento' | 'video' {
    if (!extension) return 'documento';
    
    const ext = extension.toLowerCase();
    
    if (ext.includes('jpg') || ext.includes('jpeg') || ext.includes('png') || ext.includes('gif') || ext.includes('webp')) {
      return 'imagen';
    }
    
    if (ext.includes('mp4') || ext.includes('avi') || ext.includes('mov') || ext.includes('webm')) {
      return 'video';
    }
    
    return 'documento';
  }

  // src/services/historial.ts - VERSIÓN CON DEBUGGING MEJORADO PARA COORDENADAS

// Función para debug de coordenadas - agregar esta función al servicio existente
private extraerCoordenadas(publicacion: any): { lat: number; lng: number } | null {
  console.log('🗺️ [HISTORIAL] Extrayendo coordenadas de publicación:', {
    id: publicacion?.id,
    latitud: publicacion?.latitud,
    longitud: publicacion?.longitud,
    lat: publicacion?.lat,
    lng: publicacion?.lng,
    lon: publicacion?.lon,
    allKeys: publicacion ? Object.keys(publicacion) : 'No hay publicacion',
    coordenadasDirectas: {
      latitud_valor: publicacion?.latitud,
      latitud_tipo: typeof publicacion?.latitud,
      longitud_valor: publicacion?.longitud,
      longitud_tipo: typeof publicacion?.longitud
    }
  });

  const lat = publicacion?.latitud || publicacion?.lat;
  const lng = publicacion?.longitud || publicacion?.lng || publicacion?.lon;
  
  console.log('🎯 [HISTORIAL] Valores extraídos para coordenadas:', {
    lat_raw: lat,
    lng_raw: lng,
    lat_tipo: typeof lat,
    lng_tipo: typeof lng,
    lat_null: lat == null,
    lng_null: lng == null
  });
  
  if (lat != null && lng != null) {
    const coords = {
      lat: typeof lat === 'string' ? parseFloat(lat) : lat,
      lng: typeof lng === 'string' ? parseFloat(lng) : lng
    };
    
    console.log('✅ [HISTORIAL] Coordenadas procesadas exitosamente:', coords);
    return coords;
  }
  
  console.warn('⚠️ [HISTORIAL] No se pudieron extraer coordenadas válidas');
  return null;
}

// Función mejorada para construir dirección con debugging
private construirDireccion(publicacion: any): string {
  console.log('🏠 [HISTORIAL] Construyendo dirección de publicación:', {
    id: publicacion?.id,
    nombre_calle: publicacion?.nombre_calle,
    numero_calle: publicacion?.numero_calle,
    villa: publicacion?.junta_vecinal?.villa,
    ubicacion_campo: publicacion?.ubicacion
  });

  const partes = [];
  
  if (publicacion?.nombre_calle) {
    partes.push(publicacion.nombre_calle);
  }
  
  if (publicacion?.numero_calle) {
    partes.push(publicacion.numero_calle.toString());
  }
  
  // Agregar información de junta vecinal si existe
  if (publicacion?.junta_vecinal?.villa) {
    partes.push(publicacion.junta_vecinal.villa);
  }
  
  // Si hay un campo 'ubicacion' directo, usarlo también
  if (publicacion?.ubicacion && !partes.includes(publicacion.ubicacion)) {
    partes.push(publicacion.ubicacion);
  }
  
  const direccionFinal = partes.length > 0 ? partes.join(' ') : 'Dirección no especificada';
  
  console.log('📍 [HISTORIAL] Dirección construida:', {
    partes,
    direccionFinal
  });
  
  return direccionFinal;
}

// Función mejorada para transformar con debugging extenso
private transformarAHistorial(publicacion: any): HistorialDenuncia {
  console.log('🔄 [HISTORIAL] === INICIO TRANSFORMACIÓN ===');
  console.log('🔍 [HISTORIAL] Datos completos de publicación recibida:', {
    id: publicacion?.id,
    codigo: publicacion?.codigo,
    titulo: publicacion?.titulo,
    descripcion: publicacion?.descripcion?.substring(0, 50) + '...',
    latitud: publicacion?.latitud,
    longitud: publicacion?.longitud,
    nombre_calle: publicacion?.nombre_calle,
    numero_calle: publicacion?.numero_calle,
    ubicacion: publicacion?.ubicacion,
    junta_vecinal: publicacion?.junta_vecinal,
    situacion: publicacion?.situacion,
    categoria: publicacion?.categoria,
    allKeys: publicacion ? Object.keys(publicacion).sort() : 'No hay publicacion'
  });

  // Validar que publicacion no sea null/undefined
  if (!publicacion) {
    console.error('❌ [HISTORIAL] Publicación es null/undefined');
    throw new Error('Datos de publicación inválidos');
  }

  // Extraer coordenadas con debugging
  const coordenadas = this.extraerCoordenadas(publicacion);
  
  // Construir dirección con debugging
  const direccion = this.construirDireccion(publicacion);

  // Extraer nombres de situación y categoría
  const situacionNombre = typeof publicacion.situacion === 'object' 
    ? publicacion.situacion?.nombre 
    : publicacion.situacion;

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
        coordenadas: coordenadas,
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
      
      // ✅ NUEVO: Agregar coordenadas directas para debugging
      latitud: publicacion.latitud || null,
      longitud: publicacion.longitud || null,
    };

    console.log('✅ [HISTORIAL] Publicación transformada exitosamente:', {
      id: resultado.id,
      codigo: resultado.codigo,
      titulo: resultado.titulo.substring(0, 30),
      ubicacion: resultado.ubicacion,
      coordenadas: resultado.ubicacion?.coordenadas,
      latitud_directa: (resultado as any).latitud,
      longitud_directa: (resultado as any).longitud
    });
    
    console.log('🔄 [HISTORIAL] === FIN TRANSFORMACIÓN ===');

    return resultado;

  } catch (error: any) {
    console.error('❌ [HISTORIAL] Error transformando publicación:', error);
    console.error('❌ [HISTORIAL] Datos recibidos completos:', JSON.stringify(publicacion, null, 2));
    throw new Error(`Error transformando datos: ${error.message}`);
  }
}

  /**
   * Transformar respuestas del sistema (no municipales)
   */
  private transformarRespuestas(respuestas: any[]): HistorialDenuncia['respuestas'] {
    if (!Array.isArray(respuestas)) {
      return [];
    }
    
    return respuestas.map((respuesta, index) => ({
      id: respuesta.id?.toString() || index.toString(),
      autor: respuesta.autor || respuesta.usuario?.nombre || 'Sistema',
      mensaje: respuesta.mensaje || respuesta.descripcion || '',
      fechaRespuesta: respuesta.fecha || respuesta.fecha_respuesta || new Date().toISOString(),
      tipo: this.determinarTipoRespuesta(respuesta.tipo),
      esOficial: respuesta.es_oficial ?? true,
      leida: respuesta.leida ?? false,
      evidencias: this.transformarEvidencias(respuesta.evidencias || [])
    }));
  }

  /**
   * Determinar tipo de respuesta
   */
  private determinarTipoRespuesta(tipo?: string): 'respuesta' | 'actualizacion' | 'resolucion' {
    if (!tipo) return 'respuesta';
    
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('resolucion') || tipoLower.includes('resuelto')) return 'resolucion';
    if (tipoLower.includes('actualizacion') || tipoLower.includes('cambio')) return 'actualizacion';
    
    return 'respuesta';
  }

  /**
   * Calcular tiempo de respuesta en días
   */
  private calcularTiempoRespuesta(fechaCreacion?: string, fechaPrimeraRespuesta?: string): number | null {
    if (!fechaCreacion || !fechaPrimeraRespuesta) {
      return null;
    }
    
    try {
      const creacion = new Date(fechaCreacion);
      const respuesta = new Date(fechaPrimeraRespuesta);
      const diferencia = respuesta.getTime() - creacion.getTime();
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      
      return dias >= 0 ? dias : null;
    } catch (error) {
      console.warn('⚠️ [HISTORIAL] Error calculando tiempo de respuesta:', error);
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

    // Contar por estado
    const resueltas = denuncias.filter(d => d.estado === 'resuelto').length;
    const pendientes = denuncias.filter(d => d.estado === 'pendiente').length;
    const enProceso = denuncias.filter(d => d.estado === 'en_proceso').length;
    const rechazadas = denuncias.filter(d => d.estado === 'rechazado').length;
    const cerradas = denuncias.filter(d => d.estado === 'cerrado').length;

    // Calcular estadísticas de tiempo de respuesta
    const tiemposRespuesta = denuncias
      .filter(d => d.tiempoRespuesta !== null && d.tiempoRespuesta !== undefined)
      .map(d => d.tiempoRespuesta!);
    
    const tiempoPromedioRespuesta = tiemposRespuesta.length > 0 
      ? tiemposRespuesta.reduce((sum, tiempo) => sum + tiempo, 0) / tiemposRespuesta.length
      : 0;

    // Calcular estadísticas de satisfacción
    const calificaciones = denuncias
      .filter(d => d.satisfaccionCiudadano !== null && d.satisfaccionCiudadano !== undefined)
      .map(d => d.satisfaccionCiudadano!);
    
    const satisfaccionPromedio = calificaciones.length > 0
      ? calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length
      : 0;

    // Porcentaje de resolución
    const porcentajeResolucion = total > 0 ? (resueltas / total) * 100 : 0;

    // Denuncias por categoría
    const denunciasPorCategoria: Record<string, number> = {};
    denuncias.forEach(d => {
      denunciasPorCategoria[d.categoria] = (denunciasPorCategoria[d.categoria] || 0) + 1;
    });

    // Denuncias por mes (últimos 12 meses)
    const denunciasPorMes: Record<string, number> = {};
    denuncias.forEach(d => {
      const fecha = new Date(d.fechaCreacion);
      const mes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      denunciasPorMes[mes] = (denunciasPorMes[mes] || 0) + 1;
    });

    // Determinar tendencia (simplificado)
    const tendencia = this.calcularTendencia(denuncias);

    return {
      totalDenuncias: total,
      resueltas,
      pendientes,
      enProceso,
      rechazadas,
      cerradas,
      tiempoPromedioRespuesta: Math.round(tiempoPromedioRespuesta),
      satisfaccionPromedio: Math.round(satisfaccionPromedio * 10) / 10,
      porcentajeResolucion: Math.round(porcentajeResolucion),
      denunciasPorCategoria,
      denunciasPorMes,
      tendencia
    };
  }

  /**
   * Calcular tendencia basada en las denuncias de los últimos meses
   */
  private calcularTendencia(denuncias: HistorialDenuncia[]): EstadisticasHistorial['tendencia'] {
    const ahora = new Date();
    const hace3Meses = new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1);
    const hace6Meses = new Date(ahora.getFullYear(), ahora.getMonth() - 6, 1);

    const denunciasRecientes = denuncias.filter(d => new Date(d.fechaCreacion) >= hace3Meses);
    const denunciasAnteriores = denuncias.filter(d => {
      const fecha = new Date(d.fechaCreacion);
      return fecha >= hace6Meses && fecha < hace3Meses;
    });

    if (denunciasAnteriores.length === 0) {
      return 'sin_datos';
    }

    const resolucionReciente = denunciasRecientes.filter(d => d.estado === 'resuelto').length / denunciasRecientes.length;
    const resolucionAnterior = denunciasAnteriores.filter(d => d.estado === 'resuelto').length / denunciasAnteriores.length;

    if (resolucionReciente > resolucionAnterior + 0.1) {
      return 'mejorando';
    } else if (resolucionReciente < resolucionAnterior - 0.1) {
      return 'empeorando';
    } else {
      return 'estable';
    }
  }

  /**
   * Estadísticas vacías por defecto
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
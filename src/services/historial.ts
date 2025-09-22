// src/services/historial.service.v2.ts
// Nueva versión con buenas prácticas: tipado estricto, utilidades puras, caché
// con invalidación, manejo uniforme de respuestas (array o paginado),
// extractor de coordenadas robusto, y compatibilidad con la API pública existente.
// Mantiene la firma de métodos: verificarConexion, obtenerHistorial, obtenerDenunciaPorId,
// obtenerEstadisticas, marcarRespuestaLeida, calificarSatisfaccion. Añade limpiarCache().

import { HistorialDenuncia, FiltrosHistorial, EstadisticasHistorial } from '../types/historial';
import { apiService } from './api';
import AuthHelper from '../utils/authHelper';

/**
 * Logger minimalista con flag de depuración.
 * En prod, coloca DEBUG=false o léelo desde una variable de entorno.
 */
const DEBUG = true;
const log = {
  d: (...a: any[]) => DEBUG && console.log('[HISTORIAL][D]', ...a),
  i: (...a: any[]) => DEBUG && console.info('[HISTORIAL][I]', ...a),
  w: (...a: any[]) => DEBUG && console.warn('[HISTORIAL][W]', ...a),
  e: (...a: any[]) => console.error('[HISTORIAL][E]', ...a),
};

// ────────────────────────────────────────────────────────────────────────────────
// Tipos auxiliares
// ────────────────────────────────────────────────────────────────────────────────

type ApiList<T> = { results?: T[]; count?: number; next?: string | null; previous?: string | null } | T[];

// Respuesta segura para operaciones "procedimentales" (mark read, rate, etc.)
export type VoidResult = { ok: true } | { ok: false; message: string };

// ────────────────────────────────────────────────────────────────────────────────
// Utilidades puras (sin efectos)
// ────────────────────────────────────────────────────────────────────────────────

const toStr = (v: unknown, fallback = ''): string => (v == null ? fallback : String(v));
const toNum = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN);
const isFiniteNumber = (v: unknown): v is number => Number.isFinite(toNum(v));
const toISO = (v?: string | Date | null): string => {
  if (!v) return new Date().toISOString();
  const d = typeof v === 'string' ? new Date(v) : v;
  return new Date(d).toISOString();
};

function unwrapResults<T>(resp: ApiList<T>): T[] {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.results)) return resp.results as T[];
  return [];
}

function buildQueryParams(filtros: FiltrosHistorial | undefined, usuarioId: number): URLSearchParams {
  const p = new URLSearchParams();
  p.append('usuario', String(usuarioId));
  if (filtros?.estado?.length) p.append('estado', filtros.estado.join(','));
  if (filtros?.categoria?.length) p.append('categoria', filtros.categoria.join(','));
  if (filtros?.fechaDesde) p.append('fecha_desde', filtros.fechaDesde);
  if (filtros?.fechaHasta) p.append('fecha_hasta', filtros.fechaHasta);
  if (filtros?.busqueda) p.append('busqueda', filtros.busqueda);
  return p;
}

// ────────────────────────────────────────────────────────────────────────────────
// Caché simple en memoria por URL
// ────────────────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 30_000; // 30s; ajusta o desactiva (0) según tu UX
const cache = new Map<string, { ts: number; data: HistorialDenuncia[] }>();

// ────────────────────────────────────────────────────────────────────────────────
// Extractores y transformadores puros
// ────────────────────────────────────────────────────────────────────────────────

function extractDepartamento(pub: any): string | null {
  if (pub?.departamento?.nombre) return String(pub.departamento.nombre);
  if (pub?.categoria?.departamento?.nombre) return String(pub.categoria.departamento.nombre);
  return null;
}

function buildDireccion(pub: any): string {
  const partes: string[] = [];
  if (pub?.nombre_calle) partes.push(String(pub.nombre_calle));
  if (pub?.numero_calle) partes.push(String(pub.numero_calle));
  if (pub?.junta_vecinal?.villa) partes.push(String(pub.junta_vecinal.villa));
  if (pub?.ubicacion && !partes.includes(String(pub.ubicacion))) partes.push(String(pub.ubicacion));
  return partes.length ? partes.join(' ') : 'Dirección no especificada';
}

function extractCoordenadas(pub: any): { lat: number; lng: number } | null {
  const pair = (a: any, b: any) => (isFiniteNumber(a) && isFiniteNumber(b) ? { lat: toNum(a), lng: toNum(b) } : null);

  // 1) top-level comunes
  const p1 = pair(pub?.latitud, pub?.longitud); if (p1) return p1;
  const p2 = pair(pub?.lat, pub?.lng ?? pub?.lon); if (p2) return p2;

  // 2) anidados en ubicacion
  const u: any = pub?.ubicacion;
  if (u && typeof u === 'object') {
    if (u?.type === 'Point' && Array.isArray(u?.coordinates) && u.coordinates.length >= 2) {
      const [lng, lat] = u.coordinates;
      const p3 = pair(lat, lng); if (p3) return p3;
    }
    const p4 = pair(u?.latitud ?? u?.lat, u?.longitud ?? u?.lng ?? u?.lon); if (p4) return p4;
    if (Array.isArray(u) && u.length >= 2) { const p5 = pair(u[0], u[1]); if (p5) return p5; }
  }

  // 3) strings: "-22.47, -68.93" o "POINT(-68.93 -22.47)"
  const s = typeof u === 'string' ? u : typeof pub?.coordenadas === 'string' ? pub.coordenadas : null;
  if (typeof s === 'string') {
    const nums = s.match(/-?\d+(?:\.\d+)?/g)?.map(parseFloat);
    if (nums && nums.length >= 2) {
      if (s.toUpperCase().includes('POINT')) { const [lng, lat] = nums; const p6 = pair(lat, lng); if (p6) return p6; }
      else { const [lat, lng] = nums; const p7 = pair(lat, lng); if (p7) return p7; }
    }
  }
  return null;
}

function mapEstado(v?: string): HistorialDenuncia['estado'] {
  const s = toStr(v).toLowerCase();
  if (!s) return 'pendiente';
  if (s.includes('resuelto')) return 'resuelto';
  if (s.includes('en curso') || s.includes('proceso')) return 'en_proceso';
  if (s.includes('recibido') || s.includes('pendiente')) return 'pendiente';
  if (s.includes('no resuelto') || s.includes('rechazado') || s.includes('denegado')) return 'rechazado';
  if (s.includes('cerrado') || s.includes('finalizado')) return 'cerrado';
  log.w('Estado no reconocido:', v);
  return 'pendiente';
}

function mapPrioridad(v?: string): HistorialDenuncia['prioridad'] {
  const s = toStr(v).toLowerCase();
  if (!s) return 'sin_priorizar';
  if (s.includes('alta') || s.includes('crítica') || s.includes('critica') || s.includes('urgente')) return 'alta';
  if (s.includes('media') || s.includes('normal')) return 'media';
  if (s.includes('baja')) return 'baja';
  return 'sin_priorizar';
}

function mapEvidenceType(ext: string): 'imagen' | 'documento' | 'video' {
  const s = (ext || '').toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp)$/.test(s) || ['jpg','jpeg','png','gif','webp'].some(x => s.includes(x))) return 'imagen';
  if (/\.(mp4|avi|mov|webm)$/.test(s) || ['mp4','avi','mov','webm'].some(x => s.includes(x))) return 'video';
  return 'documento';
}

function transformEvidencias(arr: any[]): HistorialDenuncia['evidencias'] {
  if (!Array.isArray(arr)) return [];
  return arr.map((e, i) => ({
    id: toStr(e?.id ?? i),
    tipo: mapEvidenceType(toStr(e?.extension || e?.archivo)),
    url: toStr(e?.archivo || e?.url),
    nombre: toStr(e?.nombre, `Evidencia ${i + 1}`),
    fechaSubida: toISO(e?.fecha),
    descripcion: toStr(e?.descripcion, ''),
    size: isFiniteNumber(e?.size) ? toNum(e?.size) : 0,
    mimeType: toStr(e?.mime_type || e?.extension, ''),
  }));
}

function mapTipoRespuesta(t?: string): 'respuesta' | 'actualizacion' | 'resolucion' {
  const s = toStr(t).toLowerCase();
  if (s.includes('resolucion') || s.includes('resuelto')) return 'resolucion';
  if (s.includes('actualizacion') || s.includes('cambio')) return 'actualizacion';
  return 'respuesta';
}

function transformRespuestas(arr: any[]): HistorialDenuncia['respuestas'] {
  if (!Array.isArray(arr)) return [];
  return arr.map((r, i) => ({
    id: toStr(r?.id ?? i),
    autor: toStr(r?.autor || r?.usuario?.nombre, 'Sistema'),
    mensaje: toStr(r?.mensaje || r?.descripcion, ''),
    fechaRespuesta: toISO(r?.fecha || r?.fecha_respuesta),
    tipo: mapTipoRespuesta(toStr(r?.tipo)),
    esOficial: r?.es_oficial ?? true,
    leida: r?.leida ?? false,
    evidencias: transformEvidencias(r?.evidencias || []),
  }));
}

function calcTiempoRespuesta(creacion?: string, primera?: string): number | null {
  if (!creacion || !primera) return null;
  try {
    const d = new Date(primera).getTime() - new Date(creacion).getTime();
    const dias = Math.floor(d / (1000 * 60 * 60 * 24));
    return dias >= 0 ? dias : null;
  } catch {
    return null;
  }
}

function calcEstadisticas(denuncias: HistorialDenuncia[]): EstadisticasHistorial {
  const total = denuncias.length;
  if (!total) return estadisticasVacias();

  const contar = (p: (d: HistorialDenuncia) => boolean) => denuncias.filter(p).length;
  const resueltas = contar((d) => d.estado === 'resuelto');
  const pendientes = contar((d) => d.estado === 'pendiente');
  const enProceso = contar((d) => d.estado === 'en_proceso');
  const rechazadas = contar((d) => d.estado === 'rechazado');
  const cerradas = contar((d) => d.estado === 'cerrado');

  const tiempos = denuncias.map((d) => d.tiempoRespuesta).filter((x): x is number => typeof x === 'number');
  const tProm = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;

  const califs = denuncias.map((d) => d.satisfaccionCiudadano).filter((x): x is number => typeof x === 'number');
  const sProm = califs.length ? Math.round((califs.reduce((a, b) => a + b, 0) / califs.length) * 10) / 10 : 0;

  const porcentajeResolucion = Math.round((resueltas / total) * 100);

  const denunciasPorCategoria: Record<string, number> = {};
  for (const d of denuncias) {
    denunciasPorCategoria[d.categoria] = (denunciasPorCategoria[d.categoria] || 0) + 1;
  }

  const denunciasPorMes: Record<string, number> = {};
  for (const d of denuncias) {
    const f = new Date(d.fechaCreacion);
    const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
    denunciasPorMes[key] = (denunciasPorMes[key] || 0) + 1;
  }

  const tendencia = calcTendencia(denuncias);

  return {
    totalDenuncias: total,
    resueltas,
    pendientes,
    enProceso,
    rechazadas,
    cerradas,
    tiempoPromedioRespuesta: tProm,
    satisfaccionPromedio: sProm,
    porcentajeResolucion,
    denunciasPorCategoria,
    denunciasPorMes,
    tendencia,
  };
}

function calcTendencia(denuncias: HistorialDenuncia[]): EstadisticasHistorial['tendencia'] {
  const now = new Date();
  const t3 = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const t6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const recientes = denuncias.filter((d) => new Date(d.fechaCreacion) >= t3);
  const anteriores = denuncias.filter((d) => {
    const f = new Date(d.fechaCreacion);
    return f >= t6 && f < t3;
  });
  if (!anteriores.length) return 'sin_datos';

  const rRec = recientes.filter((d) => d.estado === 'resuelto').length / (recientes.length || 1);
  const rAnt = anteriores.filter((d) => d.estado === 'resuelto').length / anteriores.length;

  if (rRec > rAnt + 0.1) return 'mejorando';
  if (rRec < rAnt - 0.1) return 'empeorando';
  return 'estable';
}

function estadisticasVacias(): EstadisticasHistorial {
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
    tendencia: 'sin_datos',
  };
}

function transformPublicacion(pub: any): HistorialDenuncia {
  if (!pub) throw new Error('Datos de publicación inválidos');

  const situacionNombre = typeof pub.situacion === 'object' ? pub.situacion?.nombre : pub.situacion;
  const categoriaNombre = typeof pub.categoria === 'object' ? pub.categoria?.nombre : pub.categoria;

  const coords = extractCoordenadas(pub);

  const resultado: HistorialDenuncia = {
    id: String(pub.id ?? ''),
    codigo: pub.codigo || `P-${pub.id}`,
    titulo: toStr(pub.titulo, 'Sin título'),
    descripcion: toStr(pub.descripcion, 'Sin descripción'),
    categoria: toStr(categoriaNombre, 'Sin categoría'),
    estado: mapEstado(toStr(situacionNombre)),
    prioridad: mapPrioridad(toStr(pub.prioridad)),
    fechaCreacion: toISO(pub.fecha_publicacion),
    fechaActualizacion: pub.fecha_actualizacion || pub.fecha_publicacion || null,
    fechaResolucion: pub.fecha_resolucion || null,
    ubicacion: {
      direccion: buildDireccion(pub),
      coordenadas: coords ?? undefined,
      referencias: toStr(pub.referencias, ''),
    },
    evidencias: transformEvidencias(pub.evidencias || pub.evidencia_set || []),
    respuestas: transformRespuestas(pub.respuestas || []),
    satisfaccionCiudadano: pub.satisfaccion_ciudadano ?? null,
    comentarioSatisfaccion: pub.comentario_satisfaccion ?? null,
    departamentoAsignado: extractDepartamento(pub),
    tiempoRespuesta: calcTiempoRespuesta(pub.fecha_publicacion, pub.fecha_primera_respuesta),

    // Información adicional útil
    nombreCalle: pub.nombre_calle || null,
    numeroCalle: pub.numero_calle || null,
    juntaVecinal: pub.junta_vecinal?.nombre_junta || pub.junta_vecinal?.villa || null,
    fechaPublicacion: pub.fecha_publicacion || null,
  } as HistorialDenuncia;

  // Compat: si tu UI aún consume latitud/longitud top-level
  (resultado as any).latitud = coords?.lat ?? (isFiniteNumber(pub?.latitud) ? toNum(pub.latitud) : null);
  (resultado as any).longitud = coords?.lng ?? (isFiniteNumber(pub?.longitud) ? toNum(pub.longitud) : null);

  return resultado;
}

// ────────────────────────────────────────────────────────────────────────────────
// Servicio principal (clase) — API compat
// ────────────────────────────────────────────────────────────────────────────────

export class HistorialService {
  /** Limpia el caché en memoria (útil tras crear/editar una denuncia) */
  limpiarCache(): void {
    cache.clear();
    log.i('Caché de historial limpiado');
  }

  /** PING de conectividad al backend */
  async verificarConexion(): Promise<boolean> {
    try {
      log.i('Verificando conexión…');
      await apiService.get('/categorias/', true);
      return true;
    } catch (error: any) {
      log.e('Sin conexión:', error?.message ?? error);
      return false;
    }
  }

  /**
   * Obtiene el historial del usuario autenticado con filtros opcionales.
   * Usa caché temporal por URL. Ordena por fecha (desc) en el cliente.
   */
  async obtenerHistorial(filtros?: FiltrosHistorial): Promise<HistorialDenuncia[]> {
    log.i('Iniciando obtención de historial…');

    const usuarioId = await this.obtenerUsuarioId();
    const params = buildQueryParams(filtros, usuarioId);
    const url = `/publicaciones/?${params.toString()}`;

    const now = Date.now();
    const cached = cache.get(url);
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      log.d('Cache hit →', url);
      return cached.data;
    }

    const resp = (await apiService.get(url, true)) as ApiList<any>;
    const publicaciones = unwrapResults<any>(resp);

    if (publicaciones.length) {
      const p = publicaciones[0];
      log.d('Primera publicación:', {
        id: p?.id,
        codigo: p?.codigo,
        titulo: toStr(p?.titulo).slice(0, 30),
        keys: Object.keys(p ?? {}),
      });
    }

    const historial = publicaciones.map(transformPublicacion);
    historial.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

    cache.set(url, { ts: now, data: historial });
    log.i('Historial listo:', historial.length);
    return historial;
  }

  /**
   * Obtiene una denuncia por su ID. Devuelve null si 404.
   */
  async obtenerDenunciaPorId(id: string): Promise<HistorialDenuncia | null> {
    log.i('Buscando denuncia ID:', id);
    try {
      const p = await apiService.get(`/publicaciones/${id}/`, true);
      if (!p) return null;
      return transformPublicacion(p);
    } catch (error: any) {
      const msg = toStr(error?.message, 'desconocido');
      log.e('Error obteniendo denuncia:', msg);
      if (msg.includes('404')) return null;
      throw new Error(`Error al cargar denuncia: ${msg}`);
    }
  }

  /**
   * Obtiene estadísticas derivadas del historial del usuario actual.
   */
  async obtenerEstadisticas(): Promise<EstadisticasHistorial> {
    log.i('Calculando estadísticas…');
    try {
      const denuncias = await this.obtenerHistorial();
      return calcEstadisticas(denuncias);
    } catch (error: any) {
      log.e('Error calculando estadísticas:', error?.message ?? error);
      return estadisticasVacias();
    }
  }

  /** Marca una respuesta como leída si el backend lo soporta */
  async marcarRespuestaLeida(respuestaId: string): Promise<VoidResult> {
    log.i('Marcando respuesta como leída:', respuestaId);
    try {
      await apiService.patch(`/respuestas/${respuestaId}/leida/`, {}, true);
      return { ok: true };
    } catch (error: any) {
      log.w('Backend no soporta marcar respuestas o error:', error?.message ?? error);
      return { ok: false, message: toStr(error?.message, 'No soportado') };
    }
  }

  /** Envía calificación de satisfacción de una denuncia */
  async calificarSatisfaccion(
    denunciaId: string,
    calificacion: 1 | 2 | 3 | 4 | 5,
    comentario?: string
  ): Promise<VoidResult> {
    log.i('Enviando calificación:', { denunciaId, calificacion });
    try {
      await apiService.post(`/publicaciones/${denunciaId}/satisfaccion/`, { calificacion, comentario }, true);
      return { ok: true };
    } catch (error: any) {
      const msg = toStr(error?.message, 'No se pudo enviar la calificación');
      log.e('Error calificación:', msg);
      return { ok: false, message: msg };
    }
  }

  // ──────────────────────────────────────────────────────────
  // PRIVADOS
  // ──────────────────────────────────────────────────────────

  /** Determina el ID de usuario por cadena de estrategias con fallback dev */
  private async obtenerUsuarioId(): Promise<number> {
    log.d('Obteniendo ID del usuario…');

    // 1) Perfil cacheado
    try {
      const perfil = await apiService.getProfile();
      if (perfil?.id) {
        log.d('ID desde perfil:', perfil.id);
        return Number(perfil.id);
      }
    } catch (e) {
      log.w('Perfil no disponible, se intenta con token…');
    }

    // 2) Token JWT
    try {
      const info = await AuthHelper.getUserInfoFromToken();
      if (info?.userId) {
        log.d('ID desde token:', info.userId);
        return Number(info.userId);
      }
    } catch (e) {
      log.w('Token sin userId; se intenta con RUT…');
    }

    // 3) Búsqueda por RUT
    try {
      const info = await AuthHelper.getUserInfoFromToken();
      if (info?.rut) {
        log.d('Buscando por RUT:', info.rut);
        const usuarios = (await apiService.get('/usuarios/', true)) as ApiList<any>;
        const list = unwrapResults<any>(usuarios);
        const u = list.find((x) => x?.rut === info.rut);
        if (u?.id) {
          log.d('Usuario encontrado por RUT:', u.id);
          return Number(u.id);
        }
      }
    } catch (e) {
      log.w('Fallo búsqueda por RUT; se intenta fallback dev…');
    }

    throw new Error('No se pudo obtener el ID del usuario actual');
  }
}

export const historialService = new HistorialService();

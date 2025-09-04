// src/types/historial.ts - ACTUALIZADO CON 'sin_priorizar'

export interface Evidencia {
  id: string;
  tipo: 'imagen' | 'documento' | 'video';
  url: string;
  nombre: string;
  fechaSubida: string;
  descripcion?: string;
  size?: number; // Tamaño en bytes
  mimeType?: string;
}

export interface Respuesta {
  id: string;
  autor: string; // Nombre del funcionario
  mensaje: string;
  fechaRespuesta: string;
  tipo: 'respuesta' | 'actualizacion' | 'resolucion';
  esOficial: boolean;
  leida?: boolean; // Para marcar si el usuario ya leyó la respuesta
  evidencias?: Evidencia[];
}

export interface Ubicacion {
  direccion: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  referencias?: string;
}

export type EstadoDenuncia = 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado' | 'cerrado';

// ✅ ACTUALIZADO: Agregado 'sin_priorizar' para cuando el backend no tiene prioridades
export type PrioridadDenuncia = 'baja' | 'media' | 'alta' | 'sin_priorizar';

export interface HistorialDenuncia {
  id: string;
  numeroFolio: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: EstadoDenuncia;
  prioridad: PrioridadDenuncia; // ✅ Ahora incluye 'sin_priorizar'
  fechaCreacion: string;
  fechaActualizacion?: string;
  fechaResolucion?: string;
  ubicacion?: Ubicacion;
  evidencias: Evidencia[];
  respuestas: Respuesta[];
  satisfaccionCiudadano?: number | null; // 1-5 estrellas
  comentarioSatisfaccion?: string | null;
  departamentoAsignado?: string | null;
  tiempoRespuesta?: number | null; // Días para primera respuesta
}

export interface EstadisticasHistorial {
  totalDenuncias: number;
  resueltas: number;
  pendientes: number;
  enProceso: number;
  rechazadas: number;
  cerradas: number;
  tiempoPromedioRespuesta: number; // En días
  satisfaccionPromedio: number; // 1-5
  porcentajeResolucion: number;
  // Estadísticas adicionales
  denunciasPorCategoria: Record<string, number>;
  denunciasPorMes: Record<string, number>;
  tendencia: 'mejorando' | 'empeorando' | 'estable' | 'sin_datos';
}

export interface FiltrosHistorial {
  estado?: EstadoDenuncia[];
  categoria?: string[];
  prioridad?: PrioridadDenuncia[]; // ✅ Ahora incluye 'sin_priorizar'
  fechaDesde?: string;
  fechaHasta?: string;
  departamento?: string[];
  busqueda?: string; // Búsqueda en título/descripción
  ordenarPor?: 'fecha_creacion' | 'fecha_actualizacion' | 'prioridad' | 'estado';
  orden?: 'asc' | 'desc';
  limite?: number;
  pagina?: number;
}

export interface ResultadosFiltrados {
  denuncias: HistorialDenuncia[];
  total: number;
  paginas: number;
  paginaActual: number;
  filtrosAplicados: FiltrosHistorial;
}

// Tipos para notificaciones
export interface NotificacionDenuncia {
  id: string;
  denunciaId: string;
  tipo: 'respuesta' | 'cambio_estado' | 'asignacion' | 'resolucion';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  accionRequerida?: boolean;
  url?: string; // Deep link a la denuncia
}

// Tipos para exportación de datos
export interface ExportConfig {
  formato: 'pdf' | 'excel' | 'csv';
  incluirEvidencias: boolean;
  incluirRespuestas: boolean;
  filtros?: FiltrosHistorial;
  campos?: (keyof HistorialDenuncia)[];
}

// Estados de carga para historial
export interface HistorialLoadingState {
  cargandoDenuncias: boolean;
  cargandoEstadisticas: boolean;
  actualizandoDenuncia: boolean;
  exportando: boolean;
  error: string | null;
  ultimaActualizacion?: string;
}
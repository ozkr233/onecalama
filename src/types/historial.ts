// src/types/historial.ts 

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

export type PrioridadDenuncia = 'baja' | 'media' | 'alta' | 'sin_priorizar';

// ✅ CORREGIDO: Alineado con la estructura real del backend Django
export interface HistorialDenuncia {
  id: string;
  codigo: string; // ✅ CAMBIADO: Campo real del backend (era numeroFolio)
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: EstadoDenuncia;
  prioridad: PrioridadDenuncia;
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
  
  // ✅ NUEVO: Campos adicionales del backend que pueden ser útiles
  nombreCalle?: string; // nombre_calle del backend
  numeroCalle?: number; // numero_calle del backend
  juntaVecinal?: string; // Nombre de la junta vecinal
  fechaPublicacion?: string; // fecha_publicacion original del backend
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
  prioridad?: PrioridadDenuncia[];
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

// ✅ NUEVO: Interfaz que mapea directamente la estructura del backend Django
export interface PublicacionBackend {
  id: number;
  codigo: string; // P-YYYY-MM-XXXXXXXX
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  nombre_calle?: string;
  numero_calle: number;
  latitud: number;
  longitud: number;
  usuario: {
    id: number;
    nombre: string;
    rut: string;
    email?: string;
  };
  junta_vecinal: {
    id: number;
    nombre_junta?: string;
    villa?: string;
    comuna?: string;
  };
  categoria: {
    id: number;
    nombre: string;
    departamento: {
      id: number;
      nombre: string;
    };
  };
  departamento: {
    id: number;
    nombre: string;
  };
  situacion?: {
    id: number;
    nombre: string;
  };
  evidencias?: Array<{
    id: number;
    archivo: string;
    fecha: string;
    extension: string;
  }>;
  prioridad?: string; // 'alta' | 'media' | 'baja'
}

// ✅ NUEVO: Helper type para compatibilidad hacia atrás
export type HistorialDenunciaLegacy = HistorialDenuncia & {
  numeroFolio: string; // Alias para codigo
};
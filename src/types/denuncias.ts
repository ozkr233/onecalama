// src/types/denuncias.ts - ACTUALIZADO CON EVIDENCIAS
// Tipos basados en los modelos reales de Django

// NUEVO: Tipo para evidencias locales (antes de subir al servidor)
export interface Evidence {
  id: string;
  uri: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize?: number;
  uploadedAt?: string;
}

// ACTUALIZADO: DenunciaFormData con evidencias locales
export interface DenunciaFormData {
  [x: string]: any;
  titulo: string;
  descripcion: string;
  categoria: string;  // ID como string para el formulario
  departamento: string; // ID como string para el formulario
  direccion: string; //  campo unificado para dirección
  ubicacion?: LocationData; //  datos del mapa
  evidencias: Evidence[]; //  evidencias locales
}

// NUEVO: Tipo para datos de ubicación del mapa
export interface LocationData {
  latitud: number;
  longitud: number;
  address?: string;
}

// Tipo para evidencias en el servidor (formato backend)
export interface Evidencia {
  id?: number;
  archivo: string; // CloudinaryField URL
  fecha: string;
  extension: string;
  publicacion?: number;
}

// Exactamente como en models.py
export interface DepartamentoMunicipal {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Categoria {
  id: number;
  departamento: DepartamentoMunicipal; // Como en serializers.py
  nombre: string;
  descripcion?: string;
}

export interface JuntaVecinal {
  id: number;
  nombre_junta?: string;
  nombre_calle?: string;
  numero_calle: number;
  departamento?: string;
  villa?: string;
  comuna?: string;
  latitud: number; // DecimalField(max_digits=9, decimal_places=6)
  longitud: number; // DecimalField(max_digits=9, decimal_places=6)
}

export interface SituacionPublicacion {
  id: number;
  nombre: string;
  descripcion?: string;
}

// modelo Usuario
export interface Usuario {
  id: number;
  rut: string; // USERNAME_FIELD
  numero_telefonico_movil?: string;
  nombre: string;
  es_administrador: boolean;
  email: string;
  fecha_registro: string;
  esta_activo: boolean;
}

// 
export interface Publicacion {
  id: number;
  codigo: string; // Auto-generado P-YYYY-MM-XXXXXXXX
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  nombre_calle?: string;
  numero_calle: number;
  latitud: number;
  longitud: number;
  usuario: Usuario; // Como en PublicacionListSerializer
  junta_vecinal: JuntaVecinal;
  categoria: Categoria;
  departamento: DepartamentoMunicipal;
  situacion?: SituacionPublicacion;
  evidencias?: Evidencia[]; // evidencia_set en serializer
}

export interface RespuestaMunicipal {
  id: number;
  usuario: Usuario;
  publicacion: Publicacion;
  fecha: string;
  descripcion: string;
  acciones: string;
  situacion_inicial: string;
  situacion_posterior: string;
}

export interface AnuncioMunicipal {
  id: number;
  usuario: Usuario;
  titulo: string;
  subtitulo: string;
  estado: string;
  descripcion: string;
  categoria: Categoria;
  fecha: string;
  imagenes?: ImagenAnuncio[];
}

export interface ImagenAnuncio {
  id: number;
  anuncio: number;
  imagen: string; // CloudinaryField
  fecha: string;
  extension: string;
}

// Para la API response con paginación
export interface ApiResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Como espera tu PublicacionCreateUpdateSerializer
export interface CreatePublicacionPayload {
  titulo: string;
  descripcion: string;
  categoria: number; // ForeignKey ID
  departamento: number; // ForeignKey ID
  nombre_calle?: string;
  numero_calle: number;
  latitud: number;
  longitud: number;
  usuario: number; // Se obtendrá del usuario autenticado
  junta_vecinal: number; // ForeignKey ID
  situacion?: number; // Opcional
}

// Estados de carga
export interface LoadingState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Tipos para validaciones
export interface ValidationError {
  field: keyof DenunciaFormData;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}
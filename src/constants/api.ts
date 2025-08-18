// src/constants/api.ts - CORREGIDO SEGÚN TU BACKEND DJANGO

// URLs base según ambiente - CORREGIDAS
export const API_CONFIG = {
  development: {
    baseURL: 'http://192.168.8.103:8000/api/v1',  // ← AGREGADO /v1
    timeout: 10000,
    retries: 2
  },
  staging: {
    baseURL: 'https://staging-api.onecalama.cl/api/v1',  // ← AGREGADO /v1
    timeout: 8000,
    retries: 3
  },
  production: {
    baseURL: 'https://api.onecalama.cl/api/v1',  // ← AGREGADO /v1
    timeout: 8000,
    retries: 2
  }
};

// Ambiente actual
export const CURRENT_ENV = process.env.NODE_ENV === 'production' ? 'production' :
                          process.env.EXPO_PUBLIC_ENV === 'staging' ? 'staging' :
                          'development';

// Configuración activa
export const ACTIVE_CONFIG = API_CONFIG[CURRENT_ENV];

// Endpoints principales - CORREGIDOS SEGÚN TU BACKEND
export const ENDPOINTS = {
  // Autenticación - BASADO EN TUS URLS
  AUTH: {
    LOGIN: '/token/',                    // ← v1/token/
    REGISTER: '/registro/',              // ← v1/registro/
    REFRESH: '/token/refresh/',          // ← v1/token/refresh/
    LOGOUT: '/logout/',                  // Si tienes endpoint de logout
    PROFILE: '/usuarios/me/',            // Endpoint del perfil de usuario
  },

  // Datos maestros - NOMBRES EXACTOS DE TU BACKEND
  CATEGORIAS: '/categorias/',                        // ✅ v1/categorias/
  DEPARTAMENTOS: '/departamentos-municipales/',      // ✅ v1/departamentos-municipales/
  JUNTAS_VECINALES: '/juntas-vecinales/',           // ✅ v1/juntas-vecinales/
  SITUACIONES: '/situaciones-publicaciones/',       // ✅ v1/situaciones-publicaciones/

  // Publicaciones (denuncias) - BASADO EN TU VIEWSET
  PUBLICACIONES: '/publicaciones/',                  // ✅ v1/publicaciones/
  MIS_PUBLICACIONES: '/publicaciones/mis_publicaciones/', // Si tienes este action
  PUBLICACION_DETALLE: (id: number) => `/publicaciones/${id}/`,

  // Evidencias - EXACTO DE TU BACKEND
  EVIDENCIAS: '/evidencias/',                        // ✅ v1/evidencias/
  SUBIR_EVIDENCIA: '/evidencias/',                   // POST a evidencias/

  // Anuncios - EXACTO DE TU BACKEND
  ANUNCIOS: '/anuncios-municipales/',                // ✅ v1/anuncios-municipales/
  ANUNCIO_DETALLE: (id: number) => `/anuncios-municipales/${id}/`,

  // Respuestas municipales
  RESPUESTAS_MUNICIPALES: '/respuestas-municipales/', // ✅ v1/respuestas-municipales/

  // Estadísticas - BASADO EN TUS URLS
  ESTADISTICAS: {
    RESUMEN: '/resumen-estadisticas/',               // ✅ v1/resumen-estadisticas/
    POR_CATEGORIA: '/publicaciones-por-categoria/',  // ✅ v1/publicaciones-por-categoria/
    POR_MES: '/publicaciones-por-mes-y-categoria/',  // ✅ v1/publicaciones-por-mes-y-categoria/
    RESUELTOS: '/resueltos-por-mes/',               // ✅ v1/resueltos-por-mes/
    TASA_RESOLUCION: '/tasa-resolucion-departamento/', // ✅ v1/tasa-resolucion-departamento/
    POR_JUNTA: '/publicaciones-por-junta-vecinal/', // ✅ v1/publicaciones-por-junta-vecinal/
  },

  // Reportes - EXACTOS DE TU BACKEND
  REPORTES: {
    EXCEL: '/export-to-excel/',                      // ✅ v1/export-to-excel/
    PDF: '/generate-pdf-report/',                    // ✅ v1/generate-pdf-report/
  },

  // Utilidades (puedes agregar si las tienes)
  HEALTH: '/health/',                                // Si tienes health check
  VERSION: '/version/',                              // Si tienes endpoint de versión
} as const;

// Headers comunes - ACTUALIZADOS PARA DJANGO
export const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Client-Version': process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  'X-Platform': 'mobile',
  'X-Requested-With': 'XMLHttpRequest',  // ← Para Django CSRF si es necesario
} as const;

// Configuraciones de cache (TTL en milisegundos)
export const CACHE_CONFIG = {
  // Datos que cambian poco - cache largo
  CATEGORIAS: 30 * 60 * 1000,              // 30 minutos
  DEPARTAMENTOS: 30 * 60 * 1000,           // 30 minutos
  JUNTAS_VECINALES: 60 * 60 * 1000,        // 1 hora
  SITUACIONES: 60 * 60 * 1000,             // 1 hora

  // Datos dinámicos - cache corto
  PUBLICACIONES: 2 * 60 * 1000,            // 2 minutos
  ANUNCIOS: 5 * 60 * 1000,                 // 5 minutos
  RESPUESTAS: 1 * 60 * 1000,               // 1 minuto
  ESTADISTICAS: 5 * 60 * 1000,             // 5 minutos

  // Perfil usuario - cache medio
  PROFILE: 10 * 60 * 1000,                 // 10 minutos
} as const;

// Timeouts específicos por tipo de operación
export const TIMEOUTS = {
  // Operaciones rápidas
  GET_LIST: 8000,          // 8 segundos (más tiempo para Django)
  GET_DETAIL: 5000,        // 5 segundos

  // Operaciones de escritura
  CREATE: 15000,           // 15 segundos (subida de archivos)
  UPDATE: 10000,           // 10 segundos
  DELETE: 8000,            // 8 segundos

  // Operaciones especiales
  LOGIN: 10000,            // 10 segundos
  UPLOAD: 30000,           // 30 segundos
  DOWNLOAD: 20000,         // 20 segundos
  REPORTS: 60000,          // 1 minuto para reportes
} as const;

// Límites de paginación - AJUSTADOS PARA TU BACKEND
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  ANUNCIOS_PAGE_SIZE: 20,      // ← Más anuncios por página
  PUBLICACIONES_PAGE_SIZE: 15, // ← Más publicaciones por página
} as const;

// Configuración de reintentos por tipo de error
export const RETRY_CONFIG = {
  // Códigos de estado que deberían reintentarse
  RETRYABLE_STATUS_CODES: [500, 502, 503, 504, 408, 429], // ← Agregado 429 (Rate Limit)

  // Tipos de error de red que deberían reintentarse
  RETRYABLE_NETWORK_ERRORS: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'CONNECTION_ERROR',
    'DNS_ERROR'
  ],

  // Delay entre reintentos (ms) - MÁS AGRESIVO
  RETRY_DELAYS: [500, 1000, 2000], // Más rápido para desarrollo

  // Máximo número de reintentos por operación
  MAX_RETRIES: {
    GET: 3,      // ← Más reintentos para GET
    POST: 2,     // ← Más reintentos para POST
    PUT: 2,      // ← Más reintentos para PUT
    DELETE: 1,   // Sin cambios para DELETE
    UPLOAD: 2    // ← Más reintentos para uploads
  }
} as const;

// Configuración para uploads - OPTIMIZADA PARA CLOUDINARY
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 15 * 1024 * 1024,          // 15MB (más grande)
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic'    // ← Para iOS
  ],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  CHUNK_SIZE: 2 * 1024 * 1024,              // 2MB chunks (más grande)

  // Configuración específica para evidencias
  EVIDENCIAS: {
    MAX_COUNT: 5,                           // Máximo 5 evidencias por publicación
    REQUIRED_FIELDS: ['archivo'],           // Campos requeridos
    CLOUDINARY_FOLDER: 'evidencias/',      // Carpeta en Cloudinary
  }
} as const;

// Mensajes de error estandarizados - MÁS ESPECÍFICOS
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet y la conexión al servidor.',
  TIMEOUT: 'La operación tardó demasiado. El servidor puede estar sobrecargado.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado en el servidor.',
  SERVER_ERROR: 'Error interno del servidor. Intenta más tarde.',
  VALIDATION_ERROR: 'Los datos enviados no son válidos. Revisa la información.',
  RATE_LIMITED: 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.',
  FILE_TOO_LARGE: `El archivo es demasiado grande. Máximo ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024*1024)}MB`,
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
} as const;

// Estados de la aplicación
export const APP_STATES = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  IDLE: 'idle',
  UPLOADING: 'uploading',    // ← Nuevo estado para uploads
  REFRESHING: 'refreshing',  // ← Nuevo estado para refresh
} as const;

// Configuración de logs - MÁS DETALLADA
export const LOG_CONFIG = {
  ENABLE_API_LOGS: __DEV__,
  LOG_LEVEL: __DEV__ ? 'debug' : 'error',
  LOG_REQUESTS: __DEV__,
  LOG_RESPONSES: __DEV__,
  LOG_ERRORS: true,
  LOG_PERFORMANCE: __DEV__,     // ← Para medir tiempos de respuesta
  LOG_CACHE_HITS: __DEV__,      // ← Para debug de cache
} as const;
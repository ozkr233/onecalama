// src/constants/api.ts - ACTUALIZADO CON RESPUESTAS MUNICIPALES
// URLs base según ambiente - CORREGIDAS
export const API_CONFIG = {
  development: {
    baseURL: 'https://clubdelamusica-pruebas.com/api/v1',  //
    timeout: 10000,
    retries: 2
    // else http://192.168.1.176:8000/api/v1 , http://192.168.8.103:8000/api/v1, https://clubdelamusica-pruebas.com/api/v1 //
  },
  staging: {
    baseURL: 'https://staging-api.onecalama.cl/api/v1',  // 
    timeout: 8000,
    retries: 3
  },
  production: {
    baseURL: 'https://api.onecalama.cl/api/v1',  // 
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
    PROFILE: '/usuarios/',               // Endpoint del perfil de usuario
  },

  

  // Datos maestros - NOMBRES EXACTOS DE  BACKEND
  CATEGORIAS: '/categorias/',                        //  v1/categorias/
  DEPARTAMENTOS: '/departamentos-municipales/',      //  v1/departamentos-municipales/
  JUNTAS_VECINALES: '/juntas-vecinales/',           //  v1/juntas-vecinales/
  SITUACIONES: '/situaciones-publicaciones/',       //  v1/situaciones-publicaciones/

  // Publicaciones (denuncias) - BASADO EN  VIEWSET
  PUBLICACIONES: '/publicaciones/',                  //  v1/publicaciones/
  PUBLICACION_DETALLE: (id: number) => `/publicaciones/${id}/`,

  // Evidencias 
  EVIDENCIAS: '/evidencias/',                        // v1/evidencias/
  SUBIR_EVIDENCIA: '/evidencias/',                   // POST a evidencias/

  // Anuncios - 
  ANUNCIOS: '/anuncios-municipales/',                // v1/anuncios-municipales/
  ANUNCIO_DETALLE: (id: number) => `/anuncios-municipales/${id}/`,

  // Respuestas municipales -
  RESPUESTAS_MUNICIPALES: '/respuestas-municipales/', // v1/respuestas-municipales/
  RESPUESTAS_MUNICIPALES_POR_PUBLICACION: (id: number | string) => `/respuestas-municipales/por-publicacion/${id}/`,
  RESPUESTA_DETALLE: (id: number) => `/respuestas-municipales/${id}/`,


  // Estadísticas - 
  ESTADISTICAS: {
    RESUMEN: '/resumen-estadisticas/',               // v1/resumen-estadisticas/
    POR_CATEGORIA: '/publicaciones-por-categoria/',  // v1/publicaciones-por-categoria/
    POR_MES: '/publicaciones-por-mes-y-categoria/',  // v1/publicaciones-por-mes-y-categoria/
    RESUELTOS: '/resueltos-por-mes/',               // v1/resueltos-por-mes/
    TASA_RESOLUCION: '/tasa-resolucion-departamento/', // v1/tasa-resolucion-departamento/
    POR_JUNTA: '/publicaciones-por-junta-vecinal/', // v1/publicaciones-por-junta-vecinal/
    RESPUESTAS: '/estadisticas-respuestas/',         // v1/estadisticas-respuestas/
  },

  // Reportes - EXACTOS DE BACKEND
  REPORTES: {
    EXCEL: '/export-to-excel/',                      // v1/export-to-excel/
    PDF: '/generate-pdf-report/',                    // v1/generate-pdf-report/
  },

  // Utilidades (puedes agregar si las tienes)
  HEALTH: '/health/',                                // Si tienes health check
  VERSION: '/version/',                              // Si tienes endpoint de versión

  // Notificaciones push (a implementar en backend)
  NOTIFICACIONES: {
    REGISTRAR: '/notificaciones/registrar/',
    DESACTIVAR: '/notificaciones/desactivar/',
  },
} as const;

// Headers comunes -  DJANGO
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
  CATEGORIAS: 30 * 60 * 1000,        // 30 minutos
  DEPARTAMENTOS: 30 * 60 * 1000,     // 30 minutos  
  JUNTAS_VECINALES: 15 * 60 * 1000,  // 15 minutos
  SITUACIONES: 30 * 60 * 1000,       // 30 minutos

  // Datos que cambian seguido - cache corto
  PUBLICACIONES: 5 * 60 * 1000,      // 5 minutos
  ANUNCIOS: 10 * 60 * 1000,          // 10 minutos
  // Cache para respuestas municipales
  RESPUESTAS_MUNICIPALES: 5 * 60 * 1000, // 5 minutos

  // Estadísticas - cache medio
  ESTADISTICAS: 15 * 60 * 1000,      // 15 minutos
} as const;

// Configuraciones de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PREFETCH_PAGES: 2, // Páginas a precargar
} as const;

// Configuraciones de retry
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  BACKOFF_MULTIPLIER: 2,
  RETRY_ON_STATUS: [408, 429, 500, 502, 503, 504],
} as const;

// Tipos para filtros de respuestas municipales
export const RESPUESTAS_FILTERS = {
  TODAS: 'todas',
  PUNTUADAS: 'puntuadas', 
  SIN_PUNTUAR: 'sin_puntuar',
  POR_DEPARTAMENTO: 'por_departamento',
  POR_FUNCIONARIO: 'por_funcionario',
} as const;

// Configuraciones específicas para respuestas municipales
export const RESPUESTAS_CONFIG = {
  PUNTUACION_MIN: 1,
  PUNTUACION_MAX: 5,
  ITEMS_PER_PAGE: 15,
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
} as const;

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB por archivo
  EVIDENCIAS: {
    MAX_COUNT: 5, // Máximo 5 evidencias por publicación
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    MIN_DIMENSIONS: { width: 100, height: 100 },
    MAX_DIMENSIONS: { width: 4000, height: 4000 },
    QUALITY_COMPRESSION: 0.8,
  },
  TIMEOUT: {
    UPLOAD_SINGLE: 30000, // 30 segundos por archivo
    UPLOAD_MULTIPLE: 120000, // 2 minutos para múltiples archivos
  }
} as const;

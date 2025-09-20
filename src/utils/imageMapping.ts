// src/utils/imageMapping.ts - ACTUALIZADO con más IDs
// Sistema para mapear imágenes específicas por anuncio

export interface ImagePlaceholder {
  id: number;
  name: string;
  path: any; // require() return type
  description: string;
}

// Mapeo de imágenes placeholder disponibles
export const imagePlaceholders: ImagePlaceholder[] = [
  {
    id: 1,
    name: 'agua-corte',
    path: require('../../assets/images/icon.png'), // Cambiar por imagen específica
    description: 'Corte de agua y mantención'
  },
  {
    id: 2,
    name: 'vacunacion',
    path: require('../../assets/images/icon.png'),
    description: 'Jornadas de vacunación'
  },
  {
    id: 3,
    name: 'obras-viales',
    path: require('../../assets/images/icon.png'),
    description: 'Construcción y obras viales'
  },
  {
    id: 4,
    name: 'recoleccion-basura',
    path: require('../../assets/images/icon.png'),
    description: 'Recolección de residuos'
  },
  {
    id: 5,
    name: 'fumigacion',
    path: require('../../assets/images/icon.png'),
    description: 'Operativos sanitarios'
  },
  {
    id: 6,
    name: 'municipal-info',
    path: require('../../assets/images/icon.png'),
    description: 'Información municipal'
  },
  {
    id: 7,
    name: 'cultura-eventos',
    path: require('../../assets/images/icon.png'),
    description: 'Eventos culturales'
  },
  {
    id: 8,
    name: 'transito-semaforos',
    path: require('../../assets/images/icon.png'),
    description: 'Tránsito y señalización'
  },
  {
    id: 9,
    name: 'bienestar-animal',
    path: require('../../assets/images/icon.png'),
    description: 'Programas de bienestar animal'
  },
  {
    id: 10,
    name: 'convocatorias',
    path: require('../../assets/images/icon.png'),
    description: 'Concursos públicos'
  },
  // NUEVOS PLACEHOLDERS GENÉRICOS
  {
    id: 11,
    name: 'anuncio-general',
    path: require('../../assets/images/icon.png'),
    description: 'Anuncio municipal general'
  },
  {
    id: 12,
    name: 'servicios-municipales',
    path: require('../../assets/images/icon.png'),
    description: 'Servicios municipales'
  },
  {
    id: 13,
    name: 'comunicado-oficial',
    path: require('../../assets/images/icon.png'),
    description: 'Comunicado oficial'
  },
  {
    id: 14,
    name: 'atencion-ciudadana',
    path: require('../../assets/images/icon.png'),
    description: 'Atención al ciudadano'
  },
  {
    id: 15,
    name: 'default',
    path: require('../../assets/images/icon.png'),
    description: 'Imagen por defecto'
  }
];

// Mapeo específico de anuncio ID a imagen - EXPANDIDO
export const anuncioImageMapping: Record<number, string> = {
  // Mapeos originales
  1: 'agua-corte',           // Corte de Agua Programado
  2: 'vacunacion',           // Jornada de Vacunación  
  3: 'obras-viales',         // Cierre Temporal Calle
  4: 'recoleccion-basura',   // Nueva Ruta de Recolección
  5: 'fumigacion',           // Operativo de Fumigación
  6: 'municipal-info',       // Nuevo Horario de Atención
  7: 'cultura-eventos',      // Feria Costumbrista
  8: 'transito-semaforos',   // Mantención Semáforos
  9: 'bienestar-animal',     // Esterilización Canina
  10: 'convocatorias',       // Llamado a Concurso

  // MAPEOS PARA IDS FALTANTES (los que aparecen en tus logs)
  36: 'municipal-info',      // NUEVOS PUNTOS DE RECICLAJE
  37: 'comunicado-oficial',  // Prueba XD
  38: 'servicios-municipales', // TEMP_EVIDENCIA_TEST (ID 38)
  40: 'anuncio-general',     // TEMP_EVIDENCIA_TEST (ID 40)
  42: 'atencion-ciudadana',  // TEMP_EVIDENCIA (ID 42)

  // Mapeos genéricos para rangos de IDs
  ...generateRangeMapping(11, 50, 'anuncio-general'),
  ...generateRangeMapping(51, 100, 'servicios-municipales'),
  ...generateRangeMapping(101, 200, 'comunicado-oficial'),
};

// Función helper para generar mapeos de rangos
function generateRangeMapping(start: number, end: number, imageName: string): Record<number, string> {
  const mapping: Record<number, string> = {};
  for (let i = start; i <= end; i++) {
    // Solo asignar si no existe ya un mapeo específico
    if (!anuncioImageMapping[i]) {
      mapping[i] = imageName;
    }
  }
  return mapping;
}

/**
 * Obtiene la imagen correspondiente a un anuncio específico - MEJORADO
 */
export const getImageForAnuncio = (anuncioId: number): any => {
  let imageName = anuncioImageMapping[anuncioId];

  // Si no hay mapeo específico, usar lógica de fallback inteligente
  if (!imageName) {
    console.log(`ℹ️ No hay mapeo específico para anuncio ${anuncioId}, usando fallback inteligente`);
    
    // Fallback basado en rangos de ID
    if (anuncioId >= 1 && anuncioId <= 50) {
      imageName = 'anuncio-general';
    } else if (anuncioId >= 51 && anuncioId <= 100) {
      imageName = 'servicios-municipales';
    } else {
      imageName = 'default';
    }
  }

  const imageData = imagePlaceholders.find(img => img.name === imageName);

  if (!imageData) {
    console.warn(`⚠️ No se encontró imagen con nombre ${imageName}, usando imagen por defecto`);
    return require('../../assets/images/icon.png');
  }

  return imageData.path;
};

/**
 * Obtiene información descriptiva de la imagen para un anuncio - MEJORADO
 */
export const getImageInfoForAnuncio = (anuncioId: number): ImagePlaceholder | null => {
  let imageName = anuncioImageMapping[anuncioId];

  // Aplicar misma lógica de fallback que getImageForAnuncio
  if (!imageName) {
    if (anuncioId >= 1 && anuncioId <= 50) {
      imageName = 'anuncio-general';
    } else if (anuncioId >= 51 && anuncioId <= 100) {
      imageName = 'servicios-municipales';
    } else {
      imageName = 'default';
    }
  }

  return imagePlaceholders.find(img => img.name === imageName) || null;
};

/**
 * Debug: Obtiene estadísticas del mapeo de imágenes
 */
export const getImageMappingStats = () => {
  const totalMappings = Object.keys(anuncioImageMapping).length;
  const uniqueImages = new Set(Object.values(anuncioImageMapping)).size;
  const availablePlaceholders = imagePlaceholders.length;

  return {
    totalMappings,
    uniqueImages,
    availablePlaceholders,
    coverageRanges: [
      { range: '1-50', type: 'anuncio-general' },
      { range: '51-100', type: 'servicios-municipales' },
      { range: '100+', type: 'default' }
    ]
  };
};
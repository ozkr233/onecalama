// src/utils/imageMapping.ts
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
    path: require('../../assets/images/agua_corte.jpg'), // Por ahora usamos icon.png
    description: 'Corte de agua y mantención'
  },
  {
    id: 2,
    name: 'vacunacion',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Jornadas de vacunación'
  },
  {
    id: 3,
    name: 'obras-viales',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Construcción y obras viales'
  },
  {
    id: 4,
    name: 'recoleccion-basura',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Recolección de residuos'
  },
  {
    id: 5,
    name: 'fumigacion',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Operativos sanitarios'
  },
  {
    id: 6,
    name: 'municipal-info',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Información municipal'
  },
  {
    id: 7,
    name: 'cultura-eventos',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Eventos culturales'
  },
  {
    id: 8,
    name: 'transito-semaforos',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Tránsito y señalización'
  },
  {
    id: 9,
    name: 'bienestar-animal',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Programas de bienestar animal'
  },
  {
    id: 10,
    name: 'convocatorias',
    path: require('../../assets/images/icon.png'), // Por ahora usamos icon.png
    description: 'Concursos públicos'
  }
];

// Mapeo específico de anuncio ID a imagen
export const anuncioImageMapping: Record<number, string> = {
  1: 'agua-corte',           // Corte de Agua Programado
  2: 'vacunacion',           // Jornada de Vacunación
  3: 'obras-viales',         // Cierre Temporal Calle
  4: 'recoleccion-basura',   // Nueva Ruta de Recolección
  5: 'fumigacion',           // Operativo de Fumigación
  6: 'municipal-info',       // Nuevo Horario de Atención
  7: 'cultura-eventos',      // Feria Costumbrista
  8: 'transito-semaforos',   // Mantención Semáforos
  9: 'bienestar-animal',     // Esterilización Canina
  10: 'convocatorias'        // Llamado a Concurso
};

/**
 * Obtiene la imagen correspondiente a un anuncio específico
 */
export const getImageForAnuncio = (anuncioId: number): any => {
  const imageName = anuncioImageMapping[anuncioId];

  if (!imageName) {
    // Imagen por defecto si no se encuentra mapeo
    console.warn(`No se encontró imagen para anuncio ${anuncioId}, usando imagen por defecto`);
    return require('../../assets/images/icon.png');
  }

  const imageData = imagePlaceholders.find(img => img.name === imageName);

  if (!imageData) {
    console.warn(`No se encontró imagen con nombre ${imageName}, usando imagen por defecto`);
    return require('../../assets/images/icon.png');
  }

  return imageData.path;
};

/**
 * Obtiene información descriptiva de la imagen para un anuncio
 */
export const getImageInfoForAnuncio = (anuncioId: number): ImagePlaceholder | null => {
  const imageName = anuncioImageMapping[anuncioId];

  if (!imageName) {
    return null;
  }

  return imagePlaceholders.find(img => img.name === imageName) || null;
};

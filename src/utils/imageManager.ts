// src/utils/imageManager.ts - VERSIÓN CORREGIDA
import { AnuncioMunicipal } from '../types/denuncias';
import { getImageForAnuncio, getImageInfoForAnuncio, imagePlaceholders } from './imageMapping';

// Configuración de Cloudinary
const CLOUDINARY_CONFIG = {
  cloudName: 'de06451wd',
  baseUrl: 'https://res.cloudinary.com/de06451wd',
};

export interface ProcessedImage {
  id: string;
  url: string;
  source: 'cloudinary' | 'local' | 'fallback';
  optimized: boolean;
  fallback?: any;
  description?: string;
  extension?: string;
  width?: number;
  height?: number;
}

export class ImageManager {
  
  /**
   * Construye URL completa de Cloudinary - CORREGIDA
   */
  private static getCloudinaryUrl(imagePath: string): string {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si la ruta ya incluye "image/upload", usar directamente
    if (imagePath.includes('image/upload/')) {
      return `${CLOUDINARY_CONFIG.baseUrl}/${imagePath}`;
    }
    
    // Si no, agregar el prefijo de upload
    return `${CLOUDINARY_CONFIG.baseUrl}/image/upload/${imagePath}`;
  }

  /**
   * Obtiene URL optimizada - MEJORADA para tamaños fijos
   */
  private static getOptimizedCloudinaryUrl(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
      crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'limit';
    } = {}
  ): string {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const { 
      width, 
      height, 
      quality = 'auto', 
      format = 'auto', 
      crop = 'limit' // ← CAMBIO: limit para evitar que se salga de los límites
    } = options;
    
    const transformations = [];
    
    // Siempre agregar dimensiones para controlar el tamaño
    if (width || height) {
      let sizeParam = '';
      if (width) sizeParam += `w_${width}`;
      if (height) sizeParam += (sizeParam ? ',' : '') + `h_${height}`;
      sizeParam += `,c_${crop}`;
      transformations.push(sizeParam);
    }
    
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    const transformString = transformations.join(',');
    
    // Construir URL correcta
    if (imagePath.includes('image/upload/')) {
      // Ya incluye image/upload, insertar transformaciones
      return `${CLOUDINARY_CONFIG.baseUrl}/${imagePath.replace('image/upload/', `image/upload/${transformString}/`)}`;
    } else {
      // No incluye, agregar todo
      return `${CLOUDINARY_CONFIG.baseUrl}/image/upload/${transformString}/${imagePath}`;
    }
  }

  /**
   * Imagen fallback por defecto - NUEVO
   */
  private static getDefaultFallback(): ProcessedImage {
    return {
      id: 'fallback-default',
      url: require('../../assets/images/icon.png'),
      source: 'fallback',
      optimized: false,
      description: 'Imagen no disponible',
      width: 200,
      height: 200
    };
  }

  /**
   * MÉTODO PRINCIPAL: Obtiene imágenes procesadas - MEJORADO
   */
  static getProcessedImages(
    anuncio: AnuncioMunicipal,
    options: {
      preferCloudinary?: boolean;
      maxWidth?: number;
      maxHeight?: number;
      thumbnailSize?: number;
    } = {}
  ): ProcessedImage[] {
    const { 
      preferCloudinary = true, 
      maxWidth = 350,
      maxHeight = 250,
      thumbnailSize = 150 
    } = options;

    const processedImages: ProcessedImage[] = [];

    // ESTRATEGIA 1: Usar imágenes del backend si están disponibles
    if (preferCloudinary && anuncio.imagenes && anuncio.imagenes.length > 0) {
      console.log(`🖼️ Usando ${anuncio.imagenes.length} imagen(es) desde Cloudinary para anuncio ${anuncio.id}`);
      
      anuncio.imagenes.forEach((img, index) => {
        const optimizedUrl = this.getOptimizedCloudinaryUrl(img.imagen, {
          width: maxWidth,
          height: maxHeight,
          quality: 'auto',
          format: 'auto',
          crop: 'limit' // No exceder dimensiones
        });

        processedImages.push({
          id: `cloudinary-${img.id}`,
          url: optimizedUrl,
          source: 'cloudinary',
          optimized: true,
          description: `Imagen ${index + 1} del anuncio`,
          extension: img.extension,
          width: maxWidth,
          height: maxHeight
        });
      });

      return processedImages;
    }

    // ESTRATEGIA 2: Usar placeholder local específico
    console.log(`📱 Usando imagen placeholder local para anuncio ${anuncio.id}`);
    
    const localImage = getImageForAnuncio(anuncio.id);
    const imageInfo = getImageInfoForAnuncio(anuncio.id);

    if (localImage) {
      processedImages.push({
        id: `local-${anuncio.id}`,
        url: localImage,
        source: 'local',
        optimized: false,
        description: imageInfo?.description || 'Imagen temática',
        width: maxWidth,
        height: maxHeight
      });
      return processedImages;
    }

    // ESTRATEGIA 3: Fallback por defecto
    console.log(`🔄 Usando imagen fallback por defecto para anuncio ${anuncio.id}`);
    processedImages.push(this.getDefaultFallback());
    
    return processedImages;
  }

  /**
   * Obtiene solo la imagen principal - MEJORADO
   */
  static getPrimaryImage(
    anuncio: AnuncioMunicipal,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
    }
  ): ProcessedImage {
    const images = this.getProcessedImages(anuncio, options);
    return images[0] || this.getDefaultFallback();
  }

  /**
   * Obtiene thumbnail optimizado - MEJORADO
   */
  static getThumbnail(
    anuncio: AnuncioMunicipal,
    size: number = 150
  ): ProcessedImage {
    // Para thumbnails, siempre usar dimensiones exactas
    if (anuncio.imagenes && anuncio.imagenes.length > 0) {
      const img = anuncio.imagenes[0];
      const thumbnailUrl = this.getOptimizedCloudinaryUrl(img.imagen, {
        width: size,
        height: size,
        crop: 'fill', // Para thumbnails cuadrados, usar fill
        quality: 'auto',
        format: 'auto'
      });

      return {
        id: `thumb-${img.id}`,
        url: thumbnailUrl,
        source: 'cloudinary',
        optimized: true,
        extension: img.extension,
        width: size,
        height: size
      };
    }

    // Fallback local
    const localImage = getImageForAnuncio(anuncio.id);
    if (localImage) {
      const imageInfo = getImageInfoForAnuncio(anuncio.id);
      return {
        id: `thumb-local-${anuncio.id}`,
        url: localImage,
        source: 'local',
        optimized: false,
        description: imageInfo?.description,
        width: size,
        height: size
      };
    }

    // Fallback final
    return {
      ...this.getDefaultFallback(),
      width: size,
      height: size
    };
  }

  /**
   * Test de URL específica - NUEVO para debug
   */
  static async testImageUrl(url: string): Promise<boolean> {
    try {
      console.log('🧪 Testing image URL:', url);
      const response = await fetch(url, { method: 'HEAD' });
      const success = response.ok;
      console.log(`${success ? '✅' : '❌'} Image test result:`, response.status);
      return success;
    } catch (error) {
      console.log('❌ Image test failed:', error.message);
      return false;
    }
  }

  /**
   * Información de debug mejorada
   */
  static getImageDebugInfo(anuncio: AnuncioMunicipal) {
    const cloudinaryImages = anuncio.imagenes || [];
    const localImage = getImageForAnuncio(anuncio.id);
    const imageInfo = getImageInfoForAnuncio(anuncio.id);

    return {
      anuncioId: anuncio.id,
      titulo: anuncio.titulo,
      cloudinary: {
        available: cloudinaryImages.length > 0,
        count: cloudinaryImages.length,
        images: cloudinaryImages.map(img => ({
          id: img.id,
          originalPath: img.imagen,
          fullUrl: this.getCloudinaryUrl(img.imagen),
          optimizedUrl: this.getOptimizedCloudinaryUrl(img.imagen, {
            width: 350,
            height: 250,
            quality: 'auto'
          }),
          extension: img.extension
        }))
      },
      local: {
        available: !!localImage,
        mapped: !!imageInfo,
        info: imageInfo
      },
      finalStrategy: cloudinaryImages.length > 0 
        ? 'cloudinary' 
        : (localImage ? 'local' : 'fallback')
    };
  }

  /**
   * Verifica si un anuncio tiene algún tipo de imagen
   */
  static hasImages(anuncio: AnuncioMunicipal): boolean {
    return !!(anuncio.imagenes?.length || getImageForAnuncio(anuncio.id));
  }

  /**
   * Cuenta total de imágenes
   */
  static getImageCount(anuncio: AnuncioMunicipal): number {
    if (anuncio.imagenes && anuncio.imagenes.length > 0) {
      return anuncio.imagenes.length;
    }
    return this.hasImages(anuncio) ? 1 : 0;
  }
}

// Funciones de conveniencia
export const getAnuncioImages = (anuncio: AnuncioMunicipal, maxWidth?: number, maxHeight?: number) => 
  ImageManager.getProcessedImages(anuncio, { maxWidth, maxHeight });

export const getAnuncioPrimaryImage = (anuncio: AnuncioMunicipal, maxWidth?: number, maxHeight?: number) => 
  ImageManager.getPrimaryImage(anuncio, { maxWidth, maxHeight });

export const getAnuncioThumbnail = (anuncio: AnuncioMunicipal, size?: number) => 
  ImageManager.getThumbnail(anuncio, size);

export const hasAnuncioImages = (anuncio: AnuncioMunicipal) => 
  ImageManager.hasImages(anuncio);
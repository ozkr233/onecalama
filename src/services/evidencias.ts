// src/services/evidencias.ts - SERVICIO PARA MANEJAR EVIDENCIAS
import { Evidence } from '../types/denuncias';
import { UPLOAD_CONFIG } from '../constants/api';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class EvidenciasService {
  /**
   * Validar evidencias antes de subirlas
   */
  validateEvidencias(evidencias: Evidence[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log(`🔍 Validando ${evidencias.length} evidencias...`);

    // Validar cantidad
    if (evidencias.length > UPLOAD_CONFIG.EVIDENCIAS.MAX_COUNT) {
      errors.push(
        `Máximo ${UPLOAD_CONFIG.EVIDENCIAS.MAX_COUNT} evidencias permitidas`
      );
    }

    // Validar cada evidencia
    evidencias.forEach((evidencia, index) => {
      if (!evidencia.uri) {
        errors.push(`Evidencia ${index + 1}: URI requerida`);
      }
      if (!evidencia.fileName) {
        errors.push(`Evidencia ${index + 1}: Nombre de archivo requerido`);
      }
      if (
        evidencia.fileSize &&
        evidencia.fileSize > UPLOAD_CONFIG.MAX_FILE_SIZE
      ) {
        errors.push(
          `Evidencia ${index + 1}: Archivo demasiado grande (máx ${
            UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
          }MB)`
        );
      }

      const extension = this.getFileExtension(evidencia.fileName);
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic'];

      if (!allowedExtensions.includes(extension.toLowerCase())) {
        errors.push(
          `Evidencia ${index + 1}: Tipo de archivo no permitido (${extension})`
        );
      }

      if (evidencia.fileSize && evidencia.fileSize > 5 * 1024 * 1024) {
        warnings.push(
          `Evidencia ${index + 1}: Archivo grande (${Math.round(
            evidencia.fileSize / (1024 * 1024)
          )}MB), puede tardar en subir`
        );
      }
    });

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    console.log('📋 Resultado validación:', {
      válidas: result.isValid,
      errores: errors.length,
      advertencias: warnings.length,
    });

    return result;
  }

  /**
   * Subir evidencias usando el workaround
   */
  async subirEvidencias(
    publicacionId: number,
    evidencias: Evidence[]
  ): Promise<any[]> {
    if (!evidencias || evidencias.length === 0) {
      console.log('📎 No hay evidencias para subir');
      return [];
    }

    console.log(
      `📤 Iniciando subida de ${evidencias.length} evidencias para publicación ${publicacionId}...`
    );

    try {
      const workaroundModule = await import('./evidenciasWorkaround');
      const EvidenciasWorkaround = (workaroundModule as any).default;
      const instanciaWorkaround =
        (workaroundModule as any).evidenciasService ??
        new EvidenciasWorkaround();

      const workaroundOK =
        !!instanciaWorkaround &&
        typeof instanciaWorkaround.subirEvidencias === 'function';

      console.log('🔧 Workaround importado correctamente:', workaroundOK);
      console.log(
        '🔍 Métodos disponibles:',
        Object.getOwnPropertyNames(
          Object.getPrototypeOf(instanciaWorkaround ?? {})
        )
      );

      if (!workaroundOK) {
        throw new Error('Workaround no disponible o método no encontrado');
      }

      const resultados = await instanciaWorkaround.subirEvidencias(
        publicacionId,
        evidencias
      );

      console.log(
        `✅ Subida completada: ${resultados?.length ?? 0} evidencias procesadas`
      );

      return resultados ?? [];
    } catch (error: any) {
      console.error('❌ Error en servicio de evidencias:', error);
      throw new Error(
        `Error subiendo evidencias: ${error?.message ?? String(error)}`
      );
    }
  }

  /**
   * Subir una sola evidencia
   */
  async subirEvidencia(
    publicacionId: number,
    evidencia: Evidence
  ): Promise<any> {
    console.log(`📤 Subiendo evidencia individual: ${evidencia.fileName}`);

    try {
      const workaroundModule = await import('./evidenciasWorkaround');
      const EvidenciasWorkaround = (workaroundModule as any).default;
      const instanciaWorkaround =
        (workaroundModule as any).evidenciasService ??
        new EvidenciasWorkaround();

      if (
        !instanciaWorkaround ||
        typeof instanciaWorkaround.subirEvidenciaWorkaround !== 'function'
      ) {
        throw new Error('Workaround no disponible');
      }

      const resultado =
        await instanciaWorkaround.subirEvidenciaWorkaround(
          publicacionId,
          evidencia
        );

      console.log(`✅ Evidencia subida exitosamente: ${evidencia.fileName}`);
      return resultado;
    } catch (error: any) {
      console.error(`❌ Error subiendo evidencia ${evidencia.fileName}:`, error);
      throw new Error(
        `Error subiendo ${evidencia.fileName}: ${error?.message ?? String(error)}`
      );
    }
  }

  /**
   * Validar un solo archivo
   */
  validateSingleFile(evidencia: Evidence): { isValid: boolean; error?: string } {
    if (!evidencia.uri) {
      return { isValid: false, error: 'Archivo sin URI válida' };
    }
    if (!evidencia.fileName) {
      return { isValid: false, error: 'Archivo sin nombre' };
    }
    if (
      evidencia.fileSize &&
      evidencia.fileSize > UPLOAD_CONFIG.MAX_FILE_SIZE
    ) {
      const maxMB = UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
      return {
        isValid: false,
        error: `Archivo demasiado grande (máx ${maxMB}MB)`,
      };
    }

    const extension = this.getFileExtension(evidencia.fileName);
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic'];

    if (!allowedExtensions.includes(extension.toLowerCase())) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido: ${extension}`,
      };
    }

    return { isValid: true };
  }

  getEvidenciasStats(evidencias: Evidence[]) {
    const totalSize = evidencias.reduce(
      (sum, ev) => sum + (ev.fileSize || 0),
      0
    );
    const avgSize =
      evidencias.length > 0 ? totalSize / evidencias.length : 0;

    return {
      count: evidencias.length,
      maxAllowed: UPLOAD_CONFIG.EVIDENCIAS.MAX_COUNT,
      totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
      avgSizeMB: Math.round((avgSize / (1024 * 1024)) * 100) / 100,
      canAddMore: evidencias.length < UPLOAD_CONFIG.EVIDENCIAS.MAX_COUNT,
    };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    );
  }

  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  cleanupTempEvidencias(evidencias: Evidence[]): void {
    console.log(`🧹 Limpiando ${evidencias.length} evidencias temporales...`);
  }

  getPreviewUrl(evidencia: Evidence): string {
    return evidencia.uri;
  }

  isImage(evidencia: Evidence): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
    const extension = this.getFileExtension(evidencia.fileName);
    return imageExtensions.includes(extension.toLowerCase());
  }

  createTestEvidence(): Evidence {
    return {
      id: `test_${Date.now()}`,
      uri: 'https://via.placeholder.com/300x200/E67E22/ffffff?text=Test+Image',
      type: 'image',
      fileName: `test_evidence_${Date.now()}.jpg`,
      fileSize: 150000,
    };
  }
}

// Instancia singleton del servicio
export const evidenciasService = new EvidenciasService();
export default EvidenciasService;

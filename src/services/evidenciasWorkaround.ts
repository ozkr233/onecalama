// src/services/evidenciasWorkaround.ts - CON NUEVO SERIALIZER
import { ACTIVE_CONFIG } from '../constants/api';
import { Evidence } from '../types/denuncias';
import AuthHelper from '../utils/authHelper';

class EvidenciasWorkaround {

  /**
   * Subir evidencia directamente al endpoint de evidencias
   * Ahora que el serializer está arreglado, podemos usar el endpoint directo
   */
  async subirEvidenciaDirecta(publicacionId: number, evidencia: Evidence): Promise<any> {
    try {
      console.log(`📎 Subiendo evidencia directa: ${evidencia.fileName}`);
      console.log(`📄 Para publicación: ${publicacionId}`);

      const token = await AuthHelper.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Crear FormData para el endpoint de evidencias
      const formData = new FormData();

      formData.append('archivo', {
        uri: evidencia.uri,
        type: 'image/jpeg',
        name: evidencia.fileName,
      } as any);

      formData.append('publicacion_id', publicacionId.toString());
      formData.append('extension', this.getFileExtension(evidencia.fileName));
      formData.append('fecha', new Date().toISOString());

      console.log('📤 FormData para evidencias:');
      console.log(`   archivo: ${evidencia.fileName}`);
      console.log(`   publicacion_id: ${publicacionId}`);
      console.log(`   extension: ${this.getFileExtension(evidencia.fileName)}`);

      const response = await fetch(`${ACTIVE_CONFIG.baseURL}/evidencias/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log(`📡 Respuesta evidencias: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const evidencia = await response.json();
        console.log('✅ Evidencia subida exitosamente:', evidencia);

        // Construir URL completa para la respuesta
        const urlCompleta = this.construirUrlCompleta(evidencia.archivo);

        return {
          ...evidencia,
          archivo_url: urlCompleta, // URL completa para mostrar
          archivo_path: evidencia.archivo, // Ruta relativa original
        };
      } else {
        const errorText = await response.text();
        console.error('❌ Error subiendo evidencia:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

    } catch (error) {
      console.error(`❌ Error en subida directa:`, error);
      throw new Error(`Subida falló: ${error.message}`);
    }
  }

  /**
   * MÉTODO PRINCIPAL: Subir evidencia con fallback al workaround
   * Intenta primero la subida directa, si falla usa el workaround
   */
  async subirEvidencia(publicacionId: number, evidencia: Evidence): Promise<any> {
    try {
      console.log(`🚀 Intentando subida directa primero...`);

      // Intentar subida directa primero
      return await this.subirEvidenciaDirecta(publicacionId, evidencia);

    } catch (error) {
      console.warn(`⚠️ Subida directa falló, usando workaround:`, error.message);

      // Si falla, usar el workaround como fallback
      return await this.subirEvidenciaWorkaround(publicacionId, evidencia);
    }
  }

  /**
   * Workaround usando imagenes-anuncios (fallback)
   * Mantener por si el endpoint directo falla
   */
  async subirEvidenciaWorkaround(publicacionId: number, evidencia: Evidence): Promise<any> {
    try {
      console.log(`🔧 WORKAROUND: Usando imagenes-anuncios como fallback...`);

      const token = await AuthHelper.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // 1. Crear anuncio temporal
      const anuncioId = await this.crearAnuncioTemporal(token);

      // 2. Subir imagen via anuncio
      const imagenSubida = await this.subirImagenViaAnuncio(anuncioId, evidencia, token);

      // 3. Crear evidencia virtual
      const evidenciaVirtual = {
        id: `virtual_${Date.now()}`,
        publicacion: publicacionId,
        archivo: imagenSubida.imagen, // Ruta relativa
        archivo_url: this.construirUrlCompleta(imagenSubida.imagen), // URL completa
        fecha: new Date().toISOString(),
        extension: this.getFileExtension(evidencia.fileName),
        workaround: true,
        status: 'imagen_disponible'
      };

      // 4. Limpiar anuncio temporal
      await this.limpiarAnuncioTemporal(anuncioId, token);

      console.log('✅ Workaround completado');
      return evidenciaVirtual;

    } catch (error) {
      console.error(`❌ Error en workaround:`, error);
      throw error;
    }
  }

  /**
   * Subir múltiples evidencias
   */
  async subirEvidencias(publicacionId: number, evidencias: Evidence[]): Promise<any[]> {
    if (!evidencias || evidencias.length === 0) {
      return [];
    }

    console.log(`📎 Subiendo ${evidencias.length} evidencias...`);

    const resultados: any[] = [];
    const errores: string[] = [];

    for (let i = 0; i < evidencias.length; i++) {
      const evidencia = evidencias[i];

      try {
        console.log(`📎 Subiendo ${i + 1}/${evidencias.length}: ${evidencia.fileName}`);

        const resultado = await this.subirEvidencia(publicacionId, evidencia);
        resultados.push(resultado);

        // Pausa entre uploads
        if (i < evidencias.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`❌ Error subiendo ${evidencia.fileName}:`, error);
        errores.push(`${evidencia.fileName}: ${error.message}`);
      }
    }

    console.log(`✅ Subida completada: ${resultados.length} exitosas, ${errores.length} errores`);
    return resultados;
  }

  // ===== MÉTODOS PRIVADOS (para workaround) =====

  private async crearAnuncioTemporal(token: string): Promise<number> {
    // Obtener usuario actual del token decodificado
    const userInfo = await AuthHelper.getUserInfoFromToken();
    const usuarioId = userInfo?.userId || 1; // Fallback

    // Obtener primera categoría
    const categoriasResponse = await fetch(`${ACTIVE_CONFIG.baseURL}/categorias/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const categorias = await categoriasResponse.json();
    const primeraCategoria = categorias.results?.[0] || categorias[0];

    const anuncioTemporal = {
      titulo: 'TEMP_EVIDENCIA',
      subtitulo: 'Anuncio temporal para evidencias',
      descripcion: 'Se eliminará automáticamente',
      categoria: primeraCategoria.id,
      usuario: usuarioId,
      estado: 'Temporal'
    };

    const response = await fetch(`${ACTIVE_CONFIG.baseURL}/anuncios-municipales/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(anuncioTemporal),
    });

    if (!response.ok) {
      throw new Error(`Error creando anuncio temporal: ${response.status}`);
    }

    const anuncio = await response.json();
    return anuncio.id;
  }

  private async subirImagenViaAnuncio(anuncioId: number, evidencia: Evidence, token: string): Promise<any> {
    const formData = new FormData();

    formData.append('imagen', {
      uri: evidencia.uri,
      type: 'image/jpeg',
      name: evidencia.fileName,
    } as any);

    formData.append('anuncio', anuncioId.toString());
    formData.append('extension', this.getFileExtension(evidencia.fileName));

    const response = await fetch(`${ACTIVE_CONFIG.baseURL}/imagenes-anuncios/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error subiendo imagen: ${response.status}`);
    }

    return await response.json();
  }

  private async limpiarAnuncioTemporal(anuncioId: number, token: string): Promise<void> {
    try {
      await fetch(`${ACTIVE_CONFIG.baseURL}/anuncios-municipales/${anuncioId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar anuncio temporal:', error);
    }
  }

  private construirUrlCompleta(rutaRelativa: string): string {
    return `https://res.cloudinary.com/de06451wd/${rutaRelativa}`;
  }

  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
  }
}

export const evidenciasService = new EvidenciasWorkaround();
export default EvidenciasWorkaround;
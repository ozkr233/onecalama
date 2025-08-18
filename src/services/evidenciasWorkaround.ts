// src/services/evidenciasWorkaround.ts - VERSIÓN FINAL SIMPLIFICADA
import { ACTIVE_CONFIG } from '../constants/api';
import { Evidence } from '../types/denuncias';
import AuthHelper from '../utils/authHelper';
import UserHelper from '../utils/userHelper';

class EvidenciasWorkaround {

  /**
   * Subir evidencia usando el endpoint de imagenes-anuncios que SÍ funciona
   * SOLUCIÓN FINAL: Solo sube imagen, crea evidencia virtual
   */
  async subirEvidenciaWorkaround(publicacionId: number, evidencia: Evidence): Promise<any> {
    try {
      console.log(`🔧 WORKAROUND: Subiendo evidencia via imagenes-anuncios...`);
      console.log(`📎 Archivo: ${evidencia.fileName} para publicación ${publicacionId}`);

      const token = await AuthHelper.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // 1. Crear anuncio temporal
      const anuncioId = await this.crearAnuncioTemporal(token);
      console.log(`📝 Anuncio temporal creado: ${anuncioId}`);

      // 2. Subir imagen usando el endpoint que SÍ funciona
      const imagenSubida = await this.subirImagenViaAnuncio(anuncioId, evidencia, token);
      console.log('✅ Imagen subida exitosamente:', imagenSubida.imagen);

      // 3. Crear evidencia virtual (BD de evidencias está rota)
      const evidenciaVirtual = {
        id: `virtual_${Date.now()}`,
        publicacion: publicacionId,
        archivo: this.construirUrlCompleta(imagenSubida.imagen),
        fecha: new Date().toISOString(),
        extension: this.getFileExtension(evidencia.fileName),
        workaround: true,
        status: 'imagen_disponible',
        cloudinary_path: imagenSubida.imagen,
        nota: 'Imagen subida exitosamente a Cloudinary, evidencia virtual por workaround'
      };

      // 4. Limpiar anuncio temporal
      await this.limpiarAnuncioTemporal(anuncioId, token);

      console.log('✅ Workaround completado exitosamente');
      return evidenciaVirtual;

    } catch (error) {
      console.error(`❌ Error en workaround:`, error);
      throw new Error(`Workaround falló: ${error.message}`);
    }
  }

  /**
   * Crear anuncio temporal para usar su endpoint de imágenes
   */
  private async crearAnuncioTemporal(token: string): Promise<number> {
    try {
      console.log('👤 Obteniendo ID del usuario...');
      const usuarioId = await UserHelper.getCurrentUserId();

      console.log('📋 Obteniendo categorías...');
      const categoriasResponse = await fetch(`${ACTIVE_CONFIG.baseURL}/categorias/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!categoriasResponse.ok) {
        throw new Error('No se pudieron obtener las categorías');
      }

      const categorias = await categoriasResponse.json();
      const primeraCategoria = categorias.results?.[0] || categorias[0];

      if (!primeraCategoria) {
        throw new Error('No hay categorías disponibles');
      }

      const anuncioTemporal = {
        titulo: 'TEMP_EVIDENCIA',
        subtitulo: 'Anuncio temporal para workaround de evidencias',
        descripcion: 'Este anuncio se eliminará automáticamente',
        categoria: primeraCategoria.id,
        usuario: usuarioId,
        estado: 'Temporal'
      };

      const response = await fetch(`${ACTIVE_CONFIG.baseURL}/anuncios-municipales/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(anuncioTemporal),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error creando anuncio temporal: ${response.status} - ${errorText}`);
      }

      const anuncio = await response.json();
      return anuncio.id;

    } catch (error) {
      console.error('❌ Error creando anuncio temporal:', error);
      throw error;
    }
  }

  /**
   * Subir imagen via endpoint de imagenes-anuncios
   */
  private async subirImagenViaAnuncio(anuncioId: number, evidencia: Evidence, token: string): Promise<any> {
    try {
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
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error subiendo imagen: ${response.status} - ${errorText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      throw error;
    }
  }

  /**
   * Limpiar anuncio temporal
   */
  private async limpiarAnuncioTemporal(anuncioId: number, token: string): Promise<void> {
    try {
      console.log(`🗑️ Eliminando anuncio temporal ${anuncioId}...`);

      const response = await fetch(`${ACTIVE_CONFIG.baseURL}/anuncios-municipales/${anuncioId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        console.log('✅ Anuncio temporal eliminado');
      } else {
        console.warn('⚠️ No se pudo eliminar anuncio temporal (no crítico)');
      }

    } catch (error) {
      console.warn('⚠️ Error eliminando anuncio temporal (no crítico):', error);
    }
  }

  /**
   * Construir URL completa de Cloudinary
   */
  private construirUrlCompleta(rutaRelativa: string): string {
    const baseUrl = 'https://res.cloudinary.com/de06451wd/';
    return baseUrl + rutaRelativa;
  }

  /**
   * Obtener extensión del archivo
   */
  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
  }

  /**
   * Subir múltiples evidencias usando workaround
   */
  async subirEvidenciasWorkaround(publicacionId: number, evidencias: Evidence[]): Promise<any[]> {
    if (!evidencias || evidencias.length === 0) {
      console.log('📎 No hay evidencias para subir');
      return [];
    }

    console.log(`🔧 Iniciando workaround para ${evidencias.length} evidencias...`);

    const resultados: any[] = [];
    const errores: string[] = [];

    for (let i = 0; i < evidencias.length; i++) {
      const evidencia = evidencias[i];

      try {
        console.log(`📎 Workaround ${i + 1}/${evidencias.length}: ${evidencia.fileName}`);

        const resultado = await this.subirEvidenciaWorkaround(publicacionId, evidencia);
        resultados.push(resultado);

        // Pausa entre uploads
        if (i < evidencias.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ Workaround falló para ${evidencia.fileName}:`, error);
        errores.push(`${evidencia.fileName}: ${error.message}`);
      }
    }

    console.log(`✅ Workaround completado: ${resultados.length} exitosas, ${errores.length} errores`);

    if (errores.length > 0) {
      console.warn('⚠️ Errores en workaround:', errores);
    }

    return resultados;
  }
}

export const evidenciasWorkaround = new EvidenciasWorkaround();
export default EvidenciasWorkaround;
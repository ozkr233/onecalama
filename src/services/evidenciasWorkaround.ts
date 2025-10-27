// src/services/evidenciasWorkaround.ts - CON NUEVO SERIALIZER (ajustado)
import { ACTIVE_CONFIG } from '../constants/api';
import { Evidence } from '../types/denuncias';
import AuthHelper from '../utils/authHelper';
import * as FileSystem from 'expo-file-system';
import { FileSystemUploadType } from 'expo-file-system';
import { Platform } from 'react-native';

class EvidenciasWorkaround {
  /**
   * Subir evidencia directamente al endpoint de evidencias (real, multipart)
   * Intenta con Expo FileSystem.uploadAsync; si falla, usa fetch + FormData.
   */
  async subirEvidenciaDirecta(publicacionId: number, evidencia: Evidence): Promise<any> {
    try {
      const fileName = evidencia.fileName ?? 'archivo.jpg';
      const mime = evidencia.type || this.guessMime(fileName);

      console.log(`📎 Subiendo evidencia directa: ${fileName}`);
      console.log(`📄 Para publicación: ${publicacionId}`);

      const token = await AuthHelper.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Asegurar que el archivo sea accesible como file:// (Android content://)
      const safeUri = await this.ensureFileUri(evidencia.uri, fileName);

      // URL directa del endpoint de evidencias
      const url = `${ACTIVE_CONFIG.baseURL}/evidencias/`;

      // ====== Intento 1: Expo uploadAsync (mejor para binarios) ======
      try {
        const uploadResult = await FileSystem.uploadAsync(url, safeUri, {
          httpMethod: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // No agregues Content-Type aquí; uploadAsync lo maneja con boundary
            Accept: 'application/json',
          },
          uploadType: FileSystemUploadType.MULTIPART,
          fieldName: 'archivo', // nombre de campo que tu DRF espera
          parameters: {
            // Enviar ambos nombres por compatibilidad con el serializer
            publicacion: String(publicacionId),
            publicacion_id: String(publicacionId),
            extension: this.getFileExtension(fileName),
            fecha: new Date().toISOString(),
          },
          // mimeType solo aplica a BINARY_CONTENT; se omite en MULTIPART
          // Nota: RN/Expo infiere el nombre; si tu backend exige filename exacto,
          // puedes pasar "name" pero no está tipado en TS de Expo:
          // @ts-ignore
          name: fileName,
        });

        const status = uploadResult.status;
        const text = uploadResult.body ?? '';
        let data: any = text;
        try {
          data = JSON.parse(text);
        } catch {
          /* cuerpo no JSON */
        }

        console.log(`📡 Respuesta evidencias (uploadAsync): ${status}`);

        if (status < 200 || status >= 300) {
          throw new Error(
            `Error ${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
          );
        }

        const evidenciaResp = data;
        const urlCompleta = this.construirUrlCompleta(evidenciaResp.archivo);

        console.log('✅ Evidencia subida exitosamente (uploadAsync):', evidenciaResp);

        return {
          ...evidenciaResp,
          archivo_url: urlCompleta,
          archivo_path: evidenciaResp.archivo,
        };
      } catch (err1: any) {
        console.warn('⚠️ uploadAsync falló, probando fetch como fallback:', err1?.message ?? err1);
      }

      // ====== Intento 2: fetch + FormData ======
      const formData = new FormData();
      formData.append('archivo' as any, {
        uri: safeUri,
        name: fileName,
        type: mime,
      } as any);
      // Enviar ambos nombres por compatibilidad con el serializer
      formData.append('publicacion', String(publicacionId));
      formData.append('publicacion_id', String(publicacionId));
      formData.append('extension', this.getFileExtension(fileName));
      formData.append('fecha', new Date().toISOString());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // NO seteamos 'Content-Type': RN define el boundary automáticamente
          Accept: 'application/json',
        },
        body: formData,
      });

      console.log(`📡 Respuesta evidencias (fetch): ${response.status} ${response.statusText}`);

      const text = await response.text();
      let data: any = text;
      try {
        data = JSON.parse(text);
      } catch {
        /* cuerpo no JSON */
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
      }

      const evidenciaResp = data;
      const urlCompleta = this.construirUrlCompleta(evidenciaResp.archivo);

      console.log('✅ Evidencia subida exitosamente (fetch):', evidenciaResp);

      return {
        ...evidenciaResp,
        archivo_url: urlCompleta,
        archivo_path: evidenciaResp.archivo,
      };
    } catch (error: any) {
      console.error(`❌ Error en subida directa:`, error);
      throw new Error(`Subida falló: ${error?.message ?? String(error)}`);
    }
  }

  /**
   * MÉTODO PRINCIPAL: Intenta directa; evita fallback con anuncios (403 para usuarios)
   */
  async subirEvidencia(publicacionId: number, evidencia: Evidence): Promise<any> {
    try {
      console.log(`🚀 Intentando subida directa primero...`);
      return await this.subirEvidenciaDirecta(publicacionId, evidencia);
    } catch (error: any) {
      console.error(`❌ Subida directa falló:`, error?.message ?? String(error));
      // Propagar error sin intentar workaround de anuncios (requiere permisos especiales 403)
      throw error;
    }
  }

  /**
   * Workaround usando imagenes-anuncios (fallback)
   */
  async subirEvidenciaWorkaround(publicacionId: number, evidencia: Evidence): Promise<any> {
    try {
      console.log(`🔧 WORKAROUND: Usando imagenes-anuncios como fallback...`);

      const token = await AuthHelper.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // 1) Crear anuncio temporal
      const anuncioId = await this.crearAnuncioTemporal(token);

      // 2) Subir imagen vía anuncio
      const imagenSubida = await this.subirImagenViaAnuncio(anuncioId, evidencia, token);

      // 3) Crear evidencia "virtual" coherente con tu modelo
      const evidenciaVirtual = {
        id: `virtual_${Date.now()}`,
        publicacion: publicacionId,
        archivo: imagenSubida.imagen, // Ruta relativa
        archivo_url: this.construirUrlCompleta(imagenSubida.imagen), // URL completa
        fecha: new Date().toISOString(),
        extension: this.getFileExtension(evidencia.fileName ?? 'jpg'),
        workaround: true,
        status: 'imagen_disponible',
      };

      // 4) Limpiar anuncio temporal
      await this.limpiarAnuncioTemporal(anuncioId, token);

      console.log('✅ Workaround completado');
      return evidenciaVirtual;
    } catch (error) {
      console.error(`❌ Error en workaround:`, error);
      throw error;
    }
  }

  /**
   * Subir múltiples evidencias en serie
   */
  async subirEvidencias(publicacionId: number, evidencias: Evidence[]): Promise<any[]> {
    if (!evidencias || evidencias.length === 0) return [];

    console.log(`📎 Subiendo ${evidencias.length} evidencias...`);

    const resultados: any[] = [];
    const errores: string[] = [];

    for (let i = 0; i < evidencias.length; i++) {
      const evidencia = evidencias[i];
      try {
        console.log(`📎 Subiendo ${i + 1}/${evidencias.length}: ${evidencia.fileName}`);
        const resultado = await this.subirEvidencia(publicacionId, evidencia);
        resultados.push(resultado);

        // Pequeña pausa para evitar saturar
        if (i < evidencias.length - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      } catch (error: any) {
        console.error(`❌ Error subiendo ${evidencia.fileName}:`, error);
        errores.push(`${evidencia.fileName}: ${error?.message ?? String(error)}`);
      }
    }

    console.log(`✅ Subida completada: ${resultados.length} exitosas, ${errores.length} errores`);
    return resultados;
  }

  // ===== MÉTODOS PRIVADOS =====

  private async crearAnuncioTemporal(token: string): Promise<number> {
    const userInfo = await AuthHelper.getUserInfoFromToken();
    const usuarioId = userInfo?.userId || 1;

    // Obtener primera categoría
    const categoriasResponse = await fetch(`${ACTIVE_CONFIG.baseURL}/categorias/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const categorias = await categoriasResponse.json();
    const primeraCategoria = categorias.results?.[0] || categorias[0];

    const anuncioTemporal = {
      titulo: 'TEMP_EVIDENCIA',
      subtitulo: 'Anuncio temporal para evidencias',
      descripcion: 'Se eliminará automáticamente',
      categoria: primeraCategoria?.id ?? 1,
      usuario: usuarioId,
      estado: 'Temporal',
    };

    const response = await fetch(`${ACTIVE_CONFIG.baseURL}/anuncios-municipales/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(anuncioTemporal),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Error creando anuncio temporal: ${response.status} ${txt}`);
    }

    const anuncio = await response.json();
    return anuncio.id;
  }

  private async subirImagenViaAnuncio(anuncioId: number, evidencia: Evidence, token: string): Promise<any> {
    const fileName = evidencia.fileName ?? 'archivo.jpg';
    const mime = evidencia.type || this.guessMime(fileName);

    const safeUri = await this.ensureFileUri(evidencia.uri, fileName);

    const formData = new FormData();
    formData.append('imagen' as any, {
      uri: safeUri,
      type: mime,
      name: fileName,
    } as any);
    formData.append('anuncio', String(anuncioId));
    formData.append('extension', this.getFileExtension(fileName));

    const response = await fetch(`${ACTIVE_CONFIG.baseURL}/imagenes-anuncios/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // NO 'Content-Type' aquí
      },
      body: formData,
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Error subiendo imagen: ${response.status} ${txt}`);
    }

    return await response.json();
  }

  private async limpiarAnuncioTemporal(anuncioId: number, token: string): Promise<void> {
    try {
      await fetch(`${ACTIVE_CONFIG.baseURL}/anuncios-municipales/${anuncioId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar anuncio temporal:', error);
    }
  }

  /**
   * Si ya es URL absoluta, la devuelve; si no, construye absoluta.
   * Ajusta aquí si tus archivos no están en Cloudinary.
   */
  private construirUrlCompleta(rutaRelativa: string): string {
    if (!rutaRelativa) return '';
    if (/^https?:\/\//i.test(rutaRelativa)) return rutaRelativa;
    // Tu versión original apuntaba a Cloudinary:
    return `https://res.cloudinary.com/de06451wd/${rutaRelativa}`;
    // Si tus archivos viven en tu backend:
    // return `${ACTIVE_CONFIG.baseURL}${rutaRelativa.startsWith('/') ? '' : '/'}${rutaRelativa}`;
  }

  private getFileExtension(fileName: string): string {
    const parts = (fileName || '').split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
  }

  private guessMime(fileName: string): string {
    const ext = this.getFileExtension(fileName);
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'heic':
        return 'image/heic';
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Asegura que la URI sea file:// (necesario para upload en Android)
   */
  private async ensureFileUri(inputUri: string, fileName: string): Promise<string> {
    if (!inputUri) throw new Error('URI de archivo inválida');
    if (inputUri.startsWith('file://')) return inputUri;

    // Copia content:// a cache como file://
    const ext = this.getFileExtension(fileName) || 'bin';
    const dest = `${FileSystem.cacheDirectory}${Date.now()}.${ext}`;

    try {
      const info = await FileSystem.getInfoAsync(inputUri);
      if (info.exists) {
        await FileSystem.copyAsync({ from: inputUri, to: dest });
        return dest;
      }
    } catch {
      // Ignoramos y usamos fallback
    }

    // Fallback: leer como base64 y reescribir (puede fallar si la URI está protegida)
    const base64 = await FileSystem.readAsStringAsync(inputUri, { encoding: FileSystem.EncodingType.Base64 });
    await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });
    return dest;
  }
}

export const evidenciasService = new EvidenciasWorkaround();
// Alias extra por compatibilidad (algunos módulos esperan este nombre)
export const evidenciasWorkaround = evidenciasService;
export default EvidenciasWorkaround;

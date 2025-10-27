// src/services/evidenciasDirect.ts - Subida directa guiada por serializers DRF
import { ENDPOINTS, ACTIVE_CONFIG } from '../constants/api';
import { apiService } from './api';
import { Evidence } from '../types/denuncias';
import * as FileSystem from 'expo-file-system';
import { FileSystemUploadType } from 'expo-file-system';
import AuthHelper from '../utils/authHelper';

function getFileExtension(fileName: string): string {
  const parts = (fileName || '').split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
}


async function ensureFileUri(inputUri: string, fileName: string): Promise<string> {
  if (!inputUri) throw new Error('URI de archivo inválida');
  if (inputUri.startsWith('file://')) return inputUri;

  const ext = getFileExtension(fileName) || 'bin';
  const dest = `${FileSystem.cacheDirectory}${Date.now()}.${ext}`;
  try {
    const info = await FileSystem.getInfoAsync(inputUri);
    if (info.exists) {
      await FileSystem.copyAsync({ from: inputUri, to: dest });
      return dest;
    }
  } catch {}

  const base64 = await FileSystem.readAsStringAsync(inputUri, { encoding: FileSystem.EncodingType.Base64 });
  await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });
  return dest;
}

class EvidenciasDirectService {
  async subirEvidencia(publicacionId: number, evidencia: Evidence): Promise<any> {
    const fileName = evidencia.fileName || `evidencia_${Date.now()}.jpg`;
    const providedType = (evidencia as any).mime || (evidencia as any).type;
    const mime = typeof providedType === 'string' && providedType.includes('/')
      ? providedType
      : guessMime(fileName);
    const safeUri = await ensureFileUri(evidencia.uri, fileName);
    const token = await AuthHelper.getToken();

    const url = ENDPOINTS.EVIDENCIAS;

    // Intento 1: uploadAsync (robusto para binarios grandes)
    try {
      console.log('📤 uploadAsync →', { url: `${ACTIVE_CONFIG.baseURL}${url}`, fileName, mime, safeUri });
      const uploadResult = await FileSystem.uploadAsync(
        `${ACTIVE_CONFIG.baseURL}${url}`,
        safeUri,
        {
          httpMethod: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'application/json',
          },
          uploadType: FileSystemUploadType.MULTIPART,
          fieldName: 'archivo',
          parameters: {
            publicacion: String(publicacionId),
            publicacion_id: String(publicacionId),
            extension: getFileExtension(fileName),
          },
          // name not typed in SDK but supported
          // @ts-ignore
          name: fileName,
        }
      );

      const status = uploadResult.status;
      const bodyText = uploadResult.body || '';
      let data: any = bodyText;
      try { data = JSON.parse(bodyText); } catch {}

      if (status >= 200 && status < 300) {
        return data;
      }
      console.warn('⚠️ uploadAsync no OK', { status, bodyText: String(bodyText).slice(0, 300) });
      // Si no fue OK, caemos al intento 2 (fetch)
    } catch (e) {
      console.warn('⚠️ uploadAsync lanzó excepción, fallback a fetch:', (e as any)?.message || String(e));
    }

    // Intento 2: fetch + FormData mediante apiService
    const formData = new FormData();
    formData.append('archivo' as any, {
      uri: safeUri,
      name: fileName,
      type: mime,
    } as any);
    formData.append('publicacion', String(publicacionId));
    formData.append('publicacion_id', String(publicacionId));
    formData.append('extension', getFileExtension(fileName));

    console.log('📨 fetch multipart via apiService →', { endpoint: url, fileName, mime });
    const resp = await apiService.postFormData<any>(url, formData, true);
    return resp;
  }

  async subirEvidencias(publicacionId: number, evidencias: Evidence[]): Promise<any[]> {
    if (!evidencias || evidencias.length === 0) return [];
    const resultados: any[] = [];
    for (let i = 0; i < evidencias.length; i++) {
      const ev = evidencias[i];
      const res = await this.subirEvidencia(publicacionId, ev);
      resultados.push(res);
      if (i < evidencias.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    return resultados;
  }
}

export const evidenciasDirectService = new EvidenciasDirectService();
export default EvidenciasDirectService;

// src/services/api.ts - SERVICIO API ACTUALIZADO PARA CONEXIÓN REAL
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_CONFIG, ENDPOINTS, COMMON_HEADERS, TIMEOUTS, ERROR_MESSAGES } from '../constants/api';

interface RequestOptions extends RequestInit {
  timeout?: number;
  useAuth?: boolean;
  isFormData?: boolean; // ← NUEVO: Para uploads de evidencias
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ApiService {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTimeout = ACTIVE_CONFIG.timeout;

  constructor() {
    console.log(`🔧 ApiService inicializado con base URL: ${ACTIVE_CONFIG.baseURL}`);
  }

  // Obtener token de autenticación
  private async getAuthToken(): Promise<string | null> {
    try {
      // Primero intentar obtener de AsyncStorage
      let token = await AsyncStorage.getItem('authToken');

      // Si no hay token en storage, usar el hardcoded temporalmente
      if (!token) {
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU1NzMwNzg5LCJpYXQiOjE3NTU2NDQzODksImp0aSI6IjRiN2Q2MjQ0NTZlOTQ3ZjRhM2Y3NWE3MGM1MGQ1ZTE5IiwicnV0IjoiMjAxMjM5MzAtNSJ9.0fnDJKDKpbLG7xOqJ1Ko_VenivpPd0Fs_RqEhy7JFLA';
        console.log('🔑 Usando token hardcoded temporalmente');

        // Opcional: guardarlo en AsyncStorage para futuras peticiones
        await AsyncStorage.setItem('authToken', token);
      }

      return token;
    } catch (error) {
      console.warn('⚠️ Error obteniendo token:', error);
      return null;
    }
  }

  // ✅ MEJORADO: Crear headers para la petición
  private async buildHeaders(useAuth: boolean = false, isFormData: boolean = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    // Solo agregar Content-Type si NO es FormData (para uploads)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    } else {
      // Para FormData, solo Accept
      headers['Accept'] = 'application/json';
    }

    if (useAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Petición con timeout
  private async requestWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const timeout = options.timeout || this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = await this.buildHeaders(options.useAuth, options.isFormData);

      console.log(`🚀 Petición: ${options.method || 'GET'} ${url}`);
      if (options.isFormData) {
        console.log('📎 Petición tipo FormData (upload)');
      }

      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📡 Respuesta: ${response.status} ${response.statusText}`);

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`⏱️ ${ERROR_MESSAGES.TIMEOUT}`);
      }
      throw error;
    }
  }

  // Manejar respuesta de la API
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
      let errorDetails = {};

      // Intentar obtener detalles del error del servidor
      try {
        const errorData = await response.json();
        console.log('🔍 Error del servidor:', errorData);

        errorDetails = errorData;

        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        } else {
          // Si hay errores de campo, mostrarlos
          const fieldErrors = [];
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              fieldErrors.push(`${field}: ${errors}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n');
          }
        }
      } catch (parseError) {
        console.log('⚠️ No se pudo parsear error como JSON, usando texto plano');
        try {
          errorMessage = await response.text();
        } catch {
          // Usar mensaje por defecto si no se puede obtener nada
        }
      }

      // Mensajes específicos por código de estado
      switch (response.status) {
        case 401:
          errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
          await AsyncStorage.removeItem('authToken');
          break;
        case 403:
          errorMessage = ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          errorMessage = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 408:
          errorMessage = ERROR_MESSAGES.TIMEOUT;
          break;
        case 422:
          errorMessage = ERROR_MESSAGES.VALIDATION_ERROR + (errorMessage !== ERROR_MESSAGES.UNKNOWN_ERROR ? `\n\n${errorMessage}` : '');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = ERROR_MESSAGES.SERVER_ERROR;
          break;
      }

      console.error(`❌ HTTP ${response.status} Error:`, {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        errorDetails
      });

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorDetails;
      throw error;
    }

    const data = await response.json();
    return data;
  }

  // GET request
  async get<T>(endpoint: string, useAuth: boolean = false): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;

    try {
      const response = await this.requestWithTimeout(url, {
        method: 'GET',
        useAuth,
        timeout: TIMEOUTS.GET_LIST,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ GET Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // POST request
  async post<T>(endpoint: string, data: any, useAuth: boolean = true): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;

    try {
      const response = await this.requestWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(data),
        useAuth,
        timeout: TIMEOUTS.CREATE,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ POST Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ✅ NUEVO: POST para FormData (uploads)
  async postFormData<T>(endpoint: string, formData: FormData, useAuth: boolean = true): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;

    try {
      console.log('📤 Enviando FormData:', endpoint);

      const response = await this.requestWithTimeout(url, {
        method: 'POST',
        body: formData,
        useAuth,
        isFormData: true, // ← Flag importante para no agregar Content-Type
        timeout: TIMEOUTS.UPLOAD,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ POST FormData Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // PUT request
  async put<T>(endpoint: string, data: any, useAuth: boolean = true): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;

    try {
      const response = await this.requestWithTimeout(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        useAuth,
        timeout: TIMEOUTS.UPDATE,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ PUT Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // DELETE request
  async delete<T>(endpoint: string, useAuth: boolean = true): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;

    try {
      const response = await this.requestWithTimeout(url, {
        method: 'DELETE',
        useAuth,
        timeout: TIMEOUTS.DELETE,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ DELETE Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ✅ NUEVO: Método genérico para requests con retry
  async requestWithRetry<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    useAuth: boolean = true,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Reintento ${attempt}/${maxRetries} para ${method} ${endpoint}`);
          // Esperar un poco antes del reintento
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }

        switch (method) {
          case 'GET':
            return await this.get<T>(endpoint, useAuth);
          case 'POST':
            return await this.post<T>(endpoint, data, useAuth);
          case 'PUT':
            return await this.put<T>(endpoint, data, useAuth);
          case 'DELETE':
            return await this.delete<T>(endpoint, useAuth);
        }
      } catch (error) {
        lastError = error;

        // No reintentar en ciertos casos
        if (error.status === 401 || error.status === 403 || error.status === 404) {
          break;
        }

        // Solo reintentar en errores de red o servidor
        if (attempt === maxRetries || (error.status && error.status < 500)) {
          break;
        }
      }
    }

    throw lastError;
  }

  // MÉTODOS ESPECÍFICOS PARA TU APP

  // Test de conexión
  async testHealth(): Promise<any> {
    return this.get(ENDPOINTS.HEALTH);
  }

  // ✅ MEJORADO: Obtener categorías con retry
  async getCategorias(): Promise<any[]> {
    try {
      const response = await this.requestWithRetry<any>('GET', ENDPOINTS.CATEGORIAS, undefined, false);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      throw new Error('No se pudieron cargar las categorías');
    }
  }

  // ✅ MEJORADO: Obtener departamentos con retry
  async getDepartamentos(): Promise<any[]> {
    try {
      const response = await this.requestWithRetry<any>('GET', ENDPOINTS.DEPARTAMENTOS, undefined, false);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error obteniendo departamentos:', error);
      throw new Error('No se pudieron cargar los departamentos');
    }
  }

  // Obtener juntas vecinales
  async getJuntasVecinales(): Promise<any[]> {
    try {
      const response = await this.get<any>(ENDPOINTS.JUNTAS_VECINALES, false);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error obteniendo juntas vecinales:', error);
      return []; // No es crítico, devolver array vacío
    }
  }

  // Obtener situaciones
  async getSituaciones(): Promise<any[]> {
    return this.get<any[]>(ENDPOINTS.SITUACIONES);
  }

  // Obtener publicaciones
  async getPublicaciones(page: number = 1, pageSize: number = 10): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return this.get(`${ENDPOINTS.PUBLICACIONES}?${params}`, true);
  }

  // ✅ MEJORADO: Crear publicación con mejor manejo de errores
  async crearPublicacion(data: any): Promise<any> {
    try {
      console.log('📝 Creando publicación:', { titulo: data.titulo, categoria: data.categoria });

      const response = await this.requestWithRetry<any>('POST', ENDPOINTS.PUBLICACIONES, data, true, 1);

      console.log('✅ Publicación creada exitosamente:', response.codigo);
      return response;
    } catch (error) {
      console.error('❌ Error creando publicación:', error);
      throw error;
    }
  }

  // Obtener mis publicaciones
  async getMisPublicaciones(): Promise<any[]> {
    try {
      const response = await this.get<any>(ENDPOINTS.MIS_PUBLICACIONES, true);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error obteniendo mis publicaciones:', error);
      throw new Error('No se pudieron cargar tus publicaciones');
    }
  }

  // ✅ NUEVO: Crear anuncio temporal (para workaround de evidencias)
  async crearAnuncioTemporal(data: any): Promise<any> {
    try {
      console.log('📝 Creando anuncio temporal para evidencias...');

      const response = await this.post<any>('/anuncios-municipales/', data, true);

      console.log('✅ Anuncio temporal creado:', response.id);
      return response;
    } catch (error) {
      console.error('❌ Error creando anuncio temporal:', error);
      throw new Error('No se pudo crear anuncio temporal para evidencias');
    }
  }

  // ✅ NUEVO: Subir imagen via anuncios (workaround)
  async subirImagenAnuncio(formData: FormData): Promise<any> {
    try {
      console.log('📤 Subiendo imagen via anuncios...');

      const response = await this.postFormData<any>('/imagenes-anuncios/', formData, true);

      console.log('✅ Imagen subida exitosamente:', response.imagen);
      return response;
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      throw new Error('No se pudo subir la imagen');
    }
  }

  // ✅ NUEVO: Eliminar anuncio temporal
  async eliminarAnuncioTemporal(anuncioId: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando anuncio temporal ${anuncioId}...`);

      await this.delete(`/anuncios-municipales/${anuncioId}/`, true);

      console.log('✅ Anuncio temporal eliminado');
    } catch (error) {
      console.warn('⚠️ Error eliminando anuncio temporal (no crítico):', error);
      // No lanzar error porque no es crítico
    }
  }

  // Login
  async login(email: string, password: string): Promise<any> {
    const response = await this.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    }, false);

    // Guardar token si el login es exitoso
    if (response.access_token || response.token) {
      const token = response.access_token || response.token;
      await AsyncStorage.setItem('authToken', token);
      console.log('✅ Token guardado exitosamente');
    }

    return response;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.post(ENDPOINTS.AUTH.LOGOUT, {}, true);
    } catch (error) {
      console.warn('⚠️ Error en logout del servidor:', error);
    } finally {
      // Siempre limpiar el token local
      await AsyncStorage.removeItem('authToken');
      console.log('🗑️ Token eliminado localmente');
    }
  }

  // Obtener perfil del usuario
  async getProfile(): Promise<any> {
    return this.get(ENDPOINTS.AUTH.PROFILE, true);
  }

  // ✅ MEJORADO: Verificar si hay token válido
  async hasValidToken(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      // Intentar obtener el perfil para validar el token
      await this.getProfile();
      return true;
    } catch (error) {
      // Si falla, el token no es válido
      console.log('🔑 Token inválido, eliminando...');
      await AsyncStorage.removeItem('authToken');
      return false;
    }
  }

  // ✅ NUEVO: Obtener usuario actual
  async getCurrentUser(): Promise<any> {
    try {
      const profile = await this.getProfile();
      return profile;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      throw new Error('No se pudo obtener información del usuario');
    }
  }

  // ✅ NUEVO: Verificar conectividad
  async checkConnectivity(): Promise<boolean> {
    try {
      await this.testHealth();
      return true;
    } catch (error) {
      console.error('❌ Sin conectividad:', error);
      return false;
    }
  }

  // Limpiar cache
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache limpiado');
  }

  // ✅ NUEVO: Limpiar todo (logout completo)
  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    this.clearCache();
    console.log('🗑️ Todos los datos limpiados');
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();

// También exportar la clase para testing
export default ApiService;
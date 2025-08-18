// src/services/api.ts - SERVICIO API ACTUALIZADO PARA CONEXIÓN REAL
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_CONFIG, ENDPOINTS, COMMON_HEADERS, TIMEOUTS, ERROR_MESSAGES } from '../constants/api';

interface RequestOptions extends RequestInit {
  timeout?: number;
  useAuth?: boolean;
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
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU1NTQ0ODkzLCJpYXQiOjE3NTU0NTg0OTMsImp0aSI6ImQ4N2ZmNGFhOWUyYzRiNjBhY2NkOTM4ZDE1ZTM5NjFhIiwicnV0IjoiMjAxMjM5MzAtNSJ9.7aOnsnHXHNoduRqk8CPkYQ-Fk7cDrrjg1iEtbtAv3Cc';
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

  // Crear headers para la petición
  private async buildHeaders(useAuth: boolean = false): Promise<Record<string, string>> {
    const headers = { ...COMMON_HEADERS };

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
      const headers = await this.buildHeaders(options.useAuth);

      console.log(`🚀 Petición: ${options.method || 'GET'} ${url}`);

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

  // MÉTODOS ESPECÍFICOS PARA TU APP

  // Test de conexión
  async testHealth(): Promise<any> {
    return this.get(ENDPOINTS.HEALTH);
  }

  // Obtener categorías
  async getCategorias(): Promise<any[]> {
    return this.get<any[]>(ENDPOINTS.CATEGORIAS);
  }

  // Obtener departamentos
  async getDepartamentos(): Promise<any[]> {
    return this.get<any[]>(ENDPOINTS.DEPARTAMENTOS);
  }

  // Obtener juntas vecinales
  async getJuntasVecinales(): Promise<any[]> {
    return this.get<any[]>(ENDPOINTS.JUNTAS_VECINALES);
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

  // Crear publicación
  async crearPublicacion(data: any): Promise<any> {
    return this.post(ENDPOINTS.PUBLICACIONES, data, true);
  }

  // Obtener mis publicaciones
  async getMisPublicaciones(): Promise<any[]> {
    return this.get<any[]>(ENDPOINTS.MIS_PUBLICACIONES, true);
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

  // Verificar si hay token válido
  async hasValidToken(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      // Intentar obtener el perfil para validar el token
      await this.getProfile();
      return true;
    } catch (error) {
      // Si falla, el token no es válido
      await AsyncStorage.removeItem('authToken');
      return false;
    }
  }

  // Limpiar cache
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache limpiado');
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();

// También exportar la clase para testing
export default ApiService;
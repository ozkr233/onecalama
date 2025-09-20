// src/services/api.ts - SERVICIO API MEJORADO Y ACTUALIZADO
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_CONFIG, ENDPOINTS } from '../constants/api';

interface RequestOptions extends RequestInit {
  timeout?: number;
  useAuth?: boolean;
  isFormData?: boolean;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Configuración de timeouts
const TIMEOUTS = {
  GET_LIST: 60000,
  CREATE: 15000,
  UPDATE: 12000,
  DELETE: 8000,
  UPLOAD: 30000,
  AUTH: 10000,
};

// Mensajes de error estandarizados
const ERROR_MESSAGES = {
  TIMEOUT: 'La petición tardó demasiado tiempo. Verifica tu conexión.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Los datos enviados no son válidos.',
  SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente más tarde.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
};

class ApiService {
  patch(arg0: string, arg1: {}, arg2: boolean) {
    throw new Error('Method not implemented.');
  }
  private cache = new Map<string, CacheItem<any>>();
  private defaultTimeout = ACTIVE_CONFIG.timeout;

  constructor() {
    console.log(`🔧 ApiService inicializado con base URL: ${ACTIVE_CONFIG.baseURL}`);
  }

  // === UTILIDADES DE SESIÓN (claves de storage) ===
  private STORAGE_KEYS = {
    ACCESS: 'authToken',
    REFRESH: 'refreshToken',
    USER_ID: 'userId',
    USER_INFO: 'userInfo',
  };

  // ✅ MEJORADO: Obtener token de autenticación
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(this.STORAGE_KEYS.ACCESS);
      return token;
    } catch (error) {
      console.warn('⚠️ Error obteniendo token:', error);
      return null;
    }
  }

  // ✅ MEJORADO: Crear headers para peticiones
  private async buildHeaders(useAuth: boolean = false, isFormData: boolean = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    // Solo agregar Content-Type si NO es FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    } else {
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

  // ✅ MEJORADO: Petición con timeout y mejor control
  private async requestWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const timeout = options.timeout || this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers = await this.buildHeaders(options.useAuth, options.isFormData);

      console.log(`🚀 ${options.method || 'GET'} ${url}`, options.useAuth ? '(autenticado)' : '');
      
      if (options.isFormData) {
        console.log('📎 Subiendo archivo...');
      }

      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📡 Respuesta: ${response.status} ${response.statusText}`);

      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT);
      }
      
      if (String(error.message || '').toLowerCase().includes('network')) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      throw error;
    }
  }

  // ✅ MEJORADO: Manejo avanzado de respuestas con errores detallados
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
      let errorDetails: any = {};

      try {
        const errorData = await response.json();
        console.log('🔍 Error del servidor:', errorData);
        errorDetails = errorData;

        // Priorizar diferentes tipos de mensajes de error
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          // Manejar errores de campo específicos
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
      } catch {
        console.log('⚠️ No se pudo parsear error como JSON');
        try {
          errorMessage = await response.text() || ERROR_MESSAGES.UNKNOWN_ERROR;
        } catch {
          // Usar mensaje por defecto
        }
      }

      // Mensajes específicos por código de estado
      switch (response.status) {
        case 401:
          errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
          await this.clearAuthData();
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

      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.details = errorDetails;
      error.response = response;
      
      throw error;
    }

    try {
      return await response.json();
    } catch {
      // Si no se puede parsear como JSON, devolver respuesta vacía
      return {} as T;
    }
  }

  // ✅ NUEVO: Petición con reintentos automáticos
  private async requestWithRetry<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    useAuth: boolean = true,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: Error = new Error('Request failed after all retries');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Reintento ${attempt}/${maxRetries} para ${method} ${endpoint}`);
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
      } catch (error: any) {
        lastError = error;

        // No reintentar en casos específicos
        if ([401, 403, 404, 422].includes(error.status)) {
          break;
        }

        // Solo reintentar en errores de red/servidor
        if (attempt === maxRetries || (error.status && error.status < 500)) {
          break;
        }
      }
    }

    throw lastError;
  }

  // ============= MÉTODOS BÁSICOS HTTP =============

  async get<T>(endpoint: string, useAuth: boolean = false): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;
    
    const response = await this.requestWithTimeout(url, {
      method: 'GET',
      useAuth,
      timeout: TIMEOUTS.GET_LIST,
    });

    return await this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data: any, useAuth: boolean = true): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;
    
    const response = await this.requestWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(data),
      useAuth,
      timeout: TIMEOUTS.CREATE,
    });

    return await this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData, useAuth: boolean = true): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;
    
    const response = await this.requestWithTimeout(url, {
      method: 'POST',
      body: formData,
      useAuth,
      isFormData: true,
      timeout: TIMEOUTS.UPLOAD,
    });

    return await this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: any, useAuth: boolean = true): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;
    
    const response = await this.requestWithTimeout(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      useAuth,
      timeout: TIMEOUTS.UPDATE,
    });

    return await this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, useAuth: boolean = true): Promise<T> {
    const url = `${ACTIVE_CONFIG.baseURL}${endpoint}`;
    
    const response = await this.requestWithTimeout(url, {
      method: 'DELETE',
      useAuth,
      timeout: TIMEOUTS.DELETE,
    });

    return await this.handleResponse<T>(response);
  }

  // ============= MÉTODOS DE AUTENTICACIÓN =============

  // ✅ ACTUALIZADO: Login con RUT → guarda tokens e ID → trae perfil por ViewSet y lo cachea
  async login(rut: string, password: string): Promise<any> {
    console.log('🔐 Intentando login con RUT:', rut);
    
    try {
      const response = await this.requestWithTimeout(`${ACTIVE_CONFIG.baseURL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        body: JSON.stringify({ rut, password }),
        useAuth: false,
        timeout: TIMEOUTS.AUTH,
      });

      const data = await this.handleResponse<any>(response);
      console.log('✅ Login exitoso:', { hasToken: !!(data.access || data.token), id: data?.id });

      // Guardar tokens e ID automáticamente
      const access = data.access || data.access_token || data.token;
      const refresh = data.refresh || data.refresh_token;
      const userId = data?.id;

      if (access) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.ACCESS, access);
      }
      if (refresh) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.REFRESH, refresh);
      }
      if (userId != null) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.USER_ID, String(userId));
      }

      // Traer perfil por ID y cachearlo
      if (userId != null && access) {
        try {
          const perfil = await this.get(`${(ENDPOINTS.AUTH.PROFILE || '/usuarios/')}${userId}/`, true);
          await AsyncStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(perfil));
          console.log('👤 Perfil cacheado en AsyncStorage');
        } catch (e) {
          console.warn('⚠️ No se pudo obtener el perfil inmediatamente tras login:', e);
        }
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error en login:', error.message);
      throw error;
    }
  }

  // ✅ MEJORADO: Logout completo
  async logout(): Promise<void> {
    try {
      // Intentar logout en servidor si hay endpoint
      if (ENDPOINTS.AUTH.LOGOUT) {
        await this.post(ENDPOINTS.AUTH.LOGOUT, {}, true);
      }
    } catch (error) {
      console.warn('⚠️ Error en logout del servidor:', error);
    } finally {
      await this.clearAuthData();
      console.log('🗑️ Logout completado');
    }
  }

  // ✅ NUEVO: Refrescar token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(this.STORAGE_KEYS.REFRESH);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.post(ENDPOINTS.AUTH.REFRESH, {
        refresh: refreshToken,
      }, false);

      if (response.access) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.ACCESS, response.access);
        console.log('✅ Token refrescado exitosamente');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      await this.clearAuthData();
      return false;
    }
  }

  // ✅ MEJORADO: Verificar token válido → intenta obtener perfil por ID
  async hasValidToken(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      await this.getProfile(); // usa el flujo por ID
      return true;
    } catch (error: any) {
      if (error.status === 401) {
        // Intentar refrescar token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          try {
            await this.getProfile();
            return true;
          } catch {
            // si falla, caemos al clear
          }
        }
      }
      
      await this.clearAuthData();
      return false;
    }
  }

  /**
   * ✅ ACTUALIZADO: Obtener perfil del usuario usando el ViewSet de usuarios y el ID guardado.
   *  - Devuelve el perfil desde cache si está.
   *  - Si no hay cache, lee userId y hace GET /usuarios/:id/
   *  - Si no hay userId, intenta un fallback muy básico (lista y toma el primero) —evítalo si puedes.
   */
  async getProfile(): Promise<any> {
    try {
      // 1) Intentar devolver lo cacheado
      const cached = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_INFO);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        } catch { /* ignore */ }
      }

      // 2) Si no hay cache, obtener por ID
      const userIdStr = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_ID);
      if (userIdStr) {
        const userId = Number(userIdStr);
        if (!Number.isNaN(userId)) {
          const perfil = await this.get(`${(ENDPOINTS.AUTH.PROFILE || '/usuarios/')}${userId}/`, true);
          await AsyncStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(perfil));
          return perfil;
        }
      }

      // 3) Fallback (no recomendado): listar y tomar primero
      // Úsalo solo si tu API lo permite; idealmente no llegar aquí.
      const lista = await this.get('/usuarios/', true);
      const usuariosList = (lista as any).results || lista;
      if (Array.isArray(usuariosList) && usuariosList.length > 0) {
        const first = usuariosList[0];
        await AsyncStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(first));
        return first;
      }

      throw new Error('No se encontró información del usuario');
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      throw error;
    }
  }

  // ⚠️ NOTA: Evitamos decodificar el JWT en React Native (atob no siempre está disponible).
  // En vez de eso, nos apoyamos en que el login ya devuelve "id" y lo guardamos como "userId".

  // ❌ (Opcional) Buscar usuario por RUT — NO recomendada si el ViewSet solo expone /usuarios/:id/
  // La dejamos explícitamente como no soportada para tu API actual.
  async getUserByRut(rut: string): Promise<never> {
    console.warn('ℹ️ getUserByRut no está soportado en este cliente. Usa getProfile() basado en ID.');
    throw new Error('No soportado: usa getProfile() (requiere ID).');
  }

  // ✅ MEJORADO: Limpiar datos de autenticación
  private async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.STORAGE_KEYS.ACCESS,
      this.STORAGE_KEYS.REFRESH,
      this.STORAGE_KEYS.USER_ID,
      this.STORAGE_KEYS.USER_INFO,
    ]);
    this.clearCache();
  }

  // ============= MÉTODOS ESPECÍFICOS DE LA APP =============

  // Test de salud del servidor
  async testHealth(): Promise<any> {
    try {
      return await this.get('/health/', false);
    } catch (error) {
      console.warn('⚠️ Health check falló, servidor puede estar inaccesible');
      throw error;
    }
  }

  // ✅ MEJORADO: Obtener categorías con cache
  async getCategorias(): Promise<any[]> {
    try {
      const cacheKey = 'categorias';
      const cached = this.getFromCache<any[]>(cacheKey);
      if (cached) {
        console.log('📦 Categorías desde cache');
        return cached;
      }

      const response = await this.requestWithRetry<any>('GET', ENDPOINTS.CATEGORIAS, undefined, false);
      const categorias = response.results || response;
      
      this.setCache(cacheKey, categorias, 5 * 60 * 1000); // Cache por 5 minutos
      return categorias;
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      throw new Error('No se pudieron cargar las categorías');
    }
  }

  // ✅ MEJORADO: Obtener departamentos con cache
  async getDepartamentos(): Promise<any[]> {
    try {
      const cacheKey = 'departamentos';
      const cached = this.getFromCache<any[]>(cacheKey);
      if (cached) {
        console.log('📦 Departamentos desde cache');
        return cached;
      }

      const response = await this.requestWithRetry<any>('GET', ENDPOINTS.DEPARTAMENTOS, undefined, false);
      const departamentos = response.results || response;
      
      this.setCache(cacheKey, departamentos, 5 * 60 * 1000);
      return departamentos;
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
      console.warn('⚠️ Error obteniendo juntas vecinales:', error);
      return []; // No crítico, devolver array vacío
    }
  }

  // ✅ MEJORADO: Crear publicación
  async crearPublicacion(data: any): Promise<any> {
    try {
      console.log('📝 Creando publicación:', { titulo: data.titulo, categoria: data.categoria });
      
      const response = await this.requestWithRetry<any>('POST', ENDPOINTS.PUBLICACIONES, data, true, 1);
      
      console.log('✅ Publicación creada:', response.codigo || response.id);
      this.clearCache(); // Limpiar cache para refrescar listas
      
      return response;
    } catch (error) {
      console.error('❌ Error creando publicación:', error);
      throw error;
    }
  }

  // Obtener publicaciones
  async getPublicaciones(page: number = 1, pageSize: number = 10): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return this.get(`${ENDPOINTS.PUBLICACIONES}?${params}`, true);
  }

  // Obtener mis publicaciones
  async getMisPublicaciones(): Promise<any[]> {
    try {
      const response = await this.get<any>(ENDPOINTS.MIS_PUBLICACIONES || `${ENDPOINTS.PUBLICACIONES}mis_publicaciones/`, true);
      return response.results || response;
    } catch (error) {
      console.error('❌ Error obteniendo mis publicaciones:', error);
      throw new Error('No se pudieron cargar tus publicaciones');
    }
  }

  // ✅ NUEVO: Subir evidencia
  async subirEvidencia(formData: FormData): Promise<any> {
    try {
      console.log('📤 Subiendo evidencia...');
      const response = await this.postFormData<any>(ENDPOINTS.EVIDENCIAS || '/evidencias/', formData, true);
      console.log('✅ Evidencia subida exitosamente');
      return response;
    } catch (error) {
      console.error('❌ Error subiendo evidencia:', error);
      throw new Error('No se pudo subir la evidencia');
    }
  }

  // ============= MÉTODOS DE CACHE =============

  private setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache limpiado');
  }

  // ============= MÉTODOS DE UTILIDAD =============

  async checkConnectivity(): Promise<boolean> {
    try {
      await this.testHealth();
      return true;
    } catch (error) {
      console.error('❌ Sin conectividad:', error);
      return false;
    }
  }

  async clearAll(): Promise<void> {
    await this.clearAuthData();
    console.log('🗑️ Todos los datos limpiados');
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
export default ApiService;

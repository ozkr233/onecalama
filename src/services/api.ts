// src/services/api.ts - Versión Actualizada y Mejorada
import { ACTIVE_CONFIG } from '../constants/api';
import AuthHelper from '../utils/authHelper';

// Tipos para las opciones de request
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | FormData;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

// Estructura para caché
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 10000;
  private defaultRetries: number = 2;
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    this.baseURL = ACTIVE_CONFIG.baseURL;
    console.log(`[API] Inicializado con baseURL: ${this.baseURL}`);
  }

  // ===== MÉTODOS PRIVADOS =====

  private getCacheKey(url: string, options?: RequestOptions): string {
    const body = options?.body || '';
    const method = options?.method || 'GET';
    return `${url}-${method}-${typeof body === 'string' ? body : 'formdata'}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now > cached.timestamp + cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[CACHE] Hit: ${key}`);
    return cached.data;
  }

  private setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: ttl
    });
    console.log(`[CACHE] Guardado: ${key} (TTL: ${ttl}ms)`);
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AuthHelper.getToken();
    } catch (error) {
      console.warn('[API] Error obteniendo token:', error);
      return null;
    }
  }

  private async requestWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const timeout = options.timeout || this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Tiempo de espera agotado (${timeout}ms)`);
      }
      throw error;
    }
  }

  private async requestWithRetry<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const retries = options.retries !== undefined ? options.retries : this.defaultRetries;
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.requestWithTimeout(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        // Intentar parsear JSON, si falla retornar texto
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text() as any;
        }

      } catch (error: any) {
        lastError = error;

        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
          console.log(`[API] Intento ${attempt + 1} falló, reintentando en ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  // ===== MÉTODOS PÚBLICOS =====

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);

    // Verificar caché para GET requests
    if ((!options.method || options.method === 'GET') && options.cache !== false) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }

      // Verificar si hay request pendiente
      if (this.pendingRequests.has(cacheKey)) {
        console.log(`[API] Request pendiente: ${endpoint}`);
        return this.pendingRequests.get(cacheKey);
      }
    }

    // Obtener token de autenticación
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Solo agregar Content-Type si no es FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions: RequestOptions = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const requestPromise = this.requestWithRetry<T>(url, requestOptions);

    // Guardar request pendiente para GET
    if ((!options.method || options.method === 'GET') && options.cache !== false) {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    try {
      const result = await requestPromise;

      // Cachear resultado para GET requests
      if ((!options.method || options.method === 'GET') && options.cache !== false) {
        const ttl = options.cacheTTL || 5 * 60 * 1000;
        this.setCache(cacheKey, result, ttl);
      }

      return result;
    } catch (error: any) {
      console.error(`[API] Error en ${endpoint}:`, error.message);
      throw error;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
      cache: options.cache !== false,
      cacheTTL: options.cacheTTL || 5 * 60 * 1000
    });
  }

  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      cache: false,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      cache: false,
    });
  }

  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      cache: false,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      cache: false,
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      timeout: options.timeout || 30000, // 30 segundos para FormData
      cache: false,
    });
  }

  // ===== MÉTODOS DE UTILIDAD =====

  clearCache(): void {
    this.cache.clear();
    console.log('[CACHE] Cache limpiado');
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  async checkConnection(): Promise<boolean> {
    try {
      // Usar endpoint simple para verificar conexión
      await this.get('/categorias/', {
        timeout: 5000,
        cache: false,
        retries: 0
      });
      return true;
    } catch (error) {
      console.warn('[API] Conexión fallida:', error);
      return false;
    }
  }

  async preloadCriticalData(): Promise<void> {
    try {
      console.log('[API] Precargando datos críticos...');

      const promises = [
        this.get('/categorias/', { cacheTTL: 30 * 60 * 1000 }),
        this.get('/departamentos-municipales/', { cacheTTL: 30 * 60 * 1000 }),
        this.get('/juntas-vecinales/', { cacheTTL: 60 * 60 * 1000 }),
      ];

      await Promise.allSettled(promises);
      console.log('[API] Datos críticos precargados');
    } catch (error) {
      console.warn('[API] Error precargando datos:', error);
    }
  }

  // ===== MÉTODOS DE DEBUG =====

  async debugApiStatus(): Promise<void> {
    console.log('🔍 === DEBUG API STATUS ===');
    console.log('🌐 Base URL:', this.baseURL);
    console.log('📊 Cache size:', this.getCacheSize());
    console.log('⏱️ Default timeout:', this.defaultTimeout);
    console.log('🔄 Default retries:', this.defaultRetries);

    // Test de conexión
    const isConnected = await this.checkConnection();
    console.log('🔗 Conexión:', isConnected ? '✅ OK' : '❌ FALLA');

    // Estado del token
    const tokenStatus = await AuthHelper.checkTokenStatus();
    console.log('🔑 Token válido:', tokenStatus.hasToken && !tokenStatus.isExpired ? '✅ OK' : '❌ PROBLEMA');

    if (tokenStatus.remainingTime) {
      console.log('⏰ Tiempo restante:', tokenStatus.remainingTime);
    }
  }

  /**
   * Test rápido de endpoints básicos
   */
  async testBasicEndpoints(): Promise<{ [key: string]: boolean }> {
    const endpoints = [
      '/categorias/',
      '/departamentos-municipales/',
      '/publicaciones/',
    ];

    const results: { [key: string]: boolean } = {};

    for (const endpoint of endpoints) {
      try {
        await this.get(endpoint, { timeout: 5000, retries: 0, cache: false });
        results[endpoint] = true;
        console.log(`✅ ${endpoint}: OK`);
      } catch (error) {
        results[endpoint] = false;
        console.log(`❌ ${endpoint}: FALLA`);
      }
    }

    return results;
  }
}

export default new ApiClient();
// src/services/anuncios.ts - VERSIÓN CORREGIDA SIN MOCK POR DEFECTO
import { AnuncioMunicipal, ImagenAnuncio, ApiResponse } from '../types/denuncias';
import { ENDPOINTS, ACTIVE_CONFIG } from '../constants/api';
import AuthHelper from '../utils/authHelper';
import { anunciosMockData } from '../data/anunciosMock';

class AnunciosService {
  private baseURL = ACTIVE_CONFIG.baseURL;

  constructor() {
    console.log('🔧 AnunciosService inicializado con:', this.baseURL);
  }

  // Función para construir URL completa de Cloudinary
  private getCloudinaryUrl(imagePath: string): string {
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si es una ruta relativa, construir la URL completa
    const cloudinaryBase = 'https://res.cloudinary.com/de06451wd';
    return `${cloudinaryBase}/${imagePath}`;
  }

  // Función para obtener la primera imagen de un anuncio
  private getPrimaryImage(anuncio: AnuncioMunicipal): string | null {
    if (!anuncio.imagenes || anuncio.imagenes.length === 0) {
      return null;
    }
    
    return this.getCloudinaryUrl(anuncio.imagenes[0].imagen);
  }

  // Función para obtener todas las imágenes de un anuncio
  private getAllImages(anuncio: AnuncioMunicipal): string[] {
    if (!anuncio.imagenes || anuncio.imagenes.length === 0) {
      return [];
    }
    
    return anuncio.imagenes.map(img => this.getCloudinaryUrl(img.imagen));
  }

  // Método para hacer peticiones HTTP directamente
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await AuthHelper.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`🚀 Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      timeout: 10000,
    });

    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    return response;
  }

  /**
   * Obtiene la lista de anuncios municipales - SOLO BACKEND
   */
  async obtenerAnuncios(): Promise<AnuncioMunicipal[]> {
    try {
      console.log('🔄 Obteniendo anuncios DIRECTAMENTE desde el backend...');
      
      const url = `${this.baseURL}${ENDPOINTS.ANUNCIOS}`;
      const response = await this.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);

      // El backend puede devolver directamente un array o un objeto con results
      const anuncios = Array.isArray(data) ? data : (data.results || []);
      
      console.log(`✅ ${anuncios.length} anuncios obtenidos desde el backend`);
      
      // Validar estructura de datos y procesar imágenes
      if (anuncios.length > 0) {
        // Procesar URLs de imágenes para cada anuncio
        const anunciosConImagenes = anuncios.map((anuncio: AnuncioMunicipal) => {
          if (anuncio.imagenes && anuncio.imagenes.length > 0) {
            console.log(`🖼️ Anuncio "${anuncio.titulo}" tiene ${anuncio.imagenes.length} imagen(es)`);
            
            // Verificar las URLs de las imágenes
            anuncio.imagenes.forEach((img, index) => {
              const fullUrl = this.getCloudinaryUrl(img.imagen);
              console.log(`  📸 Imagen ${index + 1}: ${fullUrl}`);
            });
          } else {
            console.log(`📭 Anuncio "${anuncio.titulo}" sin imágenes`);
          }
          
          return anuncio;
        });
        
        console.log('📋 Primer anuncio:', {
          id: anunciosConImagenes[0].id,
          titulo: anunciosConImagenes[0].titulo,
          estado: anunciosConImagenes[0].estado,
          cantidadImagenes: anunciosConImagenes[0].imagenes?.length || 0
        });
        
        return anunciosConImagenes;
      }

      return anuncios;

    } catch (error) {
      console.error('❌ ERROR CRÍTICO obteniendo anuncios desde backend:', error.message);
      
      // NO usar mock data por defecto - lanzar error para que el hook lo maneje
      throw new Error(`Error conectando con el backend: ${error.message}`);
    }
  }

  /**
   * Obtiene un anuncio específico por ID - SOLO BACKEND
   */
  async obtenerAnuncioPorId(id: number): Promise<AnuncioMunicipal | null> {
    try {
      console.log(`🔄 Obteniendo anuncio ${id} desde backend...`);
      
      const url = `${this.baseURL}${ENDPOINTS.ANUNCIOS}${id}/`;
      const response = await this.fetchWithAuth(url);

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ Anuncio ${id} no encontrado en backend`);
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const anuncio = await response.json();
      console.log('✅ Anuncio obtenido desde backend:', anuncio.titulo);
      return anuncio;

    } catch (error) {
      console.error(`❌ Error obteniendo anuncio ${id}:`, error.message);
      throw new Error(`Error obteniendo anuncio: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de anuncios - SOLO BACKEND
   */
  async obtenerEstadisticasAnuncios(): Promise<{
    total: number;
    activos: number;
    programados: number;
    finalizados: number;
  }> {
    try {
      console.log('🔄 Obteniendo estadísticas desde backend...');
      
      const url = `${this.baseURL}${ENDPOINTS.ANUNCIOS}estadisticas/`;
      const response = await this.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const stats = await response.json();
      console.log('✅ Estadísticas desde backend:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas desde backend:', error.message);
      
      // Como fallback, podríamos calcular estadísticas desde los anuncios existentes
      try {
        const anuncios = await this.obtenerAnuncios();
        const stats = {
          total: anuncios.length,
          activos: anuncios.filter(a => a.estado.toLowerCase() === 'activo').length,
          programados: anuncios.filter(a => a.estado.toLowerCase() === 'programado').length,
          finalizados: anuncios.filter(a => a.estado.toLowerCase() === 'finalizado').length,
        };
        
        console.log('✅ Estadísticas calculadas desde anuncios obtenidos:', stats);
        return stats;
        
      } catch {
        throw new Error(`Error obteniendo estadísticas: ${error.message}`);
      }
    }
  }

  /**
   * Obtiene anuncios por estado - SOLO BACKEND
   */
  async obtenerAnunciosPorEstado(estado: string): Promise<AnuncioMunicipal[]> {
    try {
      console.log(`🔄 Obteniendo anuncios con estado "${estado}" desde backend...`);
      
      const url = `${this.baseURL}${ENDPOINTS.ANUNCIOS}?estado=${encodeURIComponent(estado)}`;
      const response = await this.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const anuncios = Array.isArray(data) ? data : (data.results || []);
      
      console.log(`✅ ${anuncios.length} anuncios encontrados con estado "${estado}"`);
      return anuncios;

    } catch (error) {
      console.error('❌ Error obteniendo anuncios por estado:', error.message);
      throw new Error(`Error filtrando anuncios: ${error.message}`);
    }
  }

  /**
   * Busca anuncios - SOLO BACKEND
   */
  async buscarAnuncios(query: string): Promise<AnuncioMunicipal[]> {
    try {
      console.log(`🔍 Buscando anuncios con query: "${query}"`);
      
      const url = `${this.baseURL}${ENDPOINTS.ANUNCIOS}?search=${encodeURIComponent(query)}`;
      const response = await this.fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const anuncios = Array.isArray(data) ? data : (data.results || []);
      
      console.log(`✅ ${anuncios.length} anuncios encontrados para "${query}"`);
      return anuncios;

    } catch (error) {
      console.error('❌ Error buscando anuncios:', error.message);
      throw new Error(`Error en búsqueda: ${error.message}`);
    }
  }

  /**
   * Prueba la conexión con el backend - MÉTODO CORREGIDO
   */
  async testConexion(): Promise<boolean> {
    try {
      console.log('🧪 Probando conexión con backend de anuncios...');
      
      // Hacer un request directo sin usar el método que puede fallar
      const url = `${this.baseURL}${ENDPOINTS.ANUNCIOS}`;
      const response = await this.fetchWithAuth(url, { method: 'GET' });
      
      const isConnected = response.ok;
      console.log(`🧪 Test conexión: ${isConnected ? '✅ ÉXITO' : '❌ FALLO'} (${response.status})`);
      
      if (isConnected) {
        // Verificar que la respuesta sea válida
        try {
          const data = await response.json();
          const hasValidData = Array.isArray(data) || (data && Array.isArray(data.results));
          console.log(`📊 Datos válidos: ${hasValidData}`);
          return hasValidData;
        } catch (parseError) {
          console.warn('⚠️ Error parsing response, pero conexión OK');
          return true; // Conexión OK aunque no podamos parsear
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Test conexión falló:', error.message);
      return false;
    }
  }

  /**
   * Método para obtener datos mock SOLO cuando se solicite explícitamente
   */
  async obtenerDatosMock(): Promise<AnuncioMunicipal[]> {
    console.log('🎭 Obteniendo datos mock de anuncios...');
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ ${anunciosMockData.length} anuncios mock cargados`);
    return anunciosMockData;
  }

  /**
   * Verificar si el backend está disponible
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health/`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Información de debug del servicio
   */
  getDebugInfo() {
    return {
      baseURL: this.baseURL,
      anunciosEndpoint: ENDPOINTS.ANUNCIOS,
      fullURL: `${this.baseURL}${ENDPOINTS.ANUNCIOS}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export default new AnunciosService();
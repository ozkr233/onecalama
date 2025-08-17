// src/services/anuncios.ts
import { AnuncioMunicipal, ApiResponse } from '../types/denuncias';
import { ENDPOINTS } from '../constants/api';
import ApiClient from './api';
import { anunciosMockData } from '../data/anunciosMock';

class AnunciosService {

  /**
   * Obtiene la lista de anuncios municipales
   */
  async obtenerAnuncios(): Promise<AnuncioMunicipal[]> {
    try {
      console.log('🔄 Intentando obtener anuncios desde la API...');
      const response = await ApiClient.get<ApiResponse<AnuncioMunicipal>>(ENDPOINTS.ANUNCIOS);
      console.log('✅ Anuncios obtenidos desde la API:', response.results);
      return response.results;
    } catch (error) {
      console.error('❌ Error obteniendo anuncios desde la API:', error);
      console.log('🔄 Usando datos mock como fallback...');
      
      // Simular delay de red para hacer más realista
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('✅ Anuncios mock cargados:', anunciosMockData.length, 'anuncios');
      return anunciosMockData;
    }
  }

  /**
   * Obtiene un anuncio específico por ID
   */
  async obtenerAnuncioPorId(id: number): Promise<AnuncioMunicipal | null> {
    try {
      console.log(`🔄 Intentando obtener anuncio ${id} desde la API...`);
      const anuncio = await ApiClient.get<AnuncioMunicipal>(`${ENDPOINTS.ANUNCIOS}${id}/`);
      console.log('✅ Anuncio obtenido desde la API:', anuncio);
      return anuncio;
    } catch (error) {
      console.error(`❌ Error obteniendo anuncio ${id} desde la API:`, error);
      console.log('🔄 Buscando en datos mock...');
      
      // Buscar en datos mock como fallback
      const anuncio = anunciosMockData.find(a => a.id === id);
      if (anuncio) {
        console.log('✅ Anuncio encontrado en mock data:', anuncio);
        return anuncio;
      }
      
      console.log('❌ Anuncio no encontrado');
      return null;
    }
  }

  /**
   * Obtiene anuncios por estado
   */
  async obtenerAnunciosPorEstado(estado: string): Promise<AnuncioMunicipal[]> {
    try {
      console.log(`🔄 Obteniendo anuncios con estado: ${estado}`);
      const response = await ApiClient.get<ApiResponse<AnuncioMunicipal>>(
        `${ENDPOINTS.ANUNCIOS}?estado=${estado}`
      );
      return response.results;
    } catch (error) {
      console.error('❌ Error obteniendo anuncios por estado:', error);
      
      // Filtrar mock data por estado
      const anunciosFiltrados = anunciosMockData.filter(
        anuncio => anuncio.estado.toLowerCase() === estado.toLowerCase()
      );
      
      console.log(`✅ ${anunciosFiltrados.length} anuncios encontrados con estado ${estado} en mock data`);
      return anunciosFiltrados;
    }
  }

  /**
   * Obtiene anuncios por categoría
   */
  async obtenerAnunciosPorCategoria(categoriaId: number): Promise<AnuncioMunicipal[]> {
    try {
      console.log(`🔄 Obteniendo anuncios de categoría: ${categoriaId}`);
      const response = await ApiClient.get<ApiResponse<AnuncioMunicipal>>(
        `${ENDPOINTS.ANUNCIOS}?categoria=${categoriaId}`
      );
      return response.results;
    } catch (error) {
      console.error('❌ Error obteniendo anuncios por categoría:', error);
      
      // Filtrar mock data por categoría
      const anunciosFiltrados = anunciosMockData.filter(
        anuncio => anuncio.categoria.id === categoriaId
      );
      
      console.log(`✅ ${anunciosFiltrados.length} anuncios encontrados en categoría ${categoriaId} en mock data`);
      return anunciosFiltrados;
    }
  }

  async buscarAnuncios(query: string): Promise<AnuncioMunicipal[]> {
    try {
      console.log(` Buscando anuncios con query: ${query}`);
      const response = await ApiClient.get<ApiResponse<AnuncioMunicipal>>(
        `${ENDPOINTS.ANUNCIOS}?buscar=${encodeURIComponent(query)}`
      );
      return response.results;
    } catch (error) {
      console.error('❌ Error buscando anuncios:', error);
      
      // Buscar en mock data
      const queryLower = query.toLowerCase();
      const anunciosEncontrados = anunciosMockData.filter(anuncio =>
        anuncio.titulo.toLowerCase().includes(queryLower) ||
        anuncio.descripcion.toLowerCase().includes(queryLower) ||
        anuncio.subtitulo.toLowerCase().includes(queryLower)
      );
      
      console.log(`✅ ${anunciosEncontrados.length} anuncios encontrados con query "${query}" en mock data`);
      return anunciosEncontrados;
    }
  }

  /**
   * Obtiene estadísticas de anuncios
   */
  async obtenerEstadisticasAnuncios(): Promise<{
    total: number;
    activos: number;
    programados: number;
    finalizados: number;
  }> {
    try {
      console.log('🔄 Obteniendo estadísticas de anuncios...');
      const stats = await ApiClient.get<{ total: number; activos: number; programados: number; finalizados: number }>(`${ENDPOINTS.ANUNCIOS}/estadisticas/`);
      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      
      // Calcular estadísticas desde mock data
      const stats = {
        total: anunciosMockData.length,
        activos: anunciosMockData.filter(a => a.estado === 'Activo').length,
        programados: anunciosMockData.filter(a => a.estado === 'Programado').length,
        finalizados: anunciosMockData.filter(a => a.estado === 'Finalizado').length,
      };
      
      console.log('✅ Estadísticas calculadas desde mock data:', stats);
      return stats;
    }
  }

  /**
   * Prueba la conexión con el servicio de anuncios
   */
  async testConexion(): Promise<boolean> {
    try {
      await this.obtenerAnuncios();
      return true;
    } catch (error) {
      console.error('❌ Error probando conexión de anuncios:', error);
      return false;
    }
  }
}

export default new AnunciosService();
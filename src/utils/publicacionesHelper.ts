// src/utils/publicacionesHelper.ts - Helper para obtener publicaciones existentes
import { apiService } from '../services/api';

export class PublicacionesHelper {

  /**
   * Obtener lista de publicaciones para usar en tests
   */
  static async obtenerPublicacionesParaTest(): Promise<any[]> {
    try {
      console.log('📋 Obteniendo publicaciones existentes para test...');

      const response = await apiService.get<any>('/publicaciones/', true);
      const publicaciones = response.results || response;

      console.log(`✅ ${publicaciones.length} publicaciones encontradas`);

      // Mostrar información básica para debug
      if (publicaciones.length > 0) {
        console.log('📋 Primeras 3 publicaciones:',
          publicaciones.slice(0, 3).map((p: any) => ({
            id: p.id,
            codigo: p.codigo,
            titulo: p.titulo
          }))
        );
      }

      return publicaciones;

    } catch (error) {
      console.error('❌ Error obteniendo publicaciones:', error);
      return [];
    }
  }

  /**
   * Obtener una publicación específica para verificar que existe
   */
  static async verificarPublicacionExiste(id: number): Promise<boolean> {
    try {
      console.log(`🔍 Verificando si existe publicación ${id}...`);

      const publicacion = await apiService.get(`/publicaciones/${id}/`, true);

      if (publicacion && publicacion.id) {
        console.log(`✅ Publicación ${id} existe:`, {
          codigo: publicacion.codigo,
          titulo: publicacion.titulo
        });
        return true;
      }

      return false;

    } catch (error) {
      console.warn(`⚠️ Publicación ${id} no existe o error:`, error.message);
      return false;
    }
  }

  /**
   * Crear una publicación de prueba para usar en tests de evidencias
   */
  static async crearPublicacionDePrueba(): Promise<number | null> {
    try {
      console.log('📝 Creando publicación de prueba para test de evidencias...');

      const publicacionPrueba = {
        titulo: 'Test de Evidencias',
        descripcion: 'Publicación creada automáticamente para probar subida de evidencias',
        categoria: 1,
        departamento: 1,
        nombre_calle: 'Calle de Prueba',
        numero_calle: 123,
        latitud: -22.456900,
        longitud: -68.931700,
        junta_vecinal: 1,
        usuario: 1, // Asumiendo que existe usuario con ID 1
      };

      const nuevaPublicacion = await apiService.post('/publicaciones/', publicacionPrueba, true);

      console.log('✅ Publicación de prueba creada:', {
        id: nuevaPublicacion.id,
        codigo: nuevaPublicacion.codigo
      });

      return nuevaPublicacion.id;

    } catch (error) {
      console.error('❌ Error creando publicación de prueba:', error);
      return null;
    }
  }

  /**
   * Obtener evidencias de una publicación específica
   */
  static async obtenerEvidenciasDePublicacion(publicacionId: number): Promise<any[]> {
    try {
      console.log(`📎 Obteniendo evidencias de publicación ${publicacionId}...`);

      const response = await apiService.get(`/evidencias/?publicacion_id=${publicacionId}`, true);
      const evidencias = response.results || response;

      console.log(`📎 ${evidencias.length} evidencias encontradas para publicación ${publicacionId}`);

      return evidencias;

    } catch (error) {
      console.error(`❌ Error obteniendo evidencias de publicación ${publicacionId}:`, error);
      return [];
    }
  }

  /**
   * Debug completo: mostrar info de una publicación y sus evidencias
   */
  static async debugPublicacion(id: number): Promise<void> {
    try {
      console.log(`🔍 === DEBUG PUBLICACIÓN ${id} ===`);

      // Verificar si existe
      const existe = await this.verificarPublicacionExiste(id);
      if (!existe) {
        console.log(`❌ Publicación ${id} no existe`);
        return;
      }

      // Obtener evidencias
      const evidencias = await this.obtenerEvidenciasDePublicacion(id);

      console.log(`📊 Resumen publicación ${id}:`);
      console.log(`   - Existe: ✅`);
      console.log(`   - Evidencias: ${evidencias.length}`);

      if (evidencias.length > 0) {
        console.log(`   - URLs evidencias:`, evidencias.map(e => e.archivo));
      }

      console.log(`🔍 === FIN DEBUG PUBLICACIÓN ${id} ===`);

    } catch (error) {
      console.error(`❌ Error en debug de publicación ${id}:`, error);
    }
  }
}

export default PublicacionesHelper;
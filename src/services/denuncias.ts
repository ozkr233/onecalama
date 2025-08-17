// src/services/denuncias.ts - OPTIMIZADO
import ApiClient from './api';
import {
  Publicacion,
  DepartamentoMunicipal,
  Categoria,
  JuntaVecinal,
  SituacionPublicacion,
  CreatePublicacionPayload,
  ApiResponse,
  DenunciaFormData,
  Evidencia
} from '../types/denuncias';
import { anunciosMockData } from '../data/anunciosMock';



class DenunciasService {
  private readonly endpoints = {
    categorias: '/categorias/',
    departamentos: '/departamentos/',
    juntasVecinales: '/juntas-vecinales/',
    publicaciones: '/publicaciones/',
    anuncios: '/anuncios/',
    evidencias: '/evidencias/'
  };

  // Cache de datos críticos con fallbacks
  private fallbackData = {
   categorias: [
         {
           id: 1,
           nombre: 'Alumbrado Público',
           descripcion: 'Problemas con iluminación pública',
           departamento: { id: 1, nombre: 'Obras Públicas', descripcion: 'Infraestructura y vialidad municipal' }
         },
         {
           id: 2,
           nombre: 'Calles y Veredas',
           descripcion: 'Problemas viales y de infraestructura',
           departamento: { id: 1, nombre: 'Obras Públicas', descripcion: 'Infraestructura y vialidad municipal' }
         },
         {
           id: 3,
           nombre: 'Recolección de Basura',
           descripcion: 'Problemas con recolección de residuos',
           departamento: { id: 2, nombre: 'Medio Ambiente', descripcion: 'Limpieza y ornato municipal' }
         },
         {
           id: 4,
           nombre: 'Áreas Verdes',
           descripcion: 'Mantenimiento de parques y jardines',
           departamento: { id: 2, nombre: 'Medio Ambiente', descripcion: 'Limpieza y ornato municipal' }
         },
         {
           id: 5,
           nombre: 'Seguridad',
           descripcion: 'Temas de seguridad ciudadana',
           departamento: { id: 3, nombre: 'Servicios Municipales', descripcion: 'Servicios básicos municipales' }
         },
       ],
       departamentos: [
         { id: 1, nombre: 'Obras Públicas', descripcion: 'Infraestructura y vialidad municipal' },
         { id: 2, nombre: 'Medio Ambiente', descripcion: 'Limpieza y ornato municipal' },
         { id: 3, nombre: 'Servicios Municipales', descripcion: 'Servicios básicos municipales' },
         { id: 4, nombre: 'Seguridad Ciudadana', descripcion: 'Seguridad y vigilancia' },
       ],
    juntasVecinales: [
      { id: 1, nombre: 'Centro', sector: 'Centro' },
      { id: 2, nombre: 'Norte', sector: 'Norte' },
      { id: 3, nombre: 'Sur', sector: 'Sur' },
    ]
  };

  // Obtener categorías con fallback
  async getCategorias(): Promise<Categoria[]> {
    try {
      console.log('🔄 Obteniendo categorías...');
      const response = await ApiClient.get<ApiResponse<Categoria>>(this.endpoints.categorias, {
        timeout: 5000,
        cacheTTL: 30 * 60 * 1000, // Cache por 30 minutos
      });

      const categorias = response.results || response as any || [];
      console.log('✅ Categorías obtenidas:', categorias.length);
      return categorias;
    } catch (error) {
      console.warn('⚠️ Error obteniendo categorías, usando fallback:', error.message);
      return this.fallbackData.categorias;
    }
  }

  // Obtener departamentos con fallback
  async getDepartamentos(): Promise<Departamento[]> {
    try {
      console.log('🔄 Obteniendo departamentos...');
      const response = await ApiClient.get<ApiResponse<Departamento>>(this.endpoints.departamentos, {
        timeout: 5000,
        cacheTTL: 30 * 60 * 1000, // Cache por 30 minutos
      });

      const departamentos = response.results || response as any || [];
      console.log('✅ Departamentos obtenidos:', departamentos.length);
      return departamentos;
    } catch (error) {
      console.warn('⚠️ Error obteniendo departamentos, usando fallback:', error.message);
      return this.fallbackData.departamentos;
    }
  }

  // Obtener juntas vecinales con fallback
  async getJuntasVecinales(): Promise<JuntaVecinal[]> {
    try {
      console.log('🔄 Obteniendo juntas vecinales...');
      const response = await ApiClient.get<ApiResponse<JuntaVecinal>>(this.endpoints.juntasVecinales, {
        timeout: 5000,
        cacheTTL: 60 * 60 * 1000, // Cache por 1 hora
      });

      const juntas = response.results || response as any || [];
      console.log('✅ Juntas vecinales obtenidas:', juntas.length);
      return juntas;
    } catch (error) {
      console.warn('⚠️ Error obteniendo juntas vecinales, usando fallback:', error.message);
      return this.fallbackData.juntasVecinales;
    }
  }

  // Crear publicación optimizada
  async crearPublicacion(formData: DenunciaFormData): Promise<CreatePublicacionResponse> {
    try {
      console.log('🔄 Creando publicación...');

      // Validación de datos
      if (!formData.titulo?.trim()) {
        throw new Error('El título es obligatorio');
      }
      if (!formData.descripcion?.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      if (!formData.ubicacion) {
        throw new Error('La ubicación es obligatoria');
      }

      // Convertir formData a formato de API
      const payload: CreatePublicacionPayload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: typeof formData.categoria === 'string'
          ? parseInt(formData.categoria)
          : formData.categoria,
        departamento: typeof formData.departamento === 'string'
          ? parseInt(formData.departamento)
          : formData.departamento,
        nombre_calle: formData.direccion || 'Sin especificar',
        numero_calle: 0, // Default si no se proporciona
        latitud: formData.ubicacion.latitud,
        longitud: formData.ubicacion.longitud,
        junta_vecinal: 1, // Default, debería obtenerse del usuario o ubicación
      };

      console.log('📤 Payload a enviar:', payload);

      const response = await ApiClient.post<CreatePublicacionResponse>(
        this.endpoints.publicaciones,
        payload,
        {
          timeout: 15000, // 15 segundos para crear
          retries: 1 // Solo 1 reintento para crear
        }
      );

      console.log('✅ Publicación creada exitosamente:', response);
      return response;

    } catch (error:any) {
      console.error('❌ Error creando publicación:', error);

      // Mejorar mensajes de error
      if (error.message?.includes('400')) {
        throw new Error('Los datos enviados no son válidos. Revisa la información.');
      } else if (error.message?.includes('401')) {
        throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
      } else if (error.message?.includes('403')) {
        throw new Error('No tienes permisos para realizar esta acción.');
      } else if (error.message?.includes('500')) {
        throw new Error('Error del servidor. Intenta más tarde.');
      } else if (error.message?.includes('Tiempo de espera')) {
        throw new Error('La conexión está tardando mucho. Verifica tu internet.');
      }

      throw error;
    }
  }

  // Obtener publicaciones del usuario
  async getMisPublicaciones(page: number = 1, limit: number = 10): Promise<ApiResponse<Publicacion>> {
    try {
      console.log(`🔄 Obteniendo mis publicaciones (página ${page})...`);

      const response = await ApiClient.get<ApiResponse<Publicacion>>(
        `${this.endpoints.publicaciones}?page=${page}&limit=${limit}`,
        {
          cacheTTL: 2 * 60 * 1000, // Cache por 2 minutos
        }
      );

      console.log('✅ Publicaciones obtenidas:', response.results?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo publicaciones:', error);
      throw error;
    }
  }

  // Obtener detalle de publicación
  async getPublicacionDetalle(id: string | number): Promise<Publicacion> {
    try {
      console.log(`🔄 Obteniendo detalle de publicación ${id}...`);

      const response = await ApiClient.get<Publicacion>(
        `${this.endpoints.publicaciones}${id}/`,
        {
          cacheTTL: 5 * 60 * 1000, // Cache por 5 minutos
        }
      );

      console.log('✅ Detalle de publicación obtenido');
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo detalle de publicación ${id}:`, error);
      throw error;
    }
  }

  // Obtener anuncios municipales
  async getAnuncios(page: number = 1, limit: number = 10): Promise<ApiResponse<Anuncio>> {
    try {
      console.log(`🔄 Obteniendo anuncios (página ${page})...`);

      const response = await ApiClient.get<ApiResponse<Anuncio>>(
        `${this.endpoints.anuncios}?page=${page}&limit=${limit}`,
        {
          cacheTTL: 10 * 60 * 1000, // Cache por 10 minutos
        }
      );

      console.log('✅ Anuncios obtenidos:', response.results?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo anuncios:', error);
      throw error;
    }
  }

  // Subir evidencia
  async subirEvidencia(publicacionId: number, archivo: File | Blob, nombre: string): Promise<any> {
    try {
      console.log(`🔄 Subiendo evidencia para publicación ${publicacionId}...`);

      const formData = new FormData();
      formData.append('publicacion', publicacionId.toString());
      formData.append('evidencia', archivo, nombre);

      const response = await ApiClient.postFormData(
        this.endpoints.evidencias,
        formData,
        { timeout: 30000 } // 30 segundos para upload
      );

      console.log('✅ Evidencia subida exitosamente');
      return response;
    } catch (error) {
      console.error('❌ Error subiendo evidencia:', error);
      throw error;
    }
  }

  // Precargar datos críticos
  async precargarDatos(): Promise<void> {
    try {
      console.log('🔄 Precargando datos críticos...');

      const promises = [
        this.getCategorias(),
        this.getDepartamentos(),
        this.getJuntasVecinales(),
      ];

      await Promise.allSettled(promises);
      console.log('✅ Datos críticos precargados');
    } catch (error) {
      console.warn('⚠️ Error precargando datos:', error);
    }
  }

  // Limpiar cache específico
  limpiarCache(): void {
    ApiClient.clearCache();
    console.log('🗑️ Cache de denuncias limpiado');
  }

  // Verificar conectividad
  async verificarConectividad(): Promise<boolean> {
    return await ApiClient.checkConnection();
  }
}


export default new DenunciasService();
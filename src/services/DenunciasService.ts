// src/services/DenunciasService.ts - CONECTADO A TU API REAL
import { apiService } from './api';
import { DenunciaFormData } from '../types/denuncias';
import AuthHelper from '../utils/authHelper';
import UserHelper from '../utils/userHelper';

// Interfaces basadas en tu backend Django
interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  departamento: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

interface DepartamentoMunicipal {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface JuntaVecinal {
  id: number;
  nombre_junta?: string;
  nombre_calle?: string;
  numero_calle: number;
  departamento?: string;
  villa?: string;
  comuna?: string;
  latitud: number;
  longitud: number;
}

interface PublicacionResponse {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  nombre_calle?: string;
  numero_calle: number;
  latitud: number;
  longitud: number;
  categoria: Categoria;
  departamento: DepartamentoMunicipal;
  junta_vecinal: JuntaVecinal;
  usuario: any;
  situacion?: any;
  evidencias?: any[];
}

class DenunciasService {

  constructor() {
    console.log('🔧 DenunciasService inicializado');
  }

  // ===== VERIFICACIÓN DE CONEXIÓN =====

  /**
   * Verificar que el token esté configurado y sea válido
   */
  async verificarAutenticacion(): Promise<boolean> {
    try {
      const status = await AuthHelper.checkTokenStatus();

      if (!status.hasToken) {
        console.warn('⚠️ No hay token disponible');
        return false;
      }

      if (status.isExpired) {
        console.warn('⚠️ Token expirado');
        return false;
      }

      console.log('✅ Autenticación válida');
      return true;
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  }

  // ===== DATOS MAESTROS =====

  /**
   * Obtener todas las categorías desde tu API Django
   */
  async getCategorias(): Promise<Categoria[]> {
    try {
      console.log('📚 Obteniendo categorías desde tu API Django...');

      // Verificar autenticación primero
      const isAuthenticated = await this.verificarAutenticacion();
      if (!isAuthenticated) {
        throw new Error('Token no válido. Verifica tu autenticación.');
      }

      const response = await apiService.get<{ results: Categoria[] }>('/categorias/', true);

      // Tu API devuelve un objeto paginado con 'results'
      const categorias = response.results || response as any || [];

      console.log(`✅ ${categorias.length} categorías obtenidas desde Django`);
      console.log('📋 Categorías:', categorias.map(c => `${c.id}: ${c.nombre}`));

      return categorias;

    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);

      // En caso de error, usar datos básicos para que la app no se rompa
      console.log('🔄 Usando categorías fallback...');
      return [
        {
          id: 1,
          nombre: 'Infraestructura',
          departamento: { id: 1, nombre: 'Obras Públicas' }
        },
        {
          id: 2,
          nombre: 'Servicios Públicos',
          departamento: { id: 2, nombre: 'Servicios Municipales' }
        },
        {
          id: 3,
          nombre: 'Seguridad',
          departamento: { id: 3, nombre: 'Seguridad Ciudadana' }
        },
      ] as Categoria[];
    }
  }

  /**
   * Obtener todos los departamentos desde tu API Django
   */
  async getDepartamentos(): Promise<DepartamentoMunicipal[]> {
    try {
      console.log('🏛️ Obteniendo departamentos desde tu API Django...');

      const isAuthenticated = await this.verificarAutenticacion();
      if (!isAuthenticated) {
        throw new Error('Token no válido. Verifica tu autenticación.');
      }

      const response = await apiService.get<{ results: DepartamentoMunicipal[] }>('/departamentos-municipales/', true);

      const departamentos = response.results || response as any || [];

      console.log(`✅ ${departamentos.length} departamentos obtenidos desde Django`);
      console.log('📋 Departamentos:', departamentos.map(d => `${d.id}: ${d.nombre}`));

      return departamentos;

    } catch (error) {
      console.error('❌ Error obteniendo departamentos:', error);

      console.log('🔄 Usando departamentos fallback...');
      return [
        { id: 1, nombre: 'Obras Públicas' },
        { id: 2, nombre: 'Seguridad Ciudadana' },
        { id: 3, nombre: 'Medio Ambiente' },
        { id: 4, nombre: 'Servicios Públicos' },
      ];
    }
  }

  /**
   * Obtener juntas vecinales desde tu API Django
   */
  async getJuntasVecinales(): Promise<JuntaVecinal[]> {
    try {
      console.log('🏘️ Obteniendo juntas vecinales desde tu API Django...');

      const isAuthenticated = await this.verificarAutenticacion();
      if (!isAuthenticated) {
        console.warn('⚠️ Sin autenticación para juntas vecinales, devolviendo array vacío');
        return [];
      }

      const response = await apiService.get<{ results: JuntaVecinal[] }>('/juntas-vecinales/', true);

      const juntas = response.results || response as any || [];

      console.log(`✅ ${juntas.length} juntas vecinales obtenidas desde Django`);

      return juntas;

    } catch (error) {
      console.error('❌ Error obteniendo juntas vecinales:', error);
      return [];
    }
  }

  // ===== PUBLICACIONES =====

  /**
   * Crear una nueva publicación en tu backend Django
   */
  async crearPublicacion(formData: DenunciaFormData): Promise<PublicacionResponse> {
    try {
      console.log('📝 Creando nueva publicación en Django...');
      console.log('📊 Datos del formulario recibidos:', {
        titulo: formData.titulo,
        descripcion: formData.descripcion?.length,
        categoria: formData.categoria,
        departamento: formData.departamento,
        direccion: formData.direccion,
        ubicacion: formData.ubicacion,
        evidencias: formData.evidencias?.length || 0
      });

      const isAuthenticated = await this.verificarAutenticacion();
      if (!isAuthenticated) {
        throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
      }

      // Validar datos antes de enviar
      if (!formData.titulo?.trim()) {
        throw new Error('El título es obligatorio');
      }
      if (!formData.descripcion?.trim()) {
        throw new Error('La descripción es obligatoria');
      }
      if (!formData.categoria) {
        throw new Error('La categoría es obligatoria');
      }
      if (!formData.departamento) {
        throw new Error('El departamento es obligatorio');
      }

      // Preparar datos según tu modelo Django
      const dataToSend = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: parseInt(formData.categoria), // ID de la categoría
        departamento: parseInt(formData.departamento), // ID del departamento
        nombre_calle: formData.direccion || 'Sin especificar',
        numero_calle: 0, // Default, puedes extraer del address si es necesario
        // CORREGIDO: Reducir precisión de coordenadas (máximo 9 dígitos)
        latitud: formData.ubicacion?.latitud ?
          parseFloat(formData.ubicacion.latitud.toFixed(6)) : -22.456900, // 6 decimales = 8 dígitos totales
        longitud: formData.ubicacion?.longitud ?
          parseFloat(formData.ubicacion.longitud.toFixed(6)) : -68.931700, // 6 decimales = 8 dígitos totales
        junta_vecinal: 1, // Usar la primera junta vecinal como default por ahora
        // NUEVO: Agregar usuario (obtenido del token JWT)
        usuario: await UserHelper.getCurrentUserId(),
      };

      console.log('📤 Payload final para Django:', JSON.stringify(dataToSend, null, 2));

      // Crear la publicación
      const nuevaPublicacion = await apiService.post<PublicacionResponse>('/publicaciones/', dataToSend, true);

      console.log('✅ Publicación creada en Django:', {
        id: nuevaPublicacion.id,
        codigo: nuevaPublicacion.codigo,
        titulo: nuevaPublicacion.titulo
      });

      // TODO: Subir evidencias si las hay
      if (formData.evidencias && formData.evidencias.length > 0) {
        console.log(`📎 Evidencias pendientes: ${formData.evidencias.length}`);
        // Implementar subida de evidencias más tarde
      }

      return nuevaPublicacion;

    } catch (error) {
      console.error('❌ Error creando publicación (detalles completos):', {
        message: error.message,
        status: error.status,
        details: error.details
      });

      // Mejorar mensajes de error según tu backend
      let mensajeError = 'No se pudo crear la denuncia.';

      if (error.status) {
        switch (error.status) {
          case 400:
            mensajeError = `Error de validación:\n${error.message}`;
            break;
          case 401:
            mensajeError = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
            break;
          case 403:
            mensajeError = 'No tienes permisos para crear publicaciones.';
            break;
          case 422:
            mensajeError = `Datos inválidos:\n${error.message}`;
            break;
          case 500:
            mensajeError = 'Error interno del servidor. Intenta más tarde.';
            break;
          default:
            mensajeError = error.message || 'Error desconocido del servidor.';
        }
      } else {
        mensajeError = error.message || 'Error de conexión.';
      }

      throw new Error(mensajeError);
    }
  }

  /**
   * Obtener mis publicaciones desde tu Django
   */
  async getMisPublicaciones(): Promise<PublicacionResponse[]> {
    try {
      console.log('📋 Obteniendo mis publicaciones...');

      const isAuthenticated = await this.verificarAutenticacion();
      if (!isAuthenticated) {
        throw new Error('Sesión expirada');
      }

      // Si tienes un endpoint específico para mis publicaciones
      const response = await apiService.get<{ results: PublicacionResponse[] }>('/publicaciones/', true);

      const publicaciones = response.results || response as any || [];

      console.log(`✅ ${publicaciones.length} publicaciones obtenidas`);
      return publicaciones;

    } catch (error) {
      console.error('❌ Error obteniendo mis publicaciones:', error);
      throw error;
    }
  }

  // ===== UTILIDADES =====

  /**
   * Cargar todos los datos iniciales necesarios
   */
  async cargarDatosIniciales(): Promise<{
    categorias: Categoria[];
    departamentos: DepartamentoMunicipal[];
    juntasVecinales: JuntaVecinal[];
    isAuthenticated: boolean;
  }> {
    console.log('📦 Cargando datos iniciales desde Django...');

    // Verificar autenticación primero
    const isAuthenticated = await this.verificarAutenticacion();

    if (!isAuthenticated) {
      console.warn('⚠️ Sin autenticación válida');
      return {
        categorias: [],
        departamentos: [],
        juntasVecinales: [],
        isAuthenticated: false,
      };
    }

    // Cargar datos en paralelo
    const [categoriasResult, departamentosResult, juntasResult] = await Promise.allSettled([
      this.getCategorias(),
      this.getDepartamentos(),
      this.getJuntasVecinales(),
    ]);

    const resultado = {
      categorias: categoriasResult.status === 'fulfilled' ? categoriasResult.value : [],
      departamentos: departamentosResult.status === 'fulfilled' ? departamentosResult.value : [],
      juntasVecinales: juntasResult.status === 'fulfilled' ? juntasResult.value : [],
      isAuthenticated: true,
    };

    console.log('✅ Datos iniciales cargados desde Django:', {
      categorias: resultado.categorias.length,
      departamentos: resultado.departamentos.length,
      juntasVecinales: resultado.juntasVecinales.length,
    });

    return resultado;
  }

  /**
   * Test rápido de conexión y debug de usuarios
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Probando conexión con Django...');

      // Debug usuarios disponibles
      await UserHelper.debugUsuarios();

      const categorias = await this.getCategorias();
      const success = categorias.length > 0;
      console.log(success ? '✅ Conexión exitosa' : '❌ Sin datos');
      return success;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const denunciasService = new DenunciasService();

// También exportar la clase
export default DenunciasService;
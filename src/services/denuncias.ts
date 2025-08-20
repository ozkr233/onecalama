// src/services/denuncias.ts - SERVICIO COMPLETO PARA DENUNCIAS
import { DenunciaFormData, Publicacion, Categoria, DepartamentoMunicipal, JuntaVecinal } from '../types/denuncias';
import { apiService } from './api';
import { evidenciasService } from './evidencias';
import AuthHelper from '../utils/authHelper';
import UserHelper from '../utils/userHelper';

// Tipos de respuesta del backend
interface PublicacionResponse extends Publicacion {
  evidencias?: any[];
  evidenciasError?: string;
  evidenciasStatus?: 'success' | 'error' | 'none' | 'partial';
}

interface DatosIniciales {
  categorias: Categoria[];
  departamentos: DepartamentoMunicipal[];
  juntasVecinales: JuntaVecinal[];
  isAuthenticated: boolean;
}

class DenunciasService {

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AuthHelper.getToken();
      return !!token;
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  }

  /**
   * Cargar todos los datos iniciales necesarios para el formulario
   */
  async cargarDatosIniciales(): Promise<DatosIniciales> {
    try {
      console.log('🔄 Cargando datos iniciales desde Django...');

      // Verificar autenticación primero
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        throw new Error('Token expirado o inválido. Verifica tu autenticación.');
      }

      // Cargar datos en paralelo para mejor rendimiento
      const [categoriasResponse, departamentosResponse, juntasResponse] = await Promise.all([
        this.cargarCategorias(),
        this.cargarDepartamentos(),
        this.cargarJuntasVecinales()
      ]);

      const datos: DatosIniciales = {
        categorias: categoriasResponse,
        departamentos: departamentosResponse,
        juntasVecinales: juntasResponse,
        isAuthenticated: true
      };

      console.log('✅ Datos iniciales cargados:', {
        categorias: datos.categorias.length,
        departamentos: datos.departamentos.length,
        juntasVecinales: datos.juntasVecinales.length
      });

      return datos;

    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);

      // Retornar estructura vacía en caso de error pero mantener info de auth
      return {
        categorias: [],
        departamentos: [],
        juntasVecinales: [],
        isAuthenticated: await this.isAuthenticated()
      };
    }
  }

  /**
   * Cargar categorías desde el backend
   */
  async cargarCategorias(): Promise<Categoria[]> {
    try {
      console.log('📋 Cargando categorías...');

      const response = await apiService.get<any>('/categorias/', true);
      const categorias = response.results || response;

      console.log(`✅ ${categorias.length} categorías cargadas`);

      // Log de ejemplo para debugging
      if (categorias.length > 0) {
        console.log('📊 Primera categoría:', {
          id: categorias[0].id,
          nombre: categorias[0].nombre,
          departamento: categorias[0].departamento?.nombre
        });
      }

      return categorias;

    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      throw new Error('No se pudieron cargar las categorías');
    }
  }

  /**
   * Cargar departamentos desde el backend
   */
  async cargarDepartamentos(): Promise<DepartamentoMunicipal[]> {
    try {
      console.log('🏢 Cargando departamentos...');

      const response = await apiService.get<any>('/departamentos/', true);
      const departamentos = response.results || response;

      console.log(`✅ ${departamentos.length} departamentos cargados`);

      return departamentos;

    } catch (error) {
      console.error('❌ Error cargando departamentos:', error);
      throw new Error('No se pudieron cargar los departamentos');
    }
  }

  /**
   * Cargar juntas vecinales desde el backend
   */
  async cargarJuntasVecinales(): Promise<JuntaVecinal[]> {
    try {
      console.log('🏘️ Cargando juntas vecinales...');

      const response = await apiService.get<any>('/juntas-vecinales/', true);
      const juntas = response.results || response;

      console.log(`✅ ${juntas.length} juntas vecinales cargadas`);

      return juntas;

    } catch (error) {
      console.error('❌ Error cargando juntas vecinales:', error);
      // No es crítico, devolver array vacío
      console.warn('⚠️ Continuando sin juntas vecinales');
      return [];
    }
  }

  /**
   * Crear publicación completa con evidencias
   */
  async crearPublicacion(formData: DenunciaFormData): Promise<PublicacionResponse> {
    try {
      console.log('🚀 Iniciando creación de publicación completa...');
      console.log('📊 Datos recibidos:', {
        titulo: formData.titulo,
        categoria: formData.categoria,
        departamento: formData.departamento,
        evidencias: formData.evidencias?.length || 0
      });

      // Validar autenticación
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
      }

      // Validar datos del formulario
      this.validateFormData(formData);

      // PASO 1: Crear la publicación base
      console.log('📝 Paso 1: Creando publicación base...');
      const nuevaPublicacion = await this.createPublicacionBase(formData);
      console.log('✅ Publicación base creada:', {
        id: nuevaPublicacion.id,
        codigo: nuevaPublicacion.codigo
      });

      // PASO 2: Procesar evidencias si las hay
      if (formData.evidencias && formData.evidencias.length > 0) {
        console.log(`📎 Paso 2: Procesando ${formData.evidencias.length} evidencias...`);

        try {
          // Validar evidencias antes de subir
          const validation = evidenciasService.validateEvidencias(formData.evidencias);

          if (!validation.isValid) {
            console.warn('⚠️ Validación de evidencias falló:', validation.errors);
            // Continuar pero marcar como error parcial
            nuevaPublicacion.evidenciasStatus = 'partial';
            nuevaPublicacion.evidenciasError = validation.errors.join(', ');
          } else {
            // Mostrar advertencias si las hay
            if (validation.warnings.length > 0) {
              console.info('💡 Advertencias de evidencias:', validation.warnings);
            }

            // Subir evidencias usando el servicio
            const evidenciasSubidas = await evidenciasService.subirEvidencias(
              nuevaPublicacion.id,
              formData.evidencias
            );

            console.log(`✅ ${evidenciasSubidas.length} evidencias subidas exitosamente`);

            // Agregar evidencias a la respuesta
            nuevaPublicacion.evidencias = evidenciasSubidas;
            nuevaPublicacion.evidenciasStatus = 'success';

            // Log estadísticas
            const stats = evidenciasService.getEvidenciasStats(formData.evidencias);
            console.log('📊 Estadísticas finales:', stats);
          }

        } catch (evidenciaError) {
          console.error('❌ Error procesando evidencias:', evidenciaError);

          // IMPORTANTE: La publicación YA está creada, no fallar por las evidencias
          console.warn('⚠️ Publicación creada exitosamente, pero evidencias fallaron');

          nuevaPublicacion.evidenciasStatus = 'error';
          nuevaPublicacion.evidenciasError = evidenciaError.message;
          nuevaPublicacion.evidencias = [];
        }

      } else {
        console.log('📎 Sin evidencias para procesar');
        nuevaPublicacion.evidenciasStatus = 'none';
        nuevaPublicacion.evidencias = [];
      }

      console.log('🎉 Proceso de creación completado exitosamente');
      console.log('📄 Resultado final:', {
        codigo: nuevaPublicacion.codigo,
        evidenciasStatus: nuevaPublicacion.evidenciasStatus,
        evidenciasCount: nuevaPublicacion.evidencias?.length || 0
      });

      return nuevaPublicacion;

    } catch (error) {
      console.error('❌ Error en creación de publicación:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Crear solo la publicación base (sin evidencias)
   */
  private async createPublicacionBase(formData: DenunciaFormData): Promise<PublicacionResponse> {
    try {
      // Obtener ID del usuario actual
      const usuarioId = await UserHelper.getCurrentUserId();
      console.log('👤 Usuario ID obtenido:', usuarioId);

      // Preparar coordenadas con precisión limitada
      const latitud = formData.ubicacion?.latitude ?
        parseFloat(formData.ubicacion.latitude.toFixed(6)) : -22.456900;
      const longitud = formData.ubicacion?.longitude ?
        parseFloat(formData.ubicacion.longitude.toFixed(6)) : -68.931700;

      // Preparar payload según el modelo Django
      const dataToSend = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: parseInt(formData.categoria),
        departamento: parseInt(formData.departamento),
        nombre_calle: formData.direccion || 'Sin especificar',
        numero_calle: 0, // Default
        latitud: latitud,
        longitud: longitud,
        junta_vecinal: 1, // Default - primera junta vecinal
        usuario: usuarioId
      };

      console.log('📤 Enviando datos a Django:', JSON.stringify(dataToSend, null, 2));

      // Crear publicación
      const response = await apiService.post<PublicacionResponse>('/publicaciones/', dataToSend, true);

      console.log('✅ Respuesta de Django:', {
        id: response.id,
        codigo: response.codigo,
        titulo: response.titulo,
        usuario: response.usuario?.nombre
      });

      return response;

    } catch (error) {
      console.error('❌ Error creando publicación base:', error);
      throw error;
    }
  }

  /**
   * Obtener publicaciones del usuario
   */
  async obtenerMisPublicaciones(): Promise<Publicacion[]> {
    try {
      console.log('📋 Obteniendo mis publicaciones...');

      const response = await apiService.get<any>('/publicaciones/', true);
      const publicaciones = response.results || response;

      console.log(`✅ ${publicaciones.length} publicaciones obtenidas`);

      return publicaciones;

    } catch (error) {
      console.error('❌ Error obteniendo publicaciones:', error);
      throw new Error('No se pudieron cargar tus publicaciones');
    }
  }

  /**
   * Obtener una publicación específica por ID
   */
  async obtenerPublicacion(id: number): Promise<Publicacion> {
    try {
      console.log(`📄 Obteniendo publicación ${id}...`);

      const publicacion = await apiService.get<Publicacion>(`/publicaciones/${id}/`, true);

      console.log('✅ Publicación obtenida:', publicacion.codigo);

      return publicacion;

    } catch (error) {
      console.error(`❌ Error obteniendo publicación ${id}:`, error);
      throw new Error('No se pudo cargar la publicación');
    }
  }

  /**
   * Validar datos del formulario antes de enviar
   */
  private validateFormData(formData: DenunciaFormData): void {
    const errors: string[] = [];

    if (!formData.titulo?.trim()) {
      errors.push('El título es obligatorio');
    }

    if (formData.titulo?.trim().length < 5) {
      errors.push('El título debe tener al menos 5 caracteres');
    }

    if (!formData.descripcion?.trim()) {
      errors.push('La descripción es obligatoria');
    }

    if (formData.descripcion?.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!formData.categoria) {
      errors.push('Debes seleccionar una categoría');
    }

    if (!formData.departamento) {
      errors.push('Debes seleccionar un departamento');
    }

    // Validar evidencias si las hay
    if (formData.evidencias && formData.evidencias.length > 0) {
      const evidenciaValidation = evidenciasService.validateEvidencias(formData.evidencias);
      if (!evidenciaValidation.isValid) {
        errors.push(...evidenciaValidation.errors);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
  }

  /**
   * Manejar errores de la API y convertirlos a mensajes útiles
   */
  private handleApiError(error: any): Error {
    console.error('🔍 Analizando error de API:', {
      status: error.status,
      message: error.message,
      details: error.details
    });

    let mensajeError = 'No se pudo completar la operación.';

    // Errores HTTP específicos
    if (error.status) {
      switch (error.status) {
        case 400:
          mensajeError = `Error de validación:\n${error.message || 'Datos inválidos'}`;
          break;
        case 401:
          mensajeError = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
          break;
        case 403:
          mensajeError = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          mensajeError = 'El recurso solicitado no fue encontrado.';
          break;
        case 422:
          mensajeError = 'Los datos enviados no son válidos. Revisa la información.';
          break;
        case 429:
          mensajeError = 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.';
          break;
        case 500:
          mensajeError = 'Error interno del servidor. Intenta más tarde.';
          break;
        case 502:
        case 503:
        case 504:
          mensajeError = 'El servidor no está disponible. Intenta más tarde.';
          break;
        default:
          mensajeError = `Error del servidor (${error.status}): ${error.message || 'Error desconocido'}`;
      }
    }
    // Errores de red
    else if (error.message) {
      if (error.message.includes('Network')) {
        mensajeError = 'Error de conexión. Verifica tu internet.';
      } else if (error.message.includes('timeout')) {
        mensajeError = 'La solicitud tardó demasiado. Intenta nuevamente.';
      } else {
        mensajeError = error.message;
      }
    }

    return new Error(mensajeError);
  }

  /**
   * Obtener estadísticas del usuario (opcional)
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      console.log('📊 Obteniendo estadísticas del usuario...');

      // Obtener publicaciones para calcular estadísticas localmente
      const publicaciones = await this.obtenerMisPublicaciones();

      const stats = {
        totalPublicaciones: publicaciones.length,
        publicacionesRecientes: publicaciones.filter(p => {
          const fecha = new Date(p.fecha_publicacion);
          const hace30Dias = new Date();
          hace30Dias.setDate(hace30Dias.getDate() - 30);
          return fecha > hace30Dias;
        }).length,
        categoriasMasUsadas: this.calcularCategoriasMasUsadas(publicaciones)
      };

      console.log('✅ Estadísticas calculadas:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalPublicaciones: 0,
        publicacionesRecientes: 0,
        categoriasMasUsadas: []
      };
    }
  }

  /**
   * Calcular categorías más usadas por el usuario
   */
  private calcularCategoriasMasUsadas(publicaciones: Publicacion[]): any[] {
    const conteo: { [key: string]: number } = {};

    publicaciones.forEach(pub => {
      const categoria = pub.categoria.nombre;
      conteo[categoria] = (conteo[categoria] || 0) + 1;
    });

    return Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Top 5
  }

  /**
   * Verificar conexión con el servidor
   */
  async verificarConexion(): Promise<boolean> {
    try {
      console.log('🔍 Verificando conexión con el servidor...');

      // Hacer una petición simple para verificar conectividad
      await apiService.get('/categorias/', true);

      console.log('✅ Conexión verificada exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }
}

// Instancia singleton del servicio
export const denunciasService = new DenunciasService();
export default DenunciasService;
// src/services/denuncias.ts - SERVICIO COMPLETO PARA DENUNCIAS (mejorado)
import {
  DenunciaFormData,
  Publicacion,
  Categoria,
  DepartamentoMunicipal,
  JuntaVecinal
} from '../types/denuncias';
import { apiService } from './api';
import { evidenciasService } from './evidencias';
import AuthHelper from '../utils/authHelper';
import UserHelper from '../utils/userHelper';

// ---------------------------------------------
// Tipos auxiliares
// ---------------------------------------------
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

// ---------------------------------------------
// Utilidad: normalizar payload {results} | []
// ---------------------------------------------
function normalizeResults<T = any>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if ('results' in response && Array.isArray(response.results)) return response.results;
  return [];
}

// ---------------------------------------------
// Servicio
// ---------------------------------------------
class DenunciasService {
  // --------------------- Auth ---------------------
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AuthHelper.getToken();
      return !!token;
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  }

  // --------------------- Errores ---------------------
  private handleApiError(error: any): Error {
    // apiService suele lanzar un error con shape { status, statusText, data } o texto plano
    try {
      const status = error?.status ?? error?.response?.status;
      const data = error?.data ?? error?.response?.data;
      const msgData =
        typeof data === 'string'
          ? data
          : data?.errorMessage || data?.detail || JSON.stringify(data);
      const statusText = error?.statusText ?? error?.response?.statusText ?? '';

      const message =
        status === 404
          ? (msgData || 'El recurso solicitado no fue encontrado en el servidor.')
          : status
          ? `HTTP ${status} ${statusText} ${msgData ? `- ${msgData}` : ''}`.trim()
          : msgData || error?.message || 'Error desconocido';

      return new Error(message);
    } catch {
      return new Error(error?.message || 'Error desconocido');
    }
  }

  // --------------------- Validaciones ---------------------
  private validateFormData(formData: DenunciaFormData): void {
    const errors: string[] = [];

    if (!formData.titulo || !formData.titulo.trim()) {
      errors.push('El título es obligatorio.');
    }

    if (!formData.descripcion || !formData.descripcion.trim()) {
      errors.push('La descripción es obligatoria.');
    }

    if (!formData.categoria) {
      errors.push('Debe seleccionar una categoría.');
    }

    if (!formData.departamento) {
      // Se puede autoasignar por categoría, pero si llegó vacío aquí, lo marcamos:
      errors.push('No se pudo determinar el departamento.');
    }

    if (errors.length) {
      throw new Error(errors.join(' '));
    }
  }

  // --------------------- Cargas maestras ---------------------
  async cargarCategorias(): Promise<Categoria[]> {
    try {
      console.log('📋 Cargando categorías...');
      const response = await apiService.get<any>('/categorias/', true);
      const categorias = normalizeResults<Categoria>(response);
      console.log(`✅ ${categorias.length} categorías cargadas`);

      if (categorias.length) {
        console.log('📊 Primera categoría:', {
          id: categorias[0]?.id,
          nombre: categorias[0]?.nombre,
          departamento:
            (categorias[0] as any)?.departamento?.nombre ?? (categorias[0] as any)?.departamento
        });
      }

      return categorias;
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error cargando categorías:', parsed);
      throw parsed;
    }
  }

  async cargarDepartamentos(): Promise<DepartamentoMunicipal[]> {
    try {
      console.log('🏢 Cargando departamentos...');
      // ✅ Endpoint corregido
      const response = await apiService.get<any>('/departamentos-municipales/', true);
      const departamentos = normalizeResults<DepartamentoMunicipal>(response);
      console.log(`✅ ${departamentos.length} departamentos cargados`);
      return departamentos;
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error cargando departamentos:', parsed);
      // Propagamos porque varias pantallas dependen de esto
      throw new Error('No se pudieron cargar los departamentos');
    }
  }

  async cargarJuntasVecinales(): Promise<JuntaVecinal[]> {
    try {
      console.log('🏘️ Cargando juntas vecinales...');
      const response = await apiService.get<any>('/juntas-vecinales/', true);
      const juntas = normalizeResults<JuntaVecinal>(response);
      console.log(`✅ ${juntas.length} juntas vecinales cargadas`);
      return juntas;
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error cargando juntas vecinales:', parsed);
      // No es crítico; devolvemos vacío para no frenar la UI
      console.warn('⚠️ Continuando sin juntas vecinales');
      return [];
    }
  }

  // --------------------- Carga inicial ---------------------
  async cargarDatosIniciales(): Promise<DatosIniciales> {
    try {
      console.log('🔄 Cargando datos iniciales desde Django...');

      // Verifica auth primero
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        throw new Error('Token expirado o inválido. Verifica tu autenticación.');
      }

      // Carga paralela con degradación elegante
      const [catRes, depRes, jvRes] = await Promise.allSettled([
        this.cargarCategorias(),
        this.cargarDepartamentos(),
        this.cargarJuntasVecinales()
      ]);

      const categoriasResponse =
        catRes.status === 'fulfilled' ? catRes.value : ([] as Categoria[]);
      const departamentosResponse =
        depRes.status === 'fulfilled' ? depRes.value : ([] as DepartamentoMunicipal[]);
      const juntasResponse = jvRes.status === 'fulfilled' ? jvRes.value : ([] as JuntaVecinal[]);

      const datos: DatosIniciales = {
        categorias: categoriasResponse,
        departamentos: departamentosResponse,
        juntasVecinales: juntasResponse,
        isAuthenticated: true
      };

      console.log('✅ Datos iniciales cargados:', {
        categorias: datos.categorias.length,
        departamentos: datos.departamentos.length,
        juntas: datos.juntasVecinales.length
      });

      return datos;
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error cargando datos iniciales:', parsed);

      // Devolvemos estructura vacía, preservando estado de auth (lo recalculamos por si expiró en el camino)
      return {
        categorias: [],
        departamentos: [],
        juntasVecinales: [],
        isAuthenticated: await this.isAuthenticated()
      };
    }
  }

  // --------------------- Crear publicación ---------------------
  private async createPublicacionBase(formData: DenunciaFormData): Promise<PublicacionResponse> {
    try {
      const usuarioId = await UserHelper.getCurrentUserId();
      console.log('👤 Usuario ID obtenido:', usuarioId);

      // Coordenadas con precisión controlada + valores por defecto
      const latitud = formData.ubicacion?.latitud
        ? parseFloat(formData.ubicacion.latitud.toFixed(6))
        : -22.4569;
      const longitud = formData.ubicacion?.longitud
        ? parseFloat(formData.ubicacion.longitud.toFixed(6))
        : -68.9317;

      // Payload según tu modelo de Django
      const dataToSend = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: Number(formData.categoria),
        departamento: Number(formData.departamento),
        nombre_calle: formData.direccion?.trim() || 'Sin especificar',
        numero_calle: Number(formData.direccion ?? 0),
        latitud,
        longitud,
        auto_detectar_junta: true,
        usuario: usuarioId
      };

      console.log('📤 Enviando datos a Django:', JSON.stringify(dataToSend, null, 2));

      // Crear publicación
      const response = await apiService.post<PublicacionResponse>('/publicaciones/', dataToSend, true);

      console.log('✅ Respuesta de Django (publicación):', {
        id: response?.id,
        codigo: (response as any)?.codigo
      });

      return response;
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error creando publicación base:', parsed);
      throw parsed;
    }
  }

  async crearPublicacion(formData: DenunciaFormData): Promise<PublicacionResponse> {
    try {
      console.log('🚀 Iniciando creación de publicación completa…');
      console.log('📊 Datos recibidos:', {
        titulo: formData.titulo,
        categoria: formData.categoria,
        departamento: formData.departamento,
        evidencias: formData.evidencias?.length ?? 0
      });

      // Validar auth + datos
      if (!(await this.isAuthenticated())) {
        throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
      }
      this.validateFormData(formData);

      // 1) Crear base
      console.log('📝 Paso 1: Creando publicación base…');
      const nuevaPublicacion = await this.createPublicacionBase(formData);

      // 2) Evidencias (opcional)
      if (formData.evidencias && formData.evidencias.length > 0) {
        console.log(`📎 Paso 2: Subiendo ${formData.evidencias.length} evidencias…`);
        try {
          const validation = evidenciasService.validateEvidencias(formData.evidencias);
          if (!validation.isValid) {
            console.warn('⚠️ Validación de evidencias falló:', validation.errors);
            return {
              ...nuevaPublicacion,
              evidenciasStatus: 'error',
              evidenciasError: 'Las evidencias no cumplen los requisitos.'
            };
          }

          const evidResp = await evidenciasService.subirEvidencias(
            Number(nuevaPublicacion.id),
            formData.evidencias
          );

          console.log('✅ Evidencias subidas:', evidResp?.length ?? 0);
          return {
            ...nuevaPublicacion,
            evidencias: evidResp,
            evidenciasStatus: 'success'
          };
        } catch (e) {
          const parsed = this.handleApiError(e);
          console.error('❌ Error subiendo evidencias:', parsed);
          return {
            ...nuevaPublicacion,
            evidenciasStatus: 'partial',
            evidenciasError: parsed.message
          };
        }
      } else {
        console.log('ℹ️ Sin evidencias para subir.');
        return { ...nuevaPublicacion, evidenciasStatus: 'none' };
      }
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error en creación de publicación:', parsed);
      throw parsed;
    }
  }

  // --------------------- Lecturas ---------------------
  async getPublicacionById(id: number | string): Promise<Publicacion> {
    try {
      console.log('🔎 Consultando publicación:', id);
      const publicacion = await apiService.get<Publicacion>(`/publicaciones/${id}/`, true);
      console.log('✅ Publicación obtenida:', (publicacion as any)?.codigo ?? id);
      return publicacion;
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error obteniendo publicación:', parsed);
      throw parsed;
    }
  }

  async listarPublicaciones(params?: Record<string, any>): Promise<Publicacion[]> {
    try {
      console.log('📃 Listando publicaciones…');
      const query = params
        ? '?' +
          Object.entries(params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
            .join('&')
        : '';
      const response = await apiService.get<any>(`/publicaciones/${query}`, true);
      const publicaciones = normalizeResults<Publicacion>(response);
      console.log(`✅ ${publicaciones.length} publicaciones recibidas`);
      return publicaciones;
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error listando publicaciones:', parsed);
      throw parsed;
    }
  }

  // --------------------- Conectividad ---------------------
  async verificarConexion(): Promise<boolean> {
    try {
      console.log('🔍 Verificando conexión con el servidor…');
      // Petición simple a un recurso público
      await apiService.get('/categorias/', true);
      console.log('✅ Conexión verificada exitosamente');
      return true;
    } catch (error: any) {
      const parsed = this.handleApiError(error);
      console.error('❌ Error de conexión:', parsed);
      return false;
    }
  }
}

// Instancia singleton
export const denunciasService = new DenunciasService();
export default DenunciasService;

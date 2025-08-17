// src/data/historialData.ts - CREADO DESDE CERO

import { HistorialDenuncia, EstadisticasHistorial, Evidencia } from '../types/historial';

// Mock de evidencias para respuestas municipales
const evidenciasMockRespuestas: Evidencia[] = [
  {
    id: 'ev-resp-1',
    tipo: 'imagen',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300',
    nombre: 'trabajo_reparacion_luminaria.jpg',
    fechaSubida: '2024-12-18T16:30:00Z',
    descripcion: 'Fotografía del trabajo de reparación realizado en la luminaria',
    size: 2048576, // 2MB
    mimeType: 'image/jpeg'
  },
  {
    id: 'ev-resp-2',
    tipo: 'documento',
    url: 'https://example.com/docs/orden_trabajo_123.pdf',
    nombre: 'orden_trabajo_123.pdf',
    fechaSubida: '2024-12-18T16:45:00Z',
    descripcion: 'Orden de trabajo completada para la reparación',
    size: 512000, // 512KB
    mimeType: 'application/pdf'
  },
  {
    id: 'ev-resp-3',
    tipo: 'imagen',
    url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300',
    nombre: 'antes_reparacion_bache.jpg',
    fechaSubida: '2024-12-17T14:00:00Z',
    descripcion: 'Estado del bache antes de la reparación',
    size: 1536000, // 1.5MB
    mimeType: 'image/jpeg'
  },
  {
    id: 'ev-resp-4',
    tipo: 'imagen',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300',
    nombre: 'despues_reparacion_bache.jpg',
    fechaSubida: '2024-12-18T17:30:00Z',
    descripcion: 'Estado del bache después de la reparación completada',
    size: 1792000, // 1.75MB
    mimeType: 'image/jpeg'
  },
  {
    id: 'ev-resp-5',
    tipo: 'video',
    url: 'https://example.com/videos/procedimiento_limpieza.mp4',
    nombre: 'procedimiento_limpieza_basura.mp4',
    fechaSubida: '2024-12-15T11:20:00Z',
    descripcion: 'Video del procedimiento de limpieza realizado',
    size: 15728640, // 15MB
    mimeType: 'video/mp4'
  },
  {
    id: 'ev-resp-6',
    tipo: 'documento',
    url: 'https://example.com/docs/informe_inspeccion.pdf',
    nombre: 'informe_inspeccion_ruido.pdf',
    fechaSubida: '2024-12-19T10:30:00Z',
    descripcion: 'Informe de inspección por ruidos molestos',
    size: 768000, // 768KB
    mimeType: 'application/pdf'
  }
];

// Datos mock de denuncias
export const denunciasPlaceholder: HistorialDenuncia[] = [
  {
    id: '1',
    numeroFolio: 'CAL-2024-001',
    titulo: 'Luminaria pública sin funcionamiento',
    descripcion: 'La luminaria ubicada en la esquina de Av. Brasil con Calle Ramírez no está funcionando desde hace una semana, generando problemas de seguridad durante las noches.',
    categoria: 'Alumbrado Público',
    estado: 'resuelto',
    prioridad: 'alta',
    fechaCreacion: '2024-12-08T18:30:00Z',
    fechaActualizacion: '2024-12-18T16:45:00Z',
    fechaResolucion: '2024-12-18T16:45:00Z',
    ubicacion: {
      direccion: 'Av. Brasil esquina Calle Ramírez, Calama',
      coordenadas: {
        latitud: -22.4522,
        longitud: -68.9268
      },
      sector: 'Centro',
      comuna: 'Calama'
    },
    evidenciasIniciales: [
      {
        id: 'ev-inicial-1',
        tipo: 'imagen',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
        nombre: 'luminaria_apagada.jpg',
        fechaSubida: '2024-12-08T18:30:00Z',
        descripcion: 'Luminaria sin funcionamiento durante la noche'
      }
    ],
    respuestas: [
      {
        id: 'resp1',
        contenido: 'Hemos recibido su reporte sobre la luminaria sin funcionamiento. Nuestro equipo técnico realizará una inspección dentro de las próximas 24 horas para evaluar la situación.',
        fechaRespuesta: '2024-12-09T08:15:00Z',
        autorRespuesta: 'María González',
        cargoAutor: 'Coordinadora de Alumbrado Público',
        evidencias: [],
        esRespuestaOficial: true,
        leida: true,
        departamento: 'Departamento de Obras Públicas'
      },
      {
        id: 'resp2',
        contenido: 'Se ha completado la reparación de la luminaria. El problema era un cable dañado que ha sido reemplazado. La luminaria ya está funcionando correctamente. Adjuntamos evidencia fotográfica del trabajo realizado y la orden de trabajo completada.',
        fechaRespuesta: '2024-12-18T16:45:00Z',
        autorRespuesta: 'Carlos Mendoza',
        cargoAutor: 'Técnico Electricista Municipal',
        evidencias: [
          evidenciasMockRespuestas[0], // Foto del trabajo
          evidenciasMockRespuestas[1]  // Orden de trabajo PDF
        ],
        esRespuestaOficial: true,
        leida: true,
        departamento: 'Departamento de Obras Públicas'
      }
    ],
    tiempoRespuesta: 1,
    satisfaccionCiudadano: 5,
    departamentoAsignado: 'Departamento de Obras Públicas',
    funcionarioAsignado: 'Carlos Mendoza',
    vistas: 34,
    likes: 8,
    compartido: true,
    notificacionesActivas: false
  },
  {
    id: '2',
    numeroFolio: 'CAL-2024-002',
    titulo: 'Bache peligroso en Calle Granaderos',
    descripcion: 'Existe un bache de gran tamaño en Calle Granaderos altura 1250 que representa un peligro para vehículos y peatones.',
    categoria: 'Infraestructura Vial',
    estado: 'resuelto',
    prioridad: 'alta',
    fechaCreacion: '2024-12-10T15:45:00Z',
    fechaActualizacion: '2024-12-18T17:30:00Z',
    fechaResolucion: '2024-12-18T17:30:00Z',
    ubicacion: {
      direccion: 'Calle Granaderos 1250, Calama',
      coordenadas: {
        latitud: -22.4558,
        longitud: -68.9195
      },
      sector: 'Sur',
      comuna: 'Calama'
    },
    evidenciasIniciales: [
      {
        id: 'ev-inicial-2',
        tipo: 'imagen',
        url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300',
        nombre: 'bache_calle_granaderos.jpg',
        fechaSubida: '2024-12-10T15:45:00Z',
        descripcion: 'Bache peligroso en Calle Granaderos'
      }
    ],
    respuestas: [
      {
        id: 'resp3',
        contenido: 'Recibimos su reporte del bache en Calle Granaderos. El área será inspeccionada dentro de las próximas 48 horas para evaluar la gravedad y programar la reparación correspondiente.',
        fechaRespuesta: '2024-12-11T08:30:00Z',
        autorRespuesta: 'Ana Silva',
        cargoAutor: 'Jefa de Mantención Vial',
        evidencias: [],
        esRespuestaOficial: true,
        leida: true,
        departamento: 'Departamento de Obras Públicas'
      },
      {
        id: 'resp4',
        contenido: 'Hemos completado la reparación del bache en Calle Granaderos. Se aplicó asfalto en caliente y se realizó el compactado correspondiente. Adjuntamos fotografías del antes y después de la reparación para su verificación.',
        fechaRespuesta: '2024-12-18T17:30:00Z',
        autorRespuesta: 'Roberto Sánchez',
        cargoAutor: 'Supervisor de Obras Viales',
        evidencias: [
          evidenciasMockRespuestas[2], // Antes de la reparación
          evidenciasMockRespuestas[3]  // Después de la reparación
        ],
        esRespuestaOficial: true,
        leida: true,
        departamento: 'Departamento de Obras Públicas'
      }
    ],
    tiempoRespuesta: 8,
    satisfaccionCiudadano: 5,
    departamentoAsignado: 'Departamento de Obras Públicas',
    funcionarioAsignado: 'Roberto Sánchez',
    vistas: 56,
    likes: 12,
    compartido: false,
    notificacionesActivas: false
  },
  {
    id: '3',
    numeroFolio: 'CAL-2024-003',
    titulo: 'Ruidos molestos en horario nocturno',
    descripcion: 'Vecinos reportan ruidos excesivos provenientes de local comercial durante la madrugada en Av. O\'Higgins.',
    categoria: 'Ruidos Molestos',
    estado: 'en_proceso',
    prioridad: 'media',
    fechaCreacion: '2024-12-22T23:15:00Z',
    fechaActualizacion: '2024-12-23T10:30:00Z',
    ubicacion: {
      direccion: 'Av. O\'Higgins 1856, Calama',
      coordenadas: {
        latitud: -22.4489,
        longitud: -68.9256
      },
      sector: 'Centro',
      comuna: 'Calama'
    },
    evidenciasIniciales: [],
    respuestas: [
      {
        id: 'resp5',
        contenido: 'Se ha recibido su denuncia por ruidos molestos en horario nocturno. Hemos programado una inspección para verificar el cumplimiento de las ordenanzas municipales sobre ruidos. Se adjunta el informe preliminar de inspección.',
        fechaRespuesta: '2024-12-23T10:30:00Z',
        autorRespuesta: 'Luis Torres',
        cargoAutor: 'Inspector Municipal',
        evidencias: [
          evidenciasMockRespuestas[5] // Informe de inspección PDF
        ],
        esRespuestaOficial: true,
        leida: false, // Nueva respuesta no leída
        departamento: 'Departamento de Inspección Municipal'
      }
    ],
    tiempoRespuesta: 0.5,
    departamentoAsignado: 'Departamento de Inspección Municipal',
    funcionarioAsignado: 'Luis Torres',
    vistas: 15,
    likes: 3,
    compartido: false,
    notificacionesActivas: true
  },
  {
    id: '4',
    numeroFolio: 'CAL-2024-004',
    titulo: 'Acumulación de basura en plaza pública',
    descripcion: 'Se observa acumulación excesiva de basura en Plaza San Martín que no ha sido recolectada en varios días.',
    categoria: 'Recolección de Basura',
    estado: 'rechazado',
    prioridad: 'media',
    fechaCreacion: '2024-12-15T09:20:00Z',
    fechaActualizacion: '2024-12-15T09:20:00Z',
    ubicacion: {
      direccion: 'Plaza San Martín, Calama',
      coordenadas: {
        latitud: -22.4536,
        longitud: -68.9312
      },
      sector: 'Centro',
      comuna: 'Calama'
    },
    evidenciasIniciales: [
      {
        id: 'ev-inicial-4',
        tipo: 'imagen',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
        nombre: 'basura_plaza_san_martin.jpg',
        fechaSubida: '2024-12-15T09:20:00Z',
        descripcion: 'Acumulación de basura en Plaza San Martín'
      }
    ],
    respuestas: [], // Sin respuestas
    departamentoAsignado: 'Departamento de Medio Ambiente',
    vistas: 28,
    likes: 6,
    compartido: false,
    notificacionesActivas: true
  }
];

export const calcularEstadisticasDinamicas = (): EstadisticasHistorial => {
  const denuncias = denunciasPlaceholder;

  // Agrupaciones personalizadas
  const resueltas = denuncias.filter(d => d.estado === 'resuelto').length;

  const pendientes = denuncias.filter(d =>
    ['pendiente', 'en_proceso'].includes(d.estado)
  ).length;

  const noResueltas = denuncias.filter(d =>
    ['pendiente', 'en_proceso', 'rechazado', 'cerrado'].includes(d.estado)
  ).length;

  // Mantener categorías individuales si aún las necesitas por separado
  const enProceso = denuncias.filter(d => d.estado === 'en_proceso').length;
  const rechazadas = denuncias.filter(d => d.estado === 'rechazado').length;
  const cerradas = denuncias.filter(d => d.estado === 'cerrado').length;

  // Calcular tiempo promedio de respuesta
  const denunciasConRespuesta = denuncias.filter(d => d.tiempoRespuesta !== undefined);
  const tiempoPromedioRespuesta = denunciasConRespuesta.length > 0
    ? denunciasConRespuesta.reduce((sum, d) => sum + (d.tiempoRespuesta || 0), 0) / denunciasConRespuesta.length
    : 0;

  // Calcular satisfacción promedio
  const denunciasConSatisfaccion = denuncias.filter(d => d.satisfaccionCiudadano !== undefined);
  const satisfaccionPromedio = denunciasConSatisfaccion.length > 0
    ? denunciasConSatisfaccion.reduce((sum, d) => sum + (d.satisfaccionCiudadano || 0), 0) / denunciasConSatisfaccion.length
    : 0;

  // Calcular porcentaje de resolución
  const porcentajeResolucion = denuncias.length > 0
    ? (resueltas / denuncias.length) * 100
    : 0;

  // Contar denuncias por categoría
  const denunciasPorCategoria: Record<string, number> = {};
  denuncias.forEach(d => {
    if (d.categoria) {
      denunciasPorCategoria[d.categoria] = (denunciasPorCategoria[d.categoria] || 0) + 1;
    }
  });

  // Contar denuncias por mes
  const denunciasPorMes: Record<string, number> = {};
  denuncias.forEach(d => {
    const mes = new Date(d.fechaCreacion).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
    denunciasPorMes[mes] = (denunciasPorMes[mes] || 0) + 1;
  });

  return {
    totalDenuncias: denuncias.length,
    resueltas,
    pendientes,
    enProceso,
    rechazadas,
    cerradas,
    noResueltas,
    tiempoPromedioRespuesta,
    satisfaccionPromedio,
    porcentajeResolucion,
    denunciasPorCategoria,
    denunciasPorMes,
    tendencia: 'mejorando'
  };
};

// Estadísticas calculadas dinámicamente
export const estadisticasPlaceholder: EstadisticasHistorial = calcularEstadisticasDinamicas();

// Función para obtener denuncias filtradas
export const obtenerDenunciasFiltradas = (
  filtros: {
    estado?: string;
    categoria?: string;
    busqueda?: string;
  } = {}
): HistorialDenuncia[] => {
  let denunciasFiltradas = [...denunciasPlaceholder];

  if (filtros.estado) {
    denunciasFiltradas = denunciasFiltradas.filter(d => d.estado === filtros.estado);
  }

  if (filtros.categoria) {
    denunciasFiltradas = denunciasFiltradas.filter(d => d.categoria === filtros.categoria);
  }

  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase();
    denunciasFiltradas = denunciasFiltradas.filter(d =>
      d.titulo.toLowerCase().includes(busqueda) ||
      d.descripcion.toLowerCase().includes(busqueda) ||
      d.numeroFolio.toLowerCase().includes(busqueda)
    );
  }

  return denunciasFiltradas;
};

// Función para obtener denuncia por ID
export const obtenerDenunciaPorId = (id: string): HistorialDenuncia | undefined => {
  return denunciasPlaceholder.find(d => d.id === id);
};

// Función para marcar respuestas como leídas
export const marcarRespuestasLeidas = (denunciaId: string): void => {
  const denuncia = denunciasPlaceholder.find(d => d.id === denunciaId);
  if (denuncia) {
    denuncia.respuestas.forEach(respuesta => {
      respuesta.leida = true;
    });
  }
};

// Función para obtener respuestas no leídas
export const obtenerRespuestasNoLeidas = (): number => {
  return denunciasPlaceholder.reduce((total, denuncia) => {
    return total + denuncia.respuestas.filter(r => !r.leida).length;
  }, 0);
};
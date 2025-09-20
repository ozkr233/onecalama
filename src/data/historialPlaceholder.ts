// src/data/historialPlaceholder.ts
import { HistorialDenuncia, EstadisticasHistorial } from '../types/historial';

export const estadisticasPlaceholder: EstadisticasHistorial = {
  totalDenuncias: 12,
  resueltas: 7,
  pendientes: 3,
  enProceso: 2,
  tiempoPromedioRespuesta: 5.2,
  satisfaccionPromedio: 4.1
};

export const denunciasPlaceholder: HistorialDenuncia[] = [
  {
    id: '1',
    numeroFolio: 'CAL-2024-001',
    titulo: 'Luminaria dañada en Av. Brasil',
    descripcion: 'La luminaria ubicada en Av. Brasil esquina con Calle Ramírez está intermitente desde hace una semana, causando problemas de visibilidad nocturna.',
    categoria: 'Alumbrado Público',
    estado: 'en_proceso',
    prioridad: 'media',
    fechaCreacion: '2024-12-15T10:30:00Z',
    fechaActualizacion: '2024-12-20T14:00:00Z',
    ubicacion: {
      direccion: 'Av. Brasil esquina con Calle Ramírez, Calama',
      coordenadas: {
        latitud: -22.4569,
        longitud: -68.9270
      }
    },
    evidenciasIniciales: [
      {
        id: 'ev1',
        tipo: 'imagen',
        url: 'https://via.placeholder.com/400x300/E67E22/FFFFFF?text=Luminaria+Dañada',
        nombre: 'luminaria_dañada.jpg',
        fechaSubida: '2024-12-15T10:30:00Z',
        descripcion: 'Foto de la luminaria intermitente'
      }
    ],
    respuestas: [
      {
        id: 'resp1',
        contenido: 'Hemos recibido su reporte y ya se asignó a nuestro equipo técnico. Estimamos tener una solución en 3-5 días hábiles.',
        fechaRespuesta: '2024-12-16T09:00:00Z',
        autorRespuesta: 'María González',
        cargoAutor: 'Coordinadora de Alumbrado Público',
        evidencias: [],
        esRespuestaOficial: true,
        leida: true
      },
      {
        id: 'resp2',
        contenido: 'El equipo técnico visitó el lugar y confirmó el problema. Ya se solicitó el reemplazo de la luminaria. Se realizará la instalación mañana entre 08:00 y 12:00 hrs.',
        fechaRespuesta: '2024-12-20T14:00:00Z',
        autorRespuesta: 'Carlos Pérez',
        cargoAutor: 'Técnico en Electricidad',
        evidencias: [
          {
            id: 'ev2',
            tipo: 'imagen',
            url: 'https://via.placeholder.com/400x300/009688/FFFFFF?text=Evaluación+Técnica',
            nombre: 'evaluacion_tecnica.jpg',
            fechaSubida: '2024-12-20T14:00:00Z',
            descripcion: 'Evaluación técnica del problema'
          }
        ],
        esRespuestaOficial: true,
        leida: false // Nueva respuesta no leída
      }
    ],
    tiempoRespuesta: 1,
    departamentoAsignado: 'Departamento de Servicios Públicos',
    funcionarioAsignado: 'Carlos Pérez'
  },
  {
    id: '2',
    numeroFolio: 'CAL-2024-002',
    titulo: 'Bache en Calle Granaderos',
    descripcion: 'Existe un bache de gran tamaño en Calle Granaderos que puede causar daños a los vehículos.',
    categoria: 'Infraestructura Vial',
    estado: 'resuelto',
    prioridad: 'alta',
    fechaCreacion: '2024-12-10T15:45:00Z',
    fechaActualizacion: '2024-12-18T16:30:00Z',
    ubicacion: {
      direccion: 'Calle Granaderos 1250, Calama',
      coordenadas: {
        latitud: -22.4589,
        longitud: -68.9290
      }
    },
    evidenciasIniciales: [
      {
        id: 'ev3',
        tipo: 'imagen',
        url: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Bache+Calle',
        nombre: 'bache_granaderos.jpg',
        fechaSubida: '2024-12-10T15:45:00Z',
        descripcion: 'Bache en Calle Granaderos'
      }
    ],
    respuestas: [
      {
        id: 'resp3',
        contenido: 'Recibimos su reporte. El área será inspeccionada dentro de las próximas 48 horas.',
        fechaRespuesta: '2024-12-11T08:30:00Z',
        autorRespuesta: 'Ana Silva',
        cargoAutor: 'Jefa de Mantención Vial',
        evidencias: [],
        esRespuestaOficial: true,
        leida: true
      },
      {
        id: 'resp4',
        contenido: 'Se realizó la reparación del bache utilizando mezcla asfáltica. El trabajo quedó terminado y la vía está habilitada para el tránsito normal.',
        fechaRespuesta: '2024-12-18T16:30:00Z',
        autorRespuesta: 'Roberto Miranda',
        cargoAutor: 'Supervisor de Obras',
        evidencias: [
          {
            id: 'ev4',
            tipo: 'imagen',
            url: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Reparación+Completa',
            nombre: 'reparacion_completada.jpg',
            fechaSubida: '2024-12-18T16:30:00Z',
            descripcion: 'Bache reparado exitosamente'
          }
        ],
        esRespuestaOficial: true,
        leida: true
      }
    ],
    tiempoRespuesta: 8,
    satisfaccionCiudadano: 5,
    departamentoAsignado: 'Departamento de Obras Públicas',
    funcionarioAsignado: 'Roberto Miranda'
  },
  {
    id: '3',
    numeroFolio: 'CAL-2024-003',
    titulo: 'Ruidos molestos en horario nocturno',
    descripcion: 'Vecinos reportan ruidos excesivos provenientes de local comercial durante la madrugada.',
    categoria: 'Ruidos Molestos',
    estado: 'pendiente',
    prioridad: 'media',
    fechaCreacion: '2024-12-22T23:15:00Z',
    fechaActualizacion: '2024-12-22T23:15:00Z',
    ubicacion: {
      direccion: 'Av. O\'Higgins 1856, Calama'
    },
    evidenciasIniciales: [],
    respuestas: [],
    departamentoAsignado: 'Departamento de Fiscalización'
  },
  {
    id: '4',
    numeroFolio: 'CAL-2024-004',
    titulo: 'Basura acumulada en terreno baldío',
    descripcion: 'Acumulación de basura y escombros en terreno baldío que atrae vectores sanitarios.',
    categoria: 'Aseo y Ornato',
    estado: 'en_proceso',
    prioridad: 'urgente',
    fechaCreacion: '2024-12-20T11:20:00Z',
    fechaActualizacion: '2024-12-21T09:45:00Z',
    ubicacion: {
      direccion: 'Sitio eriazo, Pasaje Los Aromos 245, Calama'
    },
    evidenciasIniciales: [
      {
        id: 'ev5',
        tipo: 'imagen',
        url: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Basura+Acumulada',
        nombre: 'basura_terreno.jpg',
        fechaSubida: '2024-12-20T11:20:00Z',
        descripcion: 'Basura acumulada en terreno baldío'
      }
    ],
    respuestas: [
      {
        id: 'resp5',
        contenido: 'Se programó limpieza para mañana en la mañana. También se contactará al propietario del terreno para notificar la obligación de mantener limpio el sitio.',
        fechaRespuesta: '2024-12-21T09:45:00Z',
        autorRespuesta: 'Patricia Rojas',
        cargoAutor: 'Coordinadora de Aseo',
        evidencias: [],
        esRespuestaOficial: true,
        leida: false
      }
    ],
    tiempoRespuesta: 1,
    departamentoAsignado: 'Departamento de Aseo y Ornato',
    funcionarioAsignado: 'Patricia Rojas'
  },
  {
    id: '5',
    numeroFolio: 'CAL-2024-005',
    titulo: 'Semáforo fuera de servicio',
    descripción: 'El semáforo del cruce de Av. Balmaceda con Calle Sotomayor no está funcionando.',
    categoria: 'Tránsito',
    estado: 'rechazado',
    prioridad: 'alta',
    fechaCreacion: '2024-12-18T14:30:00Z',
    fechaActualizacion: '2024-12-19T10:15:00Z',
    ubicacion: {
      direccion: 'Av. Balmaceda con Calle Sotomayor, Calama'
    },
    evidenciasIniciales: [],
    respuestas: [
      {
        id: 'resp6',
        contenido: 'Estimado/a ciudadano/a, agradecemos su reporte. Sin embargo, este semáforo es de competencia regional, no municipal. Le sugerimos contactar directamente al SERVIU de la región para este tipo de reparaciones.',
        fechaRespuesta: '2024-12-19T10:15:00Z',
        autorRespuesta: 'Luis Martínez',
        cargoAutor: 'Director de Tránsito',
        evidencias: [],
        esRespuestaOficial: true,
        leida: true
      }
    ],
    tiempoRespuesta: 1,
    departamentoAsignado: 'Departamento de Tránsito',
    funcionarioAsignado: 'Luis Martínez'
  }
];
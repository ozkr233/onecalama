// src/data/anunciosMock.ts
import { AnuncioMunicipal } from '../types/denuncias';

export const anunciosMockData: AnuncioMunicipal[] = [
  {
    id: 1,
    titulo: 'Corte de Agua Programado - Sector Norte',
    subtitulo: 'Mantención de Redes',
    descripcion: 'Se informa a la comunidad que el día miércoles 3 de julio de 2025, entre las 08:00 y 18:00 horas, se realizará mantención programada en las redes de agua potable del sector norte de la ciudad. Esta mantención incluye la reparación de cañerías principales en las calles Granaderos, Balmaceda y O\'Higgins entre Sotomayor y Ramírez. Durante este período, los vecinos de dicho sector no contarán con suministro de agua potable. Se recomienda almacenar agua con anticipación para cubrir las necesidades básicas del hogar.',
    estado: 'Programado',
    fecha: '2025-07-01T14:30:00Z',
    usuario: {
      id: 1,
      rut: '12345678-9',
      nombre: 'Municipalidad de Calama',
      email: 'comunicaciones@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 5,
      nombre: 'Servicios Básicos',
      descripcion: 'Agua potable, alcantarillado y servicios municipales',
      departamento: { id: 3, nombre: 'Servicios Municipales', descripcion: 'Servicios básicos municipales' }
    },
    imagenes: [
      {
        id: 1,
        anuncio: 1,
        imagen: 'agua-corte', // Referencia al sistema de mapeo
        fecha: '2025-07-01T14:30:00Z',
        extension: 'jpg'
      }
    ]
  },
  {
    id: 2,
    titulo: 'Jornada de Vacunación Masiva',
    subtitulo: 'Campaña Gratuita',
    descripcion: 'La Ilustre Municipalidad de Calama, en conjunto con el Servicio de Salud de Antofagasta, invita a toda la comunidad a participar de la jornada de vacunación masiva que se realizará este sábado 5 de julio en el Gimnasio Municipal (Av. Brasil 2851). El horario de atención será de 09:00 a 17:00 horas. Se aplicarán vacunas contra la influenza, COVID-19 y otras según disponibilidad. Es necesario presentar carnet de identidad y carnet de vacunas si lo posee.',
    estado: 'Activo',
    fecha: '2025-06-30T10:15:00Z',
    usuario: {
      id: 1,
      rut: '12345678-9',
      nombre: 'Municipalidad de Calama',
      email: 'salud@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 4,
      nombre: 'Salud',
      descripcion: 'Servicios de salud municipal y campañas sanitarias',
      departamento: { id: 3, nombre: 'Servicios Municipales', descripcion: 'Servicios básicos municipales' }
    },
    imagenes: [
      {
        id: 2,
        anuncio: 2,
        imagen: 'vacunacion', // Referencia al sistema de mapeo
        fecha: '2025-06-30T10:15:00Z',
        extension: 'jpg'
      }
    ]
  },
  {
    id: 3,
    titulo: 'Cierre Temporal Calle Sotomayor',
    subtitulo: 'Construcción de Ciclovía',
    descripcion: 'Se comunica que a partir del lunes 7 de julio y hasta el viernes 25 de julio de 2025, la calle Sotomayor entre Abaroa y Antofagasta permanecerá cerrada al tráfico vehicular debido a la construcción de la nueva ciclovía que conectará el centro de la ciudad con el sector residencial norte. Durante este período, el tránsito será desviado por las calles paralelas Ramírez y Granaderos. Se solicita a los conductores planificar rutas alternativas y respetar la señalización temporal.',
    estado: 'Activo',
    fecha: '2025-06-29T16:45:00Z',
    usuario: {
      id: 2,
      rut: '98765432-1',
      nombre: 'Dirección de Obras Municipales',
      email: 'obras@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 1,
      nombre: 'Obras Públicas',
      descripcion: 'Infraestructura vial y construcciones municipales',
      departamento: { id: 1, nombre: 'Obras Públicas', descripcion: 'Infraestructura y vialidad municipal' }
    },
    imagenes: [
      {
        id: 3,
        anuncio: 3,
        imagen: 'obras-viales', // Referencia al sistema de mapeo
        fecha: '2025-06-29T16:45:00Z',
        extension: 'jpg'
      }
    ]
  },
  {
    id: 4,
    titulo: 'Nueva Ruta de Recolección de Basura',
    subtitulo: 'Sector Villa Chica',
    descripcion: 'A partir del lunes 7 de julio, el sector Villa Chica contará con un nuevo horario y ruta de recolección de residuos domiciliarios. Los camiones recolectores pasarán los días lunes, miércoles y viernes entre las 07:00 y 12:00 horas por las calles principales del sector. Se solicita a los vecinos sacar sus residuos la noche anterior o muy temprano en la mañana, utilizando bolsas resistentes y contenedores adecuados.',
    estado: 'Activo',
    fecha: '2025-06-28T11:20:00Z',
    usuario: {
      id: 3,
      rut: '11223344-5',
      nombre: 'Departamento de Aseo',
      email: 'aseo@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 2,
      nombre: 'Aseo y Ornato',
      descripcion: 'Recolección de residuos y mantenimiento de espacios públicos',
      departamento: { id: 2, nombre: 'Medio Ambiente', descripcion: 'Limpieza y ornato municipal' }
    }
  },
  {
    id: 5,
    titulo: 'Operativo de Fumigación Contra Vectores',
    subtitulo: 'Prevención Sanitaria',
    descripcion: 'El Departamento de Salud Municipal realizará fumigación contra vectores (mosquitos, moscas y otros insectos) en toda la ciudad durante la semana del 8 al 12 de julio. El operativo se llevará a cabo en horario nocturno (22:00 a 05:00 horas) para minimizar las molestias a la población. Se recomienda mantener cerradas puertas y ventanas durante el paso del equipo fumigador, proteger alimentos y agua, y retirar ropa tendida al exterior.',
    estado: 'Programado',
    fecha: '2025-06-27T13:45:00Z',
    usuario: {
      id: 1,
      rut: '12345678-9',
      nombre: 'Municipalidad de Calama',
      email: 'salud@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 4,
      nombre: 'Salud',
      descripcion: 'Servicios de salud municipal y campañas sanitarias',
      departamento: { id: 3, nombre: 'Servicios Municipales', descripcion: 'Servicios básicos municipales' }
    },
    imagenes: [
      {
        id: 4,
        anuncio: 5,
        imagen: 'fumigacion', // Referencia al sistema de mapeo
        fecha: '2025-06-27T13:45:00Z',
        extension: 'jpg'
      }
    ]
  },
  {
    id: 6,
    titulo: 'Nuevo Horario de Atención Municipal',
    subtitulo: 'Oficinas Centrales',
    descripcion: 'A partir del lunes 7 de julio, las oficinas municipales ubicadas en Av. Balmaceda 2355 tendrán un nuevo horario de atención al público. El horario será de lunes a viernes de 08:00 a 17:00 horas, con horario corrido. Esta medida busca mejorar la atención ciudadana y facilitar el acceso a los servicios municipales. Para trámites específicos, se recomienda agendar cita previa a través del sitio web municipal o llamando al teléfono 552-345678.',
    estado: 'Activo',
    fecha: '2025-06-26T09:30:00Z',
    usuario: {
      id: 1,
      rut: '12345678-9',
      nombre: 'Municipalidad de Calama',
      email: 'atencion.ciudadana@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 6,
      nombre: 'Información Municipal',
      descripcion: 'Comunicados oficiales y información institucional',
      departamento: { id: 3, nombre: 'Servicios Municipales', descripcion: 'Servicios básicos municipales' }
    }
  },
  {
    id: 7,
    titulo: 'Feria Costumbrista de Invierno',
    subtitulo: 'Plaza de Armas',
    descripcion: 'Del viernes 11 al domingo 13 de julio se realizará la tradicional Feria Costumbrista de Invierno en la Plaza de Armas de Calama. El evento contará con emprendedores locales ofreciendo comida típica, artesanías, productos regionales y espectáculos folclóricos. Los horarios serán: viernes de 18:00 a 24:00 horas, sábado de 12:00 a 24:00 horas y domingo de 12:00 a 22:00 horas. Entrada liberada para toda la familia. Se habililitarán estacionamientos especiales en calles aledañas.',
    estado: 'Programado',
    fecha: '2025-06-25T15:20:00Z',
    usuario: {
      id: 4,
      rut: '55667788-9',
      nombre: 'Dirección de Turismo',
      email: 'turismo@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 7,
      nombre: 'Cultura y Turismo',
      descripcion: 'Eventos culturales, turísticos y recreativos',
      departamento: { id: 4, nombre: 'Desarrollo Social', descripcion: 'Programas sociales y culturales' }
    },
    imagenes: [
      {
        id: 5,
        anuncio: 7,
        imagen: 'cultura-eventos', // Referencia al sistema de mapeo
        fecha: '2025-06-25T15:20:00Z',
        extension: 'jpg'
      }
    ]
  },
  {
    id: 8,
    titulo: 'Mantención Semáforos Centro de la Ciudad',
    subtitulo: 'Mejora de Infraestructura',
    descripcion: 'Durante la primera semana de agosto se realizará mantención preventiva y actualización tecnológica de todos los semáforos del centro de Calama. Los trabajos incluyen cambio de luminarias LED, programación de nuevos tiempos y sincronización inteligente. Algunos cruces podrán operar con personal de tránsito mientras se realizan las intervenciones. Se solicita precaución adicional al transitar por el centro durante estos días.',
    estado: 'Finalizado',
    fecha: '2025-06-24T12:10:00Z',
    usuario: {
      id: 2,
      rut: '98765432-1',
      nombre: 'Dirección de Obras Municipales',
      email: 'obras@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 8,
      nombre: 'Tránsito',
      descripcion: 'Señalización vial y control de tráfico',
      departamento: { id: 1, nombre: 'Obras Públicas', descripcion: 'Infraestructura y vialidad municipal' }
    }
  },
  {
    id: 9,
    titulo: 'Programa de Esterilización Canina Gratuita',
    subtitulo: 'Control de Población Animal',
    descripcion: 'El municipio anuncia el inicio del programa de esterilización canina gratuita para familias de escasos recursos. Las cirugías se realizarán en el Centro de Atención Veterinaria Municipal ubicado en calle Los Alerces 456. Para postular, los interesados deben presentar ficha social vigente, carnet de identidad y certificado de vacunas del animal. Las inscripciones están abiertas desde el 1 de agosto y los cupos son limitados. Informaciones adicionales al teléfono 552-987654.',
    estado: 'Activo',
    fecha: '2025-06-23T08:45:00Z',
    usuario: {
      id: 5,
      rut: '44556677-8',
      nombre: 'Departamento de Zoonosis',
      email: 'zoonosis@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 9,
      nombre: 'Bienestar Animal',
      descripcion: 'Programas de cuidado y control animal',
      departamento: { id: 2, nombre: 'Medio Ambiente', descripcion: 'Limpieza y ornato municipal' }
    },
    imagenes: [
      {
        id: 6,
        anuncio: 9,
        imagen: 'bienestar-animal', // Referencia al sistema de mapeo
        fecha: '2025-06-23T08:45:00Z',
        extension: 'jpg'
      }
    ]
  },
  {
    id: 10,
    titulo: 'Llamado a Concurso Público',
    subtitulo: 'Profesionales Municipales',
    descripcion: 'La Ilustre Municipalidad de Calama llama a concurso público para proveer los siguientes cargos: 2 Ingenieros Civiles para el Departamento de Obras, 1 Trabajador Social para el Departamento de Desarrollo Social, 1 Contador Auditor para Finanzas y 3 Técnicos en Enfermería para el Departamento de Salud. Las bases del concurso están disponibles en la página web municipal y en oficinas de Recursos Humanos. Plazo de postulación hasta el 30 de julio. Más información en www.calama.cl o al teléfono 552-345678 anexo 150.',
    estado: 'Activo',
    fecha: '2025-06-22T14:00:00Z',
    usuario: {
      id: 6,
      rut: '33445566-7',
      nombre: 'Recursos Humanos Municipal',
      email: 'rrhh@calama.cl',
      es_administrador: true,
      fecha_registro: '2025-01-01T00:00:00Z',
      esta_activo: true
    },
    categoria: {
      id: 10,
      nombre: 'Convocatorias',
      descripcion: 'Concursos públicos y llamados laborales',
      departamento: { id: 5, nombre: 'Administración', descripcion: 'Gestión administrativa municipal' }
    }
  }
];
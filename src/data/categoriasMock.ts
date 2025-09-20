// src/data/categoriasMock.ts
import { Categoria, DepartamentoMunicipal } from '../types/denuncias';

// Departamentos municipales
export const departamentosMock: DepartamentoMunicipal[] = [
  { id: 1, nombre: 'Obras Públicas', descripcion: 'Infraestructura y vialidad municipal' },
  { id: 2, nombre: 'Medio Ambiente', descripcion: 'Limpieza y ornato municipal' },
  { id: 3, nombre: 'Servicios Municipales', descripcion: 'Servicios básicos municipales' },
  { id: 4, nombre: 'Desarrollo Social', descripcion: 'Programas sociales y culturales' },
  { id: 5, nombre: 'Administración', descripcion: 'Gestión administrativa municipal' }
];

// Categorías ampliadas para coincidir con los anuncios
export const categoriasMock: Categoria[] = [
  {
    id: 1,
    nombre: 'Obras Públicas',
    descripcion: 'Infraestructura vial y construcciones municipales',
    departamento: departamentosMock[0]
  },
  {
    id: 2,
    nombre: 'Aseo y Ornato',
    descripcion: 'Recolección de residuos y mantenimiento de espacios públicos',
    departamento: departamentosMock[1]
  },
  {
    id: 3,
    nombre: 'Áreas Verdes',
    descripcion: 'Mantenimiento de parques y jardines municipales',
    departamento: departamentosMock[1]
  },
  {
    id: 4,
    nombre: 'Salud',
    descripcion: 'Servicios de salud municipal y campañas sanitarias',
    departamento: departamentosMock[2]
  },
  {
    id: 5,
    nombre: 'Servicios Básicos',
    descripcion: 'Agua potable, alcantarillado y servicios municipales',
    departamento: departamentosMock[2]
  },
  {
    id: 6,
    nombre: 'Información Municipal',
    descripcion: 'Comunicados oficiales y información institucional',
    departamento: departamentosMock[2]
  },
  {
    id: 7,
    nombre: 'Cultura y Turismo',
    descripcion: 'Eventos culturales, turísticos y recreativos',
    departamento: departamentosMock[3]
  },
  {
    id: 8,
    nombre: 'Tránsito',
    descripcion: 'Señalización vial y control de tráfico',
    departamento: departamentosMock[0]
  },
  {
    id: 9,
    nombre: 'Bienestar Animal',
    descripcion: 'Programas de cuidado y control animal',
    departamento: departamentosMock[1]
  },
  {
    id: 10,
    nombre: 'Convocatorias',
    descripcion: 'Concursos públicos y llamados laborales',
    departamento: departamentosMock[4]
  },
  {
    id: 11,
    nombre: 'Seguridad',
    descripcion: 'Temas de seguridad ciudadana',
    departamento: departamentosMock[0]
  },
  {
    id: 12,
    nombre: 'Educación',
    descripcion: 'Servicios educacionales municipales',
    departamento: departamentosMock[3]
  }
];
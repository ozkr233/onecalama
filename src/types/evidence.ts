/*// src/types/evidence.ts
export interface Evidence {
  id: string;
  uri: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize?: number;
  uploadedAt?: string;
}

// Actualización en src/types/denuncias.ts o donde tengas DenunciaFormData
export interface DenunciaFormData {
  titulo: string;
  descripcion: string;
  categoria: string;
  departamento: string;
  direccion: string;
  ubicacion?: LocationData;
  evidencias: Evidence[]; // Nueva propiedad para evidencias locales
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
} */
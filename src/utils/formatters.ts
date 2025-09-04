// src/utils/formatters.ts - ACTUALIZADO CON 'sin_priorizar'

import { EstadoDenuncia, PrioridadDenuncia } from '../types/historial';

// Formatear fecha para mostrar al usuario
export const formatearFecha = (fecha: string): string => {
  try {
    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Si es hoy
    if (diffDays === 0) {
      if (diffHours === 0) {
        if (diffMinutes === 0) {
          return 'Hace un momento';
        }
        return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
      }
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    }

    // Si es ayer
    if (diffDays === 1) {
      return 'Ayer';
    }

    // Si es esta semana (últimos 7 días)
    if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    }

    // Formato completo
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.warn('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

// Formatear fecha completa con hora
export const formatearFechaCompleta = (fecha: string): string => {
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formateando fecha completa:', error);
    return 'Fecha no disponible';
  }
};

// ✅ ACTUALIZADO: Obtener colores del estado con mejor estructura
export const getEstadoColor = (estado: EstadoDenuncia) => {
  const coloresEstado = {
    pendiente: {
      main: '#F59E0B',
      border: '#D97706',
      shadow: 'rgba(245, 158, 11, 0.4)',
      background: '#FEF3C7'
    },
    en_proceso: {
      main: '#3B82F6',
      border: '#2563EB',
      shadow: 'rgba(59, 130, 246, 0.4)',
      background: '#DBEAFE'
    },
    resuelto: {
      main: '#10B981',
      border: '#059669',
      shadow: 'rgba(16, 185, 129, 0.4)',
      background: '#D1FAE5'
    },
    rechazado: {
      main: '#EF4444',
      border: '#DC2626',
      shadow: 'rgba(239, 68, 68, 0.4)',
      background: '#FEE2E2'
    },
    cerrado: {
      main: '#6B7280',
      border: '#4B5563',
      shadow: 'rgba(107, 114, 128, 0.4)',
      background: '#F3F4F6'
    }
  };

  return coloresEstado[estado] || coloresEstado.pendiente;
};

// Obtener texto legible del estado
export const getEstadoTexto = (estado: EstadoDenuncia): string => {
  const textos = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    resuelto: 'Resuelto',
    rechazado: 'Rechazado',
    cerrado: 'Cerrado'
  };

  return textos[estado] || 'Desconocido';
};

// Obtener icono del estado
export const getEstadoIcono = (estado: EstadoDenuncia): string => {
  const iconos = {
    pendiente: 'time-outline',
    en_proceso: 'refresh-outline',
    resuelto: 'checkmark-circle-outline',
    rechazado: 'close-circle-outline',
    cerrado: 'lock-closed-outline'
  };

  return iconos[estado] || 'help-outline';
};

// ✅ NUEVO: Obtener colores de prioridad (incluye 'sin_priorizar')
export const getPrioridadColor = (prioridad: PrioridadDenuncia) => {
  const coloresPrioridad = {
    alta: {
      main: '#EF4444',
      border: '#DC2626',
      background: '#FEE2E2',
      text: '#991B1B'
    },
    media: {
      main: '#F59E0B',
      border: '#D97706',
      background: '#FEF3C7',
      text: '#92400E'
    },
    baja: {
      main: '#10B981',
      border: '#059669',
      background: '#D1FAE5',
      text: '#065F46'
    },
    sin_priorizar: {
      main: '#6B7280',
      border: '#4B5563',
      background: '#F3F4F6',
      text: '#374151'
    }
  };

  return coloresPrioridad[prioridad] || coloresPrioridad.sin_priorizar;
};

// ✅ NUEVO: Obtener texto de prioridad (incluye 'sin_priorizar')
export const getPrioridadTexto = (prioridad: PrioridadDenuncia): string => {
  const textos = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
    sin_priorizar: 'Sin priorizar'
  };

  return textos[prioridad] || 'Sin priorizar';
};

// ✅ NUEVO: Obtener icono de prioridad (incluye 'sin_priorizar')
export const getPrioridadIcono = (prioridad: PrioridadDenuncia): string => {
  const iconos = {
    alta: 'chevron-up-circle',
    media: 'remove-circle-outline',
    baja: 'chevron-down-circle',
    sin_priorizar: 'ellipse-outline'
  };

  return iconos[prioridad] || 'ellipse-outline';
};

// Formatear tamaño de archivo
export const formatearTamanoArchivo = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Formatear número de folio
export const formatearFolio = (folio: string): string => {
  // Si ya tiene formato, devolverlo tal como está
  if (folio.includes('-')) return folio;

  // Si es solo número, agregar prefijo
  if (/^\d+$/.test(folio)) {
    const year = new Date().getFullYear();
    return `CAL-${year}-${folio.padStart(3, '0')}`;
  }

  return folio;
};

// Formatear tiempo de respuesta
export const formatearTiempoRespuesta = (dias: number): string => {
  if (dias < 1) {
    const horas = Math.round(dias * 24);
    return `${horas} hora${horas !== 1 ? 's' : ''}`;
  }

  if (dias === 1) {
    return '1 día';
  }

  return `${Math.round(dias)} días`;
};

// Formatear dirección
export const formatearDireccion = (direccion: string): string => {
  // Capitalizar primera letra de cada palabra
  return direccion
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Formatear nombre de funcionario
export const formatearNombreFuncionario = (nombre: string, cargo?: string): string => {
  const nombreFormateado = nombre
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  if (cargo) {
    return `${nombreFormateado} - ${cargo}`;
  }

  return nombreFormateado;
};

// Formatear puntuación de satisfacción
export const formatearSatisfaccion = (puntuacion: number): string => {
  const estrellas = '★'.repeat(Math.floor(puntuacion)) + '☆'.repeat(5 - Math.floor(puntuacion));
  return `${estrellas} (${puntuacion.toFixed(1)}/5)`;
};

// Truncar texto
export const truncarTexto = (texto: string, limite: number = 100): string => {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite).trim() + '...';
};

// Formatear porcentaje
export const formatearPorcentaje = (valor: number, total: number): string => {
  if (total === 0) return '0%';
  const porcentaje = Math.round((valor / total) * 100);
  return `${porcentaje}%`;
};

// Validar RUT chileno
export const validarRUT = (rut: string): boolean => {
  // Eliminar puntos y guión
  const rutLimpio = rut.replace(/[.-]/g, '');

  // Verificar que tenga el formato correcto
  if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;

  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toLowerCase();

  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;

  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'k' : (11 - resto).toString();

  return dv === dvCalculado;
};

// Formatear RUT
export const formatearRUT = (rut: string): string => {
  // Eliminar caracteres no válidos
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');

  if (rutLimpio.length <= 1) return rutLimpio;

  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Agregar puntos cada 3 dígitos
  const numeroFormateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${numeroFormateado}-${dv}`;
};

// Obtener saludo según hora del día
export const obtenerSaludo = (): string => {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) {
    return 'Buenos días';
  } else if (hora >= 12 && hora < 18) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
};

// Formatear distancia
export const formatearDistancia = (metros: number): string => {
  if (metros < 1000) {
    return `${Math.round(metros)} m`;
  } else {
    return `${(metros / 1000).toFixed(1)} km`;
  }
};
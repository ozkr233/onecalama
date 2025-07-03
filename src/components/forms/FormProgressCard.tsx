// src/data/historialData.ts - ACTUALIZADO CON ESTADÍSTICAS COMPLETAS

import { HistorialDenuncia, EstadisticasHistorial, Evidencia } from '../types/historial';

// Estadísticas realistas basadas en las denuncias mock
export const estadisticasPlaceholder: EstadisticasHistorial = {
  totalDenuncias: 4,
  resueltas: 3, // Denuncias con estado 'resuelto'
  pendientes: 0, // Denuncias con estado 'pendiente'
  enProceso: 1, // Denuncias con estado 'en_proceso'
  rechazadas: 0,
  cerradas: 0,
  tiempoPromedioRespuesta: 2.8, // Promedio realista en días
  satisfaccionPromedio: 4.7, // Promedio de las satisfacciones
  porcentajeResolucion: 75, // 3 de 4 resueltas = 75%
  denunciasPorCategoria: {
    'Alumbrado Público': 1,
    'Infraestructura Vial': 1,
    'Ruidos Molestos': 1,
    'Recolección de Basura': 1
  },
  denunciasPorMes: {
    'diciembre 2024': 4
  },
  tendencia: 'mejorando'
};

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

// Datos mock actualizados con evidencias en respuestas
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
        evidencias: [], // Sin evidencias en primera respuesta
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
    estado: 'resuelto',
    prioridad: 'media',
    fechaCreacion: '2024-12-15T09:20:00Z',
    fechaActualizacion: '2024-12-16T14:00:00Z',
    fechaResolucion: '2024-12-16T14:00:00Z',
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
    respuestas: [
      {
        id: 'resp6',
        contenido: 'Se ha completado la limpieza de Plaza San Martín. Nuestro equipo realizó la recolección de todos los residuos acumulados y aplicó desinfección del área. Adjuntamos video del procedimiento realizado para su conocimiento.',
        fechaRespuesta: '2024-12-16T14:00:00Z',
        autorRespuesta: 'Patricia Rojas',
        cargoAutor: 'Supervisora de Aseo y Ornato',
        evidencias: [
          evidenciasMockRespuestas[4] // Video del procedimiento
        ],
        esRespuestaOficial: true,
        leida: true,
        departamento: 'Departamento de Medio Ambiente'
      }
    ],
    tiempoRespuesta: 1.2,
    satisfaccionCiudadano: 4,
    departamentoAsignado: 'Departamento de Medio Ambiente',
    funcionarioAsignado: 'Patricia Rojas',
    vistas: 28,
    likes: 6,
    compartido: false,
    notificacionesActivas: false
  }
];

// Resto de las funciones sin cambios...
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

export const obtenerDenunciaPorId = (id: string): HistorialDenuncia | undefined => {
  return denunciasPlaceholder.find(d => d.id === id);
};

export const marcarRespuestasLeidas = (denunciaId: string): void => {
  const denuncia = denunciasPlaceholder.find(d => d.id === denunciaId);
  if (denuncia) {
    denuncia.respuestas.forEach(respuesta => {
      respuesta.leida = true;
    });
  }
};

export const obtenerEstadisticasActualizadas = (): EstadisticasHistorial => {
  const denuncias = denunciasPlaceholder;

  const stats = {
    totalDenuncias: denuncias.length,
    resueltas: denuncias.filter(d => d.estado === 'resuelto').length,
    pendientes: denuncias.filter(d => d.estado === 'pendiente').length,
    enProceso: denuncias.filter(d => d.estado === 'en_proceso').length,
    rechazadas: denuncias.filter(d => d.estado === 'rechazado').length,
    cerradas: denuncias.filter(d => d.estado === 'cerrado').length,
    tiempoPromedioRespuesta: 0,
    satisfaccionPromedio: 0,
    porcentajeResolucion: 0,
    denunciasPorCategoria: {} as Record<string, number>,
    denunciasPorMes: {} as Record<string, number>,
    tendencia: 'estable' as const
  };

  // Calcular tiempo promedio de respuesta
  const denunciasConRespuesta = denuncias.filter(d => d.tiempoRespuesta !== undefined);
  if (denunciasConRespuesta.length > 0) {
    stats.tiempoPromedioRespuesta = denunciasConRespuesta.reduce((sum, d) => sum + (d.tiempoRespuesta || 0), 0) / denunciasConRespuesta.length;
  }

  // Calcular satisfacción promedio
  const denunciasConSatisfaccion = denuncias.filter(d => d.satisfaccionCiudadano !== undefined);
  if (denunciasConSatisfaccion.length > 0) {
    stats.satisfaccionPromedio = denunciasConSatisfaccion.reduce((sum, d) => sum + (d.satisfaccionCiudadano || 0), 0) / denunciasConSatisfaccion.length;
  }

  // Calcular porcentaje de resolución
  stats.porcentajeResolucion = stats.totalDenuncias > 0 ?
    (stats.resueltas / stats.totalDenuncias) * 100 : 0;

  // Contar denuncias por categoría
  denuncias.forEach(d => {
    if (d.categoria) {
      stats.denunciasPorCategoria[d.categoria] = (stats.denunciasPorCategoria[d.categoria] || 0) + 1;
    }
  });

  // Contar denuncias por mes
  denuncias.forEach(d => {
    const mes = new Date(d.fechaCreacion).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
    stats.denunciasPorMes[mes] = (stats.denunciasPorMes[mes] || 0) + 1;
  });

  return stats;
};

// src/components/forms/FormProgressCard.tsx - ACTUALIZADO CON UBICACIÓN OBLIGATORIA
import React from 'react';
import { Text, YStack, XStack, Card } from 'tamagui';
import { DenunciaFormData } from '../../types/denuncias';

interface FormProgressCardProps {
  formData: DenunciaFormData;
}

interface ProgressItem {
  key: string;
  label: string;
  isValid: boolean;
  requirement?: string;
  isOptional?: boolean;
}

const FormProgressCard: React.FC<FormProgressCardProps> = ({ formData }) => {
  // Calcular el estado de cada campo (ACTUALIZADO con ubicación obligatoria)
  const progressItems: ProgressItem[] = [
    {
      key: 'titulo',
      label: 'Título',
      isValid: formData.titulo.length >= 10,
      requirement: 'mínimo 10 caracteres'
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      isValid: formData.descripcion.length >= 20,
      requirement: 'mínimo 20 caracteres'
    },
    {
      key: 'categoria',
      label: 'Categoría',
      isValid: Boolean(formData.categoria),
      requirement: 'seleccionada'
    },
    {
      key: 'departamento',
      label: 'Departamento',
      isValid: Boolean(formData.departamento),
      requirement: 'seleccionado'
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      isValid: Boolean(formData.ubicacion),
      requirement: 'seleccionada en el mapa'
    },
    {
      key: 'evidencias',
      label: 'Evidencias',
      isValid: formData.evidencias && formData.evidencias.length > 0,
      requirement: `${formData.evidencias?.length || 0} foto(s)`,
      isOptional: true
    }
  ];

  // Calcular progreso general (solo campos obligatorios)
  const requiredItems = progressItems.filter(item => !item.isOptional);
  const completedRequiredItems = requiredItems.filter(item => item.isValid).length;
  const totalRequiredItems = requiredItems.length;
  const isFormComplete = completedRequiredItems === totalRequiredItems;
  const progressPercentage = Math.round((completedRequiredItems / totalRequiredItems) * 100);

  // Contar items opcionales completados
  const optionalItems = progressItems.filter(item => item.isOptional);
  const completedOptionalItems = optionalItems.filter(item => item.isValid).length;

  return (
    <Card elevate p="$4" gap="$3">
      {/* Header con progreso general */}
      <XStack jc="space-between" ai="center">
        <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
          Progreso del formulario
        </Text>
        <XStack ai="center" gap="$2">
          <Text fontSize="$4" fontWeight="bold" color={isFormComplete ? "$success" : "$warning"}>
            {progressPercentage}%
          </Text>
          <Text fontSize="$4" fontWeight="bold" color={isFormComplete ? "$success" : "$warning"}>
            {isFormComplete ? '✅ Completo' : '⏳ Incompleto'}
          </Text>
        </XStack>
      </XStack>

      {/* Barra de progreso visual */}
      <YStack gap="$1">
        <YStack
          h={6}
          bg="$gray4"
          borderRadius="$3"
          overflow="hidden"
        >
          <YStack
            h="100%"
            bg={isFormComplete ? "$success" : "$primary"}
            width={`${progressPercentage}%`}
            borderRadius="$3"
            style={{
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </YStack>
        <XStack jc="space-between" ai="center">
          <Text fontSize="$2" color="$textSecondary">
            {completedRequiredItems} de {totalRequiredItems} campos obligatorios
          </Text>
          {completedOptionalItems > 0 && (
            <Text fontSize="$2" color="$blue11">
              +{completedOptionalItems} opcional(es)
            </Text>
          )}
        </XStack>
      </YStack>

      {/* Lista detallada de campos */}
      <YStack gap="$1">
        {progressItems.map((item) => (
          <XStack key={item.key} jc="space-between" ai="center">
            <XStack ai="center" gap="$2">
              <Text fontSize="$3" color={item.isValid ? "$success" : "$textSecondary"}>
                {item.isValid ? '✅' : '⭕'}
              </Text>
              <XStack ai="center" gap="$1">
                <Text fontSize="$3" color={item.isValid ? "$success" : "$textSecondary"}>
                  {item.label}
                </Text>
                {item.isOptional && (
                  <Text fontSize="$2" color="$blue10">
                    (opcional)
                  </Text>
                )}
              </XStack>
            </XStack>
            <Text fontSize="$2" color="$textSecondary">
              ({item.requirement})
            </Text>
          </XStack>
        ))}
      </YStack>

      {/* Mensaje motivacional */}
      {!isFormComplete && (
        <YStack gap="$1" mt="$2" p="$2" bg="$blue2" borderRadius="$3">
          <Text fontSize="$3" color="$blue11" textAlign="center" fontWeight="600">
            💡 Completa todos los campos obligatorios para enviar tu denuncia
          </Text>
          {completedRequiredItems > 0 && (
            <Text fontSize="$2" color="$blue10" textAlign="center">
              ¡Vas muy bien! Solo faltan {totalRequiredItems - completedRequiredItems} campo{totalRequiredItems - completedRequiredItems > 1 ? 's' : ''}
            </Text>
          )}
        </YStack>
      )}

      {/* Mensaje de éxito */}
      {isFormComplete && (
        <YStack gap="$1" mt="$2" p="$2" bg="$green2" borderRadius="$3">
          <Text fontSize="$3" color="$green11" textAlign="center" fontWeight="600">
            🎉 ¡Formulario completo! Ya puedes enviar tu denuncia
          </Text>
          {formData.evidencias && formData.evidencias.length > 0 && (
            <Text fontSize="$2" color="$green10" textAlign="center">
              📷 Excelente! Incluiste {formData.evidencias.length} evidencia(s) que ayudarán a procesar tu denuncia más rápido
            </Text>
          )}
        </YStack>
      )}
    </Card>
  );
};

export default FormProgressCard;
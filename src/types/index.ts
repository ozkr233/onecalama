export * from './denuncias';
export * from './ai';

// Para historial, usar alias para evitar conflicto de nombres
export type {
  Evidencia as EvidenciaServidor,
  HistorialDenuncia,
  Respuesta,
  Ubicacion,
  EstadoDenuncia,
  PrioridadDenuncia,
  EstadisticasHistorial,
  FiltrosHistorial,
  ResultadosFiltrados,
  NotificacionDenuncia,
  ExportConfig,
  HistorialLoadingState
} from './historial';
// src/hooks/useAIAssistant.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { DenunciaFormData } from '../types/denuncias';
import { AIAnalysisResult, AIContext, AISuggestion } from '../types/ai';
import { AIService } from '../services/aiService';

/**
 * Configuración del hook
 */
interface UseAIAssistantConfig {
  /** Datos del formulario de denuncia */
  formData: DenunciaFormData;
  /** Lista de categorías disponibles */
  categorias: any[];
  /** Lista de departamentos disponibles */
  departamentos: any[];
  /** Contexto adicional para el análisis */
  context?: AIContext;
  /** Activar análisis automático mientras se escribe */
  autoAnalyze?: boolean;
  /** Tiempo de espera antes de analizar (en milisegundos) */
  debounceMs?: number;
  /** Función llamada cuando el análisis se completa */
  onAnalysisComplete?: (result: AIAnalysisResult) => void;
  /** Función llamada cuando ocurre un error */
  onError?: (error: string) => void;
}

/**
 * Estados posibles del análisis
 */
type AnalysisState = 'idle' | 'analyzing' | 'success' | 'error';

/**
 * Estadísticas del análisis actual
 */
interface AnalysisStats {
  totalSuggestions: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  averageConfidence: number;
  detectedCategory?: string;
  detectedDepartment?: string;
}

/**
 * Hook personalizado para manejar el asistente de IA
 */
export const useAIAssistant = ({
  formData,
  categorias,
  departamentos,
  context,
  autoAnalyze = false,
  debounceMs = 1000,
  onAnalysisComplete,
  onError
}: UseAIAssistantConfig) => {
  // Estados principales
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [state, setState] = useState<AnalysisState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Referencias para manejar timeouts y evitar memory leaks
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Estados derivados
  const isAnalyzing = state === 'analyzing';
  const hasAnalysis = analysis !== null;
  const hasSuggestions = analysis?.suggestions.length > 0;
  const hasError = state === 'error';
  const isReady = state !== 'analyzing';

  /**
   * Limpia timeouts y controladores al desmontar
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Función principal para analizar el texto
   */
  const analyzeText = useCallback(async (): Promise<AIAnalysisResult | null> => {
    // Verificar si se puede analizar
    if (!AIService.canAnalyze(formData)) {
      const errorMsg = 'Texto insuficiente para realizar el análisis';
      setError(errorMsg);
      setState('error');
      onError?.(errorMsg);
      return null;
    }

    try {
      // Cancelar análisis anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo controlador de abort
      abortControllerRef.current = new AbortController();

      setState('analyzing');
      setError(null);

      // Realizar análisis
      const result = await AIService.analyzeText(
        formData,
        categorias,
        departamentos,
        context
      );

      // Verificar si no fue cancelado
      if (!abortControllerRef.current.signal.aborted) {
        setAnalysis(result);
        setState('success');
        onAnalysisComplete?.(result);
        return result;
      }

      return null;
    } catch (err) {
      // Verificar si no fue cancelado
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido en el análisis';
        setError(errorMessage);
        setState('error');
        onError?.(errorMessage);
        console.error('Error en análisis IA:', err);
      }
      return null;
    }
  }, [formData, categorias, departamentos, context, onAnalysisComplete, onError]);

  /**
   * Auto-análisis con debounce cuando cambia el texto
   */
  useEffect(() => {
    if (!autoAnalyze) return;

    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const texto = `${formData.titulo} ${formData.descripcion}`.trim();

    // Si no hay suficiente texto, limpiar análisis
    if (!AIService.canAnalyze(formData)) {
      setAnalysis(null);
      setState('idle');
      setError(null);
      return;
    }

    // Programar nuevo análisis
    debounceTimeoutRef.current = setTimeout(() => {
      analyzeText();
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [formData.titulo, formData.descripcion, autoAnalyze, debounceMs, analyzeText]);

  /**
   * Aplica una sugerencia específica por ID
   */
  const applySuggestion = useCallback((suggestionId: string): AISuggestion | null => {
    if (!analysis) return null;

    const suggestion = analysis.suggestions.find(s => s.id === suggestionId);
    return suggestion || null;
  }, [analysis]);

  /**
   * Obtiene sugerencias filtradas por campo
   */
  const getSuggestionsForField = useCallback((field: keyof DenunciaFormData): AISuggestion[] => {
    if (!analysis) return [];
    return analysis.suggestions.filter(s => s.field === field);
  }, [analysis]);

  /**
   * Verifica si hay sugerencias de alta prioridad
   */
  const hasHighPrioritySuggestions = useCallback((): boolean => {
    if (!analysis) return false;
    return analysis.suggestions.some(s => s.priority === 'high' && s.confidence > 70);
  }, [analysis]);

  /**
   * Obtiene consejos de mejora
   */
  const getImprovementTips = useCallback((): string[] => {
    return analysis?.improvementTips || [];
  }, [analysis]);

  /**
   * Resetea el estado del análisis
   */
  const resetAnalysis = useCallback(() => {
    // Cancelar análisis en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpiar timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Resetear estados
    setAnalysis(null);
    setError(null);
    setState('idle');
  }, []);

  /**
   * Obtiene estadísticas del análisis actual
   */
  const getAnalysisStats = useCallback((): AnalysisStats | null => {
    if (!analysis) return null;

    const suggestions = analysis.suggestions;
    const totalSuggestions = suggestions.length;

    if (totalSuggestions === 0) {
      return {
        totalSuggestions: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        averageConfidence: 0,
        detectedCategory: analysis.detectedCategory,
        detectedDepartment: analysis.detectedDepartment
      };
    }

    const highPriority = suggestions.filter(s => s.priority === 'high').length;
    const mediumPriority = suggestions.filter(s => s.priority === 'medium').length;
    const lowPriority = suggestions.filter(s => s.priority === 'low').length;

    const averageConfidence = suggestions.reduce((acc, s) => acc + s.confidence, 0) / totalSuggestions;

    return {
      totalSuggestions,
      highPriority,
      mediumPriority,
      lowPriority,
      averageConfidence: Math.round(averageConfidence),
      detectedCategory: analysis.detectedCategory,
      detectedDepartment: analysis.detectedDepartment
    };
  }, [analysis]);

  /**
   * Verifica si el análisis está desactualizado
   */
  const isAnalysisStale = useCallback((): boolean => {
    if (!analysis) return false;

    // Considerar desactualizado si el texto cambió significativamente
    const currentText = `${formData.titulo} ${formData.descripcion}`.toLowerCase();
    const detectedText = `${analysis.detectedCategory || ''} ${analysis.detectedDepartment || ''}`.toLowerCase();

    // Lógica simple: si el texto actual no contiene elementos detectados
    return currentText.length > 20 && !currentText.includes(detectedText.split(' ')[0]);
  }, [analysis, formData]);

  /**
   * Obtiene sugerencias rápidas para un campo específico
   */
  const getQuickSuggestions = useCallback((keyword: string): string[] => {
    return AIService.getQuickSuggestions(keyword);
  }, []);

  /**
   * Fuerza un nuevo análisis ignorando el debounce
   */
  const forceAnalyze = useCallback(async (): Promise<AIAnalysisResult | null> => {
    // Limpiar timeout de debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    return await analyzeText();
  }, [analyzeText]);

  return {
    // Estados principales
    analysis,
    state,
    error,

    // Estados derivados
    isAnalyzing,
    hasAnalysis,
    hasSuggestions,
    hasError,
    isReady,

    // Funciones principales
    analyzeText,
    forceAnalyze,
    resetAnalysis,

    // Funciones de utilidad
    applySuggestion,
    getSuggestionsForField,
    hasHighPrioritySuggestions,
    getImprovementTips,
    getAnalysisStats,
    getQuickSuggestions,
    isAnalysisStale,

    // Información de configuración
    canAnalyze: AIService.canAnalyze(formData),
    config: AIService.getConfig()
  };
};
// src/types/ai.ts
export interface AISuggestion {
  id: string;
  field: 'titulo' | 'descripcion' | 'categoria' | 'departamento';
  value: string;
  confidence: number; // 0-100
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SugerenciaTemplateItem {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  departamento: string;
  palabrasClave: string[];
  ejemplos: string[];
  tags: string[];
}

export interface AIAnalysisResult {
  suggestions: AISuggestion[];
  confidence: number;
  detectedCategory?: string;
  detectedDepartment?: string;
  improvementTips: string[];
}

export interface AIAssistantConfig {
  enabled: boolean;
  autoSuggest: boolean;
  confidenceThreshold: number;
  maxSuggestions: number;
}

export interface AIContext {
  userLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  previousReports?: {
    category: string;
    count: number;
  }[];
  commonIssuesInArea?: string[];
}
// src/services/aiService.ts
import { DenunciaFormData } from '../types/denuncias';
import { AISuggestion, AIAnalysisResult, SugerenciaTemplateItem, AIContext } from '../types/ai';

/**
 * Configuración del servicio de IA
 */
const AI_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.3,
  MAX_SUGGESTIONS: 5,
  MIN_TEXT_LENGTH: 5,
  DEBOUNCE_MS: 1000,
  ANALYSIS_DELAY_MS: 1500, // Simular procesamiento
} as const;

/**
 * Plantillas de problemas municipales específicos de Calama
 */
const KNOWLEDGE_BASE: readonly SugerenciaTemplateItem[] = [
  {
    id: 'alumbrado-publico',
    categoria: 'Alumbrado Público',
    titulo: 'Luminaria dañada o intermitente',
    descripcion: 'Poste de luz que no funciona correctamente, parpadea o está completamente apagado',
    departamento: 'Obras Públicas',
    palabrasClave: [
      'luz', 'luminaria', 'poste', 'alumbrado', 'oscuro', 'parpadea',
      'intermitente', 'apagado', 'electricidad', 'farola', 'bombilla'
    ],
    ejemplos: [
      'La luminaria de la esquina de Av. Brasil con Calle Ramírez está parpadeando toda la noche',
      'El poste de luz frente al N° 1234 está completamente apagado desde hace una semana',
      'La luz de la calle se prende y se apaga constantemente generando peligro para peatones'
    ],
    tags: ['infraestructura', 'seguridad', 'nocturno']
  },
  {
    id: 'vialidad',
    categoria: 'Vialidad',
    titulo: 'Bache o deterioro del pavimento',
    descripcion: 'Hoyos, grietas o deterioro del asfalto que dificulta el tránsito vehicular y puede causar daños',
    departamento: 'Obras Públicas',
    palabrasClave: [
      'bache', 'hoyo', 'pavimento', 'asfalto', 'calle', 'deterioro',
      'grieta', 'peligroso', 'vehículo', 'reparación', 'camino'
    ],
    ejemplos: [
      'Hay un bache de aproximadamente 50cm de diámetro en Calle Granaderos que puede dañar los vehículos',
      'El pavimento está muy deteriorado con múltiples grietas que se están expandiendo',
      'Se formó un hoyo profundo después de las lluvias que es peligroso para motos y autos'
    ],
    tags: ['infraestructura', 'transporte', 'seguridad-vial']
  },
  {
    id: 'recoleccion-basura',
    categoria: 'Basura',
    titulo: 'Problema con recolección de residuos',
    descripcion: 'Basura acumulada, contenedores desbordados o falta de recolección domiciliaria',
    departamento: 'Medio Ambiente',
    palabrasClave: [
      'basura', 'recolección', 'contenedor', 'desperdicios', 'sucio',
      'olores', 'vertedero', 'camión', 'residuos', 'reciclaje'
    ],
    ejemplos: [
      'No han pasado a recoger la basura domiciliaria en tres días consecutivos en el sector',
      'El contenedor de la esquina está desbordado y genera malos olores que molestan a los vecinos',
      'Personas botan basura en la vía pública y se acumula sin control'
    ],
    tags: ['limpieza', 'salud-publica', 'medio-ambiente']
  },
  {
    id: 'areas-verdes',
    categoria: 'Áreas verdes',
    titulo: 'Mantenimiento de espacios verdes',
    descripcion: 'Problemas con el cuidado de plantas, árboles, parques o jardines públicos',
    departamento: 'Medio Ambiente',
    palabrasClave: [
      'parque', 'jardín', 'pasto', 'árbol', 'plantas', 'riego',
      'poda', 'seco', 'verde', 'mantención', 'césped'
    ],
    ejemplos: [
      'Los árboles del Parque El Loa necesitan poda urgente porque las ramas están tocando los cables',
      'El pasto de la plaza está muy seco y amarillo por falta de riego sistemático',
      'Hay plantas muertas en los jardines que necesitan ser reemplazadas por nuevas'
    ],
    tags: ['ornato', 'medio-ambiente', 'espacios-publicos']
  },
  {
    id: 'ruidos-molestos',
    categoria: 'Ruidos molestos',
    titulo: 'Contaminación acústica',
    descripcion: 'Ruidos excesivos que alteran la tranquilidad del vecindario fuera de horarios permitidos',
    departamento: 'Servicios Municipales',
    palabrasClave: [
      'ruido', 'música', 'volumen', 'molesto', 'fiesta', 'madrugada',
      'local', 'construcción', 'decibeles', 'sonido'
    ],
    ejemplos: [
      'Un local comercial en Av. O\'Higgins pone música muy fuerte en horario nocturno después de las 23:00',
      'Construcción en el sector que hace ruido muy temprano en la mañana antes de las 8:00 AM',
      'Vecinos hacen fiestas con música alta hasta muy tarde afectando el descanso familiar'
    ],
    tags: ['convivencia', 'ruido', 'horarios']
  },
  {
    id: 'seguridad-ciudadana',
    categoria: 'Seguridad',
    titulo: 'Problema de seguridad ciudadana',
    descripcion: 'Situaciones que comprometen la seguridad de los residentes y requieren atención municipal',
    departamento: 'Seguridad Ciudadana',
    palabrasClave: [
      'inseguridad', 'robo', 'delincuencia', 'patrullaje', 'iluminación',
      'vigilancia', 'peligro', 'asalto', 'vandalismo'
    ],
    ejemplos: [
      'Falta iluminación en el pasaje que conecta con Av. Brasil donde han ocurrido varios robos',
      'Necesitamos más patrullaje municipal en el sector porque hay actividad sospechosa',
      'Grupo de personas merodeando que genera inseguridad en los vecinos del sector'
    ],
    tags: ['seguridad', 'prevención', 'vigilancia']
  },
  {
    id: 'senaletica-transito',
    categoria: 'Señalética',
    titulo: 'Problema con señalización de tránsito',
    descripcion: 'Señales de tránsito dañadas, faltantes o mal ubicadas que generan confusión',
    departamento: 'Tránsito y Transporte',
    palabrasClave: [
      'señal', 'tránsito', 'pare', 'ceda el paso', 'velocidad',
      'dirección', 'semáforo', 'estacionamiento'
    ],
    ejemplos: [
      'La señal de PARE en la intersección está completamente tapada por ramas de árboles',
      'Falta señalización que indique la velocidad máxima en esta zona escolar',
      'El semáforo está funcionando mal y genera confusión en los conductores'
    ],
    tags: ['tránsito', 'seguridad-vial', 'señalización']
  }
] as const;

/**
 * Variaciones comunes de palabras clave para mejorar la detección
 */
const KEYWORD_VARIATIONS: Record<string, string[]> = {
  'luz': ['luces', 'iluminación', 'alumbrado', 'bombilla', 'farola'],
  'basura': ['residuos', 'desperdicios', 'desechos', 'escombros'],
  'bache': ['hoyo', 'hoyos', 'deterioro', 'hundimiento'],
  'ruido': ['ruidos', 'sonido', 'música', 'escándalo'],
  'árbol': ['árboles', 'vegetación', 'plantas'],
  'parque': ['parques', 'plaza', 'plazas', 'jardín'],
  'señal': ['señales', 'señalización', 'cartel'],
  'semáforo': ['semáforos', 'luz roja', 'disco']
};

/**
 * Servicio principal de IA para análisis de denuncias
 */
export class AIService {
  /**
   * Analiza el texto de la denuncia y genera sugerencias automáticas
   */
  static async analyzeText(
    formData: DenunciaFormData,
    categorias: any[],
    departamentos: any[],
    context?: AIContext
  ): Promise<AIAnalysisResult> {
    // Validación inicial
    const texto = this.sanitizeText(`${formData.titulo} ${formData.descripcion}`);

    if (texto.length < AI_CONFIG.MIN_TEXT_LENGTH) {
      throw new Error('Texto insuficiente para análisis');
    }

    // Simular delay de procesamiento
    await this.delay(AI_CONFIG.ANALYSIS_DELAY_MS);

    const suggestions: AISuggestion[] = [];
    let bestMatch: SugerenciaTemplateItem | null = null;
    let maxScore = 0;

    // Analizar cada plantilla de la base de conocimiento
    for (const template of KNOWLEDGE_BASE) {
      const score = this.calculateMatchScore(texto, template);

      if (score > maxScore) {
        maxScore = score;
        bestMatch = template;
      }

      // Generar sugerencias si hay suficiente coincidencia
      if (score > AI_CONFIG.CONFIDENCE_THRESHOLD) {
        const templateSuggestions = this.generateSuggestionsFromTemplate(
          template,
          formData,
          categorias,
          departamentos,
          score
        );
        suggestions.push(...templateSuggestions);
      }
    }

    // Agregar sugerencias contextuales
    if (context) {
      const contextSuggestions = this.generateContextualSuggestions(
        formData,
        context,
        categorias,
        departamentos
      );
      suggestions.push(...contextSuggestions);
    }

    // Filtrar, ordenar y limitar sugerencias
    const filteredSuggestions = this.filterAndRankSuggestions(suggestions);

    return {
      suggestions: filteredSuggestions,
      confidence: Math.round(maxScore * 100),
      detectedCategory: bestMatch?.categoria,
      detectedDepartment: bestMatch?.departamento,
      improvementTips: this.generateImprovementTips(formData, bestMatch)
    };
  }

  /**
   * Sanitiza y normaliza el texto para análisis
   */
  private static sanitizeText(texto: string): string {
    return texto
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ') // Remover puntuación
      .replace(/\s+/g, ' '); // Normalizar espacios
  }

  /**
   * Simula un delay para el procesamiento
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calcula el puntaje de coincidencia entre el texto y una plantilla
   */
  private static calculateMatchScore(texto: string, template: SugerenciaTemplateItem): number {
    let score = 0;
    const totalKeywords = template.palabrasClave.length;
    const words = texto.split(' ');

    // Verificar coincidencias exactas de palabras clave
    for (const keyword of template.palabrasClave) {
      if (words.includes(keyword)) {
        score += 1;
      }
    }

    // Verificar coincidencias parciales y variaciones
    for (const keyword of template.palabrasClave) {
      const variations = this.getKeywordVariations(keyword);
      for (const variation of variations) {
        if (words.includes(variation) && !words.includes(keyword)) {
          score += 0.7; // Puntaje menor para variaciones
        }
      }
    }

    // Bonificación por coincidencias en secuencia
    const keywordSequences = this.findKeywordSequences(texto, template.palabrasClave);
    score += keywordSequences * 0.5;

    return Math.min(score / totalKeywords, 1); // Normalizar entre 0 y 1
  }

  /**
   * Encuentra secuencias de palabras clave cercanas en el texto
   */
  private static findKeywordSequences(texto: string, keywords: string[]): number {
    const words = texto.split(' ');
    let sequences = 0;

    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i];
      const nextWord = words[i + 1];

      if (keywords.includes(currentWord) && keywords.includes(nextWord)) {
        sequences++;
      }
    }

    return sequences;
  }

  /**
   * Obtiene variaciones de una palabra clave
   */
  private static getKeywordVariations(keyword: string): string[] {
    const variations: string[] = [];

    // Variaciones predefinidas
    if (KEYWORD_VARIATIONS[keyword]) {
      variations.push(...KEYWORD_VARIATIONS[keyword]);
    }

    // Generar plurales/singulares básicos
    const morphologicalVariations = this.generateMorphologicalVariations(keyword);
    variations.push(...morphologicalVariations);

    return [...new Set(variations)]; // Eliminar duplicados
  }

  /**
   * Genera variaciones morfológicas básicas (plurales, etc.)
   */
  private static generateMorphologicalVariations(word: string): string[] {
    const variations: string[] = [];

    // Plurales básicos en español
    if (word.endsWith('a') || word.endsWith('e') || word.endsWith('o')) {
      variations.push(word + 's');
    } else if (!word.endsWith('s')) {
      variations.push(word + 'es');
    }

    // Singulares (si termina en s)
    if (word.endsWith('s') && word.length > 2) {
      variations.push(word.slice(0, -1));
      if (word.endsWith('es')) {
        variations.push(word.slice(0, -2));
      }
    }

    return variations;
  }

  /**
   * Genera sugerencias basadas en una plantilla específica
   */
  private static generateSuggestionsFromTemplate(
    template: SugerenciaTemplateItem,
    formData: DenunciaFormData,
    categorias: any[],
    departamentos: any[],
    confidence: number
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const baseConfidence = confidence * 100;

    // Sugerir título si es necesario
    if (this.shouldSuggestTitle(formData.titulo)) {
      suggestions.push({
        id: `titulo_${template.id}`,
        field: 'titulo',
        value: template.titulo,
        confidence: Math.min(baseConfidence * 0.9, 95),
        reason: `Detecté que tu denuncia está relacionada con ${template.categoria.toLowerCase()}`,
        priority: 'high'
      });
    }

    // Sugerir categoría
    const categoriaMatch = this.findMatchingCategory(template.categoria, categorias);
    if (categoriaMatch && formData.categoria !== categoriaMatch.id) {
      suggestions.push({
        id: `categoria_${template.id}`,
        field: 'categoria',
        value: categoriaMatch.id,
        confidence: Math.min(baseConfidence * 0.85, 90),
        reason: `El problema parece estar relacionado con ${template.categoria}`,
        priority: 'high'
      });
    }

    // Sugerir departamento
    const departamentoMatch = this.findMatchingDepartment(template.departamento, departamentos);
    if (departamentoMatch && formData.departamento !== departamentoMatch.id) {
      suggestions.push({
        id: `departamento_${template.id}`,
        field: 'departamento',
        value: departamentoMatch.id,
        confidence: Math.min(baseConfidence * 0.8, 85),
        reason: `Este tipo de problema generalmente lo maneja ${template.departamento}`,
        priority: 'medium'
      });
    }

    // Sugerir mejora de descripción
    if (this.shouldSuggestDescription(formData.descripcion)) {
      const ejemploMejor = this.selectBestExample(formData.descripcion, template.ejemplos);
      suggestions.push({
        id: `descripcion_${template.id}`,
        field: 'descripcion',
        value: ejemploMejor,
        confidence: Math.min(baseConfidence * 0.7, 80),
        reason: `Ejemplo de descripción más detallada para ${template.categoria.toLowerCase()}`,
        priority: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Determina si se debe sugerir un título
   */
  private static shouldSuggestTitle(titulo: string): boolean {
    return !titulo || titulo.length < 10 || this.isGenericTitle(titulo);
  }

  /**
   * Verifica si el título es muy genérico
   */
  private static isGenericTitle(titulo: string): boolean {
    const genericTerms = ['problema', 'denuncia', 'reporte', 'queja', 'asunto'];
    const lowerTitle = titulo.toLowerCase();
    return genericTerms.some(term => lowerTitle.includes(term));
  }

  /**
   * Determina si se debe sugerir una descripción mejorada
   */
  private static shouldSuggestDescription(descripcion: string): boolean {
    return descripcion.length < 50 || this.isVagueDescription(descripcion);
  }

  /**
   * Verifica si la descripción es muy vaga
   */
  private static isVagueDescription(descripcion: string): boolean {
    const vagueTerms = ['mal', 'roto', 'problema', 'no funciona'];
    const lowerDesc = descripcion.toLowerCase();
    return vagueTerms.some(term => lowerDesc.includes(term) && descripcion.length < 100);
  }

  /**
   * Busca la categoría que mejor coincida
   */
  private static findMatchingCategory(targetCategory: string, categorias: any[]): any | null {
    return categorias.find(cat =>
      this.normalizeString(cat.nombre).includes(this.normalizeString(targetCategory)) ||
      this.normalizeString(targetCategory).includes(this.normalizeString(cat.nombre))
    ) || null;
  }

  /**
   * Busca el departamento que mejor coincida
   */
  private static findMatchingDepartment(targetDepartment: string, departamentos: any[]): any | null {
    return departamentos.find(dept =>
      this.normalizeString(dept.nombre).includes(this.normalizeString(targetDepartment)) ||
      this.normalizeString(targetDepartment).includes(this.normalizeString(dept.nombre))
    ) || null;
  }

  /**
   * Normaliza un string para comparación
   */
  private static normalizeString(str: string): string {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Selecciona el mejor ejemplo basado en el contexto
   */
  private static selectBestExample(currentDesc: string, ejemplos: string[]): string {
    if (ejemplos.length === 0) return '';

    // Si hay descripción actual, buscar el ejemplo más similar
    if (currentDesc.length > 10) {
      const words = this.sanitizeText(currentDesc).split(' ');
      let bestExample = ejemplos[0];
      let maxSimilarity = 0;

      for (const ejemplo of ejemplos) {
        const similarity = this.calculateTextSimilarity(words, ejemplo);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestExample = ejemplo;
        }
      }

      return bestExample;
    }

    // Si no hay descripción, devolver ejemplo aleatorio
    return ejemplos[Math.floor(Math.random() * ejemplos.length)];
  }

  /**
   * Calcula similitud entre texto actual y ejemplo
   */
  private static calculateTextSimilarity(words: string[], ejemplo: string): number {
    const ejemploWords = this.sanitizeText(ejemplo).split(' ');
    const commonWords = words.filter(word => ejemploWords.includes(word));
    return commonWords.length / Math.max(words.length, ejemploWords.length);
  }

  /**
   * Genera sugerencias basadas en el contexto del usuario
   */
  private static generateContextualSuggestions(
    formData: DenunciaFormData,
    context: AIContext,
    categorias: any[],
    departamentos: any[]
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    // Sugerencias basadas en problemas comunes en el área
    if (context.commonIssuesInArea?.length) {
      const areaSuggestion = this.generateAreaBasedSuggestion(context.commonIssuesInArea, categorias);
      if (areaSuggestion && !formData.categoria) {
        suggestions.push(areaSuggestion);
      }
    }

    // Sugerencias basadas en historial del usuario
    if (context.previousReports?.length) {
      const historySuggestion = this.generateHistoryBasedSuggestion(context.previousReports, categorias);
      if (historySuggestion && !formData.categoria) {
        suggestions.push(historySuggestion);
      }
    }

    return suggestions;
  }

  /**
   * Genera sugerencia basada en problemas comunes del área
   */
  private static generateAreaBasedSuggestion(commonIssues: string[], categorias: any[]): AISuggestion | null {
    for (const issue of commonIssues) {
      const relatedTemplate = KNOWLEDGE_BASE.find(template =>
        template.palabrasClave.some(keyword =>
          this.normalizeString(issue).includes(keyword)
        )
      );

      if (relatedTemplate) {
        const categoria = this.findMatchingCategory(relatedTemplate.categoria, categorias);
        if (categoria) {
          return {
            id: `context_area_${relatedTemplate.id}`,
            field: 'categoria',
            value: categoria.id,
            confidence: 60,
            reason: `Este tipo de problema es común en tu área`,
            priority: 'low'
          };
        }
      }
    }

    return null;
  }

  /**
   * Genera sugerencia basada en historial del usuario
   */
  private static generateHistoryBasedSuggestion(
    previousReports: { category: string; count: number }[],
    categorias: any[]
  ): AISuggestion | null {
    const mostCommon = previousReports.sort((a, b) => b.count - a.count)[0];
    const categoria = categorias.find(cat =>
      this.normalizeString(cat.nombre) === this.normalizeString(mostCommon.category)
    );

    if (categoria) {
      return {
        id: `context_history`,
        field: 'categoria',
        value: categoria.id,
        confidence: 50,
        reason: `Has reportado problemas similares anteriormente`,
        priority: 'low'
      };
    }

    return null;
  }

  /**
   * Filtra y ordena las sugerencias por relevancia
   */
  private static filterAndRankSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
    // Eliminar duplicados por campo, manteniendo el de mayor confianza
    const uniqueSuggestions = suggestions.reduce((acc, current) => {
      const existing = acc.find(item => item.field === current.field);
      if (!existing || current.confidence > existing.confidence) {
        return [...acc.filter(item => item.field !== current.field), current];
      }
      return acc;
    }, [] as AISuggestion[]);

    // Ordenar por prioridad y confianza
    return uniqueSuggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, AI_CONFIG.MAX_SUGGESTIONS);
  }

  /**
   * Genera consejos para mejorar la denuncia
   */
  private static generateImprovementTips(
    formData: DenunciaFormData,
    bestMatch: SugerenciaTemplateItem | null
  ): string[] {
    const tips: string[] = [];

    if (this.shouldSuggestTitle(formData.titulo)) {
      tips.push('Agrega un título más descriptivo que resuma claramente el problema');
    }

    if (this.shouldSuggestDescription(formData.descripcion)) {
      tips.push('Incluye más detalles: cuándo ocurre, cómo afecta y ubicación específica');
    }

    if (!formData.direccion || formData.direccion.length < 10) {
      tips.push('Especifica la dirección exacta para una respuesta más rápida');
    }

    if (bestMatch) {
      const keyTips = bestMatch.palabrasClave.slice(0, 3);
      tips.push(`Para problemas de ${bestMatch.categoria.toLowerCase()}, menciona: ${keyTips.join(', ')}`);
    }

    if (tips.length === 0) {
      tips.push('Tu denuncia está bien estructurada. Considera agregar fotos si es posible.');
    }

    return tips;
  }

  /**
   * Obtiene sugerencias rápidas basadas en palabras clave simples
   */
  static getQuickSuggestions(keyword: string): string[] {
    const normalizedKeyword = this.normalizeString(keyword);

    // Buscar en plantillas que contengan la palabra clave
    const matchingTemplates = KNOWLEDGE_BASE.filter(template =>
      template.palabrasClave.some(k =>
        this.normalizeString(k).includes(normalizedKeyword) ||
        normalizedKeyword.includes(this.normalizeString(k))
      )
    );

    // Extraer ejemplos de las plantillas coincidentes
    const suggestions = matchingTemplates
      .flatMap(template => template.ejemplos)
      .slice(0, 3); // Máximo 3 sugerencias rápidas

    return suggestions;
  }

  /**
   * Valida si el servicio puede procesar el texto
   */
  static canAnalyze(formData: DenunciaFormData): boolean {
    const texto = `${formData.titulo} ${formData.descripcion}`.trim();
    return texto.length >= AI_CONFIG.MIN_TEXT_LENGTH;
  }

  /**
   * Obtiene la configuración actual del servicio
   */
  static getConfig() {
    return { ...AI_CONFIG };
  }
}
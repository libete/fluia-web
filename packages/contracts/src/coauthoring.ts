/**
 * ============================================
 * ARQUIVO: packages/contracts/src/coauthoring.ts
 * ============================================
 * 
 * FLUIA — Coauthoring Contracts
 * 
 * Vocabulário oficial da coautoria da FLUIA.
 * Apenas tipos e estruturas que cruzam fronteiras.
 * 
 * CONCEITO:
 * - Coautoria = FLUIA ajuda, usuária cria
 * - Prompts guiam, não impõem
 * - Personalização máxima com suporte contextual
 * - PREMIUM ONLY
 * 
 * @version 1.0.0
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipos de produto de coautoria
 */
export type CoauthoringProductType =
  | "guided_diary"      // Diário Guiado
  | "letter_templates"  // Cartas ao Bebê (templates)
  | "reflections";      // Reflexões narrativas

/**
 * Status de entrada
 */
export type EntryStatus = "draft" | "completed" | "archived";

// ============================================
// DIÁRIO GUIADO
// ============================================

/**
 * Prompt para diário guiado
 */
export interface DiaryPrompt {
  /** ID do prompt */
  promptId: string;
  
  /** Categoria do prompt */
  category: 
    | "emotion"        // Como você está se sentindo?
    | "body"           // Como está seu corpo?
    | "baby"           // Conexão com o bebê
    | "gratitude"      // Gratidão
    | "challenge"      // Desafios
    | "dream"          // Sonhos e desejos
    | "reflection"     // Reflexão geral
    | "milestone";     // Marco especial
  
  /** Texto do prompt */
  text: string;
  
  /** Texto alternativo (para variedade) */
  alternativeText?: string;
  
  /** É baseado no contexto emocional? */
  isContextual: boolean;
  
  /** Zonas emocionais onde faz sentido (1-5) */
  relevantZones?: number[];
  
  /** Semanas gestacionais relevantes */
  relevantWeeks?: { min: number; max: number };
  
  /** Placeholder para o campo de texto */
  placeholder: string;
  
  /** Dica de escrita */
  writingTip?: string;
}

/**
 * Entrada do diário guiado
 */
export interface GuidedDiaryEntry {
  /** ID da entrada */
  entryId: string;
  
  /** Data (YYYY-MM-DD) */
  date: string;
  
  /** Semana gestacional */
  gestationalWeek: number;
  
  /** Prompt usado */
  prompt: DiaryPrompt;
  
  /** Resposta da usuária */
  response: string;
  
  /** Contexto emocional do momento */
  emotionalContext: {
    zone: number;
    dominantPillar: string;
  };
  
  /** Timestamp de criação */
  createdAt: string;
  
  /** Timestamp de última edição */
  updatedAt: string;
  
  /** Status */
  status: EntryStatus;
  
  /** Tags opcionais */
  tags?: string[];
  
  /** Foto anexada */
  photoUrl?: string;
}

/**
 * Resposta do diário guiado
 */
export interface GuidedDiaryResponse {
  /** Entradas existentes */
  entries: GuidedDiaryEntry[];
  
  /** Prompt sugerido para hoje */
  todayPrompt: DiaryPrompt;
  
  /** Prompts alternativos */
  alternativePrompts: DiaryPrompt[];
  
  /** Estatísticas */
  stats: {
    totalEntries: number;
    streakDays: number;
    favoriteCategory: string;
  };
}

/**
 * Request para salvar entrada do diário
 */
export interface SaveGuidedDiaryRequest {
  entryId?: string;
  promptId: string;
  response: string;
  tags?: string[];
  photoUrl?: string;
}

// ============================================
// CARTAS AO BEBÊ (TEMPLATES)
// ============================================

/**
 * Template de carta
 */
export interface LetterTemplate {
  /** ID do template */
  templateId: string;
  
  /** Categoria */
  category:
    | "milestone"       // Marco específico
    | "weekly"          // Carta semanal
    | "emotion"         // Baseada em emoção
    | "event"           // Evento especial
    | "future"          // Para o futuro
    | "gratitude"       // Gratidão
    | "advice";         // Conselho para o bebê
  
  /** Título do template */
  title: string;
  
  /** Descrição */
  description: string;
  
  /** Estrutura da carta (seções) */
  sections: LetterSection[];
  
  /** Semanas gestacionais relevantes */
  relevantWeeks?: { min: number; max: number };
  
  /** Contexto emocional relevante */
  relevantZones?: number[];
  
  /** Ícone */
  icon: string;
  
  /** Cor do tema */
  themeColor: string;
}

/**
 * Seção de uma carta
 */
export interface LetterSection {
  /** ID da seção */
  sectionId: string;
  
  /** Ordem */
  order: number;
  
  /** Tipo */
  type: "opening" | "body" | "prompt" | "closing" | "free";
  
  /** Label da seção */
  label: string;
  
  /** Texto guia (o que escrever) */
  guideText: string;
  
  /** Texto de exemplo */
  exampleText?: string;
  
  /** Placeholder */
  placeholder: string;
  
  /** É obrigatória? */
  required: boolean;
  
  /** Texto pré-preenchido (editável) */
  prefillText?: string;
}

/**
 * Carta criada a partir de template
 */
export interface TemplatedLetter {
  /** ID da carta */
  letterId: string;
  
  /** Template usado */
  templateId: string;
  
  /** Título (pode ser editado) */
  title: string;
  
  /** Conteúdo por seção */
  sections: Array<{
    sectionId: string;
    content: string;
  }>;
  
  /** Conteúdo final compilado */
  compiledContent: string;
  
  /** Semana gestacional */
  gestationalWeek: number;
  
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
  
  /** Status */
  status: EntryStatus;
  
  /** Foto anexada */
  photoUrl?: string;
}

/**
 * Resposta dos templates de carta
 */
export interface LetterTemplatesResponse {
  /** Templates disponíveis */
  templates: LetterTemplate[];
  
  /** Template sugerido */
  suggestedTemplate: LetterTemplate;
  
  /** Cartas criadas */
  createdLetters: TemplatedLetter[];
  
  /** Estatísticas */
  stats: {
    totalLetters: number;
    templateMostUsed: string;
  };
}

/**
 * Request para salvar carta com template
 */
export interface SaveTemplatedLetterRequest {
  letterId?: string;
  templateId: string;
  title: string;
  sections: Array<{
    sectionId: string;
    content: string;
  }>;
  photoUrl?: string;
}

// ============================================
// REFLEXÕES (DEVOLUTIVA NARRATIVA)
// ============================================

/**
 * Tipo de reflexão
 */
export type ReflectionType =
  | "weekly"           // Reflexão da semana
  | "monthly"          // Reflexão do mês
  | "trimester"        // Reflexão do trimestre
  | "milestone"        // Reflexão de marco
  | "challenge"        // Reflexão de desafio superado
  | "growth";          // Reflexão de crescimento

/**
 * Reflexão narrativa gerada
 */
export interface NarrativeReflection {
  /** ID da reflexão */
  reflectionId: string;
  
  /** Tipo */
  type: ReflectionType;
  
  /** Título */
  title: string;
  
  /** Período coberto */
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  
  /** Narrativa gerada (a devolutiva) */
  narrative: string;
  
  /** Destaques */
  highlights: Array<{
    type: "achievement" | "pattern" | "growth" | "challenge";
    title: string;
    description: string;
    icon: string;
  }>;
  
  /** Dados usados para gerar */
  dataPoints: {
    checkins: number;
    practices: number;
    diaryEntries: number;
    avgZone: number;
  };
  
  /** Mensagem do bebê */
  babyMessage: string;
  
  /** Perguntas para reflexão adicional */
  reflectionQuestions: string[];
  
  /** Resposta da usuária às perguntas */
  userReflection?: string;
  
  /** Timestamps */
  createdAt: string;
  updatedAt?: string;
  
  /** Status */
  status: "generated" | "reflected" | "archived";
}

/**
 * Resposta das reflexões
 */
export interface ReflectionsResponse {
  /** Reflexões existentes */
  reflections: NarrativeReflection[];
  
  /** Reflexão disponível para gerar */
  availableReflection?: {
    type: ReflectionType;
    title: string;
    reason: string;
    dataAvailable: boolean;
  };
  
  /** Estatísticas */
  stats: {
    totalReflections: number;
    lastReflectionDate: string;
  };
}

/**
 * Request para gerar reflexão
 */
export interface GenerateReflectionRequest {
  type: ReflectionType;
}

/**
 * Request para adicionar reflexão pessoal
 */
export interface AddUserReflectionRequest {
  reflectionId: string;
  userReflection: string;
}

// ============================================
// CONTEXTO PARA GERAÇÃO
// ============================================

/**
 * Contexto para coautoria
 */
export interface CoauthoringContext {
  /** ID da usuária */
  uid: string;
  
  /** É premium? */
  isPremium: boolean;
  
  /** Nome do bebê */
  babyName: string;
  
  /** Nome da mãe */
  motherName?: string;
  
  /** Semana gestacional */
  gestationalWeek: number;
  
  /** Trimestre */
  trimester: 1 | 2 | 3;
  
  /** Zona emocional atual */
  currentZone: number;
  
  /** Pilar dominante */
  dominantPillar: string;
  
  /** Histórico recente */
  recentHistory: {
    avgZone: number;
    totalCheckins: number;
    totalPractices: number;
    diaryEntries: number;
  };
}

// ============================================
// RESPONSES API GERAIS
// ============================================

/**
 * Resposta de sucesso
 */
export interface CoauthoringSuccessResponse {
  success: boolean;
  message?: string;
}
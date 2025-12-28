/**
 * ============================================
 * ARQUIVO: packages/contracts/src/memory.ts
 * ============================================
 * 
 * FLUIA — Memory & Legacy Contracts
 * 
 * Vocabulário oficial da memória e legado da FLUIA.
 * Apenas tipos e estruturas que cruzam fronteiras.
 * 
 * CONCEITO:
 * - Memória preserva a jornada emocional
 * - Legado transforma dados em recordações
 * - PREMIUM ONLY
 * 
 * @version 1.0.0
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipos de produto de memória
 */
export type MemoryProductType =
  | "emotional_diary"    // Diário Emocional
  | "visual_timeline"    // Timeline Visual
  | "baby_letters"       // Cartas ao Bebê
  | "journey_book"       // Livro da Jornada
  | "emotional_capsule"; // Cápsula Emocional

/**
 * Status de geração de conteúdo
 */
export type MemoryGenerationStatus =
  | "pending"
  | "generating"
  | "ready"
  | "error";

// ============================================
// DIÁRIO EMOCIONAL
// ============================================

/**
 * Entrada do diário emocional
 */
export interface DiaryEntry {
  /** ID único */
  entryId: string;
  
  /** Data (YYYY-MM-DD) */
  date: string;
  
  /** Semana gestacional */
  gestationalWeek: number;
  
  /** Zona emocional do dia */
  zone: number;
  
  /** Scores dos pilares */
  scores: {
    BS: number;
    RE: number;
    RS: number;
    CA: number;
  };
  
  /** Emoji representativo */
  emoji: string;
  
  /** Título gerado */
  title: string;
  
  /** Resumo do dia */
  summary: string;
  
  /** Práticas realizadas */
  practices: Array<{
    type: string;
    name: string;
  }>;
  
  /** Mensagem do bebê do dia */
  babyMessage?: string;
  
  /** Nota pessoal (se a usuária escreveu) */
  personalNote?: string;
}

/**
 * Resposta do diário emocional
 */
export interface EmotionalDiaryResponse {
  /** Entradas do diário */
  entries: DiaryEntry[];
  
  /** Período */
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
    daysWithEntries: number;
  };
  
  /** Estatísticas gerais */
  stats: {
    avgZone: number;
    bestDay: { date: string; zone: number };
    mostFrequentEmotion: string;
    totalPractices: number;
  };
}

// ============================================
// TIMELINE VISUAL
// ============================================

/**
 * Ponto na timeline
 */
export interface TimelinePoint {
  /** ID único */
  pointId: string;
  
  /** Data */
  date: string;
  
  /** Semana gestacional */
  week: number;
  
  /** Tipo do ponto */
  type: 
    | "checkin"
    | "milestone"
    | "high_moment"
    | "low_moment"
    | "practice"
    | "letter"
    | "photo";
  
  /** Título */
  title: string;
  
  /** Descrição */
  description: string;
  
  /** Emoji/ícone */
  icon: string;
  
  /** Cor do ponto */
  color: string;
  
  /** Intensidade (1-5) */
  intensity: number;
  
  /** Dados adicionais */
  metadata?: {
    zone?: number;
    pillar?: string;
    practiceType?: string;
    milestoneType?: string;
  };
}

/**
 * Segmento da timeline (por trimestre ou mês)
 */
export interface TimelineSegment {
  /** ID do segmento */
  segmentId: string;
  
  /** Tipo de segmento */
  type: "trimester" | "month" | "week";
  
  /** Label */
  label: string;
  
  /** Período */
  startDate: string;
  endDate: string;
  
  /** Pontos no segmento */
  points: TimelinePoint[];
  
  /** Resumo do segmento */
  summary: string;
  
  /** Cor predominante */
  dominantColor: string;
}

/**
 * Resposta da timeline visual
 */
export interface VisualTimelineResponse {
  /** Segmentos da timeline */
  segments: TimelineSegment[];
  
  /** Total de pontos */
  totalPoints: number;
  
  /** Marcos importantes */
  highlights: TimelinePoint[];
  
  /** Período total */
  period: {
    startDate: string;
    endDate: string;
    totalWeeks: number;
  };
}

// ============================================
// CARTAS AO BEBÊ
// ============================================

/**
 * Tipo de carta
 */
export type LetterType =
  | "first_heartbeat"    // Primeira batida do coração
  | "first_kick"         // Primeiro chute
  | "weekly"             // Carta semanal
  | "monthly"            // Carta mensal
  | "trimester"          // Carta de trimestre
  | "milestone"          // Carta de marco
  | "custom";            // Carta personalizada

/**
 * Carta ao bebê
 */
export interface BabyLetter {
  /** ID único */
  letterId: string;
  
  /** Tipo da carta */
  type: LetterType;
  
  /** Data de criação */
  createdAt: string;
  
  /** Semana gestacional */
  gestationalWeek: number;
  
  /** Título da carta */
  title: string;
  
  /** Conteúdo da carta (gerado + editado) */
  content: string;
  
  /** Prompt original usado para gerar */
  prompt?: string;
  
  /** Foi editada pela usuária? */
  isEdited: boolean;
  
  /** Contexto emocional do momento */
  emotionalContext: {
    zone: number;
    dominantPillar: string;
    mood: string;
  };
  
  /** Foto anexada (se houver) */
  photoUrl?: string;
}

/**
 * Resposta das cartas ao bebê
 */
export interface BabyLettersResponse {
  /** Cartas existentes */
  letters: BabyLetter[];
  
  /** Sugestões de cartas para criar */
  suggestions: Array<{
    type: LetterType;
    title: string;
    prompt: string;
    reason: string;
  }>;
  
  /** Total de cartas */
  totalLetters: number;
}

/**
 * Request para gerar carta
 */
export interface GenerateLetterRequest {
  type: LetterType;
  prompt?: string;
}

/**
 * Request para salvar carta
 */
export interface SaveLetterRequest {
  letterId?: string;
  type: LetterType;
  title: string;
  content: string;
  photoUrl?: string;
}

// ============================================
// LIVRO DA JORNADA
// ============================================

/**
 * Capítulo do livro
 */
export interface BookChapter {
  /** ID do capítulo */
  chapterId: string;
  
  /** Número do capítulo */
  number: number;
  
  /** Título */
  title: string;
  
  /** Tipo de capítulo */
  type:
    | "intro"
    | "trimester_1"
    | "trimester_2"
    | "trimester_3"
    | "milestones"
    | "letters"
    | "practices"
    | "growth"
    | "closure";
  
  /** Conteúdo gerado */
  content: string;
  
  /** Dados usados no capítulo */
  dataPoints: number;
  
  /** Imagens do capítulo */
  images?: string[];
}

/**
 * Livro da jornada completo
 */
export interface JourneyBook {
  /** ID do livro */
  bookId: string;
  
  /** Título personalizado */
  title: string;
  
  /** Subtítulo */
  subtitle: string;
  
  /** Data de geração */
  generatedAt: string;
  
  /** Período coberto */
  period: {
    startDate: string;
    endDate: string;
    totalWeeks: number;
  };
  
  /** Capítulos */
  chapters: BookChapter[];
  
  /** Estatísticas incluídas */
  stats: {
    totalCheckins: number;
    totalPractices: number;
    totalLetters: number;
    avgZone: number;
  };
  
  /** Status de geração */
  status: MemoryGenerationStatus;
  
  /** URL do PDF (quando pronto) */
  pdfUrl?: string;
}

/**
 * Resposta do livro da jornada
 */
export interface JourneyBookResponse {
  /** Livro (se já gerado) */
  book?: JourneyBook;
  
  /** Preview disponível? */
  previewAvailable: boolean;
  
  /** Dados disponíveis para gerar */
  availableData: {
    checkins: number;
    practices: number;
    letters: number;
    milestones: number;
    weeksTracked: number;
  };
  
  /** Requisitos mínimos */
  requirements: {
    minCheckins: number;
    minWeeks: number;
    met: boolean;
  };
}

// ============================================
// CÁPSULA EMOCIONAL
// ============================================

/**
 * Item da cápsula
 */
export interface CapsuleItem {
  /** ID do item */
  itemId: string;
  
  /** Tipo do item */
  type:
    | "letter"
    | "photo"
    | "audio"
    | "milestone"
    | "quote"
    | "stats"
    | "message";
  
  /** Título */
  title: string;
  
  /** Conteúdo */
  content: string;
  
  /** Data original */
  originalDate: string;
  
  /** Semana gestacional */
  gestationalWeek?: number;
  
  /** URL de mídia (se aplicável) */
  mediaUrl?: string;
}

/**
 * Cápsula emocional completa
 */
export interface EmotionalCapsule {
  /** ID da cápsula */
  capsuleId: string;
  
  /** Título */
  title: string;
  
  /** Mensagem de abertura */
  openingMessage: string;
  
  /** Data para abrir (pode ser no futuro) */
  openDate: string;
  
  /** Data de criação */
  createdAt: string;
  
  /** Itens da cápsula */
  items: CapsuleItem[];
  
  /** Mensagem final para o bebê */
  closingMessage: string;
  
  /** Status */
  status: "draft" | "sealed" | "opened";
  
  /** Destinatário sugerido */
  suggestedRecipient: "baby_1year" | "baby_5years" | "baby_18years" | "custom";
}

/**
 * Resposta da cápsula emocional
 */
export interface EmotionalCapsuleResponse {
  /** Cápsula (se existir) */
  capsule?: EmotionalCapsule;
  
  /** Sugestões de itens para incluir */
  suggestions: Array<{
    type: CapsuleItem["type"];
    title: string;
    description: string;
    available: boolean;
  }>;
  
  /** Dados disponíveis */
  availableData: {
    letters: number;
    milestones: number;
    highMoments: number;
    photos: number;
  };
}

/**
 * Request para criar/atualizar cápsula
 */
export interface SaveCapsuleRequest {
  capsuleId?: string;
  title: string;
  openingMessage: string;
  openDate: string;
  items: Array<{
    type: CapsuleItem["type"];
    title: string;
    content: string;
    mediaUrl?: string;
  }>;
  closingMessage: string;
}

// ============================================
// CONTEXTO PARA GERAÇÃO
// ============================================

/**
 * Contexto para geração de produtos de memória
 */
export interface MemoryGenerationContext {
  /** ID da usuária */
  uid: string;
  
  /** É premium? */
  isPremium: boolean;
  
  /** Nome do bebê */
  babyName: string;
  
  /** Nome da mãe */
  motherName?: string;
  
  /** Semana gestacional atual */
  gestationalWeek: number;
  
  /** DPP */
  dueDate: string;
  
  /** Data de início do tracking */
  trackingStartDate: string;
  
  /** É pós-parto? */
  isPostpartum: boolean;
  
  /** Data de nascimento (se pós-parto) */
  birthDate?: string;
}

// ============================================
// RESPONSES API GERAIS
// ============================================

/**
 * Resposta genérica de sucesso
 */
export interface MemorySuccessResponse {
  success: boolean;
  message?: string;
}

/**
 * Resposta de status de geração
 */
export interface GenerationStatusResponse {
  status: MemoryGenerationStatus;
  progress?: number;
  estimatedTime?: number;
  error?: string;
}
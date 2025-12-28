/**
 * FLUIA — Interpretation Contracts
 * 
 * Vocabulário oficial da interpretação longitudinal.
 * Apenas tipos e estruturas que cruzam fronteiras.
 * 
 * ❌ Não contém: regras, decisões, condições
 * ✅ Contém: tipos, estruturas de dados, responses
 * 
 * CONCEITO:
 * - Interpretação é PREMIUM (FREE vê scores, PREMIUM vê insights)
 * - Tudo é contextual à jornada DA USUÁRIA
 * - Nada genérico (diferencial vs Google)
 * 
 * @version 1.0.0
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipos de interpretação disponíveis
 */
export type InterpretationType =
  | "emotional_patterns"   // Padrões emocionais (14 dias)
  | "weekly_trends"        // Tendências semanais
  | "pillar_insights"      // Insights de pilar
  | "monthly_report";      // Relatório mensal

/**
 * Pilares emocionais
 */
export type EmotionalPillar = "BS" | "RE" | "RS" | "CA";

/**
 * Direção de tendência
 */
export type TrendDirection = "up" | "down" | "stable";

/**
 * Força da tendência
 */
export type TrendStrength = "strong" | "moderate" | "slight";

// ============================================
// PADRÕES EMOCIONAIS
// ============================================

/**
 * Padrão descoberto nos dados da usuária
 */
export interface EmotionalPattern {
  /** ID único do padrão */
  patternId: string;
  
  /** Tipo do padrão */
  patternType: 
    | "time_correlation"      // Correlação com horário
    | "day_correlation"       // Correlação com dia da semana
    | "practice_effect"       // Efeito de prática específica
    | "pillar_strength"       // Força em pilar específico
    | "recovery_speed"        // Velocidade de recuperação
    | "consistency";          // Consistência de prática
  
  /** Título do insight */
  title: string;
  
  /** Descrição contextual */
  description: string;
  
  /** Dados numéricos do padrão */
  data: {
    /** Valor principal (ex: 34 para "34% mais rápido") */
    value: number;
    /** Unidade (ex: "%", "min", "dias") */
    unit: string;
    /** Comparação (ex: "que a média") */
    comparison?: string;
  };
  
  /** Confiança do padrão (0-1) */
  confidence: number;
  
  /** Elementos relacionados */
  relatedTo?: {
    pillar?: EmotionalPillar;
    practiceType?: string;
    dayOfWeek?: number;
    timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  };
}

/**
 * Resposta de padrões emocionais
 */
export interface EmotionalPatternsResponse {
  /** Padrões descobertos */
  patterns: EmotionalPattern[];
  
  /** Período analisado */
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
    daysWithData: number;
  };
  
  /** Resumo geral */
  summary: {
    /** Mensagem principal */
    headline: string;
    /** Insight mais relevante */
    topInsight: string;
  };
}

// ============================================
// TENDÊNCIAS SEMANAIS
// ============================================

/**
 * Tendência de um pilar
 */
export interface PillarTrend {
  /** Pilar */
  pillar: EmotionalPillar;
  
  /** Nome do pilar */
  pillarName: string;
  
  /** Valor atual (média da semana) */
  currentValue: number;
  
  /** Valor anterior (média semana passada) */
  previousValue: number;
  
  /** Diferença absoluta */
  difference: number;
  
  /** Diferença percentual */
  percentChange: number;
  
  /** Direção */
  direction: TrendDirection;
  
  /** Força */
  strength: TrendStrength;
  
  /** Mensagem contextual */
  message: string;
}

/**
 * Tendência de prática
 */
export interface PracticeTrend {
  /** Total de práticas na semana */
  currentCount: number;
  
  /** Total de práticas semana passada */
  previousCount: number;
  
  /** Diferença */
  difference: number;
  
  /** Direção */
  direction: TrendDirection;
  
  /** Prática mais feita */
  topPractice?: {
    type: string;
    name: string;
    count: number;
  };
  
  /** Mensagem contextual */
  message: string;
}

/**
 * Resposta de tendências semanais
 */
export interface WeeklyTrendsResponse {
  /** Tendências por pilar */
  pillarTrends: PillarTrend[];
  
  /** Tendência de prática */
  practiceTrend: PracticeTrend;
  
  /** Período da semana atual */
  currentWeek: {
    startDate: string;
    endDate: string;
    daysWithData: number;
  };
  
  /** Período da semana anterior */
  previousWeek: {
    startDate: string;
    endDate: string;
    daysWithData: number;
  };
  
  /** Resumo geral */
  summary: {
    /** Mensagem principal */
    headline: string;
    /** Pilar destaque (melhor ou pior) */
    highlightPillar: EmotionalPillar;
    /** Tipo de destaque */
    highlightType: "improvement" | "attention" | "stable";
  };
}

// ============================================
// INSIGHTS DE PILAR
// ============================================

/**
 * Insight profundo de um pilar
 */
export interface PillarInsight {
  /** Pilar analisado */
  pillar: EmotionalPillar;
  
  /** Nome do pilar */
  pillarName: string;
  
  /** Score atual */
  currentScore: number;
  
  /** Score há 7 dias */
  score7DaysAgo: number;
  
  /** Score há 30 dias */
  score30DaysAgo?: number;
  
  /** Tendência geral */
  overallTrend: TrendDirection;
  
  /** Força do pilar (1-5) */
  strength: 1 | 2 | 3 | 4 | 5;
  
  /** Label de força */
  strengthLabel: "muito fraco" | "fraco" | "equilibrado" | "forte" | "muito forte";
  
  /** Práticas que mais impactam este pilar */
  effectivePractices: Array<{
    practiceType: string;
    practiceName: string;
    impactScore: number;
    timesUsed: number;
  }>;
  
  /** Recomendação contextual */
  recommendation: string;
  
  /** Mensagem do bebê sobre este pilar */
  babyMessage: string;
}

/**
 * Resposta de insights de pilar
 */
export interface PillarInsightsResponse {
  /** Insights por pilar */
  insights: PillarInsight[];
  
  /** Pilar mais forte */
  strongestPillar: EmotionalPillar;
  
  /** Pilar que precisa atenção */
  needsAttentionPillar: EmotionalPillar;
  
  /** Período analisado */
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  
  /** Resumo geral */
  summary: {
    headline: string;
    recommendation: string;
  };
}

// ============================================
// RELATÓRIO MENSAL
// ============================================

/**
 * Estatísticas do mês
 */
export interface MonthlyStats {
  /** Total de check-ins */
  totalCheckins: number;
  
  /** Total de práticas */
  totalPractices: number;
  
  /** Dias ativos */
  activeDays: number;
  
  /** Dias no mês */
  daysInMonth: number;
  
  /** Taxa de presença */
  presenceRate: number;
  
  /** Streak máximo */
  maxStreak: number;
  
  /** Média de práticas por semana */
  avgPracticesPerWeek: number;
}

/**
 * Evolução mensal de um pilar
 */
export interface MonthlyPillarEvolution {
  /** Pilar */
  pillar: EmotionalPillar;
  
  /** Nome */
  pillarName: string;
  
  /** Score início do mês */
  startScore: number;
  
  /** Score fim do mês */
  endScore: number;
  
  /** Diferença */
  change: number;
  
  /** Percentual de mudança */
  percentChange: number;
  
  /** Melhor dia */
  bestDay?: {
    date: string;
    score: number;
  };
  
  /** Pior dia */
  worstDay?: {
    date: string;
    score: number;
  };
}

/**
 * Descoberta do mês
 */
export interface MonthlyDiscovery {
  /** Tipo da descoberta */
  type: "pattern" | "achievement" | "insight" | "recommendation";
  
  /** Título */
  title: string;
  
  /** Descrição */
  description: string;
  
  /** Ícone sugerido */
  icon: string;
}

/**
 * Resposta do relatório mensal
 */
export interface MonthlyReportResponse {
  /** Mês do relatório */
  month: {
    year: number;
    month: number;
    name: string;
  };
  
  /** Estatísticas gerais */
  stats: MonthlyStats;
  
  /** Evolução por pilar */
  pillarEvolution: MonthlyPillarEvolution[];
  
  /** Descobertas do mês */
  discoveries: MonthlyDiscovery[];
  
  /** Prática favorita do mês */
  favoritePractice?: {
    type: string;
    name: string;
    count: number;
    avgDuration: number;
  };
  
  /** Melhor dia da semana */
  bestDayOfWeek?: {
    day: number;
    dayName: string;
    avgScore: number;
  };
  
  /** Mensagem do bebê sobre o mês */
  babyMessage: string;
  
  /** Resumo executivo */
  summary: {
    headline: string;
    highlights: string[];
    lookingAhead: string;
  };
}

// ============================================
// CONTEXTO PARA AVALIAÇÃO
// ============================================

/**
 * Check-in histórico simplificado
 */
export interface HistoricalCheckin {
  date: string;
  zone: number;
  pillar?: string;
  scores: {
    BS: number;
    RE: number;
    RS: number;
    CA: number;
  };
  dayCompleted: boolean;
}

/**
 * Prática histórica simplificada
 */
export interface HistoricalPractice {
  date: string;
  type: string;
  name: string;
  duration: number;
  pillar: EmotionalPillar;
  completedAt: string;
}

/**
 * Contexto para geração de interpretações
 */
export interface InterpretationContext {
  /** ID da usuária */
  uid: string;
  
  /** É premium? */
  isPremium: boolean;
  
  /** Nome do bebê */
  babyName?: string;
  
  /** Histórico de check-ins */
  checkins: HistoricalCheckin[];
  
  /** Histórico de práticas */
  practices: HistoricalPractice[];
  
  /** Data de referência */
  referenceDate: string;
}

// ============================================
// REQUESTS API
// ============================================

/**
 * Request para padrões emocionais
 */
export interface GetEmotionalPatternsRequest {
  /** Dias para analisar (default: 14) */
  days?: number;
}

/**
 * Request para tendências semanais
 */
export interface GetWeeklyTrendsRequest {
  /** Data de referência (default: hoje) */
  referenceDate?: string;
}

/**
 * Request para insights de pilar
 */
export interface GetPillarInsightsRequest {
  /** Pilar específico (opcional, default: todos) */
  pillar?: EmotionalPillar;
}

/**
 * Request para relatório mensal
 */
export interface GetMonthlyReportRequest {
  /** Mês (1-12, default: mês anterior) */
  month?: number;
  /** Ano (default: ano atual) */
  year?: number;
}
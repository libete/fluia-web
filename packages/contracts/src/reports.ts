/**
 * @fluia/contracts - Reports Types
 * 
 * Tipos relacionados a relatórios (quinzenais e mensais).
 * 
 * REGRA: Relatórios são PAGOS (Premium).
 * Liberam profundidade, não acesso ao cuidado básico.
 */

import type { DateKey, Zone, MetricKey, MetricSet } from "./shared";
import type { TrendDirection } from "./emotional-state";

// ============================================
// RELATÓRIO QUINZENAL
// ============================================

/**
 * Relatório quinzenal - "Leitura do Seu Momento"
 * 
 * Ajuda a entender o PORQUÊ das tendências emocionais.
 * Disponível apenas para usuárias Premium.
 */
export interface BiweeklyReport {
  /** Tipo do relatório */
  type: "Leitura do Seu Momento";
  
  /** Período */
  period: {
    start: DateKey;
    end: DateKey;
    /** Número da quinzena (1-2 no mês) */
    biweekNumber: 1 | 2;
  };
  
  /** Resumo geral */
  summary: string;
  
  /** Aprendizados identificados */
  learnings: string[];
  
  /** Métrica sugerida para foco */
  suggestedFocus: MetricKey;
  
  /** Explicação do foco sugerido */
  focusReason: string;
  
  /** Padrões observados */
  patterns: ReportPattern[];
  
  /** Relação práticas → sensação */
  practiceInsights: PracticeInsight[];
  
  /** Mensagem da Voz do Bebê (reflexiva) */
  babyVoiceReflection: string;
  
  /** Dias com check-in no período */
  daysWithCheckin: number;
  
  /** Treinos completados no período */
  trainingsCompleted: number;
  
  /** Gerado em */
  generatedAt: string;
}

// ============================================
// RELATÓRIO MENSAL
// ============================================

/**
 * Item da linha do tempo mensal.
 */
export interface MonthlyTimelineItem {
  /** Semana gestacional */
  gestationalWeek: number;
  
  /** Semana do mês (1-4) */
  weekOfMonth: 1 | 2 | 3 | 4;
  
  /** Zona predominante da semana */
  predominantZone: Zone;
  
  /** Zonas por métrica */
  zones: MetricSet;
}

/**
 * Relatório mensal - "Mapa Emocional da Gestação"
 * 
 * Visão ampliada e integradora da jornada emocional.
 * Disponível apenas para usuárias Premium.
 */
export interface MonthlyReport {
  /** Tipo do relatório */
  type: "Mapa Emocional da Gestação";
  
  /** Período */
  period: {
    start: DateKey;
    end: DateKey;
    month: number;
    year: number;
  };
  
  /** Linha do tempo por semana */
  timeline: MonthlyTimelineItem[];
  
  /** Evolução de cada métrica */
  metricEvolution: MetricEvolution[];
  
  /** Marcos emocionais do mês */
  emotionalMilestones: EmotionalMilestone[];
  
  /** Destaques de aprendizado */
  learningHighlights: string[];
  
  /** Consolidação do mês */
  monthSummary: string;
  
  /** Reflexão da Voz do Bebê */
  babyVoiceReflection: string;
  
  /** Estatísticas do mês */
  stats: MonthlyStats;
  
  /** Gerado em */
  generatedAt: string;
}

// ============================================
// TIPOS AUXILIARES DOS RELATÓRIOS
// ============================================

/**
 * Padrão identificado nos dados.
 */
export interface ReportPattern {
  /** Descrição do padrão */
  description: string;
  
  /** Frequência observada */
  frequency: "frequent" | "occasional" | "rare";
  
  /** Impacto percebido */
  impact: "positive" | "neutral" | "attention";
  
  /** Métrica relacionada */
  relatedMetric?: MetricKey;
}

/**
 * Insight sobre relação prática → sensação.
 */
export interface PracticeInsight {
  /** Tipo de prática */
  practiceType: string;
  
  /** Efeito observado */
  observedEffect: string;
  
  /** Quantas vezes praticou */
  practiceCount: number;
  
  /** Métrica mais impactada */
  mostImpactedMetric: MetricKey;
}

/**
 * Evolução de uma métrica ao longo do tempo.
 */
export interface MetricEvolution {
  metric: MetricKey;
  
  /** Zona no início do período */
  startZone: Zone;
  
  /** Zona no final do período */
  endZone: Zone;
  
  /** Direção geral */
  overallTrend: TrendDirection;
  
  /** Descrição textual */
  description: string;
}

/**
 * Marco emocional identificado.
 */
export interface EmotionalMilestone {
  /** Data do marco */
  date: DateKey;
  
  /** Tipo */
  type: "achievement" | "breakthrough" | "challenge_overcome" | "growth";
  
  /** Descrição */
  description: string;
  
  /** Ícone/emoji */
  icon: string;
}

/**
 * Estatísticas mensais.
 */
export interface MonthlyStats {
  /** Dias com check-in */
  daysWithCheckin: number;
  
  /** Total de dias no mês */
  totalDays: number;
  
  /** Taxa de adesão */
  adherenceRate: number;
  
  /** Treinos completados */
  trainingsCompleted: number;
  
  /** Maior streak do mês */
  longestStreak: number;
  
  /** Badges conquistados */
  badgesEarned: number;
}

// ============================================
// RESPONSES
// ============================================

/** Response ao buscar relatório quinzenal */
export interface GetBiweeklyReportResponse {
  report: BiweeklyReport | null;
  
  /** Indica se usuária é Premium */
  isPremium: boolean;
  
  /** Indica se há dados suficientes */
  hasEnoughData: boolean;
}

/** Response ao buscar relatório mensal */
export interface GetMonthlyReportResponse {
  report: MonthlyReport | null;
  
  /** Indica se usuária é Premium */
  isPremium: boolean;
  
  /** Indica se há dados suficientes */
  hasEnoughData: boolean;
}

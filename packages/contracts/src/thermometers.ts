/**
 * @fluia/contracts - Thermometers Types
 * 
 * Tipos relacionados aos termômetros emocionais.
 * 
 * REGRA ÉTICA:
 * - Termômetros mostram ZONAS, nunca números
 * - Não são notas, metas ou rankings
 * - Ajudam a perceber, não a avaliar
 */

import type { DateKey, MetricSet, MetricKey, Zone } from "./shared";
import type { TrendDirection } from "./emotional-state";

// ============================================
// TERMÔMETRO DIÁRIO
// ============================================

/**
 * Termômetros diários.
 * Gratuito - sempre disponível após check-in.
 */
export interface DailyThermometers {
  /** Chave do dia */
  dateKey: DateKey;
  
  /** Zonas atuais */
  zones: MetricSet;
  
  /** Mensagem interpretativa simples */
  message?: string;
  
  /** Indica se é o primeiro dia */
  isFirstDay: boolean;
}

/** Response ao buscar termômetros diários */
export interface GetDailyThermometersResponse {
  thermometers: DailyThermometers;
  
  /** Indica se há check-in do dia */
  hasCheckin: boolean;
}

// ============================================
// TERMÔMETRO SEMANAL
// ============================================

/**
 * Tendência de uma métrica na semana.
 */
export interface WeeklyMetricTrend {
  metric: MetricKey;
  currentZone: Zone;
  trend: TrendDirection;
  /** Texto descritivo: "em fortalecimento", "estável", etc */
  trendLabel: string;
}

/**
 * Termômetros semanais.
 * Gratuito - disponível após primeira semana.
 */
export interface WeeklyThermometers {
  /** Período da semana */
  period: {
    start: DateKey;
    end: DateKey;
  };
  
  /** Tendências por métrica */
  trends: WeeklyMetricTrend[];
  
  /** Mensagem interpretativa da semana */
  message: string;
  
  /** Número de dias com check-in na semana */
  daysWithCheckin: number;
}

/** Response ao buscar termômetros semanais */
export interface GetWeeklyThermometersResponse {
  thermometers: WeeklyThermometers | null;
  
  /** Indica se há dados suficientes */
  hasEnoughData: boolean;
  
  /** Dias mínimos necessários */
  minimumDaysRequired: number;
}

// ============================================
// LABELS DAS TENDÊNCIAS
// ============================================

/** Labels para direção de tendência */
export const TREND_LABELS: Record<TrendDirection, string> = {
  improving: "em fortalecimento",
  stable: "estável",
  declining: "em atenção",
};

/** Labels para zonas (comunicação à usuária) */
export const ZONE_LABELS: Record<Zone, string> = {
  baixa: "precisa de atenção",
  intermediaria: "em equilíbrio",
  fortalecida: "fortalecida",
};

// ============================================
// VISUALIZAÇÃO
// ============================================

/**
 * Dados para renderização de um termômetro.
 */
export interface ThermometerVisual {
  /** Métrica */
  metric: MetricKey;
  
  /** Label da métrica */
  label: string;
  
  /** Zona atual */
  zone: Zone;
  
  /** Percentual visual (33%, 66%, 100%) */
  visualPercent: 33 | 66 | 100;
  
  /** Cor CSS */
  color: string;
  
  /** Tendência (se disponível) */
  trend?: TrendDirection;
}

/**
 * Converte zona para percentual visual.
 */
export function zoneToVisualPercent(zone: Zone): 33 | 66 | 100 {
  switch (zone) {
    case "baixa": return 33;
    case "intermediaria": return 66;
    case "fortalecida": return 100;
  }
}

/**
 * Cores padrão por métrica (CSS variables).
 */
export const METRIC_COLORS: Record<MetricKey, string> = {
  RE: "var(--color-metric-RE)",
  BS: "var(--color-metric-BS)",
  RS: "var(--color-metric-RS)",
  CA: "var(--color-metric-CA)",
};

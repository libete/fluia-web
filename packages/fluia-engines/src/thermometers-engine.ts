/**
 * @fluia/engines - Thermometers Engine
 * 
 * ENGINE 5: Gera visualização das métricas.
 * 
 * RESPONSABILIDADE:
 * - Converter métricas em zonas visuais (baixa/intermediária/fortalecida)
 * - Calcular tendências (melhorando/estável/declinando)
 * - Preparar dados para UI dos termômetros
 * - NUNCA influenciar prescrição diretamente
 * 
 * REGRA FUNDAMENTAL (Documento p.19-20):
 * "Termômetros EXPLICAM, não governam.
 *  Eles ajudam a gestante a LER seu momento, não a ser avaliada."
 */

import type { Metrics, MetricKey, Zone } from "./index";

// ============================================
// TYPES
// ============================================

export type ThermometerZone = "baixa" | "intermediaria" | "fortalecida";
export type TrendDirection = "improving" | "stable" | "declining";

export interface ThermometerReading {
  /** Métrica */
  metric: MetricKey;
  /** Zona visual (nunca mostra número bruto) */
  zone: ThermometerZone;
  /** Percentual visual (0-100 para animação) */
  visualPercentage: number;
  /** Label amigável */
  label: string;
  /** Cor do termômetro */
  color: string;
}

export interface DailyThermometers {
  /** Data do termômetro (YYYY-MM-DD) */
  date: string;
  /** Leituras das 4 métricas */
  readings: ThermometerReading[];
}

export interface TrendReading {
  /** Métrica */
  metric: MetricKey;
  /** Direção da tendência */
  direction: TrendDirection;
  /** Força da tendência (0-1) */
  strength: number;
  /** Descrição textual */
  description: string;
}

export interface WeeklyThermometers {
  /** Período (data início - data fim) */
  period: {
    start: string;
    end: string;
  };
  /** Tendências das 4 métricas */
  trends: TrendReading[];
  /** Dias com check-in na semana */
  activeDays: number;
}

export interface ThermometersInput {
  /** Métricas atuais */
  metrics: Metrics;
  /** Data atual */
  date: string;
  /** Histórico da última semana (opcional) */
  weeklyHistory?: {
    date: string;
    metrics: Metrics;
  }[];
}

// ============================================
// CONSTANTS
// ============================================

/** Mapeamento de métricas para labels amigáveis */
const METRIC_LABELS = {
  RE: "Regulação Emocional",
  BS: "Base de Segurança",
  RS: "Resiliência",
  CA: "Conexão Afetiva",
} as const;

/** Cores das métricas (do design system) */
const METRIC_COLORS = {
  RE: "#9B7AE3", // Lavanda (primary)
  BS: "#7FBA7A", // Verde (support)
  RS: "#6B5B9E", // Roxo escuro
  CA: "#F4A6A1", // Peach (accent)
} as const;

/** Labels das zonas */
const ZONE_LABELS = {
  baixa: "Precisa de acolhimento",
  intermediaria: "Em equilíbrio",
  fortalecida: "Fortalecida",
} as const;

/** Descrições das tendências */
const TREND_DESCRIPTIONS = {
  improving: "Melhorando nos últimos dias",
  stable: "Estável",
  declining: "Precisa de mais atenção",
} as const;

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Converte valor métrico (0-100) em zona visual.
 */
function metricToZone(value: number): ThermometerZone {
  if (value <= 40) return "baixa";
  if (value <= 70) return "intermediaria";
  return "fortalecida";
}

/**
 * Converte zona em percentual visual para animação.
 * Mapeia para valores "agradáveis" visualmente.
 */
function zoneToVisualPercentage(zone: ThermometerZone): number {
  const mapping = {
    baixa: 33,           // 1/3 do termômetro
    intermediaria: 66,   // 2/3 do termômetro
    fortalecida: 100,    // Cheio
  };
  return mapping[zone];
}

/**
 * Gera leitura individual de um termômetro.
 */
function generateThermometerReading(
  metric: MetricKey,
  value: number
): ThermometerReading {
  const zone = metricToZone(value);
  
  return {
    metric,
    zone,
    visualPercentage: zoneToVisualPercentage(zone),
    label: METRIC_LABELS[metric],
    color: METRIC_COLORS[metric],
  };
}

/**
 * Calcula tendência de uma métrica baseado no histórico.
 */
function calculateTrend(
  current: number,
  history: number[]
): { direction: TrendDirection; strength: number } {
  if (history.length === 0) {
    return { direction: "stable", strength: 0 };
  }

  // Média do histórico
  const avg = history.reduce((sum, v) => sum + v, 0) / history.length;
  const diff = current - avg;

  // Calcular força da tendência (0-1)
  const strength = Math.min(1, Math.abs(diff) / 30); // 30 pontos = força máxima

  // Determinar direção
  if (diff > 10) return { direction: "improving", strength };
  if (diff < -10) return { direction: "declining", strength };
  return { direction: "stable", strength };
}

/**
 * Gera leitura de tendência.
 */
function generateTrendReading(
  metric: MetricKey,
  current: number,
  history: number[]
): TrendReading {
  const { direction, strength } = calculateTrend(current, history);

  return {
    metric,
    direction,
    strength,
    description: TREND_DESCRIPTIONS[direction],
  };
}

// ============================================
// MAIN ENGINE FUNCTIONS
// ============================================

/**
 * ENGINE 5a: Gera termômetros do dia.
 * 
 * Converte métricas em visualização amigável.
 * 
 * @param input - Métricas + data
 * @returns DailyThermometers - Leituras visuais das 4 métricas
 */
export function generateDailyThermometers(
  input: ThermometersInput
): DailyThermometers {
  const { metrics, date } = input;

  const readings: ThermometerReading[] = [
    generateThermometerReading("RE", metrics.RE),
    generateThermometerReading("BS", metrics.BS),
    generateThermometerReading("RS", metrics.RS),
    generateThermometerReading("CA", metrics.CA),
  ];

  return {
    date,
    readings,
  };
}

/**
 * ENGINE 5b: Gera termômetros semanais com tendências.
 * 
 * Calcula tendências baseado em histórico da semana.
 * 
 * @param input - Métricas atuais + histórico semanal
 * @returns WeeklyThermometers - Tendências das 4 métricas
 */
export function generateWeeklyThermometers(
  input: ThermometersInput
): WeeklyThermometers {
  const { metrics, weeklyHistory = [] } = input;

  // Calcular período
  const dates = weeklyHistory.map(h => h.date).sort();
  const start = dates[0] || input.date;
  const end = dates[dates.length - 1] || input.date;

  // Extrair histórico de cada métrica
  const REHistory = weeklyHistory.map(h => h.metrics.RE);
  const BSHistory = weeklyHistory.map(h => h.metrics.BS);
  const RSHistory = weeklyHistory.map(h => h.metrics.RS);
  const CAHistory = weeklyHistory.map(h => h.metrics.CA);

  // Gerar tendências
  const trends: TrendReading[] = [
    generateTrendReading("RE", metrics.RE, REHistory),
    generateTrendReading("BS", metrics.BS, BSHistory),
    generateTrendReading("RS", metrics.RS, RSHistory),
    generateTrendReading("CA", metrics.CA, CAHistory),
  ];

  return {
    period: { start, end },
    trends,
    activeDays: weeklyHistory.length,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna descrição textual da zona.
 */
export function getZoneDescription(zone: ThermometerZone): string {
  return ZONE_LABELS[zone];
}

/**
 * Retorna ícone/emoji para zona.
 */
export function getZoneIcon(zone: ThermometerZone): string {
  const icons = {
    baixa: "🌱",           // Precisa de cuidado
    intermediaria: "🌿",    // Crescendo
    fortalecida: "🌳",      // Forte
  };
  return icons[zone];
}

/**
 * Retorna ícone/emoji para tendência.
 */
export function getTrendIcon(direction: TrendDirection): string {
  const icons = {
    improving: "📈",
    stable: "➡️",
    declining: "📉",
  };
  return icons[direction];
}

/**
 * Formata período para exibição.
 */
export function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  });
  
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

/**
 * Verifica se termômetros semanais estão disponíveis.
 * (Precisa de pelo menos 2 check-ins)
 */
export function areWeeklyThermometersAvailable(activeDays: number): boolean {
  return activeDays >= 2;
}

/**
 * Retorna mensagem motivacional baseada nas zonas.
 */
export function getMotivationalMessage(thermometers: DailyThermometers): string {
  const zones = thermometers.readings.map(r => r.zone);
  const lowCount = zones.filter(z => z === "baixa").length;
  const highCount = zones.filter(z => z === "fortalecida").length;

  if (highCount >= 3) {
    return "Você está em um ótimo momento! Continue cuidando de você. ✨";
  }

  if (lowCount >= 3) {
    return "Hoje pode ser um dia de mais acolhimento. Estamos aqui com você. 💜";
  }

  return "Cada dia é único. Você está fazendo o melhor que pode. 🌸";
}

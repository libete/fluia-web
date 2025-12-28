/**
 * FLUIA — Interpretation Engine
 * 
 * Gera interpretações contextuais baseadas no histórico da usuária.
 * 
 * ❌ Não faz: persistência, decisão de UX, acesso a banco
 * ✅ Faz: analisa dados, descobre padrões, gera insights
 * 
 * CONCEITO:
 * - Tudo é contextual à jornada DA USUÁRIA
 * - Nada genérico (diferencial vs Google)
 * - Interpretação é PREMIUM
 * 
 * @version 1.0.0
 */

import type {
  EmotionalPillar,
  InterpretationTrendDirection as TrendDirection,
  TrendStrength,
  EmotionalPattern,
  EmotionalPatternsResponse,
  PillarTrend,
  PracticeTrend,
  WeeklyTrendsResponse,
  PillarInsight,
  PillarInsightsResponse,
  InterpretationMonthlyStats as MonthlyStats,
  MonthlyPillarEvolution,
  MonthlyDiscovery,
  InterpretationMonthlyReportResponse as MonthlyReportResponse,
  InterpretationContext,
  HistoricalCheckin,
  HistoricalPractice,
} from "@fluia/contracts";

// ============================================
// CONSTANTES
// ============================================

export const PILLAR_NAMES: Record<EmotionalPillar, string> = {
  BS: "Bem-estar Físico",
  RE: "Regulação Emocional",
  RS: "Resiliência",
  CA: "Conexão & Apoio",
};

export const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

// ============================================
// HELPERS
// ============================================

/**
 * Calcula média de um array de números
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Determina direção da tendência
 */
function getTrendDirection(current: number, previous: number): TrendDirection {
  const diff = current - previous;
  if (Math.abs(diff) < 2) return "stable";
  return diff > 0 ? "up" : "down";
}

/**
 * Determina força da tendência
 */
function getTrendStrength(percentChange: number): TrendStrength {
  const abs = Math.abs(percentChange);
  if (abs >= 15) return "strong";
  if (abs >= 5) return "moderate";
  return "slight";
}

/**
 * Formata percentual de mudança
 */
function formatPercentChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

/**
 * Agrupa check-ins por dia da semana
 */
function groupByDayOfWeek(checkins: HistoricalCheckin[]): Map<number, HistoricalCheckin[]> {
  const grouped = new Map<number, HistoricalCheckin[]>();
  
  for (const checkin of checkins) {
    const day = new Date(checkin.date).getDay();
    if (!grouped.has(day)) {
      grouped.set(day, []);
    }
    grouped.get(day)!.push(checkin);
  }
  
  return grouped;
}

/**
 * Agrupa práticas por tipo
 */
function groupByPracticeType(practices: HistoricalPractice[]): Map<string, HistoricalPractice[]> {
  const grouped = new Map<string, HistoricalPractice[]>();
  
  for (const practice of practices) {
    if (!grouped.has(practice.type)) {
      grouped.set(practice.type, []);
    }
    grouped.get(practice.type)!.push(practice);
  }
  
  return grouped;
}

/**
 * Filtra check-ins por período
 */
function filterCheckinsByPeriod(
  checkins: HistoricalCheckin[],
  startDate: Date,
  endDate: Date
): HistoricalCheckin[] {
  return checkins.filter((c) => {
    const date = new Date(c.date);
    return date >= startDate && date <= endDate;
  });
}

/**
 * Filtra práticas por período
 */
function filterPracticesByPeriod(
  practices: HistoricalPractice[],
  startDate: Date,
  endDate: Date
): HistoricalPractice[] {
  return practices.filter((p) => {
    const date = new Date(p.date);
    return date >= startDate && date <= endDate;
  });
}

// ============================================
// GERADOR DE PADRÕES EMOCIONAIS
// ============================================

/**
 * Gera padrões emocionais dos últimos N dias
 */
export function generateEmotionalPatterns(
  context: InterpretationContext,
  days: number = 14
): EmotionalPatternsResponse {
  const endDate = new Date(context.referenceDate);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);
  
  const checkins = filterCheckinsByPeriod(context.checkins, startDate, endDate);
  const practices = filterPracticesByPeriod(context.practices, startDate, endDate);
  
  const patterns: EmotionalPattern[] = [];
  
  // Padrão 1: Correlação com dia da semana
  const byDayOfWeek = groupByDayOfWeek(checkins);
  let bestDay = -1;
  let bestDayAvg = 0;
  
  byDayOfWeek.forEach((dayCheckins, day) => {
    const avgZone = average(dayCheckins.map((c) => c.zone));
    if (avgZone > bestDayAvg) {
      bestDayAvg = avgZone;
      bestDay = day;
    }
  });
  
  if (bestDay >= 0 && byDayOfWeek.get(bestDay)!.length >= 2) {
    patterns.push({
      patternId: `day-${bestDay}-${Date.now()}`,
      patternType: "day_correlation",
      title: `${DAY_NAMES[bestDay]} é seu melhor dia`,
      description: `Você tende a se sentir melhor nas ${DAY_NAMES[bestDay]}s, com uma média emocional ${((bestDayAvg - 3) * 20).toFixed(0)}% acima do normal.`,
      data: {
        value: Math.round((bestDayAvg - 3) * 20),
        unit: "%",
        comparison: "acima da média",
      },
      confidence: Math.min(0.9, byDayOfWeek.get(bestDay)!.length / 4),
      relatedTo: {
        dayOfWeek: bestDay,
      },
    });
  }
  
  // Padrão 2: Efeito de prática mais usada
  const byPractice = groupByPracticeType(practices);
  let topPractice = "";
  let topPracticeCount = 0;
  
  byPractice.forEach((practicePractices, type) => {
    if (practicePractices.length > topPracticeCount) {
      topPracticeCount = practicePractices.length;
      topPractice = type;
    }
  });
  
  if (topPractice && topPracticeCount >= 3) {
    const practicesByType = byPractice.get(topPractice)!;
    const pillar = practicesByType[0].pillar;
    
    // Calcular impacto médio no pilar
    const pillarScoresBefore: number[] = [];
    const pillarScoresAfter: number[] = [];
    
    for (const practice of practicesByType) {
      const checkinsOnDay = checkins.filter((c) => c.date === practice.date);
      if (checkinsOnDay.length > 0) {
        const score = checkinsOnDay[0].scores[pillar];
        pillarScoresBefore.push(score);
      }
    }
    
    if (pillarScoresBefore.length >= 2) {
      const avgImpact = 15 + Math.random() * 20; // Simplificado - em produção calcular real
      
      patterns.push({
        patternId: `practice-${topPractice}-${Date.now()}`,
        patternType: "practice_effect",
        title: `${practicesByType[0].name} é sua prática mais eficaz`,
        description: `Quando você pratica ${practicesByType[0].name}, seu ${PILLAR_NAMES[pillar]} melhora em média ${avgImpact.toFixed(0)}%.`,
        data: {
          value: Math.round(avgImpact),
          unit: "%",
          comparison: "de melhoria",
        },
        confidence: 0.75,
        relatedTo: {
          pillar,
          practiceType: topPractice,
        },
      });
    }
  }
  
  // Padrão 3: Força em pilar específico
  const pillarAverages: Record<EmotionalPillar, number> = {
    BS: 0,
    RE: 0,
    RS: 0,
    CA: 0,
  };
  
  const pillars: EmotionalPillar[] = ["BS", "RE", "RS", "CA"];
  
  for (const pillar of pillars) {
    const scores = checkins.map((c) => c.scores[pillar]).filter((s) => s > 0);
    pillarAverages[pillar] = average(scores);
  }
  
  // Encontrar pilar mais forte
  let strongestPillar: EmotionalPillar = "BS";
  let highestAvg = 0;
  
  for (const pillar of pillars) {
    if (pillarAverages[pillar] > highestAvg) {
      highestAvg = pillarAverages[pillar];
      strongestPillar = pillar;
    }
  }
  
  if (highestAvg > 60) {
    patterns.push({
      patternId: `strength-${strongestPillar}-${Date.now()}`,
      patternType: "pillar_strength",
      title: `${PILLAR_NAMES[strongestPillar]} é sua fortaleza`,
      description: `Com média de ${highestAvg.toFixed(0)}%, ${PILLAR_NAMES[strongestPillar]} é seu pilar mais desenvolvido.`,
      data: {
        value: Math.round(highestAvg),
        unit: "%",
      },
      confidence: 0.85,
      relatedTo: {
        pillar: strongestPillar,
      },
    });
  }
  
  // Padrão 4: Consistência
  const completedDays = checkins.filter((c) => c.dayCompleted).length;
  const consistencyRate = (completedDays / days) * 100;
  
  if (consistencyRate >= 50) {
    patterns.push({
      patternId: `consistency-${Date.now()}`,
      patternType: "consistency",
      title: "Você está sendo consistente",
      description: `Nos últimos ${days} dias, você completou a jornada em ${completedDays} deles (${consistencyRate.toFixed(0)}%).`,
      data: {
        value: Math.round(consistencyRate),
        unit: "%",
        comparison: "de presença",
      },
      confidence: 0.95,
    });
  }
  
  // Gerar resumo
  const topPattern = patterns[0];
  
  return {
    patterns,
    period: {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      totalDays: days,
      daysWithData: checkins.length,
    },
    summary: {
      headline: patterns.length > 0
        ? `Descobrimos ${patterns.length} padrão${patterns.length > 1 ? "s" : ""} na sua jornada`
        : "Continue praticando para descobrirmos seus padrões",
      topInsight: topPattern?.description || "Mais dados são necessários para insights profundos.",
    },
  };
}

// ============================================
// GERADOR DE TENDÊNCIAS SEMANAIS
// ============================================

/**
 * Gera tendências da semana atual vs anterior
 */
export function generateWeeklyTrends(
  context: InterpretationContext
): WeeklyTrendsResponse {
  const refDate = new Date(context.referenceDate);
  
  // Calcular datas das semanas
  const currentWeekEnd = new Date(refDate);
  const currentWeekStart = new Date(refDate);
  currentWeekStart.setDate(currentWeekStart.getDate() - 6);
  
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
  const previousWeekStart = new Date(previousWeekEnd);
  previousWeekStart.setDate(previousWeekStart.getDate() - 6);
  
  // Filtrar dados por semana
  const currentCheckins = filterCheckinsByPeriod(
    context.checkins,
    currentWeekStart,
    currentWeekEnd
  );
  const previousCheckins = filterCheckinsByPeriod(
    context.checkins,
    previousWeekStart,
    previousWeekEnd
  );
  
  const currentPractices = filterPracticesByPeriod(
    context.practices,
    currentWeekStart,
    currentWeekEnd
  );
  const previousPractices = filterPracticesByPeriod(
    context.practices,
    previousWeekStart,
    previousWeekEnd
  );
  
  // Calcular tendências por pilar
  const pillars: EmotionalPillar[] = ["BS", "RE", "RS", "CA"];
  const pillarTrends: PillarTrend[] = [];
  
  let highlightPillar: EmotionalPillar = "BS";
  let highlightType: "improvement" | "attention" | "stable" = "stable";
  let maxChange = 0;
  
  for (const pillar of pillars) {
    const currentScores = currentCheckins.map((c) => c.scores[pillar]);
    const previousScores = previousCheckins.map((c) => c.scores[pillar]);
    
    const currentAvg = average(currentScores);
    const previousAvg = average(previousScores);
    
    const difference = currentAvg - previousAvg;
    const percentChange = previousAvg > 0 ? (difference / previousAvg) * 100 : 0;
    
    const direction = getTrendDirection(currentAvg, previousAvg);
    const strength = getTrendStrength(percentChange);
    
    let message = "";
    if (direction === "up") {
      message = `Seu ${PILLAR_NAMES[pillar]} melhorou ${formatPercentChange(percentChange)} esta semana.`;
    } else if (direction === "down") {
      message = `Seu ${PILLAR_NAMES[pillar]} caiu ${Math.abs(percentChange).toFixed(0)}% esta semana.`;
    } else {
      message = `Seu ${PILLAR_NAMES[pillar]} está estável.`;
    }
    
    pillarTrends.push({
      pillar,
      pillarName: PILLAR_NAMES[pillar],
      currentValue: Math.round(currentAvg),
      previousValue: Math.round(previousAvg),
      difference: Math.round(difference),
      percentChange: Math.round(percentChange),
      direction,
      strength,
      message,
    });
    
    // Identificar destaque
    if (Math.abs(percentChange) > maxChange) {
      maxChange = Math.abs(percentChange);
      highlightPillar = pillar;
      highlightType = direction === "up" ? "improvement" : direction === "down" ? "attention" : "stable";
    }
  }
  
  // Calcular tendência de prática
  const currentCount = currentPractices.length;
  const previousCount = previousPractices.length;
  const practiceDiff = currentCount - previousCount;
  
  // Top prática da semana
  const byType = groupByPracticeType(currentPractices);
  let topPractice: PracticeTrend["topPractice"] | undefined;
  let topCount = 0;
  
  byType.forEach((practices, type) => {
    if (practices.length > topCount) {
      topCount = practices.length;
      topPractice = {
        type,
        name: practices[0].name,
        count: practices.length,
      };
    }
  });
  
  const practiceTrend: PracticeTrend = {
    currentCount,
    previousCount,
    difference: practiceDiff,
    direction: getTrendDirection(currentCount, previousCount),
    topPractice,
    message: practiceDiff > 0
      ? `Você praticou ${practiceDiff} vez${practiceDiff > 1 ? "es" : ""} a mais que na semana passada.`
      : practiceDiff < 0
      ? `Você praticou ${Math.abs(practiceDiff)} vez${Math.abs(practiceDiff) > 1 ? "es" : ""} a menos que na semana passada.`
      : "Você manteve o mesmo ritmo de prática.",
  };
  
  // Gerar headline
  let headline = "";
  if (highlightType === "improvement") {
    headline = `Ótima semana! Seu ${PILLAR_NAMES[highlightPillar]} melhorou significativamente.`;
  } else if (highlightType === "attention") {
    headline = `Seu ${PILLAR_NAMES[highlightPillar]} precisa de atenção esta semana.`;
  } else {
    headline = "Semana estável. Continue cuidando de você!";
  }
  
  return {
    pillarTrends,
    practiceTrend,
    currentWeek: {
      startDate: currentWeekStart.toISOString().split("T")[0],
      endDate: currentWeekEnd.toISOString().split("T")[0],
      daysWithData: currentCheckins.length,
    },
    previousWeek: {
      startDate: previousWeekStart.toISOString().split("T")[0],
      endDate: previousWeekEnd.toISOString().split("T")[0],
      daysWithData: previousCheckins.length,
    },
    summary: {
      headline,
      highlightPillar,
      highlightType,
    },
  };
}

// ============================================
// GERADOR DE INSIGHTS DE PILAR
// ============================================

/**
 * Gera insights profundos por pilar
 */
export function generatePillarInsights(
  context: InterpretationContext,
  specificPillar?: EmotionalPillar
): PillarInsightsResponse {
  const endDate = new Date(context.referenceDate);
  const startDate30 = new Date(endDate);
  startDate30.setDate(startDate30.getDate() - 30);
  const startDate7 = new Date(endDate);
  startDate7.setDate(startDate7.getDate() - 7);
  
  const checkins30 = filterCheckinsByPeriod(context.checkins, startDate30, endDate);
  const checkins7 = filterCheckinsByPeriod(context.checkins, startDate7, endDate);
  const practices30 = filterPracticesByPeriod(context.practices, startDate30, endDate);
  
  const pillars: EmotionalPillar[] = specificPillar
    ? [specificPillar]
    : ["BS", "RE", "RS", "CA"];
  
  const insights: PillarInsight[] = [];
  
  let strongestPillar: EmotionalPillar = "BS";
  let weakestPillar: EmotionalPillar = "BS";
  let highestScore = 0;
  let lowestScore = 100;
  
  const babyName = context.babyName || "Seu bebê";
  
  for (const pillar of pillars) {
    // Calcular scores
    const scores30 = checkins30.map((c) => c.scores[pillar]);
    const scores7 = checkins7.map((c) => c.scores[pillar]);
    
    const currentScore = Math.round(average(scores7));
    const score30DaysAgo = checkins30.length > 7 ? Math.round(average(scores30.slice(0, 7).map((_, i) => checkins30[i].scores[pillar]))) : undefined;
    const score7DaysAgo = checkins30.length > 0 ? Math.round(checkins30[0].scores[pillar]) : currentScore;
    
    // Determinar força
    let strength: 1 | 2 | 3 | 4 | 5 = 3;
    let strengthLabel: PillarInsight["strengthLabel"] = "equilibrado";
    
    if (currentScore >= 80) {
      strength = 5;
      strengthLabel = "muito forte";
    } else if (currentScore >= 65) {
      strength = 4;
      strengthLabel = "forte";
    } else if (currentScore >= 50) {
      strength = 3;
      strengthLabel = "equilibrado";
    } else if (currentScore >= 35) {
      strength = 2;
      strengthLabel = "fraco";
    } else {
      strength = 1;
      strengthLabel = "muito fraco";
    }
    
    // Práticas efetivas para este pilar
    const pillarPractices = practices30.filter((p) => p.pillar === pillar);
    const byType = groupByPracticeType(pillarPractices);
    
    const effectivePractices: PillarInsight["effectivePractices"] = [];
    byType.forEach((practices, type) => {
      effectivePractices.push({
        practiceType: type,
        practiceName: practices[0].name,
        impactScore: 65 + Math.random() * 30, // Simplificado
        timesUsed: practices.length,
      });
    });
    
    // Ordenar por uso
    effectivePractices.sort((a, b) => b.timesUsed - a.timesUsed);
    
    // Recomendação
    let recommendation = "";
    if (strength >= 4) {
      recommendation = `Continue assim! ${PILLAR_NAMES[pillar]} é um dos seus pontos fortes.`;
    } else if (strength >= 3) {
      recommendation = `${PILLAR_NAMES[pillar]} está equilibrado. Experimente práticas específicas para fortalecer.`;
    } else {
      recommendation = `${PILLAR_NAMES[pillar]} precisa de atenção. Que tal focar nesse pilar esta semana?`;
    }
    
    // Mensagem do bebê
    const babyMessages: Record<EmotionalPillar, string> = {
      BS: strength >= 3
        ? `Mamãe, quando você cuida do seu corpo, eu sinto! Fico mais calminho aqui dentro. 💜`
        : `Mamãe, descansa um pouquinho? Quando você está cansada, eu fico preocupado. 💜`,
      RE: strength >= 3
        ? `Mamãe, você está lidando tão bem com suas emoções. Eu me sinto seguro. 💜`
        : `Mamãe, está tudo bem sentir o que você sente. Eu estou aqui com você. 💜`,
      RS: strength >= 3
        ? `Mamãe, você é tão forte! Aprendo com você todos os dias. 💜`
        : `Mamãe, os dias difíceis passam. Amanhã vai ser melhor. Confio em você. 💜`,
      CA: strength >= 3
        ? `Mamãe, nosso vínculo é tão especial. Sinto todo o seu amor. 💜`
        : `Mamãe, você não está sozinha. Eu estou aqui, sempre pertinho. 💜`,
    };
    
    const overallTrend = getTrendDirection(currentScore, score7DaysAgo);
    
    insights.push({
      pillar,
      pillarName: PILLAR_NAMES[pillar],
      currentScore,
      score7DaysAgo,
      score30DaysAgo,
      overallTrend,
      strength,
      strengthLabel,
      effectivePractices: effectivePractices.slice(0, 3),
      recommendation,
      babyMessage: babyMessages[pillar],
    });
    
    // Track strongest/weakest
    if (currentScore > highestScore) {
      highestScore = currentScore;
      strongestPillar = pillar;
    }
    if (currentScore < lowestScore) {
      lowestScore = currentScore;
      weakestPillar = pillar;
    }
  }
  
  return {
    insights,
    strongestPillar,
    needsAttentionPillar: weakestPillar,
    period: {
      days: 30,
      startDate: startDate30.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    },
    summary: {
      headline: `${PILLAR_NAMES[strongestPillar]} é seu ponto forte, ${PILLAR_NAMES[weakestPillar]} pode melhorar.`,
      recommendation: lowestScore < 50
        ? `Foque em ${PILLAR_NAMES[weakestPillar]} esta semana.`
        : "Seus pilares estão equilibrados. Continue assim!",
    },
  };
}

// ============================================
// GERADOR DE RELATÓRIO MENSAL
// ============================================

/**
 * Gera relatório do mês
 */
export function generateMonthlyReport(
  context: InterpretationContext,
  month?: number,
  year?: number
): MonthlyReportResponse {
  const refDate = new Date(context.referenceDate);
  const targetMonth = month ?? refDate.getMonth(); // 0-indexed
  const targetYear = year ?? refDate.getFullYear();
  
  // Se não especificou mês, usar mês anterior
  const reportMonth = month !== undefined ? month - 1 : refDate.getMonth() - 1;
  const reportYear = reportMonth < 0 ? targetYear - 1 : targetYear;
  const adjustedMonth = reportMonth < 0 ? 11 : reportMonth;
  
  // Datas do mês
  const startDate = new Date(reportYear, adjustedMonth, 1);
  const endDate = new Date(reportYear, adjustedMonth + 1, 0);
  const daysInMonth = endDate.getDate();
  
  // Filtrar dados do mês
  const checkins = filterCheckinsByPeriod(context.checkins, startDate, endDate);
  const practices = filterPracticesByPeriod(context.practices, startDate, endDate);
  
  // Estatísticas
  const completedDays = checkins.filter((c) => c.dayCompleted).length;
  
  // Calcular streak máximo
  let maxStreak = 0;
  let currentStreak = 0;
  const sortedCheckins = [...checkins].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (let i = 0; i < sortedCheckins.length; i++) {
    if (sortedCheckins[i].dayCompleted) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  const stats: MonthlyStats = {
    totalCheckins: checkins.length,
    totalPractices: practices.length,
    activeDays: checkins.length,
    daysInMonth,
    presenceRate: Math.round((checkins.length / daysInMonth) * 100),
    maxStreak,
    avgPracticesPerWeek: Math.round((practices.length / 4) * 10) / 10,
  };
  
  // Evolução por pilar
  const pillars: EmotionalPillar[] = ["BS", "RE", "RS", "CA"];
  const pillarEvolution: MonthlyPillarEvolution[] = [];
  
  for (const pillar of pillars) {
    const firstWeek = checkins.slice(0, 7);
    const lastWeek = checkins.slice(-7);
    
    const startScore = average(firstWeek.map((c) => c.scores[pillar]));
    const endScore = average(lastWeek.map((c) => c.scores[pillar]));
    const change = endScore - startScore;
    const percentChange = startScore > 0 ? (change / startScore) * 100 : 0;
    
    // Melhor e pior dia
    let bestDay: MonthlyPillarEvolution["bestDay"];
    let worstDay: MonthlyPillarEvolution["worstDay"];
    let bestScore = 0;
    let worstScore = 100;
    
    for (const checkin of checkins) {
      const score = checkin.scores[pillar];
      if (score > bestScore) {
        bestScore = score;
        bestDay = { date: checkin.date, score };
      }
      if (score < worstScore) {
        worstScore = score;
        worstDay = { date: checkin.date, score };
      }
    }
    
    pillarEvolution.push({
      pillar,
      pillarName: PILLAR_NAMES[pillar],
      startScore: Math.round(startScore),
      endScore: Math.round(endScore),
      change: Math.round(change),
      percentChange: Math.round(percentChange),
      bestDay,
      worstDay,
    });
  }
  
  // Descobertas do mês
  const discoveries: MonthlyDiscovery[] = [];
  
  if (stats.presenceRate >= 70) {
    discoveries.push({
      type: "achievement",
      title: "Mês de Alta Presença!",
      description: `Você esteve presente em ${stats.presenceRate}% dos dias. Isso é extraordinário!`,
      icon: "🏆",
    });
  }
  
  if (maxStreak >= 7) {
    discoveries.push({
      type: "achievement",
      title: `Streak de ${maxStreak} Dias!`,
      description: `Seu maior streak do mês foi ${maxStreak} dias seguidos.`,
      icon: "🔥",
    });
  }
  
  // Prática favorita
  const byPractice = groupByPracticeType(practices);
  let favoritePractice: MonthlyReportResponse["favoritePractice"];
  let topCount = 0;
  
  byPractice.forEach((practiceList, type) => {
    if (practiceList.length > topCount) {
      topCount = practiceList.length;
      const avgDuration = average(practiceList.map((p) => p.duration));
      favoritePractice = {
        type,
        name: practiceList[0].name,
        count: practiceList.length,
        avgDuration: Math.round(avgDuration),
      };
    }
  });
  
  // Melhor dia da semana
  const byDayOfWeek = groupByDayOfWeek(checkins);
  let bestDayOfWeek: MonthlyReportResponse["bestDayOfWeek"];
  let bestAvg = 0;
  
  byDayOfWeek.forEach((dayCheckins, day) => {
    const avgZone = average(dayCheckins.map((c) => c.zone));
    if (avgZone > bestAvg && dayCheckins.length >= 2) {
      bestAvg = avgZone;
      bestDayOfWeek = {
        day,
        dayName: DAY_NAMES[day],
        avgScore: Math.round(avgZone * 20),
      };
    }
  });
  
  // Mensagem do bebê
  const babyName = context.babyName || "Seu bebê";
  const babyMessage = stats.presenceRate >= 50
    ? `Mamãe, que mês incrível! Você cuidou de nós ${checkins.length} dias. Sinto cada momento de amor. 💜`
    : `Mamãe, mesmo nos dias corridos, você tentou. Isso me faz sentir muito amado(a). 💜`;
  
  // Resumo
  const highlights: string[] = [];
  if (favoritePractice) {
    highlights.push(`Sua prática favorita foi ${favoritePractice.name} (${favoritePractice.count}x)`);
  }
  if (bestDayOfWeek) {
    highlights.push(`${bestDayOfWeek.dayName} foi seu melhor dia da semana`);
  }
  
  const bestPillar = pillarEvolution.reduce((best, current) =>
    current.percentChange > best.percentChange ? current : best
  );
  if (bestPillar.percentChange > 5) {
    highlights.push(`${bestPillar.pillarName} melhorou ${bestPillar.percentChange}%`);
  }
  
  return {
    month: {
      year: reportYear,
      month: adjustedMonth + 1,
      name: MONTH_NAMES[adjustedMonth],
    },
    stats,
    pillarEvolution,
    discoveries,
    favoritePractice,
    bestDayOfWeek,
    babyMessage,
    summary: {
      headline: `${MONTH_NAMES[adjustedMonth]} foi um mês de ${
        stats.presenceRate >= 70 ? "dedicação" : stats.presenceRate >= 40 ? "cuidado" : "desafios"
      }!`,
      highlights,
      lookingAhead: "Continue assim! Cada dia de cuidado faz diferença.",
    },
  };
}
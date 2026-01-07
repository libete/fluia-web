/**
 * @fluia/engines - Prescription Engine v2.0
 *
 * ENGINE 3: Gera prescrição diária de cuidado.
 *
 * CORREÇÕES v2.0:
 * - Detecta PROBLEMAS (flags + métricas + zona)
 * - Ordena por PRIORIDADE (0 = mais urgente)
 * - Seleciona treinos ESPECÍFICOS por problema
 * - DIVERSIFICA tipos entre treino 1 e 2
 * - Tom contextualizado por zona e quantidade de problemas
 *
 * REGRAS FUNDAMENTAIS (Documento p.16-17):
 * - 1 a 3 treinos por dia
 * - Duração 1-3 minutos
 * - Taxa de sucesso esperada ≥ 90%
 * - Em dias difíceis: foco em presença, não desempenho
 * - Sempre explicar "por que isso ajuda"
 */

import type { EmotionalState } from "./emotional-state-engine";

// ============================================
// TYPES
// ============================================

export type TrainingType =
  | "breathing"
  | "grounding-body"
  | "body-scan"
  | "mindfulness"
  | "bond"
  | "reflection"
  | "pause-micro"
  | "self-compassion"
  | "resilience"
  | "boundary"
  | "gratitude"
  | "bonding";

export type TrainingIntensity = "minimal" | "light" | "moderate" | "active";

export type PrescriptionTone = "compassionate" | "gentle" | "balanced" | "encouraging" | "celebratory";

export type MetricKey = "RE" | "BS" | "RS" | "CA";

export type Zone = 1 | 2 | 3 | 4 | 5;

export interface Metrics {
  RE: number; // Regulação Emocional (0-100)
  BS: number; // Base de Segurança (0-100)
  RS: number; // Resiliência (0-100)
  CA: number; // Conexão Afetiva (0-100)
}

export interface TrainingPrescription {
  id: string;
  type: TrainingType;
  title: string;
  description: string;
  why: string;
  durationMinutes: 1 | 2 | 3 | 4 | 5;
  intensity: TrainingIntensity;
  focusMetric: MetricKey;
  /** Problema que este treino resolve */
  targetsProblem: string;
}

export interface DailyPrescription {
  trainings: TrainingPrescription[];
  goal: string;
  tone: PrescriptionTone;
  /** Problemas detectados (para debug/transparência) */
  detectedProblems: DetectedProblem[];
  isFirstCheckin?: boolean;
}

export interface PrescriptionInput {
  metrics: Metrics;
  emotionalState: EmotionalState;
  context: {
    moment: "morning" | "afternoon" | "evening" | "night";
    isFirstCheckin?: boolean;
    gestationalWeek?: number;
  };
}

// ============================================
// PROBLEM DETECTION TYPES
// ============================================

export type ProblemType = "zone" | "flag" | "metric";

export interface DetectedProblem {
  type: ProblemType;
  issue: string;
  /** 0 = máxima urgência, maior = menor prioridade */
  priority: number;
  /** Tipos de treino recomendados para este problema */
  recommendedTypes: TrainingType[];
  /** Valor da métrica (se aplicável) */
  value?: number;
}

// ============================================
// TRAINING CATALOG (EXPANDIDO)
// ============================================

interface TrainingTemplate {
  id: string;
  type: TrainingType;
  title: string;
  description: string;
  whyTemplate: string;
  durationMinutes: 1 | 2 | 3 | 4 | 5;
  intensity: TrainingIntensity;
  focusMetric: MetricKey;
  /** Problemas que este treino resolve */
  bestFor: string[];
  /** Zona mínima para recomendar */
  minZone: Zone;
  /** Zona máxima para recomendar */
  maxZone: Zone;
  /** Instruções passo-a-passo */
  instructions: string[];
}

const TRAINING_CATALOG: TrainingTemplate[] = [
  // ============================================
  // ZONA BAIXA / ACOLHIMENTO URGENTE
  // ============================================
  {
    id: "grounding-body",
    type: "grounding-body",
    title: "Ancoragem no Corpo",
    description: "Quando o mundo parece confuso, sentir seu corpo te traz de volta.",
    whyTemplate: "Voltar para o corpo acalma a mente e traz presença.",
    durationMinutes: 2,
    intensity: "light",
    focusMetric: "BS",
    bestFor: ["lowZone", "overload", "anxiety", "physicalDiscomfort"],
    minZone: 1,
    maxZone: 3,
    instructions: [
      "Sente-se confortavelmente.",
      "Feche os olhos se quiser.",
      "Sinta o peso do seu corpo.",
      "Perceba seus pés no chão.",
      "Sua coluna apoiada.",
      "Respire naturalmente.",
      "Você está aqui, agora.",
    ],
  },
  {
    id: "self-compassion",
    type: "self-compassion",
    title: "Compaixão por Você Mesma",
    description: "Você merece o mesmo cuidado que oferece aos outros.",
    whyTemplate: "Ser gentil consigo mesma reduz o estresse e fortalece a resiliência.",
    durationMinutes: 3,
    intensity: "light",
    focusMetric: "RE",
    bestFor: ["lowZone", "selfCriticism", "overload"],
    minZone: 1,
    maxZone: 3,
    instructions: [
      "Coloque a mão no coração.",
      "Sinta o calor da sua mão.",
      "Respire fundo.",
      "Diga mentalmente: 'Eu mereço cuidado'.",
      "Repita: 'Estou fazendo o melhor que posso'.",
      "Sinta essa gentileza por você mesma.",
    ],
  },

  // ============================================
  // BAIXA ENERGIA
  // ============================================
  {
    id: "pause-micro",
    type: "pause-micro",
    title: "Micro-Pausa Consciente",
    description: "Às vezes, 1 minuto de pausa consciente já faz diferença.",
    whyTemplate: "Pausar conscientemente restaura energia e clareza mental.",
    durationMinutes: 1,
    intensity: "minimal",
    focusMetric: "RE",
    bestFor: ["lowEnergy", "overload"],
    minZone: 1,
    maxZone: 5,
    instructions: [
      "Pare o que está fazendo.",
      "Respire fundo 3 vezes.",
      "Sinta o peso do seu corpo.",
      "Você está presente agora.",
    ],
  },
  {
    id: "breathing-calm",
    type: "breathing",
    title: "Respiração Tranquila",
    description: "Sua respiração é uma âncora sempre disponível.",
    whyTemplate: "Respirar devagar ativa o sistema nervoso parassimpático, trazendo calma.",
    durationMinutes: 2,
    intensity: "light",
    focusMetric: "RE",
    bestFor: ["lowEnergy", "anxiety", "lowZone"],
    minZone: 1,
    maxZone: 4,
    instructions: [
      "Encontre um lugar tranquilo.",
      "Inspire contando até 4.",
      "Segure por 2 segundos.",
      "Expire contando até 6.",
      "Repita esse ciclo.",
      "Sua respiração te acalma.",
    ],
  },
  {
    id: "breathing-active",
    type: "breathing",
    title: "Respiração Energizante",
    description: "Quando você precisa de disposição, respirar com intenção traz energia.",
    whyTemplate: "Respiração mais rápida aumenta oxigenação e disposição.",
    durationMinutes: 2,
    intensity: "active",
    focusMetric: "RS",
    bestFor: ["needsEnergy", "highZone"],
    minZone: 3,
    maxZone: 5,
    instructions: [
      "Sente-se com a coluna ereta.",
      "Inspire rapidamente pelo nariz.",
      "Expire rapidamente pela boca.",
      "Repita 10 vezes.",
      "Volte ao ritmo normal.",
      "Sinta a energia renovada.",
    ],
  },

  // ============================================
  // DESCONFORTO FÍSICO
  // ============================================
  {
    id: "body-scan",
    type: "body-scan",
    title: "Escaneamento Corporal",
    description: "Reconhecer desconfortos sem julgamento já é cuidado.",
    whyTemplate: "Perceber o corpo com gentileza reduz tensão e promove relaxamento.",
    durationMinutes: 5,
    intensity: "moderate",
    focusMetric: "BS",
    bestFor: ["physicalDiscomfort", "body", "tension"],
    minZone: 2,
    maxZone: 5,
    instructions: [
      "Deite-se ou sente-se confortavelmente.",
      "Comece pelos pés.",
      "Perceba sensações sem julgar.",
      "Suba pelas pernas.",
      "Pelve, barriga, peito.",
      "Ombros, braços, mãos.",
      "Pescoço, rosto, cabeça.",
      "Seu corpo todo, presente.",
    ],
  },

  // ============================================
  // SOBRECARGA
  // ============================================
  {
    id: "boundary-practice",
    type: "boundary",
    title: "Limites Saudáveis",
    description: "Dizer não também é cuidar de vocês duas.",
    whyTemplate: "Estabelecer limites protege sua energia e bem-estar.",
    durationMinutes: 3,
    intensity: "light",
    focusMetric: "RS",
    bestFor: ["overload", "boundary", "exhaustion"],
    minZone: 1,
    maxZone: 4,
    instructions: [
      "Pense em algo que está te sobrecarregando.",
      "Imagine dizendo 'não' com gentileza.",
      "Você pode dizer: 'Não posso agora'.",
      "Ou: 'Preciso cuidar de mim primeiro'.",
      "Sinta o alívio de proteger sua energia.",
      "Seus limites são válidos.",
    ],
  },

  // ============================================
  // BAIXA RESILIÊNCIA (RS)
  // ============================================
  {
    id: "resilience-focus",
    type: "resilience",
    title: "Cultivando Resiliência",
    description: "Pequenos passos constroem força interior.",
    whyTemplate: "Lembrar de superações passadas fortalece a confiança em si mesma.",
    durationMinutes: 4,
    intensity: "moderate",
    focusMetric: "RS",
    bestFor: ["lowRS", "lowConfidence"],
    minZone: 2,
    maxZone: 5,
    instructions: [
      "Lembre de uma dificuldade que você superou.",
      "Pode ser pequena, não importa.",
      "Como você se sentiu depois?",
      "Que força você descobriu em si?",
      "Essa mesma força está aqui agora.",
      "Você é mais resiliente do que imagina.",
    ],
  },

  // ============================================
  // BAIXA REGULAÇÃO EMOCIONAL (RE)
  // ============================================
  {
    id: "mindfulness-observation",
    type: "mindfulness",
    title: "Observação sem Julgamento",
    description: "Perceber suas emoções sem julgá-las é o primeiro passo para regulá-las.",
    whyTemplate: "Observar emoções cria espaço entre sentir e reagir.",
    durationMinutes: 3,
    intensity: "moderate",
    focusMetric: "RE",
    bestFor: ["lowRE", "emotionalReactivity"],
    minZone: 2,
    maxZone: 4,
    instructions: [
      "Feche os olhos suavemente.",
      "Perceba o que está sentindo agora.",
      "Não tente mudar, apenas observe.",
      "Nomeie a emoção se conseguir.",
      "Ela está aí, e está tudo bem.",
      "Você não é sua emoção, você a sente.",
    ],
  },
  {
    id: "reflection-gentle",
    type: "reflection",
    title: "Pausa para Sentir",
    description: "Parar para sentir é um ato de cuidado, não de fraqueza.",
    whyTemplate: "Dar espaço para emoções evita que elas se acumulem.",
    durationMinutes: 2,
    intensity: "light",
    focusMetric: "RE",
    bestFor: ["lowRE", "emotionalSuppression"],
    minZone: 1,
    maxZone: 3,
    instructions: [
      "Pare por um momento.",
      "Coloque a mão no peito.",
      "Pergunte: 'Como estou me sentindo?'",
      "Escute a resposta sem julgar.",
      "Agradeça por esse momento de presença.",
    ],
  },

  // ============================================
  // BAIXA BASE DE SEGURANÇA (BS)
  // ============================================
  {
    id: "grounding-present",
    type: "grounding-body",
    title: "Presente Aqui e Agora",
    description: "Ancorar no momento presente reduz ansiedade e traz clareza.",
    whyTemplate: "Focar no presente diminui preocupações com futuro e passado.",
    durationMinutes: 3,
    intensity: "moderate",
    focusMetric: "BS",
    bestFor: ["lowBS", "anxiety", "worry"],
    minZone: 2,
    maxZone: 4,
    instructions: [
      "Olhe ao redor e nomeie 5 coisas que vê.",
      "Perceba 4 coisas que pode tocar.",
      "Ouça 3 sons diferentes.",
      "Sinta 2 cheiros.",
      "Perceba 1 sabor na boca.",
      "Você está aqui, segura, agora.",
    ],
  },

  // ============================================
  // BAIXA CONEXÃO AFETIVA (CA)
  // ============================================
  {
    id: "baby-bond",
    type: "bonding",
    title: "Conexão com seu Bebê",
    description: "Momentos intencionais fortalecem o vínculo.",
    whyTemplate: "A conexão consciente fortalece o vínculo mãe-bebê.",
    durationMinutes: 3,
    intensity: "light",
    focusMetric: "CA",
    bestFor: ["lowCA", "emotionalDistance", "bond"],
    minZone: 1,
    maxZone: 5,
    instructions: [
      "Coloque as mãos na barriga.",
      "Respire fundo e calma.",
      "Diga mentalmente: 'Oi, bebê'.",
      "Sinta a conexão entre vocês.",
      "Envie amor através do toque.",
      "Vocês duas, juntas.",
    ],
  },
  {
    id: "bond-gratitude",
    type: "bonding",
    title: "Gratidão Compartilhada",
    description: "Agradecer junto com seu bebê fortalece a conexão afetiva.",
    whyTemplate: "Gratidão eleva o estado emocional e fortalece vínculos.",
    durationMinutes: 3,
    intensity: "moderate",
    focusMetric: "CA",
    bestFor: ["lowCA", "highZone"],
    minZone: 3,
    maxZone: 5,
    instructions: [
      "Coloque as mãos na barriga.",
      "Pense em algo pelo qual é grata hoje.",
      "Compartilhe isso mentalmente com seu bebê.",
      "Sinta a gratidão crescer no peito.",
      "Vocês duas agradecem juntas.",
    ],
  },

  // ============================================
  // ZONA BOA / CELEBRAÇÃO
  // ============================================
  {
    id: "gratitude-practice",
    type: "gratitude",
    title: "Celebrando o Presente",
    description: "Momentos assim merecem ser saboreados.",
    whyTemplate: "Celebrar momentos bons aumenta bem-estar e resiliência.",
    durationMinutes: 3,
    intensity: "light",
    focusMetric: "CA",
    bestFor: ["highZone", "celebration"],
    minZone: 4,
    maxZone: 5,
    instructions: [
      "Pense em 3 coisas boas de hoje.",
      "Podem ser pequenas.",
      "Sinta a gratidão por cada uma.",
      "Deixe essa sensação preencher você.",
      "Você merece esse momento.",
      "Aproveite.",
    ],
  },
  {
    id: "baby-bond-deep",
    type: "bonding",
    title: "Conexão Profunda",
    description: "Aproveite essa energia positiva para se conectar ainda mais.",
    whyTemplate: "Estados positivos são ideais para fortalecer o vínculo.",
    durationMinutes: 5,
    intensity: "moderate",
    focusMetric: "CA",
    bestFor: ["highZone", "celebration", "deepConnection"],
    minZone: 4,
    maxZone: 5,
    instructions: [
      "Encontre um lugar tranquilo.",
      "Coloque as duas mãos na barriga.",
      "Feche os olhos e respire fundo.",
      "Imagine seu bebê ali dentro.",
      "Envie amor, luz, calor.",
      "Diga o que quiser para ela.",
      "Sinta a conexão profunda entre vocês.",
    ],
  },
];

// ============================================
// PROBLEM DETECTION
// ============================================

/**
 * Detecta problemas a partir do estado emocional e métricas.
 *
 * PRIORIDADES:
 * - 0: Zona muito baixa (urgência máxima)
 * - 1: Flags ativas (problemas imediatos)
 * - 2: Métricas baixas (problemas estruturais)
 * - 3: Zona alta (oportunidade de crescimento)
 */
function detectProblems(
  emotionalState: EmotionalState,
  metrics: Metrics
): DetectedProblem[] {
  const problems: DetectedProblem[] = [];

  // ============================================
  // PRIORIDADE 0: ZONA MUITO BAIXA
  // ============================================
  if (emotionalState.zone <= 2) {
    problems.push({
      type: "zone",
      issue: "lowZone",
      priority: 0,
      recommendedTypes: ["grounding-body", "self-compassion", "breathing", "pause-micro"],
    });
  }

  // ============================================
  // PRIORIDADE 1: FLAGS ATIVAS
  // ============================================
  if (emotionalState.flags?.overload) {
    problems.push({
      type: "flag",
      issue: "overload",
      priority: 1,
      recommendedTypes: ["pause-micro", "boundary", "grounding-body"],
    });
  }

  if (emotionalState.flags?.lowEnergy) {
    problems.push({
      type: "flag",
      issue: "lowEnergy",
      priority: 1,
      recommendedTypes: ["pause-micro", "breathing"],
    });
  }

  if (emotionalState.flags?.physicalDiscomfort) {
    problems.push({
      type: "flag",
      issue: "physicalDiscomfort",
      priority: 1,
      recommendedTypes: ["grounding-body", "body-scan"],
    });
  }

  if (emotionalState.flags?.emotionalDistance) {
    problems.push({
      type: "flag",
      issue: "emotionalDistance",
      priority: 1,
      recommendedTypes: ["bonding", "bond"],
    });
  }

  // ============================================
  // PRIORIDADE 2: MÉTRICAS BAIXAS (<40)
  // ============================================
  const metricProblems: { key: MetricKey; value: number; types: TrainingType[] }[] = [
    { key: "RE", value: metrics.RE, types: ["mindfulness", "reflection", "breathing"] },
    { key: "BS", value: metrics.BS, types: ["grounding-body", "body-scan"] },
    { key: "RS", value: metrics.RS, types: ["resilience", "boundary", "breathing"] },
    { key: "CA", value: metrics.CA, types: ["bonding", "bond", "gratitude"] },
  ];

  // Ordenar por valor (menor primeiro)
  metricProblems.sort((a, b) => a.value - b.value);

  for (const mp of metricProblems) {
    if (mp.value < 40) {
      problems.push({
        type: "metric",
        issue: `low${mp.key}`,
        priority: 2,
        recommendedTypes: mp.types,
        value: mp.value,
      });
    }
  }

  // ============================================
  // PRIORIDADE 3: ZONA ALTA (OPORTUNIDADE)
  // ============================================
  if (emotionalState.zone >= 4) {
    problems.push({
      type: "zone",
      issue: "highZone",
      priority: 3,
      recommendedTypes: ["gratitude", "bonding", "breathing"],
    });
  }

  // Ordenar por prioridade
  problems.sort((a, b) => a.priority - b.priority);

  return problems;
}

// ============================================
// TRAINING SELECTION
// ============================================

/**
 * Seleciona treino específico para um problema.
 */
function selectTrainingForProblem(
  problem: DetectedProblem,
  zone: Zone,
  excludeTypes: TrainingType[] = []
): TrainingTemplate | null {
  // Filtrar treinos que:
  // 1. Resolvem o problema (bestFor inclui o issue)
  // 2. São apropriados para a zona
  // 3. Não foram excluídos (diversificação)
  const candidates = TRAINING_CATALOG.filter((t) => {
    const matchesProblem =
      t.bestFor.includes(problem.issue) ||
      problem.recommendedTypes.includes(t.type);
    const matchesZone = zone >= t.minZone && zone <= t.maxZone;
    const notExcluded = !excludeTypes.includes(t.type);

    return matchesProblem && matchesZone && notExcluded;
  });

  if (candidates.length === 0) {
    // Fallback: qualquer treino apropriado para a zona
    const fallbacks = TRAINING_CATALOG.filter(
      (t) => zone >= t.minZone && zone <= t.maxZone && !excludeTypes.includes(t.type)
    );
    return fallbacks.length > 0 ? fallbacks[0] : null;
  }

  // Priorizar treinos mais leves em zonas baixas
  if (zone <= 2) {
    const gentleCandidates = candidates.filter(
      (t) => t.intensity === "minimal" || t.intensity === "light"
    );
    if (gentleCandidates.length > 0) {
      return gentleCandidates[0];
    }
  }

  return candidates[0];
}

/**
 * Seleciona 1-3 treinos baseado nos problemas detectados.
 */
function selectTrainings(
  problems: DetectedProblem[],
  zone: Zone
): TrainingPrescription[] {
  const trainings: TrainingPrescription[] = [];
  const usedTypes: TrainingType[] = [];

  // Determinar quantidade de treinos
  let maxTrainings: number;
  if (zone <= 2 || problems.some((p) => p.issue === "overload")) {
    maxTrainings = 1; // Estado vulnerável: apenas 1 treino gentle
  } else if (zone === 3) {
    maxTrainings = 2; // Estado intermediário: 1-2 treinos
  } else {
    maxTrainings = 3; // Estado fortalecido: até 3 treinos
  }

  // Selecionar treinos para os problemas mais prioritários
  for (const problem of problems) {
    if (trainings.length >= maxTrainings) break;

    const training = selectTrainingForProblem(problem, zone, usedTypes);
    if (training) {
      trainings.push({
        id: training.id,
        type: training.type,
        title: training.title,
        description: training.description,
        why: training.whyTemplate,
        durationMinutes: training.durationMinutes,
        intensity: training.intensity,
        focusMetric: training.focusMetric,
        targetsProblem: problem.issue,
      });
      usedTypes.push(training.type);
    }
  }

  // Fallback: sempre ter pelo menos 1 treino
  if (trainings.length === 0) {
    const fallback = TRAINING_CATALOG.find((t) => t.id === "pause-micro")!;
    trainings.push({
      id: fallback.id,
      type: fallback.type,
      title: fallback.title,
      description: fallback.description,
      why: fallback.whyTemplate,
      durationMinutes: fallback.durationMinutes,
      intensity: fallback.intensity,
      focusMetric: fallback.focusMetric,
      targetsProblem: "default",
    });
  }

  return trainings;
}

// ============================================
// TONE DETERMINATION
// ============================================

/**
 * Determina o tom da prescrição baseado na zona e problemas.
 */
function determineTone(
  zone: Zone,
  problems: DetectedProblem[]
): PrescriptionTone {
  // Zona muito baixa → acolhimento máximo
  if (zone <= 2) {
    return "compassionate";
  }

  // Muitos problemas → tom gentil
  if (problems.length >= 3) {
    return "gentle";
  }

  // Zona média → tom equilibrado
  if (zone === 3) {
    return "balanced";
  }

  // Zona boa → tom motivacional
  if (zone === 4) {
    return "encouraging";
  }

  // Zona excelente → tom celebrativo
  return "celebratory";
}

// ============================================
// GOAL GENERATION
// ============================================

/**
 * Gera objetivo geral do dia baseado no estado e problemas.
 */
function generateGoal(
  zone: Zone,
  problems: DetectedProblem[],
  tone: PrescriptionTone
): string {
  // Zona muito baixa
  if (zone <= 2) {
    return "Hoje, o foco é presença e acolhimento. Sem cobrança, sem pressa.";
  }

  // Overload detectado
  if (problems.some((p) => p.issue === "overload")) {
    return "Vamos aliviar a sobrecarga. Você não precisa dar conta de tudo.";
  }

  // Baixa energia
  if (problems.some((p) => p.issue === "lowEnergy")) {
    return "Vamos restaurar sua energia, um passo de cada vez.";
  }

  // Métrica mais baixa
  const metricProblem = problems.find((p) => p.type === "metric");
  if (metricProblem) {
    const metricGoals: Record<string, string> = {
      lowRE: "Vamos trabalhar para regular suas emoções, no seu ritmo.",
      lowBS: "Vamos fortalecer sua base de segurança e ancoragem.",
      lowRS: "Vamos construir resiliência, um pequeno passo de cada vez.",
      lowCA: "Vamos fortalecer o vínculo com seu bebê hoje.",
    };
    return metricGoals[metricProblem.issue] || "Vamos cuidar de você hoje.";
  }

  // Zona alta
  if (zone >= 4) {
    return "Você está bem! Vamos aproveitar para fortalecer ainda mais.";
  }

  return "Um dia de cuidado e presença espera por você.";
}

// ============================================
// MAIN ENGINE FUNCTION
// ============================================

/**
 * ENGINE 3: Prescription Engine v2.0
 *
 * Gera prescrição diária baseada em problemas detectados.
 *
 * FLUXO:
 * 1. Detectar problemas (flags + métricas + zona)
 * 2. Ordenar por prioridade
 * 3. Selecionar treinos específicos (diversificando tipos)
 * 4. Determinar tom e objetivo
 *
 * @param input - Métricas + estado emocional + contexto
 * @returns DailyPrescription - 1-3 treinos + objetivo + problemas
 */
export function generatePrescription(input: PrescriptionInput): DailyPrescription {
  const { metrics, emotionalState, context } = input;

  // 1. Detectar e priorizar problemas
  const problems = detectProblems(emotionalState, metrics);

  // 2. Selecionar treinos baseado nos problemas
  const trainings = selectTrainings(problems, emotionalState.zone);

  // 3. Determinar tom
  const tone = determineTone(emotionalState.zone, problems);

  // 4. Gerar objetivo
  const goal = generateGoal(emotionalState.zone, problems, tone);

  return {
    trainings,
    goal,
    tone,
    detectedProblems: problems,
    isFirstCheckin: context.isFirstCheckin,
  };
}

// ============================================
// HELPER FUNCTIONS (EXPORTS)
// ============================================

/**
 * Retorna duração total da prescrição em minutos.
 */
export function getTotalDuration(prescription: DailyPrescription): number {
  return prescription.trainings.reduce((sum, t) => sum + t.durationMinutes, 0);
}

/**
 * Verifica se prescrição é "micro" (≤3 min total).
 */
export function isMicroPrescription(prescription: DailyPrescription): boolean {
  return getTotalDuration(prescription) <= 3;
}

/**
 * Retorna label do tipo de treino.
 */
export function getTrainingTypeLabel(type: TrainingType): string {
  const labels: Record<TrainingType, string> = {
    breathing: "Respiração",
    "grounding-body": "Ancoragem",
    "body-scan": "Escaneamento Corporal",
    mindfulness: "Atenção Plena",
    bond: "Vínculo",
    bonding: "Conexão",
    reflection: "Reflexão",
    "pause-micro": "Micro-Pausa",
    "self-compassion": "Autocompaixão",
    resilience: "Resiliência",
    boundary: "Limites",
    gratitude: "Gratidão",
  };
  return labels[type] || type;
}

/**
 * Retorna label do tom da prescrição.
 */
export function getToneLabel(tone: PrescriptionTone): string {
  const labels: Record<PrescriptionTone, string> = {
    compassionate: "Acolhedor",
    gentle: "Gentil",
    balanced: "Equilibrado",
    encouraging: "Motivacional",
    celebratory: "Celebrativo",
  };
  return labels[tone];
}

/**
 * Retorna treino do catálogo por ID.
 */
export function getTrainingById(id: string): TrainingTemplate | undefined {
  return TRAINING_CATALOG.find((t) => t.id === id);
}

/**
 * Retorna instruções de um treino.
 */
export function getTrainingInstructions(id: string): string[] {
  const training = getTrainingById(id);
  return training?.instructions || [];
}

/**
 * Retorna todos os treinos do catálogo (para debug).
 */
export function getAllTrainings(): TrainingTemplate[] {
  return [...TRAINING_CATALOG];
}

/**
 * Retorna estatísticas do catálogo.
 */
export function getCatalogStats() {
  return {
    totalTrainings: TRAINING_CATALOG.length,
    byType: TRAINING_CATALOG.reduce(
      (acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byIntensity: TRAINING_CATALOG.reduce(
      (acc, t) => {
        acc[t.intensity] = (acc[t.intensity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}
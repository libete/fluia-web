/**
 * ============================================
 * ARQUIVO: packages/fluia-engines/src/postpartum-engine.ts
 * ============================================
 * 
 * FLUIA — Postpartum Engine
 * 
 * Lógica para extensão puerpério.
 * 
 * ❌ Não faz: persistência, decisão de UX, acesso a banco
 * ✅ Faz: calcula fases, gera mensagens, avalia riscos
 * 
 * CONCEITO:
 * - Transição suave da gravidez para o puerpério
 * - Novos pilares adaptados à realidade pós-parto
 * - Acolhimento especial para este momento delicado
 * - PREMIUM ONLY
 * 
 * @version 1.0.0
 */

import type {
  PostpartumPhase,
  PostpartumPillar,
  BirthInfo,
  TransitionState,
  WelcomeMessage,
  PostpartumDiaryPrompt,
  CombinedCheckin,
  PPDScreeningResult,
  PostpartumContext,
} from "@fluia/contracts";

// ============================================
// CONSTANTES
// ============================================

export const PHASE_DAYS: Record<PostpartumPhase, { min: number; max: number }> = {
  immediate: { min: 0, max: 10 },
  early: { min: 11, max: 45 },
  late: { min: 46, max: 90 },
  extended: { min: 91, max: Infinity },
};

export const PHASE_NAMES: Record<PostpartumPhase, string> = {
  immediate: "Puerpério Imediato",
  early: "Puerpério Tardio",
  late: "Puerpério Remoto",
  extended: "Pós-Puerpério",
};

export const ZONE_MESSAGES: Record<number, string[]> = {
  1: [
    "Está difícil agora. Isso é real e válido. Você não está sozinha.",
    "Dias assim existem. Respire. Peça ajuda. Você merece cuidado.",
  ],
  2: [
    "Está cansada, né? O puerpério é intenso. Descanse quando puder.",
    "Um dia de cada vez. Você está fazendo o melhor que pode.",
  ],
  3: [
    "Dia equilibrado. Nem todo dia precisa ser extraordinário.",
    "Seguindo em frente. Você está se adaptando bem.",
  ],
  4: [
    "Que bom que hoje está mais leve! Aproveite esses momentos.",
    "Dias bons merecem ser celebrados. Você está arrasando!",
  ],
  5: [
    "Dia incrível! A maternidade também tem esses momentos mágicos.",
    "Seu coração está cheio. Guarde essa sensação.",
  ],
};

// ============================================
// CÁLCULOS DE FASE
// ============================================

/**
 * Calcula dias desde o nascimento
 */
export function calculateDaysSinceBirth(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Determina fase do puerpério
 */
export function determinePhase(daysSinceBirth: number): PostpartumPhase {
  if (daysSinceBirth <= PHASE_DAYS.immediate.max) return "immediate";
  if (daysSinceBirth <= PHASE_DAYS.early.max) return "early";
  if (daysSinceBirth <= PHASE_DAYS.late.max) return "late";
  return "extended";
}

/**
 * Calcula semanas desde o nascimento
 */
export function calculateWeeksSinceBirth(daysSinceBirth: number): number {
  return Math.floor(daysSinceBirth / 7);
}

// ============================================
// TRANSIÇÃO
// ============================================

/**
 * Gera estado inicial da transição
 */
export function createInitialTransitionState(birthInfo: BirthInfo): TransitionState {
  const daysSinceBirth = calculateDaysSinceBirth(birthInfo.birthDate);
  
  return {
    status: "initiated",
    birthInfo,
    phase: determinePhase(daysSinceBirth),
    daysSinceBirth,
    weeksSinceBirth: calculateWeeksSinceBirth(daysSinceBirth),
    transitionStartedAt: new Date().toISOString(),
    onboardingSteps: {
      birthInfoCompleted: true,
      firstPostpartumCheckin: false,
      pillarsIntroduced: false,
      firstBabyCheckin: false,
    },
  };
}

/**
 * Gera mensagem de boas-vindas ao puerpério
 */
export function generateWelcomeMessage(
  birthInfo: BirthInfo,
  phase: PostpartumPhase
): WelcomeMessage {
  const babyName = birthInfo.babyName;
  const daysSinceBirth = calculateDaysSinceBirth(birthInfo.birthDate);

  const phaseMessages: Record<PostpartumPhase, { title: string; message: string }> = {
    immediate: {
      title: `${babyName} chegou! 💜`,
      message: `Parabéns, mamãe! ${babyName} está no mundo há ${daysSinceBirth} dia${daysSinceBirth > 1 ? "s" : ""}. Este é o puerpério imediato — um momento de muita intensidade e adaptação. A FLUIA está aqui para te acompanhar nessa nova fase.`,
    },
    early: {
      title: `Bem-vinda ao Puerpério`,
      message: `${babyName} já está com ${daysSinceBirth} dias. Você está no puerpério tardio — as coisas começam a encontrar um ritmo, mas ainda há muita adaptação. Estamos aqui com você.`,
    },
    late: {
      title: `Continuamos Juntas`,
      message: `${babyName} está crescendo! Com ${daysSinceBirth} dias, você está no puerpério remoto. Muita coisa já se ajustou, mas o cuidado continua importante.`,
    },
    extended: {
      title: `Sua Jornada Continua`,
      message: `${babyName} já tem ${Math.floor(daysSinceBirth / 30)} meses! O puerpério formal já passou, mas a maternidade é para sempre. Continue se cuidando.`,
    },
  };

  const { title, message } = phaseMessages[phase];

  const babyMessages: Record<PostpartumPhase, string> = {
    immediate: `Mamãe, eu cheguei! Ainda estou me acostumando com esse mundo novo, mas me sinto seguro(a) com você. 💜`,
    early: `Mamãe, estou crescendo! Já te reconheço pela voz e pelo cheiro. Você é meu mundo. 💜`,
    late: `Mamãe, olha quanto eu cresci! Estou aprendendo coisas novas todo dia. Obrigado(a) por cuidar de mim. 💜`,
    extended: `Mamãe, você é incrível! Obrigado(a) por cada dia de amor e cuidado. 💜`,
  };

  const tips: Record<PostpartumPhase, string[]> = {
    immediate: [
      "Descanse sempre que o bebê dormir",
      "Aceite ajuda — você não precisa fazer tudo sozinha",
      "Hidrate-se bem, especialmente se estiver amamentando",
      "Chore se precisar — é normal e liberador",
    ],
    early: [
      "Tente criar pequenas rotinas para você",
      "Saia de casa quando se sentir pronta, mesmo que brevemente",
      "Mantenha contato com pessoas que te fazem bem",
      "Celebre as pequenas vitórias",
    ],
    late: [
      "Comece a pensar em tempo para você",
      "Movimento leve pode ajudar o humor",
      "Observe seu bem-estar emocional",
      "Conecte-se com outras mães",
    ],
    extended: [
      "Continue priorizando seu bem-estar",
      "Cultive interesses além da maternidade",
      "Mantenha check-ins emocionais regulares",
      "Celebre sua jornada",
    ],
  };

  return {
    title,
    message,
    babyMessage: babyMessages[phase],
    tips: tips[phase],
    changes: [
      {
        icon: "🔄",
        title: "Novos Pilares",
        description: "Agora acompanhamos: Recuperação Física, Saúde Emocional, Vínculo com Bebê e Rede de Apoio",
      },
      {
        icon: "👶",
        title: "Check-in do Bebê",
        description: "Você pode registrar como o bebê está — sono, alimentação, humor",
      },
      {
        icon: "📔",
        title: "Diário do Puerpério",
        description: "Prompts especiais para esta fase única da vida",
      },
    ],
  };
}

// ============================================
// PROMPTS DO DIÁRIO DO PUERPÉRIO
// ============================================

export const POSTPARTUM_DIARY_PROMPTS: PostpartumDiaryPrompt[] = [
  // RECUPERAÇÃO
  {
    promptId: "pp-recovery-1",
    category: "recovery",
    text: "Como seu corpo está se sentindo hoje?",
    relevantPhases: ["immediate", "early", "late"],
    placeholder: "Descreva as sensações físicas...",
    writingTip: "Seu corpo fez algo extraordinário. Seja gentil com ele.",
  },
  {
    promptId: "pp-recovery-2",
    category: "recovery",
    text: "O que seu corpo precisa agora que você pode oferecer?",
    relevantPhases: ["immediate", "early"],
    placeholder: "Descanso, água, movimento leve...",
    writingTip: "Ouvir o corpo é um ato de amor próprio.",
  },

  // EMOÇÃO
  {
    promptId: "pp-emotion-1",
    category: "emotion",
    text: "Que emoções te visitaram hoje?",
    relevantPhases: ["immediate", "early", "late", "extended"],
    placeholder: "Alegria, medo, amor, exaustão...",
    writingTip: "Todas as emoções são válidas no puerpério.",
  },
  {
    promptId: "pp-emotion-2",
    category: "emotion",
    text: "O que você diria para si mesma há uma semana?",
    relevantPhases: ["early", "late"],
    placeholder: "Se pudesse voltar no tempo...",
    writingTip: "Você aprendeu muito em pouco tempo.",
  },
  {
    promptId: "pp-emotion-3",
    category: "emotion",
    text: "Quando foi a última vez que você chorou? O que sentiu?",
    relevantPhases: ["immediate", "early"],
    placeholder: "Chorar faz parte...",
    writingTip: "Chorar é liberação. Não se julgue.",
  },

  // VÍNCULO
  {
    promptId: "pp-bonding-1",
    category: "bonding",
    text: "Qual foi o momento mais especial com o bebê hoje?",
    relevantPhases: ["immediate", "early", "late", "extended"],
    placeholder: "Um olhar, um sorriso, um momento de calma...",
    writingTip: "Os pequenos momentos são os mais preciosos.",
  },
  {
    promptId: "pp-bonding-2",
    category: "bonding",
    text: "O que você descobriu sobre o bebê esta semana?",
    relevantPhases: ["early", "late"],
    placeholder: "Gostos, manias, jeitos...",
    writingTip: "Você está conhecendo uma pessoa nova.",
  },

  // APOIO
  {
    promptId: "pp-support-1",
    category: "support",
    text: "Quem te ajudou hoje? Como?",
    relevantPhases: ["immediate", "early", "late"],
    placeholder: "Parceiro, família, amigos, profissionais...",
    writingTip: "Reconhecer apoio fortalece conexões.",
  },
  {
    promptId: "pp-support-2",
    category: "support",
    text: "Que ajuda você gostaria de pedir mas ainda não pediu?",
    relevantPhases: ["immediate", "early"],
    placeholder: "Seja honesta consigo...",
    writingTip: "Pedir ajuda é força, não fraqueza.",
  },

  // SONO
  {
    promptId: "pp-sleep-1",
    category: "sleep",
    text: "Como foi sua noite? Como você está lidando com o sono fragmentado?",
    relevantPhases: ["immediate", "early"],
    placeholder: "Descreva sua experiência...",
    writingTip: "O sono vai melhorar. Aguente firme.",
  },

  // AMAMENTAÇÃO
  {
    promptId: "pp-feeding-1",
    category: "feeding",
    text: "Como está sendo a experiência de alimentar o bebê?",
    relevantPhases: ["immediate", "early"],
    placeholder: "Amamentação, fórmula, misto...",
    writingTip: "Não existe jeito certo. Existe o que funciona para vocês.",
  },

  // IDENTIDADE
  {
    promptId: "pp-identity-1",
    category: "identity",
    text: "O que você sente sobre sua nova identidade de mãe?",
    relevantPhases: ["early", "late", "extended"],
    placeholder: "Quem você está se tornando...",
    writingTip: "Você ainda é você, e também é mãe. As duas coisas.",
  },

  // RELACIONAMENTO
  {
    promptId: "pp-relationship-1",
    category: "relationship",
    text: "Como está seu relacionamento com seu parceiro/a depois do nascimento?",
    relevantPhases: ["early", "late"],
    placeholder: "Mudanças, desafios, descobertas...",
    writingTip: "Relacionamentos também passam por puerpério.",
  },
];

/**
 * Seleciona prompt para o dia
 */
export function selectPostpartumPrompt(
  context: PostpartumContext,
  usedPromptIds: string[] = []
): PostpartumDiaryPrompt {
  // Filtrar por fase
  const phasePrompts = POSTPARTUM_DIARY_PROMPTS.filter(
    (p) => p.relevantPhases.includes(context.phase)
  );

  // Filtrar não usados
  const available = phasePrompts.filter((p) => !usedPromptIds.includes(p.promptId));

  if (available.length === 0) {
    // Resetar se todos foram usados
    return phasePrompts[Math.floor(Math.random() * phasePrompts.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Retorna prompts alternativos
 */
export function getAlternativePostpartumPrompts(
  context: PostpartumContext,
  excludePromptId: string,
  count: number = 3
): PostpartumDiaryPrompt[] {
  const phasePrompts = POSTPARTUM_DIARY_PROMPTS.filter(
    (p) => p.relevantPhases.includes(context.phase) && p.promptId !== excludePromptId
  );

  const shuffled = phasePrompts.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ============================================
// CHECK-IN COMBINADO
// ============================================

/**
 * Gera mensagem baseada no check-in
 */
export function generateCheckinMessage(
  checkin: Omit<CombinedCheckin, "generatedMessage" | "suggestedPractice">,
  context: PostpartumContext
): string {
  const { motherCheckin, babyCheckin } = checkin;
  const zone = motherCheckin.zone;
  const babyName = context.babyName;

  // Mensagem base
  const baseMessages = ZONE_MESSAGES[zone] || ZONE_MESSAGES[3];
  let message = baseMessages[Math.floor(Math.random() * baseMessages.length)];

  // Adicionar sobre sono se muito pouco
  if (motherCheckin.sleepHours && motherCheckin.sleepHours < 4) {
    message += ` Você dormiu pouco. Tente descansar quando ${babyName} dormir.`;
  }

  // Adicionar sobre dor se alta
  if (motherCheckin.painLevel && motherCheckin.painLevel >= 7) {
    message += ` Se a dor está intensa, considere falar com seu médico.`;
  }

  // Adicionar sobre o bebê
  if (babyCheckin.babyMood >= 4) {
    message += ` ${babyName} parece estar bem hoje. Isso é ótimo!`;
  } else if (babyCheckin.babyMood <= 2) {
    message += ` Dias difíceis para o bebê também são difíceis para a mãe. Força!`;
  }

  return message;
}

/**
 * Sugere prática baseada no check-in
 */
export function suggestPractice(
  checkin: Omit<CombinedCheckin, "generatedMessage" | "suggestedPractice">,
  context: PostpartumContext
): CombinedCheckin["suggestedPractice"] {
  const { motherCheckin } = checkin;
  const dominantPillar = Object.entries(motherCheckin.scores).sort(
    (a, b) => a[1] - b[1]
  )[0][0] as PostpartumPillar;

  const suggestions: Record<PostpartumPillar, CombinedCheckin["suggestedPractice"]> = {
    RF: {
      type: "breathing",
      name: "Respiração de Recuperação",
      reason: "Ajuda na recuperação física e no relaxamento",
    },
    SE: {
      type: "meditation",
      name: "Momento de Calma",
      reason: "Para cuidar do seu bem-estar emocional",
    },
    VB: {
      type: "connection",
      name: "Minuto com o Bebê",
      reason: "Fortalece o vínculo entre vocês",
    },
    RA: {
      type: "gratitude",
      name: "Gratidão pelo Apoio",
      reason: "Reconhecer quem te ajuda fortalece conexões",
    },
  };

  return suggestions[dominantPillar];
}

/**
 * Gera insights baseados no check-in
 */
export function generateCheckinInsights(
  checkin: Omit<CombinedCheckin, "generatedMessage" | "suggestedPractice">,
  context: PostpartumContext
): CombinedCheckin["suggestedPractice"][] {
  const insights: Array<{
    type: "tip" | "warning" | "celebration";
    title: string;
    message: string;
    icon: string;
  }> = [];

  const { motherCheckin, babyCheckin } = checkin;

  // Celebração por zona alta
  if (motherCheckin.zone >= 4) {
    insights.push({
      type: "celebration",
      title: "Dia Positivo!",
      message: "Você está se sentindo bem. Aproveite esse momento.",
      icon: "🎉",
    });
  }

  // Dica sobre sono
  if (motherCheckin.sleepHours && motherCheckin.sleepHours < 4) {
    insights.push({
      type: "tip",
      title: "Priorize o Descanso",
      message: "Tente cochilar quando o bebê dormir, mesmo que seja pouco.",
      icon: "💤",
    });
  }

  // Celebração por marcos do bebê
  if (babyCheckin.milestones && babyCheckin.milestones.length > 0) {
    insights.push({
      type: "celebration",
      title: "Marco Registrado!",
      message: `${context.babyName} alcançou: ${babyCheckin.milestones.join(", ")}`,
      icon: "⭐",
    });
  }

  return insights as any;
}

// ============================================
// SCREENING PPD (SIMPLIFICADO)
// ============================================

/**
 * Avalia risco de depressão pós-parto
 * Baseado em padrões de check-ins recentes
 */
export function evaluatePPDRisk(
  recentCheckins: Array<{ zone: number; sleepQuality: number }>,
  context: PostpartumContext
): PPDScreeningResult | null {
  // Precisa de pelo menos 5 check-ins para avaliar
  if (recentCheckins.length < 5) return null;

  // Calcular médias
  const avgZone = recentCheckins.reduce((s, c) => s + c.zone, 0) / recentCheckins.length;
  const avgSleep = recentCheckins.reduce((s, c) => s + c.sleepQuality, 0) / recentCheckins.length;

  // Contar dias com zona <= 2
  const lowDays = recentCheckins.filter((c) => c.zone <= 2).length;
  const lowDaysPercentage = lowDays / recentCheckins.length;

  // Calcular score simplificado (0-10)
  let score = 0;

  if (avgZone <= 2) score += 4;
  else if (avgZone <= 3) score += 2;

  if (avgSleep <= 2) score += 3;
  else if (avgSleep <= 3) score += 1;

  if (lowDaysPercentage >= 0.6) score += 3;
  else if (lowDaysPercentage >= 0.4) score += 2;

  // Determinar nível de risco
  let riskLevel: PPDScreeningResult["riskLevel"];
  let recommendation: string;
  let suggestProfessionalHelp: boolean;

  if (score >= 7) {
    riskLevel = "high";
    recommendation = "Seus registros mostram sinais que merecem atenção. Considere conversar com um profissional de saúde mental.";
    suggestProfessionalHelp = true;
  } else if (score >= 4) {
    riskLevel = "moderate";
    recommendation = "Alguns sinais pedem atenção. Continue monitorando e não hesite em buscar ajuda se precisar.";
    suggestProfessionalHelp = false;
  } else {
    riskLevel = "low";
    recommendation = "Seus registros mostram um padrão saudável. Continue cuidando de você!";
    suggestProfessionalHelp = false;
  }

  return {
    score,
    riskLevel,
    recommendation,
    suggestProfessionalHelp,
    screenedAt: new Date().toISOString(),
  };
}
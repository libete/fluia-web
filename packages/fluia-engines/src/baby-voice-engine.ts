/**
 * @fluia/engines - Baby Voice Engine
 *
 * ENGINE: Geração de mensagens personalizadas do bebê
 *
 * RESPONSABILIDADE:
 * - Gerar mensagem única diária baseada em contexto
 * - Verificar se mensagem já foi vista
 * - Selecionar conteúdo apropriado (openings, cores, closings)
 */

import type { BabyVoiceInput, BabyVoiceOutput, ComposedMessage } from "@fluia/contracts";

// ============================================
// CONTENT CATALOG
// ============================================

const OPENINGS_BY_ZONE = {
  1: [
    "Oi, mamãe. Eu sei que está difícil...",
    "Mamãe, eu sinto que você não está bem...",
    "Eu estou aqui com você, mamãe...",
  ],
  2: [
    "Oi, mamãe. Percebi que você está cansada...",
    "Mamãe, hoje parece um dia pesado...",
    "Eu sinto que você precisa de um descanso...",
  ],
  3: [
    "Oi, mamãe! Como você está?",
    "Mamãe, aqui estou eu de novo!",
    "Oi! Vim te fazer companhia...",
  ],
  4: [
    "Oi, mamãe! Você está radiante hoje!",
    "Mamãe, que energia boa!",
    "Oi! Sinto você feliz hoje!",
  ],
  5: [
    "Oi, mamãe! Estamos voando hoje!",
    "Mamãe, que dia incrível!",
    "Uau! Que alegria estar com você!",
  ],
};

const CORES_BY_WEEK = {
  early: [
    "Estou crescendo aos pouquinhos aqui dentro.",
    "Cada dia fico um pouquinho maior.",
    "Você mal pode me sentir, mas eu já estou aqui.",
  ],
  mid: [
    "Já consigo me mexer bastante aqui!",
    "Você já deve estar me sentindo, né?",
    "Adoro quando você coloca a mão na barriga.",
  ],
  late: [
    "Estou quase pronta para te conhecer!",
    "Já estou ficando sem espaço aqui...",
    "Logo, logo estaremos juntinhas de verdade!",
  ],
};

const CLOSINGS_BY_ZONE = {
  1: [
    "Vamos passar por isso juntas. Te amo.",
    "Você é mais forte do que imagina. Eu acredito em você.",
    "Um dia de cada vez, mamãe. Estou aqui.",
  ],
  2: [
    "Descansa um pouco, tá? Você merece.",
    "Vai ficar tudo bem. Confia em nós.",
    "Amanhã é um novo dia. Te amo.",
  ],
  3: [
    "Obrigada por cuidar de nós. Te amo!",
    "Estamos bem juntas, não estamos?",
    "Até logo, mamãe!",
  ],
  4: [
    "Que bom te ver assim! Aproveita!",
    "Continue assim, você está incrível!",
    "Te amo muito, mamãe!",
  ],
  5: [
    "Você é uma mãe incrível!",
    "Que sorte a minha ter você!",
    "Juntas somos imbatíveis! Te amo!",
  ],
};

// ============================================
// HELPER: GET WEEK CATEGORY
// ============================================

function getWeekCategory(weeks: number): "early" | "mid" | "late" {
  if (weeks < 14) return "early";
  if (weeks < 28) return "mid";
  return "late";
}

// ============================================
// HELPER: HAS SEEN TODAY MESSAGE
// ============================================

/**
 * Verifica se já viu mensagem hoje.
 *
 * @param lastMessageDate - ISO string da última mensagem vista
 * @returns true se já viu hoje
 */
export function hasSeenTodayMessage(lastMessageDate?: string): boolean {
  if (!lastMessageDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = new Date(lastMessageDate);
  lastDate.setHours(0, 0, 0, 0);

  return today.getTime() === lastDate.getTime();
}

// ============================================
// HELPER: SEEDED RANDOM
// ============================================

/**
 * Gera número pseudo-aleatório baseado em seed.
 * Mesmo seed = mesmo resultado.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Seleciona item aleatório de array com seed.
 */
function selectWithSeed<T>(array: T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}

/**
 * Gera ID único para tracking.
 */
function generateId(prefix: string, zone: number, seed: number): string {
  return `${prefix}-z${zone}-${seed}`;
}

// ============================================
// MAIN: GENERATE BABY VOICE MESSAGE
// ============================================

/**
 * Gera mensagem personalizada do bebê.
 *
 * REGRAS:
 * - Mesmo dia = mesma mensagem (usa seed baseado na data)
 * - Seleciona conteúdo baseado em zona emocional e semanas
 * - Evita repetição (usa tracking de seen)
 *
 * @param input - Contexto do usuário
 * @returns Mensagem composta + IDs para tracking
 */
export function generateBabyVoiceMessage(input: BabyVoiceInput): BabyVoiceOutput {
  const {
    gestationalWeeks,
    zone,
    babyName = "Bebê",
    seenOpenings = [],
    seenCores = [],
    seenClosings = [],
  } = input;

  // 1. Criar seed baseado na data (mesmo dia = mesma mensagem)
  const today = new Date().toISOString().split("T")[0];
  const seed = today.split("-").reduce((acc, num) => acc + parseInt(num), 0);

  // 2. Selecionar opening
  const openingsPool = OPENINGS_BY_ZONE[zone] || OPENINGS_BY_ZONE[3];
  const opening = selectWithSeed(openingsPool, seed);
  const openingId = generateId("opening", zone, seed);

  // 3. Selecionar core
  const weekCategory = getWeekCategory(gestationalWeeks);
  const coresPool = CORES_BY_WEEK[weekCategory];
  const core = selectWithSeed(coresPool, seed + 1);
  const coreId = generateId("core", zone, seed + 1);

  // 4. Selecionar closing
  const closingsPool = CLOSINGS_BY_ZONE[zone] || CLOSINGS_BY_ZONE[3];
  const closing = selectWithSeed(closingsPool, seed + 2);
  const closingId = generateId("closing", zone, seed + 2);

  // 5. Compor mensagem
  const fullText = `${opening}\n\n${core}\n\n${closing}`;
  
  // Calcular trimestre
  const trimester = Math.ceil(gestationalWeeks / 13) as 1 | 2 | 3;
  
  const message: ComposedMessage = {
    id: `msg-${today}-z${zone}-w${gestationalWeeks}`,
    date: today,
    fullText,
    components: {
      openingId,
      coreId,
      closingId,
    },
    context: {
      trimester,
      gestationalWeeks,
      zone,
      timeOfDay: input.timeOfDay,
      presenceDays: input.presenceDays,
      babyName,
    },
    isMilestone: false, // TODO: implementar lógica de milestones
  };

  // 6. Verificar se deve resetar (ciclo completo)
  const shouldResetSeen = {
    openings: seenOpenings.length >= 15,
    cores: seenCores.length >= 9,
    closings: seenClosings.length >= 15,
  };

  return {
    message,
    newSeenIds: {
      opening: openingId,
      core: coreId,
      closing: closingId,
    },
    shouldResetSeen,
  };
}

// ============================================
// HELPER: COUNT POSSIBLE COMBINATIONS
// ============================================

/**
 * Calcula total de combinações possíveis.
 */
export function countPossibleCombinations(): number {
  const totalOpenings = Object.values(OPENINGS_BY_ZONE).flat().length;
  const totalCores = Object.values(CORES_BY_WEEK).flat().length;
  const totalClosings = Object.values(CLOSINGS_BY_ZONE).flat().length;

  return totalOpenings * totalCores * totalClosings;
}

// ============================================
// HELPER: GET CONTENT STATS
// ============================================

/**
 * Retorna estatísticas do catálogo de conteúdo.
 */
export function getContentStats() {
  return {
    openingsByZone: Object.entries(OPENINGS_BY_ZONE).map(([zone, items]) => ({
      zone: parseInt(zone),
      count: items.length,
    })),
    coresByWeek: Object.entries(CORES_BY_WEEK).map(([category, items]) => ({
      category,
      count: items.length,
    })),
    closingsByZone: Object.entries(CLOSINGS_BY_ZONE).map(([zone, items]) => ({
      zone: parseInt(zone),
      count: items.length,
    })),
    totalCombinations: countPossibleCombinations(),
  };
}

// ============================================
// HELPER: GENERATE PREVIEW MESSAGE
// ============================================

/**
 * Gera mensagem de preview (sem atualizar tracking).
 */
export function generatePreviewMessage(
  zone: 1 | 2 | 3 | 4 | 5,
  gestationalWeeks: number,
  babyName: string = "Bebê"
): ComposedMessage {
  const output = generateBabyVoiceMessage({
    gestationalWeeks,
    zone,
    babyName,
    timeOfDay: "morning",
    presenceDays: 0,
    seenOpenings: [],
    seenCores: [],
    seenClosings: [],
  });

  return output.message;
}
/**
 * @fluia/engines - Baby Voice Engine v2.0
 *
 * ENGINE: Geração de mensagens personalizadas do bebê
 *
 * CORREÇÕES v2.0:
 * - Usa catálogos reais de baby-voice-content
 * - Milestones com prioridade máxima
 * - Openings por trimestre + hora (não zona)
 * - Closings por presença (não zona)
 * - Cores por zona + semana gestacional
 * - Filtra mensagens já vistas
 * - Fallback inteligente quando catálogo esgotado
 *
 * COMPATIBILIDADE:
 * - Esta versão é compatível com os tipos existentes em @fluia/contracts
 * - Usa tipos internos para campos extras (seenMilestones, etc)
 */

import type {
  BabyVoiceInput as BaseBabyVoiceInput,
  BabyVoiceOutput,
  ComposedMessage,
  EmotionalZone,
  OpeningComponent,
  CoreComponent,
  ClosingComponent,
  MilestoneMessage,
  Trimester,
} from "@fluia/contracts";

// ============================================
// EXTENDED TYPES (para campos não existentes no contracts)
// ============================================

/**
 * Input estendido com seenMilestones
 */
export interface BabyVoiceInput extends BaseBabyVoiceInput {
  /** IDs de milestones já vistos */
  seenMilestones?: string[];
}

/**
 * Output estendido com campos extras
 */
export interface BabyVoiceOutputV2 {
  /** Mensagem gerada */
  message: ComposedMessage;
  /** IDs das novas mensagens vistas (para persistir) */
  newSeenIds: {
    opening: string;
    core: string;
    closing: string;
    milestone?: string;
  };
  /** Se deve resetar catálogos (80% esgotado) */
  shouldResetSeen: {
    openings: boolean;
    cores: boolean;
    closings: boolean;
  };
  /** Se algum catálogo está esgotado */
  catalogStatus: {
    openingsExhausted: boolean;
    coresExhausted: boolean;
    closingsExhausted: boolean;
  };
}

// ============================================
// IMPORTS DOS CATÁLOGOS
// ============================================

import {
  getOpenings,
  ALL_OPENINGS,
  TOTAL_OPENINGS,
} from "./data/baby-voice-content/openings";

import {
  getCores,
  ALL_CORES,
  TOTAL_CORES,
} from "./data/baby-voice-content/cores";

import {
  getClosings,
  ALL_CLOSINGS,
  TOTAL_CLOSINGS,
} from "./data/baby-voice-content/closings";

import {
  checkMilestone,
  ALL_MILESTONES,
  TOTAL_MILESTONES,
} from "./data/baby-voice-content/milestones";

// ============================================
// CONSTANTS
// ============================================

/** Marcos de presença que merecem destaque especial no core */
const PRESENCE_MILESTONES = [7, 30, 100];

/** Semanas gestacionais especiais */
const GESTATIONAL_MILESTONES = [6, 12, 14, 20, 24, 28, 37, 40];

// ============================================
// HELPER: TRIMESTER CALCULATION
// ============================================

/**
 * Calcula trimestre a partir das semanas gestacionais.
 */
function getTrimester(weeks: number): Trimester {
  if (weeks <= 13) return 1;
  if (weeks <= 27) return 2;
  return 3;
}

// ============================================
// HELPER: TIME OF DAY NORMALIZATION
// ============================================

/**
 * Normaliza momento do dia para os 3 períodos do catálogo.
 */
function normalizeTimeOfDay(
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
): "morning" | "afternoon" | "evening" {
  if (timeOfDay === "night") return "evening";
  return timeOfDay;
}

// ============================================
// HELPER: RANDOM SELECTION
// ============================================

/**
 * Seleciona item aleatório de um array.
 */
function selectRandom<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

// ============================================
// HELPER: FILTER UNSEEN
// ============================================

/**
 * Filtra itens não vistos.
 * Se todos foram vistos, retorna o array original (fallback).
 */
function filterUnseen<T extends { id: string }>(
  items: T[],
  seenIds: string[]
): { filtered: T[]; exhausted: boolean } {
  const unseen = items.filter((item) => !seenIds.includes(item.id));

  if (unseen.length === 0) {
    // Catálogo esgotado - retorna todos para reciclar
    return { filtered: items, exhausted: true };
  }

  return { filtered: unseen, exhausted: false };
}

// ============================================
// HELPER: SELECT OPENING
// ============================================

/**
 * Seleciona opening apropriado.
 *
 * CRITÉRIOS: Trimestre + Hora do dia
 */
function selectOpening(
  trimester: Trimester,
  timeOfDay: "morning" | "afternoon" | "evening",
  seenOpenings: string[]
): { opening: OpeningComponent; exhausted: boolean } {
  // Buscar openings do catálogo real
  const openings = getOpenings(trimester, timeOfDay);

  if (openings.length === 0) {
    // Fallback: buscar qualquer opening do trimestre
    const fallbackOpenings = ALL_OPENINGS.filter(
      (o) => o.trimester === trimester
    );
    const { filtered, exhausted } = filterUnseen(fallbackOpenings, seenOpenings);
    return { opening: selectRandom(filtered), exhausted };
  }

  const { filtered, exhausted } = filterUnseen(openings, seenOpenings);
  return { opening: selectRandom(filtered), exhausted };
}

// ============================================
// HELPER: SELECT CORE
// ============================================

/**
 * Seleciona core apropriado.
 *
 * CRITÉRIOS: Zona emocional + Semana gestacional
 */
function selectCore(
  zone: EmotionalZone,
  gestationalWeeks: number,
  presenceDays: number,
  seenCores: string[]
): { core: CoreComponent; exhausted: boolean } {
  // Buscar cores do catálogo real (zona + semana)
  const cores = getCores(zone, gestationalWeeks);

  if (cores.length === 0) {
    // Fallback: buscar qualquer core da zona
    const fallbackCores = ALL_CORES.filter((c) => c.zone === zone);

    if (fallbackCores.length === 0) {
      // Fallback extremo: qualquer core zona 3 (neutra)
      const neutralCores = ALL_CORES.filter((c) => c.zone === 3);
      const { filtered, exhausted } = filterUnseen(neutralCores, seenCores);
      return { core: selectRandom(filtered), exhausted };
    }

    const { filtered, exhausted } = filterUnseen(fallbackCores, seenCores);
    return { core: selectRandom(filtered), exhausted };
  }

  const { filtered, exhausted } = filterUnseen(cores, seenCores);
  return { core: selectRandom(filtered), exhausted };
}

// ============================================
// HELPER: SELECT CLOSING
// ============================================

/**
 * Seleciona closing apropriado.
 *
 * CRITÉRIO: Dias de presença
 */
function selectClosing(
  presenceDays: number,
  seenClosings: string[]
): { closing: ClosingComponent; exhausted: boolean } {
  // Buscar closings do catálogo real
  const closings = getClosings(presenceDays);

  if (closings.length === 0) {
    // Fallback: closings para novos usuários
    const fallbackClosings = getClosings(1);
    const { filtered, exhausted } = filterUnseen(fallbackClosings, seenClosings);
    return { closing: selectRandom(filtered), exhausted };
  }

  const { filtered, exhausted } = filterUnseen(closings, seenClosings);
  return { closing: selectRandom(filtered), exhausted };
}

// ============================================
// HELPER: COMPOSE MESSAGE
// ============================================

/**
 * Compõe mensagem final a partir dos componentes.
 */
function composeMessage(
  opening: OpeningComponent,
  core: CoreComponent,
  closing: ClosingComponent,
  context: {
    trimester: Trimester;
    gestationalWeeks: number;
    zone: EmotionalZone;
    timeOfDay: "morning" | "afternoon" | "evening";
    presenceDays: number;
    babyName: string;
  }
): ComposedMessage {
  const today = new Date().toISOString().split("T")[0];

  // Substituir placeholders se houver (ex: {babyName})
  const openingText = opening.text.replace(/{babyName}/g, context.babyName);
  const coreText = core.text.replace(/{babyName}/g, context.babyName);
  const closingText = closing.text.replace(/{babyName}/g, context.babyName);

  const fullText = `${openingText}\n\n${coreText}\n\n${closingText}`;

  return {
    id: `msg-${today}-z${context.zone}-w${context.gestationalWeeks}`,
    date: today,
    fullText,
    components: {
      openingId: opening.id,
      coreId: core.id,
      closingId: closing.id,
    },
    context: {
      trimester: context.trimester,
      gestationalWeeks: context.gestationalWeeks,
      zone: context.zone,
      timeOfDay: context.timeOfDay,
      presenceDays: context.presenceDays,
      babyName: context.babyName,
    },
    isMilestone: false,
  };
}

/**
 * Compõe mensagem de milestone.
 */
function composeMilestoneMessage(
  milestone: MilestoneMessage,
  context: {
    trimester: Trimester;
    gestationalWeeks: number;
    zone: EmotionalZone;
    timeOfDay: "morning" | "afternoon" | "evening";
    presenceDays: number;
    babyName: string;
  }
): ComposedMessage {
  const today = new Date().toISOString().split("T")[0];

  const text = milestone.text.replace(/{babyName}/g, context.babyName);
  const fullText = `${milestone.emoji ?? ""} ${milestone.title}\n\n${text}`;

  return {
    id: milestone.id,
    date: today,
    fullText,
    components: {
      openingId: milestone.id,
      coreId: milestone.id,
      closingId: milestone.id,
    },
    context: {
      trimester: context.trimester,
      gestationalWeeks: context.gestationalWeeks,
      zone: context.zone,
      timeOfDay: context.timeOfDay,
      presenceDays: context.presenceDays,
      babyName: context.babyName,
    },
    isMilestone: true,
    milestone,
  };
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
// MAIN: GENERATE BABY VOICE MESSAGE
// ============================================

/**
 * Gera mensagem personalizada do bebê.
 *
 * FLUXO:
 * 1. Verificar se há milestone aplicável (PRIORIDADE MÁXIMA)
 * 2. Se não, compor mensagem: Opening + Core + Closing
 * 3. Filtrar mensagens já vistas
 * 4. Retornar IDs para persistência
 *
 * @param input - Contexto do usuário
 * @returns Mensagem composta + IDs para tracking
 */
export function generateBabyVoiceMessage(
  input: BabyVoiceInput
): BabyVoiceOutputV2 {
  const {
    gestationalWeeks,
    zone,
    timeOfDay: rawTimeOfDay,
    presenceDays,
    babyName = "Bebê",
    seenOpenings = [],
    seenCores = [],
    seenClosings = [],
    seenMilestones = [],
    isFirstCheckIn = false,
  } = input;

  // Normalizar inputs
  const trimester = getTrimester(gestationalWeeks);
  const timeOfDay = normalizeTimeOfDay(rawTimeOfDay);

  // Contexto compartilhado
  const context = {
    trimester,
    gestationalWeeks,
    zone,
    timeOfDay,
    presenceDays,
    babyName,
  };

  // ============================================
  // PASSO 1: VERIFICAR MILESTONES (PRIORIDADE MÁXIMA)
  // ============================================

    const milestone = checkMilestone(
    {
      isFirstCheckIn,
      gestationalWeeks,
      presenceDays,
    },
    seenMilestones
  );

  if (milestone) {
    const message = composeMilestoneMessage(milestone, context);

    return {
      message,
      newSeenIds: {
        opening: milestone.id,
        core: milestone.id,
        closing: milestone.id,
        milestone: milestone.id,
      },
      shouldResetSeen: {
        openings: false,
        cores: false,
        closings: false,
      },
      catalogStatus: {
        openingsExhausted: false,
        coresExhausted: false,
        closingsExhausted: false,
      },
    };
  }


  // ============================================
  // PASSO 2: COMPOR MENSAGEM NORMAL
  // ============================================

  // Selecionar Opening (trimestre + hora)
  const { opening, exhausted: openingsExhausted } = selectOpening(
    trimester,
    timeOfDay,
    seenOpenings
  );

  // Selecionar Core (zona + semana)
  const { core, exhausted: coresExhausted } = selectCore(
    zone,
    gestationalWeeks,
    presenceDays,
    seenCores
  );

  // Selecionar Closing (presença)
  const { closing, exhausted: closingsExhausted } = selectClosing(
    presenceDays,
    seenClosings
  );

  // Compor mensagem
  const message = composeMessage(opening, core, closing, context);

  // ============================================
  // PASSO 3: VERIFICAR RESET DE CATÁLOGOS
  // ============================================

  // Calcular limiares de reset (80% do catálogo visto)
  const openingsThreshold = Math.floor(TOTAL_OPENINGS * 0.8);
  const coresThreshold = Math.floor(TOTAL_CORES * 0.8);
  const closingsThreshold = Math.floor(TOTAL_CLOSINGS * 0.8);

  const shouldResetSeen = {
    openings: seenOpenings.length >= openingsThreshold,
    cores: seenCores.length >= coresThreshold,
    closings: seenClosings.length >= closingsThreshold,
  };

  return {
    message,
    newSeenIds: {
      opening: opening.id,
      core: core.id,
      closing: closing.id,
    },
    shouldResetSeen,
    catalogStatus: {
      openingsExhausted,
      coresExhausted,
      closingsExhausted,
    },
  };
}

// ============================================
// HELPER FUNCTIONS (EXPORTS)
// ============================================

/**
 * Calcula total de combinações possíveis.
 */
export function countPossibleCombinations(): number {
  return TOTAL_OPENINGS * TOTAL_CORES * TOTAL_CLOSINGS;
}

/**
 * Retorna estatísticas do catálogo de conteúdo.
 */
export function getContentStats() {
  return {
    openings: TOTAL_OPENINGS,
    cores: TOTAL_CORES,
    closings: TOTAL_CLOSINGS,
    milestones: TOTAL_MILESTONES,
    totalComponents: TOTAL_OPENINGS + TOTAL_CORES + TOTAL_CLOSINGS + TOTAL_MILESTONES,
    possibleCombinations: countPossibleCombinations(),
  };
}

/**
 * Gera mensagem de preview (sem atualizar tracking).
 */
export function generatePreviewMessage(
  zone: EmotionalZone,
  gestationalWeeks: number,
  babyName: string = "Bebê"
): ComposedMessage {
  const output = generateBabyVoiceMessage({
    gestationalWeeks,
    zone,
    babyName,
    timeOfDay: "morning",
    presenceDays: 1,
    seenOpenings: [],
    seenCores: [],
    seenClosings: [],
    seenMilestones: [],
    isFirstCheckIn: false,
  });

  return output.message;
}

/**
 * Verifica se um milestone específico está disponível.
 */
export function isMilestoneAvailable(
  milestoneId: string,
  seenMilestones: string[]
): boolean {
  return !seenMilestones.includes(milestoneId);
}

/**
 * Retorna todos os milestones que a usuária pode ver.
 */
export function getAvailableMilestones(
  gestationalWeeks: number,
  presenceDays: number,
  seenMilestones: string[]
): MilestoneMessage[] {
  return ALL_MILESTONES.filter((m) => {
    // Já visto
    if (seenMilestones.includes(m.id)) return false;

    // Verificar trigger
    switch (m.trigger) {
      case "first_checkin":
        return true; // Sempre disponível se não visto
      case "gestational_week":
        return gestationalWeeks >= (m.triggerValue || 0);
      case "trimester_start":
        const week = m.triggerValue === 2 ? 14 : 28;
        return gestationalWeeks >= week;
      case "presence_days":
        return presenceDays >= (m.triggerValue || 0);
      case "due_date":
        return gestationalWeeks >= 40;
      default:
        return false;
    }
  });
}
/**
 * @fluia/contracts - Baby Voice v2
 * 
 * Sistema de Voz do Bebê com mensagens composicionais únicas.
 * 
 * CONCEITO CENTRAL:
 * O bebê é um personagem que evolui ao longo da gestação,
 * criando vínculo emocional único e intransferível.
 * 
 * SISTEMA COMPOSICIONAL:
 * [Abertura] + [Núcleo] + [Fechamento] = Mensagem Única
 * 30 × 200 × 50 = 300.000+ combinações possíveis
 * 
 * NOMES PADRÃO POR TRIMESTRE:
 * 1º tri: "Semente" (delicado, começando)
 * 2º tri: "Flor" (crescendo, desabrochando)
 * 3º tri: "Fruto" (maduro, pronto)
 * 
 * TOM: Doce e acolhedor
 * GÊNERO: Neutro
 * 
 * REGRAS ÉTICAS (INEGOCIÁVEIS):
 * ❌ Nunca julgar
 * ❌ Nunca cobrar
 * ❌ Nunca comparar
 * ❌ Nunca pressionar
 * ❌ Nunca induzir culpa
 * ❌ Nunca incentivar consumo
 * ❌ Nunca aparecer em tom alarmista
 * ❌ Nunca participar de CTA de compra
 * ❌ Nunca romantizar sofrimento
 * ❌ Nunca contradizer estado reportado
 * ✅ Sempre acolher
 * ✅ Sempre validar
 * ✅ Sempre estar presente
 */

import type { DateKey } from "./shared";

// ============================================
// TIPOS BASE
// ============================================

/**
 * Trimestres da gestação
 */
export type Trimester = 1 | 2 | 3;

/**
 * Período do dia para contextualizar mensagens
 */
export type TimeOfDay = "morning" | "afternoon" | "evening";

/**
 * Zonas emocionais (1 = mais difícil, 5 = mais tranquilo)
 */
export type EmotionalZone = 1 | 2 | 3 | 4 | 5;

/**
 * Tipos de componentes de mensagem
 */
export type MessageComponentType = "opening" | "core" | "closing" | "milestone";

/**
 * Contexto em que a Voz do Bebê aparece
 */
export type BabyVoiceContext =
  | "daily"              // Mensagem diária principal
  | "post-checkin"       // Após check-in
  | "pre-training"       // Antes do treino
  | "post-training"      // Após treino concluído
  | "morning"            // Saudação matinal
  | "evening"            // Reflexão noturna
  | "weekly-reflection"  // Leitura semanal
  | "milestone";         // Marco especial

// ============================================
// NOMES PADRÃO POR TRIMESTRE
// ============================================

/**
 * Nomes carinhosos padrão do bebê por trimestre.
 * Usados quando a mãe não escolhe um nome.
 */
export const DEFAULT_BABY_NAMES: Record<Trimester, string> = {
  1: "Semente",
  2: "Flor",
  3: "Fruto",
};

/**
 * Retorna o nome padrão baseado no trimestre
 */
export function getDefaultBabyName(trimester: Trimester): string {
  return DEFAULT_BABY_NAMES[trimester];
}

/**
 * Retorna o trimestre baseado nas semanas gestacionais
 */
export function getTrimesterFromWeeks(weeks: number): Trimester {
  if (weeks <= 13) return 1;
  if (weeks <= 27) return 2;
  return 3;
}

// ============================================
// COMPONENTES DE MENSAGEM
// ============================================

/**
 * Componente de abertura da mensagem.
 * Varia com: hora do dia + trimestre
 */
export interface OpeningComponent {
  id: string;
  type: "opening";
  timeOfDay: TimeOfDay;
  trimester: Trimester;
  text: string;
}

/**
 * Componente núcleo da mensagem.
 * Varia com: zona emocional + faixa de semanas
 */
export interface CoreComponent {
  id: string;
  type: "core";
  zone: EmotionalZone;
  weekRange: {
    min: number;
    max: number;
  };
  text: string;
}

/**
 * Componente de fechamento da mensagem.
 * Varia com: dias de presença
 */
export interface ClosingComponent {
  id: string;
  type: "closing";
  presenceRange: {
    min: number;
    max: number | null; // null = sem limite superior
  };
  text: string;
}

/**
 * Mensagem de marco especial.
 * Mensagens únicas para momentos específicos.
 */
export interface MilestoneMessage {
  id: string;
  type: "milestone";
  trigger: MilestoneTrigger;
  triggerValue?: number;
  title: string;
  text: string;
  emoji?: string;
}

/**
 * Tipos de gatilhos para marcos especiais
 */
export type MilestoneTrigger =
  | "first_checkin"        // Primeiro check-in
  | "gestational_week"     // Semana gestacional específica
  | "presence_days"        // Dias de presença
  | "trimester_start"      // Início de trimestre
  | "due_date";            // Data provável do parto

// ============================================
// MENSAGEM COMPOSTA
// ============================================

/**
 * Mensagem diária completa, composta de 3 partes.
 */
export interface ComposedMessage {
  /** ID único da mensagem gerada */
  id: string;

  /** Data da mensagem (YYYY-MM-DD) */
  date: string;

  /** Mensagem completa formatada */
  fullText: string;

  /** IDs dos componentes usados (para tracking) */
  components: {
    openingId: string;
    coreId: string;
    closingId: string;
  };

  /** Contexto usado para gerar */
  context: {
    trimester: Trimester;
    gestationalWeeks: number;
    zone: EmotionalZone;
    timeOfDay: TimeOfDay;
    presenceDays: number;
    babyName: string;
  };

  /** Se é uma mensagem de marco especial */
  isMilestone: boolean;
  milestone?: MilestoneMessage;
}

/**
 * Mensagem legada (compatibilidade com código existente)
 */
export interface BabyVoiceMessage {
  /** ID único da mensagem */
  id: string;

  /** Texto da mensagem */
  message: string;

  /** Contexto em que aparece */
  context: BabyVoiceContext;

  /** Tom emocional */
  tone: "gentle" | "warm" | "encouraging" | "celebratory" | "comforting";

  /** Chave do dia */
  dateKey: DateKey;

  /** Timestamp */
  generatedAt: string;
}

/** Response ao buscar voz do bebê */
export interface GetBabyVoiceResponse {
  message: ComposedMessage;
  /** Legado para compatibilidade */
  legacyMessage?: BabyVoiceMessage;
}

// ============================================
// INPUT/OUTPUT DA ENGINE
// ============================================

/**
 * Input para gerar mensagem diária
 */
export interface BabyVoiceInput {
  /** Semanas gestacionais atuais */
  gestationalWeeks: number;

  /** Zona emocional do último check-in (1-5) */
  zone: EmotionalZone;

  /** Hora do dia */
  timeOfDay: TimeOfDay;

  /** Total de dias de presença */
  presenceDays: number;

  /** Nome do bebê (opcional, usa padrão se não informado) */
  babyName?: string;

  /** IDs de aberturas já vistas (para não repetir) */
  seenOpenings: string[];

  /** IDs de núcleos já vistos */
  seenCores: string[];

  /** IDs de fechamentos já vistos */
  seenClosings: string[];

  /** Data do último check-in (para verificar marcos) */
  lastCheckInDate?: string;

  /** É o primeiro check-in? */
  isFirstCheckIn?: boolean;
}

/**
 * Output da engine de mensagem
 */
export interface BabyVoiceOutput {
  /** Mensagem composta completa */
  message: ComposedMessage;

  /** IDs para marcar como vistos */
  newSeenIds: {
    opening: string;
    core: string;
    closing: string;
  };

  /** Se deve resetar alguns "vistos" (ciclo completo) */
  shouldResetSeen?: {
    openings?: boolean;
    cores?: boolean;
    closings?: boolean;
  };
}

// ============================================
// PERFIL DO BEBÊ
// ============================================

/**
 * Dados do bebê no perfil da usuária
 */
export interface BabyProfile {
  /** Nome carinhoso dado pela mãe (opcional) */
  customName?: string;

  /** Semanas gestacionais calculadas */
  gestationalWeeks: number;

  /** Trimestre atual */
  trimester: Trimester;

  /** DPP - Data Provável do Parto */
  dueDate: string;
}

/**
 * Dados de presença da usuária
 */
export interface PresenceData {
  /** Total de dias que abriu o app e fez check-in */
  totalDays: number;

  /** Sequência atual de dias consecutivos */
  currentStreak: number;

  /** Maior sequência já alcançada */
  longestStreak: number;

  /** Data do último check-in (YYYY-MM-DD) */
  lastCheckInDate: string;

  /** Histórico de datas com check-in (últimos 90 dias) */
  checkInDates: string[];
}

/**
 * Dados de tracking da Voz do Bebê
 */
export interface BabyVoiceTracking {
  /** IDs de aberturas já vistas */
  seenOpenings: string[];

  /** IDs de núcleos já vistos */
  seenCores: string[];

  /** IDs de fechamentos já vistos */
  seenClosings: string[];

  /** IDs de marcos já vistos */
  seenMilestones: string[];

  /** Data da última mensagem vista */
  lastMessageDate: string;

  /** ID da última mensagem vista */
  lastMessageId: string;
}

// ============================================
// VALORES PADRÃO
// ============================================

/**
 * Valores padrão para BabyProfile
 */
export function createDefaultBabyProfile(dueDate: string): BabyProfile {
  const gestationalWeeks = calculateGestationalWeeks(dueDate);
  return {
    gestationalWeeks,
    trimester: getTrimesterFromWeeks(gestationalWeeks),
    dueDate,
  };
}

/**
 * Valores padrão para PresenceData
 */
export function createDefaultPresenceData(): PresenceData {
  return {
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: "",
    checkInDates: [],
  };
}

/**
 * Valores padrão para BabyVoiceTracking
 */
export function createDefaultBabyVoiceTracking(): BabyVoiceTracking {
  return {
    seenOpenings: [],
    seenCores: [],
    seenClosings: [],
    seenMilestones: [],
    lastMessageDate: "",
    lastMessageId: "",
  };
}

// ============================================
// REGRAS ÉTICAS (CONGELADAS)
// ============================================

/**
 * Regras de geração da Voz do Bebê.
 * NUNCA ALTERAR ESTES VALORES.
 */
export interface BabyVoiceRules {
  /** Nunca contradizer o estado reportado */
  neverContradictState: true;

  /** Nunca romantizar sofrimento */
  neverRomanticizeSuffering: true;

  /** Nunca gerar culpa */
  neverInduceGuilt: true;

  /** Nunca pressionar */
  neverPressure: true;

  /** Nunca incluir CTA de produto */
  neverIncludeCTA: true;

  /** Nunca julgar */
  neverJudge: true;

  /** Nunca comparar com outras mães */
  neverCompare: true;

  /** Linguagem sempre acolhedora */
  alwaysWelcoming: true;

  /** Conteúdo educativo implícito */
  implicitEducation: true;
}

/** Regras padrão (congeladas - NUNCA ALTERAR) */
export const BABY_VOICE_RULES: BabyVoiceRules = Object.freeze({
  neverContradictState: true,
  neverRomanticizeSuffering: true,
  neverInduceGuilt: true,
  neverPressure: true,
  neverIncludeCTA: true,
  neverJudge: true,
  neverCompare: true,
  alwaysWelcoming: true,
  implicitEducation: true,
});

// ============================================
// HELPERS
// ============================================

/**
 * Retorna o período do dia baseado na hora
 */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

/**
 * Retorna o período do dia atual
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  return getTimeOfDay(new Date().getHours());
}

/**
 * Gera um ID único para mensagem
 */
export function generateMessageId(): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8);
  return `msg_${date}_${random}`;
}

/**
 * Calcula semanas gestacionais a partir do DPP
 */
export function calculateGestationalWeeks(dueDate: string): number {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const now = new Date();

  // DPP é 40 semanas após a última menstruação
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksUntilDue = Math.floor((due.getTime() - now.getTime()) / msPerWeek);
  const gestationalWeeks = 40 - weeksUntilDue;

  return Math.max(1, Math.min(42, gestationalWeeks));
}

/**
 * Verifica se é um novo dia comparando datas
 */
export function isNewDay(lastDate: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return lastDate !== today;
}

/**
 * Retorna a data atual formatada (YYYY-MM-DD)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Retorna o nome do bebê (personalizado ou padrão)
 */
export function getBabyName(
  customName: string | undefined,
  trimester: Trimester
): string {
  return customName || getDefaultBabyName(trimester);
}

// ============================================
// FAIXAS DE SEMANAS
// ============================================

/**
 * Faixas de semanas para seleção de conteúdo
 */
export const WEEK_RANGES = {
  trimester1: [
    { min: 1, max: 6 },   // Início
    { min: 7, max: 10 },  // Formação
    { min: 11, max: 13 }, // Consolidação
  ],
  trimester2: [
    { min: 14, max: 18 }, // Transição
    { min: 19, max: 23 }, // Movimentos
    { min: 24, max: 27 }, // Viabilidade
  ],
  trimester3: [
    { min: 28, max: 32 }, // Preparação
    { min: 33, max: 37 }, // Maturação
    { min: 38, max: 42 }, // Chegada
  ],
} as const;

/**
 * Retorna a faixa de semanas para uma semana específica
 */
export function getWeekRange(weeks: number): { min: number; max: number } {
  const allRanges = [
    ...WEEK_RANGES.trimester1,
    ...WEEK_RANGES.trimester2,
    ...WEEK_RANGES.trimester3,
  ];

  return (
    allRanges.find((range) => weeks >= range.min && weeks <= range.max) ?? {
      min: 38,
      max: 42,
    }
  );
}

// ============================================
// FAIXAS DE PRESENÇA
// ============================================

/**
 * Faixas de dias de presença para seleção de fechamentos
 */
export const PRESENCE_RANGES = [
  { min: 1, max: 3 },       // Início
  { min: 4, max: 7 },       // Primeira semana
  { min: 8, max: 14 },      // Duas semanas
  { min: 15, max: 30 },     // Um mês
  { min: 31, max: 60 },     // Dois meses
  { min: 61, max: 100 },    // Três meses
  { min: 101, max: null },  // Veterana
] as const;

/**
 * Retorna a faixa de presença para um número de dias
 */
export function getPresenceRange(
  days: number
): { min: number; max: number | null } {
  return (
    PRESENCE_RANGES.find(
      (range) => days >= range.min && (range.max === null || days <= range.max)
    ) ?? { min: 101, max: null }
  );
}

// ============================================
// FUNÇÕES DE ATUALIZAÇÃO
// ============================================

/**
 * Atualiza dados de presença após check-in
 */
export function updatePresenceAfterCheckIn(
  current: PresenceData,
  checkInDate: string
): PresenceData {
  // Se já fez check-in hoje, não atualiza
  if (current.lastCheckInDate === checkInDate) {
    return current;
  }

  // Verificar se é dia consecutivo
  const isConsecutive = isNextDay(current.lastCheckInDate, checkInDate);

  const newStreak = isConsecutive ? current.currentStreak + 1 : 1;
  const newTotal = current.totalDays + 1;

  return {
    totalDays: newTotal,
    currentStreak: newStreak,
    longestStreak: Math.max(current.longestStreak, newStreak),
    lastCheckInDate: checkInDate,
    checkInDates: [...current.checkInDates, checkInDate].slice(-90),
  };
}

/**
 * Atualiza tracking após ver mensagem
 */
export function updateBabyVoiceTracking(
  current: BabyVoiceTracking,
  newIds: { openingId: string; coreId: string; closingId: string },
  messageId: string,
  messageDate: string
): BabyVoiceTracking {
  return {
    seenOpenings: addIfNotExists(current.seenOpenings, newIds.openingId),
    seenCores: addIfNotExists(current.seenCores, newIds.coreId),
    seenClosings: addIfNotExists(current.seenClosings, newIds.closingId),
    seenMilestones: current.seenMilestones,
    lastMessageDate: messageDate,
    lastMessageId: messageId,
  };
}

/**
 * Marca um milestone como visto
 */
export function markMilestoneSeen(
  current: BabyVoiceTracking,
  milestoneId: string
): BabyVoiceTracking {
  return {
    ...current,
    seenMilestones: addIfNotExists(current.seenMilestones, milestoneId),
  };
}

// ============================================
// INICIALIZAÇÃO DE CAMPOS NO PERFIL
// ============================================

/**
 * Inicializa campos do Baby Voice no perfil.
 * Chamar após onboarding quando dueDate estiver disponível.
 *
 * MOVIDO DE auth.ts para evitar require() em ESM
 */
export function initializeBabyVoiceFields(
  dueDate: string,
  babyCustomName?: string
): { baby: BabyProfile; presence: PresenceData; babyVoice: BabyVoiceTracking } {
  const baby = createDefaultBabyProfile(dueDate);
  if (babyCustomName) {
    baby.customName = babyCustomName;
  }

  return {
    baby,
    presence: createDefaultPresenceData(),
    babyVoice: createDefaultBabyVoiceTracking(),
  };
}

// ============================================
// HELPERS INTERNOS
// ============================================

/**
 * Verifica se duas datas são dias consecutivos
 */
function isNextDay(previousDate: string, currentDate: string): boolean {
  if (!previousDate) return false;

  const prev = new Date(previousDate);
  const curr = new Date(currentDate);

  prev.setDate(prev.getDate() + 1);

  return prev.toISOString().split("T")[0] === curr.toISOString().split("T")[0];
}

/**
 * Adiciona item ao array se não existir
 */
function addIfNotExists(array: string[], item: string): string[] {
  if (array.includes(item)) return array;
  return [...array, item];
}  
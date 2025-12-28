/**
 * @fluia/contracts - System Types
 * 
 * Tipos relacionados a limites, configurações e governança do sistema.
 * 
 * REGRAS FUNDAMENTAIS:
 * - FLUIA não é médica, não diagnostica
 * - Engines decidem, UI explica
 * - Monetização nunca decide
 */

// ============================================
// LIMITES DO SISTEMA
// ============================================

/**
 * Limites éticos e legais do produto.
 * Sempre retornado em /api/system/limits
 */
export interface SystemLimits {
  /** Não é produto médico */
  notMedical: true;
  
  /** Não faz diagnósticos */
  notDiagnostic: true;
  
  /** Oferece orientação para emergências */
  emergencyGuidance: true;
  
  /** Não substitui profissionais */
  notProfessionalReplacement: true;
  
  /** Não armazena dados clínicos */
  noClinicaDataStorage: true;
}

/** Limites padrão (congelados) */
export const SYSTEM_LIMITS: SystemLimits = {
  notMedical: true,
  notDiagnostic: true,
  emergencyGuidance: true,
  notProfessionalReplacement: true,
  noClinicaDataStorage: true,
};

// ============================================
// DISCLAIMERS
// ============================================

/**
 * Disclaimers obrigatórios.
 */
export interface SystemDisclaimers {
  /** Disclaimer principal */
  main: string;
  
  /** Disclaimer de emergência */
  emergency: string;
  
  /** Disclaimer de privacidade */
  privacy: string;
}

/** Disclaimers padrão */
export const SYSTEM_DISCLAIMERS: SystemDisclaimers = {
  main: "A FLUIA é uma plataforma de educação emocional. Não substitui acompanhamento médico ou psicológico profissional.",
  emergency: "Se você está em crise ou precisa de ajuda urgente, procure o CVV (188) ou um pronto-socorro.",
  privacy: "Seus dados emocionais são protegidos e nunca compartilhados sem seu consentimento explícito.",
};

// ============================================
// CONFIGURAÇÕES DE OUTPUT
// ============================================

/**
 * Níveis de carga emocional dos outputs.
 * 
 * L1: Neutro (check-in, termômetros)
 * L2: Acolhedor (voz do bebê, feedback)
 * L3: Reflexivo (leituras quinzenais) - bloqueado em fragile
 * L4: Acionável (produtos, jornadas) - bloqueado em fragile
 */
export type OutputLevel = "L1" | "L2" | "L3" | "L4";

/**
 * Configuração de output por nível.
 */
export interface OutputLevelConfig {
  level: OutputLevel;
  name: string;
  description: string;
  allowedInFragile: boolean;
  examples: string[];
}

/** Configuração de níveis */
export const OUTPUT_LEVELS: OutputLevelConfig[] = [
  {
    level: "L1",
    name: "Neutro",
    description: "Outputs básicos e informativos",
    allowedInFragile: true,
    examples: ["Check-in", "Termômetros diários"],
  },
  {
    level: "L2",
    name: "Acolhedor",
    description: "Outputs afetivos e de suporte",
    allowedInFragile: true,
    examples: ["Voz do Bebê", "Feedback pós-treino"],
  },
  {
    level: "L3",
    name: "Reflexivo",
    description: "Outputs que exigem processamento emocional",
    allowedInFragile: false,
    examples: ["Leituras quinzenais", "Análises profundas"],
  },
  {
    level: "L4",
    name: "Acionável",
    description: "Outputs que sugerem ações ou compras",
    allowedInFragile: false,
    examples: ["Recomendações de produtos", "Jornadas temáticas"],
  },
];

// ============================================
// FAIL-SAFE
// ============================================

/**
 * Comportamento de fail-safe.
 * Usado quando engines falham ou não há dados suficientes.
 */
export interface FailSafeBehavior {
  /** Output neutro */
  useNeutralOutput: true;
  
  /** Linguagem acolhedora genérica */
  useGenericWelcomingLanguage: true;
  
  /** Nenhuma recomendação */
  noRecommendations: true;
  
  /** Nenhum micromomento */
  noMicromoments: true;
  
  /** Nunca expor erro técnico */
  neverExposeError: true;
}

/** Fail-safe padrão (congelado) */
export const FAIL_SAFE_BEHAVIOR: FailSafeBehavior = {
  useNeutralOutput: true,
  useGenericWelcomingLanguage: true,
  noRecommendations: true,
  noMicromoments: true,
  neverExposeError: true,
};

/**
 * Mensagem genérica de fail-safe.
 */
export const FAIL_SAFE_MESSAGE = 
  "Estamos aqui com você. Se precisar de algo, é só nos procurar. 💜";

// ============================================
// CONFIGURAÇÃO DE TIMEZONE
// ============================================

/**
 * Configuração de timezone e reset diário.
 */
export interface TimezoneConfig {
  /** Timezone padrão (Brasil) */
  defaultTimezone: "America/Sao_Paulo";
  
  /** Hora do reset diário (04:00) */
  dailyResetHour: 4;
  
  /** Locale padrão */
  defaultLocale: "pt-BR";
}

/** Configuração padrão */
export const TIMEZONE_CONFIG: TimezoneConfig = {
  defaultTimezone: "America/Sao_Paulo",
  dailyResetHour: 4,
  defaultLocale: "pt-BR",
};

// ============================================
// CONFIGURAÇÃO DE SESSÃO
// ============================================

/**
 * Configuração de sessão.
 */
export interface SessionConfig {
  /** Nome do cookie */
  cookieName: "__session";
  
  /** Duração em dias (90 dias = 3 meses) */
  maxAgeDays: 90;
  
  /** HttpOnly (segurança) */
  httpOnly: true;
  
  /** Secure em produção */
  secureInProduction: true;
  
  /** SameSite */
  sameSite: "lax";
}

/** Configuração padrão (congelada) */
export const SESSION_CONFIG: SessionConfig = {
  cookieName: "__session",
  maxAgeDays: 90,
  httpOnly: true,
  secureInProduction: true,
  sameSite: "lax",
};

// ============================================
// API RESPONSES PADRÃO
// ============================================

/**
 * Response de erro padrão.
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Response de sucesso padrão.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

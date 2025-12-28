/**
 * @fluia/contracts - Products Types
 * 
 * Tipos relacionados a produtos e recomendações.
 * 
 * REGRA ÉTICA:
 * - Recomendações são sempre OPCIONAIS
 * - Sempre com explicação ("isso pode te ajudar porque...")
 * - Nunca via Voz do Bebê
 * - Nunca em estado vulnerável
 */

import type { MetricKey } from "./shared";

// ============================================
// TIPOS DE PRODUTO
// ============================================

/**
 * Tipos de produtos disponíveis.
 */
export type ProductType = 
  | "digital"   // Conteúdos digitais (áudios, guias)
  | "journey"   // Jornadas temáticas
  | "physical"  // Produtos físicos afiliados
  | "service";  // Serviços parceiros

// ============================================
// PRODUTO
// ============================================

/**
 * Definição de um produto.
 */
export interface Product {
  /** ID único */
  id: string;
  
  /** Tipo */
  type: ProductType;
  
  /** Título */
  title: string;
  
  /** Descrição */
  description: string;
  
  /** Por que pode ajudar (explicação educativa) */
  whyItHelps: string;
  
  /** Métricas que pode impactar */
  relatedMetrics: MetricKey[];
  
  /** É Premium? */
  isPremium: boolean;
  
  /** Preço (se aplicável) */
  price?: ProductPrice;
  
  /** URL de acesso/compra */
  url?: string;
  
  /** Imagem */
  imageUrl?: string;
  
  /** Ativo? */
  isActive: boolean;
  
  /** Tags para busca */
  tags: string[];
}

/**
 * Preço do produto.
 */
export interface ProductPrice {
  /** Valor em centavos (BRL) */
  amountCents: number;
  
  /** Moeda */
  currency: "BRL";
  
  /** Tipo de cobrança */
  billingType: "one_time" | "subscription";
  
  /** Intervalo (se subscription) */
  interval?: "monthly" | "yearly";
}

// ============================================
// RECOMENDAÇÃO
// ============================================

/**
 * Recomendação de produto.
 * Gerada pela Recommendation Engine.
 */
export interface ProductRecommendation {
  /** ID único da recomendação */
  id: string;
  
  /** Produto recomendado */
  product: Product;
  
  /** Por que é relevante AGORA */
  relevanceReason: string;
  
  /** Score de relevância (interno) */
  relevanceScore: number;
  
  /** Contexto que gerou a recomendação */
  context: RecommendationContext;
}

/**
 * Contexto da recomendação.
 */
export interface RecommendationContext {
  /** Tipo de micromomento */
  micromomentType: string;
  
  /** Métricas consideradas */
  consideredMetrics: MetricKey[];
  
  /** Práticas recentes da usuária */
  recentPractices: string[];
}

// ============================================
// RESPONSES
// ============================================

/** Response ao buscar recomendações */
export interface GetRecommendationsResponse {
  /** Lista de recomendações */
  recommendations: ProductRecommendation[];
  
  /** Indica se há recomendações disponíveis */
  hasRecommendations: boolean;
  
  /** Razão se não há recomendações */
  noRecommendationsReason?: string;
}

// ============================================
// CATÁLOGO DE PRODUTOS (Exemplos)
// ============================================

/**
 * Produtos digitais de exemplo.
 */
export const SAMPLE_DIGITAL_PRODUCTS: Partial<Product>[] = [
  {
    id: "audio-breathing-deep",
    type: "digital",
    title: "Áudio: Respiração Profunda",
    description: "10 minutos de respiração guiada para momentos de ansiedade",
    whyItHelps: "Ajuda a ativar o sistema nervoso parassimpático",
    relatedMetrics: ["RE", "RS"],
    isPremium: true,
  },
  {
    id: "guide-sleep-better",
    type: "digital",
    title: "Guia: Sono na Gestação",
    description: "Práticas e dicas para melhorar a qualidade do sono",
    whyItHelps: "Sono adequado fortalece a regulação emocional",
    relatedMetrics: ["RE", "BS"],
    isPremium: true,
  },
];

/**
 * Jornadas temáticas de exemplo.
 */
export const SAMPLE_JOURNEYS: Partial<Product>[] = [
  {
    id: "journey-bond-building",
    type: "journey",
    title: "Jornada: Fortalecendo o Vínculo",
    description: "7 dias de práticas focadas na conexão com seu bebê",
    whyItHelps: "Aprofunda a consciência do vínculo mãe-bebê",
    relatedMetrics: ["CA", "BS"],
    isPremium: true,
  },
  {
    id: "journey-anxiety-relief",
    type: "journey",
    title: "Jornada: Aliviando a Ansiedade",
    description: "5 dias de técnicas para reduzir a ansiedade gestacional",
    whyItHelps: "Constrói repertório de autorregulação",
    relatedMetrics: ["RE", "RS"],
    isPremium: true,
  },
];

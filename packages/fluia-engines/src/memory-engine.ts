/**
 * ============================================
 * ARQUIVO: packages/fluia-engines/src/memory-engine.ts
 * ============================================
 * 
 * FLUIA — Memory & Legacy Engine
 * 
 * Gera produtos de memória e legado.
 * 
 * ❌ Não faz: persistência, decisão de UX, acesso a banco
 * ✅ Faz: transforma dados em memórias, gera conteúdo
 * 
 * CONCEITO:
 * - Memória preserva a jornada emocional
 * - Legado transforma dados em recordações
 * - PREMIUM ONLY
 * 
 * @version 1.0.0
 */

import type {
  DiaryEntry,
  EmotionalDiaryResponse,
  TimelinePoint,
  TimelineSegment,
  VisualTimelineResponse,
  BabyLetter,
  LetterType,
  BookChapter,
  JourneyBook,
  CapsuleItem,
  EmotionalCapsule,
  MemoryGenerationContext,
} from "@fluia/contracts";

// ============================================
// CONSTANTES
// ============================================

const ZONE_EMOJIS: Record<number, string> = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "🙂",
  5: "😊",
};

const ZONE_TITLES: Record<number, string[]> = {
  1: ["Dia difícil", "Tempestade emocional", "Precisei de colo"],
  2: ["Dia nublado", "Cansaço bateu", "Precisei descansar"],
  3: ["Dia neutro", "Seguindo em frente", "Um dia de cada vez"],
  4: ["Dia bom", "Energia boa", "Senti gratidão"],
  5: ["Dia radiante", "Muita alegria", "Coração cheio"],
};

const PILLAR_NAMES: Record<string, string> = {
  BS: "Bem-estar Físico",
  RE: "Regulação Emocional",
  RS: "Resiliência",
  CA: "Conexão & Apoio",
};

const TRIMESTER_NAMES: Record<number, string> = {
  1: "Primeiro Trimestre",
  2: "Segundo Trimestre",
  3: "Terceiro Trimestre",
};

// ============================================
// HELPERS
// ============================================

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTrimester(week: number): 1 | 2 | 3 {
  if (week < 14) return 1;
  if (week < 28) return 2;
  return 3;
}

function getDominantPillar(scores: Record<string, number>): string {
  let max = 0;
  let dominant = "BS";
  for (const [pillar, score] of Object.entries(scores)) {
    if (score > max) {
      max = score;
      dominant = pillar;
    }
  }
  return dominant;
}

function getMoodFromZone(zone: number): string {
  const moods: Record<number, string[]> = {
    1: ["vulnerável", "precisando de apoio", "sensível"],
    2: ["cansada", "introspectiva", "pensativa"],
    3: ["equilibrada", "tranquila", "estável"],
    4: ["otimista", "grata", "esperançosa"],
    5: ["radiante", "plena", "feliz"],
  };
  return randomFrom(moods[zone] || moods[3]);
}

// ============================================
// DIÁRIO EMOCIONAL
// ============================================

interface RawCheckinData {
  date: string;
  zone: number;
  scores: { BS: number; RE: number; RS: number; CA: number };
  gestationalWeek: number;
  practices?: Array<{ type: string; name: string }>;
  babyMessage?: string;
  personalNote?: string;
}

/**
 * Gera diário emocional a partir dos check-ins
 */
export function generateEmotionalDiary(
  checkins: RawCheckinData[],
  context: MemoryGenerationContext
): EmotionalDiaryResponse {
  const entries: DiaryEntry[] = checkins.map((checkin, index) => {
    const zone = checkin.zone || 3;
    
    return {
      entryId: `diary-${checkin.date}-${index}`,
      date: checkin.date,
      gestationalWeek: checkin.gestationalWeek,
      zone,
      scores: checkin.scores,
      emoji: ZONE_EMOJIS[zone] || "😐",
      title: randomFrom(ZONE_TITLES[zone] || ZONE_TITLES[3]),
      summary: generateDaySummary(checkin, context.babyName),
      practices: checkin.practices || [],
      babyMessage: checkin.babyMessage,
      personalNote: checkin.personalNote,
    };
  });

  // Ordenar por data
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calcular estatísticas
  const zones = entries.map((e) => e.zone);
  const avgZone = zones.reduce((a, b) => a + b, 0) / zones.length;
  const bestEntry = entries.reduce((best, e) => (e.zone > best.zone ? e : best), entries[0]);

  // Contar emoções
  const emotionCounts: Record<string, number> = {};
  entries.forEach((e) => {
    const mood = getMoodFromZone(e.zone);
    emotionCounts[mood] = (emotionCounts[mood] || 0) + 1;
  });
  const mostFrequent = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "equilibrada";

  return {
    entries,
    period: {
      startDate: entries[entries.length - 1]?.date || "",
      endDate: entries[0]?.date || "",
      totalDays: entries.length,
      daysWithEntries: entries.length,
    },
    stats: {
      avgZone: Math.round(avgZone * 10) / 10,
      bestDay: { date: bestEntry?.date || "", zone: bestEntry?.zone || 3 },
      mostFrequentEmotion: mostFrequent,
      totalPractices: entries.reduce((sum, e) => sum + e.practices.length, 0),
    },
  };
}

function generateDaySummary(checkin: RawCheckinData, babyName: string): string {
  const zone = checkin.zone || 3;
  const week = checkin.gestationalWeek;
  const practiceCount = checkin.practices?.length || 0;

  const templates: Record<number, string[]> = {
    1: [
      `Dia desafiador na semana ${week}. Você se permitiu sentir e isso é força.`,
      `A semana ${week} trouxe dificuldades, mas você continuou presente.`,
    ],
    2: [
      `Dia de introspecção na semana ${week}. Às vezes precisamos ir mais devagar.`,
      `Semana ${week} com momentos de cansaço. Descansar também é cuidar.`,
    ],
    3: [
      `Dia equilibrado na semana ${week}. Um passo de cada vez.`,
      `Semana ${week} seguindo seu ritmo. Consistência é tudo.`,
    ],
    4: [
      `Dia positivo na semana ${week}! A conexão com ${babyName} se fortalece.`,
      `Semana ${week} com energia boa. Você está radiante!`,
    ],
    5: [
      `Dia incrível na semana ${week}! ${babyName} deve ter sentido toda essa alegria.`,
      `Semana ${week} de plenitude. Momentos assim ficam na memória.`,
    ],
  };

  let summary = randomFrom(templates[zone] || templates[3]);

  if (practiceCount > 0) {
    summary += ` Você fez ${practiceCount} prática${practiceCount > 1 ? "s" : ""}.`;
  }

  return summary;
}

// ============================================
// TIMELINE VISUAL
// ============================================

interface RawTimelineData {
  checkins: RawCheckinData[];
  milestones: Array<{ date: string; type: string; title: string }>;
  practices: Array<{ date: string; type: string; name: string }>;
}

/**
 * Gera timeline visual
 */
export function generateVisualTimeline(
  data: RawTimelineData,
  context: MemoryGenerationContext
): VisualTimelineResponse {
  const points: TimelinePoint[] = [];

  // Adicionar check-ins como pontos
  data.checkins.forEach((checkin, index) => {
    const isHighMoment = checkin.zone >= 4;
    const isLowMoment = checkin.zone <= 2;

    points.push({
      pointId: `checkin-${checkin.date}-${index}`,
      date: checkin.date,
      week: checkin.gestationalWeek,
      type: isHighMoment ? "high_moment" : isLowMoment ? "low_moment" : "checkin",
      title: isHighMoment ? "Momento Alto" : isLowMoment ? "Momento Difícil" : "Check-in",
      description: generateDaySummary(checkin, context.babyName),
      icon: ZONE_EMOJIS[checkin.zone] || "📍",
      color: getZoneColor(checkin.zone),
      intensity: checkin.zone,
      metadata: {
        zone: checkin.zone,
        pillar: getDominantPillar(checkin.scores),
      },
    });
  });

  // Adicionar marcos
  data.milestones.forEach((milestone) => {
    const week = getWeekFromDate(milestone.date, context.dueDate);
    points.push({
      pointId: `milestone-${milestone.date}`,
      date: milestone.date,
      week,
      type: "milestone",
      title: milestone.title,
      description: `Marco alcançado na semana ${week}`,
      icon: "🏆",
      color: "#FFD700",
      intensity: 5,
      metadata: {
        milestoneType: milestone.type,
      },
    });
  });

  // Ordenar por data
  points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Agrupar por trimestre
  const segments = groupByTrimester(points);

  // Identificar highlights
  const highlights = points
    .filter((p) => p.type === "milestone" || p.type === "high_moment")
    .slice(0, 10);

  return {
    segments,
    totalPoints: points.length,
    highlights,
    period: {
      startDate: points[0]?.date || "",
      endDate: points[points.length - 1]?.date || "",
      totalWeeks: Math.ceil(points.length / 7),
    },
  };
}

function getZoneColor(zone: number): string {
  const colors: Record<number, string> = {
    1: "#FF6B6B",
    2: "#FFA06B",
    3: "#FFD93D",
    4: "#7BC47F",
    5: "#9B8DD3",
  };
  return colors[zone] || colors[3];
}

function getWeekFromDate(dateStr: string, dueDate: string): number {
  const date = new Date(dateStr);
  const due = new Date(dueDate);
  const diffMs = due.getTime() - date.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(4, Math.min(42, 40 - diffWeeks));
}

function groupByTrimester(points: TimelinePoint[]): TimelineSegment[] {
  const trimesterPoints: Record<number, TimelinePoint[]> = { 1: [], 2: [], 3: [] };

  points.forEach((point) => {
    const tri = getTrimester(point.week);
    trimesterPoints[tri].push(point);
  });

  const segments: TimelineSegment[] = [];

  for (let tri = 1; tri <= 3; tri++) {
    const triPoints = trimesterPoints[tri as 1 | 2 | 3];
    if (triPoints.length === 0) continue;

    // Cor predominante
    const zoneCounts: Record<number, number> = {};
    triPoints.forEach((p) => {
      if (p.metadata?.zone) {
        zoneCounts[p.metadata.zone] = (zoneCounts[p.metadata.zone] || 0) + 1;
      }
    });
    const dominantZone = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "3";

    segments.push({
      segmentId: `trimester-${tri}`,
      type: "trimester",
      label: TRIMESTER_NAMES[tri as 1 | 2 | 3],
      startDate: triPoints[0].date,
      endDate: triPoints[triPoints.length - 1].date,
      points: triPoints,
      summary: `${triPoints.length} momentos registrados no ${TRIMESTER_NAMES[tri as 1 | 2 | 3].toLowerCase()}`,
      dominantColor: getZoneColor(parseInt(dominantZone)),
    });
  }

  return segments;
}

// ============================================
// CARTAS AO BEBÊ
// ============================================

/**
 * Gera conteúdo de carta ao bebê
 */
export function generateBabyLetter(
  type: LetterType,
  context: MemoryGenerationContext,
  emotionalContext: { zone: number; dominantPillar: string }
): BabyLetter {
  const { babyName, gestationalWeek } = context;
  const mood = getMoodFromZone(emotionalContext.zone);

  const letterTemplates: Record<LetterType, { title: string; content: string }> = {
    first_heartbeat: {
      title: "Quando Ouvi Seu Coração",
      content: `Querido(a) ${babyName},

Hoje foi um dia que nunca vou esquecer. Ouvi seu coraçãozinho batendo pela primeira vez.

Eram batidas rápidas, fortes, cheias de vida. E naquele momento, tudo ficou real. Você existe. Você está aqui, dentro de mim, crescendo.

Chorei. De alegria, de medo, de amor. Tudo junto.

Prometo cuidar de nós dois da melhor forma que eu puder. Você já é tão amado(a).

Com todo meu coração,
Mamãe 💜`,
    },
    first_kick: {
      title: "Seu Primeiro Chute",
      content: `Querido(a) ${babyName},

Você se mexeu! Finalmente senti você de verdade.

Foi como uma bolinha de sabão estourando dentro de mim. Ou talvez uma borboleta. Não sei explicar, mas sei que era você.

Fiquei parada, esperando acontecer de novo. E aconteceu.

Você está aí. Você está vivo(a). Você se comunica comigo do seu jeito.

Estou na semana ${gestationalWeek} e já não consigo imaginar a vida sem você.

Te amo,
Mamãe 💜`,
    },
    weekly: {
      title: `Semana ${gestationalWeek}`,
      content: `Querido(a) ${babyName},

Mais uma semana juntos. Estamos na semana ${gestationalWeek}.

Hoje me senti ${mood}. ${emotionalContext.zone >= 4 ? "Foi um dia bom, cheio de energia e esperança." : emotionalContext.zone <= 2 ? "Foi um dia mais difícil, mas passei por ele pensando em você." : "Foi um dia tranquilo, seguindo nosso ritmo."}

Meu corpo continua mudando para te receber. Às vezes é estranho, às vezes é mágico. Sempre é intenso.

Você está crescendo tanto! Cada semana é uma nova conquista.

Te espero com ansiedade,
Mamãe 💜`,
    },
    monthly: {
      title: `Um Mês a Mais`,
      content: `Querido(a) ${babyName},

Mais um mês se passou. O tempo voa e ao mesmo tempo parece que cada dia é uma eternidade.

Este mês foi de descobertas. Aprendi mais sobre meu corpo, sobre a gravidez, sobre mim mesma. Você me ensina todos os dias, mesmo antes de nascer.

Estou na semana ${gestationalWeek} e cada vez mais perto de te conhecer.

Mal posso esperar,
Mamãe 💜`,
    },
    trimester: {
      title: `Fim do ${TRIMESTER_NAMES[getTrimester(gestationalWeek)]}`,
      content: `Querido(a) ${babyName},

Passamos por mais um trimestre juntos!

${getTrimester(gestationalWeek) === 1 ? "O primeiro trimestre foi intenso. Enjoos, cansaço, medos. Mas também a primeira batida do seu coração, o primeiro ultrassom, a certeza de que você existe." : getTrimester(gestationalWeek) === 2 ? "O segundo trimestre trouxe mais energia. Senti você se mexer, vi seu rostinho no ultrassom, comecei a montar seu cantinho." : "O terceiro trimestre está chegando ao fim. Você está quase pronto(a). Eu também estou me preparando para te receber."}

Cada fase tem suas dificuldades e suas belezas. Com você, tudo vale a pena.

Seguimos juntos,
Mamãe 💜`,
    },
    milestone: {
      title: `Um Marco Especial`,
      content: `Querido(a) ${babyName},

Hoje foi um dia especial. Alcançamos um marco importante na nossa jornada.

Cada conquista, por menor que pareça, é enorme para mim. Porque cada passo nos aproxima do nosso encontro.

Estou orgulhosa de nós.

Com amor,
Mamãe 💜`,
    },
    custom: {
      title: `Carta para ${babyName}`,
      content: `Querido(a) ${babyName},

[Escreva aqui sua mensagem personalizada]

Com amor,
Mamãe 💜`,
    },
  };

  const template = letterTemplates[type] || letterTemplates.custom;

  return {
    letterId: `letter-${type}-${Date.now()}`,
    type,
    createdAt: new Date().toISOString(),
    gestationalWeek,
    title: template.title,
    content: template.content,
    isEdited: false,
    emotionalContext: {
      zone: emotionalContext.zone,
      dominantPillar: emotionalContext.dominantPillar,
      mood,
    },
  };
}

/**
 * Gera sugestões de cartas
 */
export function generateLetterSuggestions(
  existingLetters: BabyLetter[],
  context: MemoryGenerationContext
): Array<{ type: LetterType; title: string; prompt: string; reason: string }> {
  const suggestions: Array<{ type: LetterType; title: string; prompt: string; reason: string }> = [];
  const existingTypes = new Set(existingLetters.map((l) => l.type));

  if (!existingTypes.has("first_heartbeat") && context.gestationalWeek >= 6) {
    suggestions.push({
      type: "first_heartbeat",
      title: "Quando Ouvi Seu Coração",
      prompt: "Escreva sobre o momento em que ouviu o coração do bebê pela primeira vez",
      reason: "Um momento que merece ser registrado",
    });
  }

  if (!existingTypes.has("first_kick") && context.gestationalWeek >= 16) {
    suggestions.push({
      type: "first_kick",
      title: "Seu Primeiro Chute",
      prompt: "Descreva a primeira vez que sentiu o bebê se mexer",
      reason: "A primeira comunicação física com seu bebê",
    });
  }

  // Sempre sugerir carta semanal
  suggestions.push({
    type: "weekly",
    title: `Carta da Semana ${context.gestationalWeek}`,
    prompt: "Como você está se sentindo esta semana?",
    reason: "Registre este momento único da sua jornada",
  });

  return suggestions;
}

// ============================================
// LIVRO DA JORNADA
// ============================================

interface BookGenerationData {
  checkins: RawCheckinData[];
  letters: BabyLetter[];
  milestones: Array<{ date: string; type: string; title: string }>;
  practices: Array<{ date: string; type: string; name: string }>;
}

/**
 * Gera livro da jornada
 */
export function generateJourneyBook(
  data: BookGenerationData,
  context: MemoryGenerationContext
): JourneyBook {
  const chapters: BookChapter[] = [];
  let chapterNumber = 1;

  // Capítulo 1: Introdução
  chapters.push({
    chapterId: `chapter-${chapterNumber}`,
    number: chapterNumber++,
    title: "O Início de Tudo",
    type: "intro",
    content: generateIntroChapter(context),
    dataPoints: 0,
  });

  // Capítulos por trimestre
  for (let tri = 1; tri <= 3; tri++) {
    const triCheckins = data.checkins.filter((c) => getTrimester(c.gestationalWeek) === tri);
    if (triCheckins.length > 0) {
      chapters.push({
        chapterId: `chapter-${chapterNumber}`,
        number: chapterNumber++,
        title: TRIMESTER_NAMES[tri as 1 | 2 | 3],
        type: `trimester_${tri}` as BookChapter["type"],
        content: generateTrimesterChapter(triCheckins, tri as 1 | 2 | 3, context),
        dataPoints: triCheckins.length,
      });
    }
  }

  // Capítulo de Marcos
  if (data.milestones.length > 0) {
    chapters.push({
      chapterId: `chapter-${chapterNumber}`,
      number: chapterNumber++,
      title: "Marcos da Jornada",
      type: "milestones",
      content: generateMilestonesChapter(data.milestones, context),
      dataPoints: data.milestones.length,
    });
  }

  // Capítulo de Cartas
  if (data.letters.length > 0) {
    chapters.push({
      chapterId: `chapter-${chapterNumber}`,
      number: chapterNumber++,
      title: "Cartas para Você",
      type: "letters",
      content: generateLettersChapter(data.letters, context),
      dataPoints: data.letters.length,
    });
  }

  // Capítulo Final
  chapters.push({
    chapterId: `chapter-${chapterNumber}`,
    number: chapterNumber++,
    title: "O Encontro se Aproxima",
    type: "closure",
    content: generateClosureChapter(context),
    dataPoints: 0,
  });

  return {
    bookId: `book-${context.uid}-${Date.now()}`,
    title: `A Jornada de ${context.babyName}`,
    subtitle: `Uma história de amor escrita por ${context.motherName || "Mamãe"}`,
    generatedAt: new Date().toISOString(),
    period: {
      startDate: context.trackingStartDate,
      endDate: new Date().toISOString().split("T")[0],
      totalWeeks: context.gestationalWeek,
    },
    chapters,
    stats: {
      totalCheckins: data.checkins.length,
      totalPractices: data.practices.length,
      totalLetters: data.letters.length,
      avgZone: data.checkins.reduce((sum, c) => sum + c.zone, 0) / data.checkins.length || 3,
    },
    status: "ready",
  };
}

function generateIntroChapter(context: MemoryGenerationContext): string {
  return `Este livro conta a história de uma jornada extraordinária: a espera por ${context.babyName}.

Cada página contém memórias reais, emoções vividas, momentos de alegria e de desafio. Tudo foi registrado com amor durante a gravidez.

${context.babyName}, você foi desejado(a), esperado(a) e amado(a) desde o primeiro momento. Este livro é a prova disso.

Que estas páginas possam te mostrar, um dia, o quanto você sempre foi especial.

Com todo amor do mundo,
${context.motherName || "Mamãe"} 💜`;
}

function generateTrimesterChapter(
  checkins: RawCheckinData[],
  trimester: 1 | 2 | 3,
  context: MemoryGenerationContext
): string {
  const avgZone = checkins.reduce((sum, c) => sum + c.zone, 0) / checkins.length;
  const bestDay = checkins.reduce((best, c) => (c.zone > best.zone ? c : best), checkins[0]);

  const trimesterDescriptions: Record<number, string> = {
    1: "O primeiro trimestre foi de descobertas. Cada sintoma, cada mudança, cada emoção nova.",
    2: "O segundo trimestre trouxe mais energia e conexão. O bebê começou a se fazer presente de forma mais tangível.",
    3: "O terceiro trimestre foi de preparação. O corpo se preparando, o coração se preparando, tudo se alinhando para o grande encontro.",
  };

  return `${trimesterDescriptions[trimester]}

Durante este período, foram registrados ${checkins.length} dias de check-in emocional.

A média emocional foi de ${avgZone.toFixed(1)} (em uma escala de 1 a 5).

O melhor dia foi ${bestDay.date}, um dia de zona ${bestDay.zone} - ${ZONE_EMOJIS[bestDay.zone]}.

Cada dia foi um passo mais perto de ${context.babyName}.`;
}

function generateMilestonesChapter(
  milestones: Array<{ date: string; type: string; title: string }>,
  context: MemoryGenerationContext
): string {
  let content = `Esta jornada foi marcada por conquistas especiais. Cada marco representa um momento único na espera por ${context.babyName}.\n\n`;

  milestones.forEach((m, index) => {
    content += `${index + 1}. **${m.title}** - ${m.date}\n`;
  });

  content += `\nCada um desses momentos está gravado no coração.`;

  return content;
}

function generateLettersChapter(letters: BabyLetter[], context: MemoryGenerationContext): string {
  let content = `Durante a gravidez, ${letters.length} carta${letters.length > 1 ? "s foram escritas" : " foi escrita"} para ${context.babyName}.\n\n`;

  content += `Cada carta captura um momento único, uma emoção específica, um pedaço de amor.\n\n`;

  letters.slice(0, 3).forEach((letter) => {
    content += `---\n\n**${letter.title}** (Semana ${letter.gestationalWeek})\n\n${letter.content.slice(0, 200)}...\n\n`;
  });

  return content;
}

function generateClosureChapter(context: MemoryGenerationContext): string {
  return `${context.babyName},

Esta jornada está chegando ao fim. Mas na verdade, é apenas o começo de outra jornada ainda mais incrível.

Cada página deste livro foi escrita com amor. Cada check-in, cada prática, cada carta - tudo foi feito pensando em você.

Quando você ler isso, saiba que foi amado(a) desde antes de nascer. Cada batida do seu coração era esperada. Cada movimento era celebrado.

Seja bem-vindo(a) ao mundo.

Com amor infinito,
${context.motherName || "Mamãe"} 💜`;
}

// ============================================
// CÁPSULA EMOCIONAL
// ============================================

/**
 * Gera sugestões de itens para cápsula
 */
export function generateCapsuleSuggestions(
  availableData: {
    letters: BabyLetter[];
    milestones: Array<{ type: string; title: string }>;
    highMoments: RawCheckinData[];
  },
  context: MemoryGenerationContext
): CapsuleItem[] {
  const items: CapsuleItem[] = [];

  // Adicionar cartas mais significativas
  availableData.letters.slice(0, 3).forEach((letter) => {
    items.push({
      itemId: `capsule-letter-${letter.letterId}`,
      type: "letter",
      title: letter.title,
      content: letter.content,
      originalDate: letter.createdAt,
      gestationalWeek: letter.gestationalWeek,
    });
  });

  // Adicionar marcos
  availableData.milestones.slice(0, 5).forEach((milestone, index) => {
    items.push({
      itemId: `capsule-milestone-${index}`,
      type: "milestone",
      title: milestone.title,
      content: `Um marco especial da sua jornada: ${milestone.title}`,
      originalDate: new Date().toISOString(),
    });
  });

  // Adicionar mensagem de stats
  items.push({
    itemId: `capsule-stats`,
    type: "stats",
    title: "Números da Nossa Jornada",
    content: `Durante a espera por você:
- ${availableData.letters.length} cartas foram escritas
- ${availableData.milestones.length} marcos foram alcançados
- ${availableData.highMoments.length} dias incríveis foram vividos`,
    originalDate: new Date().toISOString(),
  });

  return items;
}

/**
 * Gera mensagem de abertura da cápsula
 */
export function generateCapsuleOpeningMessage(
  context: MemoryGenerationContext,
  openDate: string
): string {
  const openYear = new Date(openDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsFromNow = openYear - currentYear;

  return `Querido(a) ${context.babyName},

Se você está lendo isso, significa que o tempo passou e você está abrindo esta cápsula especial.

Ela foi preparada com muito amor enquanto você ainda estava na barriga da mamãe, na semana ${context.gestationalWeek}.

${yearsFromNow > 0 ? `Já se passaram ${yearsFromNow} anos desde então.` : ""}

Dentro dela estão memórias, cartas e momentos especiais da sua jornada antes de nascer.

Espero que ao ler isso você sinta todo o amor que sempre existiu por você.

Com carinho eterno,
${context.motherName || "Mamãe"} 💜`;
}

// ============================================
// EXPORTS
// ============================================

export { ZONE_EMOJIS, ZONE_TITLES, PILLAR_NAMES, TRIMESTER_NAMES };
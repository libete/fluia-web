/**
 * FLUIA - Onboarding Page
 *
 * Rota: /gestante/onboarding
 *
 * Coleta dados essenciais da gestante em 5 steps:
 * 0. Boas-vindas (NOVO!)
 * 1. Data Prevista do Parto (DPP)
 * 2. Primeira gestação?
 * 3. Humor baseline + Consentimento
 * 4. Nome carinhoso do bebê (OPCIONAL)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

// ============================================
// TYPES
// ============================================

interface OnboardingData {
  dueDate: string;
  isFirstPregnancy: boolean | null;
  baselineMood: number | null;
  consentHealthData: boolean;
  babyCustomName: string;
}

// ============================================
// CONSTANTS
// ============================================

const TOTAL_STEPS = 5; // Agora são 5 steps (0-4)

const MOOD_OPTIONS = [
  { value: 1, emoji: "😔", label: "Muito difícil" },
  { value: 2, emoji: "😕", label: "Difícil" },
  { value: 3, emoji: "😐", label: "Neutro" },
  { value: 4, emoji: "🙂", label: "Bem" },
  { value: 5, emoji: "😊", label: "Muito bem" },
];

const DEFAULT_BABY_NAMES: Record<number, string> = {
  1: "Semente",
  2: "Flor",
  3: "Fruto",
};

// ============================================
// COMPONENT
// ============================================

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // Começa no 0 (boas-vindas)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    dueDate: "",
    isFirstPregnancy: null,
    baselineMood: null,
    consentHealthData: false,
    babyCustomName: "",
  });

  // Calcular trimestre para mostrar nome padrão
  const getTrimester = (): 1 | 2 | 3 => {
    if (!data.dueDate) return 1;
    const due = new Date(data.dueDate);
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksUntilDue = Math.floor(
      (due.getTime() - now.getTime()) / msPerWeek
    );
    const weeks = 40 - weeksUntilDue;
    if (weeks <= 13) return 1;
    if (weeks <= 27) return 2;
    return 3;
  };

  const defaultBabyName = DEFAULT_BABY_NAMES[getTrimester()];

  // ============================================
  // HANDLERS
  // ============================================

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipBabyName = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: TOTAL_STEPS,
          data: {
            dueDate: data.dueDate,
            isFirstPregnancy: data.isFirstPregnancy,
            baselineMood: data.baselineMood,
            consentHealthData: data.consentHealthData,
            babyCustomName: data.babyCustomName || undefined,
            onboardingCompleted: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar dados");
      }

      router.push("/gestante/bussola");
    } catch (err) {
      setError("Ocorreu um erro. Tente novamente.");
      console.error("Onboarding error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // VALIDATION
  // ============================================

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return true; // Boas-vindas sempre pode avançar
      case 1:
        return !!data.dueDate;
      case 2:
        return data.isFirstPregnancy !== null;
      case 3:
        return data.baselineMood !== null && data.consentHealthData;
      case 4:
        return true; // Opcional
      default:
        return false;
    }
  };

  // ============================================
  // RENDER STEPS
  // ============================================

  const renderStep0 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepIcon}>🌸</div>
      <h2 className={styles.stepTitle}>Bem-vinda à FLUIA</h2>
      <p className={styles.stepDescription}>
        Estamos felizes em acompanhar você nessa jornada tão especial.
      </p>
      <p className={styles.stepDescription}>
        Vamos conhecer um pouquinho sobre você para personalizar sua experiência
        de forma única e acolhedora.
      </p>
      <div className={styles.welcomeHighlights}>
        <div className={styles.highlightItem}>
          <span className={styles.highlightIcon}>💜</span>
          <span>Sem julgamentos, apenas acolhimento</span>
        </div>
        <div className={styles.highlightItem}>
          <span className={styles.highlightIcon}>🔒</span>
          <span>Seus dados são privados e protegidos</span>
        </div>
        <div className={styles.highlightItem}>
          <span className={styles.highlightIcon}>✨</span>
          <span>Experiência personalizada para você</span>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepIcon}>📅</div>
      <h2 className={styles.stepTitle}>Qual a data prevista do parto?</h2>
      <p className={styles.stepDescription}>
        Essa informação nos ajuda a personalizar sua experiência.
      </p>

      <input
        type="date"
        className={styles.dateInput}
        value={data.dueDate}
        onChange={(e) => setData({ ...data, dueDate: e.target.value })}
        min={new Date().toISOString().split("T")[0]}
        max={
          new Date(Date.now() + 280 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        }
      />

      {data.dueDate && (
        <p className={styles.weekInfo}>
          📅 Você está na semana {40 - Math.floor((new Date(data.dueDate).getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000))}
        </p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepIcon}>👶</div>
      <h2 className={styles.stepTitle}>É sua primeira gestação?</h2>
      <p className={styles.stepDescription}>
        Cada jornada é única, mas podemos adaptar o conteúdo.
      </p>

      <div className={styles.optionsRow}>
        <button
          className={`${styles.optionButton} ${
            data.isFirstPregnancy === true ? styles.selected : ""
          }`}
          onClick={() => setData({ ...data, isFirstPregnancy: true })}
        >
          Sim, é a primeira
        </button>
        <button
          className={`${styles.optionButton} ${
            data.isFirstPregnancy === false ? styles.selected : ""
          }`}
          onClick={() => setData({ ...data, isFirstPregnancy: false })}
        >
          Não, já tive outras
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepIcon}>💜</div>
      <h2 className={styles.stepTitle}>Como você está se sentindo?</h2>
      <p className={styles.stepDescription}>
        Não existe resposta certa. Seja honesta consigo mesma.
      </p>

      <div className={styles.moodGrid}>
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`${styles.moodButton} ${
              data.baselineMood === option.value ? styles.selected : ""
            }`}
            onClick={() => setData({ ...data, baselineMood: option.value })}
          >
            <span className={styles.moodEmoji}>{option.emoji}</span>
            <span className={styles.moodLabel}>{option.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.consentSection}>
        <label className={styles.consentLabel}>
          <input
            type="checkbox"
            checked={data.consentHealthData}
            onChange={(e) =>
              setData({ ...data, consentHealthData: e.target.checked })
            }
          />
          <span>
            Concordo em compartilhar meus dados de bem-estar emocional para
            receber recomendações personalizadas.
          </span>
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepIcon}>🌱</div>
      <h2 className={styles.stepTitle}>Quer dar um nome carinhoso ao bebê?</h2>
      <p className={styles.stepDescription}>
        Esse nome aparecerá nas mensagens diárias. Pode ser um apelido, um nome
        que você está considerando, ou deixar em branco.
      </p>

      <div className={styles.babyNameSection}>
        <input
          type="text"
          className={styles.textInput}
          placeholder={`Se preferir, usaremos "${defaultBabyName}"`}
          value={data.babyCustomName}
          onChange={(e) => setData({ ...data, babyCustomName: e.target.value })}
          maxLength={20}
        />

        <p className={styles.babyNameHint}>
          {data.babyCustomName ? (
            <>
              As mensagens dirão: <em>"{data.babyCustomName} diz..."</em>
            </>
          ) : (
            <>
              Sem nome, usaremos:{" "}
              <em>
                "{defaultBabyName}" (1º tri), "Flor" (2º tri), "Fruto" (3º tri)
              </em>
            </>
          )}
        </p>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          {currentStep === 0 ? "Bem-vinda!" : `Passo ${currentStep} de ${TOTAL_STEPS - 1}`}
        </div>

        {/* Step content */}
        {currentStep === 0 && renderStep0()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Error message */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Navigation */}
        <div className={styles.navigation}>
          {currentStep > 0 && (
            <button
              className={styles.backButton}
              onClick={handleBack}
              disabled={isLoading}
            >
              ← Voltar
            </button>
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <button
              className={styles.nextButton}
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
            >
              {currentStep === 0 ? "Começar 💜" : "Continuar →"}
            </button>
          ) : (
            <div className={styles.finishButtons}>
              <button
                className={styles.skipButton}
                onClick={handleSkipBabyName}
                disabled={isLoading}
              >
                Pular
              </button>
              <button
                className={styles.finishButton}
                onClick={handleFinish}
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Começar minha jornada! 💜"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
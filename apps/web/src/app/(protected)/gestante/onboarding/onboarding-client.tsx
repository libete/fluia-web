"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";

interface OnboardingClientProps {
  uid: string;
  currentStep: number;
  displayName: string | null;
}

const TOTAL_STEPS = 4;

export default function OnboardingClient({
  uid,
  currentStep,
  displayName,
}: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(currentStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [dueDate, setDueDate] = useState("");
  const [isFirstPregnancy, setIsFirstPregnancy] = useState<boolean | null>(null);
  const [baselineMood, setBaselineMood] = useState<number>(3);
  const [consentHealth, setConsentHealth] = useState(false);

  async function saveStep(stepData: Record<string, unknown>, nextStep: number) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: nextStep,
          data: stepData,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar");
      }

      if (nextStep >= TOTAL_STEPS) {
        // Onboarding completo
        router.replace("/gestante/bussola");
      } else {
        setStep(nextStep);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className={styles.step}>
            <h2>Olá{displayName ? `, ${displayName.split(" ")[0]}` : ""}! 👋</h2>
            <p>
              Bem-vinda à FLUIA. Vamos personalizar sua experiência em alguns
              passos rápidos.
            </p>
            <button
              className={styles.buttonPrimary}
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Começar
            </button>
          </div>
        );

      case 1:
        return (
          <div className={styles.step}>
            <h2>Quando seu bebê deve nascer?</h2>
            <p>Isso nos ajuda a personalizar o conteúdo para cada fase.</p>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={styles.input}
              min={new Date().toISOString().split("T")[0]}
            />
            <div className={styles.buttons}>
              <button
                className={styles.buttonSecondary}
                onClick={() => setStep(0)}
              >
                Voltar
              </button>
              <button
                className={styles.buttonPrimary}
                onClick={() => saveStep({ dueDate }, 2)}
                disabled={!dueDate || loading}
              >
                {loading ? "Salvando..." : "Continuar"}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.step}>
            <h2>Esta é sua primeira gestação?</h2>
            <div className={styles.options}>
              <button
                className={`${styles.option} ${isFirstPregnancy === true ? styles.selected : ""}`}
                onClick={() => setIsFirstPregnancy(true)}
              >
                Sim, é a primeira
              </button>
              <button
                className={`${styles.option} ${isFirstPregnancy === false ? styles.selected : ""}`}
                onClick={() => setIsFirstPregnancy(false)}
              >
                Não, já tive outras
              </button>
            </div>
            <div className={styles.buttons}>
              <button
                className={styles.buttonSecondary}
                onClick={() => setStep(1)}
              >
                Voltar
              </button>
              <button
                className={styles.buttonPrimary}
                onClick={() => saveStep({ isFirstPregnancy }, 3)}
                disabled={isFirstPregnancy === null || loading}
              >
                {loading ? "Salvando..." : "Continuar"}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.step}>
            <h2>Como você está se sentindo?</h2>
            <p>De modo geral, neste momento da sua vida.</p>
            <div className={styles.moodScale}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={`${styles.moodButton} ${baselineMood === value ? styles.selected : ""}`}
                  onClick={() => setBaselineMood(value)}
                >
                  {getMoodEmoji(value)}
                  <span>{getMoodLabel(value)}</span>
                </button>
              ))}
            </div>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={consentHealth}
                onChange={(e) => setConsentHealth(e.target.checked)}
              />
              <span>
                Concordo com o uso dos meus dados de saúde para personalização
                da experiência
              </span>
            </label>
            <div className={styles.buttons}>
              <button
                className={styles.buttonSecondary}
                onClick={() => setStep(2)}
              >
                Voltar
              </button>
              <button
                className={styles.buttonPrimary}
                onClick={() =>
                  saveStep(
                    {
                      baselineMood,
                      consentHealthData: consentHealth,
                      onboardingCompleted: true,
                    },
                    4
                  )
                }
                disabled={!consentHealth || loading}
              >
                {loading ? "Finalizando..." : "Concluir"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Progress */}
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Step content */}
        {renderStep()}
      </div>
    </div>
  );
}

function getMoodEmoji(value: number): string {
  const emojis = ["😔", "😕", "😐", "🙂", "😊"];
  return emojis[value - 1] || "😐";
}

function getMoodLabel(value: number): string {
  const labels = ["Difícil", "Baixo", "Neutro", "Bem", "Ótimo"];
  return labels[value - 1] || "Neutro";
}

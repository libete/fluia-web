/**
 * FLUIA - Bússola Gestante (Hub) v6.0
 *
 * CORREÇÕES v6.0:
 * - ✅ Botão termômetros após dia completo
 * - ✅ Removido botão duplicado
 * - ✅ Estrutura limpa
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { PresenceTracker } from "@/components/PresenceTracker";
import type { PresenceData } from "@fluia/contracts";
import styles from "./page.module.css";

// ============================================
// TYPES
// ============================================

interface DailyData {
  babyName: string;
  presenceDays: number;
  presence: PresenceData | null;
  hasCheckedInToday: boolean;
  hasPracticeToday: boolean;
  dayCompleted: boolean;
  lastZone: number;
  metrics: {
    RE: number;
    BS: number;
    RS: number;
    CA: number;
  } | null;
}

// ============================================
// HELPERS
// ============================================

function getZoneLabel(value: number): string {
  if (value <= 40) return "Baixa";
  if (value <= 70) return "Em equilíbrio";
  return "Fortalecida";
}

function getZoneColor(value: number): string {
  if (value <= 40) return "#f59e0b";
  if (value <= 70) return "#8b5cf6";
  return "#10b981";
}

// ============================================
// COMPONENT
// ============================================

export default function BussolaPage() {
  const router = useRouter();
  const { canAccessPremium } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyData>({
    babyName: "Semente",
    presenceDays: 0,
    presence: null,
    hasCheckedInToday: false,
    hasPracticeToday: false,
    dayCompleted: false,
    lastZone: 3,
    metrics: null,
  });

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchDailyData = useCallback(async () => {
    try {
      setIsLoading(true);

      const statusResponse = await fetch("/api/checkin");
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();

        const today = new Date().toISOString().split("T")[0];
        const isToday =
          statusData.hasCheckin && statusData.dateKey === today;

        const hasRecovery =
          isToday && !!statusData.checkin?.recovery;

        setDailyData((prev) => ({
          ...prev,
          hasCheckedInToday: isToday,
          hasPracticeToday: hasRecovery,
          dayCompleted: hasRecovery,
          lastZone: isToday
            ? statusData.checkin?.emotionalState?.zone || 3
            : 3,
          metrics: isToday
            ? statusData.checkin?.metrics || null
            : null,
          presence: null,
          presenceDays: 0,
        }));
      } else {
        setDailyData((prev) => ({
          ...prev,
          hasCheckedInToday: false,
          hasPracticeToday: false,
          dayCompleted: false,
          lastZone: 3,
          metrics: null,
        }));
      }
    } catch (err) {
      console.error("Error fetching daily data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleStartCheckin = () => {
    router.push("/gestante/checkin");
  };

  const handleGoToPrescription = () => {
    router.push("/gestante/prescricao");
  };

  const handleViewThermometers = () => {
    router.push("/gestante/termometros");
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getZoneEmoji = (zone: number) => {
    const emojis = { 1: "😔", 2: "😕", 3: "😐", 4: "🙂", 5: "😊" };
    return emojis[zone as keyof typeof emojis] || "😐";
  };

  const getDayStatusMessage = () => {
    if (dailyData.dayCompleted) {
      return "Você cuidou de vocês duas hoje. 💜";
    }
    if (dailyData.hasPracticeToday) {
      return "Prática feita! Pode fazer outra ou relaxar.";
    }
    if (dailyData.hasCheckedInToday) {
      return "Check-in feito! Vamos escolher sua prática?";
    }
    return "Vamos começar seu dia com um check-in?";
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.greeting}>{getGreeting()} 💜</h1>
          {dailyData.presence && (
            <PresenceTracker
              presence={dailyData.presence}
              variant="mini"
              className={styles.presenceMini}
            />
          )}
        </header>

        {/* Status Message */}
        <section className={styles.statusMessage}>
          <p className={styles.statusText}>{getDayStatusMessage()}</p>
        </section>

        {/* Day Completed Badge + Sufficiency Card + Termômetros */}
        {dailyData.dayCompleted && (
          <>
            <section className={styles.completedBadge}>
              <span className={styles.completedEmoji}>✨</span>
              <span className={styles.completedText}>Dia Completo</span>
            </section>

            <section className={styles.sufficiencyCard}>
              <span className={styles.sufficiencyEmoji}>💜</span>
              <p className={styles.sufficiencyText}>
                Uma prática já faz diferença. Mais práticas são bem-vindas, sem pressão.
              </p>
            </section>

            {/* Botão termômetros após dia completo */}
            <button
              className={styles.thermometersButton}
              onClick={handleViewThermometers}
            >
              🌡️ Ver seus termômetros de hoje
            </button>
          </>
        )}

        {/* Status do dia */}
        <section className={styles.statusSection}>
          <h2 className={styles.sectionTitle}>Seu dia</h2>

          <div className={styles.statusCards}>
            {/* Check-in */}
            <div
              className={`${styles.statusCard} ${
                dailyData.hasCheckedInToday ? styles.completed : ""
              }`}
            >
              <div className={styles.statusIcon}>
                {dailyData.hasCheckedInToday ? "✅" : "📋"}
              </div>
              <div className={styles.statusContent}>
                <span className={styles.statusLabel}>
                  {dailyData.hasCheckedInToday
                    ? "Check-in feito"
                    : "Check-in do dia"}
                </span>
                {dailyData.hasCheckedInToday && (
                  <span className={styles.statusZone}>
                    {getZoneEmoji(dailyData.lastZone)} Zona{" "}
                    {dailyData.lastZone}
                  </span>
                )}
              </div>
              {!dailyData.hasCheckedInToday && (
                <button
                  className={styles.actionButton}
                  onClick={handleStartCheckin}
                >
                  Fazer agora
                </button>
              )}
            </div>

            {/* Prática */}
            <div
              className={`${styles.statusCard} ${
                dailyData.hasPracticeToday ? styles.completed : ""
              }`}
            >
              <div className={styles.statusIcon}>
                {dailyData.hasPracticeToday ? "✅" : "🧘"}
              </div>
              <div className={styles.statusContent}>
                <span className={styles.statusLabel}>
                  {dailyData.hasPracticeToday
                    ? "Prática realizada"
                    : "Prática do dia"}
                </span>
                <span className={styles.statusHint}>2–5 min</span>
              </div>
              {dailyData.hasCheckedInToday && !dailyData.hasPracticeToday && (
                <button
                  className={styles.actionButton}
                  onClick={handleGoToPrescription}
                >
                  Ver prescrição
                </button>
              )}
              {dailyData.hasPracticeToday && canAccessPremium && (
                <button
                  className={styles.actionButtonSecondary}
                  onClick={handleGoToPrescription}
                >
                  Fazer outra
                </button>
              )}
              {dailyData.hasPracticeToday && !canAccessPremium && (
                <span className={styles.premiumHint}>
                  ✨ Premium
                </span>
              )}
              {!dailyData.hasCheckedInToday && (
                <button
                  className={styles.actionButton}
                  disabled
                >
                  Após check-in
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Métricas como ZONAS - só mostra se tem check-in E NÃO completou dia */}
        {dailyData.metrics && !dailyData.dayCompleted && (
          <section className={styles.metricsSection}>
            <h2 className={styles.sectionTitle}>Seus termômetros</h2>
            <div className={styles.zonesGrid}>
              <div className={styles.zoneItem}>
                <span className={styles.zoneLabel}>Regulação Emocional</span>
                <span
                  className={styles.zoneValue}
                  style={{ color: getZoneColor(dailyData.metrics.RE) }}
                >
                  {getZoneLabel(dailyData.metrics.RE)}
                </span>
              </div>
              <div className={styles.zoneItem}>
                <span className={styles.zoneLabel}>Base de Segurança</span>
                <span
                  className={styles.zoneValue}
                  style={{ color: getZoneColor(dailyData.metrics.BS) }}
                >
                  {getZoneLabel(dailyData.metrics.BS)}
                </span>
              </div>
              <div className={styles.zoneItem}>
                <span className={styles.zoneLabel}>Resiliência</span>
                <span
                  className={styles.zoneValue}
                  style={{ color: getZoneColor(dailyData.metrics.RS) }}
                >
                  {getZoneLabel(dailyData.metrics.RS)}
                </span>
              </div>
              <div className={styles.zoneItem}>
                <span className={styles.zoneLabel}>Conexão Afetiva</span>
                <span
                  className={styles.zoneValue}
                  style={{ color: getZoneColor(dailyData.metrics.CA) }}
                >
                  {getZoneLabel(dailyData.metrics.CA)}
                </span>
              </div>
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            💜 Cada momento de presença é uma vitória.
          </p>
        </footer>
      </main>
    </div>
  );
}
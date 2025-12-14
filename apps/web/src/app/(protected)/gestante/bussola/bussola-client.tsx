"use client";

import { useRouter } from "next/navigation";
import styles from "./bussola.module.css";

interface BussolaClientProps {
  displayName: string | null;
  gestationalWeek: number | null;
  dateKey: string;
  timezone: string;
}

export default function BussolaClient({
  displayName,
  gestationalWeek,
  dateKey,
  timezone,
}: BussolaClientProps) {
  const router = useRouter();
  const firstName = displayName?.split(" ")[0] || "Mamãe";

  // TODO: Buscar sessão diária do Firestore
  // Por enquanto, estado inicial sempre é check-in
  const currentStage = "checkin";

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/entrar");
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.greeting}>Olá, {firstName}! 💜</h1>
            {gestationalWeek && (
              <p className={styles.week}>Semana {gestationalWeek} de gestação</p>
            )}
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        {/* Card principal - próxima ação */}
        <div className={styles.actionCard}>
          <div className={styles.actionIcon}>🌅</div>
          <h2 className={styles.actionTitle}>Bom dia!</h2>
          <p className={styles.actionDescription}>
            Vamos começar o dia com um check-in emocional?
          </p>
          <button className={styles.actionButton}>
            Fazer Check-in
          </button>
        </div>

        {/* Status do dia */}
        <div className={styles.statusCard}>
          <h3 className={styles.statusTitle}>Seu dia</h3>
          <div className={styles.statusList}>
            <StatusItem
              icon="✓"
              label="Check-in"
              status={currentStage === "checkin" ? "current" : "pending"}
            />
            <StatusItem icon="○" label="Prescrição" status="pending" />
            <StatusItem icon="○" label="Prática" status="pending" />
            <StatusItem icon="○" label="Reflexão" status="pending" />
          </div>
        </div>

        {/* Debug info (remover em prod) */}
        <div className={styles.debugInfo}>
          <p>Data: {dateKey}</p>
          <p>Timezone: {timezone}</p>
        </div>
      </main>
    </div>
  );
}

function StatusItem({
  icon,
  label,
  status,
}: {
  icon: string;
  label: string;
  status: "done" | "current" | "pending";
}) {
  return (
    <div className={`${styles.statusItem} ${styles[status]}`}>
      <span className={styles.statusIcon}>{icon}</span>
      <span className={styles.statusLabel}>{label}</span>
    </div>
  );
}

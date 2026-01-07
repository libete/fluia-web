"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithGoogle, handleRedirectResult } from "@fluia/firebase/client";
import styles from "./entrar.module.css";

type PageState = "idle" | "processing" | "redirecting" | "error";

function EntrarPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PageState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Processa resultado do redirect ao montar
  useEffect(() => {
    async function processRedirect() {
      try {
        setState("processing");

        const idToken = await handleRedirectResult();

        if (!idToken) {
          // Não veio de um redirect, estado normal
          setState("idle");
          return;
        }

        // Envia token para criar sessão
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Falha ao criar sessão");
        }

        setState("redirecting");

        // Redireciona para destino ou bússola
        const redirectTo = searchParams.get("redirect") || "/gestante/bussola";
        router.replace(redirectTo);
      } catch (err) {
        console.error("[Entrar] Error processing redirect:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setState("error");
      }
    }

    processRedirect();
  }, [router, searchParams]);

  // Inicia login com Google
  async function handleLogin() {
    try {
      setError(null);
      setState("processing");
      
      // loginWithGoogle retorna idToken se Popup, null se Redirect
      const idToken = await loginWithGoogle();
      
      if (idToken) {
        // Popup: criar sessão imediatamente
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Falha ao criar sessão");
        }

        setState("redirecting");
        const redirectTo = searchParams.get("redirect") || "/gestante/bussola";
        router.replace(redirectTo);
      }
      // Se Redirect, a página vai recarregar e processar em useEffect
    } catch (err) {
      console.error("[Entrar] Error starting login:", err);
      setError(err instanceof Error ? err.message : "Erro ao iniciar login");
      setState("error");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo/Header */}
        <div className={styles.header}>
          <h1 className={styles.logo}>FLUIA</h1>
          <p className={styles.subtitle}>Bússola Gestante</p>
        </div>

        {/* Conteúdo baseado no estado */}
        <div className={styles.content}>
          {state === "processing" && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Processando...</p>
            </div>
          )}

          {state === "redirecting" && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Entrando...</p>
            </div>
          )}

          {state === "error" && (
            <div className={styles.error}>
              <p>{error}</p>
              <button
                className={styles.buttonSecondary}
                onClick={() => {
                  setError(null);
                  setState("idle");
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {state === "idle" && (
            <>
              <p className={styles.description}>
                Sua companheira de bem-estar emocional durante a gestação
              </p>

              <button
                className={styles.buttonGoogle}
                onClick={handleLogin}
              >
                <GoogleIcon />
                Entrar com Google
              </button>

              <p className={styles.terms}>
                Ao entrar, você concorda com nossos{" "}
                <a href="/termos">Termos de Uso</a> e{" "}
                <a href="/privacidade">Política de Privacidade</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.logo}>FLUIA</h1>
            <p className={styles.subtitle}>Bússola Gestante</p>
          </div>
          <div className={styles.content}>
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <EntrarPageContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
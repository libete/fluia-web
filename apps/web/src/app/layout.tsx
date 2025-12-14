import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLUIA - Bússola Gestante",
  description: "Sua companheira de bem-estar emocional durante a gestação",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

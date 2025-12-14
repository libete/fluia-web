/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile o pacote firebase do monorepo
  transpilePackages: ["@fluia/firebase"],

  // Headers de segurança
  async headers() {
    // Em desenvolvimento: sem headers COOP/COEP (quebram OAuth)
    if (process.env.NODE_ENV === "development") {
      return [];
    }

    // Em produção: COOP/COEP em todas as rotas EXCETO auth
    return [
      {
        // Aplica em todas as rotas exceto /entrar e /__/auth/*
        source: "/((?!entrar|__\\/auth).*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Redireciona raiz para entrar (temporário, até ter landing page)
      {
        source: "/",
        destination: "/entrar",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

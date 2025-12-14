# FLUIA - Plataforma de Cuidado Emocional Perinatal

## 🚀 Setup Rápido

### Pré-requisitos

- Node.js 20.x (LTS)
- pnpm 9.x
- Projeto Firebase `fluia-c3f93` configurado

### 1. Instalar dependências

```bash
cd fluia-web
pnpm install
```

### 2. Configurar variáveis de ambiente

O arquivo `apps/web/.env.local` já vem configurado com as credenciais do projeto `fluia-c3f93`.

Se precisar editar:
```bash
notepad apps\web\.env.local
```

### 3. Configurar Firebase Admin (Service Account)

1. Firebase Console → Project Settings → Service Accounts
2. Clique "Generate new private key"
3. Salve como `service-account.json` na raiz do projeto (`fluia-web/service-account.json`)
4. **⚠️ NÃO commitar este arquivo!** (já está no .gitignore)

### 4. Build do pacote Firebase

```bash
pnpm --filter @fluia/firebase build
```

### 5. Rodar em desenvolvimento

```bash
pnpm dev
```

Acesse: `http://localhost:3000`

---

## ✅ Checkpoints de Teste

### Checkpoint 1: App sobe
```
✔️ http://localhost:3000 abre
✔️ Redireciona para /entrar
✔️ Página de login aparece
```

### Checkpoint 2: Login com Google
```
✔️ Clicar "Entrar com Google"
✔️ Redireciona para Google
✔️ Volta para /entrar
✔️ Processa e redireciona
```

### Checkpoint 3: Sessão criada
```
✔️ Cookie __session existe (DevTools → Application → Cookies)
✔️ Redireciona para /gestante/onboarding (primeiro acesso)
✔️ Ou /gestante/bussola (se onboarding completo)
```

### Checkpoint 4: Proteção de rotas
```
✔️ Acessar /gestante/bussola sem login → redireciona para /entrar
✔️ Após login → acessa normalmente
```

---

## 📁 Estrutura do Projeto

```
fluia-web/
├── apps/
│   └── web/                    # Next.js 15 App
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   └── entrar/         # Página de login
│       │   │   ├── (protected)/
│       │   │   │   └── gestante/
│       │   │   │       ├── onboarding/ # Onboarding
│       │   │   │       └── bussola/    # Hub diário
│       │   │   ├── api/
│       │   │   │   └── auth/
│       │   │   │       ├── session/    # Criar/deletar sessão
│       │   │   │       └── onboarding/ # Salvar onboarding
│       │   │   └── layout.tsx
│       │   ├── lib/
│       │   │   └── auth/
│       │   │       └── guard.ts        # SSR Guards
│       │   └── middleware.ts           # Proteção de rotas
│       ├── .env.local                  # Credenciais (não commitar)
│       └── next.config.mjs
├── packages/
│   └── firebase/               # Firebase Client + Admin
│       └── src/
│           ├── client.ts       # Browser SDK
│           ├── admin.ts        # Server SDK
│           ├── auth.ts         # Funções de auth/perfil
│           └── index.ts        # Exports
├── service-account.json        # Chave privada (não commitar)
├── .env.example
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 🔐 Arquitetura de Autenticação

```
[/entrar]
    ↓ click "Entrar com Google"
[Google OAuth - Redirect]
    ↓ 
[/entrar - processa resultado]
    ↓ POST /api/auth/session
[Backend cria cookie __session]
    ↓
[Middleware verifica cookie]
    ↓
[SSR Guard verifica + cria perfil]
    ↓
[/gestante/onboarding ou /gestante/bussola]
```

---

## 📝 Decisões Técnicas

| Item | Valor | Motivo |
|------|-------|--------|
| Sessão | 90 dias | Vínculo, zero fricção |
| Timezone | America/Sao_Paulo | Saúde emocional ≠ UTC |
| Reset do dia | 04:00 | Padrão Calm/sono |
| OAuth | Redirect | Mais confiável que Popup |
| Cookie | HttpOnly | Segurança SSR |

---

## 🐛 Troubleshooting

### Erro: "No service account found"
→ Verifique se `service-account.json` existe na raiz

### Erro: "Firebase ID token has expired"
→ Token expirou durante o processo, tente login novamente

### Popup bloqueado / não abre
→ O fluxo usa Redirect, não Popup. Se algo bloquear, limpe cookies e tente novamente.

### Redirect infinito
→ Verifique se os domínios estão autorizados no Firebase Console

### Cookie não é criado
→ Verifique se `secure: false` em dev (já configurado)

### Erro "Module not found: child_process"
→ Verifique se a página usa `@fluia/firebase/client` (não `@fluia/firebase`)

---

## 🚀 Deploy (Vercel)

1. Conecte o repositório
2. Configure as variáveis de ambiente
3. Build command: `pnpm build`
4. Output directory: `apps/web/.next`

Variáveis obrigatórias para produção:
- Todas do `.env.example`
- `FIREBASE_ADMIN_*` (não usar arquivo JSON)

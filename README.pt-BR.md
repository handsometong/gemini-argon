# Gemini Argon Tracker

Um site independente que acompanha informações divulgadas sobre disponibilidade, recursos, preços e benchmarks do Gemini 4 Argon.

[Acesse o Gemini Argon Tracker](https://geminiargon.pro/)

[English](README.md) · [简体中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md) · Português do Brasil

## Visão geral

O Gemini Argon Tracker reúne informações sobre modelos, comparações, perguntas frequentes e links para fontes. Este repositório contém o site e suas funcionalidades no servidor, incluindo gerenciamento de assinantes e uma interface administrativa.

O site é independente e não oficial. Não possui vínculo nem aprovação do Google ou do Google DeepMind. Gemini e Google são marcas registradas da Google LLC. Notícias e resultados de benchmarks podem mudar; consulte as fontes e os anúncios oficiais antes de tomar decisões com base nessas informações.

## Funcionalidades

- **Acompanhamento do modelo:** informações divulgadas sobre acesso, recursos, preços e benchmarks.
- **Fontes e perguntas frequentes:** referências, respostas e datas de verificação quando disponíveis.
- **Atualizações:** inscrição, confirmação e cancelamento por e-mail, além de um feed RSS. O envio de e-mails exige um provedor configurado.
- **Conteúdo sobre modelos:** perfis e comparações apoiados por rotas de servidor e serviços de banco de dados.
- **Administração:** gerenciamento de conteúdo, modelos, assinantes e configurações do aplicativo.
- **Localização:** catálogos de mensagens em inglês e chinês e rotas localizadas. Parte do conteúdo específico do produto está atualmente escrita diretamente em inglês.

Este é um site informativo, não um serviço oficial do Gemini ou um portal de acesso ao modelo. O repositório também inclui infraestrutura SaaS reutilizável, como autenticação, pagamentos e créditos; sua disponibilidade depende da implantação e da configuração dos provedores.

## Primeiros passos

### Requisitos

- Node.js 20 ou superior
- pnpm 9 ou superior
- Um banco de dados compatível; SQLite é o padrão para desenvolvimento local

### Instalação

```bash
pnpm install
cp .env.example .env.development
```

Edite `.env.development` e configure `VITE_APP_NAME`, o banco de dados e `AUTH_SECRET` (gere uma chave com `openssl rand -base64 32`). Para desenvolvimento local, mantenha `VITE_APP_URL=http://localhost:3000`.

```bash
pnpm db:setup
pnpm db:push
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000). `db:push` é destinado ao desenvolvimento e pode causar perda de dados. Em produção, gere e revise as migrações antes de aplicá-las.

### Build de produção

```bash
pnpm build
pnpm start
```

As credenciais de e-mail e de outras integrações podem ser configuradas nas configurações administrativas. As notificações por e-mail exigem um provedor configurado; salvar uma inscrição não garante a entrega. Consulte `.env.example` para informações sobre variáveis de ambiente e criptografia.

## Tecnologias

- TanStack Start, React, TypeScript e Vite
- TanStack Query, Form e Table
- Tailwind CSS e shadcn/ui
- Drizzle ORM e better-auth
- Paraglide JS para localização

## Estrutura do projeto

```text
src/
  blocks/          Seções do site e interface específica do produto
  components/      Componentes compartilhados
  content/argon.ts Conteúdo do tracker e fontes
  core/            Infraestrutura: autenticação, banco de dados, e-mail e mais
  modules/         Serviços de negócio no servidor
  routes/          Páginas e rotas de API
  styles/          Estilos globais
messages/          Catálogos de tradução em inglês e chinês
project.inlang/    Configuração de localização
public/            Arquivos estáticos
```

## Links

- [Site](https://geminiargon.pro/)
- [Perfil do modelo](https://geminiargon.pro/models/gemini-4-argon)
- [Feed RSS](https://geminiargon.pro/rss.xml)

## Licença

Este repositório contém software proprietário. Consulte [LICENSE](LICENSE) para conhecer os termos completos.

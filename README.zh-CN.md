# Gemini Argon Tracker

独立追踪 Gemini 4 Argon 已报道的访问情况、能力、价格、基准测试和信息来源的网站。

[访问 Gemini Argon Tracker](https://geminiargon.pro/)

[English](README.md) · 简体中文 · [Français](README.fr.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md) · [Português do Brasil](README.pt-BR.md)

## 简介

Gemini Argon Tracker 将模型信息、对比、常见问题和参考来源汇集在一个网站中。本仓库包含网站及其服务端功能，包括订阅者管理和后台管理界面。

本站是独立、非官方的信息网站，与 Google 或 Google DeepMind 没有隶属或官方认可关系。Gemini 和 Google 是 Google LLC 的商标。报道和基准测试结果可能发生变化，请以所链接的信息来源及官方公告为准。

## 功能

- **模型追踪：** 展示已报道的访问情况、能力、价格和基准测试。
- **来源与常见问题：** 提供参考资料、常见问题解答及内容中注明的核验日期。
- **更新订阅：** 包含邮件订阅、确认和退订流程，以及 RSS 订阅源；发送邮件需要配置邮件服务商。
- **模型内容：** 通过服务端路由和数据库服务提供模型介绍和对比。
- **后台管理：** 管理内容、模型、订阅者和应用设置。
- **多语言基础设施：** 提供英文和中文翻译文件以及本地化路由；部分产品专属页面内容目前直接以英文编写。

本站是信息网站，不是官方 Gemini 服务或模型访问入口。仓库还包含可复用的认证、支付、积分等 SaaS 基础设施，实际可用性取决于部署和服务商配置。

## 本地运行

### 环境要求

- Node.js 20 或更高版本
- pnpm 9 或更高版本
- 支持的数据库；本地开发默认使用 SQLite

### 安装与启动

```bash
pnpm install
cp .env.example .env.development
```

编辑 `.env.development`，设置 `VITE_APP_NAME`、数据库配置及 `AUTH_SECRET`（可通过 `openssl rand -base64 32` 生成）。本地开发时保持 `VITE_APP_URL=http://localhost:3000`。

```bash
pnpm db:setup
pnpm db:push
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。`db:push` 用于开发环境，可能造成数据丢失；生产环境应先生成并审核迁移，再执行迁移。

### 生产构建

```bash
pnpm build
pnpm start
```

邮件及其他集成的服务商凭据可以在后台设置中配置。邮件通知需要配置邮件服务商，仅保存订阅并不保证邮件能够送达。环境变量和加密配置说明见 `.env.example`。

## 技术栈

- TanStack Start、React、TypeScript 和 Vite
- TanStack Query、Form 和 Table
- Tailwind CSS 和 shadcn/ui
- Drizzle ORM 和 better-auth
- Paraglide JS 多语言支持

## 项目结构

```text
src/
  blocks/          网站区块和产品专属界面
  components/      共享组件和 UI 基础组件
  content/argon.ts 追踪内容和参考来源
  core/            认证、数据库、邮件等基础设施
  modules/         服务端业务模块
  routes/          页面和 API 路由
  styles/          全局样式
messages/          英文和中文翻译文件
project.inlang/    多语言配置
public/            静态资源
```

## 链接

- [官网](https://geminiargon.pro/)
- [模型介绍](https://geminiargon.pro/models/gemini-4-argon)
- [RSS 订阅](https://geminiargon.pro/rss.xml)

## 许可

本仓库包含专有软件，完整许可条款见 [LICENSE](LICENSE)。

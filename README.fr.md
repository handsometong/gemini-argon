# Gemini Argon Tracker

Un site indépendant qui suit les informations publiées sur la disponibilité, les capacités, les tarifs et les résultats de référence de Gemini 4 Argon.

[Visiter Gemini Argon Tracker](https://geminiargon.pro/)

[English](README.md) · [简体中文](README.zh-CN.md) · Français · [Deutsch](README.de.md) · [Nederlands](README.nl.md) · [Português do Brasil](README.pt-BR.md)

## Présentation

Gemini Argon Tracker réunit des informations sur les modèles, des comparaisons, des questions fréquentes et des liens vers les sources. Ce dépôt contient le site et ses fonctionnalités côté serveur, notamment la gestion des abonnés et une interface d'administration.

Ce site indépendant et non officiel n'est ni affilié à Google ou Google DeepMind, ni approuvé par ces entreprises. Gemini et Google sont des marques de Google LLC. Les informations et résultats peuvent évoluer : consultez les sources et les annonces officielles avant de vous y fier.

## Fonctionnalités

- **Suivi du modèle :** accès, capacités, tarifs et résultats de référence rapportés.
- **Sources et FAQ :** références, réponses aux questions fréquentes et dates de vérification lorsqu'elles sont indiquées.
- **Actualités :** inscription par e-mail, confirmation et désabonnement, ainsi qu'un flux RSS. L'envoi nécessite un fournisseur de messagerie configuré.
- **Contenu sur les modèles :** fiches et comparaisons alimentées par des routes serveur et des services de base de données.
- **Administration :** gestion du contenu, des modèles, des abonnés et des paramètres.
- **Localisation :** catalogues anglais et chinois et routage adapté aux langues. Certaines parties propres au site sont actuellement rédigées directement en anglais.

Ce site est informatif : ce n'est ni un service Gemini officiel ni un portail d'accès au modèle. Le dépôt comprend aussi des fonctions SaaS réutilisables, notamment l'authentification, les paiements et les crédits, dont la disponibilité dépend du déploiement et des fournisseurs configurés.

## Démarrage

### Prérequis

- Node.js 20 ou version ultérieure
- pnpm 9 ou version ultérieure
- Une base de données prise en charge ; SQLite est utilisée par défaut en développement local

### Installation

```bash
pnpm install
cp .env.example .env.development
```

Dans `.env.development`, définissez `VITE_APP_NAME`, les paramètres de la base de données et `AUTH_SECRET` (générez une clé avec `openssl rand -base64 32`). En local, conservez `VITE_APP_URL=http://localhost:3000`.

```bash
pnpm db:setup
pnpm db:push
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). `db:push` est destiné au développement et peut entraîner une perte de données. En production, générez et examinez les migrations avant de les appliquer.

### Build de production

```bash
pnpm build
pnpm start
```

Les identifiants des fournisseurs de messagerie et d'autres intégrations peuvent être configurés dans les paramètres d'administration. L'enregistrement d'un abonnement ne garantit pas l'envoi d'e-mails : un fournisseur doit être configuré. Consultez `.env.example` pour les variables d'environnement et le chiffrement.

## Technologies

- TanStack Start, React, TypeScript et Vite
- TanStack Query, Form et Table
- Tailwind CSS et shadcn/ui
- Drizzle ORM et better-auth
- Paraglide JS pour la localisation

## Structure du projet

```text
src/
  blocks/          Sections du site et interface du produit
  components/      Composants partagés
  content/argon.ts Contenu du suivi et sources
  core/            Infrastructure : authentification, base de données, e-mail, etc.
  modules/         Services métier côté serveur
  routes/          Pages et routes API
  styles/          Styles globaux
messages/          Catalogues de traduction anglais et chinois
project.inlang/    Configuration de localisation
public/            Ressources statiques
```

## Liens

- [Site web](https://geminiargon.pro/)
- [Fiche du modèle](https://geminiargon.pro/models/gemini-4-argon)
- [Flux RSS](https://geminiargon.pro/rss.xml)

## Licence

Ce dépôt contient un logiciel propriétaire. Consultez [LICENSE](LICENSE) pour les conditions complètes.

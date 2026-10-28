# Gemini Argon Tracker

Een onafhankelijke website die berichtgeving over de beschikbaarheid, mogelijkheden, prijzen en benchmarks van Gemini 4 Argon volgt.

[Bezoek Gemini Argon Tracker](https://geminiargon.pro/)

[English](README.md) · [简体中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · Nederlands · [Português do Brasil](README.pt-BR.md)

## Overzicht

Gemini Argon Tracker brengt modelinformatie, vergelijkingen, veelgestelde vragen en bronverwijzingen samen. Deze repository bevat de website en ondersteunende serverfunctionaliteit, waaronder abonneebeheer en een beheerinterface.

De website is onafhankelijk en niet officieel. Ze is niet verbonden aan of goedgekeurd door Google of Google DeepMind. Gemini en Google zijn handelsmerken van Google LLC. Berichtgeving en benchmarkresultaten kunnen veranderen; raadpleeg de bronnen en officiële aankondigingen voordat u erop vertrouwt.

## Functies

- **Modeltracker:** informatie over gerapporteerde toegang, mogelijkheden, prijzen en benchmarks.
- **Bronnen en FAQ:** verwijzingen, antwoorden op veelgestelde vragen en waar vermeld verificatiedatums.
- **Updates:** aanmelden per e-mail, bevestigen en afmelden, plus een RSS-feed. Voor e-mail is een geconfigureerde provider nodig.
- **Modelinhoud:** modelprofielen en vergelijkingen met serverroutes en databaseservices.
- **Beheer:** beheer van inhoud, modellen, abonnees en applicatie-instellingen.
- **Lokalisatie:** Engelse en Chinese vertaalbestanden en taalbewuste routes. Sommige productspecifieke pagina-inhoud is momenteel rechtstreeks in het Engels geschreven.

Dit is een informatieve website, geen officiële Gemini-dienst of portaal voor modeltoegang. De repository bevat ook herbruikbare SaaS-functionaliteit zoals authenticatie, betalingen en tegoeden; de beschikbaarheid hangt af van de implementatie en providerconfiguratie.

## Aan de slag

### Vereisten

- Node.js 20 of hoger
- pnpm 9 of hoger
- Een ondersteunde database; SQLite is standaard voor lokale ontwikkeling

### Installatie

```bash
pnpm install
cp .env.example .env.development
```

Stel in `.env.development` `VITE_APP_NAME`, de database-instellingen en `AUTH_SECRET` in (maak een geheim met `openssl rand -base64 32`). Behoud voor lokale ontwikkeling `VITE_APP_URL=http://localhost:3000`.

```bash
pnpm db:setup
pnpm db:push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `db:push` is bedoeld voor ontwikkeling en kan gegevensverlies veroorzaken. Genereer en controleer migraties voordat u ze in productie toepast.

### Productiebuild

```bash
pnpm build
pnpm start
```

Inloggegevens voor e-mail en andere integraties kunnen in de beheerinstellingen worden geconfigureerd. E-mailmeldingen vereisen een geconfigureerde provider; het opslaan van een abonnement garandeert geen bezorging. Zie `.env.example` voor omgevingsinstellingen en versleuteling.

## Technologiestack

- TanStack Start, React, TypeScript en Vite
- TanStack Query, Form en Table
- Tailwind CSS en shadcn/ui
- Drizzle ORM en better-auth
- Paraglide JS voor lokalisatie

## Projectstructuur

```text
src/
  blocks/          Websiteonderdelen en productspecifieke interface
  components/      Gedeelde componenten
  content/argon.ts Trackerinhoud en bronnen
  core/            Infrastructuur: authenticatie, database, e-mail en meer
  modules/         Bedrijfsservices aan de serverzijde
  routes/          Pagina's en API-routes
  styles/          Globale stijlen
messages/          Engelse en Chinese vertaalbestanden
project.inlang/    Lokalisatieconfiguratie
public/            Statische bestanden
```

## Links

- [Website](https://geminiargon.pro/)
- [Modelprofiel](https://geminiargon.pro/models/gemini-4-argon)
- [RSS-feed](https://geminiargon.pro/rss.xml)

## Licentie

Deze repository bevat propriëtaire software. Zie [LICENSE](LICENSE) voor de volledige voorwaarden.

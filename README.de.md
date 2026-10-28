# Gemini Argon Tracker

Eine unabhängige Website zur Verfolgung berichteter Informationen über Verfügbarkeit, Fähigkeiten, Preise und Benchmark-Ergebnisse von Gemini 4 Argon.

[Gemini Argon Tracker besuchen](https://geminiargon.pro/)

[English](README.md) · [简体中文](README.zh-CN.md) · [Français](README.fr.md) · Deutsch · [Nederlands](README.nl.md) · [Português do Brasil](README.pt-BR.md)

## Überblick

Gemini Argon Tracker bündelt Modellinformationen, Vergleiche, häufig gestellte Fragen und Quellenlinks. Dieses Repository enthält die Website und ihre serverseitigen Funktionen, darunter die Verwaltung von Abonnenten und eine Administrationsoberfläche.

Die Website ist unabhängig und inoffiziell. Sie ist weder mit Google oder Google DeepMind verbunden noch von diesen unterstützt. Gemini und Google sind Marken von Google LLC. Berichte und Benchmark-Ergebnisse können sich ändern; prüfen Sie vor ihrer Verwendung die verlinkten Quellen und offiziellen Ankündigungen.

## Funktionen

- **Modell-Tracker:** Berichte über Zugang, Fähigkeiten, Preise und Benchmarks.
- **Quellen und FAQ:** Quellen, Antworten auf häufige Fragen und gegebenenfalls Überprüfungsdaten.
- **Aktualisierungen:** E-Mail-Anmeldung, Bestätigung und Abmeldung sowie ein RSS-Feed. Der E-Mail-Versand erfordert einen konfigurierten Anbieter.
- **Modellinhalte:** Modellprofile und Vergleiche mit Server-Routen und Datenbankdiensten.
- **Administration:** Verwaltung von Inhalten, Modellen, Abonnenten und Anwendungseinstellungen.
- **Lokalisierung:** Englische und chinesische Übersetzungskataloge und sprachabhängige Routen. Einige produktspezifische Seiteninhalte sind derzeit direkt auf Englisch verfasst.

Dies ist eine Informationswebsite, kein offizieller Gemini-Dienst und kein Zugang zum Modell. Das Repository enthält außerdem wiederverwendbare SaaS-Funktionen wie Authentifizierung, Zahlungen und Guthaben; ihre Verfügbarkeit hängt von Deployment und Anbieterkonfiguration ab.

## Erste Schritte

### Voraussetzungen

- Node.js 20 oder neuer
- pnpm 9 oder neuer
- Eine unterstützte Datenbank; für die lokale Entwicklung wird standardmäßig SQLite verwendet

### Installation

```bash
pnpm install
cp .env.example .env.development
```

Setzen Sie in `.env.development` `VITE_APP_NAME`, die Datenbankeinstellungen und `AUTH_SECRET` (ein Geheimnis kann mit `openssl rand -base64 32` erzeugt werden). Für die lokale Entwicklung bleibt `VITE_APP_URL=http://localhost:3000`.

```bash
pnpm db:setup
pnpm db:push
pnpm dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000). `db:push` ist für die Entwicklung bestimmt und kann Datenverlust verursachen. Für die Produktion müssen Migrationen vor ihrer Anwendung erzeugt und überprüft werden.

### Produktions-Build

```bash
pnpm build
pnpm start
```

Zugangsdaten für E-Mail- und andere Integrationen können in den Administrationseinstellungen hinterlegt werden. Für E-Mail-Benachrichtigungen muss ein Anbieter konfiguriert sein; das Speichern eines Abonnements allein garantiert keinen Versand. Hinweise zu Umgebungsvariablen und Verschlüsselung stehen in `.env.example`.

## Technologie-Stack

- TanStack Start, React, TypeScript und Vite
- TanStack Query, Form und Table
- Tailwind CSS und shadcn/ui
- Drizzle ORM und better-auth
- Paraglide JS für die Lokalisierung

## Projektstruktur

```text
src/
  blocks/          Website-Abschnitte und produktspezifische Oberfläche
  components/      Gemeinsame Komponenten
  content/argon.ts Tracker-Inhalte und Quellen
  core/            Infrastruktur: Authentifizierung, Datenbank, E-Mail usw.
  modules/         Serverseitige Geschäftslogik
  routes/          Seiten und API-Routen
  styles/          Globale Styles
messages/          Englische und chinesische Übersetzungskataloge
project.inlang/    Lokalisierungskonfiguration
public/            Statische Dateien
```

## Links

- [Website](https://geminiargon.pro/)
- [Modellprofil](https://geminiargon.pro/models/gemini-4-argon)
- [RSS-Feed](https://geminiargon.pro/rss.xml)

## Lizenz

Dieses Repository enthält proprietäre Software. Die vollständigen Bedingungen stehen in [LICENSE](LICENSE).

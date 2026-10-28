import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { trackEvent } from '@/lib/analytics';
import { apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { getLocale } from '@/paraglide/runtime.js';
import { buttonVariants } from '@/components/ui/button';
import {
  ARGON_LAST_VERIFIED,
  argonBenchmarks,
  argonCapabilities,
  argonFaqs,
  argonPricing,
  argonSources,
} from '@/content/argon';
import { localizedHome } from '@/content/localized-home';

const homeLabels = {
  fr: {
    access: 'Vérifier l’accès',
    benchmarks: 'Voir les benchmarks',
    notify: 'Recevoir les actualités',
    capabilities: 'Fonctionnalités principales',
    capabilitiesTitle: 'À quoi sert Gemini Argon ?',
    overview: 'Présentation du modèle',
    overviewTitle: 'Qu’est-ce que Gemini 4 Argon ?',
    pricing: 'Tarifs et disponibilité',
    evaluations: 'Évaluations indépendantes',
    questions: 'Questions et réponses',
    stay: 'Restez informé',
    updates: 'Recevoir les actualités de Gemini Argon',
    email: 'Adresse e-mail pour les actualités Gemini Argon',
    submit: 'Me prévenir',
    submitting: 'Envoi en cours…',
    subscribed: 'Inscription enregistrée',
    confirmation:
      'Consultez votre boîte de réception pour confirmer votre inscription.',
    noDelivery:
      'Inscription enregistrée, mais l’envoi des e-mails n’est pas encore configuré.',
    rss: 'Suivre le flux RSS à la place.',
  },
  de: {
    access: 'Zugang prüfen',
    benchmarks: 'Benchmarks ansehen',
    notify: 'Benachrichtigen',
    capabilities: 'Kernfunktionen',
    capabilitiesTitle: 'Wofür ist Gemini Argon ausgelegt?',
    overview: 'Modellübersicht',
    overviewTitle: 'Was ist Gemini 4 Argon?',
    pricing: 'Preise und Verfügbarkeit',
    evaluations: 'Unabhängige Bewertungen',
    questions: 'Fragen und Antworten',
    stay: 'Informiert bleiben',
    updates: 'Neuigkeiten zum Zugang zu Gemini Argon',
    email: 'E-Mail-Adresse für Gemini-Argon-Neuigkeiten',
    submit: 'Benachrichtigen',
    submitting: 'Wird gesendet…',
    subscribed: 'Angemeldet',
    confirmation:
      'Bitte bestätigen Sie Ihre Anmeldung über die E-Mail in Ihrem Posteingang.',
    noDelivery:
      'Ihre Anmeldung wurde gespeichert, aber der E-Mail-Versand ist noch nicht eingerichtet.',
    rss: 'Stattdessen den RSS-Feed abonnieren.',
  },
  nl: {
    access: 'Toegang bekijken',
    benchmarks: 'Benchmarks bekijken',
    notify: 'Houd me op de hoogte',
    capabilities: 'Belangrijkste mogelijkheden',
    capabilitiesTitle: 'Waarvoor is Gemini Argon bedoeld?',
    overview: 'Modeloverzicht',
    overviewTitle: 'Wat is Gemini 4 Argon?',
    pricing: 'Prijzen en beschikbaarheid',
    evaluations: 'Onafhankelijke evaluaties',
    questions: 'Vragen en antwoorden',
    stay: 'Blijf op de hoogte',
    updates: 'Ontvang updates over toegang tot Gemini Argon',
    email: 'E-mailadres voor updates over Gemini Argon',
    submit: 'Houd me op de hoogte',
    submitting: 'Bezig met verzenden…',
    subscribed: 'Aangemeld',
    confirmation: 'Controleer je inbox om je aanmelding te bevestigen.',
    noDelivery:
      'Je aanmelding is opgeslagen, maar e-mailverzending is nog niet ingesteld.',
    rss: 'Volg in plaats daarvan de RSS-feed.',
  },
} as const;

function localizedContent() {
  const locale = getLocale() as keyof typeof localizedHome;
  return { page: localizedHome[locale], labels: homeLabels[locale] };
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-10 max-w-3xl">
      {eyebrow ? (
        <p className="text-brand-blue mb-3 text-xs font-bold tracking-[0.22em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-body mt-4 text-base leading-8 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  children: string;
  tone: 'green' | 'amber' | 'slate';
}) {
  return (
    <span className={cn('status-badge', `status-badge-${tone}`)}>
      {children}
    </span>
  );
}

function SubscribeForm() {
  const { labels } = localizedContent();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryConfigured, setDeliveryConfigured] = useState(true);
  const mutation = useMutation({
    mutationFn: (value: string) =>
      apiPost<{ accepted: boolean; deliveryConfigured: boolean }>(
        '/api/subscribers',
        { email: value, locale: getLocale() }
      ),
    onSuccess: (result) => {
      setMessage(
        result.deliveryConfigured
          ? labels?.confirmation ||
              'Check your inbox to confirm your subscription.'
          : labels?.noDelivery ||
              'Subscription is saved, but email delivery is not configured yet.'
      );
      setDeliveryConfigured(result.deliveryConfigured);
    },
    onError: (error: Error) => setMessage(error.message),
  });

  return (
    <>
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const normalized = email.trim().toLowerCase();
          if (normalized) {
            trackEvent('subscribe_started', { locale: getLocale() });
            mutation.mutate(normalized);
          }
        }}
      >
        <label className="sr-only" htmlFor="argon-email">
          {labels?.email || 'Email address for Gemini Argon updates'}
        </label>
        <input
          id="argon-email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setMessage('');
          }}
          placeholder="your@email.com"
          className="h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 px-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'bg-brand-purple hover:bg-brand-purple/85 h-12 rounded-xl px-6 text-base font-bold text-white disabled:cursor-wait disabled:opacity-60'
          )}
        >
          {mutation.isPending ? (
            labels?.submitting || 'Submitting…'
          ) : mutation.isSuccess ? (
            <>
              <Check className="size-4" /> {labels?.subscribed || 'Subscribed'}
            </>
          ) : (
            <>
              <Mail className="size-4" /> {labels?.submit || 'Notify me'}
            </>
          )}
        </button>
      </form>
      {message ? (
        <p className="mt-3 text-sm text-slate-300" role="status">
          {message}{' '}
          {!deliveryConfigured ? (
            <a className="underline" href="/rss.xml">
              {labels?.rss || 'Follow the RSS feed instead.'}
            </a>
          ) : null}
        </p>
      ) : null}
    </>
  );
}

export function ArgonTracker() {
  const { page, labels } = localizedContent();
  return (
    <div className="argon-page">
      <section className="argon-hero section-shell">
        <img
          src="/argon/argon-logo.png"
          alt="Gemini 4 Argon Tracker logo"
          className="argon-hero-glow"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="text-brand-neon mb-6 text-xs font-bold tracking-[0.24em] uppercase">
            {page?.verified ||
              `Unofficial tracker · Last verified ${ARGON_LAST_VERIFIED}`}
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {page?.heading ||
              'Gemini 4 Argon — Specs, Access and Benchmarks in One Place'}
          </h1>
          <p className="text-body mx-auto mt-7 max-w-3xl text-lg leading-8 sm:text-xl">
            {page?.intro || (
              <>
                Google DeepMind’s first reported frontier model in the Gemini 4
                line is built for long-horizon reasoning, mixed media, and
                workflows that run far beyond a short chat turn. We track
                access, pricing, and independent results daily, with sources
                linked for every important claim.
              </>
            )}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/models/gemini-4-argon"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-brand-purple hover:bg-brand-purple/85 h-12 rounded-xl px-6 text-base font-bold text-white'
              )}
            >
              {labels?.access || 'Check current access'}{' '}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#benchmarks"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-12 rounded-xl border-blue-400/40 bg-white/5 px-6 text-base text-white hover:bg-white/10'
              )}
            >
              {labels?.benchmarks || 'See benchmarks'}
            </a>
            <a
              href="#notify"
              className="inline-flex h-12 items-center justify-center rounded-xl px-4 text-base font-semibold text-blue-300 hover:text-white"
            >
              {labels?.notify || 'Get notified'}
            </a>
          </div>
          <div className="mt-12 grid gap-3 text-left sm:grid-cols-3">
            {[
              '1M output tokens reported',
              'Staged access status',
              'Sources linked below',
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 backdrop-blur"
              >
                <Check className="text-brand-neon mr-2 inline size-4" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="section-shell scroll-mt-24">
        <SectionHeading
          eyebrow={page?.accessTitle || 'Access status'}
          title={page?.accessTitle || 'Can you use Gemini 4 Argon yet?'}
          description={
            page?.access ||
            'As of October 1, 2026, reported access is limited to Google’s internal teams and vetted defenders in the Fairwind Program. Paid API customers and Google AI Ultra subscribers may be prioritized next, but Google has not confirmed a public launch date.'
          }
        />
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ['Internal (Google)', 'AVAILABLE', 'green'],
            ['Fairwind Program', 'LIMITED', 'amber'],
            ['Paid Gemini API', 'NOT YET', 'slate'],
            ['Google AI Ultra', 'NOT YET', 'slate'],
          ].map(([label, status, tone]) => (
            <div
              key={label}
              className="surface-card flex min-h-32 flex-col justify-between gap-5 p-5"
            >
              <span className="text-sm text-slate-300">{label}</span>
              <StatusBadge tone={tone as 'green' | 'amber' | 'slate'}>
                {status}
              </StatusBadge>
            </div>
          ))}
        </div>
        <p className="text-muted mt-6 text-sm">
          Last checked {ARGON_LAST_VERIFIED} · We update this section when
          Google publishes new information. Source:{' '}
          <a
            className="text-link"
            href="https://blog.google/"
            target="_blank"
            rel="noreferrer"
          >
            blog.google
          </a>
          .
        </p>
        <p className="text-body mt-6 max-w-3xl leading-7">
          If Gemini 4 Argon opens to external users, access will likely depend
          on more than a sign-up button. Expect model-region availability, quota
          limits, safety review, and terms for workloads that use long context
          or automated tools. We will record the first verifiable public route
          here, including whether Gemini Argon appears in Google AI Studio, an
          API catalog, or a paid plan.
        </p>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow={labels?.capabilities || 'Core capabilities'}
          title={labels?.capabilitiesTitle || 'What is Gemini Argon built for?'}
          description="The current picture is less about casual chat and more about long-running, high-context work where a model has to reason, inspect, revise, and complete a sequence of connected tasks."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {argonCapabilities.map((capability, index) => (
            <article key={capability.title} className="surface-card p-6">
              <div className="mb-8 flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                {index === 0 ? (
                  <Zap className="size-5" />
                ) : index === 1 ? (
                  <Sparkles className="size-5" />
                ) : (
                  <ShieldCheck className="size-5" />
                )}
              </div>
              <p className="text-brand-purple text-4xl font-bold">
                {capability.metric}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
                {capability.title}
              </h3>
              <p className="text-body mt-3 leading-7">
                {capability.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="overview"
        className="section-shell grid scroll-mt-24 gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start"
      >
        <SectionHeading
          eyebrow={labels?.overview || 'Model overview'}
          title={labels?.overviewTitle || 'What is Gemini 4 Argon?'}
        />
        <div className="text-body space-y-5 text-base leading-8">
          <p>
            Gemini 4 Argon is the reported first frontier model in Google
            DeepMind’s Gemini 4 series. It is designed for deep reasoning and
            very long workflows rather than short chat turns.
          </p>
          <p>
            According to the current reports, Gemini Argon has been used
            internally for quantum algorithm optimization, datacenter memory
            optimization, and large-scale codebase migration. It is also
            described as handling long video, charts, and mixed media inputs
            with a stronger safety and alignment layer.
          </p>
          <p>
            The headline specification is output length: up to 1,000,000 output
            tokens, compared with 64K in the previous generation. Gemini 4 Argon
            is not publicly available yet; this page combines official
            announcements and independent evaluations, and labels unverified
            figures as reported.
          </p>
          <p>
            That context changes the practical question from whether Gemini
            Argon can answer a prompt to whether it can stay coherent across an
            entire project. A long codebase, a legal matter with many exhibits,
            or a research workflow with charts and video can be kept in one
            working session instead of repeatedly summarized. The benefit
            remains a hypothesis until public access and reproducible
            evaluations arrive.
          </p>
          <p>
            For teams watching Gemini 4 Argon, the most important signals are
            not a single viral score or screenshot. Look for a public model
            name, documented limits, a stable API surface, and evaluation
            details that explain the prompt, tools, latency, and sampling
            method. Those details determine whether a reported Gemini Argon
            result can be repeated in a real product. Until then, this tracker
            separates confirmed announcements from informed reporting so readers
            can make decisions without treating early claims as a guarantee.
          </p>
        </div>
      </section>

      <section id="pricing" className="section-shell scroll-mt-24">
        <SectionHeading
          eyebrow={labels?.pricing || 'Commercial details'}
          title={
            page?.pricingTitle || 'Gemini 4 Argon release date and pricing'
          }
          description="The timeline below separates reported access milestones from what Google has not announced. Pricing is introductory reporting, not a final public price sheet."
        />
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {[
            'Announced by Google DeepMind',
            'Internal + Fairwind access reported',
            'Public API / AI Ultra not announced',
          ].map((item, index) => (
            <div key={item} className="surface-card flex gap-3 p-5">
              <span className="text-brand-neon font-bold">0{index + 1}</span>
              <span className="text-sm text-slate-300">{item}</span>
            </div>
          ))}
        </div>
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="p-4">Model</th>
                <th className="p-4">Input / 1M</th>
                <th className="p-4">Output / 1M</th>
                <th className="p-4">Max output</th>
                <th className="p-4">Availability</th>
              </tr>
            </thead>
            <tbody>
              {argonPricing.map((row) => (
                <tr
                  key={row.model}
                  className={cn(
                    'border-b border-white/5 last:border-0',
                    row.featured && 'bg-blue-500/[0.08]'
                  )}
                >
                  <td
                    className={cn(
                      'p-4 font-semibold',
                      row.featured
                        ? 'text-blue-300'
                        : 'text-[var(--text-primary)]'
                    )}
                  >
                    {row.model}
                  </td>
                  <td className="p-4 text-slate-300">{row.input}</td>
                  <td className="p-4 text-slate-300">{row.output}</td>
                  <td className="p-4 text-slate-300">{row.context}</td>
                  <td className="p-4 text-slate-400">{row.availability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted mt-4 text-sm">
          Introductory pricing as reported; Google has not published final
          public pricing. Verify these figures against official sources before
          relying on them. A practical Gemini Argon cost estimate should also
          account for cached input, tool calls, output length, concurrency, and
          any enterprise terms that are not visible in an early headline price.
        </p>
      </section>

      <section id="benchmarks" className="section-shell scroll-mt-24">
        <SectionHeading
          eyebrow={labels?.evaluations || 'Independent evaluations'}
          title={page?.benchmarkTitle || 'Gemini Argon benchmark comparison'}
          description="Knowledge work, long-horizon coding, cyber defense, and cost efficiency. Data is shown as reported and may change as evaluators publish new harnesses and results."
        />
        <p className="text-body -mt-4 mb-8 max-w-3xl leading-7">
          Benchmarks help define where Gemini 4 Argon may be useful, but they
          are not a substitute for testing your own workload. Compare the same
          prompts, context size, tool permissions, and success criteria before
          choosing a model for production. We keep missing values as “—” rather
          than filling the table with guesses, and we will revise the Gemini
          Argon comparison when a source publishes a reproducible result.
        </p>
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="p-4">Category</th>
                <th className="p-4">Benchmark</th>
                <th className="bg-blue-500/10 p-4 text-blue-300">
                  Gemini Argon
                </th>
                <th className="p-4">GPT-6 Astra</th>
                <th className="p-4">Claude Fable 5.1</th>
                <th className="p-4">Claude Opus 5.5</th>
              </tr>
            </thead>
            <tbody>
              {argonBenchmarks.map((row) => (
                <tr
                  key={row[1]}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="p-4 text-slate-300">{row[0]}</td>
                  <td className="p-4 text-slate-400">{row[1]}</td>
                  {row.slice(2).map((cell, index) => (
                    <td
                      key={index}
                      className={cn(
                        'p-4',
                        index === 0
                          ? 'bg-blue-500/[0.06] font-semibold text-[var(--text-primary)]'
                          : 'text-slate-400'
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            [
              'Artificial Analysis',
              'Gemini Argon is reported at High 53, level with GPT-6 Astra and behind Claude Opus 5.5 at roughly 58.',
            ],
            [
              'Arena / LMSYS',
              'Early Gemini Argon results show strong Text Arena signals and notable cost efficiency, while the sample remains small.',
            ],
            [
              'How to read this',
              'A benchmark score is not a universal ranking. Gemini Argon results depend on the evaluator, prompt, tool access, latency target, and whether the task rewards persistence or short answers.',
            ],
            [
              'Takeaway',
              'Gemini Argon may lead in knowledge work, long context, coding, and cyber defense; results vary by task, prompt, and harness.',
            ],
          ].map(([title, text]) => (
            <article key={title} className="surface-card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
              <p className="text-body mt-3 leading-7">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="section-shell scroll-mt-24">
        <SectionHeading
          eyebrow={labels?.questions || 'Questions and answers'}
          title={page?.faqTitle || 'Gemini Argon FAQ'}
          description="Short answers about Gemini 4 Argon access, pricing, capabilities, and what this independent tracker does and does not claim."
        />
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
          {argonFaqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group p-5 sm:p-6"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="size-5 shrink-0 text-blue-300 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-body max-w-3xl pt-4 leading-7">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="notify" className="section-shell scroll-mt-24 pb-20">
        <div className="argon-notify surface-card relative overflow-hidden p-7 sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-brand-neon mb-3 text-xs font-bold tracking-[0.2em] uppercase">
              {labels?.stay || 'Stay informed'}
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {labels?.updates || 'Get Gemini Argon access updates'}
            </h2>
            <p className="text-body mt-4 leading-7">
              One email when Gemini 4 Argon public API or Google AI Ultra
              availability is confirmed. No newsletter and no spam.
            </p>
            <div className="mt-7">
              <SubscribeForm />
            </div>
          </div>
        </div>
      </section>

      <div className="sr-only" aria-hidden="true">
        {argonSources.map((source) => source.label).join(' · ')}
      </div>
    </div>
  );
}

export const ARGON_LAST_VERIFIED = 'October 1, 2026';

export const argonSources = [
  { label: 'blog.google', href: 'https://blog.google/' },
  { label: 'deepmind.google', href: 'https://deepmind.google/' },
  { label: 'Google AI Studio', href: 'https://ai.google.dev/' },
  { label: 'Vals AI', href: 'https://vals.ai/' },
  { label: 'Artificial Analysis', href: 'https://artificialanalysis.ai/' },
  { label: 'CWE-bench', href: 'https://cwe-bench.github.io/' },
  { label: 'LMSYS Arena', href: 'https://lmarena.ai/' },
] as const;

export const argonCapabilities = [
  {
    title: 'Gemini Argon for long-horizon engineering',
    metric: '77.9%',
    description:
      'Reported on DeepSWE v1.1 for multi-hour code migration, debugging, and algorithm optimization tasks.',
  },
  {
    title: 'Gemini Argon for enterprise knowledge work',
    metric: '68.9%',
    description:
      'Reported leadership on the Vals Index, with a focus on legal, finance, research, and end-to-end automation.',
  },
  {
    title: 'Gemini Argon for cyber defense',
    metric: '68.0%',
    description:
      'Reported on CWE-bench v1, tied first among the compared systems for finding, validating, and patching vulnerabilities.',
  },
] as const;

export const argonPricing = [
  {
    model: 'Gemini 4 Argon',
    input: '$2 intro → $4',
    output: '$10 intro → $20',
    context: '1,000,000 output tokens',
    availability: 'Fairwind + internal; public API pending',
    featured: true,
  },
  {
    model: 'GPT-6 Astra',
    input: '$10',
    output: '$50',
    context: '~128k',
    availability: 'Public',
    featured: false,
  },
  {
    model: 'Claude Opus 5.5',
    input: '$4',
    output: '$20',
    context: '~128k+',
    availability: 'Public',
    featured: false,
  },
  {
    model: 'Claude Fable 5.1',
    input: '$10',
    output: '$50',
    context: 'High',
    availability: 'Public',
    featured: false,
  },
] as const;

export const argonBenchmarks = [
  ['Knowledge work', 'Vals Index', '68.9%', '—', '—', '—'],
  ['Long-horizon coding', 'DeepSWE v1.1', '77.9%', '—', '—', '—'],
  ['Cyber defense', 'CWE-bench v1', '68.0%', '—', '—', '—'],
  [
    'Intelligence index',
    'Artificial Analysis',
    '53 High',
    '53 High',
    '~58',
    '—',
  ],
  ['Hallucination rate', 'Independent checks', '~15%', '—', '—', '—'],
] as const;

export const argonFaqs = [
  {
    question: 'What is Gemini Argon?',
    answer:
      'Gemini Argon is the reported first frontier model in Google DeepMind’s Gemini 4 series. It is described as a system for deep reasoning, mixed media, and long workflows, with a headline capacity of up to 1M output tokens.',
  },
  {
    question: 'Is Gemini 4 Argon available now?',
    answer:
      'Gemini 4 Argon is not publicly available according to the current tracker. As of October 1, 2026, reported access is limited to internal Google teams and vetted Fairwind Program defenders; paid API and Google AI Ultra access have not been announced.',
  },
  {
    question: 'How much does Gemini Argon cost?',
    answer:
      'Reported introductory Gemini Argon pricing is $2 per million input tokens and $10 per million output tokens, with a possible move to $4 and $20. Google has not published final public pricing, so treat these figures as as-reported estimates.',
  },
  {
    question: 'How is Gemini 4 Argon different from earlier Gemini models?',
    answer:
      'The reported Gemini 4 Argon differences are a much longer output limit, stronger coding and cyber-defense results, broader mixed-media workflows, and a staged release with additional safety and alignment monitoring.',
  },
  {
    question: 'How do I get Gemini Argon access?',
    answer:
      'Watch official Google and DeepMind announcements, check Google AI Studio, and follow this Gemini Argon tracker for changes. Teams preparing an API key, evaluation harness, and representative test suite will be ready if access opens.',
  },
  {
    question: 'Is Gemini 4 Argon an official Google page?',
    answer:
      'No. This is an independent Gemini 4 Argon tracker. It is not affiliated with, endorsed by, or operated by Google, and it links to official and independent sources for every reported update.',
  },
] as const;

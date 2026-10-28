import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { ARGON_LAST_VERIFIED, argonSources } from '@/content/argon';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-100 px-4 py-12 text-slate-400 sm:px-6 lg:px-8 dark:bg-[#0B1224]">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_1fr_0.7fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="argon-logo-frame">
              <img
                src="/argon/argon-logo.png"
                alt="Gemini 4 Argon Tracker logo"
              />
            </span>
            <span className="text-xs font-bold tracking-[0.16em] text-[var(--text-primary)]">
              GEMINI ARGON TRACKER
            </span>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7">
            Gemini 4 Argon Tracker is an independent, unofficial information
            page. It is not affiliated with, endorsed by, or operated by Google.
            “Gemini” and “Google” are trademarks of Google LLC. All benchmark
            figures are attributed to their original sources.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--text-primary)] uppercase">
            Sources
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {argonSources.map((source) => (
              <a
                key={source.label}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="text-blue-300 hover:text-white"
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--text-primary)] uppercase">
            Updates
          </p>
          <p className="mt-4 text-sm leading-7">
            {ARGON_LAST_VERIFIED} — page published; no public launch date
            announced
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white">
              Terms
            </Link>
            <a href="#notify" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-slate-500">
        {envConfigs.app_name} · Unofficial tracker · Last verified{' '}
        {ARGON_LAST_VERIFIED}
      </p>
    </footer>
  );
}

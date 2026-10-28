import { Link } from '@/core/i18n/navigation';
import { LocaleSelector } from '@/components/locale-selector';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="argon-header sticky top-0 z-40 border-b border-white/10 bg-white/85 backdrop-blur-xl dark:bg-[#0F172A]/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="Gemini 4 Argon Tracker home"
        >
          <span className="argon-logo-frame">
            <img
              src="/argon/argon-logo.png"
              alt="Gemini 4 Argon Tracker logo"
            />
          </span>
          <span className="hidden text-xs font-bold tracking-[0.16em] text-[var(--text-primary)] sm:inline">
            GEMINI ARGON TRACKER
          </span>
        </Link>
        <nav
          className="hidden items-center gap-5 text-sm text-slate-300 lg:flex"
          aria-label="Primary navigation"
        >
          <Link href="/models/gemini-4-argon" className="hover:text-white">
            Argon profile
          </Link>
          <a href="#access" className="hover:text-white">
            Access
          </a>
          <Link href="/models" className="hover:text-white">
            Models
          </Link>
          <Link href="/tools/cost-calculator" className="hover:text-white">
            Cost calculator
          </Link>
          <Link href="/updates" className="hover:text-white">
            Updates
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#notify"
            className="bg-brand-purple hover:bg-brand-purple/85 hidden rounded-lg px-3 py-2 text-sm font-bold text-white sm:inline-flex"
          >
            Get updates
          </a>
          <ThemeToggle />
          <LocaleSelector />
        </div>
      </div>
    </header>
  );
}

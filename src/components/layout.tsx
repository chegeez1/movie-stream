import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home, Tv, Film, TrendingUp, Search,
  ChevronRight, Bookmark, Compass, BookmarkCheck,
  Smartphone, RefreshCw, LayoutGrid, Clock, HelpCircle, X,
} from 'lucide-react';
import { useWatchlist } from '@/hooks/use-watchlist';

interface LayoutProps {
  children: React.ReactNode;
}

const MAIN_NAV = [
  { label: 'Home',      href: '/',                Icon: Home       },
  { label: 'TV Shows',  href: '/browse/series',   Icon: Tv         },
  { label: 'Movies',    href: '/browse/movies',   Icon: Film       },
  { label: 'Trending',  href: '/browse/trending', Icon: TrendingUp },
  { label: 'All',       href: '/browse/all',      Icon: LayoutGrid },
];

function NavItem({
  label, href, Icon, expanded, isActive, tooltip, setTooltip, badge,
}: {
  label: string; href: string; Icon: React.ElementType;
  expanded: boolean; isActive: boolean;
  tooltip: string | null; setTooltip: (v: string | null) => void;
  badge?: number;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={() => !expanded && setTooltip(label)}
      onMouseLeave={() => setTooltip(null)}
    >
      <Link
        href={href}
        className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 ${
          isActive
            ? 'bg-primary/15 text-primary'
            : 'text-white/45 hover:text-white hover:bg-white/[0.07]'
        }`}
      >
        <div className="relative shrink-0">
          <Icon className="w-[18px] h-[18px]" />
          {badge != null && badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-primary rounded-full text-[8px] font-bold text-white flex items-center justify-center px-0.5">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        {expanded && <span className="text-[13px] font-medium whitespace-nowrap">{label}</span>}
      </Link>
      {!expanded && tooltip === label && (
        <div className="absolute left-[54px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-white/10">
            {label}{badge != null && badge > 0 ? ` (${badge})` : ''}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Keyboard Shortcuts Modal ───────────────────────────────────────── */
const SHORTCUTS = [
  { key: '/',   desc: 'Focus / open search'   },
  { key: '?',   desc: 'Show keyboard shortcuts' },
  { key: 'Esc', desc: 'Close modal / overlay'  },
];

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <span className="font-bold text-sm text-white">Keyboard Shortcuts</span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {SHORTCUTS.map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-white/65">{desc}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-white/[0.07] border border-white/10 text-xs text-white/80 font-mono font-semibold">{key}</kbd>
            </div>
          ))}
        </div>
        <div className="px-5 pb-4 text-center">
          <span className="text-xs text-white/25">Press ? anytime to reopen</span>
        </div>
      </div>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location, navigate] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { watchlist } = useWatchlist();

  /* Global keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === '/' && !inInput) {
        e.preventDefault();
        if (location.startsWith('/search')) {
          document.querySelector<HTMLInputElement>('input[type="text"], input[type="search"]')?.focus();
        } else {
          navigate('/search');
        }
      }
      if (e.key === '?' && !inInput) {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [location, navigate]);

  const sideW  = expanded ? 'w-[200px]' : 'w-[58px]';
  const mainML = expanded ? 'md:ml-[200px]' : 'md:ml-[58px]';

  const BOTTOM_NAV = [
    { label: 'History',   href: '/history',    Icon: Clock,         badge: undefined },
    { label: 'Discover',  href: '/browse/all', Icon: Compass,       badge: undefined },
    { label: 'Watchlist', href: '/watchlist',  Icon: BookmarkCheck, badge: watchlist.length },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-[#0a0a0a] text-white">

      {/* ── Sidebar (desktop) ── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col py-4 bg-[#111114] border-r border-white/[0.06] transition-all duration-300 overflow-hidden ${sideW}`}
      >
        {/* Logo */}
        <div className={`flex items-center mb-4 px-3 ${expanded ? 'gap-3' : 'justify-center'}`}>
          <Link href="/" className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shrink-0">
            <Film className="w-5 h-5 text-white" />
          </Link>
          {expanded && (
            <span className="text-sm font-black text-white tracking-wide whitespace-nowrap">CHEGEMOVIES</span>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="absolute top-[52px] -right-[10px] w-5 h-5 rounded-full bg-[#1e1e22] border border-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all z-10 hover:bg-[#2a2a2e]"
        >
          <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Main nav */}
        <nav className="flex flex-col gap-0.5 px-2 flex-1">
          {MAIN_NAV.map(({ label, href, Icon }) => {
            const isActive = href === '/' ? location === '/' : location.startsWith(href);
            return (
              <NavItem
                key={href}
                label={label} href={href} Icon={Icon}
                expanded={expanded} isActive={isActive}
                tooltip={tooltip} setTooltip={setTooltip}
              />
            );
          })}
          <NavItem
            label="Search" href="/search" Icon={Search}
            expanded={expanded}
            isActive={location.startsWith('/search')}
            tooltip={tooltip} setTooltip={setTooltip}
          />
        </nav>

        <div className="mx-3 my-2 border-t border-white/[0.06]" />

        {/* Bottom nav */}
        <nav className="flex flex-col gap-0.5 px-2 pb-1">
          {BOTTOM_NAV.map(({ label, href, Icon, badge }) => {
            const isActive = href === '/' ? false : location === href || location.startsWith(href + '/');
            return (
              <NavItem
                key={label}
                label={label} href={href} Icon={Icon}
                expanded={expanded} isActive={isActive}
                tooltip={tooltip} setTooltip={setTooltip}
                badge={badge}
              />
            );
          })}

          {/* Refresh */}
          <div
            className="relative"
            onMouseEnter={() => !expanded && setTooltip('Refresh')}
            onMouseLeave={() => setTooltip(null)}
          >
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-white/35 hover:text-white hover:bg-white/[0.07] transition-all duration-150"
            >
              <RefreshCw className="w-[17px] h-[17px] shrink-0" />
              {expanded && <span className="text-[13px] font-medium whitespace-nowrap">Refresh</span>}
            </button>
            {!expanded && tooltip === 'Refresh' && (
              <div className="absolute left-[54px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-white/10">
                  Refresh
                </div>
              </div>
            )}
          </div>

          {/* Keyboard shortcuts help */}
          <div
            className="relative"
            onMouseEnter={() => !expanded && setTooltip('Shortcuts')}
            onMouseLeave={() => setTooltip(null)}
          >
            <button
              onClick={() => setShowShortcuts(true)}
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-white/35 hover:text-white hover:bg-white/[0.07] transition-all duration-150"
            >
              <HelpCircle className="w-[17px] h-[17px] shrink-0" />
              {expanded && <span className="text-[13px] font-medium whitespace-nowrap">Shortcuts</span>}
            </button>
            {!expanded && tooltip === 'Shortcuts' && (
              <div className="absolute left-[54px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-white/10">
                  Shortcuts <kbd className="ml-1 text-white/50 font-mono">?</kbd>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {/* ── Top-right header ── */}
      <header className="fixed top-0 right-0 z-40 hidden md:flex items-center gap-2 px-4 py-3">
        <Link href="/search" className="p-2 rounded-full text-white/55 hover:text-white hover:bg-white/[0.08] transition-colors">
          <Search className="w-5 h-5" />
        </Link>
        <Link
          href="/watchlist"
          className="relative p-2 rounded-full text-white/55 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <Bookmark className="w-5 h-5" />
          {watchlist.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Link>
        <a
          href="#"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all text-xs font-medium"
        >
          <Smartphone className="w-3.5 h-3.5" />
          Get our app
        </a>
      </header>

      {/* ── Main content ── */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${mainML}`}>
        {children}
      </main>

      {/* ── Mobile bottom bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#111114]/95 backdrop-blur border-t border-white/[0.06] flex items-center justify-around px-2 py-2">
        {[
          ...MAIN_NAV.slice(0, 3),
          { label: 'Watchlist', href: '/watchlist', Icon: BookmarkCheck },
          { label: 'Search',    href: '/search',    Icon: Search        },
        ].map(({ label, href, Icon }) => {
          const isActive = href === '/' ? location === '/' : location.startsWith(href);
          const badge = label === 'Watchlist' ? watchlist.length : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-white/40 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[9px] font-medium">{label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

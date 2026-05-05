import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout';
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card';
import { useLocalLibraryMovies } from '@/hooks/use-movies';
import { HardDrive, Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  React.useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 md:bottom-6 right-4 z-40 w-10 h-10 rounded-full bg-primary/90 hover:bg-primary text-white shadow-xl flex items-center justify-center transition-all hover:scale-110"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

type SortKey = 'az' | 'za' | 'size' | 'newest';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'az',     label: 'A → Z'       },
  { value: 'za',     label: 'Z → A'       },
  { value: 'size',   label: 'Largest'     },
  { value: 'newest', label: 'Newest First' },
];

export default function LibraryPage() {
  const { data, isLoading } = useLocalLibraryMovies(500);
  const [query,   setQuery]   = useState('');
  const [sort,    setSort]    = useState<SortKey>('az');
  const [showSort, setShowSort] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'series'>('all');

  const movies = data?.movies ?? [];
  const total  = data?.total  ?? 0;

  const filtered = useMemo(() => {
    let list = movies;
    if (typeFilter !== 'all') list = list.filter(m => m.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q));
    }
    const copy = [...list];
    if (sort === 'az')     copy.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za')     copy.sort((a, b) => b.title.localeCompare(a.title));
    if (sort === 'size')   copy.sort((a, b) => (b.size_mb ?? 0) - (a.size_mb ?? 0));
    if (sort === 'newest') copy.sort((a, b) => (b.year?.toString() ?? '').localeCompare(a.year?.toString() ?? ''));
    return copy;
  }, [movies, query, sort, typeFilter]);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;

  return (
    <Layout>
      <div className="pt-6 pb-24 px-4 md:pt-24 md:pb-20 md:px-12">

        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-5 h-5 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-black text-white">Downloaded Library</h1>
            </div>
            <p className="text-white/40 text-sm">
              {isLoading
                ? 'Loading…'
                : `${filtered.length.toLocaleString()} titles matched · ${total.toLocaleString()} files on server`
              }
            </p>
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSort(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {currentSort.label}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 w-44 overflow-hidden">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => { setSort(o.value); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      sort === o.value
                        ? 'text-primary font-semibold bg-primary/10'
                        : 'text-white/70 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search + type filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search downloaded titles…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'movie', 'series'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  typeFilter === t
                    ? 'bg-primary text-black border-primary font-bold'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
            {Array.from({ length: 42 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/40 gap-3">
            <HardDrive className="w-12 h-12 text-white/15" />
            <p>{query ? 'No titles match your search' : 'No downloads found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
            {filtered.map((movie, i) => (
              <MovieCard key={`${movie.id}-${i}`} movie={movie} index={i} />
            ))}
          </div>
        )}
      </div>
      <ScrollToTop />
    </Layout>
  );
}

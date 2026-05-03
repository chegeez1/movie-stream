import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout';
import { useSearchMovies, useSuggestMovies, usePopularSearches } from '@/hooks/use-movies';
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, X, Loader2, TrendingUp, Film, Tv, ChevronUp, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/* ─── Recent Searches ──────────────────────────────────────────────────── */
const RECENT_KEY = 'cgm_recent_searches';
const MAX_RECENT = 6;

function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function saveRecent(searches: string[]) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(searches)); } catch {}
}
function pushRecent(q: string) {
  if (!q.trim()) return;
  const prev = readRecent().filter(s => s.toLowerCase() !== q.toLowerCase());
  saveRecent([q.trim(), ...prev].slice(0, MAX_RECENT));
}

function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(readRecent);
  const refresh = () => setRecent(readRecent());
  const remove = (q: string) => {
    const updated = readRecent().filter(s => s !== q);
    saveRecent(updated);
    setRecent(updated);
  };
  const clear = () => { localStorage.removeItem(RECENT_KEY); setRecent([]); };
  return { recent, refresh, remove, clear };
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 md:bottom-6 right-4 z-40 w-10 h-10 rounded-full bg-primary/90 hover:bg-primary text-white shadow-xl flex items-center justify-center transition-all hover:scale-110"
      title="Back to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type FilterType = 'ALL' | 'MOVIE' | 'TV_SHOW';

export default function SearchPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const [query,     setQuery]     = useState(searchParams.get('q') || '');
  const [isFocused, setIsFocused] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const { recent, refresh, remove, clear } = useRecentSearches();

  const debouncedQuery = useDebounce(query, 450);
  const { data: searchData, isLoading, isFetching } = useSearchMovies(debouncedQuery, 60);
  const { data: suggestData }  = useSuggestMovies(debouncedQuery);
  const { data: popularData }  = usePopularSearches();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      pushRecent(query.trim());
      refresh();
      window.history.replaceState(null, '', `/chege-movies/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (s: string) => {
    pushRecent(s);
    refresh();
    setQuery(s);
    window.history.replaceState(null, '', `/chege-movies/search?q=${encodeURIComponent(s)}`);
    setIsFocused(false);
  };

  const showSuggestions =
    isFocused &&
    debouncedQuery.length > 2 &&
    suggestData?.suggestions &&
    suggestData.suggestions.length > 0;

  /* Parse type counts from API */
  const counts: Record<string, number> = {};
  (searchData?.counts ?? []).forEach((c: any) => {
    counts[c.name] = c.count ?? 0;
  });

  /* Filter results by type tab */
  const allResults = searchData?.results ?? [];
  const filtered = typeFilter === 'ALL'
    ? allResults
    : typeFilter === 'MOVIE'
      ? allResults.filter(m => m.type === 'movie')
      : allResults.filter(m => m.type === 'series');

  const totalCount = counts['ALL'] ?? allResults.length;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-4 pb-24 md:py-8 max-w-6xl flex-1 flex flex-col">

        {/* Search bar */}
        <div className="relative w-full max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search movies, series, genres..."
              className="w-full pl-12 pr-12 py-6 text-lg rounded-2xl bg-card border-2 border-border/50 focus-visible:border-primary focus-visible:ring-primary/20 shadow-xl"
              data-testid="input-search-main"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
              <ScrollArea className="max-h-64">
                <div className="p-2">
                  {suggestData!.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <SearchIcon className="w-4 h-4 text-muted-foreground" />
                      {s}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* ── Empty state: recent + popular searches ── */}
          {debouncedQuery.trim() === '' ? (
            <div className="flex flex-col items-center gap-8 pt-4">
              <div className="text-center text-muted-foreground">
                <SearchIcon className="w-14 h-14 mb-3 opacity-15 mx-auto" />
                <p className="text-base">What do you want to watch?</p>
              </div>

              {/* Recent searches */}
              {recent.length > 0 && (
                <div className="w-full max-w-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="flex items-center gap-1.5 text-xs text-white/40 font-semibold uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> Recent
                    </p>
                    <button
                      onClick={clear}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {recent.map(s => (
                      <div key={s} className="flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-full bg-white/8 border border-white/10 group">
                        <button
                          onClick={() => handleSuggestionClick(s)}
                          className="text-sm text-white/70 hover:text-white transition-colors"
                        >
                          {s}
                        </button>
                        <button
                          onClick={() => remove(s)}
                          className="ml-1 text-white/20 hover:text-white/60 transition-colors rounded-full p-0.5"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {popularData?.searches && popularData.searches.length > 0 && (
                <div className="w-full max-w-lg">
                  <p className="flex items-center gap-1.5 text-xs text-white/40 font-semibold uppercase tracking-widest mb-3 justify-center">
                    <TrendingUp className="w-3.5 h-3.5" /> Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {popularData.searches.slice(0, 16).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="px-4 py-1.5 rounded-full bg-white/8 hover:bg-white/15 text-white/70 hover:text-white text-sm transition-colors border border-white/10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
            </div>
          ) : allResults.length > 0 ? (
            <div>
              {/* Header: result count + type filter tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <span className="text-white/70 text-sm">
                    <span className="text-white font-bold">{totalCount.toLocaleString()}</span> results for{' '}
                    <span className="text-primary font-bold">"{debouncedQuery}"</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isFetching && <Loader2 className="w-4 h-4 animate-spin text-primary" />}

                  {(['ALL', 'MOVIE', 'TV_SHOW'] as FilterType[]).map(t => {
                    const label = t === 'ALL' ? 'All' : t === 'MOVIE' ? 'Movies' : 'Series';
                    const icon  = t === 'MOVIE' ? <Film className="w-3 h-3" /> : t === 'TV_SHOW' ? <Tv className="w-3 h-3" /> : null;
                    const cnt   = t === 'ALL' ? (counts['ALL'] || allResults.length) : (counts[t] ?? 0);
                    return (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          typeFilter === t
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {icon}{label}
                        {cnt > 0 && (
                          <span className={`ml-0.5 text-[10px] ${typeFilter === t ? 'text-white/80' : 'text-white/35'}`}>
                            {cnt}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-white/40 text-sm">
                  No {typeFilter === 'MOVIE' ? 'movies' : 'series'} found for this query
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {filtered.map((movie, i) => (
                    <MovieCard key={movie.id} movie={movie} index={i} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground gap-2">
              <p className="text-lg">No results found for "{debouncedQuery}"</p>
              <p className="text-sm opacity-70">Try checking for typos or using different keywords.</p>
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
    </Layout>
  );
}

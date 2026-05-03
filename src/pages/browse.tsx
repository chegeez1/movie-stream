import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRoute } from 'wouter';
import { Layout } from '@/components/layout';
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card';
import { fetchMovies } from '@/lib/api';
import { Loader2, ChevronDown, ArrowUpDown, ChevronUp } from 'lucide-react';
import type { Movie } from '@/lib/api';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 500);
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

const GENRES = [
  'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Anime', 'K-Drama', 'Biography',
];

const YEARS = ['All', ...Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() - i))];

const COUNTRIES = ['All', 'United States', 'United Kingdom', 'South Korea', 'Japan', 'France', 'India', 'Nigeria', 'China'];

type SortKey = 'default' | 'newest' | 'rating' | 'az';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default',  label: 'Default'         },
  { value: 'newest',   label: 'Newest First'     },
  { value: 'rating',   label: 'Highest Rated'    },
  { value: 'az',       label: 'A → Z'            },
];

const TYPE_CONFIG: Record<string, { label: string }> = {
  series:   { label: 'TV Shows'       },
  movies:   { label: 'Movies'         },
  trending: { label: 'New & Popular'  },
  all:      { label: 'All Titles'     },
};

export default function Browse() {
  const [, params]  = useRoute('/browse/:type');
  const routeType   = params?.type ?? 'all';
  const config      = TYPE_CONFIG[routeType] ?? TYPE_CONFIG.all;

  const [genre,    setGenre]    = useState(() => {
    const p = new URLSearchParams(window.location.search).get('genre');
    return (p && GENRES.includes(p)) ? p : 'All';
  });
  const [year,     setYear]     = useState('All');
  const [country,  setCountry]  = useState('All');
  const [sort,     setSort]     = useState<SortKey>('default');
  const [showYear, setShowYear] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const apiType: 'movie' | 'series' | undefined =
    routeType === 'movies'  ? 'movie'  :
    routeType === 'series'  ? 'series' : undefined;

  const [movies,    setMovies]    = useState<Movie[]>([]);
  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(true);
  const [loading,   setLoading]   = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setFirstLoad(true);
  }, [routeType, genre, year, country]);

  const fetchPage = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const g = genre   !== 'All' ? genre          : undefined;
      const y = year    !== 'All' ? Number(year)   : undefined;
      const c = country !== 'All' ? country        : undefined;
      const res = await fetchMovies(apiType, pg, 48, g, y, c);
      setMovies(prev => pg === 1 ? res.movies : [...prev, ...res.movies]);
      setHasMore(res.has_more);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  }, [apiType, genre, year, country]);

  useEffect(() => { fetchPage(page); }, [page, genre, year, country, routeType]);

  /* Client-side sort */
  const sortedMovies = useMemo(() => {
    if (sort === 'default') return movies;
    const copy = [...movies];
    if (sort === 'newest') copy.sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''));
    if (sort === 'rating') copy.sort((a, b) => Number(b.imdb_rating ?? 0) - Number(a.imdb_rating ?? 0));
    if (sort === 'az')     copy.sort((a, b) => a.title.localeCompare(b.title));
    return copy;
  }, [movies, sort]);

  const hasFilters  = genre !== 'All' || year !== 'All' || country !== 'All';
  const clearAll    = () => { setGenre('All'); setYear('All'); setCountry('All'); setShowYear(false); setShowCountry(false); };
  const showSkeleton = loading && movies.length === 0;
  const currentSort  = SORT_OPTIONS.find(o => o.value === sort)!;

  return (
    <Layout>
      <div className="pt-6 pb-24 px-4 md:pt-24 md:pb-20 md:px-12">

        {/* Header */}
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{config.label}</h1>
            {!loading && movies.length > 0 && (
              <p className="text-white/40 text-sm">{movies.length.toLocaleString()}+ titles loaded</p>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSort(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                sort !== 'default'
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
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

        {/* Genre chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                genre === g
                  ? 'bg-primary text-black border-primary font-bold'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/15 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Year + Country + Clear */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-white/10">
          {/* Year toggle */}
          <div className="relative">
            <button
              onClick={() => { setShowYear(v => !v); setShowCountry(false); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                year !== 'All'
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
              }`}
            >
              {year !== 'All' ? `Year: ${year}` : 'Year ▾'}
            </button>
            {showYear && (
              <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 p-2 flex flex-wrap gap-1 w-56">
                {YEARS.map(y => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setShowYear(false); }}
                    className={`px-2 py-0.5 rounded text-xs border transition-all ${
                      year === y
                        ? 'bg-primary text-black border-primary font-bold'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/15'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Country toggle */}
          <div className="relative">
            <button
              onClick={() => { setShowCountry(v => !v); setShowYear(false); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                country !== 'All'
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
              }`}
            >
              {country !== 'All' ? country : 'Country ▾'}
            </button>
            {showCountry && (
              <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 p-2 w-52">
                {COUNTRIES.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCountry(c); setShowCountry(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs transition-all ${
                      country === c
                        ? 'bg-primary/15 text-primary font-semibold'
                        : 'text-white/60 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-primary hover:underline">
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {showSkeleton ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
            {Array.from({ length: 42 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        ) : sortedMovies.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/40 gap-3">
            <p>No titles found — try a different filter</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
              {sortedMovies.map((movie, i) => (
                <MovieCard key={`${movie.id}-${i}`} movie={movie} index={i} />
              ))}
              {loading && Array.from({ length: 14 }).map((_, i) => <MovieCardSkeleton key={`sk-${i}`} />)}
            </div>

            {hasMore && !loading && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-10 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded transition-colors"
                >
                  Load More
                </button>
              </div>
            )}

            {loading && movies.length > 0 && (
              <div className="flex justify-center mt-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </div>
      <ScrollToTop />
    </Layout>
  );
}

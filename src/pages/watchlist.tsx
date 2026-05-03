import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { MovieCard } from '@/components/movie-card';
import { useWatchlist } from '@/hooks/use-watchlist';
import { Bookmark, Trash2, Film, Tv, ArrowUpDown } from 'lucide-react';
import type { Movie } from '@/lib/api';

type SortKey = 'newest' | 'oldest' | 'az' | 'rating';

const SORT_OPTS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Recently Added' },
  { value: 'oldest', label: 'Oldest First'   },
  { value: 'az',     label: 'A → Z'          },
  { value: 'rating', label: 'Highest Rated'  },
];

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [sort,   setSort]   = useState<SortKey>('newest');
  const [showSort, setShowSort] = useState(false);

  const filtered = watchlist
    .filter(w => filter === 'all' || w.type === filter)
    .slice()
    .sort((a, b) => {
      if (sort === 'newest') return b.added_at - a.added_at;
      if (sort === 'oldest') return a.added_at - b.added_at;
      if (sort === 'az')     return a.title.localeCompare(b.title);
      if (sort === 'rating') return Number(b.imdb_rating ?? 0) - Number(a.imdb_rating ?? 0);
      return 0;
    });

  const movies  = watchlist.filter(w => w.type === 'movie').length;
  const series  = watchlist.filter(w => w.type === 'series').length;
  const currentSort = SORT_OPTS.find(o => o.value === sort)!;

  /* Convert WatchlistItem to Movie shape for MovieCard */
  const toMovie = (w: (typeof watchlist)[0]): Movie => ({
    id:          w.detail_path,
    detail_path: w.detail_path,
    title:       w.title,
    type:        w.type,
    year:        w.year ?? '',
    poster_url:  w.poster_url ?? undefined,
    imdb_rating: w.imdb_rating ?? undefined,
  });

  return (
    <Layout>
      <div className="pt-24 pb-24 px-5 md:px-12">

        {/* Header */}
        <div className="mb-7 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-2.5">
              <Bookmark className="w-7 h-7 text-primary fill-primary" />
              My Watchlist
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {watchlist.length} saved  ·  {movies} movies  ·  {series} series
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSort(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {currentSort.label}
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 w-44 overflow-hidden">
                  {SORT_OPTS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setSort(o.value); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sort === o.value ? 'text-primary font-semibold bg-primary/10' : 'text-white/70 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {watchlist.length > 0 && (
              <button
                onClick={clearWatchlist}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white/35 hover:text-red-400 border border-white/10 hover:border-red-400/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Type filter tabs */}
        {watchlist.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            {[
              { value: 'all',    label: `All (${watchlist.length})`,   Icon: null  },
              { value: 'movie',  label: `Movies (${movies})`,          Icon: Film  },
              { value: 'series', label: `Series (${series})`,          Icon: Tv    },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setFilter(value as typeof filter)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filter === value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Bookmark className="w-9 h-9 text-white/20" />
            </div>
            <div>
              <p className="text-white/60 text-lg font-semibold">Nothing saved yet</p>
              <p className="text-white/30 text-sm mt-1">Tap the bookmark icon on any title to save it here</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-white/40 text-sm">
            No {filter === 'movie' ? 'movies' : 'series'} in your watchlist
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
            {filtered.map((item, i) => (
              <MovieCard key={item.detail_path} movie={toMovie(item)} index={i} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

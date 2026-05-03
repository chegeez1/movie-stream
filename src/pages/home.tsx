import React, { useState, useEffect, useRef } from 'react';
import { useHomeData, useTrendingMovies, useTopRated, useRanking, useNewReleases, useFeatured, useSimilar } from '@/hooks/use-movies';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { Layout } from '@/components/layout';
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX, Share2, X, Clock, Trash2, Shuffle } from 'lucide-react';
import type { BannerItem, HomeSection, Movie } from '@/lib/api';
import { fetchRandomMovie } from '@/lib/api';
import type { WatchHistoryItem } from '@/hooks/use-watch-history';

/* ─── Genre quick-nav chips ───────────────────────────────────────────── */
const GENRE_CHIPS = [
  { emoji: '🔥', label: 'Action',    genre: 'Action'     },
  { emoji: '😂', label: 'Comedy',    genre: 'Comedy'     },
  { emoji: '💕', label: 'Romance',   genre: 'Romance'    },
  { emoji: '😱', label: 'Thriller',  genre: 'Thriller'   },
  { emoji: '🎭', label: 'Drama',     genre: 'Drama'      },
  { emoji: '🧙', label: 'Fantasy',   genre: 'Fantasy'    },
  { emoji: '🔍', label: 'Mystery',   genre: 'Mystery'    },
  { emoji: '🧬', label: 'Sci-Fi',    genre: 'Sci-Fi'     },
  { emoji: '👪', label: 'Family',    genre: 'Family'     },
  { emoji: '🧟', label: 'Horror',    genre: 'Horror'     },
  { emoji: '📖', label: 'Biography', genre: 'Biography'  },
  { emoji: '🎬', label: 'Crime',     genre: 'Crime'      },
  { emoji: '🌸', label: 'Anime',     genre: 'Anime'      },
  { emoji: '🇰🇷', label: 'K-Drama',  genre: 'K-Drama'    },
];

function GenreChips() {
  const [, navigate] = useLocation();
  const [lucky, setLucky] = useState(false);

  const handleLucky = async () => {
    setLucky(true);
    try {
      const { movie } = await fetchRandomMovie();
      if (movie?.detail_path) navigate(`/movie/${movie.detail_path}`);
    } catch {}
    finally { setLucky(false); }
  };

  return (
    <div className="px-5 md:px-10 py-3">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 items-center">
        {/* Feeling Lucky */}
        <button
          onClick={handleLucky}
          disabled={lucky}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all text-[13px] font-semibold whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <Shuffle className="w-3.5 h-3.5" />
          {lucky ? 'Loading…' : 'Feeling Lucky'}
        </button>

        <div className="w-px h-5 bg-white/10 shrink-0" />

        {GENRE_CHIPS.map(({ emoji, label, genre }) => (
          <Link key={genre} href={`/browse/all?genre=${encodeURIComponent(genre)}`}>
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.07] border border-white/10 text-white/65 hover:text-white hover:bg-white/15 hover:border-white/25 transition-all text-[13px] font-medium whitespace-nowrap cursor-pointer shrink-0">
              <span className="text-sm leading-none">{emoji}</span>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────── */
function Hero({ items }: { items: BannerItem[] }) {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (i: number) => setCurrent((i + items.length) % items.length);

  useEffect(() => {
    timer.current = setTimeout(() => go(current + 1), 7000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [current, items.length]);

  if (!items.length) return <div className="h-[100svh] bg-zinc-900 animate-pulse" />;

  const item = items[current];
  const img = item.bannerImage || item.stillsUrl || item.posterUrl;
  const isSeries = item.type === 'series';
  const year = item.releaseDate?.slice(0, 4);
  const genres = item.genre?.split(',').slice(0, 3).map(g => g.trim()).filter(Boolean) ?? [];

  return (
    <div className="relative w-full h-[100svh] overflow-hidden select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {img && (
            <img
              src={img}
              alt={item.title}
              className="w-full h-full object-cover object-top"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a]/70 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <div className="absolute top-5 right-6 flex items-center gap-1.5 z-20">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-sm transition-all duration-300 ${
              i === current ? 'w-6 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-5 md:px-10 pb-8 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="max-w-lg"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${
                isSeries ? 'bg-violet-600 text-white' : 'bg-primary text-white'
              }`}>
                {isSeries ? 'SERIES' : 'MOVIE'}
              </span>
              {year && <span className="text-[11px] font-semibold text-white/70">{year}</span>}
              {item.imdbRating && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-yellow-400">
                  ★ {item.imdbRating}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight drop-shadow-xl">
              {item.title}
            </h1>
            {genres.length > 0 && (
              <p className="text-sm text-white/55">{genres.join(' • ')}</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button onClick={() => go(current - 1)} className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 flex items-center justify-center text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => go(current + 1)} className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 flex items-center justify-center text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <Link href={`/movie/${item.detailPath}`}>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/85 transition-colors text-sm shadow-lg shadow-primary/25">
              <Play className="w-4 h-4 fill-white" />
              Watch Now
            </button>
          </Link>
          <button onClick={() => setMuted(v => !v)} className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 flex items-center justify-center text-white transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              if (navigator.share) navigator.share({ url: window.location.href, title: item.title }).catch(() => {});
              else navigator.clipboard.writeText(window.location.href);
            }}
            className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 flex items-center justify-center text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Generic scrollable row ──────────────────────────────────────────── */
function Row({ title, movies, isLoading, href }: {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'l' | 'r') =>
    ref.current?.scrollBy({ left: dir === 'r' ? 640 : -640, behavior: 'smooth' });

  if (!isLoading && movies.length === 0) return null;

  return (
    <section className="py-3 group/row">
      <div className="px-5 md:px-10 mb-3 flex items-center justify-between">
        <h2 className="text-white font-bold text-[15px]">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
            See More <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => scroll('l')}
          className="absolute left-0 top-0 bottom-3 z-10 w-10 bg-gradient-to-r from-[#0a0a0a] to-transparent flex items-center pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div ref={ref} className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 md:px-10 pb-1">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-[130px] md:w-[152px] shrink-0"><MovieCardSkeleton /></div>
              ))
            : movies.map((m, i) => (
                <div key={m.id} className="w-[130px] md:w-[152px] shrink-0">
                  <MovieCard movie={m} index={i} />
                </div>
              ))}
        </div>
        <button
          onClick={() => scroll('r')}
          className="absolute right-0 top-0 bottom-3 z-10 w-10 bg-gradient-to-l from-[#0a0a0a] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </section>
  );
}

/* ─── Continue Watching row ───────────────────────────────────────────── */
function ContinueWatchingRow({
  items,
  onRemove,
  onClear,
}: {
  items: WatchHistoryItem[];
  onRemove: (path: string) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'l' | 'r') =>
    ref.current?.scrollBy({ left: dir === 'r' ? 640 : -640, behavior: 'smooth' });

  if (items.length === 0) return null;

  return (
    <section className="py-3 group/row">
      <div className="px-5 md:px-10 mb-3 flex items-center justify-between">
        <h2 className="text-white font-bold text-[15px] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          Continue Watching
        </h2>
        <button
          onClick={onClear}
          className="text-xs text-white/35 hover:text-white/70 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Clear all
        </button>
      </div>
      <div className="relative">
        <button
          onClick={() => scroll('l')}
          className="absolute left-0 top-0 bottom-3 z-10 w-10 bg-gradient-to-r from-[#0a0a0a] to-transparent flex items-center pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div ref={ref} className="flex gap-2.5 overflow-x-auto hide-scrollbar px-5 md:px-10 pb-1">
          {items.map((item, i) => (
            <div key={item.detail_path} className="w-[130px] md:w-[152px] shrink-0 relative group/card">
              <Link href={`/movie/${item.detail_path}`}>
                <div className="rounded-lg overflow-hidden cursor-pointer bg-zinc-900 hover:scale-[1.03] transition-transform duration-200">
                  <div className="aspect-[2/3] relative">
                    {item.poster_url ? (
                      <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <Play className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      {item.type === 'series' && item.ep && (
                        <span className="text-[9px] font-bold text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
                          S{item.season ?? 1} E{item.ep}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-white/75 text-[11px] font-medium line-clamp-1">{item.title}</p>
                    <p className="text-white/35 text-[10px]">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(item.detail_path); }}
                className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/70 text-white/70 hover:text-white hover:bg-black flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll('r')}
          className="absolute right-0 top-0 bottom-3 z-10 w-10 bg-gradient-to-l from-[#0a0a0a] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </section>
  );
}

/* ─── Personalized "Because you watched" row ──────────────────────────── */
function PersonalizedRow({ history }: { history: WatchHistoryItem[] }) {
  const recentItem = history[0];
  const { data, isLoading } = useSimilar(recentItem?.detail_path ?? '', 12);

  if (!recentItem) return null;
  if (!isLoading && !data?.similar?.length) return null;

  const shortTitle = recentItem.title.length > 22
    ? recentItem.title.slice(0, 20) + '…'
    : recentItem.title;

  return (
    <Row
      title={`Because you watched "${shortTitle}"`}
      movies={data?.similar ?? []}
      isLoading={isLoading}
      href={`/movie/${recentItem.detail_path}`}
    />
  );
}

/* ─── Curated collections ─────────────────────────────────────────────── */
const COLLECTIONS = [
  { emoji: '🏆', title: 'Award Winners',  subtitle: 'Critically acclaimed',  href: '/browse/movies',            gradient: 'from-yellow-900/60 to-yellow-700/20'  },
  { emoji: '💕', title: 'Date Night',     subtitle: 'Romance & comedy',       href: '/browse/all?genre=Romance',  gradient: 'from-pink-900/60 to-rose-700/20'      },
  { emoji: '💥', title: 'Action Heroes',  subtitle: 'Thrill & adventure',     href: '/browse/all?genre=Action',   gradient: 'from-red-900/60 to-orange-700/20'     },
  { emoji: '🌸', title: 'Anime Picks',   subtitle: 'Best of anime',           href: '/browse/all?genre=Anime',    gradient: 'from-purple-900/60 to-violet-700/20'  },
  { emoji: '👻', title: 'Horror Night',  subtitle: 'Scare yourself silly',    href: '/browse/all?genre=Horror',   gradient: 'from-gray-900/70 to-zinc-700/20'      },
  { emoji: '👪', title: 'Family Night',  subtitle: 'For all ages',            href: '/browse/all?genre=Family',   gradient: 'from-green-900/60 to-emerald-700/20'  },
  { emoji: '🔍', title: 'Crime Drama',   subtitle: 'Suspense & mystery',      href: '/browse/all?genre=Crime',    gradient: 'from-blue-900/60 to-indigo-700/20'    },
  { emoji: '🇰🇷', title: 'K-Drama',      subtitle: 'Korean series',           href: '/browse/series?genre=K-Drama', gradient: 'from-cyan-900/60 to-sky-700/20'    },
  { emoji: '🚀', title: 'Sci-Fi Worlds', subtitle: 'Future & space',          href: '/browse/all?genre=Sci-Fi',   gradient: 'from-teal-900/60 to-cyan-700/20'      },
];

function CollectionsRow() {
  const ref = React.useRef<HTMLDivElement>(null);
  const scroll = (dir: 'l' | 'r') =>
    ref.current?.scrollBy({ left: dir === 'r' ? 480 : -480, behavior: 'smooth' });

  return (
    <section className="py-3 group/row">
      <div className="px-5 md:px-10 mb-3 flex items-center justify-between">
        <h2 className="text-white font-bold text-[15px]">Browse Collections 🎭</h2>
      </div>
      <div className="relative">
        <button
          onClick={() => scroll('l')}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-[#0a0a0a] to-transparent flex items-center pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div ref={ref} className="flex gap-3 overflow-x-auto hide-scrollbar px-5 md:px-10 pb-1">
          {COLLECTIONS.map(({ emoji, title, subtitle, href, gradient }) => (
            <Link key={title} href={href}>
              <div className={`shrink-0 w-[168px] h-[90px] rounded-xl bg-gradient-to-br ${gradient} border border-white/10 hover:border-white/25 hover:scale-[1.03] transition-all cursor-pointer flex flex-col justify-between p-3.5 group/col`}>
                <span className="text-2xl leading-none">{emoji}</span>
                <div>
                  <p className="text-white font-bold text-[13px] leading-tight">{title}</p>
                  <p className="text-white/45 text-[10px] font-medium mt-0.5">{subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <button
          onClick={() => scroll('r')}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-[#0a0a0a] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </section>
  );
}

/* ─── Home page ───────────────────────────────────────────────────────── */
export default function Home() {
  const { data, isLoading: homeLoading }               = useHomeData();
  const { data: trendingData, isLoading: trendingLoading } = useTrendingMovies(20);
  const { data: topRatedData, isLoading: topRatedLoading } = useTopRated(20);
  const { data: rankingData,  isLoading: rankingLoading  } = useRanking('', 1, 20);
  const { data: newRelData,   isLoading: newRelLoading   } = useNewReleases(20);
  const { data: featuredData, isLoading: featuredLoading } = useFeatured(20);
  const { history, removeFromHistory, clearHistory }    = useWatchHistory();

  const bannerItems  = data?.banner?.items ?? [];
  const apiSections  = data?.operatingList ?? [];
  const trending     = trendingData?.trending ?? [];
  const topRated     = topRatedData?.movies    ?? [];
  const charts       = rankingData?.movies     ?? [];
  const newReleases  = newRelData?.movies      ?? [];
  const featured     = featuredData?.movies    ?? [];

  const sectionHref = (s: HomeSection) => {
    const t = s.title.toLowerCase();
    if (t.includes('series') || t.includes('drama') || t.includes('show') || t.includes('anime') || t.includes('k-')) return '/browse/series';
    return '/browse/movies';
  };

  return (
    <Layout>
      {homeLoading
        ? <div className="h-[100svh] bg-zinc-900 animate-pulse" />
        : <Hero items={bannerItems} />
      }

      <div className="pb-24 -mt-16 relative z-10">
        {/* Continue Watching */}
        <ContinueWatchingRow
          items={history}
          onRemove={removeFromHistory}
          onClear={clearHistory}
        />

        {/* Genre mood chips — always visible */}
        <GenreChips />

        <Row title="Trending Now 🔥"    movies={trending}    isLoading={trendingLoading} href="/browse/trending" />

        {/* Personalized row — only shown if user has watch history */}
        <PersonalizedRow history={history} />

        <Row title="New Releases ✨"    movies={newReleases} isLoading={newRelLoading}   href="/browse/movies" />
        <Row title="Featured Today 🎯"  movies={featured}    isLoading={featuredLoading} href="/browse/all" />
        <CollectionsRow />
        <Row title="Charts 📊"          movies={charts}      isLoading={rankingLoading} />
        <Row title="Top Rated ⭐"       movies={topRated}    isLoading={topRatedLoading} href="/browse/movies" />

        {homeLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Row key={i} title="Loading…" movies={[]} isLoading />
            ))
          : apiSections.map((section, i) => (
              <Row
                key={`${section.title}-${i}`}
                title={section.title}
                movies={section.subjects}
                href={sectionHref(section)}
              />
            ))
        }
      </div>
    </Layout>
  );
}

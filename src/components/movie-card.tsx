import React from 'react';
import { Link } from 'wouter';
import { Movie } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Star, Tv, Film, Bookmark, BookmarkCheck } from 'lucide-react';
import { usePrefetchPlay } from '@/hooks/use-movies';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useToast } from '@/hooks/use-toast';
import { useRatings } from '@/hooks/use-ratings';

const NEW_THRESHOLD_DAYS = 45;

function isNewRelease(movie: Movie): boolean {
  if (!movie.release_date) return false;
  const age = Date.now() - new Date(movie.release_date).getTime();
  return age < NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

function StarRow({ detailPath, rating, onRate }: { detailPath: string; rating: number; onRate: (s: number) => void }) {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRate(s === rating ? 0 : s); }}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
          title={`Rate ${s} star${s !== 1 ? 's' : ''}`}
        >
          <Star
            className={`w-3 h-3 transition-colors ${
              s <= (hovered || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-white/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const prefetch    = usePrefetchPlay(movie.detail_path);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { toast }   = useToast();
  const { getRating, rate } = useRatings();
  const isSeries    = movie.type === 'series';
  const isNew       = isNewRelease(movie);
  const bookmarked  = isInWatchlist(movie.detail_path);
  const myRating    = getRating(movie.detail_path);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasIn = isInWatchlist(movie.detail_path);
    toggleWatchlist({
      detail_path: movie.detail_path,
      title:       movie.title,
      poster_url:  movie.poster_url,
      type:        movie.type,
      imdb_rating: movie.imdb_rating,
      year:        movie.year,
    });
    toast({
      description: wasIn ? 'Removed from Watchlist' : '✓ Added to Watchlist',
      duration: 2000,
    });
  };

  return (
    <Link href={`/movie/${movie.detail_path}`} onMouseEnter={prefetch} data-testid={`movie-card-${movie.id}`}>
      <div
        className="group relative rounded-lg overflow-hidden cursor-pointer bg-zinc-900 transition-all duration-200 ease-out hover:scale-[1.03] hover:z-10 hover:shadow-2xl"
        style={{ animationDelay: `${index * 25}ms` }}
      >
        <div className="aspect-[2/3] relative">
          {movie.poster_url && !imgFailed ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="object-cover w-full h-full"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 p-3 gap-2">
              <Play className="w-8 h-8 text-zinc-600" />
              <p className="text-zinc-500 text-[10px] text-center leading-tight line-clamp-3">{movie.title}</p>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-11 h-11 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            </div>
          </div>

          {/* Star rating row — bottom of card, shown on hover */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              <StarRow detailPath={movie.detail_path} rating={myRating} onRate={(s) => rate(movie.detail_path, s)} />
            </div>
          </div>

          {/* Bookmark button — always visible on touch, hover on desktop */}
          <button
            onClick={handleBookmark}
            className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
              bookmarked
                ? 'bg-primary text-white opacity-100'
                : 'bg-black/60 text-white/70 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-primary/80 hover:text-white'
            }`}
            title={bookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {bookmarked
              ? <BookmarkCheck className="w-3 h-3" />
              : <Bookmark className="w-3 h-3" />
            }
          </button>

          {/* Type badge — bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide bg-black/60 text-white/80">
              {isSeries ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
              {isSeries ? 'Series' : 'Movie'}
            </span>
          </div>

          {/* My-rating indicator dot — top-right corner (when rated) */}
          {myRating > 0 && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-yellow-400/90 text-black text-[8px] font-black px-1.5 py-0.5 rounded">
              <Star className="w-2 h-2 fill-black" />
              {myRating}
            </div>
          )}

          {/* IMDB rating — top-right (only when no personal rating) */}
          {movie.imdb_rating && !myRating && (
            <div className="absolute top-1.5 right-1.5">
              <span className="flex items-center gap-0.5 bg-black/60 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                <Star className="w-2 h-2 fill-current" />
                {movie.imdb_rating}
              </span>
            </div>
          )}

          {/* NEW badge — shown only when no rating badge */}
          {isNew && !movie.imdb_rating && !myRating && (
            <div className="absolute top-1.5 right-1.5">
              <span className="bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                NEW
              </span>
            </div>
          )}
        </div>

        {/* Title below card */}
        <div className="px-2 py-1.5">
          <p className="text-white/75 text-[11px] font-medium line-clamp-1">{movie.title}</p>
          {movie.year && <p className="text-white/35 text-[10px]">{movie.year}</p>}
        </div>
      </div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="aspect-[2/3]">
        <Skeleton className="w-full h-full bg-zinc-800/60" />
      </div>
      <div className="px-2 py-1.5 space-y-1">
        <Skeleton className="h-2.5 w-3/4 bg-zinc-800/60" />
        <Skeleton className="h-2 w-1/3 bg-zinc-800/60" />
      </div>
    </div>
  );
}

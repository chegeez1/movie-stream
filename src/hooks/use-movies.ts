import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTrending,
  fetchRecent,
  fetchPopularSearches,
  searchMovies,
  suggestMovies,
  fetchStreamData,
  fetchRelated,
  fetchHome,
  fetchMovies,
  fetchPlay,
  fetchTopRated,
  fetchRanking,
  fetchGenres,
  fetchNewReleases,
  fetchSimilar,
  fetchFeatured,
  fetchMoviesByGenre,
  fetchMoodMovies,
} from '@/lib/api';

export function useTrendingMovies(limit = 20) {
  return useQuery({
    queryKey: ['movies', 'trending', limit],
    queryFn: () => fetchTrending(limit),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useRecentMovies(limit = 20) {
  return useQuery({
    queryKey: ['movies', 'recent', limit],
    queryFn: () => fetchRecent(limit),
  });
}

export function usePopularSearches() {
  return useQuery({
    queryKey: ['movies', 'popular-searches'],
    queryFn: () => fetchPopularSearches(),
  });
}

export function useSearchMovies(q: string, limit = 20) {
  return useQuery({
    queryKey: ['movies', 'search', q, limit],
    queryFn: () => searchMovies(q, limit),
    enabled: !!q,
  });
}

export function useSuggestMovies(q: string) {
  return useQuery({
    queryKey: ['movies', 'suggest', q],
    queryFn: () => suggestMovies(q),
    enabled: q.length > 2,
  });
}

export function useStreamData(detailPath: string) {
  return useQuery({
    queryKey: ['movies', 'stream', detailPath],
    queryFn: () => fetchStreamData(detailPath),
    enabled: !!detailPath,
  });
}

export function useRelatedMovies(subjectId: string, limit = 12) {
  return useQuery({
    queryKey: ['movies', 'related', subjectId, limit],
    queryFn: () => fetchRelated(subjectId, limit),
    enabled: !!subjectId,
  });
}

export function useHomeData() {
  return useQuery({
    queryKey: ['movies', 'home'],
    queryFn: fetchHome,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useMoviesList(type?: 'movie' | 'series', page = 1, limit = 48) {
  return useQuery({
    queryKey: ['movies', 'list', type, page, limit],
    queryFn: () => fetchMovies(type, page, limit),
  });
}

/**
 * Combined stream + ranked servers in one request.
 * ep/season default to 1/1 — the modal can call fetchPlay directly for
 * different episode combos (server-side cache makes it instant after first probe).
 */
export function usePlayData(detailPath: string) {
  return useQuery({
    queryKey: ['movies', 'play', detailPath],
    queryFn: () => fetchPlay(detailPath, 1, 1),
    enabled: !!detailPath,
    staleTime: 5 * 60 * 1000,   /* 5 min — server probes may change */
    gcTime:   30 * 60 * 1000,
  });
}

export function useTopRated(limit = 20, type?: 'movie' | 'series') {
  return useQuery({
    queryKey: ['movies', 'top-rated', limit, type],
    queryFn: () => fetchTopRated(limit, type),
    staleTime: 30 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
  });
}

export function useRanking(id = '', page = 1, limit = 20) {
  return useQuery({
    queryKey: ['movies', 'ranking', id, page, limit],
    queryFn: () => fetchRanking(id, page, limit),
    staleTime: 15 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ['movies', 'genres'],
    queryFn: fetchGenres,
    staleTime: Infinity,  /* genres don't change */
    gcTime:    Infinity,
  });
}

/** Pre-fetch play data on hover so clicking Watch is instant. */
export function usePrefetchPlay(detailPath: string) {
  const qc = useQueryClient();
  return () => {
    if (!detailPath) return;
    qc.prefetchQuery({
      queryKey: ['movies', 'play', detailPath],
      queryFn: () => fetchPlay(detailPath, 1, 1),
      staleTime: 5 * 60 * 1000,
    });
  };
}

export function useNewReleases(limit = 20, type?: 'movie' | 'series') {
  return useQuery({
    queryKey: ['movies', 'new-releases', limit, type],
    queryFn: () => fetchNewReleases(limit, type),
    staleTime: 15 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
  });
}

export function useSimilar(detailPath: string, limit = 12) {
  return useQuery({
    queryKey: ['movies', 'similar', detailPath, limit],
    queryFn: () => fetchSimilar(detailPath, limit),
    enabled: !!detailPath,
    staleTime: 30 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
  });
}

export function useFeatured(limit = 20) {
  return useQuery({
    queryKey: ['movies', 'featured', limit],
    queryFn: () => fetchFeatured(limit),
    staleTime: 60 * 60 * 1000,
    gcTime:    2 * 60 * 60 * 1000,
  });
}

export function useMoviesByGenre(genre: string, limit = 20, type?: string) {
  return useQuery({
    queryKey: ['movies', 'by-genre', genre, limit, type],
    queryFn: () => fetchMoviesByGenre(genre, 1, limit, type),
    enabled: !!genre && genre !== 'All',
    staleTime: 30 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
  });
}

export function useMoodMovies(mood: string, limit = 20) {
  return useQuery({
    queryKey: ['movies', 'mood', mood, limit],
    queryFn: () => fetchMoodMovies(mood, limit),
    enabled: !!mood,
    staleTime: 60 * 60 * 1000,
    gcTime:    2 * 60 * 60 * 1000,
  });
}

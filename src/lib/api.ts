export interface Movie {
  id: string;
  detail_path: string;
  title: string;
  type: "movie" | "series";
  year: string | number;
  release_date?: string;
  duration?: string;
  genres?: string[];
  country?: string;
  imdb_rating?: string | number;
  poster_url?: string;
  stills_url?: string[];
  description?: string;
}

export interface BannerItem {
  title: string;
  subjectId: string;
  subjectType: number;
  detailPath: string;
  bannerImage: string;
  posterUrl?: string;
  stillsUrl?: string;
  description: string;
  genre: string;
  imdbRating?: string;
  releaseDate?: string;
  type: "movie" | "series";
}

export interface HomeSection {
  title: string;
  position: number;
  subjects: Movie[];
}

export interface HomeData {
  platformList: Array<{ name: string; uploadBy: string }>;
  banner: { items: BannerItem[] } | null;
  operatingList: HomeSection[];
}

export interface StreamData {
  id: string;
  detail_path: string;
  title: string;
  type: "movie" | "series";
  is_series: boolean;
  imdb_id?: string | null;
  cover_url?: string | null;
  stills_url?: string | null;
  description?: string | null;
  genre?: string | null;
  imdb_rating?: string | null;
  country?: string | null;
  release_date?: string | null;
  trailer?: {
    url: string;
    duration_seconds?: number;
    thumbnail?: string;
  };
  seasons?: Array<{
    season: number | string;
    episode_count: number;
    resolutions?: number[];
  }>;
  player?: {
    embed_url: string;
    url_format?: string;
  };
}

const API_BASE = '/movies-api';

export async function fetchTrending(limit = 20): Promise<{ trending: Movie[] }> {
  const res = await fetch(`${API_BASE}/trending?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch trending');
  const data = await res.json();
  const inner = data.data ?? {};
  return { trending: inner.trending ?? inner.movies ?? inner.items ?? [] };
}

export async function fetchRecent(limit = 20): Promise<{ recent: Movie[] }> {
  const res = await fetch(`${API_BASE}/recent?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch recent');
  const data = await res.json();
  const inner = data.data ?? {};
  return { recent: inner.recent ?? inner.movies ?? inner.items ?? [] };
}

export async function fetchPopularSearches(): Promise<{ searches: string[] }> {
  const res = await fetch(`${API_BASE}/popular-searches`);
  if (!res.ok) throw new Error('Failed to fetch popular searches');
  const data = await res.json();
  return data.data;
}

export async function searchMovies(q: string, limit = 20): Promise<{ results: Movie[], counts: any }> {
  const res = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to search movies');
  const data = await res.json();
  return data.data;
}

export async function suggestMovies(q: string): Promise<{ suggestions: string[] }> {
  const res = await fetch(`${API_BASE}/movies/suggest?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to fetch suggestions');
  const data = await res.json();
  return data.data;
}

export async function fetchStreamData(detailPath: string): Promise<StreamData> {
  const res = await fetch(`${API_BASE}/stream/${encodeURIComponent(detailPath)}`);
  if (!res.ok) throw new Error('Failed to fetch stream data');
  const data = await res.json();
  return data.data;
}

export async function fetchRelated(subjectId: string, limit = 12): Promise<{ related: Movie[] }> {
  const res = await fetch(`${API_BASE}/related/${encodeURIComponent(subjectId)}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch related movies');
  const data = await res.json();
  return data.data;
}

export async function fetchMovies(
  type?: 'movie' | 'series',
  page = 1,
  limit = 48,
  genre?: string,
  year?: number,
  country?: string,
): Promise<{ movies: Movie[]; total: number; has_more: boolean }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.set('type', type);
  if (genre) params.set('genre', genre);
  if (year) params.set('year', String(year));
  if (country) params.set('country', country);
  const res = await fetch(`${API_BASE}/movies?${params}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  const data = await res.json();
  return data.data;
}

export interface ServerResult {
  label: string;
  url: string;
  ok: boolean;
  latency_ms: number;
}

export interface PlayData {
  stream: StreamData;
  servers: {
    servers: ServerResult[];
    working_count: number;
    cached: boolean;
  } | null;
}

/**
 * Combined endpoint — fetches stream metadata + ranked embed servers in one
 * request. Both halves are cached server-side so repeat calls are instant.
 */
export async function fetchPlay(
  detailPath: string,
  ep = 1,
  season = 1,
): Promise<PlayData> {
  const params = new URLSearchParams({ ep: String(ep), season: String(season) });
  const res = await fetch(`${API_BASE}/play/${encodeURIComponent(detailPath)}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch play data');
  const data = await res.json();
  return data.data;
}

export async function checkServers(
  imdbId: string,
  type: 'movie' | 'tv',
  season = 1,
  episode = 1,
): Promise<{ servers: ServerResult[]; working_count: number }> {
  const params = new URLSearchParams({
    imdb_id: imdbId,
    type,
    season: String(season),
    episode: String(episode),
  });
  const res = await fetch(`${API_BASE}/servers?${params}`);
  if (!res.ok) throw new Error('Failed to check servers');
  const data = await res.json();
  return data.data;
}

export async function fetchTopRated(
  limit = 20,
  type?: 'movie' | 'series',
): Promise<{ movies: Movie[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (type) params.set('type', type);
  const res = await fetch(`${API_BASE}/movies/top-rated?${params}`);
  if (!res.ok) throw new Error('Failed to fetch top-rated');
  const data = await res.json();
  return data.data;
}

export async function fetchRanking(
  id = '',
  page = 1,
  limit = 20,
): Promise<{ movies: Movie[]; has_more: boolean }> {
  const params = new URLSearchParams({ id, page: String(page), limit: String(limit) });
  const res = await fetch(`${API_BASE}/ranking?${params}`);
  if (!res.ok) throw new Error('Failed to fetch ranking');
  const data = await res.json();
  return data.data;
}

export async function fetchGenres(): Promise<{ genres: string[] }> {
  const res = await fetch(`${API_BASE}/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  const data = await res.json();
  return data.data;
}

export async function fetchNewReleases(
  limit = 20,
  type?: 'movie' | 'series',
): Promise<{ movies: Movie[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (type) params.set('type', type);
  const res = await fetch(`${API_BASE}/movies/new-releases?${params}`);
  if (!res.ok) throw new Error('Failed to fetch new releases');
  const data = await res.json();
  return data.data;
}

export async function fetchSimilar(
  detailPath: string,
  limit = 12,
): Promise<{ similar: Movie[]; based_on: string[] }> {
  const res = await fetch(`${API_BASE}/movies/similar/${encodeURIComponent(detailPath)}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch similar titles');
  const data = await res.json();
  return data.data;
}

export async function fetchImdbLookup(
  title: string,
  year?: string,
  type = 'movie',
): Promise<{ imdb_id: string; title: string; year?: string }> {
  const params = new URLSearchParams({ title, type });
  if (year) params.set('year', year);
  const res = await fetch(`${API_BASE}/imdb/lookup?${params}`);
  if (!res.ok) throw new Error('IMDB ID not found');
  const data = await res.json();
  return data.data;
}

export async function fetchFeatured(limit = 20): Promise<{ movies: Movie[]; total: number }> {
  const res = await fetch(`${API_BASE}/movies/featured?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch featured movies');
  const data = await res.json();
  return data.data;
}

export async function fetchMoviesByGenre(
  genre: string,
  page = 1,
  limit = 20,
  type?: string,
): Promise<{ movies: Movie[]; genre: string; has_more: boolean; total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.set('type', type);
  const res = await fetch(`${API_BASE}/movies/by-genre/${encodeURIComponent(genre)}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch movies by genre');
  const data = await res.json();
  return data.data;
}

export async function fetchRandomMovie(type?: 'movie' | 'series'): Promise<{ movie: Movie }> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  const q = params.toString();
  const res = await fetch(`${API_BASE}/movies/random${q ? '?' + q : ''}`);
  if (!res.ok) throw new Error('Failed to fetch random movie');
  const data = await res.json();
  return data.data;
}

export async function fetchMoodMovies(
  mood: string,
  limit = 20,
): Promise<{ movies: Movie[]; mood: string; genres: string[] }> {
  const res = await fetch(`${API_BASE}/movies/mood/${encodeURIComponent(mood)}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch mood movies');
  const data = await res.json();
  return data.data;
}

export async function fetchHome(): Promise<HomeData> {
  const res = await fetch(`${API_BASE}/home`);
  if (!res.ok) throw new Error('Failed to fetch home data');
  const data = await res.json();
  const r = data.results ?? {};
  return {
    platformList: r.platformList ?? [],
    banner: r.banner ?? null,
    operatingList: r.operatingList ?? [],
  };
}

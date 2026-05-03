import { useState, useCallback, useEffect } from 'react';

export interface WatchlistItem {
  detail_path: string;
  title: string;
  poster_url?: string | null;
  type: 'movie' | 'series';
  added_at: number;
  imdb_rating?: string | number | null;
  year?: string | number | null;
}

const STORAGE_KEY  = 'cgm_watchlist';
const MAX_ITEMS    = 200;
const CHANGE_EVENT = 'cgm_watchlist_update';

function readWatchlist(): WatchlistItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

function save(items: WatchlistItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(readWatchlist);

  /* Keep all instances in sync when any one of them changes */
  useEffect(() => {
    const handler = () => setWatchlist(readWatchlist());
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'added_at'>) => {
    setWatchlist(prev => {
      if (prev.some(w => w.detail_path === item.detail_path)) return prev;
      const updated = [{ ...item, added_at: Date.now() }, ...prev].slice(0, MAX_ITEMS);
      save(updated);
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((detail_path: string) => {
    setWatchlist(prev => {
      const updated = prev.filter(w => w.detail_path !== detail_path);
      save(updated);
      return updated;
    });
  }, []);

  const toggleWatchlist = useCallback((item: Omit<WatchlistItem, 'added_at'>) => {
    setWatchlist(prev => {
      const exists = prev.some(w => w.detail_path === item.detail_path);
      const updated = exists
        ? prev.filter(w => w.detail_path !== item.detail_path)
        : [{ ...item, added_at: Date.now() }, ...prev].slice(0, MAX_ITEMS);
      save(updated);
      return updated;
    });
  }, []);

  const isInWatchlist = useCallback(
    (detail_path: string) => watchlist.some(w => w.detail_path === detail_path),
    [watchlist],
  );

  const clearWatchlist = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    setWatchlist([]);
  }, []);

  return { watchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, isInWatchlist, clearWatchlist };
}

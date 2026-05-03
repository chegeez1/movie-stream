import { useState, useCallback } from 'react';

export interface WatchHistoryItem {
  detail_path: string;
  title: string;
  poster_url?: string | null;
  type: 'movie' | 'series';
  timestamp: number;
  ep?: number;
  season?: number;
}

const STORAGE_KEY = 'cgm_watch_history';
const MAX_ITEMS   = 24;

function readHistory(): WatchHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>(readHistory);

  const addToHistory = useCallback((item: Omit<WatchHistoryItem, 'timestamp'>) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.detail_path !== item.detail_path);
      const updated  = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((detail_path: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.detail_path !== detail_path);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}

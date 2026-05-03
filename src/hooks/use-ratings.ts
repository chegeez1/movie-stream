import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cgm_ratings';

function readRatings(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); }
  catch { return {}; }
}

export function useRatings() {
  const [ratings, setRatings] = useState<Record<string, number>>(readRatings);

  const rate = useCallback((detailPath: string, stars: number) => {
    setRatings(prev => {
      const next = { ...prev, [detailPath]: stars };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getRating = useCallback(
    (detailPath: string) => ratings[detailPath] ?? 0,
    [ratings],
  );

  const clearRating = useCallback((detailPath: string) => {
    setRatings(prev => {
      const next = { ...prev };
      delete next[detailPath];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { ratings, rate, getRating, clearRating };
}

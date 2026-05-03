import React from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/layout';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { Clock, Film, Tv, Trash2, X, Play, TrendingUp } from 'lucide-react';
import type { WatchHistoryItem } from '@/hooks/use-watch-history';

function timeLabel(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function groupByDay(items: WatchHistoryItem[]): { label: string; items: WatchHistoryItem[] }[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo   = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, WatchHistoryItem[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  for (const item of items) {
    const d = new Date(item.timestamp); d.setHours(0, 0, 0, 0);
    if (d >= today)      groups.Today.push(item);
    else if (d >= yesterday) groups.Yesterday.push(item);
    else if (d >= weekAgo)   groups['This Week'].push(item);
    else                     groups.Earlier.push(item);
  }

  return Object.entries(groups)
    .filter(([, v]) => v.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function HistoryCard({ item, onRemove }: { item: WatchHistoryItem; onRemove: () => void }) {
  return (
    <Link href={`/movie/${item.detail_path}`}>
      <div className="group relative flex gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-all cursor-pointer">
        {/* Poster */}
        <div className="w-[52px] h-[76px] rounded-lg overflow-hidden shrink-0 bg-zinc-800">
          {item.poster_url ? (
            <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-5 h-5 text-zinc-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <p className="text-white/90 text-sm font-semibold line-clamp-1">{item.title}</p>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${item.type === 'series' ? 'bg-violet-600/30 text-violet-300' : 'bg-primary/25 text-primary'}`}>
              {item.type === 'series' ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
              {item.type === 'series' ? 'Series' : 'Movie'}
            </span>
            {item.type === 'series' && item.ep && (
              <span className="text-[10px] text-white/40">S{item.season ?? 1} · E{item.ep}</span>
            )}
          </div>
          <p className="text-white/30 text-[10px]">{timeLabel(item.timestamp)}</p>
        </div>

        {/* Play overlay */}
        <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Play className="w-3.5 h-3.5 fill-primary text-primary ml-0.5" />
          </div>
        </div>

        {/* Remove */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 text-white/40 hover:text-white hover:bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useWatchHistory();
  const groups = groupByDay(history);
  const movieCount  = history.filter(h => h.type === 'movie').length;
  const seriesCount = history.filter(h => h.type === 'series').length;

  return (
    <Layout>
      <div className="pt-20 pb-24 px-4 md:px-12 max-w-2xl mx-auto w-full">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-black text-white">Watch History</h1>
            </div>
            <p className="text-white/35 text-sm">Your recently watched titles</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/70 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Stats bar */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: TrendingUp, label: 'Total Watched', value: history.length, color: 'text-primary' },
              { icon: Film,  label: 'Movies',  value: movieCount,  color: 'text-blue-400' },
              { icon: Tv,    label: 'Series',  value: seriesCount, color: 'text-violet-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5`} />
                <p className={`text-lg font-black ${color}`}>{value}</p>
                <p className="text-white/35 text-[10px] font-medium">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-white/15 mx-auto mb-4" />
            <p className="text-white/40 font-semibold mb-1">Nothing watched yet</p>
            <p className="text-white/25 text-sm mb-6">Start watching a movie or series and it'll show up here.</p>
            <Link href="/">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary/85 transition-colors">
                <Play className="w-4 h-4 fill-white" /> Browse titles
              </span>
            </Link>
          </div>
        )}

        {/* Grouped history */}
        <div className="space-y-7">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{label}</h2>
              <div className="space-y-2">
                {items.map(item => (
                  <HistoryCard
                    key={`${item.detail_path}-${item.timestamp}`}
                    item={item}
                    onRemove={() => removeFromHistory(item.detail_path)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

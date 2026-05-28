import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Bookmark, EyeOff, RefreshCw, Loader2, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { runLiveHarvest, LEGAL_SOURCES } from '@/lib/legalHarvester';

const SOURCE_STYLE = {
  case_decision: 'bg-blue-50 text-blue-600 border-blue-200',
  legislative_amendment: 'bg-orange-50 text-orange-600 border-orange-200',
  bill_update: 'bg-purple-50 text-purple-600 border-purple-200',
  court_docket: 'bg-gray-100 text-gray-600 border-gray-200',
  tribunal_update: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  rule_amendment: 'bg-gray-100 text-gray-600 border-gray-200',
};

const SCORE_COLOR = (s) =>
  s >= 8 ? 'text-green-600' : s >= 6 ? 'text-yellow-500' : 'text-muted-foreground';

export default function IntelFeed() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [harvesting, setHarvesting] = useState(false);
  const [harvestLog, setHarvestLog] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['intel-items'],
    queryFn: () => base44.entities.IntelItem.list('-publishedAt', 100),
  });

  const { data: matters = [] } = useQuery({
    queryKey: ['matters'],
    queryFn: () => base44.entities.Matter.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.IntelItem.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['intel-items'] }),
  });

  const handleRunHarvest = async () => {
    setHarvesting(true);
    setHarvestLog([]);
    setLastResult(null);

    const result = await runLiveHarvest(matters, (progress) => {
      setHarvestLog(prev => {
        const existing = prev.findIndex(l => l.source === progress.source);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = progress;
          return updated;
        }
        return [...prev, progress];
      });
    });

    setLastResult(result);
    setHarvesting(false);
    await refetch();
  };

  const filtered =
    filter === 'all' ? items :
    filter === 'high' ? items.filter(i => (i.relevanceScore || 0) >= 7) :
    filter === 'bookmarked' ? items.filter(i => i.isBookmarked) :
    filter === 'unread' ? items.filter(i => !i.isRead) :
    items.filter(i => i.sourceType === filter);

  const unreadCount = items.filter(i => !i.isRead).length;
  const highRelevanceCount = items.filter(i => (i.relevanceScore || 0) >= 7).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 flex items-center justify-between flex-shrink-0 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black tracking-tight">Intelligence Feed</h1>
            <span className="pulse-red" />
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live — Canadian Courts</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {items.length} items from {LEGAL_SOURCES.length} live sources · {unreadCount} unread · {highRelevanceCount} high relevance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastResult && (
            <div className="text-[10px] font-bold text-muted-foreground text-right">
              Last run: +{lastResult.added} new · {lastResult.skipped} dupes skipped
              {lastResult.errors.length > 0 && <span className="text-orange-500"> · {lastResult.errors.length} errors</span>}
            </div>
          )}
          <button
            onClick={handleRunHarvest}
            disabled={harvesting}
            className="px-4 py-2 btn-terracotta rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {harvesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {harvesting ? 'Harvesting Live Sources…' : 'Run Harvester'}
          </button>
        </div>
      </div>

      {/* Harvest Progress */}
      {(harvesting || (harvestLog.length > 0 && lastResult)) && (
        <div className="px-8 py-3 border-b border-border bg-muted/30 flex-shrink-0">
          <p className="section-label mb-2">{harvesting ? 'Harvesting live Canadian legal feeds…' : 'Last harvest log'}</p>
          <div className="flex flex-wrap gap-2">
            {harvestLog.map(log => (
              <div key={log.source} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                log.status === 'done' ? 'bg-green-50 border-green-200 text-green-700' :
                log.status === 'error' ? 'bg-red-50 border-red-200 text-red-600' :
                log.status === 'empty' ? 'bg-gray-50 border-gray-200 text-gray-500' :
                'bg-blue-50 border-blue-200 text-blue-600'
              }`}>
                {log.status === 'fetching' && <Loader2 className="w-3 h-3 animate-spin" />}
                {log.status === 'done' && <CheckCircle className="w-3 h-3" />}
                {log.status === 'error' && <AlertCircle className="w-3 h-3" />}
                {log.status === 'empty' && <Clock className="w-3 h-3" />}
                {log.source}
                {log.status === 'done' && log.added != null && ` +${log.added}`}
                {log.status === 'error' && ' ✕'}
              </div>
            ))}
            {harvesting && LEGAL_SOURCES
              .filter(s => !harvestLog.find(l => l.source === s.shortName))
              .map(s => (
                <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-gray-50 border-gray-200 text-gray-400">
                  <Clock className="w-3 h-3" />
                  {s.shortName}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="px-8 py-3 flex gap-2 flex-shrink-0 border-b border-border bg-muted/20 overflow-x-auto">
        {[
          { id: 'all', label: `All (${items.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'high', label: `High Relevance (${highRelevanceCount})` },
          { id: 'case_decision', label: 'Decisions' },
          { id: 'tribunal_update', label: 'Tribunals' },
          { id: 'legislative_amendment', label: 'Legislative' },
          { id: 'bookmarked', label: 'Bookmarked' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-4 max-w-5xl">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="font-bold text-muted-foreground">No intelligence items yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Run the Harvester to pull live decisions from SCC, ONCA, FC, FCA, CHRT and more.
              </p>
              <button
                onClick={handleRunHarvest}
                disabled={harvesting}
                className="mt-6 btn-terracotta px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {harvesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {harvesting ? 'Running…' : 'Run First Harvest'}
              </button>
              <div className="mt-8 max-w-sm mx-auto text-left space-y-1">
                <p className="section-label mb-2 text-center">Live Sources Configured</p>
                {LEGAL_SOURCES.map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="font-bold">{s.shortName}</span> — {s.label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            filtered.map(item => {
              const score = item.relevanceScore || 0;
              const isHighRelevance = score >= 7;
              return (
                <div
                  key={item.id}
                  className={`tl-card p-6 flex gap-6 group transition-all duration-200 cursor-default ${
                    isHighRelevance ? 'relevance-glow border-l-4 border-l-green-500' : ''
                  } ${!item.isRead ? 'bg-card' : 'opacity-80'}`}
                  onClick={() => !item.isRead && updateMutation.mutate({ id: item.id, data: { isRead: true } })}
                >
                  <div className="w-16 flex flex-col items-center flex-shrink-0 border-r border-border pr-5">
                    <span className="section-label">Score</span>
                    <span className={`text-2xl font-black mt-1 ${SCORE_COLOR(score)}`}>
                      {score.toFixed(1)}
                    </span>
                    <div className={`mt-3 w-9 h-9 rounded-full flex items-center justify-center ${
                      item.sourceType === 'case_decision' ? 'bg-blue-50' :
                      item.sourceType === 'tribunal_update' ? 'bg-yellow-50' : 'bg-orange-50'
                    }`}>
                      <Zap className={`w-4 h-4 ${
                        item.sourceType === 'case_decision' ? 'text-blue-600' :
                        item.sourceType === 'tribunal_update' ? 'text-yellow-600' : 'text-orange-600'
                      }`} />
                    </div>
                    {!item.isRead && <span className="mt-2 w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded tracking-widest border ${SOURCE_STYLE[item.sourceType] || 'bg-gray-100 text-gray-600'}`}>
                          {item.source} — {item.sourceType?.replace(/_/g, ' ')}
                        </span>
                        {item.publishedAt && (
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="w-8 h-8 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            title="Open source"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); updateMutation.mutate({ id: item.id, data: { isBookmarked: !item.isBookmarked } }); }}
                          className={`w-8 h-8 border rounded-lg flex items-center justify-center transition-colors ${
                            item.isBookmarked
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'bg-card border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); updateMutation.mutate({ id: item.id, data: { isRead: true } }); }}
                          className="w-8 h-8 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className={`text-base font-black text-foreground mb-2 leading-tight ${item.isRead ? 'font-semibold' : ''}`}>
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                        {item.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap mt-2">
                      {item.citation && (
                        <span className="text-[10px] font-bold text-muted-foreground mono bg-muted px-2 py-0.5 rounded">
                          {item.citation}
                        </span>
                      )}
                      {item.keywordMatches?.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" />
                          Matched: {item.keywordMatches.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
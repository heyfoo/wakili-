import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Gavel, TriangleAlert, Zap, Timer, Cpu, Layers, Newspaper, CalendarCheck, Sparkles, ArrowRight, Pin, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

function StatCard({ label, value, icon: Icon, valueColor = 'text-foreground', iconColor = 'text-muted-foreground' }) {
  return (
    <div className="tl-card bg-card p-5 flex flex-col justify-between h-28">
      <span className="section-label">{label}</span>
      <div className="flex items-end justify-between">
        <span className={`text-3xl font-black ${valueColor}`}>{value}</span>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  );
}

export default function WarRoom() {
  const navigate = useNavigate();

  const { data: matters = [] } = useQuery({
    queryKey: ['matters'],
    queryFn: () => base44.entities.Matter.list('-updated_date', 20),
  });

  const { data: intelItems = [] } = useQuery({
    queryKey: ['intel-recent'],
    queryFn: () => base44.entities.IntelItem.filter({ isRead: false }, '-publishedAt', 5),
  });

  const criticalMatters = matters.filter(m => m.priority === 'critical');
  const hearingsSoon = matters.filter(m => m.nextDeadlineDate);
  const highRelevanceIntel = intelItems.filter(i => i.relevanceScore >= 7);

  const today = new Date();
  const dayName = format(today, 'EEEE');
  const dateStr = format(today, 'MMMM d, yyyy');

  return (
    <div className="page-content space-y-10 max-w-7xl">
      {/* Greeting */}
      <section>
        <h1 className="text-4xl font-light tracking-tight text-foreground mb-1">
          Good Morning, <span className="font-bold">Counsel.</span>
        </h1>
        <p className="text-muted-foreground mb-8 font-medium">
          {dayName}, {dateStr} — Your operational landscape is synchronized.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Hearings (48h)" value={hearingsSoon.length.toString().padStart(2,'0')} icon={Gavel} valueColor="text-foreground" iconColor="text-primary" />
          <StatCard label="Limitation" value={criticalMatters.length.toString().padStart(2,'0')} icon={TriangleAlert} valueColor="text-orange-600" iconColor="text-orange-600" />
          <StatCard label="Appellate Matches" value={highRelevanceIntel.length.toString().padStart(2,'0')} icon={Zap} valueColor="text-foreground" iconColor="text-blue-500" />
          <StatCard label="Active Matters" value={matters.length.toString().padStart(2,'0')} icon={Timer} valueColor="text-foreground" iconColor="text-muted-foreground" />
          <StatCard label="System Latency" value="12ms" icon={Cpu} valueColor="text-green-600" iconColor="text-green-600" />
        </div>
      </section>

      {/* Urgent Action Stack */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Layers className="text-primary w-5 h-5" />
            <h2 className="text-lg font-bold tracking-tight">Urgent Action Stack</h2>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Prioritized by client impact &amp; court hierarchy</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hearing Card */}
          {criticalMatters.length > 0 ? (
            criticalMatters.slice(0, 1).map(matter => (
              <div key={matter.id} className="tl-card p-6 border-l-4 border-l-orange-500 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded tracking-wider">Critical Priority</span>
                      <span className="text-xs font-semibold text-muted-foreground">{matter.court?.toUpperCase()}</span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight leading-tight">⚠ {matter.nextDeadlineLabel || 'UPCOMING DEADLINE'}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{matter.name}</p>
                  </div>
                  <div className="w-14 h-14 bg-muted rounded-xl border border-border flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">
                      {matter.nextDeadlineDate ? format(new Date(matter.nextDeadlineDate), 'MMM') : '--'}
                    </span>
                    <span className="text-xl font-black leading-none">
                      {matter.nextDeadlineDate ? format(new Date(matter.nextDeadlineDate), 'd') : '--'}
                    </span>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-muted-foreground">Prep: <span className="text-foreground">{matter.prepCompletionPercent || 0}%</span></span>
                    <span className="text-primary uppercase tracking-tighter">
                      {100 - (matter.prepCompletionPercent || 0)}% remaining
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${matter.prepCompletionPercent || 0}%` }} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 btn-terracotta py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Generate Outline
                  </button>
                  <button
                    onClick={() => navigate(`/matters/${matter.id}`)}
                    className="flex-1 bg-card border border-border text-foreground hover:bg-muted py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    Open Materials <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="tl-card p-6 border-l-4 border-l-orange-500 flex flex-col justify-center items-center text-center min-h-[200px]">
              <Gavel className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="font-bold text-muted-foreground">No critical matters.</p>
              <p className="text-sm text-muted-foreground mt-1">Add a matter with Critical priority to see it here.</p>
              <button onClick={() => navigate('/matters')} className="mt-4 btn-terracotta px-4 py-2 rounded-xl text-xs font-bold">
                Go to Matters
              </button>
            </div>
          )}

          {/* Intel Card */}
          {intelItems.length > 0 ? (
            <div className="tl-card p-6 border-l-4 border-l-blue-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded tracking-wider">New Authority</span>
                    <span className="text-xs font-semibold text-muted-foreground">{intelItems[0]?.source}</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight leading-tight line-clamp-2">{intelItems[0]?.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{intelItems[0]?.summary}</p>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                  <Zap className="w-3.5 h-3.5" /> View Intel Feed
                </button>
                <button
                  onClick={() => navigate('/intel')}
                  className="flex-1 bg-card border border-border text-foreground hover:bg-muted py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Pin className="w-3.5 h-3.5" /> See All
                </button>
              </div>
            </div>
          ) : (
            <div className="tl-card p-6 border-l-4 border-l-blue-400 flex flex-col justify-center items-center text-center min-h-[200px]">
              <Zap className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="font-bold text-muted-foreground">No intelligence items yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Harvester will populate this feed automatically.</p>
            </div>
          )}
        </div>
      </section>

      {/* Two-column: Daily Briefing + Chronos Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Briefing */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="text-muted-foreground w-5 h-5" />
            <h2 className="text-lg font-bold tracking-tight">Daily Briefing</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden shadow-sm">
            {intelItems.slice(0, 3).map((item, i) => (
              <button
                key={item.id}
                onClick={() => navigate('/intel')}
                className="w-full text-left p-5 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-[10px] font-black uppercase ${
                    item.sourceType === 'case_decision' ? 'text-blue-500' :
                    item.sourceType === 'legislative_amendment' ? 'text-orange-500' :
                    item.sourceType === 'bill_update' ? 'text-purple-500' : 'text-muted-foreground'
                  }`}>
                    {item.sourceType?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">{item.source}</span>
                </div>
                <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.summary}</p>
                {item.relevanceScore >= 7 && (
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded">
                      {item.relevanceScore?.toFixed(1)} Relevance Score
                    </span>
                  </div>
                )}
              </button>
            ))}
            {intelItems.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Harvester is collecting intelligence…</p>
                <p className="text-xs text-muted-foreground mt-1">Add matter keywords in Settings to improve matching.</p>
              </div>
            )}
          </div>
        </section>

        {/* Chronos Optimization */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <CalendarCheck className="text-green-600 w-5 h-5" />
            <h2 className="text-lg font-bold tracking-tight">Chronos Optimization</h2>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: 'rgba(232,245,233,0.5)', borderColor: '#C8E6C9' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-700 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-900 leading-tight">Schedule Intelligence Active</h4>
                <p className="text-xs text-green-800/70 mt-1">
                  AI Synapse is monitoring {matters.length} active matters and {intelItems.length} intelligence items for schedule conflicts and prep deficits.
                </p>
                <div className="mt-5 space-y-3">
                  {criticalMatters.slice(0, 1).map(m => (
                    <div key={m.id} className="bg-white/80 p-3 rounded-xl border border-green-200/50 flex items-center gap-3 shadow-sm">
                      <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold">
                        Prep deficit on <span className="text-green-700 font-bold">{m.name}</span> — {m.prepCompletionPercent || 0}% complete
                      </p>
                    </div>
                  ))}
                  <div className="bg-white/80 p-3 rounded-xl border border-green-200/50 flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold">Calendar synced with {matters.filter(m => m.nextDeadlineDate).length} upcoming deadlines</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => navigate('/chronos')}
                    className="flex-1 text-white py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-90"
                    style={{ background: '#2D4A3E' }}
                  >
                    Open Chronos Core
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
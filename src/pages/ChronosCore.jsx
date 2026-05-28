import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Plus, X, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays, parseISO, isSameDay } from 'date-fns';
import NewEventModal from '@/components/chronos/NewEventModal';

const EVENT_COLORS = {
  hearing:    { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200' },
  deep_work:  { bg: 'bg-indigo-50',  text: 'text-indigo-700', border: 'border-indigo-200' },
  client_call:{ bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200' },
  research:   { bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200' },
  filing:     { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200' },
  meeting:    { bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200' },
  prep:       { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200' },
  other:      { bg: 'bg-gray-50',    text: 'text-gray-600',   border: 'border-gray-200' },
};

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8am - 5pm

export default function ChronosCore() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showNewEvent, setShowNewEvent] = useState(false);
  const qc = useQueryClient();

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => base44.entities.CalendarEvent.list('-startDateTime', 100),
  });

  const { data: matters = [] } = useQuery({
    queryKey: ['matters'],
    queryFn: () => base44.entities.Matter.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.CalendarEvent.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-events'] }),
  });

  const getEventsForDay = (day) =>
    events.filter(e => {
      try { return isSameDay(parseISO(e.startDateTime), day); } catch { return false; }
    });

  const getEventHour = (e) => {
    try { return parseISO(e.startDateTime).getHours(); } catch { return 9; }
  };

  const focusAlloc = [
    { label: 'DEEP WORK', pct: Math.round((events.filter(e=>e.eventType==='deep_work').length / Math.max(events.length,1))*100), color: 'bg-indigo-500', textColor: 'text-indigo-600' },
    { label: 'CLIENT MEETINGS', pct: Math.round((events.filter(e=>e.eventType==='client_call').length / Math.max(events.length,1))*100), color: 'bg-orange-400', textColor: 'text-orange-600' },
    { label: 'COURT APPEARANCES', pct: Math.round((events.filter(e=>e.eventType==='hearing').length / Math.max(events.length,1))*100), color: 'bg-red-400', textColor: 'text-red-600' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sub-header */}
      <div className="px-8 py-4 flex items-center justify-between flex-shrink-0 border-b border-border">
        <div>
          <h1 className="text-2xl font-light text-foreground">Chronos <span className="font-bold">Core</span></h1>
          <p className="text-sm text-muted-foreground font-medium">
            Week of {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 4), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => setWeekStart(d => addDays(d, -7))} className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors">← Prev</button>
            <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors">Today</button>
            <button onClick={() => setWeekStart(d => addDays(d, 7))} className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors">Next →</button>
          </div>
          <button
            onClick={() => setShowNewEvent(true)}
            className="btn-terracotta px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Day headers */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: '72px repeat(5, 1fr)' }}>
              <div className="h-12 border-r border-border" />
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={i} className="h-12 flex flex-col items-center justify-center border-r border-border last:border-r-0">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'EEE d')}
                    </span>
                    {isToday && <span className="text-[8px] font-black text-primary uppercase">Today</span>}
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div className="relative">
              {HOURS.map(hour => (
                <div key={hour} className="grid" style={{ gridTemplateColumns: '72px repeat(5, 1fr)', minHeight: '64px' }}>
                  <div className="flex items-start justify-end pr-3 pt-2 border-r border-b border-border">
                    <span className="text-[10px] font-bold text-muted-foreground mono">{hour}:00</span>
                  </div>
                  {weekDays.map((day, di) => {
                    const dayEvents = getEventsForDay(day).filter(e => getEventHour(e) === hour);
                    return (
                      <div key={di} className="border-r border-b border-border last:border-r-0 p-1 min-h-[64px]">
                        {dayEvents.map(ev => {
                          const style = EVENT_COLORS[ev.eventType] || EVENT_COLORS.other;
                          return (
                            <div
                              key={ev.id}
                              className={`rounded-lg p-1.5 mb-1 border group cursor-pointer relative ${style.bg} ${style.border}`}
                            >
                              <p className={`text-[9px] font-black uppercase tracking-widest ${style.text}`}>{ev.eventType?.replace(/_/g,' ')}</p>
                              <p className={`text-[10px] font-bold ${style.text} line-clamp-1`}>{ev.title}</p>
                              <button
                                onClick={() => deleteMutation.mutate(ev.id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-current opacity-60" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 flex-shrink-0 p-5 overflow-y-auto border-l border-border" style={{ background: 'hsl(var(--sand-sidebar))' }}>
          <h3 className="section-label mb-4">Focus Allocation</h3>
          <div className="space-y-3 mb-8">
            {focusAlloc.map(({ label, pct, color, textColor }) => (
              <div key={label} className="bg-card p-3 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between text-[10px] font-bold mb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={textColor}>{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <h3 className="section-label mb-4">Synapse Suggestions</h3>
          <div className="space-y-3 mb-8">
            {matters.filter(m => m.priority === 'critical').slice(0, 2).map(m => (
              <div key={m.id} className="bg-green-50 border border-green-100 p-3 rounded-xl">
                <p className="text-[10px] font-black text-green-700 uppercase mb-1">Optimization</p>
                <p className="text-xs font-medium text-green-800">{m.name} — {m.prepCompletionPercent || 0}% prep complete. Block deep work time.</p>
              </div>
            ))}
            {matters.filter(m => m.priority === 'critical').length === 0 && (
              <p className="text-xs text-muted-foreground">No urgent optimizations detected.</p>
            )}
          </div>

          <h3 className="section-label mb-4">Weekly Metrics</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-bold">Scheduled Events</span>
              <span className="font-black">{events.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-bold">Active Matters</span>
              <span className="font-black">{matters.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-bold">Hearings This Week</span>
              <span className="font-black text-red-600">
                {weekDays.reduce((acc, day) => acc + getEventsForDay(day).filter(e => e.eventType === 'hearing').length, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showNewEvent && (
        <NewEventModal
          matters={matters}
          onClose={() => setShowNewEvent(false)}
          onCreated={() => { qc.invalidateQueries({ queryKey: ['calendar-events'] }); setShowNewEvent(false); }}
        />
      )}
    </div>
  );
}
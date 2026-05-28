import React, { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

const EVENT_TYPES = ['hearing','deep_work','client_call','research','filing','meeting','prep','other'];

export default function NewEventModal({ matters = [], onClose, onCreated }) {
  const today = format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const [form, setForm] = useState({
    title: '', eventType: 'hearing', matterId: '',
    startDateTime: today, endDateTime: today,
    location: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    const matterName = matters.find(m => m.id === form.matterId)?.name || '';
    await base44.entities.CalendarEvent.create({ ...form, matterName });
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <h2 className="text-lg font-black">New Calendar Event</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-7 space-y-4">
          <div>
            <label className="section-label block mb-1.5">Title *</label>
            <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Event title" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Event Type</label>
              <select className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="section-label block mb-1.5">Linked Matter</label>
              <select className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.matterId} onChange={e => set('matterId', e.target.value)}>
                <option value="">None</option>
                {matters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Start</label>
              <input type="datetime-local" className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.startDateTime} onChange={e => set('startDateTime', e.target.value)} />
            </div>
            <div>
              <label className="section-label block mb-1.5">End</label>
              <input type="datetime-local" className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.endDateTime} onChange={e => set('endDateTime', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Location</label>
            <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Courtroom 4B, ONSC Toronto" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 px-7 py-5 border-t border-border">
          <button onClick={handleSave} disabled={!form.title || saving} className="btn-terracotta px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 shadow-lg">
            {saving ? 'Adding…' : 'Add Event'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold border border-border hover:bg-muted transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}
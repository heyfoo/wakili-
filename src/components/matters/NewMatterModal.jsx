import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const COURTS = [
  { value: 'onsc', label: 'Ontario Superior Court' },
  { value: 'onca', label: 'Ontario Court of Appeal' },
  { value: 'scc', label: 'Supreme Court of Canada' },
  { value: 'fct', label: 'Federal Court' },
  { value: 'fca', label: 'Federal Court of Appeal' },
  { value: 'bcsc', label: 'BC Supreme Court' },
  { value: 'bcca', label: 'BC Court of Appeal' },
  { value: 'qccs', label: 'Quebec Superior Court' },
  { value: 'lat', label: 'Licence Appeal Tribunal' },
  { value: 'hrto', label: 'Human Rights Tribunal (ON)' },
  { value: 'other', label: 'Other' },
];

export default function NewMatterModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', client: '', caseNumber: '', court: 'onsc',
    practiceArea: 'litigation', status: 'active_motion', priority: 'standard',
    nextDeadlineDate: '', nextDeadlineLabel: '', judgeAssigned: '',
    keywords: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.client) return;
    setSaving(true);
    await base44.entities.Matter.create({
      ...form,
      keywords: form.keywords ? form.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <div>
            <h2 className="text-xl font-black tracking-tight">New Matter</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Open a new file in your command center</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="section-label block mb-2">Matter Name *</label>
              <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Smith v. Jones Tech Corp." value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="section-label block mb-2">Client *</label>
              <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Client name" value={form.client} onChange={e => set('client', e.target.value)} />
            </div>
            <div>
              <label className="section-label block mb-2">Case Number</label>
              <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="2025-CV-88412" value={form.caseNumber} onChange={e => set('caseNumber', e.target.value)} />
            </div>
            <div>
              <label className="section-label block mb-2">Court / Jurisdiction</label>
              <select className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.court} onChange={e => set('court', e.target.value)}>
                {COURTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="section-label block mb-2">Practice Area</label>
              <select className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.practiceArea} onChange={e => set('practiceArea', e.target.value)}>
                {['litigation','corporate','real_estate','family','criminal','administrative','ip','privacy','other'].map(v => (
                  <option key={v} value={v}>{v.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="section-label block mb-2">Status</label>
              <select className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.status} onChange={e => set('status', e.target.value)}>
                {['active_motion','appellate_filing','discovery','pre_trial','trial','mediation','closed'].map(v => (
                  <option key={v} value={v}>{v.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="section-label block mb-2">Priority</label>
              <select className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {['critical','high','standard','low'].map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="section-label block mb-2">Next Deadline</label>
              <input type="date" className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.nextDeadlineDate} onChange={e => set('nextDeadlineDate', e.target.value)} />
            </div>
            <div>
              <label className="section-label block mb-2">Deadline Label</label>
              <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="e.g. Motion Hearing" value={form.nextDeadlineLabel} onChange={e => set('nextDeadlineLabel', e.target.value)} />
            </div>
            <div>
              <label className="section-label block mb-2">Judge Assigned</label>
              <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Justice H. Montgomery" value={form.judgeAssigned} onChange={e => set('judgeAssigned', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="section-label block mb-2">AI Keywords <span className="normal-case font-normal text-muted-foreground">(comma-separated, used by Harvester)</span></label>
              <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="vicarious liability, PIPEDA, interlocutory injunction…" value={form.keywords} onChange={e => set('keywords', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="section-label block mb-2">Notes</label>
              <textarea className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none" rows={3} placeholder="Case context, strategy notes…" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-8 py-5 border-t border-border">
          <button
            onClick={handleSave}
            disabled={!form.name || !form.client || saving}
            className="btn-terracotta px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg"
          >
            <Plus className="w-4 h-4" /> {saving ? 'Creating…' : 'Create Matter'}
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold border border-border bg-card hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
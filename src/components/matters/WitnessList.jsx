import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Plus, X, Loader2 } from 'lucide-react';

const READINESS_STYLE = {
  ready: 'bg-green-50 text-green-600',
  pending: 'bg-yellow-50 text-yellow-600',
  cross_exam: 'bg-orange-50 text-orange-600',
  confirmed: 'bg-blue-50 text-blue-600',
  unavailable: 'bg-red-50 text-red-600',
};

export default function WitnessList({ matterId }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', readiness: 'pending' });

  const { data: witnesses = [], isLoading } = useQuery({
    queryKey: ['witnesses', matterId],
    queryFn: () => base44.entities.Witness.filter({ matterId }),
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.Witness.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['witnesses', matterId] }); setAdding(false); setForm({ name: '', role: '', readiness: 'pending' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.Witness.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['witnesses', matterId] }),
  });

  const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="tl-card bg-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Witness List
        </h3>
        <button onClick={() => setAdding(true)} className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-wider transition-colors flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {witnesses.map(w => (
            <div key={w.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {initials(w.name)}
                </div>
                <div>
                  <p className="text-xs font-bold">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground">{w.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${READINESS_STYLE[w.readiness] || 'bg-gray-100 text-gray-500'}`}>
                  {w.readiness?.replace(/_/g, ' ')}
                </span>
                <button onClick={() => deleteMutation.mutate(w.id)} className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center hover:text-destructive text-muted-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {witnesses.length === 0 && !adding && (
            <p className="text-sm text-muted-foreground text-center py-4">No witnesses added.</p>
          )}

          {adding && (
            <div className="p-3 bg-card border-2 border-primary/30 rounded-xl space-y-2">
              <input className="w-full bg-muted rounded-lg px-3 py-2 text-xs font-bold focus:outline-none" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              <input className="w-full bg-muted rounded-lg px-3 py-2 text-xs focus:outline-none" placeholder="Role (e.g. Expert Witness)" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
              <select className="w-full bg-muted rounded-lg px-3 py-2 text-xs focus:outline-none" value={form.readiness} onChange={e => setForm(f => ({ ...f, readiness: e.target.value }))}>
                {['ready','pending','cross_exam','confirmed','unavailable'].map(v => (
                  <option key={v} value={v}>{v.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={() => createMutation.mutate({ matterId, ...form })} disabled={!form.name.trim()} className="btn-terracotta px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40">Add</button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-border hover:bg-muted">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
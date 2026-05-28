import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckSquare, Plus, X, Loader2 } from 'lucide-react';

export default function FilingChecklist({ matterId }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['checklist', matterId],
    queryFn: () => base44.entities.FilingChecklistItem.filter({ matterId }, 'order', 20),
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.FilingChecklistItem.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklist', matterId] }); setAdding(false); setNewLabel(''); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FilingChecklistItem.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', matterId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.FilingChecklistItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', matterId] }),
  });

  const completed = items.filter(i => i.isCompleted).length;
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  return (
    <div className="tl-card bg-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-green-500" />
          Filing Checklist
        </h3>
        <button onClick={() => setAdding(true)} className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-wider transition-colors flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 group">
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={e => updateMutation.mutate({ id: item.id, data: { isCompleted: e.target.checked } })}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: 'hsl(var(--primary))' }}
                />
                <span className={`text-xs flex-1 ${item.isCompleted ? 'line-through text-muted-foreground' : 'font-medium'}`}>{item.label}</span>
                <button onClick={() => deleteMutation.mutate(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center hover:text-destructive text-muted-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {items.length === 0 && !adding && (
              <p className="text-sm text-muted-foreground text-center py-4">No checklist items yet.</p>
            )}

            {adding && (
              <div className="flex gap-2 items-center">
                <input
                  autoFocus
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs focus:outline-none"
                  placeholder="Filing item…"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && newLabel.trim() && createMutation.mutate({ matterId, label: newLabel, order: items.length + 1 })}
                />
                <button onClick={() => createMutation.mutate({ matterId, label: newLabel, order: items.length + 1 })} disabled={!newLabel.trim()} className="btn-terracotta px-3 py-2 rounded-lg text-[10px] font-bold disabled:opacity-40">Add</button>
                <button onClick={() => setAdding(false)} className="px-2 py-2 rounded-lg border border-border hover:bg-muted"><X className="w-3 h-3" /></button>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-muted-foreground">Completion</span>
                <span className={pct >= 100 ? 'text-green-600' : 'text-foreground'}>{completed} / {items.length}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
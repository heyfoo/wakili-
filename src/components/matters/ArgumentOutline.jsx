import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ListOrdered, Plus, X, Loader2 } from 'lucide-react';

export default function ArgumentOutline({ matterId }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const { data: points = [], isLoading } = useQuery({
    queryKey: ['argument-points', matterId],
    queryFn: () => base44.entities.ArgumentPoint.filter({ matterId }, 'order', 20),
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.ArgumentPoint.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['argument-points', matterId] });
      setAdding(false);
      setNewTitle('');
      setNewNotes('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.ArgumentPoint.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['argument-points', matterId] }),
  });

  return (
    <div className="tl-card bg-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-primary" />
          Argument Outline
        </h3>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-wider transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Point
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {points.map((point, i) => (
            <div key={point.id} className="p-4 bg-muted/30 rounded-xl border-l-4 border-l-primary/40 relative group">
              <span className="absolute -left-3 top-4 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-[10px] font-black">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-bold mb-1">{point.title}</h4>
                <button
                  onClick={() => deleteMutation.mutate(point.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {point.notes && <p className="text-xs text-muted-foreground">{point.notes}</p>}
              {point.tags?.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {point.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {points.length === 0 && !adding && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No argument points yet.</p>
              <p className="text-xs mt-1">Add the pillars of your argument here.</p>
            </div>
          )}

          {adding && (
            <div className="p-4 bg-card border-2 border-primary/30 rounded-xl space-y-3">
              <input
                autoFocus
                className="w-full bg-muted rounded-lg px-3 py-2 text-sm font-bold focus:outline-none"
                placeholder="Argument point title…"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && newTitle.trim() && createMutation.mutate({ matterId, title: newTitle, notes: newNotes, order: points.length + 1 })}
              />
              <textarea
                className="w-full bg-muted rounded-lg px-3 py-2 text-xs focus:outline-none resize-none"
                placeholder="Supporting notes, references…"
                rows={2}
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => createMutation.mutate({ matterId, title: newTitle, notes: newNotes, order: points.length + 1 })}
                  disabled={!newTitle.trim()}
                  className="btn-terracotta px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                >
                  Add
                </button>
                <button onClick={() => { setAdding(false); setNewTitle(''); setNewNotes(''); }} className="px-4 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-muted">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
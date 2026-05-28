import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { queryGroq } from '@/api/groq';
import { FileText, Plus, Loader2, Wand2, X } from 'lucide-react';
import DocumentEditor from '@/components/docauto/DocumentEditor';

const STATUS_STYLE = {
  draft: 'bg-orange-50 text-orange-600',
  in_progress: 'bg-blue-50 text-blue-600',
  review_pending: 'bg-yellow-50 text-yellow-700',
  filed: 'bg-green-50 text-green-700',
  finalized: 'bg-gray-100 text-gray-600',
};

const DOC_TYPES = [
  'affidavit','notice_of_motion','factum','book_of_authorities',
  'statement_of_claim','statement_of_defence','costs_outline','correspondence','other'
];

export default function DocAutomator() {
  const qc = useQueryClient();
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', matterId: '', documentType: 'affidavit' });
  const [creating, setCreating] = useState(false);

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-updated_date', 50),
  });

  const { data: matters = [] } = useQuery({
    queryKey: ['matters'],
    queryFn: () => base44.entities.Matter.list(),
  });

  const createMutation = useMutation({
    mutationFn: data => base44.entities.Document.create(data),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      setShowNew(false);
      setNewForm({ title: '', matterId: '', documentType: 'affidavit' });
    },
  });

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0] || null;

  // Group docs by matter
  const grouped = matters.reduce((acc, m) => {
    const docs = documents.filter(d => d.matterId === m.id);
    if (docs.length > 0) acc[m.name] = docs;
    return acc;
  }, {});
  const unlinked = documents.filter(d => !d.matterId);
  if (unlinked.length > 0) grouped['Unlinked Documents'] = unlinked;

  const handleCreate = async (aiDraft = false) => {
    if (!newForm.title) return;
    setCreating(true);
    let content = '';
    if (aiDraft) {
      const matter = matters.find(m => m.id === newForm.matterId);
      content = await queryGroq(
        `Document type: ${newForm.documentType.replace(/_/g,' ')}.
Matter: ${matter?.name || 'General Matter'}.
Client: ${matter?.client || 'Client'}.
Court: ${matter?.court?.toUpperCase() || 'ONSC'}.`,
        "You are a Canadian legal document assistant. Draft a complete, properly formatted Canadian legal document with standard boilerplate, numbered paragraphs, style of cause block, and appropriate legal language. Include relevant section headers."
      );
    }
    const matterName = matters.find(m => m.id === newForm.matterId)?.name || '';
    const doc = await base44.entities.Document.create({ ...newForm, matterName, content, synapseVerified: aiDraft });
    qc.invalidateQueries({ queryKey: ['documents'] });
    setSelectedDocId(doc.id);
    setShowNew(false);
    setCreating(false);
    setNewForm({ title: '', matterId: '', documentType: 'affidavit' });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sub-header */}
      <div className="px-8 py-4 flex items-center justify-between flex-shrink-0 border-b border-border">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Document Automator</h1>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">AI-powered litigation document drafting & management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNew(true)}
            className="btn-terracotta px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Document
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Doc list */}
        <div className="w-64 flex-shrink-0 overflow-y-auto p-4 space-y-4 border-r border-border" style={{ background: 'hsl(var(--sand-sidebar))' }}>
          {docsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No documents yet.</p>
              <button onClick={() => setShowNew(true)} className="mt-3 btn-terracotta px-3 py-1.5 rounded-xl text-[10px] font-bold">
                Create First
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([matterName, docs]) => (
              <div key={matterName}>
                <p className="section-label px-3 pb-2">{matterName}</p>
                <div className="space-y-1">
                  {docs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground transition-all ${
                        (selectedDocId || documents[0]?.id) === doc.id
                          ? 'bg-card border border-primary/30 text-primary font-bold shadow-sm'
                          : 'hover:bg-card/60'
                      }`}
                    >
                      <p className="font-semibold line-clamp-1">{doc.title}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${STATUS_STYLE[doc.status] || ''}`}>
                          {doc.status?.replace(/_/g,' ')}
                        </span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Editor */}
        {selectedDoc ? (
          <DocumentEditor doc={selectedDoc} matters={matters} onUpdate={() => qc.invalidateQueries({ queryKey: ['documents'] })} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg text-foreground mb-2">No Document Selected</h3>
            <p className="text-muted-foreground text-sm mb-6">Select a document from the sidebar, or create a new one.</p>
            <button onClick={() => setShowNew(true)} className="btn-terracotta px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create New Document
            </button>
          </div>
        )}
      </div>

      {/* New Doc Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-7 py-5 border-b border-border">
              <h2 className="text-lg font-black">New Document</h2>
              <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-7 space-y-4">
              <div>
                <label className="section-label block mb-1.5">Document Title *</label>
                <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none" placeholder="e.g. Affidavit of Documents" value={newForm.title} onChange={e => setNewForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-1.5">Document Type</label>
                  <select className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={newForm.documentType} onChange={e => setNewForm(f=>({...f,documentType:e.target.value}))}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="section-label block mb-1.5">Linked Matter</label>
                  <select className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={newForm.matterId} onChange={e => setNewForm(f=>({...f,matterId:e.target.value}))}>
                    <option value="">None</option>
                    {matters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-7 py-5 border-t border-border">
              <button onClick={() => handleCreate(true)} disabled={!newForm.title || creating} className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                AI Draft
              </button>
              <button onClick={() => handleCreate(false)} disabled={!newForm.title || creating} className="flex-1 btn-terracotta px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                <FileText className="w-4 h-4" /> Blank Draft
              </button>
              <button onClick={() => setShowNew(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold border border-border hover:bg-muted transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
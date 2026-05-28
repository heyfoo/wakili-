import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { queryGroq } from '@/api/groq';
import { CheckCircle, Sparkles, Loader2, Save, Wand2 } from 'lucide-react';

const STATUS_STYLE = {
  draft: 'bg-orange-50 text-orange-600',
  in_progress: 'bg-blue-50 text-blue-600',
  review_pending: 'bg-yellow-50 text-yellow-700',
  filed: 'bg-green-50 text-green-700',
  finalized: 'bg-gray-100 text-gray-600',
};

export default function DocumentEditor({ doc, matters, onUpdate }) {
  const qc = useQueryClient();
  const [content, setContent] = useState(doc.content || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(doc.content || '');
    setAiSuggestion(null);
  }, [doc.id]);

  const updateMutation = useMutation({
    mutationFn: data => base44.entities.Document.update(doc.id, data),
    onSuccess: () => { onUpdate(); setSaving(false); },
  });

  const handleSave = () => {
    setSaving(true);
    updateMutation.mutate({ content, status: doc.status === 'draft' ? 'in_progress' : doc.status });
  };

  const handleFinalize = () => {
    updateMutation.mutate({ status: 'finalized', synapseVerified: true });
    onUpdate();
  };

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    const matter = matters.find(m => m.id === doc.matterId);
    const suggestion = await queryGroq(
      `Document Title: "${doc.title}"
Type: ${doc.documentType?.replace(/_/g,' ')}
Matter: ${matter?.name || 'General'}

Current document content:
${content.slice(0, 2000)}

Lawyer's request: ${aiPrompt}`,
      "You are a Canadian legal document assistant. Provide a specific, legally precise response or draft the requested paragraph/section. Use proper Canadian legal language, cite relevant Rules of Civil Procedure where applicable."
    );
    setAiSuggestion(suggestion);
    setAiLoading(false);
  };

  const matter = matters.find(m => m.id === doc.matterId);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-border bg-muted/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded ${STATUS_STYLE[doc.status] || ''}`}>
            {doc.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
          {doc.synapseVerified && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              <CheckCircle className="w-3 h-3" /> Synapse Verified
            </span>
          )}
          {matter && <span className="text-[10px] font-bold text-muted-foreground">{matter.name}</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-card border border-border rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-muted transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
          <button
            onClick={handleFinalize}
            className="btn-terracotta px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Finalize
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Document */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className="max-w-3xl w-full">
            <div className="bg-white border border-border rounded-sm shadow-md min-h-[900px] p-16 relative">
              <div className="mb-12 text-center">
                <h2 className="text-xl font-bold uppercase tracking-widest border-b-2 border-foreground inline-block pb-1"
                    style={{ fontFamily: 'serif' }}>
                  {doc.title}
                </h2>
                <p className="text-sm font-medium mt-4 italic" style={{ fontFamily: 'serif' }}>
                  {doc.documentType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  {matter && ` — ${matter.name}`}
                </p>
              </div>

              <textarea
                className="w-full min-h-[600px] text-sm leading-relaxed text-foreground bg-transparent focus:outline-none resize-none"
                style={{ fontFamily: 'Georgia, serif' }}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Begin drafting your document here. Use AI Assist to generate sections, suggest paragraphs, or check legal language…"
              />

              {aiSuggestion && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <p className="text-xs font-black text-blue-700 uppercase tracking-wider">Synapse Suggestion</p>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">{aiSuggestion}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { setContent(c => c + '\n\n' + aiSuggestion); setAiSuggestion(null); }}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      Insert into Document
                    </button>
                    <button onClick={() => setAiSuggestion(null)} className="px-4 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-bold">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Assist Panel */}
        <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto p-5" style={{ background: 'hsl(var(--sand-sidebar))' }}>
          <h3 className="section-label mb-4">AI Assist</h3>
          <div className="space-y-3">
            {[
              'Draft the BETWEEN: style of cause block',
              'Generate numbered paragraphs for Schedule A',
              'Write the jurat / swearing clause',
              'Check for Rule 30.03 compliance',
              'Suggest citation for this argument',
            ].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => { setAiPrompt(suggestion); }}
                className="w-full text-left p-2.5 rounded-xl bg-card border border-border text-xs hover:border-primary/30 hover:bg-orange-50/20 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="section-label block mb-2">Custom Prompt</label>
            <textarea
              className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none resize-none"
              rows={3}
              placeholder="Ask Synapse to draft a specific section…"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            <button
              onClick={handleAiAssist}
              disabled={!aiPrompt.trim() || aiLoading}
              className="mt-2 w-full btn-terracotta py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              {aiLoading ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
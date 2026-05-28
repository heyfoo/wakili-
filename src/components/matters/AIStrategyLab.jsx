import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Send, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QUICK_ACTIONS = [
  { label: 'Draft Cross-Examination Questions', sub: 'For the adverse party witness' },
  { label: 'Analyze Opposing Factum', sub: 'Find weaknesses in their position' },
  { label: 'Research Analogous Cases', sub: 'Via CanLII + SCC database' },
  { label: 'Summarize Key Arguments', sub: 'Condensed brief for oral argument' },
];

export default function AIStrategyLab({ matter }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);

  const sendQuery = async (query) => {
    if (loading) return;
    const q = query || input.trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Tempora Lex AI Synapse — an expert Canadian legal assistant. You are advising on the following matter:

Matter: ${matter.name}
Client: ${matter.client}
Court: ${matter.court?.toUpperCase()}
Status: ${matter.status}
Priority: ${matter.priority}
Keywords: ${matter.keywords?.join(', ') || 'N/A'}
Notes: ${matter.notes || 'None'}

The lawyer asks: ${q}

Provide a concise, legally rigorous response. Reference Canadian law, relevant statutes, and court rules where applicable. Be direct.`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="tl-card bg-card p-6 flex flex-col h-full min-h-[500px]">
      <h3 className="font-bold flex items-center gap-2 mb-5">
        <Sparkles className="w-4 h-4 text-blue-500" />
        AI Strategy Lab
      </h3>

      {/* Strategic Insight Block */}
      <div className="bg-blue-50/60 rounded-xl p-4 mb-4 border border-blue-100">
        <p className="text-xs font-bold text-blue-800 mb-1">Matter Context</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          {matter.notes || `Synapse is monitoring ${matter.name} across Canadian legal databases. Add matter keywords in Settings to improve relevance scoring.`}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 mb-4">
        {QUICK_ACTIONS.map(({ label, sub }) => (
          <button
            key={label}
            onClick={() => sendQuery(label)}
            className="w-full bg-muted border border-border text-left p-3 rounded-xl hover:border-primary/30 hover:bg-orange-50/20 transition-all group"
          >
            <p className="text-xs font-bold group-hover:text-primary transition-colors">{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
          </button>
        ))}
        <button
          onClick={() => navigate('/docauto')}
          className="w-full btn-terracotta p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-2"
        >
          <FileText className="w-3.5 h-3.5" /> Open in Document Automator
        </button>
      </div>

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-48">
          {messages.map((m, i) => (
            <div key={i} className={`text-xs rounded-xl px-3 py-2 leading-relaxed ${m.role === 'user' ? 'bg-charcoal text-white ml-4' : 'bg-muted text-foreground'}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Synapse thinking…</span>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-3 bg-muted rounded-xl mt-auto">
        <input
          type="text"
          placeholder="Ask Synapse about this matter…"
          className="flex-1 text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendQuery()}
        />
        <button
          onClick={() => sendQuery()}
          disabled={!input.trim() || loading}
          className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
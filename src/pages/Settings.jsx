import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Timer, Sparkles, Building2, Database, Tag, Plus, X, Loader2, Save, CheckCircle } from 'lucide-react';

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`toggle-switch ${value ? 'on' : ''}`}
    >
      <div className="toggle-knob" />
    </button>
  );
}

const SOURCES = [
  { id: 'canlii', label: 'CanLII RSS', desc: 'New decisions by jurisdiction & keyword' },
  { id: 'federal_court', label: 'Federal Court Daily Docket', desc: 'Hearing schedules RSS feed' },
  { id: 'onsc_docket', label: 'Ontario SCJ Daily List', desc: 'Court lists PDF scraper' },
  { id: 'ontario_elaws', label: 'Ontario e-Laws', desc: 'Legislative amendments feed' },
  { id: 'legisinfo', label: 'LEGISinfo (Parliament)', desc: 'Federal bill status' },
  { id: 'cipo', label: 'CIPO Trademark Journal', desc: 'IP opposition deadlines' },
];

const DEFAULT_SETTINGS = {
  workloadCeilingHours: 10,
  deepWorkBufferMinutes: 90,
  synapseIntrusion: 'balanced',
  proactiveResearch: true,
  autoFlagRelevance: true,
  relevanceThreshold: 7,
  hourlyRate: 500,
  primaryJurisdiction: 'onsc',
  activeKeywords: [],
  enabledSources: ['canlii', 'federal_court', 'ontario_elaws'],
  counselName: 'Counsel',
  firmName: '',
};

export default function Settings() {
  const qc = useQueryClient();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [newKeyword, setNewKeyword] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: settingsArr } = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => base44.entities.UserSettings.list(),
  });

  const existingSettings = Array.isArray(settingsArr) ? settingsArr[0] : null;

  useEffect(() => {
    if (existingSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...existingSettings });
    }
  }, [existingSettings]);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingSettings?.id) {
        return base44.entities.UserSettings.update(existingSettings.id, data);
      } else {
        return base44.entities.UserSettings.create(data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    set('activeKeywords', [...(settings.activeKeywords || []), newKeyword.trim()]);
    setNewKeyword('');
  };

  const removeKeyword = (kw) => set('activeKeywords', settings.activeKeywords.filter(k => k !== kw));

  const toggleSource = (id) => {
    const enabled = settings.enabledSources || [];
    set('enabledSources', enabled.includes(id) ? enabled.filter(s => s !== id) : [...enabled, id]);
  };

  const Section = ({ icon: Icon, iconClass, label, children }) => (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${iconClass}`} />
        <h2 className="section-label">{label}</h2>
      </div>
      <div className="tl-card bg-card p-6">{children}</div>
    </section>
  );

  return (
    <div className="page-content">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-1">Preferences</h1>
          <p className="text-muted-foreground font-medium">Configure your litigation cockpit and operational parameters.</p>
        </header>

        <div className="space-y-10">
          {/* Profile */}
          <Section icon={Building2} iconClass="text-primary" label="Firm & Profile">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="section-label block mb-2">Your Name</label>
                <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={settings.counselName || ''} onChange={e => set('counselName', e.target.value)} placeholder="Counsel Sterling" />
              </div>
              <div>
                <label className="section-label block mb-2">Firm Name</label>
                <input className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={settings.firmName || ''} onChange={e => set('firmName', e.target.value)} placeholder="Sterling LLP" />
              </div>
            </div>
          </Section>

          {/* Workload */}
          <Section icon={Timer} iconClass="text-primary" label="Workload & Capacity">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="section-label block mb-3">Daily Workload Ceiling</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min={6} max={16} step={0.5}
                    value={settings.workloadCeilingHours}
                    onChange={e => set('workloadCeilingHours', parseFloat(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: 'hsl(var(--primary))' }}
                  />
                  <span className="text-sm font-black mono bg-muted px-3 py-1 rounded">{settings.workloadCeilingHours}h</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Chronos triggers alert when scheduled time exceeds this limit.</p>
              </div>
              <div>
                <label className="section-label block mb-3">Deep Work Buffer</label>
                <select
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  value={settings.deepWorkBufferMinutes}
                  onChange={e => set('deepWorkBufferMinutes', parseInt(e.target.value))}
                >
                  <option value={60}>60 Minutes / Session</option>
                  <option value={90}>90 Minutes / Session</option>
                  <option value={120}>120 Minutes / Session</option>
                </select>
              </div>
            </div>
          </Section>

          {/* AI Synapse */}
          <Section icon={Sparkles} iconClass="text-blue-500" label="AI Synapse Sensitivity">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Proactive Legal Research</h4>
                  <p className="text-xs text-muted-foreground">Automatically draft case summaries for new docket filings.</p>
                </div>
                <Toggle value={settings.proactiveResearch} onChange={v => set('proactiveResearch', v)} />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-5">
                <div>
                  <h4 className="text-sm font-bold">Intrusion Level</h4>
                  <p className="text-xs text-muted-foreground">How often Synapse suggests schedule re-alignments.</p>
                </div>
                <div className="flex gap-1">
                  {['low','balanced','max'].map(level => (
                    <button
                      key={level}
                      onClick={() => set('synapseIntrusion', level)}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                        settings.synapseIntrusion === level
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-5">
                <div>
                  <h4 className="text-sm font-bold">Auto-flag High Relevance</h4>
                  <p className="text-xs text-muted-foreground">Auto-tag intel items above relevance threshold.</p>
                </div>
                <Toggle value={settings.autoFlagRelevance} onChange={v => set('autoFlagRelevance', v)} />
              </div>
              <div className="border-t border-border pt-5">
                <label className="section-label block mb-3">Relevance Threshold</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min={5} max={9.5} step={0.5}
                    value={settings.relevanceThreshold}
                    onChange={e => set('relevanceThreshold', parseFloat(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: 'hsl(var(--primary))' }}
                  />
                  <span className="text-sm font-black mono bg-muted px-3 py-1 rounded">{settings.relevanceThreshold}/10</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Economics */}
          <Section icon={Building2} iconClass="text-green-600" label="Economics & Jurisdiction">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="section-label block mb-2">Standard Hourly Rate</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">$</span>
                  <input
                    type="number"
                    className="w-full bg-muted border border-border rounded-xl py-2.5 pl-8 pr-16 text-sm font-black mono focus:outline-none"
                    value={settings.hourlyRate}
                    onChange={e => set('hourlyRate', parseFloat(e.target.value))}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">CAD/HR</span>
                </div>
              </div>
              <div>
                <label className="section-label block mb-2">Primary Jurisdiction</label>
                <select
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none"
                  value={settings.primaryJurisdiction}
                  onChange={e => set('primaryJurisdiction', e.target.value)}
                >
                  <option value="onsc">Ontario — ONSC / ONCA</option>
                  <option value="fct">Federal — FCA / SCC</option>
                  <option value="bcsc">British Columbia — BCSC</option>
                  <option value="qccs">Quebec — Superior Court</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Data Sources */}
          <Section icon={Database} iconClass="text-purple-500" label="Data Sources">
            <div className="space-y-4">
              {SOURCES.map(src => (
                <div key={src.id} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">{src.label}</h4>
                    <p className="text-xs text-muted-foreground">{src.desc}</p>
                  </div>
                  <Toggle
                    value={settings.enabledSources?.includes(src.id) || false}
                    onChange={() => toggleSource(src.id)}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Keywords */}
          <Section icon={Tag} iconClass="text-orange-500" label="Matter Keywords">
            <div>
              <p className="text-xs text-muted-foreground mb-4">These keywords are used by the Harvester to score relevance of incoming intelligence. Add terms specific to your active matters.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(settings.activeKeywords || []).map(kw => (
                  <span key={kw} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {kw}
                    <button onClick={() => removeKeyword(kw)} className="hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(settings.activeKeywords || []).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No keywords added. Add terms like "interlocutory injunction", "PIPEDA", "vicarious liability"…</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  placeholder="Add keyword (e.g. interlocutory injunction)…"
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addKeyword()}
                />
                <button onClick={addKeyword} className="btn-terracotta px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </Section>

          {/* Save */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={() => saveMutation.mutate(settings)}
              disabled={saveMutation.isPending}
              className="btn-terracotta px-8 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 disabled:opacity-60"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saveMutation.isPending ? 'Saving…' : saved ? 'Saved!' : 'Save All Changes'}
            </button>
            <button onClick={() => setSettings(DEFAULT_SETTINGS)} className="px-8 py-3 rounded-xl text-sm font-bold border border-border bg-card hover:bg-muted transition-colors">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
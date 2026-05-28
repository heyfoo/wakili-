import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import ArgumentOutline from '@/components/matters/ArgumentOutline';
import WitnessList from '@/components/matters/WitnessList';
import FilingChecklist from '@/components/matters/FilingChecklist';
import AIStrategyLab from '@/components/matters/AIStrategyLab';

export default function MatterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: matterArr, isLoading } = useQuery({
    queryKey: ['matter', id],
    queryFn: () => base44.entities.Matter.filter({ id }),
  });

  const matter = Array.isArray(matterArr) ? matterArr[0] : matterArr;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!matter) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="font-bold text-muted-foreground">Matter not found.</p>
        <button onClick={() => navigate('/matters')} className="mt-4 btn-terracotta px-5 py-2 rounded-xl text-sm font-bold">
          Back to Matters
        </button>
      </div>
    );
  }

  const PRIORITY_COLOR = {
    critical: 'bg-orange-500 text-white',
    high: 'bg-orange-100 text-orange-600',
    standard: 'bg-gray-100 text-gray-600',
    low: 'bg-gray-50 text-gray-400',
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-8 pt-5 pb-4 flex items-end justify-between flex-shrink-0 border-b border-border">
        <div>
          <button
            onClick={() => navigate('/matters')}
            className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Matters
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${PRIORITY_COLOR[matter.priority] || 'bg-gray-100 text-gray-600'}`}>
              {matter.priority} Priority
            </span>
            <span className="text-xs font-bold text-muted-foreground">{matter.court?.toUpperCase()} — {matter.caseNumber}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">War Room: {matter.name}</h1>
        </div>
        <button
          onClick={() => navigate('/docauto')}
          className="bg-card border border-border px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-muted transition-colors"
        >
          <FileText className="w-3.5 h-3.5" /> Open Doc Automator
        </button>
      </div>

      <div className="page-content">
        {/* Case Context bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Client', value: matter.client },
            { label: 'Judge', value: matter.judgeAssigned || '—' },
            { label: 'Next Deadline', value: matter.nextDeadlineDate ? format(new Date(matter.nextDeadlineDate), 'MMM d, yyyy') : '—', urgent: matter.priority === 'critical' },
            { label: 'Prep Completion', value: `${matter.prepCompletionPercent || 0}%`, progress: matter.prepCompletionPercent || 0 },
          ].map(({ label, value, urgent, progress }) => (
            <div key={label} className="tl-card bg-card p-4">
              <p className="section-label mb-1">{label}</p>
              {progress !== undefined ? (
                <>
                  <p className={`text-sm font-bold ${progress < 50 ? 'text-orange-600' : 'text-green-600'}`}>{value}</p>
                  <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progress < 50 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }} />
                  </div>
                </>
              ) : (
                <p className={`text-sm font-bold ${urgent ? 'text-orange-600' : 'text-foreground'}`}>{value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr 360px' }}>
          <div className="col-span-2">
            <ArgumentOutline matterId={id} />
          </div>
          <div className="row-span-2">
            <AIStrategyLab matter={matter} />
          </div>
          <div>
            <WitnessList matterId={id} />
          </div>
          <div>
            <FilingChecklist matterId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
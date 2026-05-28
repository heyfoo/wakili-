import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Download, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import NewMatterModal from '@/components/matters/NewMatterModal';

const PRIORITY_STYLE = {
  critical: 'bg-red-50 text-red-600',
  high: 'bg-orange-50 text-orange-600',
  standard: 'bg-gray-100 text-gray-600',
  low: 'bg-gray-50 text-gray-400',
};

const STATUS_STYLE = {
  active_motion: 'bg-orange-50 text-orange-600',
  appellate_filing: 'bg-blue-50 text-blue-600',
  discovery: 'bg-green-50 text-green-700',
  pre_trial: 'bg-purple-50 text-purple-600',
  trial: 'bg-red-50 text-red-600',
  mediation: 'bg-gray-100 text-gray-600',
  closed: 'bg-gray-50 text-gray-400',
};

const INITIALS_COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-gray-100 text-gray-500',
];

export default function Matters() {
  const navigate = useNavigate();
  const [showNewModal, setShowNewModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: matters = [], isLoading } = useQuery({
    queryKey: ['matters'],
    queryFn: () => base44.entities.Matter.list('-updated_date', 50),
  });

  return (
    <div className="page-content">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Active Matters</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Managing {matters.length} open file{matters.length !== 1 ? 's' : ''} across jurisdictions.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-card border border-border px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-muted transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-terracotta px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> New Matter
          </button>
        </div>
      </div>

      <div className="tl-card overflow-hidden shadow-sm bg-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              {['Matter & Client', 'Status', 'Priority', 'Next Deadline', ''].map(h => (
                <th key={h} className="px-6 py-4 section-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="px-6 py-5">
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : matters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="font-bold text-muted-foreground">No matters yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first matter to get started.</p>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="mt-4 btn-terracotta px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-4 h-4 inline mr-1" /> Add First Matter
                  </button>
                </td>
              </tr>
            ) : (
              matters.map((matter, idx) => (
                <tr
                  key={matter.id}
                  className="hover:bg-muted/20 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/matters/${matter.id}`)}
                >
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{matter.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {matter.caseNumber && `${matter.caseNumber} • `}{matter.court?.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{matter.client}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1.5 w-fit ${STATUS_STYLE[matter.status] || 'bg-gray-100 text-gray-600'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {matter.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${PRIORITY_STYLE[matter.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {matter.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {matter.nextDeadlineDate ? (
                      <>
                        <p className="text-xs font-bold text-foreground">{format(new Date(matter.nextDeadlineDate), 'MMM d, yyyy')}</p>
                        <p className="text-[10px] text-muted-foreground">{matter.nextDeadlineLabel}</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">—</p>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Open <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {matters.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Showing {matters.length} matter{matters.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {showNewModal && (
        <NewMatterModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['matters'] });
            setShowNewModal(false);
          }}
        />
      )}
    </div>
  );
}
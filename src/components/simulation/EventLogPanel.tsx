import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Download,
  Filter,
  Info,
  Sparkles,
  Trash2,
  Vibrate,
  X,
} from 'lucide-react';
import { DecisionLogEntry } from '../../types/simulation';

interface EventLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: DecisionLogEntry[];
  onClearLogs: () => void;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  const exportCSV = () => {
    const headers = ['Timestamp_sec', 'Category', 'State', 'Title', 'Explanation', 'HR_BPM', 'GSR_uS', 'Motion_g', 'Contact_pct'];
    const rows = logs.map((l) => [
      l.timestamp.toFixed(2),
      l.category,
      l.state,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.explanation.replace(/"/g, '""')}"`,
      l.metrics.hr,
      l.metrics.gsr.toFixed(2),
      l.metrics.motion.toFixed(2),
      l.metrics.contact,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calma_telemetry_event_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `calma_telemetry_event_log_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sensor':
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
      case 'decision':
        return <Sparkles className="w-3.5 h-3.5 text-teal-400" />;
      case 'intervention':
        return <Vibrate className="w-3.5 h-3.5 text-rose-400" />;
      case 'hardware':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-5 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl font-sans select-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              Telemetry & Decision Engine Event Log
            </h3>
            <span className="text-xs font-mono text-slate-500">
              ({filteredLogs.length} events)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportJSON}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
              title="Download JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-between gap-2 py-2.5 border-b border-slate-800/80 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-mono text-[10px] uppercase mr-1">Filter:</span>
            {['all', 'decision', 'intervention', 'sensor', 'hardware'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md capitalize text-xs transition ${
                  filterCategory === cat
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Logs Table / List */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 pr-1 divide-y divide-slate-800/50">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-500 text-xs">
              <span>No logged events matching the active filter.</span>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="pt-2 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(log.category)}
                    <span className="font-mono text-teal-400 font-semibold text-[11px]">
                      {log.timestamp.toFixed(1)}s
                    </span>
                    <span className="font-bold text-slate-200">{log.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                    {log.state}
                  </span>
                </div>

                <p className="text-slate-400 leading-snug text-[11px] pl-5">
                  {log.explanation}
                </p>

                <div className="flex items-center gap-3 pl-5 text-[10px] font-mono text-slate-500">
                  <span>HR: {log.metrics.hr} BPM</span>
                  <span>GSR: {log.metrics.gsr.toFixed(2)} µS</span>
                  <span>IMU: {log.metrics.motion.toFixed(2)} g</span>
                  <span>Contact: {log.metrics.contact}%</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Real-time Ring Buffer · Max 200 Telemetry Log Entries</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

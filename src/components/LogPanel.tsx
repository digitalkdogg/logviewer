'use client';

import React, { useState } from 'react';

interface LogEntry {
  id: number;
  log: string | null;
  log_type: 'stdout' | 'stderr' | null;
  created_at: Date | string | null;
}

interface LogPanelProps {
  logs: LogEntry[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'stdout' | 'stderr'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.log_type === filter;
    const matchesSearch = log.log ? log.log.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-slate-200 shadow-xl">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('stdout')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'stdout' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Stdout
          </button>
          <button
            onClick={() => setFilter('stderr')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'stderr' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Stderr
          </button>
        </div>
        <div className="w-full md:w-auto flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 text-sm"
          />
        </div>
      </div>
      <div className="flex-grow overflow-auto p-4 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-400 italic text-center py-10">No logs found</div>
        ) : (
          <pre className="whitespace-pre-wrap break-words">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex gap-3 px-2 py-0.5 rounded transition-colors duration-150 ${
                  log.log_type === 'stderr' ? 'text-red-600 bg-red-50' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-slate-400 select-none text-[10px] w-32 flex-shrink-0 pt-0.5 opacity-70">
                  {log.created_at ? new Date(log.created_at).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }) : ''}
                </span>
                <span className="flex-grow">{log.log}</span>
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LogPanel;


import React from 'react';
import { AlertCircle, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AlarmItem } from '../types';

interface AlarmPanelProps {
  alarms: AlarmItem[];
}

const AlarmPanel: React.FC<AlarmPanelProps> = ({ alarms }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col flex-1 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          系统消息
        </h2>
        <button className="text-[10px] text-slate-400 hover:text-blue-500 transition-colors flex items-center">
          查看全部 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="flex items-start gap-2.5">
              {alarm.level === 'warning' ? 
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> : 
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-medium text-slate-700 truncate">{alarm.source}</span>
                  <span className="text-[9px] text-slate-400 shrink-0">{alarm.timestamp}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{alarm.message}</div>
              </div>
            </div>
          </div>
        ))}
        {alarms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 opacity-40">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs text-slate-500">当前无告警信息</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmPanel;

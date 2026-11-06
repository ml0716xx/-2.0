import React from 'react';
import { Plus, Sparkles, Edit, Copy, Trash2, Layers } from 'lucide-react';

/**
 * 智控版入口页。
 * ----------------------------------------------------------
 * 智控版不是「一条策略」，而是一个容器：所有交给天盈 AI 逐时段接管的策略
 * 都在这里登记，一个入口可以放多条，每条各自配自己的时段和参数。
 * 点进某一条，走的是普通策略那套编辑/保存流程，改完回到这张清单。
 *
 * 清单只留「名称 + 操作」两列。状态、调度时段这些都进策略详情里看，
 * 列表只负责找人，不负责汇报。
 */

interface ControlTierPanelProps {
  strategies: { id: string; name: string }[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
}

const ControlTierPanel: React.FC<ControlTierPanelProps> = ({
  strategies,
  onCreate,
  onOpen,
  onCopy,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-50 flex-1 relative flex flex-col">
      {/* 头部：这一档是什么、能放几条 */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-50">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 whitespace-nowrap">
            <Sparkles className="w-4 h-4 shrink-0 text-violet-500" aria-label="天盈 AI 策略" />
            天盈AI智控版
            <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md text-[10px] font-bold border bg-violet-50 text-violet-600 border-violet-100">
              智控版
            </span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              {strategies.length} 条策略
            </span>
          </div>
        </div>

        <button
          onClick={onCreate}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="w-3.5 h-3.5" /> 新增智控版策略
        </button>
      </div>

      <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
        交给天盈 AI 逐时段接管的策略都在这张清单里。一个入口可以放多条，每条各自配时段、阈值和 SOC 预留；
        点进某一条就是配一条普通策略。
      </p>

      {strategies.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
            <Layers className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-base font-black text-slate-800 tracking-tight">还没有智控版策略</div>
          <p className="text-sm text-slate-400 font-medium max-w-sm leading-relaxed">
            先建一条，把要接管的时段和参数配进去。之后想加第二条、第三条，同样在这里加。
          </p>
          <button
            onClick={onCreate}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-dashed border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-300 rounded-2xl font-black text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> 新增智控版策略
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  策略名称
                </th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {strategies.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => onOpen(s.id)}
                  className="group hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-slate-700 truncate">{s.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpen(s.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-emerald-600 hover:bg-emerald-50 transition-all whitespace-nowrap"
                      >
                        <Edit className="w-3.5 h-3.5" /> 配置
                      </button>
                      <button
                        onClick={() => onCopy(s.id)}
                        title="复制这条策略"
                        className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        title="删除这条策略"
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ControlTierPanel;


import React from 'react';
import { Zap, RefreshCw, ChevronRight, TrendingUp, Cpu } from 'lucide-react';
import { StrategyGroup } from '../types';

interface StrategyPanelProps {
  strategy: StrategyGroup;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ strategy }) => {
  // 分离主策略和次要策略
  const mainStrategy = strategy.activeStrategies.find(s => s.type === 'main');
  const subStrategies = strategy.activeStrategies.filter(s => s.type === 'sub');

  return (
    <div className="bg-white rounded-[2rem] shadow-sm p-5 flex flex-col flex-1 border border-slate-100">
      {/* 头部标题区 - 调整字号为 text-base 与 StatsCard/RevenueCard/AlarmPanel 统一 */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          策略运行情况 <ChevronRight className="w-4 h-4 text-slate-400" />
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
            {strategy.startTime} – {strategy.endTime}
          </span>
          <span className="px-1.5 py-0.5 border border-slate-100 text-slate-400 text-[8px] font-bold rounded uppercase bg-white">
            执行中
          </span>
        </div>
      </div>

      {/* 滚动容器 - 保持紧凑布局 */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5">
        
        {/* 1. 主要策略板块 (主策略 + 下个时段) */}
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {mainStrategy && (
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/40 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100 transition-transform hover:rotate-6">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 leading-tight">{mainStrategy.name}</div>
                    <div className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">{mainStrategy.englishName}</div>
                  </div>
                </div>
                <div className="text-slate-400 font-mono text-[10px] font-bold bg-white/40 px-1.5 py-0.5 rounded">
                  {strategy.startTime}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 relative z-10">
                <div className="bg-white/80 backdrop-blur-sm border border-indigo-50/50 p-3 rounded-lg flex flex-col items-center gap-0.5 transition-all hover:shadow-sm">
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">充放电类型</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                    <Zap className="w-3 h-3 fill-current" />
                    {mainStrategy.currentTask?.type}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-indigo-50/50 p-3 rounded-lg flex flex-col items-center gap-0.5 transition-all hover:shadow-sm">
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">充放电功率</div>
                  <div className="text-xs font-bold text-slate-800 font-mono">
                    {mainStrategy.currentTask?.power.toFixed(1)} <span className="text-[8px] font-bold text-indigo-400 ml-0.5">kW</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 下个时段计划 */}
          <div className="space-y-2">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">下个时段计划</div>
            <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl relative group cursor-pointer hover:bg-slate-100 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-105 transition-transform">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-800 truncate">{strategy.nextTask.type}</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono shrink-0 ml-2">{strategy.nextTask.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">计划功率</span>
                    <span className="text-xs font-bold text-blue-600 font-mono">{strategy.nextTask.power.toFixed(1)} kW</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* 分隔符 */}
        <div className="border-t border-slate-50 border-dashed mx-2 my-1"></div>

        {/* 2. 次要辅助策略板块 (线框卡片) */}
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 pb-1">
          {subStrategies.map((item) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-center gap-2.5 px-1">
                <div className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 bg-white shadow-sm transition-colors hover:text-emerald-500">
                  {item.name === '余电上网' ? <TrendingUp className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                </div>
                <span className="text-xs font-bold text-slate-700">{item.name}</span>
              </div>
              {item.params.map((param, pIdx) => (
                <div key={pIdx} className="grid grid-cols-2 gap-2">
                  <div className="border border-slate-100 p-3 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-50/50">
                    {param.label}
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg flex items-center justify-center text-sm font-bold text-slate-800 font-mono bg-white shadow-sm transition-all hover:border-slate-300">
                    {param.value}<span className="text-[8px] font-bold text-slate-400 ml-1 uppercase">{param.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyPanel;

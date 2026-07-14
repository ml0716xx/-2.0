
import React, { useState, useRef, useEffect } from 'react';
import { Settings, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const PowerStrategySection: React.FC = () => {
  const [hoverData, setHoverData] = useState<{ x: number, time: string, values: any } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [demandMode, setDemandMode] = useState<'static' | 'dynamic' | 'ai'>(() => {
    return (localStorage.getItem('sys_demandMode') as 'static' | 'dynamic' | 'ai') || 'dynamic';
  });
  const [initialDemandLimit, setInitialDemandLimit] = useState(() => localStorage.getItem('sys_initialDemandLimit') || '500');
  const [baselineOvercapacity, setBaselineOvercapacity] = useState(() => localStorage.getItem('sys_baselineOvercapacity') || '470');
  const [demandLimit, setDemandLimit] = useState(() => localStorage.getItem('sys_demandLimit') || '100');
  const [overcapacityLimit, setOvercapacityLimit] = useState(() => localStorage.getItem('sys_overcapacityLimit') || '90');

  useEffect(() => {
    const handleStorageChange = () => {
      setDemandMode((localStorage.getItem('sys_demandMode') as 'static' | 'dynamic' | 'ai') || 'dynamic');
      setInitialDemandLimit(localStorage.getItem('sys_initialDemandLimit') || '500');
      setBaselineOvercapacity(localStorage.getItem('sys_baselineOvercapacity') || '470');
      setDemandLimit(localStorage.getItem('sys_demandLimit') || '100');
      setOvercapacityLimit(localStorage.getItem('sys_overcapacityLimit') || '90');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 模拟路径数据生成的逻辑点
  const generatePaths = () => {
    const loadPath = "M0,160 C100,150 200,120 300,140 S500,160 650,110 S850,40 1000,90";
    const pvPath = "M300,200 C350,140 450,60 550,50 S750,140 800,200";
    const storagePath = "M0,180 L300,180 C350,190 450,200 550,180 L750,180 C800,140 900,100 1000,170";
    const gridPath = "M0,150 C150,155 300,170 450,165 S700,140 900,120 L1000,115";
    const socPath = "M0,160 C200,160 400,180 600,120 S850,40 1000,100";
    return { loadPath, pvPath, storagePath, gridPath, socPath };
  };

  const paths = generatePaths();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // 计算模拟时间
    const totalMinutes = 24 * 60;
    const currentMinutes = Math.floor((percentage / 100) * totalMinutes);
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // 模拟不同时间点的动态数据
    setHoverData({
      x,
      time: timeStr,
      values: {
        load: (100 + Math.random() * 50).toFixed(1),
        pv: percentage > 30 && percentage < 80 ? (150 + Math.random() * 30).toFixed(1) : "0.0",
        storage: (Math.random() * 40).toFixed(1),
        grid: (20 + Math.random() * 10).toFixed(1),
        soc: (40 + Math.random() * 10).toFixed(1)
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-5 border border-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
          <h2 className="text-base font-black text-slate-800 tracking-tight">功率曲线与监控策略</h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-500 rounded-md text-[10px] font-bold border border-rose-100">
            <AlertCircle className="w-3 h-3" />
            16:42 负荷接近限值
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex p-0.5 bg-slate-100 rounded-lg">
            {['今日', '昨日'].map((t) => (
              <button 
                key={t} 
                className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${
                  t === '今日' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Settings className="w-3.5 h-3.5" /> 策略配置
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 实时核心指标看板 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 指标卡 1: 变压器安全容量 */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">变压器安全容量</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-800 font-mono">1,200</span>
              <span className="text-[10px] font-bold text-slate-400">kW</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              运行状态: 正常安全范围
            </div>
          </div>

          {/* 指标卡 2: 本月实时最大需量 */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">本月最大下网需量</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-800 font-mono">498.2</span>
              <span className="text-[10px] font-bold text-slate-400">kW</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              出现时间: 今日 14:30
            </div>
          </div>

          {/* 指标卡 3: 需量门限 */}
          <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
            demandMode === 'ai' 
              ? 'bg-indigo-50/30 border-indigo-200/60 hover:border-indigo-300' 
              : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">需量门限</div>
              {demandMode === 'ai' && (
                <span className="bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-black text-[8px] border border-indigo-100 animate-pulse">AI 调整</span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono ${demandMode === 'ai' ? 'text-indigo-600' : 'text-slate-800'}`}>
                {demandMode === 'ai' 
                  ? (Math.round((parseFloat(initialDemandLimit) || 500) * 1.04 * 10) / 10).toFixed(1) 
                  : (localStorage.getItem('sys_demandLimit') || '100')}
              </span>
              <span className={`text-xs font-bold ${demandMode === 'ai' ? 'text-indigo-400' : 'text-slate-400'}`}>kW</span>
            </div>
            <div className="mt-2 text-[10px] font-bold flex items-center gap-1">
              {demandMode === 'ai' ? (
                <span className="text-indigo-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  AI 调整 · 今日 09:15 (基准: {initialDemandLimit}kW)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  {demandMode === 'dynamic' ? '● 动态追需模式' : '● 静态控需模式'}
                </span>
              )}
            </div>
          </div>

          {/* 指标卡 4: 超限限值 */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
            demandMode === 'ai' 
              ? 'bg-indigo-50/30 border-indigo-200/60 hover:border-indigo-300' 
              : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">超限阈值</div>
              {demandMode === 'ai' && (
                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black text-[9px] border border-indigo-100">AI 寻优</span>
              )}
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono ${demandMode === 'ai' ? 'text-indigo-600' : 'text-slate-800'}`}>
                {demandMode === 'ai' 
                  ? (Math.round((parseFloat(baselineOvercapacity) || 470) * 0.996 * 10) / 10).toFixed(1) 
                  : (localStorage.getItem('sys_overcapacityLimit') || '90')}
              </span>
              <span className={`text-xs font-bold ${demandMode === 'ai' ? 'text-indigo-400' : 'text-slate-400'}`}>kW</span>
            </div>
            <div className="mt-2 text-[10px] font-bold flex items-center gap-1">
              {demandMode === 'ai' ? (
                <span className="text-indigo-500">
                  AI 优化 · 自动重置 (基准: {baselineOvercapacity}kW)
                </span>
              ) : (
                <span className="text-slate-400">
                  超量防超限保护
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 1. 图表交互区域 */}
        <div className="relative group/chart" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverData(null)}>
          <div className="h-[350px] w-full relative px-12 pt-10">
            {/* 轴标签 */}
            <div className="absolute left-0 top-0 text-[10px] text-slate-400 font-black uppercase tracking-widest">Power (kW)</div>
            <div className="absolute right-0 top-0 text-[10px] text-purple-400 font-black uppercase tracking-widest text-right">Battery (%)</div>

            {/* 网格刻度 */}
            {[200, 150, 100, 50, 0].map((v) => (
              <div key={v} className="absolute left-0 text-[11px] text-slate-400 font-mono font-bold -translate-y-1/2" style={{ top: `${10 + (1 - v/200) * 85}%` }}>{v}</div>
            ))}
            {[100, 50, 0].map((v) => (
              <div key={v} className="absolute right-0 text-[11px] text-purple-400 font-mono font-bold -translate-y-1/2 text-right" style={{ top: `${10 + (1 - v/100) * 85}%` }}>{v}</div>
            ))}

            <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pv-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g stroke="#f8fafc" strokeWidth="1">
                {[200, 150, 100, 50, 0].map((v) => <line key={v} x1="0" y1={200 - (v / 200) * 200} x2="1000" y2={200 - (v / 200) * 200} strokeDasharray={v === 0 ? "0" : "6 4"} />)}
              </g>
              <path d={`${paths.pvPath} L800,200 L300,200 Z`} fill="url(#pv-glow)" />
              <path d={paths.gridPath} fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="8 4" className="opacity-60" /> 
              <path d={paths.pvPath} fill="none" stroke="#f59e0b" strokeWidth="1.2" className="drop-shadow-sm" /> 
              <path d={paths.storagePath} fill="none" stroke="#2563eb" strokeWidth="1.2" /> 
              <path d={paths.loadPath} fill="none" stroke="#334155" strokeWidth="1.2" /> 
              <path d={paths.socPath} fill="none" stroke="#a855f7" strokeWidth="1.0" strokeDasharray="4 4" /> 
            </svg>

            {/* 交互悬浮层：垂直扫描线 */}
            {hoverData && (
              <>
                <div className="absolute top-10 bottom-0 w-px bg-slate-400/30 pointer-events-none z-10" style={{ left: `${hoverData.x + 48}px` }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-slate-400 rounded-full"></div>
                </div>
                
                {/* 数据详情浮窗 */}
                <div 
                  className="absolute z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl w-60 pointer-events-none transition-all duration-75"
                  style={{ 
                    left: `${hoverData.x + 80}px`, 
                    top: '15%',
                    transform: hoverData.x > 700 ? 'translateX(-115%)' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time: {hoverData.time}</span>
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="space-y-2.5">
                    <DataPoint label="总负荷" value={hoverData.values.load} unit="kW" color="text-slate-100" />
                    <DataPoint label="光伏发电" value={hoverData.values.pv} unit="kW" color="text-amber-400" />
                    <DataPoint label="储能功率" value={hoverData.values.storage} unit="kW" color="text-blue-400" />
                    <DataPoint label="电网功率" value={hoverData.values.grid} unit="kW" color="text-emerald-400" />
                    <div className="pt-2 border-t border-slate-800 mt-2">
                      <DataPoint label="电池 SOC" value={hoverData.values.soc} unit="%" color="text-purple-400" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 图例 */}
          <div className="flex justify-center flex-wrap gap-10 mt-12">
            <LegendItem color="bg-slate-700" label="总负荷功率" type="solid" />
            <LegendItem color="bg-amber-500" label="光伏发电" type="solid" />
            <LegendItem color="bg-blue-600" label="储能功率" type="solid" />
            <LegendItem color="bg-purple-500" label="电池 SOC" type="dashed" />
            <LegendItem color="bg-emerald-500" label="电网功率" type="dashed-line" />
          </div>
        </div>

        {/* 策略流水线 */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 shadow-inner">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-black uppercase tracking-widest">
              <Clock className="w-4 h-4 text-blue-500" /> EMS 自动调度流水线
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 收益模式
              </div>
            </div>
          </div>
          <div className="space-y-3">
             {[
              { id: 'P1', items: [{ left: '0%', width: '30%', bg: 'bg-emerald-500', label: '峰谷套利模式' }, { left: '35%', width: '20%', bg: 'bg-emerald-400', label: '全额自用' }] },
              { id: 'P2', items: [{ left: '10%', width: '40%', bg: 'bg-blue-600', label: '最大需量管理' }] },
              { id: 'P3', items: [{ left: '50%', width: '25%', bg: 'bg-violet-500', label: '应急备电模式' }, { left: '80%', width: '15%', bg: 'bg-slate-400', label: '维护检查' }] }
            ].map((row) => (
              <div key={row.id} className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-300 w-6">{row.id}</span>
                <div className="flex-1 h-8 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                  {row.items.map((item, idx) => (
                    <div key={idx} className={`absolute h-full flex items-center px-4 text-[10px] text-white font-black tracking-wide ${item.bg} hover:brightness-110 cursor-pointer transition-all`} style={{ left: item.left, width: item.width }}>{item.label}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DataPoint = ({ label, value, unit, color }: { label: string, value: string, unit: string, color: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] font-bold text-slate-500">{label}</span>
    <span className={`text-sm font-black font-mono ${color}`}>{value} <span className="text-[10px] font-normal opacity-60 ml-0.5">{unit}</span></span>
  </div>
);

const LegendItem = ({ color, label, type }: { color: string, label: string, type: 'solid' | 'dashed' | 'dashed-line' }) => (
  <div className="flex items-center gap-3 cursor-pointer group hover:scale-105 transition-transform">
    {type === 'dashed-line' ? (
      <div className="flex items-center"><div className={`w-8 h-[1.2px] ${color} opacity-60 border-t border-dashed border-white`}></div></div>
    ) : type === 'dashed' ? (
      <div className="flex items-center"><div className={`w-8 h-[1.2px] ${color} opacity-40 border-t border-dotted border-white`}></div></div>
    ) : (
      <div className={`w-3 h-3 rounded-sm ${color} shadow-sm group-hover:shadow-md transition-shadow`}></div>
    )}
    <span className="text-xs text-slate-600 font-black">{label}</span>
  </div>
);

export default PowerStrategySection;

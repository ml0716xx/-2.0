
import React from 'react';
import { Sun, Battery, Zap, Activity, ArrowRightLeft, Settings, Info } from 'lucide-react';

const EnergyFlowDiagram: React.FC = () => {
  // 定义坐标点，使图形在 800x450 的 viewBox 中更舒展，尽量填满空间
  const PV_POS = { x: 120, y: 80 };
  const GRID_POS = { x: 120, y: 370 };
  const LOAD_POS = { x: 680, y: 80 };
  const CHARGING_POS = { x: 680, y: 370 };
  const STORAGE_POS = { x: 400, y: 400 };
  const CORE_POS = { x: 400, y: 225 };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm p-10 flex flex-col h-full relative overflow-hidden border border-slate-50">
      {/* 动态背景光晕 */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-emerald-50/40 rounded-full blur-[120px] -mr-96 -mt-96"></div>
      <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-blue-50/40 rounded-full blur-[120px] -ml-96 -mb-96"></div>
      
      {/* 1. 顶部标题与系统状态 */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">站点能流监测枢纽</h2>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-100">
              <Activity className="w-4 h-4" />
              实时调度逻辑已激活
            </div>
          </div>
          <p className="text-sm text-slate-400 font-semibold tracking-wide uppercase">Interactive Energy Orchestration Layer</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm">
          <button className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-white hover:shadow-md rounded-xl transition-all">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 2. 功率汇总统计栏 */}
      <div className="relative z-20 mb-6">
        <div className="flex items-center justify-around bg-slate-50/80 backdrop-blur-md border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 总输入功率
            </span>
            <span className="text-2xl font-black text-slate-800">289.7 <span className="text-sm font-normal text-slate-400">kW</span></span>
          </div>
          <div className="w-px h-10 bg-slate-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div> 总输出功率
            </span>
            <span className="text-2xl font-black text-slate-800">179.5 <span className="text-sm font-normal text-slate-400">kW</span></span>
          </div>
          <div className="w-px h-10 bg-slate-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-2">能量自给率</span>
            <span className="text-2xl font-black text-emerald-600">88.4 <span className="text-sm font-normal">%</span></span>
          </div>
        </div>
      </div>

      {/* 3. SVG 画布容器 */}
      <div className="flex-1 flex items-center justify-center relative">
        <svg viewBox="0 0 800 450" className="w-full h-full overflow-visible transition-all duration-700">
          <defs>
            <filter id="glow-heavy" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
              <feOffset dx="0" dy="8" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <radialGradient id="ems-core-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 路径逻辑层 */}
          <g stroke="#f1f5f9" strokeWidth="10" fill="none" strokeLinecap="round">
            <path d={`M${PV_POS.x} ${PV_POS.y} Q 300 80, ${CORE_POS.x} ${CORE_POS.y}`} />
            <path d={`M${GRID_POS.x} ${GRID_POS.y} Q 300 370, ${CORE_POS.x} ${CORE_POS.y}`} />
            <path d={`M${CORE_POS.x} ${CORE_POS.y} Q 500 80, ${LOAD_POS.x} ${LOAD_POS.y}`} />
            <path d={`M${CORE_POS.x} ${CORE_POS.y} Q 500 370, ${CHARGING_POS.x} ${CHARGING_POS.y}`} />
            <path d={`M${CORE_POS.x} ${CORE_POS.y} L ${STORAGE_POS.x} ${STORAGE_POS.y}`} />
          </g>

          {/* 动态粒子层 */}
          <circle r="5" fill="#f59e0b">
            <animateMotion dur="2.8s" repeatCount="indefinite" path={`M${PV_POS.x} ${PV_POS.y} Q 300 80, ${CORE_POS.x} ${CORE_POS.y}`} />
          </circle>
          <circle r="5" fill="#10b981">
            <animateMotion dur="2.4s" repeatCount="indefinite" path={`M${GRID_POS.x} ${GRID_POS.y} Q 300 370, ${CORE_POS.x} ${CORE_POS.y}`} />
          </circle>
          <circle r="5" fill="#10b981">
            <animateMotion dur="2.2s" repeatCount="indefinite" path={`M${CORE_POS.x} ${CORE_POS.y} Q 500 80, ${LOAD_POS.x} ${LOAD_POS.y}`} />
          </circle>
          <circle r="5" fill="#6366f1">
            <animateMotion dur="2.6s" repeatCount="indefinite" path={`M${CORE_POS.x} ${CORE_POS.y} Q 500 370, ${CHARGING_POS.x} ${CHARGING_POS.y}`} />
          </circle>
          <circle r="6" fill="#3b82f6">
            <animateMotion dur="3.5s" repeatCount="indefinite" path={`M${STORAGE_POS.x} ${STORAGE_POS.y} L ${CORE_POS.x} ${CORE_POS.y}`} />
          </circle>

          {/* 节点层 */}
          <NodeGroup x={PV_POS.x} y={PV_POS.y} icon={<Sun className="w-10 h-10" />} color="#f59e0b" label="分布式光伏" value="270.9 kW" />
          <NodeGroup x={GRID_POS.x} y={GRID_POS.y} icon={<Zap className="w-10 h-10" />} color="#10b981" label="公共电网" value="下网: 18.8 kW" />
          <NodeGroup x={LOAD_POS.x} y={LOAD_POS.y} icon={<Activity className="w-10 h-10" />} color="#64748b" label="基础负荷" value="功率: 27.1 kW" />
          <NodeGroup x={CHARGING_POS.x} y={CHARGING_POS.y} icon={<Zap className="w-10 h-10" />} color="#6366f1" label="充电负荷" value="功率: 152.4 kW" />
          <NodeGroup x={STORAGE_POS.x} y={STORAGE_POS.y} icon={<Battery className="w-10 h-10" />} color="#3b82f6" label="储能电池" value="SOC: 37.2%" />

          {/* 核心调度 EMS 控制器 */}
          <g transform={`translate(${CORE_POS.x}, ${CORE_POS.y})`}>
            <circle r="85" fill="url(#ems-core-gradient)" className="animate-pulse" />
            <circle r="55" fill="#10b981" filter="url(#glow-heavy)" />
            <foreignObject x="-28" y="-28" width="56" height="56">
              <div className="flex items-center justify-center w-full h-full text-white">
                <Settings className="w-12 h-12 animate-spin-slow" />
              </div>
            </foreignObject>
            <text y="95" textAnchor="middle" className="text-[16px] font-black fill-slate-800 uppercase tracking-[0.4em]">EMS核心</text>
            <text y="112" textAnchor="middle" className="text-[11px] fill-emerald-600 font-bold">调度逻辑就绪</text>
          </g>
        </svg>

        {/* 决策说明气泡 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-140px] flex flex-col items-center gap-3 pointer-events-none transition-transform">
          <div className="bg-slate-900/95 backdrop-blur-md text-white text-[10px] px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-700">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold tracking-wide">决策：光伏能量优先覆盖站内用电，余量补给储能</span>
          </div>
          <div className="w-0.5 h-8 bg-gradient-to-b from-slate-900/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

const NodeGroup = ({ x, y, icon, color, label, value }: { x: number, y: number, icon: React.ReactNode, color: string, label: string, value: string }) => (
  <g transform={`translate(${x}, ${y})`} className="cursor-pointer group">
    <circle r="55" fill="white" filter="url(#glow-heavy)" stroke={color} strokeWidth="1.5" className="transition-all duration-300 group-hover:r-[60px]" />
    <circle r="44" fill={`${color}15`} />
    <foreignObject x="-28" y="-28" width="56" height="56">
      <div className="flex items-center justify-center w-full h-full" style={{ color }}>
        {icon}
      </div>
    </foreignObject>
    <text y="82" textAnchor="middle" className="text-[15px] font-black fill-slate-800">{label}</text>
    <text y="102" textAnchor="middle" className="text-[12px] fill-slate-400 font-black uppercase tracking-tight">{value}</text>
    <circle cx="40" cy="-40" r="6" fill={color} className="animate-pulse" stroke="white" strokeWidth="2" />
  </g>
);

export default EnergyFlowDiagram;

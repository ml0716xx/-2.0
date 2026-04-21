
import React, { useState } from 'react';
import { Sun, Battery, Zap, Activity, ArrowRightLeft, Settings, Info, CloudSun, Wind, Droplets, Sunrise, Sunset, Thermometer, AlertTriangle, ShieldAlert, Bell } from 'lucide-react';
import { AlarmItem } from '../types';

interface EnergyFlowDiagramProps {
  alarms?: AlarmItem[];
  onNavigate?: (page: string) => void;
}

const EnergyFlowDiagram: React.FC<EnergyFlowDiagramProps> = ({ alarms = [], onNavigate }) => {
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
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">运行模式：并网模式</h2>
          </div>
        </div>
      </div>

      {/* 2. 系统消息悬浮窗 (Alarm Summary) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 group">
        <button 
          onClick={() => onNavigate && onNavigate('报警管理')}
          className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-100 shadow-lg px-4 py-3 rounded-full cursor-pointer hover:bg-slate-50 transition-all"
        >
          <div className="flex -space-x-2">
            {alarms.filter(a => a.level === 'warning').length > 0 && (
              <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-rose-500 relative z-20">
                <ShieldAlert className="w-4 h-4" />
              </div>
            )}
            {alarms.filter(a => a.level === 'info').length > 0 && (
              <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-amber-500 relative z-10">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            {alarms.length === 0 && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-500 relative z-10">
                <Bell className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-start pr-2">
            <span className="text-xs font-bold text-slate-700">系统消息</span>
            <span className="text-[10px] text-slate-500">
              {alarms.length > 0 ? `发现 ${alarms.length} 条未处理报警` : '系统运行正常'}
            </span>
          </div>
        </button>

        {/* Hover Dropdown */}
        {alarms.length > 0 && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45"></div>
            <div className="relative z-10 flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-700">最新报警</span>
              <span className="text-[10px] text-emerald-600 font-medium cursor-pointer" onClick={() => onNavigate && onNavigate('报警管理')}>查看全部 &rarr;</span>
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              {alarms.slice(0, 3).map(alarm => (
                <div key={alarm.id} className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate && onNavigate('报警管理')}>
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    alarm.level === 'warning' ? 'bg-rose-100 text-rose-500' : 'bg-amber-100 text-amber-500'
                  }`}>
                    {alarm.level === 'warning' ? <ShieldAlert className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-700 truncate">{alarm.source}</span>
                      <span className="text-[9px] text-slate-400">{alarm.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{alarm.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. SVG 画布容器 */}
      <div className="flex-1 flex items-center justify-center relative">
        <svg viewBox="0 0 800 550" className="w-full h-full overflow-visible transition-all duration-700">
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
          <NodeGroup x={GRID_POS.x} y={GRID_POS.y} icon={<Zap className="w-10 h-10" />} color="#10b981" label="公共电网" value="下网: 18.8 kW" tooltip={["实时需量: 350 kW", "最大需量: 800 kW"]} />
          <NodeGroup x={LOAD_POS.x} y={LOAD_POS.y} icon={<Activity className="w-10 h-10" />} color="#64748b" label="基础负荷" value="功率: 27.1 kW" />
          <NodeGroup x={CHARGING_POS.x} y={CHARGING_POS.y} icon={<Zap className="w-10 h-10" />} color="#6366f1" label="充电负荷" value="功率: 152.4 kW" />
          <NodeGroup x={STORAGE_POS.x} y={STORAGE_POS.y} icon={<Battery className="w-10 h-10" />} color="#3b82f6" label="储能电池" value={["SOC: 37.2%", "充放功率: 120 kW"]} tooltip={["可用电量: 850 kWh"]} />

          {/* 核心调度 EMS 控制器 */}
          <g transform={`translate(${CORE_POS.x}, ${CORE_POS.y})`}>
            <circle r="85" fill="url(#ems-core-gradient)" className="animate-pulse" />
            <circle r="55" fill="#10b981" filter="url(#glow-heavy)" />
            <foreignObject x="-28" y="-28" width="56" height="56">
              <div className="flex items-center justify-center w-full h-full text-white">
                <Settings className="w-12 h-12 animate-spin-slow" />
              </div>
            </foreignObject>
            <text y="95" textAnchor="middle" className="text-[16px] font-black fill-slate-800 uppercase tracking-[0.4em]">智能微网</text>
          </g>
        </svg>
      </div>
    </div>
  );
};

const NodeGroup = ({ x, y, icon, color, label, value, tooltip }: { x: number, y: number, icon: React.ReactNode, color: string, label: string, value: string | string[], tooltip?: string[] }) => {
  const values = Array.isArray(value) ? value : [value];
  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer group">
      <circle r="55" fill="white" filter="url(#glow-heavy)" stroke={color} strokeWidth="1.5" className="transition-all duration-300 group-hover:r-[60px]" />
      <circle r="44" fill={`${color}15`} />
      <foreignObject x="-28" y="-28" width="56" height="56">
        <div className="flex items-center justify-center w-full h-full" style={{ color }}>
          {icon}
        </div>
      </foreignObject>
      <text y="82" textAnchor="middle" className="text-[15px] font-black fill-slate-800">{label}</text>
      {values.map((v, i) => (
        <text key={i} y={102 + i * 16} textAnchor="middle" className="text-[12px] fill-slate-400 font-black uppercase tracking-tight">{v}</text>
      ))}
      <circle cx="40" cy="-40" r="6" fill={color} className="animate-pulse" stroke="white" strokeWidth="2" />
      
      {/* Tooltip Overlay */}
      {tooltip && tooltip.length > 0 && (
        <foreignObject x="-100" y="-120" width="200" height="100" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 overflow-visible">
          <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 flex flex-col gap-1.5 items-center justify-center w-max mx-auto">
            {tooltip.map((t, i) => (
              <span key={i} className="font-bold tracking-wide">{t}</span>
            ))}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default EnergyFlowDiagram;

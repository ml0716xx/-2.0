
import React, { useState } from 'react';
import { FileText, TrendingUp, Zap, Sun, Battery, Activity, Wallet, ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react';

type TabType = '微网' | '光伏' | '储能' | '充电桩' | '电网';

const EnergyRevenueSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('微网');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`);

  const getMetrics = () => {
    switch (activeTab) {
      case '光伏': return [{ label: '光伏收益', value: '¥2,036', trend: '+8.2%', color: 'text-amber-600', bg: 'bg-amber-50/40', icon: <Sun className="w-4 h-4" /> }, { label: '总发电量', value: '4,073', unit: 'kWh', trend: '+5.1%', color: 'text-slate-800', bg: 'bg-slate-50/40', icon: <Activity className="w-4 h-4" /> }];
      case '储能': return [{ label: '充放电收益', value: '¥1,452', trend: '+12.5%', color: 'text-blue-600', bg: 'bg-blue-50/40', icon: <Battery className="w-4 h-4" /> }, { label: '充/放电量', value: '1240/1180', unit: 'kWh', trend: '+2.1%', color: 'text-slate-800', bg: 'bg-slate-50/40', icon: <Zap className="w-4 h-4" /> }];
      case '电网': return [{ label: '上网收益', value: '¥312', trend: '+5.2%', color: 'text-emerald-600', bg: 'bg-emerald-50/40', icon: <ArrowUpRight className="w-4 h-4" /> }, { label: '下网费用', value: '¥1,850', trend: '-2.1%', color: 'text-rose-600', bg: 'bg-rose-50/40', icon: <ArrowDownLeft className="w-4 h-4" /> }];
      case '充电桩': return [{ label: '服务费收益', value: '¥852', trend: '+18.4%', color: 'text-violet-600', bg: 'bg-violet-50/40', icon: <Zap className="w-4 h-4" /> }, { label: '总充电量', value: '3,120', unit: 'kWh', trend: '+12.1%', color: 'text-slate-800', bg: 'bg-slate-50/40', icon: <Activity className="w-4 h-4" /> }];
      default: return [{ label: '本月累计总收益', value: '¥4,344', trend: '+9.8%', color: 'text-emerald-600', bg: 'bg-emerald-50/40', icon: <Wallet className="w-4 h-4" /> }, { label: '微网供电总量', value: '6,233', unit: 'kWh', trend: '+4.2%', color: 'text-slate-800', bg: 'bg-slate-50/40', icon: <Activity className="w-4 h-4" /> }];
    }
  };

  const getLegend = (): { label: string; color: string; isLine?: boolean }[] => {
    const revenueLegend = { label: '日收益(¥)', color: 'bg-emerald-500', isLine: true };
    switch (activeTab) {
      case '储能': return [{ label: '充电量(kWh)', color: 'bg-blue-400' }, { label: '放电量(kWh)', color: 'bg-indigo-600' }, revenueLegend];
      case '电网': return [{ label: '上网量(kWh)', color: 'bg-emerald-400' }, { label: '下网量(kWh)', color: 'bg-slate-400' }, revenueLegend];
      case '光伏': return [{ label: '发电量(kWh)', color: 'bg-amber-400' }, { label: '自用量(kWh)', color: 'bg-orange-600' }, revenueLegend];
      case '充电桩': return [{ label: '总电量(kWh)', color: 'bg-violet-400' }, { label: '快充量(kWh)', color: 'bg-fuchsia-600' }, revenueLegend];
      default: return [{ label: '总供电(kWh)', color: 'bg-emerald-400' }, { label: '总用电(kWh)', color: 'bg-slate-500' }, revenueLegend];
    }
  };

  const metrics = getMetrics();
  const legend = getLegend();

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm p-8 flex flex-col gap-8 border border-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">电量趋势与收益分析</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
            {['7天', '30天', '本年'].map((t) => (
              <button key={t} className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${t === '30天' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(['微网', '光伏', '储能', '充电桩', '电网'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-2xl text-sm font-black transition-all border ${
              activeTab === tab 
                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className={`${metric.bg} rounded-[1.5rem] p-6 border border-white hover:shadow-xl transition-all duration-300 cursor-pointer`}>
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 mb-3 uppercase tracking-widest">
              <span className={metric.color}>{metric.icon}</span> {metric.label}
            </div>
            <div className={`text-3xl font-black ${metric.color.includes('slate') ? 'text-slate-800' : metric.color}`}>
              {metric.value} <span className="text-xs font-normal text-slate-400 ml-1">{metric.unit || ''}</span>
            </div>
            <div className={`text-[10px] flex items-center gap-1 mt-3 font-bold ${metric.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
              <TrendingUp className={`w-3.5 h-3.5 ${metric.trend.startsWith('-') ? 'rotate-180' : ''}`} /> 同比上周期 {metric.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-4">
        {/* 图表画布区 - 增加底部外边距 */}
        <div className="h-[400px] w-full relative px-12 pb-12">
          {/* Y轴 */}
          <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-[11px] text-slate-300 font-mono font-bold">
            {[200, 150, 100, 50, 0].map(v => <span key={v}>{v}</span>)}
          </div>
          <div className="absolute right-0 top-0 bottom-12 flex flex-col justify-between text-[11px] text-slate-300 font-mono font-bold text-right">
            {[140, 105, 70, 35, 0].map(v => <span key={v}>{v}</span>)}
          </div>

          <div className="h-full flex items-end justify-between gap-1.5 border-b border-slate-100 relative pt-8">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0.5">
              {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-slate-50"></div>)}
            </div>

            {days.map((day, i) => {
              const h1 = 15 + Math.random() * 50; 
              const h2 = 5 + Math.random() * 30;
              const isHovered = hoveredDay === i;

              return (
                <div 
                  key={day} 
                  className="flex-1 flex flex-col items-center justify-end h-full gap-0.5 group/item cursor-pointer relative"
                  onMouseEnter={() => setHoveredDay(i)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* 柱状图本体 - 移除 Scale 动效，仅在 Hover 时微调亮度 */}
                  <div className={`w-full ${legend[0].color} rounded-t-sm transition-all duration-200 ${isHovered ? 'brightness-110' : ''}`} style={{ height: `${h1}%` }}></div>
                  {legend.length > 2 && <div className={`w-full ${legend[1].color} rounded-sm transition-all duration-200 ${isHovered ? 'brightness-110' : ''}`} style={{ height: `${h2}%` }}></div>}
                  
                  <div className={`absolute -bottom-8 text-[10px] font-black tracking-tighter ${isHovered ? 'text-slate-900' : 'text-slate-300'}`}>{day}</div>

                  {isHovered && (
                    <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 z-50 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl p-4 pointer-events-none animate-in fade-in">
                      <div className="text-[11px] font-black text-slate-400 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between uppercase tracking-widest">
                        <span>3月{day} 详情报告</span>
                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-bold">估算收益</span>
                          <span className="text-sm font-black text-emerald-400">¥{(80 + Math.random() * 40).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-bold">{legend[0].label.split('(')[0]}</span>
                          <span className="text-sm font-black text-slate-100">{(120 + Math.random() * 60).toFixed(1)} <span className="text-[9px] font-normal opacity-40">kWh</span></span>
                        </div>
                        {legend.length > 2 && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-bold">{legend[1].label.split('(')[0]}</span>
                            <span className="text-sm font-black text-slate-100">{(60 + Math.random() * 40).toFixed(1)} <span className="text-[9px] font-normal opacity-40">kWh</span></span>
                          </div>
                        )}
                        <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase tracking-tighter font-bold italic">Analytics</span>
                          <span className="text-emerald-500 font-black">+4.2% ↑</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 1000 200">
              <path d="M0,150 C100,160 250,130 400,100 S700,80 850,110 L1000,120" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" className="drop-shadow-lg opacity-60" />
              {[50, 200, 450, 700, 950].map((x, idx) => (
                <circle key={idx} cx={x} cy={80 + Math.random()*70} r="2.5" fill="#10b981" stroke="white" strokeWidth="1.5" />
              ))}
            </svg>
          </div>
        </div>

        {/* Legend - 增加上边距，确保不被图表遮挡 */}
        <div className="flex justify-center flex-wrap gap-12 mt-16 mb-2">
          {legend.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {item.isLine ? (
                <div className="flex items-center">
                  <div className={`w-8 h-[2px] ${item.color} rounded-full`}></div>
                  <div className={`w-2 h-2 rounded-full ${item.color} -ml-5 border-2 border-white`}></div>
                </div>
              ) : (
                <div className={`w-3.5 h-3.5 rounded-sm ${item.color} shadow-sm`}></div>
              )}
              <span className="text-xs text-slate-500 font-black tracking-wide uppercase">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnergyRevenueSection;

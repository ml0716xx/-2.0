
import React from 'react';
import { Sun, Battery, Zap, ChevronRight, TrendingUp, TrendingDown, Globe } from 'lucide-react';
import { EnergyStat } from '../types';

interface StatsCardProps {
  stats: EnergyStat[];
  activeTab: 'today' | 'yesterday' | 'total';
  onTabChange: (tab: 'today' | 'yesterday' | 'total') => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, activeTab, onTabChange }) => {
  const gridIn = stats.find(s => s.type === 'grid-in');
  const gridOut = stats.find(s => s.type === 'grid-out');
  const regularStats = stats.filter(s => s.type !== 'grid-in' && s.type !== 'grid-out');

  const getIcon = (type: string) => {
    switch (type) {
      case 'pv': return <Sun className="w-5 h-5" />;
      case 'storage': return <Battery className="w-5 h-5" />;
      case 'charging': return <Zap className="w-5 h-5" />;
      case 'grid-combined': return <Globe className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'pv': return '光伏发电';
      case 'storage': return '储能系统';
      case 'charging': return '充电桩';
      case 'grid-combined': return '公共电网';
      default: return '未知';
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'pv': return 'bg-amber-50 text-amber-500';
      case 'storage': return 'bg-blue-50 text-blue-500';
      case 'charging': return 'bg-indigo-50 text-indigo-500';
      case 'grid-combined': return 'bg-emerald-50 text-emerald-500';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getValueByTab = (stat: EnergyStat) => {
    if (activeTab === 'today') return stat.todayValue;
    if (activeTab === 'yesterday') return stat.yesterdayValue;
    return stat.totalValue;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          充放电量统计 <ChevronRight className="w-4 h-4 text-slate-400" />
        </h2>
        <div className="flex p-1 bg-slate-100 rounded-lg">
          {(['today', 'yesterday', 'total'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {tab === 'today' ? '今日' : tab === 'yesterday' ? '昨日' : '累计'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        {regularStats.map((stat) => (
          <div key={stat.type} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${getColorClass(stat.type)}`}>
                  {getIcon(stat.type)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{getLabel(stat.type)}</div>
                  <div className="text-[10px] text-slate-400">
                    {activeTab === 'today' ? '当日实时' : activeTab === 'yesterday' ? '昨日结转' : '历史累计'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-800">
                  {getValueByTab(stat)} <span className="text-xs font-normal text-slate-400">{stat.unit}</span>
                </div>
                <div className={`text-[10px] flex items-center justify-end gap-0.5 ${stat.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stat.trend)}%
                </div>
              </div>
            </div>

            {stat.type === 'storage' && stat.subValue ? (
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 px-0.5 font-bold">
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> 充: {stat.subValue.charge} kWh</span>
                  <span className="flex items-center gap-1">放: {stat.subValue.discharge} kWh <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div></span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-blue-400 h-full" style={{ width: '45%' }}></div>
                  <div className="bg-blue-600 h-full ml-auto" style={{ width: '50%' }}></div>
                </div>
              </div>
            ) : (
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                <div className={`h-full transition-all duration-1000 ${
                  stat.type === 'pv' ? 'bg-amber-400' : 'bg-indigo-400'
                }`} style={{ width: `${Math.min(100, (getValueByTab(stat)/500)*100)}%` }}></div>
              </div>
            )}
          </div>
        ))}

        {(gridIn || gridOut) && (
          <div className="group cursor-pointer pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${getColorClass('grid-combined')}`}>
                  {getIcon('grid-combined')}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{getLabel('grid-combined')}</div>
                  <div className="text-[10px] text-slate-400">电网双向能流</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-400">能效平衡态</div>
                <div className="text-[10px] text-emerald-500 font-bold">系统运行稳定</div>
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-slate-500 px-0.5 font-bold">
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> 上网: {activeTab === 'today' ? gridIn?.todayValue : activeTab === 'yesterday' ? gridIn?.yesterdayValue : gridIn?.totalValue} kWh</span>
                <span className="flex items-center gap-1">下网: {activeTab === 'today' ? gridOut?.todayValue : activeTab === 'yesterday' ? gridOut?.yesterdayValue : gridOut?.totalValue} kWh <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div></span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, ((getValueByTab(gridIn!))/60)*100)}%` }}></div>
                <div className="bg-slate-400 h-full ml-auto" style={{ width: `${Math.min(100, ((getValueByTab(gridOut!))/60)*100)}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-5 border-t border-slate-50">
        <div className="flex justify-between items-center text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400">总用电负荷</span>
            <span className="text-slate-700 font-bold">1289 kWh</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-slate-400">自发自用率</span>
            <span className="text-emerald-600 font-bold">82.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

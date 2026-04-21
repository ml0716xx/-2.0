
import React from 'react';
import { ChevronRight, ArrowUpRight, Sun, Battery, Zap } from 'lucide-react';
import { RevenueStat } from '../types';

interface RevenueCardProps {
  revenue: RevenueStat;
  activeTab: 'today' | 'yesterday' | 'total';
  onTabChange: (tab: 'today' | 'yesterday' | 'total') => void;
}

const RevenueCard: React.FC<RevenueCardProps> = ({ revenue, activeTab, onTabChange }) => {
  const getDisplayRevenue = () => {
    if (activeTab === 'today') return revenue.today;
    if (activeTab === 'yesterday') return revenue.yesterday;
    return revenue.total;
  };

  const getLabel = () => {
    if (activeTab === 'today') return '当日实时';
    if (activeTab === 'yesterday') return '昨日结转';
    return '历史累计';
  };

  // 模拟不同时间维度的详细拆分 (实际项目中应从 API 获取)
  const getBreakdownValue = (base: number) => {
    if (activeTab === 'today') return base.toFixed(1);
    if (activeTab === 'yesterday') return (base * 0.95).toFixed(1);
    return (base * 120).toFixed(1); // 模拟累计数据
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col flex-1 border-t-4 border-emerald-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          收益概览 <ChevronRight className="w-4 h-4 text-slate-400" />
        </h2>
        {/* Tab 切换器 */}
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

      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{getLabel()}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900 font-mono transition-all">
            ¥{getDisplayRevenue().toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">收益额</span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {[
          { icon: <Sun className="w-4 h-4" />, label: '光伏收益', value: getBreakdownValue(revenue.breakdown.pv), color: 'text-amber-500' },
          { icon: <Battery className="w-4 h-4" />, label: '储能收益', value: getBreakdownValue(revenue.breakdown.storage), color: 'text-blue-500' },
          { icon: <Zap className="w-4 h-4" />, label: '充电收益', value: getBreakdownValue(revenue.breakdown.charging), color: 'text-indigo-500' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100/50 hover:border-slate-200">
            <div className="flex items-center gap-3">
              <span className={item.color}>{item.icon}</span>
              <span className="text-xs font-bold text-slate-600">{item.label}</span>
            </div>
            <span className="text-sm font-black text-slate-800 font-mono">¥{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueCard;

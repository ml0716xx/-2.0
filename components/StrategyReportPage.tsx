import React, { useState } from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Target, 
  Calendar,
  Zap,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Activity,
  Sun
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const dailyRevenueData = Array.from({ length: 31 }, (_, i) => {
  const base = Math.round(3000 + Math.random() * 1000);
  const hasAi = Math.random() > 0.15; // AI active 85% of days
  const aiBoost = hasAi ? Math.round(base * (0.25 + Math.random() * 0.25)) : 0; // AI boosts 25-50%
  return {
    day: `${i + 1}日`,
    traditional: base,
    aiBoost: aiBoost,
    actual: base + aiBoost
  };
});

const dailyPvConsumptionData = Array.from({ length: 31 }, (_, i) => {
  const traditional = 70 + Math.random() * 15; // 70-85%
  const aiBoost = Math.random() * 12; // 0-12%
  return {
    day: `${i + 1}日`,
    traditional: parseFloat(traditional.toFixed(1)),
    aiBoost: parseFloat(aiBoost.toFixed(1))
  };
});

const dailyEssBatteryData = Array.from({ length: 31 }, (_, i) => {
  const baseCharge = Math.round(500 + Math.random() * 200); // 500-700
  const baseDischarge = Math.round(baseCharge * 0.95); 
  
  const aiCharge = Math.round(baseCharge + 100 + Math.random() * 100);
  const aiDischarge = Math.round(aiCharge * 0.95);
  
  return {
    day: `${i + 1}日`,
    traditionalCharge: -baseCharge,
    traditionalDischarge: baseDischarge,
    aiCharge: -aiCharge,
    aiDischarge: aiDischarge
  };
});

const dailyChartDataMap: Record<string, any[]> = {};
for (let i = 1; i <= 31; i++) {
  const dayStr = `${i}日`;
  const data = [];
  
  // Deterministic variations based on day 'i'
  const baseCharge = -150 - (i % 3) * 30; // e.g., -150, -180, -210
  const aiChargeBoost = -50 - (i % 4) * 20; // e.g., -50, -70, -90, -110
  
  const baseDischarge = 150 + (i % 3) * 30; // e.g., 150, 180, 210
  const aiDischargeBoost = 50 + (i % 4) * 20; // e.g., 50, 70, 90, 110
  
  const actualChargeEnd = 3 + (i % 2); // 3 or 4
  const actualDischargeStart1 = 8 + (i % 2); // 8 or 9
  const actualDischargeStart2 = 18 + (i % 2); // 18 or 19
  
  for (let h = 0; h < 24; h++) {
    const time = `${h.toString().padStart(2, '0')}:00`;
    let price = 0.6;
    if (h >= 0 && h < 6) price = 0.3;
    if (h >= 21 && h < 24) price = 0.3;
    if (h >= 8 && h < 11) price = 1.2;
    if (h >= 17 && h < 21) price = 1.2;

    let actualBess = 0;
    let aiBess = 0;

    // Night Charging (00:00 - 05:00)
    if (h >= 0 && h < 6) {
      actualBess = h <= actualChargeEnd ? baseCharge : 0;
      aiBess = baseCharge + aiChargeBoost; // AI charges full low-price period
    }
    // Morning Discharging (08:00 - 10:00)
    else if (h >= 8 && h < 11) {
      actualBess = h >= actualDischargeStart1 ? baseDischarge : 0;
      aiBess = baseDischarge + aiDischargeBoost;
    }
    // Midday PV Charging (11:00 - 14:00)
    else if (h >= 11 && h <= 14) {
      actualBess = 0; // Actual doesn't do midday PV charging
      // AI does some PV charging depending on the day
      aiBess = (i % 2 === 0) ? (h === 12 || h === 13 ? -150 : -50) : (h === 12 ? -200 : 0);
    }
    // Evening Discharging (17:00 - 20:00)
    else if (h >= 17 && h < 21) {
      actualBess = h >= actualDischargeStart2 ? baseDischarge : 0;
      aiBess = baseDischarge + aiDischargeBoost; // AI starts right at 17:00
    }
    // Night Charging (21:00 - 23:00)
    else if (h >= 21 && h < 24) {
      actualBess = baseCharge;
      aiBess = baseCharge + aiChargeBoost;
    }

    data.push({ time, price, actualBess, aiBess });
  }
  data.push({ ...data[23], time: '23:59' });
  dailyChartDataMap[dayStr] = data;
}

const CustomDailyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const aiBess = payload.find((p: any) => p.dataKey === 'aiBess')?.value || 0;
    const actualBess = payload.find((p: any) => p.dataKey === 'actualBess')?.value || 0;
    const extra = Math.abs(aiBess) - Math.abs(actualBess);

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs z-50">
        <div className="font-bold text-slate-700 mb-2">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-600">{entry.name}</span>
            </div>
            <span className="font-bold" style={{ color: entry.color }}>
              {entry.value} {entry.name === '电价' ? '元/kWh' : 'kW'}
            </span>
          </div>
        ))}
        {extra > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-purple-600 font-bold flex justify-between">
            <span>AI 建议多{aiBess > 0 ? '放' : '充'}:</span>
            <span>{extra} kW {actualBess === 0 ? '(时段优化)' : '(功率提升)'}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const StrategyReportPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const getDailyLogs = (day: string) => {
    const dayNum = parseInt(day.replace('日', ''), 10) || 1;
    const baseCharge = -150 - (dayNum % 3) * 30; // e.g., -150, -180, -210
    const aiChargeBoost = -50 - (dayNum % 4) * 20; // e.g., -50, -70, -90, -110
    const baseDischarge = 150 + (dayNum % 3) * 30; // e.g., 150, 180, 210
    const aiDischargeBoost = 50 + (dayNum % 4) * 20; // e.g., 50, 70, 90, 110
    const actualChargeEnd = 3 + (dayNum % 2); // 3 or 4
    const actualDischargeStart1 = 8 + (dayNum % 2); // 8 or 9
    const actualDischargeStart2 = 18 + (dayNum % 2); // 18 or 19

    const logs = [
      {
        time: '00:00 - 06:00',
        type: '峰谷套利',
        originalAction: `00:00 - 0${actualChargeEnd}:00 充电 ${Math.abs(baseCharge)}kW`,
        aiAction: `00:00 - 06:00 充电 ${Math.abs(baseCharge + aiChargeBoost)}kW`,
        aiImpact: `+¥${120 + (dayNum % 5) * 10}`,
        aiDiff: `延长充电并提升功率`,
        desc: '电价谷时段，执行储能充电'
      },
      {
        time: '08:00 - 11:00',
        type: '峰谷套利',
        originalAction: `0${actualDischargeStart1}:00 - 11:00 放电 ${Math.abs(baseDischarge)}kW`,
        aiAction: `08:00 - 11:00 放电 ${Math.abs(baseDischarge + aiDischargeBoost)}kW`,
        aiImpact: `+¥${150 + (dayNum % 4) * 15}`,
        aiDiff: `提前放电并提升功率`,
        desc: '早高峰高电价时段，执行储能放电'
      }
    ];

    if (dayNum % 2 === 0) {
      logs.push({
        time: '11:00 - 14:00',
        type: '全额消纳',
        originalAction: '无动作',
        aiAction: '智能匹配光伏余电充电',
        aiImpact: `+¥${80 + (dayNum % 3) * 15}`,
        aiDiff: '新增消纳动作',
        desc: '预测光伏大发，提前消纳防逆流'
      });
    }

    logs.push(
      {
        time: '17:00 - 21:00',
        type: '峰谷套利',
        originalAction: `${actualDischargeStart2}:00 - 21:00 放电 ${Math.abs(baseDischarge)}kW`,
        aiAction: `17:00 - 21:00 放电 ${Math.abs(baseDischarge + aiDischargeBoost)}kW`,
        aiImpact: `+¥${180 + (dayNum % 4) * 20}`,
        aiDiff: `提前放电并提升功率`,
        desc: '晚高峰高电价时段，执行储能放电'
      },
      {
        time: '21:00 - 24:00',
        type: '峰谷套利',
        originalAction: `21:00 - 24:00 充电 ${Math.abs(baseCharge)}kW`,
        aiAction: `21:00 - 24:00 充电 ${Math.abs(baseCharge + aiChargeBoost)}kW`,
        aiImpact: `+¥${50 + (dayNum % 2) * 10}`,
        aiDiff: `提升充电功率`,
        desc: '夜间谷时段，执行储能充电'
      }
    );

    return logs;
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">月度微电网策略运行 & 收益报告</h1>
          <p className="text-sm text-slate-500">全面分析微电网各元子策略的执行情况及 AI 算法带来的收益提升</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16 text-blue-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-600">储能充放总收益</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">¥125,400</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-500" /> 
            <span className="text-emerald-500 font-medium">+12.5%</span> 环比上月
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-16 h-16 text-amber-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-600">AI 策略提升收益</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">¥18,200</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            与传统一充一放模式进行对比。
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sun className="w-16 h-16 text-indigo-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Sun className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-600">绿电自发自用率提升</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">+15.4%</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            精准调度余电上网，减少弃光，转化为内部价值。
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col gap-6">

        <div className="flex flex-col gap-6">
          
            {/* AI Revenue Simulation */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-800">本月 AI 策略收益统计</h3>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <span className="text-xs text-slate-400 mr-2">点击柱状图查看每日详情</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-slate-600 font-medium text-xs">传统模式收益</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span className="text-slate-600 font-medium text-xs">AI 提升收益</span>
                </div>
              </div>

              <div className="h-[250px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={{ stroke: '#94a3b8' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} interval="preserveStartEnd" />
                    <YAxis axisLine={{ stroke: '#94a3b8' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => `¥${val}`} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value: number, name: string) => {
                        const displayNames: Record<string, string> = { traditional: '传统模式收益', aiBoost: 'AI 提升收益', actual: '实际总收益' };
                        return [`¥${value.toLocaleString()}`, displayNames[name] || name];
                      }}
                    />
                    <Bar dataKey="traditional" stackId="a" fill="#3b82f6" onClick={(data) => setSelectedDay(data.day)} cursor="pointer" />
                    <Bar dataKey="aiBoost" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} onClick={(data) => setSelectedDay(data.day)} cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                <div className="bg-blue-100 p-1.5 rounded-lg mt-0.5 shrink-0">
                  <BrainCircuit className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-0.5 text-xs">AI 策略价值验证</h4>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    本月依靠高精度的曲线预测，AI 算法成功规避了 12 次潜在的超容风险，并在电价波谷期增加了 15% 的储能充电深度，相较于传统的固定充放控制，整体经济效益得到极大跃升。
                  </p>
                </div>
              </div>
            </div>

            {/* 本月 AI 策略光伏消纳率统计 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-800">本月 AI 策略光伏消纳率统计</h3>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-400"></div>
                  <span className="text-slate-600 font-medium text-xs">传统模式消纳率</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span className="text-slate-600 font-medium text-xs">AI 策略提升率</span>
                </div>
              </div>

              <div className="h-[250px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyPvConsumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={{ stroke: '#94a3b8' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} interval="preserveStartEnd" />
                    <YAxis axisLine={{ stroke: '#94a3b8' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value: number, name: string) => {
                        const displayNames: Record<string, string> = { traditional: '传统模式消纳率', aiBoost: 'AI 策略提升率' };
                        return [`${value}%`, displayNames[name] || name];
                      }}
                    />
                    <Bar dataKey="traditional" stackId="a" fill="#fbbf24" />
                    <Bar dataKey="aiBoost" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 本月 AI 策略储能充放电量统计 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-800">本月 AI 策略储能充放电量统计</h3>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-300"></div>
                  <span className="text-slate-600 font-medium text-xs">传统模式充放电</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500"></div>
                  <span className="text-slate-600 font-medium text-xs">AI 策略充放电</span>
                </div>
              </div>

              <div className="h-[250px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyEssBatteryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={{ stroke: '#94a3b8' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} interval="preserveStartEnd" />
                    <YAxis axisLine={{ stroke: '#94a3b8' }} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => `${Math.abs(val)}`} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value: number, name: string) => {
                        const isCharge = value < 0;
                        const displayNames: Record<string, string> = { 
                          traditionalCharge: '传统模式充电', 
                          traditionalDischarge: '传统模式放电',
                          aiCharge: 'AI 策略充电',
                          aiDischarge: 'AI 策略放电'
                        };
                        return [`${Math.abs(value)} kWh`, displayNames[name] || name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(value) => {
                       const nameMap:any = { traditionalCharge: '传统模式充电', traditionalDischarge: '传统模式放电', aiCharge: 'AI 策略充电', aiDischarge: 'AI 策略放电'};
                       return nameMap[value];
                    }} />
                    <Bar dataKey="traditionalDischarge" stackId="traditional" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="traditionalCharge" stackId="traditional" fill="#93c5fd" />
                    
                    <Bar dataKey="aiDischarge" stackId="ai" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="aiCharge" stackId="ai" fill="#818cf8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
        </div>

        {/* Daily Strategy Details Row */}
          {selectedDay && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-bold text-slate-800">每日策略运行详情</h2>
                  <input
                    type="date"
                    value={`${selectedMonth}-${selectedDay.replace('日', '').padStart(2, '0')}`}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      if (newDate) {
                        const [year, month, day] = newDate.split('-');
                        setSelectedMonth(`${year}-${month}`);
                        setSelectedDay(`${parseInt(day, 10)}日`);
                      }
                    }}
                    className="ml-2 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-md outline-none cursor-pointer border border-indigo-100 hover:bg-indigo-100 transition-colors"
                  />
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="text-sm text-slate-400 hover:text-slate-600 font-medium"
                >
                  关闭
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  策略运行监控图表
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyChartDataMap[selectedDay || '1日']} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <pattern id="aiPattern" patternUnits="userSpaceOnUse" width="6" height="6">
                          <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4" />
                        </pattern>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={{ stroke: '#94a3b8' }}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        ticks={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={{ stroke: '#94a3b8' }}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        domain={[-400, 400]}
                        ticks={[-400, -200, 0, 200, 400]}
                        label={{ value: '功率(kW)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, offset: 10 }}
                        width={45}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={{ stroke: '#94a3b8' }}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        domain={[0, 1.5]}
                        ticks={[0, 0.5, 1.0, 1.5]}
                        label={{ value: '电价(元)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10, offset: 10 }}
                        width={40}
                      />
                      <Tooltip content={<CustomDailyTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      
                      <Area 
                        yAxisId="left"
                        type="stepAfter" 
                        dataKey="aiBess" 
                        name="AI 策略储能功率" 
                        fill="url(#aiPattern)" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      
                      <Area 
                        yAxisId="left"
                        type="stepAfter" 
                        dataKey="actualBess" 
                        name="传统模式" 
                        fill="#3b82f6" 
                        fillOpacity={0.8}
                        stroke="#2563eb" 
                        strokeWidth={2}
                      />

                      <Line 
                        yAxisId="right"
                        type="stepAfter" 
                        dataKey="price" 
                        name="电价" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-2">
                  <div className="text-[10px] text-slate-500 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'repeating-linear-gradient(45deg, #8b5cf6 0, #8b5cf6 1px, transparent 1px, transparent 4px)', opacity: 0.6 }}></div>
                    <span>阴影部分为 AI 建议可多充/多放的优化空间（含功率提升与时段优化）</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto flex-1 mb-4">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  综合策略运行与 AI 优化日志
                </h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="p-3 font-bold text-slate-500 text-xs rounded-tl-lg w-32">执行时间</th>
                      <th className="p-3 font-bold text-slate-500 text-xs w-24">策略类型</th>
                      <th className="p-3 font-bold text-slate-500 text-xs w-48">传统模式</th>
                      <th className="p-3 font-bold text-purple-600 text-xs bg-purple-50/50 w-48">AI 策略动作</th>
                      <th className="p-3 font-bold text-emerald-600 text-xs w-32">优化效果预估</th>
                      <th className="p-3 font-bold text-slate-500 text-xs rounded-tr-lg">触发原因/描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDailyLogs(selectedDay).map((log, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-xs font-medium text-slate-700">{log.time}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.type === '峰谷套利' ? 'bg-blue-50 text-blue-600' :
                            log.type === '需量控制' ? 'bg-red-50 text-red-600' :
                            log.type === '全额消纳' ? 'bg-amber-50 text-amber-600' :
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-slate-600">{log.originalAction}</td>
                        <td className={`p-3 text-xs font-medium ${log.aiImpact !== '-' ? 'text-purple-700 bg-purple-50/30' : 'text-slate-500'}`}>
                          {log.aiAction}
                        </td>
                        <td className={`p-3 text-xs font-bold ${log.aiImpact !== '-' ? 'text-emerald-600' : 'text-slate-400 font-normal'}`}>
                          <div className="flex flex-col">
                            <span>{log.aiImpact}</span>
                            {log.aiImpact !== '-' && <span className="text-[10px] text-slate-400 font-normal mt-0.5">{log.aiDiff}</span>}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-slate-500">{log.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      </div>
    </div>
  );
};

export default StrategyReportPage;

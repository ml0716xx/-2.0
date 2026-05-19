import React, { useState } from "react";
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
  Sun,
} from "lucide-react";

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
  Line,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const dailyRevenueData = Array.from({ length: 31 }, (_, i) => {
  const base = Math.round(3000 + Math.random() * 1000);
  const hasAi = Math.random() > 0.15; // AI active 85% of days
  const aiBoost = hasAi ? Math.round(base * (0.25 + Math.random() * 0.25)) : 0; // AI boosts 25-50%
  return {
    day: `${i + 1}日`,
    traditional: base,
    aiBoost: aiBoost,
    actual: base + aiBoost,
    hasAi: hasAi,
    aiMarker: hasAi ? (base + aiBoost + 500) : 0,
  };
});

const dailyPvConsumptionData = Array.from({ length: 31 }, (_, i) => {
  const traditional = 70 + Math.random() * 15; // 70-85%
  const hasAi = dailyRevenueData[i].hasAi; // Keep consistency
  const aiBoost = hasAi ? (Math.random() * 12) : (Math.random() * 2);
  return {
    day: `${i + 1}日`,
    traditional: parseFloat(traditional.toFixed(1)),
    aiBoost: parseFloat(aiBoost.toFixed(1)),
    hasAi: hasAi,
    aiMarker: hasAi ? 102 : 0, // Above 100%
  };
});

const dailyEssBatteryData = Array.from({ length: 31 }, (_, i) => {
  const baseCharge = Math.round(500 + Math.random() * 200); // 500-700
  const baseDischarge = Math.round(baseCharge * 0.95);
  const hasAi = dailyRevenueData[i].hasAi;

  const aiCharge = hasAi ? Math.round(baseCharge + 100 + Math.random() * 100) : baseCharge;
  const aiDischarge = Math.round(aiCharge * 0.95);

  return {
    day: `${i + 1}日`,
    traditionalCharge: -baseCharge,
    traditionalDischarge: baseDischarge,
    aiCharge: -aiCharge,
    aiDischarge: aiDischarge,
    hasAi: hasAi,
    aiMarker: hasAi ? (aiDischarge + 100) : 0,
  };
});

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, index } = props;
  // All three data arrays have the same 'hasAi' status for the same day index
  const hasAi = dailyRevenueData[index]?.hasAi;
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill={hasAi ? "#8b5cf6" : "#64748b"}
        className="text-[10px] font-medium"
        style={{ fontWeight: hasAi ? "800" : "500" }}
      >
        {payload.value}
      </text>
    </g>
  );
};

const StrategyReportPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [selectedDay, setSelectedDay] = useState<string | null>("6日");

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-slate-50 space-y-4 sm:space-y-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 shrink-0">
        <div className="flex sm:items-center flex-col sm:flex-row gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            策略排期
          </h1>
          <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-slate-700 w-28 cursor-pointer"
            />
          </div>
        </div>
        <div>
          <button className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-md transition-colors hidden sm:block">
            批量操作
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 shrink-0">
        {/* Top Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">本月收益</p>
            <h3 className="text-2xl font-black text-slate-800">¥ 125,430</h3>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3 h-3" />
              较固定策略 +14.5%
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">AI 提升收益</p>
            <h3 className="text-2xl font-black text-emerald-600">¥ 18,240</h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              由动态峰谷套利贡献
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">AI 策略运行时长占比</p>
            <h3 className="text-2xl font-black text-indigo-600">92.4%</h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              本月累计运行 665.2 小时
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">光伏消纳率</p>
            <h3 className="text-2xl font-black text-slate-800">98.5%</h3>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3 h-3" />
              AI 优化 +8.2%
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
            <Sun className="w-6 h-6" />
          </div>
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
                <h3 className="text-lg font-bold text-slate-800">
                  本月 AI 策略收益统计
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              <span className="text-xs text-slate-400 mr-2">
                点击柱状图查看每日详情
              </span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-slate-600 font-medium text-xs">
                  传统模式收益
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                <span className="text-slate-600 font-medium text-xs">
                  AI 提升收益
                </span>
              </div>
            </div>

            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyRevenueData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />
                  <YAxis
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(val) => `¥${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "aiMarker") return null;
                      const displayNames: Record<string, string> = {
                        traditional: "传统模式收益",
                        aiBoost: "AI 提升收益",
                        actual: "实际总收益",
                      };
                      return [
                        `¥${value.toLocaleString()}`,
                        displayNames[name] || name,
                      ];
                    }}
                  />
                  <Bar
                    dataKey="traditional"
                    stackId="a"
                    fill="#3b82f6"
                    onClick={(data) => setSelectedDay(data.day)}
                    cursor="pointer"
                  />
                  <Bar
                    dataKey="aiBoost"
                    stackId="a"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => setSelectedDay(data.day)}
                    cursor="pointer"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>


          </div>

          {/* 本月 AI 策略光伏消纳率统计 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-800">
                  本月 AI 策略光伏消纳率统计
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-400"></div>
                <span className="text-slate-600 font-medium text-xs">
                  传统模式消纳率
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-slate-600 font-medium text-xs">
                  AI 策略提升率
                </span>
              </div>
            </div>

            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyPvConsumptionData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />
                  <YAxis
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(val) => `${val}%`}
                    domain={[0, 110]}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "aiMarker") return null;
                      const displayNames: Record<string, string> = {
                        traditional: "传统模式消纳率",
                        aiBoost: "AI 策略提升率",
                      };
                      return [`${value}%`, displayNames[name] || name];
                    }}
                  />
                  <Bar dataKey="traditional" stackId="a" fill="#fbbf24" />
                  <Bar
                    dataKey="aiBoost"
                    stackId="a"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 本月 AI 策略储能充放电对比 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-800">
                  本月 AI 策略储能充放电对比
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-sm bg-[#fbbf24]"></div>
                  <div className="w-3 h-1.5 rounded-sm bg-[#93c5fd]"></div>
                  <span className="text-slate-500 font-medium text-[11px]">
                    传统模式 (放/充)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-sm bg-[#f59e0b]"></div>
                  <div className="w-3 h-1.5 rounded-sm bg-[#2563eb]"></div>
                  <span className="text-indigo-600 font-bold text-[11px]">
                    AI 优化模式 (放/充)
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyEssBatteryData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={<CustomXAxisTick />}
                    interval={0}
                  />
                  <YAxis
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(val) => `${Math.abs(val)}`}
                    label={{
                      value: "电量 (kWh)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#94a3b8",
                      fontSize: 10,
                      offset: 15,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "aiMarker") return null;
                      const displayNames: Record<string, string> = {
                        traditionalCharge: "传统模式充电",
                        traditionalDischarge: "传统模式放电",
                        aiCharge: "AI 策略充电",
                        aiDischarge: "AI 策略放电",
                      };
                      return [
                        `${Math.abs(value).toLocaleString()} kWh`,
                        displayNames[name] || name,
                      ];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ paddingTop: "20px", fontSize: "11px" }}
                    formatter={(value) => {
                      const nameMap: any = {
                        traditionalCharge: "传统充电",
                        traditionalDischarge: "传统放电",
                        aiCharge: "AI充电",
                        aiDischarge: "AI放电",
                      };
                      return <span className="text-slate-600 font-bold">{nameMap[value] || value}</span>;
                    }}
                  />
                  <Bar
                    dataKey="traditionalDischarge"
                    name="traditionalDischarge"
                    fill="#fbbf24"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="traditionalCharge"
                    name="traditionalCharge"
                    fill="#93c5fd"
                    radius={[0, 0, 2, 2]}
                  />

                  <Bar
                    dataKey="aiDischarge"
                    name="aiDischarge"
                    fill="#f59e0b"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="aiCharge" 
                    name="aiCharge"
                    fill="#2563eb" 
                    radius={[0, 0, 2, 2]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyReportPage;

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
  Settings,
  Download,
  Loader2,
  X,
  AlertCircle,
  FileSpreadsheet,
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
  ReferenceArea,
  ReferenceLine,
} from "recharts";

import StrategyConfigModal from "./StrategyConfigModal";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const dailyRevenueData = Array.from({ length: 31 }, (_, i) => {
  const base = Math.round(3000 + Math.random() * 1000);
  const hasAi = (i + 1) % 6 !== 0; // Predictable non-AI days (e.g. days 6, 12, 18, 24, 30)
  const aiBoost = hasAi ? Math.round(base * (0.25 + Math.random() * 0.15)) : 0;
  return {
    day: `${i + 1}日`,
    hasAi: hasAi,
    // When AI is active: show "基础策略收益" (base) and "AI 提升收益" (aiBoost)
    baseRevenue: hasAi ? base : null,
    aiBoost: hasAi ? aiBoost : null,
    // When AI is inactive: show only "实际收益" (base)
    actualRevenue: !hasAi ? base : null,
    totalActual: base + aiBoost,
  };
});

const dailyPvConsumptionData = Array.from({ length: 31 }, (_, i) => {
  const traditional = 70 + Math.random() * 15; // 70-85%
  const hasAi = dailyRevenueData[i].hasAi;
  const aiBoost = hasAi ? parseFloat((Math.random() * 8 + 5).toFixed(1)) : 0;
  return {
    day: `${i + 1}日`,
    hasAi: hasAi,
    // When AI is active: show "基础策略消纳率" and "AI 策略提升率"
    basePv: hasAi ? parseFloat(traditional.toFixed(1)) : null,
    aiPvBoost: hasAi ? aiBoost : null,
    // When AI is inactive: show only "实际消纳率"
    actualPv: !hasAi ? parseFloat(traditional.toFixed(1)) : null,
    totalPv: parseFloat((traditional + aiBoost).toFixed(1)),
  };
});

const dailyEssBatteryData = Array.from({ length: 31 }, (_, i) => {
  const baseCharge = Math.round(500 + Math.random() * 200); // 500-700
  const baseDischarge = Math.round(baseCharge * 0.95);
  const hasAi = dailyRevenueData[i].hasAi;

  const aiCharge = hasAi ? Math.round(baseCharge + 120 + Math.random() * 80) : baseCharge;
  const aiDischarge = Math.round(aiCharge * 0.95);

  return {
    day: `${i + 1}日`,
    hasAi: hasAi,
    // When AI is active: split into baseline and AI boost
    baseDischarge: hasAi ? baseDischarge : null,
    aiDischargeBoost: hasAi ? (aiDischarge - baseDischarge) : null,
    baseCharge: hasAi ? -baseCharge : null,
    aiChargeBoost: hasAi ? -(aiCharge - baseCharge) : null,
    // When AI is inactive: actual values
    actualDischarge: !hasAi ? baseDischarge : null,
    actualCharge: !hasAi ? -baseCharge : null,
  };
});

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, index } = props;
  const hasAi = dailyRevenueData[index]?.hasAi;
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill={hasAi ? "#6366f1" : "#94a3b8"}
        className="text-[10px]"
        style={{ fontWeight: hasAi ? "800" : "500" }}
      >
        {payload.value}
      </text>
    </g>
  );
};

const StrategyReportPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [selectedDay, setSelectedDay] = useState<string | null>("15日");
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  // Custom states for curtailment loss mitigation evaluation
  const [hasCurtailmentPermission, setHasCurtailmentPermission] = useState<boolean>(true);
  const [selectedCurtailDay, setSelectedCurtailDay] = useState<string>("15日");
  const [isCurtailModalOpen, setIsCurtailModalOpen] = useState<boolean>(false);
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);
  const [showExportToast, setShowExportToast] = useState<boolean>(false);

  // Daily curtailment assessment dataset for Hebei user-side microgrid (July 2026)
  const curtailmentDataList = [
    { day: "1日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "2日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "3日", lossSaved: 120, curtailedEnergy: 10.5 },
    { day: "4日", lossSaved: 85, curtailedEnergy: 7.2 },
    { day: "5日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "6日", lossSaved: 200, curtailedEnergy: 16.8 },
    { day: "7日", lossSaved: 180, curtailedEnergy: 15.2 },
    { day: "8日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "9日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "10日", lossSaved: 240, curtailedEnergy: 20.1 },
    { day: "11日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "12日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "13日", lossSaved: 150, curtailedEnergy: 12.5 },
    { day: "14日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "15日", lossSaved: 580, curtailedEnergy: 48.5 }, // Target day for deep-dive
    { day: "16日", lossSaved: 320, curtailedEnergy: 26.8 },
    { day: "17日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "18日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "19日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "20日", lossSaved: 110, curtailedEnergy: 9.4 },
    { day: "21日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "22日", lossSaved: 95, curtailedEnergy: 8.1 },
    { day: "23日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "24日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "25日", lossSaved: 280, curtailedEnergy: 23.5 },
    { day: "26日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "27日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "28日", lossSaved: 140, curtailedEnergy: 11.8 },
    { day: "29日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "30日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "31日", lossSaved: 0, curtailedEnergy: 0 },
  ];

  // Dynamically generates 96 points trend for the selected day
  const get96PointsForDay = (day: string) => {
    const dayNum = parseInt(day) || 15;
    const points = [];
    
    const is15 = dayNum === 15;
    const is16 = dayNum === 16;
    const hasCurtailment = [3, 4, 6, 7, 10, 13, 15, 16, 20, 22, 25, 28].includes(dayNum);
    
    // Exact target totals
    const targetCurtail = is15 ? 48.5 : (is16 ? 26.8 : (hasCurtailment ? 15.0 : 0));
    const targetLossSaved = is15 ? 580 : (is16 ? 320 : (hasCurtailment ? 120 : 0));
    
    const curtailStartIdx = 44; // 11:00
    const curtailEndIdx = 56;   // 14:00
    
    for (let i = 0; i < 96; i++) {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Solar profile (represented as 15min energy in kWh, i.e., Power (kW) * 0.25h)
      let theoreticalGen = 0;
      if (i >= 24 && i <= 72) { // 06:00 to 18:00
        const angle = ((i - 24) / 48) * Math.PI;
        theoreticalGen = (Math.sin(angle) * (is15 ? 45 : 30) + Math.random() * 1.5) / 4;
      }
      theoreticalGen = parseFloat(Math.max(0, theoreticalGen).toFixed(2));
      
      let actualGen = theoreticalGen;
      let curtailedGen = 0;
      let tariff = 0.35;
      let lossSaved = 0;
      
      if (hasCurtailment && i >= curtailStartIdx && i <= curtailEndIdx) {
        tariff = -0.25; // Negative feed-in tariff
        
        const angle = ((i - 24) / 48) * Math.PI;
        const weight = Math.sin(angle);
        
        let sumWeights = 0;
        for (let k = curtailStartIdx; k <= curtailEndIdx; k++) {
          sumWeights += Math.sin(((k - 24) / 48) * Math.PI);
        }
        
        const share = weight / sumWeights;
        curtailedGen = parseFloat((targetCurtail * share).toFixed(2));
        actualGen = parseFloat(Math.max(0, theoreticalGen - curtailedGen).toFixed(2));
        curtailedGen = parseFloat((theoreticalGen - actualGen).toFixed(2));
        lossSaved = parseFloat((targetLossSaved * share).toFixed(1));
      } else {
        if ((hour >= 8 && hour < 11) || (hour >= 18 && hour < 22)) {
          tariff = 0.85;
        } else if (hour >= 23 || hour < 7) {
          tariff = 0.25;
        } else {
          tariff = 0.45;
        }
      }
      
      points.push({
        time: timeStr,
        theoreticalGen,
        actualGen: parseFloat(actualGen.toFixed(2)),
        curtailedGen: parseFloat(curtailedGen.toFixed(2)),
        tariff,
        lossSaved: parseFloat(lossSaved.toFixed(1)),
      });
    }
    
    return points;
  };

  // Custom states for simulations & scenarios
  const [userAiStatus, setUserAiStatus] = useState<"activated" | "not_activated">("activated");
  const [enableSimulation, setEnableSimulation] = useState(false);
  const [unactivatedSimulated, setUnactivatedSimulated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Trigger simulated backtest
  const handleRunUnactivatedSimulation = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setUnactivatedSimulated(true);
    }, 1200);
  };

  // 1. Dynamic tick renderer that accesses the state variables
  const DynamicXAxisTick = (props: any) => {
    const { x, y, payload, index } = props;
    
    let isPurple = false;
    if (userAiStatus === "activated") {
      isPurple = dailyRevenueData[index]?.hasAi || enableSimulation;
    } else {
      isPurple = unactivatedSimulated;
    }
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={14}
          textAnchor="middle"
          fill={isPurple ? "#6366f1" : "#94a3b8"}
          className="text-[10px]"
          style={{ fontWeight: isPurple ? "800" : "500" }}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // 2. Data Mappings for Charts
  const chartRevenueData = dailyRevenueData.map((d, i) => {
    const originalBase = d.hasAi ? d.baseRevenue! : d.actualRevenue!;
    
    if (userAiStatus === "not_activated") {
      if (unactivatedSimulated) {
        return {
          day: d.day,
          isSimulatedDay: true,
          simulatedBaseRevenue: originalBase,
          simulatedAiBoost: Math.round(originalBase * 0.201),
          hasAi: true,
        };
      } else {
        return {
          day: d.day,
          isSimulatedDay: false,
          actualRevenue: originalBase,
          hasAi: false,
        };
      }
    } else {
      if (enableSimulation) {
        if (d.hasAi) {
          return {
            day: d.day,
            isSimulatedDay: false,
            baseRevenue: d.baseRevenue,
            aiBoost: d.aiBoost,
            hasAi: true,
          };
        } else {
          return {
            day: d.day,
            isSimulatedDay: true,
            simulatedBaseRevenue: originalBase,
            simulatedAiBoost: Math.round(originalBase * 0.32),
            hasAi: true,
          };
        }
      } else {
        return {
          day: d.day,
          isSimulatedDay: false,
          baseRevenue: d.baseRevenue,
          aiBoost: d.aiBoost,
          actualRevenue: d.actualRevenue,
          hasAi: d.hasAi,
        };
      }
    }
  });

  const chartPvData = dailyPvConsumptionData.map((d, i) => {
    const originalBase = d.hasAi ? d.basePv! : d.actualPv!;
    
    if (userAiStatus === "not_activated") {
      if (unactivatedSimulated) {
        const stableBoost = parseFloat(((i % 4 + 7) + Math.sin(i) * 0.5).toFixed(1));
        return {
          day: d.day,
          isSimulatedDay: true,
          simulatedBasePv: originalBase,
          simulatedAiPvBoost: stableBoost,
          hasAi: true,
        };
      } else {
        return {
          day: d.day,
          isSimulatedDay: false,
          actualPv: originalBase,
          hasAi: false,
        };
      }
    } else {
      if (enableSimulation) {
        if (d.hasAi) {
          return {
            day: d.day,
            isSimulatedDay: false,
            basePv: d.basePv,
            aiPvBoost: d.aiPvBoost,
            hasAi: true,
          };
        } else {
          const stableBoost = parseFloat(((i % 4 + 7) + Math.sin(i) * 0.5).toFixed(1));
          return {
            day: d.day,
            isSimulatedDay: true,
            simulatedBasePv: originalBase,
            simulatedAiPvBoost: stableBoost,
            hasAi: true,
          };
        }
      } else {
        return {
          day: d.day,
          isSimulatedDay: false,
          basePv: d.basePv,
          aiPvBoost: d.aiPvBoost,
          actualPv: d.actualPv,
          hasAi: d.hasAi,
        };
      }
    }
  });

  const chartEssData = dailyEssBatteryData.map((d, i) => {
    const originalDischarge = d.hasAi ? d.baseDischarge! : d.actualDischarge!;
    const originalCharge = d.hasAi ? d.baseCharge! : d.actualCharge!;
    
    if (userAiStatus === "not_activated") {
      if (unactivatedSimulated) {
        const simDischargeBoost = Math.round(originalDischarge * 0.20);
        const simChargeBoost = -Math.round(Math.abs(originalCharge) * 0.20);
        return {
          day: d.day,
          isSimulatedDay: true,
          simulatedBaseDischarge: originalDischarge,
          simulatedAiDischargeBoost: simDischargeBoost,
          simulatedBaseCharge: originalCharge,
          simulatedAiChargeBoost: simChargeBoost,
          hasAi: true,
        };
      } else {
        return {
          day: d.day,
          isSimulatedDay: false,
          actualDischarge: originalDischarge,
          actualCharge: originalCharge,
          hasAi: false,
        };
      }
    } else {
      if (enableSimulation) {
        if (d.hasAi) {
          return {
            day: d.day,
            isSimulatedDay: false,
            baseDischarge: d.baseDischarge,
            aiDischargeBoost: d.aiDischargeBoost,
            baseCharge: d.baseCharge,
            aiChargeBoost: d.aiChargeBoost,
            hasAi: true,
          };
        } else {
          const simDischargeBoost = Math.round(originalDischarge * 0.20);
          const simChargeBoost = -Math.round(Math.abs(originalCharge) * 0.20);
          return {
            day: d.day,
            isSimulatedDay: true,
            simulatedBaseDischarge: originalDischarge,
            simulatedAiDischargeBoost: simDischargeBoost,
            simulatedBaseCharge: originalCharge,
            simulatedAiChargeBoost: simChargeBoost,
            hasAi: true,
          };
        }
      } else {
        return {
          day: d.day,
          isSimulatedDay: false,
          baseDischarge: d.baseDischarge,
          aiDischargeBoost: d.aiDischargeBoost,
          baseCharge: d.baseCharge,
          aiChargeBoost: d.aiChargeBoost,
          actualDischarge: d.actualDischarge,
          actualCharge: d.actualCharge,
          hasAi: d.hasAi,
        };
      }
    }
  });

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-slate-50 space-y-4 sm:space-y-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white px-6 py-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            策略排期
          </h1>
          
          {/* Demo state selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setUserAiStatus("activated");
                setEnableSimulation(false);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                userAiStatus === "activated"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              已激活 AI (本月部分未运行)
            </button>
            <button
              onClick={() => {
                setUserAiStatus("not_activated");
                setUnactivatedSimulated(false);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                userAiStatus === "not_activated"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              未开通 AI (营销测算演示)
            </button>
          </div>

          {/* Curtailment Permission Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setHasCurtailmentPermission(true)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                hasCurtailmentPermission
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="有权限查看限电评估模块"
            >
              限电止损评估: 有
            </button>
            <button
              onClick={() => setHasCurtailmentPermission(false)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                !hasCurtailmentPermission
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="无权限查看限电评估模块"
            >
              无
            </button>
          </div>

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
        
        <div className="flex items-center gap-2.5">
          {/* AI Simulation Toggle Switch */}
          {userAiStatus === "activated" && (
            <div 
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-all cursor-pointer select-none shadow-sm"
              onClick={() => setEnableSimulation(!enableSimulation)}
            >
              <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${enableSimulation ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${enableSimulation ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </div>
              <span className="text-xs font-bold text-slate-700">开启 AI 收益模拟</span>
            </div>
          )}


          
          <button 
            onClick={() => setShowConfigModal(true)}
            disabled={isAnalyzing}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-md transition-all shadow-sm ${
              isAnalyzing 
                ? "bg-indigo-500/80 text-white cursor-not-allowed opacity-90" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在进行模拟...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                策略配置
              </>
            )}
          </button>
        </div>
      </div>

      {/* CTA Conversion Banner for Unactivated but Simulated status */}
      {userAiStatus === "not_activated" && unactivatedSimulated && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 shadow-sm">
              💡
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-amber-800">
                本月若使用 AI 策略，预计可增加收益 ¥22,034！点击右侧按钮立即开启托管体验。
              </h4>
              <p className="text-xs text-amber-700/80">
                多源电力动态调配，充放电循环次数延长 15% 以上，光伏完全消纳提升 9.2%。
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowConfigModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold rounded-lg transition-all shadow-md shadow-orange-500/20 shrink-0 transform active:scale-95 flex items-center gap-1 justify-center"
          >
            立即开通 AI 策略体验版 <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Info Banner for Activated with Simulation ON */}
      {userAiStatus === "activated" && enableSimulation && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-extrabold text-base shrink-0 shadow-sm">
              📈
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-emerald-800">
                已成功开启 AI 收益模拟！系统已为您自动对本月 5 天未运行 AI 策略日期进行算法补全。
              </h4>
              <p className="text-xs text-emerald-700/80">
                补充收益采用算法预测回测计算，使您可以对比并直观量化 100% 满额托收下的最佳业绩。
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg inline-flex items-center justify-center self-start md:self-auto">
            已补全 5 天回测测算
          </div>
        </div>
      )}

      {/* MARKETING UNINITIALIZED STATE */}
      {userAiStatus === "not_activated" && !unactivatedSimulated && !isAnalyzing && (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.012)] text-center max-w-2xl mx-auto my-12 flex flex-col items-center gap-6 relative overflow-hidden shrink-0">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-50/50 rounded-full blur-2xl" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-50/50 rounded-full blur-2xl" />

          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-indigo-600 rounded-2xl flex items-center justify-center animate-bounce shadow-sm border border-indigo-500/5">
            <BrainCircuit className="w-9 h-9" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              您尚未开启 AI 智能调度策略
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
              利用前沿深度神经网络，AI 自动协同“分时电价、光伏消纳、用电负荷”，可智能规划最优充放排期，获取更多峰谷差收益。
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-left text-slate-600 space-y-2.5 max-w-md w-full">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>真实物理回测：</strong> 提取本月及历史负载和光伏曲线运行高精度算法复盘。</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>套利差价对比：</strong> 量化展示开通 AI 前后的充放电、光伏消纳和收益提升比。</span>
            </div>
          </div>

          <button
            onClick={handleRunUnactivatedSimulation}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group transform active:scale-95"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            📊 立即一键测算本月可提升多少收益
          </button>
        </div>
      )}

      {/* MARKETING LOADING STATE */}
      {userAiStatus === "not_activated" && !unactivatedSimulated && isAnalyzing && (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.012)] text-center max-w-md mx-auto my-12 flex flex-col items-center gap-6 shrink-0">
          <div className="w-12 h-12 border-4 border-indigo-600/15 border-t-indigo-600 rounded-full animate-spin" />
          <div className="space-y-3 w-full">
            <h4 className="text-base font-bold text-slate-800">
              AI 智能调度算法回测中...
            </h4>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '75%' }} />
            </div>
            <p className="text-xs text-slate-400 font-mono">
              [1/3] 正在加载本月 31 天分时电价及负载曲线...
            </p>
          </div>
        </div>
      )}

      {/* CORE STATS CARDS & DASHBOARD */}
      {((userAiStatus === "activated") || (userAiStatus === "not_activated" && unactivatedSimulated)) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 shrink-0">
            {/* Card 1: 本月收益 */}
            <div className="relative overflow-hidden bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.012)] border border-slate-100/80 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(37,99,235,0.06)] transition-all duration-300 group flex flex-col justify-between min-h-[175px]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">本月收益 / Revenue</span>
                    {userAiStatus === "not_activated" && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200/50 rounded text-[9px] font-extrabold animate-pulse">模拟测算</span>
                    )}
                    {userAiStatus === "activated" && enableSimulation && (
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded text-[9px] font-extrabold">含模拟</span>
                    )}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight font-sans selection:bg-blue-100">
                    {userAiStatus === "not_activated" ? "¥ 131,580" : (enableSimulation ? "¥ 131,250" : "¥ 125,430")}
                  </h3>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border border-blue-500/5 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white">
                  <BarChart3 className="w-7 h-7" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-500 font-bold bg-emerald-50/80 px-2.5 py-1 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {userAiStatus === "not_activated" ? "预计较基础 +20.1%" : (enableSimulation ? "较基础策略 +19.8%" : "较基础策略 +14.5%")}
                </span>
                <span className="text-slate-400 font-medium">基础: ¥109,546</span>
              </div>
            </div>
            
            {/* Card 2: AI 提升收益 */}
            <div className="relative overflow-hidden bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.012)] border border-slate-100/80 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,185,129,0.06)] transition-all duration-300 group flex flex-col justify-between min-h-[175px]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                      {userAiStatus === "not_activated" ? "本月预估可多赚 / ESTIMATED EXTRA" : "AI 提升收益 / AI Profit"}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {userAiStatus === "not_activated" && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200/50 rounded text-[9px] font-extrabold">模拟测算</span>
                    )}
                    {userAiStatus === "activated" && enableSimulation && (
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded text-[9px] font-extrabold">含模拟</span>
                    )}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight font-sans">
                    {userAiStatus === "not_activated" ? "¥ 22,034" : (enableSimulation ? "¥ 24,060" : "¥ 18,240")}
                  </h3>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border border-emerald-50/5 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white">
                  <BrainCircuit className="w-7 h-7" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-500 font-bold bg-emerald-50/80 px-2.5 py-1 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {userAiStatus === "not_activated" ? "预计多赚 20.1%" : (enableSimulation ? "AI 预估占比 18.3%" : "AI 贡献占比 14.5%")}
                </span>
                <span className="text-slate-400 font-medium">
                  {userAiStatus === "not_activated" ? "日均额外多赚: ¥710" : (enableSimulation ? "日均提升: ¥776" : "日均提升: ¥608")}
                </span>
              </div>
            </div>

            {/* Card 3: AI 策略运行时长 */}
            <div className="relative overflow-hidden bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.012)] border border-slate-100/80 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(99,102,241,0.06)] transition-all duration-300 group flex flex-col justify-between min-h-[175px]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">AI 策略运行时长 / Duty Cycle</span>
                    {userAiStatus === "not_activated" && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200/50 rounded text-[9px] font-extrabold animate-pulse">模拟测算</span>
                    )}
                    {userAiStatus === "activated" && enableSimulation && (
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded text-[9px] font-extrabold">含模拟</span>
                    )}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tracking-tight font-sans">
                    {userAiStatus === "not_activated" ? "100%" : (enableSimulation ? "100%" : "92.4%")}
                  </h3>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-indigo-600 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border border-indigo-50/5 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white">
                  <Clock className="w-7 h-7" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 animate-pulse" 
                    style={{ width: (userAiStatus === "not_activated" || enableSimulation) ? "100%" : "92.4%" }} 
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 text-indigo-500 font-bold bg-indigo-50/80 px-2.5 py-1 rounded-lg">
                    <Activity className="w-3.5 h-3.5" />
                    {userAiStatus === "not_activated" ? "预计全天候托管" : (enableSimulation ? "模拟已补全" : "高效调频运行")}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {userAiStatus === "not_activated" ? "预计运行 720.0 小时" : (enableSimulation ? "累计: 720.0 小时" : "累计: 665.2 小时")}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: 光伏消纳率 */}
            <div className="relative overflow-hidden bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.012)] border border-slate-100/80 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(245,158,11,0.06)] transition-all duration-300 group flex flex-col justify-between min-h-[175px]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">光伏消纳率 / Solar Absorption</span>
                    {userAiStatus === "not_activated" && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200/50 rounded text-[9px] font-extrabold animate-pulse">模拟测算</span>
                    )}
                    {userAiStatus === "activated" && enableSimulation && (
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded text-[9px] font-extrabold">含模拟</span>
                    )}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-amber-500 tracking-tight font-sans">
                    {userAiStatus === "not_activated" ? "98.6%" : (enableSimulation ? "99.1%" : "98.5%")}
                  </h3>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-500 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border border-amber-50/5 group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white">
                  <Sun className="w-7 h-7" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-500 font-bold bg-emerald-50/80 px-2.5 py-1 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {userAiStatus === "not_activated" ? "预计提升 +9.2%" : (enableSimulation ? "预计优化 +8.8%" : "AI 优化 +8.2%")}
                </span>
                <span className="text-slate-400 font-medium">
                  {userAiStatus === "not_activated" ? "基础消纳: 89.4%" : "基础消纳: 90.3%"}
                </span>
              </div>
            </div>
          </div>

          {/* MAIN CHARTS SECTION */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              {/* Chart 1: 本月运行策略收益统计 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold text-slate-800">
                      {userAiStatus === "not_activated" ? "本月 AI 策略模拟收益报告" : "本月运行策略收益统计"}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {/* Standard Legends */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-[#3b82f6]"></div>
                    <span className="text-slate-600 font-bold text-xs">
                      基础策略收益
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-[#10b981]"></div>
                    <span className="text-slate-600 font-bold text-xs">
                      AI 提升收益
                    </span>
                  </div>
                  
                  {/* Normal actual grey column (only display if not unactivated simulated) */}
                  {!(userAiStatus === "not_activated" && unactivatedSimulated) && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#94a3b8]"></div>
                      <span className="text-slate-600 font-bold text-xs">
                        实际收益 (未运行AI)
                      </span>
                    </div>
                  )}

                  {/* Simulated Legends */}
                  {((userAiStatus === "activated" && enableSimulation) || (userAiStatus === "not_activated" && unactivatedSimulated)) && (
                    <>
                      <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-[#93c5fd] border border-dashed border-[#3b82f6]"></div>
                        <span className="text-emerald-700 font-bold text-xs">
                          模拟基础收益 (回测)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-[#a7f3d0] border border-dashed border-[#10b981]"></div>
                        <span className="text-emerald-700 font-bold text-xs">
                          模拟 AI 提升 (回测)
                        </span>
                      </div>
                    </>
                  )}

                  <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                      {userAiStatus === "not_activated" ? "🟢 所有日期均已模拟运行" : "🟣 X轴紫字: 运行 AI 策略"}
                    </span>
                  </div>
                  {userAiStatus === "activated" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">⚪ X轴灰字: 未运行 AI 策略</span>
                    </div>
                  )}
                </div>

                <div className="h-[250px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartRevenueData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="day"
                        scale="band"
                        axisLine={{ stroke: "#94a3b8" }}
                        tickLine={false}
                        tick={<DynamicXAxisTick />}
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
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          const isSimulated = data.isSimulatedDay;
                          
                          return (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl min-w-[200px]">
                              <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2 pb-1 border-b border-slate-100">
                                <span>{label}</span>
                                {isSimulated && (
                                  <span className="bg-amber-50 text-amber-600 border border-amber-200/50 text-[9px] px-1.5 py-0.5 rounded">
                                    回测模拟数据
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {payload.map((item: any, idx: number) => {
                                  if (item.value === null || item.value === undefined) return null;
                                  
                                  let displayName = "";
                                  let color = "";
                                  
                                  if (item.dataKey === "baseRevenue") {
                                    displayName = "基础策略收益";
                                    color = "#3b82f6";
                                  } else if (item.dataKey === "aiBoost") {
                                    displayName = "AI 提升收益";
                                    color = "#10b981";
                                  } else if (item.dataKey === "actualRevenue") {
                                    displayName = "实际收益 (未运行AI)";
                                    color = "#94a3b8";
                                  } else if (item.dataKey === "simulatedBaseRevenue") {
                                    displayName = "模拟基础策略收益";
                                    color = "#3b82f6";
                                  } else if (item.dataKey === "simulatedAiBoost") {
                                    displayName = "模拟 AI 提升收益";
                                    color = "#10b981";
                                  } else {
                                    displayName = item.name;
                                    color = item.color || "#000000";
                                  }
                                  
                                  return (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <div 
                                          className={`w-2.5 h-2.5 rounded shrink-0 ${isSimulated && (item.dataKey.startsWith('simulated')) ? 'border border-dashed' : ''}`}
                                          style={{ backgroundColor: color, borderColor: isSimulated ? color : 'transparent' }}
                                        />
                                        <span className="text-slate-500 font-medium">{displayName}</span>
                                      </div>
                                      <span className="font-bold text-slate-700">
                                        ¥{Number(item.value).toLocaleString()}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }}
                      />
                      
                      {/* Base bars */}
                      <Bar dataKey="baseRevenue" stackId="revenueStack" fill="#3b82f6" cursor="pointer" />
                      <Bar dataKey="aiBoost" stackId="revenueStack" fill="#10b981" radius={[4, 4, 0, 0]} cursor="pointer" />
                      <Bar dataKey="actualRevenue" stackId="revenueStack" fill="#94a3b8" radius={[4, 4, 0, 0]} cursor="pointer" />
                      
                      {/* Simulated bars */}
                      <Bar 
                        dataKey="simulatedBaseRevenue" 
                        stackId="revenueStack" 
                        fill="#93c5fd" 
                        stroke="#3b82f6" 
                        strokeDasharray="3 3" 
                        strokeWidth={1}
                        cursor="pointer" 
                      />
                      <Bar 
                        dataKey="simulatedAiBoost" 
                        stackId="revenueStack" 
                        fill="#a7f3d0" 
                        stroke="#10b981" 
                        strokeDasharray="3 3" 
                        strokeWidth={1} 
                        radius={[4, 4, 0, 0]} 
                        cursor="pointer" 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: AI策略光伏数据评估 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col" id="chart-solar-and-curtailment">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-slate-800">
                      AI策略光伏数据评估
                    </h3>
                  </div>
                  {hasCurtailmentPermission && (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                      双轴安全防亏机制已运行
                    </span>
                  )}
                </div>

                {/* 指标标签行（4个或2个） */}
                <div className={`grid grid-cols-1 gap-4 mb-6 ${hasCurtailmentPermission ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
                  {/* KPI 1: 光伏消纳率 */}
                  <div className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between transition-colors">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">光伏消纳率</span>
                      <h4 className="text-xl font-black text-slate-800">85.2%</h4>
                    </div>
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                      <Sun className="w-5 h-5" />
                    </div>
                  </div>

                  {/* KPI 2: AI提升优化 */}
                  <div className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI提升优化</span>
                        <span className="text-[8px] text-slate-400 font-normal">较自定义策略</span>
                      </div>
                      <h4 className="text-xl font-black text-emerald-600">+3.2%</h4>
                    </div>
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  {hasCurtailmentPermission && (
                    <>
                      {/* KPI 3: 限电电量 - 新增 */}
                      <div className="bg-indigo-50/40 hover:bg-indigo-50/60 p-4 rounded-xl border border-indigo-100/50 flex items-center justify-between transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500/5 rounded-full translate-x-2 -translate-y-2 group-hover:scale-150 transition-transform" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">限电电量</span>
                            <span className="px-1 py-0.2 bg-indigo-100 text-indigo-700 rounded text-[7px] font-bold">Hebei-GCS</span>
                          </div>
                          <h4 className="text-xl font-black text-indigo-700">1,200 <span className="text-xs font-bold text-indigo-500">kWh</span></h4>
                        </div>
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-sm shadow-indigo-100">
                          <Zap className="w-5 h-5" />
                        </div>
                      </div>

                      {/* KPI 4: 负电价主动止损 - 新增 */}
                      <div className="bg-emerald-50/40 hover:bg-emerald-50/60 p-4 rounded-xl border border-emerald-100/50 flex items-center justify-between transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/5 rounded-full translate-x-2 -translate-y-2 group-hover:scale-150 transition-transform" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">负电价主动止损</span>
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded text-[7px] font-bold">防亏套利</span>
                          </div>
                          <h4 className="text-xl font-black text-emerald-600">¥580</h4>
                        </div>
                        <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-sm shadow-emerald-100">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 上图：光伏消纳率堆叠柱状（原有，不变） */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500">每日光伏消纳率趋势统计</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">1日 ~ 31日</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#fbbf24]"></div>
                      <span className="text-slate-600 font-bold text-xs">基础策略消纳率</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#f97316]"></div>
                      <span className="text-slate-600 font-bold text-xs">AI 策略提升率</span>
                    </div>
                    {!(userAiStatus === "not_activated" && unactivatedSimulated) && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-[#94a3b8]"></div>
                        <span className="text-slate-600 font-bold text-xs">实际消纳率 (未运行AI)</span>
                      </div>
                    )}
                    {((userAiStatus === "activated" && enableSimulation) || (userAiStatus === "not_activated" && unactivatedSimulated)) && (
                      <>
                        <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded bg-[#fef08a] border border-dashed border-[#eab308]"></div>
                          <span className="text-orange-700 font-bold text-xs">模拟基础消纳 (回测)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded bg-[#ffedd5] border border-dashed border-[#ea580c]"></div>
                          <span className="text-orange-700 font-bold text-xs">模拟 AI 提升率 (回测)</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={chartPvData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="day" scale="band" axisLine={{ stroke: "#94a3b8" }} tickLine={false} tick={<DynamicXAxisTick />} interval={0} />
                        <YAxis axisLine={{ stroke: "#94a3b8" }} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(val) => `${val}%`} domain={[0, 110]} />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const data = payload[0].payload;
                            const isSimulated = data.isSimulatedDay;
                            return (
                              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl min-w-[200px]">
                                <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2 pb-1 border-b border-slate-100">
                                  <span>{label}</span>
                                  {isSimulated && (
                                    <span className="bg-amber-50 text-amber-600 border border-amber-200/50 text-[9px] px-1.5 py-0.5 rounded">回测模拟数据</span>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  {payload.map((item: any, idx: number) => {
                                    if (item.value === null || item.value === undefined) return null;
                                    let displayName = item.dataKey === "basePv" ? "基础策略消纳率" : item.dataKey === "aiPvBoost" ? "AI 策略提升率" : item.dataKey === "actualPv" ? "实际消纳率 (未运行AI)" : item.dataKey === "simulatedBasePv" ? "模拟基础消纳率" : item.dataKey === "simulatedAiPvBoost" ? "模拟 AI 提升率" : item.name;
                                    let color = item.dataKey === "basePv" ? "#fbbf24" : item.dataKey === "aiPvBoost" ? "#f97316" : item.dataKey === "actualPv" ? "#94a3b8" : item.dataKey === "simulatedBasePv" ? "#fbbf24" : item.dataKey === "simulatedAiPvBoost" ? "#f97316" : item.color;
                                    return (
                                      <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                          <div className={`w-2.5 h-2.5 rounded shrink-0 ${isSimulated && item.dataKey.startsWith('simulated') ? 'border border-dashed' : ''}`} style={{ backgroundColor: color }} />
                                          <span className="text-slate-500 font-medium">{displayName}</span>
                                        </div>
                                        <span className="font-bold text-slate-700">{item.value}%</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="basePv" stackId="pvStack" fill="#fbbf24" />
                        <Bar dataKey="aiPvBoost" stackId="pvStack" fill="#f97316" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actualPv" stackId="pvStack" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="simulatedBasePv" stackId="pvStack" fill="#fef08a" stroke="#eab308" strokeDasharray="3 3" strokeWidth={1} />
                        <Bar dataKey="simulatedAiPvBoost" stackId="pvStack" fill="#ffedd5" stroke="#ea580c" strokeDasharray="3 3" strokeWidth={1} radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 下图：每日限电止损组合图（新增，权限控制） */}
                {hasCurtailmentPermission && (
                  <div className="border-t border-slate-100 pt-6 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
                          每日负电价限电止损组合图
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">当监测到电力负电价时段，AI主动下发限电策略，避免上网倒贴费用损失。点击下方柱体查看当日96点明细。</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 self-start sm:self-auto shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1.5 rounded-sm bg-[#10b981]" />
                          <span>止损金额 (左轴·元)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-[2px] bg-[#2563eb]" />
                          <span>限电电量 (右轴·kWh)</span>
                        </div>
                      </div>
                    </div>

                    {selectedMonth === "2026-07" ? (
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={curtailmentDataList}
                            margin={{ top: 10, right: -5, left: -20, bottom: 0 }}
                            onClick={(state) => {
                              if (state && state.activeLabel) {
                                const clickedDay = state.activeLabel;
                                const dayData = curtailmentDataList.find(item => item.day === clickedDay);
                                if (dayData && dayData.lossSaved > 0) {
                                  setSelectedCurtailDay(clickedDay);
                                  setIsCurtailModalOpen(true);
                                }
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="day" axisLine={{ stroke: "#94a3b8" }} tickLine={false} tick={<DynamicXAxisTick />} interval={0} />
                            <YAxis yAxisId="left" orientation="left" axisLine={{ stroke: "#94a3b8" }} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(val) => `¥${val}`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={{ stroke: "#94a3b8" }} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(val) => `${val}k`} />
                            <Tooltip
                              cursor={{ fill: "#f8fafc" }}
                              content={({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null;
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl min-w-[180px]">
                                    <div className="font-bold text-slate-800 text-xs mb-2 pb-1 border-b border-slate-100">
                                      7月{label} 限电止损评估
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">避免倒贴损失:</span>
                                        <span className="font-bold text-emerald-600">¥{data.lossSaved}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">主动限电电量:</span>
                                        <span className="font-bold text-blue-600">{data.curtailedEnergy} kWh</span>
                                      </div>
                                    </div>
                                    {data.lossSaved > 0 ? (
                                      <div className="mt-2 text-[9px] text-emerald-600 bg-emerald-50 py-1 px-1.5 rounded text-center font-bold animate-pulse">
                                        💡 点击柱体钻取 15分钟 详细测点 ↗
                                      </div>
                                    ) : (
                                      <div className="mt-2 text-[9px] text-slate-400 bg-slate-50 py-1 px-1.5 rounded text-center font-medium">
                                        当日未发生负电价，无需限电
                                      </div>
                                    )}
                                  </div>
                                );
                              }}
                            />
                            <Bar yAxisId="left" dataKey="lossSaved" fill="#10b981" radius={[3, 3, 0, 0]} barSize={10} cursor="pointer" />
                            <Line yAxisId="right" type="monotone" dataKey="curtailedEnergy" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[220px] w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-6">
                        <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-sm font-bold text-slate-500">当月无限电止损数据</span>
                        <span className="text-xs text-slate-400 mt-1">河北国杉电网在 {selectedMonth} 期间未监测到负电价套利或限电考核事件</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chart 3: 本月运行策略储能充放电统计 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-slate-800">
                      {userAiStatus === "not_activated" ? "储能充放电深度回测统计" : "本月运行策略储能充放电统计"}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1.5 rounded-sm bg-[#f97316]"></div>
                    <span className="text-slate-600 font-bold text-xs">
                      基础放电
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1.5 rounded-sm bg-[#2563eb]"></div>
                    <span className="text-slate-600 font-bold text-xs">
                      基础充电
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1.5 rounded-sm bg-[#10b981]"></div>
                    <span className="text-slate-600 font-bold text-xs">
                      AI 提升充/放电
                    </span>
                  </div>
                  
                  {!(userAiStatus === "not_activated" && unactivatedSimulated) && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1.5 rounded-sm bg-[#64748b]"></div>
                        <span className="text-slate-600 font-bold text-xs">
                          实际放电 (未运行AI)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1.5 rounded-sm bg-[#cbd5e1]"></div>
                        <span className="text-slate-600 font-bold text-xs">
                          实际充电 (未运行AI)
                        </span>
                      </div>
                    </>
                  )}

                  {/* Simulated storage legends */}
                  {((userAiStatus === "activated" && enableSimulation) || (userAiStatus === "not_activated" && unactivatedSimulated)) && (
                    <>
                      <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1.5 rounded-sm bg-[#ffedd5] border border-dashed border-[#f97316]"></div>
                        <span className="text-emerald-700 font-bold text-[11px]">
                          模拟基础放电 (回测)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1.5 rounded-sm bg-[#dbeafe] border border-dashed border-[#2563eb]"></div>
                        <span className="text-emerald-700 font-bold text-[11px]">
                          模拟基础充电 (回测)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1.5 rounded-sm bg-[#a7f3d0] border border-dashed border-[#10b981]"></div>
                        <span className="text-emerald-700 font-bold text-[11px]">
                          模拟 AI 提升 (回测)
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="h-[400px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartEssData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                      barGap={2}
                      stackOffset="sign"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="day"
                        scale="band"
                        axisLine={{ stroke: "#94a3b8" }}
                        tickLine={false}
                        tick={<DynamicXAxisTick />}
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
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          const isSimulated = data.isSimulatedDay;
                          
                          return (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl min-w-[220px]">
                              <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2 pb-1 border-b border-slate-100">
                                <span>{label}</span>
                                {isSimulated && (
                                  <span className="bg-amber-50 text-amber-600 border border-amber-200/50 text-[9px] px-1.5 py-0.5 rounded animate-pulse">
                                    回测模拟数据
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {payload.map((item: any, idx: number) => {
                                  const value = item.value;
                                  if (value === null || value === undefined) return null;
                                  
                                  let displayName = "";
                                  let color = "";
                                  
                                  if (item.dataKey === "baseDischarge") {
                                    displayName = "基础放电";
                                    color = "#f97316";
                                  } else if (item.dataKey === "aiDischargeBoost") {
                                    displayName = "AI 提升放电";
                                    color = "#10b981";
                                  } else if (item.dataKey === "actualDischarge") {
                                    displayName = "实际放电 (未运行AI)";
                                    color = "#64748b";
                                  } else if (item.dataKey === "baseCharge") {
                                    displayName = "基础充电";
                                    color = "#2563eb";
                                  } else if (item.dataKey === "aiChargeBoost") {
                                    displayName = "AI 提升充电";
                                    color = "#10b981";
                                  } else if (item.dataKey === "actualCharge") {
                                    displayName = "实际充电 (未运行AI)";
                                    color = "#cbd5e1";
                                  } else if (item.dataKey === "simulatedBaseDischarge") {
                                    displayName = "模拟基础放电";
                                    color = "#f97316";
                                  } else if (item.dataKey === "simulatedAiDischargeBoost") {
                                    displayName = "模拟 AI 提升放电";
                                    color = "#10b981";
                                  } else if (item.dataKey === "simulatedBaseCharge") {
                                    displayName = "模拟基础充电";
                                    color = "#2563eb";
                                  } else if (item.dataKey === "simulatedAiChargeBoost") {
                                    displayName = "模拟 AI 提升充电";
                                    color = "#10b981";
                                  } else {
                                    displayName = item.name;
                                    color = item.color || "#000000";
                                  }
                                  
                                  const absValue = Math.abs(Number(value));
                                  return (
                                    <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <div 
                                          className={`w-3 h-1.5 rounded-sm shrink-0 ${isSimulated && item.dataKey.startsWith('simulated') ? 'border border-dashed' : ''}`}
                                          style={{ backgroundColor: color }}
                                        />
                                        <span className="text-slate-500 font-medium">{displayName}</span>
                                      </div>
                                      <span className="font-bold font-mono" style={{ color: color }}>
                                        {absValue.toLocaleString()} kWh
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }}
                      />
                      
                      {/* Positive bars (Discharge) */}
                      <Bar dataKey="baseDischarge" stackId="essStack" fill="#f97316" barSize={12} />
                      <Bar dataKey="aiDischargeBoost" stackId="essStack" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} />
                      <Bar dataKey="actualDischarge" stackId="essStack" fill="#64748b" radius={[3, 3, 0, 0]} barSize={12} />
                      
                      {/* Simulated Positive bars */}
                      <Bar 
                        dataKey="simulatedBaseDischarge" 
                        stackId="essStack" 
                        fill="#ffedd5" 
                        stroke="#f97316" 
                        strokeDasharray="3 3" 
                        strokeWidth={1} 
                        barSize={12} 
                      />
                      <Bar 
                        dataKey="simulatedAiDischargeBoost" 
                        stackId="essStack" 
                        fill="#a7f3d0" 
                        stroke="#10b981" 
                        strokeDasharray="3 3" 
                        strokeWidth={1} 
                        radius={[3, 3, 0, 0]} 
                        barSize={12} 
                      />

                      {/* Negative bars (Charge) */}
                      <Bar dataKey="baseCharge" stackId="essStack" fill="#2563eb" barSize={12} />
                      <Bar dataKey="aiChargeBoost" stackId="essStack" fill="#10b981" radius={[0, 0, 3, 3]} barSize={12} />
                      <Bar dataKey="actualCharge" stackId="essStack" fill="#cbd5e1" radius={[0, 0, 3, 3]} barSize={12} />
                      
                      {/* Simulated Negative bars */}
                      <Bar 
                        dataKey="simulatedBaseCharge" 
                        stackId="essStack" 
                        fill="#dbeafe" 
                        stroke="#2563eb" 
                        strokeDasharray="3 3" 
                        strokeWidth={1} 
                        barSize={12} 
                      />
                      <Bar 
                        dataKey="simulatedAiChargeBoost" 
                        stackId="essStack" 
                        fill="#a7f3d0" 
                        stroke="#10b981" 
                        strokeDasharray="3 3" 
                        strokeWidth={1} 
                        radius={[0, 0, 3, 3]} 
                        barSize={12} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <StrategyConfigModal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)} 
        onSave={(baselineType, selectedBaselineId, selectedAiId) => {
          if (userAiStatus === "not_activated") {
            handleRunUnactivatedSimulation();
          } else {
            setIsAnalyzing(true);
            setTimeout(() => {
              setIsAnalyzing(false);
              setEnableSimulation(true);
            }, 1200);
          }
        }}
      />

      {/* 负电价限电止损钻取日明细弹窗 */}
      {isCurtailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                  <Sun className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    2026年7月{selectedCurtailDay} · 限电止损诊断明细
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    河北南部电网配网侧接线点（用户侧微网）· 15分钟高精度测点联动
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsCurtailModalOpen(false);
                  setIsTableExpanded(false);
                }}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗主体内容 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 当日概要标签行（2个KPI） */}
              {(() => {
                const dayData = curtailmentDataList.find(d => d.day === selectedCurtailDay) || { lossSaved: 0, curtailedEnergy: 0 };
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block">当日限电电量</span>
                        <h4 className="text-3xl font-black text-indigo-700">
                          {dayData.curtailedEnergy} <span className="text-sm font-bold">kWh</span>
                        </h4>
                      </div>
                      <div className="w-12 h-12 bg-indigo-600/10 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">当日减亏止损金额</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.2 rounded-full">防倒贴</span>
                        </div>
                        <h4 className="text-3xl font-black text-emerald-700">
                          ¥{dayData.lossSaved}
                        </h4>
                      </div>
                      <div className="w-12 h-12 bg-emerald-600/10 text-emerald-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 15min趋势图 */}
              <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      15分钟级联动运行趋势
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      展示15分钟级理论发电量、实际发电量与实时电价关系。其中 11:00 - 14:00 上网电价为负，AI启动限电减亏机制。
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-[2px] bg-[#f59e0b]" />
                      <span>15min理论发电量 (kWh)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-[2px] bg-[#10b981]" />
                      <span>15min实际发电量 (kWh)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-[2px] bg-[#ef4444]" />
                      <span>实时上网电价 (右轴·元/kWh)</span>
                    </div>
                  </div>
                </div>

                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={get96PointsForDay(selectedCurtailDay)}
                      margin={{ top: 10, right: -5, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={{ stroke: "#94a3b8" }} 
                        tickLine={false} 
                        tick={{ fill: "#64748b", fontSize: 9 }}
                        interval={7}
                      />
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        axisLine={{ stroke: "#94a3b8" }} 
                        tickLine={false} 
                        tick={{ fill: "#64748b", fontSize: 9 }} 
                        tickFormatter={(val) => `${val}kWh`}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        axisLine={{ stroke: "#94a3b8" }} 
                        tickLine={false} 
                        tick={{ fill: "#64748b", fontSize: 9 }} 
                        tickFormatter={(val) => `${val.toFixed(2)}元`}
                      />
                      
                      {/* Highlight the Negative feed-in tariff area */}
                      <ReferenceArea 
                        x1="11:00" 
                        x2="14:00" 
                        yAxisId="left" 
                        fill="#fee2e2" 
                        fillOpacity={0.25} 
                        label={{ value: '负电价防亏限电段', position: 'insideTop', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} 
                      />
                      
                      <ReferenceLine y={0} yAxisId="right" stroke="#ef4444" strokeDasharray="3 3" />

                      <Tooltip
                        cursor={{ fill: "#f1f5f9", fillOpacity: 0.5 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          const hasLossSaved = data.lossSaved > 0;
                          return (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl min-w-[200px] text-xs">
                              <div className="font-bold text-slate-800 mb-1.5 pb-1 border-b border-slate-100 flex justify-between">
                                <span>时段: {label}</span>
                                {hasLossSaved && <span className="bg-emerald-50 text-emerald-600 px-1 py-0.1 rounded text-[8px] font-bold">防亏限电中</span>}
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">15min理论发电量:</span>
                                  <span className="font-bold text-slate-700">{data.theoreticalGen.toFixed(2)} kWh</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">15min实际发电量:</span>
                                  <span className="font-bold text-emerald-600">{data.actualGen.toFixed(2)} kWh</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">15min限电量:</span>
                                  <span className="font-bold text-indigo-600">{data.curtailedGen.toFixed(2)} kWh</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">上网电价:</span>
                                  <span className={`font-bold ${data.tariff < 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                                    {data.tariff.toFixed(3)} 元/kWh
                                  </span>
                                </div>
                                {hasLossSaved && (
                                  <div className="flex justify-between pt-1 border-t border-dashed border-slate-100">
                                    <span className="text-emerald-600 font-medium">主动减亏金额:</span>
                                    <span className="font-bold text-emerald-600">¥{data.lossSaved}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }}
                      />
                      
                      <Line yAxisId="left" type="monotone" dataKey="theoreticalGen" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line yAxisId="left" type="monotone" dataKey="actualGen" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="stepAfter" dataKey="tariff" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 明细表格 96 行 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                      15分钟多维度监控遥测报表
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      默认展示日内核心波动时段（09:00 - 15:00），可一键展开完整 96 个点报表。
                    </p>
                  </div>


                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold text-[10px] border-b border-slate-100">
                          <th className="px-4 py-2.5">序号</th>
                          <th className="px-4 py-2.5">监测时段</th>
                          <th className="px-4 py-2.5 text-right">15min理论发电量 (kWh)</th>
                          <th className="px-4 py-2.5 text-right">15min实际发电量 (kWh)</th>
                          <th className="px-4 py-2.5 text-right">15min限电量 (kWh)</th>
                          <th className="px-4 py-2.5 text-right">结算电价 (元/kWh)</th>
                          <th className="px-4 py-2.5 text-right">AI 主动止损 (元)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                        {get96PointsForDay(selectedCurtailDay)
                          .filter((item, idx) => {
                            if (isTableExpanded) return true;
                            // Filter hours between 09:00 and 15:00
                            const hour = parseInt(item.time.split(':')[0]);
                            return hour >= 9 && hour < 15;
                          })
                          .map((row, idx) => {
                            const isNegativePrice = row.tariff < 0;
                            return (
                              <tr 
                                key={idx} 
                                className={`hover:bg-slate-50/80 transition-colors ${isNegativePrice ? 'bg-rose-50/20' : ''}`}
                              >
                                <td className="px-4 py-2 font-mono text-slate-400 text-[10px]">{idx + 1}</td>
                                <td className="px-4 py-2 font-bold text-slate-700">{row.time}</td>
                                <td className="px-4 py-2 text-right font-mono">{row.theoreticalGen.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right font-mono text-emerald-600 font-medium">{row.actualGen.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right font-mono text-indigo-600 font-medium">
                                  {row.curtailedGen > 0 ? row.curtailedGen.toFixed(2) : "-"}
                                </td>
                                <td className={`px-4 py-2 text-right font-mono font-medium ${isNegativePrice ? 'text-rose-500 font-bold' : ''}`}>
                                  {row.tariff.toFixed(3)}
                                </td>
                                <td className="px-4 py-2 text-right font-mono text-emerald-600 font-bold">
                                  {row.lossSaved > 0 ? `¥${row.lossSaved.toFixed(1)}` : "-"}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-center">
                    <button 
                      onClick={() => setIsTableExpanded(!isTableExpanded)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {isTableExpanded ? "收起明细报表 (仅展示 09:00 ~ 15:00) ▲" : "展开全部 96 点日内诊断数据 (展开 00:00 ~ 24:00) ▼"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗页脚 */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => {
                  setIsCurtailModalOpen(false);
                  setIsTableExpanded(false);
                }}
                className="px-5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyReportPage;

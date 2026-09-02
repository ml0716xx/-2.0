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
  Sparkles,
  Coins,
  BatteryCharging,
  ArrowDownRight,
  ShieldCheck,
  Layers,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Gauge,
  Battery,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize2,
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
  LabelList,
} from "recharts";

import StrategyConfigModal from "./StrategyConfigModal";
import StrategySimulationConfigPage, { MonthlyStrategyDayConfig } from "./StrategySimulationConfigPage";

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
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="#64748b"
        className="text-[10px]"
        style={{ fontWeight: "500" }}
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
  const [isConfigSubpageOpen, setIsConfigSubpageOpen] = useState(false);
  const [showSimulationToast, setShowSimulationToast] = useState(false);
  
  // Custom states for curtailment loss mitigation evaluation
  const [hasCurtailmentPermission, setHasCurtailmentPermission] = useState<boolean>(true);
  const [selectedCurtailDay, setSelectedCurtailDay] = useState<string>("15日");
  const [isCurtailModalOpen, setIsCurtailModalOpen] = useState<boolean>(false);
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);
  const [showExportToast, setShowExportToast] = useState<boolean>(false);

  // Daily curtailment assessment dataset for Hebei user-side microgrid (July 2026) - includes negative loss values (e.g. penalty/green power loss vs negative tariff)
  const curtailmentDataList = [
    { day: "1日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "2日", lossSaved: -45, curtailedEnergy: 4.8 }, // 模拟因执行限电调整产生的小额负止损/考核
    { day: "3日", lossSaved: 120, curtailedEnergy: 10.5 },
    { day: "4日", lossSaved: 85, curtailedEnergy: 7.2 },
    { day: "5日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "6日", lossSaved: 200, curtailedEnergy: 16.8 },
    { day: "7日", lossSaved: 180, curtailedEnergy: 15.2 },
    { day: "8日", lossSaved: -80, curtailedEnergy: 8.5 }, // 模拟负值止损（偏差考核/绿电折损）
    { day: "9日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "10日", lossSaved: 240, curtailedEnergy: 20.1 },
    { day: "11日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "12日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "13日", lossSaved: 150, curtailedEnergy: 12.5 },
    { day: "14日", lossSaved: -35, curtailedEnergy: 3.6 }, // 模拟负值止损
    { day: "15日", lossSaved: 580, curtailedEnergy: 48.5 }, // Target day for deep-dive
    { day: "16日", lossSaved: 320, curtailedEnergy: 26.8 },
    { day: "17日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "18日", lossSaved: 0, curtailedEnergy: 0 },
    { day: "19日", lossSaved: -60, curtailedEnergy: 6.2 }, // 模拟负值止损
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
    { day: "30日", lossSaved: -50, curtailedEnergy: 5.4 }, // 模拟负值止损
    { day: "31日", lossSaved: 0, curtailedEnergy: 0 },
  ];

  // Dynamically generates 96 points trend for the selected day
  const get96PointsForDay = (day: string) => {
    const dayNum = parseInt(day) || 15;
    const points = [];
    
    const is15 = dayNum === 15;
    const is16 = dayNum === 16;
    
    const dayItem = curtailmentDataList.find(d => d.day === day || d.day === `${dayNum}日`);
    const targetCurtail = dayItem ? dayItem.curtailedEnergy : 0;
    const targetLossSaved = dayItem ? dayItem.lossSaved : 0;
    const hasCurtailment = targetCurtail > 0;
    
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
        theoreticalGen = (Math.sin(angle) * (is15 ? 45 : (is16 ? 30 : 25)) + Math.random() * 1.5) / 4;
      }
      theoreticalGen = parseFloat(Math.max(0, theoreticalGen).toFixed(2));
      
      let actualGen = theoreticalGen;
      let curtailedGen = 0;
      let tariff = 0.35;
      let lossSaved = 0;
      
      if (hasCurtailment && i >= curtailStartIdx && i <= curtailEndIdx) {
        tariff = targetLossSaved < 0 ? 0.15 : -0.25; // Negative feed-in tariff or unfavorable tariff spread
        
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
  const [simulationSchedule, setSimulationSchedule] = useState<Record<number, MonthlyStrategyDayConfig> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Hover states for interactive difference markers on mouseover
  const [hoveredRevenueIndex, setHoveredRevenueIndex] = useState<number | null>(null);
  const [hoveredPvIndex, setHoveredPvIndex] = useState<number | null>(null);
  const [hoveredEssIndex, setHoveredEssIndex] = useState<number | null>(null);
  const [hoveredPriceIndex, setHoveredPriceIndex] = useState<number | null>(null);

  // Helper: check if a specific day is simulated with an AI strategy (true => dashed grid, false => solid)
  const isDaySimulatedWithAi = (dayNum: number): boolean => {
    if (simulationSchedule && simulationSchedule[dayNum]) {
      const cfg = simulationSchedule[dayNum];
      return cfg.templateId ? cfg.templateId.startsWith("tpl_ai_") : false;
    }
    return false;
  };

  // SVG Pattern Definitions for Dashed Grid textures on AI simulated bars (Original Distinct Color Palette)
  const AiSimChartDefs = () => (
    <defs>
      {/* Emerald Green Pattern for Actual AI Optimized */}
      <pattern id="aiSimGridPatternEmerald" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#10b981" fillOpacity="0.25" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#059669" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>

      {/* Blue Dashed Grid Pattern for Simulated baseline */}
      <pattern id="aiSimGridPatternBlue" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#3b82f6" fillOpacity="0.25" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#2563eb" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>

      {/* Amber Gold Pattern for Simulated PV */}
      <pattern id="aiSimGridPatternAmber" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#f59e0b" fillOpacity="0.25" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#d97706" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>

      {/* Orange Pattern for Simulated ESS Discharge */}
      <pattern id="aiSimGridPatternOrange" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#f97316" fillOpacity="0.25" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#ea580c" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>

      {/* Dark Emerald Pattern for ESS Charge */}
      <pattern id="aiSimGridPatternDarkEmerald" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#059669" fillOpacity="0.25" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#047857" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>
    </defs>
  );

  // 1. Dynamic tick renderer that marks dates running AI with a clean accent without clutter
  const DynamicXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const dayIndex = parseInt(payload.value) - 1;
    const dayData = dailyRevenueData[dayIndex];
    const dayNum = parseInt(payload.value);
    
    // Determine whether this day has AI active (either actual running or simulated with AI)
    const isAiDay = dayData ? (dayData.hasAi || isDaySimulatedWithAi(dayNum)) : false;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={14}
          textAnchor="middle"
          fill={isAiDay ? "#1E9C7E" : "#7F8C8D"}
          fontSize={10}
          fontWeight={isAiDay ? "bold" : "normal"}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Helper to determine simulated strategy name for any given day
  const getSimulatedStrategyName = (dayNum: number, originalHasAi: boolean) => {
    if (simulationSchedule && simulationSchedule[dayNum]) {
      return simulationSchedule[dayNum].templateName;
    }
    if (originalHasAi) {
      return "AI 智能全景协同策略";
    }
    const isWeekendDay = dayNum % 7 === 4 || dayNum % 7 === 5;
    return isWeekendDay ? "七月休息日模版（非AI-一充一放）" : "七月工作日模版（非AI-两充两放）";
  };

  // 2. Comparative Data Mappings for Charts (AI策略 vs 模拟策略)
  const chartRevenueData = dailyRevenueData.map((d, i) => {
    const dayNum = parseInt(d.day);
    const originalBase = d.hasAi ? d.baseRevenue! : d.actualRevenue!;
    const originalBoost = d.hasAi ? d.aiBoost! : 0;
    
    let simulatedRevenue = originalBase;
    let aiRevenue = originalBase;
    let isSimulatedDay = false;
    let hasAi = d.hasAi;

    if (simulationSchedule) {
      if (d.hasAi) {
        isSimulatedDay = false;
        simulatedRevenue = originalBase;
        aiRevenue = originalBase + originalBoost;
        hasAi = true;
      } else {
        isSimulatedDay = true;
        simulatedRevenue = originalBase;
        aiRevenue = isDaySimulatedWithAi(dayNum) 
          ? (originalBase + Math.round(originalBase * 0.32))
          : originalBase;
        hasAi = isDaySimulatedWithAi(dayNum);
      }
    } else {
      isSimulatedDay = false;
      simulatedRevenue = originalBase;
      aiRevenue = d.hasAi ? (originalBase + originalBoost) : originalBase;
      hasAi = d.hasAi;
    }

    const diffRevenue = aiRevenue - simulatedRevenue;
    const diffPercent = simulatedRevenue > 0 ? ((diffRevenue / simulatedRevenue) * 100).toFixed(1) : "0.0";
    const strategyName = getSimulatedStrategyName(dayNum, d.hasAi);

    return {
      day: d.day,
      simulatedRevenue,
      aiRevenue,
      diffRevenue,
      diffPercent,
      isSimulatedDay,
      hasAi,
      strategyName,
    };
  });

  const chartPvData = dailyPvConsumptionData.map((d, i) => {
    const dayNum = parseInt(d.day);
    const originalBase = d.hasAi ? d.basePv! : d.actualPv!;
    const originalBoost = d.hasAi ? d.aiPvBoost! : 0;

    let simulatedPv = originalBase;
    let aiPv = originalBase;
    let isSimulatedDay = false;
    let hasAi = d.hasAi;

    if (simulationSchedule) {
      if (d.hasAi) {
        isSimulatedDay = false;
        simulatedPv = originalBase;
        aiPv = parseFloat((originalBase + originalBoost).toFixed(1));
        hasAi = true;
      } else {
        const stableBoost = parseFloat(((i % 4 + 7) + Math.sin(i) * 0.5).toFixed(1));
        isSimulatedDay = true;
        simulatedPv = originalBase;
        aiPv = isDaySimulatedWithAi(dayNum) 
          ? parseFloat((originalBase + stableBoost).toFixed(1))
          : originalBase;
        hasAi = isDaySimulatedWithAi(dayNum);
      }
    } else {
      isSimulatedDay = false;
      simulatedPv = originalBase;
      aiPv = d.hasAi ? parseFloat((originalBase + originalBoost).toFixed(1)) : originalBase;
      hasAi = d.hasAi;
    }

    const diffPv = parseFloat((aiPv - simulatedPv).toFixed(1));
    const diffPercent = simulatedPv > 0 ? ((diffPv / simulatedPv) * 100).toFixed(1) : "0.0";
    const strategyName = getSimulatedStrategyName(dayNum, d.hasAi);

    return {
      day: d.day,
      simulatedPv,
      aiPv,
      diffPv,
      diffPercent,
      isSimulatedDay,
      hasAi,
      strategyName,
    };
  });

  const chartEssData = dailyEssBatteryData.map((d, i) => {
    const dayNum = parseInt(d.day);
    const originalDischarge = Math.abs(d.hasAi ? d.baseDischarge! : d.actualDischarge!);
    const originalDischargeBoost = d.hasAi && d.aiDischargeBoost ? d.aiDischargeBoost : 0;
    const originalCharge = Math.abs(d.hasAi ? d.baseCharge! : d.actualCharge!);
    const originalChargeBoost = d.hasAi && d.aiChargeBoost ? Math.abs(d.aiChargeBoost) : 0;

    let simulatedDischarge = originalDischarge;
    let aiDischarge = originalDischarge;
    let simulatedCharge = -originalCharge;
    let aiCharge = -originalCharge;
    let isSimulatedDay = false;
    let hasAi = d.hasAi;

    if (simulationSchedule) {
      if (d.hasAi) {
        isSimulatedDay = false;
        simulatedDischarge = originalDischarge;
        aiDischarge = originalDischarge + originalDischargeBoost;
        simulatedCharge = -originalCharge;
        aiCharge = -(originalCharge + originalChargeBoost);
        hasAi = true;
      } else {
        isSimulatedDay = true;
        simulatedDischarge = originalDischarge;
        simulatedCharge = -originalCharge;
        aiDischarge = isDaySimulatedWithAi(dayNum) 
          ? (originalDischarge + Math.round(originalDischarge * 0.18))
          : originalDischarge;
        aiCharge = isDaySimulatedWithAi(dayNum)
          ? -(originalCharge + Math.round(originalCharge * 0.22))
          : -originalCharge;
        hasAi = isDaySimulatedWithAi(dayNum);
      }
    } else {
      isSimulatedDay = false;
      simulatedDischarge = originalDischarge;
      aiDischarge = d.hasAi ? (originalDischarge + originalDischargeBoost) : originalDischarge;
      simulatedCharge = -originalCharge;
      aiCharge = d.hasAi ? -(originalCharge + originalChargeBoost) : -originalCharge;
      hasAi = d.hasAi;
    }

    const diffDischarge = aiDischarge - simulatedDischarge;
    const diffCharge = Math.abs(aiCharge) - Math.abs(simulatedCharge);
    const strategyName = getSimulatedStrategyName(dayNum, d.hasAi);

    // 储能利用率计算 (%)
    const simulatedUtilRate = parseFloat(Math.min(98.5, Math.max(38.0, (simulatedDischarge / 750) * 100)).toFixed(1));
    const aiUtilRate = parseFloat(Math.min(99.5, Math.max(48.0, (aiDischarge / 750) * 100)).toFixed(1));
    const diffUtilRate = parseFloat((aiUtilRate - simulatedUtilRate).toFixed(1));

    return {
      day: d.day,
      simulatedDischarge,
      aiDischarge,
      simulatedCharge,
      aiCharge,
      diffDischarge,
      diffCharge,
      simulatedUtilRate,
      aiUtilRate,
      diffUtilRate,
      isSimulatedDay,
      hasAi,
      strategyName,
    };
  });

  // 4. Daily ESS Charging Cost & Discharging Price dataset for Charts
  const chartEssPriceData = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dRev = dailyRevenueData[i];
    const originalHasAi = dRev ? dRev.hasAi : false;
    
    // 模拟基准策略价格 (常规模板定时充放电)
    // 基准充电成本：0.370 ~ 0.410 元/kWh；基准放电均价：0.830 ~ 0.865 元/kWh
    const baseChargePrice = parseFloat((0.382 + Math.sin(i * 0.7) * 0.022).toFixed(3));
    const baseDischargePrice = parseFloat((0.842 + Math.cos(i * 0.5) * 0.026).toFixed(3));
    
    let simulatedChargePrice = baseChargePrice;
    let simulatedDischargePrice = baseDischargePrice;
    let aiChargePrice = baseChargePrice;
    let aiDischargePrice = baseDischargePrice;
    let isSimulatedDay = false;
    let hasAi = originalHasAi;

    if (simulationSchedule) {
      if (originalHasAi) {
        isSimulatedDay = false;
        simulatedChargePrice = baseChargePrice;
        simulatedDischargePrice = baseDischargePrice;
        // AI 智能全景协同：深谷/光伏入储深度优化，充电均价降低至 0.310 ~ 0.335
        aiChargePrice = parseFloat((0.315 + Math.sin(i * 0.9) * 0.016).toFixed(3));
        // 尖峰/高峰极致捕捉，放电均价提升至 0.915 ~ 0.945
        aiDischargePrice = parseFloat((0.926 + Math.cos(i * 0.8) * 0.020).toFixed(3));
        hasAi = true;
      } else {
        isSimulatedDay = true;
        simulatedChargePrice = baseChargePrice;
        simulatedDischargePrice = baseDischargePrice;
        const isSimAi = isDaySimulatedWithAi(dayNum);
        hasAi = isSimAi;
        if (isSimAi) {
          aiChargePrice = parseFloat((0.312 + Math.sin(i * 0.9) * 0.014).toFixed(3));
          aiDischargePrice = parseFloat((0.928 + Math.cos(i * 0.8) * 0.018).toFixed(3));
        } else {
          aiChargePrice = baseChargePrice;
          aiDischargePrice = baseDischargePrice;
        }
      }
    } else {
      isSimulatedDay = false;
      simulatedChargePrice = baseChargePrice;
      simulatedDischargePrice = baseDischargePrice;
      if (originalHasAi) {
        aiChargePrice = parseFloat((0.320 + Math.sin(i * 0.9) * 0.016).toFixed(3));
        aiDischargePrice = parseFloat((0.918 + Math.cos(i * 0.8) * 0.020).toFixed(3));
      } else {
        aiChargePrice = baseChargePrice;
        aiDischargePrice = baseDischargePrice;
      }
      hasAi = originalHasAi;
    }

    // 充放价差 (度电利差)
    const actualSpread = parseFloat((aiDischargePrice - aiChargePrice).toFixed(3));
    const simulatedSpread = parseFloat((simulatedDischargePrice - simulatedChargePrice).toFixed(3));
    const diffSpread = parseFloat((actualSpread - simulatedSpread).toFixed(3));
    const diffSpreadPercent = parseFloat(((diffSpread / simulatedSpread) * 100).toFixed(1));
    const strategyName = getSimulatedStrategyName(dayNum, originalHasAi);

    return {
      day: `${dayNum}日`,
      dayNum,
      simulatedChargePrice,
      simulatedDischargePrice,
      aiChargePrice,
      aiDischargePrice,
      simulatedSpread,
      actualSpread,
      diffSpread,
      diffSpreadPercent,
      isSimulatedDay,
      hasAi,
      strategyName,
    };
  });

  const maxEssVal = Math.max(
    ...chartEssData.map((d) =>
      Math.max(
        d.aiDischarge,
        d.simulatedDischarge,
        Math.abs(d.aiCharge),
        Math.abs(d.simulatedCharge)
      )
    ),
    800
  );
  const essYLimit = Math.ceil((maxEssVal * 1.25) / 100) * 100;
  const essYDomain = [-essYLimit, essYLimit];

  // Delta Difference Label Renderers (仅在鼠标悬浮/Hover时展示差值徽章)
  const renderRevenueDiffLabel = (props: any) => {
    const { x, y, width, index } = props;
    if (hoveredRevenueIndex !== index) return null;
    const item = chartRevenueData[index];
    if (!item) return null;
    const diff = item.diffRevenue;
    if (diff === 0) return null;
    
    const isPositive = diff > 0;
    const text = isPositive 
      ? `+¥${diff >= 1000 ? (diff / 1000).toFixed(1) + 'k' : diff}`
      : `-¥${Math.abs(diff) >= 1000 ? (Math.abs(diff) / 1000).toFixed(1) + 'k' : Math.abs(diff)}`;

    return (
      <g transform={`translate(${x + width / 2}, ${Math.max(12, y - 8)})`} className="animate-in fade-in zoom-in-90 duration-150 pointer-events-none">
        <rect 
          x={-22} 
          y={-12} 
          width={44} 
          height={14} 
          rx={4} 
          fill="#10b981" 
          stroke="#ffffff" 
          strokeWidth={1.5} 
          className="drop-shadow-md"
        />
        <text
          textAnchor="middle"
          y={-2}
          fill="#ffffff"
          fontSize={8.5}
          fontWeight="bold"
        >
          {text}
        </text>
      </g>
    );
  };

  const renderPvDiffLabel = (props: any) => {
    const { x, y, width, index } = props;
    if (hoveredPvIndex !== index) return null;
    const item = chartPvData[index];
    if (!item) return null;
    const diff = item.diffPv;
    if (diff === 0) return null;

    return (
      <g transform={`translate(${x + width / 2}, ${Math.max(12, y - 8)})`} className="animate-in fade-in zoom-in-90 duration-150 pointer-events-none">
        <rect 
          x={-18} 
          y={-12} 
          width={36} 
          height={14} 
          rx={4} 
          fill="#10b981" 
          stroke="#ffffff" 
          strokeWidth={1.5} 
          className="drop-shadow-md"
        />
        <text
          textAnchor="middle"
          y={-2}
          fill="#ffffff"
          fontSize={8.5}
          fontWeight="bold"
        >
          {`+${diff}%`}
        </text>
      </g>
    );
  };

  const renderEssDischargeDiffLabel = (props: any) => {
    const { x, y, width, index } = props;
    if (hoveredEssIndex !== index) return null;
    const item = chartEssData[index];
    if (!item) return null;
    const diff = item.diffDischarge;
    if (diff <= 0) return null;

    return (
      <g transform={`translate(${x + width / 2}, ${Math.max(12, y - 8)})`} className="animate-in fade-in zoom-in-90 duration-150 pointer-events-none">
        <rect 
          x={-24} 
          y={-12} 
          width={48} 
          height={14} 
          rx={4} 
          fill="#10b981" 
          stroke="#ffffff" 
          strokeWidth={1.5} 
          className="drop-shadow-md"
        />
        <text
          textAnchor="middle"
          y={-2}
          fill="#ffffff"
          fontSize={8.5}
          fontWeight="bold"
        >
          {`+${diff} kWh`}
        </text>
      </g>
    );
  };

  const renderEssChargeDiffLabel = (props: any) => {
    const { x, y, height, width, index } = props;
    if (hoveredEssIndex !== index) return null;
    const item = chartEssData[index];
    if (!item) return null;
    const diff = item.diffCharge;
    if (diff <= 0) return null;

    return (
      <g transform={`translate(${x + width / 2}, ${y + height + 8})`} className="animate-in fade-in zoom-in-90 duration-150 pointer-events-none">
        <rect 
          x={-24} 
          y={-2} 
          width={48} 
          height={14} 
          rx={4} 
          fill="#059669" 
          stroke="#ffffff" 
          strokeWidth={1.5} 
          className="drop-shadow-md"
        />
        <text
          textAnchor="middle"
          y={8}
          fill="#ffffff"
          fontSize={8.5}
          fontWeight="bold"
        >
          {`+${diff} kWh`}
        </text>
      </g>
    );
  };

  const renderPriceSpreadDiffLabel = (props: any) => {
    const { x, y, width, index } = props;
    if (hoveredPriceIndex !== index) return null;
    const item = chartEssPriceData[index];
    if (!item) return null;
    const diff = item.diffSpread;
    if (diff <= 0) return null;

    return (
      <g transform={`translate(${x + width / 2}, ${Math.max(12, y - 8)})`} className="animate-in fade-in zoom-in-90 duration-150 pointer-events-none">
        <rect 
          x={-28} 
          y={-12} 
          width={56} 
          height={14} 
          rx={4} 
          fill="#6366f1" 
          stroke="#ffffff" 
          strokeWidth={1.5} 
          className="drop-shadow-md"
        />
        <text
          textAnchor="middle"
          y={-2}
          fill="#ffffff"
          fontSize={8.5}
          fontWeight="bold"
        >
          {`+¥${diff.toFixed(3)}`}
        </text>
      </g>
    );
  };

  if (isConfigSubpageOpen) {
    return (
      <StrategySimulationConfigPage
        onBack={() => setIsConfigSubpageOpen(false)}
        onSaveAndSimulate={(schedule) => {
          setIsConfigSubpageOpen(false);
          setIsAnalyzing(true);
          setSimulationSchedule(schedule);
          setShowSimulationToast(true);
          setTimeout(() => {
            setIsAnalyzing(false);
          }, 1000);
          setTimeout(() => {
            setShowSimulationToast(false);
          }, 4500);
        }}
        initialMonth={selectedMonth}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-[#F4F6F9] space-y-4 sm:space-y-6 flex flex-col">
      {/* Simulation update toast notification */}
      {showSimulationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A2A3A]/95 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-[#2C3E50] animate-in fade-in slide-in-from-bottom-5 backdrop-blur-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1E9C7E] animate-ping shrink-0" />
          <span>月度基准策略排程已应用，全月 31 天多基准对比收益与指标已重新完成算法回测！</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white px-6 py-4 rounded-xl shadow-[0_2px_8px_rgba(26,42,58,0.06)] border border-[#EAEDF2] gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-bold text-[#1A2A3A] tracking-tight">
            策略运行报告
          </h1>

          <div className="flex items-center gap-2 border border-[#EAEDF2] bg-white rounded-md px-3 py-1.5 shadow-xs">
            <Calendar className="w-4 h-4 text-[#7F8C8D]" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-[#2C3E50] w-28 cursor-pointer"
            />
          </div>

          {/* AI 策略运行时长占比展示 */}
          <div className="flex items-center gap-1.5 border border-[#EAEDF2] bg-white rounded-md px-3 py-1.5 shadow-xs text-xs">
            <Clock className="w-3.5 h-3.5 text-[#7F8C8D]" />
            <span className="text-[#7F8C8D] font-medium">AI运行时长:</span>
            <span className="font-bold text-[#1A2A3A]">{simulationSchedule ? "100%" : "83.52%"}</span>
            <span className="text-[#7F8C8D] font-medium text-[11px]">({simulationSchedule ? "720.0" : "431.41"}h)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsConfigSubpageOpen(true)}
            disabled={isAnalyzing}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-md transition-all shadow-xs ${
              isAnalyzing 
                ? "bg-[#1E9C7E]/70 text-white cursor-not-allowed opacity-90" 
                : "bg-[#1E9C7E] hover:bg-[#2C7A6E] text-white cursor-pointer"
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

      {/* CORE STATS & ASSOCIATIVE VALUE DRIVERS DASHBOARD */}
      {(() => {
        // 1. 实际运行AI日统计
        const actualAiList = dailyRevenueData.filter((d) => d.hasAi);
        const actualAiDays = actualAiList.length; // 26 天
        const actualAiTotalRev = actualAiList.reduce((sum, d) => sum + (d.baseRevenue! + d.aiBoost!), 0); // 实际总收益
        const actualAiAvgRev = actualAiDays > 0 ? Math.round(actualAiTotalRev / actualAiDays) : 0; // 平均日收益
        const actualAiLossIfBase = actualAiList.reduce((sum, d) => sum + d.aiBoost!, 0); // 运行ai日已为电站多赚

        // 2. 当月模拟排程统计
        const scheduledAiDaysCount = simulationSchedule
          ? Object.keys(simulationSchedule).filter((k) => isDaySimulatedWithAi(parseInt(k))).length
          : actualAiDays;
        const currentAiDays = simulationSchedule ? scheduledAiDaysCount : actualAiDays;

        // 收益动态核算
        const currentAiTotalRev = simulationSchedule
          ? chartRevenueData.filter((d) => d.hasAi).reduce((sum, d) => sum + d.aiRevenue, 0)
          : actualAiTotalRev;
        const currentAiAvgRev = currentAiDays > 0 ? Math.round(currentAiTotalRev / currentAiDays) : 0;

        // 关联核心指标数据计算
        // 1) 光伏消纳率
        const pvConsumptionRate = simulationSchedule ? 98.2 : 96.8;
        // 2) 光伏入储电量
        const pvToStorageTotal = simulationSchedule ? "1.45" : "1.18";
        const pvToStorageDailyAvg = simulationSchedule ? 468.2 : 453.8;
        // 3) 储能充电成本与放电价格 (以及对比基准提升)
        const chargeCostAvg = simulationSchedule ? 0.310 : 0.312;
        const baselineChargeCostAvg = 0.358;
        const chargeCostDiff = (baselineChargeCostAvg - chargeCostAvg).toFixed(3); // 降低 0.046
        const chargeCostDiffPct = (((baselineChargeCostAvg - chargeCostAvg) / baselineChargeCostAvg) * 100).toFixed(1); // 12.8%

        const dischargePriceAvg = simulationSchedule ? 0.932 : 0.925;
        const baselineDischargePriceAvg = 0.867;
        const dischargePriceDiff = (dischargePriceAvg - baselineDischargePriceAvg).toFixed(3); // 提升 0.058
        const dischargePriceDiffPct = (((dischargePriceAvg - baselineDischargePriceAvg) / baselineDischargePriceAvg) * 100).toFixed(1); // 6.7%

        const priceSpread = (dischargePriceAvg - chargeCostAvg).toFixed(3);
        const baselinePriceSpread = (baselineDischargePriceAvg - baselineChargeCostAvg).toFixed(3);
        const spreadGain = (parseFloat(priceSpread) - parseFloat(baselinePriceSpread)).toFixed(3); // +0.104
        
        // 4) 综合度电成本与降本减亏金额
        const avgUnitCost = simulationSchedule ? 0.382 : 0.386; // 元/kWh
        const baselineAvgUnitCost = 0.458; // 元/kWh
        const unitCostReduced = (baselineAvgUnitCost - avgUnitCost).toFixed(3); // 0.072 元/kWh
        const unitCostReducedPct = (((baselineAvgUnitCost - avgUnitCost) / baselineAvgUnitCost) * 100).toFixed(1); // 15.7%
        const totalCostSavings = simulationSchedule ? 15200 : 14260; // 降低金额 (¥1.43万元)
        // 4) 储能综合利用率
        const essUtilRate = simulationSchedule ? 98.2 : 97.2;
        // 5) 储能充放电量
        const essChargeTotal = simulationSchedule ? "1.82" : "1.62";
        const essDischargeTotal = simulationSchedule ? "1.74" : "1.54";
        const essThroughputTotal = (parseFloat(essChargeTotal) + parseFloat(essDischargeTotal)).toFixed(2);
        // 6) 限电止损金额与电量
        const totalCurtailmentLossSaved = curtailmentDataList.reduce((sum, d) => sum + d.lossSaved, 0); // +2140
        const totalCurtailedEnergy = curtailmentDataList.reduce((sum, d) => sum + d.curtailedEnergy, 0); // 止损电量
        const avgCurtailmentSavedDaily = (totalCurtailmentLossSaved / 31).toFixed(2);

        // 7) 收益两翼多维拆解计算 (严格保证数学对齐: 全月收益 = 光伏收益 + 储能收益)
        // 光伏收益 = 消纳率提升 + 光伏入储电量提升 + 限电止损金额
        // 储能收益 = 储能利用率提升 + 储能充放电量提升
        const pvConsumptionGain = simulationSchedule ? 29560 : 27650; // 消纳率提升收益
        const pvToStorageGain = simulationSchedule ? 23100 : 21410;   // 光伏入储电量提升收益
        const pvCurtailmentGain = totalCurtailmentLossSaved;          // 限电止损金额 2140
        const pvTotalRevenue = pvConsumptionGain + pvToStorageGain + pvCurtailmentGain; // 51200 (模拟 54800)

        const essUtilizationGain = simulationSchedule ? 19600 : 18450;  // 储能利用率提升收益
        const essThroughputGain = simulationSchedule ? 15100 : 14200;   // 储能充放电量提升收益
        const essTotalRevenue = essUtilizationGain + essThroughputGain; // 32650 (模拟 34700)

        const totalOperationalRevenue = pvTotalRevenue + essTotalRevenue; // 83850 (模拟 89500)
        const pvSharePercent = ((pvTotalRevenue / totalOperationalRevenue) * 100).toFixed(1);
        const essSharePercent = ((essTotalRevenue / totalOperationalRevenue) * 100).toFixed(1);
        const aiRunningDays = chartRevenueData.filter(d => d.hasAi).length;

        return (
          <div className="bg-white rounded-2xl border border-[#EAEDF2] shadow-[0_2px_8px_rgba(26,42,58,0.06)] p-6 space-y-6 relative overflow-hidden">

            {/* LEVEL 1: 全月综合运行总收益 HUB BANNER */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,42,58,0.06)] border border-[#EAEDF2] relative overflow-hidden z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
                {/* Left Total Info (5 cols) */}
                <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#EAEDF2] pb-4 lg:pb-0 lg:pr-5">
                  <div className="flex items-center justify-between text-[#7F8C8D] mb-1">
                    <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 text-[#2C3E50]">
                      <div className="w-2 h-2 rounded-full bg-[#1E9C7E]" />
                      全月综合运行总收益
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#7F8C8D] border border-[#EAEDF2]">
                        当月 31 天
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        AI 运行 {aiRunningDays} 天
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <div className="text-3xl sm:text-4xl font-black text-[#1E9C7E] font-sans tracking-tight">
                      {(totalOperationalRevenue / 10000).toFixed(2)}
                      <span className="text-base font-bold text-[#7F8C8D] ml-1.5 font-sans">万元</span>
                    </div>
                    <span className="text-xs font-sans text-[#7F8C8D]">
                      (¥{totalOperationalRevenue.toLocaleString()})
                    </span>
                  </div>

                  {/* AI提升收益与综合度电成本指标栏 */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#EAEDF2] text-xs">
                    <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-[#EAEDF2] hover:border-[#C5CCD6] transition-all">
                      <span className="text-[11px] text-[#7F8C8D] font-medium block">AI提升收益</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <strong className="text-[#1A2A3A] font-sans font-bold text-sm">¥{(totalCostSavings / 10000).toFixed(2)}万</strong>
                        <span className="text-[10px] text-[#1E9C7E] bg-[#E6F4F0] px-1.5 py-0.5 rounded font-bold font-sans">
                          +{unitCostReducedPct}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-[#EAEDF2] hover:border-[#C5CCD6] transition-all">
                      <span className="text-[11px] text-[#7F8C8D] font-medium block">综合度电成本</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <strong className="text-[#1A2A3A] font-sans font-bold text-sm">¥{avgUnitCost}</strong>
                        <span className="text-[10px] text-[#1E9C7E] bg-[#E6F4F0] px-1.5 py-0.5 rounded font-bold font-sans">
                          -¥{unitCostReduced}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Ratio Visualization (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#D97706] flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-[#F59E0B]" />
                      光伏收益: ¥{(pvTotalRevenue / 10000).toFixed(2)}万元 ({pvSharePercent}%)
                    </span>
                    <span className="text-[#2563EB] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#2563EB]" />
                      储能收益: ¥{(essTotalRevenue / 10000).toFixed(2)}万元 ({essSharePercent}%)
                    </span>
                  </div>

                  {/* Dual Proportional Bar with Sharp Color Distinction: Solar (Amber Gold) vs ESS (Electric Blue) */}
                  <div className="w-full h-3.5 bg-[#EAEDF2] rounded-full overflow-hidden flex p-0.5 border border-[#EAEDF2]">
                    <div
                      className="h-full bg-[#F59E0B] rounded-l-full transition-all duration-500 shadow-xs"
                      style={{ width: `${pvSharePercent}%` }}
                      title={`光伏收益: ${pvSharePercent}%`}
                    />
                    <div
                      className="h-full bg-[#2563EB] rounded-r-full transition-all duration-500 shadow-xs"
                      style={{ width: `${essSharePercent}%` }}
                      title={`储能收益: ${essSharePercent}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7F8C8D]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                      AI驱动光伏: 消纳率提升 + 光伏入储提升 + 限电止损
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      AI驱动储能: 利用率提升 + 充电量提升 + 放电量提升
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* LEVEL 2: DUAL WINGS DETAILED BREAKDOWN (2 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
              
              {/* 1. 光伏收益板块 (暖琥珀金视觉标识) */}
              <div className="bg-white rounded-2xl p-5 border border-[#EAEDF2] shadow-[0_2px_8px_rgba(26,42,58,0.06)] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-[#EAEDF2] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-5 rounded-full bg-[#F59E0B]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#1A2A3A] tracking-tight flex items-center gap-1.5">
                            <Sun className="w-4 h-4 text-[#F59E0B]" />
                            1. 光伏收益
                          </h3>
                          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] rounded-full text-[10px] font-bold">
                            占比 {pvSharePercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#7F8C8D] block font-medium">光伏总收益</span>
                      <div className="text-xl font-black text-[#D97706] font-sans leading-none mt-0.5">
                        {(pvTotalRevenue / 10000).toFixed(2)}<span className="text-xs font-bold text-[#7F8C8D] ml-0.5">万元</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Sub-items Grid */}
                  <div className="space-y-2.5 mt-3.5">
                    {/* 1.1 消纳率提升 */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2] hover:border-[#FDE68A] transition-all duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2C3E50]">
                          消纳率提升
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[#1A2A3A] font-sans">
                            {pvConsumptionRate}%
                          </span>
                          <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded font-sans">
                            +8.7%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#7F8C8D]">
                        <span>消纳率达到 <strong className="text-[#2C3E50] font-mono font-medium">{pvConsumptionRate}%</strong></span>
                        <span>基准 88.1%</span>
                      </div>
                    </div>

                    {/* 1.2 光伏入储电量提升 */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2] hover:border-[#FDE68A] transition-all duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2C3E50]">
                          光伏入储电量提升
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[#1A2A3A] font-sans">
                            {pvToStorageTotal}<span className="text-xs font-bold text-[#7F8C8D] ml-0.5">万kWh</span>
                          </span>
                          <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.5 rounded font-sans">
                            +24.6%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#7F8C8D]">
                        <span>入储总量 <strong className="text-[#2C3E50] font-mono font-medium">{pvToStorageTotal}万kWh</strong></span>
                        <span>日均 {pvToStorageDailyAvg} kWh</span>
                      </div>
                    </div>

                    {/* 1.3 限电止损 */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2] hover:border-[#FDE68A] transition-all duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2C3E50]">
                          限电止损
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-base font-black text-[#D97706] font-sans">
                            +¥{pvCurtailmentGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#7F8C8D]">
                        <span>日均减亏 <strong className="text-[#2C3E50] font-mono font-medium">+¥{avgCurtailmentSavedDaily}/天</strong></span>
                        <span>止损电量 {totalCurtailedEnergy.toFixed(1)} kWh</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtotal Footer */}
                <div className="border-t border-[#EAEDF2] pt-3 flex items-center justify-between text-xs text-[#7F8C8D]">
                  <span>AI驱动光伏：消纳率 · 入储量 · 限电止损</span>
                  <span className="text-[#D97706] font-bold font-sans">
                    当月光伏收益: ¥{pvTotalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 2. 储能收益板块 (科技电能蓝视觉标识) */}
              <div className="bg-white rounded-2xl p-5 border border-[#EAEDF2] shadow-[0_2px_8px_rgba(26,42,58,0.06)] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-[#EAEDF2] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-5 rounded-full bg-[#2563EB]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#1A2A3A] tracking-tight flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-[#2563EB]" />
                            2. 储能收益
                          </h3>
                          <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-full text-[10px] font-bold">
                            占比 {essSharePercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#7F8C8D] block font-medium">储能总收益</span>
                      <div className="text-xl font-black text-[#2563EB] font-sans leading-none mt-0.5">
                        {(essTotalRevenue / 10000).toFixed(2)}<span className="text-xs font-bold text-[#7F8C8D] ml-0.5">万元</span>
                      </div>
                    </div>
                  </div>

                  {/* 2 Sub-items Grid */}
                  <div className="space-y-2.5 mt-3.5">
                    {/* 2.1 储能利用率提升 */}
                    <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2] hover:border-[#BFDBFE] transition-all duration-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2C3E50]">
                          储能利用率提升
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[#1A2A3A] font-sans">
                            {essUtilRate}%
                          </span>
                          <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded font-sans">
                            +12.4%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#7F8C8D]">
                        <span>综合利用率达到 <strong className="text-[#2C3E50] font-mono font-medium">{essUtilRate}%</strong></span>
                        <span>基准 84.8%</span>
                      </div>
                    </div>

                    {/* 2.2 & 2.3 充电量提升 与 放电量提升 (并排一行展示) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* 2.2 充电量提升 */}
                      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2] hover:border-[#BFDBFE] transition-all duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#2C3E50]">
                            充电量提升
                          </span>
                          <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded font-sans">
                            +26.8%
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black text-[#1A2A3A] font-sans">
                            {essChargeTotal}
                          </span>
                          <span className="text-[11px] font-bold text-[#7F8C8D]">万kWh</span>
                        </div>
                      </div>

                      {/* 2.3 放电量提升 */}
                      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2] hover:border-[#BFDBFE] transition-all duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#2C3E50]">
                            放电量提升
                          </span>
                          <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded font-sans">
                            +30.2%
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black text-[#1A2A3A] font-sans">
                            {essDischargeTotal}
                          </span>
                          <span className="text-[11px] font-bold text-[#7F8C8D]">万kWh</span>
                        </div>
                      </div>
                    </div>

                    {/* 储能充电成本与放电价格对比提升 Indicator Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* 储能充电成本 */}
                      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2] hover:border-[#BFDBFE] transition-all duration-200 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-[#7F8C8D] block font-medium">储能充电成本</span>
                          <span className="font-mono font-bold text-[#1A2A3A] text-sm">¥{chargeCostAvg} <span className="text-[10px] font-normal text-[#7F8C8D]">/kWh</span></span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-[#1D4ED8] block">
                            -¥{chargeCostDiff}
                          </span>
                          <span className="text-[10px] text-[#7F8C8D] block">降 {chargeCostDiffPct}%</span>
                        </div>
                      </div>

                      {/* 储能放电价格 */}
                      <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2] hover:border-[#BFDBFE] transition-all duration-200 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-[#7F8C8D] block font-medium">储能放电价格</span>
                          <span className="font-mono font-bold text-[#1A2A3A] text-sm">¥{dischargePriceAvg} <span className="text-[10px] font-normal text-[#7F8C8D]">/kWh</span></span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-[#1D4ED8] block">
                            +¥{dischargePriceDiff}
                          </span>
                          <span className="text-[10px] text-[#7F8C8D] block">增 {dischargePriceDiffPct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtotal Footer */}
                <div className="border-t border-[#EAEDF2] pt-3 flex items-center justify-between text-xs text-[#7F8C8D]">
                  <span>AI驱动储能：利用率 · 充放电量 · 充放价差</span>
                  <span className="text-[#2563EB] font-bold font-sans">
                    当月储能收益: ¥{essTotalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MAIN CHARTS SECTION */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {/* Chart 1: 本月运行策略收益统计 (日收益对比 + 差值标记) */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(26,42,58,0.06)] border border-[#EAEDF2] flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-[#1A2A3A]">
                  本月运行策略收益统计 (策略对比)
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  日收益对比
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2]">
              <div className="flex flex-wrap items-center gap-4">
                {/* Comparative Legends */}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs bg-[#3B82F6]"></div>
                  <span className="text-[#2C3E50] font-bold text-xs">
                    模拟策略收益 (基准)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs bg-[#10B981]"></div>
                  <span className="text-[#2C3E50] font-bold text-xs">
                    当日实际收益
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartRevenueData}
                  margin={{ top: 20, right: 10, left: -15, bottom: 0 }}
                  barGap={2}
                  barCategoryGap="16%"
                  onMouseMove={(state: any) => {
                    if (state && typeof state.activeTooltipIndex === 'number') {
                      setHoveredRevenueIndex(state.activeTooltipIndex);
                    }
                  }}
                  onMouseLeave={() => setHoveredRevenueIndex(null)}
                >
                  <AiSimChartDefs />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#EAEDF2"
                  />
                  <XAxis
                    dataKey="day"
                    scale="band"
                    axisLine={{ stroke: "#EAEDF2" }}
                    tickLine={false}
                    tick={<DynamicXAxisTick />}
                    interval={0}
                  />
                  <YAxis
                    axisLine={{ stroke: "#EAEDF2" }}
                    tickLine={false}
                    tick={{ fill: "#7F8C8D", fontSize: 10 }}
                    tickFormatter={(val) => `¥${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: "#F4F6F9" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      const simVal = data.simulatedRevenue || 0;
                      const aiVal = data.aiRevenue || 0;
                      const diff = data.diffRevenue || (aiVal - simVal);
                      const diffPct = data.diffPercent || (simVal > 0 ? ((diff / simVal) * 100).toFixed(1) : "0.0");
                      const isSimulated = data.isSimulatedDay;
                      const strategyName = data.strategyName;
                      
                      return (
                        <div className="bg-white p-3.5 rounded-xl border border-[#EAEDF2] shadow-xl min-w-[240px]">
                          <div className="flex items-center justify-between font-bold text-[#1A2A3A] text-xs mb-2 pb-1.5 border-b border-[#EAEDF2]">
                            <span className="text-sm font-extrabold">{label} · 收益对比</span>
                            {isSimulated && (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                AI 策略模拟
                              </span>
                            )}
                          </div>
                          {/* 当天模拟策略名称 */}
                          <div className="flex items-center justify-between text-xs text-[#2C3E50] bg-[#F8FAFC] p-2 rounded-lg border border-[#EAEDF2] mb-2">
                            <span className="text-[11px] text-[#7F8C8D] font-medium">当天模拟策略:</span>
                            <span className="font-bold text-[#1A2A3A] truncate max-w-[145px] text-right" title={strategyName}>
                              {strategyName}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]" />
                                <span className="text-[#7F8C8D] font-medium">模拟策略收益:</span>
                              </div>
                              <span className="font-bold text-[#2C3E50]">¥{Number(simVal).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
                                <span className="text-[#7F8C8D] font-medium">当日实际收益:</span>
                              </div>
                              <span className="font-bold text-[#10B981]">¥{Number(aiVal).toLocaleString()}</span>
                            </div>
                            <div className="pt-2 border-t border-[#EAEDF2] flex items-center justify-between text-xs bg-emerald-50 p-2 rounded-lg">
                              <span className="text-emerald-800 font-bold">差值 (实际提升):</span>
                              <span className="font-black text-[#10B981]">
                                {diff >= 0 ? `+¥${diff.toLocaleString()} (+${diffPct}%)` : `-¥${Math.abs(diff).toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  
                  {/* Comparative Side-by-Side Bars with Dashed Grid Pattern for AI simulation */}
                  <Bar 
                    dataKey="simulatedRevenue" 
                    name="模拟策略收益" 
                    radius={[3, 3, 0, 0]} 
                    barSize={8}
                  >
                    {chartRevenueData.map((entry, index) => {
                      const isSimWithAi = isDaySimulatedWithAi(parseInt(entry.day));
                      return (
                        <Cell
                          key={`cell-rev-sim-${index}`}
                          fill={isSimWithAi ? "url(#aiSimGridPatternBlue)" : "#3B82F6"}
                          fillOpacity={isSimWithAi ? 1 : 0.85}
                          stroke={isSimWithAi ? "#2563EB" : "none"}
                          strokeDasharray={isSimWithAi ? "2 2" : "none"}
                          strokeWidth={isSimWithAi ? 1 : 0}
                        />
                      );
                    })}
                  </Bar>
                  <Bar 
                    dataKey="aiRevenue" 
                    name="当日实际收益" 
                    radius={[3, 3, 0, 0]} 
                    barSize={8}
                  >
                    {chartRevenueData.map((entry, index) => {
                      const isAiSim = entry.isSimulatedDay && isDaySimulatedWithAi(parseInt(entry.day));
                      return (
                        <Cell
                          key={`cell-rev-ai-${index}`}
                          fill={isAiSim ? "url(#aiSimGridPatternEmerald)" : "#10B981"}
                          stroke={isAiSim ? "#059669" : "none"}
                          strokeDasharray={isAiSim ? "2 2" : "none"}
                          strokeWidth={isAiSim ? 1 : 0}
                        />
                      );
                    })}
                    <LabelList content={renderRevenueDiffLabel} />
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: AI策略光伏数据评估 (日消纳率对比 + 差值标记) */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(26,42,58,0.06)] border border-[#EAEDF2] flex flex-col" id="chart-solar-and-curtailment">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-[#EAEDF2]">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-lg font-bold text-[#1A2A3A]">
                  AI策略光伏数据评估
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                  日消纳率对比
                </span>
              </div>
            </div>

            {/* 上图：光伏消纳率对比柱状图 (AI策略 vs 模拟策略 + 差值标记) */}
            <div className="mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2C3E50]">每日光伏消纳率对比统计</span>
                  <span className="text-[10px] text-[#7F8C8D] bg-[#F8FAFC] border border-[#EAEDF2] px-2 py-0.5 rounded">1日 ~ 31日</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2]">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-xs bg-[#F59E0B]"></div>
                    <span className="text-[#2C3E50] font-bold text-xs">模拟策略消纳率 (基准)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-xs bg-[#10B981]"></div>
                    <span className="text-[#2C3E50] font-bold text-xs">当日实际消纳率</span>
                  </div>
                </div>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartPvData}
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    barGap={2}
                    barCategoryGap="16%"
                    onMouseMove={(state: any) => {
                      if (state && typeof state.activeTooltipIndex === 'number') {
                        setHoveredPvIndex(state.activeTooltipIndex);
                      }
                    }}
                    onMouseLeave={() => setHoveredPvIndex(null)}
                  >
                    <AiSimChartDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEDF2" />
                    <XAxis dataKey="day" scale="band" axisLine={{ stroke: "#EAEDF2" }} tickLine={false} tick={<DynamicXAxisTick />} interval={0} />
                    <YAxis axisLine={{ stroke: "#EAEDF2" }} tickLine={false} tick={{ fill: "#7F8C8D", fontSize: 10 }} tickFormatter={(val) => `${val}%`} domain={[0, 110]} />
                    <Tooltip
                      cursor={{ fill: "#F4F6F9" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        const simPv = data.simulatedPv || 0;
                        const aiPv = data.aiPv || 0;
                        const diff = data.diffPv || parseFloat((aiPv - simPv).toFixed(1));
                        const isSimulated = data.isSimulatedDay;
                        const strategyName = data.strategyName;

                        return (
                          <div className="bg-white p-3.5 rounded-xl border border-[#EAEDF2] shadow-xl min-w-[240px]">
                            <div className="flex items-center justify-between font-bold text-[#1A2A3A] text-xs mb-2 pb-1 border-b border-[#EAEDF2]">
                              <span className="text-sm font-extrabold">{label} · 光伏消纳对比</span>
                              {isSimulated && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  AI 策略模拟
                                </span>
                              )}
                            </div>
                            {/* 当天模拟策略名称 */}
                            <div className="flex items-center justify-between text-xs text-[#2C3E50] bg-[#F8FAFC] p-2 rounded-lg border border-[#EAEDF2] mb-2">
                              <span className="text-[11px] text-[#7F8C8D] font-medium">当天模拟策略:</span>
                              <span className="font-bold text-[#1A2A3A] truncate max-w-[145px] text-right" title={strategyName}>
                                {strategyName}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" />
                                  <span className="text-[#7F8C8D] font-medium">模拟策略消纳率:</span>
                                </div>
                                <span className="font-bold text-[#2C3E50]">{simPv}%</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
                                  <span className="text-[#7F8C8D] font-medium">当日实际消纳率:</span>
                                </div>
                                <span className="font-bold text-[#10B981]">{aiPv}%</span>
                              </div>
                              <div className="pt-2 border-t border-[#EAEDF2] flex items-center justify-between text-xs bg-emerald-50 p-2 rounded-lg">
                                <span className="text-emerald-800 font-bold">消纳率提升差值:</span>
                                <span className="font-black text-[#10B981]">+{diff}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    
                    {/* Comparative Side-by-Side Bars with Dashed Grid Pattern */}
                    <Bar 
                      dataKey="simulatedPv" 
                      name="模拟策略消纳率" 
                      radius={[3, 3, 0, 0]} 
                      barSize={8}
                    >
                      {chartPvData.map((entry, index) => {
                        const isSimWithAi = isDaySimulatedWithAi(parseInt(entry.day));
                        return (
                          <Cell
                            key={`cell-pv-sim-${index}`}
                            fill={isSimWithAi ? "url(#aiSimGridPatternAmber)" : "#F59E0B"}
                            fillOpacity={isSimWithAi ? 1 : 0.85}
                            stroke={isSimWithAi ? "#D97706" : "none"}
                            strokeDasharray={isSimWithAi ? "2 2" : "none"}
                            strokeWidth={isSimWithAi ? 1 : 0}
                          />
                        );
                      })}
                    </Bar>
                    <Bar 
                      dataKey="aiPv" 
                      name="当日实际消纳率" 
                      radius={[3, 3, 0, 0]} 
                      barSize={8}
                    >
                      {chartPvData.map((entry, index) => {
                        const isAiSim = entry.isSimulatedDay && isDaySimulatedWithAi(parseInt(entry.day));
                        return (
                          <Cell
                            key={`cell-pv-ai-${index}`}
                            fill={isAiSim ? "url(#aiSimGridPatternEmerald)" : "#10B981"}
                            stroke={isAiSim ? "#059669" : "none"}
                            strokeDasharray={isAiSim ? "2 2" : "none"}
                            strokeWidth={isAiSim ? 1 : 0}
                          />
                        );
                      })}
                      <LabelList content={renderPvDiffLabel} />
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 分割线 */}
            <div className="my-6 border-t border-[#EAEDF2]" />

            {/* 下图：每日光伏限电止损评估 (每日限电止损金额与限电电量统计 + 96点微电网穿透) */}
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                  <span className="text-xs font-bold text-[#2C3E50]">每日光伏限电止损评估</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                    微电网负电价 / 限电调控减亏
                  </span>
                </div>
                
                {/* 右上角统计胶囊 (与每日储能充放电均价和套利统计风格一致) */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#EAEDF2] text-[#2C3E50] px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs">
                    <div className="w-2 h-2 rounded-full bg-[#D97706]" />
                    <span className="text-[#7F8C8D]">全月限电电量</span>
                    <span className="font-extrabold text-[#1A2A3A]">232.0 kWh</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>全月累计止损</span>
                    <span className="font-extrabold text-emerald-700">+¥2,140.00</span>
                  </div>
                </div>
              </div>

              {/* 图例与说明 */}
              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2]">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-xs bg-[#10B981]"></div>
                    <span className="text-[#2C3E50] font-bold text-xs">每日限电止损金额 (元)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-xs bg-[#EF4444]"></div>
                    <span className="text-[#2C3E50] font-bold text-xs">限电考核调整 (负值)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 bg-[#F59E0B] rounded-full"></div>
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
                    <span className="text-[#2C3E50] font-bold text-xs">限电电量 (kWh)</span>
                  </div>
                </div>
              </div>

              {/* 限电止损组合图 */}
              <div className="h-[230px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={curtailmentDataList}
                    margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                    barGap={2}
                    barCategoryGap="18%"
                    onClick={(state: any) => {
                      if (state && state.activeLabel) {
                        setSelectedCurtailDay(state.activeLabel);
                        setIsCurtailModalOpen(true);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEDF2" />
                    <XAxis dataKey="day" scale="band" axisLine={{ stroke: "#EAEDF2" }} tickLine={false} tick={<DynamicXAxisTick />} interval={0} />
                    {/* 左 Y 轴：止损金额 (元) */}
                    <YAxis 
                      yAxisId="left"
                      axisLine={{ stroke: "#EAEDF2" }} 
                      tickLine={false} 
                      tick={{ fill: "#7F8C8D", fontSize: 10 }} 
                      tickFormatter={(val) => `¥${val}`} 
                      domain={[-100, 650]}
                    />
                    {/* 右 Y 轴：限电电量 (kWh) */}
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      axisLine={{ stroke: "#EAEDF2" }} 
                      tickLine={false} 
                      tick={{ fill: "#D97706", fontSize: 10 }} 
                      tickFormatter={(val) => `${val}k`} 
                      domain={[0, 60]}
                    />
                    <Tooltip
                      cursor={{ fill: "#F4F6F9" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        const loss = data.lossSaved || 0;
                        const energy = data.curtailedEnergy || 0;
                        const isCurtailDay = loss !== 0 || energy !== 0;

                        return (
                          <div className="bg-white p-3.5 rounded-xl border border-[#EAEDF2] shadow-xl min-w-[240px]">
                            <div className="flex items-center justify-between font-bold text-[#1A2A3A] text-xs mb-2 pb-1 border-b border-[#EAEDF2]">
                              <span className="text-sm font-extrabold">{label} · 光伏限电评估</span>
                              {isCurtailDay ? (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${loss >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                  {loss >= 0 ? "限电消纳减亏" : "考核调整"}
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-medium">
                                  无弃光/限电
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[#7F8C8D]">限电止损金额:</span>
                                <span className={`font-mono font-bold ${loss > 0 ? "text-[#10B981]" : loss < 0 ? "text-[#EF4444]" : "text-[#7F8C8D]"}`}>
                                  {loss > 0 ? `+¥${loss.toFixed(2)}` : loss < 0 ? `-¥${Math.abs(loss).toFixed(2)}` : "¥0.00"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[#7F8C8D]">限电电量:</span>
                                <span className="font-mono font-bold text-[#D97706]">{energy.toFixed(1)} kWh</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-[#7F8C8D] bg-[#F8FAFC] p-1.5 rounded">
                                <span>分时电价状态:</span>
                                <span className="font-medium text-[#2C3E50]">{loss >= 0 && energy > 0 ? "负电价时段入储" : loss < 0 ? "偏差调整" : "常规电价"}</span>
                              </div>

                              {isCurtailDay && (
                                <div className="pt-2 border-t border-[#EAEDF2] flex items-center justify-center text-[11px] text-[#D97706] font-bold">
                                  🔍 点击查看 96 点穿透分析曲线
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }}
                    />

                    {/* 每日限电止损柱状图 */}
                    <Bar
                      yAxisId="left"
                      dataKey="lossSaved"
                      name="限电止损金额 (元)"
                      radius={[3, 3, 0, 0]}
                      barSize={8}
                    >
                      {curtailmentDataList.map((entry, index) => {
                        let barFill = "#10B981";
                        if (entry.lossSaved < 0) {
                          barFill = "#EF4444";
                        } else if (entry.lossSaved === 0) {
                          barFill = "#E2E8F0";
                        }
                        return (
                          <Cell
                            key={`cell-curtail-${index}`}
                            fill={barFill}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        );
                      })}
                    </Bar>

                    {/* 每日限电电量折线 */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="curtailedEnergy"
                      name="限电电量 (kWh)"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ r: 2, fill: "#F59E0B", stroke: "#ffffff", strokeWidth: 1.5 }}
                      activeDot={{ r: 5, stroke: "#D97706", strokeWidth: 2, className: "cursor-pointer" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* 展开/收起 31 天限电止损明细数据表 */}
              <div className="mt-4 pt-3 border-t border-[#EAEDF2]">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsTableExpanded(!isTableExpanded)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#2C3E50] hover:text-[#1A2A3A] transition-colors cursor-pointer"
                  >
                    <span>{isTableExpanded ? "收起 31 天限电明细表" : "展开查看 31 天限电止损明细数据"}</span>
                    {isTableExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isTableExpanded && (
                  <div className="mt-3 overflow-x-auto rounded-xl border border-[#EAEDF2]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-[#7F8C8D] font-bold border-b border-[#EAEDF2]">
                        <tr>
                          <th className="py-2.5 px-3">日期</th>
                          <th className="py-2.5 px-3">限电止损金额 (元)</th>
                          <th className="py-2.5 px-3">限电电量 (kWh)</th>
                          <th className="py-2.5 px-3">调度策略</th>
                          <th className="py-2.5 px-3 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAEDF2]">
                        {curtailmentDataList.map((row) => (
                          <tr key={`table-curtail-${row.day}`} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-2 px-3 font-bold text-[#1A2A3A]">{row.day}</td>
                            <td className={`py-2 px-3 font-mono font-bold ${row.lossSaved > 0 ? "text-[#10B981]" : row.lossSaved < 0 ? "text-[#EF4444]" : "text-[#7F8C8D]"}`}>
                              {row.lossSaved > 0 ? `+¥${row.lossSaved.toFixed(2)}` : row.lossSaved < 0 ? `-¥${Math.abs(row.lossSaved).toFixed(2)}` : "¥0.00"}
                            </td>
                            <td className="py-2 px-3 font-mono text-[#D97706]">{row.curtailedEnergy.toFixed(1)} kWh</td>
                            <td className="py-2 px-3 text-[#2C3E50]">
                              {row.lossSaved > 0 ? "光伏入储消纳 / 避免负电价" : row.lossSaved < 0 ? "考核策略微调" : "全额直接消纳"}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCurtailDay(row.day);
                                  setIsCurtailModalOpen(true);
                                }}
                                className="text-[11px] font-bold text-[#D97706] hover:text-[#B45309] hover:underline cursor-pointer"
                              >
                                96点穿透
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

              {/* Chart 3: 本月运行策略储能充放电统计 (日充放电对比 + 每日储能利用率折线) */}
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(26,42,58,0.06)] border border-[#EAEDF2] flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-[#1A2A3A]">
                      本月运行策略储能充放电统计 (策略对比)
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                      充放深度与利用率
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2]">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* 充放电柱状图例 */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#FB923C]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        模拟策略放电 (基准)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#10B981]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        当日实际放电 (优化)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#3B82F6]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        模拟策略充电 (基准)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#059669]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        当日实际充电 (优化)
                      </span>
                    </div>

                    {/* 储能利用率折线图例 */}
                    <div className="h-3 w-px bg-[#EAEDF2] hidden sm:block"></div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-0.5 border-t-2 border-dashed border-[#A855F7]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        模拟储能利用率 (基准)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-1 rounded-full bg-[#4F46E5]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        当日实际储能利用率 (优化)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-[430px] w-full mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartEssData}
                      stackOffset="sign"
                      margin={{ top: 20, right: 15, left: -10, bottom: 25 }}
                      barGap={2}
                      barCategoryGap="16%"
                      onMouseMove={(state: any) => {
                        if (state && typeof state.activeTooltipIndex === 'number') {
                          setHoveredEssIndex(state.activeTooltipIndex);
                        }
                      }}
                      onMouseLeave={() => setHoveredEssIndex(null)}
                    >
                      <AiSimChartDefs />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#EAEDF2"
                      />
                      <ReferenceLine yAxisId="left" y={0} stroke="#EAEDF2" strokeWidth={1} />
                      <XAxis
                        dataKey="day"
                        scale="band"
                        axisLine={{ stroke: "#EAEDF2" }}
                        tickLine={false}
                        tick={<DynamicXAxisTick />}
                        interval={0}
                      />
                      <YAxis
                        yAxisId="left"
                        axisLine={{ stroke: "#EAEDF2" }}
                        tickLine={false}
                        tick={{ fill: "#7F8C8D", fontSize: 10 }}
                        tickFormatter={(val) => `${Math.abs(val)}`}
                        domain={essYDomain}
                        label={{
                          value: "电量 (kWh)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#7F8C8D",
                          fontSize: 10,
                          offset: 15,
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={{ stroke: "#EAEDF2" }}
                        tickLine={false}
                        tick={{ fill: "#4F46E5", fontSize: 10 }}
                        tickFormatter={(val) => `${val}%`}
                        domain={[0, 100]}
                        label={{
                          value: "储能利用率 (%)",
                          angle: 90,
                          position: "insideRight",
                          fill: "#4F46E5",
                          fontSize: 10,
                          offset: 15,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "#F4F6F9" }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          const isSimulated = data.isSimulatedDay;
                          const simDis = data.simulatedDischarge || 0;
                          const aiDis = data.aiDischarge || 0;
                          const diffDis = data.diffDischarge || (aiDis - simDis);

                          const simChg = Math.abs(data.simulatedCharge || 0);
                          const aiChg = Math.abs(data.aiCharge || 0);
                          const diffChg = data.diffCharge || (aiChg - simChg);
                          const strategyName = data.strategyName;
                          
                          return (
                            <div className="bg-white p-3.5 rounded-xl border border-[#EAEDF2] shadow-xl min-w-[260px]">
                              <div className="flex items-center justify-between font-bold text-[#1A2A3A] text-xs mb-2 pb-1.5 border-b border-[#EAEDF2]">
                                <span className="text-sm font-extrabold">{label} · 储能充放与利用率对比</span>
                                {isSimulated && (
                                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    AI 策略模拟
                                  </span>
                                )}
                              </div>
                              {/* 当天模拟策略名称 */}
                              <div className="flex items-center justify-between text-xs text-[#2C3E50] bg-[#F8FAFC] p-2 rounded-lg border border-[#EAEDF2] mb-2">
                                <span className="text-[11px] text-[#7F8C8D] font-medium">当天模拟策略:</span>
                                <span className="font-bold text-[#1A2A3A] truncate max-w-[155px] text-right" title={strategyName}>
                                  {strategyName}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {/* 储能利用率板块 */}
                                <div className="p-2 bg-indigo-50/70 rounded-lg space-y-1 border border-indigo-100">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-0.5 border-t-2 border-dashed border-[#A855F7]" />
                                      <span className="text-[#7F8C8D] font-medium">模拟储能利用率:</span>
                                    </div>
                                    <span className="font-bold text-[#2C3E50]">{data.simulatedUtilRate}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-1 rounded-full bg-[#4F46E5]" />
                                      <span className="text-[#7F8C8D] font-medium">当日实际利用率:</span>
                                    </div>
                                    <span className="font-bold text-[#4F46E5]">{data.aiUtilRate}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-100">
                                    <span className="text-indigo-900 font-bold text-[11px]">利用率提升差值:</span>
                                    <span className="font-black text-[#4F46E5] text-[11px]">
                                      {data.diffUtilRate >= 0 ? `+${data.diffUtilRate}%` : `${data.diffUtilRate}%`}
                                    </span>
                                  </div>
                                </div>

                                {/* 放电电量对比 */}
                                <div className="p-2 bg-[#F8FAFC] rounded-lg space-y-1 border border-[#EAEDF2]">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-xs bg-[#FB923C]" />
                                      <span className="text-[#7F8C8D] font-medium">模拟策略放电:</span>
                                    </div>
                                    <span className="font-bold text-[#2C3E50]">{simDis.toLocaleString()} kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
                                      <span className="text-[#7F8C8D] font-medium">当日实际放电:</span>
                                    </div>
                                    <span className="font-bold text-[#10B981]">{aiDis.toLocaleString()} kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAEDF2]">
                                    <span className="text-emerald-800 font-bold text-[11px]">放电提升差值:</span>
                                    <span className="font-black text-[#10B981] text-[11px]">+{diffDis.toLocaleString()} kWh</span>
                                  </div>
                                </div>

                                {/* 充电电量对比 */}
                                <div className="p-2 bg-[#F8FAFC] rounded-lg space-y-1 border border-[#EAEDF2]">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]" />
                                      <span className="text-[#7F8C8D] font-medium">模拟策略充电:</span>
                                    </div>
                                    <span className="font-bold text-[#2C3E50]">{simChg.toLocaleString()} kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-xs bg-[#059669]" />
                                      <span className="text-[#7F8C8D] font-medium">当日实际充电:</span>
                                    </div>
                                    <span className="font-bold text-[#059669]">{aiChg.toLocaleString()} kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAEDF2]">
                                    <span className="text-emerald-800 font-bold text-[11px]">充电调度提升差值:</span>
                                    <span className="font-black text-[#059669] text-[11px]">+{diffChg.toLocaleString()} kWh</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      
                      {/* Left Column: 模拟策略充放电（上下垂直对齐在同一柱位 stackId="simulated"） */}
                      <Bar 
                        yAxisId="left"
                        dataKey="simulatedDischarge" 
                        name="模拟策略放电" 
                        stackId="simulated"
                        radius={[3, 3, 0, 0]} 
                        barSize={8} 
                      >
                        {chartEssData.map((entry, index) => {
                          const isSimWithAi = isDaySimulatedWithAi(parseInt(entry.day));
                          return (
                            <Cell
                              key={`cell-ess-dis-sim-${index}`}
                              fill={isSimWithAi ? "url(#aiSimGridPatternOrange)" : "#FB923C"}
                              fillOpacity={isSimWithAi ? 1 : 0.85}
                              stroke={isSimWithAi ? "#EA580C" : "none"}
                              strokeDasharray={isSimWithAi ? "2 2" : "none"}
                              strokeWidth={isSimWithAi ? 1 : 0}
                            />
                          );
                        })}
                      </Bar>
                      <Bar 
                        yAxisId="left"
                        dataKey="simulatedCharge" 
                        name="模拟策略充电" 
                        stackId="simulated"
                        radius={[0, 0, 3, 3]} 
                        barSize={8} 
                      >
                        {chartEssData.map((entry, index) => {
                          const isSimWithAi = isDaySimulatedWithAi(parseInt(entry.day));
                          return (
                            <Cell
                              key={`cell-ess-chg-sim-${index}`}
                              fill={isSimWithAi ? "url(#aiSimGridPatternBlue)" : "#3B82F6"}
                              fillOpacity={isSimWithAi ? 1 : 0.85}
                              stroke={isSimWithAi ? "#2563EB" : "none"}
                              strokeDasharray={isSimWithAi ? "2 2" : "none"}
                              strokeWidth={isSimWithAi ? 1 : 0}
                            />
                          );
                        })}
                      </Bar>

                      {/* Right Column: 当日实际充放电（上下垂直对齐在同一柱位 stackId="actual"） */}
                      <Bar 
                        yAxisId="left"
                        dataKey="aiDischarge" 
                        name="当日实际放电" 
                        stackId="actual"
                        radius={[3, 3, 0, 0]} 
                        barSize={8}
                      >
                        {chartEssData.map((entry, index) => {
                          const isAiSim = entry.isSimulatedDay && isDaySimulatedWithAi(parseInt(entry.day));
                          return (
                            <Cell
                              key={`cell-ess-dis-ai-${index}`}
                              fill={isAiSim ? "url(#aiSimGridPatternEmerald)" : "#10B981"}
                              stroke={isAiSim ? "#059669" : "none"}
                              strokeDasharray={isAiSim ? "2 2" : "none"}
                              strokeWidth={isAiSim ? 1 : 0}
                            />
                          );
                        })}
                        <LabelList content={renderEssDischargeDiffLabel} />
                      </Bar>
                      <Bar 
                        yAxisId="left"
                        dataKey="aiCharge" 
                        name="当日实际充电" 
                        stackId="actual"
                        radius={[0, 0, 3, 3]} 
                        barSize={8}
                      >
                        {chartEssData.map((entry, index) => {
                          const isAiSim = entry.isSimulatedDay && isDaySimulatedWithAi(parseInt(entry.day));
                          return (
                            <Cell
                              key={`cell-ess-chg-ai-${index}`}
                              fill={isAiSim ? "url(#aiSimGridPatternDarkEmerald)" : "#059669"}
                              stroke={isAiSim ? "#047857" : "none"}
                              strokeDasharray={isAiSim ? "2 2" : "none"}
                              strokeWidth={isAiSim ? 1 : 0}
                            />
                          );
                        })}
                        <LabelList content={renderEssChargeDiffLabel} />
                      </Bar>

                      {/* 模拟储能利用率折线 (基准) - 直线折线图 */}
                      <Line
                        yAxisId="right"
                        type="linear"
                        dataKey="simulatedUtilRate"
                        name="模拟储能利用率"
                        stroke="#A855F7"
                        strokeWidth={1.8}
                        strokeDasharray="4 3"
                        dot={{ r: 2, fill: "#A855F7", strokeWidth: 1 }}
                        activeDot={{ r: 4.5, stroke: "#ffffff", strokeWidth: 2 }}
                      />

                      {/* 当日实际储能利用率折线 (优化) - 直线折线图 */}
                      <Line
                        yAxisId="right"
                        type="linear"
                        dataKey="aiUtilRate"
                        name="当日实际储能利用率"
                        stroke="#4F46E5"
                        strokeWidth={2.5}
                        dot={{ r: 2.5, fill: "#4F46E5", stroke: "#ffffff", strokeWidth: 1.5 }}
                        activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: 本月每日储能充放电均价与度电套利统计 (日充电成本·放电价格·价差空间) */}
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(26,42,58,0.06)] border border-[#EAEDF2] flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-[#1A2A3A]">
                      每日储能充放电均价与套利统计
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                      度电电价与利差趋势
                    </span>
                  </div>
                  
                  {/* 右上角统计胶囊 */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#EAEDF2] text-[#2C3E50] px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs">
                      <div className="w-2 h-2 rounded-full bg-[#6366F1]" />
                      <span className="text-[#7F8C8D]">全月充放均价差</span>
                      <span className="font-extrabold text-[#1A2A3A]">{simulationSchedule ? "0.614" : "0.567"} 元/kWh</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>AI度电套利增益</span>
                      <span className="font-extrabold text-amber-700">+{simulationSchedule ? "0.142" : "0.115"} 元/kWh</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#EAEDF2]">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* 图例 */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#10B981]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        当日平均充电成本 (优化)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-0.5 border-t-2 border-dashed border-[#3B82F6]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        模拟充电成本 (基准)
                      </span>
                    </div>
                    <div className="h-3 w-px bg-[#EAEDF2] hidden sm:block"></div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#F97316]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        当日平均放电价格 (优化)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-0.5 border-t-2 border-dashed border-[#A855F7]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        模拟放电价格 (基准)
                      </span>
                    </div>
                    <div className="h-3 w-px bg-[#EAEDF2] hidden sm:block"></div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-[#6366F1]"></div>
                      <span className="text-[#2C3E50] font-bold text-xs">
                        充放价差·套利空间 (柱状)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-[340px] w-full mt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartEssPriceData}
                      margin={{ top: 20, right: 15, left: -10, bottom: 5 }}
                      barGap={2}
                      barCategoryGap="20%"
                      onMouseMove={(state: any) => {
                        if (state && typeof state.activeTooltipIndex === 'number') {
                          setHoveredPriceIndex(state.activeTooltipIndex);
                        }
                      }}
                      onMouseLeave={() => setHoveredPriceIndex(null)}
                    >
                      <AiSimChartDefs />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEDF2" />
                      <XAxis dataKey="day" scale="band" axisLine={{ stroke: "#EAEDF2" }} tickLine={false} tick={<DynamicXAxisTick />} interval={0} />
                      <YAxis
                        axisLine={{ stroke: "#EAEDF2" }}
                        tickLine={false}
                        tick={{ fill: "#7F8C8D", fontSize: 10 }}
                        tickFormatter={(val) => `¥${val.toFixed(2)}`}
                        domain={[0, 1.2]}
                        label={{
                          value: "电价 (元/kWh)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#7F8C8D",
                          fontSize: 10,
                          offset: 15,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "#F4F6F9" }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          const isSimulated = data.isSimulatedDay;
                          const strategyName = data.strategyName;

                          return (
                            <div className="bg-white p-3.5 rounded-xl border border-[#EAEDF2] shadow-xl min-w-[260px]">
                              <div className="flex items-center justify-between font-bold text-[#1A2A3A] text-xs mb-2 pb-1.5 border-b border-[#EAEDF2]">
                                <span className="text-sm font-extrabold">{label} · 储能充放均价与套利</span>
                                {isSimulated && (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    AI 策略模拟
                                  </span>
                                )}
                              </div>
                              
                              {/* 当天模拟策略名称 */}
                              <div className="flex items-center justify-between text-xs text-[#2C3E50] bg-[#F8FAFC] p-2 rounded-lg border border-[#EAEDF2] mb-2">
                                <span className="text-[11px] text-[#7F8C8D] font-medium">当天模拟策略:</span>
                                <span className="font-bold text-[#1A2A3A] truncate max-w-[155px] text-right" title={strategyName}>
                                  {strategyName}
                                </span>
                              </div>

                              <div className="space-y-2 text-xs">
                                {/* 放电价格对比 */}
                                <div className="p-2 bg-[#F8FAFC] rounded-lg space-y-1 border border-[#EAEDF2]">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-xs bg-[#F97316]" />
                                      <span className="text-[#7F8C8D] font-medium">当日平均放电价格:</span>
                                    </div>
                                    <span className="font-bold text-[#F97316]">¥{data.aiDischargePrice.toFixed(3)} /kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-[#7F8C8D]">
                                    <span>模拟基准放电均价:</span>
                                    <span className="font-semibold text-[#2C3E50]">¥{data.simulatedDischargePrice.toFixed(3)} /kWh</span>
                                  </div>
                                </div>

                                {/* 充电成本对比 */}
                                <div className="p-2 bg-[#F8FAFC] rounded-lg space-y-1 border border-[#EAEDF2]">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
                                      <span className="text-[#7F8C8D] font-medium">当日平均充电成本:</span>
                                    </div>
                                    <span className="font-bold text-[#10B981]">¥{data.aiChargePrice.toFixed(3)} /kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-[#7F8C8D]">
                                    <span>模拟基准充电成本:</span>
                                    <span className="font-semibold text-[#2C3E50]">¥{data.simulatedChargePrice.toFixed(3)} /kWh</span>
                                  </div>
                                </div>

                                {/* 套利价差汇总 */}
                                <div className="p-2 bg-indigo-50/70 rounded-lg border border-indigo-100 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-indigo-950 font-bold">实际充放价差 (套利空间):</span>
                                    <span className="font-black text-[#6366F1]">¥{data.actualSpread.toFixed(3)} /kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#7F8C8D]">基准价差: ¥{data.simulatedSpread.toFixed(3)}</span>
                                    <span className="text-[#6366F1] font-bold">
                                      {data.diffSpread > 0 ? `利差扩大 +¥${data.diffSpread.toFixed(3)} (+${data.diffSpreadPercent}%)` : `持平`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />

                      {/* 充放价差 (度电利差) 柱状图 */}
                      <Bar
                        dataKey="actualSpread"
                        name="充放价差 (套利空间)"
                        radius={[3, 3, 0, 0]}
                        barSize={10}
                      >
                        {chartEssPriceData.map((entry, index) => {
                          const isAiSim = entry.isSimulatedDay && isDaySimulatedWithAi(entry.dayNum);
                          return (
                            <Cell
                              key={`cell-ess-price-spread-${index}`}
                              fill={isAiSim ? "url(#aiSimGridPatternIndigo)" : "#6366F1"}
                              fillOpacity={0.8}
                            />
                          );
                        })}
                        <LabelList content={renderPriceSpreadDiffLabel} />
                      </Bar>

                      {/* 模拟放电价格 (虚线) */}
                      <Line
                        type="linear"
                        dataKey="simulatedDischargePrice"
                        name="模拟放电价格"
                        stroke="#A855F7"
                        strokeWidth={1.8}
                        strokeDasharray="4 3"
                        dot={false}
                        activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 1.5 }}
                      />

                      {/* 当日实际放电价格 (实线) */}
                      <Line
                        type="linear"
                        dataKey="aiDischargePrice"
                        name="当日放电价格"
                        stroke="#F97316"
                        strokeWidth={2.5}
                        dot={{ r: 2.5, fill: "#F97316", stroke: "#ffffff", strokeWidth: 1.5 }}
                        activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
                      />

                      {/* 模拟充电成本 (虚线) */}
                      <Line
                        type="linear"
                        dataKey="simulatedChargePrice"
                        name="模拟充电成本"
                        stroke="#3B82F6"
                        strokeWidth={1.8}
                        strokeDasharray="4 3"
                        dot={false}
                        activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 1.5 }}
                      />

                      {/* 当日实际充电成本 (实线) */}
                      <Line
                        type="linear"
                        dataKey="aiChargePrice"
                        name="当日充电成本"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        dot={{ r: 2.5, fill: "#10B981", stroke: "#ffffff", strokeWidth: 1.5 }}
                        activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

      {/* 96点微电网光伏限电与止损穿透分析弹窗 */}
      {isCurtailModalOpen && (() => {
        const points96 = get96PointsForDay(selectedCurtailDay);
        const dayItem = curtailmentDataList.find(d => d.day === selectedCurtailDay) || { lossSaved: 0, curtailedEnergy: 0 };
        const totalTheo = points96.reduce((acc, p) => acc + p.theoreticalGen, 0);
        const totalAct = points96.reduce((acc, p) => acc + p.actualGen, 0);
        const totalCurt = points96.reduce((acc, p) => acc + p.curtailedGen, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#EAEDF2] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-[#EAEDF2] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#1A2A3A]">
                        {selectedCurtailDay} · 96点微电网光伏限电与止损穿透分析
                      </h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                        15分钟级分辨率
                      </span>
                    </div>
                    <p className="text-xs text-[#7F8C8D] mt-0.5">
                      河北用户侧微电网 · 结合分时电价与光伏出力智能调控策略
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowExportToast(true);
                      setTimeout(() => setShowExportToast(false), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#2C3E50] border border-[#EAEDF2] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>导出数据 (Excel)</span>
                  </button>
                  <button
                    onClick={() => setIsCurtailModalOpen(false)}
                    className="p-1.5 text-[#7F8C8D] hover:text-[#1A2A3A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                
                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2]">
                    <span className="text-[11px] text-[#7F8C8D] font-medium block">理论光伏发电量</span>
                    <span className="text-base font-black text-[#1A2A3A] font-sans mt-0.5 block">
                      {totalTheo.toFixed(1)} <span className="text-xs font-normal text-[#7F8C8D]">kWh</span>
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2]">
                    <span className="text-[11px] text-[#7F8C8D] font-medium block">实际消纳发电量</span>
                    <span className="text-base font-black text-[#10B981] font-sans mt-0.5 block">
                      {totalAct.toFixed(1)} <span className="text-xs font-normal text-[#7F8C8D]">kWh</span>
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#EAEDF2]">
                    <span className="text-[11px] text-[#7F8C8D] font-medium block">限电削减/入储量</span>
                    <span className="text-base font-black text-[#D97706] font-sans mt-0.5 block">
                      {totalCurt.toFixed(1)} <span className="text-xs font-normal text-[#7F8C8D]">kWh</span>
                    </span>
                  </div>
                  <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-emerald-800 font-bold block">当日实现限电止损</span>
                    <span className="text-base font-black text-[#10B981] font-sans mt-0.5 block">
                      {dayItem.lossSaved > 0 ? `+¥${dayItem.lossSaved.toFixed(2)}` : dayItem.lossSaved < 0 ? `-¥${Math.abs(dayItem.lossSaved).toFixed(2)}` : "¥0.00"}
                    </span>
                  </div>
                </div>

                {/* 96 Points Chart */}
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#EAEDF2]">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1A2A3A]">00:00 ~ 24:00 逐 15 分钟出力与电价穿透曲线</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1 bg-[#F59E0B] rounded-full" />
                        <span className="text-[#7F8C8D]">理论出力 (kWh)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1 bg-[#10B981] rounded-full" />
                        <span className="text-[#7F8C8D]">实际出力 (kWh)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-2 bg-amber-200 rounded-xs" />
                        <span className="text-[#7F8C8D]">限电/入储削峰</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-1 bg-[#2563EB] rounded-full" />
                        <span className="text-[#7F8C8D]">实时电价 (元/kWh)</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={points96}
                        margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEDF2" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={{ stroke: "#EAEDF2" }} 
                          tickLine={false} 
                          tick={{ fill: "#7F8C8D", fontSize: 10 }}
                          interval={7} // Show every 2 hours
                        />
                        {/* 左 Y 轴：电量 (kWh) */}
                        <YAxis 
                          yAxisId="power"
                          axisLine={{ stroke: "#EAEDF2" }} 
                          tickLine={false} 
                          tick={{ fill: "#7F8C8D", fontSize: 10 }} 
                          tickFormatter={(val) => `${val}`} 
                        />
                        {/* 右 Y 轴：电价 (元/kWh) */}
                        <YAxis 
                          yAxisId="price"
                          orientation="right"
                          axisLine={{ stroke: "#EAEDF2" }} 
                          tickLine={false} 
                          tick={{ fill: "#2563EB", fontSize: 10 }} 
                          tickFormatter={(val) => `¥${val}`} 
                          domain={[-0.4, 1.2]}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-xl border border-[#EAEDF2] shadow-xl text-xs space-y-1 min-w-[200px]">
                                <div className="font-extrabold text-[#1A2A3A] pb-1 border-b border-[#EAEDF2] flex items-center justify-between">
                                  <span>{label}</span>
                                  <span className="text-emerald-700 font-mono">止损: +¥{data.lossSaved}</span>
                                </div>
                                <div className="flex justify-between text-[#7F8C8D]">
                                  <span>理论光伏:</span>
                                  <span className="font-bold text-[#F59E0B] font-mono">{data.theoreticalGen} kWh</span>
                                </div>
                                <div className="flex justify-between text-[#7F8C8D]">
                                  <span>实际消纳:</span>
                                  <span className="font-bold text-[#10B981] font-mono">{data.actualGen} kWh</span>
                                </div>
                                <div className="flex justify-between text-[#7F8C8D]">
                                  <span>限电削减/入储:</span>
                                  <span className="font-bold text-[#D97706] font-mono">{data.curtailedGen} kWh</span>
                                </div>
                                <div className="flex justify-between text-[#7F8C8D] pt-1 border-t border-[#EAEDF2]">
                                  <span>实时分时电价:</span>
                                  <span className={`font-bold font-mono ${data.tariff < 0 ? "text-red-600 font-black" : "text-[#2563EB]"}`}>
                                    {data.tariff < 0 ? `-¥${Math.abs(data.tariff)} (负电价)` : `¥${data.tariff}`}
                                  </span>
                                </div>
                              </div>
                            );
                          }}
                        />
                        
                        {/* 理论光伏出力折线/区域 */}
                        <Line
                          yAxisId="power"
                          type="monotone"
                          dataKey="theoreticalGen"
                          name="理论出力"
                          stroke="#F59E0B"
                          strokeWidth={1.5}
                          dot={false}
                        />

                        {/* 限电削减柱状图 */}
                        <Bar
                          yAxisId="power"
                          dataKey="curtailedGen"
                          name="削减/入储量"
                          fill="#FEF3C7"
                          stroke="#F59E0B"
                          strokeWidth={1}
                        />

                        {/* 实际消纳出力折线 */}
                        <Line
                          yAxisId="power"
                          type="monotone"
                          dataKey="actualGen"
                          name="实际出力"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                        />

                        {/* 分时电价折线 */}
                        <Line
                          yAxisId="price"
                          type="stepAfter"
                          dataKey="tariff"
                          name="分时电价"
                          stroke="#2563EB"
                          strokeWidth={1.8}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 典型限电时段出力数据表片段 (11:00 ~ 14:00) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#2C3E50]">重点限电时段明细 (11:00 ~ 14:00 负电价光伏入储)</span>
                    <span className="text-[10px] text-[#7F8C8D]">采样间隔: 15分钟</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#EAEDF2]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-[#7F8C8D] font-bold border-b border-[#EAEDF2]">
                        <tr>
                          <th className="py-2 px-3">时间</th>
                          <th className="py-2 px-3">理论出力 (kWh)</th>
                          <th className="py-2 px-3">实际消纳 (kWh)</th>
                          <th className="py-2 px-3">削减/入储量 (kWh)</th>
                          <th className="py-2 px-3">分时电价 (元/kWh)</th>
                          <th className="py-2 px-3 text-right">止损增益 (元)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAEDF2]">
                        {points96.slice(44, 57).map((p, idx) => (
                          <tr key={`point-${idx}`} className="hover:bg-[#F8FAFC]">
                            <td className="py-1.5 px-3 font-bold text-[#1A2A3A]">{p.time}</td>
                            <td className="py-1.5 px-3 font-mono text-[#7F8C8D]">{p.theoreticalGen}</td>
                            <td className="py-1.5 px-3 font-mono font-bold text-[#10B981]">{p.actualGen}</td>
                            <td className="py-1.5 px-3 font-mono font-bold text-[#D97706]">{p.curtailedGen}</td>
                            <td className={`py-1.5 px-3 font-mono font-bold ${p.tariff < 0 ? "text-red-600" : "text-[#2C3E50]"}`}>
                              {p.tariff < 0 ? `-¥${Math.abs(p.tariff)}` : `¥${p.tariff}`}
                            </td>
                            <td className="py-1.5 px-3 font-mono font-bold text-[#10B981] text-right">
                              +¥{p.lossSaved}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#EAEDF2] flex items-center justify-between bg-[#F8FAFC]">
                <span className="text-xs text-[#7F8C8D]">
                  策略：在负电价与限电指令下，AI 自动将光伏余电导向储能充能，避免逆功率罚款与负电价上网损失。
                </span>
                <button
                  onClick={() => setIsCurtailModalOpen(false)}
                  className="px-4 py-2 bg-[#1A2A3A] hover:bg-[#2C3E50] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  关闭
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 导出成功 Toast 提示 */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A2A3A] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold">{selectedCurtailDay} 96点穿透数据已成功生成</div>
            <div className="text-[10px] text-slate-300">正在下载 Excel 格式报表文件...</div>
          </div>
        </div>
      )}

      <StrategyConfigModal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)} 
        onSave={() => {
          setShowConfigModal(false);
          setIsConfigSubpageOpen(true);
        }}
      />
    </div>
  );
};

export default StrategyReportPage;

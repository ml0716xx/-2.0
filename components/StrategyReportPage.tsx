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

  // Helper: check if a specific day is simulated with an AI strategy (true => dashed grid, false => solid)
  const isDaySimulatedWithAi = (dayNum: number): boolean => {
    if (simulationSchedule && simulationSchedule[dayNum]) {
      const cfg = simulationSchedule[dayNum];
      return cfg.templateId ? cfg.templateId.startsWith("tpl_ai_") : false;
    }
    return false;
  };

  // SVG Pattern Definitions for Dashed Grid textures on AI simulated bars
  const AiSimChartDefs = () => (
    <defs>
      {/* Emerald Dashed Grid Pattern for AI actual/simulation */}
      <pattern id="aiSimGridPatternEmerald" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#10b981" fillOpacity="0.22" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#059669" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>

      {/* Blue Dashed Grid Pattern for AI Simulated baseline */}
      <pattern id="aiSimGridPatternBlue" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#3b82f6" fillOpacity="0.22" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#2563eb" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>

      {/* Amber Dashed Grid Pattern for AI Simulated PV */}
      <pattern id="aiSimGridPatternAmber" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#f59e0b" fillOpacity="0.22" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#d97706" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>

      {/* Orange Dashed Grid Pattern for AI Simulated ESS Discharge */}
      <pattern id="aiSimGridPatternOrange" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#f97316" fillOpacity="0.22" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#ea580c" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>

      {/* Deep Emerald Dashed Grid Pattern for AI Simulated ESS Charge */}
      <pattern id="aiSimGridPatternDarkEmerald" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#059669" fillOpacity="0.25" />
        <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#047857" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </pattern>
    </defs>
  );

  // 1. Dynamic tick renderer that marks dates running AI with a bright/accent color without needing a legend
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
          fill={isAiDay ? "#6366f1" : "#94a3b8"}
          className="text-[10px]"
          style={{ 
            fontWeight: isAiDay ? "700" : "400",
            transition: "fill 0.2s ease"
          }}
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
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-slate-50 space-y-4 sm:space-y-6 flex flex-col">
      {/* Simulation update toast notification */}
      {showSimulationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-slate-700/60 animate-in fade-in slide-in-from-bottom-5 backdrop-blur-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>✅ 月度基准策略排程已应用，全月 31 天多基准对比收益与指标已重新完成算法回测！</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white px-6 py-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            策略运行报告
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

          {/* AI 策略运行时长占比展示 */}
          <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">AI运行时长:</span>
            <span className="font-bold text-slate-800">{simulationSchedule ? "100%" : "83.52%"}</span>
            <span className="text-slate-400 font-medium text-[11px]">({simulationSchedule ? "720.0" : "431.41"}h)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsConfigSubpageOpen(true)}
            disabled={isAnalyzing}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-md transition-all shadow-sm ${
              isAnalyzing 
                ? "bg-indigo-500/80 text-white cursor-not-allowed opacity-90" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 cursor-pointer"
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

      {/* CORE STATS CARDS & DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 shrink-0">
        {/* Card 1: 本月收益 */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800 tracking-tight">本月收益</span>
              {simulationSchedule && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-extrabold">含排程模拟</span>
              )}
            </div>
            <h3 className="text-[32px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-none mt-2 mb-4 font-sans">
              {simulationSchedule ? "8.06万元" : "7.79万元"}
            </h3>
          </div>
          <div className="bg-slate-50/90 border border-slate-100/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.015)]">
            <span className="flex items-center gap-1 font-medium">
              较基础策略 <span className="font-extrabold text-orange-500">{simulationSchedule ? "+8.33%" : "+4.82%"}</span>
            </span>
            <span className="text-slate-700 font-bold">基础 7.44万元</span>
          </div>
        </div>
        
        {/* Card 2: AI 提升收益 */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800 tracking-tight">AI提升收益</span>
              {simulationSchedule && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-extrabold">含排程模拟</span>
              )}
            </div>
            <h3 className="text-[32px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-none mt-2 mb-4 font-sans">
              {simulationSchedule ? "6,200.00元" : "3,581.87元"}
            </h3>
          </div>
          <div className="bg-slate-50/90 border border-slate-100/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.015)]">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
              <span>非AI运行日运行后可额外提升:</span>
            </span>
            <span className="font-extrabold text-emerald-600 text-xs sm:text-sm">
              +2,618.13元
            </span>
          </div>
        </div>

        {/* Card 3: 储能利用率 */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800 tracking-tight">储能利用率</span>
              {simulationSchedule && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-extrabold">含排程模拟</span>
              )}
            </div>
            <h3 className="text-[32px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-none mt-2 mb-4 font-sans">
              {simulationSchedule ? "98.20%" : "95.60%"}
            </h3>
          </div>
          <div className="bg-slate-50/90 border border-slate-100/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.015)]">
            <span className="flex items-center gap-1 font-medium">
              较基础策略 <span className="font-extrabold text-orange-500">{simulationSchedule ? "+15.00%" : "+12.40%"}</span>
            </span>
            <span className="text-slate-700 font-bold">基础 83.20%</span>
          </div>
        </div>

        {/* Card 4: 光伏消纳率 */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800 tracking-tight">光伏消纳率</span>
              {simulationSchedule && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-extrabold">含排程模拟</span>
              )}
            </div>
            <h3 className="text-[32px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-none mt-2 mb-4 font-sans">
              {simulationSchedule ? "99.10%" : "92.86%"}
            </h3>
          </div>
          <div className="bg-slate-50/90 border border-slate-100/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.015)]">
            <span className="flex items-center gap-1 font-medium">
              AI 优化 <span className="font-extrabold text-orange-500">{simulationSchedule ? "+9.11%" : "+8.61%"}</span>
            </span>
            <span className="text-slate-700 font-bold">基础消纳率 99.99%</span>
          </div>
        </div>
      </div>

      {/* MAIN CHARTS SECTION */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {/* Chart 1: 本月运行策略收益统计 (日收益对比 + 差值标记) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-800">
                  本月运行策略收益统计 (策略对比)
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200/60">
                  日收益对比
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <div className="flex flex-wrap items-center gap-4">
                {/* Comparative Legends */}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#3b82f6]"></div>
                  <span className="text-slate-700 font-bold text-xs">
                    模拟策略收益 (基准)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#10b981]"></div>
                  <span className="text-slate-700 font-bold text-xs">
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
                        cursor={{ fill: "#f1f5f9" }}
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
                            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xl min-w-[240px]">
                              <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2 pb-1.5 border-b border-slate-100">
                                <span className="text-sm font-extrabold">{label} · 收益对比</span>
                                {isSimulated && (
                                  <span className="bg-indigo-50 text-indigo-600 border border-indigo-200/60 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    AI 策略模拟
                                  </span>
                                )}
                              </div>
                              {/* 当天模拟策略名称 */}
                              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                                <span className="text-[11px] text-slate-400 font-medium">当天模拟策略:</span>
                                <span className="font-bold text-indigo-700 truncate max-w-[145px] text-right" title={strategyName}>
                                  {strategyName}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
                                    <span className="text-slate-500 font-medium">模拟策略收益:</span>
                                  </div>
                                  <span className="font-bold text-slate-700">¥{Number(simVal).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
                                    <span className="text-slate-500 font-medium">当日实际收益:</span>
                                  </div>
                                  <span className="font-bold text-emerald-600">¥{Number(aiVal).toLocaleString()}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-emerald-50/60 p-2 rounded-lg">
                                  <span className="text-emerald-800 font-bold">差值 (实际提升):</span>
                                  <span className="font-black text-emerald-600">
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
                              fill={isSimWithAi ? "url(#aiSimGridPatternBlue)" : "#3b82f6"}
                              stroke={isSimWithAi ? "#2563eb" : "none"}
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
                              fill={isAiSim ? "url(#aiSimGridPatternEmerald)" : "#10b981"}
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
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col" id="chart-solar-and-curtailment">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-slate-800">
                      AI策略光伏数据评估
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200/60">
                      日消纳率对比
                    </span>
                  </div>
                </div>

                {/* 上图：光伏消纳率对比柱状图 (AI策略 vs 模拟策略 + 差值标记) */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">每日光伏消纳率对比统计</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">1日 ~ 31日</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-[#f59e0b]"></div>
                        <span className="text-slate-700 font-bold text-xs">模拟策略消纳率 (基准)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-[#10b981]"></div>
                        <span className="text-slate-700 font-bold text-xs">当日实际消纳率</span>
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="day" scale="band" axisLine={{ stroke: "#94a3b8" }} tickLine={false} tick={<DynamicXAxisTick />} interval={0} />
                        <YAxis axisLine={{ stroke: "#94a3b8" }} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(val) => `${val}%`} domain={[0, 110]} />
                        <Tooltip
                          cursor={{ fill: "#f1f5f9" }}
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const data = payload[0].payload;
                            const simPv = data.simulatedPv || 0;
                            const aiPv = data.aiPv || 0;
                            const diff = data.diffPv || parseFloat((aiPv - simPv).toFixed(1));
                            const isSimulated = data.isSimulatedDay;
                            const strategyName = data.strategyName;

                            return (
                              <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xl min-w-[240px]">
                                <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2 pb-1 border-b border-slate-100">
                                  <span className="text-sm font-extrabold">{label} · 光伏消纳对比</span>
                                  {isSimulated && (
                                    <span className="bg-indigo-50 text-indigo-600 border border-indigo-200/60 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                      AI 策略模拟
                                    </span>
                                  )}
                                </div>
                                {/* 当天模拟策略名称 */}
                                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                                  <span className="text-[11px] text-slate-400 font-medium">当天模拟策略:</span>
                                  <span className="font-bold text-amber-700 truncate max-w-[145px] text-right" title={strategyName}>
                                    {strategyName}
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
                                      <span className="text-slate-500 font-medium">模拟策略消纳率:</span>
                                    </div>
                                    <span className="font-bold text-slate-700">{simPv}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
                                      <span className="text-slate-500 font-medium">当日实际消纳率:</span>
                                    </div>
                                    <span className="font-bold text-emerald-600">{aiPv}%</span>
                                  </div>
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-emerald-50/60 p-2 rounded-lg">
                                    <span className="text-emerald-800 font-bold">消纳率提升差值:</span>
                                    <span className="font-black text-emerald-600">+{diff}%</span>
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
                                fill={isSimWithAi ? "url(#aiSimGridPatternAmber)" : "#f59e0b"}
                                stroke={isSimWithAi ? "#d97706" : "none"}
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
                                fill={isAiSim ? "url(#aiSimGridPatternEmerald)" : "#10b981"}
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

                {/* 下图：每日限电止损统计 (保持权限控制) */}
                {hasCurtailmentPermission && (
                  <div className="border-t border-slate-100 pt-6 mt-2">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
                          每日限电止损统计
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200/60">
                          负电价主动规避
                        </span>
                      </div>
                      
                      {/* 右上角胶囊指标与图例 */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* 胶囊指标 1: 累计止损 */}
                        {(() => {
                          const totalLossSaved = curtailmentDataList.reduce((acc, cur) => acc + cur.lossSaved, 0);
                          const totalCurtailedEnergy = curtailmentDataList.reduce((acc, cur) => acc + cur.curtailedEnergy, 0);
                          return (
                            <>
                              <div className="flex items-center gap-1.5 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>累计净止损</span>
                                <span className="font-extrabold text-emerald-700">¥{totalLossSaved.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>

                              {/* 胶囊指标 2: 主动限电电量 */}
                              <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200/80 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium shadow-2xs">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>限电电量</span>
                                <span className="font-extrabold text-blue-700">{totalCurtailedEnergy.toFixed(1)} kWh</span>
                              </div>
                            </>
                          );
                        })()}

                        {/* 图例轴说明 */}
                        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 pl-2 border-l border-slate-200">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2 bg-blue-500 rounded-2xs inline-block" /> 止损电量 (左轴·柱状图)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-[2px] bg-emerald-500 inline-block" /> 止损金额 (右轴·折线图)
                          </span>
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
                                if (dayData && dayData.lossSaved !== 0) {
                                  setSelectedCurtailDay(clickedDay);
                                  setIsCurtailModalOpen(true);
                                }
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <ReferenceLine yAxisId="right" y={0} stroke="#cbd5e1" strokeWidth={1} />
                            <XAxis dataKey="day" axisLine={{ stroke: "#94a3b8" }} tickLine={false} tick={<DynamicXAxisTick />} interval={0} />
                            {/* 左Y轴: 电量 (kWh) */}
                            <YAxis 
                              yAxisId="left" 
                              orientation="left" 
                              axisLine={{ stroke: "#94a3b8" }} 
                              tickLine={false} 
                              tick={{ fill: "#64748b", fontSize: 10 }} 
                              tickFormatter={(val) => `${val}`}
                              label={{ value: "电量 (kWh)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10, offset: 15 }}
                            />
                            {/* 右Y轴: 金额 (元) */}
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              axisLine={{ stroke: "#94a3b8" }} 
                              tickLine={false} 
                              tick={{ fill: "#64748b", fontSize: 10 }} 
                              tickFormatter={(val) => `¥${val}`}
                              label={{ value: "金额 (元)", angle: 90, position: "insideRight", fill: "#94a3b8", fontSize: 10, offset: 15 }}
                            />
                            <Tooltip
                              cursor={{ fill: "#f8fafc" }}
                              content={({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null;
                                const data = payload[0].payload;
                                const isPositive = data.lossSaved > 0;
                                const isNegative = data.lossSaved < 0;
                                return (
                                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl min-w-[190px]">
                                    <div className="font-bold text-slate-800 text-xs mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                                      <span>7月{label} 限电止损评估</span>
                                      {isNegative && (
                                        <span className="text-[9px] px-1 py-0.5 rounded bg-rose-50 text-rose-600 font-bold border border-rose-200/60">
                                          负值考核
                                        </span>
                                      )}
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">主动限电电量:</span>
                                        <span className="font-bold text-blue-600">{data.curtailedEnergy} kWh</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">
                                          {isNegative ? "偏差/折损金额:" : "避免倒贴损失:"}
                                        </span>
                                        <span className={`font-bold ${isNegative ? "text-rose-600" : isPositive ? "text-emerald-600" : "text-slate-500"}`}>
                                          {isPositive ? `+¥${data.lossSaved}` : isNegative ? `-¥${Math.abs(data.lossSaved)}` : "¥0"}
                                        </span>
                                      </div>
                                    </div>
                                    {data.lossSaved !== 0 ? (
                                      <div className={`mt-2 text-[9px] py-1 px-1.5 rounded text-center font-bold ${isNegative ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}>
                                        点击查看 15分钟诊断明细 ↗
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
                            {/* 止损电量 (柱状图·左轴) */}
                            <Bar 
                              yAxisId="left" 
                              dataKey="curtailedEnergy" 
                              name="止损电量"
                              barSize={10} 
                              cursor="pointer"
                              fill="#3b82f6"
                              radius={[3, 3, 0, 0]}
                            />
                            {/* 止损金额 (直线折线图·右轴) */}
                            <Line 
                              yAxisId="right" 
                              type="linear" 
                              dataKey="lossSaved" 
                              name="止损金额"
                              stroke="#10b981" 
                              strokeWidth={2.5} 
                              dot={{ r: 2.5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 1.5 }} 
                              activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }} 
                            />
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

              {/* Chart 3: 本月运行策略储能充放电统计 (日充放电对比 + 每日储能利用率折线) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-slate-800">
                      本月运行策略储能充放电统计 (策略对比)
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-200/60">
                      充放深度与利用率
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* 充放电柱状图例 */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-[#f97316]"></div>
                      <span className="text-slate-700 font-bold text-xs">
                        模拟策略放电 (基准)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-[#10b981]"></div>
                      <span className="text-slate-700 font-bold text-xs">
                        当日实际放电 (优化)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-[#2563eb]"></div>
                      <span className="text-slate-700 font-bold text-xs">
                        模拟策略充电 (基准)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-[#059669]"></div>
                      <span className="text-slate-700 font-bold text-xs">
                        当日实际充电 (优化)
                      </span>
                    </div>

                    {/* 储能利用率折线图例 */}
                    <div className="h-3 w-px bg-slate-200 hidden sm:block"></div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-0.5 border-t-2 border-dashed border-[#8b5cf6]"></div>
                      <span className="text-slate-700 font-bold text-xs">
                        模拟储能利用率 (基准)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-1 rounded-full bg-[#4f46e5]"></div>
                      <span className="text-slate-700 font-bold text-xs">
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
                        stroke="#e2e8f0"
                      />
                      <ReferenceLine yAxisId="left" y={0} stroke="#94a3b8" strokeWidth={1} />
                      <XAxis
                        dataKey="day"
                        scale="band"
                        axisLine={{ stroke: "#94a3b8" }}
                        tickLine={false}
                        tick={<DynamicXAxisTick />}
                        interval={0}
                      />
                      <YAxis
                        yAxisId="left"
                        axisLine={{ stroke: "#94a3b8" }}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        tickFormatter={(val) => `${Math.abs(val)}`}
                        domain={essYDomain}
                        label={{
                          value: "电量 (kWh)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#94a3b8",
                          fontSize: 10,
                          offset: 15,
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={{ stroke: "#c7d2fe" }}
                        tickLine={false}
                        tick={{ fill: "#6366f1", fontSize: 10 }}
                        tickFormatter={(val) => `${val}%`}
                        domain={[0, 100]}
                        label={{
                          value: "储能利用率 (%)",
                          angle: 90,
                          position: "insideRight",
                          fill: "#6366f1",
                          fontSize: 10,
                          offset: 15,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f1f5f9" }}
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
                            <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xl min-w-[260px]">
                              <div className="flex items-center justify-between font-bold text-slate-800 text-xs mb-2 pb-1.5 border-b border-slate-100">
                                <span className="text-sm font-extrabold">{label} · 储能充放与利用率对比</span>
                                {isSimulated && (
                                  <span className="bg-indigo-50 text-indigo-600 border border-indigo-200/60 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    AI 策略模拟
                                  </span>
                                )}
                              </div>
                              {/* 当天模拟策略名称 */}
                              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                                <span className="text-[11px] text-slate-400 font-medium">当天模拟策略:</span>
                                <span className="font-bold text-indigo-700 truncate max-w-[155px] text-right" title={strategyName}>
                                  {strategyName}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {/* 储能利用率板块 */}
                                <div className="p-2 bg-indigo-50/70 rounded-lg space-y-1 border border-indigo-100/60">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-0.5 border-t-2 border-dashed border-[#8b5cf6]" />
                                      <span className="text-slate-600 font-medium">模拟储能利用率:</span>
                                    </div>
                                    <span className="font-bold text-slate-700">{data.simulatedUtilRate}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-1 rounded-full bg-[#4f46e5]" />
                                      <span className="text-slate-600 font-medium">当日实际利用率:</span>
                                    </div>
                                    <span className="font-bold text-indigo-700">{data.aiUtilRate}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-200/50">
                                    <span className="text-indigo-900 font-bold text-[11px]">利用率提升差值:</span>
                                    <span className="font-black text-emerald-600 text-[11px]">
                                      {data.diffUtilRate >= 0 ? `+${data.diffUtilRate}%` : `${data.diffUtilRate}%`}
                                    </span>
                                  </div>
                                </div>

                                {/* 放电电量对比 */}
                                <div className="p-2 bg-orange-50/60 rounded-lg space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#f97316]" />
                                      <span className="text-slate-600 font-medium">模拟策略放电:</span>
                                    </div>
                                    <span className="font-bold text-slate-700">{simDis.toLocaleString()} kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
                                      <span className="text-slate-600 font-medium">当日实际放电:</span>
                                    </div>
                                    <span className="font-bold text-emerald-600">{aiDis.toLocaleString()} kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-1 border-t border-orange-200/40">
                                    <span className="text-orange-800 font-bold text-[11px]">放电提升差值:</span>
                                    <span className="font-black text-emerald-600 text-[11px]">+{diffDis.toLocaleString()} kWh</span>
                                  </div>
                                </div>

                                {/* 充电电量对比 */}
                                <div className="p-2 bg-blue-50/60 rounded-lg space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]" />
                                      <span className="text-slate-600 font-medium">模拟策略充电:</span>
                                    </div>
                                    <span className="font-bold text-slate-700">{simChg.toLocaleString()} kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#059669]" />
                                      <span className="text-slate-600 font-medium">当日实际充电:</span>
                                    </div>
                                    <span className="font-bold text-emerald-600">{aiChg.toLocaleString()} kWh</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-200/40">
                                    <span className="text-blue-800 font-bold text-[11px]">充电调度提升差值:</span>
                                    <span className="font-black text-emerald-600 text-[11px]">+{diffChg.toLocaleString()} kWh</span>
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
                              fill={isSimWithAi ? "url(#aiSimGridPatternOrange)" : "#f97316"}
                              stroke={isSimWithAi ? "#ea580c" : "none"}
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
                              fill={isSimWithAi ? "url(#aiSimGridPatternBlue)" : "#2563eb"}
                              stroke={isSimWithAi ? "#1d4ed8" : "none"}
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
                              fill={isAiSim ? "url(#aiSimGridPatternEmerald)" : "#10b981"}
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
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        strokeDasharray="4 3"
                        dot={{ r: 2, fill: "#8b5cf6", strokeWidth: 1 }}
                        activeDot={{ r: 4.5, stroke: "#ffffff", strokeWidth: 2 }}
                      />

                      {/* 当日实际储能利用率折线 (优化) - 直线折线图 */}
                      <Line
                        yAxisId="right"
                        type="linear"
                        dataKey="aiUtilRate"
                        name="当日实际储能利用率"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        dot={{ r: 2.5, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 1.5 }}
                        activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

      <StrategyConfigModal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)} 
        onSave={() => {
          setShowConfigModal(false);
          setIsConfigSubpageOpen(true);
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
                const isPositive = dayData.lossSaved >= 0;
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

                    <div className={`${isPositive ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"} p-4 rounded-xl border flex items-center justify-between`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"} uppercase tracking-wider block`}>
                            {isPositive ? "当日减亏止损金额" : "当日弃电偏差/考核金额"}
                          </span>
                          <span className={`${isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"} text-[8px] font-bold px-1.5 py-0.2 rounded-full`}>
                            {isPositive ? "防倒贴" : "调峰考核"}
                          </span>
                        </div>
                        <h4 className={`text-3xl font-black ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                          {isPositive ? `¥${dayData.lossSaved}` : `-¥${Math.abs(dayData.lossSaved)}`}
                        </h4>
                      </div>
                      <div className={`w-12 h-12 ${isPositive ? "bg-emerald-600/10 text-emerald-500" : "bg-rose-600/10 text-rose-500"} rounded-xl flex items-center justify-center`}>
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
                      15分钟级运行趋势 (直线折线图)
                    </h4>
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
                          const isLossPositive = data.lossSaved > 0;
                          const isLossNegative = data.lossSaved < 0;
                          return (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl min-w-[200px] text-xs">
                              <div className="font-bold text-slate-800 mb-1.5 pb-1 border-b border-slate-100 flex justify-between">
                                <span>时段: {label}</span>
                                {isLossPositive && <span className="bg-emerald-50 text-emerald-600 px-1 py-0.1 rounded text-[8px] font-bold">防亏限电中</span>}
                                {isLossNegative && <span className="bg-rose-50 text-rose-600 px-1 py-0.1 rounded text-[8px] font-bold">考核折损中</span>}
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
                                {data.lossSaved !== 0 && (
                                  <div className="flex justify-between pt-1 border-t border-dashed border-slate-100">
                                    <span className={isLossPositive ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                                      {isLossPositive ? "主动减亏金额:" : "考核偏差金额:"}
                                    </span>
                                    <span className={`font-bold ${isLossPositive ? "text-emerald-600" : "text-rose-600"}`}>
                                      {isLossPositive ? `+¥${data.lossSaved}` : `-¥${Math.abs(data.lossSaved)}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }}
                      />
                      
                      <Line yAxisId="left" type="linear" dataKey="theoreticalGen" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line yAxisId="left" type="linear" dataKey="actualGen" stroke="#10b981" strokeWidth={2} dot={false} />
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
                      15分钟监控报表
                    </h4>
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
                          <th className="px-4 py-2.5 text-right">AI 主动止损/考核 (元)</th>
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
                            const isLossPos = row.lossSaved > 0;
                            const isLossNeg = row.lossSaved < 0;
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
                                <td className={`px-4 py-2 text-right font-mono font-bold ${isLossPos ? 'text-emerald-600' : isLossNeg ? 'text-rose-600' : 'text-slate-400'}`}>
                                  {isLossPos ? `+¥${row.lossSaved.toFixed(1)}` : isLossNeg ? `-¥${Math.abs(row.lossSaved).toFixed(1)}` : "-"}
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

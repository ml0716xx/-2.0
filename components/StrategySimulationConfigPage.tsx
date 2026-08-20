import React, { useState } from "react";
import { 
  ArrowLeft, Plus, Trash2, Check, AlertCircle, 
  Calendar, ChevronDown, Clock, Layers, Sliders,
  RefreshCw, X, CheckSquare, Square, Filter, MousePointerClick,
  Battery, PlusCircle, MinusCircle, Sparkles, BrainCircuit
} from "lucide-react";

export interface MonthlyStrategyDayConfig {
  day: string; // "1日", "2日", ...
  dayNum: number;
  weekday: string; // "周一", "周二", ...
  isWeekend: boolean;
  hasAiRunning: boolean; // Whether AI was actually running on this day in July
  mode: "template" | "ai_strategy" | "custom";
  templateId: string;
  templateName: string;
  customPeriods?: any[];
}

export interface StrategySimulationConfigPageProps {
  onBack: () => void;
  onSaveAndSimulate: (monthlySchedule: Record<number, MonthlyStrategyDayConfig>) => void;
  initialMonth?: string;
  userAiStatus?: "activated" | "not_activated";
}

// Predefined strategy templates (Both Non-AI physical templates & AI intelligent strategies)
export const PRESET_TEMPLATES = [
  // --- 非 AI 基础物理策略模板 ---
  {
    id: "tpl_arbitrage_non_ai",
    name: "峰谷套利策略（非AI-两充两放）",
    isAi: false,
    category: "常规物理策略",
    description: "标准固定峰谷套利两充两放策略，早谷段充电、尖峰放电、午间补电、晚高峰放电",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    periods: [
      {
        id: "p1",
        title: "计划时段1",
        timeRange: "00:00~02:00",
        chargeReserve: "30%",
        dischargeReserve: "30%",
        reverseFlowThreshold: "125 kW",
        strategies: [
          { id: "s1", name: "自发自用", badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50" }
        ]
      },
      {
        id: "p2",
        title: "计划时段2",
        timeRange: "02:00~06:00",
        chargeReserve: "30%",
        dischargeReserve: "30%",
        reverseFlowThreshold: "125 kW",
        strategies: [
          { id: "s2", name: "峰谷套利", badgeColor: "border-blue-500 text-blue-600 bg-blue-50" }
        ]
      },
      {
        id: "p3",
        title: "计划时段3",
        timeRange: "11:00~14:00",
        chargeReserve: "25%",
        dischargeReserve: "30%",
        reverseFlowThreshold: "100 kW",
        strategies: [
          { id: "s3", name: "自发自用", badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50" }
        ]
      },
      {
        id: "p4",
        title: "计划时段4",
        timeRange: "18:00~22:00",
        chargeReserve: "10%",
        dischargeReserve: "95%",
        reverseFlowThreshold: "150 kW",
        strategies: [
          { id: "s4", name: "峰谷套利", badgeColor: "border-blue-500 text-blue-600 bg-blue-50" }
        ]
      }
    ]
  },
  {
    id: "tpl_july_rest",
    name: "七月休息日模版（非AI-一充一放）",
    isAi: false,
    category: "常规物理策略",
    description: "针对周末及用电低谷日设计的充放电策略，避开尖峰放电，强化谷段与光伏消纳",
    badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
    periods: [
      {
        id: "rp1",
        title: "计划时段1",
        timeRange: "00:00~06:00",
        chargeReserve: "30%",
        dischargeReserve: "30%",
        reverseFlowThreshold: "125 kW",
        strategies: [
          { id: "rs1", name: "自发自用", badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50" }
        ]
      },
      {
        id: "rp2",
        title: "计划时段2",
        timeRange: "11:00~15:00",
        chargeReserve: "20%",
        dischargeReserve: "30%",
        reverseFlowThreshold: "100 kW",
        strategies: [
          { id: "rs2", name: "峰谷套利", badgeColor: "border-blue-500 text-blue-600 bg-blue-50" }
        ]
      }
    ]
  },
  {
    id: "tpl_workday_std",
    name: "七月工作日模版（非AI-两充两放）",
    isAi: false,
    category: "常规物理策略",
    description: "标准工业峰谷套利与两充两放，早谷段充电、上午尖峰放电、午间平段补电、晚高峰全力放电",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    periods: [
      {
        id: "wp1",
        title: "计划时段1",
        timeRange: "00:00~06:00",
        chargeReserve: "30%",
        dischargeReserve: "30%",
        reverseFlowThreshold: "125 kW",
        strategies: [
          { id: "ws1", name: "峰谷套利", badgeColor: "border-blue-500 text-blue-600 bg-blue-50" }
        ]
      },
      {
        id: "wp2",
        title: "计划时段2",
        timeRange: "08:30~11:30",
        chargeReserve: "10%",
        dischargeReserve: "90%",
        reverseFlowThreshold: "150 kW",
        strategies: [
          { id: "ws2", name: "峰谷套利", badgeColor: "border-blue-500 text-blue-600 bg-blue-50" }
        ]
      },
      {
        id: "wp3",
        title: "计划时段3",
        timeRange: "12:00~14:30",
        chargeReserve: "25%",
        dischargeReserve: "30%",
        reverseFlowThreshold: "100 kW",
        strategies: [
          { id: "ws3", name: "自发自用", badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50" }
        ]
      },
      {
        id: "wp4",
        title: "计划时段4",
        timeRange: "18:00~22:00",
        chargeReserve: "10%",
        dischargeReserve: "95%",
        reverseFlowThreshold: "150 kW",
        strategies: [
          { id: "ws4", name: "峰谷套利", badgeColor: "border-blue-500 text-blue-600 bg-blue-50" }
        ]
      }
    ]
  },
  {
    id: "tpl_pv_priority",
    name: "光伏自发自用消纳策略（非AI）",
    isAi: false,
    category: "常规物理策略",
    description: "以光伏自发自用与防逆流为首要目标的绿色微网策略，最大化提升光伏就地消纳率",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    periods: [
      {
        id: "pvp1",
        title: "计划时段1",
        timeRange: "08:00~17:00",
        chargeReserve: "30%",
        dischargeReserve: "30%",
        reverseFlowThreshold: "125 kW",
        strategies: [
          { id: "pvs1", name: "自发自用", badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50" }
        ]
      },
      {
        id: "pvp2",
        title: "计划时段2",
        timeRange: "18:00~22:00",
        chargeReserve: "10%",
        dischargeReserve: "90%",
        reverseFlowThreshold: "120 kW",
        strategies: [
          { id: "pvs2", name: "峰谷套利", badgeColor: "border-blue-500 text-blue-600 bg-blue-50" }
        ]
      }
    ]
  },

  // --- AI 智能策略模拟系列 ---
  {
    id: "tpl_ai_full_collab",
    name: "AI 智能全景协同策略 (多目标协同优化)",
    isAi: true,
    category: "AI 智能策略",
    description: "基于自研能源大模型，15分钟超前动态响应现货电价、负荷与光伏出力，全景实现峰谷套利、全额消纳与防逆流最优调度",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-300",
    periods: [
      {
        id: "aip1",
        title: "AI 协同计划时段1 (谷电智能补能)",
        timeRange: "00:00~07:00",
        chargeReserve: "95%",
        dischargeReserve: "5%",
        reverseFlowThreshold: "180 kW",
        strategies: [
          { id: "ais1", name: "AI 智能充电套利", badgeColor: "border-indigo-500 text-indigo-600 bg-indigo-50" },
          { id: "ais2", name: "需量防过充控制", badgeColor: "border-purple-500 text-purple-600 bg-purple-50" }
        ]
      },
      {
        id: "aip2",
        title: "AI 协同计划时段2 (上午尖峰智能放电)",
        timeRange: "08:30~11:30",
        chargeReserve: "10%",
        dischargeReserve: "95%",
        reverseFlowThreshold: "160 kW",
        strategies: [
          { id: "ais3", name: "AI 尖峰放电顶峰", badgeColor: "border-indigo-500 text-indigo-600 bg-indigo-50" },
          { id: "ais4", name: "超前负荷跟随", badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50" }
        ]
      },
      {
        id: "aip3",
        title: "AI 协同计划时段3 (午间光伏自适应补能)",
        timeRange: "11:30~14:30",
        chargeReserve: "90%",
        dischargeReserve: "15%",
        reverseFlowThreshold: "120 kW",
        strategies: [
          { id: "ais5", name: "AI 光伏全额就地消纳", badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50" },
          { id: "ais6", name: "防逆流硬约束", badgeColor: "border-amber-500 text-amber-600 bg-amber-50" }
        ]
      },
      {
        id: "aip4",
        title: "AI 协同计划时段4 (晚高峰深度放电)",
        timeRange: "18:00~22:00",
        chargeReserve: "5%",
        dischargeReserve: "98%",
        reverseFlowThreshold: "180 kW",
        strategies: [
          { id: "ais7", name: "AI 晚高峰高电价放电", badgeColor: "border-indigo-500 text-indigo-600 bg-indigo-50" },
          { id: "ais8", name: "自适应需量控制", badgeColor: "border-purple-500 text-purple-600 bg-purple-50" }
        ]
      }
    ]
  },
  {
    id: "tpl_ai_spot_price",
    name: "AI 现货动态电价峰谷套利策略 (毫秒级自适应)",
    isAi: true,
    category: "AI 智能策略",
    description: "针对电力现货市场超频浮动电价设计的自适应套利策略，实时追踪现货边际电价曲线与价差波动",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-300",
    periods: [
      {
        id: "aip_spot1",
        title: "现货时段1 (低价/负电价吸纳)",
        timeRange: "00:00~08:00",
        chargeReserve: "98%",
        dischargeReserve: "5%",
        reverseFlowThreshold: "200 kW",
        strategies: [
          { id: "aiss1", name: "现货谷电补能", badgeColor: "border-purple-500 text-purple-600 bg-purple-50" },
          { id: "aiss2", name: "负电价主动吸纳", badgeColor: "border-rose-500 text-rose-600 bg-rose-50" }
        ]
      },
      {
        id: "aip_spot2",
        title: "现货时段2 (现货边际高价放电)",
        timeRange: "08:30~12:00",
        chargeReserve: "5%",
        dischargeReserve: "95%",
        reverseFlowThreshold: "160 kW",
        strategies: [
          { id: "aiss3", name: "现货尖峰高价放电", badgeColor: "border-purple-500 text-purple-600 bg-purple-50" }
        ]
      },
      {
        id: "aip_spot3",
        title: "现货时段3 (晚高峰自适应放电)",
        timeRange: "18:00~22:00",
        chargeReserve: "5%",
        dischargeReserve: "98%",
        reverseFlowThreshold: "180 kW",
        strategies: [
          { id: "aiss4", name: "晚高峰动态套利", badgeColor: "border-indigo-500 text-indigo-600 bg-indigo-50" }
        ]
      }
    ]
  },
  {
    id: "tpl_ai_pv_zero_carbon",
    name: "AI 光伏全额消纳与防逆流策略 (LSTM超前预测)",
    isAi: true,
    category: "AI 智能策略",
    description: "结合天气云图与辐照度超前预测，实现光伏发电100%就地就近消纳，严密防范台区反送电考核",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
    periods: [
      {
        id: "aip_pv1",
        title: "光伏消纳主时段 (超前出力协同)",
        timeRange: "08:00~17:00",
        chargeReserve: "98%",
        dischargeReserve: "5%",
        reverseFlowThreshold: "0 kW",
        strategies: [
          { id: "aipv_s1", name: "AI 绿色就地消纳", badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50" },
          { id: "aipv_s2", name: "光伏防逆流硬约束", badgeColor: "border-amber-500 text-amber-600 bg-amber-50" }
        ]
      },
      {
        id: "aip_pv2",
        title: "晚间套利时段",
        timeRange: "18:00~22:00",
        chargeReserve: "5%",
        dischargeReserve: "95%",
        reverseFlowThreshold: "120 kW",
        strategies: [
          { id: "aipv_s3", name: "储能峰谷套利", badgeColor: "border-blue-500 text-blue-600 bg-blue-50" }
        ]
      }
    ]
  },
  {
    id: "tpl_ai_demand_healing",
    name: "AI 变压器容量动态自愈策略 (重载动态顶峰)",
    isAi: true,
    category: "AI 智能策略",
    description: "基于主变负荷实时推演与温升模型，在变压器临界重载时自动放电顶峰，避免超容基本电费考核",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-300",
    periods: [
      {
        id: "aip_dh1",
        title: "全天自愈监控时段",
        timeRange: "08:00~22:00",
        chargeReserve: "30%",
        dischargeReserve: "95%",
        reverseFlowThreshold: "150 kW",
        strategies: [
          { id: "aidh_s1", name: "变压器自愈顶峰", badgeColor: "border-rose-500 text-rose-600 bg-rose-50" },
          { id: "aidh_s2", name: "防超容需量控制", badgeColor: "border-purple-500 text-purple-600 bg-purple-50" }
        ]
      }
    ]
  }
];

export const StrategySimulationConfigPage: React.FC<StrategySimulationConfigPageProps> = ({
  onBack,
  onSaveAndSimulate,
  initialMonth = "2026-07",
}) => {
  // Calendar data for July 2026 (31 days, starts on Wednesday)
  const nonAiDays = [5, 12, 19, 26, 31];

  const initializeMonthlyConfigs = (): Record<number, MonthlyStrategyDayConfig> => {
    const configs: Record<number, MonthlyStrategyDayConfig> = {};
    const weekdaysMap = ["周三", "周四", "周五", "周六", "周日", "周一", "周二"];
    
    for (let day = 1; day <= 31; day++) {
      const weekdayIdx = (day - 1 + 2) % 7; // 1st is Wednesday (index 2)
      const weekday = weekdaysMap[weekdayIdx];
      const isWeekend = weekday === "周六" || weekday === "周日";
      const hasAiRunning = !nonAiDays.includes(day);

      // Default strategy: weekends use July Rest Template, weekdays use Standard Arbitrage
      const defaultTemplate = isWeekend ? PRESET_TEMPLATES[1] : PRESET_TEMPLATES[0];

      configs[day] = {
        day: `${day}日`,
        dayNum: day,
        weekday,
        isWeekend,
        hasAiRunning,
        mode: "template",
        templateId: defaultTemplate.id,
        templateName: defaultTemplate.name,
      };
    }
    return configs;
  };

  const [monthlyConfigs, setMonthlyConfigs] = useState<Record<number, MonthlyStrategyDayConfig>>(initializeMonthlyConfigs);
  
  // Selection state for calendar (array of day numbers) - Multi-select supported
  const [selectedDayNums, setSelectedDayNums] = useState<number[]>([15]); // Default selected 15th
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(true); // Multi-select enabled by default
  
  // Current active configuration mode for the selected day(s): "template" (合并选择 AI 与非 AI 策略) | "custom" (手动自定义配置)
  const [activeConfigMode, setActiveConfigMode] = useState<"template" | "custom">("template");
  const [strategyCategoryFilter, setStrategyCategoryFilter] = useState<"all" | "ai" | "non_ai">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl_arbitrage_non_ai");

  // Notification Toast State
  const [showBatchToast, setShowBatchToast] = useState(false);
  const [batchToastMessage, setBatchToastMessage] = useState("");

  // Editable custom periods matching Screenshot 2
  const [customPeriods, setCustomPeriods] = useState([
    {
      id: "cp1",
      startTime: "",
      endTime: "",
      chargeReserve: "",
      dischargeReserve: "",
      reverseFlowThreshold: "125",
      strategies: [
        { id: "s1", type: "自发自用" }
      ]
    }
  ]);

  // Toggle single day in selection (used by checkboxes and multi-select mode)
  const handleToggleDay = (dayNum: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setSelectedDayNums(prev => {
      if (prev.includes(dayNum)) {
        if (prev.length === 1) return prev; // Keep at least 1 day selected
        return prev.filter(d => d !== dayNum);
      } else {
        return [...prev, dayNum].sort((a, b) => a - b);
      }
    });
  };

  // Handle day click in calendar (Supports direct click, Multi-select mode, Shift range, Ctrl/Cmd)
  const handleDayClick = (dayNum: number, event: React.MouseEvent) => {
    if (isMultiSelectMode) {
      handleToggleDay(dayNum);
      return;
    }

    if (event.shiftKey && selectedDayNums.length > 0) {
      // Range select
      const start = Math.min(selectedDayNums[0], dayNum);
      const end = Math.max(selectedDayNums[0], dayNum);
      const range: number[] = [];
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      setSelectedDayNums(range);
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select toggle
      handleToggleDay(dayNum);
    } else {
      // Single select
      setSelectedDayNums([dayNum]);
      const config = monthlyConfigs[dayNum];
      if (config) {
        if (config.mode === "custom") {
          setActiveConfigMode("custom");
        } else {
          setActiveConfigMode("template");
          setSelectedTemplateId(config.templateId);
        }
      }
    }
  };

  // Quick Multi-Select Helpers on the Schedule Board
  const handleSelectAllDays = () => {
    setSelectedDayNums(Array.from({ length: 31 }, (_, i) => i + 1));
  };

  const handleSelectWorkdays = () => {
    const workdays: number[] = [];
    for (let day = 1; day <= 31; day++) {
      if (!monthlyConfigs[day].isWeekend) {
        workdays.push(day);
      }
    }
    setSelectedDayNums(workdays);
  };

  const handleSelectWeekends = () => {
    const weekends: number[] = [];
    for (let day = 1; day <= 31; day++) {
      if (monthlyConfigs[day].isWeekend) {
        weekends.push(day);
      }
    }
    setSelectedDayNums(weekends);
  };

  const handleSelectAiAssignedDays = () => {
    const aiDays: number[] = [];
    for (let day = 1; day <= 31; day++) {
      if (monthlyConfigs[day].templateId?.startsWith("tpl_ai_")) {
        aiDays.push(day);
      }
    }
    if (aiDays.length > 0) {
      setSelectedDayNums(aiDays);
    } else {
      alert("当前日历中暂未设置 AI 策略日期，可从右侧选择 AI 策略并点击应用");
    }
  };

  const handleSelectRuleAssignedDays = () => {
    const ruleDays: number[] = [];
    for (let day = 1; day <= 31; day++) {
      if (!monthlyConfigs[day].templateId?.startsWith("tpl_ai_")) {
        ruleDays.push(day);
      }
    }
    if (ruleDays.length > 0) {
      setSelectedDayNums(ruleDays);
    }
  };

  const handleClearSelection = () => {
    setSelectedDayNums([15]); // Default to 15th
  };

  const handleRemoveSingleSelectedDay = (dayNum: number) => {
    if (selectedDayNums.length > 1) {
      setSelectedDayNums(prev => prev.filter(d => d !== dayNum));
    }
  };

  // Change template for all currently selected days
  const handleApplyToSelectedDays = (templateId: string) => {
    const tpl = PRESET_TEMPLATES.find(t => t.id === templateId) || PRESET_TEMPLATES[0];
    setSelectedTemplateId(templateId);
    setMonthlyConfigs(prev => {
      const next = { ...prev };
      selectedDayNums.forEach(day => {
        if (next[day]) {
          next[day] = {
            ...next[day],
            mode: tpl.isAi ? "ai_strategy" : "template",
            templateId: tpl.id,
            templateName: tpl.name
          };
        }
      });
      return next;
    });

    setBatchToastMessage(`已将「${tpl.name}」同步应用至选中的 ${selectedDayNums.length} 个日期！`);
    setShowBatchToast(true);
    setTimeout(() => {
      setShowBatchToast(false);
    }, 3000);
  };

  // Switch to custom mode for currently selected days
  const handleSwitchToCustomMode = () => {
    setActiveConfigMode("custom");
    setMonthlyConfigs(prev => {
      const next = { ...prev };
      selectedDayNums.forEach(day => {
        if (next[day]) {
          next[day] = {
            ...next[day],
            mode: "custom",
            templateName: "手动配置策略",
            customPeriods: customPeriods
          };
        }
      });
      return next;
    });
  };

  // Switch to non-AI template mode
  const handleSwitchToTemplateMode = () => {
    setActiveConfigMode("template");
    const nonAiTpl = PRESET_TEMPLATES.find(t => !t.isAi && t.id === selectedTemplateId) || PRESET_TEMPLATES[0];
    handleApplyToSelectedDays(nonAiTpl.id);
  };

  // Switch to AI intelligent strategy mode
  const handleSwitchToAiMode = () => {
    setActiveConfigMode("ai_strategy");
    const aiTpl = PRESET_TEMPLATES.find(t => t.isAi && t.id === selectedTemplateId) || PRESET_TEMPLATES.find(t => t.isAi) || PRESET_TEMPLATES[4];
    handleApplyToSelectedDays(aiTpl.id);
  };

  // Custom period handlers (Screenshot 2)
  const handleAddCustomPeriod = () => {
    const newId = `cp_${Date.now()}`;
    setCustomPeriods([
      ...customPeriods,
      {
        id: newId,
        startTime: "",
        endTime: "",
        chargeReserve: "",
        dischargeReserve: "",
        reverseFlowThreshold: "125",
        strategies: [
          { id: `s_${Date.now()}`, type: "自发自用" }
        ]
      }
    ]);
  };

  const handleRemoveCustomPeriod = (id: string) => {
    if (customPeriods.length > 1) {
      setCustomPeriods(customPeriods.filter(p => p.id !== id));
    }
  };

  const handleAddSubStrategy = (periodId: string) => {
    setCustomPeriods(customPeriods.map(p => {
      if (p.id === periodId) {
        return {
          ...p,
          strategies: [
            ...p.strategies,
            { id: `s_${Date.now()}`, type: "峰谷套利" }
          ]
        };
      }
      return p;
    }));
  };

  const handleRemoveSubStrategy = (periodId: string, strategyId: string) => {
    setCustomPeriods(customPeriods.map(p => {
      if (p.id === periodId && p.strategies.length > 1) {
        return {
          ...p,
          strategies: p.strategies.filter(s => s.id !== strategyId)
        };
      }
      return p;
    }));
  };

  // Active template object for the right-hand panel
  const primarySelectedDay = selectedDayNums[0] || 15;
  const currentDayConfig = monthlyConfigs[primarySelectedDay] || monthlyConfigs[15];
  const currentTemplate = PRESET_TEMPLATES.find(t => t.id === (activeConfigMode !== "custom" ? selectedTemplateId : currentDayConfig.templateId)) || PRESET_TEMPLATES[0];

  // Strategy count statistics
  const aiAssignedCount = Object.values(monthlyConfigs).filter(c => c.templateId?.startsWith("tpl_ai_")).length;
  const ruleAssignedCount = 31 - aiAssignedCount;

  return (
    <div className="h-screen max-h-screen bg-[#f8fafc] text-slate-800 flex flex-col w-full overflow-hidden select-none">
      {/* Toast Notification */}
      {showBatchToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{batchToastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header - Full Width */}
      <header className="shrink-0 bg-white border-b border-slate-200 z-30 shadow-xs w-full">
        <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                策略模拟配置与下发
                <span className="text-xs font-normal text-slate-400 hidden md:inline">
                  支持非 AI 基础策略与 AI 智能策略自由排程模拟
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{initialMonth} (共 31 天)</span>
            </div>

            <button
              onClick={() => onSaveAndSimulate(monthlyConfigs)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm shadow-emerald-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>保存并重新模拟</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Left-Right Two Column Layout - Full Screen Fit (1 screen height) */}
      <div className="flex-1 min-h-0 w-full px-4 sm:px-6 py-2.5 flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full min-h-0 flex-1">
          
          {/* ========================================================================= */}
          {/* 1. LEFT COLUMN: 策略模拟日历 (CALENDAR - 7/12 WIDER COLUMN) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7 h-full min-h-0 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
            
            {/* Left Header with Multi-Select Toggle */}
            <div className="shrink-0 flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-emerald-600 rounded-full" />
                <h2 className="text-sm font-bold text-slate-900">
                  策略模拟日历
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  ({initialMonth} · 31天)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Multi-select Mode Switch */}
                <button
                  onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isMultiSelectMode
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                  title="开启后点击日期直接进行多选勾选"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>多选模式: {isMultiSelectMode ? "开启" : "单选"}</span>
                </button>
              </div>
            </div>

            {/* Quick Multi-Select Filter Toolbar */}
            <div className="shrink-0 space-y-1 bg-slate-50/80 p-1.5 rounded-xl border border-slate-100 my-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-600 font-bold text-[11px]">
                  <Filter className="w-3 h-3 text-emerald-600" />
                  <span>快捷多选：</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  支持 Shift 范围 / 点击勾选
                </div>
              </div>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={handleSelectAllDays}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedDayNums.length === 31 
                      ? "bg-emerald-600 text-white font-bold" 
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  全选 (31天)
                </button>
                <button
                  onClick={handleSelectWorkdays}
                  className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  工作日 (23天)
                </button>
                <button
                  onClick={handleSelectWeekends}
                  className="px-2 py-0.5 bg-white border border-slate-200 text-amber-700 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  周末 (8天)
                </button>
                <button
                  onClick={handleSelectAiAssignedDays}
                  className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  AI策略日 ({aiAssignedCount}天)
                </button>
                <button
                  onClick={handleSelectRuleAssignedDays}
                  className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors cursor-pointer"
                >
                  常规基准日 ({ruleAssignedCount}天)
                </button>
                <button
                  onClick={handleClearSelection}
                  className="px-2 py-0.5 bg-white border border-slate-200 text-slate-400 hover:bg-slate-100 rounded text-[11px] font-medium transition-colors cursor-pointer ml-auto"
                >
                  重置
                </button>
              </div>
            </div>

            {/* Calendar Grid Section: Header + 31 Cells (Fills available vertical space) */}
            <div className="flex-1 min-h-0 flex flex-col justify-between space-y-1 my-0.5">
              {/* Day of Week Headers */}
              <div className="shrink-0 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-0.5 bg-slate-50/90 rounded-lg">
                <div>周一</div>
                <div>周二</div>
                <div>周三</div>
                <div>周四</div>
                <div>周五</div>
                <div className="text-amber-500">周六</div>
                <div className="text-amber-500">周日</div>
              </div>

              {/* 31-Day Matrix Grid (Flex-1 to fill 100% of vertical space) */}
              <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
                {/* Empty placeholder cells for Mon & Tue of first week */}
                <div className="rounded-lg bg-slate-50/30 border border-dashed border-slate-100 opacity-40 h-full min-h-[38px]" />
                <div className="rounded-lg bg-slate-50/30 border border-dashed border-slate-100 opacity-40 h-full min-h-[38px]" />

                {Array.from({ length: 31 }, (_, idx) => {
                  const dayNum = idx + 1;
                  const config = monthlyConfigs[dayNum];
                  const isSelected = selectedDayNums.includes(dayNum);
                  const isWeekend = config.isWeekend;
                  const isAiStrategy = config.templateId?.startsWith("tpl_ai_");
                  const isCustom = config.mode === "custom";
                  const tplObj = PRESET_TEMPLATES.find(t => t.id === config.templateId) || PRESET_TEMPLATES[0];

                  // Calendar slot calculations (2 empty cells at start: Mon, Tue)
                  const slotIndex = dayNum - 1 + 2;
                  const colIndex = slotIndex % 7;

                  // Check left neighbor in same week row
                  const prevDayNum = colIndex > 0 ? dayNum - 1 : null;
                  const connectLeft = Boolean(
                    prevDayNum &&
                    prevDayNum >= 1 &&
                    monthlyConfigs[prevDayNum]?.templateId === config.templateId &&
                    monthlyConfigs[prevDayNum]?.mode === config.mode
                  );

                  // Check right neighbor in same week row
                  const nextDayNum = colIndex < 6 && dayNum < 31 ? dayNum + 1 : null;
                  const connectRight = Boolean(
                    nextDayNum &&
                    nextDayNum <= 31 &&
                    monthlyConfigs[nextDayNum]?.templateId === config.templateId &&
                    monthlyConfigs[nextDayNum]?.mode === config.mode
                  );

                  const isConnected = connectLeft || connectRight;

                  // Strategy shortened display text
                  const shortName = config.templateName
                    .replace("模版", "")
                    .replace("策略", "")
                    .replace("（非AI-两充两放）", "")
                    .replace("（非AI-一充一放）", "")
                    .replace("（非AI）", "")
                    .replace("(多目标协同优化)", "")
                    .replace("(毫秒级自适应)", "")
                    .replace("(LSTM超前预测)", "")
                    .replace("(重载动态顶峰)", "")
                    .trim();

                  // Strategy band color scheme
                  let ribbonBg = "bg-blue-100/90 text-blue-800 border-blue-300";
                  if (isAiStrategy) {
                    ribbonBg = "bg-indigo-100/90 text-indigo-800 border-indigo-300";
                  } else if (isWeekend) {
                    ribbonBg = "bg-amber-100/90 text-amber-800 border-amber-300";
                  } else if (isCustom) {
                    ribbonBg = "bg-slate-200 text-slate-800 border-slate-300";
                  }

                  return (
                    <div
                      key={dayNum}
                      onClick={(e) => handleDayClick(dayNum, e)}
                      title={`${initialMonth}${dayNum}日 · 策略: ${config.templateName} (${isAiStrategy ? "AI 智能策略" : isCustom ? "手动配置" : "基础非 AI 策略"})`}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer relative flex flex-col justify-between select-none group h-full min-h-[44px] ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs z-20"
                          : isConnected
                          ? isAiStrategy
                            ? "bg-indigo-50/40 border-indigo-200/80 hover:bg-indigo-50/70"
                            : isWeekend
                            ? "bg-amber-50/40 border-amber-200/70 hover:bg-amber-50/70"
                            : "bg-blue-50/30 border-blue-200/70 hover:bg-blue-50/60"
                          : isAiStrategy
                          ? "bg-indigo-50/30 border-indigo-200/80 hover:bg-indigo-50/60"
                          : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Top Row: Date number & Interactive Checkbox */}
                      <div className="flex items-center justify-between z-10">
                        <span className={`text-[11px] font-black leading-none flex items-center gap-1 ${
                          isSelected ? "text-emerald-700" : isAiStrategy ? "text-indigo-700" : isWeekend ? "text-amber-600" : "text-slate-800"
                        }`}>
                          {dayNum.toString().padStart(2, '0')}
                          {isAiStrategy && (
                            <Sparkles className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                          )}
                        </span>

                        <div 
                          onClick={(e) => handleToggleDay(dayNum, e)}
                          className="cursor-pointer text-slate-400 hover:text-emerald-600 ml-0.5"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3 h-3 text-emerald-600 fill-emerald-50" />
                          ) : (
                            <Square className="w-3 h-3 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Connected Strategy Ribbon / Tag: Seamlessly bridges across consecutive cells */}
                      <div className="mt-0.5 relative">
                        <div 
                          className={`text-[9px] font-bold py-0.5 px-1 leading-tight flex items-center justify-center transition-all ${ribbonBg} ${
                            !connectLeft && !connectRight
                              ? "rounded-md border mx-0"
                              : !connectLeft && connectRight
                              ? "rounded-l-md rounded-r-none border-t border-b border-l border-r-0 -mr-2 pr-2.5 z-10"
                              : connectLeft && connectRight
                              ? "rounded-none border-t border-b border-l-0 border-r-0 -mx-2 px-2.5 z-10"
                              : "rounded-r-md rounded-l-none border-t border-b border-r border-l-0 -ml-2 pl-2.5 z-10"
                          }`}
                        >
                          {!connectLeft ? (
                            <span className="truncate text-left w-full" title={config.templateName}>
                              {shortName}
                            </span>
                          ) : connectRight ? (
                            <span className="truncate opacity-75 font-normal text-[8.5px] text-center w-full">
                              ━ {shortName} ━
                            </span>
                          ) : (
                            <span className="truncate opacity-90 font-medium text-[8.5px] text-right w-full">
                              {shortName} ↵
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Days Summary Pill Bar */}
            <div className="shrink-0 pt-1 border-t border-slate-100 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  <span>当前已多选：</span>
                  <span className="px-2 py-0.2 bg-emerald-600 text-white rounded font-black text-xs">
                    {selectedDayNums.length} 天
                  </span>
                </span>
                {selectedDayNums.length > 1 && (
                  <button 
                    onClick={handleClearSelection}
                    className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    重置为单选
                  </button>
                )}
              </div>

              {/* Selected date pills (clickable to unselect) */}
              <div className="flex flex-wrap gap-1 max-h-[42px] overflow-y-auto pr-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                {selectedDayNums.map(day => (
                  <span
                    key={day}
                    className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-white border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold shadow-2xs"
                  >
                    <span>{day}日</span>
                    {selectedDayNums.length > 1 && (
                      <button
                        onClick={() => handleRemoveSingleSelectedDay(day)}
                        className="text-slate-300 hover:text-rose-500 cursor-pointer"
                        title="取消选中此日"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 2. RIGHT COLUMN: 策略配置 (5/12 NARROWER COLUMN - SUPPORTS AI SIMULATION) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 h-full min-h-0 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
            
            {/* Scrollable container for strategy configuration */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5">
              
              {/* Part 1: 配置/选择基础策略（对比基准） */}
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    1. 配置/选择策略类型与模型
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal">
                    支持指定非 AI 物理基准策略，或选择能源 AI 大模型自适应策略
                  </p>
                </div>

                {/* Option Cards: 2 Unified Mode Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Card 1: 选择策略与模型库 (包含 AI 智能策略 与 基础非 AI 策略) */}
                  <div
                    onClick={() => setActiveConfigMode("template")}
                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-start gap-1.5 relative ${
                      activeConfigMode === "template"
                        ? "border-emerald-500 bg-emerald-50/25 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      activeConfigMode === "template" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h3 className={`text-[11px] font-bold flex items-center gap-1.5 ${activeConfigMode === "template" ? "text-emerald-700" : "text-slate-800"}`}>
                        <span>选择策略与模型库</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 font-extrabold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> 含AI
                        </span>
                      </h3>
                      <p className="text-[9.5px] text-slate-400 leading-tight">
                        内置 AI 大模型策略与固定物理基准
                      </p>
                    </div>
                  </div>

                  {/* Card 2: 在本页面手动配置 */}
                  <div
                    onClick={handleSwitchToCustomMode}
                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-start gap-1.5 relative ${
                      activeConfigMode === "custom"
                        ? "border-emerald-500 bg-emerald-50/25 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      activeConfigMode === "custom" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h3 className={`text-[11px] font-bold ${activeConfigMode === "custom" ? "text-emerald-700" : "text-slate-800"}`}>
                        在本页面手动配置
                      </h3>
                      <p className="text-[9.5px] text-slate-400 leading-tight">
                        自定义充放电时段与控制参数
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-header / Dropdown for Unified Strategy Library */}
                {activeConfigMode === "template" && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] text-slate-700 font-bold flex items-center gap-1">
                        <span>选择具体策略模型</span>
                        {currentTemplate.isAi && (
                          <span className="text-[10px] text-indigo-600 font-normal bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                            AI 智能预测
                          </span>
                        )}
                      </label>

                      {/* Filter category pills */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                        <button
                          type="button"
                          onClick={() => setStrategyCategoryFilter("all")}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                            strategyCategoryFilter === "all"
                              ? "bg-white text-slate-800 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          全部 ({PRESET_TEMPLATES.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStrategyCategoryFilter("ai");
                            if (!currentTemplate.isAi) {
                              const firstAi = PRESET_TEMPLATES.find(t => t.isAi);
                              if (firstAi) handleApplyToSelectedDays(firstAi.id);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all flex items-center gap-0.5 cursor-pointer ${
                            strategyCategoryFilter === "ai"
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "text-indigo-600 hover:text-indigo-800"
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI策略 ({PRESET_TEMPLATES.filter(t => t.isAi).length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStrategyCategoryFilter("non_ai");
                            if (currentTemplate.isAi) {
                              const firstNonAi = PRESET_TEMPLATES.find(t => !t.isAi);
                              if (firstNonAi) handleApplyToSelectedDays(firstNonAi.id);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                            strategyCategoryFilter === "non_ai"
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "text-emerald-700 hover:text-emerald-900"
                          }`}
                        >
                          <span>非AI基础 ({PRESET_TEMPLATES.filter(t => !t.isAi).length})</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => handleApplyToSelectedDays(e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 text-xs font-bold appearance-none focus:outline-hidden focus:ring-2 shadow-2xs cursor-pointer ${
                            currentTemplate.isAi
                              ? "bg-indigo-50/40 border-indigo-300 text-indigo-950 focus:ring-indigo-500 focus:border-indigo-500"
                              : "bg-white border-slate-300 text-slate-800 focus:ring-emerald-500 focus:border-emerald-500"
                          }`}
                        >
                          {(strategyCategoryFilter === "all" || strategyCategoryFilter === "ai") && (
                            <optgroup label="✨ AI 智能策略模拟（能源大模型超前自适应预测）">
                              {PRESET_TEMPLATES.filter(t => t.isAi).map(tpl => (
                                <option key={tpl.id} value={tpl.id}>
                                  ✨ {tpl.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {(strategyCategoryFilter === "all" || strategyCategoryFilter === "non_ai") && (
                            <optgroup label="⚙️ 基础非 AI 物理策略（标准固定规则基准）">
                              {PRESET_TEMPLATES.filter(t => !t.isAi).map(tpl => (
                                <option key={tpl.id} value={tpl.id}>
                                  ⚙️ {tpl.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Part 2: Details Section */}
              {/* ========================================================================= */}
              {/* CASE A: TEMPLATE OR AI STRATEGY MODE (2. 策略时段配置详情) */}
              {/* ========================================================================= */}
              {activeConfigMode === "template" && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {currentTemplate.isAi ? (
                        <>
                          <BrainCircuit className="w-4 h-4 text-indigo-600" />
                          <span>2. AI 智能策略模型时段与算法参数</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-4 h-4 text-emerald-600" />
                          <span>2. 基础物理策略时段配置详情</span>
                        </>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      {currentTemplate.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {currentTemplate.periods.map((period) => (
                      <div 
                        key={period.id} 
                        className={`rounded-xl p-3 space-y-2 border ${
                          currentTemplate.isAi
                            ? "bg-indigo-50/30 border-indigo-100"
                            : "bg-slate-50/70 border-slate-200/80"
                        }`}
                      >
                        {/* Period Header */}
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span>{period.title}</span>
                          {currentTemplate.isAi ? (
                            <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100/70 px-1.5 py-0.2 rounded">
                              AI自适应推演
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              物理固定规则
                            </span>
                          )}
                        </div>

                        {/* Period Parameters Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
                          <div>
                            适用时段 <span className="font-semibold text-slate-800">{period.timeRange}</span>
                          </div>
                          <div>
                            充电预留容量 <span className="font-semibold text-slate-800">{period.chargeReserve}</span>
                          </div>
                          <div>
                            放电预留容量 <span className="font-semibold text-slate-800">{period.dischargeReserve}</span>
                          </div>
                          <div>
                            可逆流阈值 <span className="font-semibold text-slate-800">{period.reverseFlowThreshold}</span>
                          </div>
                        </div>

                        {/* Dotted Divider */}
                        <div className="border-b border-dashed border-slate-200/90" />

                        {/* Strategy Badges Row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {period.strategies?.map((strat, sIdx) => (
                            <div key={strat.id || sIdx} className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500">策略{sIdx + 1}</span>
                              <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${strat.badgeColor}`}>
                                {strat.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* CASE B: MANUAL CONFIG MODE (2. 手动配置时段明细 - SCREENSHOT 2) */}
              {/* ========================================================================= */}
              {activeConfigMode === "custom" && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        2. 手动配置时段明细
                      </h3>
                      <p className="text-[11px] text-slate-400 font-normal">
                        配置储能系统各时段的运行参数与策略类型
                      </p>
                    </div>

                    <button
                      onClick={handleAddCustomPeriod}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增时段</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {customPeriods.map((period, pIdx) => (
                      <div key={period.id} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
                        {/* Period Header with Trash icon */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            运行计划时段{pIdx + 1}
                          </span>
                          {customPeriods.length > 1 && (
                            <button
                              onClick={() => handleRemoveCustomPeriod(period.id)}
                              className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                              title="删除此计划时段"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                          )}
                        </div>

                        {/* Inputs Row matching Screenshot 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs">
                          {/* 适用时段 */}
                          <div className="md:col-span-5 flex items-center gap-1.5">
                            <label className="text-[11px] text-slate-600 shrink-0 font-medium flex items-center">
                              <span className="text-rose-500 mr-0.5">*</span>适用时段
                            </label>
                            <div className="flex items-center gap-1 flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
                              <input
                                type="text"
                                placeholder="开始时间"
                                defaultValue={period.startTime || "00:00"}
                                className="w-full text-xs text-slate-800 outline-hidden font-medium text-center"
                              />
                              <span className="text-slate-400 text-xs">~</span>
                              <input
                                type="text"
                                placeholder="结束时间"
                                defaultValue={period.endTime || "06:00"}
                                className="w-full text-xs text-slate-800 outline-hidden font-medium text-center"
                              />
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            </div>
                          </div>

                          {/* 预留容量 */}
                          <div className="md:col-span-4 flex items-center gap-1.5">
                            <label className="text-[11px] text-slate-600 shrink-0 font-medium flex items-center">
                              <span className="text-rose-500 mr-0.5">*</span>预留容量
                            </label>
                            <div className="flex items-center gap-1 flex-1">
                              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1.5 py-1 flex-1 shadow-2xs">
                                <input
                                  type="text"
                                  placeholder="充电预留"
                                  defaultValue={period.chargeReserve || "30"}
                                  className="w-full text-xs text-slate-800 outline-hidden text-center"
                                />
                                <span className="text-[10px] text-slate-400 font-mono">%</span>
                                <Battery className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
                              </div>
                              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1.5 py-1 flex-1 shadow-2xs">
                                <input
                                  type="text"
                                  placeholder="放电预留"
                                  defaultValue={period.dischargeReserve || "30"}
                                  className="w-full text-xs text-slate-800 outline-hidden text-center"
                                />
                                <span className="text-[10px] text-slate-400 font-mono">%</span>
                                <Battery className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
                              </div>
                            </div>
                          </div>

                          {/* 可逆流阈值 */}
                          <div className="md:col-span-3 flex items-center gap-1.5">
                            <label className="text-[11px] text-slate-600 shrink-0 font-medium">
                              可逆流阈值
                            </label>
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 flex-1 shadow-2xs">
                              <input
                                type="text"
                                defaultValue={period.reverseFlowThreshold || "125"}
                                className="w-full text-xs text-slate-800 outline-hidden text-center"
                              />
                              <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-1">kW</span>
                            </div>
                          </div>
                        </div>

                        {/* Dotted Divider */}
                        <div className="border-b border-dashed border-slate-200/90" />

                        {/* Sub-strategy rows matching Screenshot 2 */}
                        <div className="space-y-1.5">
                          {period.strategies.map((strat, sIdx) => (
                            <div key={strat.id} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 max-w-sm">
                                <label className="text-[11px] text-slate-600 shrink-0 font-medium flex items-center">
                                  <span className="text-rose-500 mr-0.5">*</span>策略类型
                                </label>
                                <div className="relative flex-1">
                                  <select
                                    defaultValue={strat.type}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 appearance-none focus:outline-hidden focus:ring-1 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                                  >
                                    <option value="自发自用">自发自用</option>
                                    <option value="峰谷套利">峰谷套利</option>
                                    <option value="需量控制">需量控制</option>
                                    <option value="全额消纳">全额消纳</option>
                                    <option value="负电价限电止损">负电价限电止损</option>
                                  </select>
                                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                                </div>
                              </div>

                              {/* Plus and Minus icon buttons */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAddSubStrategy(period.id)}
                                  className="text-emerald-500 hover:text-emerald-600 cursor-pointer transition-colors p-0.5"
                                  title="新增策略"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </button>
                                {period.strategies.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSubStrategy(period.id, strat.id)}
                                    className="text-rose-400 hover:text-rose-500 cursor-pointer transition-colors p-0.5"
                                    title="删除此策略"
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sync button for selected days */}
            <div className="shrink-0 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                当前同步目标: <b className="text-emerald-700">{selectedDayNums.length} 个已选日期</b>
              </span>
              <button
                onClick={() => handleApplyToSelectedDays(selectedTemplateId)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>应用到已选 {selectedDayNums.length} 天</span>
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPACT BOTTOM ACTION BAR (MATCHES SCREENSHOTS FOOTER) */}
        {/* ========================================================================= */}
        <div className="shrink-0 border-t border-slate-200 pt-2 flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>算法模拟回测将完全参考本站历史真实负荷及充放参数。</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => onSaveAndSimulate(monthlyConfigs)}
              className="px-6 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm shadow-emerald-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>保存并重新模拟</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategySimulationConfigPage;

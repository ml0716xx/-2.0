import React, { useState } from "react";
import { 
  ArrowLeft, Plus, Trash2, Check, AlertCircle, 
  ChevronDown, Clock, Layers, Sliders,
  RefreshCw, RotateCcw, X, Filter,
  Battery, PlusCircle, MinusCircle, Sparkles, BrainCircuit,
  Sun, Cloud, CloudRain, Snowflake, Settings2, ShieldCheck, CheckCircle2,
  TrendingUp, Zap, HelpCircle, ChevronRight, Gauge, Edit3, Eye, FileText
} from "lucide-react";

export interface MonthlyStrategyDayConfig {
  day: string; // "1日", "2日", ...
  dayNum: number;
  weekday: string; // "周一", "周二", ...
  isWeekend: boolean;
  hasAiRunning: boolean;
  mode: "template" | "ai_strategy" | "custom";
  templateId: string;
  templateName: string;
  weatherType?: "sunny" | "cloudy" | "rainy" | "snowy";
  customPeriods?: StrategyPeriodItem[];
}

export interface StrategyPeriodItem {
  id: string;
  title: string;
  timeRange: string;
  chargeReserve: string;
  dischargeReserve: string;
  subStrategies: {
    id: string;
    name: string;
    type: "arbitrage" | "consumption" | "demand" | "reverse_flow" | "healing";
    badgeColor: string;
    timeRange?: string;
    mode?: "充电" | "放电" | "自发自用" | "平抑" | "防冻保供";
    power?: string; // kW
    chargeOffset?: string; // 允许充电偏移量 kW
    dischargeOffset?: string; // 允许放电偏移量 kW
    chargeThreshold?: string; // 储能允许充电阈值 kW
    dischargeThreshold?: string; // 储能允许放电阈值 kW
  }[];
}

export interface StrategyTemplate {
  id: string;
  name: string;
  isAi: boolean;
  category: string;
  description: string;
  badgeColor: string;
  weatherFit?: ("sunny" | "cloudy" | "rainy" | "snowy")[];
  periods: StrategyPeriodItem[];
}

export interface StrategySimulationConfigPageProps {
  onBack: () => void;
  onSaveAndSimulate: (monthlySchedule: Record<number, MonthlyStrategyDayConfig>) => void;
  initialMonth?: string;
  userAiStatus?: "activated" | "not_activated";
}

// Predefined Strategy Templates (Accurately reflecting the physical baseline strategy shown in user screenshot and weather extensions)
export const PRESET_TEMPLATES: StrategyTemplate[] = [
  {
    id: "tpl_weekend_july_aug",
    name: "七八月休息日模版",
    isAi: false,
    category: "常规物理策略",
    description: "针对七八月份休息日负荷较轻、电价时段分布及消纳需求配置的传统物理基准排期策略",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
    weatherFit: ["sunny", "cloudy"],
    periods: [
      {
        id: "p1",
        title: "计划时段1",
        timeRange: "00:00~01:00",
        chargeReserve: "--",
        dischargeReserve: "--",
        subStrategies: [
          {
            id: "s1_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "00:00 ~ 01:00",
            mode: "放电",
            power: "130",
          },
          {
            id: "s1_2",
            name: "需量控制",
            type: "demand",
            badgeColor: "border-amber-500 text-amber-600 bg-amber-50/60",
            chargeOffset: "120 kW",
            chargeThreshold: "425 kW",
          }
        ]
      },
      {
        id: "p2",
        title: "计划时段2",
        timeRange: "01:00~06:00",
        chargeReserve: "55 %",
        dischargeReserve: "--",
        subStrategies: [
          {
            id: "s2_1",
            name: "全额消纳",
            type: "consumption",
            badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50/60",
            dischargeOffset: "50 kW",
            dischargeThreshold: "495 kW",
          },
          {
            id: "s2_2",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "01:00 ~ 06:00",
            mode: "充电",
            power: "300",
          }
        ]
      },
      {
        id: "p3",
        title: "计划时段3",
        timeRange: "11:30~14:30",
        chargeReserve: "80 %",
        dischargeReserve: "15 %",
        subStrategies: [
          {
            id: "s3_1",
            name: "全额消纳",
            type: "consumption",
            badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50/60",
            dischargeOffset: "80 kW",
            dischargeThreshold: "450 kW",
          },
          {
            id: "s3_2",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "11:30 ~ 14:30",
            mode: "充电",
            power: "250",
          }
        ]
      },
      {
        id: "p4",
        title: "计划时段4",
        timeRange: "18:00~22:00",
        chargeReserve: "10 %",
        dischargeReserve: "90 %",
        subStrategies: [
          {
            id: "s4_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "18:00 ~ 22:00",
            mode: "放电",
            power: "300",
          },
          {
            id: "s4_2",
            name: "需量控制",
            type: "demand",
            badgeColor: "border-amber-500 text-amber-600 bg-amber-50/60",
            chargeOffset: "150 kW",
            chargeThreshold: "480 kW",
          }
        ]
      }
    ]
  },
  {
    id: "tpl_workday_july_aug",
    name: "七八月工作日模版",
    isAi: false,
    category: "常规物理策略",
    description: "适用于七八月工厂与园区工作日高峰用电基准，注重重负荷下的变压器需量保护与高峰放电",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-300",
    weatherFit: ["sunny", "cloudy"],
    periods: [
      {
        id: "wp1",
        title: "计划时段1",
        timeRange: "00:00~07:00",
        chargeReserve: "95 %",
        dischargeReserve: "--",
        subStrategies: [
          {
            id: "ws1_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "00:00 ~ 07:00",
            mode: "充电",
            power: "350",
          }
        ]
      },
      {
        id: "wp2",
        title: "计划时段2",
        timeRange: "08:30~11:30",
        chargeReserve: "--",
        dischargeReserve: "95 %",
        subStrategies: [
          {
            id: "ws2_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "08:30 ~ 11:30",
            mode: "放电",
            power: "350",
          },
          {
            id: "ws2_2",
            name: "需量控制",
            type: "demand",
            badgeColor: "border-amber-500 text-amber-600 bg-amber-50/60",
            chargeOffset: "100 kW",
            chargeThreshold: "450 kW",
          }
        ]
      },
      {
        id: "wp3",
        title: "计划时段3",
        timeRange: "12:00~14:30",
        chargeReserve: "75 %",
        dischargeReserve: "20 %",
        subStrategies: [
          {
            id: "ws3_1",
            name: "全额消纳",
            type: "consumption",
            badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50/60",
            dischargeOffset: "60 kW",
            dischargeThreshold: "480 kW",
          }
        ]
      },
      {
        id: "wp4",
        title: "计划时段4",
        timeRange: "18:00~22:00",
        chargeReserve: "--",
        dischargeReserve: "95 %",
        subStrategies: [
          {
            id: "ws4_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "18:00 ~ 22:00",
            mode: "放电",
            power: "350",
          }
        ]
      }
    ]
  },
  {
    id: "tpl_sunny_pv_strong",
    name: "晴天强辐照高消纳模版（特殊天气）",
    isAi: false,
    category: "常规物理策略",
    description: "晴天强辐照专用基准！午间光伏超发大出力时段强化防逆流与储能强充，早晚高峰配合放电消纳",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-300",
    weatherFit: ["sunny"],
    periods: [
      {
        id: "sp1",
        title: "计划时段1",
        timeRange: "00:00~06:30",
        chargeReserve: "60 %",
        dischargeReserve: "--",
        subStrategies: [
          {
            id: "sp1_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "00:00 ~ 06:30",
            mode: "充电",
            power: "200",
          }
        ]
      },
      {
        id: "sp2",
        title: "计划时段2 (光伏强消纳)",
        timeRange: "08:30~16:00",
        chargeReserve: "98 %",
        dischargeReserve: "10 %",
        subStrategies: [
          {
            id: "sp2_1",
            name: "全额消纳",
            type: "consumption",
            badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50/60",
            dischargeOffset: "150 kW",
            dischargeThreshold: "500 kW",
          },
          {
            id: "sp2_2",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "11:00 ~ 14:00",
            mode: "充电",
            power: "320",
          }
        ]
      },
      {
        id: "sp3",
        title: "计划时段3 (晚高峰大放电)",
        timeRange: "18:00~22:30",
        chargeReserve: "--",
        dischargeReserve: "95 %",
        subStrategies: [
          {
            id: "sp3_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "18:00 ~ 22:30",
            mode: "放电",
            power: "350",
          }
        ]
      }
    ]
  },
  {
    id: "tpl_cloudy_flex_smoothing",
    name: "阴天波动柔性平抑模版（特殊天气）",
    isAi: false,
    category: "常规物理策略",
    description: "阴天与云遮多发天气专用！针对光伏出力剧烈起伏，配置自发自用与储能平抑缓冲时段",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-300",
    weatherFit: ["cloudy"],
    periods: [
      {
        id: "cp1",
        title: "计划时段1",
        timeRange: "00:00~07:00",
        chargeReserve: "80 %",
        dischargeReserve: "--",
        subStrategies: [
          {
            id: "cs1_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "00:00 ~ 07:00",
            mode: "充电",
            power: "280",
          }
        ]
      },
      {
        id: "cp2",
        title: "计划时段2 (平抑消纳)",
        timeRange: "08:00~17:00",
        chargeReserve: "85 %",
        dischargeReserve: "30 %",
        subStrategies: [
          {
            id: "cs2_1",
            name: "全额消纳",
            type: "consumption",
            badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50/60",
            dischargeOffset: "80 kW",
            dischargeThreshold: "460 kW",
          },
          {
            id: "cs2_2",
            name: "需量控制",
            type: "demand",
            badgeColor: "border-amber-500 text-amber-600 bg-amber-50/60",
            chargeOffset: "120 kW",
            chargeThreshold: "430 kW",
          }
        ]
      },
      {
        id: "cp3",
        title: "计划时段3",
        timeRange: "18:00~22:00",
        chargeReserve: "--",
        dischargeReserve: "90 %",
        subStrategies: [
          {
            id: "cs3_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "18:00 ~ 22:00",
            mode: "放电",
            power: "300",
          }
        ]
      }
    ]
  },
  {
    id: "tpl_rainy_arbitrage_two_cycles",
    name: "雨天常规两充两放模版（特殊天气）",
    isAi: false,
    category: "常规物理策略",
    description: "雨天光伏几乎无出力，完全依赖电网尖谷电价差执行传统两充两放，确保基础套利收益稳定",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-300",
    weatherFit: ["rainy"],
    periods: [
      {
        id: "rp1",
        title: "计划时段1",
        timeRange: "00:00~06:00",
        chargeReserve: "95 %",
        dischargeReserve: "--",
        subStrategies: [
          {
            id: "rs1_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "00:00 ~ 06:00",
            mode: "充电",
            power: "320",
          }
        ]
      },
      {
        id: "rp2",
        title: "计划时段2",
        timeRange: "08:30~11:30",
        chargeReserve: "--",
        dischargeReserve: "90 %",
        subStrategies: [
          {
            id: "rs2_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "08:30 ~ 11:30",
            mode: "放电",
            power: "320",
          }
        ]
      },
      {
        id: "rp3",
        title: "计划时段3",
        timeRange: "12:00~14:30",
        chargeReserve: "85 %",
        dischargeReserve: "--",
        subStrategies: [
          {
            id: "rs3_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "12:00 ~ 14:30",
            mode: "充电",
            power: "260",
          }
        ]
      },
      {
        id: "rp4",
        title: "计划时段4",
        timeRange: "18:00~22:00",
        chargeReserve: "--",
        dischargeReserve: "95 %",
        subStrategies: [
          {
            id: "rs4_1",
            name: "峰谷套利",
            type: "arbitrage",
            badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
            timeRange: "18:00 ~ 22:00",
            mode: "放电",
            power: "320",
          }
        ]
      }
    ]
  },
  {
    id: "tpl_snowy_frost_protection",
    name: "雪天防冻备电与变压器保护模版（特殊天气）",
    isAi: false,
    category: "常规物理策略",
    description: "雪天及超低温极端工况！优先预留电量保供站端温控辅热防冻，严格浅充浅放限制大倍率充放",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-300",
    weatherFit: ["snowy"],
    periods: [
      {
        id: "snp1",
        title: "计划时段1 (全天防冻自愈保障)",
        timeRange: "00:00~24:00",
        chargeReserve: "80 %",
        dischargeReserve: "40 %",
        subStrategies: [
          {
            id: "sns1_1",
            name: "需量控制",
            type: "demand",
            badgeColor: "border-amber-500 text-amber-600 bg-amber-50/60",
            chargeOffset: "100 kW",
            chargeThreshold: "380 kW",
          },
          {
            id: "sns1_2",
            name: "全额消纳",
            type: "consumption",
            badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50/60",
            dischargeOffset: "40 kW",
            dischargeThreshold: "400 kW",
          }
        ]
      }
    ]
  },
  {
    id: "tpl_none",
    name: "无策略（未配置/重置为空）",
    isAi: false,
    category: "未配置策略",
    description: "重置为无基准排期策略（不对储能及光伏做计划充放约束）",
    badgeColor: "bg-slate-100 text-slate-600 border-slate-300",
    weatherFit: ["sunny", "cloudy", "rainy", "snowy"],
    periods: []
  }
];

// July Weather Distribution (31 days)
export const JULY_WEATHER_MAPPING: Record<number, { weather: "sunny" | "cloudy" | "rainy" | "snowy"; label: string; temp: string }> = {
  1: { weather: "sunny", label: "晴", temp: "24~34°C" },
  2: { weather: "sunny", label: "晴", temp: "25~35°C" },
  3: { weather: "cloudy", label: "多云", temp: "23~32°C" },
  4: { weather: "sunny", label: "晴", temp: "26~36°C" },
  5: { weather: "rainy", label: "小雨", temp: "21~28°C" },
  6: { weather: "sunny", label: "晴", temp: "25~35°C" },
  7: { weather: "sunny", label: "晴", temp: "26~37°C" },
  8: { weather: "cloudy", label: "阴", temp: "22~30°C" },
  9: { weather: "sunny", label: "晴", temp: "24~35°C" },
  10: { weather: "sunny", label: "晴", temp: "25~36°C" },
  11: { weather: "sunny", label: "晴", temp: "26~36°C" },
  12: { weather: "rainy", label: "中雨", temp: "20~27°C" },
  13: { weather: "cloudy", label: "阴", temp: "22~31°C" },
  14: { weather: "sunny", label: "晴", temp: "25~35°C" },
  15: { weather: "sunny", label: "晴 (高温大发)", temp: "27~38°C" },
  16: { weather: "sunny", label: "晴", temp: "26~37°C" },
  17: { weather: "cloudy", label: "多云", temp: "24~33°C" },
  18: { weather: "sunny", label: "晴", temp: "25~36°C" },
  19: { weather: "rainy", label: "雷阵雨", temp: "21~29°C" },
  20: { weather: "cloudy", label: "多云", temp: "23~32°C" },
  21: { weather: "sunny", label: "晴", temp: "25~36°C" },
  22: { weather: "sunny", label: "晴", temp: "26~37°C" },
  23: { weather: "sunny", label: "晴", temp: "25~35°C" },
  24: { weather: "cloudy", label: "阴", temp: "22~30°C" },
  25: { weather: "sunny", label: "晴", temp: "26~36°C" },
  26: { weather: "rainy", label: "阵雨", temp: "22~28°C" },
  27: { weather: "sunny", label: "晴", temp: "25~35°C" },
  28: { weather: "cloudy", label: "多云", temp: "24~33°C" },
  29: { weather: "snowy", label: "极寒/模拟雪日", temp: "18~24°C" },
  30: { weather: "snowy", label: "极寒/模拟雪日", temp: "17~23°C" },
  31: { weather: "sunny", label: "晴", temp: "25~35°C" },
};

export const StrategySimulationConfigPage: React.FC<StrategySimulationConfigPageProps> = ({
  onBack,
  onSaveAndSimulate,
  initialMonth = "2026-07",
}) => {
  // Strategy Scope Mode:
  // "unified": Single baseline strategy for the whole month
  // "weather_unified": Unified configuration categorized by Sunny, Cloudy, Rainy, Snowy special weather
  const [scopeMode, setScopeMode] = useState<"unified" | "weather_unified">("weather_unified");

  // Special Weather mapping for All (不区分天气), Sunny, Cloudy, Rainy, Snowy
  const [weatherStrategyMap, setWeatherStrategyMap] = useState<{
    all: { type: "template" | "manual"; templateId: string };
    sunny: { type: "template" | "manual"; templateId: string };
    cloudy: { type: "template" | "manual"; templateId: string };
    rainy: { type: "template" | "manual"; templateId: string };
    snowy: { type: "template" | "manual"; templateId: string };
  }>({
    all: { type: "template", templateId: "tpl_weekend_july_aug" },
    sunny: { type: "template", templateId: "tpl_sunny_pv_strong" },
    cloudy: { type: "template", templateId: "tpl_cloudy_flex_smoothing" },
    rainy: { type: "template", templateId: "tpl_rainy_arbitrage_two_cycles" },
    snowy: { type: "template", templateId: "tpl_snowy_frost_protection" },
  });

  // Active weather tab (all, sunny, cloudy, rainy, snowy)
  const [activeWeatherTab, setActiveWeatherTab] = useState<"all" | "sunny" | "cloudy" | "rainy" | "snowy">("all");

  // Reset strategy handler for active weather tab or all weather tabs
  const handleResetStrategy = (weatherKey?: "all" | "sunny" | "cloudy" | "rainy" | "snowy") => {
    const targetKey = weatherKey || activeWeatherTab;
    const weatherNameMap = {
      all: "全部天气",
      sunny: "晴天",
      cloudy: "阴天",
      rainy: "雨天",
      snowy: "雪天"
    };

    setWeatherStrategyMap(prev => ({
      ...prev,
      [targetKey]: { type: "template", templateId: "tpl_none" }
    }));
    showToast(`已重置「${weatherNameMap[targetKey]}」策略模版为：无策略（未配置）`);
  };

  // Custom Editable Periods for Manual mode
  const [manualPeriods, setManualPeriods] = useState<StrategyPeriodItem[]>([
    {
      id: "mp1",
      title: "计划时段1",
      timeRange: "00:00~01:00",
      chargeReserve: "--",
      dischargeReserve: "--",
      subStrategies: [
        {
          id: "ms1_1",
          name: "峰谷套利",
          type: "arbitrage",
          badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
          timeRange: "00:00 ~ 01:00",
          mode: "放电",
          power: "130",
        },
        {
          id: "ms1_2",
          name: "需量控制",
          type: "demand",
          badgeColor: "border-amber-500 text-amber-600 bg-amber-50/60",
          chargeOffset: "120 kW",
          chargeThreshold: "425 kW",
        }
      ]
    },
    {
      id: "mp2",
      title: "计划时段2",
      timeRange: "01:00~06:00",
      chargeReserve: "55 %",
      dischargeReserve: "--",
      subStrategies: [
        {
          id: "ms2_1",
          name: "全额消纳",
          type: "consumption",
          badgeColor: "border-emerald-500 text-emerald-600 bg-emerald-50/60",
          dischargeOffset: "50 kW",
          dischargeThreshold: "495 kW",
        },
        {
          id: "ms2_2",
          name: "峰谷套利",
          type: "arbitrage",
          badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
          timeRange: "01:00 ~ 06:00",
          mode: "充电",
          power: "300",
        }
      ]
    }
  ]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Weather stats summary for July (31 days)
  const weatherStats = {
    all: 31,
    sunny: Object.values(JULY_WEATHER_MAPPING).filter(d => d.weather === "sunny").length,
    cloudy: Object.values(JULY_WEATHER_MAPPING).filter(d => d.weather === "cloudy").length,
    rainy: Object.values(JULY_WEATHER_MAPPING).filter(d => d.weather === "rainy").length,
    snowy: Object.values(JULY_WEATHER_MAPPING).filter(d => d.weather === "snowy").length,
  };

  // Currently displayed template / periods based on active weather tab
  const currentActiveTemplateId = weatherStrategyMap[activeWeatherTab].templateId;
  const currentActiveSelectionType = weatherStrategyMap[activeWeatherTab].type;

  const currentTemplateObj = PRESET_TEMPLATES.find(t => t.id === currentActiveTemplateId) || PRESET_TEMPLATES[0];

  const displayedPeriods = currentActiveSelectionType === "manual"
    ? manualPeriods
    : currentTemplateObj.periods;

  // Handle Save and Simulate
  const handleSaveAndExecuteSimulation = () => {
    const schedule: Record<number, MonthlyStrategyDayConfig> = {};
    const weekdaysMap = ["周三", "周四", "周五", "周六", "周日", "周一", "周二"];

    for (let day = 1; day <= 31; day++) {
      const weekdayIdx = (day - 1 + 2) % 7;
      const weekday = weekdaysMap[weekdayIdx];
      const isWeekend = weekday === "周六" || weekday === "周日";
      const weatherInfo = JULY_WEATHER_MAPPING[day] || { weather: "sunny", label: "晴" };

      // If user selected "all" (不区分天气), all days use weatherStrategyMap.all
      // If user selected a specific weather tab (sunny, cloudy, rainy, snowy), days use their respective weather config
      const weatherConfig = activeWeatherTab === "all"
        ? weatherStrategyMap.all
        : (weatherStrategyMap[weatherInfo.weather] || weatherStrategyMap.all);

      const chosenTemplateId = weatherConfig.templateId;
      const isManualMode = weatherConfig.type === "manual";
      const tpl = PRESET_TEMPLATES.find(t => t.id === chosenTemplateId) || PRESET_TEMPLATES[0];

      schedule[day] = {
        day: `${day}日`,
        dayNum: day,
        weekday,
        isWeekend,
        hasAiRunning: false, // Baseline strategy representation
        mode: isManualMode ? "custom" : "template",
        templateId: tpl.id,
        templateName: isManualMode ? "页面自定义时段策略" : tpl.name,
        weatherType: weatherInfo.weather,
        customPeriods: isManualMode ? manualPeriods : tpl.periods,
      };
    }

    onSaveAndSimulate(schedule);
  };

  // Weather tab labels (all, sunny, cloudy, rainy, snowy)
  const weatherTabItems: { key: "all" | "sunny" | "cloudy" | "rainy" | "snowy"; label: string; icon: any; color: string; activeBg: string; activeBorder: string; badgeColor: string }[] = [
    { key: "all", label: "全部 (通用)", icon: Layers, color: "text-slate-800", activeBg: "bg-slate-100", activeBorder: "border-slate-800 ring-2 ring-slate-800/10", badgeColor: "bg-slate-200 text-slate-800" },
    { key: "sunny", label: "晴天", icon: Sun, color: "text-amber-500", activeBg: "bg-amber-50/70", activeBorder: "border-amber-400 ring-2 ring-amber-400/20", badgeColor: "bg-amber-100 text-amber-800" },
    { key: "cloudy", label: "阴天", icon: Cloud, color: "text-cyan-500", activeBg: "bg-cyan-50/70", activeBorder: "border-cyan-400 ring-2 ring-cyan-400/20", badgeColor: "bg-cyan-100 text-cyan-800" },
    { key: "rainy", label: "雨天", icon: CloudRain, color: "text-blue-500", activeBg: "bg-blue-50/70", activeBorder: "border-blue-400 ring-2 ring-blue-400/20", badgeColor: "bg-blue-100 text-blue-800" },
    { key: "snowy", label: "雪天", icon: Snowflake, color: "text-indigo-500", activeBg: "bg-indigo-50/70", activeBorder: "border-indigo-400 ring-2 ring-indigo-400/20", badgeColor: "bg-indigo-100 text-indigo-800" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC] text-slate-800">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-black text-slate-900 tracking-tight">
              策略模拟配置与下发
            </h1>
            <span className="text-xs text-slate-400">
              选择对比基准基础策略，用于计算收益提升对比
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1 pb-24">
        
        {/* Weather type selector bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                天气类型策略配置导航
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                可选择「全部(不区分天气)」通用策略基准，或针对晴/阴/雨/雪特定天气分别指定基准策略
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-slate-500 font-medium">
                7月份天气统计：全部 <strong className="text-slate-800 font-mono">{weatherStats.all}</strong> 天 · 晴 <strong className="text-amber-600 font-mono">{weatherStats.sunny}</strong> 天 · 阴 <strong className="text-cyan-600 font-mono">{weatherStats.cloudy}</strong> 天 · 雨 <strong className="text-blue-600 font-mono">{weatherStats.rainy}</strong> 天 · 雪 <strong className="text-indigo-600 font-mono">{weatherStats.snowy}</strong> 天
              </div>
            </div>
          </div>

          {/* 5 Weather Type Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {weatherTabItems.map(item => {
              const isSelected = activeWeatherTab === item.key;
              const configItem = weatherStrategyMap[item.key];
              const matchedTpl = PRESET_TEMPLATES.find(t => t.id === configItem.templateId) || PRESET_TEMPLATES[0];
              const count = weatherStats[item.key];
              const isNoneStrategy = configItem.type === "template" && configItem.templateId === "tpl_none";

              return (
                <div
                  key={item.key}
                  onClick={() => setActiveWeatherTab(item.key)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between group relative ${
                    isSelected
                      ? `${item.activeBorder} ${item.activeBg} shadow-2xs`
                      : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                        {count} 天
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between gap-1.5">
                    <div className="text-[11px] text-slate-600 font-medium truncate flex-1">
                      {configItem.type === "manual" ? (
                        <span className="text-emerald-700 font-semibold">✍️ 页面自定义配置</span>
                      ) : isNoneStrategy ? (
                        <span className="text-slate-400 italic">⚪ 无策略 (未配置)</span>
                      ) : (
                        `📋 ${matchedTpl.name}`
                      )}
                    </div>

                    {/* Reset Button for this specific weather template */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetStrategy(item.key);
                      }}
                      className="opacity-80 group-hover:opacity-100 hover:bg-slate-200/80 text-slate-500 hover:text-rose-600 p-1 rounded transition-colors shrink-0 text-[10px] flex items-center gap-0.5"
                      title={`重置${item.label}模版为无策略`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline text-[10px]">重置</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 1: 1. 配置/选择基础策略（对比基准） */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="font-mono text-slate-900">1.</span>
                配置/选择基础策略（对比基准）
                {weatherStrategyMap[activeWeatherTab].type === "template" && weatherStrategyMap[activeWeatherTab].templateId === "tpl_none" && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    状态：无策略（未配置）
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                选择作为计算收益提升基准的传统固定物理策略，或重置为无策略
              </p>
            </div>

            {/* Quick Reset Button on Right Header */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResetStrategy(activeWeatherTab)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="重置当前天气策略为无策略"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
                <span>重置为无策略</span>
              </button>
            </div>
          </div>

          {/* 2 Big Cards: 选择已创建的非 AI 策略 vs 在本页面手动配置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: 选择已创建的非 AI 策略 */}
            <div
              onClick={() => {
                setWeatherStrategyMap(prev => ({
                  ...prev,
                  [activeWeatherTab]: { ...prev[activeWeatherTab], type: "template" }
                }));
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 relative ${
                currentActiveSelectionType === "template"
                  ? "border-[#00B06B] bg-emerald-50/30 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                currentActiveSelectionType === "template"
                  ? "bg-[#00B06B] text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    选择已创建的非 AI 策略模版
                  </h3>
                  {currentActiveSelectionType === "template" && (
                    <span className="w-4 h-4 rounded-full bg-[#00B06B] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  选择企业已发布或正在执行的非 AI 传统排期策略模版（包含无策略选项）。
                </p>
              </div>
            </div>

            {/* Card 2: 在本页面手动配置 */}
            <div
              onClick={() => {
                setWeatherStrategyMap(prev => ({
                  ...prev,
                  [activeWeatherTab]: { ...prev[activeWeatherTab], type: "manual" }
                }));
              }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 relative ${
                currentActiveSelectionType === "manual"
                  ? "border-[#00B06B] bg-emerald-50/30 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                currentActiveSelectionType === "manual"
                  ? "bg-[#00B06B] text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    在本页面手动配置
                  </h3>
                  {currentActiveSelectionType === "manual" && (
                    <span className="w-4 h-4 rounded-full bg-[#00B06B] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  直接自定义各时段的充放电保留率、功率等运行参数。
                </p>
              </div>
            </div>
          </div>

          {/* Template Dropdown Selector (Active when selectionType is template) */}
          {currentActiveSelectionType === "template" && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600 block">
                  选择已创建的策略模版
                </label>
                <button
                  type="button"
                  onClick={() => handleResetStrategy(activeWeatherTab)}
                  className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置此天气模版为无策略</span>
                </button>
              </div>
              <div className="relative">
                <select
                  value={currentActiveTemplateId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setWeatherStrategyMap(prev => ({
                      ...prev,
                      [activeWeatherTab]: { ...prev[activeWeatherTab], templateId: newId }
                    }));
                  }}
                  className="w-full appearance-none bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium rounded-lg px-3 py-2.5 pr-8 outline-none cursor-pointer transition-colors shadow-2xs"
                >
                  {PRESET_TEMPLATES.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: 2. 基础策略时段配置详情 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="font-mono text-slate-900">2.</span>
                基础策略时段配置详情 ({currentActiveSelectionType === "manual" ? "可编辑" : "只读"})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                当前所选非 AI 策略的运行时间及充放参数详情
              </p>
            </div>

            {currentActiveSelectionType === "manual" ? (
              <button
                onClick={() => {
                  const newPeriod: StrategyPeriodItem = {
                    id: `mp_${Date.now()}`,
                    title: `计划时段${manualPeriods.length + 1}`,
                    timeRange: "06:00~11:30",
                    chargeReserve: "--",
                    dischargeReserve: "90 %",
                    subStrategies: [
                      {
                        id: `ms_${Date.now()}_1`,
                        name: "峰谷套利",
                        type: "arbitrage",
                        badgeColor: "border-blue-500 text-blue-600 bg-blue-50/60",
                        timeRange: "06:00 ~ 11:30",
                        mode: "放电",
                        power: "200",
                      }
                    ]
                  };
                  setManualPeriods([...manualPeriods, newPeriod]);
                  showToast("已新增一个计划时段");
                }}
                className="flex items-center gap-1 text-xs font-bold text-[#00B06B] hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                新增计划时段
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleResetStrategy(activeWeatherTab)}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重置策略模版
              </button>
            )}
          </div>

          {/* Periods List rendering matching the screenshot or empty state if reset to None */}
          {displayedPeriods.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <RotateCcw className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700">当前天气已重置为「无策略（未配置）」</h4>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  该天气类型下的日期将不执行任何固定充放电基准策略，储能和光伏在基准对比中按自然自发自用状态计算。
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const defaultTemplateMap: Record<string, string> = {
                      all: "tpl_weekend_july_aug",
                      sunny: "tpl_sunny_pv_strong",
                      cloudy: "tpl_cloudy_flex_smoothing",
                      rainy: "tpl_rainy_arbitrage_two_cycles",
                      snowy: "tpl_snowy_frost_protection",
                    };
                    const fallbackTplId = defaultTemplateMap[activeWeatherTab] || "tpl_weekend_july_aug";
                    setWeatherStrategyMap(prev => ({
                      ...prev,
                      [activeWeatherTab]: { type: "template", templateId: fallbackTplId }
                    }));
                    showToast("已恢复默认基准排期模版");
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold bg-white text-emerald-600 border border-emerald-300 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  恢复默认基准模版
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedPeriods.map((period, pIdx) => (
                <div
                  key={period.id || pIdx}
                  className="rounded-xl border border-slate-200 overflow-hidden bg-white"
                >
                  {/* Period Top Bar: 计划时段X | 适用时段 | 充电预留容量 | 放电预留容量 */}
                  <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{period.title}</span>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-slate-400 mr-2">适用时段</span>
                        <span className="font-medium text-slate-800 font-mono">{period.timeRange}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 mr-2">充电预留容量</span>
                        <span className="font-medium text-slate-800 font-mono">{period.chargeReserve}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 mr-2">放电预留容量</span>
                        <span className="font-medium text-slate-800 font-mono">{period.dischargeReserve}</span>
                      </div>

                      {currentActiveSelectionType === "manual" && (
                        <button
                          onClick={() => {
                            setManualPeriods(manualPeriods.filter(p => p.id !== period.id));
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="删除该时段"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sub Strategies List */}
                  <div className="p-4 space-y-3">
                    {period.subStrategies?.map((sub, sIdx) => (
                      <div key={sub.id || sIdx} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">策略{sIdx + 1}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${sub.badgeColor}`}>
                            {sub.name}
                          </span>
                        </div>

                        {/* If Arbitrage with TimeRange, Mode, Power (kW) Table */}
                        {sub.type === "arbitrage" ? (
                          <div className="border border-slate-100 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#FAFAFA] text-slate-400 font-normal border-b border-slate-100">
                                <tr>
                                  <th className="px-4 py-2 font-normal">适用时段</th>
                                  <th className="px-4 py-2 font-normal">充放电模式</th>
                                  <th className="px-4 py-2 font-normal">充放电功率(kW)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                <tr className="text-slate-700 font-medium">
                                  <td className="px-4 py-2 font-mono">{sub.timeRange || period.timeRange}</td>
                                  <td className="px-4 py-2">{sub.mode || "放电"}</td>
                                  <td className="px-4 py-2 font-mono">{sub.power || "130"}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ) : sub.type === "demand" ? (
                          /* Demand Control Parameters */
                          <div className="bg-[#FAFAFA] p-3 rounded-lg border border-slate-100 flex flex-wrap items-center gap-8 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 mr-2">允许充电偏移量</span>
                              <span className="font-bold text-slate-800 font-mono">{sub.chargeOffset || "120 kW"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 mr-2">储能允许充电阈值</span>
                              <span className="font-bold text-slate-800 font-mono">{sub.chargeThreshold || "425 kW"}</span>
                            </div>
                          </div>
                        ) : (
                          /* Consumption / Full Consumption Parameters */
                          <div className="bg-[#FAFAFA] p-3 rounded-lg border border-slate-100 flex flex-wrap items-center gap-8 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 mr-2">允许放电偏移量</span>
                              <span className="font-bold text-slate-800 font-mono">{sub.dischargeOffset || "50 kW"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 mr-2">储能允许放电阈值</span>
                              <span className="font-bold text-slate-800 font-mono">{sub.dischargeThreshold || "495 kW"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: 配置预览 (24-hour Gantt Bar Preview) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              配置预览
            </h2>
            <span className="text-xs text-slate-400">24小时策略时段全景分布</span>
          </div>

          {/* Gantt Bar Strip */}
          <div className="pt-2">
            {displayedPeriods.length === 0 ? (
              <div className="w-full border border-dashed border-slate-200 rounded-lg p-3 bg-[#FAFAFA] flex items-center justify-center min-h-[44px]">
                <span className="text-xs text-slate-400 font-medium">⚪ 当前为无策略状态，24小时无基准充放排程约束</span>
              </div>
            ) : (
              <div className="w-full border border-slate-200 rounded-lg p-1.5 bg-[#FAFAFA] flex items-center min-h-[44px] overflow-x-auto gap-2">
                {/* Period 1: 00:00~01:00 */}
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md shrink-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded">峰</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">需</span>
                </div>

                {/* Period 2: 01:00~06:00 */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-md shrink-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">全额消纳</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">峰谷套利</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">需量控制</span>
                </div>

                {/* Middle daytime fill */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-md shrink-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">全额消纳</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">需量控制</span>
                </div>

                <div className="flex-1 min-w-[20px]" />

                {/* Period 4: 18:00~22:00 */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-md shrink-0 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">全额消纳</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">峰谷套利</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">需量控制</span>
                </div>
              </div>
            )}

            {/* Timeline Axis Labels */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1.5 px-0.5">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>00:00</span>
            </div>
          </div>
        </div>

      </div>

      {/* Fixed Bottom Action Bar strictly matching the design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-40 flex items-center justify-between shadow-lg">
        {/* Left Note */}
        <div className="flex items-center gap-2 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>算法模拟回测将完全参考本站历史真实负荷及充放参数。</span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
          >
            取消
          </button>
          <button
            onClick={handleSaveAndExecuteSimulation}
            className="px-6 py-2 text-xs font-bold bg-[#00B06B] hover:bg-[#00965b] text-white rounded-lg transition-all cursor-pointer shadow-sm shadow-emerald-100 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            保存并重新模拟
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategySimulationConfigPage;


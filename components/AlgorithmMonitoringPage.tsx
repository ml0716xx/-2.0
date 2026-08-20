import React, { useState, useMemo, useEffect } from "react";
import { 
  BarChart3, 
  Sun, 
  TrendingDown, 
  Zap, 
  Clock, 
  X, 
  CloudSun, 
  ChevronRight,
  Sparkles,
  Workflow,
  BrainCircuit,
  Layers,
  Calendar
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceArea, 
  ReferenceLine,
  ReferenceDot,
  Legend,
  Bar
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

// --- Mock Data Generators ---
// Simple LCG (Linear Congruential Generator) or seed-based random to ensure stable daily curves
const createSeededRandom = (seedStr: string) => {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

const generate24hData = (dateStr: string) => {
  const rand = createSeededRandom(dateStr || "2026-07-13");
  return Array.from({ length: 97 }, (_, i) => {
    const hour = i / 4;
    const h = Math.floor(hour);
    const m = (hour % 1) * 60;
    const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
  // Aligned with Prediction Page
    const isPeak = (h >= 8 && h <= 11) || (h >= 17 && h <= 20);
    const isValley = (h >= 0 && h <= 5) || (h >= 21 && h <= 23);

    // Price Logic (Real-time and Day-ahead)
    // Both can be negative as requested
    // Purchase Price Analysis (Peak-Valley)
    const basePurchasePrice = isPeak ? 1.15 : isValley ? 0.28 : 0.65;
    const purchasePrice = Math.round((basePurchasePrice + (rand() - 0.5) * 0.08) * 100) / 100;

    // Sell Price Analysis (Negative during peak PV)
    // PV Intensity factor: peaks at 1.0 around 13:00 (h=13)
    const pvIntensity = h >= 6 && h <= 18 ? Math.sin(((h - 6) / 12) * Math.PI) : 0;
    // Base sell price is around 0.45, but drops by up to 0.8 during midday gluts
    const sellPrice = Math.round((0.45 - (pvIntensity * 0.8) + (rand() - 0.5) * 0.05) * 100) / 100;

    // Load Curve Simulation
    let baseLoad = 400 + rand() * 50;
    if (isPeak) baseLoad += 650 + rand() * 150;
    else if (!isValley) baseLoad += 350 + rand() * 80;
    
    if (h === 3) baseLoad += 950; 
    const loadCurve = Math.round(baseLoad * 100) / 100;
    const loadActual = Math.round(Math.max(0, loadCurve * (0.97 + rand() * 0.06)) * 100) / 100;

    // PV Generation
    let pv = 0;
    if (h >= 6 && h <= 18) {
      pv = Math.sin(((h - 6) / 12) * Math.PI) * 1350 + (rand() - 0.5) * 80;
      if (h === 10 || h === 11) pv += 500;
      pv = Math.max(0, pv);
    }
    const pvForecast = Math.round(pv * 100) / 100;
    const pvActual = Math.round(Math.max(0, pvForecast * (0.92 + rand() * 0.15)) * 100) / 100;

    // AI Optimization Logic
    const unoptimizedGrid = Math.round((loadCurve - pvForecast) * 100) / 100;
    
    // Multi-tier Strategy Logic (Atomic Strategies)
    let bessAction = 0;
    const atomicStrategies = {
      arbitrage: 0, // 1: Charge (Valley), -1: Discharge (Peak), 0: None
      consumption: 0, // 1: Full Consumption (Charge to absorb), -1: Grid Feed-in (Discharge PV), 0: None
      demand: 0, // 1: Demand Control (Discharge to cap), -1: Dynamic Expansion (Discharge), 0: None
    };

    // Tier 1: Economic Arbitrage (Base layer)
    // Charging during valley, Discharging during peak
    if (isPeak) {
      atomicStrategies.arbitrage = -1; // Discharge
      bessAction = 300; 
    } else if (isValley) {
      atomicStrategies.arbitrage = 1; // Charge
      bessAction = -300;
    }

    // Tier 2: Consumption & Feed-in (PV Logic)
    // If PV is high and we are not already doing something more important, we mark it
    if (pvForecast > loadCurve + 200) {
      atomicStrategies.consumption = -1; // 余电上网 (Feed-in potential)
    }
    
    // Safety Guard 1: Anti-Reverse Flow (Overwrites previous logic if risk detected)
    // Ensure grid stays above 10kW by charging extra
    if (unoptimizedGrid - bessAction < 10) {
      bessAction = unoptimizedGrid - 10;
      atomicStrategies.consumption = 1; // 全额消纳 (Forced charge to avoid reverse)
    }
    
    // Tier 3: Demand Control (Safety Guard 2)
    // Ensure grid stays below 1200kW by discharging extra
    if (unoptimizedGrid - bessAction > 1200) {
      bessAction = unoptimizedGrid - 1100; 
      atomicStrategies.demand = 1; // 需量控制 (Forced discharge to cap demand)
    } else if (h >= 14 && h <= 15 && loadCurve > 800) {
      // Simulate "Dynamic Expansion" (Demand -1) for visualization variety
      atomicStrategies.demand = -1; 
    }

    const roundedBessAction = Math.round(bessAction * 100) / 100;
    const aiGridOptimized = Math.round((unoptimizedGrid - roundedBessAction) * 100) / 100;
    
    return {
      time,
      hour,
      purchasePrice,
      sellPrice,
      pvForecast,
      pvActual,
      loadCurve,
      loadActual,
      unoptimizedGrid,
      aiGridOptimized,
      bessAction: roundedBessAction,
      atomicStrategies
    };
  });
};

const MOCK_WEATHER = [
  { time: "00:00", temp: 18, icon: <CloudSun className="w-4 h-4 text-slate-400" /> },
  { time: "02:00", temp: 17, icon: <CloudSun className="w-4 h-4 text-slate-400" /> },
  { time: "04:00", temp: 16, icon: <CloudSun className="w-4 h-4 text-slate-400" /> },
  { time: "06:00", temp: 19, icon: <CloudSun className="w-4 h-4 text-amber-300" /> },
  { time: "08:00", temp: 24, icon: <CloudSun className="w-4 h-4 text-amber-500" /> },
  { time: "10:00", temp: 26, icon: <CloudSun className="w-4 h-4 text-amber-500" /> },
  { time: "12:00", temp: 28, icon: <Sun className="w-4 h-4 text-amber-500" /> },
  { time: "14:00", temp: 30, icon: <Sun className="w-4 h-4 text-amber-500" /> },
  { time: "16:00", temp: 30, icon: <CloudSun className="w-4 h-4 text-amber-500" /> },
  { time: "18:00", temp: 28, icon: <CloudSun className="w-4 h-4 text-slate-400" /> },
  { time: "20:00", temp: 26, icon: <CloudSun className="w-4 h-4 text-slate-400" /> },
  { time: "22:00", temp: 22, icon: <CloudSun className="w-4 h-4 text-slate-500" /> },
  { time: "24:00", temp: 19, icon: <CloudSun className="w-4 h-4 text-slate-500" /> },
];

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const weather = MOCK_WEATHER.find(w => w.time === payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={6} dy={10} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight={600}>
        {payload.value}
      </text>
      {weather && (
        <g transform="translate(-12, 22)">
          <foreignObject width="24" height="34">
            <div className="flex flex-col items-center justify-center -space-y-0.5">
              <div className="scale-75 origin-center">
                {weather.icon}
              </div>
              <span className="text-[9px] text-slate-500 font-bold tabular-nums">{weather.temp}°</span>
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
};

// --- Sub-Components ---

interface ForecastCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  unit: string;
  subLabel: string;
  subValue: string;
  subColor: string;
  chartColor: string;
  gradientId: string;
  data: { val: number }[];
  onClick?: () => void;
}

const ForecastCard: React.FC<ForecastCardProps> = ({
  title,
  icon,
  iconBg,
  iconColor,
  value,
  unit,
  subLabel,
  subValue,
  subColor,
  chartColor,
  gradientId,
  data,
  onClick
}) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
  >
    {/* Top Header Row */}
    <div className="flex items-start justify-between gap-3 mb-2 z-10">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-xs`}>
          {icon}
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium block leading-tight mb-1">{title}</span>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</span>
            <span className="text-xs text-slate-400 font-normal ml-1">{unit}</span>
          </div>
        </div>
      </div>

      <div className="text-right flex items-baseline gap-1 pt-1">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{subLabel}</span>
        <span className={`text-sm font-bold font-mono whitespace-nowrap ${subColor}`}>{subValue}</span>
      </div>
    </div>

    {/* Sparkline Area Chart */}
    <div className="h-20 sm:h-24 w-full -mx-1 relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.22} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke={chartColor} 
            strokeWidth={1.8} 
            fill={`url(#${gradientId})`} 
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Bottom-right arrow indicator matching screenshot */}
      <div className="absolute bottom-1 right-2 text-emerald-500 font-bold text-xs opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all select-none">
        →
      </div>
    </div>
  </div>
);

const DetailModal = ({ isOpen, onClose, data, initialType }: { isOpen: boolean, onClose: () => void, data: any[], initialType: 'pv' | 'load' | 'price' | null }) => {
  const [activeLayers, setActiveLayers] = useState({
    pv: false,
    load: false,
    price: false
  });

  // Re-sync with initialType when modal opens
  useEffect(() => {
    if (isOpen && initialType) {
      setActiveLayers({
        pv: initialType === 'pv',
        load: initialType === 'load',
        price: initialType === 'price'
      });
    }
  }, [isOpen, initialType]);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[8%] bottom-[8%] md:inset-x-[10%] z-[101] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-10 py-7 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-indigo-50 text-indigo-600`}>
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">全量数据预测与实测对比分析</h2>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-Source Multi-Layer Temporal Visualization</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { id: 'pv', label: '光伏预测', color: 'amber', icon: <Sun className="w-3 h-3" /> },
                  { id: 'load', label: '负荷预测', color: 'indigo', icon: <BarChart3 className="w-3 h-3" /> },
                  { id: 'price', label: '电价预测', color: 'emerald', icon: <TrendingDown className="w-3 h-3" /> }
                ].map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      activeLayers[layer.id as keyof typeof activeLayers]
                        ? `bg-${layer.color}-50 border-${layer.color}-200 text-${layer.color}-600 shadow-sm`
                        : 'bg-white border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {layer.icon}
                    {layer.label}
                  </button>
                ))}
                <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block" />
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors order-first md:order-last">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-10 bg-slate-50/10">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" interval={8} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  
                  {/* Energy Axis */}
                  <YAxis 
                    yAxisId="energy"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}} 
                    label={{ value: '功率/能量 (kW/kWh)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: '10px', fill: '#94a3b8', fontWeight: 'bold' } }}
                  />
                  
                  {/* Price Axis */}
                  {activeLayers.price && (
                    <YAxis 
                      yAxisId="price"
                      orientation="right"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#10b981', fontSize: 10}} 
                      label={{ value: '电价 (元/kWh)', angle: 90, position: 'insideRight', offset: 0, style: { fontSize: '10px', fill: '#10b981', fontWeight: 'bold' } }}
                    />
                  )}

                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '20px'}} 
                    itemStyle={{fontSize: '12px', fontWeight: 'bold', padding: '2px 0'}}
                    formatter={(value: any, name: any) => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      name
                    ]}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle" 
                    wrapperStyle={{fontSize: '11px', fontWeight: 'bold', color: '#64748b', top: -10}} 
                  />
                  
                  {/* PV Curves */}
                  {activeLayers.pv && (
                    <>
                      <Area yAxisId="energy" name="光伏预测 (kW)" type="monotone" dataKey="pvForecast" fill="#fef3c7" fillOpacity={0.2} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                      <Line yAxisId="energy" name="光伏实测 (kW)" type="monotone" dataKey="pvActual" stroke="#f59e0b" strokeWidth={3} dot={false} />
                    </>
                  )}

                  {/* Load Curves */}
                  {activeLayers.load && (
                    <>
                      <Area yAxisId="energy" name="负荷预测 (kW)" type="monotone" dataKey="loadCurve" fill="#eef2ff" fillOpacity={0.2} stroke="#6366f1" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                      <Line yAxisId="energy" name="负荷实测 (kW)" type="monotone" dataKey="loadActual" stroke="#6366f1" strokeWidth={3} dot={false} />
                    </>
                  )}

                  {/* Price Curves */}
                  {activeLayers.price && (
                    <>
                      <Line yAxisId="price" name="分时购电价 (元)" type="stepAfter" dataKey="purchasePrice" stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line yAxisId="price" name="分时上网价 (元)" type="stepAfter" dataKey="sellPrice" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <ReferenceLine yAxisId="price" y={0} stroke="#cbd5e1" strokeWidth={1} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-[1px] bg-slate-400 border-t-2 border-dashed" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Forecast Curve</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-[3px] bg-slate-800" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual Curve</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 bg-indigo-100 rounded-sm" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidence Interval</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Interactive Diagnostic Calibration Points for AI Monitor ---
const CALIBRATION_POINTS = [
  {
    id: 1,
    title: "低电价充电区",
    timeRange: "00:00 - 05:00",
    start: "00:00",
    end: "05:00",
    badgeColor: "bg-indigo-50 border-indigo-100 text-indigo-700",
    dotColor: "bg-indigo-500",
    condition: "此时段市电购电价格进入日内谷段极低水平（约 0.28 元/kWh）。",
    aiOptimizedText: "AI 调度决策：储能系统执行 300kW 大功率饱满充电蓄能，锁定谷电期低价电力，为高峰期放电做好充沛低成本储备。",
    impact: "最大限度吸收低谷市电，预计单次循环实现锁定度电价差收益 280+ 元。"
  },
  {
    id: 2,
    title: "超容安全红线",
    timeRange: "03:00 - 04:00",
    start: "03:00",
    end: "04:00",
    badgeColor: "bg-rose-50 border-rose-100 text-rose-700",
    dotColor: "bg-rose-500",
    condition: "凌晨 03:00 厂区大负荷冲击，负荷曲线骤升至约 1350kW，严重突逾变压器安全容量门限（1200kW）。",
    aiOptimizedText: "AI 调度决策：算法于前一日提前预判该负荷陡增，下发高限防卫放电指令（250kW），削减电网接入负荷锁至 1100kW 安全红线以内。",
    impact: "强效削峰，彻底规避高额变压器安全越限罚款约 5,000 元/次。"
  },
  {
    id: 3,
    title: "逆流限电风险",
    timeRange: "10:00 - 11:00",
    start: "10:00",
    end: "11:00",
    badgeColor: "bg-amber-50 border-amber-100 text-amber-700",
    dotColor: "bg-amber-500",
    condition: "上午 10:00 - 11:00 光伏发电出力进入暴增阶段（高达 1200kW），而由于厂内用负荷较低，导致电网下行功率逼近 10kW 反向逆流阀值。",
    aiOptimizedText: "AI 调度决策：自动触发‘全额消纳保护机制’，调度储能系统转为高功率大充电状态，吸收富余绿电，保护电网平稳，扼阻返灌限电风险。",
    impact: "保障光伏发电就地 100% 自发自用，遏绝逆向馈电的安全越级罚单。"
  },
  {
    id: 4,
    title: "上网负电价区",
    timeRange: "11:30 - 13:30",
    start: "11:30",
    end: "13:30",
    badgeColor: "bg-orange-50 border-orange-100 text-orange-700",
    dotColor: "bg-orange-500",
    condition: " midday 光伏出能极其饱和、局域电网倒挂，日内实时上网电价探跌至负值水平（约 -0.3 元/kWh）。直接上网意味着亏损贴钱。",
    aiOptimizedText: "AI 调度决策：开启‘上网调限’运行模式，动态封锁向电网的反送功率，将富余高品质绿电调剂注入储能中或厂区用能负载消纳。",
    impact: "规避倒供电亏损，通过策略避峰极大保护了整站运营的光伏收益水平。"
  },
  {
    id: 5,
    title: "高电价放电区",
    timeRange: "17:00 - 21:00",
    start: "17:00",
    end: "21:00",
    badgeColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
    dotColor: "bg-emerald-500",
    condition: "傍晚厂区生产正常运行，此时市电处于高电价购电尖峰时段（电费峰值高达 1.15 元/kWh）。",
    aiOptimizedText: "AI 调度决策：高功率释放日间储备的低价能量（最高放电 300kW），顶替高额网购电能负载，实现完美的电量峰谷溢价盈利。",
    impact: "极佳降低尖峰时刻市电负载，直接实现优化尖峰用能、预计降低电费达 15%+"
  }
];

const getTodayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getOffsetDateStr = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const CALIBRATION_INFO_MAP: Record<string, { title: string; desc: string; color: string; bg: string; border: string }> = {
  low_price: {
    title: "低电价时段",
    desc: "预计处于今日相对低电价时段",
    color: "#2563eb",
    bg: "bg-blue-50",
    border: "border-blue-100"
  },
  high_price: {
    title: "高电价时段",
    desc: "预计处于今日相对高电价时段",
    color: "#e11d48",
    bg: "bg-rose-50",
    border: "border-rose-100"
  },
  negative_price: {
    title: "上网负价时段",
    desc: "预计处于负电价时段",
    color: "#ea580c",
    bg: "bg-orange-50",
    border: "border-orange-100"
  },
  over_threshold: {
    title: "预计超阈值时段",
    desc: "预计基准电网侧负荷将超容/超需",
    color: "#8b5cf6",
    bg: "bg-purple-50",
    border: "border-purple-100"
  },
  reverse_flow: {
    title: "预计逆流时段",
    desc: "预计基准电网侧将逆流",
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-100"
  }
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  calibrationDots: any[];
  hoveredCalibration: number | null;
  visibleSeries: Record<string, boolean>;
  hoveredSeries?: string | null;
}

const CustomTooltip = ({ active, payload, label, calibrationDots, hoveredCalibration, visibleSeries, hoveredSeries }: CustomTooltipProps) => {
  if (!active) return null;

  let activeDot = null;
  if (hoveredCalibration !== null) {
    activeDot = calibrationDots.find((dot: any) => dot.id === hoveredCalibration);
  }
  if (!activeDot && label) {
    activeDot = calibrationDots.find((dot: any) => label >= dot.start && label <= dot.end);
  }

  const info = activeDot ? CALIBRATION_INFO_MAP[activeDot.type] : null;

  const isSeriesVisible = (name: string) => {
    if (!visibleSeries) return true;
    if (name.includes("购电")) return visibleSeries["购电电价"];
    if (name.includes("上网")) return visibleSeries["上网电价"];
    if (name.includes("储能")) return visibleSeries["储能排程"];
    if (name.includes("负载")) return visibleSeries["负载"];
    if (name.includes("光伏")) return visibleSeries["光伏功率"];
    if (name.includes("基准")) return visibleSeries["基准电网"];
    if (name.includes("电网") || name.includes("AI 预测")) return visibleSeries["电网功率"];
    return true;
  };

  const visiblePayload = (payload || []).filter((item: any) => isSeriesVisible(item.name));

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl p-2.5 shadow-[0_10px_25px_rgba(15,23,42,0.06)] text-left w-[220px] pointer-events-none text-slate-800 font-sans">
      <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-500" />
          <span>时段: {label}</span>
        </span>
        {activeDot && (
          <span className="text-[8px] font-bold text-indigo-600 font-mono uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded">
            标定激活
          </span>
        )}
      </div>

      {info && activeDot && (
        <div className={`mb-1.5 p-1.5 rounded-lg border ${info.bg} ${info.border} text-slate-700 space-y-0.5 shadow-sm`}>
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <div className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: info.color }} />
            <span style={{ color: info.color }}>{info.title}</span>
            <span className="text-[8.5px] text-slate-400 font-mono ml-auto">{activeDot.start}-{activeDot.end}</span>
          </div>
          <div className="text-[9px] text-slate-500 font-medium pl-2.5 leading-tight">
            {info.desc}
          </div>
        </div>
      )}

      {visiblePayload.length > 0 ? (
        <div className="space-y-1 max-h-[160px] overflow-y-auto pr-0.5">
          {visiblePayload.map((item: any, idx: number) => {
            if (item.value === undefined || item.value === null) return null;
            const isPrice = item.name.includes("电价") || (item.name.includes("预测") && item.name.includes("价"));
            const unit = isPrice ? " 元/kWh" : " kW";
            const isItemHighlighted = hoveredSeries && (
              item.name.includes(hoveredSeries) || 
              (hoveredSeries === "电网功率" && (item.name.includes("电网") || item.name.includes("AI 预测")))
            );
            
            return (
              <div 
                key={idx} 
                className={`flex items-center justify-between gap-3 text-[10px] px-1 py-0.5 rounded transition-colors ${
                  isItemHighlighted ? 'bg-indigo-50/80 font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <span 
                    className={`rounded-full shrink-0 ${isItemHighlighted ? 'w-2 h-2 ring-1 ring-indigo-300' : 'w-1 h-1'}`} 
                    style={{ backgroundColor: item.color || '#94a3b8' }} 
                  />
                  <span className={isItemHighlighted ? 'text-slate-900 font-bold' : ''}>{item.name}</span>
                </div>
                <span className={`font-mono ${isItemHighlighted ? 'font-heavy text-indigo-700' : 'font-bold text-slate-700'}`}>
                  {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
                  <span className="text-[8px] text-slate-400 font-normal ml-0.5">{unit}</span>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-[10px] text-slate-400 text-center py-1 font-medium">
          无活跃数据指标
        </div>
      )}
    </div>
  );
};

const AlgorithmMonitoringPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [highlightRange, setHighlightRange] = useState<{ start: string; end: string } | null>(null);
  const [hoveredCalibration, setHoveredCalibration] = useState<number | null>(null);
  const [hoveredChartTime, setHoveredChartTime] = useState<string | null>(null);
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    "电网功率": true,
    "基准电网": true,
    "光伏功率": true,
    "负载": true,
    "储能排程": true,
    "购电电价": false,
    "上网电价": false
  });

  const isBasicActive = visibleSeries["基准电网"] && visibleSeries["光伏功率"] && visibleSeries["负载"];
  const isPriceActive = visibleSeries["购电电价"] && visibleSeries["上网电价"];
  const isAiActiveSeries = visibleSeries["储能排程"] && visibleSeries["电网功率"];

  const handleComboClick = (type: 'basic' | 'price' | 'ai') => {
    if (type === 'basic') {
      const nextVal = !isBasicActive;
      setVisibleSeries(prev => ({
        ...prev,
        "基准电网": nextVal,
        "光伏功率": nextVal,
        "负载": nextVal
      }));
    } else if (type === 'price') {
      const nextVal = !isPriceActive;
      setVisibleSeries(prev => ({
        ...prev,
        "购电电价": nextVal,
        "上网电价": nextVal
      }));
    } else if (type === 'ai') {
      const nextVal = !isAiActiveSeries;
      setVisibleSeries(prev => ({
        ...prev,
        "储能排程": nextVal,
        "电网功率": nextVal
      }));
    }
  };

  const handleLegendClick = (e: any) => {
    const { dataKey, value } = e;
    // Map value to the series key if needed, or just use value directly if they match
    let key = value;
    if (value === "实际环节负载") key = "负载"; 
    
    setVisibleSeries(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const data = useMemo(() => generate24hData(selectedDate), [selectedDate]);

  const { pvTotal, loadTotal, currentIndex, priceRange } = useMemo(() => {
    const todayStr = getTodayStr();
    let idx = 96; // By default, for historical dates, everything is in the past ("actual")
    
    if (selectedDate === todayStr) {
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      idx = Math.min(Math.floor(currentHour * 4), 96);
    } else if (selectedDate > todayStr) {
      idx = 0; // Future
    }

    const pv = data.reduce((acc, curr) => acc + curr.pvForecast, 0) / 4;
    const load = data.reduce((acc, curr) => acc + curr.loadCurve, 0) / 4;

    const purchasePrices = data.map(d => d.purchasePrice);
    const sellPrices = data.map(d => d.sellPrice);

    return {
      pvTotal: pv.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
      loadTotal: load.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
      currentIndex: idx,
      priceRange: {
        purchaseMin: Math.min(...purchasePrices).toFixed(4),
        purchaseMax: Math.max(...purchasePrices).toFixed(4),
        sellMin: Math.min(...sellPrices).toFixed(4),
        sellMax: Math.max(...sellPrices).toFixed(4),
        sellAvg: (sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length).toFixed(4)
      }
    };
  }, [data, selectedDate]);

  // Split data into actual (hist) and forecast (future) for visualization
  const processedData = useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      // Grid
      gridActual: i <= currentIndex ? d.aiGridOptimized : null,
      gridForecast: i >= currentIndex ? d.aiGridOptimized : null,
      baselineActual: i <= currentIndex ? d.unoptimizedGrid : null,
      baselineForecast: i >= currentIndex ? d.unoptimizedGrid : null,
      // PV & Load - distinguish actual/forecast
      pvActualLine: i <= currentIndex ? d.pvActual : null,
      pvForecastLine: i >= currentIndex ? d.pvForecast : null,
      loadActualLine: i <= currentIndex ? d.loadActual : null,
      loadForecastLine: i >= currentIndex ? d.loadCurve : null,
      // Price - distinguish purchase/sell and actual/forecast
      purchasePriceActual: i <= currentIndex ? d.purchasePrice : null,
      purchasePriceForecast: i >= currentIndex ? d.purchasePrice : null,
      sellPriceActual: i <= currentIndex ? d.sellPrice : null,
      sellPriceForecast: i >= currentIndex ? d.sellPrice : null,
    }));
  }, [data, currentIndex]);

  const calibrationDots = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    
    const groupedPeriods: { type: string; points: any[] }[] = [];
    let currentGroup: { type: string; points: any[] } | null = null;

    processedData.forEach((d: any) => {
      const time = d.time;
      let type: string | null = null;
      let catInfo: any = null;

      if ((time >= "00:00" && time <= "07:59") || (time >= "23:00" && time <= "23:59")) {
        type = "low_price";
        catInfo = {
          title: "低电价时段",
          badgeColor: "bg-blue-50 border-blue-100 text-blue-700",
          dotColor: "bg-blue-500",
          start: time >= "00:00" && time <= "07:59" ? "00:00" : "23:00",
          end: time >= "00:00" && time <= "07:59" ? "07:59" : "23:59",
          condition: `处于谷期极低电价时段 (${time >= "00:00" && time <= "07:59" ? "00:00-07:59" : "23:00-23:59"})，购电电价约 ${d.purchasePrice} 元/kWh。`,
          aiOptimizedText: `AI 调度决策：执行最优谷电充电蓄能 (${Math.abs(d.bessAction)}kW)，低成本吸纳廉价网侧电量储备。`,
          impact: `储能低成本吸能，最大化拉大日内价差空间，预计该单次循环收益非常丰沛。`
        };
      } else if ((time >= "10:00" && time <= "11:59") || (time >= "15:00" && time <= "20:59")) {
        type = "high_price";
        catInfo = {
          title: "高电价时段",
          badgeColor: "bg-rose-50 border-rose-100 text-rose-700",
          dotColor: "bg-rose-500",
          start: time >= "10:00" && time <= "11:59" ? "10:00" : "15:00",
          end: time >= "10:00" && time <= "11:59" ? "11:59" : "20:59",
          condition: `处于购电峰/尖段高价时段 (${time >= "10:00" && time <= "11:59" ? "10:00-11:59" : "15:00-20:59"})，市电电费高达 ${d.purchasePrice} 元/kWh。`,
          aiOptimizedText: `AI 调度决策：精准释放储能高溢价电力 (${d.bessAction}kW)，强制顶替高额网购电量。`,
          impact: `避峰放电闪击，最大化利用储能峰谷高价差，直接冲减高额整站峰值电费。`
        };
      } else if (time >= "13:30" && time <= "14:59") {
        type = "negative_price";
        catInfo = {
          title: "上网负电价时段",
          badgeColor: "bg-orange-50 border-orange-100 text-orange-700",
          dotColor: "bg-orange-500",
          start: "13:30",
          end: "14:59",
          condition: `处于午间光伏过剩极值期 (13:30-14:59)，日内实时上网电价低至负值 (${d.sellPrice} 元/kWh)。`,
          aiOptimizedText: `AI 调度决策：自动实施上网调限防护，调度储能大功率充电消纳 (${Math.abs(d.bessAction)}kW)，闭锁逆流。`,
          impact: `阻断返送负电价网侧所导致的贴钱亏损，全额消纳多余绿电。`
        };
      } else if (time >= "08:00" && time <= "09:59") {
        type = "over_threshold";
        catInfo = {
          title: "预计超阈时段",
          badgeColor: "bg-purple-50 border-purple-100 text-purple-700",
          dotColor: "bg-purple-500",
          start: "08:00",
          end: "09:59",
          condition: `厂区迎来早班生产的大负荷陡峭爬坡期 (08:00-09:59)，基准网侧负荷预计暴涨至 ${d.loadCurve}kW，超出变压器安全容量。`,
          aiOptimizedText: `AI 调度决策：自动执行需量安全防御，释放峰值防御有功 (${d.bessAction}kW)，平抑变压器负载。`,
          impact: `精准将变压器受电有功锁定在安全边界以内 (${d.aiGridOptimized}kW)，彻底规避月度需量超限罚款风险。`
        };
      } else if (time >= "12:00" && time <= "13:29") {
        type = "reverse_flow";
        catInfo = {
          title: "预计逆流时段",
          badgeColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
          dotColor: "bg-emerald-500",
          start: "12:00",
          end: "13:29",
          condition: `中午光伏出力处于大发饱和阶段 (12:00-13:29)，本地负载低迷，有功倒灌并网潮流逼近安全反向逆流阈值。`,
          aiOptimizedText: `AI 调度决策：触发全消纳防逆流联动消纳模式，引导储能充电吸收多余光伏绿电 (${Math.abs(d.bessAction)}kW)。`,
          impact: `消除并网点逆向溢流引发的电网合规性风险，大幅提高绿电就地消纳率。`
        };
      }

      if (type) {
        if (currentGroup && currentGroup.type === type) {
          currentGroup.points.push({ item: d, catInfo });
        } else {
          if (currentGroup) {
            groupedPeriods.push(currentGroup);
          }
          currentGroup = {
            type,
            points: [{ item: d, catInfo }]
          };
        }
      } else {
        if (currentGroup) {
          groupedPeriods.push(currentGroup);
          currentGroup = null;
        }
      }
    });

    if (currentGroup) {
      groupedPeriods.push(currentGroup);
    }

    const dots = groupedPeriods.map((group, index) => {
      const midIndex = Math.floor(group.points.length / 2);
      const { item: d, catInfo } = group.points[midIndex];
      const time = d.time;
      const start = group.points[0].item.time;
      const end = group.points[group.points.length - 1].item.time;
      
      return {
        id: index + 1,
        title: catInfo.title,
        timeRange: `${start} - ${end}`,
        start,
        end,
        badgeColor: catInfo.badgeColor,
        dotColor: catInfo.dotColor,
        condition: catInfo.condition,
        aiOptimizedText: catInfo.aiOptimizedText,
        impact: catInfo.impact,
        anchorTime: time,
        x: time,
        y: d.unoptimizedGrid ?? 0, // Plot on baseline/unoptimized grid curve
        yAxisId: "energy",
        type: group.type
      };
    });

    return dots;
  }, [processedData]);

  const filteredCalibrationDots = calibrationDots;

  const activeHoveredDot = useMemo(() => {
    if (hoveredCalibration !== null) {
      return calibrationDots.find(pt => pt.id === hoveredCalibration) || null;
    }
    if (hoveredChartTime !== null) {
      return calibrationDots.find(pt => hoveredChartTime >= pt.start && hoveredChartTime <= pt.end) || null;
    }
    return null;
  }, [calibrationDots, hoveredCalibration, hoveredChartTime]);

  // Aligned strategy details generation to correspond with the 3-tier logic
  const strategyEvents = useMemo(() => {
    return [
      // 00:00 - 03:00
      {
        startTime: "00:00",
        endTime: "03:00",
        type: "峰谷套利(充)",
        action: "充电 (300.00kW)",
        color: "indigo",
        reason: "当前处于电价谷段，算法建议满额充电储备。"
      },
      {
        startTime: "00:00",
        endTime: "03:00",
        type: "需量控制",
        action: "安全备用 (0.00kW)",
        color: "rose",
        reason: "夜间厂区变压器安全负荷容量充裕，未触发需量削峰限值，系统维持静默备用。"
      },
      {
        startTime: "00:00",
        endTime: "03:00",
        type: "全额消纳",
        action: "待机 (0.00kW)",
        color: "emerald",
        reason: "此段无光伏发电出力，系统保持绿色电力自发自用通道通畅，随时响应微网并网状态。"
      },
      // 03:00 - 04:00
      {
        startTime: "03:00",
        endTime: "04:00",
        type: "需量控制",
        action: "放电 (295.52kW)",
        color: "rose",
        reason: "负荷预测超容风险触发，执行高功率放电。"
      },
      {
        startTime: "03:00",
        endTime: "04:00",
        type: "峰谷套利(充)",
        action: "动作闭锁 (0.00kW)",
        color: "indigo",
        reason: "需量越限控制处于最高优先级，紧急闭锁谷段充电指令，转为防越限放电。"
      },
      // 04:00 - 06:00
      {
        startTime: "04:00",
        endTime: "06:00",
        type: "峰谷套利(充)",
        action: "充电 (300.00kW)",
        color: "indigo",
        reason: "继续处于电价谷段，算法建议满额充电储备，确保次日首个高峰期放电电量充足。"
      },
      {
        startTime: "04:00",
        endTime: "06:00",
        type: "需量控制",
        action: "安全备用 (0.00kW)",
        color: "rose",
        reason: "厂区负荷回落至安全区间，需量控制自动解除放电，进入安全策略待机监视。"
      },
      // 08:00 - 09:00
      {
        startTime: "08:00",
        endTime: "09:00",
        type: "峰谷套利(放)",
        action: "放电 (300.00kW)",
        color: "indigo",
        reason: "上午电价进入峰段，启动储能额定功率放电，执行高峰高价套利。"
      },
      {
        startTime: "08:00",
        endTime: "09:00",
        type: "需量控制",
        action: "协同削峰 (80.00kW)",
        color: "rose",
        reason: "早班负荷处于快速上升阶段，储能高位放电自然顺带削减了变压器的瞬时需求负荷。"
      },
      // 09:00 - 14:15
      {
        startTime: "09:00",
        endTime: "14:15",
        type: "全额消纳",
        action: "充电 (228.11kW)",
        color: "emerald",
        reason: "午间光伏出力极高，本地负载无法完全吸收。为防止逆流倒送电网，储能启动绿电消纳充电。"
      },
      {
        startTime: "09:00",
        endTime: "14:15",
        type: "峰谷套利(充)",
        action: "平段蓄能 (50.00kW)",
        color: "indigo",
        reason: "中午处于电价平段，算法检测到光伏富余，建议低成本蓄能以备晚间高峰期二次放电。"
      },
      // 14:15 - 14:45
      {
        startTime: "14:15",
        endTime: "14:45",
        type: "动态增容",
        action: "预设增容",
        color: "rose",
        reason: "预测到未来负载波动风险，提前释放变压器增容余量，防止变压器温度过高越限。"
      },
      {
        startTime: "14:15",
        endTime: "14:45",
        type: "全额消纳",
        action: "充电 (413.77kW)",
        color: "emerald",
        reason: "午后光伏瞬时爬峰，算法预测有逆流风险，协同调节储能进行高比例并网消纳。"
      },
      // 14:45 - 15:00
      {
        startTime: "14:45",
        endTime: "15:00",
        type: "全额消纳",
        action: "充电 (413.77kW)",
        color: "emerald",
        reason: "光伏功率高企且触发逆流风险，强制消纳充电。"
      },
      {
        startTime: "14:45",
        endTime: "15:00",
        type: "动态增容",
        action: "预设增容",
        color: "rose",
        reason: "预测到未来负载波动风险，提前释放增容余量。"
      },
      // 15:00 - 15:15
      {
        startTime: "15:00",
        endTime: "15:15",
        type: "动态增容",
        action: "预设增容",
        color: "rose",
        reason: "预测到未来负载波动风险，提前释放增容余量。"
      },
      {
        startTime: "15:00",
        endTime: "15:15",
        type: "全额消纳",
        action: "充电 (177.05kW)",
        color: "emerald",
        reason: "光伏功率高企且触发逆流风险，强制消纳充电。"
      },
      // 15:15 - 15:30
      {
        startTime: "15:15",
        endTime: "15:30",
        type: "全额消纳",
        action: "充电 (177.05kW)",
        color: "emerald",
        reason: "光伏功率高企且触发逆流风险，强制消纳充电。"
      },
      {
        startTime: "15:15",
        endTime: "15:30",
        type: "动态增容",
        action: "预设增容",
        color: "rose",
        reason: "预测到未来负载波动风险，提前释放增容余量。"
      },
      // 15:30 - 16:00
      {
        startTime: "15:30",
        endTime: "16:00",
        type: "动态增容",
        action: "预设增容",
        color: "rose",
        reason: "预测到未来负载波动风险，提前释放增容余量。"
      },
      {
        startTime: "15:30",
        endTime: "16:00",
        type: "全额消纳",
        action: "余电充电 (150.00kW)",
        color: "emerald",
        reason: "傍晚前最后一波光伏余量捕获，算法建议尽可能吸收光伏绿电，降低综合电费。"
      },
      // 17:00 - 21:00
      {
        startTime: "17:00",
        endTime: "21:00",
        type: "峰谷套利(放)",
        action: "放电 (300.00kW)",
        color: "indigo",
        reason: "晚间迎来最关键的电价最高峰段，储能满负荷放电，将储藏的廉价电能高价售回/自用以获利。"
      },
      {
        startTime: "17:00",
        endTime: "21:00",
        type: "需量控制",
        action: "越限削峰 (120.00kW)",
        color: "rose",
        reason: "晚间厂区动力设备与照明负荷重合，负荷曲线急剧爬升。储能放电有效阻止变压器越限。"
      },
      {
        startTime: "17:00",
        endTime: "21:00",
        type: "全额消纳",
        action: "通道静默 (0.00kW)",
        color: "emerald",
        reason: "光伏已无发电量，全额消纳通道进入安全静默备用状态，完全释放电量配合削峰套利。"
      },
      // 21:00 - 24:00
      {
        startTime: "21:00",
        endTime: "24:00",
        type: "峰谷套利(充)",
        action: "充电 (300.00kW)",
        color: "indigo",
        reason: "21:00后电价再度回落入低谷段，储能启动低成本充电循环，为下一轮循环储备能量。"
      },
      {
        startTime: "21:00",
        endTime: "24:00",
        type: "需量控制",
        action: "安全备用 (0.00kW)",
        color: "rose",
        reason: "变压器整体负载负荷平缓安全，执行常规电压越限与谐波抑制安全保护检测。"
      },
      {
        startTime: "21:00",
        endTime: "24:00",
        type: "全额消纳",
        action: "待机 (0.00kW)",
        color: "emerald",
        reason: "夜间无光伏发电，消纳策略通道进入休眠，保持状态同步。"
      }
    ];
  }, []);

  const getRowSpan = (index: number) => {
    const current = strategyEvents[index];
    if (!current) return 1;
    const currentTimeStr = `${current.startTime} - ${current.endTime}`;
    
    if (index > 0) {
      const prev = strategyEvents[index - 1];
      if (prev && `${prev.startTime} - ${prev.endTime}` === currentTimeStr) {
        return 0;
      }
    }
    
    let span = 1;
    for (let i = index + 1; i < strategyEvents.length; i++) {
      const next = strategyEvents[i];
      if (next && `${next.startTime} - ${next.endTime}` === currentTimeStr) {
        span++;
      } else {
        break;
      }
    }
    return span;
  };

  return (
    <div className="w-full space-y-4">
      {/* State Switcher & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">算法监控</h1>
          </div>
        </div>

        {/* Date Selector and Engine Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Date Picker Group */}
          <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-xl px-3.5 py-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <div className="relative flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">选择日期:</span>
              <input 
                type="date" 
                value={selectedDate}
                max={getTodayStr()} // Only allow historical or today
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none focus:ring-0 cursor-pointer p-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100/50 rounded-xl text-emerald-600 shadow-xs">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="text-xs font-bold">
              {selectedDate === getTodayStr() ? "AI 智能调度引擎运行中" : "AI 历史归档数据调度已完成"}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        {/* Top Section: Input Source Metrics Cards in a Grid */}
        <div className="space-y-2.5">
          <div className="px-1 flex items-center justify-between text-slate-800">
            <h2 className="text-xs font-bold flex items-center gap-1.5 text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              {selectedDate === getTodayStr() ? "数据输入源" : `历史运行记录 (${selectedDate})`}
            </h2>
            <div className="flex items-center gap-2 px-2.5 py-0.5 bg-white border border-slate-100 rounded-full shadow-xs">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tight">
                {selectedDate === getTodayStr() ? `实时更新: ${new Date().toLocaleTimeString()}` : "历史已归档"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ForecastCard 
              title="光伏发电预测"
              icon={<Sun className="w-5 h-5" />} 
              iconBg="bg-emerald-50/80 border border-emerald-100/60"
              iconColor="text-emerald-600"
              value={pvTotal} 
              unit="kWh" 
              subLabel="预测增长"
              subValue="-21.38%"
              subColor="text-emerald-500"
              chartColor="#10b981"
              gradientId="pvSparkGrad"
              data={data.map(d => ({ val: d.pvForecast }))}
              onClick={() => setActiveModal('pv')}
            />
            <ForecastCard 
              title="负荷消耗预测"
              icon={<BarChart3 className="w-5 h-5" />} 
              iconBg="bg-sky-50/80 border border-sky-100/60"
              iconColor="text-sky-500"
              value={loadTotal} 
              unit="kWh" 
              subLabel="峰值功率"
              subValue="793.31 kW"
              subColor="text-sky-500"
              chartColor="#0ea5e9"
              gradientId="loadSparkGrad"
              data={data.map(d => ({ val: d.loadCurve }))}
              onClick={() => setActiveModal('load')}
            />
            <ForecastCard 
              title="当前电价"
              icon={<Zap className="w-5 h-5" />} 
              iconBg="bg-purple-50/80 border border-purple-100/60"
              iconColor="text-purple-600"
              value={`${priceRange.purchaseMin}-${priceRange.purchaseMax}`} 
              unit="元/kWh" 
              subLabel="上网"
              subValue={`${priceRange.sellMin}-${priceRange.sellMax} 元/kWh`}
              subColor="text-purple-600"
              chartColor="#a855f7"
              gradientId="priceSparkGrad"
              data={data.map(d => ({ val: d.purchasePrice }))}
              onClick={() => setActiveModal('price')}
            />
          </div>
        </div>

        {/* Main Charts Visualizer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 pb-3 space-y-4">
            {/* Layer C: Optimized Power Curves */}
            <div className="relative pt-2 group/layer">
              <div className="flex items-center justify-between mb-3 px-1 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 tracking-wide">算法运行监控</span>
                </div>
              </div>

              <div className="h-[430px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={processedData}
                    onMouseMove={(state) => {
                      if (state && state.activeLabel) {
                        setHoveredChartTime(state.activeLabel);
                      } else {
                        setHoveredChartTime(null);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredChartTime(null);
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={<CustomXAxisTick />} 
                      interval={8} 
                      height={60}
                    />
                    <YAxis yAxisId="energy" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#94a3b8' } }} />
                    <YAxis yAxisId="price" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#10b981', fontSize: 10}} label={{ value: '电价 (元)', angle: 90, position: 'insideRight', style: { fontSize: '10px', fill: '#10b981' } }} />
                    
                    <Tooltip 
                      content={<CustomTooltip calibrationDots={calibrationDots} hoveredCalibration={hoveredCalibration} visibleSeries={visibleSeries} hoveredSeries={hoveredSeries} />} 
                    />
                    
                    {/* Render a beautifully styled dynamic shaded background band ONLY when a calibration dot is hovered */}
                    {activeHoveredDot && (
                      (() => {
                        const areaColor = 
                          activeHoveredDot.type === 'low_price' ? '#3b82f6' : 
                          activeHoveredDot.type === 'high_price' ? '#f43f5e' : 
                          activeHoveredDot.type === 'negative_price' ? '#f97316' : 
                          activeHoveredDot.type === 'over_threshold' ? '#a855f7' : 
                          activeHoveredDot.type === 'reverse_flow' ? '#10b981' : 
                          '#6366f1';
                        
                        return (
                          <ReferenceArea 
                            x1={activeHoveredDot.start}
                            x2={activeHoveredDot.end}
                            yAxisId="energy"
                            fill={areaColor}
                            fillOpacity={0.03}
                            stroke={areaColor}
                            strokeOpacity={0.7}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                        );
                      })()
                    )}
                    
                    {/* Highlighted Thresholds */}
                    <ReferenceLine y={1200} yAxisId="energy" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" label={{ position: 'right', value: '超容阈值 (1200kW)', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                    <ReferenceLine y={10} yAxisId="energy" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" label={{ position: 'right', value: '逆流阈值 (10kW)', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                    
                    <ReferenceLine x={data[currentIndex]?.time} yAxisId="energy" stroke="#6366f1" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'top', value: '当前', fill: '#6366f1', fontSize: 10, fontWeight: 'bold' }} />
                    <ReferenceLine y={0} yAxisId="price" stroke="#cbd5e1" strokeWidth={1} />

                    {/* Price Areas: Subdued by default, highlighted on hover */}
                    <Area 
                      yAxisId="price" 
                      name="购电电价" 
                      type="stepAfter" 
                      dataKey="purchasePriceActual" 
                      fill="#7DADFF" 
                      fillOpacity={hoveredSeries === "购电电价" ? 0.35 : 0.12} 
                      stroke="#60a5fa" 
                      strokeWidth={hoveredSeries === "购电电价" ? 3 : 1.5} 
                      strokeOpacity={hoveredSeries === "购电电价" ? 1 : (hoveredSeries ? 0.25 : 0.65)}
                      dot={false} 
                      hide={!visibleSeries["购电电价"]} 
                      onMouseEnter={() => setHoveredSeries("购电电价")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <Area 
                      yAxisId="price" 
                      name="购电预测" 
                      type="stepAfter" 
                      dataKey="purchasePriceForecast" 
                      fill="#7DADFF" 
                      fillOpacity={hoveredSeries === "购电电价" ? 0.25 : 0.08} 
                      stroke="#60a5fa" 
                      strokeWidth={hoveredSeries === "购电电价" ? 3 : 1.5} 
                      strokeDasharray="3 3" 
                      strokeOpacity={hoveredSeries === "购电电价" ? 1 : (hoveredSeries ? 0.25 : 0.6)}
                      dot={false} 
                      legendType="none" 
                      hide={!visibleSeries["购电电价"]} 
                      onMouseEnter={() => setHoveredSeries("购电电价")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    <Area 
                      yAxisId="price" 
                      name="上网电价" 
                      type="stepAfter" 
                      dataKey="sellPriceActual" 
                      fill="#FF908C" 
                      fillOpacity={hoveredSeries === "上网电价" ? 0.35 : 0.12} 
                      stroke="#f87171" 
                      strokeWidth={hoveredSeries === "上网电价" ? 3 : 1.5} 
                      strokeOpacity={hoveredSeries === "上网电价" ? 1 : (hoveredSeries ? 0.25 : 0.65)}
                      dot={false} 
                      hide={!visibleSeries["上网电价"]} 
                      onMouseEnter={() => setHoveredSeries("上网电价")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <Area 
                      yAxisId="price" 
                      name="上网预测" 
                      type="stepAfter" 
                      dataKey="sellPriceForecast" 
                      fill="#FF908C" 
                      fillOpacity={hoveredSeries === "上网电价" ? 0.25 : 0.08} 
                      stroke="#f87171" 
                      strokeWidth={hoveredSeries === "上网电价" ? 3 : 1.5} 
                      strokeDasharray="3 3" 
                      strokeOpacity={hoveredSeries === "上网电价" ? 1 : (hoveredSeries ? 0.25 : 0.6)}
                      dot={false} 
                      legendType="none" 
                      hide={!visibleSeries["上网电价"]} 
                      onMouseEnter={() => setHoveredSeries("上网电价")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />

                    {/* BESS Action Bar: Subdued by default, highlighted on hover */}
                    <Bar 
                      yAxisId="energy" 
                      name="储能排程" 
                      dataKey="bessAction" 
                      barSize={12} 
                      fill="#10b981" 
                      fillOpacity={hoveredSeries === "储能排程" ? 0.9 : (hoveredSeries ? 0.2 : 0.55)} 
                      radius={[4, 4, 0, 0]} 
                      hide={!visibleSeries["储能排程"]} 
                      onMouseEnter={() => setHoveredSeries("储能排程")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* Load Line: Subdued by default, highlighted on hover */}
                    <Line 
                      yAxisId="energy" 
                      name="实际负载" 
                      type="monotone" 
                      dataKey="loadActualLine" 
                      stroke={hoveredSeries === "负载" ? "#7c3aed" : "#A985FF"} 
                      strokeWidth={hoveredSeries === "负载" ? 3.5 : 2} 
                      strokeOpacity={hoveredSeries === "负载" ? 1 : (hoveredSeries ? 0.2 : 0.6)}
                      dot={false} 
                      legendType="none" 
                      hide={!visibleSeries["负载"]} 
                      onMouseEnter={() => setHoveredSeries("负载")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <Line 
                      yAxisId="energy" 
                      name="负载" 
                      type="monotone" 
                      dataKey="loadForecastLine" 
                      stroke={hoveredSeries === "负载" ? "#7c3aed" : "#A985FF"} 
                      strokeWidth={hoveredSeries === "负载" ? 3.2 : 1.8} 
                      strokeDasharray="4 4" 
                      strokeOpacity={hoveredSeries === "负载" ? 1 : (hoveredSeries ? 0.2 : 0.55)}
                      dot={false} 
                      hide={!visibleSeries["负载"]} 
                      onMouseEnter={() => setHoveredSeries("负载")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* PV Line: Subdued by default, highlighted on hover */}
                    <Line 
                      yAxisId="energy" 
                      name="实际光伏功率" 
                      type="monotone" 
                      dataKey="pvActualLine" 
                      stroke={hoveredSeries === "光伏功率" ? "#d97706" : "#F59E0B"} 
                      strokeWidth={hoveredSeries === "光伏功率" ? 3.5 : 2} 
                      strokeOpacity={hoveredSeries === "光伏功率" ? 1 : (hoveredSeries ? 0.2 : 0.65)}
                      dot={false} 
                      legendType="none" 
                      hide={!visibleSeries["光伏功率"]} 
                      onMouseEnter={() => setHoveredSeries("光伏功率")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <Line 
                      yAxisId="energy" 
                      name="光伏功率" 
                      type="monotone" 
                      dataKey="pvForecastLine" 
                      stroke={hoveredSeries === "光伏功率" ? "#d97706" : "#F59E0B"} 
                      strokeWidth={hoveredSeries === "光伏功率" ? 3.2 : 1.8} 
                      strokeDasharray="4 4" 
                      strokeOpacity={hoveredSeries === "光伏功率" ? 1 : (hoveredSeries ? 0.2 : 0.6)}
                      dot={false} 
                      hide={!visibleSeries["光伏功率"]} 
                      onMouseEnter={() => setHoveredSeries("光伏功率")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* Highlighted Baseline Grid */}
                    <Line 
                      yAxisId="energy" 
                      name="实际基准电网" 
                      type="monotone" 
                      dataKey="baselineActual" 
                      stroke="#1e293b" 
                      strokeWidth={hoveredSeries === "基准电网" ? 4 : 2.8} 
                      strokeOpacity={hoveredSeries === "基准电网" ? 1 : (hoveredSeries ? 0.35 : 1)}
                      dot={false} 
                      legendType="none" 
                      hide={!visibleSeries["基准电网"]} 
                      onMouseEnter={() => setHoveredSeries("基准电网")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <Line 
                      yAxisId="energy" 
                      name="基准电网" 
                      type="monotone" 
                      dataKey="baselineForecast" 
                      stroke="#334155" 
                      strokeWidth={hoveredSeries === "基准电网" ? 3.5 : 2.4} 
                      strokeDasharray="6 6" 
                      strokeOpacity={hoveredSeries === "基准电网" ? 1 : (hoveredSeries ? 0.35 : 0.95)}
                      dot={false} 
                      hide={!visibleSeries["基准电网"]} 
                      onMouseEnter={() => setHoveredSeries("基准电网")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* Highlighted Grid Power (Optimized Grid) */}
                    <Line 
                      yAxisId="energy" 
                      name="电网功率" 
                      type="monotone" 
                      dataKey="gridActual" 
                      stroke="#2563eb" 
                      strokeWidth={hoveredSeries === "电网功率" ? 4.5 : 3.5} 
                      strokeOpacity={hoveredSeries === "电网功率" ? 1 : (hoveredSeries ? 0.35 : 1)}
                      dot={false} 
                      hide={!visibleSeries["电网功率"]} 
                      onMouseEnter={() => setHoveredSeries("电网功率")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <Line 
                      yAxisId="energy" 
                      name="AI 预测优化" 
                      type="monotone" 
                      dataKey="gridForecast" 
                      stroke="#3b82f6" 
                      strokeWidth={hoveredSeries === "电网功率" ? 4 : 3} 
                      strokeDasharray="6 6" 
                      strokeOpacity={hoveredSeries === "电网功率" ? 1 : (hoveredSeries ? 0.35 : 0.95)}
                      dot={false} 
                      legendType="none" 
                      hide={!visibleSeries["电网功率"]} 
                      onMouseEnter={() => setHoveredSeries("电网功率")}
                      onMouseLeave={() => setHoveredSeries(null)}
                      style={{ cursor: 'pointer' }}
                    />

                    {/* Diagnostic Calibration Pins Draw Directly on Curves */}
                    {filteredCalibrationDots.map((pt) => (
                      <ReferenceDot
                        key={pt.id}
                        x={pt.x}
                        y={pt.y}
                        yAxisId={pt.yAxisId}
                        shape={(props: any) => {
                          const { cx, cy } = props;
                          if (!cx || !cy) return null;
                          const isHovered = hoveredCalibration === pt.id;
                          const dotStroke = 
                            pt.dotColor === 'bg-blue-500' ? '#3b82f6' : 
                            pt.dotColor === 'bg-rose-500' ? '#f43f5e' : 
                            pt.dotColor === 'bg-orange-500' ? '#f97316' : 
                            pt.dotColor === 'bg-purple-500' ? '#a855f7' : 
                            pt.dotColor === 'bg-emerald-500' ? '#10b981' : 
                            '#6366f1';
                          
                          return (
                            <g
                              onMouseEnter={() => {
                                setHoveredCalibration(pt.id);
                                setHighlightRange({ start: pt.start, end: pt.end });
                              }}
                              onMouseLeave={() => {
                                setHoveredCalibration(null);
                                setHighlightRange(null);
                              }}
                              className="cursor-pointer"
                            >
                              {/* Giant invisible hover capture zone (32px radius) to make interaction extremely easy */}
                              <circle
                                cx={cx}
                                cy={cy}
                                r={32}
                                fill="transparent"
                                style={{ pointerEvents: 'all' }}
                              />
                              
                              {/* Glowing outer aura */}
                              <circle
                                cx={cx}
                                cy={cy}
                                r={isHovered ? 18 : 10}
                                fill={dotStroke}
                                fillOpacity={isHovered ? 0.25 : 0.4}
                                className="transition-all duration-300"
                              />
                              
                              {/* Animated pulse ring - ONLY when hovered to prevent visual clutter and CPU lag */}
                              {isHovered && (
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={12}
                                  fill="none"
                                  stroke={dotStroke}
                                  strokeWidth={2}
                                  strokeOpacity={0.8}
                                  className="animate-ping"
                                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                                />
                              )}

                              {/* Target Point Dot */}
                              <circle
                                cx={cx}
                                cy={cy}
                                r={isHovered ? 8 : 5.5}
                                fill="#ffffff"
                                stroke={dotStroke}
                                strokeWidth={isHovered ? 3.5 : 2.5}
                                className="transition-all duration-300"
                              />
                              
                              {/* Label Banner directly above pinpoint on hover */}
                              {isHovered && (
                                <g 
                                  transform="translate(0, -16)"
                                  className="transition-all duration-300 pointer-events-none"
                                >
                                  <rect
                                    x={-40}
                                    y={-10}
                                    width={80}
                                    height={15}
                                    rx={4}
                                    fill="#1e293b"
                                    fillOpacity={0.85}
                                  />
                                  <text
                                    y={1.5}
                                    textAnchor="middle"
                                    fill="#ffffff"
                                    fontSize={7.5}
                                    fontWeight="bold"
                                    style={{ letterSpacing: '0.05em' }}
                                  >
                                    {pt.title}
                                  </text>
                                </g>
                              )}
                            </g>
                          );
                        }}
                      />
                    ))}
                    
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      onClick={handleLegendClick}
                      content={(props: any) => {
                        const { payload } = props;
                        const categories = [
                          {
                            title: "核心突出",
                            items: ["基准电网", "电网功率"],
                            isBold: true,
                            isCore: true
                          },
                          {
                            title: "辅助曲线(悬停高亮)",
                            items: ["光伏功率", "负载", "储能排程"],
                            isBold: false,
                            isCore: false
                          },
                          {
                            title: "电价指标",
                            items: ["购电电价", "上网电价"],
                            isBold: false,
                            isCore: false
                          }
                        ];

                        return (
                          <div className="flex flex-col gap-3 mb-5 px-1">
                            {/* Combination Buttons (Stackable & Default-selective) */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/90 border border-slate-200/60 p-2.5 rounded-xl">
                              <div className="flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">视图快捷组合</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleComboClick('basic')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                                    isBasicActive 
                                      ? 'bg-slate-800 text-white shadow-xs scale-[1.02]' 
                                      : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <Layers className="w-3 h-3 text-indigo-400" />
                                  <span>基础运行数据</span>
                                  {isBasicActive && <span className="w-1 h-1 rounded-full bg-indigo-400 ml-0.5 animate-pulse" />}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleComboClick('price')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                                    isPriceActive 
                                      ? 'bg-slate-800 text-white shadow-xs scale-[1.02]' 
                                      : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <TrendingDown className="w-3 h-3 text-rose-400" />
                                  <span>动态电价趋势</span>
                                  {isPriceActive && <span className="w-1 h-1 rounded-full bg-rose-400 ml-0.5 animate-pulse" />}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleComboClick('ai')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                                    isAiActiveSeries 
                                      ? 'bg-slate-800 text-white shadow-xs scale-[1.02]' 
                                      : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <BrainCircuit className="w-3 h-3 text-emerald-400" />
                                  <span>储能与电网优化</span>
                                  {isAiActiveSeries && <span className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />}
                                </button>
                              </div>
                            </div>

                            {/* Original Legend Indicators with Hover Highlighting */}
                            <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 pr-2">
                              {categories.map((cat, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cat.title}:</span>
                                  <div className="flex items-center gap-2.5">
                                    {cat.items.map(itemName => {
                                      const item = payload.find((p: any) => p.value === itemName);
                                      if (!item) return null;
                                      const isVisible = visibleSeries[itemName];
                                      const isHovered = hoveredSeries === itemName;
                                      return (
                                        <div 
                                          key={itemName} 
                                          className={`flex items-center gap-1.5 cursor-pointer transition-all px-1.5 py-0.5 rounded-md ${
                                            isHovered 
                                              ? 'bg-slate-100 ring-1 ring-slate-300 scale-105 font-bold' 
                                              : isVisible 
                                              ? 'opacity-100 hover:bg-slate-50' 
                                              : 'opacity-30 filter grayscale'
                                          }`}
                                          onClick={() => handleLegendClick({ value: itemName })}
                                          onMouseEnter={() => setHoveredSeries(itemName)}
                                          onMouseLeave={() => setHoveredSeries(null)}
                                          title={`点击显示/隐藏，悬停高亮 ${itemName}`}
                                        >
                                          <div 
                                            className={`rounded-full shadow-xs transition-all ${
                                              cat.isCore ? 'w-2.5 h-2.5 ring-1 ring-slate-400' : 'w-2 h-2'
                                            }`} 
                                            style={{ backgroundColor: item.color }} 
                                          />
                                          <span className={`text-[10px] ${cat.isCore || isHovered ? 'font-bold text-slate-800' : isVisible ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {itemName}
                                          </span>
                                          {isHovered && <span className="text-[8px] text-indigo-500 font-bold ml-0.5">高亮</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Layer B: AI Strategy Bar (Single Config Preview Timeline) */}
            <div className="relative border-t border-slate-100 pt-8 pb-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex flex-col gap-0.5">
                  <div className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> AI建议策略
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium font-sans">根据AI智能模型多维寻优，生成日内最优化充放运行控制轨迹</div>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#2ece8d]" />
                    <span>充电</span>
                  </div>
                  <div className="h-2 w-[1px] bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#ff6b81]" />
                    <span>放电</span>
                  </div>
                  <div className="h-2 w-[1px] bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#f1f2f6] border border-slate-300" />
                    <span>待机</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                <div className="min-w-[900px] relative flex items-stretch border border-slate-200 bg-slate-50 rounded-lg h-[40px] w-full overflow-hidden shadow-sm">
                  {(() => {
                    const hourlyData = data.filter((_, i) => i % 4 === 0);
                    const rawSegments: { 
                      startTime: string; 
                      endTime: string; 
                      status: 'charge' | 'discharge' | 'standby'; 
                      length: number;
                      powerKw: number;
                    }[] = [];

                    for (let i = 0; i < 24; i++) {
                      const d = hourlyData[i];
                      const nextD = hourlyData[i + 1] || d;
                      
                      const kw = d.bessAction;
                      let status: 'charge' | 'discharge' | 'standby' = 'standby';

                      if (kw < -1) {
                        status = 'charge';
                      } else if (kw > 1) {
                        status = 'discharge';
                      } else {
                        status = 'standby';
                      }

                      const startTime = d.time;
                      const endTime = nextD.time;

                      if (
                        rawSegments.length > 0 &&
                        rawSegments[rawSegments.length - 1].status === status
                      ) {
                        rawSegments[rawSegments.length - 1].endTime = endTime;
                        rawSegments[rawSegments.length - 1].length += 1;
                        if (Math.abs(kw) > Math.abs(rawSegments[rawSegments.length - 1].powerKw)) {
                          rawSegments[rawSegments.length - 1].powerKw = kw;
                        }
                      } else {
                        rawSegments.push({
                          startTime,
                          endTime,
                          status,
                          length: 1,
                          powerKw: kw
                        });
                      }
                    }

                    return rawSegments.map((seg, idx) => {
                      const isHovered = highlightRange?.start === seg.startTime && highlightRange?.end === seg.endTime;
                      
                      let blockBg = "";
                      let textColor = "";
                      let label = "";

                      if (seg.status === 'charge') {
                        blockBg = "bg-[#2ece8d] hover:bg-[#28be81]";
                        textColor = "text-white";
                        label = `充电 (${Math.abs(seg.powerKw).toFixed(0)}kW)`;
                      } else if (seg.status === 'discharge') {
                        blockBg = "bg-[#ff6b81] hover:bg-[#ef5a70]";
                        textColor = "text-white";
                        label = `放电 (${Math.abs(seg.powerKw).toFixed(0)}kW)`;
                      } else {
                        blockBg = "bg-[#f1f2f6] hover:bg-[#e4e5eb]";
                        textColor = "text-[#2f3542]";
                        label = "待机";
                      }

                      return (
                        <div 
                          key={idx}
                          style={{ flex: seg.length }}
                          onMouseEnter={() => {
                            setHighlightRange({ start: seg.startTime, end: seg.endTime });
                          }}
                          onMouseLeave={() => setHighlightRange(null)}
                          className={`relative h-full flex items-center justify-center border-r border-white/20 last:border-0 transition-all duration-300 select-none cursor-pointer ${blockBg} ${textColor} ${
                            isHovered ? 'brightness-95 contrast-105 z-10 scale-[0.99] shadow-inner' : ''
                          }`}
                        >
                          <span className="w-full text-center px-2 font-bold text-[12px] truncate whitespace-nowrap overflow-hidden text-ellipsis selection:bg-transparent">
                            {label}
                          </span>

                          {/* Dynamic Segment Time Hover tooltip */}
                          {isHovered && (
                            <div className="absolute top-[-44px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-sans font-bold px-2.5 py-1.5 rounded-md shadow-lg pointer-events-none z-50 whitespace-nowrap border border-slate-700 animate-fade-in">
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-400">{seg.startTime} - {seg.endTime}</span>
                                <span className="text-slate-300 font-normal">|</span>
                                <span className="text-emerald-300 font-mono">
                                  {seg.status === 'charge' ? '智能充电' : seg.status === 'discharge' ? '优化放电' : '智能待机'}: {Math.abs(seg.powerKw).toFixed(0)}kW
                                </span>
                              </div>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-700"></div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="flex justify-between px-2 mt-2 text-[10px] text-slate-400 font-sans font-bold select-none leading-none">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: AI Strategy Details Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-w-0 relative">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">AI 建议策略明细</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Workflow className="w-3 h-3" /> 导出详情报告
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto relative">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">执行时间</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">策略类型</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">建议动作</th>
                  <th className="px-8 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-12">触发原因/描述</th>
                </tr>
              </thead>
              <tbody>
                {strategyEvents.map((row, i) => {
                  const rowSpan = getRowSpan(i);
                  return (
                    <tr 
                      key={i} 
                      className="border-b border-slate-50 hover:bg-indigo-50/10 transition-colors group cursor-pointer"
                      onMouseEnter={() => setHighlightRange({ start: row.startTime, end: row.endTime })}
                      onMouseLeave={() => setHighlightRange(null)}
                    >
                      {rowSpan > 0 && (
                        <td 
                          rowSpan={rowSpan} 
                          className="px-6 py-4 text-xs font-bold text-slate-700 font-mono tracking-tight border-r border-slate-100 pl-8 bg-slate-50/30 text-center align-middle"
                        >
                          {row.startTime} - {row.endTime}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-all bg-${row.color === 'indigo' ? 'indigo' : row.color === 'rose' ? 'rose' : row.color === 'slate' ? 'slate' : row.color === 'emerald' ? 'emerald' : 'amber'}-50 text-${row.color === 'indigo' ? 'indigo' : row.color === 'rose' ? 'rose' : row.color === 'slate' ? 'slate' : row.color === 'emerald' ? 'emerald' : 'amber'}-600 border border-${row.color === 'indigo' ? 'indigo' : row.color === 'rose' ? 'rose' : row.color === 'slate' ? 'slate' : row.color === 'emerald' ? 'emerald' : 'amber'}-100 shadow-xs shadow-${row.color}-50`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Zap className={`w-3.5 h-3.5 text-${row.action.includes('充电') ? 'emerald' : row.action.includes('放电') ? 'rose' : 'slate'}-500`} />
                          <span className="text-xs font-bold text-slate-800">{row.action}</span>
                        </div>
                      </td>
                      <td className="px-8 py-3 text-[11px] text-slate-500 leading-relaxed font-medium pr-12 max-w-md">{row.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DetailModal 
        isOpen={activeModal !== null && ['pv', 'load', 'price'].includes(activeModal)} 
        onClose={() => setActiveModal(null)} 
        data={data}
        initialType={activeModal as any}
      />
    </div>
  );
};

export default AlgorithmMonitoringPage;

import React, { useState, useMemo, useEffect } from "react";
import { 
  BarChart3, 
  Sun, 
  TrendingDown, 
  Zap, 
  Clock, 
  Lock, 
  Info, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  CloudSun, 
  Thermometer,
  ChevronRight,
  Sparkles,
  Workflow,
  BrainCircuit,
  CheckCircle2,
  Layers
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
const generate24hData = () => {
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
    const purchasePrice = Math.round((basePurchasePrice + (Math.random() - 0.5) * 0.08) * 100) / 100;

    // Sell Price Analysis (Negative during peak PV)
    // PV Intensity factor: peaks at 1.0 around 13:00 (h=13)
    const pvIntensity = h >= 6 && h <= 18 ? Math.sin(((h - 6) / 12) * Math.PI) : 0;
    // Base sell price is around 0.45, but drops by up to 0.8 during midday gluts
    const sellPrice = Math.round((0.45 - (pvIntensity * 0.8) + (Math.random() - 0.5) * 0.05) * 100) / 100;

    // Load Curve Simulation
    let baseLoad = 400 + Math.random() * 50;
    if (isPeak) baseLoad += 650 + Math.random() * 150;
    else if (!isValley) baseLoad += 350 + Math.random() * 80;
    
    if (h === 3) baseLoad += 950; 
    const loadCurve = Math.round(baseLoad * 100) / 100;
    const loadActual = Math.round(Math.max(0, loadCurve * (0.97 + Math.random() * 0.06)) * 100) / 100;

    // PV Generation
    let pv = 0;
    if (h >= 6 && h <= 18) {
      pv = Math.sin(((h - 6) / 12) * Math.PI) * 1350 + (Math.random() - 0.5) * 80;
      if (h === 10 || h === 11) pv += 500;
      pv = Math.max(0, pv);
    }
    const pvForecast = Math.round(pv * 100) / 100;
    const pvActual = Math.round(Math.max(0, pvForecast * (0.92 + Math.random() * 0.15)) * 100) / 100;

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

const ForecastCard = ({ title, icon, value, unit, subValue, data, color, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -4, shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
    onClick={onClick}
    className="bg-white rounded-2xl p-5 border border-slate-100 cursor-pointer transition-all group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 pointer-events-none bg-indigo-500`} />
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-xl bg-slate-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors`}>
        {icon}
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
        <Sparkles className="w-3 h-3" />
        高置信度
      </div>
    </div>
    
    <div className="mb-4">
      <p className="text-xs text-slate-500 font-medium">{title}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <span className="text-xs text-slate-400 font-medium">{unit}</span>
      </div>
      <p className={`text-[10px] font-bold mt-1 text-slate-600`}>{subValue}</p>
    </div>

    {/* Sparkline simulation */}
    <div className="h-12 w-full opacity-60">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data.filter((_: any, i: number) => i % 4 === 0)}>
          <Area type="monotone" dataKey="val" stroke="none" fill={color === 'amber' ? '#FAD000' : color === 'purple' ? '#A985FF' : color === 'blue' ? '#2468f2' : '#10b981'} fillOpacity={0.2} />
          <Line type="monotone" dataKey="val" stroke={color === 'amber' ? '#FAD000' : color === 'purple' ? '#A985FF' : color === 'blue' ? '#2468f2' : '#10b981'} strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    
    <div className="absolute bottom-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
      <ChevronRight className="w-4 h-4" />
    </div>
  </motion.div>
);

const DetailModal = ({ isOpen, onClose, data, initialType, isAiActive }: { isOpen: boolean, onClose: () => void, data: any[], initialType: 'pv' | 'load' | 'price' | null, isAiActive: boolean }) => {
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

const StrategyUpgradeModal = ({ isOpen, onClose }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-x-4 top-[20%] md:w-[500px] md:left-1/2 md:-ml-[250px] z-[111] bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">升级开通 AI 智能调度策略</h2>
            <p className="text-slate-500 text-[13px] leading-relaxed mb-6">开启能源自动化的未来，通过多目标智能寻优算法实现电站运营闭环。</p>
            
            <div className="space-y-4 mb-8">
              {[
                { title: "全天候峰谷价差自动套利", sub: "基于实时现货电价动态优化策略" },
                { title: "精细化需量控制", sub: "有效规避超额罚款，降低需量费支出" },
                { title: "降低综合用电成本达 15%+", sub: "大数据模型驱动，持续进化优化闭环" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">下次再说</button>
              <button className="flex-[2] py-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">申请免费试用</button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

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

const AlgorithmMonitoringPage: React.FC = () => {
  const [isAiActive, setIsAiActive] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [highlightRange, setHighlightRange] = useState<{ start: string; end: string } | null>(null);
  const [hoveredCalibration, setHoveredCalibration] = useState<number | null>(null);
  const [hoveredCoords, setHoveredCoords] = useState<{ x: number; y: number } | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    "购电电价": false,
    "上网电价": false,
    "储能排程": false,
    "负载": true,
    "光伏功率": true,
    "基准电网": true,
    "电网功率": false
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

  const data = useMemo(() => generate24hData(), []);

  const { pvTotal, loadTotal, currentIndex, priceRange } = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const idx = Math.min(Math.floor(currentHour * 4), 96);

    const pv = data.reduce((acc, curr) => acc + curr.pvForecast, 0) / 4;
    const load = data.reduce((acc, curr) => acc + curr.loadCurve, 0) / 4;

    const purchasePrices = data.map(d => d.purchasePrice);
    const sellPrices = data.map(d => d.sellPrice);

    return {
      pvTotal: pv.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      loadTotal: load.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      currentIndex: idx,
      priceRange: {
        purchaseMin: Math.min(...purchasePrices).toFixed(2),
        purchaseMax: Math.max(...purchasePrices).toFixed(2),
        sellMin: Math.min(...sellPrices).toFixed(2),
        sellMax: Math.max(...sellPrices).toFixed(2),
        sellAvg: (sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length).toFixed(2)
      }
    };
  }, [data]);

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
    
    // Use raw properties (unoptimizedGrid, purchasePrice, sellPrice) so points stay anchored
    // even as the daily timeline slides forward.
    const uniqueAnchors = [
      { id: 1, time: "02:00", field: "purchasePrice", yAxisId: "price" },
      { id: 2, time: "03:30", field: "unoptimizedGrid", yAxisId: "energy" },
      { id: 3, time: "10:30", field: "unoptimizedGrid", yAxisId: "energy" },
      { id: 4, time: "12:30", field: "sellPrice", yAxisId: "price" },
      { id: 5, time: "19:00", field: "purchasePrice", yAxisId: "price" }
    ];

    return uniqueAnchors.map(anchor => {
      const dataItem = processedData.find((d: any) => d.time === anchor.time) || processedData[0];
      const value = dataItem ? (dataItem[anchor.field] ?? 0) : 0;
      const base = CALIBRATION_POINTS.find(p => p.id === anchor.id)!;
      return {
        ...base,
        anchorTime: anchor.time,
        x: anchor.time,
        y: value,
        yAxisId: anchor.yAxisId
      };
    });
  }, [processedData]);

  // Aligned strategy details generation to correspond with the 3-tier logic
  const strategyEvents = useMemo(() => {
    const events: any[] = [];
    let currentEvent: any = null;

    data.forEach((d, i) => {
      // Find the most significant strategy for this interval
      // Priority: Demand (Safety) > Consumption (PV) > Arbitrage (Economic)
      let type = "平段待机";
      let action = "待机";
      let color = "slate";
      let reason = "系统处于经济运行模式，无风险触发。";

      if (d.atomicStrategies.demand === 1) {
        type = "需量控制";
        action = `放电 (${(d.bessAction).toFixed(2)}kW)`;
        color = "rose";
        reason = "负荷预测超容风险触发，执行高功率放电。";
      } else if (d.atomicStrategies.demand === -1) {
        type = "动态增容";
        action = "预设增容";
        color = "rose";
        reason = "预测到未来负载波动风险，提前释放增容余量。";
      } else if (d.atomicStrategies.consumption === 1) {
        type = "全额消纳";
        action = `充电 (${Math.abs(d.bessAction).toFixed(2)}kW)`;
        color = "emerald";
        reason = "光伏功率高企且触发逆流风险，强制消纳充电。";
      } else if (d.atomicStrategies.consumption === -1) {
        type = "余电上网";
        action = "馈电网"; // Feed-in
        color = "amber";
        reason = "本地负荷及储能策略已饱和，多余光伏电力上网。";
      } else if (d.atomicStrategies.arbitrage === 1) {
        type = "峰谷套利(充)";
        action = `充电 (${Math.abs(d.bessAction).toFixed(2)}kW)`;
        color = "indigo";
        reason = "当前处于电价谷段，算法建议满额充电储备。";
      } else if (d.atomicStrategies.arbitrage === -1) {
        type = "峰谷套利(放)";
        action = `放电 (${Math.abs(d.bessAction).toFixed(2)}kW)`;
        color = "indigo";
        reason = "当前处于电位峰段，算法建议高位放电获利。";
      }

      if (!currentEvent || currentEvent.type !== type) {
        if (currentEvent) {
          currentEvent.endTime = d.time;
          events.push(currentEvent);
        }
        currentEvent = { startTime: d.time, type, action, reason, color };
      }
    });

    if (currentEvent) {
      currentEvent.endTime = "24:00";
      events.push(currentEvent);
    }

    // Return the timeline of events
    return events.filter(e => e.type !== "平段待机");
  }, [data]);

  return (
    <div className="min-h-full bg-[#f8fafc] font-sans p-6 space-y-6">
      {/* State Switcher & Header */}
      <div className="flex items-center justify-between pr-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">算法预测监控</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">AI Global Strategy Optimization</p>
          </div>
        </div>

        <button 
          onClick={() => setShowUpgrade(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold rounded-xl transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>申请开通AI服务</span>
        </button>
      </div>

      <div className="max-w-[1700px] mx-auto space-y-6">
        {/* Top Section: Input Source Metrics Cards in a Grid */}
        <div className="space-y-4">
          <div className="px-1 flex items-center justify-between text-slate-800">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              数据输入源 (Forecasting Matrix)
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter">Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ForecastCard 
              title="光伏发电预测" 
              icon={<Sun className="w-5 h-5" />} 
              value={pvTotal} 
              unit="kWh" 
              subValue="预计增长 +12%" 
              color="amber" 
              data={data.map(d => ({ val: d.pvForecast }))}
              onClick={() => setActiveModal('pv')}
            />
            <ForecastCard 
              title="负荷消耗预测" 
              icon={<BarChart3 className="w-5 h-5" />} 
              value={loadTotal} 
              unit="kWh" 
              subValue="峰值功率: 1,350kW" 
              color="purple" 
              data={data.map(d => ({ val: d.loadCurve }))}
              onClick={() => setActiveModal('load')}
            />
            <ForecastCard 
              title="动态电价预测" 
              icon={<TrendingDown className="w-5 h-5" />} 
              value={`${priceRange.purchaseMin}-${priceRange.purchaseMax}`} 
              unit="元/kWh" 
              subValue={`购电: ${priceRange.purchaseMin}-${priceRange.purchaseMax} | 上网: ${priceRange.sellMin}-${priceRange.sellMax}`} 
              color="blue" 
              data={data.map(d => ({ val: d.purchasePrice }))}
              onClick={() => setActiveModal('price')}
            />
          </div>
        </div>

        {/* Main Charts Visualizer */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 pb-4 space-y-8">
            {/* Layer C: Optimized Power Curves */}
            <div className="relative pt-4 group/layer">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <Workflow className="w-3.5 h-3.5" /> 算法运行监控 (Running Status)
                </div>
              </div>

              {/* Dynamic Overlay Tooltip for Calibration Pins on Hover directly on the curves */}
              <AnimatePresence>
                {hoveredCalibration !== null && hoveredCoords && (
                  (() => {
                    const pt = CALIBRATION_POINTS.find(p => p.id === hoveredCalibration);
                    if (!pt) return null;
                    
                    const isLeft = hoveredCoords.x < 450;
                    const isHigh = hoveredCoords.y < 255;

                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: isHigh ? -10 : 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: isHigh ? -10 : 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bg-slate-800 border border-slate-700/80 text-white rounded-2xl p-4 shadow-[0_20px_50px_rgba(15,23,42,0.4)] z-50 pointer-events-none text-left w-[360px]"
                        style={{
                          left: hoveredCoords.x,
                          top: hoveredCoords.y,
                          transform: `translate(${isLeft ? '20px' : '-380px'}, ${isHigh ? '20px' : '-260px'})`
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-700/60">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${pt.badgeColor}`}>
                            {pt.title}
                          </span>
                          <span className="text-[10px] text-indigo-300 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-300" /> {pt.timeRange}
                          </span>
                        </div>
                        
                        <div className="space-y-3 font-sans">
                          <div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">工况特征 / 触发风险</div>
                            <p className="text-[11.5px] text-slate-200 font-medium leading-relaxed">{pt.condition}</p>
                          </div>
                          
                          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <div className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-indigo-300 animate-pulse" /> AI 建议解决预案
                            </div>
                            <p className="text-[11px] text-indigo-100 font-medium leading-relaxed mt-0.5">{pt.aiOptimizedText}</p>
                          </div>
                          
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">优化赋能价值</div>
                            <p className="text-[11px] text-emerald-200 font-semibold leading-normal mt-0.5">{pt.impact}</p>
                          </div>
                        </div>

                        {/* Arrow pointing back to coordinating pin */}
                        <div 
                          className="absolute w-3 h-3 bg-slate-800 rotate-45 border-slate-700"
                          style={{
                            left: isLeft ? '-6px' : 'auto',
                            right: isLeft ? 'auto' : '-6px',
                            top: isHigh ? '30px' : '205px',
                            borderRightWidth: isLeft ? 0 : '1px',
                            borderBottomWidth: isLeft ? 0 : '1px',
                            borderLeftWidth: isLeft ? '1px' : 0,
                            borderTopWidth: isLeft ? '1px' : 0
                          }}
                        />
                      </motion.div>
                    );
                  })()
                )}
              </AnimatePresence>

              <div className={`h-[420px] w-full transition-all duration-700 ${!isAiActive ? 'blur-[4px]' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={processedData}>
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
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                      itemStyle={{fontSize: '11px', fontWeight: 'bold'}}
                      formatter={(value: any, name: any) => [
                        typeof value === 'number' ? value.toFixed(2) : value,
                        name
                      ]}
                    />
                    
                    <ReferenceArea x1="00:00" x2="06:00" fill="#f0fdf4" fillOpacity={0.4} />
                    <ReferenceArea x1="08:00" x2="12:00" fill="#fef2f2" fillOpacity={0.4} />
                    <ReferenceArea x1="17:00" x2="21:00" fill="#fef2f2" fillOpacity={0.4} />
                    <ReferenceArea x1="21:00" x2="23:45" fill="#f0fdf4" fillOpacity={0.4} />
                    
                    {highlightRange && (
                      <ReferenceArea 
                        x1={highlightRange.start} 
                        x2={highlightRange.end} 
                        fill="#6366f1" 
                        fillOpacity={0.15} 
                        stroke="#6366f1" 
                        strokeWidth={1} 
                        strokeDasharray="4 4"
                      />
                    )}
                    
                    <ReferenceLine y={1200} yAxisId="energy" stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'right', value: '超容阈值 (1200kW)', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
                    <ReferenceLine y={10} yAxisId="energy" stroke="#f59e0b" strokeDasharray="4 4" label={{ position: 'right', value: '逆流阈值 (10kW)', fill: '#f59e0b', fontSize: 9, fontWeight: 'bold' }} />
                    
                    <ReferenceLine x={data[currentIndex]?.time} yAxisId="energy" stroke="#6366f1" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'top', value: '当前', fill: '#6366f1', fontSize: 10, fontWeight: 'bold' }} />
                    <ReferenceLine y={0} yAxisId="price" stroke="#cbd5e1" strokeWidth={1} />

                    <Area yAxisId="price" name="购电电价" type="stepAfter" dataKey="purchasePriceActual" fill="#7DADFF" fillOpacity={0.1} stroke="#7DADFF" strokeWidth={1} dot={false} hide={!visibleSeries["购电电价"]} />
                    <Area yAxisId="price" name="购电预测" type="stepAfter" dataKey="purchasePriceForecast" fill="#7DADFF" fillOpacity={0.05} stroke="#7DADFF" strokeWidth={1} strokeDasharray="3 3" dot={false} legendType="none" hide={!visibleSeries["购电电价"]} />
                    
                    <Area yAxisId="price" name="上网电价" type="stepAfter" dataKey="sellPriceActual" fill="#FF908C" fillOpacity={0.1} stroke="#FF908C" strokeWidth={1} dot={false} hide={!visibleSeries["上网电价"]} />
                    <Area yAxisId="price" name="上网预测" type="stepAfter" dataKey="sellPriceForecast" fill="#FF908C" fillOpacity={0.05} stroke="#FF908C" strokeWidth={1} strokeDasharray="3 3" dot={false} legendType="none" hide={!visibleSeries["上网电价"]} />

                    <Bar yAxisId="energy" name="储能排程" dataKey="bessAction" barSize={12} fill="#A5E693" fillOpacity={0.4} radius={[4, 4, 0, 0]} hide={!visibleSeries["储能排程"]} />
                    
                    <Line yAxisId="energy" name="实际负载" type="monotone" dataKey="loadActualLine" stroke="#A985FF" strokeWidth={1.5} dot={false} legendType="none" hide={!visibleSeries["负载"]} />
                    <Line yAxisId="energy" name="负载" type="monotone" dataKey="loadForecastLine" stroke="#A985FF" strokeWidth={1.5} strokeDasharray="4 4" dot={false} hide={!visibleSeries["负载"]} />
                    
                    <Line yAxisId="energy" name="实际光伏功率" type="monotone" dataKey="pvActualLine" stroke="#FAD000" strokeWidth={2} dot={false} legendType="none" hide={!visibleSeries["光伏功率"]} />
                    <Line yAxisId="energy" name="光伏功率" type="monotone" dataKey="pvForecastLine" stroke="#FAD000" strokeWidth={1.5} strokeDasharray="4 4" dot={false} hide={!visibleSeries["光伏功率"]} />
                    
                    <Line yAxisId="energy" name="实际基准电网" type="monotone" dataKey="baselineActual" stroke="#94a3b8" strokeWidth={1} dot={false} legendType="none" hide={!visibleSeries["基准电网"]} />
                    <Line yAxisId="energy" name="基准电网" type="monotone" dataKey="baselineForecast" stroke="#94a3b8" strokeWidth={1} strokeDasharray="6 6" dot={false} hide={!visibleSeries["基准电网"]} />
                    
                    {isAiActive && (
                      <>
                        <Line yAxisId="energy" name="电网功率" type="monotone" dataKey="gridActual" stroke="#2468f2" strokeWidth={3} dot={false} hide={!visibleSeries["电网功率"]} />
                        <Line yAxisId="energy" name="AI 预测优化" type="monotone" dataKey="gridForecast" stroke="#2468f2" strokeWidth={2} strokeDasharray="6 6" dot={false} legendType="none" hide={!visibleSeries["电网功率"]} />
                      </>
                    )}

                    {/* Diagnostic Calibration Pins Draw Directly on Curves */}
                    {isAiActive && calibrationDots.map((pt) => (
                      <ReferenceDot
                        key={pt.id}
                        x={pt.x}
                        y={pt.y}
                        yAxisId={pt.yAxisId}
                        shape={(props: any) => {
                          const { cx, cy } = props;
                          if (!cx || !cy) return null;
                          const isHovered = hoveredCalibration === pt.id;
                          const dotStroke = pt.dotColor === 'bg-indigo-500' ? '#6366f1' : pt.dotColor === 'bg-rose-500' ? '#f43f5e' : pt.dotColor === 'bg-amber-500' ? '#f59e0b' : pt.dotColor === 'bg-orange-500' ? '#f97316' : '#10b981';
                          
                          return (
                            <g
                              onMouseEnter={() => {
                                setHoveredCalibration(pt.id);
                                setHighlightRange({ start: pt.start, end: pt.end });
                                setHoveredCoords({ x: cx, y: cy });
                              }}
                              onMouseLeave={() => {
                                setHoveredCalibration(null);
                                setHighlightRange(null);
                                setHoveredCoords(null);
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
                                r={isHovered ? 14 : 7}
                                fill={dotStroke}
                                fillOpacity={0.2}
                                className="transition-all duration-300"
                              />
                              
                              {/* Animated pulse ring */}
                              <circle
                                cx={cx}
                                cy={cy}
                                r={isHovered ? 10 : 6}
                                fill="none"
                                stroke={dotStroke}
                                strokeWidth={isHovered ? 2 : 1}
                                strokeOpacity={0.8}
                                className="animate-ping"
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                              />

                              {/* Target Point Dot */}
                              <circle
                                cx={cx}
                                cy={cy}
                                r={5}
                                fill="#ffffff"
                                stroke={dotStroke}
                                strokeWidth={2.5}
                                className="transition-all duration-300"
                              />
                              
                              {/* Label Banner directly above pinpoint */}
                              <g 
                                transform={`translate(0, ${isHovered ? -16 : -13})`}
                                className="transition-all duration-300 pointer-events-none"
                              >
                                <rect
                                  x={-35}
                                  y={-10}
                                  width={70}
                                  height={15}
                                  rx={4}
                                  fill="#1e293b"
                                  fillOpacity={0.85}
                                />
                                <text
                                  y={1}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize={7.5}
                                  fontWeight="bold"
                                  style={{ letterSpacing: '0.05em' }}
                                >
                                  {pt.title}
                                </text>
                              </g>
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
                            title: "关键指标",
                            items: ["电网功率", "基准电网", "储能排程"],
                            isBold: true
                          },
                          {
                            title: "辅助指标",
                            items: ["光伏功率", "负载"],
                            isBold: false
                          },
                          {
                            title: "电价指标",
                            items: ["购电电价", "上网电价"],
                            isBold: false
                          }
                        ];

                        return (
                          <div className="flex flex-col gap-4 mb-6 px-1">
                            {/* Combination Buttons (Stackable & Default-selective) */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-100/50 p-2.5 rounded-2xl">
                              <div className="flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">视图快捷组合 (View Presets)</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleComboClick('basic')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                                    isBasicActive 
                                      ? 'bg-slate-800 text-white shadow-slate-100 scale-[1.02] font-heavy' 
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
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                                    isPriceActive 
                                      ? 'bg-slate-800 text-white shadow-slate-100 scale-[1.02] font-heavy' 
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
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                                    isAiActiveSeries 
                                      ? 'bg-slate-800 text-white shadow-slate-100 scale-[1.02] font-heavy' 
                                      : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <BrainCircuit className="w-3 h-3 text-emerald-400" />
                                  <span>AI策略效果</span>
                                  {isAiActiveSeries && <span className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />}
                                </button>
                              </div>
                            </div>

                            {/* Original Legend Indicators */}
                            <div className="flex flex-wrap justify-end gap-x-8 gap-y-3 pr-3">
                              {categories.map((cat, idx) => (
                                <div key={idx} className="flex items-center gap-2.5">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cat.title}:</span>
                                  <div className="flex items-center gap-3">
                                    {cat.items.map(itemName => {
                                      const item = payload.find((p: any) => p.value === itemName);
                                      if (!item) return null;
                                      const isVisible = visibleSeries[itemName];
                                      return (
                                        <div 
                                          key={itemName} 
                                          className={`flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 ${isVisible ? 'opacity-100' : 'opacity-30 filter grayscale'}`}
                                          onClick={() => handleLegendClick({ value: itemName })}
                                        >
                                          <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                                          <span className={`text-[10px] ${cat.isBold ? 'font-bold' : 'font-medium'} ${isVisible ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {itemName}
                                          </span>
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
                    <span>充电 (Charging)</span>
                  </div>
                  <div className="h-2 w-[1px] bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#ff6b81]" />
                    <span>放电 (Discharging)</span>
                  </div>
                  <div className="h-2 w-[1px] bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#f1f2f6] border border-slate-300" />
                    <span>待机 (Standby)</span>
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
                          } ${!isAiActive ? 'blur-[4px] opacity-50 select-none pointer-events-none' : ''}`}
                        >
                          <span className="w-full text-center px-2 font-bold text-[12px] truncate whitespace-nowrap overflow-hidden text-ellipsis selection:bg-transparent">
                            {label}
                          </span>

                          {/* Dynamic Segment Time Hover tooltip */}
                          {isHovered && isAiActive && (
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
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-w-0 relative">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">AI 建议策略明细</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Detailed Execution Plan & Reasoning</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Workflow className="w-3.5 h-3.5" /> 导出详情报告
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto relative">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-12">执行时间</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">策略类型</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">建议动作</th>
                  <th className="px-12 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest pr-16">触发原因/描述</th>
                </tr>
              </thead>
              <tbody className={`transition-all duration-1000 ${!isAiActive ? 'blur-[16px] opacity-30 select-none' : ''}`}>
                {strategyEvents.map((row, i) => (
                  <tr 
                    key={i} 
                    className="border-b border-slate-50 hover:bg-indigo-50/10 transition-colors group cursor-pointer"
                    onMouseEnter={() => setHighlightRange({ start: row.startTime, end: row.endTime })}
                    onMouseLeave={() => setHighlightRange(null)}
                  >
                    <td className="px-10 py-6 text-sm font-bold text-slate-700 font-mono tracking-tight border-l-4 border-transparent group-hover:border-indigo-500 pl-12">{row.startTime} - {row.endTime}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full transition-all bg-${row.color === 'indigo' ? 'indigo' : row.color === 'rose' ? 'rose' : row.color === 'slate' ? 'slate' : row.color === 'emerald' ? 'emerald' : 'amber'}-50 text-${row.color === 'indigo' ? 'indigo' : row.color === 'rose' ? 'rose' : row.color === 'slate' ? 'slate' : row.color === 'emerald' ? 'emerald' : 'amber'}-600 border border-${row.color === 'indigo' ? 'indigo' : row.color === 'rose' ? 'rose' : row.color === 'slate' ? 'slate' : row.color === 'emerald' ? 'emerald' : 'amber'}-100 shadow-sm shadow-${row.color}-100`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Zap className={`w-3.5 h-3.5 text-${row.action.includes('充电') ? 'emerald' : row.action.includes('放电') ? 'rose' : 'slate'}-500`} />
                        <span className="text-sm font-bold text-slate-800">{row.action}</span>
                      </div>
                    </td>
                    <td className="px-12 py-6 text-[12px] text-slate-500 leading-relaxed font-medium pr-16 max-w-md">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!isAiActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md z-20">
                 <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-indigo-100 flex flex-col items-center text-center max-w-md scale-110">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200 mb-6">
                      <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">开通 AI 策略解锁明细</h3>
                    <p className="text-xs text-slate-500 mb-8 font-bold leading-loose px-4">升级后可实时查看由盈立方 AI Engine 生成的24小时最优调度方案，精准掌握每笔收益的决策逻辑与手动干扰建议。</p>
                    <button onClick={() => setShowUpgrade(true)} className="w-full py-4 bg-indigo-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest">立即申请企业版试用</button>
                    <p className="mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Strategy Optimization Service</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DetailModal 
        isOpen={activeModal !== null && ['pv', 'load', 'price'].includes(activeModal)} 
        onClose={() => setActiveModal(null)} 
        data={data}
        initialType={activeModal as any}
        isAiActive={isAiActive}
      />

      <StrategyUpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
      />
    </div>
  );
};

export default AlgorithmMonitoringPage;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Calendar, Sun, Moon, CloudSun, CloudRain, Eye, EyeOff, BrainCircuit, Clock } from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea,
} from 'recharts';

interface AlgorithmPredictionPageProps {
  onNavigate?: (page: string) => void;
}

const chartData = [
  { time: '00:00', load: 400, pv: 0, bess: -300, grid: 700, price: 0.3, weather: { type: 'moon', temp: '18°C', desc: '晴朗' } },
  { time: '01:00', load: 420, pv: 0, bess: -300, grid: 720, price: 0.3, weather: { type: 'moon', temp: '18°C', desc: '晴朗' } },
  { time: '02:00', load: 450, pv: 0, bess: -300, grid: 750, price: 0.3, weather: { type: 'moon', temp: '17°C', desc: '晴朗' } },
  { time: '03:00', load: 480, pv: 0, bess: -300, grid: 780, price: 0.3, weather: { type: 'moon', temp: '17°C', desc: '晴朗' } },
  { time: '04:00', load: 500, pv: 0, bess: -300, grid: 800, price: 0.3, weather: { type: 'moon', temp: '16°C', desc: '晴朗' } },
  { time: '05:00', load: 500, pv: 0, bess: -300, grid: 800, price: 0.3, weather: { type: 'moon', temp: '16°C', desc: '晴朗' } },
  { time: '06:00', load: 450, pv: 50, bess: 0, grid: 400, price: 0.6, weather: { type: 'cloud-sun', temp: '18°C', desc: '多云' } },
  { time: '07:00', load: 600, pv: 200, bess: 0, grid: 400, price: 0.6, weather: { type: 'cloud-sun', temp: '20°C', desc: '多云' } },
  { time: '08:00', load: 800, pv: 400, bess: 300, grid: 100, price: 1.2, weather: { type: 'sun', temp: '22°C', desc: '晴朗' } },
  { time: '09:00', load: 1950, pv: 500, bess: 300, grid: 1150, price: 1.2, weather: { type: 'sun', temp: '25°C', desc: '晴朗' }, annotation: { title: '存在超需风险', value: '超限预测 250kW', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' } },
  { time: '10:00', load: 1800, pv: 600, bess: 300, grid: 900, price: 1.2, weather: { type: 'sun', temp: '27°C', desc: '晴朗' } },
  { time: '11:00', load: 600, pv: 800, bess: -210, grid: 10, price: 0.6, weather: { type: 'sun', temp: '29°C', desc: '晴朗' } },
  { time: '12:00', load: 500, pv: 1000, bess: -510, grid: 10, price: 0.6, weather: { type: 'sun', temp: '30°C', desc: '晴朗' }, annotation: { title: '存在逆流风险', value: '逆流预测 510kW', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' } },
  { time: '13:00', load: 500, pv: 1100, bess: -610, grid: 10, price: 0.6, weather: { type: 'sun', temp: '31°C', desc: '晴朗' } },
  { time: '14:00', load: 550, pv: 540, bess: 0, grid: 10, price: 0.6, weather: { type: 'sun', temp: '31°C', desc: '晴朗' } },
  { time: '15:00', load: 750, pv: 700, bess: 0, grid: 50, price: 0.6, weather: { type: 'sun', temp: '30°C', desc: '晴朗' } },
  { time: '16:00', load: 700, pv: 400, bess: 0, grid: 300, price: 0.6, weather: { type: 'cloud-sun', temp: '28°C', desc: '多云' } },
  { time: '17:00', load: 1000, pv: 100, bess: 300, grid: 600, price: 1.2, weather: { type: 'cloud-sun', temp: '26°C', desc: '多云' } },
  { time: '18:00', load: 1450, pv: 0, bess: 300, grid: 1150, price: 1.2, weather: { type: 'cloud-sun', temp: '24°C', desc: '多云' }, annotation: { title: '存在超需风险', value: '超限预测 250kW', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' } },
  { time: '19:00', load: 1200, pv: 0, bess: 300, grid: 900, price: 1.2, weather: { type: 'moon', temp: '22°C', desc: '晴朗' } },
  { time: '20:00', load: 800, pv: 0, bess: 300, grid: 500, price: 1.2, weather: { type: 'moon', temp: '21°C', desc: '晴朗' } },
  { time: '21:00', load: 600, pv: 0, bess: -300, grid: 900, price: 0.3, weather: { type: 'moon', temp: '20°C', desc: '晴朗' } },
  { time: '22:00', load: 500, pv: 0, bess: -300, grid: 800, price: 0.3, weather: { type: 'moon', temp: '19°C', desc: '晴朗' } },
  { time: '23:00', load: 400, pv: 0, bess: -300, grid: 700, price: 0.3, weather: { type: 'moon', temp: '19°C', desc: '晴朗' } },
  { time: '23:59', load: 400, pv: 0, bess: -300, grid: 700, price: 0.3, weather: { type: 'moon', temp: '18°C', desc: '晴朗' } },
];

const getWeatherIcon = (type: string) => {
  switch (type) {
    case 'sun': return Sun;
    case 'moon': return Moon;
    case 'cloud-sun': return CloudSun;
    case 'rain': return CloudRain;
    default: return Sun;
  }
};

const CustomXAxisTick = ({ x, y, payload }: any) => {
  const dataPoint = chartData.find(d => d.time === payload.value);
  if (!dataPoint || !dataPoint.weather) return null;
  const WeatherIcon = getWeatherIcon(dataPoint.weather.type);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={15} textAnchor="middle" fill="#334155" fontSize={12} fontWeight="bold">
        {payload.value}
      </text>
      <g transform="translate(-8, 22)">
        <WeatherIcon size={16} color="#64748b" />
      </g>
      <text x={0} y={50} textAnchor="middle" fill="#64748b" fontSize={10}>
        {dataPoint.weather.temp}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const WeatherIcon = getWeatherIcon(data.weather?.type);
    
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 text-sm min-w-[200px]">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <span className="font-bold text-slate-800">{label}</span>
          {data.weather && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <WeatherIcon className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium">{data.weather.desc} {data.weather.temp}</span>
            </div>
          )}
        </div>

        {data.annotation && (
          <div className={`mb-3 p-2 rounded-lg border ${data.annotation.bg} ${data.annotation.border}`}>
            <div className={`text-xs font-bold mb-1 ${data.annotation.color}`}>{data.annotation.title}</div>
            <div className="text-xs font-medium text-slate-700">{data.annotation.value}</div>
          </div>
        )}

        {payload.map((entry: any, index: number) => {
          if (['bessEffect', 'overDemand', 'reverseFlow'].includes(entry.dataKey)) return null;
          return (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-800">
                {entry.value} {entry.name === '预测电价' ? '元' : 'kW'}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const AnnotationLabel = ({ cx, cy, title, value, color, borderColor, offsetX = 0, offsetY = 0 }: any) => {
  if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) return null;
  
  const boxX = cx - 60 + offsetX;
  const boxY = cy - 80 + offsetY;

  return (
    <g>
      {/* Connector Line */}
      <line x1={cx} y1={cy} x2={boxX + 60} y2={boxY + 20} stroke={borderColor} strokeWidth={2} />
      
      {/* Box */}
      <rect x={boxX} y={boxY} width={120} height={40} rx={4} fill="white" stroke={borderColor} strokeWidth={2} />
      
      {/* Title */}
      <text x={boxX + 60} y={boxY + 16} textAnchor="middle" fill={color} fontSize={10} fontWeight="bold">
        {title}
      </text>
      
      {/* Value */}
      <text x={boxX + 60} y={boxY + 32} textAnchor="middle" fill="#1e293b" fontSize={12} fontWeight="bold">
        {value}
      </text>
      
      {/* Dot */}
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={2} />
    </g>
  );
};

const originalMarkers = [
  { time: '00:00 - 06:00', title: '低谷电价期', action: '成本低', desc: '夜间谷时段，电价最低', type: '电价利好', color: 'emerald' },
  { time: '06:00 - 08:00', title: '平段过渡期', action: '无异常', desc: '供需平稳，无违约风险', type: '状态平稳', color: 'slate' },
  { time: '08:00 - 11:00', title: '存在超需风险', action: '超限预测', desc: '早高峰突增，功率超限', type: '异常警告', color: 'rose' },
  { time: '11:00 - 15:00', title: '存在逆流风险', action: '倒送警告', desc: '光伏大发，出现倒送', type: '异常警告', color: 'amber' },
  { time: '15:00 - 17:00', title: '平稳消纳期', action: '无异常', desc: '正常用电期，供需平衡', type: '状态平稳', color: 'slate' },
  { time: '17:00 - 19:00', title: '存在超需风险', action: '超限预测', desc: '晚峰攀升，功率超限', type: '异常警告', color: 'rose' },
  { time: '19:00 - 21:00', title: '尖峰高价期', action: '成本高', desc: '晚间尖峰段，最高电价', type: '电价预警', color: 'amber' },
  { time: '21:00 - 23:59', title: '平谷过渡期', action: '无异常', desc: '电价回落，负荷降低', type: '状态平稳', color: 'slate' },
];

const aiSuggestedStrategies = [
  { time: '00:00 - 06:00', type: '峰谷套利', action: '储能充电', reason: '电价谷时段，满充备用', color: 'blue' },
  { time: '06:00 - 08:00', type: '平段待机', action: '保持待机', reason: '负荷平稳，待机防损耗', color: 'slate' },
  { time: '08:00 - 11:00', type: '需量控制', action: '储能放电', reason: '负荷突增，放电防超限', color: 'rose' },
  { time: '11:00 - 15:00', type: '光储协同', action: '充电吸纳', reason: '光伏大发，防逆流', color: 'amber' },
  { time: '15:00 - 17:00', type: '平段待机', action: '保持待机', reason: '供需平衡，暂无风险', color: 'slate' },
  { time: '17:00 - 19:00', type: '需量控制', action: '储能放电', reason: '晚峰攀升，放电防超限', color: 'rose' },
  { time: '19:00 - 21:00', type: '峰谷套利', action: '储能放电', reason: '风险解除，放电套利', color: 'blue' },
  { time: '21:00 - 23:59', type: '峰谷套利', action: '储能充电', reason: '重回谷时段，新一轮充电', color: 'blue' },
];

const AlgorithmPredictionPage: React.FC<AlgorithmPredictionPageProps> = ({ onNavigate }) => {
  const [visibleSeries, setVisibleSeries] = useState({
    load: false,
    pv: false,
    bess: false,
    grid: true,
    price: true,
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 获取当前日期用于预测显示
  const today = new Date();
  const initialDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(initialDateString);
  const showAnnotations = true; // Annotations are always shown now
  const [hoveredTimeRange, setHoveredTimeRange] = useState<{ start: string; end: string; color: string } | null>(null);

  const processedData = React.useMemo(() => {
    return chartData.map(d => {
      const gridWithoutBess = d.load - d.pv;
      const displayedGrid = visibleSeries.bess ? d.grid : gridWithoutBess;
      
      // We want [bottom, top] for shading the area affected by BESS
      const bessEffect = visibleSeries.bess ? 
        [Math.min(displayedGrid, gridWithoutBess), Math.max(displayedGrid, gridWithoutBess)] : null;
        
      return {
        ...d,
        gridWithoutBess,
        displayedGrid,
        bessEffect,
        overDemand: gridWithoutBess > 1200 ? [1200, gridWithoutBess] : null,
        reverseFlow: gridWithoutBess < 10 ? [gridWithoutBess, 10] : null,
      };
    });
  }, [visibleSeries.bess]);

  return (
    <div className="p-4 h-full overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight mb-1">策略&算法运行模拟预测</h1>
            <p className="text-xs text-slate-500">基于历史负荷和气象数据的实时24小时预测（1小时粒度） <span className="ml-4 font-bold text-slate-700">预测周期：{selectedDate} 00:00 - 23:59</span></p>
          </div>

          <div className="flex items-center gap-6">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm hover:border-blue-400 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
              />
            </div>

            {/* BESS Toggle Button (Replacing Annotation Toggle) */}
            <button
              onClick={() => toggleSeries('bess')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm font-bold shadow-sm ${
                visibleSeries.bess 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              AI排程效果
            </button>

            {/* Legend */}
            <div className="flex items-center gap-4">
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.load ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('load')}
              >
                <div className="w-4 h-1 bg-[#1e40af]"></div>
                <span className="text-[11px] font-bold text-slate-600">负荷功率</span>
              </div>
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.pv ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('pv')}
              >
                <div className="w-4 h-1 bg-[#f97316]"></div>
                <span className="text-[11px] font-bold text-slate-600">光伏发电</span>
              </div>
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.grid ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('grid')}
              >
                <div className="w-4 h-1 bg-slate-900 border-b border-slate-400"></div>
                <span className="text-[11px] font-bold text-slate-800">电网功率</span>
              </div>
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.price ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('price')}
              >
                <div className="w-3 h-3 bg-orange-50 border border-orange-100 rounded-sm"></div>
                <span className="text-[11px] font-bold text-orange-500">预测电价</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate?.('策略运行报告')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold shadow-sm"
            >
              查看策略运行报告
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[320px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={processedData}
              margin={{ top: 35, right: 25, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
              
              <XAxis 
                dataKey="time" 
                axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tick={<CustomXAxisTick />} 
                ticks={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']}
                height={60}
              />
              
              <YAxis 
                yAxisId="left" 
                axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 'bold' }}
                domain={[-1000, 2000]}
                ticks={[-1000, -500, 0, 500, 1000, 1500, 2000]}
                label={{ value: '功率：kW', position: 'top', offset: 20, fill: '#334155', fontSize: 12, fontWeight: 'bold' }}
                dx={-10}
              />
              
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tick={{ fill: '#b45309', fontSize: 12, fontWeight: 'bold' }}
                domain={[-0.5, 1.5]}
                ticks={[-0.5, 0, 0.5, 1.0, 1.5]}
                tickFormatter={(val) => val.toFixed(1)}
                label={{ value: '电价：元/kWh', position: 'top', offset: 20, fill: '#b45309', fontSize: 12, fontWeight: 'bold' }}
                dx={10}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Price Spaces */}
              {showAnnotations && visibleSeries.price && (
                <>
                  <ReferenceArea x1="00:00" x2="06:00" yAxisId="left" fill="#10b981" fillOpacity={0.15} />
                  <ReferenceArea x1="21:00" x2="23:59" yAxisId="left" fill="#10b981" fillOpacity={0.15} />
                  <ReferenceArea x1="08:00" x2="11:00" yAxisId="left" fill="#ef4444" fillOpacity={0.15} />
                  <ReferenceArea x1="17:00" x2="20:00" yAxisId="left" fill="#ef4444" fillOpacity={0.15} />
                </>
              )}

              {/* Price Area */}
              {visibleSeries.price && (
                <Area 
                  yAxisId="right" 
                  type="stepAfter" 
                  dataKey="price" 
                  name="预测电价" 
                  fill="#ffedd5" 
                  stroke="none" 
                />
              )}

              {/* Risk Areas */}
              {/* Removed here, moved up */}

              {/* Lines */}
              {visibleSeries.load && <Line yAxisId="left" type="stepAfter" dataKey="load" name="负荷功率" stroke="#1e40af" strokeWidth={3} dot={false} />}
              {visibleSeries.pv && <Line yAxisId="left" type="stepAfter" dataKey="pv" name="光伏发电" stroke="#f97316" strokeWidth={3} dot={false} />}
              
              {/* Effect fill area */}
              {visibleSeries.bess && visibleSeries.grid && (
                <Area 
                  yAxisId="left" 
                  type="stepAfter" 
                  dataKey="bessEffect" 
                  fill="#10b981" 
                  fillOpacity={0.25} 
                  stroke="none" 
                  isAnimationActive={false}
                />
              )}

              {/* Risk Areas (Uses Original Grid to show risk) */}
              {showAnnotations && visibleSeries.grid && (
                <>
                  <Area
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="overDemand"
                    fill="#fda4af"
                    fillOpacity={visibleSeries.bess ? 0.3 : 0.6}
                    stroke="none"
                    connectNulls={false}
                  />
                  <Area
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="reverseFlow"
                    fill="#fdba74"
                    fillOpacity={visibleSeries.bess ? 0.3 : 0.6}
                    stroke="none"
                    connectNulls={false}
                  />
                </>
              )}
              
              {visibleSeries.bess && <Line yAxisId="left" type="stepAfter" dataKey="bess" name="储能" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} />}
              
              {/* Dashed original grid when BESS is overlaid */}
              {visibleSeries.bess && visibleSeries.grid && (
                <Line yAxisId="left" type="stepAfter" dataKey="gridWithoutBess" name="调整前电网功率" stroke="#64748b" strokeWidth={3} strokeDasharray="5 5" dot={false} />
              )}
              
              {/* Main displayed grid line */}
              {visibleSeries.grid && (
                <Line 
                  yAxisId="left" 
                  type="stepAfter" 
                  dataKey="displayedGrid" 
                  name={visibleSeries.bess ? "调整后电网功率" : "电网功率"} 
                  stroke={visibleSeries.bess ? "#020617" : "#64748b"} 
                  strokeWidth={visibleSeries.bess ? 3 : 2} 
                  dot={false} 
                />
              )}

              {/* Threshold Lines */}
              <ReferenceLine yAxisId="left" y={1200} stroke="#ef4444" strokeWidth={1} strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: '超限阈值 1200kW', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine yAxisId="left" y={10} stroke="#f97316" strokeWidth={1} strokeOpacity={0.5} label={{ position: 'insideBottomLeft', value: '逆流阈值 10kW', fill: '#f97316', fontSize: 10 }} />

              {/* Custom Annotations - Removed as requested */}

              {/* Hover Highlight Area */}
              {hoveredTimeRange && (
                <ReferenceArea 
                  yAxisId="left" 
                  x1={hoveredTimeRange.start} 
                  x2={hoveredTimeRange.end} 
                  fill={
                    hoveredTimeRange.color === 'emerald' ? '#10b981' : 
                    hoveredTimeRange.color === 'rose' ? '#f43f5e' : 
                    hoveredTimeRange.color === 'amber' ? '#f59e0b' : 
                    hoveredTimeRange.color === 'blue' ? '#3b82f6' : 
                    '#8b5cf6'
                  } 
                  fillOpacity={0.15} 
                />
              )}

            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Area replacing Table and in-chart annotations */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm relative mt-2 p-4">
          <div className="w-full">
            <div className="flex flex-col w-full">
              
              {/* Timeline 1: Original Risk & Price (always shown) */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2 w-full pb-0">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-base font-bold text-slate-800">
                    AI预测与评估
                  </span>
                </div>

                <div className="relative pt-6 pb-2">
                  {/* Connecting horizontal line */}
                  <div className="absolute top-[32px] left-8 right-8 h-[2px] bg-slate-100 rounded-full z-0 pointer-events-none"></div>

                  <div className="grid grid-cols-8 gap-2 relative z-10 px-0">
                    {originalMarkers.map((marker, idx) => {
                      const [start, end] = marker.time.split(' - ');
                      const isHovered = hoveredTimeRange && hoveredTimeRange.start === start && hoveredTimeRange.end === end;
                      const colorConfig: Record<string, string> = {
                        emerald: 'border-emerald-200 bg-emerald-50/80 text-emerald-800',
                        rose: 'border-rose-200 bg-rose-50 text-rose-800',
                        amber: 'border-amber-200 bg-amber-50 text-amber-800',
                        slate: 'border-slate-200 bg-slate-50 text-slate-800',
                      };
                      const colorIconBgConfig: Record<string, string> = {
                        emerald: 'bg-emerald-500 shadow-emerald-200',
                        rose: 'bg-rose-500 shadow-rose-200',
                        amber: 'bg-amber-500 shadow-amber-200',
                        slate: 'bg-slate-400 shadow-slate-200',
                      };
                      const highlightConfig: Record<string, string> = {
                        emerald: 'border-emerald-400 shadow-md transform -translate-y-1 ring-4 ring-emerald-100 ring-opacity-50',
                        rose: 'border-rose-400 shadow-md transform -translate-y-1 ring-4 ring-rose-100 ring-opacity-50',
                        amber: 'border-amber-400 shadow-md transform -translate-y-1 ring-4 ring-amber-100 ring-opacity-50',
                        slate: 'border-slate-400 shadow-md transform -translate-y-1 ring-4 ring-slate-100 ring-opacity-50',
                      };

                      return (
                        <div 
                          key={idx} 
                          className={`relative flex flex-col w-full rounded-xl border-2 transition-all duration-300 cursor-pointer pt-4 pb-2 px-1.5 ${colorConfig[marker.color]} ${
                            isHovered ? highlightConfig[marker.color] : ''
                          }`}
                          onMouseEnter={() => setHoveredTimeRange({ start, end, color: marker.color })}
                          onMouseLeave={() => setHoveredTimeRange(null)}
                        >
                          {/* Node circle on the line */}
                          <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full border-[3px] border-white shadow flex items-center justify-center ${colorIconBgConfig[marker.color]}`}></div>
                          </div>

                          <div className="text-center font-black text-slate-700 mb-1 mt-0 text-[10px] tracking-tight">{marker.time}</div>
                          
                          <div className="flex justify-center mb-1.5">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/60 border border-white/40 whitespace-nowrap`}>
                              {marker.type}
                            </span>
                          </div>
                          
                          <div className="text-xs font-bold text-slate-800 text-center mb-1 line-clamp-1">
                            {marker.title}
                          </div>

                          <div className="text-[9px] text-slate-600 leading-tight text-center opacity-90 px-0.5">
                            {marker.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Timeline 2: AI Strategy (conditionally shown) */}
              <AnimatePresence>
                {visibleSeries.bess && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="relative pt-4 border-t border-slate-100 border-dashed mt-2">
                      <div className="flex items-center gap-2 mb-2 w-full pb-0">
                        <BrainCircuit className="w-4 h-4 text-indigo-500" />
                        <span className="text-base font-bold text-slate-800">
                          AI建议排程策略
                        </span>
                      </div>

                      <div className="relative pt-6 pb-2">
                        {/* Connecting horizontal line */}
                        <div className="absolute top-[32px] left-8 right-8 h-[2px] bg-slate-100 rounded-full z-0 pointer-events-none"></div>

                        <div className="grid grid-cols-8 gap-2 relative z-10 px-0">
                          {aiSuggestedStrategies.map((strategy, idx) => {
                            const [start, end] = strategy.time.split(' - ');
                            const isHovered = hoveredTimeRange && hoveredTimeRange.start === start && hoveredTimeRange.end === end;
                            const colorConfig: Record<string, string> = {
                              blue: 'border-blue-200 bg-blue-50 text-blue-800',
                              slate: 'border-slate-200 bg-slate-50 text-slate-700',
                              rose: 'border-rose-200 bg-rose-50 text-rose-800',
                              amber: 'border-amber-200 bg-amber-50 text-amber-800',
                            };
                            const colorIconBgConfig: Record<string, string> = {
                              blue: 'bg-blue-500 shadow-blue-200',
                              slate: 'bg-slate-400 shadow-slate-200',
                              rose: 'bg-rose-500 shadow-rose-200',
                              amber: 'bg-amber-500 shadow-amber-200',
                            };
                            const highlightConfig: Record<string, string> = {
                              blue: 'border-blue-400 shadow-md transform -translate-y-1 ring-4 ring-blue-100 ring-opacity-50',
                              slate: 'border-slate-400 shadow-md transform -translate-y-1 ring-4 ring-slate-100 ring-opacity-50',
                              rose: 'border-rose-400 shadow-md transform -translate-y-1 ring-4 ring-rose-100 ring-opacity-50',
                              amber: 'border-amber-400 shadow-md transform -translate-y-1 ring-4 ring-amber-100 ring-opacity-50',
                            };

                            return (
                              <div 
                                key={idx} 
                                className={`relative flex flex-col w-full rounded-xl border-2 transition-all duration-300 cursor-pointer pt-4 pb-2 px-1.5 ${colorConfig[strategy.color]} ${
                                  isHovered ? highlightConfig[strategy.color] : ''
                                }`}
                                onMouseEnter={() => setHoveredTimeRange({ start, end, color: strategy.color })}
                                onMouseLeave={() => setHoveredTimeRange(null)}
                              >
                                {/* Node circle on the line */}
                                <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                                  <div className={`w-5 h-5 rounded-full border-[3px] border-white shadow flex items-center justify-center ${colorIconBgConfig[strategy.color]}`}></div>
                                </div>

                                <div className="text-center font-black text-slate-700 mb-1 mt-0 text-[10px] tracking-tight">{strategy.time}</div>
                                
                                <div className="flex justify-center mb-1.5">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/60 border border-white/40 whitespace-nowrap`}>
                                    {strategy.type}
                                  </span>
                                </div>
                                
                                <div className="text-xs font-bold text-slate-800 text-center mb-1 line-clamp-1">
                                  {strategy.action}
                                </div>

                                <div className="text-[9px] text-slate-600 leading-tight text-center opacity-90 px-0.5">
                                  {strategy.reason}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmPredictionPage;

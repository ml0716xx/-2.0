import React, { useState } from 'react';
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

const aiSuggestedStrategies = [
  { time: '00:00 - 06:00', type: '峰谷套利', action: '储能充电', reason: '处于电价谷时段，且预测后续无大功率放电需求，执行满充以备白天高峰使用。' },
  { time: '06:00 - 08:00', type: '平段待机', action: '待机', reason: '电价平段，且预测负荷平稳，无超需或逆流风险，保持待机以减少循环损耗。' },
  { time: '08:00 - 11:00', type: '需量控制', action: '储能放电', reason: '预测该时段厂区负荷突增，电网功率将超过 1200kW 的超限阈值，触发需量防超限放电。' },
  { time: '11:00 - 15:00', type: '防逆流', action: '充电/降功', reason: '预测光伏大发且厂区负荷较低，电网功率将低于 10kW 的逆流阈值，触发防逆流充电或降低光伏出力。' },
  { time: '15:00 - 17:00', type: '平段待机', action: '待机', reason: '电价平段，负荷与光伏处于平衡状态，无违约风险，保持待机。' },
  { time: '17:00 - 19:00', type: '需量控制', action: '储能放电', reason: '预测傍晚出现第二次负荷高峰，电网功率再次超过超限阈值，触发需量控制放电。' },
  { time: '19:00 - 21:00', type: '峰谷套利', action: '储能放电', reason: '处于电价峰时段，且已度过需量风险期，执行放电以获取最大化峰谷套利收益。' },
  { time: '21:00 - 23:59', type: '峰谷套利', action: '储能充电', reason: '进入夜间电价谷时段，开始新一轮储能充电循环。' },
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
  const [hoveredTimeRange, setHoveredTimeRange] = useState<[string, string] | null>(null);

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
    <div className="p-6 h-full overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">策略&算法运行模拟预测</h1>
            <p className="text-sm text-slate-500">基于历史负荷和气象数据的实时24小时预测（1小时粒度） <span className="ml-4 font-bold text-slate-700">预测周期：{selectedDate} 00:00 - 23:59</span></p>
          </div>

          <div className="flex items-center gap-8">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm hover:border-blue-400 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
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
            <div className="flex items-center gap-6">
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.load ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('load')}
              >
                <div className="w-4 h-1 bg-[#1e40af]"></div>
                <span className="text-xs font-bold text-slate-600">负荷功率</span>
              </div>
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.pv ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('pv')}
              >
                <div className="w-4 h-1 bg-[#f97316]"></div>
                <span className="text-xs font-bold text-slate-600">光伏发电</span>
              </div>
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.grid ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('grid')}
              >
                <div className="w-4 h-1 bg-slate-900 border-b border-slate-400"></div>
                <span className="text-xs font-bold text-slate-800">电网功率</span>
              </div>
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.price ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('price')}
              >
                <div className="w-4 h-4 bg-orange-50 border border-orange-100 rounded-sm"></div>
                <span className="text-xs font-bold text-orange-500">预测电价</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate?.('策略运行报告')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
            >
              查看策略运行报告
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[500px] w-full mt-12">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={processedData}
              margin={{ top: 100, right: 20, left: 20, bottom: 40 }}
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

              {/* Custom Annotations */}
              {showAnnotations && (
                <>
                  <ReferenceDot yAxisId="left" x="03:00" y={1400} r={0} shape={(props: any) => <AnnotationLabel {...props} title="低价充电区间" value="建议充电" color="#10b981" borderColor="#059669" />} />
                  <ReferenceDot yAxisId="left" x="08:00" y={1100} r={0} shape={(props: any) => <AnnotationLabel {...props} title="高价放电区间" value="建议放电" color="#10b981" borderColor="#059669" offsetX={-20} />} />
                  <ReferenceDot yAxisId="left" x="09:00" y={1650} r={0} shape={(props: any) => <AnnotationLabel {...props} title="存在超需风险" value="建议放电" color="#ef4444" borderColor="#dc2626" offsetX={20} />} />
                  <ReferenceDot yAxisId="left" x="12:00" y={-500} r={0} shape={(props: any) => <AnnotationLabel {...props} title="存在逆流风险" value="建议充电/降功" color="#f97316" borderColor="#ea580c" offsetX={-20} />} />
                  <ReferenceDot yAxisId="left" x="18:00" y={1650} r={0} shape={(props: any) => <AnnotationLabel {...props} title="存在超需风险" value="建议放电" color="#ef4444" borderColor="#dc2626" offsetX={-20} />} />
                  <ReferenceDot yAxisId="left" x="19:00" y={1100} r={0} shape={(props: any) => <AnnotationLabel {...props} title="高价放电区间" value="建议放电" color="#10b981" borderColor="#059669" offsetX={20} />} />
                </>
              )}

              {/* Hover Highlight Area */}
              {hoveredTimeRange && (
                <ReferenceArea 
                  yAxisId="left" 
                  x1={hoveredTimeRange[0]} 
                  x2={hoveredTimeRange[1]} 
                  fill="#8b5cf6" 
                  fillOpacity={0.15} 
                />
              )}

            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Strategy List */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            <span className="text-lg font-bold text-slate-800">Ai建议策略</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-3 font-bold text-slate-500 text-xs rounded-tl-lg w-32">执行时间</th>
                  <th className="p-3 font-bold text-slate-500 text-xs w-28">策略类型</th>
                  <th className="p-3 font-bold text-slate-500 text-xs w-32">建议动作</th>
                  <th className="p-3 font-bold text-slate-500 text-xs rounded-tr-lg">触发原因/描述</th>
                </tr>
              </thead>
              <tbody>
                {aiSuggestedStrategies.map((strategy, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-slate-50 hover:bg-purple-50/40 transition-colors cursor-pointer"
                    onMouseEnter={() => {
                      const [start, end] = strategy.time.split(' - ');
                      setHoveredTimeRange([start, end]);
                    }}
                    onMouseLeave={() => setHoveredTimeRange(null)}
                  >
                    <td className="p-3 text-xs font-medium text-slate-700">{strategy.time}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        strategy.type === '峰谷套利' ? 'bg-blue-50 text-blue-600' :
                        strategy.type === '需量控制' ? 'bg-red-50 text-red-600' :
                        strategy.type === '防逆流' ? 'bg-orange-50 text-orange-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {strategy.type}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-bold text-slate-700">{strategy.action}</td>
                    <td className="p-3 text-xs text-slate-500 leading-relaxed">{strategy.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmPredictionPage;

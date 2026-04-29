import React, { useState } from 'react';
import { motion } from 'motion/react';
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

const generateChartData = (scenario: 'standard' | 'negativePrice') => {
  const data = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      
      const isPeak = (h >= 8 && h <= 11) || (h >= 17 && h <= 20);
      const isValley = (h >= 0 && h <= 5) || (h >= 21 && h <= 23) || (h === 24 && m === 0);
      
      let baseLoad = 400 + Math.random() * 50;
      if (isPeak) baseLoad += 800 + Math.random() * 200;
      else if (!isValley) baseLoad += 400 + Math.random() * 100;
      
      // B. 在原本储能低价充电区间（如 03:00 - 04:00），出现超容，需要储能放电进行修复。
      if (h === 3) {
        baseLoad += 1000;
      }

      let pv = 0;
      if (h >= 6 && h <= 18) {
        pv = Math.sin((h - 6) / 12 * Math.PI) * 1400 + (Math.random() - 0.5) * 100;
        if (h === 10 || h === 11) {
          pv += 600;
          baseLoad -= 400;
        }
        if (h === 13 || h === 14) {
          pv += 300;
          baseLoad -= 200;
        }
        pv = Math.max(0, pv);
      }

      let price = 0.6;
      if (isValley) price = 0.3;
      if (isPeak) price = 1.2;
      
      let dayAheadPrice = price + (Math.random() - 0.5) * 0.05;
      let realTimePrice = price + (Math.random() - 0.5) * 0.1;

      // 新增：模拟负电价场景
      if (scenario === 'negativePrice') {
        if (h >= 8 && h < 14) {
          dayAheadPrice = -0.05 + (Math.random() - 0.5) * 0.05;
          realTimePrice = -0.15 + (Math.random() - 0.5) * 0.08;
        } else if (h >= 14 && h < 18) {
          dayAheadPrice = 0.3 + (Math.random() - 0.5) * 0.05;
          realTimePrice = 0.4 + (Math.random() - 0.5) * 0.08;
        }
      }

      const forecastDayAheadPrice = dayAheadPrice + (Math.random() - 0.5) * 0.02;
      const forecastRealTimePrice = realTimePrice + (Math.random() - 0.5) * 0.08;

      let weatherType = 'sun';
      if (h < 6 || h > 18) weatherType = 'moon';
      else if (pv < 500 && h > 8 && h < 16) weatherType = 'cloud-sun';

      data.push({
        time: timeStr,
        load: Math.round(baseLoad),
        pv: Math.round(pv),
        dayAheadPrice: parseFloat(dayAheadPrice.toFixed(2)),
        realTimePrice: parseFloat(realTimePrice.toFixed(2)),
        forecastDayAheadPrice: parseFloat(forecastDayAheadPrice.toFixed(2)),
        forecastRealTimePrice: parseFloat(forecastRealTimePrice.toFixed(2)),
        weather: { type: weatherType, temp: `${Math.round(20 + h/2)}°C`, desc: weatherType === 'sun' ? '晴朗' : '多云' },
        isPeak,
        isValley,
      });
    }
  }
  return data;
};

const getWeatherIcon = (type: string) => {
  switch (type) {
    case 'sun': return Sun;
    case 'moon': return Moon;
    case 'cloud-sun': return CloudSun;
    case 'rain': return CloudRain;
    default: return Sun;
  }
};

const CustomXAxisTick = ({ x, y, payload, chartData }: any) => {
  const dataPoint = chartData.find((d: any) => d.time === payload.value);
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

const CustomTooltip = ({ active, payload, label, hideAnnotations, scenario }: any) => {
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

        {!hideAnnotations && data.annotation && (
          <div className={`mb-3 p-2 rounded-lg border ${data.annotation.bg} ${data.annotation.border}`}>
            <div className={`text-xs font-bold mb-1 ${data.annotation.color}`}>{data.annotation.title}</div>
            <div className="text-xs font-medium text-slate-700">{data.annotation.value}</div>
          </div>
        )}

          {payload.map((entry: any, index: number) => {
          if (['bessEffect', 'pvEffect', 'overDemand', 'reverseFlow', 'originalIndex', 'top5Price', 'bottom5Price', 'riskPointOverDemand', 'riskPointReverseFlow'].includes(entry.dataKey)) return null;
          
          if (scenario === 'negativePrice' && ['dayAheadPrice', 'realTimePrice', 'forecastDayAheadPrice'].includes(entry.dataKey)) return null;

          let name = entry.name;
          if (scenario === 'negativePrice') {
             if (entry.dataKey === 'dayAheadPrice') name = '光伏日前电价';
             else if (entry.dataKey === 'realTimePrice') name = '光伏实时电价';
             else if (entry.dataKey === 'forecastDayAheadPrice') name = '预测光伏日前电价';
             else if (entry.dataKey === 'forecastRealTimePrice') name = '预测上网电价';
          } else {
             if (entry.dataKey === 'dayAheadPrice') name = '日前电价';
             else if (entry.dataKey === 'realTimePrice') name = '实时电价';
             else if (entry.dataKey === 'forecastDayAheadPrice') name = '预测日前电价';
             else if (entry.dataKey === 'forecastRealTimePrice') name = '预测实时电价';
          }

          const isPrice = name.includes('电价');

          return (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600">{name}</span>
              </div>
              <span className="font-bold text-slate-800">
                {entry.value} {isPrice ? '元/kWh' : 'kW'}
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



const AlgorithmPredictionPage: React.FC<AlgorithmPredictionPageProps> = ({ onNavigate }) => {
  const [activeScenario, setActiveScenario] = useState<'standard' | 'negativePrice'>('standard');
  const chartData = React.useMemo(() => generateChartData(activeScenario), [activeScenario]);

  const [visiblePriceSeries, setVisiblePriceSeries] = useState({
    dayAheadPrice: true,
    realTimePrice: true,
    forecastDayAheadPrice: true,
    forecastRealTimePrice: true,
  });

  const [visibleSeries, setVisibleSeries] = useState({
    load: false,
    pv: false,
    bess: false,
    grid: true,
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePriceSeries = (key: keyof typeof visiblePriceSeries) => {
    setVisiblePriceSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showAnnotations = true; // Annotations are always shown now
  const [hoveredTimeRange, setHoveredTimeRange] = useState<[string, string] | null>(null);

  const priceDataWithExtremes = React.useMemo(() => {
    // 1-hour granularity
    const hourlyData = chartData.filter(d => d.time.endsWith(':00'));
    
    const peakIndices = new Set();
    const valleyIndices = new Set();
    
    hourlyData.forEach((d, index) => {
      const h = parseInt(d.time.split(':')[0], 10);
      // Matching the original isPeak and isValley logic
      if ((h >= 8 && h <= 11) || (h >= 17 && h <= 20)) peakIndices.add(index);
      if ((h >= 0 && h <= 5) || (h >= 21 && h <= 23)) valleyIndices.add(index);
    });

    return hourlyData.map((d, index) => ({
      ...d,
      top5Price: peakIndices.has(index) ? d.forecastRealTimePrice : null,
      bottom5Price: valleyIndices.has(index) ? d.forecastRealTimePrice : null,
    }));
  }, [chartData]);

  const priceStats = React.useMemo(() => {
    let maxPrice = -Infinity;
    let minPrice = Infinity;
    chartData.forEach(d => {
      if (d.forecastRealTimePrice > maxPrice) maxPrice = d.forecastRealTimePrice;
      if (d.forecastRealTimePrice < minPrice) minPrice = d.forecastRealTimePrice;
    });
    return { maxPrice, minPrice };
  }, [chartData]);

  const processedData = React.useMemo(() => {
    return chartData.map(d => {
      let pvOriginal = d.pv;
      let pvAdjusted = pvOriginal;
      
      let bessBase = 0;
      if (activeScenario === 'negativePrice') {
        bessBase = 0;
      } else if (d.isValley) {
        bessBase = -300;
      } else if (d.isPeak) {
        bessBase = 300;
      }

      let bessAdjusted = bessBase;
      let reason = '';
      
      let netLoadBase = visibleSeries.pv ? d.load - pvAdjusted : d.load;

      if (activeScenario === 'negativePrice') {
         if (visibleSeries.bess) {
            const h = parseInt(d.time.split(':')[0]);
            
            if (h >= 0 && h < 3) {
               bessAdjusted = -300;
               reason = '低价充电';
            } else if (h === 3) {
               bessAdjusted = 0; // Will be handled by riskDemandCheck below
            } else if (h >= 4 && h < 6) {
               bessAdjusted = -300;
               reason = '低价充电';
            } else if (h >= 6 && h < 8) {
               bessAdjusted = 0;
               reason = '待机';
            } else if (h >= 8 && h < 11) {
               bessAdjusted = Math.min(-300, netLoadBase - 15);
               bessAdjusted = Math.max(bessAdjusted, -2500);
               reason = '上网负电价储能充电';
            } else if (h >= 11 && h < 14) {
               bessAdjusted = 0; // 储能充满
               if (netLoadBase < 10 && visibleSeries.pv) {
                  pvAdjusted = Math.max(0, d.load - 10);
                  netLoadBase = visibleSeries.pv ? d.load - pvAdjusted : d.load; // recalculate with adjusted PV
                  reason = '抑制光伏发电';
               } else {
                  reason = '待机';
               }
            } else if (h >= 14 && h < 17) {
               bessAdjusted = 0;
               reason = '待机';
            } else if (h >= 17 && h < 21) {
               bessAdjusted = 300;
               reason = '高价放电';
            } else if (h >= 21) {
               bessAdjusted = -300;
               reason = '低价充电';
            }
         }
      } else {
         const riskReverse = netLoadBase - bessBase < 10;
         if (riskReverse) {
           bessAdjusted = netLoadBase - 10;
           bessAdjusted = Math.max(bessAdjusted, -2500);
           reason = '逆流化解';
         }
      }

      // 无论什么场景，必须保证不超容 (不管电价多少，也不能超过电网允许的上限)
      // 计算加入之前的储能调整后，是否超容 
      const riskDemandCheck = netLoadBase - bessAdjusted > 1200;
      if (riskDemandCheck && visibleSeries.bess) {
         bessAdjusted = netLoadBase - 1200;
         bessAdjusted = Math.min(bessAdjusted, 2500); 
         reason = activeScenario === 'negativePrice' ? '防超容放电' : '超容化解';
      }

      const finalNetLoad = visibleSeries.pv ? d.load - pvAdjusted : d.load;
      const displayedGrid = visibleSeries.bess ? finalNetLoad - bessAdjusted : finalNetLoad;

      const gridWithBaseBess = finalNetLoad - bessBase;
      const riskDemand = gridWithBaseBess > 1200;
      const riskReverse = gridWithBaseBess < 10;

      const bessEffect = visibleSeries.bess ? 
        [Math.min(displayedGrid, finalNetLoad), Math.max(displayedGrid, finalNetLoad)] : null;
        
      const pvEffect = visibleSeries.pv ? 
        [Math.min(d.load, finalNetLoad), Math.max(d.load, finalNetLoad)] : null;
        
      const overDemand = gridWithBaseBess > 1200 ? [1200, gridWithBaseBess] : null;
      const reverseFlow = gridWithBaseBess < 10 ? [gridWithBaseBess, 10] : null;

      return {
        ...d,
        pv: pvAdjusted,
        pvOriginal: pvOriginal !== pvAdjusted ? pvOriginal : null,
        bess: bessAdjusted,
        bessPriceOnly: bessBase,
        gridWithoutBess: finalNetLoad,
        displayedGrid,
        bessEffect,
        pvEffect,
        overDemand,
        reverseFlow,
        reason,
        diff: bessAdjusted - bessBase,
        riskPointOverDemand: riskDemand ? gridWithBaseBess : null,
        riskPointReverseFlow: riskReverse ? gridWithBaseBess : null
      };
    });
  }, [visibleSeries.bess, visibleSeries.pv, chartData, activeScenario]);

  const generatedStrategies = React.useMemo(() => {
    if (!processedData.length) return [];
    const blocks: any[] = [];
    let currentBlock = {
      startTime: processedData[0].time,
      endTime: processedData[0].time,
      bessPriceOnly: processedData[0].bessPriceOnly,
      reason: processedData[0].reason,
      diffs: [processedData[0].diff],
      besses: [processedData[0].bess]
    };
    
    for (let i = 1; i < processedData.length; i++) {
      const d = processedData[i];
      let merge = false;
      
      if (!visibleSeries.bess) {
         merge = d.bessPriceOnly === currentBlock.bessPriceOnly;
      } else {
         const dCat = d.bess > 0 ? '放电' : (d.bess < 0 ? '充电' : '待机');
         const currentCat = currentBlock.besses[0] > 0 ? '放电' : (currentBlock.besses[0] < 0 ? '充电' : '待机');
         merge = d.bessPriceOnly === currentBlock.bessPriceOnly && dCat === currentCat && d.reason === currentBlock.reason;
      }

      if (merge) {
        currentBlock.endTime = d.time;
        currentBlock.diffs.push(d.diff);
        currentBlock.besses.push(d.bess);
      } else {
        blocks.push({ ...currentBlock });
        currentBlock = {
          startTime: d.time,
          endTime: d.time,
          bessPriceOnly: d.bessPriceOnly,
          reason: d.reason,
          diffs: [d.diff],
          besses: [d.bess]
        };
      }
    }
    blocks.push(currentBlock);

    const add15Min = (timeStr: string) => {
       if (!timeStr) return "24:00";
       const [h, m] = timeStr.split(':').map(Number);
       let newM = m + 15;
       let newH = h;
       if (newM >= 60) {
          newM -= 60;
          newH += 1;
       }
       if (newH >= 24) return "24:00";
       return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    };
    
    return blocks.map(b => {
      const end = add15Min(b.endTime);
      
      // Calculate max absolute diff to see if there is any adjustment
      const absDiffs = b.diffs.map((diff: number) => Math.abs(diff));
      const maxAbsDiff = Math.max(...absDiffs);
      
      let baseBess = 0;
      if (b.besses.length > 0) baseBess = b.besses[0];
      
      const minBess = Math.min(...b.besses);
      const maxBess = Math.max(...b.besses);
      
      let action = '待机';
      let displayBessPower = 0;
      let isVariable = false;
      let absMin = 0;
      let absMax = 0;

      if (visibleSeries.bess) {
        if (minBess >= 0 && maxBess > 0) { action = '放电'; absMin = minBess; absMax = maxBess; }
        else if (maxBess <= 0 && minBess < 0) { action = '充电'; absMin = Math.abs(maxBess); absMax = Math.abs(minBess); }
        else if (minBess === 0 && maxBess === 0) { action = '待机'; }
        else { action = '充放电切换'; }
        isVariable = minBess !== maxBess;
      } else {
        if (b.bessPriceOnly < 0) { action = '充电'; absMin = Math.abs(b.bessPriceOnly); absMax = absMin; }
        else if (b.bessPriceOnly > 0) { action = '放电'; absMin = b.bessPriceOnly; absMax = absMin; }
      }

      let type = '平段待机';
      if (b.bessPriceOnly < 0) type = '低价谷时段';
      else if (b.bessPriceOnly > 0) type = '高价峰时段';
      if (visibleSeries.bess && b.reason) type = b.reason;
      
      let baseActionStr = '待机';
      if (b.bessPriceOnly < 0) baseActionStr = `充电 (${Math.abs(b.bessPriceOnly).toFixed(0)}kW)`;
      else if (b.bessPriceOnly > 0) baseActionStr = `放电 (${b.bessPriceOnly.toFixed(0)}kW)`;

      let finalAction = action;
      if (action !== '待机' && action !== '充放电切换') {
         finalAction = isVariable ? `${action} (${absMin.toFixed(0)}~${absMax.toFixed(0)}kW)` : `${action} (${absMin.toFixed(0)}kW)`;
      } else if (action === '充放电切换') {
         finalAction = `动态切换`;
      }

      let baseActionCat = '待机';
      if (b.bessPriceOnly < 0) baseActionCat = '充电';
      else if (b.bessPriceOnly > 0) baseActionCat = '放电';

      let tooltipAction = finalAction;

      let isReversed = false;
      if (baseActionCat === '充电' && action === '放电') isReversed = true;
      if (baseActionCat === '放电' && action === '充电') isReversed = true;

      // Use a smaller text format for the changed action to fit potentially tight blocks
      let displayAction = finalAction;
      if (activeScenario === 'negativePrice' && visibleSeries.bess && b.reason) {
         displayAction = b.reason;
      }

      if (visibleSeries.bess && maxAbsDiff > 0) {
         tooltipAction = `${baseActionStr} ➔ ${finalAction}`;
      }
      if (activeScenario === 'negativePrice' && visibleSeries.bess && b.reason) {
         tooltipAction = b.reason;
      }


      let desc = '';
      if (b.bessPriceOnly < 0) desc = '因电价处于谷段，触发基础充电。';
      else if (b.bessPriceOnly > 0) desc = '因电价处于峰段，触发基础放电以套利。';
      else desc = '电价平段且无违约风险，保持待机。';

      if (visibleSeries.bess && b.reason === '超容化解') {
         desc = `预测该时段存在超负荷风险，进行额外放电调度化解风险。`;
      } else if (visibleSeries.bess && b.reason === '逆流化解') {
         desc = `预测该时段存在逆流风险，进行额外充电或降功化解风险。`;
      }

      return {
        time: `${b.startTime} - ${end}`,
        startTime: b.startTime,
        endTime: end,
        type,
        action: displayAction,
        tooltipAction,
        colorAction: action, // Used for determining the background color
        baseActionCat,
        finalActionCat: action,
        isChanged: visibleSeries.bess ? maxAbsDiff > 0 : false,
        isReversed: visibleSeries.bess ? isReversed : false,
        isBase: visibleSeries.bess ? b.reason === '' : true,
        desc
      };
    });
  }, [processedData, visibleSeries.bess, visibleSeries.pv]);

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">AI算法推理预测</h1>
            <p className="text-sm text-slate-500 mb-4">基于历史负荷和气象数据的实时24小时预测（15分钟粒度）</p>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveScenario('standard')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeScenario === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                标准运营场景
              </button>
              <button
                onClick={() => setActiveScenario('negativePrice')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeScenario === 'negativePrice' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                负电价场景
              </button>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Legend */}
            <div className="flex items-center gap-6">
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${visibleSeries.grid ? 'opacity-100' : 'opacity-40'}`}
                onClick={() => toggleSeries('grid')}
              >
                <div className="w-4 h-1 bg-slate-900 border-b border-slate-400"></div>
                <span className="text-xs font-bold text-slate-800">电网功率</span>
              </div>
              
              {(visibleSeries.bess || visibleSeries.pv) && (
                <div className="flex items-center gap-2 opacity-60">
                  <div className="w-4 h-0 border-t-2 border-dashed border-slate-500"></div>
                  <span className="text-xs font-bold text-slate-500">调整前电网功率</span>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-2"></div>

            <button
              onClick={() => {
                setVisibleSeries({ load: false, pv: false, bess: false, grid: true });
                setVisiblePriceSeries({ dayAheadPrice: true, realTimePrice: true, forecastDayAheadPrice: true, forecastRealTimePrice: true });
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
            >
              重置
            </button>

            {/* PV Toggle Button */}
            <button
              onClick={() => toggleSeries('pv')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm font-bold shadow-sm ${
                visibleSeries.pv 
                  ? 'bg-orange-50 border-orange-200 text-orange-600' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Sun className="w-4 h-4" />
              配光伏效果
            </button>

            {/* BESS Toggle Button */}
            <button
              onClick={() => toggleSeries('bess')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm font-bold shadow-sm ${
                visibleSeries.bess 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              AI 调度效果
            </button>

            <button
              onClick={() => onNavigate?.('策略运行报告')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
            >
              查看运行报告
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[400px] w-full mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={processedData}
              margin={{ top: 45, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
              
              <XAxis 
                dataKey="time" 
                axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tick={<CustomXAxisTick chartData={chartData} />} 
                ticks={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:45']}
                height={60}
              />
              
              <YAxis 
                yAxisId="left" 
                axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 'bold' }}
                domain={[-1000, 2000]}
                ticks={[-1000, -500, 0, 500, 1000, 1500, 2000]}
                label={{ value: '功率：kW', position: 'top', offset: 25, fill: '#334155', fontSize: 12, fontWeight: 'bold' }}
                dx={-10}
              />
              
              {/* Removed YAxis right */}

              <Tooltip content={<CustomTooltip scenario={activeScenario} />} />

              {/* Risk Areas */}
              {/* Removed here, moved up */}

              {/* Lines */}
              {visibleSeries.pv && <Line yAxisId="left" type="linear" dataKey="pv" name="光伏发电" stroke="#f97316" strokeWidth={3} dot={false} />}
              {(visibleSeries.pv && visibleSeries.bess && activeScenario === 'negativePrice') && (
                <Line yAxisId="left" type="linear" dataKey="pvOriginal" name="调整前光伏发电" stroke="#fbd38d" strokeWidth={3} strokeDasharray="5 5" dot={false} connectNulls={false} />
              )}
              
              {/* Effect fill area */}
              {visibleSeries.bess && visibleSeries.grid && (
                <Area 
                  yAxisId="left" 
                  type="linear" 
                  dataKey="bessEffect" 
                  fill="#10b981" 
                  fillOpacity={0.25} 
                  stroke="none" 
                />
              )}
              {visibleSeries.pv && visibleSeries.grid && (
                <Area 
                  yAxisId="left" 
                  type="linear" 
                  dataKey="pvEffect" 
                  fill="#f97316" 
                  fillOpacity={0.15} 
                  stroke="none" 
                />
              )}

              {/* Risk Areas (Uses Original Grid to show risk) */}
              {showAnnotations && visibleSeries.grid && (
                <>
                  <Area
                    yAxisId="left"
                    type="linear"
                    dataKey="overDemand"
                    fill="#fda4af"
                    fillOpacity={visibleSeries.bess ? 0.3 : 0.6}
                    stroke="none"
                    connectNulls={false}
                  />
                  <Area
                    yAxisId="left"
                    type="linear"
                    dataKey="reverseFlow"
                    fill="#fdba74"
                    fillOpacity={visibleSeries.bess ? 0.3 : 0.6}
                    stroke="none"
                    connectNulls={false}
                  />
                </>
              )}
              
              {visibleSeries.bess && <Line yAxisId="left" type="linear" dataKey="bess" name="储能" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} />}
              
              {/* Dashed original grid when PV or BESS is overlaid */}
              {(visibleSeries.bess || visibleSeries.pv) && visibleSeries.grid && (
                <Line yAxisId="left" type="linear" dataKey={visibleSeries.pv && !visibleSeries.bess ? "load" : "gridWithoutBess"} name="调整前电网功率" stroke="#64748b" strokeWidth={3} strokeDasharray="5 5" dot={false} />
              )}
              
              {/* Main displayed grid line */}
              {visibleSeries.grid && (
                <Line 
                  yAxisId="left" 
                  type="linear" 
                  dataKey="displayedGrid" 
                  name={(visibleSeries.bess || visibleSeries.pv) ? "调整后电网功率" : "电网功率"} 
                  stroke={(visibleSeries.bess || visibleSeries.pv) ? "#020617" : "#64748b"} 
                  strokeWidth={(visibleSeries.bess || visibleSeries.pv) ? 3 : 2} 
                  dot={false} 
                />
              )}
              
              {/* Risk Points Marks */}
              {visibleSeries.grid && showAnnotations && (
                <Line yAxisId="left" type="linear" dataKey="riskPointOverDemand" name="超容风险" stroke="none" dot={{ r: 5, fill: "#ef4444", stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 7, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }} connectNulls={false} />
              )}
              {visibleSeries.grid && showAnnotations && (
                <Line yAxisId="left" type="linear" dataKey="riskPointReverseFlow" name="逆流风险" stroke="none" dot={{ r: 5, fill: "#f97316", stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 7, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }} connectNulls={false} />
              )}

              {/* Threshold Lines */}
              <ReferenceLine yAxisId="left" y={1200} stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" label={{ position: 'insideTopLeft', value: '超容阈值 1200kW', fill: '#64748b', fontSize: 10 }} />
              <ReferenceLine yAxisId="left" y={10} stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" label={{ position: 'insideBottomLeft', value: '逆流阈值 10kW', fill: '#64748b', fontSize: 10 }} />

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

              {/* Negative Price Area */}
              {activeScenario === 'negativePrice' && (
                <ReferenceArea yAxisId="left" x1="08:00" x2="14:00" fill="#0ea5e9" fillOpacity={0.05} />
              )}

            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Charge/Discharge Schedule Bar based on Price Forecast */}
        <div className="my-2" style={{ paddingLeft: '65px', paddingRight: '20px' }}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-bold text-slate-800">建议策略</h3>
          </div>
          <div className="h-10 w-full flex rounded-lg overflow-hidden border border-slate-200 shadow-sm relative">
            {generatedStrategies.map((strategy, idx) => {
              const [startStr, endStr] = strategy.time.split(' - ');
              
              const getMins = (str: string) => {
                if (str === '24:00') return 24 * 60;
                const [h, m] = str.split(':').map(Number);
                return h * 60 + m;
              };

              const startMins = getMins(startStr);
              const endMins = getMins(endStr);
              const durationMins = endMins - startMins;
              const widthRatio = (durationMins / (24 * 60)) * 100;
              
              let bgColor = 'bg-slate-100 hover:bg-slate-200';
              let textColor = 'text-slate-600';
              let borderClass = 'border-r border-white/30 last:border-0';
              
              const isCharge = strategy.finalActionCat && strategy.finalActionCat.includes('充电');
              const isDischarge = strategy.finalActionCat && strategy.finalActionCat.includes('放电');
              const isSuppressPV = strategy.action && strategy.action.includes('抑制光伏发电');

              if (isCharge) {
                bgColor = 'bg-emerald-400 hover:bg-emerald-500';
                textColor = 'text-white';
              } else if (isDischarge) {
                bgColor = 'bg-rose-400 hover:bg-rose-500';
                textColor = 'text-white';
              } else if (isSuppressPV) {
                bgColor = 'bg-orange-400 hover:bg-orange-500';
                textColor = 'text-white';
              }

              if (strategy.isChanged) {
                if (strategy.baseActionCat === '待机') {
                  borderClass = `outline outline-2 outline-dashed -outline-offset-2 z-10 border-none ${isCharge ? 'outline-emerald-600' : 'outline-rose-600'}`;
                } else if (strategy.isReversed) {
                  bgColor = 'bg-[#009b9f] hover:bg-[#008285]'; // 替代色: 反转状态（充变放/放变充用同一个颜色）
                  borderClass = 'border-r border-white/30 last:border-0';
                }
              }
              
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.05 }}
                  key={idx} 
                  style={{ width: `${widthRatio}%` }} 
                  className={`${bgColor} ${borderClass} h-full flex flex-col items-center justify-center relative group cursor-pointer transition-colors`}
                  onMouseEnter={() => setHoveredTimeRange([startStr, endStr === '24:00' ? '23:45' : endStr])}
                  onMouseLeave={() => setHoveredTimeRange(null)}
                >
                  <span className={`text-[11px] font-bold ${textColor} drop-shadow-sm truncate px-1 max-w-full text-center overflow-hidden`}>
                    {strategy.action}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute top-[-54px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity whitespace-nowrap shadow-xl">
                    <div className="font-bold mb-0.5 text-blue-200">{strategy.time}</div>
                    <div className="font-medium text-slate-100">{strategy.tooltipAction} · {strategy.type}</div>
                    {/* Little triangle arrow at bottom */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Strategy List removed as requested */}

        {/* Separated Price Chart Header & Legend */}
        <div className="flex items-start justify-between mt-6 mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{activeScenario === 'negativePrice' ? '光伏上网电价走势预测' : '电价走势预测'}</h3>
          </div>
          <div className="flex items-center gap-6">
            {activeScenario === 'standard' && (
              <>
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${visiblePriceSeries.dayAheadPrice ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => togglePriceSeries('dayAheadPrice')}
                >
                  <div className="w-4 h-1 bg-[#f59e0b]"></div>
                  <span className="text-xs font-bold text-slate-600">日前电价</span>
                </div>
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${visiblePriceSeries.realTimePrice ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => togglePriceSeries('realTimePrice')}
                >
                  <div className="w-4 h-1 bg-[#ef4444]"></div>
                  <span className="text-xs font-bold text-slate-600">实时电价</span>
                </div>
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-opacity ${visiblePriceSeries.forecastDayAheadPrice ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => togglePriceSeries('forecastDayAheadPrice')}
                >
                  <div className="w-4 h-1 bg-[#10b981]"></div>
                  <span className="text-xs font-bold text-slate-600">预测日前电价</span>
                </div>
              </>
            )}
            <div 
              className={`flex items-center gap-2 cursor-pointer transition-opacity ${visiblePriceSeries.forecastRealTimePrice ? 'opacity-100' : 'opacity-40'}`}
              onClick={() => togglePriceSeries('forecastRealTimePrice')}
            >
              <div className="w-4 h-1 bg-[#3b82f6]"></div>
              <span className="text-xs font-bold text-slate-600">{activeScenario === 'negativePrice' ? '预测上网电价' : '预测实时电价'}</span>
            </div>
          </div>
        </div>

        {/* Separated Price Chart */}
        <div className="h-[260px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={priceDataWithExtremes}
              margin={{ top: 45, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
              
              <XAxis 
                dataKey="time" 
                axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 'bold' }}
                ticks={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00']}
                height={30}
              />
              
              <YAxis 
                yAxisId="left" 
                width={45}
                axisLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tickLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }}
                domain={activeScenario === 'negativePrice' ? [-0.5, 1.5] : [0, 1.5]}
                ticks={activeScenario === 'negativePrice' ? [-0.5, 0, 0.5, 1.0, 1.5] : [0, 0.5, 1.0, 1.5]}
                tickFormatter={(val) => val.toFixed(1)}
                label={{ value: '电价：元/kWh', position: 'top', offset: 25, fill: '#475569', fontSize: 12, fontWeight: 'bold' }}
                dx={-5}
              />

              <Tooltip content={<CustomTooltip hideAnnotations scenario={activeScenario} />} />

              {/* High/Low Price Regions */}
              {visiblePriceSeries.forecastRealTimePrice && (
                <>
                  {activeScenario === 'standard' && (
                    <>
                      <ReferenceArea yAxisId="left" x1="00:00" x2="05:00" fill="#10b981" fillOpacity={0.08} label={{ value: '低价谷时段', position: 'insideTopLeft', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} />
                      <ReferenceArea yAxisId="left" x1="21:00" x2="23:00" fill="#10b981" fillOpacity={0.08} label={{ value: '低价谷时段', position: 'insideTopLeft', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} />
                      <ReferenceArea yAxisId="left" x1="08:00" x2="11:00" fill="#ef4444" fillOpacity={0.08} label={{ value: '高价峰时段', position: 'insideTopLeft', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                      <ReferenceArea yAxisId="left" x1="17:00" x2="20:00" fill="#ef4444" fillOpacity={0.08} label={{ value: '高价峰时段', position: 'insideTopLeft', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                    </>
                  )}
                  {activeScenario === 'negativePrice' && (
                    <ReferenceArea yAxisId="left" x1="08:00" x2="14:00" fill="#0ea5e9" fillOpacity={0.08} label={{ value: '负电价时段', position: 'insideTopLeft', fill: '#0ea5e9', fontSize: 12, fontWeight: 'bold' }} />
                  )}
                  
                  {/* Min/Max Price Lines */}
                  <ReferenceLine yAxisId="left" y={priceStats.maxPrice} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: `最高电价: ${priceStats.maxPrice.toFixed(2)}`, fill: '#ef4444', fontSize: 10 }} />
                  <ReferenceLine yAxisId="left" y={priceStats.minPrice} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: `最低电价: ${priceStats.minPrice.toFixed(2)}`, fill: '#10b981', fontSize: 10 }} />
                </>
              )}

              {/* Lines */}
              {activeScenario === 'standard' && visiblePriceSeries.dayAheadPrice && <Line yAxisId="left" type="linear" dataKey="dayAheadPrice" name="日前电价" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />}
              {activeScenario === 'standard' && visiblePriceSeries.realTimePrice && <Line yAxisId="left" type="linear" dataKey="realTimePrice" name="实时电价" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />}
              {activeScenario === 'standard' && visiblePriceSeries.forecastDayAheadPrice && <Line yAxisId="left" type="linear" dataKey="forecastDayAheadPrice" name="预测日前电价" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />}
              
              {/* Forecast RealTime Price & Extremes */}
              {visiblePriceSeries.forecastRealTimePrice && (
                <>
                  <Line yAxisId="left" type="linear" dataKey="forecastRealTimePrice" name={activeScenario === 'negativePrice' ? '预测上网电价' : '预测实时电价'} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                  {activeScenario === 'standard' && (
                    <>
                      <Line yAxisId="left" type="monotone" dataKey="top5Price" name="高峰价(放电预警)" stroke="none" isAnimationActive={false} dot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} activeDot={false} />
                      <Line yAxisId="left" type="monotone" dataKey="bottom5Price" name="低谷价(充电预警)" stroke="none" isAnimationActive={false} dot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} activeDot={false} />
                    </>
                  )}
                </>
              )}

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


      </div>
    </div>
  );
};

export default AlgorithmPredictionPage;

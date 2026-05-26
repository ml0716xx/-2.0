import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Info,
  Sun,
  Moon,
  CloudSun,
  CloudRain,
  Eye,
  EyeOff,
  BrainCircuit,
  Clock,
  Calendar,
  Zap,
  TrendingUp,
  Activity,
} from "lucide-react";
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
  ReferenceArea,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface AlgorithmPredictionPage2Props {
  onNavigate?: (page: string) => void;
}

const generateChartData = (scenario: "standard" | "negativePrice") => {
  const data = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

      const isPeak = (h >= 8 && h <= 11) || (h >= 17 && h <= 20);
      const isValley =
        (h >= 0 && h <= 5) || (h >= 21 && h <= 23) || (h === 24 && m === 0);

      let baseLoad = 400 + Math.random() * 50;
      if (isPeak) baseLoad += 800 + Math.random() * 200;
      else if (!isValley) baseLoad += 400 + Math.random() * 100;

      if (h === 3) {
        baseLoad += 1000;
      }

      let pv = 0;
      if (h >= 6 && h <= 18) {
        pv =
          Math.sin(((h - 6) / 12) * Math.PI) * 1400 +
          (Math.random() - 0.5) * 100;
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
      let feedInPrice = realTimePrice - 0.05; // Feed-in tariff typically lower than market

      // Simulate negative grid price impact when PV is high (Duck curve / oversupply)
      if (pv > 1200) {
        feedInPrice -= (pv - 1200) / 500;
      }

      if (scenario === "negativePrice") {
        if (h >= 8 && h < 14) {
          dayAheadPrice = -0.05 + (Math.random() - 0.5) * 0.05;
          realTimePrice = -0.15 + (Math.random() - 0.5) * 0.08;
          feedInPrice = realTimePrice - 0.02; 
        } else if (h >= 14 && h < 18) {
          dayAheadPrice = 0.3 + (Math.random() - 0.5) * 0.05;
          realTimePrice = 0.4 + (Math.random() - 0.5) * 0.08;
          feedInPrice = realTimePrice - 0.05;
        }
      }

      const forecastDayAheadPrice =
        dayAheadPrice + (Math.random() - 0.5) * 0.02;
      const forecastRealTimePrice =
        realTimePrice + (Math.random() - 0.5) * 0.08;
      const forecastFeedInPrice = feedInPrice + (Math.random() - 0.5) * 0.03;

      let weatherType = "sun";
      if (h < 6 || h > 18) weatherType = "moon";
      else if (pv < 500 && h > 8 && h < 16) weatherType = "cloud-sun";

      data.push({
        time: timeStr,
        load: Math.round(baseLoad),
        pv: Math.round(pv),
        dayAheadPrice: parseFloat(dayAheadPrice.toFixed(2)),
        realTimePrice: parseFloat(realTimePrice.toFixed(2)),
        feedInPrice: parseFloat(feedInPrice.toFixed(2)),
        forecastDayAheadPrice: parseFloat(forecastDayAheadPrice.toFixed(2)),
        forecastRealTimePrice: parseFloat(forecastRealTimePrice.toFixed(2)),
        forecastFeedInPrice: parseFloat(forecastFeedInPrice.toFixed(2)),
        isNegative: realTimePrice < 0,
        weather: {
          type: weatherType,
          temp: `${Math.round(20 + h / 2)}°C`,
          desc: weatherType === "sun" ? "晴朗" : "多云",
        },
        isPeak,
        isValley,
      });
    }
  }
  return data;
};

const getWeatherIcon = (type: string) => {
  switch (type) {
    case "sun":
      return Sun;
    case "moon":
      return Moon;
    case "cloud-sun":
      return CloudSun;
    case "rain":
      return CloudRain;
    default:
      return Sun;
  }
};

const CustomXAxisTick = ({ x, y, payload, chartData }: any) => {
  const dataPoint = chartData.find((d: any) => d.time === payload.value);
  if (!dataPoint || !dataPoint.weather) return null;
  const WeatherIcon = getWeatherIcon(dataPoint.weather.type);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={15}
        textAnchor="middle"
        fill="#334155"
        fontSize={12}
        fontWeight="bold"
      >
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

const CustomDailyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const aiBess = payload.find((p: any) => p.dataKey === "aiBess")?.value || 0;
    const actualBess =
      payload.find((p: any) => p.dataKey === "actualBess")?.value || 0;
    const extra = Math.abs(aiBess) - Math.abs(actualBess);

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs z-50">
        <div className="font-bold text-slate-700 mb-2">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 mb-1"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-slate-600">{entry.name}</span>
            </div>
            <span className="font-bold" style={{ color: entry.color }}>
              {entry.value} {entry.name === "电价" ? "元/kWh" : "kW"}
            </span>
          </div>
        ))}
        {extra > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-purple-600 font-bold flex justify-between">
            <span>AI 建议多{aiBess > 0 ? "放" : "充"}:</span>
            <span>
              {extra} kW {actualBess === 0 ? "(时段优化)" : "(功率提升)"}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const dailyChartDataMap: Record<string, any[]> = {};
for (let i = 1; i <= 31; i++) {
  const dayStr = `${i}日`;
  const data = [];

  const baseCharge = -150 - (i % 3) * 30;
  const aiChargeBoost = -50 - (i % 4) * 20;
  const baseDischarge = 150 + (i % 3) * 30;
  const aiDischargeBoost = 50 + (i % 4) * 20;

  const actualChargeEnd = 3 + (i % 2);
  const actualDischargeStart1 = 8 + (i % 2);
  const actualDischargeStart2 = 18 + (i % 2);

  for (let h = 0; h < 24; h++) {
    const time = `${h.toString().padStart(2, "0")}:00`;
    let price = 0.6;
    if (h >= 0 && h < 6) price = 0.3;
    if (h >= 21 && h < 24) price = 0.3;
    if (h >= 8 && h < 11) price = 1.2;
    if (h >= 17 && h < 21) price = 1.2;

    let actualBess = 0;
    let aiBess = 0;

    if (h >= 0 && h < 6) {
      actualBess = h <= actualChargeEnd ? baseCharge : 0;
      aiBess = baseCharge + aiChargeBoost;
    } else if (h >= 8 && h < 11) {
      actualBess = h >= actualDischargeStart1 ? baseDischarge : 0;
      aiBess = baseDischarge + aiDischargeBoost;
    } else if (h >= 11 && h <= 14) {
      actualBess = 0;
      aiBess = i % 2 === 0 ? (h === 12 || h === 13 ? -150 : -50) : h === 12 ? -200 : 0;
    } else if (h >= 17 && h < 21) {
      actualBess = h >= actualDischargeStart2 ? baseDischarge : 0;
      aiBess = baseDischarge + aiDischargeBoost;
    } else if (h >= 21 && h < 24) {
      actualBess = baseCharge;
      aiBess = baseCharge + aiChargeBoost;
    }

    data.push({ time, price, actualBess, aiBess });
  }
  data.push({ ...data[23], time: "23:59" });
  dailyChartDataMap[dayStr] = data;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  hideAnnotations,
  scenario,
}: any) => {
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
              <span className="text-xs font-medium">
                {data.weather.desc} {data.weather.temp}
              </span>
            </div>
          )}
        </div>

        {payload.map((entry: any, index: number) => {
          if (
            [
              "bessEffect",
              "pvEffect",
              "overDemand",
              "reverseFlow",
              "originalIndex",
              "top5Price",
              "bottom5Price",
              "riskPointOverDemand",
              "riskPointReverseFlow",
            ].includes(entry.dataKey)
          )
            return null;

          if (
            scenario === "negativePrice" &&
            [
              "dayAheadPrice",
              "realTimePrice",
              "forecastDayAheadPrice",
            ].includes(entry.dataKey)
          )
            return null;

          let name = entry.name;
          if (scenario === "negativePrice") {
            if (entry.dataKey === "dayAheadPrice") name = "光伏日前电价";
            else if (entry.dataKey === "realTimePrice") name = "光伏实时电价";
            else if (entry.dataKey === "forecastDayAheadPrice")
              name = "预测光伏日前电价";
            else if (entry.dataKey === "forecastRealTimePrice")
              name = "预测实时电价";
            else if (entry.dataKey === "feedInPrice") name = "实时结算电价";
            else if (entry.dataKey === "forecastFeedInPrice") name = "预测上网电价";
          } else {
            if (entry.dataKey === "dayAheadPrice") name = "日前电价";
            else if (entry.dataKey === "realTimePrice") name = "实时电价";
            else if (entry.dataKey === "forecastDayAheadPrice")
              name = "预测日前电价";
            else if (entry.dataKey === "forecastRealTimePrice")
              name = "预测实时电价";
            else if (entry.dataKey === "feedInPrice") name = "上网电价";
            else if (entry.dataKey === "forecastFeedInPrice") name = "预测上网电价";
          }

          const isPrice = name.includes("电价");

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4 mb-1"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600">{name}</span>
              </div>
              <span className="font-bold text-slate-800">
                {entry.value} {isPrice ? "元/kWh" : "kW"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const AlgorithmPredictionPage2: React.FC<AlgorithmPredictionPage2Props> = ({
  onNavigate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [selectedDay, setSelectedDay] = useState<string | null>("6日");

  const getDailyLogs = (day: string) => {
    const dayNum = parseInt(day.replace("日", ""), 10) || 1;
    const baseCharge = -150 - (dayNum % 3) * 30;
    const aiChargeBoost = -50 - (dayNum % 4) * 20;
    const baseDischarge = 150 + (dayNum % 3) * 30;
    const aiDischargeBoost = 50 + (dayNum % 4) * 20;
    const actualChargeEnd = 3 + (dayNum % 2);
    const actualDischargeStart1 = 8 + (dayNum % 2);
    const actualDischargeStart2 = 18 + (dayNum % 2);

    const logs = [
      {
        time: "00:00 - 06:00",
        type: "峰谷套利",
        originalAction: `00:00 - 0${actualChargeEnd}:00 充电 ${Math.abs(baseCharge)}kW`,
        aiAction: `00:00 - 06:00 充电 ${Math.abs(baseCharge + aiChargeBoost)}kW`,
        aiImpact: `+¥${120 + (dayNum % 5) * 10}`,
        aiDiff: `延长充电并提升功率`,
        desc: "电价谷时段，执行储能充电",
      },
      {
        time: "08:00 - 11:00",
        type: "峰谷套利",
        originalAction: `0${actualDischargeStart1}:00 - 11:00 放电 ${Math.abs(baseDischarge)}kW`,
        aiAction: `08:00 - 11:00 放电 ${Math.abs(baseDischarge + aiDischargeBoost)}kW`,
        aiImpact: `+¥${150 + (dayNum % 4) * 15}`,
        aiDiff: `提前放电并提升功率`,
        desc: "早高峰高电价时段，执行储能放电",
      },
    ];

    if (dayNum % 2 === 0) {
      logs.push({
        time: "11:00 - 14:00",
        type: "全额消纳",
        originalAction: "无动作",
        aiAction: "智能匹配光伏余电充电",
        aiImpact: `+¥${80 + (dayNum % 3) * 15}`,
        aiDiff: "新增消纳动作",
        desc: "预测光伏大发，提前消纳防逆流",
      });
    }

    logs.push(
      {
        time: "17:00 - 21:00",
        type: "峰谷套利",
        originalAction: `${actualDischargeStart2}:00 - 21:00 放电 ${Math.abs(baseDischarge)}kW`,
        aiAction: `17:00 - 21:00 放电 ${Math.abs(baseDischarge + aiDischargeBoost)}kW`,
        aiImpact: `+¥${180 + (dayNum % 4) * 20}`,
        aiDiff: `提前放电并提升功率`,
        desc: "晚高峰高电价时段，执行储能放电",
      },
      {
        time: "21:00 - 24:00",
        type: "峰谷套利",
        originalAction: `21:00 - 24:00 充电 ${Math.abs(baseCharge)}kW`,
        aiAction: `21:00 - 24:00 充电 ${Math.abs(baseCharge + aiChargeBoost)}kW`,
        aiImpact: `+¥${50 + (dayNum % 2) * 10}`,
        aiDiff: `提升充电功率`,
        desc: "夜间谷时段，执行储能充电",
      },
    );

    return logs;
  };

  const [activeScenario, setActiveScenario] = useState<
    "standard" | "negativePrice"
  >("standard");
  const chartData = React.useMemo(
    () => generateChartData(activeScenario),
    [activeScenario],
  );

  const [visiblePriceSeries, setVisiblePriceSeries] = useState({
    dayAheadPrice: true,
    realTimePrice: true,
    forecastDayAheadPrice: true,
    forecastRealTimePrice: true,
    forecastFeedInPrice: true,
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

  const showAnnotations = true;
  const [hoveredTimeRange, setHoveredTimeRange] = useState<
    [string, string] | null
  >(null);

  const priceDataWithExtremes = React.useMemo(() => {
    const hourlyData = chartData.filter((d) => d.time.endsWith(":00"));

    const peakIndices = new Set();
    const valleyIndices = new Set();

    hourlyData.forEach((d, index) => {
      const h = parseInt(d.time.split(":")[0], 10);
      if ((h >= 8 && h <= 11) || (h >= 17 && h <= 20)) peakIndices.add(index);
      if ((h >= 0 && h <= 5) || (h >= 21 && h <= 23)) valleyIndices.add(index);
    });

    return hourlyData.map((d, index) => ({
      ...d,
      top5Price: peakIndices.has(index) ? d.forecastRealTimePrice : null,
      bottom5Price: valleyIndices.has(index) ? d.forecastRealTimePrice : null,
    }));
  }, [chartData]);

  const processedData = React.useMemo(() => {
    return chartData.map((d) => {
      let pvOriginal = d.pv;
      let pvAdjusted = pvOriginal;

      let originalNetLoadBase = visibleSeries.pv ? d.load - pvOriginal : d.load;

      let bessBase = 0;
      if (activeScenario === "negativePrice") {
        bessBase = 0;
      } else if (d.isValley) {
        bessBase = -300;
      } else if (d.isPeak) {
        bessBase = 300;
      }

      let bessAdjusted = bessBase;
      let reason = "";

      let netLoadBase = originalNetLoadBase;

      if (activeScenario === "negativePrice") {
        if (visibleSeries.bess) {
          const h = parseInt(d.time.split(":")[0]);

          if (d.forecastFeedInPrice < 0) {
            // Negative feed-in price: Maximize charging to absorb excess
            bessAdjusted = Math.min(-300, netLoadBase - 15);
            bessAdjusted = Math.max(bessAdjusted, -2500);
            reason = "上网负电价储能充电";

            // If even after max charging, we still have reverse flow (sending to grid), suppress PV
            const gridWithFullCharge = netLoadBase - bessAdjusted;
            if (gridWithFullCharge < 10 && visibleSeries.pv) {
              pvAdjusted = Math.max(0, d.load - bessAdjusted - 20);
              reason = "抑制光伏发电";
            }
          } else if (h >= 0 && h < 6) {
            bessAdjusted = -300;
            reason = "低价充电";
          } else if (h >= 17 && h < 21) {
            bessAdjusted = 300;
            reason = "高价放电";
          } else {
            bessAdjusted = 0;
            reason = "待机";
          }
        }
      } else {
        const riskReverse = netLoadBase - bessBase < 10;
        if (riskReverse && visibleSeries.bess) {
          bessAdjusted = netLoadBase - 10;
          bessAdjusted = Math.max(bessAdjusted, -2500);
          reason = "逆流化解";
        } else if (!visibleSeries.bess) {
          bessAdjusted = 0;
        }
      }

      const riskDemandCheck = netLoadBase - bessAdjusted > 1200;
      if (riskDemandCheck && visibleSeries.bess) {
        bessAdjusted = netLoadBase - 1200;
        bessAdjusted = Math.min(bessAdjusted, 2500);
        reason = activeScenario === "negativePrice" ? "防超容放电" : "超容化解";
      }

      if (!visibleSeries.bess) {
        bessAdjusted = 0;
        pvAdjusted = pvOriginal;
      }

      const finalNetLoad = visibleSeries.pv ? d.load - pvAdjusted : d.load;
      const displayedGrid = finalNetLoad - bessAdjusted;

      const originalGrid = originalNetLoadBase;
      const riskDemand = originalGrid > 1200;
      const riskReverse = originalGrid < 10;

      return {
        ...d,
        pv: pvAdjusted,
        pvOriginal: pvOriginal !== pvAdjusted ? pvOriginal : null,
        bess: bessAdjusted,
        bessPriceOnly: bessBase,
        gridWithoutBess: originalGrid,
        displayedGrid,
        reason,
        diff: bessAdjusted - bessBase,
        riskPointOverDemand: riskDemand ? originalGrid : null,
        riskPointReverseFlow:
          riskReverse && visibleSeries.pv ? originalGrid : null,
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
      besses: [processedData[0].bess],
    };

    for (let i = 1; i < processedData.length; i++) {
      const d = processedData[i];
      let merge = false;

      if (!visibleSeries.bess) {
        merge = true;
      } else {
        const dCat = d.bess > 0 ? "放电" : d.bess < 0 ? "充电" : "待机";
        const currentCat =
          currentBlock.besses[0] > 0
            ? "放电"
            : currentBlock.besses[0] < 0
              ? "充电"
              : "待机";
        merge =
          d.bessPriceOnly === currentBlock.bessPriceOnly &&
          dCat === currentCat &&
          d.reason === currentBlock.reason;
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
          besses: [d.bess],
        };
      }
    }
    blocks.push(currentBlock);

    const add15Min = (timeStr: string) => {
      if (!timeStr) return "24:00";
      const [h, m] = timeStr.split(":").map(Number);
      let newM = m + 15;
      let newH = h;
      if (newM >= 60) {
        newM -= 60;
        newH += 1;
      }
      if (newH >= 24) return "24:00";
      return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
    };

    return blocks.map((b) => {
      const end = add15Min(b.endTime);

      const absDiffs = b.diffs.map((diff: number) => Math.abs(diff));
      const maxAbsDiff = Math.max(...absDiffs);

      const minBess = Math.min(...b.besses);
      const maxBess = Math.max(...b.besses);

      let action = "待机";
      let isVariable = false;
      let absMin = 0;
      let absMax = 0;

      if (visibleSeries.bess) {
        if (minBess >= 0 && maxBess > 0) {
          action = "放电";
          absMin = minBess;
          absMax = maxBess;
        } else if (maxBess <= 0 && minBess < 0) {
          action = "充电";
          absMin = Math.abs(maxBess);
          absMax = Math.abs(minBess);
        } else if (minBess === 0 && maxBess === 0) {
          action = "待机";
        } else {
          action = "充放电切换";
        }
        isVariable = minBess !== maxBess;
      } else {
        action = "待机";
      }

      let type = "平段待机";
      let baseActionStr = "待机";

      if (visibleSeries.bess) {
        if (b.bessPriceOnly < 0) type = "低价谷时段";
        else if (b.bessPriceOnly > 0) type = "高价峰时段";
        if (b.reason) type = b.reason;

        if (b.bessPriceOnly < 0)
          baseActionStr = `充电 (${Math.abs(b.bessPriceOnly).toFixed(0)}kW)`;
        else if (b.bessPriceOnly > 0)
          baseActionStr = `放电 (${b.bessPriceOnly.toFixed(0)}kW)`;
      } else {
        type = "待机";
      }

      let finalAction = action;
      if (action !== "待机" && action !== "充放电切换") {
        finalAction = isVariable
          ? `${action} (${absMin.toFixed(0)}~${absMax.toFixed(0)}kW)`
          : `${action} (${absMin.toFixed(0)}kW)`;
      } else if (action === "充放电切换") {
        finalAction = `动态切换`;
      }

      let baseActionCat = "待机";
      if (visibleSeries.bess) {
        if (b.bessPriceOnly < 0) baseActionCat = "充电";
        else if (b.bessPriceOnly > 0) baseActionCat = "放电";
      }

      let tooltipAction = finalAction;

      let displayAction = finalAction;
      if (
        activeScenario === "negativePrice" &&
        visibleSeries.bess &&
        b.reason
      ) {
        displayAction = b.reason;
      }

      if (visibleSeries.bess && maxAbsDiff > 0) {
        tooltipAction = `${baseActionStr} ➔ ${finalAction}`;
      }
      if (
        activeScenario === "negativePrice" &&
        visibleSeries.bess &&
        b.reason
      ) {
        tooltipAction = b.reason;
      }

      let desc = "";
      if (visibleSeries.bess) {
        if (b.bessPriceOnly < 0) {
          if (
            b.startTime === "00:00" ||
            parseInt(b.startTime.split(":")[0]) < 6
          ) {
            desc =
              "处于电价谷时段，且预测后续无大功率放电需求，执行满充以备白天高峰使用。";
          } else if (parseInt(b.startTime.split(":")[0]) >= 21) {
            desc = "进入夜间电价谷时段，开始新一轮储能充电循环。";
          } else {
            desc =
              "处于电价谷时段，且预测后续无大功率放电需求，执行满充以备白天高峰使用。";
          }
        } else if (b.bessPriceOnly > 0) {
          desc =
            "处于电价峰时段，且已度过需量风险期，执行放电以获取最大化峰谷套利收益。";
        } else {
          if (
            parseInt(b.startTime.split(":")[0]) >= 15 &&
            parseInt(b.startTime.split(":")[0]) <= 17
          ) {
            desc = "电价平段，负荷与光伏处于平衡状态，无违约风险，保持待机。";
          } else {
            desc =
              "电价平段，且预测负荷平稳，无超需或逆流风险，保持待机以减少循环损耗。";
          }
        }

        if (b.reason === "超容化解" || b.reason === "防超容放电") {
          if (parseInt(b.startTime.split(":")[0]) >= 17) {
            desc =
              "预测傍晚出现第二次负荷高峰，电网功率再次超过超限阈值，触发需量控制放电。";
          } else {
            desc =
              "预测该时段厂区负荷突增，电网功率将超过 1200kW 的超限阈值，触发需量防超限放电。";
          }
        } else if (b.reason === "逆流化解") {
          desc =
            "预测光伏大发且厂区负荷较低，电网功率将低于 10kW 的逆流阈值，触发防逆流充电或降低光伏出力。";
        } else if (b.reason === "上网负电价储能充电") {
          desc =
            "电网进入上网负电价时段，触发防逆流充电以减少负电价损失并准备放电。";
        } else if (b.reason === "抑制光伏发电") {
          desc =
            "预测上网结算电价为负，且储能充电已满，为防止上网逆流导致经济损失，执行抑制光伏出力策略。";
        }
      } else {
        desc = "AI 控制未开启，储能处于待机状态。";
      }

      return {
        time: `${b.startTime} - ${end}`,
        startTime: b.startTime,
        endTime: end,
        type,
        action: displayAction,
        tooltipAction,
        colorAction: action,
        baseActionCat,
        finalActionCat: action,
        isChanged: visibleSeries.bess ? maxAbsDiff > 0 : false,
        desc,
      };
    });
  }, [processedData, visibleSeries.bess, visibleSeries.pv]);

  const baseStrategies = React.useMemo(() => {
    if (!processedData.length) return [];

    const blocks: any[] = [];
    let currentBlock = {
      startTime: processedData[0].time,
      endTime: processedData[0].time,
      bessPriceOnly: processedData[0].bessPriceOnly,
    };

    for (let i = 1; i < processedData.length; i++) {
      const d = processedData[i];
      const categoryMatch =
        (d.bessPriceOnly > 0 && currentBlock.bessPriceOnly > 0) ||
        (d.bessPriceOnly < 0 && currentBlock.bessPriceOnly < 0) ||
        (d.bessPriceOnly === 0 && currentBlock.bessPriceOnly === 0);

      if (categoryMatch) {
        currentBlock.endTime = d.time;
      } else {
        blocks.push({ ...currentBlock });
        currentBlock = {
          startTime: d.time,
          endTime: d.time,
          bessPriceOnly: d.bessPriceOnly,
        };
      }
    }
    blocks.push(currentBlock);

    const add15Min = (timeStr: string) => {
      if (!timeStr) return "24:00";
      const [h, m] = timeStr.split(":").map(Number);
      let newM = m + 15;
      let newH = h;
      if (newM >= 60) {
        newH++;
        newM -= 60;
      }
      if (newH === 24) return "24:00";
      return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
    };

    return blocks.map((b) => {
      const end = add15Min(b.endTime);
      let action = "待机";
      if (b.bessPriceOnly > 0) action = "放电";
      if (b.bessPriceOnly < 0) action = "充电";

      return {
        time: `${b.startTime} - ${end}`,
        startTime: b.startTime,
        endTime: end,
        action,
      };
    });
  }, [processedData]);

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
              算法推理 2
            </h1>
            <p className="text-sm text-slate-500 mb-4">
              基于历史负荷和气象数据的实时24小时预测（15分钟粒度）- 备份视图
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveScenario("standard")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeScenario === "standard" ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                标准运营场景
              </button>
              <button
                onClick={() => setActiveScenario("negativePrice")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeScenario === "negativePrice" ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                负电价场景
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-md px-3 py-1.5 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={`${selectedMonth}-${(selectedDay || "1日").replace("日", "").padStart(2, "0")}`}
                onChange={(e) => {
                  const newDate = e.target.value;
                  if (newDate) {
                    const [year, month, day] = newDate.split("-");
                    setSelectedMonth(`${year}-${month}`);
                    setSelectedDay(`${parseInt(day, 10)}日`);
                  }
                }}
                className="bg-transparent text-sm font-medium outline-none text-slate-700 w-32 cursor-pointer"
              />
            </div>
            <button
              onClick={() => onNavigate?.("策略运行报告")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
            >
              查看运行报告
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute top-[30px] bottom-[10px] left-[65px] right-[20px] pointer-events-none z-0 overflow-hidden rounded-md">
            {baseStrategies.map((strategy, idx) => {
              if (strategy.action === "待机") return null;

              const [startStr, endStr] = strategy.time.split(" - ");
              const getMins = (str: string) => {
                if (str === "24:00") return 24 * 60;
                const [h, m] = str.split(":").map(Number);
                return h * 60 + m;
              };

              const startMins = getMins(startStr);
              const endMins = getMins(endStr);
              const durationMins = endMins - startMins;

              const leftPercent = (startMins / (24 * 60)) * 100;
              const widthPercent = (durationMins / (24 * 60)) * 100;

              if (strategy.action === "充电") {
                return (
                  <div
                    key={idx}
                    className="absolute top-0 bottom-0 bg-[#10b981]/[0.05] border-x border-[#10b981]/20 pb-4"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  >
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[#10b981] text-[10px] font-bold opacity-70">
                      充电
                    </span>
                  </div>
                );
              } else if (strategy.action === "放电") {
                return (
                  <div
                    key={idx}
                    className="absolute top-0 bottom-0 bg-[#ef4444]/[0.05] border-x border-[#ef4444]/20 pb-4"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  >
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[#ef4444] text-[10px] font-bold opacity-70"
                    >
                      放电
                    </span>
                  </div>
                );
              }
              return null;
            })}

            {activeScenario === "negativePrice" && (
              <div className="absolute top-0 bottom-0 left-[33.333%] w-[25%] bg-[#0ea5e9]/[0.05] border-x border-[#0ea5e9]/20 pb-4">
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[#0ea5e9] text-[10px] font-bold opacity-70">
                  负电价
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start justify-end mt-2 mb-2 pr-[20px] relative z-10 w-full overflow-x-auto">
            <div className="flex items-center gap-4 flex-wrap justify-end">
              {activeScenario === "standard" && (
                <>
                  <div
                    className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${visiblePriceSeries.dayAheadPrice ? "opacity-100" : "opacity-40"}`}
                    onClick={() => togglePriceSeries("dayAheadPrice")}
                  >
                    <div className="w-3 h-1 bg-[#f59e0b]"></div>
                    <span className="text-[11px] font-bold text-slate-600">
                      日前电价
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${visiblePriceSeries.realTimePrice ? "opacity-100" : "opacity-40"}`}
                    onClick={() => togglePriceSeries("realTimePrice")}
                  >
                    <div className="w-3 h-1 bg-[#ef4444]"></div>
                    <span className="text-[11px] font-bold text-slate-600">
                      实时电价
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${visiblePriceSeries.forecastDayAheadPrice ? "opacity-100" : "opacity-40"}`}
                    onClick={() => togglePriceSeries("forecastDayAheadPrice")}
                  >
                    <div className="w-3 h-1 bg-[#10b981]"></div>
                    <span className="text-[11px] font-bold text-slate-600">
                      预测日前电价
                    </span>
                  </div>
                </>
              )}
              <div
                className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${visiblePriceSeries.forecastRealTimePrice ? "opacity-100" : "opacity-40"}`}
                onClick={() => togglePriceSeries("forecastRealTimePrice")}
              >
                <div className="w-3 h-1 bg-[#3b82f6]"></div>
                <span className="text-[11px] font-bold text-slate-600">
                  预测实时电价
                </span>
              </div>

              <div
                className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${visiblePriceSeries.forecastFeedInPrice ? "opacity-100" : "opacity-40"}`}
                onClick={() => togglePriceSeries("forecastFeedInPrice")}
              >
                <div className="w-3 h-1 bg-cyan-500"></div>
                <span className="text-[11px] font-bold text-slate-600">
                  预测上网电价
                </span>
              </div>

              <div className="w-px h-3 bg-slate-200 mx-1"></div>

              <div className="flex items-center gap-1.5 cursor-pointer transition-opacity opacity-100">
                <div className="w-3 h-1 bg-violet-500"></div>
                <span className="text-[11px] font-bold text-slate-800">
                  负荷
                </span>
              </div>

              <div
                className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${visibleSeries.grid ? "opacity-100" : "opacity-40"}`}
                onClick={() => toggleSeries("grid")}
              >
                <div className="w-3 h-1 bg-slate-900 border-b border-slate-400"></div>
                <span className="text-[11px] font-bold text-slate-800">
                  电网功率
                </span>
              </div>

              <button
                onClick={() => toggleSeries("pv")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-colors ml-1 ${
                  visibleSeries.pv
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                光伏效果
              </button>

              <button
                onClick={() => toggleSeries("bess")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-colors ml-1 ${
                  visibleSeries.bess
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                AI调度效果
              </button>

              <button
                onClick={() => {
                  setVisibleSeries({
                    load: false,
                    pv: false,
                    bess: false,
                    grid: true,
                  });
                  setVisiblePriceSeries({
                    dayAheadPrice: true,
                    realTimePrice: true,
                    forecastDayAheadPrice: true,
                    forecastRealTimePrice: true,
                    forecastFeedInPrice: true,
                  });
                }}
                className="px-2.5 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-[10px] font-bold shadow-sm ml-1"
              >
                重置
              </button>
            </div>
          </div>

          <div className="h-[180px] w-full mb-6 relative z-10">
            <div className="absolute left-[5px] top-0 bottom-[30px] w-[20px] flex items-center justify-center pointer-events-none text-center">
              <h3
                className="text-xs font-bold text-slate-500 tracking-widest whitespace-nowrap"
                style={{ writingMode: "vertical-rl" }}
              >
                {activeScenario === "negativePrice"
                  ? "上网电价预测"
                  : "电价走势预测"}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={priceDataWithExtremes}
                margin={{ top: 45, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#cbd5e1"
                />

                <XAxis
                  dataKey="time"
                  axisLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  tickLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  tick={{ fill: "#334155", fontSize: 12, fontWeight: "bold" }}
                  ticks={[
                    "00:00",
                    "04:00",
                    "08:00",
                    "12:00",
                    "16:00",
                    "20:00",
                    "23:00",
                  ]}
                  height={30}
                />

                <YAxis
                  yAxisId="left"
                  width={45}
                  axisLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  tickLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  tick={{ fill: "#475569", fontSize: 12, fontWeight: "bold" }}
                  domain={
                    activeScenario === "negativePrice" ? [-0.5, 1.5] : [0, 1.5]
                  }
                  ticks={
                    activeScenario === "negativePrice"
                      ? [-0.5, 0, 0.5, 1.0, 1.5]
                      : [0, 0.5, 1.0, 1.5]
                  }
                  tickFormatter={(val) => val.toFixed(1)}
                  label={{
                    value: "电价：元/kWh",
                    position: "top",
                    offset: 25,
                    fill: "#475569",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                  dx={-5}
                />

                <Tooltip
                  content={
                    <CustomTooltip hideAnnotations scenario={activeScenario} />
                  }
                />

                {activeScenario === "standard" &&
                  visiblePriceSeries.dayAheadPrice && (
                    <Line
                      yAxisId="left"
                      type="linear"
                      dataKey="dayAheadPrice"
                      name="日前电价"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                {activeScenario === "standard" &&
                  visiblePriceSeries.realTimePrice && (
                    <Line
                      yAxisId="left"
                      type="linear"
                      dataKey="realTimePrice"
                      name="实时电价"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                {activeScenario === "standard" &&
                  visiblePriceSeries.forecastDayAheadPrice && (
                    <Line
                      yAxisId="left"
                      type="linear"
                      dataKey="forecastDayAheadPrice"
                      name="预测日前电价"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}

                {visiblePriceSeries.forecastRealTimePrice && (
                  <>
                    <Line
                      yAxisId="left"
                      type="linear"
                      dataKey="forecastRealTimePrice"
                      name={
                        activeScenario === "negativePrice"
                          ? "预测上网电价"
                          : "预测实时电价"
                      }
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={false}
                    />
                    {activeScenario === "standard" && (
                      <>
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="top5Price"
                          name="高峰价(放电预警)"
                          stroke="none"
                          isAnimationActive={false}
                          dot={{
                            r: 5,
                            fill: "#ef4444",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                          activeDot={false}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="bottom5Price"
                          name="低谷价(充电预警)"
                          stroke="none"
                          isAnimationActive={false}
                          dot={{
                            r: 5,
                            fill: "#10b981",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                          activeDot={false}
                        />
                      </>
                    )}
                  </>
                )}

                {visiblePriceSeries.forecastFeedInPrice && (
                  <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="forecastFeedInPrice"
                    name="预测上网电价"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}

                {activeScenario === "negativePrice" && (
                  <ReferenceArea
                    yAxisId="left"
                    y1={-0.6}
                    y2={0}
                    // @ts-expect-error - fill value
                    fill="#ef4444"
                    fillOpacity={0.08}
                    stroke="none"
                    label={{
                      position: "insideBottomRight",
                      value: "负电价亏损区",
                      fill: "#ef4444",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                )}
                {activeScenario === "negativePrice" && (
                  <ReferenceLine
                    yAxisId="left"
                    y={0}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{
                      position: "right",
                      value: "零电价线",
                      fill: "#ef4444",
                      fontSize: 10,
                    }}
                  />
                )}

                {hoveredTimeRange && (
                  <ReferenceArea
                    yAxisId="left"
                    x1={hoveredTimeRange[0]}
                    x2={hoveredTimeRange[1]}
                    // @ts-expect-error - fill value
                    fill="#8b5cf6"
                    fillOpacity={0.15}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div
            className="mt-1 mb-2 pb-1 relative z-10"
            style={{ paddingLeft: "65px", paddingRight: "20px" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-bold text-slate-800">建议策略排程</h3>
            </div>
            <div className="h-8 w-full flex rounded-lg overflow-hidden border border-slate-200 shadow-sm relative">
              {baseStrategies.map((strategy, idx) => {
                const [startStr, endStr] = strategy.time.split(" - ");

                const getMins = (str: string) => {
                  if (str === "24:00") return 24 * 60;
                  const [h, m] = str.split(":").map(Number);
                  return h * 60 + m;
                };

                const startMins = getMins(startStr);
                const endMins = getMins(endStr);
                const durationMins = endMins - startMins;
                const widthRatio = (durationMins / (24 * 60)) * 100;

                let bgColor = "bg-slate-100 hover:bg-slate-200";
                let textColor = "text-slate-600";
                let borderClass = "border-r border-white/30 last:border-0";

                if (strategy.action === "充电") {
                  bgColor = "bg-emerald-400 hover:bg-emerald-500";
                  textColor = "text-white";
                } else if (strategy.action === "放电") {
                  bgColor = "bg-rose-400 hover:bg-rose-500";
                  textColor = "text-white";
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: idx * 0.05,
                    }}
                    key={idx}
                    style={{ width: `${widthRatio}%` }}
                    className={`${bgColor} ${borderClass} h-full flex flex-col items-center justify-center relative group transition-colors`}
                  >
                    <span
                      className={`text-[10px] font-bold ${textColor} drop-shadow-sm truncate px-1 max-w-full text-center overflow-hidden`}
                    >
                      {strategy.action}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="w-full mt-1 flex justify-end pr-[20px] relative z-10">
            {visibleSeries.bess && (
              <div className="flex items-center gap-2 opacity-60">
                <div className="w-4 h-0 border-t-2 border-dashed border-slate-500"></div>
                <span className="text-xs font-bold text-slate-500">
                  调整前电网功率
                </span>
              </div>
            )}
          </div>

          <div className="h-[280px] w-full mt-1 relative z-10">
            <div className="absolute left-[5px] top-0 bottom-[60px] w-[20px] flex items-center justify-center pointer-events-none text-center">
              <h3
                className="text-xs font-bold text-slate-500 tracking-widest whitespace-nowrap"
                style={{ writingMode: "vertical-rl" }}
              >
                功率曲线预测
              </h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={processedData}
                margin={{ top: 45, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#cbd5e1"
                />

                <XAxis
                  dataKey="time"
                  axisLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  tickLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  tick={<CustomXAxisTick chartData={chartData} />}
                  ticks={[
                    "00:00",
                    "04:00",
                    "08:00",
                    "12:00",
                    "16:00",
                    "20:00",
                    "23:45",
                  ]}
                  height={60}
                />

                <YAxis
                  yAxisId="left"
                  axisLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  tickLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  tick={{ fill: "#334155", fontSize: 12, fontWeight: "bold" }}
                  domain={[-1000, 2000]}
                  ticks={[-1000, -500, 0, 500, 1000, 1500, 2000]}
                  label={{
                    value: "功率：kW",
                    position: "top",
                    offset: 25,
                    fill: "#334155",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                  dx={-10}
                />

                <Tooltip
                  content={<CustomTooltip scenario={activeScenario} />}
                />

                <Line
                  yAxisId="left"
                  type="linear"
                  dataKey="load"
                  name="负荷"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />

                {visibleSeries.bess && visibleSeries.grid && (
                  <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="gridWithoutBess"
                    name="调整前电网功率"
                    stroke="#64748b"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}

                {visibleSeries.grid && (
                  <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="displayedGrid"
                    name={visibleSeries.bess ? "调整后电网功率" : "电网功率"}
                    stroke={visibleSeries.bess ? "#020617" : "#64748b"}
                    strokeWidth={visibleSeries.bess ? 3 : 2}
                    dot={false}
                  />
                )}

                {visibleSeries.grid && showAnnotations && (
                  <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="riskPointOverDemand"
                    name="超容风险"
                    stroke="none"
                    dot={{
                      r: 5,
                      fill: "#ef4444",
                      stroke: "#fff",
                      strokeWidth: 1.5,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#ef4444",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    connectNulls={false}
                  />
                )}
                {visibleSeries.grid && showAnnotations && (
                  <Line
                    yAxisId="left"
                    type="linear"
                    dataKey="riskPointReverseFlow"
                    name="逆流风险"
                    stroke="none"
                    dot={{
                      r: 5,
                      fill: "#f97316",
                      stroke: "#fff",
                      strokeWidth: 1.5,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#f97316",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    connectNulls={false}
                  />
                )}

                <ReferenceLine
                  yAxisId="left"
                  y={1200}
                  stroke="#94a3b8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  label={{
                    position: "insideTopLeft",
                    value: "超容阈值 1200kW",
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  yAxisId="left"
                  y={10}
                  stroke="#94a3b8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  label={{
                    position: "insideBottomLeft",
                    value: "逆流阈值 10kW",
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                />

                {hoveredTimeRange && (
                  <ReferenceArea
                    yAxisId="left"
                    x1={hoveredTimeRange[0]}
                    x2={hoveredTimeRange[1]}
                    // @ts-expect-error - fill value
                    fill="#8b5cf6"
                    fillOpacity={0.15}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div
            className="mt-1 mb-2 pb-2 relative z-10"
            style={{ paddingLeft: "65px", paddingRight: "20px" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-bold text-slate-800">AI建议策略</h3>
            </div>
            <div className="h-8 w-full flex rounded-lg overflow-hidden border border-slate-200 shadow-sm relative">
              {generatedStrategies.map((strategy, idx) => {
                const [startStr, endStr] = strategy.time.split(" - ");

                const getMins = (str: string) => {
                  if (str === "24:00") return 24 * 60;
                  const [h, m] = str.split(":").map(Number);
                  return h * 60 + m;
                };

                const startMins = getMins(startStr);
                const endMins = getMins(endStr);
                const durationMins = endMins - startMins;
                const widthRatio = (durationMins / (24 * 60)) * 100;

                let bgColor = "bg-slate-100 hover:bg-slate-200";
                let textColor = "text-slate-600";
                let borderClass = "border-r border-white/30 last:border-0";

                const isCharge =
                  strategy.finalActionCat &&
                  strategy.finalActionCat.includes("充电");
                const isDischarge =
                  strategy.finalActionCat &&
                  strategy.finalActionCat.includes("放电");
                const isSuppressPV =
                  strategy.action && strategy.action.includes("抑制光伏发电");

                if (isCharge) {
                  bgColor = "bg-emerald-400 hover:bg-emerald-500";
                  textColor = "text-white";
                } else if (isDischarge) {
                  bgColor = "bg-rose-400 hover:bg-rose-500";
                  textColor = "text-white";
                } else if (isSuppressPV) {
                  bgColor = "bg-orange-400 hover:bg-orange-500";
                  textColor = "text-white";
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: idx * 0.05,
                    }}
                    key={idx}
                    style={{ width: `${widthRatio}%` }}
                    className={`${bgColor} ${borderClass} h-full flex flex-col items-center justify-center relative group cursor-pointer transition-colors`}
                    onMouseEnter={() =>
                      setHoveredTimeRange([
                        startStr,
                        endStr === "24:00" ? "23:45" : endStr,
                      ])
                    }
                    onMouseLeave={() => setHoveredTimeRange(null)}
                  >
                    <span
                      className={`text-[10px] font-bold ${textColor} drop-shadow-sm truncate px-1 max-w-full text-center overflow-hidden`}
                    >
                      {strategy.action}
                    </span>

                    <div className="absolute top-[-54px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none z-20 transition-opacity whitespace-nowrap shadow-xl">
                      <div className="font-bold mb-0.5 text-blue-200">
                        {strategy.time}
                      </div>
                      <div className="font-medium text-slate-100">
                        {strategy.tooltipAction} · {strategy.type}
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-8 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            <h3 className="font-black text-slate-800 text-lg">
              Ai建议策略明细
            </h3>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-4 w-[15%] whitespace-nowrap">
                    执行时间
                  </th>
                  <th className="px-6 py-4 w-[15%] whitespace-nowrap">
                    策略类型
                  </th>
                  <th className="px-6 py-4 w-[15%] whitespace-nowrap">
                    建议动作
                  </th>
                  <th className="px-6 py-4 w-[55%]">触发原因/描述</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {generatedStrategies.map((s, i) => {
                  let typePill = (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-bold border border-slate-200">
                      平段待机
                    </span>
                  );
                  if (
                    s.type.includes("低价") ||
                    s.type.includes("高价") ||
                    s.type.includes("低谷") ||
                    s.type.includes("高峰") ||
                    s.type.includes("充电") ||
                    s.type.includes("套利")
                  ) {
                    typePill = (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[11px] font-bold border border-blue-100">
                        峰谷套利
                      </span>
                    );
                  } else if (s.type.includes("超容")) {
                    typePill = (
                      <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-[11px] font-bold border border-rose-100">
                        需量控制
                      </span>
                    );
                  } else if (
                    s.type.includes("逆流") ||
                    s.type.includes("负电价") ||
                    s.type.includes("抑制光伏")
                  ) {
                    typePill = (
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-[11px] font-bold border border-orange-100">
                        防逆流
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors"
                      onMouseEnter={() =>
                        setHoveredTimeRange([
                          s.startTime,
                          s.endTime === "24:00" ? "23:45" : s.endTime,
                        ])
                      }
                      onMouseLeave={() => setHoveredTimeRange(null)}
                    >
                      <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">
                        {s.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {visibleSeries.bess ? (
                          typePill
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-bold border border-slate-200">
                            平段待机
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {visibleSeries.bess ? s.action : "待机"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 leading-relaxed text-xs">
                        {s.desc}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Daily Strategy Details Row - Merged from StrategyReportPage */}
      {selectedDay && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col mt-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800">
                每日策略运行详情
              </h2>
              <div className="ml-2 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-md border border-indigo-100">
                {selectedMonth}-{selectedDay.replace("日", "").padStart(2, "0")}
              </div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-sm text-slate-400 hover:text-slate-600 font-medium"
            >
              关闭
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              策略运行监控图表 (实际对比)
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyChartDataMap[selectedDay || "1日"]}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <pattern
                      id="aiPattern"
                      patternUnits="userSpaceOnUse"
                      width="6"
                      height="6"
                    >
                      <path
                        d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2"
                        stroke="#8b5cf6"
                        strokeWidth="1.5"
                        opacity="0.4"
                      />
                    </pattern>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    ticks={[
                      "00:00",
                      "04:00",
                      "08:00",
                      "12:00",
                      "16:00",
                      "20:00",
                      "23:59",
                    ]}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    domain={[-400, 400]}
                    ticks={[-400, -200, 0, 200, 400]}
                    label={{
                      value: "功率(kW)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#64748b",
                      fontSize: 10,
                      offset: 10,
                    }}
                    width={45}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    domain={[0, 1.5]}
                    ticks={[0, 0.5, 1.0, 1.5]}
                    label={{
                      value: "电价(元)",
                      angle: 90,
                      position: "insideRight",
                      fill: "#64748b",
                      fontSize: 10,
                      offset: 10,
                    }}
                    width={40}
                  />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />

                  <Area
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="aiBess"
                    name="AI 策略储能功率"
                    fill="url(#aiPattern)"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />

                  <Area
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="actualBess"
                    name="传统模式"
                    fill="#3b82f6"
                    fillOpacity={0.8}
                    stroke="#2563eb"
                    strokeWidth={2}
                  />

                  <Line
                    yAxisId="right"
                    type="stepAfter"
                    dataKey="price"
                    name="电价"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-2">
              <div className="text-[10px] text-slate-500 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #8b5cf6 0, #8b5cf6 1px, transparent 1px, transparent 4px)",
                    opacity: 0.6,
                  }}
                ></div>
                <span>
                  阴影部分为 AI
                  建议可多充/多放的优化空间（含功率提升与时段优化）
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              综合策略运行与 AI 优化日志
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="p-3 font-bold text-slate-500 text-xs rounded-tl-lg w-32">
                    执行时间
                  </th>
                  <th className="p-3 font-bold text-slate-500 text-xs w-24">
                    策略类型
                  </th>
                  <th className="p-3 font-bold text-slate-500 text-xs w-48">
                    传统模式
                  </th>
                  <th className="p-3 font-bold text-purple-600 text-xs bg-purple-50/50 w-48">
                    AI 策略动作
                  </th>
                  <th className="p-3 font-bold text-emerald-600 text-xs w-32">
                    优化效果预估
                  </th>
                  <th className="p-3 font-bold text-slate-500 text-xs rounded-tr-lg">
                    触发原因/描述
                  </th>
                </tr>
              </thead>
              <tbody>
                {getDailyLogs(selectedDay).map((log, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-3 text-xs font-medium text-slate-700">
                      {log.time}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.type === "峰谷套利"
                            ? "bg-blue-50 text-blue-600"
                            : log.type === "需量控制"
                              ? "bg-red-50 text-red-600"
                              : log.type === "全额消纳"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      {log.originalAction}
                    </td>
                    <td
                      className={`p-3 text-xs font-medium ${log.aiImpact !== "-" ? "text-purple-700 bg-purple-50/30" : "text-slate-500"}`}
                    >
                      {log.aiAction}
                    </td>
                    <td
                      className={`p-3 text-xs font-bold ${log.aiImpact !== "-" ? "text-emerald-600" : "text-slate-400 font-normal"}`}
                    >
                      <div className="flex flex-col">
                        <span>{log.aiImpact}</span>
                        {log.aiImpact !== "-" && (
                          <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {log.aiDiff}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-slate-500">{log.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmPredictionPage2;

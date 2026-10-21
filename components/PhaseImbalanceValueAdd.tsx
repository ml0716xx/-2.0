/* ==========================================================================
   三相不平衡治理（增值服务）· 经营分析报告展示组件
   --------------------------------------------------------------------------
   PRD 3.2 的三个输出字段落在这里：
     · 当月累计释放电量（kWh）
     · 当月累计节约电费（元）
     · 治理前后阈值与最大释放裕量（这两个不报出来，前两个数字就没有参照）

   为什么单独做成组件：经营分析报告的「增值服务」tab 以后还会有别的增值服务，
   每一个都按「小结 + 明细图 + 口径」三段来做，加一个就多挂一个组件，
   不往主页面里堆代码。
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Info, Zap, TrendingDown } from 'lucide-react';
import {
  phaseMonth,
  phaseMonthDaily,
  PHASE_COLOR,
  readPhaseConfig,
  subscribePhaseConfig,
  phaseReleaseMax,
  type PhaseConfig,
} from './phaseImbalanceData';

const tooltipStyle = {
  fontSize: 11,
  borderRadius: 8,
  border: '1px solid #EAEDF2',
  boxShadow: '0 4px 12px rgba(26,42,58,0.08)',
};

const PhaseImbalanceValueAdd: React.FC = () => {
  const [cfg, setCfg] = useState<PhaseConfig>(readPhaseConfig);
  useEffect(() => subscribePhaseConfig(() => setCfg(readPhaseConfig())), []);

  const release = phaseReleaseMax(cfg);

  /* 月度数据按「最后保存的治理前阈值」现算，不在文件里写死 */
  const month = phaseMonth(release);
  const daily = phaseMonthDaily(release);

  /* 未启用：给空态，不整段删掉 —— 否则客户不知道还有这个能力 */
  if (!cfg.on) {
    return (
      <div className="rounded-xl border border-[#EAEDF2] bg-white px-5 py-8 flex flex-col items-center gap-2">
        <div className="w-11 h-11 rounded-2xl bg-[#F4F6F9] flex items-center justify-center">
          <Zap size={19} className="text-[#B6C1CC]" />
        </div>
        <div className="text-[12px] font-bold text-[#8A98A6]">三相不平衡治理未启用</div>
        <div className="text-[11px] text-[#9AA7B4] text-center leading-relaxed">
          启用后储能按三相独立出力，压降防逆流边界。开关在「策略配置 · 增值服务」。
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 小结头：四个数，只说结论 */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#3B1F3F] via-[#4A2545] to-[#17705A] text-white px-6 py-5">
        <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-fuchsia-400/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] text-[#F0C4E8] font-bold">
            <Zap size={13} />
            三相不平衡治理 · 本月边界收益
          </div>

          <div className="mt-2.5 flex items-end gap-x-8 gap-y-3 flex-wrap">
            <div>
              <div className="text-[10px] text-white/60">当月累计节约电费</div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-[30px] font-black font-mono leading-none tracking-tight">
                  ¥{month.totalSaving.toLocaleString()}
                </span>
                <span className="text-[11px] text-white/60">元</span>
              </div>
            </div>

            <div className="pb-1">
              <div className="text-[10px] text-white/60">当月累计释放电量</div>
              <div className="mt-0.5 text-[17px] font-black font-mono leading-none">
                {month.totalEnergy.toFixed(0)}
                <span className="text-[10px] font-normal text-white/60 ml-1">kWh</span>
              </div>
            </div>

            <div className="pb-1">
              <div className="text-[10px] text-white/60">释放功率裕量</div>
              <div className="mt-0.5 text-[17px] font-black font-mono leading-none">
                {release.toFixed(0)}
                <span className="text-[10px] font-normal text-white/60 ml-1">kW</span>
              </div>
            </div>

            <div className="pb-1">
              <div className="text-[10px] text-white/60">有效治理</div>
              <div className="mt-0.5 text-[17px] font-black font-mono leading-none">
                {month.activeDays}
                <span className="text-[10px] font-normal text-white/60 ml-1">天</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-white/70">
            <span>
              防逆流阈值 <span className="font-bold text-white">{cfg.baseline} kW</span>
              <span className="text-[#F0C4E8] mx-1">→</span>
              <span className="font-bold text-white">{cfg.current} kW</span>
            </span>
            <span>
              平均不平衡度 <span className="font-bold text-white">{month.avgUbBefore}%</span>
              <span className="text-[#9DECD3] mx-1">→</span>
              <span className="font-bold text-white">{month.avgUbAfter}%</span>
            </span>
            <span>
              累计治理时长 <span className="font-bold text-white">{month.totalHours.toFixed(0)} h</span>
            </span>
          </div>
        </div>
      </div>

      {/* 逐日明细 */}
      <div className="bg-white rounded-xl border border-[#EAEDF2] p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[13px] font-bold text-[#1A2A3A]">逐日释放电量 & 节约电费</h3>
          <span className="text-[11px] text-[#93A1B0]">单位：kWh / 元</span>
        </div>
        <div style={{ height: 230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#93A1B0' }}
                axisLine={{ stroke: '#EAEDF2' }}
                tickLine={false}
                interval={2}
              />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#93A1B0' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="r"
                orientation="right"
                tick={{ fontSize: 10, fill: '#93A1B0' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                yAxisId="l"
                dataKey="energy"
                name="释放电量"
                fill="#E9D5F5"
                radius={[3, 3, 0, 0]}
              />
              <Line
                yAxisId="r"
                type="monotone"
                dataKey="saving"
                name="节约电费"
                stroke={PHASE_COLOR.ub}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-[#7F8C8D] leading-relaxed mt-2 pt-2 border-t border-[#F1F4F7]">
          <span className="font-bold text-[#5A6B7C]">分析：</span>
          收益不是每天都一样。阴天光伏出力不足、储能不动，防逆流边界碰不到，当天就没有额外收益 ——
          全月 30 天里真正吃到裕量的只有 {month.activeDays} 天，其余接近 0。
        </p>
      </div>

      {/* 口径 */}
      <div className="flex items-start gap-2 rounded-xl bg-white border border-[#EAEDF2] px-4 py-3">
        <Info size={13} className="text-[#93A1B0] mt-0.5 shrink-0" />
        <p className="text-[11px] text-[#7F8C8D] leading-relaxed">
          <span className="font-bold text-[#5A6B7C]">口径说明：</span>
          以 1 分钟为统计周期，仅在储能充放电、且关口总下网功率低于治理前阈值时核算收益。
          单周期节省功率 = min(治理前阈值 − 关口总下网功率, 最大释放裕量)，节省电量 = 节省功率 × 1/60 h，
          再按该分钟分时电价折算电费，全月逐分钟累加。治理前阈值取本页保存的数值，当前阈值取「公共配置 · 逆流参数」，
          改完阈值从下一个核算周期起生效。
        </p>
      </div>
    </div>
  );
};

export default PhaseImbalanceValueAdd;

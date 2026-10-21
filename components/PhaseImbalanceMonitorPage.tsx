/* ==========================================================================
   监控中心 · 系统监控 · 三相不平衡监控
   --------------------------------------------------------------------------
   PRD 3.1 的还原。一屏两件事：

     1 现在平不平   —— 关口 A/B/C 三相有功 + 储能 A/B/C 相出力，看治理有没有在动
     2 治理值多少   —— 品红粗线是不平衡度（右轴），灰虚线是「不治理会是多少」，
                       两条线之间的差，就是这套增值服务每天在干的事

   为什么把反事实画出来：客户看不到「不治理」的对照，就只能看到几条曲线在动，
   感受不到钱。灰虚线一放，差距自己会说话。

   曲线上 1440 个点（分钟级），所以全部关掉动画、不画端点。
   ========================================================================== */

import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ChevronLeft, ChevronRight, Info, Activity, TrendingDown, BatteryCharging, Sparkles } from 'lucide-react';

import {
  buildPhaseDay,
  summarizePhaseDay,
  readPhaseConfig,
  subscribePhaseConfig,
  phaseReleaseMax,
  PHASE_COLOR,
  phaseMonth,
  type PhasePoint,
} from './phaseImbalanceData';

/** 图例：分组展示，跟策略监控保持同一套视觉 */
const LegendGroup = ({
  title,
  items,
}: {
  title?: string;
  items: { color: string; label: string; dash?: boolean }[];
}) => (
  <div className="flex items-center gap-2.5">
    {title && <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{title}</span>}
    {items.map((it) => (
      <span key={it.label} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
        <span
          className="w-4 h-0.5 rounded-full"
          style={{
            background: it.dash
              ? `repeating-linear-gradient(90deg, ${it.color} 0 4px, transparent 4px 7px)`
              : it.color,
          }}
        />
        {it.label}
      </span>
    ))}
  </div>
);

/** 悬停提示 */
const PhaseTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const p: PhasePoint = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 min-w-[190px]">
      <div className="text-[11px] font-mono font-bold text-slate-500 mb-1.5">{p.t}</div>
      <div className="space-y-1">
        {[
          { label: 'A 相', grid: p.gridA, ess: p.essA, color: PHASE_COLOR.a },
          { label: 'B 相', grid: p.gridB, ess: p.essB, color: PHASE_COLOR.b },
          { label: 'C 相', grid: p.gridC, ess: p.essC, color: PHASE_COLOR.c },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="font-mono font-bold text-slate-800">
              {r.grid.toFixed(1)}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">kW</span>
              <span className="text-[10px] font-normal text-slate-400 ml-1.5">
                / 储能 {r.ess.toFixed(1)}
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 font-bold text-fuchsia-600">
            <span className="w-2 h-2 rounded-full" style={{ background: PHASE_COLOR.ub }} />
            不平衡度
          </span>
          <span className="font-mono font-bold text-fuchsia-600">{p.ub.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-400 pl-3.5">不治理</span>
          <span className="font-mono font-bold text-slate-400">{p.ubBefore.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

/** 指标卡 */
const MetricCard = ({
  label,
  value,
  unit,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  hint: string;
  icon: React.ReactNode;
  tone: string;
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3.5">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-slate-400">{label}</span>
      <span
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${tone}14`, color: tone }}
      >
        {icon}
      </span>
    </div>
    <div className="mt-2 flex items-baseline gap-1">
      <span className="text-[24px] font-black font-mono leading-none" style={{ color: tone }}>
        {value}
      </span>
      <span className="text-[11px] font-bold text-slate-400">{unit}</span>
    </div>
    <div className="text-[10px] text-slate-400 mt-1.5">{hint}</div>
  </div>
);

const PhaseImbalanceMonitorPage: React.FC = () => {
  const [date, setDate] = useState('2026-10-08');
  const [cfg, setCfg] = useState(readPhaseConfig);

  React.useEffect(() => subscribePhaseConfig(() => setCfg(readPhaseConfig())), []);

  const points = useMemo(() => buildPhaseDay(date), [date]);
  const releaseMax = phaseReleaseMax(cfg);
  const s = useMemo(() => summarizePhaseDay(points, releaseMax), [points, releaseMax]);
  const month = useMemo(() => phaseMonth(releaseMax), [releaseMax]);
  const axisTicks = [0, 120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1439];

  const shiftDate = (delta: number) => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-4">
      {/* 顶部：标题 + 日期 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-black text-slate-800 tracking-tight">三相不平衡监控</h2>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">
            增值服务
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            关口三相功率、储能各相出力与不平衡度（分钟级）
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-0.5">
          <button onClick={() => shiftDate(-1)} className="p-1 text-slate-400 hover:text-slate-600">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-1.5 font-mono">{date}</span>
          <button onClick={() => shiftDate(1)} className="p-1 text-slate-400 hover:text-slate-600">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 服务未启用：不隐藏页面，否则这个能力没人发现 */}
      {!cfg.on ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-14 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Activity size={22} className="text-slate-300" />
          </div>
          <div className="text-sm font-bold text-slate-500">三相不平衡治理未启用</div>
          <div className="text-[11px] text-slate-400 text-center leading-relaxed max-w-sm">
            未启用时储能按总功率均分到三相，不做相间补偿，此处无监测数据。
            <br />
            可在「策略配置 · 增值服务」中开启。
          </div>
        </div>
      ) : (
        <>
          {/* 四张指标卡 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="治理时段峰值不平衡度"
              value={s.ubMax.toFixed(1)}
              unit="%"
              hint={`不治理时峰值 ${s.ubBeforeMax.toFixed(1)}%`}
              icon={<Activity size={13} />}
              tone="#D946EF"
            />
            <MetricCard
              label="治理时段平均不平衡度"
              value={s.ubAvg.toFixed(1)}
              unit="%"
              hint={`不治理时 ${s.ubBeforeAvg.toFixed(1)}%，下降 ${(s.ubBeforeAvg - s.ubAvg).toFixed(1)} pct`}
              icon={<TrendingDown size={13} />}
              tone="#10B981"
            />
            <MetricCard
              label="治理时长"
              value={s.governHours.toFixed(1)}
              unit="h"
              hint={`储能充放期间三相独立调节的累计时长`}
              icon={<BatteryCharging size={13} />}
              tone="#2563EB"
            />
            <MetricCard
              label="当日释放电量"
              value={s.energy.toFixed(1)}
              unit="kWh"
              hint={`释放裕量 ${releaseMax.toFixed(0)} kW（治理前 ${cfg.baseline} → 当前 ${cfg.current}）`}
              icon={<Sparkles size={13} />}
              tone="#F59E0B"
            />
          </div>

          {/* 主图 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-full bg-fuchsia-500" />
                <span className="text-[13px] font-black text-slate-800">当日三相功率与不平衡度</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                数据更新时间：{date} 23:59:00
              </span>
            </div>

            {/* 图例 */}
            <div className="flex items-center justify-center gap-x-6 gap-y-2 flex-wrap mb-2">
              <LegendGroup
                title="关口"
                items={[
                  { color: PHASE_COLOR.a, label: 'A 相有功' },
                  { color: PHASE_COLOR.b, label: 'B 相有功' },
                  { color: PHASE_COLOR.c, label: 'C 相有功' },
                ]}
              />
              <LegendGroup
                title="储能"
                items={[
                  { color: PHASE_COLOR.essA, label: '储能 A 相', dash: true },
                  { color: PHASE_COLOR.essB, label: '储能 B 相', dash: true },
                  { color: PHASE_COLOR.essC, label: '储能 C 相', dash: true },
                ]}
              />
              <LegendGroup
                items={[
                  { color: PHASE_COLOR.ub, label: '不平衡度' },
                  { color: PHASE_COLOR.ubBefore, label: '不治理时不平衡度', dash: true },
                ]}
              />
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={points} margin={{ top: 16, right: 56, bottom: 4, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
                  <XAxis
                    dataKey="minute"
                    type="number"
                    domain={[0, 1439]}
                    ticks={axisTicks}
                    tickFormatter={(v) => {
                      const hh = String(Math.floor(Number(v) / 60)).padStart(2, '0');
                      const mm = String(Number(v) % 60).padStart(2, '0');
                      return `${hh}:${mm}`;
                    }}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="p"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    label={{
                      value: '功率 (kW)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 10, fill: '#94A3B8', fontWeight: 700 },
                    }}
                  />
                  <YAxis
                    yAxisId="ub"
                    orientation="right"
                    domain={[0, 'dataMax + 4']}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v) => `${v}%`}
                    label={{
                      value: '不平衡度 (%)',
                      angle: 90,
                      position: 'insideRight',
                      style: { fontSize: 10, fill: '#94A3B8', fontWeight: 700 },
                    }}
                  />
                  <Tooltip content={<PhaseTooltip />} />
                  <ReferenceLine yAxisId="p" y={0} stroke="#CBD5E1" strokeDasharray="2 3" />

                  <Line yAxisId="p" type="monotone" dataKey="gridA" name="A 相有功" stroke={PHASE_COLOR.a} strokeWidth={1.6} dot={false} isAnimationActive={false} />
                  <Line yAxisId="p" type="monotone" dataKey="gridB" name="B 相有功" stroke={PHASE_COLOR.b} strokeWidth={1.6} dot={false} isAnimationActive={false} />
                  <Line yAxisId="p" type="monotone" dataKey="gridC" name="C 相有功" stroke={PHASE_COLOR.c} strokeWidth={1.6} dot={false} isAnimationActive={false} />

                  <Line yAxisId="p" type="monotone" dataKey="essA" name="储能 A 相" stroke={PHASE_COLOR.essA} strokeWidth={1.4} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
                  <Line yAxisId="p" type="monotone" dataKey="essB" name="储能 B 相" stroke={PHASE_COLOR.essB} strokeWidth={1.4} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
                  <Line yAxisId="p" type="monotone" dataKey="essC" name="储能 C 相" stroke={PHASE_COLOR.essC} strokeWidth={1.4} strokeDasharray="4 3" dot={false} isAnimationActive={false} />

                  <Line yAxisId="ub" type="monotone" dataKey="ubBefore" name="不治理时不平衡度" stroke={PHASE_COLOR.ubBefore} strokeWidth={1.4} strokeDasharray="3 4" dot={false} isAnimationActive={false} />
                  <Line yAxisId="ub" type="monotone" dataKey="ub" name="不平衡度" stroke={PHASE_COLOR.ub} strokeWidth={2.6} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* 底部口径 */}
            <div className="mt-3 pt-3 border-t border-slate-50 flex items-start gap-2">
              <Info size={13} className="text-slate-300 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-600">口径说明：</span>
                关口功率为正表示从电网取电；储能功率为正表示放电、为负表示充电。
                不平衡度按国标最大偏差口径：取三相中偏离平均值最大的那一相，偏差 ÷ 三相平均 × 100%。
                灰虚线为「若仍按总功率三分均分」的推算值，用于对照治理效果。
              </p>
            </div>
          </div>

          {/* 本月小结：把监控和经营分析的口径接上 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-3.5 rounded-full bg-amber-500" />
              <span className="text-[13px] font-black text-slate-800">本月治理小结</span>
              <span className="text-[11px] text-slate-400 font-medium">
                收益明细见「经营分析报告 · 增值服务」
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: '累计释放电量', value: month.totalEnergy.toFixed(0), unit: 'kWh' },
                { label: '累计节约电费', value: `¥${month.totalSaving.toLocaleString()}`, unit: '' },
                { label: '有效治理天数', value: `${month.activeDays}`, unit: '天' },
                { label: '平均不平衡度', value: `${month.avgUbBefore}% → ${month.avgUbAfter}%`, unit: '' },
              ].map((it) => (
                <div key={it.label} className="rounded-xl bg-slate-50/70 border border-slate-100 px-3 py-2.5">
                  <div className="text-[10px] font-bold text-slate-400">{it.label}</div>
                  <div className="mt-1 text-[15px] font-black font-mono text-slate-800">
                    {it.value}
                    {it.unit && <span className="text-[10px] font-normal text-slate-400 ml-1">{it.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PhaseImbalanceMonitorPage;

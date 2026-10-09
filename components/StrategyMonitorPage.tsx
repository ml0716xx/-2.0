import React, { useMemo, useState } from 'react';
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
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { tierOfSlot, slotTime } from './tianyingReportData';

/* ==========================================================================
   策略监控（按线上「策略角色」页面还原）
   --------------------------------------------------------------------------
   两个视角：
     · 全周期策略视角 —— 核心数据（储能 SOC / 电网功率）+ 参考数据（调度功率 /
       光伏发电功率 / 总负荷功率 / 本地电价），左轴 kW、右轴 % 与元/kWh，
       右侧标定「限电容量 / 需减载容量」，底部按时间段展示生效的控制维度。
     · 单策略视角 —— 选定策略（余电上网 / 峰谷套利 / 需量控制）当日的运行数据：
       电站功率 / 光伏发电功率 / 储能功率，并标出「需要减载」红线。

   数据口径：与策略运行报告一致 —— 储能容量 1040 kWh、采样 15min（96 格）、
   电价取站点三档 TOU（峰 1.0752 / 平 0.6417 / 谷 0.2975 元·kWh⁻¹），
   电价在右轴按 1.2 元/kWh 归一化到 0~100 与 % 共轴。
   ========================================================================== */

const CAP_KWH = 1040;
const SLOT_H = 0.25;

/** 确定性伪随机（避免每帧抖动，同时保留曲线的自然毛刺） */
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const PRICE_BY_TIER: Record<string, number> = {
  peak: 1.0752,
  flat: 0.6417,
  valley: 0.2975,
};

/** 总负荷功率（kW）：早晚双峰，午后抬升 */
function loadAt(h: number): number {
  const base =
    h < 6
      ? 128
      : h < 8
        ? 165
        : h < 11
          ? 238
          : h < 13
            ? 205
            : h < 17
              ? 252
              : h < 19
                ? 322
                : h < 21.5
                  ? 452
                  : h < 23
                    ? 268
                    : 158;
  return base;
}

/** 光伏出力（kW）：06:30 起、18:30 落，午间峰值约 490 */
function pvAt(h: number): number {
  if (h <= 6.5 || h >= 18.5) return 0;
  return 490 * Math.sin(((h - 6.5) / 12) * Math.PI);
}

/** 储能时段计划：kw 正 = 放电，负 = 充电 */
type EssSegment = { from: number; to: number; kw: number };

type StrategyPlan = {
  key: string;
  ess: EssSegment[];
  startSoc: number;
  curtail: number;
  note: string;
};

/** 控制维度可能出现的三类标签 */
const DIMENSIONS = ['余电上网', '峰谷套利', '需量控制'] as const;

const STRATEGY_PLANS: Record<string, StrategyPlan> = {
  余电上网: {
    key: '余电上网',
    startSoc: 24,
    ess: [
      { from: 0, to: 20, kw: 45 }, // 00:00–05:00 小功率放电支撑站内负荷
      { from: 32, to: 58, kw: -145 }, // 08:00–14:30 消纳午间光伏余电
      { from: 72, to: 84, kw: 245 }, // 18:00–21:00 峰段放电上网
    ],
    curtail: 10,
    note: '午间光伏余电优先入库，傍晚峰段放电上网，减少倒送与限电。',
  },
  峰谷套利: {
    key: '峰谷套利',
    startSoc: 32,
    ess: [
      { from: 0, to: 24, kw: -85 }, // 00:00–06:00 谷段满充
      { from: 32, to: 44, kw: 95 }, // 08:00–11:00 早峰放电
      { from: 72, to: 84, kw: 170 }, // 18:00–21:00 晚峰放电
    ],
    curtail: 30,
    note: '谷段蓄满、峰段放出，主要赚取峰谷价差，对光伏消纳无额外动作。',
  },
  需量控制: {
    key: '需量控制',
    startSoc: 32,
    ess: [
      { from: 0, to: 20, kw: -60 }, // 00:00–05:00 谷段蓄能
      { from: 34, to: 44, kw: 150 }, // 08:30–11:00 早高峰削峰
      { from: 56, to: 64, kw: 100 }, // 14:00–16:00 午后削峰
    ],
    curtail: 60,
    note: '在负荷抬升前放电削峰，压低当月最大需量，需量电费优先。',
  },
};

type SlotPoint = {
  slot: number;
  time: string;
  tier: string;
  pv: number;
  load: number;
  ess: number;
  grid: number;
  station: number;
  soc: number;
  dispatch: number;
  planGrid: number;
  price: number;
  priceY: number;
};

/** 生成 96 格运行数据（SOC 由功率逐格积分，保证与曲线自洽） */
function buildSlots(plan: StrategyPlan): SlotPoint[] {
  const ess = new Array(96).fill(0);
  for (const seg of plan.ess) {
    for (let i = seg.from; i < seg.to; i++) ess[i] = seg.kw;
  }

  const socs: number[] = [];
  let soc = plan.startSoc;
  for (let i = 0; i < 96; i++) {
    // 本组件约定 ess 正 = 放电、负 = 充电，故积分取负号（与 buildCurve 的「正=充电」相反）
    soc -= ((ess[i] * SLOT_H) / CAP_KWH) * 100;
    socs.push(Math.min(95, Math.max(5, soc)));
  }

  const raw = Array.from({ length: 96 }, (_, i) => {
    const h = i / 4;
    const pv = +(pvAt(h) * (0.94 + 0.06 * jitter(i * 1.7))).toFixed(1);
    const load = +(loadAt(h) * (0.96 + 0.08 * jitter(i * 3.1))).toFixed(1);
    const grid = +(load - pv - ess[i]).toFixed(1);
    return { i, h, pv, load, grid };
  });

  return raw.map(({ i, h, pv, load, grid }) => {
    const tier = tierOfSlot(i);
    const price = PRICE_BY_TIER[tier] ?? 0.6417;
    // 调度功率：AI 计划下发值，与执行值同段、幅值略有跟随误差
    const dispatch = +(ess[i] * (0.94 + 0.1 * jitter(i * 5.3))).toFixed(1);
    // 计划曲线：计划口径的并网点功率（负荷按日前预测平滑后推算）
    const planGrid = +(loadAt(h) - pvAt(h) * 0.98 - dispatch).toFixed(1);
    return {
      slot: i,
      time: slotTime(i),
      tier,
      pv,
      load,
      ess: ess[i],
      grid,
      // 单策略视角的「电站功率」即并网点交换功率，方向与电网功率一致
      station: grid,
      soc: +socs[i].toFixed(2),
      dispatch,
      planGrid,
      price,
      priceY: +((price / 1.2) * 100).toFixed(1),
    };
  });
}

/** 「限电容量 / 需减载容量」右侧标记 */
const SidePill: React.FC<{ viewBox?: { x: number; y: number; width: number }; text: string }> = ({
  viewBox,
  text,
}) => {
  if (!viewBox) return null;
  const w = 14 + text.length * 8;
  const x = viewBox.x + viewBox.width - w - 10;
  const y = viewBox.y - 9;
  return (
    <g>
      <rect x={x} y={y} width={w} height={18} rx={4} fill="#16A34A" opacity={0.92} />
      <text x={x + w / 2} y={y + 12.5} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>
        {text}
      </text>
    </g>
  );
};

/** 图例：圆点/线型 + 文案 + 分组标题 */
const LegendGroup: React.FC<{
  title?: string;
  items: { color: string; label: string; type?: 'dot' | 'dash' | 'dashdot' }[];
}> = ({ title, items }) => (
  <div className="flex items-center gap-3">
    {title && <span className="text-[11px] text-slate-400 font-medium">{title}</span>}
    <div className="flex items-center gap-3.5">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
          {it.type === 'dash' ? (
            <span className="w-4 h-0" style={{ borderTop: `1.5px dashed ${it.color}` }} />
          ) : it.type === 'dashdot' ? (
            <span className="w-4 h-0" style={{ borderTop: `1.5px dotted ${it.color}` }} />
          ) : (
            <span className="w-2 h-2 rounded-full" style={{ background: it.color }} />
          )}
          {it.label}
        </span>
      ))}
    </div>
  </div>
);

/** 曲线悬浮读数 */
const ChartTooltip: React.FC<any> = ({ active, payload, label, mode, strategy }) => {
  if (!active || !payload?.length) return null;
  const p: SlotPoint = payload[0].payload;
  const rows =
    mode === 'full'
      ? [
          { label: '储能 SOC', value: `${p.soc.toFixed(1)} %`, color: '#2563EB' },
          { label: '电网功率', value: `${p.grid.toFixed(1)} kW`, color: '#22C55E' },
          { label: '调度功率', value: `${p.dispatch.toFixed(1)} kW`, color: '#FB923C' },
          { label: '光伏发电功率', value: `${p.pv.toFixed(1)} kW`, color: '#F87171' },
          { label: '总负荷功率', value: `${p.load.toFixed(1)} kW`, color: '#FB7185' },
          { label: '本地电价', value: `${p.price.toFixed(4)} 元/kWh`, color: '#EAB308' },
        ]
      : [
          { label: '电站功率', value: `${p.station.toFixed(1)} kW`, color: '#22C55E' },
          { label: '光伏发电功率', value: `${p.pv.toFixed(1)} kW`, color: '#3B82F6' },
          { label: '储能功率', value: `${p.ess.toFixed(1)} kW`, color: '#D946EF' },
          { label: '需要减载', value: `${STRATEGY_PLANS[strategy]?.curtail ?? 10} kW`, color: '#EF4444' },
        ];
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5">
      <div className="text-[11px] font-mono font-bold text-slate-500 mb-1.5">
        {slotTime(Number(label))} · {p.tier === 'peak' ? '峰段' : p.tier === 'flat' ? '平段' : '谷段'}
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-800">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** 底部控制维度条：按时间段列出当前生效的控制维度 */
const DimensionStrip: React.FC = () => {
  const blocks = [
    { left: 0, width: 25, dims: ['峰谷套利', '需量控制'] },
    { left: 25, width: 50, dims: ['余电上网', '峰谷套利', '需量控制'] },
    { left: 75, width: 25, dims: ['峰谷套利', '需量控制'] },
  ];
  return (
    <div className="flex items-center gap-3 mt-1">
      <span className="text-[11px] font-bold text-slate-400 shrink-0">控制维度</span>
      <div className="relative flex-1 h-9 bg-slate-50 border border-slate-100 rounded-lg">
        {blocks.map((b) => (
          <div
            key={b.left}
            className="absolute inset-y-0 flex items-center justify-center gap-1.5"
            style={{ left: `${b.left}%`, width: `${b.width}%` }}
          >
            {b.dims.map((d) => (
              <span
                key={d}
                className="px-2 py-0.5 rounded text-[10px] font-bold border bg-white text-slate-600 border-slate-200"
              >
                {d}
              </span>
            ))}
          </div>
        ))}
        <div className="absolute inset-y-1.5 left-1/2 w-px bg-slate-200" />
      </div>
    </div>
  );
};

/** 曲线下方的时间色带（线上为绿色渐变轨道） */
const BottomTrack: React.FC = () => (
  <div className="mt-1 h-1.5 rounded-full bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-100 relative">
    <span className="absolute -top-[3px] left-0 w-2 h-2 rounded-full bg-emerald-400/70" />
    <span className="absolute -top-[3px] right-0 w-2 h-2 rounded-full bg-emerald-400/70" />
  </div>
);

type ViewTab = 'full' | 'single';

const StrategyMonitorPage: React.FC = () => {
  const [viewTab, setViewTab] = useState<ViewTab>('full');
  const [scope, setScope] = useState('全站');
  const [strategy, setStrategy] = useState('余电上网');
  const [date, setDate] = useState('2026-10-08');

  const slots = useMemo(() => buildSlots(STRATEGY_PLANS[strategy]), [strategy]);

  const axisTicks = [16, 32, 48, 64, 80];

  return (
    <div className="space-y-4">
      {/* 顶部：视角切换 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {(
            [
              ['full', '全周期策略视角'],
              ['single', '单策略视角'],
            ] as [ViewTab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setViewTab(key)}
              className={`relative px-1 pb-1.5 text-sm font-bold transition-colors ${
                viewTab === key ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              <span
                className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full transition-all ${
                  viewTab === key ? 'bg-emerald-500' : 'bg-transparent'
                }`}
              />
            </button>
          ))}
        </div>

        {/* 右上：策略/日期 */}
        <div className="flex items-center gap-2">
          {viewTab === 'single' && (
            <div className="relative">
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
              >
                {Object.keys(STRATEGY_PLANS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          )}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-0.5">
            <button className="p-1 text-slate-400 hover:text-slate-600">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-1.5">{date}</span>
            <button className="p-1 text-slate-400 hover:text-slate-600">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        {/* 监控范围 / 数据更新时间（全周期视角） */}
        {viewTab === 'full' && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-bold text-slate-500">监控范围</span>
            <div className="relative">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300 min-w-[92px]"
              >
                {['全站', '光伏区域', '储能区域', '充电桩'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              数据更新时间：2026-10-08 17:22:06
            </span>
          </div>
        )}

        {viewTab === 'single' && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500">运行数据</span>
            <span className="text-[11px] text-slate-400 font-medium">
              {strategy} · {STRATEGY_PLANS[strategy].note}
            </span>
          </div>
        )}

        {/* 图例 */}
        <div className="flex items-center justify-center gap-6 flex-wrap mb-2">
          {viewTab === 'full' ? (
            <>
              <LegendGroup
                title="核心数据"
                items={[
                  { color: '#2563EB', label: '储能SOC' },
                  { color: '#22C55E', label: '电网功率' },
                ]}
              />
              <LegendGroup
                title="参考数据"
                items={[
                  { color: '#FB923C', label: '调度功率' },
                  { color: '#F87171', label: '光伏发电功率' },
                  { color: '#FB7185', label: '总负荷功率' },
                  { color: '#EAB308', label: '本地电价' },
                ]}
              />
              <LegendGroup
                title="标准数据"
                items={[
                  { color: '#94A3B8', label: '计划曲线', type: 'dash' },
                  { color: '#CBD5E1', label: '调用幅值', type: 'dashdot' },
                ]}
              />
            </>
          ) : (
            <LegendGroup
              items={[
                { color: '#22C55E', label: '电站功率' },
                { color: '#3B82F6', label: '光伏发电功率' },
                { color: '#D946EF', label: '储能功率' },
                { color: '#EF4444', label: '需要减载', type: 'dash' },
              ]}
            />
          )}
        </div>

        {/* 曲线 */}
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={slots} margin={{ top: 24, right: 76, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
              <XAxis
                dataKey="slot"
                type="number"
                domain={[0, 95]}
                ticks={axisTicks}
                tickFormatter={(v) => slotTime(Number(v))}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                domain={[-600, 600]}
                ticks={[-600, -400, -200, 0, 200, 400, 600]}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                width={48}
                label={{
                  value: 'kW',
                  position: 'top',
                  offset: 12,
                  fontSize: 10,
                  fill: '#94A3B8',
                }}
              />
              {viewTab === 'full' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  width={54}
                  label={{
                    value: '元/kWh   %',
                    position: 'top',
                    offset: 12,
                    fontSize: 10,
                    fill: '#94A3B8',
                  }}
                />
              )}
              <Tooltip content={<ChartTooltip mode={viewTab} strategy={strategy} />} cursor={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }} />

              {viewTab === 'full' ? (
                <>
                  <Area
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="grid"
                    stroke="#22C55E"
                    strokeWidth={1.6}
                    fill="url(#gridFill)"
                    fillOpacity={0.18}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="load"
                    stroke="#FB7185"
                    strokeWidth={1.1}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pv"
                    stroke="#F87171"
                    strokeWidth={1.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="dispatch"
                    stroke="#FB923C"
                    strokeWidth={1.1}
                    strokeDasharray="2 2"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="planGrid"
                    stroke="#94A3B8"
                    strokeWidth={1}
                    strokeDasharray="5 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="stepAfter"
                    dataKey="priceY"
                    stroke="#EAB308"
                    strokeWidth={1}
                    strokeOpacity={0.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="soc"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={360}
                    stroke="#CBD5E1"
                    strokeDasharray="2 3"
                    label={{
                      value: '调用幅值',
                      position: 'insideTopLeft',
                      fontSize: 10,
                      fill: '#94A3B8',
                    }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={203}
                    stroke="#16A34A"
                    strokeDasharray="4 4"
                    label={<SidePill text="限电容量 203kW" />}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={-26}
                    stroke="#16A34A"
                    strokeDasharray="4 4"
                    label={<SidePill text="需减载容量 -26kW" />}
                  />
                  <defs>
                    <linearGradient id="gridFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                </>
              ) : (
                <>
                  <Area
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="station"
                    stroke="#22C55E"
                    strokeWidth={1.4}
                    fill="url(#stationFill)"
                    fillOpacity={0.22}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pv"
                    stroke="#3B82F6"
                    strokeWidth={1.4}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="ess"
                    stroke="#D946EF"
                    strokeWidth={1.6}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={STRATEGY_PLANS[strategy].curtail}
                    stroke="#EF4444"
                    strokeDasharray="5 4"
                    label={<SidePill text={`需要减载 ${STRATEGY_PLANS[strategy].curtail}kW`} />}
                  />
                  <defs>
                    <linearGradient id="stationFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {viewTab === 'full' ? <DimensionStrip /> : null}
        <BottomTrack />

        {/* 页脚 */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] text-slate-300 font-medium">
            数据来源：本站 EMS 网关 · 采样周期 15min · 共 96 点
          </span>
          <span className="text-[10px] text-slate-300 font-medium">
            © Trina Power 2017-2026 All Rights Reserved
          </span>
        </div>
      </div>
    </div>
  );
};

export default StrategyMonitorPage;

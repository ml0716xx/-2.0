/* ==========================================================================
   《天盈 AI 站点策略&收益体检报告》· 正文（可复用）
   --------------------------------------------------------------------------
   按体检报告的读法组织：
     1 典型日：天盈 AI 发现了什么？ —— 先看一天，看得懂再往下翻
     2 这个月能多赚多少 —— 钱是诊断出来的结果，不放在开场
     3 九项指标逐条对一遍 —— 明细账，支撑上面两段的数字

   刻意不写总结句、不写判读、不附口径说明、不留状态点 —— 这几块都删过，留白比补话更清楚。

   三处共用同一份正文，避免同一份内容写三遍：
     · 售前《天盈 AI 站点策略&收益体检报告》弹窗（TianyingSimReportModal）
     · 策略运行报告 · 未开通状态（报告主体替换为本正文）
     · 经营分析报告 · AI 策略数据 tab · 未开通状态（正文铺开展示）

   数字全部取自 tianyingReportData.ts，组件不写死任何数值。
   ========================================================================== */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Rocket,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  TY_META,
  TY_SIM_KPI,
  TY_SIM_DELTA,
  TY_SIM_ROWS,
  TY_SIM_WHY,
  TY_CASE_DAYS,
  TY_CASE_CURVES,
  TY_CURVE_TEXT,
  TY_PRICE,
  type CaseDayPoint,
  fmt,
  fmtSigned,
} from './tianyingReportData';

const C = {
  green: '#1E9C7E',
  blue: '#3B82F6',
  amber: '#F59E0B',
};

/** 电价档位：中文名 + 色带配色（key 与 TY_PRICE.tou 对应） */
const TIER_META: Record<string, { label: string; color: string }> = {
  peak: { label: '峰', color: '#F87171' },
  flat: { label: '平', color: '#60A5FA' },
  valley: { label: '谷', color: '#34D399' },
};

/** 逐项对照表的分组顺序（电量在前、收益在后，组名格纵向合并） */
const SIM_GROUPS = ['电量类', '收益类'] as const;

/**
 * 典型日逐 15min 充放电曲线。
 * 展示口径与 ml0716xx/--1「运营数据 · 典型日分析」一致：
 * 双 Y 轴（储能功率 / SOC）+ 实际与仿真各两条线 + 图下 24h 电价档位色带。
 * 关键收益增量直接挂在图表头右侧 —— 看曲线时不必再往下滑找数字。
 */
function CaseDayCurveChart({
  points,
  date,
  metrics,
}: {
  points: CaseDayPoint[];
  date: string;
  /** 图表头右侧关键指标：标签 + 仿真相对实际的差值 */
  metrics: { label: string; diff: number }[];
}) {
  const T = TY_CURVE_TEXT;
  const pw = (v: number) => (v === 0 ? '0.0' : (v > 0 ? '+' : '') + v.toFixed(1));
  const pwTag = (v: number) => (v > 0 ? T.pwState.charge : v < 0 ? T.pwState.discharge : T.pwState.idle);

  /** 分时电价：按档位取价，作为面积图垫在功率曲线下面 */
  const TOU_PRICE: Record<string, number> = Object.fromEntries(
    TY_PRICE.tou.map(t => [t.key, t.price]),
  );
  const SALE_PRICE = TY_PRICE.salePrice;
  const PRICE_MIN = Math.min(...Object.values(TOU_PRICE));
  const PRICE_MAX = Math.max(...Object.values(TOU_PRICE));
  const PRICE_TOP = PRICE_MAX * 1.12;

  /**
   * 电价两条面积：
   *   buy  下网购电价格 —— 随峰/平/谷阶梯走，体现「什么时候买电贵」
   *   sell 上网电价     —— 一条水平线，余电卖出去就值这个价
   * 两者之间的高度差就是储能的价差空间，曲线与面积对齐即可看出电量搬去了哪。
   */
  const chartData = points.map(p => ({
    ...p,
    buy: TOU_PRICE[p.tier] ?? TOU_PRICE.flat,
    sell: SALE_PRICE,
  }));

  /** 底部读数：由曲线积分回算，与日粒度表格同口径 */
  const kwh = (key: 'sim' | 'real', dir: 'charge' | 'discharge') =>
    points.reduce((s, p) => {
      const v = p[key];
      return s + (dir === 'charge' ? (v > 0 ? v : 0) : v < 0 ? -v : 0) * 0.25;
    }, 0);

  return (
    <div className="rounded-xl border border-[#EAEDF2] overflow-hidden">
      {/* 图表标题：右侧常驻关键收益增量，曲线与数字同屏可见 */}
      <div className="px-5 py-3 border-b border-[#EAEDF2] bg-[#FBFCFD] flex items-start justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-[13px] font-bold text-[#1A2A3A]">
            {T.chartTitle} · {date}
          </h4>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {metrics.map((m, i) => (
            <div key={m.label} className={i > 0 ? 'pl-4 border-l border-[#EAEDF2]' : undefined}>
              <div className="text-[10px] text-[#8A98A6]">{m.label}</div>
              <div
                className={`text-base leading-tight font-black font-mono mt-0.5 ${
                  m.diff > 0 ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
                }`}
              >
                {fmtSigned(m.diff, 0)}
                <span className="text-[10px] font-normal text-[#9AA7B4] ml-0.5">元</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 曲线本体 */}
      <div className="px-4 pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* 用 ComposedChart 而不是 LineChart：recharts v3 的 LineChart 只渲染 Line，
                电价面积需要 Area，混排必须走 ComposedChart */}
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#93A1B0' }}
                axisLine={{ stroke: '#EAEDF2' }}
                tickLine={false}
                interval={7}
              />
              <YAxis
                yAxisId="left"
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#93A1B0' }}
                axisLine={false}
                tickLine={false}
                width={48}
                label={{
                  value: T.axisPower,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 10, fill: '#B6C1CC' },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#93A1B0' }}
                axisLine={false}
                tickLine={false}
                width={40}
                label={{
                  value: T.axisSoc,
                  angle: 90,
                  position: 'insideRight',
                  style: { fontSize: 10, fill: '#B6C1CC' },
                }}
              />

              {/* 电价轴：不出刻度，只给两条面积定标 */}
              <YAxis yAxisId="price" hide domain={[0, PRICE_TOP]} />

              {/* 电价面积：垫在功率曲线下面。两条之间的高度差就是储能的价差空间，
                  曲线与面积对齐，即可看出电量被搬去了哪个价位 */}
              <defs>
                <linearGradient id="tyBuyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="tySellFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E9C7E" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#1E9C7E" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <Area
                yAxisId="price"
                type="stepAfter"
                dataKey="buy"
                name="下网购电价格"
                stroke="#94A3B8"
                strokeWidth={1}
                fill="url(#tyBuyFill)"
                legendType="none"
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="sell"
                name="上网电价"
                stroke="#1E9C7E"
                strokeWidth={1}
                strokeDasharray="4 3"
                fill="url(#tySellFill)"
                legendType="none"
              />

              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload || !payload.length) return null;
                  const p: CaseDayPoint = payload[0].payload;
                  const tier = TIER_META[p.tier] ?? TIER_META.flat;
                  return (
                    <div className="bg-white p-3 border border-[#EAEDF2] shadow-xl rounded-lg text-[11px] space-y-1">
                      <div className="font-bold text-[#1A2A3A] flex items-center gap-1.5">
                        {label}
                        <span className="flex items-center gap-1 font-normal text-[#8A98A6]">
                          <span className="w-2 h-2 rounded-sm" style={{ background: tier.color }} />
                          {tier.label}段
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-5">
                        <span className="text-[#7F8C8D]">{T.legend.realPower}</span>
                        <span className="font-mono font-bold text-[#7F8C8D]">
                          {pw(p.real)} kW
                          <span className="ml-1 text-[10px] font-normal text-[#9AA7B4]">{pwTag(p.real)}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-5">
                        <span className="text-[#7F8C8D]">{T.legend.simPower}</span>
                        <span className="font-mono font-bold" style={{ color: C.blue }}>
                          {pw(p.sim)} kW
                          <span className="ml-1 text-[10px] font-normal text-[#9AA7B4]">{pwTag(p.sim)}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-5 pt-1 border-t border-[#F1F4F7]">
                        <span className="text-[#7F8C8D]">SOC</span>
                        <span className="font-mono font-bold text-[#1A2A3A]">
                          {p.socReal.toFixed(1)} % <span className="text-[#D5DBE2]">/</span> {p.socSim.toFixed(1)} %
                        </span>
                      </div>
                      {/* 电价轴不出刻度，具体价位放在这里看 */}
                      <div className="flex items-center justify-between gap-5 pt-1 border-t border-[#F1F4F7]">
                        <span className="text-[#7F8C8D]">下网购电 / 上网电价</span>
                        <span className="font-mono font-bold text-[#1A2A3A]">
                          {(p as CaseDayPoint & { buy: number }).buy.toFixed(4)}
                          <span className="text-[#D5DBE2] mx-0.5">/</span>
                          {(p as CaseDayPoint & { sell: number }).sell.toFixed(4)}
                          <span className="ml-1 text-[10px] font-normal text-[#9AA7B4]">元/kWh</span>
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                yAxisId="left"
                type="stepAfter"
                dataKey="real"
                name={T.legend.realPower}
                stroke="#94A3B8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="left"
                type="stepAfter"
                dataKey="sim"
                name={T.legend.simPower}
                stroke={C.blue}
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="socReal"
                name={T.legend.realSoc}
                stroke="#CBD5E1"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="socSim"
                name={T.legend.simSoc}
                stroke={C.amber}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 图例：电价面积 + 两条功率线。电价轴不出刻度，价位直接写在这里 */}
      <div className="px-5 pb-3 pt-2 flex items-center gap-x-5 gap-y-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
          <span className="w-3 h-3 rounded-sm bg-[#94A3B8]/25 border border-[#94A3B8]/60" />
          下网购电价格
          <span className="font-mono text-[#8A98A6]">
            {fmt(PRICE_MIN, 4)}–{fmt(PRICE_MAX, 4)} 元/kWh
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
          <span className="w-3 h-3 rounded-sm bg-[#1E9C7E]/20 border border-[#1E9C7E]/60" />
          上网电价
          <span className="font-mono text-[#8A98A6]">{fmt(SALE_PRICE, 4)} 元/kWh</span>
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
          <span className="w-4 h-0.5 bg-[#94A3B8]" />
          {T.legend.realPower}
          {T.powerNote}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
          <span className="w-4 h-0.5" style={{ background: C.blue }} />
          {T.legend.simPower}
          {T.powerNote}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
          <span className="w-4 border-t border-dashed border-[#CBD5E1]" />
          {T.legend.realSoc}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
          <span className="w-4 border-t border-dashed" style={{ borderColor: C.amber }} />
          {T.legend.simSoc}
        </span>
      </div>

      {/* 底部读数：由曲线积分回算，与日粒度表格同口径 */}
      <div className="px-5 py-3 border-t border-[#EAEDF2] bg-[#FBFCFD] flex items-center gap-x-6 gap-y-1.5 flex-wrap text-[11px] text-[#7F8C8D]">
        <span>
          {T.footLabels.charge} {T.footLabels.real}{' '}
          <span className="font-mono font-bold text-[#1A2A3A]">{fmt(kwh('real', 'charge'), 1)}</span> /{' '}
          {T.footLabels.sim}
          <span className="font-mono font-bold text-[#1A2A3A]"> {fmt(kwh('sim', 'charge'), 1)}</span> kWh
        </span>
        <span>
          {T.footLabels.discharge} {T.footLabels.real}{' '}
          <span className="font-mono font-bold text-[#1A2A3A]">{fmt(kwh('real', 'discharge'), 1)}</span> /{' '}
          {T.footLabels.sim}
          <span className="font-mono font-bold text-[#1A2A3A]"> {fmt(kwh('sim', 'discharge'), 1)}</span> kWh
        </span>
        <span className="text-[#9AA7B4]">{T.socNote}</span>
      </div>
    </div>
  );
}

/** 章节外壳：编号 + 标题 + 说明 */
function Section({
  no,
  title,
  hint,
  children,
}: {
  no: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-[#EAEDF2] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#EAEDF2] flex items-center gap-2.5 bg-[#FBFCFD]">
        <span className="w-5 h-5 rounded-md bg-[#1E9C7E] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
          {no}
        </span>
        <h3 className="text-sm font-bold text-[#1A2A3A]">{title}</h3>
        {hint && <span className="text-[11px] text-[#93A1B0]">{hint}</span>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export interface TianyingSimReportBodyProps {
  /** 是否在正文末尾附「开通试用」引导条 */
  showActivateHint?: boolean;
  /** 开通试用 */
  onActivate?: () => void;
  /** 打开完整体检报告弹窗 */
  onOpenSimReport?: () => void;
}

export default function TianyingSimReportBody({
  showActivateHint = false,
  onActivate,
  onOpenSimReport,
}: TianyingSimReportBodyProps) {
  const [caseIdx, setCaseIdx] = useState(0);

  const caseDay = TY_CASE_DAYS[caseIdx];

  /** 收益构成对比柱图数据 */
  const barData = [
    { name: '实际运行', 储能: TY_SIM_KPI.storage.real, 光伏: TY_SIM_KPI.pv.real },
    { name: 'AI 策略', 储能: TY_SIM_KPI.storage.sim, 光伏: TY_SIM_KPI.pv.sim },
  ];

  return (
    <div className="space-y-4">
      {/* ------------------------- 1. 典型日 ------------------------- */}
      <Section no="1" title="典型日：天盈 AI 发现了什么？">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {TY_CASE_DAYS.map((d, i) => (
            <button
              key={d.date}
              type="button"
              onClick={() => setCaseIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                i === caseIdx
                  ? 'bg-[#1E9C7E] text-white border-[#1E9C7E]'
                  : 'bg-white text-[#5A6B7C] border-[#EAEDF2] hover:border-[#1E9C7E]/40'
              }`}
            >
              {d.date.slice(5)}
            </button>
          ))}
        </div>

        {/* 逐 15min 充放电曲线：展示口径与 ml0716xx/--1 的典型日分析一致 */}
        <div className="mb-3">
          <CaseDayCurveChart
            points={TY_CASE_CURVES[caseDay.date] ?? []}
            date={caseDay.date}
            metrics={[
              { label: '这一天可多赚', diff: caseDay.totalDiff },
              { label: '储能多赚', diff: caseDay.storageDiff },
            ]}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-[#EAEDF2] mb-3">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FBFCFD]">
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[#8A98A6]">指标</th>
                <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">实际运行</th>
                <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">AI 策略</th>
                <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">绝对差</th>
              </tr>
            </thead>
            <tbody>
              {caseDay.rows.map(r => {
                const diff = r.sim - r.real;
                return (
                  <tr key={r.name} className="border-t border-[#EAEDF2]">
                    <td className="px-3 py-2 text-[12px] text-[#2C3E50] whitespace-nowrap">{r.name}</td>
                    <td className="px-3 py-2 text-right text-[12px] font-mono text-[#7F8C8D] whitespace-nowrap">
                      {fmt(r.real, 0)}
                    </td>
                    <td className="px-3 py-2 text-right text-[12px] font-mono font-bold text-[#1A2A3A] whitespace-nowrap">
                      {fmt(r.sim, 0)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right text-[12px] font-mono font-bold whitespace-nowrap ${
                        diff > 0 ? 'text-[#E5484D]' : diff < 0 ? 'text-[#1E9C7E]' : 'text-[#9AA7B4]'
                      }`}
                    >
                      {fmtSigned(diff, 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ------------------------- 2. 这个月能多赚多少 ------------------------- */}
      <Section no="2" title="这个月能多赚多少" hint={`${TY_META.periodLabel}全月口径 · 两侧同一套分时电价`}>
        {/* 一句话先把钱说清楚，柱图负责给证据；储能/光伏的分项解释在下方「增量来源」，这里不重复 */}
        <div className="rounded-xl border border-[#EAEDF2] px-4 pt-3 pb-2 mb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[12px] font-bold text-[#5A6B7C]">
              钱从哪来：同样的设备、同样的电价，只换排法，一个月多赚{' '}
              <span className="font-mono text-[#E5484D]">{fmt(TY_SIM_DELTA.net, 0)}</span> 元
            </span>
            <span className="text-[11px] text-[#8A98A6] shrink-0">单位：元（全月）</span>
          </div>
          <div className="h-[124px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 16, right: 16, left: 4, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F5" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#7F8C8D' }}
                  axisLine={{ stroke: '#EAEDF2' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#93A1B0' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(v: any, n: any) => [`${fmt(Number(v), 0)} 元`, n]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #EAEDF2' }}
                />
                <ReferenceLine y={0} stroke="#EAEDF2" />
                <Bar dataKey="储能" fill={C.blue} radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="储能"
                    position="top"
                    style={{ fontSize: 10, fill: '#5A6B7C', fontWeight: 700 }}
                    formatter={(v: any) => fmt(Number(v), 0)}
                  />
                </Bar>
                <Bar dataKey="光伏" fill={C.green} radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="光伏"
                    position="top"
                    style={{ fontSize: 10, fill: '#5A6B7C', fontWeight: 700 }}
                    formatter={(v: any) => fmt(Number(v), 0)}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 增量来源：从收益类表格底部提到这里 —— 第 2 段只回答「钱从哪来」，
            明细账留给第 3 段，避免同一组数字在一个屏幕里出现两遍 */}
        <div className="rounded-xl border border-[#EAEDF2] overflow-hidden">
          <div className="px-4 py-2.5 bg-[#FBFCFD] border-b border-[#EAEDF2] flex items-baseline gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#5A6B7C]">增量来源</span>
            <span className="text-[10px] text-[#9AA7B4]">储能多赚的、光伏少赚的，抵完才是净增</span>
          </div>
          <div className="divide-y divide-[#EAEDF2]">
            {TY_SIM_WHY.map(w => (
              <div key={w.title} className="px-4 py-2.5 flex items-start gap-3">
                <span className="text-[11px] font-bold text-[#5A6B7C] w-9 shrink-0">{w.title}</span>
                <span
                  className={`text-[12px] font-mono font-bold w-16 shrink-0 ${
                    w.tone === 'up' ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
                  }`}
                >
                  {w.amount}
                </span>
                <span className="text-[11px] text-[#5A6B7C] leading-relaxed">{w.brief}</span>
              </div>
            ))}
            <div className="px-4 py-2.5 flex items-center gap-3 bg-[#FBFCFD]">
              <span className="text-[11px] font-bold text-[#1A2A3A] w-9 shrink-0">合计</span>
              <span className="text-[12px] font-mono font-bold text-[#E5484D] w-16 shrink-0">
                {fmtSigned(TY_SIM_DELTA.net, 0)}
              </span>
              <span className="text-[11px] text-[#8A98A6]">元 / 月，全月口径</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ------------------------- 3. 九项指标 ------------------------- */}
      <Section no="3" title="九项指标逐条对一遍" hint="左边看电量，右边看收益，全月口径">
        {/* 电量类 / 收益类 左右并排：单列铺满时「指标」与右侧数值之间会留出一大片空白，
            并排后栏宽减半、空白收紧。两栏各自收尾、不再强行等高 —— 右栏三行本就比
            左栏六行短，用 items-start 让卡片按内容收高，比塞内容填满更干净。 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4 items-start">
          {SIM_GROUPS.map(g => {
            const rows = TY_SIM_ROWS.filter(r => r.group === g);
            return (
              <div key={g} className="flex flex-col overflow-hidden rounded-lg border border-[#EAEDF2]">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FBFCFD] border-b border-[#EAEDF2]">
                  <span className="w-1 h-3 rounded-full bg-[#1E9C7E] shrink-0" />
                  <span className="text-[11px] font-bold text-[#5A6B7C]">{g}</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#FBFCFD] border-b border-[#EAEDF2]">
                      <th className="text-left px-3 py-1.5 text-[10px] font-bold text-[#8A98A6]">指标</th>
                      <th className="text-right px-3 py-1.5 text-[10px] font-bold text-[#8A98A6]">实际运行</th>
                      <th className="text-right px-3 py-1.5 text-[10px] font-bold text-[#8A98A6]">AI 策略</th>
                      <th className="text-right px-3 py-1.5 text-[10px] font-bold text-[#8A98A6]">绝对差</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => {
                      const diff = r.sim - r.real;
                      const isTotal = r.item === '总收益';
                      return (
                        <tr key={r.item} className={`border-t border-[#EAEDF2] ${isTotal ? 'bg-[#F4FBF8]' : ''}`}>
                          <td
                            className={`px-3 py-1.5 text-[11px] whitespace-nowrap ${
                              isTotal ? 'font-bold text-[#1A2A3A]' : 'text-[#2C3E50]'
                            }`}
                          >
                            {r.item}
                            <span className="text-[10px] text-[#9AA7B4] ml-1">{r.unit}</span>
                          </td>
                          <td className="px-3 py-1.5 text-right text-[11px] font-mono text-[#7F8C8D] whitespace-nowrap">
                            {fmt(r.real, r.dec)}
                          </td>
                          <td className="px-3 py-1.5 text-right text-[11px] font-mono font-bold text-[#1A2A3A] whitespace-nowrap">
                            {fmt(r.sim, r.dec)}
                          </td>
                          <td
                            className={`px-3 py-1.5 text-right text-[11px] font-mono font-bold whitespace-nowrap ${
                              diff > 0 ? 'text-[#E5484D]' : diff < 0 ? 'text-[#1E9C7E]' : 'text-[#9AA7B4]'
                            }`}
                          >
                            {Math.abs(diff) < 10 ** -r.dec / 2 ? '—' : fmtSigned(diff, r.dec)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* 增量归因已上移到第 2 段，跟着「钱」走；这里保留纯明细账 */}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ------------------------- 开通试用引导 ------------------------- */}
      {showActivateHint && (
        <div className="rounded-xl border border-[#B7E4D3] bg-gradient-to-br from-[#F1FBF7] to-[#E8F7F1] px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Rocket size={16} className="text-[#1E9C7E] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#1A2A3A]">
                  以上为售前测算结果：同样的设备，一个月能多创收 {fmt(TY_SIM_DELTA.net, 0)} 元
                </div>
                <p className="text-[11px] text-[#5A6B7C] mt-1 leading-relaxed">
                  开通 30 天试用后，本报告将切换为「实测 AI 轨迹 vs 后台基线」的对比口径，
                  数字全部来自站点实际运行；试用期内可随时退出。
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-[#2C7A6E]">
                  {['免审批自动开通', '无需改造设备', '试用期随时退出'].map(t => (
                    <span key={t} className="flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-[#1E9C7E]" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {onOpenSimReport && (
                <button
                  type="button"
                  onClick={onOpenSimReport}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold text-[#17705A] border border-[#B7E4D3] bg-white/70 hover:bg-white transition-colors"
                >
                  <Sparkles size={14} />
                  查看体检报告
                </button>
              )}
              {onActivate && (
                <button
                  type="button"
                  onClick={onActivate}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-bold bg-[#1E9C7E] hover:bg-[#17705A] text-white transition-colors shadow-sm"
                >
                  <Rocket size={14} />
                  一键免费开通 30 天试用
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

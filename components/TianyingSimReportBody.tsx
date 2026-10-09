/* ==========================================================================
   《天盈 AI 仿真报告》· 正文（可复用）
   --------------------------------------------------------------------------
   两章节，全部围绕「仿真比实际多赚多少」：
     1 仿真收益对比（实际运行与仿真收益合在一张逐项表里看，不再单列实测指标）
     2 典型日分析（案例日均为 AI 优于实际的正向案例）

   三处共用同一份正文，避免同一份内容写三遍：
     · 售前《天盈 AI 仿真报告》弹窗（TianyingSimReportModal）
     · 策略运行报告 · 未开通状态（报告主体替换为本正文）
     · 经营分析报告 · AI 策略数据 tab · 未开通状态（正文铺开展示）

   数字全部取自 tianyingReportData.ts，组件不写死任何数值。
   ========================================================================== */

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  TY_PRICE,
  TY_PRICE_COMPARE,
  TY_CASE_DAYS,
  TY_CASE_CURVES,
  TY_CURVE_TEXT,
  TY_TOU_SEGMENTS,
  slotTime,
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
 */
function CaseDayCurveChart({ points, date }: { points: CaseDayPoint[]; date: string }) {
  const T = TY_CURVE_TEXT;
  const pw = (v: number) => (v === 0 ? '0.0' : (v > 0 ? '+' : '') + v.toFixed(1));
  const pwTag = (v: number) => (v > 0 ? T.pwState.charge : v < 0 ? T.pwState.discharge : T.pwState.idle);

  /** 底部读数：由曲线积分回算，与日粒度表格同口径 */
  const kwh = (key: 'sim' | 'real', dir: 'charge' | 'discharge') =>
    points.reduce((s, p) => {
      const v = p[key];
      return s + (dir === 'charge' ? (v > 0 ? v : 0) : v < 0 ? -v : 0) * 0.25;
    }, 0);

  return (
    <div className="rounded-xl border border-[#EAEDF2] overflow-hidden">
      {/* 图表标题 */}
      <div className="px-5 py-3 border-b border-[#EAEDF2] bg-[#FBFCFD] flex items-start justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-[13px] font-bold text-[#1A2A3A]">
            {T.chartTitle} · {date}
          </h4>
          <p className="text-[11px] text-[#93A1B0] mt-0.5">{T.rule}</p>
        </div>
      </div>

      {/* 曲线本体 */}
      <div className="px-4 pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
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
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                formatter={(v: string) => <span className="text-[#5A6B7C]">{v}</span>}
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 24h 电价档位色带：曲线与色带对齐即可看出电量搬去了哪个价位 */}
      <div className="px-5 pb-3 pt-2 space-y-1.5">
        <div className="flex h-3 rounded-md overflow-hidden border border-[#EAEDF2]">
          {TY_TOU_SEGMENTS.map(seg => {
            const meta = TIER_META[seg.tier];
            return (
              <div
                key={seg.slot}
                style={{ width: `${100 / 96}%`, background: meta.color }}
                title={`${slotTime(seg.slot)} ${meta.label}段`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#9AA7B4]">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap pt-0.5">
          {Object.entries(TIER_META).map(([k, m]) => (
            <span key={k} className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C]">
              <span className="w-3 h-3 rounded-sm" style={{ background: m.color }} />
              {T.axisTier} · {m.label}段
            </span>
          ))}
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
        </div>
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
  /** 打开完整仿真报告弹窗 */
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
    { name: 'AI 策略仿真', 储能: TY_SIM_KPI.storage.sim, 光伏: TY_SIM_KPI.pv.sim },
  ];

  return (
    <div className="space-y-4">
      {/* ------------------------- 1. 仿真收益对比 ------------------------- */}
      <Section no="1" title="仿真收益对比" hint="实际运行基准 vs AI 策略仿真逐项对照">
        {/* 收益构成柱图：压成一行的高度，储能/光伏的分项解释在下方「收益增量来源」里，这里不重复 */}
        <div className="rounded-xl border border-[#EAEDF2] px-4 pt-3 pb-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#5A6B7C]">收益构成：实际运行 → AI 策略仿真</span>
            <span className="text-[11px] text-[#8A98A6]">单位：元（全月）</span>
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

        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-bold text-[#5A6B7C]">逐项对照：实际运行 → AI 策略仿真</span>
        </div>
        {/* 电量类 / 收益类 左右并排：单列铺满时「指标」与右侧数值之间会留出一大片空白，
            并排后栏宽减半、空白收紧。右栏在收益对照之下直接接「增量来源」归因，
            与左栏电量类等高，不再单开一段两卡区块、也不在右栏底部空出一大块。 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
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
                      <th className="text-right px-3 py-1.5 text-[10px] font-bold text-[#8A98A6]">AI 策略仿真</th>
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

                {/* 收益类下方直接接增量归因，贴着栏底，与左侧电量类收尾对齐 */}
                {g === '收益类' && (
                  <div className="mt-auto border-t border-[#EAEDF2] bg-[#FBFCFD] px-3 py-2">
                    <div className="text-[10px] font-bold text-[#8A98A6] mb-1">增量来源</div>
                    <div className="space-y-0.5">
                      {TY_SIM_WHY.map(w => (
                        <div key={w.title} className="flex items-baseline gap-1.5 text-[11px] leading-tight">
                          <span className="font-bold text-[#5A6B7C] shrink-0">{w.title}</span>
                          <span
                            className={`font-mono font-bold shrink-0 ${
                              w.tone === 'up' ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
                            }`}
                          >
                            {w.amount}
                          </span>
                          <span className="text-[#8A98A6] truncate">{w.brief}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-[#EAEDF2] p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Zap size={13} className="text-[#F59E0B]" />
            <span className="text-[12px] font-bold text-[#5A6B7C]">电价口径</span>
            <span className="text-[11px] text-[#9AA7B4]">两侧同价，差异来自时段结构</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TY_PRICE.tou.map(t => (
              <div key={t.key} className="rounded-lg border border-[#EAEDF2] px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#5A6B7C]">购电 · {t.label}段</span>
                  <span className="text-[12px] font-mono font-bold text-[#1A2A3A]">
                    {fmt(t.price, 4)}
                    <span className="text-[10px] font-normal text-[#9AA7B4] ml-0.5">元/kWh</span>
                  </span>
                </div>
                <div className="text-[10px] text-[#9AA7B4] mt-0.5">{t.window}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            {/* 售电电价：两侧同价，无对比，单值展示 */}
            <div className="rounded-lg bg-[#FBFCFD] border border-[#EAEDF2] px-3 py-2">
              <div className="text-[10px] text-[#8A98A6]">售电电价（余电上网）</div>
              <div className="text-[12px] font-mono font-bold text-[#1A2A3A] mt-0.5">
                {fmt(TY_PRICE.salePrice, 4)}
                <span className="text-[9px] font-normal text-[#B6C1CC] ml-0.5">元/kWh</span>
              </div>
              <div className="text-[10px] text-[#B6C1CC] mt-0.5">两侧同价</div>
            </div>

            {/* 加权电价三项：实际运行 → AI 策略仿真，并标出降低 / 提升幅度 */}
            {TY_PRICE_COMPARE.map(it => {
              const diff = it.sim - it.real;
              const pct = (diff / it.real) * 100;
              const up = diff > 0;
              return (
                <div key={it.label} className="rounded-lg bg-[#FBFCFD] border border-[#EAEDF2] px-3 py-2">
                  <div className="text-[10px] text-[#8A98A6]">{it.label}</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[11px] font-mono text-[#9AA7B4]">{fmt(it.real, it.dec)}</span>
                    <ArrowRight size={9} className="text-[#D5DBE2] shrink-0 self-center" />
                    <span className="text-[12px] font-mono font-bold text-[#1A2A3A]">{fmt(it.sim, it.dec)}</span>
                    <span className="text-[9px] font-normal text-[#B6C1CC]">元/kWh</span>
                  </div>
                  <div
                    className={`text-[10px] font-mono font-bold mt-0.5 ${
                      up ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
                    }`}
                  >
                    {up ? '提升' : '降低'} {fmt(Math.abs(diff), it.dec)}（{up ? '+' : '-'}
                    {fmt(Math.abs(pct), 1)}%）
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-[#9AA7B4] mt-2.5 leading-relaxed">{TY_PRICE.note}</div>
        </div>
      </Section>

      {/* ------------------------- 2. 典型日分析 ------------------------- */}
      <Section no="2" title="典型日分析" hint="案例日逐项对照与判读">
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
              {d.date.slice(5)} · {d.tag}
            </button>
          ))}
        </div>

        {/* 逐 15min 充放电曲线：展示口径与 ml0716xx/--1 的典型日分析一致 */}
        <div className="mb-3">
          <CaseDayCurveChart points={TY_CASE_CURVES[caseDay.date] ?? []} date={caseDay.date} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          <div className="rounded-xl border border-[#EAEDF2] px-4 py-3">
            <div className="text-[11px] text-[#8A98A6]">当日储能收益差</div>
            <div
              className={`text-lg font-black font-mono mt-0.5 ${
                caseDay.storageDiff > 0 ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
              }`}
            >
              {fmtSigned(caseDay.storageDiff, 0)}
              <span className="text-[11px] font-normal text-[#9AA7B4] ml-1">元</span>
            </div>
          </div>
          <div className="rounded-xl border border-[#EAEDF2] px-4 py-3">
            <div className="text-[11px] text-[#8A98A6]">当日总收益差</div>
            <div
              className={`text-lg font-black font-mono mt-0.5 ${
                caseDay.totalDiff > 0 ? 'text-[#E5484D]' : 'text-[#1E9C7E]'
              }`}
            >
              {fmtSigned(caseDay.totalDiff, 0)}
              <span className="text-[11px] font-normal text-[#9AA7B4] ml-1">元</span>
            </div>
          </div>
          <div className="rounded-xl border border-[#EAEDF2] px-4 py-3">
            <div className="text-[11px] text-[#8A98A6]">案例日口径</div>
            <div className="text-[12px] font-bold text-[#1A2A3A] mt-1">
              按储能收益差排序取当月前 3 个典型日
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#EAEDF2] mb-3">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FBFCFD]">
                <th className="text-left px-3 py-2 text-[11px] font-bold text-[#8A98A6]">指标</th>
                <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">实际运行</th>
                <th className="text-right px-3 py-2 text-[11px] font-bold text-[#8A98A6]">AI 策略仿真</th>
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

        <div className="rounded-xl bg-[#FBFCFD] border border-[#EAEDF2] px-4 py-3">
          <div className="text-[11px] font-bold text-[#8A98A6] mb-1">判读要点</div>
          <p className="text-[12px] text-[#5A6B7C] leading-relaxed">{caseDay.reading}</p>
        </div>
      </Section>

      {/* ------------------------- 口径说明 ------------------------- */}
      <div className="flex items-start gap-2 rounded-xl bg-white border border-[#EAEDF2] px-4 py-3">
        <Info size={13} className="text-[#93A1B0] mt-0.5 shrink-0" />
        <p className="text-[11px] text-[#7F8C8D] leading-relaxed">
          <span className="font-bold text-[#5A6B7C]">报告口径：</span>
          {TY_META.caliberNote}
        </p>
      </div>

      {/* ------------------------- 开通试用引导 ------------------------- */}
      {showActivateHint && (
        <div className="rounded-xl border border-[#B7E4D3] bg-gradient-to-br from-[#F1FBF7] to-[#E8F7F1] px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Rocket size={16} className="text-[#1E9C7E] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#1A2A3A]">
                  以上为售前仿真测算结果，可多创收 {fmt(TY_SIM_DELTA.net, 0)} 元 / 月
                </div>
                <p className="text-[11px] text-[#5A6B7C] mt-1 leading-relaxed">
                  开通 30 天试用后，本页将切换为「实测 AI 轨迹 vs 后台基线仿真」的真实对比口径，
                  数据全部来自站点实际运行；试用期内可随时退出。
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
                  查看仿真报告
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

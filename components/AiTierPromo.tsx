
import React from 'react';
import {
  CloudSun,
  Edit,
  Rocket,
  Clock,
  ArrowRightLeft,
  ShieldCheck,
  Battery,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { AI_TIER_PROMOS, type PromoIcon } from './aiTierPromoData';
import type { AiTier } from './StrategyConfigPage';

const PROMO_ICON: Record<PromoIcon, React.ComponentType<{ className?: string }>> = {
  weather: CloudSun,
  edit: Edit,
  rocket: Rocket,
  clock: Clock,
  layers: ArrowRightLeft,
  shield: ShieldCheck,
  battery: Battery,
  expand: TrendingUp,
};

/** 档位阶梯上每档的一句话，用于让客户看清自己站在哪一级 */
const TIER_LADDER: { tier: AiTier; note: string }[] = [
  { tier: '基础', note: '天气联动' },
  { tier: '标准', note: '逐段排程' },
  { tier: 'PRO', note: '逐段排程 + 动态增容' },
];

/**
 * 未开通态下 AI 策略档位的宣传页。
 * 三档共用一套版式，靠 accent 配色与内容区分。
 *
 * 这里**不放开通按钮** —— 开通入口统一在左侧列表区的引导卡里，
 * 同一屏再挂一个就成了重复入口（领导明确要求过去掉重复的开通按钮）。
 */
export default function AiTierPromo({ tier }: { tier: AiTier; onActivate?: () => void }) {
  const P = AI_TIER_PROMOS[tier];

  return (
    <div className="space-y-4">
      {/* Hero：档位 + 一句话定位 + 展开说明 */}
      <div
        className="rounded-2xl border px-6 py-5"
        style={{ background: P.accent.bg, borderColor: P.accent.border }}
      >
        <div className="flex items-center flex-wrap gap-2 mb-2.5">
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-black border bg-white"
            style={{ color: P.accent.color, borderColor: P.accent.border }}
          >
            AI 策略 · {P.tier}
          </span>
          <span className="text-[10px] font-bold text-[#93A1B0]">
            未开通 · 开通后可查看本档调度参数并下发至站点
          </span>
        </div>

        <h3 className="text-xl font-black tracking-tight" style={{ color: P.accent.color }}>
          {P.tagline}
        </h3>
        <p className="text-[13px] text-[#5A6B7C] leading-relaxed mt-2.5 max-w-3xl">{P.pitch}</p>

        {/* 档位阶梯：让客户看清这一档在整条梯子上的位置 */}
        <div
          className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-4 pt-3.5 border-t"
          style={{ borderColor: P.accent.border }}
        >
          {TIER_LADDER.map((l, i) => {
            const on = l.tier === tier;
            return (
              <React.Fragment key={l.tier}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                <span
                  className={`text-[11px] ${on ? 'font-black' : 'font-medium text-[#93A1B0]'}`}
                  style={on ? { color: P.accent.color } : undefined}
                >
                  {l.tier}
                </span>
                <span className={`text-[10px] ${on ? 'font-bold text-[#5A6B7C]' : 'text-[#B6C1CC]'}`}>
                  {l.note}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 核心能力 */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-1 h-3.5 rounded-full" style={{ background: P.accent.color }} />
          <span className="text-[13px] font-black text-[#1A2A3A]">这档能做什么</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {P.highlights.map(h => {
            const Icon = PROMO_ICON[h.icon];
            return (
              <div
                key={h.title}
                className="rounded-xl border border-[#EAEDF2] bg-white px-4 py-3.5 flex gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: P.accent.bg, color: P.accent.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-black text-[#1A2A3A]">{h.title}</div>
                  <p className="text-[12px] text-[#7F8C8D] leading-relaxed mt-0.5">{h.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 规格：只写可核对的实现事实，不写收益 */}
      <div className="rounded-xl border border-[#EAEDF2] bg-[#FBFCFD] px-4 py-3">
        <div className="text-[11px] font-black text-[#8A98A6] mb-2.5">规格</div>
        <div className="flex flex-wrap gap-x-10 gap-y-2.5">
          {P.specs.map(s => (
            <div key={s.label}>
              <div className="text-[10px] text-[#9AA7B4]">{s.label}</div>
              <div className="text-[12px] font-bold text-[#2C3E50] mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 适合的站点 */}
      <div className="rounded-xl border border-[#EAEDF2] px-4 py-3.5">
        <div className="text-[11px] font-black text-[#8A98A6] mb-2">适合这些站点</div>
        <ul className="space-y-1.5">
          {P.fitFor.map(f => (
            <li key={f} className="flex items-start gap-2 text-[12px] text-[#5A6B7C] leading-relaxed">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: P.accent.color }} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 划边界：本档不包含什么 */}
      {P.notIncluded && (
        <div className="flex items-start gap-2 rounded-xl border border-[#EAEDF2] bg-[#FBFCFD] px-4 py-3">
          <span className="text-[10px] font-black text-[#93A1B0] shrink-0 mt-0.5">不包含</span>
          <p className="text-[12px] text-[#7F8C8D] leading-relaxed">{P.notIncluded}</p>
        </div>
      )}
    </div>
  );
}

/**
 * AI 策略三档（基础 / 标准 / PRO）的宣传页文案与规格（单一真源）。
 * --------------------------------------------------------------------------
 * 用在「策略配置 · 策略组合列表」：未开通态下点击某档 AI 策略，右侧展示对应宣传页。
 *
 * 三条纪律（别破）：
 * 1. 只讲**这档能做什么**，不讲收益承诺。任何「提升 X%」都要有实测出处，
 *    宣传页里不出现未经验证的数字，避免和策略运行报告的实测口径打架。
 * 2. 三档的差异必须来自**实现差异**（见 StrategyConfigPage 的 ai-basic / ai-standard / ai-pro
 *    三个模板），不能凭空编卖点：基础 = 天气联动无排程，标准 = 15min 排程，
 *    PRO = 标准 + 动态增容。
 * 3. 文案说人话。不堆四字词组、不用「赋能 / 抓手 / 闭环」这类词。
 */

import type { AiTier } from './StrategyConfigPage';

/** 宣传页里可用的图标键（组件侧映射到 lucide 图标） */
export type PromoIcon =
  | 'weather'
  | 'edit'
  | 'rocket'
  | 'clock'
  | 'layers'
  | 'shield'
  | 'battery'
  | 'expand';

export interface AiTierPromo {
  tier: AiTier;
  /** hero 上的一句话定位 */
  tagline: string;
  /** 展开说清「解决什么问题」，两三句 */
  pitch: string;
  /** 配色：与列表里的档位徽章同色系 */
  accent: { color: string; bg: string; border: string };
  /** 核心能力，3 到 4 条 */
  highlights: { icon: PromoIcon; title: string; desc: string }[];
  /** 规格。只写可核对的实现事实，不写收益 */
  specs: { label: string; value: string }[];
  /** 适合哪些站点 */
  fitFor: string[];
  /** 本档不包含什么。划清边界，免得客户预期错位 */
  notIncluded?: string;
}

export const AI_TIER_PROMOS: Record<AiTier, AiTierPromo> = {
  基础: {
    tier: '基础',
    tagline: '不改你的策略，只按天气替你换挡',
    pitch:
      '站点自己调好的几套策略不用动。轻智能只做一件事：按实时天气判断今天该上哪一套。绑定一次，晴天用哪套、雨雪天用哪套，之后不用人守着切。',
    accent: { color: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD' },
    highlights: [
      {
        icon: 'weather',
        title: '天气联动',
        desc: '晴天、多云、阴天、雨雪各绑一套策略，天气变了自动换，不用人工值守。',
      },
      {
        icon: 'edit',
        title: '不碰你的参数',
        desc: '绑定的对象是站点已有的自定义策略。充放阈值、SOC 预留这些，AI 一律不改。',
      },
      {
        icon: 'rocket',
        title: '零改造上线',
        desc: '不用加装设备、不用改接线。开通后在页面上绑定天气与策略即可生效。',
      },
    ],
    specs: [
      { label: '天气档位', value: '晴天 / 多云 / 阴天 / 雨雪' },
      { label: '绑定对象', value: '站点自定义策略' },
      { label: '调度方式', value: '按天气切换，无逐时段排程' },
    ],
    fitFor: [
      '已经有几套自己调好的策略，只想让天气替你决定用哪套的站点',
      '雨雪多云天光伏出力掉得厉害、固定一套策略跑不满的站点',
      '不想改现有配置、希望快速试一下 AI 的站点',
    ],
    notIncluded:
      '不含 AI 逐时段充放电排程。需要由 AI 按电价和负荷逐段下发充放电的，看标准档。',
  },

  标准: {
    tier: '标准',
    tagline: '把储能交给 AI 逐时段排',
    pitch:
      '天盈 AI 按站点负荷、分时电价和光伏出力，把一天拆成 15 分钟一段，逐段算出该充还是该放、功率多少，下发到站端执行。什么时候充、什么时候放不再靠一张固定时刻表。',
    accent: { color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
    highlights: [
      {
        icon: 'clock',
        title: '15 分钟排程',
        desc: '一天 96 个时间点，逐点下发充放电功率，站端按排程执行。',
      },
      {
        icon: 'layers',
        title: '多策略按时段拼接',
        desc: '峰谷套利和全额消纳（自发自用）各管一段，按分时电价和光伏出力拼成一天的排程。',
      },
      {
        icon: 'shield',
        title: '防逆流约束',
        desc: '每个时段可单独设可逆流阈值，光伏大发时不让电倒送上网挨罚。',
      },
      {
        icon: 'battery',
        title: 'SOC 预留可调',
        desc: '每个时段分别指定充电、放电的 SOC 预留区间，给突变负荷和光伏留出缓冲。',
      },
    ],
    specs: [
      { label: '排程粒度', value: '15 分钟' },
      { label: '覆盖策略', value: '峰谷套利 / 全额消纳（自发自用）' },
      { label: '可调参数', value: '可逆流阈值 · SOC 预留 · 放电阈值' },
    ],
    fitFor: [
      '峰谷价差明显、想把储能收益跑满的站点',
      '光伏自用比例高，要同时兼顾就地消纳和防逆流的站点',
      '现在用固定时刻表、换个季节就得重调的站点',
    ],
    notIncluded: '不含动态增容。变压器容量吃紧的站点，看 PRO。',
  },

  PRO: {
    tier: 'PRO',
    tagline: '容量不够，让 AI 把出力顶上去',
    pitch:
      '标准档解决「什么时候充放」，PRO 再解决「能放多少」。变压器容量吃紧时，天盈 AI 会在不超容的前提下实时放宽储能放电上限，把原本被容量卡住的那部分出力拿回来。',
    accent: { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    highlights: [
      {
        icon: 'expand',
        title: '动态增容',
        desc: '按实时负荷动态放宽储能放电上限，不用为了峰值去做扩容改造。',
      },
      {
        icon: 'shield',
        title: '充放偏移缓冲带',
        desc: '超容阈值和逆流阈值各留一段缓冲。突然来负荷或来光伏，都不会顶穿边界。',
      },
      {
        icon: 'layers',
        title: '混合排程',
        desc: '同一份 15 分钟排程里，动态增容与峰谷套利按段拼接，各管一段。',
      },
      {
        icon: 'clock',
        title: '与标准档同一条下发链路',
        desc: '排程粒度、下发方式、参数查看都一致，从标准档升上来不用重新适配。',
      },
    ],
    specs: [
      { label: '排程粒度', value: '15 分钟' },
      { label: '覆盖策略', value: '动态增容 / 峰谷套利' },
      { label: '可调参数', value: '允许充电偏移量 · 允许放电偏移量' },
    ],
    fitFor: [
      '变压器容量吃紧、扩容改造又贵又要排期的站点',
      '负荷峰值和光伏高峰错开、容量利用率一直上不去的站点',
      '已经在用标准档，想再榨一层出力出来的站点',
    ],
  },
};

/**
 * 消息中心数据层（单一真源）。
 * --------------------------------------------------------------------------
 * 右上角「消息通知」的条目全部从这里取，组件不写死文案。
 *
 * 可见性由生命周期决定：一条消息只在它**真实发生过**的状态下出现 ——
 * 未开通态看不到「试运行已开通」，正式态看不到「试用期即将到期」。
 * 这与项目里「状态只挂在跟它相关的地方」是同一条规矩。
 *
 * 与「系统消息 / 报警」是两回事：报警是设备侧的异常（走报警管理），
 * 这里是产品侧 / 运营侧的到达通知（推送、开通、到期、报告生成）。
 */

import type { Lifecycle } from './BusinessReportPage';
import { TY_SIM_DELTA, TY_TRIAL_META, fmt } from './tianyingReportData';

/** 消息类型：决定图标与配色 */
export type NotifyKind = 'ai-report' | 'lifecycle' | 'expiry' | 'report';

/** 类型外观。图标在组件里按 kind 映射，这里只管标签与配色 */
export const NOTIFY_KIND_META: Record<NotifyKind, { label: string; color: string; bg: string }> = {
  'ai-report': { label: '仿真推送', color: '#1E9C7E', bg: '#E8F7F1' },
  lifecycle: { label: '状态变更', color: '#3B82F6', bg: '#EFF6FF' },
  expiry: { label: '到期提醒', color: '#B45309', bg: '#FEF3C7' },
  report: { label: '报告生成', color: '#6366F1', bg: '#EEF2FF' },
};

export interface NotifyItem {
  id: string;
  kind: NotifyKind;
  title: string;
  body: string;
  /** 发生时间，'YYYY-MM-DDTHH:mm'，列表按此倒序 */
  at: string;
  /** 默认未读。需要客户「动手」的条目为 true，纯历史记录为 false */
  defaultUnread: boolean;
  /** 在哪些生命周期下可见 */
  lifecycles: Lifecycle[];
  /** 点击跳转的页面名；'sim-report' 表示直接打开仿真报告弹窗 */
  target?: string;
  /** 可选条件，返回 false 则整条不展示（用于到期提醒的阈值判断） */
  onlyWhen?: () => boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
const dstr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 今天。用来把当天发生的消息显示成「今天 09:00」 */
const TODAY = dstr(new Date());

/** 距今 n 天的日期。到期日跟着系统日期走，放久了也不会变成过去时 */
const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dstr(d);
};

/**
 * 到期提醒的触发阈值（剩余天数）。
 * 不设阈值的话，一条「即将到期」会常年挂在消息中心里，提醒就失效了。
 * 试运行期 30 天 → 过半即提醒；正式运行是年度服务 → 提前 60 天提醒续期。
 */
export const EXPIRY_THRESHOLD_DAYS = { trial: 15, formal: 60 } as const;

/** 正式运行服务（年度订阅）剩余天数。mock 值，仅用于演示到期提醒 */
const FORMAL_SERVICE_DAYS = 52;

/** 试用期到期日，与 TY_TRIAL_META.remainingDays 同源 */
export const TRIAL_EXPIRE_DATE = plusDays(TY_TRIAL_META.remainingDays);
/** 正式运行服务到期日 */
export const FORMAL_EXPIRE_DATE = plusDays(FORMAL_SERVICE_DAYS);

export const NOTIFY_ITEMS: NotifyItem[] = [
  {
    id: 'trial-expiring',
    kind: 'expiry',
    title: '试用期即将到期',
    body: `试用期剩余 ${TY_TRIAL_META.remainingDays} 天，${TRIAL_EXPIRE_DATE} 到期。到期后 AI 策略将回退至固定时段基线策略，可一键升级正式版。`,
    at: `${TODAY}T09:00`,
    defaultUnread: true,
    lifecycles: ['trial'],
    onlyWhen: () => TY_TRIAL_META.remainingDays <= EXPIRY_THRESHOLD_DAYS.trial,
    target: '策略运行报告',
  },
  {
    id: 'formal-expiring',
    kind: 'expiry',
    title: '正式运行服务即将到期',
    body: `AI 智能调度服务剩余 ${FORMAL_SERVICE_DAYS} 天，${FORMAL_EXPIRE_DATE} 到期。到期后模型将停止按实测数据滚动校准，请提前续期。`,
    at: `${TODAY}T09:00`,
    defaultUnread: true,
    lifecycles: ['formal'],
    onlyWhen: () => FORMAL_SERVICE_DAYS <= EXPIRY_THRESHOLD_DAYS.formal,
    target: '策略运行报告',
  },
  {
    id: 'sim-report',
    kind: 'ai-report',
    title: '天盈 AI 仿真报告已送达',
    body: `2026-09 站点仿真测算已完成，AI 策略较实际运行可多创收 ${fmt(TY_SIM_DELTA.net, 0)} 元/月。点击查看逐项对照与典型日曲线。`,
    at: '2026-10-08T10:30',
    defaultUnread: true,
    lifecycles: ['presale'],
    target: 'sim-report',
  },
  {
    id: 'formal-activated',
    kind: 'lifecycle',
    title: '正式版 AI 智能调度已开通',
    body: 'AI 智能调度进入常态化托管，试用期专项模块已替换为长期累积收益与模型迭代日志。',
    at: '2026-10-06T11:20',
    defaultUnread: false,
    lifecycles: ['formal'],
    target: '策略运行报告',
  },
  {
    id: 'biz-report',
    kind: 'report',
    title: '9 月经营分析报告已生成',
    body: '2026-09 经营分析报告已生成，含收益构成、光伏 / 储能收益拆分与月度经营数据。',
    at: '2026-10-01T09:14',
    defaultUnread: true,
    lifecycles: ['presale', 'trial', 'formal'],
    target: '经营分析报告',
  },
  {
    id: 'strategy-report',
    kind: 'report',
    title: '9 月策略运行报告已生成',
    body: '2026-09 策略运行报告已生成，含 AI 增益指标、限电止损台账与逐日明细。',
    at: '2026-10-01T09:12',
    defaultUnread: true,
    lifecycles: ['presale', 'trial', 'formal'],
    target: '策略运行报告',
  },
  {
    id: 'trial-activated',
    kind: 'lifecycle',
    title: 'AI 智能调度试运行已开通',
    body: '试用期 30 天已开始，策略运行报告与经营分析报告已切换为试运行口径（实测 AI 轨迹 vs 后台基线仿真）。',
    // 与 TY_TRIAL_META.elapsedDays = 18 对齐：09-22 + 18 天 = 今天
    at: '2026-09-22T15:40',
    defaultUnread: false,
    lifecycles: ['trial', 'formal'],
    target: '策略运行报告',
  },
];

/** 当前生命周期下可见的消息，按时间倒序 */
export function visibleNotifications(lifecycle: Lifecycle): NotifyItem[] {
  return NOTIFY_ITEMS.filter(n => n.lifecycles.includes(lifecycle))
    .filter(n => (n.onlyWhen ? n.onlyWhen() : true))
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

/** 列表右上角的时间：当天显示「今天 HH:mm」，更早显示「MM-DD HH:mm」 */
export function notifyTimeLabel(at: string): string {
  const [d, t] = at.split('T');
  return d === TODAY ? `今天 ${t}` : `${d.slice(5)} ${t}`;
}

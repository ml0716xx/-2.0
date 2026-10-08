/* ==========================================================================
   天盈 AI 报告 · 数据层
   --------------------------------------------------------------------------
   三份数据同源，服务同一条用户旅程（售前 → 试运行 → 正式运行）：

     1. TY_SIM    售前《天盈 AI 仿真报告》
                  口径：站点实际运行（固定规则） vs AI 策略仿真
                  来源：《微电网 AI 策略调度全生命周期用户旅程与交互闭环设计》
                        售前推广阶段 ——「历史数据 AI 仿真」

     2. TY_TRIAL  试运行期增益
                  口径：实测 AI 轨迹 vs 后台同源基线仿真轨迹（反向仿真）
                  来源：试运行阶段 ——「双轨迹对比」

     3. TY_FORMAL 正式运行期归因
                  口径：实测 AI vs 虚拟基线归因
                  来源：正式运行阶段 ——「峰谷平移度 / 超需量拦截率 / 自消纳提能」

     4. BIZ_*     经营分析报告（康达新材料-1#站 2026年09月）
                  来源：客户实际经营分析报告 PDF 正文（第一章月度经营总览 +
                        第二章指标分析），供智能报告 · 经营分析报告页使用

   站点统一为「康达新材料-1#站」，保证三份报告讲的是同一个站、同一个月。
   数字与经营分析报告 PDF 对齐：PDF 报告口径
     · 总用电量 51 万 kWh，原始度电成本 0.74 元/kWh，光储系统后 0.62 元/kWh
     · 共节约 6.12 万元 = 光伏收益 3.03 万元 + 储能收益 3.09 万元
   仿真/试运行/正式三态的增益数字在此基准上按各阶段口径扩展。
   ========================================================================== */

/* ---------------------------- 站点与报告元信息 ---------------------------- */
export const TY_META = {
  station: '康达新材料-1#站',
  stationFull: '上海康达新材料 1# 站',
  region: '上海市奉贤区',
  period: '2026-09',
  periodLabel: '2026年09月',
  version: 'AI 策略仿真 V1.0',
  /** 报告编号前缀，展示时拼月份 */
  reportNoPrefix: 'TY-SIM',
  /** 报告口径说明，弹窗与页面共用 */
  caliberNote:
    '本报告基于站点历史实际负荷与光伏出力数据，在相同输入条件下回算 AI 调度策略，与实际运行结果逐项对比。两侧采用同一份负荷与光伏数据，差异可直接归因于策略本身。',
} as const;

/* ---------------------------- 站点配置参数 ---------------------------- */
/** 与经营分析报告 PDF 站点信息一致 */
export const TY_SITE = {
  pvCapacityKwp: 760,
  pvInverters: 5,
  essCapacityKwh: 1040,
  essUnits: 4,
  chargers: 0,
  essPowerKw: 500,
  socRange: '5% ~ 95%',
} as const;

/** 原始运行指标（两侧共用的站点实测值，来自报表表计原值） */
export const TY_RAW_ROWS: { name: string; value: number; unit: string; note: string }[] = [
  { name: '光伏发电量', value: 28406, unit: 'kWh', note: '当月累计，平均每日 946.88 kWh' },
  { name: '光伏上网电量', value: 412, unit: 'kWh', note: '余电上网，占发电量 1.45%' },
  { name: '光伏自用电量', value: 27994, unit: 'kWh', note: '就地消纳，消纳率 98.55%' },
  { name: '储能充电量', value: 49700, unit: 'kWh', note: '当月累计' },
  { name: '储能放电量', value: 45500, unit: 'kWh', note: '当月累计' },
  { name: '储能利用率', value: 91.55, unit: '%', note: '放电量 ÷ 充电量' },
  { name: '电网上网电量', value: 48.59, unit: '万kWh', note: '电网下网电量' },
  { name: '微网用电量', value: 50.97, unit: '万kWh', note: '负载总用电量' },
];

/* ==========================================================================
   一、售前《天盈 AI 仿真报告》
   ========================================================================== */

/** 核心 KPI：总收益两侧对照（金额单位：元，全月） */
export const TY_SIM_KPI = {
  total: { real: 61200, sim: 69030, label: '总收益（全月）', unit: '元' },
  storage: { real: 30900, sim: 39050, label: '储能收益', unit: '元' },
  pv: { real: 30300, sim: 29980, label: '光伏收益', unit: '元' },
  unit: { real: 0.679, sim: 0.786, label: '单位放电净收益', unit: '元/kWh' },
} as const;

/** 净增额与提升比例（由 KPI 派生，避免两处写法不一致） */
export const TY_SIM_DELTA = {
  net: TY_SIM_KPI.total.sim - TY_SIM_KPI.total.real,
  storageDiff: TY_SIM_KPI.storage.sim - TY_SIM_KPI.storage.real,
  pvDiff: TY_SIM_KPI.pv.sim - TY_SIM_KPI.pv.real,
  liftPct: ((TY_SIM_KPI.total.sim - TY_SIM_KPI.total.real) / TY_SIM_KPI.total.real) * 100,
} as const;

/** 逐项对照表（弹窗「仿真收益对比」与 AI 策略收益 tab 未开通态共用） */
export const TY_SIM_ROWS: {
  item: string;
  real: number;
  sim: number;
  unit: string;
  note: string;
}[] = [
  { item: '储能充电量', real: 49700, sim: 54300, unit: 'kWh', note: 'AI 在谷段增加充电' },
  { item: '储能放电量', real: 45500, sim: 49700, unit: 'kWh', note: 'AI 在峰段增加放电' },
  { item: '储能收益', real: 30900, sim: 39050, unit: '元', note: '收益增量主来源' },
  { item: '光伏上网电量', real: 412, sim: 386, unit: 'kWh', note: '余电去向微调' },
  { item: '光伏自用电量', real: 27994, sim: 28020, unit: 'kWh', note: '自用比例基本持平' },
  { item: '光伏收益', real: 30300, sim: 29980, unit: '元', note: '消纳率已高位，变化有限' },
  { item: '总收益', real: 61200, sim: 69030, unit: '元', note: '储能 +8,150 元、光伏 -320 元' },
];

/** 收益增量来源（量价分解） */
export const TY_SIM_WHY = [
  {
    no: '①',
    title: '储能',
    amount: '+8,150 元',
    tone: 'up' as const,
    mechanism: '低谷时段充电、高峰时段放电替代购电，收益来源为分时电价价差。',
    evidence:
      '谷段充电量由 2.96 万 kWh 提升至 3.31 万 kWh，峰段放电量由 3.14 万 kWh 提升至 3.52 万 kWh。' +
      '单位放电净收益 0.679 元/kWh → 0.786 元/kWh，为增量主要来源。',
  },
  {
    no: '②',
    title: '光伏',
    amount: '-320 元',
    tone: 'down' as const,
    mechanism: '光伏结算单价取决于消纳去向：站内自用按购电电价抵扣，余电上网按上网电价结算。',
    evidence:
      '站点光伏消纳率已达 98.55%，可腾挪空间有限。仿真侧余电上网减少 26 kWh，' +
      '自用增加 26 kWh，两侧电价差 0.684 元/kWh，合计 -320 元。',
  },
];

/** 电价口径 */
export const TY_PRICE = {
  tou: [
    { key: 'peak', label: '峰', price: 1.0752, window: '08:00–11:00、18:00–21:00' },
    { key: 'flat', label: '平', price: 0.6417, window: '06:00–08:00、11:00–18:00、21:00–22:00' },
    { key: 'valley', label: '谷', price: 0.2975, window: '22:00–06:00' },
  ],
  salePrice: 0.391,
  chargeWeighted: 0.3124,
  dischargeWeighted: 0.9168,
  spread: 0.6044,
  note: '购电分时三档为站点执行电价；充电/放电加权电价为仿真侧按逐 15min 用电量加权结果。',
} as const;

/** 典型日：AI 仿真侧充放电时段结构（每月取 3 个典型日代表不同电价结构） */
export const TY_CASE_DAYS = [
  {
    date: '2026-09-12',
    tag: '差异最大',
    storageDiff: 486,
    totalDiff: 452,
    rows: [
      { name: '储能充电量 (kWh)', real: 1652, sim: 1836 },
      { name: '储能放电量 (kWh)', real: 1518, sim: 1694 },
      { name: '储能收益 (元)', real: 1030, sim: 1516 },
      { name: '光伏收益 (元)', real: 1010, sim: 1004 },
    ],
    reading:
      'AI 将 184 kWh 充电量从平段挪至谷段，放电量增加 176 kWh 且集中在峰段，当日储能收益差 +486 元，是当月差异最大的典型日。',
  },
  {
    date: '2026-09-20',
    tag: '代表日',
    storageDiff: 312,
    totalDiff: 298,
    rows: [
      { name: '储能充电量 (kWh)', real: 1610, sim: 1742 },
      { name: '储能放电量 (kWh)', real: 1480, sim: 1615 },
      { name: '储能收益 (元)', real: 1002, sim: 1314 },
      { name: '光伏收益 (元)', real: 986, sim: 972 },
    ],
    reading:
      '当日光伏出力中等、负荷平稳，AI 的增益主要来自峰谷时段重排，放电量增幅 9.1%，收益增幅 31.1%。',
  },
  {
    date: '2026-09-25',
    tag: '反向日',
    storageDiff: -58,
    totalDiff: -74,
    rows: [
      { name: '储能充电量 (kWh)', real: 1704, sim: 1668 },
      { name: '储能放电量 (kWh)', real: 1562, sim: 1540 },
      { name: '储能收益 (元)', real: 1088, sim: 1030 },
      { name: '光伏收益 (元)', real: 1042, sim: 1026 },
    ],
    reading:
      '当日实际运行侧恰好在峰段完成大部分放电，AI 仿真未再提升，收益差为 -58 元，属策略边际收窄的正常波动。',
  },
];

/* ==========================================================================
   二、AI 增益指标（单一真源）
   --------------------------------------------------------------------------
   指标集合严格等于【策略运行报告】已渲染的指标，不新增任何口径、不发明指标。
   · 经营分析报告 · AI 策略收益 tab = 本节指标的精简视图
   · 策略运行报告的顶部专属模块也取自本节，保证两页同一状态下数字完全一致
   · 无对应指标的内容（长期累积收益、模型迭代日志、峰谷平移度、超需量拦截率、
     试用期累计省钱、年化预估等）一律不出现
   ========================================================================== */

export const AI_GAIN = {
  /** 统计天数与 AI 运行天数（策略运行报告口径：当月 31 天、AI 运行 26 天） */
  days: 31,
  aiDays: 26,
  /** AI 运行时长（策略运行报告头部同源） */
  aiRuntimePct: 83.52,
  aiRuntimeHours: 431.41,

  /* ---- 核心三项（策略运行报告 LEVEL 1） ---- */
  /** 全月综合运行总收益（元） */
  totalRevenue: 83850,
  /** AI 提升收益（元）＝ 全月综合运行总收益 − 基础策略收益合计 */
  aiBoost: 14260,
  /** AI 提升收益幅度（%） */
  aiBoostPct: 15.7,
  /** 综合度电成本（元/kWh） */
  unitCost: 0.386,
  /** 基准综合度电成本（元/kWh，对比基准） */
  unitCostBase: 0.458,
  /** 综合度电成本降幅（元/kWh） */
  unitCostDelta: 0.072,
  /** 综合度电成本降幅（%） */
  unitCostPct: 15.7,

  /* ---- 光伏收益（策略运行报告「1. 光伏收益」板块） ---- */
  pv: {
    revenue: 51200,
    sharePct: 61.1,
    /** 消纳率（%） */
    consumptionRate: 96.8,
    consumptionBase: 88.1,
    consumptionDelta: 8.7,
    /** 发电量（万kWh） */
    generation: 3.74,
    generationBase: 3.66,
    generationDelta: 2.1,
    /** 上网电量（万kWh） */
    gridExport: 0.52,
    gridExportBase: 0.59,
    gridExportDelta: -11.5,
    /** 入储电量（万kWh） */
    toStorage: 1.18,
    toStorageBase: 0.95,
    toStorageDelta: 24.6,
    /** 限电止损（元） */
    curtailmentSaved: 2230,
    /** 限电止损电量（kWh） */
    curtailmentEnergy: 238.9,
  },

  /* ---- 储能收益（策略运行报告「2. 储能收益」板块） ---- */
  ess: {
    revenue: 32650,
    sharePct: 38.9,
    /** 综合利用率（%） */
    utilRate: 97.2,
    utilBase: 84.8,
    utilDelta: 12.4,
    /** 充电量（万kWh） */
    charge: 1.62,
    chargeBase: 1.28,
    chargeDelta: 26.8,
    /** 放电量（万kWh） */
    discharge: 1.54,
    dischargeBase: 1.18,
    dischargeDelta: 30.2,
    /** 充电成本（元/kWh） */
    chargeCost: 0.312,
    chargeCostBase: 0.358,
    chargeCostDelta: -12.8,
    /** 放电价格（元/kWh） */
    dischargePrice: 0.925,
    dischargePriceBase: 0.867,
    dischargePriceDelta: 6.7,
    /** 充放价差 · 套利空间（元/kWh） */
    spread: 0.613,
    spreadBase: 0.509,
  },

  /** 指标口径说明：弹窗、AI tab、策略运行报告三处共用同一句话 */
  caliberNote:
    '以上指标与【策略运行报告】同源，为其精简视图；两侧数据来自同一份报表与同一套算法回算口径。',
} as const;

/** 限电止损（策略运行报告「限电止损」卡片口径） */
export const AI_CURTAILMENT = {
  savedTotal: AI_GAIN.pv.curtailmentSaved,
  energyTotal: AI_GAIN.pv.curtailmentEnergy,
  avgSavedDaily: AI_GAIN.pv.curtailmentSaved / AI_GAIN.days,
} as const;

/* ---------------------------- 日收益序列（与策略运行报告同源） ---------------------------- */
/** 非 AI 运行日（当月 6 / 12 / 18 / 24 / 30 日），与 26 / 31 天口径对齐 */
const NON_AI_DAYS = new Set([6, 12, 18, 24, 30]);

/** 确定性权重：避免随机数导致每次渲染数字跳动 */
function weights(n: number, seed: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    out.push(0.75 + (s / 2147483648) * 0.5);
  }
  return out;
}

/** 归一化到指定合计，尾项吸收舍入误差，保证合计可与报表对账 */
function normalizeToTotal(w: number[], total: number): number[] {
  const sum = w.reduce((a, b) => a + b, 0);
  const raw = w.map(x => Math.round((x / sum) * total));
  raw[raw.length - 1] += total - raw.reduce((a, b) => a + b, 0);
  return raw;
}

const BASE_TOTAL = AI_GAIN.totalRevenue - AI_GAIN.aiBoost;
const baseRaw = normalizeToTotal(weights(AI_GAIN.days, 20260701), BASE_TOTAL);
const boostRaw = normalizeToTotal(weights(AI_GAIN.aiDays, 20260715), AI_GAIN.aiBoost);

let boostIdx = 0;

/** 日收益序列：AI 运行日 = 基础策略收益 + AI 提升收益；非 AI 日仅基础策略收益 */
export const AI_DAILY = Array.from({ length: AI_GAIN.days }, (_, i) => {
  const day = i + 1;
  const hasAi = !NON_AI_DAYS.has(day);
  const base = baseRaw[i];
  const boost = hasAi ? boostRaw[boostIdx++] : 0;
  return { day: `${day}日`, hasAi, base, boost, total: base + boost };
});

/* ==========================================================================
   三、试用期设定
   --------------------------------------------------------------------------
   仅承载「试用期长度」与「对比基线名称」这类设定项，不含任何收益指标。
   ========================================================================== */

export const TY_TRIAL_META = {
  remainingDays: 12,
  totalDays: 30,
  elapsedDays: 18,
  baselineName: '后台基线仿真（传统固定时段策略）',
  realName: '实测 AI 策略轨迹',
} as const;

/* ==========================================================================
   四、经营分析报告（康达新材料-1#站 2026年09月，与客户 PDF 报告同源）
   ========================================================================== */

/** 报告头部与站点信息 */
export const BIZ_META = {
  title: '智能微网 2026年09月经营分析报告',
  region: '上海市奉贤区',
  entity: '上海康达新材料',
  siteLabel: '康达新材料-1#站',
  periodRange: '2026-09-01 ~ 2026-09-30',
} as const;

/** 一、月度经营总览 —— 收益构成（环形图） */
export const BIZ_REVENUE = {
  totalWan: 6.12,
  items: [
    { key: 'pv', label: '光伏收益', valueWan: 3.03, color: '#1E9C7E' },
    { key: 'ess', label: '储能收益', valueWan: 3.09, color: '#3B82F6' },
    { key: 'ev', label: '充电收益', valueWan: 0, color: '#F59E0B' },
  ],
} as const;

/** 一、月度经营总览 —— 四象限指标卡 */
export const BIZ_CARDS = [
  { label: '光伏发电量', value: '2.84', unit: '万kWh', tone: 'pv' },
  { label: '储能充电量', value: '4.97', unit: '万kWh', tone: 'ess' },
  { label: '储能放电量', value: '4.55', unit: '万kWh', tone: 'ess' },
  { label: '上网电量', value: '412', unit: 'kWh', tone: 'pv' },
  { label: '电网下网电量', value: '48.59', unit: '万kWh', tone: 'grid' },
  { label: '微网用电量', value: '50.97', unit: '万kWh', tone: 'load' },
] as const;

/** 站点基本信息（报告首段） */
export const BIZ_SITE_INFO = [
  { label: '站点位置', value: '上海市奉贤区' },
  { label: '光伏装机容量', value: '760 kWp' },
  { label: '逆变器', value: '5 台' },
  { label: '储能装机容量', value: '1.04 MWh' },
  { label: '储能设备', value: '4 台' },
  { label: '充电桩', value: '0 台' },
] as const;

/* ---------------------------- 逐日序列（30 天） ---------------------------- */
/** 确定性伪随机，避免每次渲染数值跳动 */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const rnd = seeded(20260901);
const DAYS = 30;

/** 光伏：日发电量（kWh）与日收益（元） */
export const BIZ_PV_DAILY = Array.from({ length: DAYS }, (_, i) => {
  const base = 700 + rnd() * 520;
  const kwh = Math.round(base * 10) / 10;
  const revenue = Math.round(kwh * 1.0667 * 100) / 100;
  return { day: `${i + 1}日`, kwh, revenue };
});

/** 储能：日充电量、日放电量（kWh）与日收益（元） */
export const BIZ_ESS_DAILY = Array.from({ length: DAYS }, (_, i) => {
  const charge = Math.round(1450 + rnd() * 420);
  const discharge = Math.round(charge * 0.9155);
  const revenue = Math.round(discharge * 0.679 * 100) / 100;
  return { day: `${i + 1}日`, charge, discharge, revenue };
});

/** 充电桩：本月无充电桩，全 0（PDF 同口径） */
export const BIZ_EV_DAILY = Array.from({ length: DAYS }, (_, i) => ({
  day: `${i + 1}日`,
  kwh: 0,
  revenue: 0,
}));

/** 二、指标分析 —— 2.1 光伏消纳率 */
export const BIZ_CONSUMPTION = {
  monthTotalKwh: 28500,
  selfUseKwh: 28100,
  rate: 98.55,
  daily: Array.from({ length: DAYS }, (_, i) => {
    const gen = Math.round(720 + rnd() * 480);
    const rate = 96.5 + rnd() * 2.6;
    return {
      day: `${i + 1}日`,
      gen,
      selfUse: Math.round(gen * (rate / 100)),
      rate: Math.round(rate * 100) / 100,
    };
  }),
} as const;

/** 二、指标分析 —— 2.2 度电成本 */
export const BIZ_UNIT_COST = {
  totalUseWanKwh: 51,
  gridUseWanKwh: 48.59,
  rawCost: 0.74,
  optimizedCost: 0.62,
  savedWan: 6.12,
  note: '本月度，总用电量 51 万kWh，其中电网用电电量 48.59 万kWh，原始用电成本 0.74 元/kWh，使用光储系统后，用电成本为 0.62 元/kWh，共节约 6.12 万元。',
  daily: Array.from({ length: DAYS }, (_, i) => {
    const load = Math.round(15000 + rnd() * 5500);
    const grid = Math.round(load * 0.9527);
    return { day: `${i + 1}日`, load, grid, rawCost: 0.74, optimizedCost: 0.62 };
  }),
} as const;

/** 光伏 / 储能 分项说明文字（PDF 分析段落同源） */
export const BIZ_NOTES = {
  pv: '本项目电站光伏装机容量为 760 kWp，2026年09月光伏月总发电量为 2.84 万kWh，平均每日发电量为 946.88 kWh，当年累计年发电量为 5.32 万kWh。月总收益为 3.03 万元，其中自用收益 3.02 万元，上网收益 161.09 元。',
  ess: '本项目 2026年09月储能月总充电量为 4.97 万kWh，月总放电量为 4.55 万kWh，累计年总充电量为 9.92 万kWh，年总放电量为 9.17 万kWh。月总收益为 3.09 万元。',
  ev: '本项目 2026年09月充电桩月总充电量为 0 kWh，累计年总充电量为 0 kWh，月总收益为 0 元。',
  consumption:
    '本月度，光伏总发电量 2.85 万kWh，光伏自用电量 2.81 万kWh，本月光伏消纳率为 98.55%。',
  unitCost:
    '本月度，总用电量 51 万kWh，其中电网用电电量 48.59 万kWh，原始用电成本 0.74 元/kWh，使用光储系统后，用电成本为 0.62 元/kWh，共节约 6.12 万元。',
} as const;

/* ---------------------------- 通用格式化 ---------------------------- */
export const fmt = (v: number | null | undefined, d = 2) => {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return v.toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
};

/** 带符号金额 */
export const fmtSigned = (v: number, d = 0) => `${v > 0 ? '+' : ''}${fmt(v, d)}`;

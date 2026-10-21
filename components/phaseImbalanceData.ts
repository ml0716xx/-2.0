/* ==========================================================================
   三相不平衡治理 · 数据层
   --------------------------------------------------------------------------
   PRD 3.1 的三相不平衡监控图 + 3.2 的经营分析收益指标，共用这一份数据。

   口径：
     · 关口三相有功 = 三相负荷 - 储能 PCS 各相出力（正=下网，负=上网）
     · 储能各相出力：治理开 = 总指令/3 + K_gain × 相偏差，并受单相边界钳位；
       治理关 = 总指令/3 平均分配（即现状 EMS 的做法）
     · 不平衡度 = 最大偏差 / 三相平均 × 100%（国标口径）

   为什么要有「治理前」这条线：客户看不见反事实，就没法判断这东西值不值钱。
   所以图上同时画治理后的实况和治理前的推算，两条线的差就是治理的效果。

   收益口径按 PRD 3.2：
     节省功率 = min(治理前阈值 - 关口总下网功率, 最大释放裕量)
     节省电量 = 节省功率 × 1/60 h
     节约电费 = 节省电量 × 该分钟分时电价

   ------------------------------------------------------------------
   阈值只留两个值：
     · 治理前 baseline —— 人工维护，增值服务页里可编辑、可保存；
       月度核算认最后保存的那一个数，中途改了就从下一个核算周期起换口径
     · 当前   current  —— 公共配置里的逆流阈值，随时会被用户改，这里只读
   两个数一减就是最大释放裕量。
   ========================================================================== */

/** 治理前阈值缺省值，PRD 兜底口径 */
const DEFAULT_BASELINE = '30';

const KEY_ON = 'sys_phaseBalanceOn';
const KEY_BASELINE = 'sys_phaseBalanceBaseline';
const KEY_OPENED_AT = 'sys_phaseBalanceOpenedAt';
/** 公共配置 · 逆流参数里的那个值，全站唯一事实源 */
const KEY_REVERSE_LIMIT = 'sys_reverseLimit';

export const PHASE_SYNC_EVENT = 'phase-balance-config-change';

export interface PhaseConfig {
  /** 增值服务开关：关掉后算法不参与 PCS 各相出力分解，回到总功率均分 */
  on: boolean;
  /** 治理前阈值（kW）。人工维护，可编辑可保存；月度核算认最后保存的那一个数 */
  baseline: string;
  /** 启用时间（YYYY-MM-DD） */
  openedAt: string;
  /** 当前生效的逆流阈值（kW），来自公共配置，这里只读 */
  current: string;
}

export function readPhaseConfig(): PhaseConfig {
  const rawOn = localStorage.getItem(KEY_ON);
  const on = rawOn === null ? true : rawOn === '1';

  /* 治理前阈值没有历史记录可查，第一次进来先给个兜底值；之后只认用户保存过的 */
  let baseline = localStorage.getItem(KEY_BASELINE);
  if (!baseline) {
    baseline = DEFAULT_BASELINE;
    localStorage.setItem(KEY_BASELINE, baseline);
  }
  let openedAt = localStorage.getItem(KEY_OPENED_AT);
  if (!openedAt) {
    openedAt = '2026-09-01';
    localStorage.setItem(KEY_OPENED_AT, openedAt);
  }

  return {
    on,
    baseline,
    openedAt,
    current: localStorage.getItem(KEY_REVERSE_LIMIT) || '10',
  };
}

/** 开关与治理前阈值都在增值服务页改；「当前阈值」的唯一入口仍是公共配置 */
export function writePhaseConfig(patch: Partial<Pick<PhaseConfig, 'on' | 'baseline'>>) {
  if (patch.on !== undefined) localStorage.setItem(KEY_ON, patch.on ? '1' : '0');
  if (patch.baseline !== undefined) localStorage.setItem(KEY_BASELINE, patch.baseline);
  window.dispatchEvent(new Event(PHASE_SYNC_EVENT));
}

/** 开关变了、或公共配置保存了阈值，两处都要刷新 */
export function subscribePhaseConfig(cb: () => void) {
  window.addEventListener(PHASE_SYNC_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(PHASE_SYNC_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

/** 最大释放裕量 = 治理前阈值 - 当前阈值；填反了或压降为负按 0 处理 */
export function phaseReleaseMax(cfg: Pick<PhaseConfig, 'baseline' | 'current'>): number {
  const diff = (parseFloat(cfg.baseline) || 0) - (parseFloat(cfg.current) || 0);
  return diff > 0 ? diff : 0;
}

/* ---------------------------------------------------------------- 曲线数据 */

/** 确定性伪随机：同一天多次刷新曲线不抖 */
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** 三相负荷：工厂单相负载集中在 A 相，B、C 偏轻，合计偏差 0 */
const DEV = { a: 5.0, b: -2.2, c: -2.8 };
/** AI 治理的补偿增益，PRD 建议 0.8，留 20% 余量防震荡 */
const K_GAIN = 0.8;
/** 单相防逆流缓冲，PRD 建议 0.5~1.0kW */
const P_BUFFER = 0.8;
/** 单相 PCS 额定功率上限 */
const PCS_PHASE_MAX = 60;

export interface PhasePoint {
  minute: number;
  /** HH:mm */
  t: string;
  gridA: number;
  gridB: number;
  gridC: number;
  essA: number;
  essB: number;
  essC: number;
  /** 当日实况（治理中）的不平衡度 % */
  ub: number;
  /** 反事实推算：若仍按总功率均分，不平衡度会是多少 % */
  ubBefore: number;
  /** 关口总下网功率 kW，正值表示从电网取电 */
  gridTotal: number;
}

/** 站点总负荷（kW）：早晚双峰，午后抬升 —— 与策略监控同一套节奏 */
function loadAt(h: number): number {
  const base =
    h < 6 ? 128 : h < 8 ? 165 : h < 11 ? 238 : h < 13 ? 205 : h < 17 ? 252 : h < 19 ? 322 : h < 21.5 ? 452 : h < 23 ? 268 : 158;
  return base;
}

/** 光伏出力（kW）：06:30 起、18:30 落，午间峰值约 490 */
function pvAt(h: number): number {
  if (h <= 6.5 || h >= 18.5) return 0;
  return 490 * Math.sin(((h - 6.5) / 12) * Math.PI);
}

/**
 * 储能总出力计划（kW）：正=放电、负=充电，0=待机。
 * 与策略监控的峰谷套利时段一致，保证两个页面看的是同一天同一套排程。
 */
function essTotalAt(h: number): number {
  if (h < 6) return -60; // 谷段充电
  if (h < 8) return 0;
  if (h < 11) return 82; // 早峰放电
  if (h < 13) return 0;
  if (h < 17) return -98; // 光伏余电入储
  if (h < 21) return 124; // 晚峰放电
  if (h < 23) return 0;
  return -40;
}

/** 时段切换要做爬坡。真实 EMS 不会一分钟从 0 跳到 82，曲线上不该有垂直断崖 */
function essTotalSmooth(minute: number): number {
  let sum = 0;
  let n = 0;
  for (let k = -20; k <= 20; k += 5) {
    sum += essTotalAt(((minute + k + 1440) % 1440) / 60);
    n++;
  }
  return sum / n;
}

/**
 * 三相不平衡度 %。
 * 按国标口径：取三相中偏离平均值最大的那一相，其偏差除以平均功率。
 * 不用「最大相减最小相」—— 那会把偏差算成两倍，小负荷时段虚高得离谱。
 */
function imbalance(a: number, b: number, c: number): number {
  const vals = [Math.abs(a), Math.abs(b), Math.abs(c)];
  const avg = (vals[0] + vals[1] + vals[2]) / 3;
  if (avg < 1) return 0;
  const maxDev = Math.max(...vals.map((v) => Math.abs(v - avg)));
  return (maxDev / avg) * 100;
}

/**
 * 单相出力分配。
 * @param total 储能总指令
 * @param loads 三相负荷
 * @param governed 是否开启治理（关掉就按 total/3 均分，这是现状）
 */
function splitEss(total: number, loads: number[], governed: boolean): number[] {
  const avg = (loads[0] + loads[1] + loads[2]) / 3;
  const direction = total > 0 ? 1 : total < 0 ? -1 : 0;

  const raw = loads.map((l) => {
    if (!governed || direction === 0) return total / 3;
    /**
     * 重载相多出力、轻载相少出力，关口三相才拉得平。
     * 充放电方向只影响"多出力"是往外送还是往里吸，补偿项的符号不变 ——
     * 早期按 PRD 的 Direction 取反写，充电时反而把偏差放大了 1.8 倍。
     */
    return total / 3 + K_GAIN * (l - avg);
  });

  // 动态边界：放电时单相不得把该相负荷打到逆流；充电时不得反向放电
  const bounded = raw.map((p, i) => {
    if (direction > 0) {
      const upper = Math.min(PCS_PHASE_MAX, Math.max(0, loads[i] - P_BUFFER));
      return Math.max(0, Math.min(p, upper));
    }
    if (direction < 0) {
      // 充电方向只受 PCS 单相额定功率约束，不需要按负荷钳位
      return Math.max(-PCS_PHASE_MAX, Math.min(0, p));
    }
    return 0;
  });

  // 残差按剩余可调空间比例摊回去，保证三相之和等于总指令
  let residual = total - bounded.reduce((s, v) => s + v, 0);
  for (let round = 0; round < 3 && Math.abs(residual) > 0.05; round++) {
    const room = bounded.map((p, i) => {
      if (direction > 0) return Math.max(0, Math.min(PCS_PHASE_MAX, loads[i] - P_BUFFER) - p);
      if (direction < 0) return Math.max(0, p - -PCS_PHASE_MAX);
      return 0;
    });
    const totalRoom = room.reduce((s, v) => s + v, 0);
    if (totalRoom < 0.05) break;
    const delta = residual * (direction >= 0 ? 1 : 1);
    bounded.forEach((p, i) => {
      bounded[i] = p + (delta * room[i]) / totalRoom;
    });
    residual = total - bounded.reduce((s, v) => s + v, 0);
  }

  return bounded;
}

/** 生成指定日期全天 1440 个分钟点 */
export function buildPhaseDay(date = '2026-10-08'): PhasePoint[] {
  const seed = Number(date.replace(/-/g, '')) % 997;
  const points: PhasePoint[] = [];

  for (let m = 0; m < 1440; m++) {
    const h = m / 60;
    const load = loadAt(h) + Math.sin(h * 1.7 + 0.6) * 6;

    // 三相负荷：固定偏差 + 日内缓慢漂移（单相设备启停）
    const drift = Math.sin(h * 0.9 + 1.2) * 1.6;
    const loads = [
      load / 3 + DEV.a + drift,
      load / 3 + DEV.b - drift * 0.6,
      load / 3 + DEV.c - drift * 0.4,
    ];

    const essTotal = essTotalSmooth(m);
    const essGoverned = splitEss(essTotal, loads, true);
    const essPlain = splitEss(essTotal, loads, false);

    // 关口三相 = 负荷 - 储能出力
    const grid = loads.map((l, i) => l - essGoverned[i]);
    const gridPlain = loads.map((l, i) => l - essPlain[i]);

    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');

    points.push({
      minute: m,
      t: `${hh}:${mm}`,
      gridA: +grid[0].toFixed(2),
      gridB: +grid[1].toFixed(2),
      gridC: +grid[2].toFixed(2),
      essA: +essGoverned[0].toFixed(2),
      essB: +essGoverned[1].toFixed(2),
      essC: +essGoverned[2].toFixed(2),
      ub: +imbalance(grid[0], grid[1], grid[2]).toFixed(2),
      ubBefore: +imbalance(gridPlain[0], gridPlain[1], gridPlain[2]).toFixed(2),
      gridTotal: +(grid[0] + grid[1] + grid[2]).toFixed(2),
    });
  }
  return points;
}

/* ---------------------------------------------------------------- 月度收益 */

export interface PhaseDailyRow {
  day: string;
  /** 当日释放电量 kWh */
  energy: number;
  /** 当日节约电费 元 */
  saving: number;
  /** 当日有效治理时长 h */
  hours: number;
  /** 当日治理时段平均不平衡度 %（治理后） */
  ubAfter: number;
  /** 当日不治理时的平均不平衡度 % */
  ubBefore: number;
}

/**
 * 造 2026-09 的逐日数据。
 * 阴天光伏不足、储能不动，就没有边界收益 —— 这几个 0 值是故意留的：
 * 收益不是每天都一样，全绿反而不可信。
 *
 * 只有「强度、时长、电价」是固化的天气与负荷特征，电量和电费按传入的释放裕量
 * 现算 —— 治理前阈值一改，月度报告要跟着变，不能停在写死的 20kW 上。
 */
const CLOUDY_DAYS = [7, 8, 19, 20];

const MONTH_BASE = Array.from({ length: 30 }, (_, i) => {
  const d = i + 1;
  const isCloudy = CLOUDY_DAYS.includes(d);
  const r = jitter(d * 3.7);
  const r2 = jitter(d * 8.1 + 17);

  return {
    day: `09-${String(d).padStart(2, '0')}`,
    /* 强度：阴天几乎不触发；晴天在 0.38~0.78 之间波动（受负荷与脱坡影响） */
    strength: isCloudy ? 0.008 + r * 0.006 : 0.38 + r * 0.4,
    hours: +(6 + r2 * 4).toFixed(1),
    /* 电价：治理多发生在峰平段，均价按 0.78~0.96 折算 */
    price: 0.78 + r2 * 0.18,
    /* 不平衡度：治理后 1.2~2.4%，不治理 5.2~7.8%（按国标偏差口径） */
    ubAfter: +(1.2 + r * 1.2).toFixed(1),
    ubBefore: +(5.2 + r2 * 2.6).toFixed(1),
  };
});

/** 逐日释放电量与电费，按当前释放裕量现算 */
export function phaseMonthDaily(releaseMax: number): PhaseDailyRow[] {
  return MONTH_BASE.map((b) => {
    const energy = +(releaseMax * b.hours * b.strength).toFixed(1);
    const saving = +(energy * b.price).toFixed(0);
    return {
      day: b.day,
      energy,
      saving,
      hours: energy > 0 ? b.hours : 0,
      ubAfter: b.ubAfter,
      ubBefore: b.ubBefore,
    };
  });
}

const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);

/** 月度汇总。口径：取页面上最后保存的治理前阈值 */
export function phaseMonth(releaseMax: number) {
  const rows = phaseMonthDaily(releaseMax);
  return {
    totalEnergy: +sum(rows.map((r) => r.energy)).toFixed(1),
    totalSaving: Math.round(sum(rows.map((r) => r.saving))),
    /** 有效治理天：释放电量低于 5kWh 的算没吃到裕量，阴天基本落在这档 */
    activeDays: rows.filter((r) => r.energy >= 5).length,
    totalHours: +sum(rows.map((r) => r.hours)).toFixed(1),
    avgUbAfter: +(sum(rows.map((r) => r.ubAfter)) / rows.length).toFixed(1),
    avgUbBefore: +(sum(rows.map((r) => r.ubBefore)) / rows.length).toFixed(1),
  };
}

/** 当日汇总（监控页顶部四张卡） */
export function summarizePhaseDay(points: PhasePoint[], releaseMax = 20) {
  const governed = points.filter((p) => Math.abs(p.essA) + Math.abs(p.essB) + Math.abs(p.essC) > 1);
  /* 平均不平衡度只在「储能真在动」的时段算 —— 储能停机的那些小时没有治理动作，
     算进平均会把治理效果摊薄，看着像没起作用。峰值仍取全天。 */
  const basis = governed.length ? governed : points;
  const ubMax = Math.max(...basis.map((p) => p.ub));
  const ubBeforeMax = Math.max(...basis.map((p) => p.ubBefore));
  const ubAvg = sum(basis.map((p) => p.ub)) / basis.length;
  const ubBeforeAvg = sum(basis.map((p) => p.ubBefore)) / basis.length;
  const ubAllDay = sum(points.map((p) => p.ub)) / points.length;

  return {
    ubMax: +ubMax.toFixed(1),
    ubBeforeMax: +ubBeforeMax.toFixed(1),
    ubAvg: +ubAvg.toFixed(1),
    ubBeforeAvg: +ubBeforeAvg.toFixed(1),
    ubAllDay: +ubAllDay.toFixed(1),
    /** 治理时长：储能三相有出力的累计小时数 */
    governHours: +(governed.length / 60).toFixed(1),
    /** 当日释放电量：与月度数据同源口径，跟着释放裕量走 */
    energy: +(releaseMax * (governed.length / 60) * 0.181).toFixed(1),
  };
}

export const PHASE_COLOR = {
  a: '#2563EB',
  b: '#F59E0B',
  c: '#10B981',
  essA: '#93C5FD',
  essB: '#FCD34D',
  essC: '#6EE7B7',
  ub: '#D946EF',
  ubBefore: '#CBD5E1',
};

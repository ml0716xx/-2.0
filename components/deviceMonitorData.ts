/* ==========================================================================
   监控中心 · 设备监控 —— 设备树、测点定义与曲线数据
   --------------------------------------------------------------------------
   设备监控跟其他监控页不一样：它看的是「设备本身活得好不好」，不是「能量怎么流」。
   所以数据模型是两层的：

     设备（网关 / 变压器 / 电表 / 传感器 / 储能柜 / PCS）
       └ 测点（信号强度、A 相电压、SOC ……）

   页面只干两件事：
     1 设备数据 —— 单台设备，全测点摊开看。历史看曲线，最新看数值
     2 对比分析 —— 多台设备、多个测点摆在一张图上比，或者拉成明细表

   为什么把测点定义写成常量而不是从接口拿：原型要能离线演示，
   而且测点的 unit / 小数位 / 是否累计量这三件事决定了图表怎么画，
   分散到各页面写会不一致。
   ========================================================================== */

export type DeviceKind = 'gateway' | 'transformer' | 'meter' | 'sensor' | 'cabinet' | 'pcs';

export interface DevicePoint {
  key: string;
  label: string;
  unit: string;
  /** 基准值：最新值用它，历史曲线围绕它波动 */
  base: number;
  /** 波动幅度 */
  amp: number;
  /** 小数位 */
  decimals: number;
  /** 累计量：一天里单调爬升，不能按正弦波画 */
  cumulative?: boolean;
  /** 无数据：列表里显示 --，这是真实存在的空列 */
  noData?: boolean;
  /** 非数值测点（电表类型、通讯方式），不参与画图 */
  text?: string;
}

export interface DeviceNode {
  id: string;
  name: string;
  kind: DeviceKind;
  sn: string;
  online: boolean;
  /** 告警条数，卡片上那枚「正常 (n)」 */
  alarms: number;
  points: DevicePoint[];
  children?: DeviceNode[];
  /** 网关才有：DO（数字输出）口数量，由设备上报，不是用户填的 */
  doCount?: number;
}

const pt = (
  key: string,
  label: string,
  unit: string,
  base: number,
  amp: number,
  decimals: number,
  extra: Partial<DevicePoint> = {},
): DevicePoint => ({ key, label, unit, base, amp, decimals, ...extra });

/* ---------- 16 网关：看的是通信与定位，不是电量 ---------- */
const GATEWAY_POINTS: DevicePoint[] = [
  pt('rssi', '信号强度', '%', 90, 3, 0),
  pt('cellD1', '基站定位 d1', '-', 0, 0, 0, { noData: true }),
  pt('gpsAcc', 'EMS GPS 定位精度', 'm', 2.4, 0.6, 2),
  pt('mem', '内存利用率', '%', 20.2, 1.1, 2),
  pt('gpsLng', 'EMS GPS 定位经度', '°', 118.7801, 0.0004, 4),
  pt('cellLac', '基站定位 lac', '-', 0, 0, 0, { noData: true }),
];

/* ---------- 防逆流电表：37 个测点，电量、功率、电压电流都在这里 ---------- */
const METER_POINTS: DevicePoint[] = [
  pt('pA', '瞬时A相有功功率', 'kW', 0, 6, 1),
  pt('pB', '瞬时B相有功功率', 'kW', 0, 5, 1),
  pt('pC', '瞬时C相有功功率', 'kW', 0, 5, 1),
  pt('qTotal', '瞬时总无功功率', 'kVar', -420, 60, 1),
  pt('qA', '瞬时A相无功功率', 'kVar', 0, 20, 1),
  pt('qB', '瞬时B相无功功率', 'kVar', 243.6, 30, 1),
  pt('qC', '瞬时C相无功功率', 'kVar', 0, 20, 1),
  pt('sTotal', '总视在功率', 'kVA', 480, 40, 1),
  pt('sA', 'A相视在功率', 'kVA', 160, 15, 1),
  pt('sB', 'B相视在功率', 'kVA', 160, 15, 1),
  pt('sC', 'C相视在功率', 'kVA', 160, 15, 1),
  pt('freq', '电网频率', 'Hz', 50, 0.05, 2),
  pt('exportE', '上网电量（反向有功总电能）', 'kWh', 61864, 240, 1, { cumulative: true }),
  pt('importE', '下网电量', 'kWh', 68660, 380, 1, { cumulative: true }),
  pt('activeE', '当前组合有功总电能', 'kWh', 130524, 620, 1, { cumulative: true }),
  pt('maxDemand', '本月最大需量', 'kW', 860, 10, 0),
  pt('demand', '实时需量', 'kW', 642, 58, 0),
  pt('meterType', '电表类型', '-', 0, 0, 0, { text: '三相四线' }),
  pt('pfTotal', '总功率因数', '-', 0, 0, 2),
  pt('pfA', 'A相功率因数', '-', 0, 0, 2),
  pt('pfB', 'B相功率因数', '-', 0, 0, 2),
  pt('pfC', 'C相功率因数', '-', 0, 0, 2),
  pt('meterNo', '电表表号', '-', 0, 0, 0, { text: 'TMEA0104X400' }),
  pt('comm', '通讯方式', '-', 0, 0, 0, { text: '4G' }),
  pt('peakE', '高峰时段有功总电量', 'kWh', 680, 40, 1),
  pt('sharpE', '尖峰时段有功总电量', 'kWh', 320, 20, 1),
  pt('periodE', '各时段有功总电量', 'kWh', 4200, 120, 1),
  pt('uA', 'A相电压', 'V', 10280, 40, 0),
  pt('uB', 'B相电压', 'V', 10280, 40, 0),
  pt('uC', 'C相电压', 'V', 10220, 40, 0),
  pt('iA', 'A相电流', 'A', 27.7, 1.2, 1),
  pt('iB', 'B相电流', 'A', 27.7, 1.2, 1),
  pt('iC', 'C相电流', 'A', 27.7, 1.2, 1),
  pt('reactiveE', '当前组合无功总电能', 'kVarh', 5772.8, 60, 1, { cumulative: true }),
];

const TRANSFORMER_POINTS: DevicePoint[] = [
  pt('oilTemp', '油面温度', '℃', 56, 2.5, 1),
  pt('windTemp', '绕组温度', '℃', 72, 3, 1),
  pt('loadRate', '负载率', '%', 46, 8, 1),
  pt('hvVolt', '高压侧电压', 'kV', 10.2, 0.12, 2),
  pt('lvVolt', '低压侧电压', 'V', 400, 4, 0),
  pt('hvCurr', '高压侧电流', 'A', 28, 4, 1),
];

const SENSOR_POINTS: DevicePoint[] = [
  pt('temp', '温度', '℃', 32.4, 1.6, 1),
  pt('hum', '湿度', '%RH', 61, 4, 0),
];

const CABINET_POINTS: DevicePoint[] = [
  pt('soc', 'SOC', '%', 68, 5, 0),
  pt('soh', 'SOH', '%', 96, 0.4, 1),
  pt('packVolt', '电池簇电压', 'V', 728, 6, 0),
  pt('packCurr', '电池簇电流', 'A', 42, 8, 1),
  pt('cellTempMax', '最高单体温度', '℃', 31.2, 1.2, 1),
  pt('cellTempMin', '最低单体温度', '℃', 28.6, 1, 1),
];

const PCS_POINTS: DevicePoint[] = [
  pt('pcsP', '有功功率', 'kW', 120, 18, 1),
  pt('pcsQ', '无功功率', 'kVar', 5, 3, 1),
  pt('pcsEff', '转换效率', '%', 97.2, 0.6, 1),
  pt('dcVolt', '直流侧电压', 'V', 720, 8, 0),
];

const device = (
  id: string,
  name: string,
  kind: DeviceKind,
  sn: string,
  points: DevicePoint[],
  extra: Partial<DeviceNode> = {},
): DeviceNode => ({ id, name, kind, sn, online: true, alarms: 0, points, ...extra });

/**
 * 站点设备树。
 * 层级照现场的物理挂接：网关在最上，下面挂变压器，变压器下面才是电表/传感器/储能柜。
 */
export const DEVICE_TREE: DeviceNode[] = [
  device('gw-16', '16网关', 'gateway', '550a3a677c92833', GATEWAY_POINTS, {
    doCount: 4,
    children: [
      device('tr-main', '总变压器', 'transformer', 'TR-2024-0001', TRANSFORMER_POINTS, {
        children: [
          device('meter-reverse', '防逆流电表', 'meter', 'TMEA0104X400E00CH2N0200001', METER_POINTS),
        ],
      }),
      device('tr-2', '2#变压器', 'transformer', 'TR-2024-0002', TRANSFORMER_POINTS, {
        children: [
          device('meter-reverse-2', '2#变压器防逆流电表', 'meter', 'TMEA0104X400E00CH2N0200002', METER_POINTS),
          device('sensor-th-2', '2#变压器温湿度传感器', 'sensor', 'TH-2024-0002', SENSOR_POINTS),
          device('ess-3', '储能柜-3#（2号变压器）', 'cabinet', 'ESS-2024-0003', CABINET_POINTS),
          device('ess-4', '储能柜-4#（2号变压器）', 'cabinet', 'ESS-2024-0004', CABINET_POINTS),
        ],
      }),
      device('tr-5', '5#变压器', 'transformer', 'TR-2024-0005', TRANSFORMER_POINTS),
      device('tr-1', '1#变压器', 'transformer', 'TR-2024-0003', TRANSFORMER_POINTS),
      device('tr-3', '3#变压器', 'transformer', 'TR-2024-0004', TRANSFORMER_POINTS),
    ],
  }),
];

/** 默认落点：跟截图一致，进页面先看防逆流电表 */
export const DEFAULT_DEVICE_ID = 'meter-reverse';

export function flattenDevices(nodes: DeviceNode[] = DEVICE_TREE): DeviceNode[] {
  return nodes.flatMap((n) => [n, ...(n.children ? flattenDevices(n.children) : [])]);
}

const FLAT = flattenDevices();

export function findDevice(id: string): DeviceNode {
  return FLAT.find((d) => d.id === id) ?? FLAT[0];
}

/** 设备的祖先链，用来在树里把当前选中项展开 */
export function pathToDevice(id: string): string[] {
  const walk = (nodes: DeviceNode[], trail: string[]): string[] | null => {
    for (const n of nodes) {
      const next = [...trail, n.id];
      if (n.id === id) return next;
      if (n.children) {
        const hit = walk(n.children, next);
        if (hit) return hit;
      }
    }
    return null;
  };
  return walk(DEVICE_TREE, []) ?? [];
}

/** 能画曲线的测点（排除电表类型、通讯方式这类文本量） */
export const chartablePoints = (points: DevicePoint[]) => points.filter((p) => !p.text);

/* ---------- 数值生成：同一份种子保证每次渲染一致 ---------- */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const noise = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const round = (v: number, d: number) => Number(v.toFixed(d));

/**
 * 第 i 个采样点的值。
 * 累计量走向上斜坡，瞬时量走「日内双峰 + 抖动」——
 * 用正弦叠一层慢波动，看起来像真实负荷，不像随机噪声。
 */
export function valueAt(p: DevicePoint, i: number, total: number, seedStr: string): number {
  const seed = hash(seedStr + p.key);
  if (p.cumulative) {
    const t = total <= 1 ? 1 : i / (total - 1);
    return p.base + t * p.amp;
  }
  const phase = (seed % 360) * (Math.PI / 180);
  const slow = Math.sin((i / total) * Math.PI * 2 + phase);
  const fast = Math.sin((i / total) * Math.PI * 8 + phase / 2);
  const jitter = (noise(seed + i) - 0.5) * p.amp * 0.28;
  return p.base + slow * p.amp * 0.55 + fast * p.amp * 0.18 + jitter;
}

/** 最新值文案：文本测点直接给字，空列给 -- */
export function latestText(p: DevicePoint): string {
  if (p.text) return p.text;
  if (p.noData) return '--';
  return p.base.toFixed(p.decimals);
}

export function pointUnit(p: DevicePoint): string {
  return p.unit === '-' ? '' : p.unit;
}

/** 一天的采样点：默认 15 分钟一个，96 个点 */
export const DAY_BUCKETS = 96;

function labelAt(i: number, total: number): string {
  const minutes = Math.round((i / total) * 24 * 60);
  return `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** 历史数据图表：每行一个时间点，每个测点一列 */
export function buildHistoryData(points: DevicePoint[], date: string, total = DAY_BUCKETS) {
  return Array.from({ length: total }, (_, i) => {
    const row: Record<string, string | number | null> = { t: labelAt(i, total) };
    points.forEach((p) => {
      row[p.key] = p.noData ? null : round(valueAt(p, i, total, `${date}-${p.key}`), p.decimals);
    });
    return row;
  });
}

/* ---------- 对比分析 ---------- */

/** 表格总行数：15 秒一个点，约 26.5 小时，跟现场一个查询窗口对得上 */
export const TOTAL_COMPARE_ROWS = 6360;

export const COMPARE_STEP_SEC = 15;

/** 对比分析散点/折线的桶数：15 秒原始点太密，图上按 10 分钟聚合 */
export const COMPARE_BUCKETS = 204;

const pad = (n: number) => String(n).padStart(2, '0');

export function formatDateTime(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 第 index 行的时间：从起点按 15 秒往后推 */
export function compareRowTime(from: string, index: number): string {
  const base = new Date(from.replace(' ', 'T'));
  const d = new Date(base.getTime() + (index + 1) * COMPARE_STEP_SEC * 1000);
  return formatDateTime(d);
}

/** 对比图表：给定时间窗，每个选中测点一条曲线 */
export function buildCompareChart(
  series: { key: string; point: DevicePoint }[],
  total = COMPARE_BUCKETS,
) {
  return Array.from({ length: total }, (_, i) => {
    const from = new Date('2026-11-16T00:00:00');
    const d = new Date(from.getTime() + (i / (total - 1)) * 34 * 3600 * 1000);
    const row: Record<string, string | number | null> = {
      t: `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
    series.forEach(({ key, point }) => {
      row[key] = point.noData ? null : round(valueAt(point, i, total, `cmp-${key}`), point.decimals);
    });
    return row;
  });
}

/** 对比明细表里某一格的值 */
export function compareCellText(p: DevicePoint, rowIndex: number): string {
  if (p.text) return p.text;
  if (p.noData) return '--';
  const v = valueAt(p, rowIndex % 720, 720, `cmp-${p.key}`);
  return v.toFixed(p.decimals);
}

/* ---------- 视觉：设备类型对应的图标底色 ---------- */
export const KIND_TONE: Record<DeviceKind, { from: string; to: string; text: string; label: string }> = {
  gateway: { from: '#EFF6FF', to: '#DBEAFE', text: '#2563EB', label: '网关' },
  transformer: { from: '#FFFBEB', to: '#FEF3C7', text: '#D97706', label: '变压器' },
  meter: { from: '#EEF2FF', to: '#E0E7FF', text: '#4F46E5', label: '电表' },
  sensor: { from: '#FFF1F2', to: '#FFE4E6', text: '#E11D48', label: '传感器' },
  cabinet: { from: '#ECFDF5', to: '#D1FAE5', text: '#059669', label: '储能柜' },
  pcs: { from: '#F5F3FF', to: '#EDE9FE', text: '#7C3AED', label: 'PCS' },
};

/** 多条曲线的配色，按选中顺序取 */
export const SERIES_COLORS = [
  '#2563EB',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#0EA5E9',
  '#14B8A6',
  '#D946EF',
  '#84CC16',
  '#F97316',
];

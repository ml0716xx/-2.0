/* ==========================================================================
   智控版策略清单（单一真源）
   --------------------------------------------------------------------------
   智控版是一个入口，里面可以挂多条策略。这份数据两处都要用：
     · 策略配置 · 策略组合列表：智控版入口点进去的初始清单
     · 策略运行 · 策略排期 · 批量操作：选智控版时，下拉里要能挑到具体那一条
   所以预置数据放这里，运行时名字再通过 publish/read 同步一份，
   列表里新增、改名、删掉，批量操作的下拉立刻跟着变。
   ========================================================================== */

export interface ControlTierBlockSeed {
  id: string;
  startTime: string;
  endTime: string;
  threshold: string;
  reserveCharge: string;
  reserveDischarge: string;
  strategyType: string;
  dischargeThreshold: string;
  chargeOffset?: string;
  dischargeOffset?: string;
  isCollapsed: boolean;
  subPeriods: { start: string; end: string; type: '充电' | '放电' | '待机'; power: number }[];
}

export interface ControlTierSeed {
  id: string;
  name: string;
  isActive: boolean;
  blocks: ControlTierBlockSeed[];
}

/** 智控版入口的预置策略 */
export const CONTROL_TIER_SEED: ControlTierSeed[] = [
  {
    id: 'ctl-1',
    name: '工作日谷段充放',
    isActive: true,
    blocks: [
      {
        id: 'ctl-1-b1',
        startTime: '00:00',
        endTime: '07:00',
        threshold: '30',
        reserveCharge: '95',
        reserveDischarge: '0',
        strategyType: '峰谷套利',
        dischargeThreshold: '0',
        chargeOffset: '10',
        isCollapsed: true,
        subPeriods: [{ start: '00:00', end: '07:00', type: '充电', power: 300 }],
      },
      {
        id: 'ctl-1-b2',
        startTime: '18:00',
        endTime: '22:00',
        threshold: '30',
        reserveCharge: '0',
        reserveDischarge: '95',
        strategyType: '峰谷套利',
        dischargeThreshold: '42',
        dischargeOffset: '15',
        isCollapsed: true,
        subPeriods: [{ start: '18:00', end: '22:00', type: '放电', power: 300 }],
      },
    ],
  },
  {
    id: 'ctl-2',
    name: '午间光伏就地消纳',
    isActive: true,
    blocks: [
      {
        id: 'ctl-2-b1',
        startTime: '10:00',
        endTime: '15:00',
        threshold: '25',
        reserveCharge: '40',
        reserveDischarge: '10',
        strategyType: '全额消纳（自发自用）',
        dischargeThreshold: '58',
        chargeOffset: '5',
        isCollapsed: true,
        subPeriods: [],
      },
    ],
  },
  {
    id: 'ctl-3',
    name: '傍晚需量控制',
    isActive: false,
    blocks: [
      {
        id: 'ctl-3-b1',
        startTime: '17:00',
        endTime: '20:00',
        threshold: '35',
        reserveCharge: '0',
        reserveDischarge: '60',
        strategyType: '需量控制',
        dischargeThreshold: '50',
        dischargeOffset: '20',
        isCollapsed: true,
        subPeriods: [],
      },
    ],
  },
];

/** 运行时清单：以策略组合列表里的实际内容为准，默认取预置数据 */
let runtimeNames: string[] = CONTROL_TIER_SEED.map((s) => s.name);
const bus = new EventTarget();
const EVENT = 'control-tier-names-change';

/** 策略组合列表改动后调用，把最新名字广播出去 */
export function publishControlTierNames(names: string[]) {
  if (names.join('|') === runtimeNames.join('|')) return;
  runtimeNames = names;
  bus.dispatchEvent(new Event(EVENT));
}

export function readControlTierNames(): string[] {
  return runtimeNames;
}

export function subscribeControlTierNames(cb: () => void) {
  bus.addEventListener(EVENT, cb);
  return () => bus.removeEventListener(EVENT, cb);
}

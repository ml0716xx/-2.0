/* ==========================================================================
   AI 需量调整 —— 公共配置与策略详情共用的一份设置
   --------------------------------------------------------------------------
   公共配置 · 需量更新模式里的「AI 需量调整」= demandMode === 'ai'，
   两个基准值就是下面这两个键。策略组合列表里 AI 策略【PRO】的详情页要改同一份数据，
   所以抽出来统一读写，改任一处都发一次事件让另一处刷新。

   注意：两个面板不会同时可见（同一页的两个 tab），仍用事件是为了切 tab 回来后
   拿到最新值，也为了以后真要并排展示时不用再改。
   ========================================================================== */

export type DemandMode = 'static' | 'dynamic' | 'ai';

const KEY_MODE = 'sys_demandMode';
const KEY_BASE = 'sys_initialDemandLimit'; // 需量门限基准值
const KEY_OVERCAP = 'sys_baselineOvercapacity'; // 超限阈值基准值

const DEFAULT_BASE = '500';
const DEFAULT_OVERCAP = '470';

export const DEMAND_SYNC_EVENT = 'demand-config-change';

export interface DemandConfig {
  mode: DemandMode;
  /** 需量门限基准值（kW） */
  base: string;
  /** 超限阈值基准值（kW） */
  overcap: string;
}

export function readDemandConfig(): DemandConfig {
  const mode = localStorage.getItem(KEY_MODE);
  return {
    mode: mode === 'static' || mode === 'dynamic' || mode === 'ai' ? mode : 'dynamic',
    base: localStorage.getItem(KEY_BASE) || DEFAULT_BASE,
    overcap: localStorage.getItem(KEY_OVERCAP) || DEFAULT_OVERCAP,
  };
}

/** 写回并广播，另一处（公共配置 / 策略详情）据此刷新 */
export function writeDemandConfig(patch: Partial<DemandConfig>) {
  if (patch.mode !== undefined) localStorage.setItem(KEY_MODE, patch.mode);
  if (patch.base !== undefined) localStorage.setItem(KEY_BASE, patch.base);
  if (patch.overcap !== undefined) localStorage.setItem(KEY_OVERCAP, patch.overcap);
  window.dispatchEvent(new Event(DEMAND_SYNC_EVENT));
}

export function subscribeDemandConfig(cb: () => void) {
  window.addEventListener(DEMAND_SYNC_EVENT, cb);
  return () => window.removeEventListener(DEMAND_SYNC_EVENT, cb);
}

/** AI 寻优后的超限阈值：公共配置里同一个算法，这里复用避免两处对外显示不一致 */
export const aiOvercapValue = (overcap: string) =>
  (Math.round((parseFloat(overcap) || 470) * 0.996 * 10) / 10).toFixed(1);

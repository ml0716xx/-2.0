/* ==========================================================================
   防逆流模式 · 数据层
   --------------------------------------------------------------------------
   对应《微网单相防逆流》PRD V1.2 第 4.1 节：
     · 逆流参数里新增「防逆流模式」二选一（总功率 / 单相）
     · 逆流阈值仍然只有一个输入框，含义随模式走
     · 单相模式下分相数据缺失时，EMS 自动降级回总功率并告警

   权限控制（BR-05 / BR-20 / BR-21：未开通「防逆流模式选择」权限的站点
   看不到模式单选）按本轮口径不在原型中体现 —— 原型里所有站点都能看到模式选择。
   真正落地时这一层由云平台权限控制兜，页面按权限项做显隐即可。
   ========================================================================== */

export type ReverseMode = 'total' | 'phase';

/** 与逆流阈值同一个存储域，公共参数配置保存时一并写 */
const KEY_MODE = 'sys_reverseMode';

export const REVERSE_SYNC_EVENT = 'reverse-mode-change';

export function readReverseMode(): ReverseMode {
  return localStorage.getItem(KEY_MODE) === 'phase' ? 'phase' : 'total';
}

export function writeReverseMode(mode: ReverseMode) {
  localStorage.setItem(KEY_MODE, mode);
  window.dispatchEvent(new Event(REVERSE_SYNC_EVENT));
  /* 监控页、增值服务页监听的是 storage 事件，这里一并广播，保持全站同步 */
  window.dispatchEvent(new Event('storage'));
}

export function subscribeReverseMode(cb: () => void) {
  window.addEventListener(REVERSE_SYNC_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(REVERSE_SYNC_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

/**
 * 最近一次降级。原型里是写死的一条事实记录 —— 降级由边端数据状态触发，
 * 没有可以让人手动改的入口，所以不做成可编辑状态，只在两处引用：
 *   ① 公共参数配置的执行状态行  ② 报警管理里的降级 / 恢复两条记录
 */
export const REVERSE_DEGRADE_EVENT = {
  source: '关口表（#1 并网点）',
  reason: '分相功率数据中断',
  at: '2026-10-21 09:12:40',
  recoveredAt: '2026-10-21 09:18:02',
  /** 中断时长，给运维看影响面 */
  duration: '5 分 22 秒',
};

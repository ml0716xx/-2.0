// Mock Server API for Configuration Management

export interface SiteConfig {
  id: string;
  name: string;
  elements: any[];
  status: 'in_use' | 'editing' | 'unused';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'sys_site_configs_v2';

const COMPREHENSIVE_SCADA_ELEMENTS = [
  // --- 1. 市电电网进线与高压计量区 ---
  { id: 'grid-main', type: 'Grid', x: 500, y: 50, label: '10kV 市电主进线 #1' },
  { id: 'brk-iso-1', type: 'Breaker', x: 500, y: 105, label: '101 隔离刀闸 (合)' },
  { id: 'meter-main', type: 'Meter', x: 500, y: 155, label: '1# 高压双向关口表' },
  { id: 'brk-main', type: 'Breaker', x: 500, y: 205, label: '1011 主进断路器 (合)' },

  { id: 'grid-backup', type: 'Grid', x: 800, y: 50, label: '10kV 备用电源 #2' },
  { id: 'brk-iso-2', type: 'Breaker', x: 800, y: 105, label: '102 备用隔离开关' },
  { id: 'meter-backup', type: 'Meter', x: 800, y: 155, label: '2# 备用关口表' },
  { id: 'brk-backup', type: 'Breaker', x: 800, y: 205, label: '1021 备用断路器 (分)' },

  // --- 2. 10kV 高压主母线段 (双母线/分段接线) ---
  { id: 'busbar-10kv-1', type: 'Busbar', x1: 60, y1: 250, x2: 630, y2: 250, color: '#ec4899', label: '10kV 高压 I 段母线' },
  { id: 'brk-bus-tie', type: 'Breaker', x: 660, y: 250, label: '100 高压母联断路器 (合)' },
  { id: 'busbar-10kv-2', type: 'Busbar', x1: 690, y1: 250, x2: 1240, y2: 250, color: '#ec4899', label: '10kV 高压 II 段母线' },

  // --- 3. 支路 1: 1# 厂房屋顶光伏 (500kWp) ---
  { id: 'brk-pv1', type: 'Breaker', x: 140, y: 300, label: '111 光伏1#开关' },
  { id: 'trans-pv1', type: 'Transformer', x: 140, y: 365, label: 'T1 光伏升压变 (500kVA)' },
  { id: 'inv-pv1', type: 'Inverter', x: 140, y: 440, label: '1# 光伏逆变器' },
  { id: 'dev-pv1', type: 'PV', x: 140, y: 535, label: '1# 屋顶光伏阵列 (500kWp)' },

  // --- 4. 支路 2: 2# 园区车棚光伏 (400kWp) ---
  { id: 'brk-pv2', type: 'Breaker', x: 360, y: 300, label: '112 光伏2#开关' },
  { id: 'trans-pv2', type: 'Transformer', x: 360, y: 365, label: 'T2 光伏升压变 (400kVA)' },
  { id: 'inv-pv2', type: 'Inverter', x: 360, y: 440, label: '2# 光伏逆变器' },
  { id: 'dev-pv2', type: 'PV', x: 360, y: 535, label: '2# 车棚光伏阵列 (400kWp)' },

  // --- 5. 支路 3: 1MW/2MWh 磷酸铁锂储能系统 ---
  { id: 'brk-bess', type: 'Breaker', x: 580, y: 300, label: '113 储能主开关' },
  { id: 'trans-bess', type: 'Transformer', x: 580, y: 365, label: 'T3 储能专用变压器 (1000kVA)' },
  { id: 'inv-bess', type: 'Inverter', x: 580, y: 440, label: '1MW 双向储能 PCS' },
  { id: 'dev-bess', type: 'Battery', x: 580, y: 535, label: '1# 2MWh 储能电池舱' },

  // --- 6. 支路 4: 绿电电解水制氢站 (250kW) ---
  { id: 'brk-h2', type: 'Breaker', x: 790, y: 300, label: '121 制氢电源开关' },
  { id: 'trans-h2', type: 'Transformer', x: 790, y: 365, label: 'T4 制氢整流变 (315kVA)' },
  { id: 'inv-h2', type: 'Inverter', x: 790, y: 440, label: '制氢电源变流器' },
  { id: 'dev-h2', type: 'Hydrogen', x: 790, y: 535, label: '1# 电解水制氢站 (50Nm³/h)' },

  // --- 7. 支路 5: 园区直流快充超充桩群 (480kW) ---
  { id: 'brk-ev', type: 'Breaker', x: 1000, y: 300, label: '122 充电桩进线开关' },
  { id: 'trans-ev', type: 'Transformer', x: 1000, y: 365, label: 'T5 充电变压器 (630kVA)' },
  { id: 'meter-ev', type: 'Meter', x: 1000, y: 440, label: '快充桩总计量表' },
  { id: 'dev-ev', type: 'EVCharger', x: 1000, y: 535, label: '直流超充/快充桩群 (480kW)' },

  // --- 8. 支路 6: 厂区工业动力与综合负荷 (650kW) ---
  { id: 'brk-load', type: 'Breaker', x: 1200, y: 300, label: '123 厂区动力开关' },
  { id: 'trans-load', type: 'Transformer', x: 1200, y: 365, label: 'T6 动力主变 (800kVA)' },
  { id: 'meter-load', type: 'Meter', x: 1200, y: 440, label: '车间动力用电监测表' },
  { id: 'dev-load', type: 'Load', x: 1200, y: 535, label: '厂区综合动力与空调负荷' },

  // --- 9. 0.4kV 低压汇流母线段 ---
  { id: 'busbar-lv-1', type: 'Busbar', x1: 60, y1: 630, x2: 630, y2: 630, color: '#3b82f6', label: '0.4kV 低压 I 段母线 (源/储)' },
  { id: 'brk-lv-tie', type: 'Breaker', x: 660, y: 630, label: '040 低压母联开关 (合)' },
  { id: 'busbar-lv-2', type: 'Busbar', x1: 690, y1: 630, x2: 1240, y2: 630, color: '#3b82f6', label: '0.4kV 低压 II 段母线 (荷/氢/充)' },

  // --- 10. 潮流连线 (带动态方向与测点绑定) ---
  // 市电进线 1
  { id: 'fl-g1-1', type: 'FlowLine', x1: 500, y1: 65, x2: 500, y2: 98, color: '#ec4899', powerPointKey: 'meter_active_power' },
  { id: 'fl-g1-2', type: 'FlowLine', x1: 500, y1: 112, x2: 500, y2: 143, color: '#ec4899', powerPointKey: 'meter_active_power' },
  { id: 'fl-g1-3', type: 'FlowLine', x1: 500, y1: 167, x2: 500, y2: 198, color: '#ec4899', powerPointKey: 'meter_active_power' },
  { id: 'fl-g1-4', type: 'FlowLine', x1: 500, y1: 212, x2: 500, y2: 250, color: '#ec4899', powerPointKey: 'meter_active_power' },

  // 备用市电进线 2
  { id: 'fl-g2-1', type: 'FlowLine', x1: 800, y1: 65, x2: 800, y2: 98, color: '#94a3b8' },
  { id: 'fl-g2-2', type: 'FlowLine', x1: 800, y1: 112, x2: 800, y2: 143, color: '#94a3b8' },
  { id: 'fl-g2-3', type: 'FlowLine', x1: 800, y1: 167, x2: 800, y2: 198, color: '#94a3b8' },
  { id: 'fl-g2-4', type: 'FlowLine', x1: 800, y1: 212, x2: 800, y2: 250, color: '#94a3b8' },

  // 母联连接
  { id: 'fl-bt-1', type: 'FlowLine', x1: 630, y1: 250, x2: 653, y2: 250, color: '#ec4899' },
  { id: 'fl-bt-2', type: 'FlowLine', x1: 667, y1: 250, x2: 690, y2: 250, color: '#ec4899' },

  // 支路 1 (1# 光伏)
  { id: 'fl-pv1-1', type: 'FlowLine', x1: 140, y1: 250, x2: 140, y2: 293, color: '#3b82f6', powerPointKey: 'pv1_power' },
  { id: 'fl-pv1-2', type: 'FlowLine', x1: 140, y1: 307, x2: 140, y2: 353, color: '#3b82f6', powerPointKey: 'pv1_power' },
  { id: 'fl-pv1-3', type: 'FlowLine', x1: 140, y1: 377, x2: 140, y2: 424, color: '#3b82f6', powerPointKey: 'pv1_power' },
  { id: 'fl-pv1-4', type: 'FlowLine', x1: 140, y1: 456, x2: 140, y2: 524, color: '#3b82f6', powerPointKey: 'pv1_power' },
  { id: 'fl-pv1-5', type: 'FlowLine', x1: 140, y1: 546, x2: 140, y2: 630, color: '#3b82f6', powerPointKey: 'pv1_power' },

  // 支路 2 (2# 光伏)
  { id: 'fl-pv2-1', type: 'FlowLine', x1: 360, y1: 250, x2: 360, y2: 293, color: '#3b82f6', powerPointKey: 'pv2_power' },
  { id: 'fl-pv2-2', type: 'FlowLine', x1: 360, y1: 307, x2: 360, y2: 353, color: '#3b82f6', powerPointKey: 'pv2_power' },
  { id: 'fl-pv2-3', type: 'FlowLine', x1: 360, y1: 377, x2: 360, y2: 424, color: '#3b82f6', powerPointKey: 'pv2_power' },
  { id: 'fl-pv2-4', type: 'FlowLine', x1: 360, y1: 456, x2: 360, y2: 524, color: '#3b82f6', powerPointKey: 'pv2_power' },
  { id: 'fl-pv2-5', type: 'FlowLine', x1: 360, y1: 546, x2: 360, y2: 630, color: '#3b82f6', powerPointKey: 'pv2_power' },

  // 支路 3 (储能)
  { id: 'fl-bess-1', type: 'FlowLine', x1: 580, y1: 250, x2: 580, y2: 293, color: '#10b981', powerPointKey: 'bess_power' },
  { id: 'fl-bess-2', type: 'FlowLine', x1: 580, y1: 307, x2: 580, y2: 353, color: '#10b981', powerPointKey: 'bess_power' },
  { id: 'fl-bess-3', type: 'FlowLine', x1: 580, y1: 377, x2: 580, y2: 424, color: '#10b981', powerPointKey: 'bess_power' },
  { id: 'fl-bess-4', type: 'FlowLine', x1: 580, y1: 456, x2: 580, y2: 515, color: '#10b981', powerPointKey: 'bess_power' },
  { id: 'fl-bess-5', type: 'FlowLine', x1: 580, y1: 555, x2: 580, y2: 630, color: '#10b981', powerPointKey: 'bess_power' },

  // 支路 4 (制氢)
  { id: 'fl-h2-1', type: 'FlowLine', x1: 790, y1: 250, x2: 790, y2: 293, color: '#0284c7', powerPointKey: 'h2_power' },
  { id: 'fl-h2-2', type: 'FlowLine', x1: 790, y1: 307, x2: 790, y2: 353, color: '#0284c7', powerPointKey: 'h2_power' },
  { id: 'fl-h2-3', type: 'FlowLine', x1: 790, y1: 377, x2: 790, y2: 424, color: '#0284c7', powerPointKey: 'h2_power' },
  { id: 'fl-h2-4', type: 'FlowLine', x1: 790, y1: 456, x2: 790, y2: 515, color: '#0284c7', powerPointKey: 'h2_power' },
  { id: 'fl-h2-5', type: 'FlowLine', x1: 790, y1: 555, x2: 790, y2: 630, color: '#0284c7', powerPointKey: 'h2_power' },

  // 支路 5 (充电桩)
  { id: 'fl-ev-1', type: 'FlowLine', x1: 1000, y1: 250, x2: 1000, y2: 293, color: '#f59e0b', powerPointKey: 'ev_power' },
  { id: 'fl-ev-2', type: 'FlowLine', x1: 1000, y1: 307, x2: 1000, y2: 353, color: '#f59e0b', powerPointKey: 'ev_power' },
  { id: 'fl-ev-3', type: 'FlowLine', x1: 1000, y1: 377, x2: 1000, y2: 428, color: '#f59e0b', powerPointKey: 'ev_power' },
  { id: 'fl-ev-4', type: 'FlowLine', x1: 1000, y1: 452, x2: 1000, y2: 515, color: '#f59e0b', powerPointKey: 'ev_power' },
  { id: 'fl-ev-5', type: 'FlowLine', x1: 1000, y1: 555, x2: 1000, y2: 630, color: '#f59e0b', powerPointKey: 'ev_power' },

  // 支路 6 (厂区负荷)
  { id: 'fl-load-1', type: 'FlowLine', x1: 1200, y1: 250, x2: 1200, y2: 293, color: '#64748b', powerPointKey: 'load_power' },
  { id: 'fl-load-2', type: 'FlowLine', x1: 1200, y1: 307, x2: 1200, y2: 353, color: '#64748b', powerPointKey: 'load_power' },
  { id: 'fl-load-3', type: 'FlowLine', x1: 1200, y1: 377, x2: 1200, y2: 428, color: '#64748b', powerPointKey: 'load_power' },
  { id: 'fl-load-4', type: 'FlowLine', x1: 1200, y1: 452, x2: 1200, y2: 523, color: '#64748b', powerPointKey: 'load_power' },
  { id: 'fl-load-5', type: 'FlowLine', x1: 1200, y1: 547, x2: 1200, y2: 630, color: '#64748b', powerPointKey: 'load_power' },

  // 低压母联
  { id: 'fl-lvt-1', type: 'FlowLine', x1: 630, y1: 630, x2: 653, y2: 630, color: '#3b82f6' },
  { id: 'fl-lvt-2', type: 'FlowLine', x1: 667, y1: 630, x2: 690, y2: 630, color: '#3b82f6' },

  // --- 11. 浮动实时监测数据箱 (6 大专业数据箱) ---
  {
    id: 'box-grid',
    type: 'DataBox',
    x: 40,
    y: 35,
    title: '10kV 进线电网监测',
    color: '#8b5cf6',
    active: true,
    data: [
      { label: '关口有功功率', value: '450.5 kW', pointKey: 'meter_active_power' },
      { label: '关口无功功率', value: '-85.0 kvar', pointKey: 'meter_reactive_power' },
      { label: '电网功率因数', value: '0.98', pointKey: 'meter_pf' },
      { label: '正向有功电量', value: '45200 kWh', pointKey: 'meter_forward_active' }
    ]
  },
  {
    id: 'box-pv',
    type: 'DataBox',
    x: 40,
    y: 690,
    title: '光伏阵列全景监测',
    color: '#3b82f6',
    active: true,
    data: [
      { label: '1#光伏功率', value: '120.5 kW', pointKey: 'pv1_power' },
      { label: '2#光伏功率', value: '150.2 kW', pointKey: 'pv2_power' },
      { label: '光伏总发功率', value: '270.7 kW', pointKey: 'site_pv_total_power' },
      { label: '当日总发电量', value: '1220 kWh', pointKey: 'pv1_daily_gen' }
    ]
  },
  {
    id: 'box-bess',
    type: 'DataBox',
    x: 450,
    y: 690,
    title: '1MW/2MWh 储能监测',
    color: '#10b981',
    active: true,
    data: [
      { label: '储能充放功率', value: '-110.0 kW', pointKey: 'bess_power' },
      { label: '电池 SOC 电量', value: '68.5 %', pointKey: 'bess_soc' },
      { label: '电池 SOH 健康', value: '98.8 %', pointKey: 'bess_soh' },
      { label: '当日累计充电', value: '1250 kWh', pointKey: 'bess_charge_daily' },
      { label: '当日累计放电', value: '850 kWh', pointKey: 'bess_discharge_daily' }
    ]
  },
  {
    id: 'box-h2',
    type: 'DataBox',
    x: 770,
    y: 690,
    title: '电解水制氢工况',
    color: '#0284c7',
    active: true,
    data: [
      { label: '制氢用电功率', value: '250.0 kW', pointKey: 'h2_power' },
      { label: '实时产氢速率', value: '50.0 Nm³/h', pointKey: 'h2_rate' },
      { label: '当日累计产氢', value: '420 Nm³', pointKey: 'h2_daily_prod' },
      { label: '当日制氢耗电', value: '2050 kWh', pointKey: 'h2_daily_power' }
    ]
  },
  {
    id: 'box-load',
    type: 'DataBox',
    x: 1060,
    y: 690,
    title: '负荷与超充群监测',
    color: '#f59e0b',
    active: true,
    data: [
      { label: '快充桩群功率', value: '85.0 kW', pointKey: 'ev_power' },
      { label: '厂区动力负荷', value: '310.0 kW', pointKey: 'load_power' },
      { label: '主变负荷率', value: '58.2 %', pointKey: 'site_transformer_load_rate' },
      { label: '月度最大需量', value: '1520.0 kW', pointKey: 'site_monthly_max_demand' }
    ]
  },
  {
    id: 'box-site',
    type: 'DataBox',
    x: 960,
    y: 35,
    title: '全站综合能效指标',
    color: '#059669',
    active: true,
    data: [
      { label: '绿电消纳率', value: '96.8 %', pointKey: 'site_daily_green_ratio' },
      { label: '当日碳减排', value: '3420 kg', pointKey: 'site_daily_co2_reduction' },
      { label: '当日综合收益', value: '2860.5 元', pointKey: 'site_overall_revenue' },
      { label: '全厂总消耗', value: '645.0 kW', pointKey: 'site_load_total_power' }
    ]
  }
];

const INITIAL_MOCK_CONFIGS: SiteConfig[] = [
  {
    id: 'cfg-101',
    name: '河北国杉 10kV 源网荷储氢多能互补微电网全景组态',
    status: 'in_use',
    createdAt: '2026-01-10 09:00',
    updatedAt: '2026-08-28 10:15',
    elements: COMPREHENSIVE_SCADA_ELEMENTS
  },
  {
    id: 'cfg-102',
    name: '工业园区光储充一体化并网微电网组态',
    status: 'editing',
    createdAt: '2026-02-15 14:20',
    updatedAt: '2026-08-20 16:45',
    elements: COMPREHENSIVE_SCADA_ELEMENTS.filter(e => !e.id.includes('h2'))
  },
  {
    id: 'cfg-103',
    name: '零碳电解水绿电制氢示范微电网组态',
    status: 'unused',
    createdAt: '2026-03-01 11:30',
    updatedAt: '2026-08-15 17:00',
    elements: COMPREHENSIVE_SCADA_ELEMENTS.filter(e => !e.id.includes('ev'))
  }
];

function loadLocalConfigs(): SiteConfig[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CONFIGS));
    return INITIAL_MOCK_CONFIGS;
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0 || (parsed[0]?.elements?.length || 0) < 15) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CONFIGS));
      return INITIAL_MOCK_CONFIGS;
    }
    return parsed;
  } catch (e) {
    return INITIAL_MOCK_CONFIGS;
  }
}

function saveLocalConfigs(configs: SiteConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

// Simulated latency helper
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export async function getConfigs(siteId?: string): Promise<SiteConfig[]> {
  await delay(300);
  return loadLocalConfigs();
}

export async function getConfigById(configId: string): Promise<SiteConfig | null> {
  await delay(200);
  const configs = loadLocalConfigs();
  return configs.find(c => c.id === configId) || null;
}

export async function createConfig(name: string): Promise<SiteConfig> {
  await delay(400);
  const configs = loadLocalConfigs();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newConfig: SiteConfig = {
    id: `cfg-${Date.now()}`,
    name: name || '未命名新组态',
    status: 'editing',
    createdAt: now,
    updatedAt: now,
    elements: []
  };
  configs.push(newConfig);
  saveLocalConfigs(configs);
  return newConfig;
}

export async function updateConfigStatus(configId: string, status: 'in_use' | 'editing' | 'unused'): Promise<SiteConfig[]> {
  await delay(250);
  const configs = loadLocalConfigs();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  
  if (status === 'in_use') {
    configs.forEach(c => {
      if (c.id === configId) {
        c.status = 'in_use';
        c.updatedAt = now;
      } else if (c.status === 'in_use') {
        c.status = 'unused';
        c.updatedAt = now;
      }
    });
  } else {
    const target = configs.find(c => c.id === configId);
    if (target) {
      target.status = status;
      target.updatedAt = now;
    }
  }
  saveLocalConfigs(configs);
  return configs;
}

export async function updateConfig(configId: string, data: Partial<SiteConfig>): Promise<SiteConfig> {
  await delay(350);
  const configs = loadLocalConfigs();
  const index = configs.findIndex(c => c.id === configId);
  if (index === -1) {
    throw new Error('组态不存在');
  }
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updated: SiteConfig = {
    ...configs[index],
    ...data,
    updatedAt: now
  };
  configs[index] = updated;
  saveLocalConfigs(configs);
  return updated;
}

export async function deleteConfig(configId: string): Promise<boolean> {
  await delay(300);
  let configs = loadLocalConfigs();
  const targetIndex = configs.findIndex(c => c.id === configId);
  if (targetIndex === -1) return false;

  const wasInUse = configs[targetIndex].status === 'in_use';
  configs.splice(targetIndex, 1);

  if (wasInUse && configs.length > 0) {
    if (!configs.some(c => c.status === 'in_use')) {
      configs[0].status = 'in_use';
      configs[0].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
  }

  saveLocalConfigs(configs);
  return true;
}

export async function copyConfig(configId: string): Promise<SiteConfig> {
  await delay(400);
  const configs = loadLocalConfigs();
  const target = configs.find(c => c.id === configId);
  if (!target) {
    throw new Error('要复制的组态不存在');
  }
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newConfig: SiteConfig = {
    id: `cfg-${Date.now()}`,
    name: `${target.name}_副本`,
    status: 'unused',
    createdAt: now,
    updatedAt: now,
    elements: JSON.parse(JSON.stringify(target.elements || []))
  };
  configs.push(newConfig);
  saveLocalConfigs(configs);
  return newConfig;
}

export function resetToDefaultComprehensiveConfig(): SiteConfig[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CONFIGS));
  return INITIAL_MOCK_CONFIGS;
}


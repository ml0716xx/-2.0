// Mock Server API for Configuration Management

export interface SiteConfig {
  id: string;
  name: string;
  elements: any[];
  status: 'in_use' | 'editing' | 'unused';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'sys_site_configs';

const INITIAL_MOCK_CONFIGS: SiteConfig[] = [
  {
    id: 'cfg-101',
    name: '河北国杉 10kV 微电网主接线组态',
    status: 'in_use',
    createdAt: '2026-01-10 09:00',
    updatedAt: '2026-07-28 10:15',
    elements: [
      { id: 'grid-1', type: 'Grid', x: 500, y: 30, label: '高压进线' },
      { id: 'meter-1', type: 'Meter', x: 500, y: 100, label: '关口表' },
      { id: 'busbar-main', type: 'Busbar', x1: 100, y1: 180, x2: 900, y2: 180, color: '#d946ef', label: '母线' },
      { id: 'trans-pv1', type: 'Transformer', x: 220, y: 310, label: '变压器' },
      { id: 'dev-pv1', type: 'PV', x: 220, y: 460, label: '光伏系统' },
      { id: 'trans-bess', type: 'Transformer', x: 500, y: 310, label: '变压器' },
      { id: 'dev-bess', type: 'Battery', x: 500, y: 472, label: '储能系统' },
      { id: 'trans-load', type: 'Transformer', x: 780, y: 310, label: '变压器' },
      { id: 'dev-load', type: 'Load', x: 780, y: 460, label: '厂区负荷' },
      { id: 'conn-1', type: 'FlowLine', x1: 500, y1: 45, x2: 500, y2: 88, color: '#d946ef' },
      { id: 'conn-2', type: 'FlowLine', x1: 500, y1: 112, x2: 500, y2: 180, color: '#d946ef' },
      { id: 'conn-3', type: 'FlowLine', x1: 220, y1: 180, x2: 220, y2: 298, color: '#d946ef' },
      { id: 'conn-4', type: 'FlowLine', x1: 220, y1: 322, x2: 220, y2: 449, color: '#3b82f6', powerPointKey: 'pv1_power' },
      { id: 'conn-5', type: 'FlowLine', x1: 500, y1: 180, x2: 500, y2: 298, color: '#d946ef' },
      { id: 'conn-6', type: 'FlowLine', x1: 500, y1: 322, x2: 500, y2: 452, color: '#10b981', powerPointKey: 'bess_power' },
      { id: 'conn-7', type: 'FlowLine', x1: 780, y1: 180, x2: 780, y2: 298, color: '#d946ef' },
      { id: 'conn-8', type: 'FlowLine', x1: 780, y1: 322, x2: 780, y2: 442, color: '#64748b' },
      {
        id: 'box-summary',
        type: 'DataBox',
        x: 60,
        y: 40,
        title: '微电网监测数据箱',
        color: '#3b82f6',
        active: true,
        data: [
          { label: '光伏发电功率', value: '180.5 kW', pointKey: 'pv1_power' },
          { label: '储能充放功率', value: '-120.0 kW', pointKey: 'bess_power' },
          { label: '关口表有功', value: '450.5 kW', pointKey: 'meter_active_power' }
        ]
      }
    ]
  },
  {
    id: 'cfg-102',
    name: '二期储能扩建电气组态',
    status: 'editing',
    createdAt: '2026-02-15 14:20',
    updatedAt: '2026-07-20 16:45',
    elements: [
      { id: 'grid-2', type: 'Grid', x: 400, y: 50, label: '高压进线' },
      { id: 'busbar-2', type: 'Busbar', x1: 150, y1: 200, x2: 650, y2: 200, color: '#10b981', label: '储能专用母线' },
      { id: 'dev-bess1', type: 'Battery', x: 250, y: 350, label: '1#储能舱' },
      { id: 'dev-bess2', type: 'Battery', x: 550, y: 350, label: '2#储能舱' },
      { id: 'conn-b1', type: 'FlowLine', x1: 250, y1: 200, x2: 250, y2: 330, color: '#10b981', powerPointKey: 'bess_power' },
      { id: 'conn-b2', type: 'FlowLine', x1: 550, y1: 200, x2: 550, y2: 330, color: '#10b981' }
    ]
  }
];

function loadLocalConfigs(): SiteConfig[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CONFIGS));
    return INITIAL_MOCK_CONFIGS;
  }
  try {
    return JSON.parse(data);
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

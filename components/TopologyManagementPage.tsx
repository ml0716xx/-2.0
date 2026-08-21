import React, { useState, useRef } from 'react';
import {
  Layers,
  Zap,
  Sun,
  Battery,
  Cpu,
  Gauge,
  Activity,
  Plus,
  Minus,
  Maximize2,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Building2,
  Share2,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  SlidersHorizontal,
  ArrowRight,
  Sliders,
  Settings2,
  FileSpreadsheet,
  Workflow,
  X,
  Radio,
  Power,
  RotateCcw,
  Sparkles,
  Info,
  Lock,
  KeyRound,
  ShieldAlert,
  ArrowLeftRight,
  Check
} from 'lucide-react';

// Node Status Types
export type NodeStatus = 'normal' | 'fault' | 'offline' | 'warning';

// Topology Node Definition
export interface TopologyNode {
  id: string;
  name: string;
  deviceType: 'station' | 'transformer' | 'meter' | 'bus' | 'storage' | 'pv_inverter' | 'charging' | 'bms_cluster' | 'pcs' | 'generator';
  deviceId: string;
  status: NodeStatus;
  parentId?: string;
  voltageLevel?: string;
  ratedCapacity?: string;
  currentPower?: number; // kW
  extraMetrics?: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  children?: TopologyNode[];
}

// Topology Config Definition
export interface TopologyScheme {
  id: string;
  name: string;
  code: string;
  description: string;
  voltageLevel: string;
  transformerCapacity: string;
  activeCount: number;
  totalCount: number;
  stationName: string;
  stationId: string;
  rootBus: TopologyNode;
}

// Mock Multi-Topology Data
const TOPOLOGY_SCHEMES: TopologyScheme[] = [
  {
    id: 'topo-01',
    name: '1#变压器主接线拓扑',
    code: 'TOPO_MAIN_TR1_01',
    description: '1#站点 1250kVA 主变低压侧光储充一体化并网配电主拓扑系统',
    voltageLevel: '0.4 kV',
    transformerCapacity: '1250 kVA',
    activeCount: 10,
    totalCount: 11,
    stationName: '1#站点',
    stationId: 'CS1782377792',
    rootBus: {
      id: 'site-bus-1',
      name: '站点Bus',
      deviceId: 'CS1782377792',
      deviceType: 'station',
      status: 'normal',
      extraMetrics: [
        { label: '站点编号', value: 'CS1782377792' },
        { label: '站点名称', value: '1#站点' }
      ],
      children: [
        {
          id: 'tr-meter-group-1',
          name: '1#变压器',
          deviceId: 'THPT0000007RUJ7388',
          deviceType: 'transformer',
          status: 'normal',
          ratedCapacity: '1250 kVA',
          currentPower: 482.3,
          extraMetrics: [
            { label: '设备ID', value: 'THPT0000007RUJ7388' },
            { label: '设备名称', value: '1#变压器' },
            { label: '负载率', value: '38.6%' },
            { label: '绕组温度', value: '46.5', unit: '°C' }
          ],
          children: [
            {
              id: 'node-bus-2',
              name: '节点Bus',
              deviceId: 'BUS-0.4KV-BUS2',
              deviceType: 'bus',
              status: 'normal',
              extraMetrics: [
                { label: '节点名称', value: 'Bus2' },
                { label: '电压等级', value: '380V (0.4kV)' },
                { label: '母线频率', value: '50.02', unit: 'Hz' }
              ],
              children: [
                {
                  id: 'dev-v2g-1',
                  name: '1#世创V2G充电桩',
                  deviceId: 'THBESS0000XTUM001',
                  deviceType: 'charging',
                  status: 'normal',
                  currentPower: 60.0,
                  extraMetrics: [
                    { label: '设备ID', value: 'THBESS0000XTUM001' },
                    { label: '设备名称', value: '1#世创V2G充电桩' },
                    { label: '实时输出', value: '60.0', unit: 'kW' },
                    { label: '充电枪状态', value: '占用充电中' }
                  ]
                },
                {
                  id: 'dev-bess-1',
                  name: '1#储能柜',
                  deviceId: 'THBESS0000VNM1001',
                  deviceType: 'storage',
                  status: 'normal',
                  currentPower: 98.4,
                  extraMetrics: [
                    { label: '设备ID', value: 'THBESS0000VNM1001' },
                    { label: '设备名称', value: '1#储能柜' },
                    { label: '容量', value: '100kW / 215kWh' }
                  ],
                  children: [
                    {
                      id: 'dev-bess-1-pcs',
                      name: '1#PCS',
                      deviceId: 'THBESSPCS0K1J51',
                      deviceType: 'pcs',
                      status: 'normal',
                      currentPower: 98.4,
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSPCS0K1J51' },
                        { label: '设备名称', value: '1#PCS' },
                        { label: '运行模式', value: '恒功率放电' },
                        { label: '有功功率', value: '98.4', unit: 'kW' }
                      ]
                    },
                    {
                      id: 'dev-bess-1-bat',
                      name: '1#电池簇',
                      deviceId: 'THBESSBAT0XVQI1',
                      deviceType: 'bms_cluster',
                      status: 'normal',
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSBAT0XVQI1' },
                        { label: '设备名称', value: '1#电池簇' },
                        { label: 'SOC', value: '82.0%' },
                        { label: 'SOH', value: '99.2%' },
                        { label: '平均温度', value: '25.8', unit: '°C' }
                      ]
                    }
                  ]
                },
                {
                  id: 'dev-v2g-2',
                  name: '2#世创V2G充电桩',
                  deviceId: 'THBESS0000XTUM002',
                  deviceType: 'charging',
                  status: 'normal',
                  currentPower: 45.0,
                  extraMetrics: [
                    { label: '设备ID', value: 'THBESS0000XTUM002' },
                    { label: '设备名称', value: '2#世创V2G充电桩' },
                    { label: '实时输出', value: '45.0', unit: 'kW' },
                    { label: '运行状态', value: '正常运行' }
                  ]
                },
                {
                  id: 'dev-bess-2',
                  name: '2#储能柜',
                  deviceId: 'THBESS0000VNM2002',
                  deviceType: 'storage',
                  status: 'normal',
                  currentPower: 100.0,
                  extraMetrics: [
                    { label: '设备ID', value: 'THBESS0000VNM2002' },
                    { label: '设备名称', value: '2#储能柜' },
                    { label: '容量', value: '100kW / 215kWh' }
                  ],
                  children: [
                    {
                      id: 'dev-bess-2-bat',
                      name: '2#电池簇',
                      deviceId: 'THBESSBAT0XVQI8',
                      deviceType: 'bms_cluster',
                      status: 'normal',
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSBAT0XVQI8' },
                        { label: '设备名称', value: '2#电池簇' },
                        { label: 'SOC', value: '78.5%' },
                        { label: '最高单体电压', value: '3.342', unit: 'V' },
                        { label: '最高温度', value: '26.4', unit: '°C' }
                      ]
                    },
                    {
                      id: 'dev-bess-2-pcs',
                      name: '2#PCS',
                      deviceId: 'THBESSPCS0K1J57',
                      deviceType: 'pcs',
                      status: 'normal',
                      currentPower: 100.0,
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSPCS0K1J57' },
                        { label: '设备名称', value: '2#PCS' },
                        { label: '运行模式', value: '恒功率放电' },
                        { label: '有功功率', value: '100.0', unit: 'kW' }
                      ]
                    }
                  ]
                },
                {
                  id: 'dev-pv-2',
                  name: '2#光伏并网柜',
                  deviceId: 'THGTIVT0003N4HP',
                  deviceType: 'pv_inverter',
                  status: 'normal',
                  currentPower: 185.6,
                  extraMetrics: [
                    { label: '设备ID', value: 'THGTIVT0003N4HP' },
                    { label: '设备名称', value: '2#光伏并网柜' },
                    { label: '发电功率', value: '185.6', unit: 'kW' },
                    { label: '当日电量', value: '824.5', unit: 'kWh' }
                  ]
                },
                {
                  id: 'dev-pv-1',
                  name: '1#光伏并网柜',
                  deviceId: 'THGTIVT000R94VC',
                  deviceType: 'pv_inverter',
                  status: 'normal',
                  currentPower: 192.4,
                  extraMetrics: [
                    { label: '设备ID', value: 'THGTIVT000R94VC' },
                    { label: '设备名称', value: '1#光伏并网柜' },
                    { label: '发电功率', value: '192.4', unit: 'kW' },
                    { label: '当日电量', value: '856.2', unit: 'kWh' }
                  ]
                },
                {
                  id: 'dev-gdw-1',
                  name: '1#固德威储能柜',
                  deviceId: 'THBESSBAT0GBRW01',
                  deviceType: 'storage',
                  status: 'normal',
                  currentPower: 50.0,
                  extraMetrics: [
                    { label: '设备ID', value: 'THBESSBAT0GBRW01' },
                    { label: '设备名称', value: '1#固德威储能柜' },
                    { label: '容量', value: '50kW / 100kWh' }
                  ],
                  children: [
                    {
                      id: 'dev-gdw-1-bat',
                      name: '1#固德威电池簇',
                      deviceId: 'THBESSBAT0GBRW01B',
                      deviceType: 'bms_cluster',
                      status: 'normal',
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSBAT0GBRW01B' },
                        { label: '设备名称', value: '1#固德威电池簇' },
                        { label: 'SOC', value: '76.0%' },
                        { label: '最高温度', value: '27.1', unit: '°C' }
                      ]
                    },
                    {
                      id: 'dev-gdw-1-pcs',
                      name: '1#固德威PCS',
                      deviceId: 'THBESSPCS0GBRW01P',
                      deviceType: 'pcs',
                      status: 'normal',
                      currentPower: 50.0,
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSPCS0GBRW01P' },
                        { label: '设备名称', value: '1#固德威PCS' },
                        { label: '有功功率', value: '50.0', unit: 'kW' }
                      ]
                    }
                  ]
                },
                {
                  id: 'dev-gdw-2',
                  name: '2#固德威储能柜',
                  deviceId: 'THBESSBAT0GBRW02',
                  deviceType: 'storage',
                  status: 'normal',
                  currentPower: 48.5,
                  extraMetrics: [
                    { label: '设备ID', value: 'THBESSBAT0GBRW02' },
                    { label: '设备名称', value: '2#固德威储能柜' },
                    { label: '容量', value: '50kW / 100kWh' }
                  ],
                  children: [
                    {
                      id: 'dev-gdw-2-bat',
                      name: '2#固德威电池簇',
                      deviceId: 'THBESSBAT0GBRW02B',
                      deviceType: 'bms_cluster',
                      status: 'normal',
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSBAT0GBRW02B' },
                        { label: '设备名称', value: '2#固德威电池簇' },
                        { label: 'SOC', value: '85.2%' }
                      ]
                    },
                    {
                      id: 'dev-gdw-2-pcs',
                      name: '2#固德威PCS',
                      deviceId: 'THBESSPCS0GBRW02P',
                      deviceType: 'pcs',
                      status: 'normal',
                      currentPower: 48.5,
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSPCS0GBRW02P' },
                        { label: '设备名称', value: '2#固德威PCS' },
                        { label: '有功功率', value: '48.5', unit: 'kW' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'topo-02',
    name: '2#微电网离网备用拓扑',
    code: 'TOPO_MICROGRID_ISLAND_02',
    description: '应急孤岛与黑启动控制拓扑，支持柴油发电机与构网型储能微网供电',
    voltageLevel: '0.4 kV / 10 kV',
    transformerCapacity: '800 kVA',
    activeCount: 6,
    totalCount: 7,
    stationName: '1#站点 (备用回路)',
    stationId: 'CS1782377792-B',
    rootBus: {
      id: 'site-bus-2',
      name: '应急备用Bus',
      deviceId: 'CS1782377792-ISLAND',
      deviceType: 'station',
      status: 'normal',
      extraMetrics: [
        { label: '站点编号', value: 'CS1782377792' },
        { label: '系统模式', value: '离网备用热态' }
      ],
      children: [
        {
          id: 'tr-meter-group-2',
          name: '2#备用变压器',
          deviceId: 'THPT0000008SBK9921',
          deviceType: 'transformer',
          status: 'normal',
          ratedCapacity: '800 kVA',
          currentPower: 120.0,
          extraMetrics: [
            { label: '设备ID', value: 'THPT0000008SBK9921' },
            { label: '设备名称', value: '2#备用变压器' },
            { label: '隔离状态', value: '并网就绪' }
          ],
          children: [
            {
              id: 'node-bus-emergency',
              name: '节点Bus (应急母线)',
              deviceId: 'BUS-0.4KV-EMERGENCY',
              deviceType: 'bus',
              status: 'normal',
              extraMetrics: [
                { label: '节点名称', value: 'Bus-应急母线' },
                { label: '并离网状态', value: '自动同步投切' }
              ],
              children: [
                {
                  id: 'dev-diesel-gen',
                  name: '1#应急柴油发电机',
                  deviceId: 'THGEN0000009981',
                  deviceType: 'generator',
                  status: 'normal',
                  currentPower: 0.0,
                  extraMetrics: [
                    { label: '设备ID', value: 'THGEN0000009981' },
                    { label: '设备名称', value: '1#应急柴油发电机' },
                    { label: '额定容量', value: '500 kW' },
                    { label: '当前状态', value: '热备用待机' }
                  ]
                },
                {
                  id: 'dev-island-bess',
                  name: '构网型储能黑启动系统',
                  deviceId: 'THBESS0009GRIDFORM',
                  deviceType: 'storage',
                  status: 'normal',
                  currentPower: 50.0,
                  extraMetrics: [
                    { label: '设备ID', value: 'THBESS0009GRIDFORM' },
                    { label: '设备名称', value: '构网型储能柜' },
                    { label: '控制模式', value: 'VF虚拟同步机(VSG)' }
                  ],
                  children: [
                    {
                      id: 'dev-island-bess-bat',
                      name: '高压电池簇',
                      deviceId: 'THBESSBAT009GFB',
                      deviceType: 'bms_cluster',
                      status: 'normal',
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSBAT009GFB' },
                        { label: 'SOC', value: '92.4%' }
                      ]
                    },
                    {
                      id: 'dev-island-bess-pcs',
                      name: '构网型PCS',
                      deviceId: 'THBESSPCS009GFP',
                      deviceType: 'pcs',
                      status: 'normal',
                      currentPower: 50.0,
                      extraMetrics: [
                        { label: '设备ID', value: 'THBESSPCS009GFP' },
                        { label: '输出频率', value: '50.00 Hz' }
                      ]
                    }
                  ]
                },
                {
                  id: 'dev-island-critical-load',
                  name: '核心一类保电负荷段',
                  deviceId: 'THLOAD00001CRIT',
                  deviceType: 'charging',
                  status: 'normal',
                  currentPower: 70.0,
                  extraMetrics: [
                    { label: '设备ID', value: 'THLOAD00001CRIT' },
                    { label: '设备名称', value: '一级保电分配柜' },
                    { label: '供电保障', value: '不间断供电' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'topo-03',
    name: '3#高压进线与环网配电拓扑',
    code: 'TOPO_HV_RING_10KV_03',
    description: '10kV 进线侧高压柜、PT/CT保护测控与分段环网拓扑结构',
    voltageLevel: '10 kV',
    transformerCapacity: '2500 kVA',
    activeCount: 5,
    totalCount: 5,
    stationName: '1#高压配电房',
    stationId: 'CS1782377792-HV',
    rootBus: {
      id: 'site-bus-hv',
      name: '10kV高压进线Bus',
      deviceId: 'CS1782377792-10KV',
      deviceType: 'station',
      status: 'normal',
      extraMetrics: [
        { label: '电网电压', value: '10.24', unit: 'kV' },
        { label: '进线断路器', value: '合闸运行' }
      ],
      children: [
        {
          id: 'tr-meter-hv-1',
          name: '高压计量柜与隔离刀闸',
          deviceId: 'THHV0000001METER',
          deviceType: 'transformer',
          status: 'normal',
          ratedCapacity: '2500 kVA',
          currentPower: 680.0,
          extraMetrics: [
            { label: '总有功功率', value: '680.0', unit: 'kW' },
            { label: '高压电表', value: '正常脉冲' }
          ],
          children: [
            {
              id: 'node-bus-hv-10kv',
              name: '10kV I段高压母线',
              deviceId: 'BUS-10KV-SECTION-1',
              deviceType: 'bus',
              status: 'normal',
              extraMetrics: [
                { label: '节点名称', value: '10kV 母线' },
                { label: 'PT二次电压', value: '100.2', unit: 'V' }
              ],
              children: [
                {
                  id: 'dev-hv-tr1-feeder',
                  name: '1#主变高压出线柜',
                  deviceId: 'THHVFEBD0001TR1',
                  deviceType: 'pv_inverter',
                  status: 'normal',
                  currentPower: 482.3,
                  extraMetrics: [
                    { label: '保护装置', value: '过流速断保护投运' },
                    { label: '带载变压器', value: '1#变压器 1250kVA' }
                  ]
                },
                {
                  id: 'dev-hv-tr2-feeder',
                  name: '2#主变高压出线柜',
                  deviceId: 'THHVFEBD0002TR2',
                  deviceType: 'pv_inverter',
                  status: 'normal',
                  currentPower: 197.7,
                  extraMetrics: [
                    { label: '保护装置', value: '正常' },
                    { label: '带载变压器', value: '2#变压器 1250kVA' }
                  ]
                },
                {
                  id: 'dev-hv-svg-comp',
                  name: '高压无功补偿SVG柜',
                  deviceId: 'THSVG0000010KVA',
                  deviceType: 'pcs',
                  status: 'normal',
                  currentPower: 0.0,
                  extraMetrics: [
                    { label: '补偿容量', value: '±500 kvar' },
                    { label: '功率因数', value: '0.992' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'topo-04',
    name: '4#直流微网母线拓扑 (750V DC)',
    code: 'TOPO_DC_BUS_750V_04',
    description: '750V 直流母线互联光伏MPPT、双向储能DC/DC与超充机拓扑',
    voltageLevel: '750 V DC',
    transformerCapacity: '600 kW',
    activeCount: 7,
    totalCount: 7,
    stationName: '直流微网示范段',
    stationId: 'CS1782377792-DC',
    rootBus: {
      id: 'site-bus-dc',
      name: '直流微网总站',
      deviceId: 'CS1782377792-DCBUS',
      deviceType: 'station',
      status: 'normal',
      extraMetrics: [
        { label: '站点名称', value: '750V 直流微网' },
        { label: '母线电压', value: '752.4', unit: 'V' }
      ],
      children: [
        {
          id: 'tr-meter-dc-grid',
          name: 'AC/DC 双向变流主站',
          deviceId: 'THBICDC00001MAIN',
          deviceType: 'transformer',
          status: 'normal',
          ratedCapacity: '600 kW',
          currentPower: 340.0,
          extraMetrics: [
            { label: '额定容量', value: '600 kW' },
            { label: '整流效率', value: '98.7%' }
          ],
          children: [
            {
              id: 'node-bus-dc-750v',
              name: '750V 直流主母线',
              deviceId: 'BUS-DC-750V-MAIN',
              deviceType: 'bus',
              status: 'normal',
              extraMetrics: [
                { label: '母线电压', value: '752.4', unit: 'V' },
                { label: '母线电流', value: '452.1', unit: 'A' }
              ],
              children: [
                {
                  id: 'dev-dc-pv-mppt',
                  name: '直流光伏MPPT柜 (120kW)',
                  deviceId: 'THDCPV0001MPPT',
                  deviceType: 'pv_inverter',
                  status: 'normal',
                  currentPower: 118.5,
                  extraMetrics: [
                    { label: '输入组串', value: '8路MPPT' },
                    { label: '发电功率', value: '118.5', unit: 'kW' }
                  ]
                },
                {
                  id: 'dev-dc-bess-dcdc',
                  name: '储能双向DC/DC变换器',
                  deviceId: 'THDCDCBESS001',
                  deviceType: 'storage',
                  status: 'normal',
                  currentPower: 100.0,
                  extraMetrics: [
                    { label: '运行模式', value: '直流稳压' },
                    { label: '转换效率', value: '99.1%' }
                  ],
                  children: [
                    {
                      id: 'dev-dc-bess-bat1',
                      name: '直流储能高倍率电池组',
                      deviceId: 'THDCDCBAT001A',
                      deviceType: 'bms_cluster',
                      status: 'normal',
                      extraMetrics: [
                        { label: 'SOC', value: '84.0%' },
                        { label: '支持放电倍率', value: '2C' }
                      ]
                    }
                  ]
                },
                {
                  id: 'dev-dc-hpc-charger',
                  name: '480kW 液冷超充充电堆',
                  deviceId: 'THDCHPC0001LIQUID',
                  deviceType: 'charging',
                  status: 'normal',
                  currentPower: 240.0,
                  extraMetrics: [
                    { label: '枪口电压', value: '720 V' },
                    { label: '充电电流', value: '333 A' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
];

interface TopologyManagementPageProps {
  onNavigate?: (page: string) => void;
}

export const TopologyManagementPage: React.FC<TopologyManagementPageProps> = ({ onNavigate }) => {
  // Active Topology Scheme state
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('topo-01');
  const activeScheme = TOPOLOGY_SCHEMES.find(s => s.id === selectedSchemeId) || TOPOLOGY_SCHEMES[0];

  // Dropdown selected candidate scheme (before password confirmation)
  const [dropdownSchemeId, setDropdownSchemeId] = useState<string>('topo-01');

  // Scheme Switch Modal & Confirmation Password State
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [isSwitchingLoading, setIsSwitchingLoading] = useState<boolean>(false);
  const [switchSuccessTip, setSwitchSuccessTip] = useState<string>('');

  // Layout mode: 'vertical' (纵向) | 'horizontal' (横向)
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');

  // Canvas zoom & transform state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected & Hovered Node
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Left Device Tree Panel State
  const [isTreeOpen, setIsTreeOpen] = useState<boolean>(true);
  const [treeSearchTerm, setTreeSearchTerm] = useState<string>('');
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Record<string, boolean>>({
    'site-bus-1': true,
    'tr-meter-group-1': true,
    'node-bus-2': true,
    'dev-bess-1': true,
    'dev-bess-2': true,
    'dev-gdw-1': true,
    'dev-gdw-2': true,
    'site-bus-2': true,
    'tr-meter-group-2': true,
    'node-bus-emergency': true,
    'site-bus-hv': true,
    'tr-meter-hv-1': true,
    'node-bus-hv-10kv': true,
    'site-bus-dc': true,
    'tr-meter-dc-grid': true,
    'node-bus-dc-750v': true,
    'dev-dc-bess-dcdc': true
  });

  // Top Tabs
  const [activeTab, setActiveTab] = useState<string>('拓扑管理');
  const [currentProject, setCurrentProject] = useState<string>('烟台蓬莱泓洋铜业');

  // Interactive controls
  const [showPowerFlowAnim, setShowPowerFlowAnim] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('all');

  const canvasRef = useRef<HTMLDivElement>(null);

  const toggleTreeNode = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedTreeNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Scheme Switch Modal Trigger & Logic
  const handleOpenSwitchModal = () => {
    if (dropdownSchemeId === selectedSchemeId) {
      setSwitchSuccessTip(`当前已处于【${activeScheme.name}】运行状态`);
      setTimeout(() => setSwitchSuccessTip(''), 3000);
      return;
    }
    setConfirmPassword('');
    setPasswordError('');
    setIsSwitchModalOpen(true);
  };

  const handleConfirmSwitchScheme = () => {
    if (!confirmPassword.trim()) {
      setPasswordError('请输入确认密码');
      return;
    }
    // Verify password (supports admin / 123456 / 888888 or standard password)
    if (confirmPassword !== 'admin' && confirmPassword !== '123456' && confirmPassword !== '888888' && confirmPassword.length < 4) {
      setPasswordError('密码错误 (默认密码: admin 或 123456)');
      return;
    }

    setIsSwitchingLoading(true);
    setPasswordError('');

    setTimeout(() => {
      setSelectedSchemeId(dropdownSchemeId);
      setSelectedNode(null);
      handleResetZoom();
      setIsSwitchingLoading(false);
      setIsSwitchModalOpen(false);
      setConfirmPassword('');
      const targetObj = TOPOLOGY_SCHEMES.find(s => s.id === dropdownSchemeId);
      setSwitchSuccessTip(`已成功切换至：${targetObj?.name}`);
      setTimeout(() => setSwitchSuccessTip(''), 4000);
    }, 500);
  };

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.4));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  // Canvas Mouse Drag Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background
    if ((e.target as HTMLElement).closest('.topology-card-interactive')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCanvasOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Status color mapper
  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'normal': return { dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'fault': return { dot: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' };
      case 'warning': return { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' };
      case 'offline':
      default:
        return { dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-100' };
    }
  };

  // Status text mapper
  const getStatusText = (status: NodeStatus) => {
    switch (status) {
      case 'normal': return '正常';
      case 'fault': return '故障';
      case 'warning': return '预警';
      case 'offline': return '离线';
    }
  };

  // Recursive Tree Filter Helper
  const filterNode = (node: TopologyNode, term: string): boolean => {
    if (!term) return true;
    const lower = term.toLowerCase();
    const matchSelf = node.name.toLowerCase().includes(lower) || node.deviceId.toLowerCase().includes(lower);
    if (matchSelf) return true;
    if (node.children) {
      return node.children.some(child => filterNode(child, term));
    }
    return false;
  };

  // Render left tree sidebar recursively
  const renderTreeItem = (node: TopologyNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedTreeNodes[node.id] ?? true;
    const isSelected = selectedNode?.id === node.id;
    const statusStyle = getStatusColor(node.status);

    if (!filterNode(node, treeSearchTerm)) return null;

    return (
      <div key={node.id} className="select-none text-xs">
        <div 
          onClick={() => {
            setSelectedNode(node);
            if (hasChildren) toggleTreeNode(node.id);
          }}
          className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 group ${
            isSelected 
              ? 'bg-emerald-50/90 text-emerald-800 font-semibold border-l-2 border-emerald-500' 
              : 'hover:bg-slate-100/70 text-slate-700'
          }`}
          style={{ paddingLeft: `${Math.max(depth * 14 + 6, 6)}px` }}
        >
          {hasChildren ? (
            <button 
              type="button"
              onClick={(e) => toggleTreeNode(node.id, e)}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700 transition-transform"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
            </button>
          ) : (
            <span className="w-3.5 h-3.5 flex items-center justify-center">
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            </span>
          )}

          {/* Node Icon */}
          <span className="shrink-0 text-slate-500 group-hover:text-slate-800">
            {node.deviceType === 'station' && <Building2 className="w-3.5 h-3.5 text-emerald-600" />}
            {node.deviceType === 'transformer' && <Zap className="w-3.5 h-3.5 text-blue-600" />}
            {node.deviceType === 'bus' && <Workflow className="w-3.5 h-3.5 text-cyan-600" />}
            {node.deviceType === 'storage' && <Battery className="w-3.5 h-3.5 text-emerald-500" />}
            {node.deviceType === 'pv_inverter' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
            {node.deviceType === 'charging' && <Activity className="w-3.5 h-3.5 text-sky-500" />}
            {node.deviceType === 'bms_cluster' && <Layers className="w-3.5 h-3.5 text-teal-600" />}
            {node.deviceType === 'pcs' && <Cpu className="w-3.5 h-3.5 text-indigo-500" />}
          </span>

          <span className="truncate flex-1 font-medium">{node.name}</span>

          {node.currentPower !== undefined && (
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              {node.currentPower} kW
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 border-l border-slate-200/50 ml-3">
            {node.children!.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#f8fafc] flex flex-col min-h-[calc(100vh-130px)] space-y-3 font-sans pb-4">
      {/* Top Header Tab Bar & Station Selector (Matching screenshot) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Breadcrumb / Page Tabs */}
        <div className="flex items-center flex-wrap gap-1.5">
          {['单站总览', '设备管理', '站点管理', '设备监控'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === '单站总览' && onNavigate) onNavigate('监控概览');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-slate-100 text-slate-800 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}

          {/* Active Topology Tab Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs">
            <span>拓扑管理</span>
            <button 
              type="button" 
              onClick={() => { if (onNavigate) onNavigate('监控概览'); }}
              className="hover:bg-emerald-600 rounded p-0.5"
              title="关闭当前页"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Station Selector & Header Actions */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentProject}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 hidden group-hover:block z-50">
              {['烟台蓬莱泓洋铜业', '常州新北光储园区', '苏州工业园智慧微网', '宜兴环保科技创新港'].map((proj) => (
                <button
                  key={proj}
                  onClick={() => setCurrentProject(proj)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    currentProject === proj ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {proj}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 text-slate-500 transition-colors" 
            title="刷新拓扑"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            }}
            className="p-1.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 text-slate-500 transition-colors" 
            title="全屏模式"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {switchSuccessTip && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{switchSuccessTip}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSwitchSuccessTip('')}
            className="text-emerald-500 hover:text-emerald-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Topology Switcher Bar with Dropdown (下拉框选择与切换) */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Dropdown Selection + Switch Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">拓扑方案:</span>
            <div className="relative">
              <select
                value={dropdownSchemeId}
                onChange={(e) => setDropdownSchemeId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {TOPOLOGY_SCHEMES.map((scheme) => (
                  <option key={scheme.id} value={scheme.id}>
                    {scheme.name} {scheme.id === selectedSchemeId ? ' (当前运行)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenSwitchModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>切换</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Current Running State Tag */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">当前运行:</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-xs">
              {activeScheme.name}
            </span>
          </div>
        </div>

        {/* Right: Key System Specs */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t md:border-t-0 pt-2 md:pt-0">
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-[11px]">
            <span className="text-slate-400">电压:</span>
            <span className="font-semibold text-slate-700 font-mono">{activeScheme.voltageLevel}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-[11px]">
            <span className="text-slate-400">主变:</span>
            <span className="font-semibold text-slate-700 font-mono">{activeScheme.transformerCapacity}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-[11px]">
            <span className="text-slate-400">设备:</span>
            <span className="font-semibold text-emerald-600 font-mono">{activeScheme.activeCount}/{activeScheme.totalCount} 台</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Area (Left Tree + Canvas Area) */}
      <div className="flex-1 flex gap-3 min-h-[640px] relative">
        {/* Left Device Hierarchy Tree Panel */}
        <div 
          className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col transition-all duration-300 overflow-hidden shrink-0 ${
            isTreeOpen ? 'w-64 md:w-72' : 'w-0 border-none p-0 overflow-hidden'
          }`}
        >
          {isTreeOpen && (
            <div className="flex flex-col h-full p-3.5 space-y-3">
              {/* Tree Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">站点拓扑设备树</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const allIds: Record<string, boolean> = {};
                      const collect = (n: TopologyNode) => {
                        allIds[n.id] = true;
                        n.children?.forEach(collect);
                      };
                      collect(activeScheme.rootBus);
                      setExpandedTreeNodes(allIds);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded"
                    title="全部展开"
                  >
                    展开
                  </button>
                  <span className="text-slate-200">|</span>
                  <button
                    onClick={() => setExpandedTreeNodes({})}
                    className="text-[10px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded"
                    title="全部折叠"
                  >
                    折叠
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索拓扑内设备..."
                  value={treeSearchTerm}
                  onChange={(e) => setTreeSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                {treeSearchTerm && (
                  <button 
                    onClick={() => setTreeSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Tree Content Container */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1 custom-scrollbar">
                {renderTreeItem(activeScheme.rootBus)}
              </div>

              {/* Tree Footer / Fast Stats */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between items-center">
                  <span>拓扑节点总数:</span>
                  <span className="font-bold text-slate-700 font-mono">{activeScheme.totalCount + 3} 个</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>设备通讯状态:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 100% 在线
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tree Open / Collapse Trigger Button */}
        <button
          onClick={() => setIsTreeOpen(!isTreeOpen)}
          className="absolute left-2 top-3 z-30 w-7 h-7 bg-white border border-slate-200 shadow-md rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          style={{ left: isTreeOpen ? '296px' : '8px' }}
          title={isTreeOpen ? '收起设备树' : '展开设备树'}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isTreeOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Main Canvas Container Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden relative">
          {/* Canvas Top Control Bar (Matching the screenshot: 纵向/横向 + 运行状态) */}
          <div className="p-3 border-b border-slate-100 bg-white/95 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 z-20">
            <div className="flex items-center gap-4">
              {/* Vertical / Horizontal Layout Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setLayoutMode('vertical')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    layoutMode === 'vertical'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  纵向
                </button>
                <button
                  onClick={() => setLayoutMode('horizontal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    layoutMode === 'horizontal'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  横向
                </button>
              </div>

              {/* Status Legend (运行状态: 正常 / 故障 / 离线) */}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="font-medium text-slate-500">运行状态：</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>正常</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>故障</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>离线</span>
                </div>
              </div>
            </div>

            {/* Canvas Actions & Zoom Tools */}
            <div className="flex items-center gap-2">
              {/* Flow Animation Toggle */}
              <button
                onClick={() => setShowPowerFlowAnim(!showPowerFlowAnim)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  showPowerFlowAnim 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
                title="能量流动动态效果"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>能流动态</span>
              </button>

              {/* Zoom Buttons */}
              <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl p-0.5">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition-colors"
                  title="缩小"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-slate-700 select-none">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition-colors"
                  title="放大"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 hover:bg-white text-slate-600 rounded-lg border-l border-slate-200 transition-colors"
                  title="复位 100%"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Topology Interactive SVG / DOM Canvas */}
          <div 
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex-1 w-full bg-[#f8fafc] overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Interactive Transform Layer */}
            <div
              className="absolute inset-0 transition-transform duration-75 origin-top-left flex items-start justify-center p-8"
              style={{
                transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoomLevel})`
              }}
            >
              {/* Topology Rendering Component for the current scheme */}
              <div className="flex flex-col items-center gap-6 min-w-[960px] py-4">
                {/* 1. Root: 站点Bus (Site Bus) */}
                <div 
                  onClick={() => setSelectedNode(activeScheme.rootBus)}
                  className={`topology-card-interactive bg-white border-2 rounded-2xl px-6 py-4 shadow-sm w-72 flex items-center gap-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    selectedNode?.id === activeScheme.rootBus.id 
                      ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md' 
                      : 'border-cyan-400 hover:border-cyan-500'
                  }`}
                >
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>{activeScheme.rootBus.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="text-slate-400">站点编号 :</span>
                      <span className="font-mono font-medium text-slate-700 truncate">{activeScheme.stationId}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="text-slate-400">站点名称 :</span>
                      <span className="font-medium text-slate-700">{activeScheme.stationName}</span>
                    </div>
                  </div>
                </div>

                {/* Connection Line 1 -> Transformer */}
                <div className="w-0.5 h-8 bg-slate-300 relative flex items-center justify-center">
                  {showPowerFlowAnim && (
                    <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>

                {/* 2. 变压器 + 电表 组合卡片 (Transformer + Meter Combined Card) */}
                {activeScheme.rootBus.children && activeScheme.rootBus.children[0] && (() => {
                  const trNode = activeScheme.rootBus.children![0];
                  return (
                    <div className="flex flex-col items-center gap-6">
                      <div 
                        onClick={() => setSelectedNode(trNode)}
                        className={`topology-card-interactive bg-white border-2 rounded-2xl p-0 shadow-sm flex items-stretch divide-x divide-slate-200 overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md ${
                          selectedNode?.id === trNode.id 
                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                            : 'border-cyan-400 hover:border-cyan-500'
                        }`}
                      >
                        {/* Left: Transformer Section */}
                        <div className="px-5 py-3.5 flex items-center gap-3.5">
                          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div className="text-left space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-bold text-slate-800">变压器</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span className="text-slate-400">设备ID :</span>
                              <span className="font-mono text-slate-700 truncate max-w-[140px]">{trNode.deviceId}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span className="text-slate-400">设备名称 :</span>
                              <span className="font-medium text-slate-700">{trNode.name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Meter Section */}
                        <div className="px-5 py-3.5 flex items-center gap-2 bg-slate-50/50">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-700">电表</span>
                            <p className="text-[10px] text-slate-400 font-mono">计量正常</p>
                          </div>
                        </div>
                      </div>

                      {/* Connection Line 2 -> Node Bus */}
                      <div className="w-0.5 h-8 bg-slate-300 relative flex items-center justify-center">
                        {showPowerFlowAnim && (
                          <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>

                      {/* 3. 节点Bus (Node Bus / Bus2) */}
                      {trNode.children && trNode.children[0] && (() => {
                        const busNode = trNode.children![0];
                        return (
                          <div className="flex flex-col items-center w-full">
                            <div 
                              onClick={() => setSelectedNode(busNode)}
                              className={`topology-card-interactive bg-white border-2 rounded-2xl px-6 py-3.5 shadow-sm w-64 flex items-center gap-3.5 transition-all duration-200 cursor-pointer hover:shadow-md ${
                                selectedNode?.id === busNode.id 
                                  ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md' 
                                  : 'border-cyan-400 hover:border-cyan-500'
                              }`}
                            >
                              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                <Workflow className="w-5 h-5" />
                              </div>
                              <div className="text-left space-y-0.5">
                                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{busNode.name}</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <span className="text-slate-400">节点名称 :</span>
                                  <span className="font-semibold text-slate-700">{busNode.extraMetrics?.[0]?.value || 'Bus2'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Horizontal Distribution Trunk Bus Line with Branch Droppers */}
                            {busNode.children && busNode.children.length > 0 && (
                              <div className="w-full flex flex-col items-center mt-2">
                                {/* Vertical drop from Bus to horizontal bar */}
                                <div className="w-0.5 h-8 bg-slate-300 relative" />

                                {/* Downstream Devices Row */}
                                <div className="relative pt-4 w-full">
                                  {/* Horizontal Bus bar connecting all branches */}
                                  <div className="absolute top-0 left-12 right-12 h-0.5 bg-slate-300" />

                                  <div className="flex items-start justify-center gap-5 flex-wrap px-4">
                                    {busNode.children.map((dev, devIdx) => (
                                      <div key={dev.id} className="flex flex-col items-center relative">
                                        {/* Drop line from horizontal bus to card */}
                                        <div className="w-0.5 h-4 bg-slate-300 -mt-4 mb-0" />

                                        {/* Equipment Main Node Card */}
                                        <div 
                                          onClick={() => setSelectedNode(dev)}
                                          className={`topology-card-interactive bg-white border-2 rounded-2xl p-3.5 shadow-sm min-w-[210px] max-w-[230px] flex items-center gap-3 transition-all duration-200 cursor-pointer hover:shadow-md ${
                                            selectedNode?.id === dev.id 
                                              ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md' 
                                              : 'border-cyan-400 hover:border-cyan-500'
                                          }`}
                                        >
                                          {/* Icon based on device type */}
                                          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                            {dev.deviceType === 'storage' && <Battery className="w-5 h-5" />}
                                            {dev.deviceType === 'pv_inverter' && <Sun className="w-5 h-5 text-amber-500" />}
                                            {dev.deviceType === 'charging' && <Activity className="w-5 h-5 text-sky-500" />}
                                            {dev.deviceType === 'generator' && <Power className="w-5 h-5 text-purple-600" />}
                                            {dev.deviceType === 'pcs' && <Cpu className="w-5 h-5 text-indigo-500" />}
                                          </div>

                                          <div className="text-left space-y-0.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                              <span className="text-xs font-bold text-slate-800 truncate">
                                                {dev.deviceType === 'storage' ? '储能' : dev.deviceType === 'pv_inverter' ? '逆变器' : dev.deviceType === 'charging' ? '储能' : dev.name}
                                              </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                              <span>设备ID :</span>
                                              <span className="font-mono text-slate-600 truncate">{dev.deviceId}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                                              <span className="text-slate-400">设备名称 :</span>
                                              <span className="font-semibold text-slate-700 truncate">{dev.name}</span>
                                            </div>
                                            {dev.currentPower !== undefined && (
                                              <div className="text-[9px] font-mono font-bold text-emerald-600 pt-0.5">
                                                实时: {dev.currentPower} kW
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Sub-children branch (e.g. 电池簇 + PCS) */}
                                        {dev.children && dev.children.length > 0 && (
                                          <div className="flex flex-col items-center w-full mt-2">
                                            <div className="w-0.5 h-6 bg-slate-300" />
                                            
                                            <div className="relative pt-3 w-full">
                                              {/* Sub-branch horizontal connector */}
                                              {dev.children.length > 1 && (
                                                <div className="absolute top-0 left-6 right-6 h-0.5 bg-slate-300" />
                                              )}

                                              <div className="flex items-start justify-center gap-3">
                                                {dev.children.map(subChild => (
                                                  <div key={subChild.id} className="flex flex-col items-center">
                                                    {dev.children!.length > 1 && (
                                                      <div className="w-0.5 h-3 bg-slate-300 -mt-3 mb-0" />
                                                    )}
                                                    
                                                    {/* Sub-node card (电池簇 / PCS) */}
                                                    <div 
                                                      onClick={() => setSelectedNode(subChild)}
                                                      className={`topology-card-interactive bg-white border-2 rounded-xl p-2.5 shadow-xs min-w-[150px] max-w-[170px] flex items-center gap-2.5 transition-all duration-200 cursor-pointer hover:shadow-md ${
                                                        selectedNode?.id === subChild.id 
                                                          ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md' 
                                                          : 'border-cyan-400 hover:border-cyan-500'
                                                      }`}
                                                    >
                                                      <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                                                        {subChild.deviceType === 'bms_cluster' ? (
                                                          <Layers className="w-4 h-4 text-teal-600" />
                                                        ) : (
                                                          <Cpu className="w-4 h-4 text-indigo-500" />
                                                        )}
                                                      </div>

                                                      <div className="text-left space-y-0.5 flex-1 min-w-0">
                                                        <div className="flex items-center gap-1">
                                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                          <span className="text-[11px] font-bold text-slate-800 truncate">
                                                            {subChild.name}
                                                          </span>
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 truncate flex items-center gap-1">
                                                          <span>ID:</span>
                                                          <span className="font-mono text-slate-600 truncate">{subChild.deviceId}</span>
                                                        </div>
                                                        {subChild.extraMetrics?.[2] && (
                                                          <div className="text-[9px] font-mono text-slate-500">
                                                            {subChild.extraMetrics[2].label}: {subChild.extraMetrics[2].value}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bottom Right Floating Helper Pill */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-sm text-[11px] text-slate-500 flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>双击/拖拽平移画布，滚轮缩放，点击节点查看详情</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer / Side Panel */}
        {selectedNode && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white rounded-2xl border-l border-slate-200 shadow-2xl p-5 z-40 flex flex-col space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{selectedNode.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedNode.deviceId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Node Status Badge */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">设备运行状态</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                selectedNode.status === 'normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedNode.status === 'normal' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {getStatusText(selectedNode.status)}
              </span>
            </div>

            {/* Node Specifications / Telemetry */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-700">实时参数与指标</h4>
              <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs">
                {selectedNode.extraMetrics ? (
                  selectedNode.extraMetrics.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100/80 last:border-0">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {m.value} {m.unit || ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-2">暂无额外遥测指标</div>
                )}
                {selectedNode.currentPower !== undefined && (
                  <div className="flex items-center justify-between py-1 border-t border-slate-200/60 font-bold text-emerald-600">
                    <span>当前工作功率</span>
                    <span className="font-mono">{selectedNode.currentPower} kW</span>
                  </div>
                )}
              </div>

              {/* Fast Operations */}
              <h4 className="text-xs font-bold text-slate-700 pt-2">快捷运维操作</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => alert(`已向 ${selectedNode.name} 下发遥信遥测自检指令`)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>设备诊断</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('组态监控');
                  }}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>组态联跳</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              通信协议: Modbus TCP/IEC 61850 | 刷新周期: 1000ms
            </div>
          </div>
        )}
      </div>

      {/* Footer Info (Matching screenshot copyright line) */}
      <div className="text-center text-[11px] text-slate-400 pt-2 pb-1">
        © Trina Power 2017–2026 All Rights Reserved 苏ICP备17009083号
      </div>

      {/* Concise Password Confirmation Modal (极简密码确认弹窗) */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">
                  拓扑切换确认
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSwitchingLoading) {
                    setIsSwitchModalOpen(false);
                    setPasswordError('');
                    setConfirmPassword('');
                  }
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-slate-700">
              {/* Target Scheme Notice */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs flex items-center justify-between">
                <span className="text-slate-500">切换目标:</span>
                <span className="font-bold text-indigo-600">
                  {TOPOLOGY_SCHEMES.find(s => s.id === dropdownSchemeId)?.name}
                </span>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  操作密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmSwitchScheme();
                    }}
                    autoFocus
                    placeholder="请输入操作密码 (默认: admin)"
                    className={`w-full pl-9 pr-9 py-2 bg-white border rounded-xl text-xs font-mono transition-all focus:outline-none ${
                      passwordError
                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-rose-600 text-[11px] font-medium pt-0.5">
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isSwitchingLoading}
                onClick={() => {
                  setIsSwitchModalOpen(false);
                  setPasswordError('');
                  setConfirmPassword('');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSwitchingLoading}
                onClick={handleConfirmSwitchScheme}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSwitchingLoading ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>切换中...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>确认切换</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopologyManagementPage;

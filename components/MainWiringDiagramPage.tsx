import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Cpu,
  Activity,
  ToggleLeft,
  RefreshCw,
  Sun,
  BatteryCharging,
  ZapOff,
  ArrowDown,
  Database,
  GitCommit,
  Minus,
  Settings,
  Play,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sliders,
  Eye,
  Wrench,
  Info,
  Undo,
  Redo,
  MousePointer
} from 'lucide-react';

// Electrical symbols render functions
const ElectricalSymbols = {
  FlowLine: ({ x1, y1, x2, y2, color = "#10b981", isStopped = false, isReversed = false }: any) => {
    const actX1 = isReversed ? x2 : x1;
    const actY1 = isReversed ? y2 : y1;
    const actX2 = isReversed ? x1 : x2;
    const actY2 = isReversed ? y1 : y2;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e2e8f0" strokeWidth="2.5" />
        {!isStopped && (
          <line 
            x1={actX1} y1={actY1} x2={actX2} y2={actY2} 
            stroke={color} 
            strokeWidth="2.5" 
            strokeDasharray="8 8" 
            className="flow-line" 
          />
        )}
      </g>
    );
  },
  Grid: ({ x, y, label = "10kV 市电网" }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="15" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
      <path d="M -10 0 Q -5 -10 0 0 T 10 0" fill="none" stroke="#10b981" strokeWidth="2.5" />
      <text x="24" y="5" fill="#10b981" fontSize="13" fontWeight="bold">{label}</text>
    </g>
  ),
  Meter: ({ x, y, label }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-12" y="-12" width="24" height="24" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" rx="2" />
      <text x="0" y="4" fill="#8b5cf6" fontSize="11" textAnchor="middle" fontWeight="bold">M</text>
      {label && <text x="20" y="4" fill="#475569" fontSize="11" fontWeight="500">{label}</text>}
    </g>
  ),
  Transformer: ({ x, y, label }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="-9" r="12" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="0" cy="9" r="12" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
      <text x="24" y="4" fill="#3b82f6" fontSize="11" fontWeight="500">{label}</text>
    </g>
  ),
  Breaker: ({ x, y, status = 'closed', label }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-7" y="-7" width="14" height="14" fill={status === 'closed' ? '#ef4444' : '#22c55e'} stroke="#fff" strokeWidth="1" rx="1" />
      {label && <text x="14" y="4" fill="#64748b" fontSize="10">{label}</text>}
    </g>
  ),
  Inverter: ({ x, y, label }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-16" y="-16" width="32" height="32" fill="#ffffff" stroke="#64748b" strokeWidth="2" rx="3" />
      <line x1="-16" y1="-16" x2="16" y2="16" stroke="#94a3b8" strokeWidth="1" />
      <text x="-10" y="-3" fill="#64748b" fontSize="9" fontWeight="bold">DC</text>
      <text x="1" y="10" fill="#64748b" fontSize="9" fontWeight="bold">AC</text>
      {label && <text x="22" y="4" fill="#475569" fontSize="11">{label}</text>}
    </g>
  ),
  PV: ({ x, y, label = "光伏阵列" }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-22" y="-11" width="44" height="22" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" rx="2" />
      <line x1="-11" y1="-11" x2="-11" y2="11" stroke="#3b82f6" strokeWidth="1" />
      <line x1="0" y1="-11" x2="0" y2="11" stroke="#3b82f6" strokeWidth="1" />
      <line x1="11" y1="-11" x2="11" y2="11" stroke="#3b82f6" strokeWidth="1" />
      <line x1="-22" y1="0" x2="22" y2="0" stroke="#3b82f6" strokeWidth="1" />
      <text x="0" y="26" fill="#3b82f6" fontSize="11" textAnchor="middle" fontWeight="bold">{label}</text>
    </g>
  ),
  Battery: ({ x, y, label = "储能电池" }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-14" y="-20" width="28" height="40" fill="#ffffff" stroke="#10b981" strokeWidth="2" rx="3" />
      <rect x="-5" y="-24" width="10" height="4" fill="#10b981" rx="1" />
      <line x1="-8" y1="-6" x2="8" y2="-6" stroke="#10b981" strokeWidth="2" />
      <line x1="0" y1="-11" x2="0" y2="-1" stroke="#10b981" strokeWidth="2" />
      <line x1="-8" y1="10" x2="8" y2="10" stroke="#10b981" strokeWidth="2" />
      <text x="0" y="34" fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">{label}</text>
    </g>
  ),
  EVCharger: ({ x, y, label = "充电桩群" }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-12" y="-20" width="24" height="40" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" rx="3" />
      <circle cx="0" cy="-8" r="4" fill="#f59e0b" />
      <path d="M 12 -4 Q 20 -4 20 4 L 20 12" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="17" y="12" width="6" height="8" fill="#f59e0b" rx="1" />
      <text x="0" y="34" fill="#f59e0b" fontSize="11" textAnchor="middle" fontWeight="bold">{label}</text>
    </g>
  ),
  Load: ({ x, y, label = "常规负荷" }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M 0 -12 L 0 4 L -8 -4 M 0 4 L 8 -4" fill="none" stroke="#64748b" strokeWidth="2" />
      <rect x="-16" y="4" width="32" height="16" fill="#ffffff" stroke="#64748b" strokeWidth="2" rx="2" />
      <text x="0" y="34" fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="bold">{label}</text>
    </g>
  ),
  Hydrogen: ({ x, y, label = "制氢设备" }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-18" y="-20" width="36" height="40" fill="#ffffff" stroke="#0284c7" strokeWidth="2" rx="3" />
      <circle cx="-5" cy="-2" r="5" fill="none" stroke="#0284c7" strokeWidth="1.5" />
      <text x="-5" y="1" fill="#0284c7" fontSize="7" textAnchor="middle" fontWeight="bold">H</text>
      <circle cx="5" cy="4" r="5" fill="none" stroke="#0284c7" strokeWidth="1.5" />
      <text x="5" y="7" fill="#0284c7" fontSize="7" textAnchor="middle" fontWeight="bold">H</text>
      <line x1="-1" y1="0" x2="1" y2="2" stroke="#0284c7" strokeWidth="1.5" />
      <text x="0" y="34" fill="#0284c7" fontSize="11" textAnchor="middle" fontWeight="bold">{label}</text>
    </g>
  ),
  DataBox: ({ x, y, title, data = [], color = '#3b82f6', active = true }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width="160" height={24 + data.length * 20} fill="#ffffff" stroke={color} strokeWidth="1.5" rx="6" opacity="0.98" className="shadow-sm" />
      <rect x="0" y="0" width="160" height="24" fill={color} opacity="0.1" rx="6" />
      <text x="10" y="16" fill={color} fontSize="11" fontWeight="bold">{title}</text>
      {active && <circle cx="145" cy="12" r="3.5" fill="#10b981" className="animate-pulse" />}
      {data.map((item: any, i: number) => (
        <g key={i} transform={`translate(10, ${40 + i * 20})`}>
          <text x="0" y="0" fill="#64748b" fontSize="10" fontWeight="500">{item.label}</text>
          <text x="140" y="0" fill="#1e293b" fontSize="10.5" textAnchor="end" fontWeight="bold">{item.value || '-'}</text>
        </g>
      ))}
    </g>
  )
};

interface DiagramElement {
  id: string;
  type: 'Grid' | 'Transformer' | 'Meter' | 'Breaker' | 'Inverter' | 'PV' | 'Battery' | 'EVCharger' | 'Load' | 'DataBox' | 'FlowLine' | 'Busbar' | 'Hydrogen';
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  label?: string;
  title?: string;
  color?: string;
  active?: boolean;
  boundPoint?: string;
  powerPointKey?: string;
  data?: { label: string; value: string; pointKey?: string }[];
  attachedStartId?: string;
  attachedEndId?: string;
}

const DEFAULT_ELEMENTS: DiagramElement[] = [
  { id: 'grid-1', type: 'Grid', x: 500, y: 30, label: '10kV 高压进线' },
  { id: 'meter-1', type: 'Meter', x: 500, y: 100, label: '关口电表' },

  // Busbar
  { id: 'busbar-10kv', type: 'Busbar', x1: 100, y1: 180, x2: 900, y2: 180, color: '#d946ef', label: '10kV 母线' },

  // Branch 1: 1# PV
  { id: 'trans-pv1', type: 'Transformer', x: 180, y: 310, label: '10/0.8kV 变压器' },
  { id: 'dev-pv1', type: 'PV', x: 180, y: 460, label: '1#光伏' },

  // Branch 2: 2# PV
  { id: 'trans-pv2', type: 'Transformer', x: 340, y: 310, label: '10/0.8kV 变压器' },
  { id: 'dev-pv2', type: 'PV', x: 340, y: 460, label: '2#光伏' },

  // Branch 3: 3# PV
  { id: 'trans-pv3', type: 'Transformer', x: 500, y: 310, label: '10/0.8kV 变压器' },
  { id: 'dev-pv3', type: 'PV', x: 500, y: 460, label: '3#光伏' },

  // Branch 4: BESS
  { id: 'trans-bess', type: 'Transformer', x: 660, y: 310, label: '10/0.4kV 变压器' },
  { id: 'dev-bess', type: 'Battery', x: 660, y: 472, label: '储能' },

  // Branch 5: Hydrogen
  { id: 'trans-h2', type: 'Transformer', x: 820, y: 310, label: '10/0.69kV 变压器' },
  { id: 'dev-h2', type: 'Hydrogen', x: 820, y: 460, label: '制氢设备' },

  // Connections
  // Top-level incoming
  { id: 'conn-top-1', type: 'FlowLine', x1: 500, y1: 45, x2: 500, y2: 88, color: '#d946ef', attachedStartId: 'grid-1', attachedEndId: 'meter-1' },
  { id: 'conn-top-2', type: 'FlowLine', x1: 500, y1: 112, x2: 500, y2: 180, color: '#d946ef', attachedStartId: 'meter-1' },

  // Branch 1
  { id: 'conn-pv1-1', type: 'FlowLine', x1: 180, y1: 180, x2: 180, y2: 298, color: '#d946ef', attachedEndId: 'trans-pv1' },
  { id: 'conn-pv1-2', type: 'FlowLine', x1: 180, y1: 322, x2: 180, y2: 449, color: '#3b82f6', powerPointKey: 'pv1_power', attachedStartId: 'trans-pv1', attachedEndId: 'dev-pv1' },

  // Branch 2
  { id: 'conn-pv2-1', type: 'FlowLine', x1: 340, y1: 180, x2: 340, y2: 298, color: '#d946ef', attachedEndId: 'trans-pv2' },
  { id: 'conn-pv2-2', type: 'FlowLine', x1: 340, y1: 322, x2: 340, y2: 449, color: '#3b82f6', powerPointKey: 'pv2_power', attachedStartId: 'trans-pv2', attachedEndId: 'dev-pv2' },

  // Branch 3
  { id: 'conn-pv3-1', type: 'FlowLine', x1: 500, y1: 180, x2: 500, y2: 298, color: '#d946ef', attachedEndId: 'trans-pv3' },
  { id: 'conn-pv3-2', type: 'FlowLine', x1: 500, y1: 322, x2: 500, y2: 449, color: '#3b82f6', powerPointKey: 'pv3_power', attachedStartId: 'trans-pv3', attachedEndId: 'dev-pv3' },

  // Branch 4
  { id: 'conn-bess-1', type: 'FlowLine', x1: 660, y1: 180, x2: 660, y2: 298, color: '#d946ef', attachedEndId: 'trans-bess' },
  { id: 'conn-bess-2', type: 'FlowLine', x1: 660, y1: 322, x2: 660, y2: 452, color: '#10b981', powerPointKey: 'bess_power', attachedStartId: 'trans-bess', attachedEndId: 'dev-bess' },

  // Branch 5
  { id: 'conn-h2-1', type: 'FlowLine', x1: 820, y1: 180, x2: 820, y2: 298, color: '#d946ef', attachedEndId: 'trans-h2' },
  { id: 'conn-h2-2', type: 'FlowLine', x1: 820, y1: 322, x2: 820, y2: 442, color: '#0284c7', powerPointKey: 'h2_power', attachedStartId: 'trans-h2', attachedEndId: 'dev-h2' },

  // Monitoring Boxes
  {
    id: 'box-gateway',
    type: 'DataBox',
    x: 60,
    y: 40,
    title: '10kV 进线关口表监测',
    color: '#8b5cf6',
    active: true,
    data: [
      { label: '有功功率', value: '450.5 kW', pointKey: 'meter_active_power' },
      { label: '无功功率', value: '-85 kvar', pointKey: 'meter_reactive_power' },
      { label: '功率因数', value: '0.98', pointKey: 'meter_pf' },
      { label: '正向有功电量', value: '45200 kWh', pointKey: 'meter_forward_active' },
      { label: '反向有功电量', value: '1250 kWh', pointKey: 'meter_reverse_active' }
    ]
  },
  {
    id: 'box-summary',
    type: 'DataBox',
    x: 740,
    y: 40,
    title: '微电网潮流汇总',
    color: '#d946ef',
    active: true,
    data: [
      { label: '光伏总出力', value: '451.5 kW', pointKeys: ['pv1_power', 'pv2_power', 'pv3_power'] },
      { label: '储能当前功率', value: '-110.0 kW', pointKey: 'bess_power' },
      { label: '制氢用电功率', value: '250.0 kW', pointKey: 'h2_power' }
    ]
  },
  {
    id: 'box-pv1',
    type: 'DataBox',
    x: 60,
    y: 535,
    title: '1#光伏系统',
    color: '#3b82f6',
    active: true,
    data: [
      { label: '当前功率', value: '120.5 kW', pointKey: 'pv1_power' },
      { label: '日发电量', value: '540 kWh', pointKey: 'pv1_daily_gen' },
      { label: '累计发电量', value: '18.4 MWh', pointKey: 'pv1_total_gen' }
    ]
  },
  {
    id: 'box-pv2',
    type: 'DataBox',
    x: 230,
    y: 535,
    title: '2#光伏系统',
    color: '#3b82f6',
    active: true,
    data: [
      { label: '当前功率', value: '150.2 kW', pointKey: 'pv2_power' },
      { label: '日发电量', value: '680 kWh', pointKey: 'pv2_daily_gen' },
      { label: '累计发电量', value: '22.1 MWh', pointKey: 'pv2_total_gen' }
    ]
  },
  {
    id: 'box-pv3',
    type: 'DataBox',
    x: 400,
    y: 535,
    title: '3#光伏系统',
    color: '#3b82f6',
    active: true,
    data: [
      { label: '当前功率', value: '180.8 kW', pointKey: 'pv3_power' },
      { label: '日发电量', value: '810 kWh', pointKey: 'pv3_daily_gen' },
      { label: '累计发电量', value: '28.6 MWh', pointKey: 'pv3_total_gen' }
    ]
  },
  {
    id: 'box-bess',
    type: 'DataBox',
    x: 570,
    y: 535,
    title: '储能系统',
    color: '#10b981',
    active: true,
    data: [
      { label: '当前功率', value: '-110.0 kW', pointKey: 'bess_power' },
      { label: '电池SOC', value: '68.5 %', pointKey: 'bess_soc' },
      { label: '电池SOH', value: '98.8 %', pointKey: 'bess_soh' },
      { label: '当日充电量', value: '1250 kWh', pointKey: 'bess_charge_daily' },
      { label: '当日放电量', value: '850 kWh', pointKey: 'bess_discharge_daily' }
    ]
  },
  {
    id: 'box-h2',
    type: 'DataBox',
    x: 740,
    y: 535,
    title: '制氢系统',
    color: '#0284c7',
    active: true,
    data: [
      { label: '用电功率', value: '250.0 kW', pointKey: 'h2_power' },
      { label: '产氢速率', value: '50.0 Nm³/h', pointKey: 'h2_rate' },
      { label: '当日产氢量', value: '420 Nm³', pointKey: 'h2_daily_prod' },
      { label: '当日用电量', value: '2050 kWh', pointKey: 'h2_daily_power' }
    ]
  }
];

const DEFAULT_TELEMETRY = {
  // Grid / Meter
  'meter_active_power': { name: '关口表有功功率', value: '450.5', unit: 'kW' },
  'meter_reactive_power': { name: '关口表无功功率', value: '-85', unit: 'kvar' },
  'meter_pf': { name: '关口表功率因数', value: '0.98', unit: '' },
  'meter_forward_active': { name: '正向有功电量', value: '45200', unit: 'kWh' },
  'meter_reverse_active': { name: '反向有功电量', value: '1250', unit: 'kWh' },

  // PV 1
  'pv1_power': { name: '1#光伏当前功率', value: '120.5', unit: 'kW' },
  'pv1_daily_gen': { name: '1#光伏当日发电量', value: '540', unit: 'kWh' },
  'pv1_total_gen': { name: '1#光伏累计发电量', value: '18.4', unit: 'MWh' },

  // PV 2
  'pv2_power': { name: '2#光伏当前功率', value: '150.2', unit: 'kW' },
  'pv2_daily_gen': { name: '2#光伏当日发电量', value: '680', unit: 'kWh' },
  'pv2_total_gen': { name: '2#光伏累计发电量', value: '22.1', unit: 'MWh' },

  // PV 3
  'pv3_power': { name: '3#光伏当前功率', value: '180.8', unit: 'kW' },
  'pv3_daily_gen': { name: '3#光伏当日发电量', value: '810', unit: 'kWh' },
  'pv3_total_gen': { name: '3#光伏累计发电量', value: '28.6', unit: 'MWh' },

  // BESS
  'bess_power': { name: '储能系统当前功率', value: '-110.0', unit: 'kW' },
  'bess_soc': { name: '储能电池 SOC', value: '68.5', unit: '%' },
  'bess_soh': { name: '储能电池 SOH', value: '98.8', unit: '%' },
  'bess_charge_daily': { name: '储能当日充电量', value: '1250', unit: 'kWh' },
  'bess_discharge_daily': { name: '储能当日放电量', value: '850', unit: 'kWh' },

  // Hydrogen
  'h2_power': { name: '制氢设备用电功率', value: '250.0', unit: 'kW' },
  'h2_rate': { name: '实时产氢速率', value: '50.0', unit: 'Nm³/h' },
  'h2_daily_prod': { name: '当日产氢量', value: '420', unit: 'Nm³' },
  'h2_daily_power': { name: '当日制氢用电量', value: '2050', unit: 'kWh' }
};

const ASSET_LIBRARY = [
  { type: 'Grid', name: '电网', icon: Zap, desc: '接入电力线路' },
  { type: 'Transformer', name: '变压器', icon: Cpu, desc: '降压变配电变压器' },
  { type: 'Meter', name: '关口表', icon: Activity, desc: '多功能关口电能计量表' },
  { type: 'Breaker', name: '断路器', icon: ToggleLeft, desc: '物理分合闸或断路保护' },
  { type: 'Inverter', name: '变流器', icon: RefreshCw, desc: '双向储能变流器 (PCS)' },
  { type: 'PV', name: '光伏', icon: Sun, desc: '分布式光伏发电组件' },
  { type: 'Battery', name: '储能', icon: BatteryCharging, desc: '高压储能电池系统' },
  { type: 'Hydrogen', name: '制氢设备', icon: RefreshCw, desc: '绿色制氢碱性/PEM电解槽' },
  { type: 'EVCharger', name: '充电桩', icon: ZapOff, desc: '充电设施终端用电设备' },
  { type: 'Load', name: '常规负荷', icon: ArrowDown, desc: '常规电力消费负荷' },
  { type: 'DataBox', name: '数据箱', icon: Database, desc: '多行遥测参数监视数据箱' },
  { type: 'FlowLine', name: '连线', icon: GitCommit, desc: '带潮流方向的拓扑连接线' },
  { type: 'Busbar', name: '母线', icon: Minus, desc: '高载流低压侧汇流铜母线' },
];

const TELEMETRY_DEVICES = [
  {
    name: '10kV 进线关口表柜',
    points: [
      { key: 'meter_active_power', name: '有功功率 (kW)' },
      { key: 'meter_reactive_power', name: '无功功率 (kvar)' },
      { key: 'meter_pf', name: '功率因数' },
      { key: 'meter_forward_active', name: '正向有功电量 (kWh)' },
      { key: 'meter_reverse_active', name: '反向有功电量 (kWh)' }
    ]
  },
  {
    name: '1#光伏发电系统',
    points: [
      { key: 'pv1_power', name: '当前功率 (kW)' },
      { key: 'pv1_daily_gen', name: '当日发电量 (kWh)' },
      { key: 'pv1_total_gen', name: '累计发电量 (MWh)' }
    ]
  },
  {
    name: '2#光伏发电系统',
    points: [
      { key: 'pv2_power', name: '当前功率 (kW)' },
      { key: 'pv2_daily_gen', name: '当日发电量 (kWh)' },
      { key: 'pv2_total_gen', name: '累计发电量 (MWh)' }
    ]
  },
  {
    name: '3#光伏发电系统',
    points: [
      { key: 'pv3_power', name: '当前功率 (kW)' },
      { key: 'pv3_daily_gen', name: '当日发电量 (kWh)' },
      { key: 'pv3_total_gen', name: '累计发电量 (MWh)' }
    ]
  },
  {
    name: '储能电池系统',
    points: [
      { key: 'bess_power', name: '输出功率 (kW)' },
      { key: 'bess_soc', name: '电池 SOC (%)' },
      { key: 'bess_soh', name: '电池 SOH (%)' },
      { key: 'bess_charge_daily', name: '当日充电 (kWh)' },
      { key: 'bess_discharge_daily', name: '当日放电 (kWh)' }
    ]
  },
  {
    name: '制氢设备系统',
    points: [
      { key: 'h2_power', name: '用电功率 (kW)' },
      { key: 'h2_rate', name: '实时产氢速率 (Nm³/h)' },
      { key: 'h2_daily_prod', name: '当日产氢量 (Nm³)' },
      { key: 'h2_daily_power', name: '当日用电量 (kWh)' }
    ]
  }
];

const TELEMETRY_INDICATORS = [
  {
    name: '功率与出力指标 (Active Power / Output)',
    points: [
      { key: 'meter_active_power', name: '关口表有功功率 (kW)' },
      { key: 'pv1_power', name: '1#光伏当前功率 (kW)' },
      { key: 'pv2_power', name: '2#光伏当前功率 (kW)' },
      { key: 'pv3_power', name: '3#光伏当前功率 (kW)' },
      { key: 'bess_power', name: '储能系统当前功率 (kW)' },
      { key: 'h2_power', name: '制氢设备用电功率 (kW)' }
    ]
  },
  {
    name: '累计与当日电量指标 (Energy Generation / Usage)',
    points: [
      { key: 'meter_forward_active', name: '正向有功电量 (kWh)' },
      { key: 'meter_reverse_active', name: '反向有功电量 (kWh)' },
      { key: 'pv1_daily_gen', name: '1#光伏当日发电量 (kWh)' },
      { key: 'pv1_total_gen', name: '1#光伏累计发电量 (MWh)' },
      { key: 'pv2_daily_gen', name: '2#光伏当日发电量 (kWh)' },
      { key: 'pv2_total_gen', name: '2#光伏累计发电量 (MWh)' },
      { key: 'pv3_daily_gen', name: '3#光伏当日发电量 (kWh)' },
      { key: 'pv3_total_gen', name: '3#光伏累计发电量 (MWh)' },
      { key: 'bess_charge_daily', name: '储能当日充电量 (kWh)' },
      { key: 'bess_discharge_daily', name: '储能当日放电量 (kWh)' },
      { key: 'h2_daily_power', name: '当日制氢用电量 (kWh)' }
    ]
  },
  {
    name: '储能电池健康/电量 (Battery SOC / SOH)',
    points: [
      { key: 'bess_soc', name: '储能电池 SOC (%)' },
      { key: 'bess_soh', name: '储能电池 SOH (%)' }
    ]
  },
  {
    name: '氢能系统运行状态 (Hydrogen Rate / Production)',
    points: [
      { key: 'h2_rate', name: '实时产氢速率 (Nm³/h)' },
      { key: 'h2_daily_prod', name: '当日产氢量 (Nm³)' }
    ]
  },
  {
    name: '其他电网品质参数 (Other Electrical Metrics)',
    points: [
      { key: 'meter_reactive_power', name: '关口表无功功率 (kvar)' },
      { key: 'meter_pf', name: '关口表功率因数' }
    ]
  }
];

interface MainWiringDiagramPageProps {
  isEmbedded?: boolean;
}

const MainWiringDiagramPage: React.FC<MainWiringDiagramPageProps> = ({ isEmbedded = false }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    if (isEmbedded) {
      setIsEditMode(false);
    }
  }, [isEmbedded]);
  const [elements, setElements] = useState<DiagramElement[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, { name: string; value: string; unit: string }>>(DEFAULT_TELEMETRY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);
  const [expandedRowIdx, setExpandedRowIdx] = useState<number | null>(null);
  const [bindCategoryTab, setBindCategoryTab] = useState<'device' | 'indicator'>('device');

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Drag states
  const [dragging, setDragging] = useState<{
    id: string;
    startX: number;
    startY: number;
    startX2?: number;
    startY2?: number;
    startMouseX: number;
    startMouseY: number;
    type: 'component' | 'line-start' | 'line-end' | 'line-whole';
  } | null>(null);

  const [activeSnap, setActiveSnap] = useState<{ x: number; y: number; name: string } | null>(null);
  const [activeAlignmentLines, setActiveAlignmentLines] = useState<{ type: 'horizontal' | 'vertical'; value: number }[]>([]);

  // Undo / Redo stacks
  const [history, setHistory] = useState<DiagramElement[][]>([]);
  const [future, setFuture] = useState<DiagramElement[][]>([]);
  const originalElementsRef = useRef<DiagramElement[] | null>(null);

  // Load configuration
  useEffect(() => {
    const saved = localStorage.getItem('wiring_diagram_v2_elements');
    const savedTel = localStorage.getItem('wiring_diagram_v2_telemetry');
    if (saved) {
      try {
        setElements(JSON.parse(saved));
      } catch (e) {
        setElements(DEFAULT_ELEMENTS);
      }
    } else {
      setElements(DEFAULT_ELEMENTS);
    }

    if (savedTel) {
      try {
        setTelemetry(JSON.parse(savedTel));
      } catch (e) {
        setTelemetry(DEFAULT_TELEMETRY);
      }
    }

    // Reset history
    setHistory([]);
    setFuture([]);
  }, []);

  // Auto simulation for active monitoring with real-time physical balance calculation
  useEffect(() => {
    if (isEditMode) return;
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const next = { ...prev };
        
        // Fluctuate PV power slightly
        if (next['pv1_power']) {
          const val = parseFloat(next['pv1_power'].value);
          const delta = (Math.random() - 0.5) * 2;
          next['pv1_power'].value = Math.max(10, parseFloat((val + delta).toFixed(1))).toString();
        }
        if (next['pv2_power']) {
          const val = parseFloat(next['pv2_power'].value);
          const delta = (Math.random() - 0.5) * 2.5;
          next['pv2_power'].value = Math.max(10, parseFloat((val + delta).toFixed(1))).toString();
        }
        if (next['pv3_power']) {
          const val = parseFloat(next['pv3_power'].value);
          const delta = (Math.random() - 0.5) * 3;
          next['pv3_power'].value = Math.max(10, parseFloat((val + delta).toFixed(1))).toString();
        }

        // Fluctuate BESS power slightly
        if (next['bess_power']) {
          const val = parseFloat(next['bess_power'].value);
          const delta = (Math.random() - 0.5) * 1.5;
          next['bess_power'].value = parseFloat((val + delta).toFixed(1)).toString();
          
          // Slowly adjust SOC based on power (negative means charging, positive means discharging)
          if (next['bess_soc']) {
            const soc = parseFloat(next['bess_soc'].value);
            const socDelta = -val * 0.0001; 
            next['bess_soc'].value = Math.max(0, Math.min(100, parseFloat((soc + socDelta).toFixed(3)))).toString();
          }
        }

        // Fluctuate Hydrogen power and rate
        if (next['h2_power']) {
          const val = parseFloat(next['h2_power'].value);
          const delta = (Math.random() - 0.5) * 4;
          const nextPower = Math.max(10, parseFloat((val + delta).toFixed(1)));
          next['h2_power'].value = nextPower.toString();
          
          // Rate is proportional to power
          if (next['h2_rate']) {
            next['h2_rate'].value = (nextPower * 0.2).toFixed(1);
          }
        }

        // Gateway power is sum of devices (PV output - BESS output - H2 load)
        // PV is generation (positive), BESS negative is charging (load), H2 load is positive (load)
        if (next['meter_active_power'] && next['pv1_power'] && next['pv2_power'] && next['pv3_power'] && next['bess_power'] && next['h2_power']) {
          const pvSum = parseFloat(next['pv1_power'].value) + parseFloat(next['pv2_power'].value) + parseFloat(next['pv3_power'].value);
          const bess = parseFloat(next['bess_power'].value); // negative if charging
          const h2 = parseFloat(next['h2_power'].value);
          
          // Net grid power
          const netGrid = pvSum + bess - h2;
          next['meter_active_power'].value = netGrid.toFixed(1);
          
          if (next['meter_pf']) {
            next['meter_pf'].value = (0.95 + Math.random() * 0.04).toFixed(2);
          }
        }

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isEditMode]);

  const pushToHistory = (current: DiagramElement[]) => {
    setHistory(prev => {
      const next = [...prev, JSON.parse(JSON.stringify(current))];
      if (next.length > 50) return next.slice(next.length - 50);
      return next;
    });
    setFuture([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [JSON.parse(JSON.stringify(elements)), ...prev]);
    setElements(previous);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setSelectedId(null);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(elements))]);
    setElements(next);
    setFuture(prev => prev.slice(1));
    setSelectedId(null);
  };

  const handleSave = () => {
    localStorage.setItem('wiring_diagram_v2_elements', JSON.stringify(elements));
    localStorage.setItem('wiring_diagram_v2_telemetry', JSON.stringify(telemetry));
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('确定要恢复到默认的河北国杉10kV主接线图吗？自定义修改将被覆盖。')) {
      localStorage.removeItem('wiring_diagram_v2_elements');
      localStorage.removeItem('wiring_diagram_v2_telemetry');
      setElements(DEFAULT_ELEMENTS);
      setTelemetry(DEFAULT_TELEMETRY);
      setSelectedId(null);
      setHistory([]);
      setFuture([]);
    }
  };

  const handleClear = () => {
    if (window.confirm('确定要清空画布吗？您可以重新添加设备素材重新组态连线。')) {
      pushToHistory(elements);
      setElements([]);
      setSelectedId(null);
    }
  };

  const handleAddElement = (type: string) => {
    const id = `${type.toLowerCase()}-${Date.now()}`;
    let newEl: DiagramElement;

    if (type === 'FlowLine' || type === 'Busbar') {
      newEl = {
        id,
        type: type as any,
        x1: 500,
        y1: 400,
        x2: 700,
        y2: 400,
        color: type === 'Busbar' ? '#94a3b8' : '#10b981',
        label: type === 'Busbar' ? '母线' : undefined,
        powerPointKey: ''
      };
    } else if (type === 'DataBox') {
      newEl = {
        id,
        type: 'DataBox',
        x: 520,
        y: 350,
        title: '数据监控',
        color: '#3b82f6',
        active: true,
        data: [
          { label: '功率', value: '0.0 kW', pointKey: '' },
          { label: '电压', value: '400 V', pointKey: '' }
        ]
      };
    } else {
      newEl = {
        id,
        type: type as any,
        x: 550,
        y: 380,
        label: type === 'Breaker' ? '断路器' : type === 'Transformer' ? '变压器' : type === 'Inverter' ? '变流器' : type === 'Grid' ? '电网' : type === 'Meter' ? '关口表' : ''
      };
    }

    pushToHistory(elements);
    setElements(prev => [...prev, newEl]);
    setSelectedId(id);
  };

  const handleRemoveElement = (id: string) => {
    pushToHistory(elements);
    setElements(prev => prev
      .filter(el => el.id !== id)
      .map(el => {
        if (el.type === 'FlowLine' || el.type === 'Busbar') {
          const nextEl = { ...el };
          let changed = false;
          if (el.attachedStartId === id) {
            delete nextEl.attachedStartId;
            changed = true;
          }
          if (el.attachedEndId === id) {
            delete nextEl.attachedEndId;
            changed = true;
          }
          return changed ? nextEl : el;
        }
        return el;
      })
    );
    if (selectedId === id) setSelectedId(null);
  };

  const updateSelectedElement = (fields: Partial<DiagramElement>) => {
    if (!selectedId) return;
    pushToHistory(elements);
    setElements(prev => prev.map(el => {
      if (el.id === selectedId) {
        return { ...el, ...fields };
      }
      return el;
    }));
  };

  // Drag handlers
  const handleMouseDownComp = (e: React.MouseEvent, id: string, curX: number, curY: number) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setSelectedId(id);
    originalElementsRef.current = JSON.parse(JSON.stringify(elements));
    setDragging({
      id,
      startX: curX,
      startY: curY,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      type: 'component'
    });
  };

  const handleMouseDownLineWhole = (e: React.MouseEvent, id: string, x1: number, y1: number, x2: number, y2: number) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setSelectedId(id);
    originalElementsRef.current = JSON.parse(JSON.stringify(elements));
    setDragging({
      id,
      startX: x1,
      startY: y1,
      startX2: x2,
      startY2: y2,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      type: 'line-whole'
    });
  };

  const handleMouseDownAnchor = (e: React.MouseEvent, id: string, anchorType: 'line-start' | 'line-end', curX: number, curY: number) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setSelectedId(id);
    originalElementsRef.current = JSON.parse(JSON.stringify(elements));
    setDragging({
      id,
      startX: curX,
      startY: curY,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      type: anchorType
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragging.startMouseX;
    const dy = e.clientY - dragging.startMouseY;

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    // Viewbox is fixed 1200x850
    const scaleX = 1200 / svgRect.width;
    const scaleY = 850 / svgRect.height;

    const deltaX = Math.round(dx * scaleX);
    const deltaY = Math.round(dy * scaleY);

    // Snap to 5px grid
    const snapX = Math.round(deltaX / 5) * 5;
    const snapY = Math.round(deltaY / 5) * 5;

    let activeSnapObj: { x: number; y: number; name: string; targetId?: string } | null = null;

    if (dragging.type === 'line-start' || dragging.type === 'line-end') {
      const rawTargetX = dragging.startX + snapX;
      const rawTargetY = dragging.startY + snapY;

      let targetX = rawTargetX;
      let targetY = rawTargetY;
      let snapCandidate: { x: number; y: number; name: string; targetId?: string } | null = null;
      let closestDist = Infinity;

      // 1. Try snapping to standard components (highest priority)
      elements.forEach(el => {
        if (el.id === dragging.id) return;
        if (el.x !== undefined && el.y !== undefined) {
          const dist = Math.hypot(rawTargetX - el.x, rawTargetY - el.y);
          if (dist < 30 && dist < closestDist) {
            closestDist = dist;
            snapCandidate = { x: el.x, y: el.y, name: el.label || el.title || el.type, targetId: el.id };
          }
        }
      });

      // 2. Try snapping to other lines' endpoints (second priority)
      if (!snapCandidate) {
        elements.forEach(el => {
          if (el.id === dragging.id) return;
          if (el.type === 'FlowLine' || el.type === 'Busbar') {
            if (el.x1 !== undefined && el.y1 !== undefined) {
              const dist = Math.hypot(rawTargetX - el.x1, rawTargetY - el.y1);
              if (dist < 20 && dist < closestDist) {
                closestDist = dist;
                snapCandidate = { x: el.x1, y: el.y1, name: el.label || (el.type === 'Busbar' ? '母线端点' : '连线端点') };
              }
            }
            if (el.x2 !== undefined && el.y2 !== undefined) {
              const dist = Math.hypot(rawTargetX - el.x2, rawTargetY - el.y2);
              if (dist < 20 && dist < closestDist) {
                closestDist = dist;
                snapCandidate = { x: el.x2, y: el.y2, name: el.label || (el.type === 'Busbar' ? '母线端点' : '连线端点') };
              }
            }
          }
        });
      }

      // 3. Try snapping to busbar lines (third priority)
      if (!snapCandidate) {
        elements.forEach(el => {
          if (el.id === dragging.id) return;
          if (el.type === 'Busbar' && el.x1 !== undefined && el.y1 !== undefined && el.x2 !== undefined && el.y2 !== undefined) {
            // Horizontal busbar
            if (Math.abs(el.y1 - el.y2) < 2) {
              if (Math.abs(rawTargetY - el.y1) < 20 && rawTargetX >= Math.min(el.x1, el.x2) - 15 && rawTargetX <= Math.max(el.x1, el.x2) + 15) {
                snapCandidate = { x: rawTargetX, y: el.y1, name: el.label || '主母排' };
              }
            }
            // Vertical busbar
            else if (Math.abs(el.x1 - el.x2) < 2) {
              if (Math.abs(rawTargetX - el.x1) < 20 && rawTargetY >= Math.min(el.y1, el.y2) - 15 && rawTargetY <= Math.max(el.y1, el.y2) + 15) {
                snapCandidate = { x: el.x1, y: rawTargetY, name: el.label || '主母排' };
              }
            }
          }
        });
      }

      if (snapCandidate) {
        targetX = snapCandidate.x;
        targetY = snapCandidate.y;
        activeSnapObj = snapCandidate;
      } else {
        // 4. Try horizontal/vertical self-alignment (lowest priority, only if no other snaps happened)
        const currentEl = elements.find(el => el.id === dragging.id);
        if (currentEl) {
          if (dragging.type === 'line-start' && currentEl.x2 !== undefined && currentEl.y2 !== undefined) {
            if (Math.abs(rawTargetX - currentEl.x2) < 15) {
              targetX = currentEl.x2;
            }
            if (Math.abs(rawTargetY - currentEl.y2) < 15) {
              targetY = currentEl.y2;
            }
          } else if (dragging.type === 'line-end' && currentEl.x1 !== undefined && currentEl.y1 !== undefined) {
            if (Math.abs(rawTargetX - currentEl.x1) < 15) {
              targetX = currentEl.x1;
            }
            if (Math.abs(rawTargetY - currentEl.y1) < 15) {
              targetY = currentEl.y1;
            }
          }
        }
      }

      setActiveSnap(activeSnapObj);

      setElements(prev => prev.map(el => {
        if (el.id !== dragging.id) return el;
        if (dragging.type === 'line-start') {
          return {
            ...el,
            x1: targetX,
            y1: targetY,
            attachedStartId: snapCandidate?.targetId || undefined
          };
        } else {
          return {
            ...el,
            x2: targetX,
            y2: targetY,
            attachedEndId: snapCandidate?.targetId || undefined
          };
        }
      }));
    } else {
      setActiveSnap(null);
      let targetX = dragging.startX + snapX;
      let targetY = dragging.startY + snapY;
      const alignmentGuides: { type: 'horizontal' | 'vertical'; value: number }[] = [];

      if (dragging.type === 'component') {
        elements.forEach(el => {
          if (el.id === dragging.id) return;
          if (el.x !== undefined && el.y !== undefined) {
            // Check X alignment (vertical guide line at el.x)
            if (Math.abs(el.x - targetX) < 10) {
              targetX = el.x;
              alignmentGuides.push({ type: 'vertical', value: el.x });
            }
            // Check Y alignment (horizontal guide line at el.y)
            if (Math.abs(el.y - targetY) < 10) {
              targetY = el.y;
              alignmentGuides.push({ type: 'horizontal', value: el.y });
            }
          }
        });
      }

      setActiveAlignmentLines(alignmentGuides);

      setElements(prev => {
        // 1. Move the dragged item first
        const nextElements = prev.map(el => {
          if (el.id !== dragging.id) return el;
          if (dragging.type === 'component') {
            return {
              ...el,
              x: targetX,
              y: targetY
            };
          } else if (dragging.type === 'line-whole') {
            return {
              ...el,
              x1: dragging.startX + snapX,
              y1: dragging.startY + snapY,
              x2: (dragging.startX2 || 0) + snapX,
              y2: (dragging.startY2 || 0) + snapY,
              attachedStartId: undefined,
              attachedEndId: undefined
            };
          }
          return el;
        });

        // 2. If a component was dragged, update any attached lines
        if (dragging.type === 'component') {
          return nextElements.map(el => {
            if (el.type === 'FlowLine' || el.type === 'Busbar') {
              let updated = false;
              const nextLine = { ...el };
              if (el.attachedStartId === dragging.id) {
                nextLine.x1 = targetX;
                nextLine.y1 = targetY;
                updated = true;
              }
              if (el.attachedEndId === dragging.id) {
                nextLine.x2 = targetX;
                nextLine.y2 = targetY;
                updated = true;
              }
              return updated ? nextLine : el;
            }
            return el;
          });
        }

        return nextElements;
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setActiveSnap(null);
    setActiveAlignmentLines([]);

    if (originalElementsRef.current) {
      const changed = JSON.stringify(originalElementsRef.current) !== JSON.stringify(elements);
      if (changed) {
        setHistory(prev => {
          const next = [...prev, originalElementsRef.current!];
          if (next.length > 50) return next.slice(next.length - 50);
          return next;
        });
        setFuture([]);
      }
      originalElementsRef.current = null;
    }
  };

  // Telemetry updates
  const handleTelemetryChange = (key: string, value: string) => {
    setTelemetry(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className={`flex flex-col h-full bg-slate-50 overflow-hidden ${isEmbedded ? 'rounded-[2.5rem] border border-slate-50 p-6' : 'rounded-2xl shadow-lg border border-slate-200'}`} id="wiring-diagram-page">
      {/* Dynamic Saving Notification */}
      {showSaveToast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-sm py-2.5 px-6 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>电气拓扑组态与测点数据保存成功!</span>
        </div>
      )}

      {/* Top Controls Header */}
      {!isEmbedded && (
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              <span>10kV/0.4kV 电网主接线拓扑与测点配置系统</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">河北国杉用户侧储能微电网主接线组态工作台</p>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-3">
            {/* Mode switch */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex">
              <button
                onClick={() => { setIsEditMode(false); setSelectedId(null); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isEditMode
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                运行监视
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isEditMode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                拓扑编辑
              </button>
            </div>

            {isEditMode && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    history.length > 0
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer'
                      : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                  }`}
                  title="撤销最后一步操作"
                >
                  <Undo className="w-3.5 h-3.5" />
                  撤销 ({history.length})
                </button>
                <button
                  onClick={handleRedo}
                  disabled={future.length === 0}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    future.length > 0
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer'
                      : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                  }`}
                  title="重做撤销的操作"
                >
                  <Redo className="w-3.5 h-3.5" />
                  重做
                </button>

                <div className="h-5 w-px bg-slate-200 mx-1" />

                <button
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors"
                  title="保存电气图布局及测点绑定"
                >
                  <Save className="w-3.5 h-3.5" />
                  保存
                </button>
                <button
                  onClick={handleReset}
                  className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  title="恢复默认接线图"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重置
                </button>
                <button
                  onClick={handleClear}
                  className="bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  title="清空所有元素"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Asset Library (素材库) */}
        {isEditMode && (
          <div className="w-60 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                素材库 / 组态设备
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">点击元件卡片将其添加到当前画布</p>
            </div>

            <div className="p-3 grid grid-cols-1 gap-2">
              {ASSET_LIBRARY.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleAddElement(item.type)}
                    className="flex items-start gap-2.5 p-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all shadow-inner">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-900">{item.name}</div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CENTER: Canvas */}
        <div 
          className={`flex-1 relative overflow-hidden flex flex-col ${
            isEditMode ? 'edit-grid bg-slate-100/50' : 'bg-slate-50'
          }`}
          style={isEditMode ? {
            backgroundSize: '20px 20px',
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)'
          } : undefined}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >

          {/* SVG Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4">
            <svg
              ref={svgRef}
              viewBox="0 0 1200 850"
              preserveAspectRatio="xMidYMid meet"
              className="max-w-full max-h-full drop-shadow-md select-none bg-white rounded-2xl border border-slate-200"
              onClick={() => setSelectedId(null)}
            >
              <g transform="translate(100, 30)">
                <style>
                  {`
                    @keyframes flow { to { stroke-dashoffset: -16; } }
                    .flow-line { animation: flow 0.8s linear infinite; }
                    @keyframes bus-glow { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.35; } }
                    .bus-glow { animation: bus-glow 2.5s ease-in-out infinite; }
                  `}
                </style>

                {/* Render Connections first so they remain underneath */}
                {elements.filter(el => el.type === 'FlowLine').map(el => {
                  const isSelected = selectedId === el.id;
                  
                  // Resolve power for flow direction
                  let isStopped = false;
                  let isReversed = false;
                  if (el.powerPointKey && telemetry[el.powerPointKey]) {
                    const powerVal = parseFloat(telemetry[el.powerPointKey].value);
                    if (isNaN(powerVal) || powerVal === 0) {
                      isStopped = true;
                    } else if (powerVal < 0) {
                      isReversed = true;
                    }
                  }

                  return (
                    <g 
                      key={el.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                      onMouseDown={(e) => handleMouseDownLineWhole(e, el.id, el.x1 || 0, el.y1 || 0, el.x2 || 0, el.y2 || 0)}
                      className={isEditMode ? "cursor-move group" : "group"}
                    >
                      <line 
                        x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} 
                        stroke="transparent" strokeWidth="12" 
                        className="cursor-pointer"
                      />
                      <ElectricalSymbols.FlowLine 
                        x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} 
                        color={el.color} 
                        isStopped={isStopped} 
                        isReversed={isReversed} 
                      />

                      {/* Endpoint adjustment handles in edit mode */}
                      {isSelected && isEditMode && (
                        <g>
                          <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
                          <circle 
                            cx={el.x1} cy={el.y1} r="6.5" 
                            fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" 
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onMouseDown={(e) => handleMouseDownAnchor(e, el.id, 'line-start', el.x1 || 0, el.y1 || 0)}
                          />
                          <circle 
                            cx={el.x2} cy={el.y2} r="6.5" 
                            fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" 
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onMouseDown={(e) => handleMouseDownAnchor(e, el.id, 'line-end', el.x2 || 0, el.y2 || 0)}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Render Busbars */}
                {elements.filter(el => el.type === 'Busbar').map(el => {
                  const isSelected = selectedId === el.id;
                  return (
                    <g 
                      key={el.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                      onMouseDown={(e) => handleMouseDownLineWhole(e, el.id, el.x1 || 0, el.y1 || 0, el.x2 || 0, el.y2 || 0)}
                      className={isEditMode ? "cursor-move" : ""}
                    >
                      <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={el.color || '#94a3b8'} strokeWidth="10" strokeLinecap="round" className="bus-glow" opacity="0.3" />
                      <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={el.color || '#64748b'} strokeWidth="6" strokeLinecap="round" />
                      {el.label && (
                        <text x={(el.x1 || 0) + 15} y={(el.y1 || 0) - 10} fill="#475569" fontSize="11" fontWeight="bold">
                          {el.label}
                        </text>
                      )}

                      {/* Adjust endpoints */}
                      {isSelected && isEditMode && (
                        <g>
                          <circle 
                            cx={el.x1} cy={el.y1} r="7" 
                            fill="#3b82f6" stroke="#ffffff" strokeWidth="2" 
                            className="cursor-pointer"
                            onMouseDown={(e) => handleMouseDownAnchor(e, el.id, 'line-start', el.x1 || 0, el.y1 || 0)}
                          />
                          <circle 
                            cx={el.x2} cy={el.y2} r="7" 
                            fill="#3b82f6" stroke="#ffffff" strokeWidth="2" 
                            className="cursor-pointer"
                            onMouseDown={(e) => handleMouseDownAnchor(e, el.id, 'line-end', el.x2 || 0, el.y2 || 0)}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Render standard nodes and instruments */}
                {elements.filter(el => el.type !== 'FlowLine' && el.type !== 'Busbar').map(el => {
                  const isSelected = selectedId === el.id;
                  
                  // Calculate dynamic state for Breakers
                  let breakerStatus: 'closed' | 'open' = 'closed';
                  if (el.type === 'Breaker' && el.boundPoint && telemetry[el.boundPoint]) {
                    breakerStatus = telemetry[el.boundPoint].value === 'open' ? 'open' : 'closed';
                  }

                  // Resolve DataBox readings dynamically
                  let resolvedRows = el.data || [];
                  if (el.type === 'DataBox') {
                    resolvedRows = (el.data || []).map(row => {
                      const keys = row.pointKeys && row.pointKeys.length > 0 
                        ? row.pointKeys 
                        : (row.pointKey ? [row.pointKey] : []);

                      if (keys.length > 0) {
                        let sum = 0;
                        let unit = '';
                        let hasNumeric = false;
                        let nonNumericValue = '';

                        keys.forEach(k => {
                          if (telemetry[k]) {
                            const telItem = telemetry[k];
                            const val = parseFloat(telItem.value);
                            if (!isNaN(val)) {
                              sum += val;
                              hasNumeric = true;
                            } else {
                              nonNumericValue = telItem.value;
                            }
                            if (telItem.unit) {
                              unit = telItem.unit;
                            }
                          }
                        });

                        if (hasNumeric) {
                          const formattedSum = Number(sum.toFixed(1)).toString();
                          return {
                            ...row,
                            value: `${formattedSum} ${unit}`.trim()
                          };
                        } else if (nonNumericValue) {
                          return {
                            ...row,
                            value: `${nonNumericValue} ${unit}`.trim()
                          };
                        }
                      }
                      return row;
                    });
                  }

                  return (
                    <g
                      key={el.id}
                      onClick={(e) => { 
                        if (!isEditMode) return;
                        e.stopPropagation(); 
                        setSelectedId(el.id); 
                      }}
                      onMouseDown={(e) => handleMouseDownComp(e, el.id, el.x || 0, el.y || 0)}
                      className={isEditMode ? "cursor-move" : ""}
                    >
                      {/* Selection Box Underlay */}
                      {isSelected && isEditMode && (
                        <g>
                          {el.type === 'DataBox' ? (
                            <rect 
                              x={(el.x || 0) - 5} 
                              y={(el.y || 0) - 5} 
                              width="170" 
                              height={34 + resolvedRows.length * 20} 
                              fill="none" 
                              stroke="#4f46e5" 
                              strokeWidth="1.5" 
                              strokeDasharray="4 4" 
                              rx="8" 
                            />
                          ) : (
                            <circle cx={el.x} cy={el.y} r="32" fill="none" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4 4" />
                          )}
                        </g>
                      )}

                      {/* Render SVG Primitive based on component type */}
                      {el.type === 'Grid' && <ElectricalSymbols.Grid x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'Transformer' && <ElectricalSymbols.Transformer x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'Meter' && <ElectricalSymbols.Meter x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'Breaker' && <ElectricalSymbols.Breaker x={el.x} y={el.y} status={breakerStatus} label={el.label} />}
                      {el.type === 'Inverter' && <ElectricalSymbols.Inverter x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'PV' && <ElectricalSymbols.PV x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'Battery' && <ElectricalSymbols.Battery x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'EVCharger' && <ElectricalSymbols.EVCharger x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'Load' && <ElectricalSymbols.Load x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'Hydrogen' && <ElectricalSymbols.Hydrogen x={el.x} y={el.y} label={el.label} />}
                      {el.type === 'DataBox' && (
                        <ElectricalSymbols.DataBox 
                          x={el.x} y={el.y} 
                          title={el.title} 
                          color={el.color} 
                          active={el.active} 
                          data={resolvedRows} 
                        />
                      )}
                    </g>
                  );
                })}

                {/* Active Magnetic Snap Visualization Feedback */}
                {isEditMode && activeSnap && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle 
                      cx={activeSnap.x} 
                      cy={activeSnap.y} 
                      r="12" 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="1.5" 
                      strokeDasharray="3 3" 
                      className="animate-spin" 
                      style={{ 
                        transformOrigin: `${activeSnap.x}px ${activeSnap.y}px`, 
                        animationDuration: '6s' 
                      }} 
                    />
                    <circle 
                      cx={activeSnap.x} 
                      cy={activeSnap.y} 
                      r="6" 
                      fill="#6366f1" 
                      stroke="#ffffff" 
                      strokeWidth="1.5" 
                      className="animate-ping" 
                      style={{ 
                        transformOrigin: `${activeSnap.x}px ${activeSnap.y}px`, 
                        animationDuration: '1.5s' 
                      }} 
                    />
                    <circle 
                      cx={activeSnap.x} 
                      cy={activeSnap.y} 
                      r="5" 
                      fill="#6366f1" 
                      stroke="#ffffff" 
                      strokeWidth="1.5" 
                    />
                    <g transform={`translate(${activeSnap.x + 12}, ${activeSnap.y - 12})`}>
                      <rect 
                        x="0" 
                        y="-14" 
                        width={activeSnap.name.length * 11 + 65} 
                        height="20" 
                        fill="#1e1b4b" 
                        rx="4" 
                        opacity="0.9" 
                      />
                      <text x="8" y="0" fill="#a5b4fc" fontSize="9" fontWeight="bold">磁性吸附:</text>
                      <text x="48" y="0" fill="#ffffff" fontSize="9" fontWeight="bold">{activeSnap.name}</text>
                    </g>
                  </g>
                )}

                {/* Active Alignment Guidelines */}
                {isEditMode && activeAlignmentLines.map((line, idx) => {
                  if (line.type === 'horizontal') {
                    return (
                      <line
                        key={`align-h-${idx}`}
                        x1="0"
                        y1={line.value}
                        x2="1200"
                        y2={line.value}
                        stroke="#f43f5e"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        style={{ pointerEvents: 'none' }}
                      />
                    );
                  } else {
                    return (
                      <line
                        key={`align-v-${idx}`}
                        x1={line.value}
                        y1="0"
                        x2={line.value}
                        y2="850"
                        stroke="#f43f5e"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        style={{ pointerEvents: 'none' }}
                      />
                    );
                  }
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* RIGHT PANEL: Properties / Telemetry Simulator */}
        {isEditMode && (
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
          {selectedElement ? (
            /* COMPONENT PROPERTY & DATA BINDING PANEL */
            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  <span>元件属性 & 测点绑定</span>
                </h3>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-500 border border-slate-100 space-y-1">
                <div><span className="font-semibold text-slate-700">唯一标识 ID:</span> {selectedElement.id}</div>
                <div><span className="font-semibold text-slate-700">元件类型 Type:</span> {selectedElement.type}</div>
              </div>

              {/* Coordinates block replaced with a clean align helper block */}
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>位置自动对齐中</span>
                </span>
                <p className="text-[10px] text-indigo-950 leading-relaxed">
                  在画布中拖动元件时，系统将自动检测与其他元件的水平或垂直对齐状态，并以 <span className="text-rose-500 font-bold">红色虚线对齐辅助线</span> 实时显示，您无需手动修改 X/Y 位置坐标。
                </p>
              </div>

              {/* Element custom edits */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block border-t border-slate-100 pt-3">业务参数配置</span>

                {selectedElement.label !== undefined && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">标签名称 / 编号</label>
                    <input
                      type="text"
                      value={selectedElement.label || ''}
                      onChange={(e) => updateSelectedElement({ label: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    />
                  </div>
                )}

                {selectedElement.type === 'Breaker' && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">绑定开关遥信测点</label>
                    <select
                      value={selectedElement.boundPoint || ''}
                      onChange={(e) => updateSelectedElement({ boundPoint: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    >
                      <option value="">-- 未绑定 (默认合闸) --</option>
                      {Object.entries(telemetry)
                        .filter(([_, pt]) => pt.name.includes('开关') || pt.value === 'closed' || pt.value === 'open')
                        .map(([key, pt]) => (
                          <option key={key} value={key}>{pt.name} ({key})</option>
                        ))
                      }
                    </select>
                  </div>
                )}

                {selectedElement.type === 'FlowLine' && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">绑定功率测点 (控制潮流方向)</label>
                    <select
                      value={selectedElement.powerPointKey || ''}
                      onChange={(e) => updateSelectedElement({ powerPointKey: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                    >
                      <option value="">-- 不绑定 (无源) --</option>
                      {Object.entries(telemetry)
                        .filter(([_, pt]) => pt.name.includes('功率'))
                        .map(([key, pt]) => (
                          <option key={key} value={key}>{pt.name} ({key})</option>
                        ))
                      }
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1">💡 绑定后：功率为正虚线向前流动，功率为负虚线反向流动，为0潮流静止。</p>
                  </div>
                )}

                {/* DataBox customization */}
                {selectedElement.type === 'DataBox' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">标题</label>
                      <input
                        type="text"
                        value={selectedElement.title || ''}
                        onChange={(e) => updateSelectedElement({ title: e.target.value })}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">主题色调</label>
                      <div className="flex gap-2">
                        {[
                          { val: '#3b82f6', name: '经典蓝' },
                          { val: '#10b981', name: '储能绿' },
                          { val: '#f59e0b', name: '桩群黄' },
                          { val: '#8b5cf6', name: '关口紫' },
                          { val: '#64748b', name: '暗灰色' }
                        ].map((c) => (
                          <button
                            key={c.val}
                            onClick={() => updateSelectedElement({ color: c.val })}
                            className={`w-5 h-5 rounded-full border border-white ring-1 transition-transform ${
                              selectedElement.color === c.val ? 'ring-slate-900 scale-110' : 'ring-slate-200'
                            }`}
                            style={{ backgroundColor: c.val }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Telemetry data rows table */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-slate-400 font-bold">测点遥测绑定项目 ({selectedElement.data?.length || 0})</label>
                        <button
                          onClick={() => {
                            const current = selectedElement.data || [];
                            updateSelectedElement({
                              data: [...current, { label: '新遥测项', value: '0.0', pointKeys: [] }]
                            });
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> 增加行
                        </button>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {(selectedElement.data || []).map((row, idx) => {
                          const currentKeys = row.pointKeys || (row.pointKey ? [row.pointKey] : []);
                          const isExpanded = expandedRowIdx === idx;

                          return (
                            <div key={idx} className="p-2 border border-slate-100 rounded-lg bg-slate-50 space-y-1.5 text-[10px]">
                              <div className="flex justify-between items-center gap-1">
                                <input
                                  type="text"
                                  value={row.label}
                                  placeholder="监测参数名"
                                  onChange={(e) => {
                                    const updated = [...(selectedElement.data || [])];
                                    updated[idx] = { ...row, label: e.target.value };
                                    updateSelectedElement({ data: updated });
                                  }}
                                  className="w-1/2 p-1 border border-slate-200 rounded font-bold"
                                />
                                
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setExpandedRowIdx(isExpanded ? null : idx)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                                      currentKeys.length > 0 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                        : 'bg-white border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    🔗 绑定 ({currentKeys.length})
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = (selectedElement.data || []).filter((_, i) => i !== idx);
                                      updateSelectedElement({ data: updated });
                                      if (expandedRowIdx === idx) setExpandedRowIdx(null);
                                    }}
                                    className="text-rose-500 hover:text-rose-700 p-0.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* If NOT expanded and not bound, show simple default value input */}
                              {!isExpanded && currentKeys.length === 0 && (
                                <div>
                                  <label className="text-[9px] text-slate-400 block mb-0.5">静态默认值 (未绑定时)</label>
                                  <input
                                    type="text"
                                    value={row.value}
                                    placeholder="220 V"
                                    onChange={(e) => {
                                      const updated = [...(selectedElement.data || [])];
                                      updated[idx] = { ...row, value: e.target.value };
                                      updateSelectedElement({ data: updated });
                                    }}
                                    className="w-full p-1 border border-slate-200 rounded bg-white"
                                  />
                                </div>
                              )}

                              {/* If bound but not expanded, show a small badge list of selected keys */}
                              {!isExpanded && currentKeys.length > 0 && (
                                <div className="bg-white p-1 rounded border border-slate-100 flex flex-wrap gap-1">
                                  {currentKeys.map(k => (
                                    <span key={k} className="bg-indigo-50 text-indigo-700 text-[8.5px] px-1 py-0.2 rounded font-medium border border-indigo-100">
                                      {telemetry[k]?.name.split(' ').pop() || k}
                                    </span>
                                  ))}
                                  {currentKeys.length > 1 && (
                                    <span className="text-emerald-600 text-[8.5px] font-bold self-center ml-1">
                                      (多点汇总求和)
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Binding Expandable section with checklists grouped by device or indicator */}
                              {isExpanded && (
                                <div className="bg-white p-2 rounded border border-slate-200 space-y-2 mt-1.5 max-h-64 overflow-y-auto">
                                  <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-700 text-[9px]">选择测点绑定 (可多选汇总)</span>
                                    <button 
                                      onClick={() => {
                                        const updated = [...(selectedElement.data || [])];
                                        updated[idx] = { ...row, pointKeys: [], pointKey: undefined };
                                        updateSelectedElement({ data: updated });
                                      }}
                                      className="text-slate-400 hover:text-slate-600 text-[8.5px]"
                                    >
                                      清空选择
                                    </button>
                                  </div>

                                  {/* Classification tabs */}
                                  <div className="flex gap-1 bg-slate-50 p-0.5 rounded border border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => setBindCategoryTab('device')}
                                      className={`flex-1 py-1 rounded text-[8.5px] font-bold text-center transition-all ${
                                        bindCategoryTab === 'device'
                                          ? 'bg-white text-indigo-700 shadow-xs'
                                          : 'text-slate-500 hover:text-slate-800'
                                      }`}
                                    >
                                      选择设备测点
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBindCategoryTab('indicator')}
                                      className={`flex-1 py-1 rounded text-[8.5px] font-bold text-center transition-all ${
                                        bindCategoryTab === 'indicator'
                                          ? 'bg-white text-indigo-700 shadow-xs'
                                          : 'text-slate-500 hover:text-slate-800'
                                      }`}
                                    >
                                      选择指标分类
                                    </button>
                                  </div>

                                  <div className="space-y-2.5">
                                    {(bindCategoryTab === 'device' ? TELEMETRY_DEVICES : TELEMETRY_INDICATORS).map((group) => (
                                      <div key={group.name} className="space-y-1">
                                        <div className="text-[8.5px] font-bold text-indigo-500 bg-indigo-50/50 px-1 py-0.5 rounded flex items-center justify-between">
                                          <span>{group.name}</span>
                                          <span className="text-[7.5px] text-slate-400 font-normal">
                                            ({group.points.filter(pt => currentKeys.includes(pt.key)).length}已选)
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-0.5 pl-1">
                                          {group.points.map((pt) => {
                                            const checked = currentKeys.includes(pt.key);
                                            return (
                                              <label key={pt.key} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 p-0.5 rounded text-[8.5px] transition-colors">
                                                <input
                                                  type="checkbox"
                                                  checked={checked}
                                                  onChange={(e) => {
                                                    let newKeys = [...currentKeys];
                                                    if (e.target.checked) {
                                                      if (!newKeys.includes(pt.key)) newKeys.push(pt.key);
                                                    } else {
                                                      newKeys = newKeys.filter(k => k !== pt.key);
                                                    }
                                                    const updated = [...(selectedElement.data || [])];
                                                    updated[idx] = { 
                                                      ...row, 
                                                      pointKeys: newKeys,
                                                      pointKey: newKeys.length === 1 ? newKeys[0] : undefined
                                                    };
                                                    updateSelectedElement({ data: updated });
                                                  }}
                                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                                                />
                                                <span className={checked ? "font-bold text-indigo-900" : "text-slate-600"}>
                                                  {pt.name}
                                                </span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Danger Zone: delete */}
              <button
                onClick={() => handleRemoveElement(selectedElement.id)}
                className="mt-4 w-full bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除该元件
              </button>
            </div>
          ) : (
            /* EDIT MODE EMPTY STATE GUIDE PANEL (WHEN NOTHING IS SELECTED IN EDIT MODE) */
            <div className="p-6 flex flex-col items-center justify-center h-full text-center text-slate-400 gap-3 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                <MousePointer className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700">图元与测点组态编辑模式</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                  请在左侧侧边栏中拖拽图元添加至画布，或在组态图中点击选择任意图元，配置其属性与绑定的遥测遥信测点。
                </p>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default MainWiringDiagramPage;

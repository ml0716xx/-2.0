
// Import React to provide the React namespace for React.ReactNode
import React from 'react';

export interface EnergyStat {
  type: 'pv' | 'storage' | 'charging' | 'grid-in' | 'grid-out';
  todayValue: number;
  yesterdayValue: number; // Added yesterday value
  totalValue: number;
  unit: string;
  trend: number; // percentage
  subValue?: {
    charge?: number;
    discharge?: number;
  };
}

export interface RevenueStat {
  today: number;
  yesterday: number; // Added yesterday value
  total: number;
  trend: number;
  breakdown: {
    pv: number;
    storage: number;
    charging: number;
  };
  rates: {
    peak: number;
    flat: number;
    valley: number;
  };
}

export interface AlarmItem {
  id: string;
  level: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  timestamp: string;
}

export interface FlowNode {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: 'active' | 'idle' | 'warning';
  icon: React.ReactNode;
}

export interface ActiveStrategy {
  id: string;
  name: string;
  englishName: string;
  priority: number;
  type: 'main' | 'sub';
  params: {
    label: string;
    value: string;
    unit: string;
  }[];
  currentTask?: {
    type: string;
    power: number;
  };
}

export interface StrategyGroup {
  startTime: string;
  endTime: string;
  status: 'running' | 'idle';
  activeStrategies: ActiveStrategy[];
  nextTask: {
    type: string;
    time: string;
    power: number;
  };
}

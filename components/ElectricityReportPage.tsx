import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Download, Calendar, Info, ChevronLeft, ChevronRight } from 'lucide-react';

// TOU breakdown interface
interface TouElectricityBreakdown {
  sharp: number;      // 尖峰
  peak: number;       // 高峰
  flat: number;       // 平段
  valley: number;     // 低谷
  deepValley: number; // 深谷
  total: number;      // 合计
}

// 1. 总电量 (微网)
interface MicrogridElectricityRecord {
  time: string;
  consumption: TouElectricityBreakdown; // 微网总用电量
  supply: TouElectricityBreakdown;      // 微网总供电量
}

// 2. 电网
interface GridElectricityRecord {
  time: string;
  importKwh: TouElectricityBreakdown;   // 下网电量
  exportKwh: TouElectricityBreakdown;   // 上网电量
  antiBackflowImport: number;           // 防逆流电表 下网(kWh)
  antiBackflowExport: number;           // 防逆流电表 上网(kWh)
}

// 3. 光伏
interface PvElectricityRecord {
  time: string;
  generation: TouElectricityBreakdown;  // 发电量
  gridExport: TouElectricityBreakdown;  // 上网电量
  selfUse: TouElectricityBreakdown;     // 自用电量
}

// 4. 储能
interface EssElectricityRecord {
  time: string;
  charge: TouElectricityBreakdown;      // 充电量
  discharge: TouElectricityBreakdown;   // 放电量
  soc?: number;                         // 截止SOC(%) (仅小时模式)
}

// 5. 充电站
interface EvElectricityRecord {
  time: string;
  charge: TouElectricityBreakdown;      // 充电量
  discharge: TouElectricityBreakdown;   // 放电量
}

// 6. 负载
interface LoadElectricityRecord {
  time: string;
  consumption: TouElectricityBreakdown; // 负载用电量
}

// Mock Daily Data Generator
const dates = [
  '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05',
  '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10',
  '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15',
  '2026-08-16', '2026-08-17', '2026-08-18', '2026-08-19'
];

// Helper to create TOU object
const makeTou = (sharp: number, peak: number, flat: number, valley: number, deepValley: number = 0): TouElectricityBreakdown => ({
  sharp,
  peak,
  flat,
  valley,
  deepValley,
  total: Number((sharp + peak + flat + valley + deepValley).toFixed(1))
});

// 1. 总电量 Mock Data
const mockMicrogridDaily: MicrogridElectricityRecord[] = dates.map((d, i) => {
  const base = 12000 + (i % 5) * 1100 - (i === 1 || i === 8 ? 6000 : 0);
  const sharp = Number((base * 0.12).toFixed(1));
  const peak = Number((base * 0.35).toFixed(1));
  const flat = Number((base * 0.28).toFixed(1));
  const valley = Number((base * 0.25).toFixed(1));
  return {
    time: d,
    consumption: makeTou(sharp, peak, flat, valley, 0),
    supply: makeTou(sharp, peak, flat, valley, 0)
  };
});

// 2. 电网 Mock Data
const mockGridDaily: GridElectricityRecord[] = dates.map((d, i) => {
  const isWeekend = i === 1 || i === 8 || i === 15;
  const impBase = isWeekend ? 4800 : 7500 + (i % 3) * 200;
  const expBase = isWeekend ? 0 : 350 + (i % 4) * 350;

  const impSharp = Number((impBase * 0.05).toFixed(1));
  const impPeak = Number((impBase * 0.30).toFixed(1));
  const impFlat = Number((impBase * 0.35).toFixed(1));
  const impValley = Number((impBase * 0.30).toFixed(1));

  const expPeak = Number((expBase * 0.60).toFixed(1));
  const expFlat = Number((expBase * 0.40).toFixed(1));

  const totalImp = Number((impSharp + impPeak + impFlat + impValley).toFixed(1));
  const totalExp = Number((expPeak + expFlat).toFixed(1));

  return {
    time: d,
    importKwh: makeTou(impSharp, impPeak, impFlat, impValley, 0),
    exportKwh: makeTou(0, expPeak, expFlat, 0, 0),
    antiBackflowImport: totalImp,
    antiBackflowExport: totalExp
  };
});

// 3. 光伏 Mock Data
const mockPvDaily: PvElectricityRecord[] = dates.map((d, i) => {
  const isLow = i === 1 || i === 8;
  const pvBase = isLow ? 2400 : 8500 + (i % 4) * 450;
  const expBase = isLow ? 0 : 300 + (i % 3) * 400;

  const genPeak = Number((pvBase * 0.58).toFixed(1));
  const genFlat = Number((pvBase * 0.42).toFixed(1));

  const expPeak = Number((expBase * 0.60).toFixed(1));
  const expFlat = Number((expBase * 0.40).toFixed(1));

  const selfPeak = Number((genPeak - expPeak).toFixed(1));
  const selfFlat = Number((genFlat - expFlat).toFixed(1));

  return {
    time: d,
    generation: makeTou(0, genPeak, genFlat, 0, 0),
    gridExport: makeTou(0, expPeak, expFlat, 0, 0),
    selfUse: makeTou(0, selfPeak, selfFlat, 0, 0)
  };
});

// 4. 储能 Mock Data
const mockEssDaily: EssElectricityRecord[] = dates.map((d, i) => {
  const isWeekend = i === 1 || i === 8;
  const chgBase = isWeekend ? 970 : 1100;
  const disBase = isWeekend ? 380 : 1020;

  const chgValley = Number((chgBase * 0.85).toFixed(1));
  const chgFlat = Number((chgBase * 0.15).toFixed(1));

  const disSharp = Number((disBase * 0.25).toFixed(1));
  const disPeak = Number((disBase * 0.50).toFixed(1));
  const disFlat = Number((disBase * 0.25).toFixed(1));

  return {
    time: d,
    charge: makeTou(0, 0, chgFlat, chgValley, 0),
    discharge: makeTou(disSharp, disPeak, disFlat, 0, 0)
  };
});

// 5. 充电站 Mock Data
const mockEvDaily: EvElectricityRecord[] = dates.map((d) => ({
  time: d,
  charge: makeTou(0, 0, 0, 0, 0),
  discharge: makeTou(0, 0, 0, 0, 0)
}));

// 6. 负载 Mock Data
const mockLoadDaily: LoadElectricityRecord[] = dates.map((d, i) => {
  const isWeekend = i === 1 || i === 8;
  const base = isWeekend ? 5500 : 14200 + (i % 4) * 500;

  const sharp = Number((base * 0.15).toFixed(1));
  const peak = Number((base * 0.40).toFixed(1));
  const flat = Number((base * 0.25).toFixed(1));
  const valley = Number((base * 0.20).toFixed(1));

  return {
    time: d,
    consumption: makeTou(sharp, peak, flat, valley, 0)
  };
});

type TabType = 'microgrid' | 'grid' | 'pv' | 'ess' | 'ev' | 'load';

export const ElectricityReportPage: React.FC = () => {
  // Tabs: 'microgrid' | 'grid' | 'pv' | 'ess' | 'ev' | 'load'
  const [activeTab, setActiveTab] = useState<TabType>('microgrid');

  // Query Filters
  const [selectedMetric, setSelectedMetric] = useState<string>('全部');
  const [timeUnit, setTimeUnit] = useState<'小时' | '日' | '月' | '年'>('日');
  const [dateRange, setDateRange] = useState<string>('2026-08-01 ~ 2026-08-19');
  const [isCriteriaModified, setIsCriteriaModified] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  // Handle Tab Change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setIsCriteriaModified(false);
  };

  // Handle Time Unit switch
  const handleTimeUnitChange = (unit: '小时' | '日' | '月' | '年') => {
    setTimeUnit(unit);
    setCurrentPage(1);
    setIsCriteriaModified(true);
    if (unit === '小时') {
      setDateRange('2026-08-19 ~ 2026-08-19');
    } else if (unit === '日') {
      setDateRange('2026-08-01 ~ 2026-08-19');
    } else if (unit === '月') {
      setDateRange('2026-01 ~ 2026-08');
    } else {
      setDateRange('2024 ~ 2026');
    }
  };

  const handleSearch = () => {
    setIsCriteriaModified(false);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedMetric('全部');
    setTimeUnit('日');
    setDateRange('2026-08-01 ~ 2026-08-19');
    setIsCriteriaModified(false);
    setCurrentPage(1);
  };

  const fmt = (num: number, decimals: number = 1) => {
    if (num === 0) return '0.0';
    return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Paginated Rows for Tab 1 (Microgrid)
  const displayedMicrogrid = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockMicrogridDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  // Totals for Tab 1 (Microgrid)
  const totalMicrogrid = useMemo(() => {
    const sumTou = (key: 'consumption' | 'supply') => {
      return mockMicrogridDaily.reduce((acc, row) => ({
        sharp: acc.sharp + row[key].sharp,
        peak: acc.peak + row[key].peak,
        flat: acc.flat + row[key].flat,
        valley: acc.valley + row[key].valley,
        deepValley: acc.deepValley + row[key].deepValley,
        total: acc.total + row[key].total,
      }), { sharp: 0, peak: 0, flat: 0, valley: 0, deepValley: 0, total: 0 });
    };
    return {
      consumption: sumTou('consumption'),
      supply: sumTou('supply'),
    };
  }, []);

  // Paginated Rows for Tab 2 (Grid)
  const displayedGrid = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockGridDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  // Totals for Tab 2 (Grid)
  const totalGrid = useMemo(() => {
    const sumTou = (key: 'importKwh' | 'exportKwh') => {
      return mockGridDaily.reduce((acc, row) => ({
        sharp: acc.sharp + row[key].sharp,
        peak: acc.peak + row[key].peak,
        flat: acc.flat + row[key].flat,
        valley: acc.valley + row[key].valley,
        deepValley: acc.deepValley + row[key].deepValley,
        total: acc.total + row[key].total,
      }), { sharp: 0, peak: 0, flat: 0, valley: 0, deepValley: 0, total: 0 });
    };
    return {
      importKwh: sumTou('importKwh'),
      exportKwh: sumTou('exportKwh'),
      antiBackflowImport: mockGridDaily.reduce((a, r) => a + r.antiBackflowImport, 0),
      antiBackflowExport: mockGridDaily.reduce((a, r) => a + r.antiBackflowExport, 0),
    };
  }, []);

  // Paginated Rows for Tab 3 (PV)
  const displayedPv = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockPvDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  // Totals for Tab 3 (PV)
  const totalPv = useMemo(() => {
    const sumTou = (key: 'generation' | 'gridExport' | 'selfUse') => {
      return mockPvDaily.reduce((acc, row) => ({
        sharp: acc.sharp + row[key].sharp,
        peak: acc.peak + row[key].peak,
        flat: acc.flat + row[key].flat,
        valley: acc.valley + row[key].valley,
        deepValley: acc.deepValley + row[key].deepValley,
        total: acc.total + row[key].total,
      }), { sharp: 0, peak: 0, flat: 0, valley: 0, deepValley: 0, total: 0 });
    };
    return {
      generation: sumTou('generation'),
      gridExport: sumTou('gridExport'),
      selfUse: sumTou('selfUse'),
    };
  }, []);

  // Paginated Rows for Tab 4 (ESS)
  const displayedEss = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockEssDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  // Totals for Tab 4 (ESS)
  const totalEss = useMemo(() => {
    const sumTou = (key: 'charge' | 'discharge') => {
      return mockEssDaily.reduce((acc, row) => ({
        sharp: acc.sharp + row[key].sharp,
        peak: acc.peak + row[key].peak,
        flat: acc.flat + row[key].flat,
        valley: acc.valley + row[key].valley,
        deepValley: acc.deepValley + row[key].deepValley,
        total: acc.total + row[key].total,
      }), { sharp: 0, peak: 0, flat: 0, valley: 0, deepValley: 0, total: 0 });
    };
    return {
      charge: sumTou('charge'),
      discharge: sumTou('discharge'),
    };
  }, []);

  // Paginated Rows for Tab 5 (EV)
  const displayedEv = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockEvDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  // Totals for Tab 5 (EV)
  const totalEv = useMemo(() => {
    const sumTou = (key: 'charge' | 'discharge') => {
      return mockEvDaily.reduce((acc, row) => ({
        sharp: acc.sharp + row[key].sharp,
        peak: acc.peak + row[key].peak,
        flat: acc.flat + row[key].flat,
        valley: acc.valley + row[key].valley,
        deepValley: acc.deepValley + row[key].deepValley,
        total: acc.total + row[key].total,
      }), { sharp: 0, peak: 0, flat: 0, valley: 0, deepValley: 0, total: 0 });
    };
    return {
      charge: sumTou('charge'),
      discharge: sumTou('discharge'),
    };
  }, []);

  // Paginated Rows for Tab 6 (Load)
  const displayedLoad = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockLoadDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  // Totals for Tab 6 (Load)
  const totalLoad = useMemo(() => {
    return {
      consumption: mockLoadDaily.reduce((acc, row) => ({
        sharp: acc.sharp + row.consumption.sharp,
        peak: acc.peak + row.consumption.peak,
        flat: acc.flat + row.consumption.flat,
        valley: acc.valley + row.consumption.valley,
        deepValley: acc.deepValley + row.consumption.deepValley,
        total: acc.total + row.consumption.total,
      }), { sharp: 0, peak: 0, flat: 0, valley: 0, deepValley: 0, total: 0 })
    };
  }, []);

  const totalRecords = mockMicrogridDaily.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // CSV Export
  const handleExport = () => {
    const tabNames: Record<TabType, string> = {
      microgrid: '总电量',
      grid: '电网',
      pv: '光伏',
      ess: '储能',
      ev: '充电站',
      load: '负载'
    };

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeTab === 'microgrid') {
      headers = [
        '时间',
        '用电量-尖峰(kWh)', '用电量-高峰(kWh)', '用电量-平段(kWh)', '用电量-低谷(kWh)', '用电量-深谷(kWh)', '微网总用电量(kWh)',
        '供电量-尖峰(kWh)', '供电量-高峰(kWh)', '供电量-平段(kWh)', '供电量-低谷(kWh)', '供电量-深谷(kWh)', '微网总供电量(kWh)'
      ];
      rows = mockMicrogridDaily.map(r => [
        `"${r.time}"`,
        r.consumption.sharp, r.consumption.peak, r.consumption.flat, r.consumption.valley, r.consumption.deepValley, r.consumption.total,
        r.supply.sharp, r.supply.peak, r.supply.flat, r.supply.valley, r.supply.deepValley, r.supply.total
      ]);
    } else if (activeTab === 'grid') {
      headers = [
        '时间',
        '下网-尖峰(kWh)', '下网-高峰(kWh)', '下网-平段(kWh)', '下网-低谷(kWh)', '下网-深谷(kWh)', '电网总下网(kWh)',
        '上网-尖峰(kWh)', '上网-高峰(kWh)', '上网-平段(kWh)', '上网-低谷(kWh)', '上网-深谷(kWh)', '电网总上网(kWh)',
        '防逆流电表下网(kWh)', '防逆流电表上网(kWh)'
      ];
      rows = mockGridDaily.map(r => [
        `"${r.time}"`,
        r.importKwh.sharp, r.importKwh.peak, r.importKwh.flat, r.importKwh.valley, r.importKwh.deepValley, r.importKwh.total,
        r.exportKwh.sharp, r.exportKwh.peak, r.exportKwh.flat, r.exportKwh.valley, r.exportKwh.deepValley, r.exportKwh.total,
        r.antiBackflowImport, r.antiBackflowExport
      ]);
    } else if (activeTab === 'pv') {
      headers = [
        '时间',
        '发电量-尖峰(kWh)', '发电量-高峰(kWh)', '发电量-平段(kWh)', '发电量-低谷(kWh)', '发电量-深谷(kWh)', '光伏发电量(kWh)',
        '上网-尖峰(kWh)', '上网-高峰(kWh)', '上网-平段(kWh)', '上网-低谷(kWh)', '上网-深谷(kWh)', '上网总电量(kWh)',
        '自用-尖峰(kWh)', '自用-高峰(kWh)', '自用-平段(kWh)', '自用-低谷(kWh)', '自用-深谷(kWh)', '自用总电量(kWh)'
      ];
      rows = mockPvDaily.map(r => [
        `"${r.time}"`,
        r.generation.sharp, r.generation.peak, r.generation.flat, r.generation.valley, r.generation.deepValley, r.generation.total,
        r.gridExport.sharp, r.gridExport.peak, r.gridExport.flat, r.gridExport.valley, r.gridExport.deepValley, r.gridExport.total,
        r.selfUse.sharp, r.selfUse.peak, r.selfUse.flat, r.selfUse.valley, r.selfUse.deepValley, r.selfUse.total
      ]);
    } else if (activeTab === 'ess') {
      headers = [
        '时间',
        '充电-尖峰(kWh)', '充电-高峰(kWh)', '充电-平段(kWh)', '充电-低谷(kWh)', '充电-深谷(kWh)', '储能充电量(kWh)',
        '放电-尖峰(kWh)', '放电-高峰(kWh)', '放电-平段(kWh)', '放电-低谷(kWh)', '放电-深谷(kWh)', '储能放电量(kWh)'
      ];
      rows = mockEssDaily.map(r => [
        `"${r.time}"`,
        r.charge.sharp, r.charge.peak, r.charge.flat, r.charge.valley, r.charge.deepValley, r.charge.total,
        r.discharge.sharp, r.discharge.peak, r.discharge.flat, r.discharge.valley, r.discharge.deepValley, r.discharge.total
      ]);
    } else if (activeTab === 'ev') {
      headers = [
        '时间',
        '充电-尖峰(kWh)', '充电-高峰(kWh)', '充电-平段(kWh)', '充电-低谷(kWh)', '充电-深谷(kWh)', '充电站充电量(kWh)',
        '放电-尖峰(kWh)', '放电-高峰(kWh)', '放电-平段(kWh)', '放电-低谷(kWh)', '放电-深谷(kWh)', '充电站放电量(kWh)'
      ];
      rows = mockEvDaily.map(r => [
        `"${r.time}"`,
        r.charge.sharp, r.charge.peak, r.charge.flat, r.charge.valley, r.charge.deepValley, r.charge.total,
        r.discharge.sharp, r.discharge.peak, r.discharge.flat, r.discharge.valley, r.discharge.deepValley, r.discharge.total
      ]);
    } else {
      headers = [
        '时间',
        '用电量-尖峰(kWh)', '用电量-高峰(kWh)', '用电量-平段(kWh)', '用电量-低谷(kWh)', '用电量-深谷(kWh)', '负载用电量(kWh)'
      ];
      rows = mockLoadDaily.map(r => [
        `"${r.time}"`,
        r.consumption.sharp, r.consumption.peak, r.consumption.flat, r.consumption.valley, r.consumption.deepValley, r.consumption.total
      ]);
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `微网电量报表_${tabNames[activeTab]}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded border border-[#e8e8e8] shadow-sm">
      {/* Top Tabs - Exact design: Plain text tabs, green active underline */}
      <div className="flex items-center gap-8 px-6 pt-3 border-b border-[#e8e8e8]">
        <button
          onClick={() => handleTabChange('microgrid')}
          className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'microgrid'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          总电量
        </button>
        <button
          onClick={() => handleTabChange('grid')}
          className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'grid'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          电网
        </button>
        <button
          onClick={() => handleTabChange('pv')}
          className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'pv'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          光伏
        </button>
        <button
          onClick={() => handleTabChange('ess')}
          className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'ess'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          储能
        </button>
        <button
          onClick={() => handleTabChange('ev')}
          className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'ev'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          充电站
        </button>
        <button
          onClick={() => handleTabChange('load')}
          className={`pb-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
            activeTab === 'load'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          负载
        </button>
      </div>

      {/* Query Filter Toolbar */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left Form Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* 统计指标 */}
          <div className="flex items-center gap-2">
            <span className="text-[#595959] whitespace-nowrap">统计指标:</span>
            <select
              value={selectedMetric}
              onChange={(e) => {
                setSelectedMetric(e.target.value);
                setIsCriteriaModified(true);
              }}
              className="bg-white border border-[#d9d9d9] rounded px-3 py-1.5 text-xs text-[#262626] focus:outline-none focus:border-[#00B578] min-w-[120px]"
            >
              <option value="全部">全部时段</option>
              <option value="尖峰">尖峰</option>
              <option value="高峰">高峰</option>
              <option value="平段">平段</option>
              <option value="低谷">低谷</option>
              <option value="深谷">深谷</option>
            </select>
          </div>

          {/* 时间单位 */}
          <div className="flex items-center gap-2">
            <span className="text-[#595959] whitespace-nowrap">时间单位:</span>
            <select
              value={timeUnit}
              onChange={(e) => handleTimeUnitChange(e.target.value as any)}
              className="bg-white border border-[#d9d9d9] rounded px-3 py-1.5 text-xs text-[#262626] focus:outline-none focus:border-[#00B578] min-w-[80px]"
            >
              <option value="小时">小时</option>
              <option value="日">日</option>
              <option value="月">月</option>
              <option value="年">年</option>
            </select>
          </div>

          {/* 统计周期 */}
          <div className="flex items-center gap-2">
            <span className="text-[#595959] whitespace-nowrap">统计周期:</span>
            <div className="relative">
              <input
                type="text"
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setIsCriteriaModified(true);
                }}
                className="bg-white border border-[#d9d9d9] rounded pl-3 pr-8 py-1.5 text-xs text-[#262626] focus:outline-none focus:border-[#00B578] w-52"
              />
              <Calendar className="w-3.5 h-3.5 text-[#8c8c8c] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Hint tag if modified */}
          {isCriteriaModified && (
            <div className="text-[11px] bg-[#262626] text-white px-2 py-1 rounded shadow-sm">
              生成条件已变更，点击重新生成
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={handleSearch}
            className="bg-[#00B578] hover:bg-[#009b67] text-white text-xs px-4 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>查询</span>
          </button>

          <button
            onClick={handleReset}
            className="bg-white hover:bg-[#fafafa] text-[#595959] border border-[#d9d9d9] text-xs px-4 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8c8c8c]" />
            <span>重置</span>
          </button>
        </div>

        {/* Right Export Button */}
        <div>
          <button
            onClick={handleExport}
            className="bg-white hover:bg-[#f6ffed] text-[#00B578] border border-[#00B578] text-xs px-3.5 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* Main Multi-level Header Table */}
      <div className="overflow-x-auto border-t border-[#e8e8e8]">
        {/* ===================== TAB 1: 总电量 (微网) ===================== */}
        {activeTab === 'microgrid' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1280px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-[#e8e8e8] w-36">时间</th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-[#e8e8e8]">微网总用电量(kWh)</th>
                <th colSpan={6} className="py-2 px-3 text-center">微网总供电量(kWh)</th>
              </tr>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 用电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626] border-r border-[#e8e8e8]">合计</th>
                {/* 供电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626]">合计</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedMicrogrid.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  {/* 用电量 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.deepValley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(row.consumption.total)}</td>
                  {/* 供电量 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.supply.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.supply.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.supply.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.supply.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.supply.deepValley)}</td>
                  <td className="py-2.5 px-2.5 text-right font-medium">{fmt(row.supply.total)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                {/* 用电量合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.consumption.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.consumption.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.consumption.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.consumption.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.consumption.deepValley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(totalMicrogrid.consumption.total)}</td>
                {/* 供电量合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.supply.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.supply.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.supply.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.supply.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalMicrogrid.supply.deepValley)}</td>
                <td className="py-2.5 px-2.5 text-right font-medium">{fmt(totalMicrogrid.supply.total)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ===================== TAB 2: 电网 ===================== */}
        {activeTab === 'grid' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1480px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-[#e8e8e8] w-36">时间</th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-[#e8e8e8]">电网下网电量(kWh)</th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-[#e8e8e8]">电网上网电量(kWh)</th>
                <th colSpan={2} className="py-2 px-3 text-center">防逆流电表(kWh)</th>
              </tr>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 下网 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626] border-r border-[#e8e8e8]">合计</th>
                {/* 上网 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626] border-r border-[#e8e8e8]">合计</th>
                {/* 防逆流电表 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">下网</th>
                <th className="py-2 px-2.5 text-right">上网</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedGrid.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  {/* 下网 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.importKwh.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.importKwh.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.importKwh.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.importKwh.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.importKwh.deepValley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(row.importKwh.total)}</td>
                  {/* 上网 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.exportKwh.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.exportKwh.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.exportKwh.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.exportKwh.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.exportKwh.deepValley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(row.exportKwh.total)}</td>
                  {/* 防逆流 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.antiBackflowImport)}</td>
                  <td className="py-2.5 px-2.5 text-right">{fmt(row.antiBackflowExport)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                {/* 下网合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.importKwh.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.importKwh.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.importKwh.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.importKwh.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.importKwh.deepValley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(totalGrid.importKwh.total)}</td>
                {/* 上网合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.exportKwh.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.exportKwh.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.exportKwh.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.exportKwh.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.exportKwh.deepValley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(totalGrid.exportKwh.total)}</td>
                {/* 防逆流合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalGrid.antiBackflowImport)}</td>
                <td className="py-2.5 px-2.5 text-right">{fmt(totalGrid.antiBackflowExport)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ===================== TAB 3: 光伏 ===================== */}
        {activeTab === 'pv' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-[#e8e8e8] w-36">时间</th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-[#e8e8e8]">光伏发电量(kWh)</th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-[#e8e8e8]">光伏上网电量(kWh)</th>
                <th colSpan={6} className="py-2 px-3 text-center">光伏自用电量(kWh)</th>
              </tr>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 发电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626] border-r border-[#e8e8e8]">合计</th>
                {/* 上网电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626] border-r border-[#e8e8e8]">合计</th>
                {/* 自用电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626]">合计</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedPv.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  {/* 发电量 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.generation.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.generation.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.generation.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.generation.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.generation.deepValley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(row.generation.total)}</td>
                  {/* 上网电量 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.gridExport.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.gridExport.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.gridExport.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.gridExport.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.gridExport.deepValley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(row.gridExport.total)}</td>
                  {/* 自用电量 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.selfUse.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.selfUse.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.selfUse.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.selfUse.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.selfUse.deepValley)}</td>
                  <td className="py-2.5 px-2.5 text-right font-medium">{fmt(row.selfUse.total)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                {/* 发电量合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.generation.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.generation.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.generation.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.generation.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.generation.deepValley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(totalPv.generation.total)}</td>
                {/* 上网电量合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.gridExport.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.gridExport.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.gridExport.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.gridExport.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.gridExport.deepValley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(totalPv.gridExport.total)}</td>
                {/* 自用电量合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.selfUse.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.selfUse.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.selfUse.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.selfUse.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalPv.selfUse.deepValley)}</td>
                <td className="py-2.5 px-2.5 text-right font-medium">{fmt(totalPv.selfUse.total)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ===================== TAB 4: 储能 ===================== */}
        {activeTab === 'ess' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1280px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-[#e8e8e8] w-36">时间</th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-[#e8e8e8]">储能充电量(kWh)</th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-[#e8e8e8]">储能放电量(kWh)</th>
                {timeUnit === '小时' && (
                  <th rowSpan={2} className="py-2.5 px-3 text-right">截止SOC（%）</th>
                )}
              </tr>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 充电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626] border-r border-[#e8e8e8]">合计</th>
                {/* 放电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626] border-r border-[#e8e8e8]">合计</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedEss.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  {/* 充电量 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.charge.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.charge.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.charge.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.charge.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.charge.deepValley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(row.charge.total)}</td>
                  {/* 放电量 */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.discharge.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.discharge.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.discharge.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.discharge.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.discharge.deepValley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(row.discharge.total)}</td>
                  {timeUnit === '小时' && (
                    <td className="py-2.5 px-3 text-right">{row.soc !== undefined ? fmt(row.soc) : '--'}</td>
                  )}
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                {/* 充电合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.charge.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.charge.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.charge.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.charge.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.charge.deepValley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(totalEss.charge.total)}</td>
                {/* 放电合计 */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.discharge.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.discharge.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.discharge.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.discharge.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalEss.discharge.deepValley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium">{fmt(totalEss.discharge.total)}</td>
                {timeUnit === '小时' && (
                  <td className="py-2.5 px-3 text-right text-[#8c8c8c]">--</td>
                )}
              </tr>
            </tbody>
          </table>
        )}

        {/* ===================== TAB 5: 充电站 ===================== */}
        {activeTab === 'ev' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1280px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-[#e8e8e8] w-36">时间</th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-[#e8e8e8]">充电站充电量(kWh)</th>
                <th colSpan={6} className="py-2 px-3 text-center">充电站放电量(kWh)</th>
              </tr>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 充电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626] border-r border-[#e8e8e8]">合计</th>
                {/* 放电量 */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626]">合计</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedEv.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-2.5 text-right font-medium text-[#8c8c8c]">--</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right font-medium text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-2.5 text-right font-medium text-[#8c8c8c]">--</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ===================== TAB 6: 负载 ===================== */}
        {activeTab === 'load' && (
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-[#e8e8e8] w-36">时间</th>
                <th colSpan={6} className="py-2 px-3 text-center">负载用电量(kWh)</th>
              </tr>
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                <th className="py-2 px-2.5 text-right font-medium text-[#262626]">合计</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedLoad.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.sharp)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.peak)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.flat)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.valley)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.consumption.deepValley)}</td>
                  <td className="py-2.5 px-2.5 text-right font-medium">{fmt(row.consumption.total)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalLoad.consumption.sharp)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalLoad.consumption.peak)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalLoad.consumption.flat)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalLoad.consumption.valley)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalLoad.consumption.deepValley)}</td>
                <td className="py-2.5 px-2.5 text-right font-medium">{fmt(totalLoad.consumption.total)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#595959] border-t border-[#e8e8e8]">
        <div>
          共 {totalRecords} 条记录 第{currentPage}/{Math.max(1, totalPages)}页
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center border border-[#d9d9d9] rounded hover:border-[#00B578] disabled:opacity-40 disabled:hover:border-[#d9d9d9] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'border border-[#00B578] text-[#00B578] font-medium bg-white'
                    : 'border border-[#d9d9d9] text-[#595959] hover:border-[#00B578] bg-white'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-7 h-7 flex items-center justify-center border border-[#d9d9d9] rounded hover:border-[#00B578] disabled:opacity-40 disabled:hover:border-[#d9d9d9] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-[#d9d9d9] rounded px-2 py-1 bg-white text-xs text-[#262626] focus:outline-none focus:border-[#00B578]"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
          </select>

          <div className="flex items-center gap-1.5">
            <span>跳至</span>
            <input
              type="text"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const p = parseInt(jumpPageInput);
                  if (!isNaN(p) && p >= 1 && p <= totalPages) {
                    setCurrentPage(p);
                  }
                }
              }}
              className="w-10 h-7 border border-[#d9d9d9] rounded text-center text-xs text-[#262626] focus:outline-none focus:border-[#00B578]"
            />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricityReportPage;

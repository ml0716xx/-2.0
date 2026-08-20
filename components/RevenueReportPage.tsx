import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Download, Calendar, Info, ChevronLeft, ChevronRight } from 'lucide-react';

// Tab 1: 总收益 Data Item
interface TotalRevenueRecord {
  time: string;
  // 光伏收益
  pvGridExportKwh: number;
  pvGridExportRevenue: number;
  pvSelfUseKwh: number;
  pvSelfUseRevenue: number;
  // 储能收益
  essChargeKwh: number;
  essDischargeKwh: number;
  essRevenue: number;
  // 充电收益
  evChargeKwh: number | null;
  evRevenue: number | null;
  // 总收益
  totalRevenue: number;
}

// Tab 2: 光伏收益 Data Item
interface PvRevenueRecord {
  time: string;
  // 尖峰
  sharpExportKwh: number;
  sharpExportRev: number;
  sharpSelfKwh: number;
  sharpSelfRev: number;
  // 高峰
  peakExportKwh: number;
  peakExportRev: number;
  peakSelfKwh: number;
  peakSelfRev: number;
  // 平段
  flatExportKwh: number;
  flatExportRev: number;
  flatSelfKwh: number;
  flatSelfRev: number;
  // 低谷
  valleyExportKwh: number;
  valleyExportRev: number;
  valleySelfKwh: number;
  valleySelfRev: number;
  // 光伏收益合计
  totalPvRevenue: number;
}

// Tab 3: 储能收益 Data Item
interface EssRevenueRecord {
  time: string;
  // 尖峰
  sharpChargeKwh: number;
  sharpChargeCost: number;
  sharpDischargeKwh: number;
  sharpDischargeIncome: number;
  // 高峰
  peakChargeKwh: number;
  peakChargeCost: number;
  peakDischargeKwh: number;
  peakDischargeIncome: number;
  // 平段
  flatChargeKwh: number;
  flatChargeCost: number;
  flatDischargeKwh: number;
  flatDischargeIncome: number;
  // 低谷
  valleyChargeKwh: number;
  valleyChargeCost: number;
  valleyDischargeKwh: number;
  valleyDischargeIncome: number;
  // 深谷
  deepValleyChargeKwh: number;
  deepValleyChargeCost: number;
  deepValleyDischargeKwh: number;
  deepValleyDischargeIncome: number;
  // 储能收益
  totalEssRevenue: number;
}

// Tab 4: 充电收益 Data Item
interface EvRevenueRecord {
  time: string;
  // 尖峰
  sharpChargeKwh: number;
  sharpChargeCost: number;
  // 高峰
  peakChargeKwh: number;
  peakChargeCost: number;
  // 平段
  flatChargeKwh: number;
  flatChargeCost: number;
  // 低谷
  valleyChargeKwh: number;
  valleyChargeCost: number;
  // 售电收入
  salesIncome: number;
  // 充电收益
  totalEvRevenue: number;
}

// Mock Data for Tab 1: 总收益 (From Image 1)
const mockTotalRevenueDaily: TotalRevenueRecord[] = [
  { time: '2026-08-01', pvGridExportKwh: 2058.0, pvGridExportRevenue: 381.91, pvSelfUseKwh: 5743.7, pvSelfUseRevenue: 2600.24, essChargeKwh: 1103.0, essDischargeKwh: 1109.0, essRevenue: 274.32, evChargeKwh: null, evRevenue: null, totalRevenue: 3256.46 },
  { time: '2026-08-02', pvGridExportKwh: 0.0, pvGridExportRevenue: 0.00, pvSelfUseKwh: 2301.7, pvSelfUseRevenue: 1148.35, essChargeKwh: 977.0, essDischargeKwh: 377.0, essRevenue: -87.06, evChargeKwh: null, evRevenue: null, totalRevenue: 1061.29 },
  { time: '2026-08-03', pvGridExportKwh: 1092.0, pvGridExportRevenue: 554.53, pvSelfUseKwh: 5627.6, pvSelfUseRevenue: 4221.13, essChargeKwh: 682.0, essDischargeKwh: 1138.0, essRevenue: 596.28, evChargeKwh: null, evRevenue: null, totalRevenue: 5371.94 },
  { time: '2026-08-04', pvGridExportKwh: 1827.0, pvGridExportRevenue: 811.94, pvSelfUseKwh: 7534.5, pvSelfUseRevenue: 5474.38, essChargeKwh: 1199.0, essDischargeKwh: 1102.0, essRevenue: 231.44, evChargeKwh: null, evRevenue: null, totalRevenue: 6517.76 },
  { time: '2026-08-05', pvGridExportKwh: 154.0, pvGridExportRevenue: 61.69, pvSelfUseKwh: 9285.1, pvSelfUseRevenue: 6298.56, essChargeKwh: 1112.0, essDischargeKwh: 1027.0, essRevenue: 228.66, evChargeKwh: null, evRevenue: null, totalRevenue: 6588.91 },
  { time: '2026-08-06', pvGridExportKwh: 1491.0, pvGridExportRevenue: 655.20, pvSelfUseKwh: 8281.8, pvSelfUseRevenue: 5792.87, essChargeKwh: 1074.0, essDischargeKwh: 973.0, essRevenue: 160.74, evChargeKwh: null, evRevenue: null, totalRevenue: 6608.81 },
  { time: '2026-08-07', pvGridExportKwh: 1498.0, pvGridExportRevenue: 644.50, pvSelfUseKwh: 7713.8, pvSelfUseRevenue: 5283.78, essChargeKwh: 1076.0, essDischargeKwh: 877.0, essRevenue: 10.33, evChargeKwh: null, evRevenue: null, totalRevenue: 5938.61 },
  { time: '2026-08-08', pvGridExportKwh: 189.0, pvGridExportRevenue: 3.91, pvSelfUseKwh: 8910.0, pvSelfUseRevenue: 2320.00, essChargeKwh: 987.0, essDischargeKwh: 920.0, essRevenue: 326.62, evChargeKwh: null, evRevenue: null, totalRevenue: 2650.53 },
  { time: '2026-08-09', pvGridExportKwh: 0.0, pvGridExportRevenue: 0.00, pvSelfUseKwh: 4316.2, pvSelfUseRevenue: 1471.03, essChargeKwh: 976.0, essDischargeKwh: 1025.0, essRevenue: 457.74, evChargeKwh: null, evRevenue: null, totalRevenue: 1928.77 },
  { time: '2026-08-10', pvGridExportKwh: 357.0, pvGridExportRevenue: 135.12, pvSelfUseKwh: 7865.8, pvSelfUseRevenue: 5136.99, essChargeKwh: 1105.0, essDischargeKwh: 960.0, essRevenue: 12.55, evChargeKwh: null, evRevenue: null, totalRevenue: 5284.66 },
  { time: '2026-08-11', pvGridExportKwh: 480.0, pvGridExportRevenue: 192.00, pvSelfUseKwh: 8220.0, pvSelfUseRevenue: 5310.20, essChargeKwh: 1120.0, essDischargeKwh: 980.0, essRevenue: 135.40, evChargeKwh: null, evRevenue: null, totalRevenue: 5637.60 },
  { time: '2026-08-12', pvGridExportKwh: 320.0, pvGridExportRevenue: 128.00, pvSelfUseKwh: 8580.0, pvSelfUseRevenue: 5520.10, essChargeKwh: 1090.0, essDischargeKwh: 990.0, essRevenue: 154.20, evChargeKwh: null, evRevenue: null, totalRevenue: 5802.30 },
  { time: '2026-08-13', pvGridExportKwh: 210.0, pvGridExportRevenue: 84.00, pvSelfUseKwh: 7890.0, pvSelfUseRevenue: 5120.40, essChargeKwh: 1080.0, essDischargeKwh: 950.0, essRevenue: 142.30, evChargeKwh: null, evRevenue: null, totalRevenue: 5346.70 },
  { time: '2026-08-14', pvGridExportKwh: 190.0, pvGridExportRevenue: 76.00, pvSelfUseKwh: 8260.0, pvSelfUseRevenue: 5380.00, essChargeKwh: 1110.0, essDischargeKwh: 970.0, essRevenue: 151.80, evChargeKwh: null, evRevenue: null, totalRevenue: 5607.80 },
  { time: '2026-08-15', pvGridExportKwh: 85.0, pvGridExportRevenue: 34.00, pvSelfUseKwh: 7715.0, pvSelfUseRevenue: 5010.50, essChargeKwh: 1050.0, essDischargeKwh: 940.0, essRevenue: 128.60, evChargeKwh: null, evRevenue: null, totalRevenue: 5173.10 },
  { time: '2026-08-16', pvGridExportKwh: 0.0, pvGridExportRevenue: 0.00, pvSelfUseKwh: 4300.0, pvSelfUseRevenue: 1820.00, essChargeKwh: 950.0, essDischargeKwh: 910.0, essRevenue: 280.40, evChargeKwh: null, evRevenue: null, totalRevenue: 2100.40 },
  { time: '2026-08-17', pvGridExportKwh: 230.0, pvGridExportRevenue: 92.00, pvSelfUseKwh: 8170.0, pvSelfUseRevenue: 5310.00, essChargeKwh: 1100.0, essDischargeKwh: 960.0, essRevenue: 145.00, evChargeKwh: null, evRevenue: null, totalRevenue: 5547.00 },
  { time: '2026-08-18', pvGridExportKwh: 310.0, pvGridExportRevenue: 124.00, pvSelfUseKwh: 8440.0, pvSelfUseRevenue: 5460.00, essChargeKwh: 1090.0, essDischargeKwh: 980.0, essRevenue: 152.00, evChargeKwh: null, evRevenue: null, totalRevenue: 5736.00 },
  { time: '2026-08-19', pvGridExportKwh: 215.0, pvGridExportRevenue: 86.00, pvSelfUseKwh: 8135.0, pvSelfUseRevenue: 5290.00, essChargeKwh: 1080.0, essDischargeKwh: 960.0, essRevenue: 148.00, evChargeKwh: null, evRevenue: null, totalRevenue: 5524.00 }
];

// Mock Data for Tab 2: 光伏收益 (From Image 2)
const mockPvRevenueDaily: PvRevenueRecord[] = [
  { time: '2026-08-01', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 1205.0, peakExportRev: 254.26, peakSelfKwh: 3410.2, peakSelfRev: 1845.33, flatExportKwh: 853.0, flatExportRev: 127.65, flatSelfKwh: 2333.5, flatSelfRev: 754.91, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 2982.15 },
  { time: '2026-08-02', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 0.0, peakExportRev: 0.00, peakSelfKwh: 1380.5, peakSelfRev: 786.88, flatExportKwh: 0.0, flatExportRev: 0.00, flatSelfKwh: 921.2, flatSelfRev: 361.47, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 1148.35 },
  { time: '2026-08-03', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 650.0, peakExportRev: 365.20, peakSelfKwh: 3350.0, peakSelfRev: 2890.10, flatExportKwh: 442.0, flatExportRev: 189.33, flatSelfKwh: 2277.6, flatSelfRev: 1331.03, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 4775.66 },
  { time: '2026-08-04', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 1080.0, peakExportRev: 520.40, peakSelfKwh: 4500.0, peakSelfRev: 3650.20, flatExportKwh: 747.0, flatExportRev: 291.54, flatSelfKwh: 3034.5, flatSelfRev: 1824.18, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 6286.32 },
  { time: '2026-08-05', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 95.0, peakExportRev: 41.20, peakSelfKwh: 5600.0, peakSelfRev: 4210.30, flatExportKwh: 59.0, flatExportRev: 20.49, flatSelfKwh: 3685.1, flatSelfRev: 2088.26, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 6360.25 },
  { time: '2026-08-06', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 890.0, peakExportRev: 420.10, peakSelfKwh: 4950.0, peakSelfRev: 3820.40, flatExportKwh: 601.0, flatExportRev: 235.10, flatSelfKwh: 3331.8, flatSelfRev: 1972.47, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 6448.07 },
  { time: '2026-08-07', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 910.0, peakExportRev: 415.00, peakSelfKwh: 4620.0, peakSelfRev: 3510.20, flatExportKwh: 588.0, flatExportRev: 229.50, flatSelfKwh: 3093.8, flatSelfRev: 1773.58, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 5928.28 },
  { time: '2026-08-08', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 120.0, peakExportRev: 2.50, peakSelfKwh: 5350.0, peakSelfRev: 1540.00, flatExportKwh: 69.0, flatExportRev: 1.41, flatSelfKwh: 3560.0, flatSelfRev: 780.00, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 2323.91 },
  { time: '2026-08-09', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 0.0, peakExportRev: 0.00, peakSelfKwh: 2600.0, peakSelfRev: 980.00, flatExportKwh: 0.0, flatExportRev: 0.00, flatSelfKwh: 1716.2, flatSelfRev: 491.03, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 1471.03 },
  { time: '2026-08-10', sharpExportKwh: 0.0, sharpExportRev: 0.00, sharpSelfKwh: 0.0, sharpSelfRev: 0.00, peakExportKwh: 210.0, peakExportRev: 85.12, peakSelfKwh: 4720.0, peakSelfRev: 3420.00, flatExportKwh: 147.0, flatExportRev: 50.00, flatSelfKwh: 3145.8, flatSelfRev: 1716.99, valleyExportKwh: 0.0, valleyExportRev: 0.00, valleySelfKwh: 0.0, valleySelfRev: 0.00, totalPvRevenue: 5272.11 }
];

// Mock Data for Tab 3: 储能收益 (From Image 3)
const mockEssRevenueMonthly: EssRevenueRecord[] = [
  { time: '2026-01', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, sharpDischargeKwh: 0.0, sharpDischargeIncome: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, peakDischargeKwh: 24700.0, peakDischargeIncome: 28405.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, flatDischargeKwh: 16500.0, flatDischargeIncome: 12375.00, valleyChargeKwh: 44400.0, valleyChargeCost: 15540.00, valleyDischargeKwh: 0.0, valleyDischargeIncome: 0.00, deepValleyChargeKwh: 0.0, deepValleyChargeCost: 0.00, deepValleyDischargeKwh: 0.0, deepValleyDischargeIncome: 0.00, totalEssRevenue: 25240.00 },
  { time: '2026-02', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, sharpDischargeKwh: 0.0, sharpDischargeIncome: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, peakDischargeKwh: 17400.0, peakDischargeIncome: 20010.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, flatDischargeKwh: 11600.0, flatDischargeIncome: 8700.00, valleyChargeKwh: 31600.0, valleyChargeCost: 11060.00, valleyDischargeKwh: 0.0, valleyDischargeIncome: 0.00, deepValleyChargeKwh: 0.0, deepValleyChargeCost: 0.00, deepValleyDischargeKwh: 0.0, deepValleyDischargeIncome: 0.00, totalEssRevenue: 17650.00 },
  { time: '2026-03', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, sharpDischargeKwh: 0.0, sharpDischargeIncome: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, peakDischargeKwh: 25100.0, peakDischargeIncome: 28865.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, flatDischargeKwh: 16800.0, flatDischargeIncome: 12600.00, valleyChargeKwh: 45200.0, valleyChargeCost: 15820.00, valleyDischargeKwh: 0.0, valleyDischargeIncome: 0.00, deepValleyChargeKwh: 0.0, deepValleyChargeCost: 0.00, deepValleyDischargeKwh: 0.0, deepValleyDischargeIncome: 0.00, totalEssRevenue: 25645.00 },
  { time: '2026-04', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, sharpDischargeKwh: 0.0, sharpDischargeIncome: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, peakDischargeKwh: 24900.0, peakDischargeIncome: 28635.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, flatDischargeKwh: 16700.0, flatDischargeIncome: 12525.00, valleyChargeKwh: 44800.0, valleyChargeCost: 15680.00, valleyDischargeKwh: 0.0, valleyDischargeIncome: 0.00, deepValleyChargeKwh: 0.0, deepValleyChargeCost: 0.00, deepValleyDischargeKwh: 0.0, deepValleyDischargeIncome: 0.00, totalEssRevenue: 25480.00 },
  { time: '2026-05', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, sharpDischargeKwh: 0.0, sharpDischargeIncome: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, peakDischargeKwh: 25800.0, peakDischargeIncome: 29670.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, flatDischargeKwh: 17300.0, flatDischargeIncome: 12975.00, valleyChargeKwh: 46200.0, valleyChargeCost: 16170.00, valleyDischargeKwh: 0.0, valleyDischargeIncome: 0.00, deepValleyChargeKwh: 0.0, deepValleyChargeCost: 0.00, deepValleyDischargeKwh: 0.0, deepValleyDischargeIncome: 0.00, totalEssRevenue: 26475.00 },
  { time: '2026-06', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, sharpDischargeKwh: 0.0, sharpDischargeIncome: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, peakDischargeKwh: 25000.0, peakDischargeIncome: 28750.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, flatDischargeKwh: 16800.0, flatDischargeIncome: 12600.00, valleyChargeKwh: 45000.0, valleyChargeCost: 15750.00, valleyDischargeKwh: 0.0, valleyDischargeIncome: 0.00, deepValleyChargeKwh: 0.0, deepValleyChargeCost: 0.00, deepValleyDischargeKwh: 0.0, deepValleyDischargeIncome: 0.00, totalEssRevenue: 25600.00 },
  { time: '2026-07', sharpChargeKwh: 12000.0, sharpChargeCost: 4200.00, sharpDischargeKwh: 26000.0, sharpDischargeIncome: 37700.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, peakDischargeKwh: 17900.0, peakDischargeIncome: 20585.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, flatDischargeKwh: 0.0, flatDischargeIncome: 0.00, valleyChargeKwh: 35100.0, valleyChargeCost: 12285.00, valleyDischargeKwh: 0.0, valleyDischargeIncome: 0.00, deepValleyChargeKwh: 0.0, deepValleyChargeCost: 0.00, deepValleyDischargeKwh: 0.0, deepValleyDischargeIncome: 0.00, totalEssRevenue: 41800.00 },
  { time: '2026-08', sharpChargeKwh: 5800.0, sharpChargeCost: 2030.00, sharpDischargeKwh: 11500.0, sharpDischargeIncome: 16675.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, peakDischargeKwh: 7874.0, peakDischargeIncome: 9055.10, flatChargeKwh: 0.0, flatChargeCost: 0.00, flatDischargeKwh: 0.0, flatDischargeIncome: 0.00, valleyChargeKwh: 15214.0, valleyChargeCost: 5324.90, valleyDischargeKwh: 0.0, valleyDischargeIncome: 0.00, deepValleyChargeKwh: 0.0, deepValleyChargeCost: 0.00, deepValleyDischargeKwh: 0.0, deepValleyDischargeIncome: 0.00, totalEssRevenue: 18375.20 }
];

// Mock Data for Tab 4: 充电收益 (From Image 4)
const mockEvRevenueDaily: EvRevenueRecord[] = [
  { time: '2026-08-01', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-02', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-03', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-04', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-05', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-06', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-07', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-08', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-09', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 },
  { time: '2026-08-10', sharpChargeKwh: 0.0, sharpChargeCost: 0.00, peakChargeKwh: 0.0, peakChargeCost: 0.00, flatChargeKwh: 0.0, flatChargeCost: 0.00, valleyChargeKwh: 0.0, valleyChargeCost: 0.00, salesIncome: 0.00, totalEvRevenue: 0.00 }
];

export const RevenueReportPage: React.FC = () => {
  // Tabs: 'total' | 'pv' | 'ess' | 'ev'
  const [activeTab, setActiveTab] = useState<'total' | 'pv' | 'ess' | 'ev'>('total');

  // Filter States
  const [selectedMetric, setSelectedMetric] = useState('全部');
  const [timeUnit, setTimeUnit] = useState<'小时' | '日' | '月' | '年'>('日');
  const [dateRange, setDateRange] = useState('2026-08-01 ~ 2026-08-19');
  const [isCriteriaModified, setIsCriteriaModified] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  // Switch Tab
  const handleTabChange = (tab: 'total' | 'pv' | 'ess' | 'ev') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setIsCriteriaModified(false);
    if (tab === 'ess') {
      setTimeUnit('月');
      setDateRange('2026-01 ~ 2026-08');
    } else {
      setTimeUnit('日');
      setDateRange('2026-08-01 ~ 2026-08-19');
    }
  };

  // Switch Time Unit
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
    if (activeTab === 'ess') {
      setTimeUnit('月');
      setDateRange('2026-01 ~ 2026-08');
    } else {
      setTimeUnit('日');
      setDateRange('2026-08-01 ~ 2026-08-19');
    }
    setIsCriteriaModified(false);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const tabName = activeTab === 'total' ? '总收益' : activeTab === 'pv' ? '光伏收益' : activeTab === 'ess' ? '储能收益' : '充电收益';
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeTab === 'total') {
      headers = [
        '时间',
        '光伏上网电量(kWh)', '光伏上网收益(元)', '光伏自用电量(kWh)', '光伏自用收益(元)',
        '储能充电量(kWh)', '储能放电量(kWh)', '储能收益(元)',
        '充电站充电量(kWh)', '充电站充电收益(元)',
        '总收益(元)'
      ];
      rows = mockTotalRevenueDaily.map(r => [
        `"${r.time}"`,
        r.pvGridExportKwh.toFixed(1),
        r.pvGridExportRevenue.toFixed(2),
        r.pvSelfUseKwh.toFixed(1),
        r.pvSelfUseRevenue.toFixed(2),
        r.essChargeKwh.toFixed(1),
        r.essDischargeKwh.toFixed(1),
        r.essRevenue.toFixed(2),
        r.evChargeKwh !== null ? r.evChargeKwh.toFixed(1) : '--',
        r.evRevenue !== null ? r.evRevenue.toFixed(2) : '--',
        r.totalRevenue.toFixed(2)
      ]);
    } else if (activeTab === 'pv') {
      headers = [
        '时间',
        '上网电量-尖峰(kWh)', '上网电量-高峰(kWh)', '上网电量-平段(kWh)', '上网电量-低谷(kWh)',
        '上网收益-尖峰(元)', '上网收益-高峰(元)', '上网收益-平段(元)', '上网收益-低谷(元)',
        '自用电量-尖峰(kWh)', '自用电量-高峰(kWh)', '自用电量-平段(kWh)', '自用电量-低谷(kWh)',
        '自用收益-尖峰(元)', '自用收益-高峰(元)', '自用收益-平段(元)', '自用收益-低谷(元)',
        '光伏收益(元)'
      ];
      rows = mockPvRevenueDaily.map(r => [
        `"${r.time}"`,
        r.sharpExportKwh, r.peakExportKwh, r.flatExportKwh, r.valleyExportKwh,
        r.sharpExportRev, r.peakExportRev, r.flatExportRev, r.valleyExportRev,
        r.sharpSelfKwh, r.peakSelfKwh, r.flatSelfKwh, r.valleySelfKwh,
        r.sharpSelfRev, r.peakSelfRev, r.flatSelfRev, r.valleySelfRev,
        r.totalPvRevenue.toFixed(2)
      ]);
    } else if (activeTab === 'ess') {
      headers = [
        '时间',
        '充电量-尖峰(kWh)', '充电量-高峰(kWh)', '充电量-平段(kWh)', '充电量-低谷(kWh)', '充电量-深谷(kWh)',
        '充电成本-尖峰(元)', '充电成本-高峰(元)', '充电成本-平段(元)', '充电成本-低谷(元)', '充电成本-深谷(元)',
        '放电量-尖峰(kWh)', '放电量-高峰(kWh)', '放电量-平段(kWh)', '放电量-低谷(kWh)', '放电量-深谷(kWh)',
        '放电收入-尖峰(元)', '放电收入-高峰(元)', '放电收入-平段(元)', '放电收入-低谷(元)', '放电收入-深谷(元)',
        '储能收益(元)'
      ];
      rows = mockEssRevenueMonthly.map(r => [
        `"${r.time}"`,
        r.sharpChargeKwh, r.peakChargeKwh, r.flatChargeKwh, r.valleyChargeKwh, r.deepValleyChargeKwh,
        r.sharpChargeCost, r.peakChargeCost, r.flatChargeCost, r.valleyChargeCost, r.deepValleyChargeCost,
        r.sharpDischargeKwh, r.peakDischargeKwh, r.flatDischargeKwh, r.valleyDischargeKwh, r.deepValleyDischargeKwh,
        r.sharpDischargeIncome, r.peakDischargeIncome, r.flatDischargeIncome, r.valleyDischargeIncome, r.deepValleyDischargeIncome,
        r.totalEssRevenue
      ]);
    } else {
      headers = [
        '时间',
        '充电量-尖峰(kWh)', '充电量-高峰(kWh)', '充电量-平段(kWh)', '充电量-低谷(kWh)',
        '充电成本-尖峰(元)', '充电成本-高峰(元)', '充电成本-平段(元)', '充电成本-低谷(元)',
        '售电收入(元)', '充电收益(元)'
      ];
      rows = mockEvRevenueDaily.map(r => [
        `"${r.time}"`,
        r.sharpChargeKwh, r.peakChargeKwh, r.flatChargeKwh, r.valleyChargeKwh,
        r.sharpChargeCost, r.peakChargeCost, r.flatChargeCost, r.valleyChargeCost,
        r.salesIncome, r.totalEvRevenue
      ]);
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `微网收益报表_${tabName}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fmt = (num: number, decimals: number = 2) => {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Compute Total Row for Tab 1
  const totalSummaryTab1 = useMemo(() => {
    return mockTotalRevenueDaily.reduce((acc, r) => ({
      pvGridExportKwh: acc.pvGridExportKwh + r.pvGridExportKwh,
      pvGridExportRevenue: acc.pvGridExportRevenue + r.pvGridExportRevenue,
      pvSelfUseKwh: acc.pvSelfUseKwh + r.pvSelfUseKwh,
      pvSelfUseRevenue: acc.pvSelfUseRevenue + r.pvSelfUseRevenue,
      essChargeKwh: acc.essChargeKwh + r.essChargeKwh,
      essDischargeKwh: acc.essDischargeKwh + r.essDischargeKwh,
      essRevenue: acc.essRevenue + r.essRevenue,
      totalRevenue: acc.totalRevenue + r.totalRevenue
    }), {
      pvGridExportKwh: 0,
      pvGridExportRevenue: 0,
      pvSelfUseKwh: 0,
      pvSelfUseRevenue: 0,
      essChargeKwh: 0,
      essDischargeKwh: 0,
      essRevenue: 0,
      totalRevenue: 0
    });
  }, []);

  // Compute Total Row for Tab 2
  const totalSummaryTab2 = useMemo(() => {
    return mockPvRevenueDaily.reduce((acc, r) => ({
      sharpExportKwh: acc.sharpExportKwh + r.sharpExportKwh,
      sharpExportRev: acc.sharpExportRev + r.sharpExportRev,
      sharpSelfKwh: acc.sharpSelfKwh + r.sharpSelfKwh,
      sharpSelfRev: acc.sharpSelfRev + r.sharpSelfRev,
      peakExportKwh: acc.peakExportKwh + r.peakExportKwh,
      peakExportRev: acc.peakExportRev + r.peakExportRev,
      peakSelfKwh: acc.peakSelfKwh + r.peakSelfKwh,
      peakSelfRev: acc.peakSelfRev + r.peakSelfRev,
      flatExportKwh: acc.flatExportKwh + r.flatExportKwh,
      flatExportRev: acc.flatExportRev + r.flatExportRev,
      flatSelfKwh: acc.flatSelfKwh + r.flatSelfKwh,
      flatSelfRev: acc.flatSelfRev + r.flatSelfRev,
      valleyExportKwh: acc.valleyExportKwh + r.valleyExportKwh,
      valleyExportRev: acc.valleyExportRev + r.valleyExportRev,
      valleySelfKwh: acc.valleySelfKwh + r.valleySelfKwh,
      valleySelfRev: acc.valleySelfRev + r.valleySelfRev,
      totalPvRevenue: acc.totalPvRevenue + r.totalPvRevenue
    }), {
      sharpExportKwh: 0, sharpExportRev: 0, sharpSelfKwh: 0, sharpSelfRev: 0,
      peakExportKwh: 0, peakExportRev: 0, peakSelfKwh: 0, peakSelfRev: 0,
      flatExportKwh: 0, flatExportRev: 0, flatSelfKwh: 0, flatSelfRev: 0,
      valleyExportKwh: 0, valleyExportRev: 0, valleySelfKwh: 0, valleySelfRev: 0,
      totalPvRevenue: 0
    });
  }, []);

  // Compute Total Row for Tab 3
  const totalSummaryTab3 = useMemo(() => {
    return mockEssRevenueMonthly.reduce((acc, r) => ({
      sharpChargeKwh: acc.sharpChargeKwh + r.sharpChargeKwh,
      sharpChargeCost: acc.sharpChargeCost + r.sharpChargeCost,
      sharpDischargeKwh: acc.sharpDischargeKwh + r.sharpDischargeKwh,
      sharpDischargeIncome: acc.sharpDischargeIncome + r.sharpDischargeIncome,
      peakChargeKwh: acc.peakChargeKwh + r.peakChargeKwh,
      peakChargeCost: acc.peakChargeCost + r.peakChargeCost,
      peakDischargeKwh: acc.peakDischargeKwh + r.peakDischargeKwh,
      peakDischargeIncome: acc.peakDischargeIncome + r.peakDischargeIncome,
      flatChargeKwh: acc.flatChargeKwh + r.flatChargeKwh,
      flatChargeCost: acc.flatChargeCost + r.flatChargeCost,
      flatDischargeKwh: acc.flatDischargeKwh + r.flatDischargeKwh,
      flatDischargeIncome: acc.flatDischargeIncome + r.flatDischargeIncome,
      valleyChargeKwh: acc.valleyChargeKwh + r.valleyChargeKwh,
      valleyChargeCost: acc.valleyChargeCost + r.valleyChargeCost,
      valleyDischargeKwh: acc.valleyDischargeKwh + r.valleyDischargeKwh,
      valleyDischargeIncome: acc.valleyDischargeIncome + r.valleyDischargeIncome,
      deepValleyChargeKwh: acc.deepValleyChargeKwh + r.deepValleyChargeKwh,
      deepValleyChargeCost: acc.deepValleyChargeCost + r.deepValleyChargeCost,
      deepValleyDischargeKwh: acc.deepValleyDischargeKwh + r.deepValleyDischargeKwh,
      deepValleyDischargeIncome: acc.deepValleyDischargeIncome + r.deepValleyDischargeIncome,
      totalEssRevenue: acc.totalEssRevenue + r.totalEssRevenue
    }), {
      sharpChargeKwh: 0, sharpChargeCost: 0, sharpDischargeKwh: 0, sharpDischargeIncome: 0,
      peakChargeKwh: 0, peakChargeCost: 0, peakDischargeKwh: 0, peakDischargeIncome: 0,
      flatChargeKwh: 0, flatChargeCost: 0, flatDischargeKwh: 0, flatDischargeIncome: 0,
      valleyChargeKwh: 0, valleyChargeCost: 0, valleyDischargeKwh: 0, valleyDischargeIncome: 0,
      deepValleyChargeKwh: 0, deepValleyChargeCost: 0, deepValleyDischargeKwh: 0, deepValleyDischargeIncome: 0,
      totalEssRevenue: 0
    });
  }, []);

  // Compute Total Row for Tab 4
  const totalSummaryTab4 = useMemo(() => {
    return mockEvRevenueDaily.reduce((acc, r) => ({
      salesIncome: acc.salesIncome + r.salesIncome,
      totalEvRevenue: acc.totalEvRevenue + r.totalEvRevenue
    }), {
      salesIncome: 0,
      totalEvRevenue: 0
    });
  }, []);

  // Current records according to active tab
  const activeRecordsCount = activeTab === 'total' ? mockTotalRevenueDaily.length :
    activeTab === 'pv' ? mockPvRevenueDaily.length :
    activeTab === 'ess' ? mockEssRevenueMonthly.length : mockEvRevenueDaily.length;

  const totalPages = Math.ceil(activeRecordsCount / pageSize);

  const displayedTab1Rows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockTotalRevenueDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  const displayedTab2Rows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockPvRevenueDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  const displayedTab3Rows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockEssRevenueMonthly.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  const displayedTab4Rows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return mockEvRevenueDaily.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  return (
    <div className="bg-white rounded border border-[#e8e8e8] shadow-sm">
      {/* Top Tabs - Exact design from Image 1: Plain text tabs, green active underline */}
      <div className="flex items-center gap-8 px-6 pt-3 border-b border-[#e8e8e8]">
        <button
          onClick={() => handleTabChange('total')}
          className={`pb-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'total'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          总收益
        </button>
        <button
          onClick={() => handleTabChange('pv')}
          className={`pb-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'pv'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          光伏收益
        </button>
        <button
          onClick={() => handleTabChange('ess')}
          className={`pb-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'ess'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          储能收益
        </button>
        <button
          onClick={() => handleTabChange('ev')}
          className={`pb-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'ev'
              ? 'text-[#262626] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00B578]'
              : 'text-[#595959] hover:text-[#262626]'
          }`}
        >
          充电收益
        </button>
      </div>

      {/* Filter Toolbar - Clean standard enterprise styling */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4">
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
              className="bg-white border border-[#d9d9d9] rounded px-3 py-1.5 text-xs text-[#262626] focus:outline-none focus:border-[#00B578] min-w-[140px]"
            >
              <option value="全部">全部</option>
              <option value="光伏收益">光伏收益</option>
              <option value="储能收益">储能收益</option>
              <option value="充电收益">充电收益</option>
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

      {/* Main Table */}
      <div className="overflow-x-auto border-t border-[#e8e8e8]">
        {/* ===================== TAB 1: 总收益 ===================== */}
        {activeTab === 'total' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
            <thead>
              {/* Row 1 */}
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 border-r border-[#e8e8e8] w-36 text-center">时间</th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-[#e8e8e8]">光伏收益</th>
                <th colSpan={3} className="py-2 px-3 text-center border-r border-[#e8e8e8]">储能收益</th>
                <th colSpan={2} className="py-2 px-3 text-center border-r border-[#e8e8e8]">充电收益</th>
                <th rowSpan={2} className="py-2.5 px-3 text-right">总收益(元)</th>
              </tr>
              {/* Row 2 */}
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 光伏收益 */}
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">上网电量(kWh)</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">上网收益(元)</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">自用电量(kWh)</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">自用收益(元)</th>
                {/* 储能收益 */}
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">充电量(kWh)</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">放电量(kWh)</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">收益(元)</th>
                {/* 充电收益 */}
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">充电量(kWh)</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">收益(元)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedTab1Rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.pvGridExportKwh, 1)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.pvGridExportRevenue, 2)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.pvSelfUseKwh, 1)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.pvSelfUseRevenue, 2)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.essChargeKwh, 1)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.essDischargeKwh, 1)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.essRevenue, 2)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                  <td className="py-2.5 px-3 text-right">{fmt(row.totalRevenue, 2)}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab1.pvGridExportKwh, 1)}</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab1.pvGridExportRevenue, 2)}</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab1.pvSelfUseKwh, 1)}</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab1.pvSelfUseRevenue, 2)}</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab1.essChargeKwh, 1)}</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab1.essDischargeKwh, 1)}</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab1.essRevenue, 2)}</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right text-[#8c8c8c]">--</td>
                <td className="py-2.5 px-3 text-right">{fmt(totalSummaryTab1.totalRevenue, 2)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ===================== TAB 2: 光伏收益 ===================== */}
        {activeTab === 'pv' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1500px]">
            <thead>
              {/* Row 1: 明细项目 */}
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 border-r border-[#e8e8e8] w-36 text-center">时间</th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-[#e8e8e8]">上网电量(kWh)</th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-[#e8e8e8]">上网收益(元)</th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-[#e8e8e8]">自用电量(kWh)</th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-[#e8e8e8]">自用收益(元)</th>
                <th rowSpan={2} className="py-2.5 px-3 text-right">光伏收益(元)</th>
              </tr>
              {/* Row 2: 尖峰平谷时段 */}
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 上网电量(kWh) */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                {/* 上网收益(元) */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                {/* 自用电量(kWh) */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                {/* 自用收益(元) */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedTab2Rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  {/* 上网电量(kWh) */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.sharpExportKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.peakExportKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.flatExportKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.valleyExportKwh, 1)}</td>
                  {/* 上网收益(元) */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.sharpExportRev, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.peakExportRev, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.flatExportRev, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.valleyExportRev, 2)}</td>
                  {/* 自用电量(kWh) */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.sharpSelfKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.peakSelfKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.flatSelfKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.valleySelfKwh, 1)}</td>
                  {/* 自用收益(元) */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.sharpSelfRev, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.peakSelfRev, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.flatSelfRev, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.valleySelfRev, 2)}</td>
                  {/* 总计 */}
                  <td className="py-2.5 px-3 text-right">{fmt(row.totalPvRevenue, 2)}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                {/* 上网电量(kWh) */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.sharpExportKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.peakExportKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.flatExportKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.valleyExportKwh, 1)}</td>
                {/* 上网收益(元) */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.sharpExportRev, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.peakExportRev, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.flatExportRev, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.valleyExportRev, 2)}</td>
                {/* 自用电量(kWh) */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.sharpSelfKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.peakSelfKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.flatSelfKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.valleySelfKwh, 1)}</td>
                {/* 自用收益(元) */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.sharpSelfRev, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.peakSelfRev, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.flatSelfRev, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab2.valleySelfRev, 2)}</td>
                {/* 总计 */}
                <td className="py-2.5 px-3 text-right">{fmt(totalSummaryTab2.totalPvRevenue, 2)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ===================== TAB 3: 储能收益 ===================== */}
        {activeTab === 'ess' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1700px]">
            <thead>
              {/* Row 1: 明细项目 */}
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 border-r border-[#e8e8e8] w-36 text-center">时间</th>
                <th colSpan={5} className="py-2 px-3 text-center border-r border-[#e8e8e8]">充电量(kWh)</th>
                <th colSpan={5} className="py-2 px-3 text-center border-r border-[#e8e8e8]">充电成本(元)</th>
                <th colSpan={5} className="py-2 px-3 text-center border-r border-[#e8e8e8]">放电量(kWh)</th>
                <th colSpan={5} className="py-2 px-3 text-center border-r border-[#e8e8e8]">放电收入(元)</th>
                <th rowSpan={2} className="py-2.5 px-3 text-right">储能收益(元)</th>
              </tr>
              {/* Row 2: 尖峰平谷深谷时段 */}
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 充电量(kWh) */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                {/* 充电成本(元) */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                {/* 放电量(kWh) */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
                {/* 放电收入(元) */}
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">低谷</th>
                <th className="py-2 px-2.5 text-right border-r border-[#e8e8e8]">深谷</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedTab3Rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  {/* 充电量(kWh) */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.sharpChargeKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.peakChargeKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.flatChargeKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.valleyChargeKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.deepValleyChargeKwh, 1)}</td>
                  {/* 充电成本(元) */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.sharpChargeCost, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.peakChargeCost, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.flatChargeCost, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.valleyChargeCost, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.deepValleyChargeCost, 2)}</td>
                  {/* 放电量(kWh) */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.sharpDischargeKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.peakDischargeKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.flatDischargeKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.valleyDischargeKwh, 1)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.deepValleyDischargeKwh, 1)}</td>
                  {/* 放电收入(元) */}
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.sharpDischargeIncome, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.peakDischargeIncome, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.flatDischargeIncome, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.valleyDischargeIncome, 2)}</td>
                  <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(row.deepValleyDischargeIncome, 2)}</td>
                  {/* 总计 */}
                  <td className="py-2.5 px-3 text-right">{fmt(row.totalEssRevenue, 2)}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                {/* 充电量(kWh) */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.sharpChargeKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.peakChargeKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.flatChargeKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.valleyChargeKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.deepValleyChargeKwh, 1)}</td>
                {/* 充电成本(元) */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.sharpChargeCost, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.peakChargeCost, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.flatChargeCost, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.valleyChargeCost, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.deepValleyChargeCost, 2)}</td>
                {/* 放电量(kWh) */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.sharpDischargeKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.peakDischargeKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.flatDischargeKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.valleyDischargeKwh, 1)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.deepValleyDischargeKwh, 1)}</td>
                {/* 放电收入(元) */}
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.sharpDischargeIncome, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.peakDischargeIncome, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.flatDischargeIncome, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.valleyDischargeIncome, 2)}</td>
                <td className="py-2.5 px-2.5 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab3.deepValleyDischargeIncome, 2)}</td>
                {/* 总计 */}
                <td className="py-2.5 px-3 text-right">{fmt(totalSummaryTab3.totalEssRevenue, 2)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ===================== TAB 4: 充电收益 ===================== */}
        {activeTab === 'ev' && (
          <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
            <thead>
              {/* Row 1: 明细项目 */}
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#262626] font-medium">
                <th rowSpan={2} className="py-2.5 px-3 border-r border-[#e8e8e8] w-36 text-center">时间</th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-[#e8e8e8]">充电量(kWh)</th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-[#e8e8e8]">充电成本(元)</th>
                <th rowSpan={2} className="py-2.5 px-3 text-right border-r border-[#e8e8e8]">售电收入(元)</th>
                <th rowSpan={2} className="py-2.5 px-3 text-right">充电收益(元)</th>
              </tr>
              {/* Row 2: 尖峰平谷时段 */}
              <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#595959] font-normal">
                {/* 充电量(kWh) */}
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">低谷</th>
                {/* 充电成本(元) */}
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">尖峰</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">高峰</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">平段</th>
                <th className="py-2 px-3 text-right border-r border-[#e8e8e8]">低谷</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8] text-[#262626]">
              {displayedTab4Rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f5f7fa] transition-colors">
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center">{row.time}</td>
                  {/* 充电量(kWh) */}
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.sharpChargeKwh, 1)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.peakChargeKwh, 1)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.flatChargeKwh, 1)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.valleyChargeKwh, 1)}</td>
                  {/* 充电成本(元) */}
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.sharpChargeCost, 2)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.peakChargeCost, 2)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.flatChargeCost, 2)}</td>
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.valleyChargeCost, 2)}</td>
                  {/* 售电收入 & 收益 */}
                  <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(row.salesIncome, 2)}</td>
                  <td className="py-2.5 px-3 text-right">{fmt(row.totalEvRevenue, 2)}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-[#fafafa] font-normal border-t border-[#e8e8e8] text-[#262626]">
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-center flex items-center justify-center gap-1">
                  <span>合计</span>
                  <Info className="w-3.5 h-3.5 text-[#8c8c8c]" />
                </td>
                {/* 充电量(kWh) */}
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">0.0</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">0.0</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">0.0</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">0.0</td>
                {/* 充电成本(元) */}
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">0.00</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">0.00</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">0.00</td>
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">0.00</td>
                {/* 售电收入 & 收益 */}
                <td className="py-2.5 px-3 border-r border-[#e8e8e8] text-right">{fmt(totalSummaryTab4.salesIncome, 2)}</td>
                <td className="py-2.5 px-3 text-right">{fmt(totalSummaryTab4.totalEvRevenue, 2)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar - Exact replication of the screenshot at the bottom of the table */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#595959] border-t border-[#e8e8e8]">
        {/* Left Stats */}
        <div>
          共 {activeRecordsCount} 条记录 第{currentPage}/{Math.max(1, totalPages)}页
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Page buttons */}
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

          {/* Page size select */}
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

          {/* Jump to page */}
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

export default RevenueReportPage;

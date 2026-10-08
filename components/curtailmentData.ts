/* ==========================================================================
   限电止损（增值特性）· 数据层
   --------------------------------------------------------------------------
   从 StrategyReportPage 抽出，供两处共用（同一份数据，避免两处各写一遍）：
     · 策略运行报告 · 增值特性 tab
     · 经营分析报告 · AI 策略收益 tab · 增值特性

   场景：微电网负电价 / 限电调控下的减亏。
   数据为 31 天逐日台账（止损金额与限电电量），另有 96 点穿透序列按日生成。

   注意：96 点序列里保留了原型既有的 Math.random() 抖动（每次渲染数值会小幅变化），
        这是原有行为，抽出时未改动；若要稳定数据，需另做确定性化处理。
   ========================================================================== */

/** 逐日限电止损台账：lossSaved 为当日止损金额（元，可为负＝考核/折损），curtailedEnergy 为限电电量 (kWh) */
export const curtailmentDataList = [
  { day: '1日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '2日', lossSaved: -45, curtailedEnergy: 4.8 },
  { day: '3日', lossSaved: 120, curtailedEnergy: 10.5 },
  { day: '4日', lossSaved: 85, curtailedEnergy: 7.2 },
  { day: '5日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '6日', lossSaved: 200, curtailedEnergy: 16.8 },
  { day: '7日', lossSaved: 180, curtailedEnergy: 15.2 },
  { day: '8日', lossSaved: -80, curtailedEnergy: 8.5 },
  { day: '9日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '10日', lossSaved: 240, curtailedEnergy: 20.1 },
  { day: '11日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '12日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '13日', lossSaved: 150, curtailedEnergy: 12.5 },
  { day: '14日', lossSaved: -35, curtailedEnergy: 3.6 },
  { day: '15日', lossSaved: 580, curtailedEnergy: 48.5 },
  { day: '16日', lossSaved: 320, curtailedEnergy: 26.8 },
  { day: '17日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '18日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '19日', lossSaved: -60, curtailedEnergy: 6.2 },
  { day: '20日', lossSaved: 110, curtailedEnergy: 9.4 },
  { day: '21日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '22日', lossSaved: 95, curtailedEnergy: 8.1 },
  { day: '23日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '24日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '25日', lossSaved: 280, curtailedEnergy: 23.5 },
  { day: '26日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '27日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '28日', lossSaved: 140, curtailedEnergy: 11.8 },
  { day: '29日', lossSaved: 0, curtailedEnergy: 0 },
  { day: '30日', lossSaved: -50, curtailedEnergy: 5.4 },
  { day: '31日', lossSaved: 0, curtailedEnergy: 0 },
];

/** 全月累计止损金额（元）；注意 UI 曾硬编码 2,140，与数据实际求和 2,230 不符，此处以数据为准 */
export const curtailmentTotalSaved = curtailmentDataList.reduce((s, d) => s + d.lossSaved, 0);
/** 全月累计限电（止损）电量 kWh */
export const curtailmentTotalEnergy = curtailmentDataList.reduce((s, d) => s + d.curtailedEnergy, 0);
/** 实际触发止损（金额为正）的天数 */
export const curtailmentActiveDays = curtailmentDataList.filter(d => d.lossSaved > 0).length;

/** 96 点穿透序列的单点结构 */
export interface CurtailmentPoint {
  time: string;
  /** 理论发电量 kWh（该 15min 区间） */
  theoreticalGen: number;
  /** 实际发电量 kWh */
  actualGen: number;
  /** 被限电量 kWh */
  curtailedGen: number;
  /** 该时刻电价（负值表示负电价 / 不利价差） */
  tariff: number;
  /** 该时刻止损金额 元 */
  lossSaved: number;
}

/** 生成指定日的 96 点（逐 15min）出力与电价穿透序列 */
export const get96PointsForDay = (day: string): CurtailmentPoint[] => {
  const dayNum = parseInt(day) || 15;
  const points: CurtailmentPoint[] = [];

  const is15 = dayNum === 15;
  const is16 = dayNum === 16;

  const dayItem = curtailmentDataList.find(d => d.day === day || d.day === `${dayNum}日`);
  const targetCurtail = dayItem ? dayItem.curtailedEnergy : 0;
  const targetLossSaved = dayItem ? dayItem.lossSaved : 0;
  const hasCurtailment = targetCurtail > 0;

  const curtailStartIdx = 44; // 11:00
  const curtailEndIdx = 56;   // 14:00

  for (let i = 0; i < 96; i++) {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // 光伏理论出力（15min 电量 kWh）
    let theoreticalGen = 0;
    if (i >= 24 && i <= 72) { // 06:00 ~ 18:00
      const angle = ((i - 24) / 48) * Math.PI;
      theoreticalGen = (Math.sin(angle) * (is15 ? 45 : (is16 ? 30 : 25)) + Math.random() * 1.5) / 4;
    }
    theoreticalGen = parseFloat(Math.max(0, theoreticalGen).toFixed(2));

    let actualGen = theoreticalGen;
    let curtailedGen = 0;
    let tariff = 0.35;
    let lossSaved = 0;

    if (hasCurtailment && i >= curtailStartIdx && i <= curtailEndIdx) {
      tariff = targetLossSaved < 0 ? 0.15 : -0.25; // 负电价或不利价差

      const angle = ((i - 24) / 48) * Math.PI;
      const weight = Math.sin(angle);

      let sumWeights = 0;
      for (let k = curtailStartIdx; k <= curtailEndIdx; k++) {
        sumWeights += Math.sin(((k - 24) / 48) * Math.PI);
      }

      const share = weight / sumWeights;
      curtailedGen = parseFloat((targetCurtail * share).toFixed(2));
      actualGen = parseFloat(Math.max(0, theoreticalGen - curtailedGen).toFixed(2));
      curtailedGen = parseFloat((theoreticalGen - actualGen).toFixed(2));
      lossSaved = parseFloat((targetLossSaved * share).toFixed(1));
    } else {
      if ((hour >= 8 && hour < 11) || (hour >= 18 && hour < 22)) {
        tariff = 0.85;
      } else if (hour >= 23 || hour < 7) {
        tariff = 0.25;
      } else {
        tariff = 0.45;
      }
    }

    points.push({
      time: timeStr,
      theoreticalGen,
      actualGen: parseFloat(actualGen.toFixed(2)),
      curtailedGen: parseFloat(curtailedGen.toFixed(2)),
      tariff,
      lossSaved: parseFloat(lossSaved.toFixed(1)),
    });
  }

  return points;
};

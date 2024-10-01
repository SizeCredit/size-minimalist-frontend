import { YieldCurve } from "../contexts/LimitOrdersContext";

export function getRate(curve: YieldCurve, tenor: number, marketRate = 0): number {
  for (let i = 0; i < curve.tenors.length - 1; i++) {
    const t1 = curve.tenors[i];
    const r1 = curve.aprs[i];
    const mrm1 = curve.marketRateMultipliers[i];
    const t2 = curve.tenors[i + 1];
    const r2 = curve.aprs[i + 1];
    const mrm2 = curve.marketRateMultipliers[i + 1];

    // If the input tenor lies between t1 and t2, perform linear interpolation
    if (tenor >= t1 && tenor <= t2) {
      // Interpolated apr
      const aprInterpolated = r1 + (r2 - r1) * (tenor - t1) / (t2 - t1);
      // Interpolated market rate multiplier
      const mrmInterpolated = mrm1 + (mrm2 - mrm1) * (tenor - t1) / (t2 - t1);
      // Final rate is apr + (marketRateMultiplier * marketRate)
      return aprInterpolated + mrmInterpolated * marketRate;
    }
  }
  return NaN
}

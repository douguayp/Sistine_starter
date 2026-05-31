export type PassPlanKey = "seven_day" | "thirty_day" | "annual";

export type PassPlan = {
  key: PassPlanKey;
  name: string;
  priceCents: number;
  currency: "usd";
  totalScanCredits: number;
  durationDays: number;
  deviceLimit: number;
  restoreLimit: number;
  dailyScanLimit: number;
  monthlyScanLimit?: number;
  creemProductIdEnv: string;
};

export const passPlans: Record<PassPlanKey, PassPlan> = {
  seven_day: {
    key: "seven_day",
    name: "7-Day China Food Pass",
    priceCents: 990,
    currency: "usd",
    totalScanCredits: 100,
    durationDays: 7,
    deviceLimit: 2,
    restoreLimit: 3,
    dailyScanLimit: 30,
    creemProductIdEnv: "CREEM_CHINA_FOOD_PASS_7_DAY_PRODUCT_ID",
  },
  thirty_day: {
    key: "thirty_day",
    name: "30-Day China Food Pass",
    priceCents: 2990,
    currency: "usd",
    totalScanCredits: 300,
    durationDays: 30,
    deviceLimit: 2,
    restoreLimit: 5,
    dailyScanLimit: 30,
    creemProductIdEnv: "CREEM_CHINA_FOOD_PASS_30_DAY_PRODUCT_ID",
  },
  annual: {
    key: "annual",
    name: "Annual China Food Pass",
    priceCents: 6990,
    currency: "usd",
    totalScanCredits: 1000,
    durationDays: 365,
    deviceLimit: 3,
    restoreLimit: 8,
    dailyScanLimit: 50,
    monthlyScanLimit: 200,
    creemProductIdEnv: "CREEM_CHINA_FOOD_PASS_ANNUAL_PRODUCT_ID",
  },
};

export function getPassPlan(key: string): PassPlan | null {
  return key in passPlans ? passPlans[key as PassPlanKey] : null;
}

export function formatPassPrice(plan: PassPlan) {
  return `$${(plan.priceCents / 100).toFixed(2)}`;
}

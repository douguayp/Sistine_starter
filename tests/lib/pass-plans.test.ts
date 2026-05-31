import {
  getPassPlan,
  passPlans,
  type PassPlanKey,
} from "@/lib/pass/plans";

describe("China Food Pass plans", () => {
  it("defines only the three one-time pass products for MVP", () => {
    expect(Object.keys(passPlans).sort()).toEqual([
      "annual",
      "seven_day",
      "thirty_day",
    ]);

    expect(passPlans.seven_day).toMatchObject({
      priceCents: 990,
      totalScanCredits: 100,
      durationDays: 7,
      deviceLimit: 2,
      restoreLimit: 3,
      dailyScanLimit: 30,
    });
    expect(passPlans.thirty_day).toMatchObject({
      priceCents: 2990,
      totalScanCredits: 300,
      durationDays: 30,
      deviceLimit: 2,
      restoreLimit: 5,
      dailyScanLimit: 30,
    });
    expect(passPlans.annual).toMatchObject({
      priceCents: 6990,
      totalScanCredits: 1000,
      durationDays: 365,
      deviceLimit: 3,
      restoreLimit: 8,
      dailyScanLimit: 50,
      monthlyScanLimit: 200,
    });
  });

  it("looks up valid pass plans and rejects unknown keys", () => {
    expect(getPassPlan("seven_day" satisfies PassPlanKey).name).toBe(
      "7-Day China Food Pass"
    );
    expect(getPassPlan("not_a_plan")).toBeNull();
  });
});

import {
  buildFoodProfile,
  getProfileRestrictionLevel,
} from "@/lib/menu/food-profile";

describe("food profile normalization", () => {
  it("separates must-avoid restrictions from softer preferences", () => {
    const profile = buildFoodProfile({
      noPork: true,
      glutenFreeOrCeliac: true,
      notSpicy: true,
      noColdDishes: true,
      allergies: ["peanut"],
    });

    expect(profile.mustAvoid).toEqual(
      expect.arrayContaining(["peanut", "pork", "gluten"])
    );
    expect(profile.preferToAvoid).toEqual(
      expect.arrayContaining(["spicy", "cold_dishes"])
    );
    expect(getProfileRestrictionLevel(profile, "peanut")).toBe("must_avoid");
    expect(getProfileRestrictionLevel(profile, "spicy")).toBe("prefer_to_avoid");
    expect(getProfileRestrictionLevel(profile, "bones")).toBe("none");
  });
});

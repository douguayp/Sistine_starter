export type AllergyKey =
  | "peanut"
  | "tree_nuts"
  | "shellfish"
  | "fish"
  | "sesame"
  | "egg"
  | "dairy"
  | "soy"
  | "wheat_gluten";

export type RestrictionKey =
  | AllergyKey
  | "pork"
  | "alcohol"
  | "vegetarian"
  | "vegan"
  | "halal"
  | "gluten"
  | "spicy"
  | "numbing_spice"
  | "cold_dishes"
  | "raw_food"
  | "organ_meats"
  | "blood_products"
  | "bones"
  | "very_oily"
  | "strong_smell"
  | "children"
  | "elderly"
  | "severe_allergy";

export type FoodProfileInput = {
  hasFoodAllergy?: boolean;
  allergies?: AllergyKey[];
  noPork?: boolean;
  noAlcohol?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  halalPreference?: boolean;
  glutenFreeOrCeliac?: boolean;
  notSpicy?: boolean;
  mildSpicyOnly?: boolean;
  noNumbingSpice?: boolean;
  noColdDishes?: boolean;
  noRawFood?: boolean;
  noOrganMeats?: boolean;
  noBloodProducts?: boolean;
  noBones?: boolean;
  noVeryOilyFood?: boolean;
  noStrongSmell?: boolean;
  forChildren?: boolean;
  forElderly?: boolean;
  severeAllergyUser?: boolean;
};

export type FoodProfile = FoodProfileInput & {
  mustAvoid: RestrictionKey[];
  preferToAvoid: RestrictionKey[];
};

function addIf<T>(target: T[], condition: boolean | undefined, value: T) {
  if (condition) {
    target.push(value);
  }
}

export function buildFoodProfile(input: FoodProfileInput): FoodProfile {
  const mustAvoid: RestrictionKey[] = [...(input.allergies ?? [])];
  const preferToAvoid: RestrictionKey[] = [];

  addIf(mustAvoid, input.noPork, "pork");
  addIf(mustAvoid, input.noAlcohol, "alcohol");
  addIf(mustAvoid, input.vegetarian, "vegetarian");
  addIf(mustAvoid, input.vegan, "vegan");
  addIf(mustAvoid, input.halalPreference, "halal");
  addIf(mustAvoid, input.glutenFreeOrCeliac, "gluten");
  addIf(mustAvoid, input.severeAllergyUser, "severe_allergy");

  addIf(preferToAvoid, input.notSpicy, "spicy");
  addIf(preferToAvoid, input.mildSpicyOnly, "spicy");
  addIf(preferToAvoid, input.noNumbingSpice, "numbing_spice");
  addIf(preferToAvoid, input.noColdDishes, "cold_dishes");
  addIf(preferToAvoid, input.noRawFood, "raw_food");
  addIf(preferToAvoid, input.noOrganMeats, "organ_meats");
  addIf(preferToAvoid, input.noBloodProducts, "blood_products");
  addIf(preferToAvoid, input.noBones, "bones");
  addIf(preferToAvoid, input.noVeryOilyFood, "very_oily");
  addIf(preferToAvoid, input.noStrongSmell, "strong_smell");
  addIf(preferToAvoid, input.forChildren, "children");
  addIf(preferToAvoid, input.forElderly, "elderly");

  return {
    ...input,
    mustAvoid: Array.from(new Set(mustAvoid)),
    preferToAvoid: Array.from(new Set(preferToAvoid)),
  };
}

export function getProfileRestrictionLevel(
  profile: FoodProfile,
  key: RestrictionKey
): "must_avoid" | "prefer_to_avoid" | "none" {
  if (profile.mustAvoid.includes(key)) {
    return "must_avoid";
  }

  if (profile.preferToAvoid.includes(key)) {
    return "prefer_to_avoid";
  }

  return "none";
}

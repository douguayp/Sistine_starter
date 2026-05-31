"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildFoodProfile,
  type AllergyKey,
  type FoodProfile,
  type FoodProfileInput,
} from "@/lib/menu/food-profile";

export const CIE_FOOD_PROFILE_STORAGE_KEY = "cie_food_profile";

type StoredFoodProfile = {
  version: 1;
  input: FoodProfileInput;
  normalized: FoodProfile;
};

type BooleanProfileKey = Exclude<keyof FoodProfileInput, "allergies">;

const quickOptions: Array<{ label: string; key: BooleanProfileKey }> = [
  { label: "Food allergy", key: "hasFoodAllergy" },
  { label: "No pork", key: "noPork" },
  { label: "No alcohol", key: "noAlcohol" },
  { label: "Vegetarian", key: "vegetarian" },
  { label: "Vegan", key: "vegan" },
  { label: "Halal preference", key: "halalPreference" },
  { label: "Gluten-free / celiac", key: "glutenFreeOrCeliac" },
  { label: "Not spicy", key: "notSpicy" },
];

const allergyOptions: Array<{ label: string; key: AllergyKey }> = [
  { label: "Peanut", key: "peanut" },
  { label: "Tree nuts", key: "tree_nuts" },
  { label: "Shellfish", key: "shellfish" },
  { label: "Fish", key: "fish" },
  { label: "Sesame", key: "sesame" },
  { label: "Egg", key: "egg" },
  { label: "Dairy", key: "dairy" },
  { label: "Soy", key: "soy" },
  { label: "Wheat / gluten", key: "wheat_gluten" },
];

const moreOptions: Array<{ label: string; key: BooleanProfileKey }> = [
  { label: "Mild spicy only", key: "mildSpicyOnly" },
  { label: "No numbing spice", key: "noNumbingSpice" },
  { label: "No cold dishes", key: "noColdDishes" },
  { label: "No raw food", key: "noRawFood" },
  { label: "No organ meats", key: "noOrganMeats" },
  { label: "No blood products", key: "noBloodProducts" },
  { label: "No bones", key: "noBones" },
  { label: "No very oily food", key: "noVeryOilyFood" },
  { label: "No strong smell", key: "noStrongSmell" },
  { label: "For children", key: "forChildren" },
  { label: "For elderly person", key: "forElderly" },
  { label: "Severe allergy user", key: "severeAllergyUser" },
];

function readStoredFoodProfile(): FoodProfileInput {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(CIE_FOOD_PROFILE_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as Partial<StoredFoodProfile>;
    return parsed.version === 1 && parsed.input && typeof parsed.input === "object"
      ? parsed.input
      : {};
  } catch {
    return {};
  }
}

function CheckboxPill({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm transition hover:bg-secondary">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export function FoodProfileForm() {
  const [profileInput, setProfileInput] = useState<FoodProfileInput>(() => readStoredFoodProfile());
  const normalizedProfile = useMemo(() => buildFoodProfile(profileInput), [profileInput]);
  const showAllergyDetails =
    profileInput.hasFoodAllergy || Boolean(profileInput.allergies?.length);

  useEffect(() => {
    const stored: StoredFoodProfile = {
      version: 1,
      input: profileInput,
      normalized: normalizedProfile,
    };

    window.localStorage.setItem(CIE_FOOD_PROFILE_STORAGE_KEY, JSON.stringify(stored));
  }, [normalizedProfile, profileInput]);

  function updateBoolean(key: BooleanProfileKey, checked: boolean) {
    setProfileInput((current) => ({
      ...current,
      [key]: checked,
    }));
  }

  function updateAllergy(key: AllergyKey, checked: boolean) {
    setProfileInput((current) => {
      const currentAllergies = current.allergies ?? [];
      const allergies = checked
        ? Array.from(new Set([...currentAllergies, key]))
        : currentAllergies.filter((allergy) => allergy !== key);

      return {
        ...current,
        hasFoodAllergy: allergies.length > 0 || current.hasFoodAllergy,
        allergies,
      };
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">1. Food Profile</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose the restrictions that matter before scanning. Severe allergies still require staff confirmation.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {quickOptions.map((option) => (
          <CheckboxPill
            key={option.key}
            label={option.label}
            checked={Boolean(profileInput[option.key])}
            onChange={(checked) => updateBoolean(option.key, checked)}
          />
        ))}
      </div>

      <details className="rounded-lg border border-border bg-card p-4" open={showAllergyDetails}>
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          Allergy details
        </summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {allergyOptions.map((option) => (
            <CheckboxPill
              key={option.key}
              label={option.label}
              checked={Boolean(profileInput.allergies?.includes(option.key))}
              onChange={(checked) => updateAllergy(option.key, checked)}
            />
          ))}
        </div>
      </details>

      <details className="rounded-lg border border-border bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          More preferences
        </summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {moreOptions.map((option) => (
            <CheckboxPill
              key={option.key}
              label={option.label}
              checked={Boolean(profileInput[option.key])}
              onChange={(checked) => updateBoolean(option.key, checked)}
            />
          ))}
        </div>
      </details>
    </div>
  );
}

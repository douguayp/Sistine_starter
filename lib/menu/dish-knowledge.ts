import dishes from "@/data/dishes-50.json";

export type DishKnowledge = {
  chineseName: string;
  englishName: string;
  englishDescription: string;
  commonIngredients: string[];
  commonSeasonings: string[];
  taste: string;
  spiceLevel: string;
  commonAllergens: string[];
  questionsToAsk: string[];
  aliases: string[];
};

function normalizeDishName(value: string) {
  return value.replace(/\s+/g, "").trim();
}

export function getDishKnowledge(): DishKnowledge[] {
  return dishes as DishKnowledge[];
}

export function findDishByName(name: string): DishKnowledge | null {
  const normalizedName = normalizeDishName(name);

  return (
    getDishKnowledge().find((dish) => {
      if (normalizeDishName(dish.chineseName) === normalizedName) {
        return true;
      }

      return dish.aliases.some((alias) => normalizedName.includes(normalizeDishName(alias)));
    }) ?? null
  );
}

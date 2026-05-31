import {
  findDishByName,
  getDishKnowledge,
} from "@/lib/menu/dish-knowledge";

describe("dish knowledge base", () => {
  it("loads P0 seed dishes with the full required field shape", () => {
    const dishes = getDishKnowledge();

    expect(dishes).toHaveLength(5);
    expect(dishes[0]).toEqual(
      expect.objectContaining({
        chineseName: expect.any(String),
        englishName: expect.any(String),
        englishDescription: expect.any(String),
        commonIngredients: expect.any(Array),
        commonSeasonings: expect.any(Array),
        taste: expect.any(String),
        spiceLevel: expect.any(String),
        commonAllergens: expect.any(Array),
        questionsToAsk: expect.any(Array),
        aliases: expect.any(Array),
      })
    );
  });

  it("matches dishes by exact Chinese name and alias", () => {
    expect(findDishByName("宫保鸡丁")?.englishName).toBe("Kung Pao Chicken");
    expect(findDishByName("招牌宫爆鸡丁")?.chineseName).toBe("宫保鸡丁");
  });
});

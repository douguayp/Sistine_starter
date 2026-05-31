import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CIE_FOOD_PROFILE_STORAGE_KEY,
  FoodProfileForm,
} from "@/features/menu/components/food-profile-form";
import { buildFoodProfile } from "@/lib/menu/food-profile";

describe("FoodProfileForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads an existing food profile from localStorage", () => {
    const input = { noPork: true };
    window.localStorage.setItem(
      CIE_FOOD_PROFILE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        input,
        normalized: buildFoodProfile(input),
      })
    );

    render(<FoodProfileForm />);

    expect(screen.getByRole("checkbox", { name: "No pork" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Not spicy" })).not.toBeChecked();
  });

  it("saves user changes to localStorage with the P1 submission structure", async () => {
    const user = userEvent.setup();
    render(<FoodProfileForm />);

    await user.click(screen.getByRole("checkbox", { name: "No pork" }));
    await user.click(screen.getByRole("checkbox", { name: "Not spicy" }));

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(CIE_FOOD_PROFILE_STORAGE_KEY) ?? "{}"
      ) as {
        version?: number;
        input?: { noPork?: boolean; notSpicy?: boolean };
        normalized?: { mustAvoid?: string[]; preferToAvoid?: string[] };
      };

      expect(stored.version).toBe(1);
      expect(stored.input).toMatchObject({ noPork: true, notSpicy: true });
      expect(stored.normalized?.mustAvoid).toContain("pork");
      expect(stored.normalized?.preferToAvoid).toContain("spicy");
    });
  });
});

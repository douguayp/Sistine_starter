import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { PassPricing } from "@/features/pass/components/pass-pricing";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

describe("PassPricing", () => {
  it("renders only the one-time China Food Pass products", () => {
    render(<PassPricing />);

    expect(screen.getByRole("heading", { name: "7-Day China Food Pass" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "30-Day China Food Pass" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Annual China Food Pass" })).toBeInTheDocument();
    expect(screen.getByText("$9.90")).toBeInTheDocument();
    expect(screen.getByText("$29.90")).toBeInTheDocument();
    expect(screen.getByText("$69.90")).toBeInTheDocument();
    expect(screen.getByText("100 menu scans included.")).toBeInTheDocument();
    expect(screen.getByText("300 menu scans included.")).toBeInTheDocument();
    expect(screen.getByText("1000 menu scans included.")).toBeInTheDocument();
    expect(screen.getAllByText("One-time payment. No subscription.")).toHaveLength(3);
    expect(screen.queryByRole("heading", { name: "Starter" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Pro" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Credits Pack" })).not.toBeInTheDocument();
  });

  it("keeps the public pricing page wired to PassPricing instead of the old billing entry", () => {
    const pagePath = path.join(
      process.cwd(),
      "app/[locale]/(marketing)/pricing/page.tsx"
    );
    const source = readFileSync(pagePath, "utf8");

    expect(source).toContain("PassPricing");
    expect(source).not.toContain("@/components/pricing");
    expect(source).not.toContain("PricingTable");
  });
});

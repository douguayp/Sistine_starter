"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/button";
import { LocaleLink } from "@/components/locale-link";
import { formatPassPrice, passPlans } from "@/lib/pass/plans";
import { cn } from "@/lib/utils";

const passCards = [
  {
    key: "seven_day",
    bestFor: "Best for short China trips.",
    featured: false,
  },
  {
    key: "thirty_day",
    bestFor: "Best for longer stays.",
    featured: true,
  },
  {
    key: "annual",
    bestFor: "Best for frequent China travelers, expats, students, and repeat business travelers.",
    featured: false,
  },
] as const;

export function PassPricing() {
  return (
    <div className="relative z-20 mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
      {passCards.map((card) => {
        const plan = passPlans[card.key];

        return (
          <div
            key={plan.key}
            className={cn(
              "flex h-full flex-col justify-between rounded-lg border border-border px-6 py-8",
              card.featured ? "bg-primary text-primary-foreground shadow-2xl" : "bg-card"
            )}
          >
            <div>
              <h3 className="text-base font-semibold leading-7">{plan.name}</h3>
              <p className="mt-4 text-4xl font-bold tracking-tight">
                {formatPassPrice(plan)}
              </p>
              <p className={cn("mt-3 text-sm font-medium", card.featured ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {plan.totalScanCredits} menu scans included.
              </p>
              <p className={cn("mt-2 text-sm", card.featured ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {card.bestFor}
              </p>
              <ul className={cn("mt-8 space-y-3 text-sm leading-6", card.featured ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {[
                  "Upload menu photos or QR ordering screenshots",
                  "Check hidden ingredients and dietary risks",
                  "Show Chinese Ask Staff cards",
                  "One-time payment. No subscription.",
                ].map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              as={LocaleLink}
              href="/scan"
              className={cn(
                "mt-8 w-full",
                card.featured ? "bg-background text-foreground hover:bg-background/90" : ""
              )}
            >
              Start with Food Profile
            </Button>
          </div>
        );
      })}
    </div>
  );
}

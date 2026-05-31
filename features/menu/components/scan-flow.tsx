"use client";

import { useEffect } from "react";
import { Button } from "@/components/button";
import { FoodProfileForm } from "./food-profile-form";
import { MenuImagePicker } from "./menu-image-picker";

const GUEST_STORAGE_KEY = "china_food_guest_id";
const DEVICE_STORAGE_KEY = "china_food_device_id";

export function ScanFlow() {
  useEffect(() => {
    const guestId = window.localStorage.getItem(GUEST_STORAGE_KEY);
    const deviceId = window.localStorage.getItem(DEVICE_STORAGE_KEY);

    void fetch("/api/guest", {
      method: "POST",
      headers: {
        ...(guestId ? { "x-china-food-guest-id": guestId } : {}),
        ...(deviceId ? { "x-china-food-device-id": deviceId } : {}),
      },
    })
      .then((response) => response.json() as Promise<{ guestId: string; deviceId: string }>)
      .then((identity) => {
        window.localStorage.setItem(GUEST_STORAGE_KEY, identity.guestId);
        window.localStorage.setItem(DEVICE_STORAGE_KEY, identity.deviceId);
      })
      .catch(() => {
        // Guest setup is retried on the next visit; P0 does not block the local UI.
      });
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Can I Eat This? China
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Check Chinese menus before you order
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Upload menu photos or QR ordering screenshots. This tool highlights likely lower-risk options, dishes to ask about, and dishes to avoid based on your food profile.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
          This tool cannot guarantee allergen safety, halal status, vegan status, or cross-contamination control. Always confirm with restaurant staff before ordering.
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-5 shadow-sm">
        <div className="space-y-8">
          <FoodProfileForm />
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground">2. Menu images</h2>
            <div className="mt-4">
              <MenuImagePicker />
            </div>
          </div>
          <Button type="button" disabled className="w-full">
            Menu analysis starts in P1
          </Button>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/container";
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: Locale }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  return generatePageMetadata({
    locale: params.locale,
    path: "/payment/success",
    title: "China Food Pass active",
    description: "Your China Food Pass activation page.",
  });
}

export default function PaymentSuccessPage() {
  return (
    <Container className="min-h-screen px-4 pb-20 pt-28 md:pt-36">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-background p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Pass activation
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Your China Food Pass is active on this device.
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          You do not need to enter this code again on this phone.
        </p>
        <div className="mt-6 rounded-md border border-dashed border-border bg-secondary p-4">
          <p className="text-sm font-medium text-muted-foreground">Recovery Code</p>
          <p className="mt-2 font-mono text-lg font-semibold text-foreground">
            CHINA-FOOD-XXXX-XXXX
          </p>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Save a screenshot of this code. Use it only if you change device, change browser, or clear browser data.
        </p>
      </div>
    </Container>
  );
}

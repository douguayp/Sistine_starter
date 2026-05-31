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
    path: "/restore",
    title: "Restore China Food Pass",
    description: "Restore a China Food Pass on a new browser or device with a Recovery Code.",
  });
}

export default function RestorePage() {
  return (
    <Container className="min-h-screen px-4 pb-20 pt-28 md:pt-36">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-background p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Recovery Code
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Restore your China Food Pass
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Use this only if you changed device, changed browser, cleared browser data, or lost the local pass token.
        </p>
        <div className="mt-6 rounded-md border border-dashed border-border bg-secondary p-4 text-sm text-muted-foreground">
          Recovery Code activation will be connected in P3.
        </div>
      </div>
    </Container>
  );
}

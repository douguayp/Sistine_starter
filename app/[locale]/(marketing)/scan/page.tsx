import type { Metadata } from "next";
import { Container } from "@/components/container";
import { ScanFlow } from "@/features/menu/components/scan-flow";
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
    path: "/scan",
    title: "Scan Chinese menu photos",
    description: "Set a food profile and upload Chinese menu photos or QR ordering screenshots.",
  });
}

export default function ScanPage() {
  return (
    <Container className="min-h-screen px-4 pb-20 pt-28 md:pt-36">
      <ScanFlow />
    </Container>
  );
}

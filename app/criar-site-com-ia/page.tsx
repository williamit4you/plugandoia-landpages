import type { Metadata } from "next";
import { CriarSiteComIaLanding } from "@/components/course-sales/CriarSiteComIaLanding";
import { criarSiteComIaOffer } from "@/lib/criarSiteComIa";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

export const metadata: Metadata = {
  title: criarSiteComIaOffer.title,
  description: "Aprenda a criar seu primeiro site com inteligência artificial, mesmo sem saber programar.",
  alternates: { canonical: criarSiteComIaOffer.path },
  openGraph: {
    title: criarSiteComIaOffer.title,
    description: "Um curso prático e introdutório para transformar uma ideia em um primeiro site com IA.",
    type: "website",
    locale: "pt_BR",
    url: criarSiteComIaOffer.path,
  },
};

export default async function CriarSiteComIaPage() {
  const metaPixelId = await resolveSalesPageMetaPixelId(criarSiteComIaOffer.pageKey, { preferEnvFallback: true });
  return <CriarSiteComIaLanding offer={criarSiteComIaOffer} metaPixelId={metaPixelId || undefined} />;
}

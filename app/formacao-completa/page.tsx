import type { Metadata } from "next";
import { FormacaoCompletaLanding } from "@/components/course-sales/FormacaoCompletaLanding";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

const pageKey = "formacao-completa";

export const metadata: Metadata = {
  title: "Formação Completa Plugando IA | 10 cursos com acesso vitalício",
  description: "Dez cursos, incluindo Testes Unitários com xUnit, Rate Limiting, Redis, Git e GitHub, IA Generativa e SaaS, por R$ 149,90.",
  alternates: { canonical: "/formacao-completa" },
  openGraph: {
    title: "Formação Completa Plugando IA — 10 cursos por R$ 149,90",
    description: "Dez cursos para começar em tecnologia e aprender testes, APIs, Git e GitHub, Redis, IA Generativa e SaaS.",
    type: "website",
    locale: "pt_BR",
    url: "/formacao-completa",
  },
};

export default async function FormacaoCompletaPage() {
  const metaPixelId = await resolveSalesPageMetaPixelId(pageKey, { preferEnvFallback: true });
  const checkoutUrl = process.env.NEXT_PUBLIC_FORMACAO_COMPLETA_CHECKOUT_URL?.trim() || "https://pay.hotmart.com/T107895423M";
  return <FormacaoCompletaLanding checkoutUrl={checkoutUrl} metaPixelId={metaPixelId || undefined} />;
}

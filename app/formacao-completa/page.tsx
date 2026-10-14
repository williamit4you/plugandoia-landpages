import type { Metadata } from "next";
import { FormacaoCompletaLanding } from "@/components/course-sales/FormacaoCompletaLanding";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

const pageKey = "formacao-completa";

export const metadata: Metadata = {
  title: "Formação Completa Plugando IA | 8 cursos com acesso vitalício",
  description: "Oito cursos, incluindo Por Onde Começar na Tecnologia, Git e GitHub, Redis, Vibe Coding, Arquitetura, RabbitMQ, IA Generativa e SaaS, por R$ 149,90.",
  alternates: { canonical: "/formacao-completa" },
  openGraph: {
    title: "Formação Completa Plugando IA — 8 cursos por R$ 149,90",
    description: "Oito cursos para começar em tecnologia e aprender Git e GitHub, Redis, Vibe Coding, arquitetura, mensageria, IA Generativa e SaaS.",
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

import type { Metadata } from "next";
import { ComecarTecnologiaLanding } from "@/components/course-sales/ComecarTecnologiaLanding";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

const PAGE_PATH = "/por-onde-comecar-na-tecnologia";

export const metadata: Metadata = {
  title: "Por Onde Começar na Tecnologia | Mini curso Plugando IA",
  description:
    "Escolha sua primeira trilha, organize os estudos e monte um plano prático de 30 dias em 5 aulas diretas.",
  keywords: ["começar na tecnologia", "carreira em tecnologia", "plano de estudos", "curso para iniciantes"],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Por Onde Começar na Tecnologia",
    description: "Saia da dúvida para uma primeira trilha, um projeto pequeno e um plano de 30 dias.",
    type: "website",
    locale: "pt_BR",
    url: PAGE_PATH,
  },
};

export default async function PorOndeComecarNaTecnologiaPage() {
  const metaPixelId = await resolveSalesPageMetaPixelId("por-onde-comecar-na-tecnologia", {
    preferEnvFallback: true,
  });
  const price = Number(process.env.NEXT_PUBLIC_COMECAR_TECNOLOGIA_PRICE ?? 9.99);
  const checkoutUrl = process.env.NEXT_PUBLIC_COMECAR_TECNOLOGIA_CHECKOUT_URL?.trim() ?? "";
  const teacherPhoto = process.env.NEXT_PUBLIC_COMECAR_TECNOLOGIA_TEACHER_PHOTO?.trim()
    || "/images/rabbitmq/willian-barata.png";

  return <ComecarTecnologiaLanding price={price} checkoutUrl={checkoutUrl} teacherPhoto={teacherPhoto} metaPixelId={metaPixelId || undefined} />;
}

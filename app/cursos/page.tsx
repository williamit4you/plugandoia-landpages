import type { Metadata } from "next";
import { CoursesCatalogPage } from "@/components/courses/CoursesCatalogPage";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

export const metadata: Metadata = {
  title: "Cursos para construir produtos reais com tecnologia e IA | Plugando IA",
  description: "Escolha sua próxima habilidade: primeiros passos em tecnologia, Git e GitHub, Redis, IA Generativa, Arquitetura de Software, RabbitMQ ou criação de SaaS.",
  alternates: { canonical: "/cursos" },
};

export default async function CursosPage() {
  const metaPixelId = await resolveSalesPageMetaPixelId("cursos");
  return <CoursesCatalogPage metaPixelId={metaPixelId || undefined} />;
}

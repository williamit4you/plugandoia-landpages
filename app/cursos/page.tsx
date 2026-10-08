import type { Metadata } from "next";
import { CoursesCatalogPage } from "@/components/courses/CoursesCatalogPage";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

export const metadata: Metadata = {
  title: "Cursos para construir produtos reais com tecnologia e IA | Plugando IA",
  description: "Escolha sua próxima habilidade: Vibe Coding, IA Generativa, Arquitetura de Software, RabbitMQ ou SaaS. Projetos práticos e acesso vitalício.",
  alternates: { canonical: "/cursos" },
};

export default async function CursosPage() {
  const metaPixelId = await resolveSalesPageMetaPixelId("cursos");
  return <CoursesCatalogPage metaPixelId={metaPixelId || undefined} />;
}

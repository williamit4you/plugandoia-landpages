import type { Metadata } from "next";
import { XunitCourseLanding } from "@/components/course-sales/XunitCourseLanding";
import { xunitCourse } from "@/lib/xunitCourse";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

export const metadata: Metadata = {
  title: "Testes Unitários com xUnit e .NET — Curso Prático | Plugando IA",
  description: "Aprenda testes unitários com xUnit e .NET. Teste exceções e regras de negócio, utilize Moq e analise cobertura com Coverlet e ReportGenerator.",
  keywords: ["testes unitários .NET", "xUnit", "Moq", "Coverlet", "ReportGenerator"],
  alternates: { canonical: "https://plugandoia.cloud/curso-testes-unitarios-xunit" },
  openGraph: { title: "Testes Unitários com xUnit e .NET — Do Zero à Prática", description: "Aprenda xUnit, Moq e cobertura de código em C#.", type: "website", locale: "pt_BR", url: "https://plugandoia.cloud/curso-testes-unitarios-xunit", images: xunitCourse.coverImage ? [{ url: xunitCourse.coverImage, alt: xunitCourse.name }] : undefined },
  twitter: { card: "summary_large_image", title: "Testes Unitários com xUnit e .NET", description: "Curso prático de xUnit, Moq e cobertura de código." },
};

export default async function XunitCoursePage() {
  const metaPixelId = await resolveSalesPageMetaPixelId(xunitCourse.pageKey, { preferEnvFallback: true });
  return <XunitCourseLanding course={xunitCourse} metaPixelId={metaPixelId || undefined} />;
}

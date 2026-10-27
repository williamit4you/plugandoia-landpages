import type { Metadata } from "next";
import { RateLimitingCourseLanding } from "@/components/course-sales/RateLimitingCourseLanding";
import { rateLimitingCourse } from "@/lib/rateLimitingCourse";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

export const metadata: Metadata = {
  title: "Rate Limiting com ASP.NET Core | Curso Prático — Plugando IA",
  description: "Aprenda Rate Limiting com ASP.NET Core na prática. Configure políticas, HTTP 429, Sliding Window, Token Bucket e Concurrency Limiter.",
  keywords: ["Rate Limiting ASP.NET Core", "HTTP 429", "Token Bucket", "Sliding Window", "curso ASP.NET Core"],
  alternates: { canonical: "https://plugandoia.cloud/curso-rate-limiting" },
  openGraph: { title: "Rate Limiting com ASP.NET Core — Proteja suas APIs na Prática", description: "Configure políticas, HTTP 429, filas e algoritmos de limitação em APIs ASP.NET Core.", type: "website", locale: "pt_BR", url: "https://plugandoia.cloud/curso-rate-limiting", images: rateLimitingCourse.coverImage ? [{ url: rateLimitingCourse.coverImage, alt: rateLimitingCourse.name }] : undefined },
  twitter: { card: "summary_large_image", title: "Rate Limiting com ASP.NET Core", description: "Curso prático para controlar o tráfego das suas APIs." },
};

export default async function CursoRateLimitingPage() {
  const metaPixelId = await resolveSalesPageMetaPixelId(rateLimitingCourse.pageKey, { preferEnvFallback: true });
  return <RateLimitingCourseLanding course={rateLimitingCourse} metaPixelId={metaPixelId || undefined} />;
}

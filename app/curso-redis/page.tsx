import type { Metadata } from "next";
import { RedisCourseLanding } from "@/components/course-sales/RedisCourseLanding";
import { redisCourse } from "@/lib/redisCourse";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

export const metadata: Metadata = {
  title: "Curso Redis com .NET | Cache na Prática — Plugando IA",
  description:
    "Aprenda Redis com .NET, Docker e Redis Insight construindo cache, expiração, invalidação e tratamento de falhas em uma API ASP.NET Core.",
  keywords: ["curso Redis", "Redis com .NET", "cache ASP.NET Core", "StackExchange.Redis", "Redis Docker"],
  alternates: { canonical: redisCourse.pagePath },
  openGraph: {
    title: redisCourse.name,
    description: "15 aulas para aprender Redis do zero e implementar cache em uma API ASP.NET Core.",
    type: "website",
    locale: "pt_BR",
    url: redisCourse.pagePath,
    images: redisCourse.coverImage ? [{ url: redisCourse.coverImage, alt: redisCourse.name }] : undefined,
  },
};

export default async function CursoRedisPage() {
  const metaPixelId = await resolveSalesPageMetaPixelId(redisCourse.pageKey, {
    preferEnvFallback: true,
  });

  return <RedisCourseLanding course={redisCourse} metaPixelId={metaPixelId || undefined} />;
}

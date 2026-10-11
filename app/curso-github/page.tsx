import type { Metadata } from "next";
import { GitHubCourseLanding } from "@/components/course-sales/GitHubCourseLanding";
import { githubCourse } from "@/lib/githubCourse";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";

export const metadata: Metadata = {
  title: "Curso de Git e GitHub do Zero à Prática | Plugando IA",
  description:
    "Aprenda Git e GitHub na prática: commits, branches, conflitos, merge, rebase, Pull Requests e recuperação de alterações.",
  keywords: ["curso de Git", "curso GitHub", "Git branches", "Git rebase", "Pull Request"],
  alternates: { canonical: githubCourse.pagePath },
  openGraph: {
    title: githubCourse.name,
    description: "Do primeiro commit aos Pull Requests, com demonstrações no terminal, VS Code e GitHub.",
    type: "website",
    locale: "pt_BR",
    url: githubCourse.pagePath,
  },
};

export default async function CursoGithubPage() {
  const metaPixelId = await resolveSalesPageMetaPixelId(githubCourse.pageKey, {
    preferEnvFallback: true,
  });

  return <GitHubCourseLanding metaPixelId={metaPixelId || undefined} />;
}

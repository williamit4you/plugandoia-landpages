export const githubCourse = {
  name: "Git e GitHub Profissional: do Zero à Prática",
  pageKey: "curso-github",
  pagePath: "/curso-github",
  checkoutUrl:
    process.env.NEXT_PUBLIC_GITHUB_COURSE_CHECKOUT_URL?.trim() ||
    "https://pay.hotmart.com/U107980037L",
  cashPrice: 27,
  installmentPrice: "9 x de R$ 3,55*",
  cover: null,
  access: "Vitalício",
  guaranteeDays: 7,
  includesUpdates: true,
  support: null,
  certificate: null,
  offerEndsAt: null,
  teacher: {
    name: "Willian Fernando Barata dos Santos",
    photo: "/images/rabbitmq/willian-barata.png",
  },
  reviews: [] as Array<{ name: string; text: string }>,
} as const;

export const githubCourseModules = [
  {
    title: "Módulo 1 — Primeiros passos e versionamento",
    outcome: "Crie seu primeiro repositório e entenda exatamente o que entra em cada commit.",
    lessons: [
      "Introdução ao Git.",
      "Instalação e configuração de nome, e-mail e branch padrão.",
      "Comandos add, commit e log.",
      "Diff e histórico pela interface do VS Code.",
      "Criação de um projeto .NET e uso do .gitignore.",
      "Como ignorar um arquivo específico.",
      "Como deixar de rastrear um arquivo já versionado.",
    ],
  },
  {
    title: "Módulo 2 — GitHub e trabalho com branches",
    outcome: "Publique seu código, trabalhe em paralelo e integre mudanças com Pull Requests.",
    lessons: [
      "Criação do repositório no GitHub e primeiro push.",
      "Clone, alterações e pull.",
      "Criação de branches.",
      "Merge e resolução de conflitos.",
      "Pull Request pela interface do GitHub.",
    ],
  },
  {
    title: "Módulo 3 — Desfazendo alterações e entendendo rebase",
    outcome: "Escolha a forma certa de desfazer mudanças e reorganize o histórico com consciência.",
    lessons: [
      "Git restore.",
      "Git restore --staged.",
      "Git reset.",
      "Git revert.",
      "Entendendo rebase.",
      "Rebase na prática.",
    ],
  },
  {
    title: "Módulo 4 — Ferramentas e organização do trabalho",
    outcome: "Recupere trabalho e organize um fluxo de colaboração mais seguro no GitHub.",
    lessons: [
      "Stash.",
      "Cherry-pick.",
      "Reflog e recuperação após um reset.",
      "GitHub Flow e Issues.",
      "Proteção de branches e configuração de regras.",
    ],
  },
] as const;

export const githubCourseLessonCount = githubCourseModules.reduce(
  (total, module) => total + module.lessons.length,
  0,
);

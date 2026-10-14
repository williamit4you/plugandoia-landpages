export const redisCourse = {
  pageKey: "curso-redis",
  pagePath: "/curso-redis",
  name: "Redis com .NET — Do Zero ao Cache na Prática",
  price: 69.99,
  installmentLabel: "12x de R$ 7,24",
  referencePrice: 197,
  checkoutUrl: process.env.NEXT_PUBLIC_REDIS_CHECKOUT_URL?.trim() ?? "",
  coverImage: process.env.NEXT_PUBLIC_REDIS_COURSE_COVER?.trim() ?? "",
  teacherPhoto: process.env.NEXT_PUBLIC_REDIS_TEACHER_PHOTO?.trim()
    || "/images/rabbitmq/willian-barata.png",
  referencePriceApproved: process.env.NEXT_PUBLIC_REDIS_REFERENCE_PRICE_APPROVED === "true",
  lifetimeAccess: process.env.NEXT_PUBLIC_REDIS_LIFETIME_ACCESS === "true",
  guaranteeDays: Number(process.env.NEXT_PUBLIC_REDIS_GUARANTEE_DAYS || 0) || null,
} as const;

export const redisCourseModules = [
  {
    title: "Fundamentos e ambiente",
    lessons: [
      "Introdução ao Redis",
      "Como o Redis funciona",
      "Instalando Redis com Docker e Docker Compose",
      "Primeiros comandos: SET, GET e DEL",
      "Expiração de chaves: EXPIRE e TTL",
      "Estruturas de dados do Redis",
    ],
  },
  {
    title: "Integração com ASP.NET Core",
    lessons: [
      "Criando uma API de catálogo com .NET",
      "Conectando a aplicação .NET ao Redis",
      "Implementando cache de produtos com Cache Aside",
      "Configurando a expiração do cache na aplicação",
      "Atualizando produtos e invalidando o cache",
      "Criando um serviço de cache reutilizável",
    ],
  },
  {
    title: "Resiliência e boas práticas",
    lessons: [
      "Tratamento de falhas quando Redis fica indisponível",
      "Diagnóstico e monitoramento com Redis Insight",
      "Boas práticas de cache com Redis e .NET",
    ],
  },
] as const;

export const redisCourseLessonCount = redisCourseModules.reduce(
  (total, module) => total + module.lessons.length,
  0,
);

export const rateLimitingCourse = {
  pageKey: "curso-rate-limiting",
  pagePath: "/curso-rate-limiting",
  name: "Rate Limiting com ASP.NET Core — Proteja suas APIs na Prática",
  price: 19.99,
  checkoutUrl: "https://pay.hotmart.com/G108208458E",
  coverImage: process.env.NEXT_PUBLIC_RATE_LIMITING_COURSE_COVER?.trim() ?? "",
} as const;

export const rateLimitingModules = [
  { title: "Módulo 1 — Fundamentos do Rate Limiting", lessons: ["Por que uma API precisa de Rate Limiting.", "Explicando Fixed Window, Sliding Window, Token Bucket e Concurrency Limiter.", "Criando o projeto, configurando e testando o primeiro Rate Limiting."] },
  { title: "Módulo 2 — Configuração e Controle de Requisições", lessons: ["Políticas diferentes por endpoint.", "Criando uma resposta HTTP 429 profissional.", "Fila de requisições com Rate Limiting."] },
  { title: "Módulo 3 — Algoritmos de Rate Limiting na Prática", lessons: ["Sliding Window na prática.", "Token Bucket na prática.", "Concurrency Limiter na prática."] },
] as const;

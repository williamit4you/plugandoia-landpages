export const xunitCourse = {
  pageKey: "curso-testes-unitarios-xunit",
  pagePath: "/curso-testes-unitarios-xunit",
  name: "Testes Unitários com xUnit e .NET — Do Zero à Prática",
  price: 29.9,
  referencePrice: 79.9,
  checkoutUrl: process.env.NEXT_PUBLIC_XUNIT_CHECKOUT_URL?.trim() ?? "",
  coverImage: process.env.NEXT_PUBLIC_XUNIT_COURSE_COVER?.trim() ?? "",
  campaignStatus: "launch" as const,
  campaignEndsAt: process.env.NEXT_PUBLIC_XUNIT_CAMPAIGN_ENDS_AT?.trim() ?? "",
  referencePriceValidated: process.env.NEXT_PUBLIC_XUNIT_REFERENCE_PRICE_VALIDATED === "true",
} as const;

export const xunitModules = [
  { title: "Módulo 1 — Fundamentos dos Testes Unitários", lessons: ["Aula 01 — O que são testes e por que utilizá-los.", "Aula 02 — Conhecendo o xUnit.", "Aula 03 — Criando o projeto e o teste com VS Code e linha de comando.", "Aula 04 — Criando o projeto e o teste com Visual Studio 2022."] },
  { title: "Módulo 2 — Testes Unitários na Prática", lessons: ["Aula 05 — Criando o primeiro teste.", "Aula 06 — Criando a classe Produto e testes com Equal, NotNull e Contains.", "Aula 08 — Theory e InlineData.", "Aula 09 — Testando exceções.", "Aula 10 — Organizando testes unitários: nomenclatura e estrutura.", "Aula 11 — A importância de testes independentes."] },
  { title: "Módulo 3 — Interfaces, Injeção de Dependência e Mocks", lessons: ["Aula 12 — Interfaces e injeção de dependência.", "Aula 13 — Criando um serviço com interface e injeção de dependência em C#.", "Aula 14 — O que são Mocks, Stubs e Fakes.", "Aula 15 — Criando o primeiro Mock com Moq.", "Aula 16 — Moq: It.IsAny, It.Is e Verify."] },
  { title: "Módulo 4 — Testes Avançados e Cobertura de Código", lessons: ["Aula 17 — Testando serviços com múltiplas dependências e cenários de falha.", "Aula 18 — Cobertura de Código com xUnit, Coverlet e ReportGenerator e conclusão."] },
] as const;

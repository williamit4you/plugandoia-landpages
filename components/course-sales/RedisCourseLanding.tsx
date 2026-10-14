import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Box,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Code2,
  Container,
  Database,
  Gauge,
  Layers3,
  LockKeyhole,
  MonitorCog,
  Network,
  RefreshCcw,
  Route,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Terminal,
  TimerReset,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";
import { MetaPixelScript } from "@/components/MetaPixelScript";
import { SalesPageTracker, SalesViewContentTracker } from "@/components/SalesPageTracker";
import { redisCourse, redisCourseLessonCount, redisCourseModules } from "@/lib/redisCourse";

const topics = [
  [Database, "Fundamentos do Redis", "Entenda o modelo de chave e valor, o funcionamento do Redis e suas principais aplicações."],
  [Container, "Docker e Docker Compose", "Configure um ambiente reproduzível com Dockerfile e Docker Compose."],
  [MonitorCog, "Redis Insight", "Visualize chaves, valores, tipos, expiração e operações pela interface gráfica."],
  [Terminal, "Comandos fundamentais", "Pratique SET, GET, DEL, EXPIRE, TTL, PERSIST e outros comandos das aulas."],
  [Layers3, "Estruturas de dados", "Conheça Strings, Hashes, Lists e Sets e quando utilizar cada estrutura."],
  [Braces, "Integração com .NET", "Conecte uma API ASP.NET Core ao Redis com StackExchange.Redis."],
  [Route, "Cache Aside", "Implemente Cache Hit e Cache Miss armazenando e recuperando produtos."],
  [TimerReset, "Expiração e invalidação", "Configure TTL e remova informações desatualizadas quando produtos mudarem."],
  [ShieldCheck, "Tratamento de falhas", "Mantenha a leitura disponível quando o Redis ficar temporariamente indisponível."],
  [ServerCog, "Boas práticas", "Organize um serviço de cache reutilizável, suas chaves e operações."],
] as const;

const projectFeatures = [
  "Listagem de produtos",
  "Consulta por identificador",
  "Integração com Redis",
  "Armazenamento de produtos em cache",
  "Cache Hit e Cache Miss",
  "Expiração automática",
  "Atualização e invalidação do cache",
  "Serviço de cache reutilizável",
  "Tratamento básico de indisponibilidade",
  "Acompanhamento pelo Redis Insight",
];

const faqs = [
  ["Preciso saber Redis para começar?", "Não. O curso apresenta o Redis desde seus fundamentos."],
  ["Preciso conhecer C#?", "Sim. É recomendado ter conhecimentos básicos de C# e ASP.NET Core para acompanhar a parte prática."],
  ["O curso é apenas teórico?", "Não. Inclui demonstrações no terminal, Redis Insight e desenvolvimento de uma API de catálogo."],
  ["Preciso instalar Redis?", "Vamos configurar o Redis utilizando Docker e Docker Compose."],
  ["Vou aprender Redis Cluster e replicação?", "Não. Este é um curso essencial. Cluster, replicação e otimização avançada não fazem parte do conteúdo."],
  ["O projeto utiliza banco de dados SQL?", "Não. Para manter o foco no Redis, utilizamos um repositório em memória como fonte de dados."],
  ["O curso utiliza qual versão do .NET?", "As demonstrações práticas foram desenvolvidas utilizando .NET 9. Os conceitos fundamentais podem ser aplicados a outras versões compatíveis, respeitando as bibliotecas utilizadas."],
  ["Onde assisto às aulas?", "Na plataforma Hotmart, conforme as instruções de acesso disponibilizadas após a compra."],
  ["A compra é segura?", "O pagamento é realizado por meio do checkout oficial da Hotmart."],
  ["Posso assistir pelo celular?", "O acesso depende dos dispositivos e recursos suportados pela plataforma. Para acompanhar as demonstrações de programação, recomendamos um computador."],
] as const;

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff5b5b]">{eyebrow}</p>
    <h2 className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">{title}</h2>
    {text ? <p className="mt-5 text-lg leading-8 text-slate-300">{text}</p> : null}
  </div>;
}

function FlowNode({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return <div className={`rounded-xl border px-4 py-3 text-center text-xs font-black ${accent ? "border-red-400/40 bg-red-500/15 text-red-200" : "border-white/10 bg-white/[.045] text-slate-200"}`}>{children}</div>;
}

function CourseCover({ src }: { src: string }) {
  if (src) {
    return <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-red-400/25 bg-[#0d1421] shadow-[0_35px_100px_rgba(0,0,0,.5)]"><Image src={src} alt="Capa oficial do curso Redis com .NET" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" priority unoptimized /></div>;
  }
  return <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-red-400/25 bg-[radial-gradient(circle_at_80%_15%,rgba(124,58,237,.28),transparent_35%),linear-gradient(145deg,#121a2b,#080d16)] p-6 shadow-[0_35px_100px_rgba(0,0,0,.5)] sm:p-9">
    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-500/20 blur-3xl" />
    <div className="relative flex h-full flex-col justify-between"><div className="flex items-center justify-between"><span className="rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-slate-300">Plugando IA</span><Database className="h-8 w-8 text-[#ff5b5b]" /></div><div><div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-950/40"><Database className="h-7 w-7" /></span><span className="text-2xl font-black text-violet-300">+.NET</span></div><h2 className="mt-5 text-3xl font-black leading-[1.02] tracking-[-.045em] sm:text-5xl">Redis com .NET</h2><p className="mt-3 max-w-md text-sm font-bold uppercase tracking-[.12em] text-slate-400">Do zero ao cache na prática</p></div><div className="grid grid-cols-3 gap-2">{["CACHE", "DOCKER", "API"].map(item => <span key={item} className="rounded-lg border border-white/10 bg-black/20 py-2 text-center font-mono text-[10px] font-bold text-slate-400">{item}</span>)}</div></div>
  </div>;
}

export function RedisCourseLanding({ course, metaPixelId }: { course: typeof redisCourse; metaPixelId?: string }) {
  const checkoutReady = /^https?:\/\//.test(course.checkoutUrl);
  const checkoutHref = checkoutReady ? course.checkoutUrl : "#oferta";
  const discount = Math.round((1 - course.price / course.referencePrice) * 100);
  const accessLabel = course.lifetimeAccess ? "Acesso vitalício" : "Acesso conforme a oferta da Hotmart";

  function Cta({ label, className = "" }: { label: string; className?: string }) {
    return <a href={checkoutHref} rel={checkoutReady ? "noopener noreferrer" : undefined} className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-red-600 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 ${className}`}>{label}<ArrowRight className="ml-2 h-4 w-4" /></a>;
  }

  const dynamicFaqs = [
    ...faqs,
    ["O acesso é vitalício?", course.lifetimeAccess ? "Sim. O acesso vitalício está confirmado na configuração atual da oferta." : "A duração do acesso será a informada nos termos da oferta exibidos no checkout da Hotmart."],
    ...(course.guaranteeDays ? [["Como funciona a garantia?", `A oferta está configurada com ${course.guaranteeDays} dias de garantia. Consulte as condições exibidas no checkout da Hotmart.`]] : [["Como funciona a garantia?", "O prazo e as condições de reembolso são os apresentados na oferta e no checkout oficial da Hotmart."]]),
  ];

  return <main className="min-h-screen overflow-hidden bg-[#070b12] pb-20 text-white selection:bg-red-500 selection:text-white md:pb-0">
    <MetaPixelScript pixelId={metaPixelId} />
    <SalesPageTracker pageKey={course.pageKey} pagePath={course.pagePath} pageTitle={course.name} metadata={{ offerPrice: course.price, currency: "BRL" }} />
    <SalesViewContentTracker pageKey={course.pageKey} pagePath={course.pagePath} pageTitle={course.name} value={course.price} currency="BRL" metadata={{ contentName: course.name, contentType: "product" }} />

    <header className="border-b border-white/10 bg-[#070b12]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><Link href="/cursos" className="flex items-center gap-2 text-lg font-black tracking-[-.03em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-violet-600"><Zap className="h-4 w-4" /></span>Plugando IA</Link><nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-bold text-slate-300 lg:flex"><a href="#projeto" className="hover:text-white">Projeto</a><a href="#conteudo" className="hover:text-white">Conteúdo</a><a href="#professor" className="hover:text-white">Professor</a><a href="#faq" className="hover:text-white">Dúvidas</a></nav><a href="#oferta" className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200 hover:bg-red-500/20">Ver oferta</a></div>
    </header>

    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(124,58,237,.18),transparent_28%),radial-gradient(circle_at_10%_80%,rgba(220,38,38,.13),transparent_32%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div><p className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.15em] text-red-200"><Sparkles className="h-3.5 w-3.5" /> Redis do zero • projeto com .NET</p><h1 className="mt-6 text-balance text-4xl font-black leading-[1.02] tracking-[-.055em] sm:text-5xl md:text-6xl">Aprenda Redis com .NET e implemente cache em <span className="text-[#ff5b5b]">uma API real.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Domine os fundamentos do Redis, configure seu ambiente com Docker e desenvolva uma API ASP.NET Core com cache, expiração, invalidação e tratamento de falhas.</p><div className="mt-7 grid gap-3 text-sm font-semibold text-slate-200 sm:grid-cols-2">{["15 aulas", "Do zero à implementação prática", "Redis + ASP.NET Core", "Projeto de API de catálogo", "Redis Insight e Docker", accessLabel].map(item => <div key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />{item}</div>)}</div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Cta label="Quero aprender Redis com .NET" /><a href="#projeto" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[.04] px-6 py-4 text-sm font-black text-slate-200 hover:bg-white/[.08]">Conhecer o projeto <ArrowDown className="ml-2 h-4 w-4" /></a></div><p className="mt-5 text-sm leading-6 text-slate-500">Compra processada pela Hotmart • acesso após a confirmação do pagamento • checkout seguro</p></div>
        <div><CourseCover src={course.coverImage} /><div className="relative -mt-5 mx-4 rounded-2xl border border-red-400/25 bg-[#0c121e]/95 p-5 shadow-2xl backdrop-blur sm:mx-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-black uppercase tracking-[.16em] text-red-300">Oferta de lançamento</span>{course.referencePriceApproved ? <p className="mt-2 text-sm text-slate-500">De <s>{money(course.referencePrice)}</s> por</p> : null}<strong className="mt-1 block text-4xl font-black tracking-[-.04em]">{money(course.price)}</strong><span className="mt-1 block text-sm font-black text-violet-200">ou {course.installmentLabel}</span></div>{course.referencePriceApproved ? <span className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">Economize {discount}%</span> : null}</div></div></div>
      </div>
    </section>

    <section className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="O problema que o cache resolve" title="Sua API consulta os mesmos dados repetidamente?" text="Sem cache, cada consulta precisa acessar a fonte original. Com Redis, informações adequadas ao cache podem ser armazenadas temporariamente e reutilizadas." /><div className="mt-12 grid gap-6 lg:grid-cols-2"><article className="rounded-3xl border border-white/10 bg-[#0d1421] p-6 md:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-500/10 text-slate-400"><Gauge className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-[.15em] text-slate-500">Sem cache</p><h3 className="font-black">A fonte original é consultada</h3></div></div><div className="mt-7 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2"><FlowNode>Cliente</FlowNode><ArrowRight className="h-4 w-4 text-slate-600" /><FlowNode>API</FlowNode><ArrowRight className="h-4 w-4 text-slate-600" /><FlowNode>Fonte de dados</FlowNode></div></article><article className="rounded-3xl border border-red-400/25 bg-red-500/[.055] p-6 md:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/15 text-red-300"><Zap className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-[.15em] text-red-300">Com cache</p><h3 className="font-black">O Redis pode responder primeiro</h3></div></div><div className="mt-7 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2"><FlowNode>Cliente</FlowNode><ArrowRight className="h-4 w-4 text-red-300" /><FlowNode>API</FlowNode><ArrowRight className="h-4 w-4 text-red-300" /><FlowNode accent>Redis</FlowNode></div></article></div><div className="mt-6 rounded-2xl border border-violet-300/20 bg-violet-300/[.055] p-6"><p className="text-xs font-black uppercase tracking-[.15em] text-violet-300">Quando não está no cache</p><div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">{["API", "Repositório", "Redis", "Cliente"].map((item, index) => <div key={item} className="contents"><FlowNode accent={item === "Redis"}>{item}</FlowNode>{index < 3 ? <ArrowRight className="mx-auto hidden h-4 w-4 text-violet-300 sm:block" /> : null}</div>)}</div></div><p className="mt-6 flex gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[.055] p-4 text-sm leading-6 text-amber-100/80"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />Redis pode reduzir consultas repetidas à fonte original. Os ganhos de desempenho dependem do cenário, da estratégia de cache e da implementação.</p></div></section>

    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="Conhecimento aplicável" title="O que você vai aprender" text="Dos fundamentos à integração em C#, cada assunto prepara a próxima etapa do projeto." /><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">{topics.map(([Icon, title, text], index) => { const TopicIcon = Icon as LucideIcon; return <article key={String(title)} className="rounded-2xl border border-white/10 bg-[#0d1421] p-5 transition hover:-translate-y-1 hover:border-red-400/30"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-300"><TopicIcon className="h-5 w-5" /></span><span className="font-mono text-[10px] text-slate-700">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-5 font-black">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{String(text)}</p></article>; })}</div></section>

    <section id="projeto" className="scroll-mt-6 border-y border-white/10 bg-white/[.025]"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="Projeto guiado" title="Você não vai aprender apenas comandos. Vai desenvolver uma API com Redis." text="Uma API de catálogo com produtos mantidos em memória para simplificar o laboratório. O Redis funciona como cache." /><div className="mt-12 rounded-3xl border border-red-400/20 bg-[#0d1421] p-6 md:p-8"><p className="text-xs font-black uppercase tracking-[.16em] text-red-300">Arquitetura do projeto</p><div className="mt-7 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">{["Cliente HTTP", "API ASP.NET Core", "Redis Cache", "Repositório de produtos"].map((item, index) => <div key={item} className="contents"><FlowNode accent={item === "Redis Cache"}>{item}</FlowNode>{index < 3 ? <ArrowRight className="mx-auto hidden h-4 w-4 text-red-300 sm:block" /> : null}</div>)}</div></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><div className="grid gap-3 sm:grid-cols-2">{projectFeatures.map(item => <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-[#0d1421] p-4 text-sm font-semibold text-slate-300"><Check className="h-4 w-4 shrink-0 text-violet-300" />{item}</div>)}</div><div className="overflow-hidden rounded-2xl border border-white/10 bg-[#05080d]"><div className="flex items-center gap-2 border-b border-white/10 px-5 py-3"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" /><span className="ml-2 font-mono text-[10px] text-slate-600">ProductCacheService.cs</span></div><pre className="overflow-x-auto p-5 text-xs leading-7 text-slate-300"><code><span className="text-violet-300">public async Task</span>&lt;Product?&gt; GetAsync(int id){`\n`}{"{"}{`\n`}  <span className="text-slate-500">{"// tenta recuperar do Redis"}</span>{`\n`}  var cached = await cache.GetAsync(id);{`\n`}  <span className="text-red-300">if</span> (cached is not null){`\n`}    return cached; <span className="text-slate-500">{"// cache hit"}</span>{`\n`}{`\n`}  var product = repository.Get(id);{`\n`}  await cache.SetAsync(id, product);{`\n`}  return product;{`\n`}{"}"}</code></pre></div></div><p className="mt-6 flex gap-3 rounded-xl border border-cyan-300/15 bg-cyan-300/[.045] p-4 text-sm leading-6 text-cyan-50/80"><CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />O laboratório não é um e-commerce completo e não utiliza banco SQL. Essa escolha mantém o foco na estratégia de cache com Redis.</p></div></section>

    <section id="conteudo" className="scroll-mt-6 mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-28"><SectionHeading center eyebrow={`${redisCourseLessonCount} aulas em 3 módulos`} title="Conteúdo programático" text="Confira as 15 aulas reais, organizadas da configuração do ambiente às boas práticas." /><div className="mt-12 space-y-4">{redisCourseModules.map((module, moduleIndex) => <details key={module.title} open={moduleIndex === 0} className="group rounded-2xl border border-white/10 bg-[#0d1421] open:border-red-400/30"><summary className="flex cursor-pointer list-none items-center gap-4 p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 sm:p-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-500/10 font-mono text-sm font-black text-red-300">0{moduleIndex + 1}</span><span className="flex-1"><strong className="block text-lg">{module.title}</strong><span className="mt-1 block text-sm text-slate-500">{module.lessons.length} aulas</span></span><ChevronDown className="h-5 w-5 text-violet-300 transition group-open:rotate-180" /></summary><ol className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 sm:p-6">{module.lessons.map((lesson, lessonIndex) => { const lessonNumber = redisCourseModules.slice(0, moduleIndex).reduce((sum, item) => sum + item.lessons.length, 0) + lessonIndex + 1; return <li key={lesson} className="flex gap-3 text-sm leading-6 text-slate-300"><span className="font-mono text-xs font-bold text-red-300">{String(lessonNumber).padStart(2, "0")}</span>{lesson}</li>; })}</ol></details>)}</div></section>

    <section className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="Para quem é" title="Um curso essencial para quem trabalha com backend" text="O Redis começa do zero. Para acompanhar a implementação, você precisa de conhecimentos básicos de C# e ASP.NET Core." /><div className="mt-12 grid gap-5 md:grid-cols-3">{[[Code2,"Desenvolvedores C# e .NET","Que desejam integrar Redis às aplicações ASP.NET Core."],[ServerCog,"Desenvolvedores backend","Que querem aprender fundamentos de cache e trabalhar com informações temporárias."],[Network,"Estudantes de arquitetura","Que desejam compreender como Redis participa da arquitetura de aplicações."]].map(([Icon,title,text]) => { const AudienceIcon = Icon as LucideIcon; return <article key={String(title)} className="rounded-2xl border border-white/10 bg-[#0d1421] p-6"><AudienceIcon className="h-7 w-7 text-violet-300" /><h3 className="mt-6 text-xl font-black">{String(title)}</h3><p className="mt-3 leading-7 text-slate-400">{String(text)}</p></article>; })}</div><p className="mt-6 flex gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[.055] p-4 text-sm leading-6 text-amber-100/80"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><strong>Pré-requisito:</strong> o curso não é uma formação completa em programação C#.</p></div></section>

    <section id="professor" className="scroll-mt-6 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28"><div className="grid overflow-hidden rounded-3xl border border-white/10 bg-[#0d1421] lg:grid-cols-[.75fr_1.25fr]"><div className="relative min-h-[380px] bg-[#101827]"><Image src={course.teacherPhoto} alt="Willian Barata, professor do curso Redis com .NET" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-top" unoptimized /></div><div className="p-7 sm:p-10 lg:p-12"><p className="text-xs font-black uppercase tracking-[.2em] text-red-300">Aprenda com quem trabalha com .NET</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em]">Willian Barata</h2><p className="mt-6 text-lg leading-8 text-slate-300">Engenheiro de software com aproximadamente 8 anos de experiência em programação, com foco em .NET.</p><p className="mt-4 leading-7 text-slate-400">Possui experiência prática com desenvolvimento backend, APIs e integração de sistemas. É o criador dos cursos da Plugando IA.</p><div className="mt-8 flex flex-wrap gap-2">{["Engenharia de software", "Backend e APIs", ".NET", "Integração de sistemas"].map(item => <span key={item} className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-bold text-slate-300">{item}</span>)}</div></div></div></section>

    <section className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading center eyebrow="Abordagem do curso" title="Da teoria à implementação, sem promessas exageradas" /><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{[[Zap,"Direto ao ponto","Uma competência por vez, sem excesso de teoria."],[Code2,"Código e demonstrações reais","Acompanhe a construção de uma API ASP.NET Core."],[Container,"Ambiente reproduzível","Docker Compose e Redis Insight durante as operações."],[RefreshCcw,"Da teoria à implementação","Entenda o Redis e aplique os conceitos em C#."]].map(([Icon,title,text]) => { const DifferenceIcon = Icon as LucideIcon; return <article key={String(title)} className="rounded-2xl border border-white/10 bg-[#0d1421] p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><DifferenceIcon className="h-5 w-5" /></span><h3 className="mt-6 font-black">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{String(text)}</p></article>; })}</div></div></section>

    <section id="oferta" className="relative scroll-mt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(220,38,38,.15),transparent_36%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div><SectionHeading eyebrow="Oferta de lançamento" title="Comece a trabalhar com Redis em suas aplicações .NET" text="Aprenda os fundamentos, desenvolva uma API com cache e entenda como lidar com expiração, invalidação e falhas." /><ul className="mt-8 grid gap-4 sm:grid-cols-2">{["15 aulas", "Aulas teóricas e práticas", "Projeto com ASP.NET Core", "Acesso online pela Hotmart", accessLabel, "Compra processada pela Hotmart"].map(item => <li key={item} className="flex gap-3 text-sm font-semibold text-slate-300"><CheckCircle2 className="h-5 w-5 shrink-0 text-red-300" />{item}</li>)}</ul></div>
        <aside className="rounded-3xl border border-red-400/30 bg-[#0d1421] p-7 shadow-[0_30px_100px_rgba(0,0,0,.45)] md:p-9"><span className="text-xs font-black uppercase tracking-[.18em] text-red-300">Preço de lançamento</span>{course.referencePriceApproved ? <p className="mt-5 text-sm text-slate-500">De <s>{money(course.referencePrice)}</s> por apenas</p> : null}<strong className="mt-2 block text-6xl font-black tracking-[-.055em]">{money(course.price)}</strong><span className="mt-2 block text-lg font-black text-violet-200">ou {course.installmentLabel}</span>{course.referencePriceApproved ? <span className="mt-3 inline-flex rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">Economia aproximada de {discount}%</span> : null}<Cta label={`Garantir minha vaga por ${money(course.price)}`} className="mt-7 w-full" />{!checkoutReady ? <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[.055] p-3 text-center text-xs leading-5 text-amber-100">Checkout oficial ainda não configurado. O botão será liberado quando a URL da Hotmart for informada.</p> : null}<div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-xs leading-5 text-slate-400"><p className="flex gap-2"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />Pagamento no checkout oficial da Hotmart.</p><p className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />Acesso após a confirmação do pagamento.</p></div></aside>
      </div>
    </section>

    <section className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><div className="mx-auto grid h-52 w-52 place-items-center rounded-full border border-red-400/25 bg-[radial-gradient(circle,rgba(220,38,38,.16),transparent_65%)]"><div className="grid h-28 w-28 place-items-center rounded-full border border-violet-300/20 bg-[#0d1421]"><LockKeyhole className="h-12 w-12 text-red-300" /></div></div><div><SectionHeading eyebrow="Segurança e transparência" title="Sua compra é processada pela Hotmart" /><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Pagamento no checkout oficial da Hotmart", "Acesso pela plataforma após confirmação", "Meios de pagamento exibidos no checkout", "Reembolso conforme as regras da oferta"].map(item => <div key={item} className="flex gap-3 rounded-xl border border-white/10 bg-[#0d1421] p-4 text-sm font-semibold text-slate-300"><ShieldCheck className="h-4 w-4 shrink-0 text-red-300" />{item}</div>)}</div>{course.guaranteeDays ? <p className="mt-5 rounded-xl border border-emerald-300/15 bg-emerald-300/[.055] p-4 text-sm text-emerald-100">Garantia configurada: {course.guaranteeDays} dias. Consulte as condições completas na oferta.</p> : <p className="mt-5 text-sm leading-6 text-slate-500">O prazo de garantia não é presumido nesta página. Consulte a condição efetivamente exibida no checkout.</p>}</div></div></section>

    <section id="faq" className="scroll-mt-6 mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28"><SectionHeading center eyebrow="Perguntas frequentes" title="Respostas diretas antes da compra" /><div className="mt-12 space-y-3">{dynamicFaqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-white/10 bg-[#0d1421]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 sm:p-6">{question}<ChevronDown className="h-5 w-5 shrink-0 text-red-300 transition group-open:rotate-180" /></summary><p className="border-t border-white/10 px-5 py-5 leading-7 text-slate-300 sm:px-6">{answer}</p></details>)}</div></section>

    <section className="relative border-t border-white/10 bg-[#0a101a]"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,.13),transparent_42%)]" /><div className="relative mx-auto max-w-5xl px-5 py-20 text-center md:px-8 md:py-28"><Database className="mx-auto h-11 w-11 text-red-300" /><h2 className="mt-6 text-balance text-4xl font-black leading-[1.05] tracking-[-.05em] md:text-6xl">Pronto para utilizar Redis nos seus projetos .NET?</h2><p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">Aprenda os fundamentos e implemente cache com ASP.NET Core em um projeto guiado, do ambiente Docker ao tratamento de falhas.</p><strong className="mt-8 block text-5xl font-black">{money(course.price)}</strong><span className="mt-2 block text-lg font-black text-violet-200">ou {course.installmentLabel}</span><div className="mt-6"><Cta label="Quero começar agora" /></div><p className="mt-5 text-xs text-slate-500">Compra processada pela Hotmart • condições reais de acesso exibidas no checkout</p></div></section>

    <footer className="border-t border-white/10 bg-[#05080d]"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-8"><Link href="/cursos" className="flex items-center gap-2 font-black text-slate-200"><Zap className="h-4 w-4 text-red-300" />Plugando IA</Link><span>Programação, arquitetura, produto e Inteligência Artificial.</span></div></footer>

    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070b12]/95 px-4 py-3 backdrop-blur md:hidden"><div className="mx-auto flex items-center gap-3"><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">Redis com .NET</div><div className="text-xs font-bold text-red-300">{course.installmentLabel}</div></div><a href={checkoutHref} className="rounded-lg bg-red-600 px-4 py-2.5 text-xs font-black text-white">Começar agora</a></div></div>
  </main>;
}

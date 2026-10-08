import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  Code2,
  Layers3,
  Network,
  PackageCheck,
  Rocket,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { MetaPixelScript } from "@/components/MetaPixelScript";
import { SalesPageTracker } from "@/components/SalesPageTracker";
import { courseCatalog } from "@/lib/courseCatalog";

type CourseVisual = {
  icon: LucideIcon;
  shortName: string;
  logo: string;
  label: string;
  promise: string;
  project: string;
  audience: string;
  highlights: string[];
  cardClass: string;
  glowClass: string;
  logoClass: string;
  eyebrowClass: string;
  buttonClass: string;
};

const visuals: Record<string, CourseVisual> = {
  vibecode: {
    icon: WandSparkles, shortName: "VIBE", logo: "Vibe Coding", label: "Para tirar a primeira ideia do papel",
    promise: "Crie aplicações com ChatGPT e Codex, mesmo começando sem experiência em programação.",
    project: "Uma plataforma de imobiliária completa, testada e publicada na internet.",
    audience: "Ideal para iniciantes, empreendedores e profissionais que querem construir com IA.",
    highlights: ["ChatGPT + Codex", "Projeto do zero", "Git e deploy"],
    cardClass: "border-violet-200 bg-[#fbf9ff] hover:border-violet-400",
    glowClass: "bg-[radial-gradient(circle_at_90%_0%,rgba(124,58,237,.18),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(184,243,74,.23),transparent_30%)]",
    logoClass: "bg-violet-700 text-white", eyebrowClass: "text-violet-700", buttonClass: "bg-violet-700 text-white hover:bg-violet-800",
  },
  "fundamentos-ia": {
    icon: BrainCircuit, shortName: "IA", logo: "Fundamentos de IA", label: "Para entender e aplicar IA de verdade",
    promise: "Saia do uso superficial de prompts e compreenda LLMs, Tools e integrações com dados reais.",
    project: "Uma aplicação web de barbearia com recursos reais de IA Generativa.",
    audience: "Ideal para quem quer usar IA com mais clareza, método e visão técnica.",
    highlights: ["LLMs e prompts", "Tools e dados", "Aplicação com IA"],
    cardClass: "border-amber-200 bg-[#fffdf6] hover:border-amber-400",
    glowClass: "bg-[radial-gradient(circle_at_90%_0%,rgba(250,204,21,.25),transparent_35%),radial-gradient(circle_at_0%_100%,rgba(15,23,42,.08),transparent_30%)]",
    logoClass: "bg-amber-300 text-slate-950", eyebrowClass: "text-amber-700", buttonClass: "bg-amber-300 text-slate-950 hover:bg-amber-200",
  },
  "arquitetura-software": {
    icon: Layers3, shortName: "ARCH", logo: "Arquitetura de Software", label: "Para enxergar o sistema além do código",
    promise: "Organize aplicações, avalie qualidade e tome decisões técnicas com critérios claros.",
    project: "Arquitetura mais três formações: C#, API RESTful com .NET e AWS.",
    audience: "Ideal para devs que querem evoluir de implementação para decisões de sistema.",
    highlights: ["SOLID e design", "Integração", "C# + API + AWS"],
    cardClass: "border-blue-200 bg-[#f8fbff] hover:border-blue-400",
    glowClass: "bg-[radial-gradient(circle_at_90%_0%,rgba(37,99,235,.17),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(6,182,212,.14),transparent_28%)]",
    logoClass: "bg-blue-700 text-white", eyebrowClass: "text-blue-700", buttonClass: "bg-blue-700 text-white hover:bg-blue-800",
  },
  rabbitmq: {
    icon: Network, shortName: "RMQ", logo: "RabbitMQ com .NET", label: "Para construir processamento resiliente",
    promise: "Domine filas, exchanges, ACK, Retry e DLQ em uma aplicação completa com .NET.",
    project: "Mensageria aplicada a um e-commerce com falhas, recuperação e observabilidade.",
    audience: "Ideal para devs .NET que precisam integrar sistemas e processar tarefas com segurança.",
    highlights: ["Exchanges e filas", "Retry e DLQ", ".NET + Docker"],
    cardClass: "border-orange-200 bg-[#fffaf6] hover:border-orange-400",
    glowClass: "bg-[radial-gradient(circle_at_90%_0%,rgba(249,115,22,.22),transparent_35%),radial-gradient(circle_at_0%_100%,rgba(17,24,39,.10),transparent_28%)]",
    logoClass: "bg-orange-500 text-white", eyebrowClass: "text-orange-700", buttonClass: "bg-orange-500 text-white hover:bg-orange-600",
  },
  "saas-antigravity": {
    icon: Rocket, shortName: "SaaS", logo: "SaaS com Antigravity", label: "Para transformar um projeto em produto",
    promise: "Construa um SaaS com login, trial, assinatura, pagamento, banco e deploy usando IA.",
    project: "Um sistema de gestão completo acompanhado por sete cursos complementares.",
    audience: "Ideal para quem quer lançar o primeiro produto ou entregar sistemas de maior valor.",
    highlights: ["Antigravity", "Next.js completo", "Pagamento e deploy"],
    cardClass: "border-cyan-200 bg-[#f6fdff] hover:border-cyan-400",
    glowClass: "bg-[radial-gradient(circle_at_90%_0%,rgba(6,182,212,.20),transparent_35%),radial-gradient(circle_at_0%_100%,rgba(163,230,53,.18),transparent_28%)]",
    logoClass: "bg-cyan-600 text-white", eyebrowClass: "text-cyan-700", buttonClass: "bg-cyan-600 text-white hover:bg-cyan-700",
  },
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CourseLogo({ visual, compact = false }: { visual: CourseVisual; compact?: boolean }) {
  const Icon = visual.icon;
  return <div className="flex items-center gap-3"><span className={`grid shrink-0 place-items-center rounded-2xl shadow-sm ${compact ? "h-10 w-10" : "h-14 w-14"} ${visual.logoClass}`}><Icon className={compact ? "h-5 w-5" : "h-7 w-7"} /></span><span><span className={`block font-black uppercase tracking-[0.18em] ${compact ? "text-[9px]" : "text-[10px]"} ${visual.eyebrowClass}`}>{visual.shortName}</span><strong className={`block tracking-[-0.025em] text-slate-950 ${compact ? "text-sm" : "text-lg"}`}>{visual.logo}</strong></span></div>;
}

export function CoursesCatalogPage({ metaPixelId }: { metaPixelId?: string }) {
  const bundle = courseCatalog.find((course) => course.slug === "formacao-completa")!;
  const courses = courseCatalog.filter((course) => course.slug !== "formacao-completa");
  const regularPrice = bundle.regularPrice || courses.reduce((total, course) => total + (course.price || 0), 0);
  const saving = regularPrice - (bundle.price || 0);
  const savingPercentage = regularPrice ? Math.round((saving / regularPrice) * 100) : 0;

  return <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-slate-950">
    <MetaPixelScript pixelId={metaPixelId} /><SalesPageTracker pageKey="cursos" pagePath="/cursos" pageTitle="Cursos Plugando IA" />
    <header className="border-b border-white/10 bg-[#081426] text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><Link href="/cursos" className="flex items-center gap-3 text-lg font-black tracking-[-0.03em]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-[#081426]"><Zap className="h-5 w-5" /></span>Plugando IA</Link><Link href="/formacao-completa" className="hidden rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20 sm:inline-flex">Conhecer a formação completa</Link></div></header>

    <section className="relative bg-[#081426] text-white"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,.20),transparent_28%),radial-gradient(circle_at_18%_85%,rgba(99,102,241,.20),transparent_30%)]" /><div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-200"><Sparkles className="h-3.5 w-3.5" /> Tecnologia aplicada a projetos reais</p><h1 className="mt-6 max-w-4xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl md:text-6xl lg:text-7xl">Escolha pelo que você quer <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">ser capaz de construir.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Do primeiro projeto com IA à arquitetura, mensageria e criação de um SaaS. Cada curso resolve um próximo passo claro da sua evolução.</p><a href="#catalogo" className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-4 text-sm font-black text-[#081426] transition hover:-translate-y-0.5 hover:bg-cyan-100">Encontrar meu próximo curso <ArrowRight className="ml-2 h-4 w-4" /></a></div><div className="grid gap-3 sm:grid-cols-2">{courses.map((course) => { const visual = visuals[course.slug]; return <Link href={course.href} key={course.slug} className="group rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[.10]"><CourseLogo visual={visual} compact /><p className="mt-4 text-xs leading-5 text-slate-400 group-hover:text-slate-300">{visual.label}</p></Link>; })}<Link href={bundle.href} className="group rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-300/15 to-indigo-400/15 p-4 transition hover:-translate-y-1 sm:col-span-2"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300 text-[#081426]"><PackageCheck className="h-5 w-5" /></span><div><span className="block text-[9px] font-black uppercase tracking-[0.18em] text-cyan-200">UPGRADE</span><strong className="text-sm text-white">Leve a trilha completa e economize {savingPercentage}%</strong></div><ArrowRight className="ml-auto h-4 w-4 text-cyan-200 transition group-hover:translate-x-1" /></div></Link></div></div></section>

    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"><div className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#0b1930] text-white shadow-[0_30px_100px_rgba(8,20,38,.22)]"><div className="grid lg:grid-cols-[1.15fr_.85fr]"><div className="relative p-7 md:p-10 lg:p-12"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_100%,rgba(34,211,238,.18),transparent_35%)]" /><div className="relative"><p className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#081426]"><PackageCheck className="h-3.5 w-3.5" /> Upgrade inteligente</p><h2 className="mt-6 max-w-3xl text-3xl font-black leading-[1.08] tracking-[-0.045em] md:text-5xl">Em vez de escolher um caminho, leve a sequência completa.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Comece construindo com IA, aprofunde arquitetura e mensageria, entenda IA Generativa e avance até colocar um SaaS completo no ar.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Uma única matrícula para os 5 cursos", "Acesso vitalício a todo o conteúdo", "Aprendizado em uma sequência coerente", "Futuras atualizações incluídas"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.06] p-3 text-sm font-semibold text-slate-100"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-cyan-200"><Check className="h-4 w-4" /></span>{item}</div>)}</div><div className="mt-8 flex flex-wrap gap-2">{courses.map((course) => { const visual = visuals[course.slug]; const Icon = visual.icon; return <span key={course.slug} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-2 text-xs font-bold text-slate-200"><Icon className="h-3.5 w-3.5 text-cyan-200" />{visual.shortName}</span>; })}</div></div></div><aside className="border-t border-white/10 bg-white/[.06] p-7 md:p-10 lg:border-l lg:border-t-0 lg:p-12"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Formação Completa Plugando IA</p><div className="mt-7 rounded-2xl border border-white/10 bg-[#081426] p-6"><span className="text-sm text-slate-400">Comprando separadamente</span><strong className="mt-1 block text-2xl font-bold text-slate-400 line-through decoration-rose-400">{money(regularPrice)}</strong><div className="my-5 h-px bg-white/10" /><span className="text-sm font-semibold text-cyan-200">Upgrade completo por</span><strong className="mt-1 block text-5xl font-black tracking-[-0.055em] text-white">{money(bundle.price || 0)}</strong><div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300"><ShieldCheck className="h-4 w-4" />Você economiza {money(saving)}</div></div><Link href={bundle.href} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-cyan-300 px-6 py-4 text-sm font-black text-[#081426] transition hover:-translate-y-0.5 hover:bg-cyan-200">Quero fazer o upgrade <ArrowRight className="ml-2 h-4 w-4" /></Link><p className="mt-4 text-center text-xs leading-5 text-slate-400">Confira todos os detalhes e condições antes de concluir a matrícula.</p></aside></div></div></section>

    <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-6 px-5 pb-20 md:px-8 md:pb-28"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Cursos individuais</p><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0b1f3a] md:text-5xl">Comece pelo desafio que está na sua frente agora.</h2><p className="mt-5 text-lg leading-8 text-slate-600">Cada curso tem uma identidade, um projeto e um resultado próprio. Escolha o que mais combina com o seu momento.</p></div><div className="mt-12 grid gap-6 lg:grid-cols-2">{courses.map((course) => { const visual = visuals[course.slug]; return <article key={course.slug} className={`group relative flex min-h-[560px] flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl md:p-8 ${visual.cardClass}`}><div className={`pointer-events-none absolute inset-0 ${visual.glowClass}`} /><div className="relative flex h-full flex-1 flex-col"><div className="flex items-start justify-between gap-4"><CourseLogo visual={visual} /><span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 backdrop-blur">{course.badge}</span></div><p className={`mt-8 text-xs font-black uppercase tracking-[0.16em] ${visual.eyebrowClass}`}>{visual.label}</p><h3 className="mt-3 max-w-xl text-3xl font-black leading-[1.08] tracking-[-0.045em] text-[#0b1f3a] md:text-4xl">{visual.promise}</h3><p className="mt-5 leading-7 text-slate-600">{visual.audience}</p><div className="mt-7 rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur"><div className="flex items-start gap-3"><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${visual.logoClass}`}><BookOpen className="h-4 w-4" /></span><div><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">O que você vai construir</span><p className="mt-1 text-sm font-bold leading-6 text-slate-800">{visual.project}</p></div></div></div><div className="mt-6 flex flex-wrap gap-2">{visual.highlights.map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-600">{item}</span>)}</div><div className="mt-auto flex flex-col gap-5 border-t border-slate-200/80 pt-7 sm:flex-row sm:items-end sm:justify-between"><div><span className="block text-xs font-semibold text-slate-500">Acesso vitalício • pagamento único</span><strong className="mt-1 block text-3xl font-black tracking-[-0.04em] text-[#0b1f3a]">{course.price ? money(course.price) : "Ver oferta"}</strong></div><Link href={course.href} className={`inline-flex items-center justify-center rounded-xl px-5 py-3.5 text-sm font-black transition group-hover:-translate-y-0.5 ${visual.buttonClass}`}>Conhecer o curso <ArrowRight className="ml-2 h-4 w-4" /></Link></div></div></article>; })}</div></section>

    <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-3 md:px-8">{[{ icon: Code2, title: "Aprenda construindo", text: "Projetos completos conectam cada conceito a uma decisão prática." }, { icon: CheckCircle2, title: "Avance com clareza", text: "Conteúdo organizado para você entender o próximo passo sem se perder." }, { icon: ShieldCheck, title: "Acesso vitalício", text: "Volte às aulas quando precisar aplicar o conteúdo em um novo projeto." }].map(({ icon: Icon, title, text }) => <article key={title} className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span><div><h3 className="font-black text-[#0b1f3a]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div></article>)}</div></section>
    <section className="bg-[#081426] text-white"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Ainda em dúvida?</p><h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] md:text-4xl">Se você pretende fazer mais de um curso, o combo já é o melhor próximo passo.</h2><p className="mt-4 max-w-2xl leading-7 text-slate-300">Você economiza, recebe a trilha inteira e pode avançar no seu ritmo.</p></div><Link href={bundle.href} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-cyan-300 px-6 py-4 text-sm font-black text-[#081426] hover:bg-cyan-200">Comparar o combo <ArrowRight className="ml-2 h-4 w-4" /></Link></div></section>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-8"><strong className="text-[#0b1f3a]">Plugando IA</strong><span>Programação, arquitetura, produto e Inteligência Artificial.</span></div></footer>
  </main>;
}

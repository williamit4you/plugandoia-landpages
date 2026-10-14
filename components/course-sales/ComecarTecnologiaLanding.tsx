import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Code2,
  Compass,
  Database,
  FolderKanban,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Map,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { MetaPixelScript } from "@/components/MetaPixelScript";
import { SalesPageTracker, SalesViewContentTracker } from "@/components/SalesPageTracker";

const PAGE_KEY = "por-onde-comecar-na-tecnologia";
const PAGE_PATH = "/por-onde-comecar-na-tecnologia";
const PAGE_TITLE = "Por Onde Começar na Tecnologia";

const lessons = [
  { icon: Compass, time: "8 min", title: "Qual caminho seguir na tecnologia?", text: "Conheça front-end, back-end, mobile, dados, IA, cloud, DevOps, segurança e blockchain — e entenda como as áreas se combinam." },
  { icon: Layers3, time: "8 min", title: "O que estudar primeiro e em qual ordem?", text: "Organize sua evolução em base, ferramentas da trilha, prática guiada, projeto pequeno e especialização." },
  { icon: BrainCircuit, time: "7 min", title: "Como estudar sem ficar só assistindo aulas", text: "Use um ciclo de estudo ativo para transformar conteúdo consumido em entendimento e prática." },
  { icon: FolderKanban, time: "8 min", title: "Como escolher seu primeiro projeto", text: "Reduza uma ideia grande a uma primeira versão simples, útil para aprender e possível de terminar." },
  { icon: Map, time: "9 min", title: "Seu plano para os próximos 30 dias", text: "Defina rotina, sessões de estudo, projeto e uma meta realista para o primeiro mês." },
] as const;

const outcomes = [
  "Uma primeira trilha de tecnologia definida",
  "Uma sequência de estudos adaptável à sua área",
  "Um método de estudo ativo",
  "Uma ideia de projeto com escopo pequeno",
  "Um plano inicial para os próximos 30 dias",
];

const faq = [
  ["Preciso saber programar?", "Não. O curso foi criado para quem está começando e precisa de direção."],
  ["O curso ensina uma tecnologia específica?", "Não. Ele ajuda você a escolher uma primeira trilha e organizar os estudos de acordo com o seu objetivo."],
  ["E se eu quiser trabalhar com inteligência artificial ou blockchain?", "O curso mostra como essas áreas podem fazer parte da sua trilha e como construir uma base antes de se especializar."],
  ["Quanto tempo dura o curso?", "Aproximadamente 40 minutos, divididos em 5 aulas diretas."],
  ["Como recebo o curso depois da compra?", "Após a confirmação do pagamento, os dados de acesso são enviados com segurança para o e-mail informado no checkout. O acesso ao conteúdo é vitalício."],
  ["Vou sair empregado ao terminar?", "Não existe promessa de emprego. O objetivo é dar clareza, método e um plano inicial para você começar a praticar."],
] as const;

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">{eyebrow}</p>
    <h2 className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">{title}</h2>
    {text ? <p className="mt-5 text-lg leading-8 text-slate-300">{text}</p> : null}
  </div>;
}

function Benefit({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return <li className="flex gap-3 text-sm font-semibold text-slate-200"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-300/10 text-emerald-300"><Icon className="h-3.5 w-3.5" /></span>{children}</li>;
}

export function ComecarTecnologiaLanding({ price, checkoutUrl, teacherPhoto, metaPixelId }: { price: number; checkoutUrl: string; teacherPhoto: string; metaPixelId?: string }) {
  const checkoutReady = /^https?:\/\//.test(checkoutUrl);
  const ctaHref = checkoutReady ? checkoutUrl : "#oferta";

  function Cta({ label, className = "" }: { label: string; className?: string }) {
    return <a href={ctaHref} className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-300 px-6 py-4 text-sm font-black text-[#06101f] transition hover:-translate-y-0.5 hover:bg-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 ${className}`} rel={checkoutReady ? "noopener noreferrer" : undefined}>{label}<ArrowRight className="ml-2 h-4 w-4" /></a>;
  }

  return <main className="min-h-screen overflow-hidden bg-[#07111f] pb-20 text-white selection:bg-emerald-300 selection:text-[#07111f] md:pb-0">
    <MetaPixelScript pixelId={metaPixelId} />
    <SalesPageTracker pageKey={PAGE_KEY} pagePath={PAGE_PATH} pageTitle={PAGE_TITLE} metadata={{ offerPrice: price, currency: "BRL" }} />
    <SalesViewContentTracker pageKey={PAGE_KEY} pagePath={PAGE_PATH} pageTitle={PAGE_TITLE} value={price} currency="BRL" metadata={{ contentName: PAGE_TITLE, contentType: "product" }} />

    <header className="border-b border-white/10 bg-[#07111f]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/cursos" className="flex items-center gap-2 text-lg font-black tracking-[-0.03em]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-500 text-[#07111f]"><Zap className="h-4 w-4" /></span>Plugando IA</Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-bold text-slate-300 md:flex"><a href="#aulas" className="hover:text-white">Aulas</a><a href="#professor" className="hover:text-white">Professor</a><a href="#faq" className="hover:text-white">Dúvidas</a></nav>
        <a href="#oferta" className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-200 hover:bg-emerald-300/20">Começar por {currency(price)}</a>
      </div>
    </header>

    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(124,58,237,.22),transparent_30%),radial-gradient(circle_at_12%_75%,rgba(34,211,238,.14),transparent_32%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
        <div><p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.16em] text-cyan-200"><Sparkles className="h-3.5 w-3.5" /> Mini curso para iniciantes</p><h1 className="mt-6 text-balance text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl md:text-6xl">Pare de ficar perdido sobre o que estudar para <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">entrar na tecnologia.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Em cerca de 40 minutos, você vai escolher uma primeira trilha, entender a ordem dos estudos e montar um plano prático para os próximos 30 dias.</p><ul className="mt-7 grid gap-3"><Benefit icon={Compass}>Escolha uma direção para começar</Benefit><Benefit icon={Layers3}>Saiba o que estudar primeiro</Benefit><Benefit icon={Target}>Defina seu primeiro projeto e sua rotina</Benefit></ul><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Cta label="Quero começar minha trilha" /><a href="#aulas" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[.04] px-6 py-4 text-sm font-black text-slate-200 hover:bg-white/[.08]">Ver as 5 aulas <ArrowDown className="ml-2 h-4 w-4" /></a></div><p className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400"><span>Acesso vitalício</span><span>•</span><span>Entrega digital segura</span><span>•</span><span>Pagamento único de {currency(price)}</span></p></div>
        <aside className="relative rounded-[2rem] border border-white/10 bg-white/[.055] p-6 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur md:p-8"><div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" /><div className="relative"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Seu mapa de partida</span><Route className="h-6 w-6 text-emerald-300" /></div><div className="mt-7 space-y-3">{["Escolher a trilha", "Ordenar os estudos", "Praticar de forma ativa", "Definir um projeto", "Planejar 30 dias"].map((item, index) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#081426]/80 p-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${index === 4 ? "bg-emerald-300 text-[#07111f]" : "bg-violet-500/15 text-violet-200"}`}>{index + 1}</span><span className="font-bold text-slate-100">{item}</span>{index < 4 ? <span className="ml-auto text-xs text-slate-600">→</span> : <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-300" />}</div>)}</div><div className="mt-6 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-cyan-300/10 p-3"><strong className="block text-xl text-cyan-200">5</strong><span className="text-[10px] uppercase text-slate-400">aulas</span></div><div className="rounded-xl bg-violet-400/10 p-3"><strong className="block text-xl text-violet-200">40</strong><span className="text-[10px] uppercase text-slate-400">minutos</span></div><div className="rounded-xl bg-emerald-300/10 p-3"><strong className="block text-xl text-emerald-200">30</strong><span className="text-[10px] uppercase text-slate-400">dias</span></div></div></div></aside>
      </div>
    </section>

    <section className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="O verdadeiro bloqueio" title="Você não precisa aprender tudo para começar" text="O problema não é falta de conteúdo. É tentar estudar muitas áreas, ferramentas e tendências ao mesmo tempo, sem uma sequência que mostre o próximo passo." /><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{["Começar vários cursos e não terminar nenhum", "Trocar de tecnologia antes de praticar", "Não saber qual projeto criar", "Estudar sem conseguir perceber evolução"].map((item, index) => <article key={item} className="rounded-2xl border border-white/10 bg-[#0b1728] p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-400/10 text-rose-300"><X className="h-5 w-5" /></span><p className="mt-6 font-bold leading-7 text-slate-200">{item}</p><span className="mt-5 block font-mono text-[10px] text-slate-600">0{index + 1}</span></article>)}</div></div></section>

    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="Resultado do mini curso" title="Ao final, você terá um ponto de partida claro" text="Você não sai com mais uma lista infinita. Sai com decisões simples para colocar em prática." /><div className="mt-12 grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><div className="grid gap-3">{outcomes.map((item) => <div key={item} className="flex gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[.055] p-4 text-sm font-semibold text-slate-200"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />{item}</div>)}</div><div className="rounded-3xl border border-white/10 bg-[#0b1728] p-6 md:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-300">Sua evolução</p><div className="mt-7 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">{["Perdido sobre o que estudar", "Trilha definida", "Estudo com prática", "Primeiro projeto", "Plano de 30 dias"].map((item, index) => <div key={item} className="contents"><div className={`rounded-xl border p-4 text-center text-xs font-bold leading-5 ${index === 4 ? "border-emerald-300 bg-emerald-300 text-[#07111f]" : "border-white/10 bg-white/[.04] text-slate-300"}`}>{item}</div>{index < 4 ? <ArrowRight className="mx-auto hidden h-4 w-4 text-violet-300 sm:block" /> : null}</div>)}</div></div></div></section>

    <section className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2"><article className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[.055] p-7 md:p-9"><Check className="h-7 w-7 text-emerald-300" /><h2 className="mt-5 text-2xl font-black">Este curso é para você se:</h2><ul className="mt-7 space-y-4 text-slate-300">{["Quer começar na tecnologia, mas não sabe por onde ir", "Está entre programação, IA, dados, cloud, blockchain ou outras áreas", "Quer um plano inicial simples e possível de cumprir", "Quer parar de apenas assistir conteúdo e começar a praticar", "Precisa de uma primeira ideia de projeto"].map(item => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />{item}</li>)}</ul></article><article className="rounded-3xl border border-white/10 bg-[#0b1728] p-7 md:p-9"><X className="h-7 w-7 text-slate-500" /><h2 className="mt-5 text-2xl font-black">Este curso não é para você se:</h2><ul className="mt-7 space-y-4 text-slate-400">{["Procura uma formação completa em uma tecnologia específica", "Já possui uma rotina consolidada de estudos e vários projetos práticos", "Espera aprender uma área inteira em poucos dias"].map(item => <li key={item} className="flex gap-3"><CircleDot className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />{item}</li>)}</ul></article></div></section>

    <section id="aulas" className="scroll-mt-6 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="Conteúdo direto ao ponto" title="O que você vai aprender" text="5 aulas • aproximadamente 40 minutos • conteúdo direto ao ponto" /><div className="mt-12 grid gap-4 lg:grid-cols-2">{lessons.map(({ icon: Icon, ...lesson }, index) => <article key={lesson.title} className={`rounded-2xl border border-white/10 bg-[#0b1728] p-6 ${index === 4 ? "lg:col-span-2" : ""}`}><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-200"><Icon className="h-6 w-6" /></span><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs font-bold text-emerald-300">AULA {String(index + 1).padStart(2, "0")}</span><span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />{lesson.time}</span></div><h3 className="mt-3 text-xl font-black">{lesson.title}</h3><p className="mt-3 leading-7 text-slate-400">{lesson.text}</p></div></div></article>)}</div><div className="mt-8 text-center"><Cta label="Quero acessar as 5 aulas" /></div></section>

    <section className="border-y border-white/10 bg-[#0a1525]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><SectionHeading eyebrow="Método de estudo ativo" title="Menos acúmulo de conteúdo. Mais direção e prática." text="Em vez de apenas assistir, você aprende um ciclo simples para transformar cada sessão em ação e aprendizado verificável." /><p className="mt-7 rounded-2xl border border-cyan-300/15 bg-cyan-300/[.055] p-5 leading-7 text-cyan-50">Uma sessão pode combinar conteúdo, exercício, prática no projeto e uma revisão curta.</p></div><div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">{["Entender", "Reproduzir", "Alterar", "Explicar e conferir"].map((item, index) => <div key={item} className="contents"><div className={`rounded-2xl border p-5 text-center font-black ${index === 3 ? "border-emerald-300 bg-emerald-300 text-[#07111f]" : "border-violet-300/20 bg-violet-300/[.06] text-violet-100"}`}><span className="mb-2 block font-mono text-xs opacity-60">0{index + 1}</span>{item}</div>{index < 3 ? <ArrowRight className="mx-auto hidden h-4 w-4 text-cyan-300 sm:block" /> : null}</div>)}</div></div></section>

    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><SectionHeading eyebrow="Sua entrega final" title="Você termina com um plano que consegue executar" text="Preencha sua ficha ao longo do mini curso e transforme intenção em um próximo passo concreto." /><div className="rounded-3xl border border-emerald-300/20 bg-[#0b1728] p-6 shadow-[0_25px_80px_rgba(0,0,0,.3)] md:p-8"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Plano de partida</p><strong className="mt-1 block text-xl">Meus próximos 30 dias</strong></div><Target className="h-7 w-7 text-violet-300" /></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{["Minha trilha inicial", "Tecnologia principal", "Primeiro projeto pequeno", "Dias e tempo de estudo", "Meta para os próximos 30 dias"].map((label, index) => <div key={label} className={index === 4 ? "sm:col-span-2" : ""}><label className="text-xs font-bold text-slate-400">{label}</label><div className="mt-2 h-11 rounded-xl border border-dashed border-white/20 bg-white/[.025]" /></div>)}</div></div></div></section>

    <section id="professor" className="scroll-mt-6 border-y border-white/10 bg-white/[.025]"><div className="mx-auto grid max-w-6xl gap-0 overflow-hidden px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[.75fr_1.25fr]"><div className="relative min-h-[380px] overflow-hidden rounded-t-3xl bg-[#0b1728] lg:rounded-l-3xl lg:rounded-tr-none"><Image src={teacherPhoto} alt="Willian Barata, professor do mini curso" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-top" unoptimized /></div><div className="rounded-b-3xl border border-white/10 bg-[#0b1728] p-7 sm:p-10 lg:rounded-r-3xl lg:rounded-bl-none lg:p-12"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Seu professor</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em]">Willian Barata</h2><p className="mt-6 text-lg leading-8 text-slate-300">Desenvolvedor com foco em .NET, com 8 anos de experiência em programação e 4 anos utilizando mensageria e RabbitMQ.</p><p className="mt-4 leading-7 text-slate-400">Também trabalha com C#, SQL, React/Next.js, TypeScript, PostgreSQL, Docker e aplicações de IA.</p><div className="mt-8 flex flex-wrap gap-2">{[".NET", "C#", "React / Next.js", "TypeScript", "PostgreSQL", "Docker", "IA"].map(item => <span key={item} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-bold text-slate-300">{item}</span>)}</div></div></div></section>

    <section id="oferta" className="relative scroll-mt-6"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,.14),transparent_35%)]" /><div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center"><div><SectionHeading eyebrow="Tudo para começar" title="Direção, método e um plano de 30 dias em uma única compra." /><ul className="mt-8 grid gap-4 sm:grid-cols-2">{["5 aulas rápidas e diretas", "Aproximadamente 40 minutos", "Ficha do plano de 30 dias", "Acesso vitalício", "Entrega digital segura", "Atualizações desta edição"].map(item => <li key={item} className="flex gap-3 text-sm font-semibold text-slate-300"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />{item}</li>)}</ul></div><aside className="rounded-3xl border border-emerald-300/30 bg-[#0b1728] p-7 shadow-[0_30px_100px_rgba(0,0,0,.4)] md:p-9"><span className="text-sm font-semibold text-slate-400">Pagamento único • acesso vitalício</span><strong className="mt-3 block text-6xl font-black tracking-[-.055em] text-white">{currency(price)}</strong><p className="mt-3 text-sm text-slate-400">Sem mensalidade. Revise os dados e as condições antes de concluir.</p><Cta label="Quero montar meu plano" className="mt-7 w-full" />{!checkoutReady ? <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[.055] p-3 text-center text-xs text-amber-100">Checkout em configuração. O botão será liberado assim que o link de pagamento for informado.</p> : null}<div className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">{[[LockKeyhole, "Pagamento protegido"], [ShieldCheck, "Entrega segura"], [Clock3, "Acesso vitalício"], [BookOpen, "5 aulas objetivas"]].map(([Icon, label]) => { const TrustIcon = Icon as LucideIcon; return <div key={String(label)} className="flex items-center gap-2 text-xs font-bold text-slate-300"><TrustIcon className="h-4 w-4 text-emerald-300" />{String(label)}</div>; })}</div></aside></div></section>

    <section id="faq" className="scroll-mt-6 border-y border-white/10 bg-white/[.025]"><div className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28"><SectionHeading center eyebrow="Perguntas frequentes" title="Respostas diretas antes de começar" /><div className="mt-12 space-y-3">{faq.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-white/10 bg-[#0b1728]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 sm:p-6">{question}<ChevronDown className="h-5 w-5 shrink-0 text-emerald-300 transition group-open:rotate-180" /></summary><p className="border-t border-white/10 px-5 py-5 leading-7 text-slate-300 sm:px-6">{answer}</p></details>)}</div></div></section>

    <section className="relative"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,.16),transparent_42%)]" /><div className="relative mx-auto max-w-5xl px-5 py-20 text-center md:px-8 md:py-28"><Lightbulb className="mx-auto h-10 w-10 text-emerald-300" /><h2 className="mt-6 text-balance text-4xl font-black leading-[1.05] tracking-[-.05em] md:text-6xl">Sua jornada não começa quando você aprende tudo. <span className="text-emerald-300">Começa quando escolhe o próximo passo.</span></h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">Defina sua trilha, organize seus estudos e comece seu primeiro projeto com mais clareza.</p><div className="mt-8"><Cta label="Quero montar meu plano de estudos" /></div></div></section>

    <footer className="border-t border-white/10 bg-[#050c16]"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-8"><Link href="/cursos" className="flex items-center gap-2 font-black text-slate-200"><Zap className="h-4 w-4 text-cyan-300" />Plugando IA</Link><span>Clareza para aprender, praticar e construir.</span></div></footer>

    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#07111f]/95 px-4 py-3 backdrop-blur md:hidden"><div className="mx-auto flex items-center gap-3"><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-white">Por Onde Começar</div><div className="text-xs font-bold text-emerald-300">{currency(price)} • vitalício</div></div><a href={ctaHref} className="rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-black text-[#07111f]">Começar agora</a></div></div>
  </main>;
}

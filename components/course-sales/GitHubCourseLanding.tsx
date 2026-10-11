import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  GitBranch,
  GitCommitHorizontal,
  Github,
  GitMerge,
  Laptop,
  LockKeyhole,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { MetaPixelScript } from "@/components/MetaPixelScript";
import { SalesPageTracker, SalesViewContentTracker } from "@/components/SalesPageTracker";
import { MobileStickyCTA, TrackedCheckoutButton } from "@/components/course-completo/interactive";
import { githubCourse, githubCourseLessonCount, githubCourseModules } from "@/lib/githubCourse";

const benefits = [
  "Do primeiro commit aos Pull Requests.",
  "Exemplos práticos com um projeto .NET.",
  "Aulas organizadas para você acompanhar cada etapa.",
];

const difficulties = [
  "Não sabe exatamente o que será enviado no próximo commit.",
  "Fica confuso ao juntar alterações de duas branches.",
  "Não entende a diferença entre merge e rebase.",
  "Fez uma alteração errada e não sabe como desfazer.",
  "Precisa abrir um Pull Request, mas não conhece o fluxo.",
  "Tem receio de perder trabalho ao executar um comando.",
];

const outcomes = [
  [GitCommitHorizontal, "Criar e manter um repositório", "Acompanhe alterações e registre commits com clareza."],
  [Github, "Publicar no GitHub", "Use push, pull e clone para manter o código sincronizado."],
  [GitBranch, "Trabalhar com branches", "Separe mudanças e integre código de forma organizada."],
  [GitMerge, "Resolver conflitos", "Entenda o problema e conclua a integração passo a passo."],
  [RotateCcw, "Desfazer e recuperar alterações", "Pratique restore, reset, revert e reflog."],
  [ShieldCheck, "Organizar o trabalho", "Use Pull Requests, Issues e proteção de branches."],
] as const;

const faqs = [
  ["Preciso saber Git antes de começar?", "Não. O curso começa pelos conceitos e configurações iniciais e avança até branches, recuperação e organização do trabalho."],
  ["O curso serve para quem programa em outra linguagem?", "Sim. Git e GitHub são independentes da linguagem. O projeto .NET é a base usada nas demonstrações."],
  ["Preciso conhecer .NET?", "Não para aprender Git. Para reproduzir exatamente o projeto demonstrado, você precisará instalar o SDK do .NET."],
  ["Vou praticar junto com o professor?", "As aulas mostram o objetivo, a execução e o resultado de cada etapa para você reproduzir no seu computador."],
  ["Quais ferramentas são utilizadas?", "Git, terminal com PowerShell, VS Code, GitHub e um projeto .NET usado como exemplo."],
  ["O curso ensina a resolver conflitos?", "Sim. O conteúdo inclui merge, identificação do conflito e conclusão da integração."],
  ["Vou aprender a recuperar alterações?", "Sim. Você verá restore, reset, revert e reflog, incluindo recuperação após um reset."],
  ["Como funciona o acesso após a compra?", "A compra é processada com segurança pela Hotmart. O acesso é imediato, vitalício e inclui futuras atualizações. Você também conta com 7 dias de garantia."],
] as const;

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#22d3ee]">{eyebrow}</p>
    <h2 className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">{title}</h2>
    {text ? <p className="mt-5 text-lg leading-8 text-slate-300">{text}</p> : null}
  </div>;
}

function CheckoutButton({ label, className = "" }: { label: string; className?: string }) {
  return <TrackedCheckoutButton
    href={githubCourse.checkoutUrl}
    label={label}
    pageKey={githubCourse.pageKey}
    pagePath={githubCourse.pagePath}
    pageTitle={githubCourse.name}
    value={githubCourse.cashPrice}
    currency="BRL"
    customEvent="github_course_checkout_click"
    eventData={{ content_name: githubCourse.name, content_type: "product", currency: "BRL", value: githubCourse.cashPrice }}
    hideGlow
    className={`!min-h-12 !rounded-xl !bg-none !bg-[#f97316] !px-6 !py-4 !font-black !text-white hover:!-translate-y-0.5 hover:!bg-[#ea580c] focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-cyan-300 ${className}`}
  />;
}

function CourseVisual() {
  return <div className="relative mx-auto max-w-xl">
    <div className="absolute -inset-10 rounded-full bg-orange-500/10 blur-3xl" />
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-[#111827] p-5 shadow-[0_28px_90px_rgba(0,0,0,.45)] sm:p-7">
      <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 font-mono text-xs text-slate-500">projeto-pratico / main</span>
      </div>
      <div className="mt-7 rounded-2xl border border-slate-700 bg-[#0b1120] p-5">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-400">Git e GitHub</p><h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">Do zero à prática</h2></div><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-500 text-white"><GitBranch className="h-6 w-6" /></span></div>
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-cyan-400 ring-4 ring-cyan-400/10" /><span className="h-px flex-1 bg-cyan-400/40" /><span className="rounded-full bg-cyan-400/10 px-3 py-1 font-mono text-xs text-cyan-300">feature/login</span></div>
          <div className="ml-1.5 h-8 w-px bg-slate-600" />
          <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-violet-400 ring-4 ring-violet-400/10" /><span className="h-px flex-1 bg-violet-400/40" /><span className="rounded-full bg-violet-400/10 px-3 py-1 font-mono text-xs text-violet-300">merge → main</span></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-300 sm:text-xs">{["commit", "branch", "pull request"].map((item) => <span key={item} className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 font-mono">{item}</span>)}</div>
      <p className="mt-5 text-sm leading-6 text-slate-400"><strong className="text-slate-200">Projeto demonstrado em .NET.</strong> Os conceitos de Git se aplicam a outras linguagens.</p>
    </div>
  </div>;
}

export function GitHubCourseLanding({ metaPixelId }: { metaPixelId?: string }) {
  return <main className="min-h-screen overflow-hidden bg-[#0b1120] pb-20 text-[#f8fafc] selection:bg-orange-500 selection:text-white md:pb-0">
    <MetaPixelScript pixelId={metaPixelId} />
    <SalesPageTracker pageKey={githubCourse.pageKey} pagePath={githubCourse.pagePath} pageTitle={githubCourse.name} />
    <SalesViewContentTracker pageKey={githubCourse.pageKey} pagePath={githubCourse.pagePath} pageTitle={githubCourse.name} value={githubCourse.cashPrice} currency="BRL" metadata={{ contentName: githubCourse.name, contentType: "product" }} />

    <header className="border-b border-slate-800 bg-[#0b1120]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/cursos" className="flex items-center gap-2 text-lg font-black tracking-[-0.03em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white"><Zap className="h-4 w-4" /></span>Plugando IA</Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-bold text-slate-300 md:flex"><a href="#conteudo" className="hover:text-white">Conteúdo</a><a href="#professor" className="hover:text-white">Professor</a><a href="#duvidas" className="hover:text-white">Dúvidas</a></nav>
        <a href="#oferta" className="rounded-lg border border-orange-400/40 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-300 hover:bg-orange-500/20 sm:px-4 sm:text-sm">Quero aprender</a>
      </div>
    </header>

    <section className="relative"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,.12),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(34,211,238,.08),transparent_30%)]" /><div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
      <div><p className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.14em] text-orange-300"><GitBranch className="h-3.5 w-3.5" /> Curso prático • Do zero ao trabalho com branches</p><h1 className="mt-6 text-balance text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl md:text-6xl">Pare de depender de comandos decorados. <span className="text-orange-400">Entenda Git e GitHub na prática.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Aprenda a versionar seu código, trabalhar com branches, resolver conflitos e recuperar alterações, com demonstrações passo a passo no terminal, no VS Code e no GitHub.</p><ul className="mt-7 grid gap-3">{benefits.map((item) => <li key={item} className="flex gap-3 text-sm font-semibold text-slate-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />{item}</li>)}</ul><div className="mt-8 flex flex-col gap-3 sm:flex-row"><CheckoutButton label="Quero aprender Git e GitHub" /><a href="#conteudo" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-700 px-6 py-4 text-sm font-black text-slate-200 hover:border-slate-500 hover:bg-slate-800">Ver o conteúdo do curso <ArrowDown className="ml-2 h-4 w-4" /></a></div><p className="mt-5 text-sm text-slate-400">Acesso imediato e vitalício • 7 dias de garantia • Compra segura pela Hotmart</p></div>
      <CourseVisual />
    </div></section>

    <section className="border-y border-slate-800 bg-[#111827]"><div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="Situações comuns" title="Você usa Git, mas ainda fica inseguro quando algo sai do esperado?" /><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{difficulties.map((item) => <article key={item} className="flex gap-4 rounded-2xl border border-slate-700 bg-[#182235] p-5"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" /><p className="leading-7 text-slate-300">{item}</p></article>)}</div><div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/[.06] p-6 text-lg font-bold leading-8 text-cyan-50">O curso mostra o que vamos fazer, por que cada comando é usado e como conferir o resultado.</div></div></section>

    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading eyebrow="Resultado prático" title="O que você vai conseguir fazer" text="Ações concretas para trabalhar com seu código e colaborar sem depender de tentativa e erro." /><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{outcomes.map(([Icon, title, text], index) => <article key={title} className="rounded-2xl border border-slate-700 bg-[#182235] p-6"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/10 text-orange-400"><Icon className="h-5 w-5" /></span><span className="font-mono text-xs text-slate-500">0{index + 1}</span></div><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-400">{text}</p></article>)}</div></section>

    <section className="border-y border-slate-800 bg-[#111827]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><SectionHeading eyebrow="Aprenda acompanhando" title="Primeiro, entenda o objetivo. Depois, execute. Por fim, confira o resultado." text="Cada exemplo é separado para facilitar o acompanhamento e conectar o comando ao efeito que ele produz." /><div className="mt-8 flex flex-wrap gap-2">{["Terminal", "VS Code", "GitHub", "Projeto .NET"].map((item) => <span key={item} className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300">{item}</span>)}</div></div><div className="grid gap-4 sm:grid-cols-3">{[[CircleDot,"1. Objetivo","Saiba o que precisa acontecer."],[Terminal,"2. Execução","Acompanhe cada comando."],[CheckCircle2,"3. Resultado","Confira o que mudou."]].map(([Icon,title,text]) => { const StepIcon = Icon as typeof Terminal; return <article key={String(title)} className="rounded-2xl border border-slate-700 bg-[#182235] p-6"><StepIcon className="h-7 w-7 text-cyan-400" /><h3 className="mt-8 font-black text-white">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{String(text)}</p></article>; })}</div></div></section>

    <section id="conteudo" className="scroll-mt-6 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28"><SectionHeading center eyebrow={`${githubCourseLessonCount} aulas em 4 módulos`} title="Dos primeiros commits ao fluxo profissional no GitHub" text="Abra cada módulo para conferir exatamente o que será ensinado. Nenhuma aula inventada, nenhum conteúdo genérico." /><div className="mt-12 space-y-4">{githubCourseModules.map((module, index) => <details key={module.title} className="group rounded-2xl border border-slate-700 bg-[#182235] open:border-orange-400/40"><summary className="flex cursor-pointer list-none items-center gap-4 p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 sm:p-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 font-mono text-sm font-black text-orange-400">0{index + 1}</span><span className="flex-1"><strong className="block text-base text-white sm:text-lg">{module.title}</strong><span className="mt-1 block text-sm text-slate-400">{module.lessons.length} aulas • {module.outcome}</span></span><ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" /></summary><div className="border-t border-slate-700 px-5 py-6 sm:px-6"><ol className="grid gap-3 md:grid-cols-2">{module.lessons.map((lesson, lessonIndex) => <li key={lesson} className="flex gap-3 text-sm leading-6 text-slate-300"><span className="font-mono text-xs font-bold text-orange-400">{String(lessonIndex + 1).padStart(2,"0")}</span>{lesson}</li>)}</ol></div></details>)}</div></section>

    <section className="border-y border-slate-800 bg-[#111827]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2"><div><SectionHeading eyebrow="Para quem é" title="Um curso para transformar uso básico em entendimento prático." /><ul className="mt-8 space-y-4">{["Quem está começando na programação.","Quem já programa, mas usa Git sem entender bem os comandos.","Quem deseja praticar o fluxo de branches e Pull Requests.","Quem quer aprender a desfazer e recuperar alterações."].map(item => <li key={item} className="flex gap-3 text-slate-300"><Check className="mt-1 h-4 w-4 shrink-0 text-cyan-400" />{item}</li>)}</ul></div><aside className="rounded-3xl border border-slate-700 bg-[#182235] p-7 md:p-9"><Laptop className="h-8 w-8 text-orange-400" /><h3 className="mt-6 text-2xl font-black">O que você precisa</h3><p className="mt-4 leading-7 text-slate-300">Um computador, Git, VS Code e uma conta no GitHub. Para reproduzir o projeto demonstrado, será necessário instalar o SDK do .NET.</p><p className="mt-5 rounded-xl bg-slate-900/60 p-4 text-sm leading-6 text-slate-400">As demonstrações foram realizadas no Windows com PowerShell. Os conceitos de Git se aplicam a outras linguagens.</p></aside></div></section>

    <section id="professor" className="scroll-mt-6 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28"><div className="grid overflow-hidden rounded-[2rem] border border-slate-700 bg-[#182235] lg:grid-cols-[.75fr_1.25fr]"><div className="relative min-h-[360px] bg-[#111827]"><Image src={githubCourse.teacher.photo} alt={`Professor ${githubCourse.teacher.name}`} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-top" /></div><div className="p-7 sm:p-10 lg:p-12"><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-400">Seu professor</p><h2 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-4xl">{githubCourse.teacher.name}</h2><p className="mt-6 text-lg leading-8 text-slate-300">Sou desenvolvedor de software, com 8 anos de experiência em programação e foco em .NET. Neste curso, apresento Git e GitHub com exemplos práticos, explicando o objetivo dos comandos e acompanhando seus resultados.</p><div className="mt-8 flex flex-wrap gap-2">{["8 anos de experiência", "Desenvolvimento de software", "Foco em .NET"].map(item => <span key={item} className="rounded-full border border-slate-600 px-4 py-2 text-sm font-bold text-slate-300">{item}</span>)}</div></div></div></section>

    {githubCourse.reviews.length > 0 ? <section aria-label="Avaliações de alunos">{githubCourse.reviews.map(review => <blockquote key={review.name}>{review.text}<cite>{review.name}</cite></blockquote>)}</section> : null}

    <section id="oferta" className="relative scroll-mt-6 border-y border-slate-800 bg-[#111827]"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_50%,rgba(249,115,22,.14),transparent_35%)]" /><div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-orange-400">Git e GitHub Profissional</p><h2 className="mt-4 text-balance text-4xl font-black tracking-[-.05em] md:text-5xl">Entenda o fluxo. Pratique os comandos. Trabalhe com mais segurança.</h2><ul className="mt-8 space-y-4">{["Quatro módulos e 23 aulas.","Versionamento, branches e recuperação de alterações.","Demonstrações no terminal, VS Code e GitHub.","Acesso vitalício com futuras atualizações."].map(item => <li key={item} className="flex gap-3 text-slate-300"><CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-400" />{item}</li>)}</ul></div><aside className="rounded-3xl border border-orange-400/30 bg-[#182235] p-7 shadow-[0_25px_80px_rgba(0,0,0,.35)] md:p-9"><span className="text-sm font-semibold text-slate-400">Acesso completo e vitalício</span><strong className="mt-3 block text-4xl font-black tracking-[-.05em] text-white">{githubCourse.installmentPrice}</strong><span className="mt-2 block text-base text-slate-300">ou <strong className="text-orange-400">{money(githubCourse.cashPrice)} à vista</strong></span><CheckoutButton label="Quero começar agora" className="mt-7 w-full" /><p className="mt-3 text-center text-[11px] leading-5 text-slate-500">*Condições de parcelamento apresentadas no checkout.</p><div className="mt-6 grid grid-cols-2 gap-3">{[[Zap,"Acesso imediato"],[Clock3,"Acesso vitalício"],[RefreshCcw,"Atualizações futuras"],[ShieldCheck,"7 dias de garantia"]].map(([Icon,text]) => { const TrustIcon = Icon as typeof ShieldCheck; return <div key={String(text)} className="flex items-center gap-2 rounded-xl bg-slate-900/60 p-3 text-xs font-bold text-slate-300"><TrustIcon className="h-4 w-4 shrink-0 text-cyan-400" />{String(text)}</div>; })}</div><p className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-slate-400"><LockKeyhole className="h-4 w-4" /> Compra segura processada pela Hotmart</p></aside></div></section>

    <section id="duvidas" className="scroll-mt-6 mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28"><SectionHeading center eyebrow="Perguntas frequentes" title="Respostas diretas antes de começar" /><div className="mt-12 space-y-3">{faqs.map(([question,answer]) => <details key={question} className="group rounded-2xl border border-slate-700 bg-[#182235]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 sm:p-6">{question}<ChevronDown className="h-5 w-5 shrink-0 text-orange-400 transition group-open:rotate-180" /></summary><p className="border-t border-slate-700 px-5 py-5 leading-7 text-slate-300 sm:px-6">{answer}</p></details>)}</div></section>

    <section className="border-t border-slate-800 bg-[#111827]"><div className="mx-auto max-w-5xl px-5 py-20 text-center md:px-8 md:py-24"><GitBranch className="mx-auto h-10 w-10 text-orange-400" /><h2 className="mt-6 text-balance text-4xl font-black tracking-[-.05em] md:text-5xl">Dê o próximo passo para trabalhar com Git com mais segurança.</h2><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">Aprenda a acompanhar suas mudanças, integrar código e recuperar alterações com exemplos que você pode reproduzir.</p><div className="mt-8"><CheckoutButton label="Quero aprender Git e GitHub" className="sm:min-w-80" /></div></div></section>

    <footer className="border-t border-slate-800 bg-[#0b1120]"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-8"><Link href="/cursos" className="flex items-center gap-2 font-black text-slate-200"><Zap className="h-4 w-4 text-orange-400" />Plugando IA</Link><span>Programação, arquitetura, produto e Inteligência Artificial.</span></div></footer>

    <MobileStickyCTA title="Git e GitHub Profissional" priceLabel="9x R$ 3,55" href={githubCourse.checkoutUrl} label="Começar agora" pageKey={githubCourse.pageKey} pagePath={githubCourse.pagePath} pageTitle={githubCourse.name} value={githubCourse.cashPrice} currency="BRL" className="!border-slate-700 !bg-[#0b1120]/95" titleClassName="!text-white" priceClassName="!text-orange-400" buttonClassName="!rounded-lg !bg-none !bg-[#f97316] !text-white" hideGlow />
  </main>;
}

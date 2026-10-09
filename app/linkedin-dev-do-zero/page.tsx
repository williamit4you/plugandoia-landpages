import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileCheck2,
  FileText,
  GraduationCap,
  Layers3,
  ListChecks,
  MessageSquareText,
  PencilLine,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { MetaPixelScript } from "@/components/MetaPixelScript";
import { SalesPageTracker, SalesViewContentTracker } from "@/components/SalesPageTracker";
import { resolveSalesPageMetaPixelId } from "@/lib/salesPagePixel";
import { CheckoutCta } from "./CheckoutCta";

const PAGE_KEY = "linkedin-dev-do-zero";
const PAGE_PATH = "/linkedin-dev-do-zero";
const PAGE_TITLE = "LinkedIn Dev do Zero: Guia e Modelos | Plugando IA";
const PRICE = 19.9;
const DESCRIPTION = "Organize seu LinkedIn mesmo sem experiência em TI. Guia prático, 15 modelos editáveis, checklist, plano de 7 dias e prompts de IA por R$ 19,90.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://plugandoia.cloud/linkedin-dev-do-zero" },
  openGraph: {
    title: PAGE_TITLE,
    description: DESCRIPTION,
    url: "https://plugandoia.cloud/linkedin-dev-do-zero",
    siteName: "Plugando IA",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const heroBenefits = [
  "Guia prático com 8 capítulos",
  "15 modelos profissionais editáveis",
  "Checklist com 30 verificações",
  "Plano de ação de 7 dias",
  "Bônus com 5 prompts de IA",
];

const materials = [
  {
    number: "01",
    eyebrow: "Guia principal",
    title: "LinkedIn Dev do Zero",
    meta: "8 capítulos • 20 páginas",
    description: "Um caminho objetivo para organizar posicionamento, perfil, projetos, conexões e publicações.",
    items: ["Foto, capa e headline", "Seção Sobre", "Formação e habilidades", "Projetos e revisão final"],
    format: "PDF + DOCX",
    icon: BookOpen,
    accent: "from-blue-600 to-cyan-400",
  },
  {
    number: "02",
    eyebrow: "Biblioteca",
    title: "15 modelos editáveis",
    meta: "Textos para adaptar",
    description: "Estruturas profissionais para você partir de uma base clara sem copiar frases genéricas.",
    items: ["Headlines e Sobre", "Formação e experiências", "Projetos", "Mensagens e posts"],
    format: "PDF + DOCX",
    icon: Layers3,
    accent: "from-cyan-500 to-sky-300",
  },
  {
    number: "03",
    eyebrow: "Checklist",
    title: "30 verificações",
    meta: "Revisão do perfil",
    description: "Uma lista prática para encontrar pendências e conferir se as informações fazem sentido juntas.",
    items: ["Posicionamento", "Informações profissionais", "Projetos e evidências", "Links e pendências"],
    format: "PDF + DOCX",
    icon: ClipboardCheck,
    accent: "from-sky-600 to-blue-400",
  },
  {
    number: "04",
    eyebrow: "Plano de ação",
    title: "Organize em 7 sessões",
    meta: "Aplicação progressiva",
    description: "Um roteiro simples para aplicar o conteúdo aos poucos e respeitar o seu próprio ritmo.",
    items: ["Mapeie sua trajetória", "Escreva sua base", "Apresente evidências", "Revise o conjunto"],
    format: "PDF + DOCX",
    icon: ListChecks,
    accent: "from-indigo-600 to-blue-400",
  },
  {
    number: "05",
    eyebrow: "Bônus",
    title: "5 prompts de IA",
    meta: "Clareza e consistência",
    description: "Prompts para revisar seus textos sem transformar a IA em autora de experiências que você não viveu.",
    items: ["Headline", "Seção Sobre", "Projetos", "Consistência textual"],
    format: "PDF + DOCX",
    icon: BrainCircuit,
    accent: "from-violet-600 to-cyan-400",
  },
] as const;

const faq = [
  ["Preciso ter experiência como programador?", "Não. O material foi criado especialmente para pessoas que estão começando ou migrando para tecnologia."],
  ["Preciso ter GitHub ou portfólio?", "Não obrigatoriamente. O guia também explica como identificar o que você já pode apresentar e o que ainda precisa construir."],
  ["O produto inclui videoaulas?", "Não. Trata-se de um kit digital composto por documentos PDF e DOCX."],
  ["Posso editar os textos?", "Sim. Os arquivos DOCX permitem adaptar modelos e exercícios."],
  ["Preciso ter LinkedIn Premium?", "O conteúdo principal não depende de uma assinatura Premium."],
  ["O kit garante uma oportunidade de emprego?", "Não. Ele ensina a melhorar a apresentação de informações profissionais reais."],
  ["Como receberei os arquivos?", "Os arquivos serão disponibilizados digitalmente pela plataforma de venda, conforme as condições informadas no checkout."],
  ["Posso fazer tudo no meu ritmo?", "Sim. O plano de sete sessões é uma sugestão de organização."],
  ["Como funciona o reembolso?", "As condições serão apresentadas no checkout, respeitando os direitos legais aplicáveis."],
] as const;

function SectionHeading({ eyebrow, title, text, light = false, center = false }: { eyebrow: string; title: string; text?: string; light?: boolean; center?: boolean }) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      <p className={`text-xs font-black uppercase tracking-[.22em] ${light ? "text-cyan-300" : "text-blue-700"}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-.045em] sm:text-4xl md:text-5xl ${light ? "text-white" : "text-slate-950"}`}>{title}</h2>
      {text ? <p className={`mt-5 text-lg leading-8 ${light ? "text-slate-300" : "text-slate-600"}`}>{text}</p> : null}
    </div>
  );
}

function BrandMark() {
  return <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-700/20"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>;
}

function ProductPreview() {
  return (
    <div className="relative mx-auto min-h-[430px] w-full max-w-[520px]" aria-label="Prévia ilustrativa dos documentos do kit">
      <div className="absolute inset-x-10 bottom-6 top-16 rotate-6 rounded-[2rem] bg-cyan-300/35 blur-3xl" />
      <div className="absolute right-0 top-14 w-[49%] rotate-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:right-2">
        <div className="rounded-xl bg-slate-950 p-4 text-white">
          <ListChecks className="h-6 w-6 text-cyan-300" />
          <p className="mt-10 text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Checklist</p>
          <strong className="mt-2 block text-xl leading-tight">30 verificações para o seu perfil</strong>
        </div>
        <div className="mt-3 space-y-2">{["Posicionamento", "Projetos", "Informações", "Links"].map(item => <span key={item} className="flex items-center gap-2 text-xs font-bold text-slate-500"><span className="h-3 w-3 rounded border border-blue-300" />{item}</span>)}</div>
      </div>
      <div className="absolute bottom-8 left-0 z-10 w-[54%] -rotate-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl sm:left-4">
        <div className="rounded-xl bg-blue-50 p-4">
          <FileText className="h-6 w-6 text-blue-700" />
          <p className="mt-12 text-[10px] font-black uppercase tracking-[.2em] text-blue-700">Biblioteca</p>
          <strong className="mt-2 block text-xl leading-tight text-slate-950">15 modelos editáveis</strong>
          <p className="mt-2 text-xs leading-5 text-slate-500">Headline • Sobre • Projetos • Posts</p>
        </div>
      </div>
      <div className="absolute left-[18%] top-0 z-20 w-[56%] -rotate-1 overflow-hidden rounded-[1.25rem] border border-white/60 bg-slate-950 p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,.32)] sm:left-[20%]">
        <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Plugando IA</span><span className="rounded-full border border-white/15 px-2 py-1 text-[9px] text-slate-300">P011</span></div>
        <div className="my-10 h-px bg-gradient-to-r from-cyan-300 to-transparent" />
        <Code2 className="h-9 w-9 text-cyan-300" />
        <h3 className="mt-5 text-3xl font-black leading-[.96] tracking-[-.05em]">LinkedIn<br /><span className="text-cyan-300">Dev do Zero</span></h3>
        <p className="mt-5 text-xs leading-5 text-slate-300">Organize sua trajetória. Apresente o que você já construiu.</p>
        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] text-slate-400"><span>Guia prático</span><span>PDF + DOCX</span></div>
      </div>
      <p className="absolute inset-x-0 bottom-0 text-center text-[11px] font-semibold text-slate-400">Prévia visual dos materiais • arquivos digitais</p>
    </div>
  );
}

export default async function LinkedInDevDoZeroPage() {
  const checkoutUrl = process.env.NEXT_PUBLIC_P011_CHECKOUT_URL?.trim();
  const metaPixelId = await resolveSalesPageMetaPixelId(PAGE_KEY, { preferEnvFallback: true });

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950 selection:bg-cyan-200">
      <MetaPixelScript pixelId={metaPixelId || undefined} />
      <SalesPageTracker pageKey={PAGE_KEY} pagePath={PAGE_PATH} pageTitle={PAGE_TITLE} metadata={{ offerName: "LinkedIn Dev do Zero", offerPrice: PRICE, currency: "BRL" }} />
      <SalesViewContentTracker pageKey={PAGE_KEY} pagePath={PAGE_PATH} pageTitle={PAGE_TITLE} currency="BRL" value={PRICE} metadata={{ contentName: "LinkedIn Dev do Zero", contentType: "digital_product" }} />

      <div className="bg-slate-950 px-4 py-2.5 text-center text-xs font-bold text-slate-200">Kit digital prático • PDF e DOCX • aplique no seu ritmo</div>
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-2.5 text-lg font-black tracking-[-.03em]"><BrandMark />Plugando IA</div>
          <a href="#conteudo" className="text-sm font-bold text-slate-600 transition hover:text-blue-700">Ver o que está incluído <ArrowDown className="ml-1 inline h-4 w-4" /></a>
        </div>
      </header>

      <section className="relative border-b border-slate-200/80 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(34,211,238,.17),transparent_28%),radial-gradient(circle_at_5%_85%,rgba(29,78,216,.09),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.14em] text-blue-800"><WandSparkles className="h-3.5 w-3.5" /> Kit digital para quem está começando em programação</p>
            <h1 className="mt-6 text-balance text-4xl font-black leading-[1.01] tracking-[-.055em] sm:text-5xl md:text-6xl lg:text-[4.15rem]">Seu LinkedIn não precisa ficar vazio porque você ainda <span className="text-blue-700">não trabalhou como dev.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Aprenda a organizar seu perfil profissional, apresentar suas habilidades e valorizar seus projetos de programação, mesmo sem experiência na área.</p>
            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">{heroBenefits.map(item => <li key={item} className="flex gap-2.5 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />{item}</li>)}</ul>
            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end">
              <div><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Preço inicial de teste</span><strong className="mt-1 block text-4xl font-black tracking-[-.05em] text-slate-950">R$ 19,90</strong></div>
              <CheckoutCta checkoutUrl={checkoutUrl} label="Quero organizar meu LinkedIn" />
            </div>
            <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />Material digital em PDF e DOCX. Sem promessas de entrevistas ou contratação.</p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <SectionHeading eyebrow="Isso parece familiar?" title="Você sabe estudar programação. Mas sabe apresentar esse aprendizado?" text="Você conclui cursos, pratica tecnologias e desenvolve projetos, mas quando abre seu LinkedIn não sabe como apresentar essas informações profissionalmente." />
          <div className="grid gap-4">
            {["O que escrever no LinkedIn se ainda não tenho experiência profissional?", "Como apresentar projetos da faculdade ou de cursos?", "O que colocar na seção Sobre sem parecer que estou inventando experiência?"].map((item, index) => <article key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="text-xs font-black text-blue-500">0{index + 1}</span><p className="mt-3 text-lg font-black leading-7 text-slate-850">“{item}”</p></article>)}
          </div>
        </div>
        <p className="mt-10 rounded-2xl bg-blue-700 px-6 py-5 text-center text-lg font-black text-white">Você não precisa fingir ser um profissional experiente. Precisa comunicar melhor aquilo que já estudou, praticou e construiu.</p>
      </section>

      <section className="border-y border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <SectionHeading light eyebrow="Antes e depois" title="Transforme um perfil genérico em uma apresentação profissional mais clara." text="Os exemplos abaixo são fictícios e ilustrativos. A proposta é melhorar a comunicação — não prometer resultados automáticos." />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/[.04] p-6 md:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-rose-300">Antes</p><div className="mt-6 space-y-5">{[["Headline", "Apaixonado por tecnologia | Em busca de oportunidades"], ["Seção Sobre", "Sou dedicado, proativo e apaixonado por tecnologia."], ["Projetos", "Sem descrição ou contexto."]].map(([label,text]) => <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-xs font-bold text-slate-500">{label}</span><p className="mt-2 text-slate-300">{text}</p></div>)}</div></article>
            <article className="rounded-3xl border border-cyan-300/25 bg-cyan-300/[.06] p-6 md:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Depois</p><div className="mt-6 space-y-5">{[["Headline", "Estudante de ADS | Projetos com JavaScript e React | Foco em frontend"], ["Seção Sobre", "Uma apresentação objetiva com formação, estudos, tecnologias praticadas e objetivo profissional."], ["Projetos", "Descrições com problema, funcionalidades, tecnologias e participação real."]].map(([label,text]) => <div key={label} className="rounded-2xl border border-cyan-300/15 bg-white/[.06] p-4"><span className="text-xs font-bold text-cyan-300">{label}</span><p className="mt-2 text-slate-200">{text}</p></div>)}</div></article>
          </div>
        </div>
      </section>

      <section id="conteudo" className="scroll-mt-8 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="O kit completo" title="Tudo o que você precisa para começar a organizar seu LinkedIn." text="Cinco materiais complementares para você entender, escrever, aplicar e revisar." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {materials.map(({ number, eyebrow, title, meta, description, items, format, icon: Icon, accent }, index) => <article key={number} className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${index < 2 ? "lg:col-span-3" : "lg:col-span-2"}`}>
            <div className={`relative h-44 bg-gradient-to-br ${accent} p-6 text-white`}><div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] bg-[size:24px_24px]" /><Icon className="relative h-8 w-8" /><span className="relative mt-12 block text-xs font-black uppercase tracking-[.2em]">Material {number}</span><strong className="relative mt-2 block text-2xl leading-tight">{title}</strong></div>
            <div className="p-6"><p className="text-xs font-black uppercase tracking-[.16em] text-blue-700">{eyebrow}</p><p className="mt-2 font-bold text-slate-950">{meta}</p><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p><ul className="mt-5 space-y-2">{items.map(item => <li key={item} className="flex gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />{item}</li>)}</ul><span className="mt-6 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{format}</span></div>
          </article>)}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <SectionHeading eyebrow="Como funciona" title="Um método simples para sair da teoria e aplicar no seu perfil." />
          <ol className="mt-12 grid gap-5 lg:grid-cols-4">{[[Target,"Identifique seu momento profissional","Organize seus estudos, experiências e projetos reais."],[PencilLine,"Escreva sua apresentação","Use os modelos para criar headline e seção Sobre."],[BriefcaseBusiness,"Apresente suas evidências","Descreva projetos, habilidades e formação com objetividade."],[RefreshCw,"Revise e acompanhe","Aplique o checklist e execute seu plano de ação."]].map(([Icon,title,text], index) => { const StepIcon = Icon as typeof Target; return <li key={String(title)} className="relative rounded-3xl border border-slate-200 bg-slate-50 p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-700 text-white"><StepIcon className="h-5 w-5" /></span><span className="mt-8 block text-xs font-black text-blue-500">0{index + 1}</span><h3 className="mt-2 text-xl font-black">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{String(text)}</p>{index < 3 ? <ArrowRight className="absolute -right-3.5 top-1/2 z-10 hidden h-7 w-7 rounded-full bg-white p-1 text-blue-700 shadow lg:block" /> : null}</li>;})}</ol>
          <div className="mt-10 flex justify-center"><CheckoutCta checkoutUrl={checkoutUrl} label="Quero começar a organizar" className="text-center" /></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2">
        <div><SectionHeading eyebrow="Para quem é" title="O LinkedIn Dev do Zero foi criado para você que..." /><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Está começando a estudar programação", "Busca sua primeira oportunidade na área", "Está migrando de carreira para tecnologia", "Desenvolve projetos pessoais ou acadêmicos", "Já atua como júnior, mas tem um perfil desorganizado", "Quer apresentar melhor suas habilidades"].map(item => <p key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold"><CheckCircle2 className="h-5 w-5 shrink-0 text-blue-700" />{item}</p>)}</div></div>
        <aside className="rounded-3xl bg-slate-950 p-7 text-white md:p-9"><UserRound className="h-8 w-8 text-cyan-300" /><p className="mt-8 text-xs font-black uppercase tracking-[.2em] text-cyan-300">Transparência</p><h3 className="mt-3 text-3xl font-black tracking-tight">O que este produto não é</h3><p className="mt-5 leading-7 text-slate-300">Não é consultoria individual, revisão personalizada feita por recrutadores ou garantia de emprego.</p><p className="mt-4 rounded-xl border border-white/10 bg-white/[.05] p-4 font-bold text-slate-200">O kit não inclui aulas gravadas.</p></aside>
      </section>

      <section className="bg-blue-50/70">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><SectionHeading center eyebrow="Resultados práticos" title="O que você poderá colocar em prática" /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[[MessageSquareText,"Desenvolver uma headline mais clara"],[FileText,"Escrever uma apresentação profissional coerente"],[Code2,"Descrever projetos pessoais e acadêmicos"],[GraduationCap,"Organizar formação e habilidades"],[FileCheck2,"Revisar informações e links importantes"],[RefreshCw,"Manter uma rotina simples de atualização"]].map(([Icon,title], index) => { const BenefitIcon = Icon as typeof Code2; return <article key={String(title)} className="rounded-2xl border border-blue-100 bg-white p-6"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-700"><BenefitIcon className="h-5 w-5" /></span><span className="text-xs font-black text-blue-300">0{index + 1}</span></div><h3 className="mt-6 text-lg font-black leading-7">{String(title)}</h3></article>;})}</div></div>
      </section>

      <section id="oferta" className="relative scroll-mt-8 bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_25%,rgba(34,211,238,.2),transparent_30%),radial-gradient(circle_at_15%_80%,rgba(29,78,216,.3),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_.75fr] lg:items-center">
          <div><SectionHeading light eyebrow="Oferta inicial" title="Comece a organizar sua presença profissional em tecnologia." text="Receba um kit prático para apresentar seus estudos, experiências e projetos de forma mais clara e organizada." /><ul className="mt-8 grid gap-3 sm:grid-cols-2">{["Guia completo", "15 modelos editáveis", "Checklist de 30 itens", "Plano de 7 dias", "5 prompts de IA", "Arquivos PDF e DOCX", "Instruções de utilização"].map(item => <li key={item} className="flex gap-2 text-sm font-semibold text-slate-300"><CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-300" />{item}</li>)}</ul></div>
          <aside className="rounded-3xl border border-white/15 bg-white/[.07] p-7 shadow-2xl backdrop-blur md:p-8"><span className="text-sm text-slate-400">Kit digital completo</span><strong className="mt-2 block text-5xl font-black tracking-[-.055em]">R$ 19,90</strong><span className="mt-2 block text-sm text-slate-400">preço inicial de teste</span><CheckoutCta checkoutUrl={checkoutUrl} label="Quero meu kit LinkedIn Dev do Zero" className="mt-7 [&_button]:w-full [&_a]:w-full [&_p]:text-center [&_p]:text-slate-400" /><p className="mt-5 text-center text-xs leading-5 text-slate-500">Material digital. As condições de entrega e reembolso serão exibidas no checkout.</p></aside>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-24">
        <SectionHeading eyebrow="Perguntas frequentes" title="Respostas diretas antes de começar." text="Sem promessas irreais e sem depender de uma assinatura Premium." />
        <div className="mt-10 space-y-3">{faq.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-md"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-black text-slate-900"><span>{question}</span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-3xl pr-10 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div>
      </section>

      <section className="border-t border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center md:px-8 md:py-24"><Rocket className="mx-auto h-10 w-10 text-blue-700" /><h2 className="mt-6 text-balance text-4xl font-black tracking-[-.045em] md:text-5xl">Você já tem uma trajetória para apresentar. Comece pelo que é real.</h2><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">Organize seus estudos, experiências e projetos com mais clareza usando materiais práticos e editáveis.</p><strong className="mt-8 block text-3xl font-black text-blue-800">R$ 19,90</strong><div className="mt-6 flex justify-center"><CheckoutCta checkoutUrl={checkoutUrl} label="Quero organizar meu LinkedIn — R$ 19,90" className="text-center" /></div></div>
      </section>

      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-8"><div className="flex items-center gap-2 font-black text-slate-900"><BrandMark />Plugando IA</div><p>Conteúdo educacional. Resultados profissionais dependem de diversos fatores.</p><Link href="/cursos" className="font-bold transition hover:text-blue-700">Conheça os cursos</Link></div></footer>
    </main>
  );
}

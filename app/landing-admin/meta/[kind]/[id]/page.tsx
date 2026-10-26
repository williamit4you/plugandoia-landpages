import Link from "next/link";
import { notFound } from "next/navigation";
import { getMetaReport } from "@/lib/metaReport";
import { diagnoseCampaign } from "@/lib/metaDiagnostics";
export const dynamic = "force-dynamic";
const integer = new Intl.NumberFormat("pt-BR");
export default async function MetaDetail({ params, searchParams }: { params:{kind:string;id:string}; searchParams:{days?:string} }) {
  if (!["campaign","adset","ad"].includes(params.kind) || !/^\d+$/.test(params.id)) notFound();
  const days = [1,7,30,90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const report = await getMetaReport(days);
  const rows = params.kind === "campaign" ? report.campaigns : params.kind === "adset" ? report.adsets : report.ads;
  const item = rows.find((row:any) => row.id === params.id);
  if (!item) notFound();
  const money = (value: number | null) => value == null ? "Não disponível" : new Intl.NumberFormat("pt-BR",{style:"currency",currency:report.account?.currency||"BRL"}).format(value);
  const number = (value: number | null) => value == null ? "Não disponível" : integer.format(value);
  const children = params.kind === "campaign" ? report.adsets.filter((row:any)=>row.campaign_id===item.id) : params.kind === "adset" ? report.ads.filter((row:any)=>row.adset_id===item.id) : [];
  return <main className="meta-page"><div className="meta-container"><header className="meta-header"><Link href={`/landing-admin/meta?days=${days}&mode=completo`} className="meta-back">← Meta Ads</Link><span className="meta-eyebrow">{params.kind === "campaign" ? "Campanha" : params.kind === "adset" ? "Conjunto" : "Anúncio"}</span><h1>{item.name}</h1><p>ID {item.id} · {item.effective_status || item.status || "Status não disponível"}</p></header>
    <div className="meta-trust">Fonte: Meta Marketing API · {report.period.since} a {report.period.until} · Moeda: {report.account?.currency || "BRL"} · Fuso: {report.account?.timezone_name || "não informado"}</div>
    <section className="meta-cards">
      <article className="meta-card"><p>Investimento</p><strong>{money(item.spend)}</strong><small>Gasto real no período</small></article>
      <article className="meta-card"><p>Impressões</p><strong>{number(item.impressions)}</strong><small>Exibições, não pessoas únicas</small></article>
      <article className="meta-card"><p>Cliques no link</p><strong>{number(item.link_clicks)}</strong><small>Meta Marketing API</small></article>
      {params.kind === "campaign" && <article className="meta-card"><p>Visitas atribuídas</p><strong>{item.site ? number(item.site.sessions) : "Não atribuído"}</strong><small>ID exato no utm_campaign</small></article>}
      {params.kind === "campaign" && <article className="meta-card"><p>Vendas atribuídas</p><strong>{item.sales ? number(item.sales.sales) : "Não atribuído"}</strong><small>SRC Hotmart + sessão + ID da campanha</small></article>}
      {params.kind === "campaign" && <article className="meta-card"><p>Resultado após anúncios</p><strong>{item.result == null ? "Não disponível" : money(item.result)}</strong><small>Comissão atribuída menos gasto; não é lucro contábil</small></article>}
    </section>
    {params.kind === "ad" && <section className="meta-panel"><h2>Criativo</h2>{item.thumbnail_url ? <img src={item.thumbnail_url} alt={`Prévia do anúncio ${item.name}`} className="meta-thumb"/> : <p>Prévia não disponibilizada pela API.</p>}<p>Identificador do criativo: {item.creative_id || "não disponível"}</p></section>}
    {params.kind === "campaign" && <section className="meta-panel"><h2>Leitura dos resultados</h2><div className="meta-diagnostics">{diagnoseCampaign(item,report.totals.linkCtr).map((diagnostic,index)=><article className={`meta-diagnostic ${diagnostic.tone}`} key={index}><strong>{diagnostic.title}</strong><p>{diagnostic.evidence}</p><small>{diagnostic.action}</small></article>)}</div></section>}
    {children.length > 0 && <section className="meta-panel"><h2>{params.kind === "campaign" ? "Conjuntos desta campanha" : "Anúncios deste conjunto"}</h2><ul>{children.map((child:any)=><li key={child.id}><Link href={`/landing-admin/meta/${params.kind === "campaign" ? "adset" : "ad"}/${child.id}?days=${days}`}>{child.name}</Link><span>{money(child.spend)}</span></li>)}</ul></section>}
    <section className="meta-panel"><h2>Limites da leitura</h2><p>Dados do site e da Hotmart só aparecem quando há um identificador de campanha correspondente. Sem essa evidência, compras não são atribuídas ao anúncio ou conjunto.</p></section>
  </div></main>;
}

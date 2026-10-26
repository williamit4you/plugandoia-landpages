import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, CircleDollarSign, Info, MousePointerClick, Users } from "lucide-react";
import { MetaModeSelector, type MetaMode } from "@/components/analytics/MetaModeSelector";
import { getMetaReport } from "@/lib/metaReport";

export const dynamic = "force-dynamic";
const integer = new Intl.NumberFormat("pt-BR");
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
function money(value: number | null, currency: string) { return value === null ? "Não disponível" : new Intl.NumberFormat("pt-BR",{style:"currency",currency}).format(value); }
function number(value: number | null) { return value === null ? "Não disponível" : integer.format(value); }
function Metric({ label, value, help, Icon }: { label:string; value:string; help:string; Icon:any }) { return <article className="meta-card"><Icon size={19}/><p>{label}</p><strong>{value}</strong><small title={help}>{help}</small></article>; }
export default async function MetaAdsPage({ searchParams }: { searchParams:{ days?:string; mode?:string } }) {
  const days = [1,7,30,90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const mode: MetaMode = searchParams.mode === "completo" || searchParams.mode === "intermediario" ? searchParams.mode : "simples";
  let report: Awaited<ReturnType<typeof getMetaReport>> | null = null;
  let error: string | null = null;
  try { report = await getMetaReport(days); } catch { error = "A base da Meta Ads ainda não está disponível. Confira a migração e a sincronização nas instruções de implantação."; }
  const currency = report?.account?.currency || "BRL";
  const totals = report?.totals;
  const spend = totals?.spend == null ? null : Number(totals.spend);
  const impressions = totals?.impressions == null ? null : Number(totals.impressions);
  const clicks = totals?.link_clicks == null ? null : Number(totals.link_clicks);
  const outbound = totals?.outbound_clicks == null ? null : Number(totals.outbound_clicks);
  const campaignCount = report?.campaigns.length || 0;
  return <main className="meta-page"><div className="meta-container"><header className="meta-header"><Link href="/landing-admin" className="meta-back"><ArrowLeft size={17}/> Analytics</Link><div className="meta-header-row"><div><span className="meta-eyebrow">Plugando IA Analytics Pro</span><h1>Meta Ads</h1><p>Entenda o investimento e os resultados da conta de anúncios.</p></div><MetaModeSelector days={days} mode={mode}/></div></header>
    <form className="meta-toolbar"><input type="hidden" name="mode" value={mode}/><label>Período <select name="days" defaultValue={days}><option value="1">Hoje</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></label><button>Aplicar</button><span>Conta: {report?.account?.name || "Aguardando sincronização"}</span></form>
    {error ? <div className="meta-message">{error}</div> : !report?.account ? <div className="meta-message">Nenhuma conta sincronizada ainda. O painel será preenchido após a primeira sincronização.</div> : <>
      <div className="meta-trust"><Info size={16}/><span>Fonte: Meta Marketing API · {report.period.since} a {report.period.until} · Moeda: {currency} · Fuso da conta: {report.account.timezone_name || "não informado"} · Última sincronização: {report.sync?.finished_at ? new Date(report.sync.finished_at).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"}) : "pendente"}{report.sync?.status === "FAILED" ? " · Última tentativa falhou" : ""}</span></div>
      <section className="meta-cards">
        <Metric label="Quanto investi" value={money(spend,currency)} help="Valor efetivamente gasto na Meta no período." Icon={CircleDollarSign}/>
        <Metric label="Exibições dos anúncios" value={number(impressions)} help="Impressões: cada exibição conta, inclusive repetições para a mesma pessoa." Icon={Users}/>
        <Metric label="Cliques no link" value={number(clicks)} help="Cliques em links dos anúncios, reportados pela Meta." Icon={MousePointerClick}/>
        <Metric label="Cliques de saída" value={number(outbound)} help="Cliques que saíram das plataformas da Meta; podem diferir das visitas ao site." Icon={ArrowRight}/>
      </section>
      <div className="meta-source-label">Medição do site · todas as origens</div>
      <section className="meta-cards">
        <Metric label="Sessões no site" value={number(report.siteTotal?.sessions ?? null)} help="Sessões registradas pelo próprio site; incluem tráfego de outras origens." Icon={Users}/>
        <Metric label="Acessos ao checkout" value={number(report.siteTotal?.checkouts ?? null)} help="Eventos de início de checkout medidos pelo site." Icon={MousePointerClick}/>
      </section>
      <div className="meta-source-label">Hotmart · todas as origens</div>
      <section className="meta-cards">
        <Metric label="Compras aprovadas" value={number(report.hotmartTotal?.sales ?? null)} help="Transações aprovadas ou concluídas, consolidadas por identificador." Icon={Users}/>
        <Metric label="Comissões" value={money(report.hotmartTotal?.commission ?? null,currency)} help="Soma das comissões informadas pela Hotmart; pode haver comissão ausente no webhook." Icon={CircleDollarSign}/>
      </section>
      {mode !== "simples" && <section className="meta-cards">
        <Metric label="CTR no link" value={totals?.linkCtr == null ? "Não disponível" : `${decimal.format(Number(totals.linkCtr)*100)}%`} help="Cliques no link divididos por impressões." Icon={BarChart3}/>
        <Metric label="Custo por clique no link" value={money(totals?.linkCpc == null ? null : Number(totals.linkCpc),currency)} help="Gasto dividido pelos cliques no link." Icon={CircleDollarSign}/>
        <Metric label="Campanhas" value={number(campaignCount)} help="Campanhas importadas desta conta." Icon={BarChart3}/>
      </section>}
      {mode === "simples" && <section className="meta-panel"><h2>O que esses números dizem</h2><p>O gasto, as exibições e os cliques vêm da Meta. As visitas ao site e as compras são medidas separadamente. Só ligamos uma venda a uma campanha quando há um identificador que permite conferir a relação.</p></section>}
      <section className="meta-panel">
        <div className="meta-panel-head"><div><span>Campanhas</span><h2>Desempenho por campanha</h2></div><small>IDs preservados para atribuição verificável</small></div>
        <div className="meta-table-wrap"><table>
          <thead><tr><th>Campanha</th><th>Status</th><th>Investimento</th><th>Impressões</th><th>Cliques no link</th><th>CTR no link</th><th>CPC no link</th><th>Visitas atribuídas</th><th>Vendas atribuídas</th><th>Comissão atribuída</th></tr></thead>
          <tbody>{report.campaigns.length ? report.campaigns.map((row:any) => <tr key={row.id}>
            <td><Link href={`/landing-admin/meta/campaign/${row.id}?days=${days}`}>{row.name}</Link><small>ID {row.id}</small></td>
            <td>{row.effective_status || row.status || "—"}</td>
            <td>{money(row.spend == null ? null : Number(row.spend),currency)}</td>
            <td>{number(row.impressions)}</td><td>{number(row.link_clicks)}</td>
            <td>{row.linkCtr == null ? "—" : `${decimal.format(row.linkCtr*100)}%`}</td>
            <td>{money(row.linkCpc,currency)}</td>
            <td>{row.site ? number(row.site.sessions) : "Não atribuído"}</td>
            <td>{row.sales ? number(row.sales.sales) : "Não atribuído"}</td>
            <td>{row.sales ? money(row.sales.commission,currency) : "Não atribuído"}</td>
          </tr>) : <tr><td colSpan={10}>Nenhuma campanha importada para esta conta.</td></tr>}</tbody>
        </table></div>
      </section>
      {mode === "completo" && <div className="meta-two"><section className="meta-panel"><h2>Conjuntos de anúncios</h2><ul>{report.adsets.slice(0,20).map((row:any)=><li key={row.id}><Link href={`/landing-admin/meta/adset/${row.id}?days=${days}`}>{row.name}</Link><span>{money(row.spend == null ? null : Number(row.spend),currency)}</span></li>)}</ul></section><section className="meta-panel"><h2>Anúncios e criativos</h2><ul>{report.ads.slice(0,20).map((row:any)=><li key={row.id}><Link href={`/landing-admin/meta/ad/${row.id}?days=${days}`}>{row.name}</Link><span>{money(row.spend == null ? null : Number(row.spend),currency)}</span></li>)}</ul></section></div>}
      {mode === "completo" && <section className="meta-panel"><h2>Públicos e posicionamentos disponíveis</h2><p>Totais por segmentos agregados da Meta. Cada tipo de recorte é independente; não some linhas de recortes diferentes.</p><div className="meta-table-wrap"><table><thead><tr><th>Recorte</th><th>Segmento</th><th>Investimento</th><th>Impressões</th><th>Cliques no link</th></tr></thead><tbody>{report.breakdowns.length ? report.breakdowns.map((row:any,index:number)=><tr key={index}><td>{row.breakdown_key}</td><td>{Object.values(row.breakdown || {}).join(" · ")}</td><td>{money(row.spend,currency)}</td><td>{number(row.impressions)}</td><td>{number(row.link_clicks)}</td></tr>) : <tr><td colSpan={5}>Nenhum recorte disponível ou autorizado para esta conta.</td></tr>}</tbody></table></div></section>}
      {mode === "completo" && <section className="meta-panel"><h2>Resultado atribuível por campanha</h2><p>As vendas abaixo têm sessão e ID exato da campanha. Resultados sem esse vínculo permanecem sem atribuição.</p><div className="meta-table-wrap"><table><thead><tr><th>Campanha</th><th>Gasto</th><th>Vendas</th><th>Receita atribuída</th><th>Comissão atribuída</th><th>ROAS bruto</th><th>Resultado após anúncios</th></tr></thead><tbody>{report.campaigns.map((row:any)=><tr key={row.id}><td>{row.name}</td><td>{money(row.spend,currency)}</td><td>{row.sales ? number(row.sales.sales) : "Não atribuído"}</td><td>{row.sales ? money(row.sales.revenue,currency) : "Não atribuído"}</td><td>{row.sales ? money(row.sales.commission,currency) : "Não atribuído"}</td><td>{row.roas == null ? "—" : `${decimal.format(row.roas)}×`}</td><td>{money(row.result,currency)}</td></tr>)}</tbody></table></div></section>}
      <section className="meta-panel"><h2>Como interpretar</h2><p><strong>CTR no link:</strong> percentual de exibições que geraram clique no link. <strong>CPC no link:</strong> gasto dividido por cliques no link. <strong>Visitas atribuídas:</strong> sessões com campaign_id ou utm_campaign igual ao ID da campanha. <strong>Vendas atribuídas:</strong> transações Hotmart com SRC ligado à sessão identificada.</p><p>Impressões não são pessoas únicas. Alcance diário não é somado entre dias. Vendas reportadas pela Meta podem divergir das transações confirmadas pela Hotmart.</p></section>
    </>}</div></main>;
}

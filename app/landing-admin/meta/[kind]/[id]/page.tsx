import Link from "next/link";
import { notFound } from "next/navigation";
import { getMetaReport } from "@/lib/metaReport";
import { diagnoseCampaign } from "@/lib/metaDiagnostics";

export const dynamic = "force-dynamic";

const integer = new Intl.NumberFormat("pt-BR");
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export default async function MetaDetail({
  params,
  searchParams,
}: {
  params: { kind: string; id: string };
  searchParams: { days?: string };
}) {
  if (!["campaign", "adset", "ad"].includes(params.kind) || !/^\d+$/.test(params.id)) notFound();
  const days = [1, 7, 14, 30, 60, 90, 180].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const report = await getMetaReport(days);
  const rows =
    params.kind === "campaign" ? report.campaigns : params.kind === "adset" ? report.adsets : report.ads;
  const item: any = rows.find((row: any) => String(row.id) === params.id);
  if (!item) notFound();

  const currency = report.account?.currency || "BRL";
  const money = (value: number | null | undefined) =>
    value == null || !Number.isFinite(Number(value))
      ? "Não disponível"
      : new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number(value));
  const number = (value: number | null | undefined) =>
    value == null || !Number.isFinite(Number(value)) ? "Não disponível" : integer.format(Number(value));

  const children =
    params.kind === "campaign"
      ? report.adsets.filter((row: any) => String(row.campaign_id) === String(item.id))
      : params.kind === "adset"
        ? report.ads.filter((row: any) => String(row.adset_id) === String(item.id))
        : [];

  const campaignAds =
    params.kind === "campaign"
      ? report.ads.filter((row: any) => String(row.campaign_id) === String(item.id))
      : [];

  const itemDaily = (report.allDaily || []).filter(
    (d: any) => d.level === params.kind && String(d.object_id) === String(item.id),
  );

  const diagnostics = diagnoseCampaign(item, report.totals.linkCtr);

  return (
    <main className="meta-page">
      <div className="meta-container">
        <header className="meta-header">
          <div style={{ display: "flex", gap: 16 }}>
            <Link href={`/landing-admin?days=${days}&tab=campaigns`} className="meta-back">
              ← Analytics Central
            </Link>
            <Link href={`/landing-admin/meta?days=${days}&mode=completo`} className="meta-back">
              ← Meta Ads
            </Link>
          </div>
          <span className="meta-eyebrow">
            {params.kind === "campaign"
              ? "Análise Individual de Campanha"
              : params.kind === "adset"
                ? "Análise Individual do Conjunto"
                : "Análise Detalhada do Anúncio / Criativo"}
          </span>
          <h1>{item.name}</h1>
          <p>
            ID {item.id} · Status: {item.effective_status || item.status || "Não informado"}
            {item.objective ? ` · Objetivo: ${item.objective}` : ""}
            {item.optimization_goal ? ` · Otimização: ${item.optimization_goal}` : ""}
          </p>
        </header>

        <div className="meta-trust">
          Fonte: Meta Marketing API · {report.period.since} a {report.period.until} · Moeda: {currency} · Fuso:{" "}
          {report.account?.timezone_name || "não informado"} · Modo 100% Somente Leitura
        </div>

        <section className="meta-cards">
          <article className="meta-card">
            <p>Orçamento configurado</p>
            <strong>
              {item.daily_budget
                ? `${money(item.daily_budget)}/dia`
                : item.lifetime_budget
                  ? `${money(item.lifetime_budget)} total`
                  : "Definido em outro nível"}
            </strong>
            <small>Não confundir orçamento configurado com valor efetivamente gasto</small>
          </article>
          <article className="meta-card">
            <p>Gasto real (Spend)</p>
            <strong>{money(item.spend)}</strong>
            <small>Investimento realizado no período</small>
          </article>
          <article className="meta-card">
            <p>Impressões e Alcance máx. diário</p>
            <strong>{number(item.impressions)}</strong>
            <small>
              Alcance máx. diário: {number(item.max_daily_reach)} · Freq. média:{" "}
              {item.avg_frequency ? decimal.format(item.avg_frequency) : "—"}
            </small>
          </article>
          <article className="meta-card">
            <p>Cliques no link e Saída</p>
            <strong>{number(item.link_clicks)}</strong>
            <small>Cliques de saída: {number(item.outbound_clicks)}</small>
          </article>
          <article className="meta-card">
            <p>CTR no link · CPC no link · CPM</p>
            <strong>{item.linkCtr == null ? "—" : `${decimal.format(item.linkCtr * 100)}%`}</strong>
            <small>
              CPC: {money(item.linkCpc)} · CPM: {money(item.cpm)}
            </small>
          </article>
          <article className="meta-card">
            <p>Visitas e Checkouts atribuídos</p>
            <strong>{item.site ? number(item.site.sessions) : "0"} sessões</strong>
            <small>Checkouts atribuídos: {item.site ? number(item.site.checkouts) : "0"}</small>
          </article>
          <article className="meta-card">
            <p>Vendas e Comissão atribuídas</p>
            <strong>{item.sales ? number(item.sales.sales) : "0"} venda(s)</strong>
            <small>Comissão: {item.sales ? money(item.sales.commission) : "Não atribuído"}</small>
          </article>
          <article className="meta-card">
            <p>Resultado após anúncios</p>
            <strong>{item.result == null ? "Não disponível" : money(item.result)}</strong>
            <small>
              ROAS Bruto: {item.roasGross ? `${decimal.format(item.roasGross)}×` : "—"} · ROAS Comissão:{" "}
              {item.roasCommission ? `${decimal.format(item.roasCommission)}×` : "—"}
            </small>
          </article>
        </section>

        {params.kind === "ad" && (
          <section className="meta-panel">
            <h2>Detalhes do Criativo e Retenção de Vídeo</h2>
            <div style={{ padding: 20, display: "grid", gap: 12 }}>
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={`Prévia do anúncio ${item.name}`}
                  className="meta-thumb"
                  style={{ margin: 0 }}
                />
              ) : (
                <p style={{ padding: 0 }}>Prévia visual não disponibilizada pela API para este criativo.</p>
              )}
              <div>
                <strong>ID do criativo:</strong> {item.creative_id || "não disponível"} · <strong>Tipo:</strong>{" "}
                {item.mediaType || "—"}
              </div>
              {item.creativeTitle && (
                <div>
                  <strong>Título do criativo:</strong> {item.creativeTitle}
                </div>
              )}
              {item.creativeBody && (
                <div>
                  <strong>Texto principal:</strong> {item.creativeBody}
                </div>
              )}
              {item.destination_url && (
                <div>
                  <strong>URL de destino:</strong> <code>{item.destination_url}</code>
                </div>
              )}
              {item.extras && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <div>
                    <strong>Engajamento:</strong> Reações: {number(item.extras.reactions)} · Comentários:{" "}
                    {number(item.extras.comments)} · Compartilhamentos: {number(item.extras.shares)}
                  </div>
                  <div>
                    <strong>Classificações Meta:</strong> Qualidade: {item.extras.qualityRanking || "—"} · Engajamento:{" "}
                    {item.extras.engagementRanking || "—"} · Conversão: {item.extras.conversionRanking || "—"}
                  </div>
                  <div>
                    <strong>Retenção de Vídeo:</strong> Plays: {number(item.extras.videoPlays)} · ThruPlay:{" "}
                    {number(item.extras.thruPlays)} · 25%: {number(item.extras.videoP25)} · 50%:{" "}
                    {number(item.extras.videoP50)} · 75%: {number(item.extras.videoP75)} · 95%:{" "}
                    {number(item.extras.videoP95)} · 100%: {number(item.extras.videoP100)}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="meta-panel">
          <h2>Diagnóstico Inteligente</h2>
          <div className="meta-diagnostics">
            {diagnostics.map((diagnostic, index) => (
              <article className={`meta-diagnostic ${diagnostic.tone}`} key={index}>
                <strong>{diagnostic.title}</strong>
                <p>{diagnostic.evidence}</p>
                {diagnostic.hypotheses && diagnostic.hypotheses.length > 0 && (
                  <p>
                    <strong>Hipóteses para investigação:</strong> {diagnostic.hypotheses.join(" · ")}
                  </p>
                )}
                <small>{diagnostic.action}</small>
              </article>
            ))}
          </div>
        </section>

        {itemDaily.length > 0 && (
          <section className="meta-panel">
            <h2>Evolução Diária ({itemDaily.length} dias com entrega)</h2>
            <div className="meta-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Gasto</th>
                    <th>Impressões</th>
                    <th>Alcance</th>
                    <th>Frequência</th>
                    <th>Cliques no Link</th>
                    <th>Cliques de Saída</th>
                  </tr>
                </thead>
                <tbody>
                  {itemDaily.map((d: any) => (
                    <tr key={d.day}>
                      <td>{d.day}</td>
                      <td>{money(d.spend)}</td>
                      <td>{number(d.impressions)}</td>
                      <td>{number(d.reach)}</td>
                      <td>{d.frequency ? decimal.format(d.frequency) : "—"}</td>
                      <td>{number(d.link_clicks)}</td>
                      <td>{number(d.outbound_clicks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {children.length > 0 && (
          <section className="meta-panel">
            <h2>{params.kind === "campaign" ? "Conjuntos desta campanha" : "Anúncios deste conjunto"}</h2>
            <ul>
              {children.map((child: any) => (
                <li key={child.id}>
                  <Link href={`/landing-admin/meta/${params.kind === "campaign" ? "adset" : "ad"}/${child.id}?days=${days}`}>
                    {child.name}
                  </Link>
                  <span>
                    Gasto: {money(child.spend)} · Cliques: {number(child.link_clicks)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {campaignAds.length > 0 && (
          <section className="meta-panel">
            <h2>Anúncios pertencentes a esta campanha ({campaignAds.length})</h2>
            <ul>
              {campaignAds.map((ad: any) => (
                <li key={ad.id}>
                  <Link href={`/landing-admin/meta/ad/${ad.id}?days=${days}`}>{ad.name}</Link>
                  <span>
                    Gasto: {money(ad.spend)} · CTR:{" "}
                    {ad.linkCtr != null ? `${decimal.format(ad.linkCtr * 100)}%` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="meta-panel">
          <h2>Limites da leitura e Segurança</h2>
          <p>
            Dados do site e da Hotmart só são vinculados quando há um identificador de campanha, conjunto ou anúncio
            correspondente. Esta aplicação opera em modo 100% somente leitura na Meta Ads.
          </p>
        </section>
      </div>
    </main>
  );
}

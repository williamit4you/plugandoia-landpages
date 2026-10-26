import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  CircleDollarSign,
  Download,
  Info,
  MousePointerClick,
  Users,
} from "lucide-react";
import { MetaModeSelector, type MetaMode } from "@/components/analytics/MetaModeSelector";
import { MetaSyncTrigger } from "@/components/analytics/MetaSyncTrigger";
import { getMetaReport } from "@/lib/metaReport";

export const dynamic = "force-dynamic";

const integer = new Intl.NumberFormat("pt-BR");
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function money(value: number | null | undefined, currency: string) {
  return value === null || value === undefined || !Number.isFinite(Number(value))
    ? "Não disponível"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number(value));
}

function number(value: number | null | undefined) {
  return value === null || value === undefined || !Number.isFinite(Number(value))
    ? "Não disponível"
    : integer.format(Number(value));
}

function Metric({ label, value, help, Icon }: { label: string; value: string; help: string; Icon: any }) {
  return (
    <article className="meta-card">
      <Icon size={19} />
      <p>{label}</p>
      <strong>{value}</strong>
      <small title={help}>{help}</small>
    </article>
  );
}

export default async function MetaAdsPage({
  searchParams,
}: {
  searchParams: { days?: string; mode?: string; since?: string; until?: string; account?: string };
}) {
  const days = [1, 7, 14, 30, 60, 90, 180].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const mode: MetaMode =
    searchParams.mode === "completo" || searchParams.mode === "intermediario" ? searchParams.mode : "simples";
  let report: Awaited<ReturnType<typeof getMetaReport>> | null = null;
  let error: string | null = null;
  try {
    report = await getMetaReport(days, searchParams.account, {
      since: searchParams.since || null,
      until: searchParams.until || null,
    });
  } catch {
    error = "Não foi possível carregar os dados da Meta Ads no momento.";
  }

  const currency = report?.account?.currency || "BRL";
  const totals = report?.totals;
  const spend = totals?.spend == null ? null : Number(totals.spend);
  const impressions = totals?.impressions == null ? null : Number(totals.impressions);
  const clicks = totals?.link_clicks == null ? null : Number(totals.link_clicks);
  const outbound = totals?.outbound_clicks == null ? null : Number(totals.outbound_clicks);
  const campaignCount = report?.campaigns.length || 0;

  return (
    <main className="meta-page">
      <div className="meta-container">
        <header className="meta-header">
          <Link href="/landing-admin" className="meta-back">
            <ArrowLeft size={17} /> Voltar ao Analytics Central
          </Link>
          <div className="meta-header-row">
            <div>
              <span className="meta-eyebrow">Plugando IA Analytics Pro · Modo 100% Somente Leitura</span>
              <h1>Central Meta Ads</h1>
              <p>Acompanhe investimento, exibições, cliques, visitas atribuídas e retorno em comissões.</p>
            </div>
            <MetaModeSelector days={days} mode={mode} />
          </div>
        </header>

        <form className="meta-toolbar">
          <input type="hidden" name="mode" value={mode} />
          <label>
            Período{" "}
            <select name="days" defaultValue={days}>
              <option value="1">Hoje</option>
              <option value="7">Últimos 7 dias</option>
              <option value="14">Últimos 14 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="60">Últimos 60 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="180">Últimos 180 dias</option>
            </select>
          </label>
          <button type="submit">Aplicar</button>
          <MetaSyncTrigger defaultDays={days} />
          <a
            href={`/landing-api/admin/meta/export-csv?days=${days}`}
            style={{
              height: 36,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #36445d",
              background: "#1a2638",
              color: "#eff6ff",
              fontSize: 12,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
            }}
          >
            <Download size={14} /> Exportar CSV
          </a>
          <span>Conta: {report?.account?.name || process.env.META_AD_ACCOUNT_ID || "Aguardando sincronização"}</span>
        </form>

        {error ? (
          <div className="meta-message">{error}</div>
        ) : !report?.account ? (
          <div className="meta-message">
            Nenhuma conta sincronizada ainda no banco. Clique no botão <strong>Sincronizar Meta Ads</strong> acima para
            importar suas campanhas e métricas em modo somente leitura.
          </div>
        ) : (
          <>
            <div className="meta-trust">
              <Info size={16} />
              <span>
                Fonte: Meta Marketing API · {report.period.since} a {report.period.until} · Moeda: {currency} · Fuso da
                conta: {report.account.timezone_name || "não informado"} · Última sincronização:{" "}
                {report.sync?.finished_at
                  ? new Date(report.sync.finished_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
                  : "pendente"}
                {report.sync?.status === "FAILED" ? ` · Última tentativa falhou (${report.sync.error_message})` : ""}
              </span>
            </div>

            <section className="meta-cards">
              <Metric
                label="Quanto investi"
                value={money(spend, currency)}
                help="Valor efetivamente gasto na Meta no período."
                Icon={CircleDollarSign}
              />
              <Metric
                label="Exibições dos anúncios"
                value={number(impressions)}
                help="Impressões: cada exibição conta, inclusive repetições para a mesma pessoa."
                Icon={Users}
              />
              <Metric
                label="Cliques no link"
                value={number(clicks)}
                help="Cliques em links dos anúncios, reportados pela Meta."
                Icon={MousePointerClick}
              />
              <Metric
                label="Cliques de saída"
                value={number(outbound)}
                help="Cliques que saíram das plataformas da Meta rumo ao site."
                Icon={ArrowRight}
              />
            </section>

            <div className="meta-source-label">Cruzamento com Site e Hotmart</div>
            <section className="meta-cards">
              <Metric
                label="Sessões no site (Atribuídas / Total)"
                value={`${number(totals?.attributedSessions ?? 0)} / ${number(report.siteTotal?.sessions ?? null)}`}
                help="Sessões vinculadas por campaign_id/UTM sobre o total de sessões do site."
                Icon={Users}
              />
              <Metric
                label="Acessos ao checkout"
                value={`${number(totals?.attributedCheckouts ?? 0)} / ${number(report.siteTotal?.checkouts ?? null)}`}
                help="Inícios de checkout atribuídos sobre o total medido pelo site."
                Icon={MousePointerClick}
              />
              <Metric
                label="Compras aprovadas (Atrib. / Total)"
                value={`${number(totals?.attributedSales ?? 0)} / ${number(report.hotmartTotal?.sales ?? null)}`}
                help="Vendas confirmadas na Hotmart (atribuídas vs total da operação)."
                Icon={Award}
              />
              <Metric
                label="Sobra após anúncios (Operação)"
                value={money(totals?.netResultOverall ?? null, currency)}
                help="Comissão total Hotmart menos investimento Meta Ads no período."
                Icon={CircleDollarSign}
              />
            </section>

            {mode !== "simples" && (
              <section className="meta-cards">
                <Metric
                  label="CTR no link"
                  value={totals?.linkCtr == null ? "Não disponível" : `${decimal.format(Number(totals.linkCtr) * 100)}%`}
                  help="Cliques no link divididos por impressões."
                  Icon={BarChart3}
                />
                <Metric
                  label="CPC no link"
                  value={money(totals?.linkCpc == null ? null : Number(totals.linkCpc), currency)}
                  help="Gasto dividido pelos cliques no link."
                  Icon={CircleDollarSign}
                />
                <Metric
                  label="CPM (Custo por 1.000 exib.)"
                  value={money(totals?.cpm == null ? null : Number(totals.cpm), currency)}
                  help="Preço médio por mil impressões no leilão."
                  Icon={BarChart3}
                />
                <Metric
                  label="ROAS sobre Comissão"
                  value={
                    totals?.roasCommissionOverall == null
                      ? "Não disponível"
                      : `${decimal.format(totals.roasCommissionOverall)}× (${campaignCount} camp.)`
                  }
                  help="Comissão líquida dividida pelo investimento em anúncios."
                  Icon={Award}
                />
              </section>
            )}

            {mode === "simples" && (
              <section className="meta-panel">
                <h2>Explicação em linguagem simples</h2>
                <p>
                  • Seus anúncios apareceram <strong>{number(impressions)} vezes</strong> e geraram{" "}
                  <strong>{number(clicks)} cliques no link</strong>, custando <strong>{money(spend, currency)}</strong>.
                </p>
                <p>
                  • O site registrou <strong>{number(report.siteTotal?.sessions ?? 0)} sessões</strong> e a Hotmart
                  confirmou <strong>{number(report.hotmartTotal?.sales ?? 0)} venda(s)</strong>, gerando{" "}
                  <strong>{money(report.hotmartTotal?.commission ?? 0, currency)} em comissões</strong>.
                </p>
              </section>
            )}

            <section className="meta-panel">
              <div className="meta-panel-head">
                <div>
                  <span>Campanhas</span>
                  <h2>Desempenho por campanha (Clique para abrir o diagnóstico individual)</h2>
                </div>
                <small>IDs preservados para atribuição verificável</small>
              </div>
              <div className="meta-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Campanha</th>
                      <th>Status</th>
                      <th>Investimento</th>
                      <th>Impressões</th>
                      <th>Cliques no link</th>
                      <th>CTR no link</th>
                      <th>CPC no link</th>
                      <th>Visitas atribuídas</th>
                      <th>Vendas atribuídas</th>
                      <th>Comissão atribuída</th>
                      <th>Resultado após anúncios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.campaigns.length ? (
                      report.campaigns.map((row: any) => (
                        <tr key={row.id}>
                          <td>
                            <Link href={`/landing-admin/meta/campaign/${row.id}?days=${days}`}>{row.name}</Link>
                            <small>ID {row.id}</small>
                          </td>
                          <td>{row.effective_status || row.status || "—"}</td>
                          <td>{money(row.spend, currency)}</td>
                          <td>{number(row.impressions)}</td>
                          <td>{number(row.link_clicks)}</td>
                          <td>{row.linkCtr == null ? "—" : `${decimal.format(row.linkCtr * 100)}%`}</td>
                          <td>{money(row.linkCpc, currency)}</td>
                          <td>{row.site ? number(row.site.sessions) : "0"}</td>
                          <td>{row.sales ? number(row.sales.sales) : "0"}</td>
                          <td>{row.sales ? money(row.sales.commission, currency) : "Não atribuído"}</td>
                          <td>{row.result != null ? money(row.result, currency) : "Não atribuído"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11}>Nenhuma campanha importada para esta conta.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {mode === "completo" && (
              <div className="meta-two">
                <section className="meta-panel">
                  <h2>Conjuntos de anúncios ({report.adsets.length})</h2>
                  <ul>
                    {report.adsets.slice(0, 30).map((row: any) => (
                      <li key={row.id}>
                        <Link href={`/landing-admin/meta/adset/${row.id}?days=${days}`}>{row.name}</Link>
                        <span>{money(row.spend, currency)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="meta-panel">
                  <h2>Anúncios e criativos ({report.ads.length})</h2>
                  <ul>
                    {report.ads.slice(0, 30).map((row: any) => (
                      <li key={row.id}>
                        <Link href={`/landing-admin/meta/ad/${row.id}?days=${days}`}>{row.name}</Link>
                        <span>{money(row.spend, currency)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}

            {mode === "completo" && (
              <section className="meta-panel">
                <h2>Públicos e posicionamentos disponíveis</h2>
                <p>
                  Totais por segmentos agregados da Meta. Cada tipo de recorte é independente; não some linhas de
                  recortes diferentes.
                </p>
                <div className="meta-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Recorte</th>
                        <th>Segmento</th>
                        <th>Investimento</th>
                        <th>Impressões</th>
                        <th>Cliques no link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.breakdowns.length ? (
                        report.breakdowns.map((row: any, index: number) => (
                          <tr key={index}>
                            <td>{row.breakdown_key}</td>
                            <td>{Object.values(row.breakdown || {}).join(" · ")}</td>
                            <td>{money(row.spend, currency)}</td>
                            <td>{number(row.impressions)}</td>
                            <td>{number(row.link_clicks)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>Nenhum recorte disponível ou autorizado para esta conta.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

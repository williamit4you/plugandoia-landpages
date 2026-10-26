import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Download,
  ExternalLink,
  Filter,
  FlaskConical,
  Gauge,
  GitCompare,
  Globe2,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  LayoutDashboard,
  Lock,
  MonitorSmartphone,
  MousePointerClick,
  Package,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { EntityComparator, OperationalForms } from "@/components/analytics/ComparatorAndOperations";
import { MetaSyncTrigger } from "@/components/analytics/MetaSyncTrigger";
import { ProfitabilitySimulator } from "@/components/analytics/ProfitabilitySimulator";
import { ThemeToggle } from "@/components/analytics/ThemeToggle";
import { getDashboard } from "@/lib/dashboard";
import { METRIC_GLOSSARY, type DiagnosticTone } from "@/lib/metaDiagnostics";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR");
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

const nav = [
  ["overview", "1. Visão Geral", LayoutDashboard],
  ["meta", "2. Meta Ads", BarChart3],
  ["campaigns", "3. Campanhas", Target],
  ["adsets", "4. Conjuntos", Layers],
  ["creatives", "5. Anúncios e Criativos", ImageIcon],
  ["traffic", "6. Tráfego e Qualidade LP", Globe2],
  ["funnel", "7. Funil e Diagnóstico", Filter],
  ["audience", "8. Público e Localização", MonitorSmartphone],
  ["products", "9. Produtos e Order Bumps", Package],
  ["orders", "10. Hotmart e Atribuição", ReceiptText],
  ["financial", "11. Financeiro e Simulador", CircleDollarSign],
  ["compare", "12. Comparativos e Testes", GitCompare],
  ["diagnostics", "13. Alertas e Glossário", Sparkles],
  ["events", "14. Eventos", Activity],
  ["settings", "15. Saúde e Integrações", Settings],
] as const;

const short = (value: unknown, size = 36) => {
  const text = String(value || "—");
  return text.length > size ? `${text.slice(0, size)}…` : text;
};

const fmtMoney = (v: number | null | undefined, curr = "BRL") =>
  v === null || v === undefined || !Number.isFinite(Number(v))
    ? "Não disponível"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: curr }).format(Number(v));

const fmtNum = (v: number | null | undefined) =>
  v === null || v === undefined || !Number.isFinite(Number(v)) ? "Não disponível" : integer.format(Number(v));

const fmtPct = (v: number | null | undefined, isRatio = true) =>
  v === null || v === undefined || !Number.isFinite(Number(v))
    ? "Não disponível"
    : `${decimal.format(Number(v) * (isRatio ? 100 : 1))}%`;

function ToneBadge({ tone, label }: { tone: DiagnosticTone; label: string }) {
  const config = {
    green: { Icon: CheckCircle2, bg: "rgba(39,110,80,0.22)", border: "#276e50", color: "#70d8a3", prefix: "Favorável" },
    yellow: { Icon: AlertTriangle, bg: "rgba(132,107,39,0.22)", border: "#846b27", color: "#f2ca66", prefix: "Atenção" },
    red: { Icon: XCircle, bg: "rgba(133,54,70,0.22)", border: "#853646", color: "#f38e99", prefix: "Crítico" },
    gray: { Icon: HelpCircle, bg: "rgba(53,68,91,0.25)", border: "#35445b", color: "#a9b8d1", prefix: "Inconclusivo" },
  }[tone];
  const Icon = config.Icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        border: `1px solid ${config.border}`,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <Icon size={12} />
      {label || config.prefix}
    </span>
  );
}

function Panel({
  eyebrow,
  title,
  right,
  children,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="analytics-panel">
      <header
        className="analytics-panel-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
      >
        <div>
          {eyebrow && <span>{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="analytics-empty">
      <Activity size={19} />
      <p>{text}</p>
    </div>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="analytics-table-wrap">
      <table className="analytics-table">{children}</table>
    </div>
  );
}

function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols}>
        <Empty text={text} />
      </td>
    </tr>
  );
}

function Metric({
  label,
  value,
  detail,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  Icon: any;
  tone?: DiagnosticTone;
}) {
  const borderColor =
    tone === "green"
      ? "#276e50"
      : tone === "yellow"
        ? "#846b27"
        : tone === "red"
          ? "#853646"
          : undefined;
  return (
    <article className="analytics-metric" style={borderColor ? { borderColor } : undefined}>
      <span className="analytics-metric-icon">
        <Icon size={17} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p>{label}</p>
        <strong style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </article>
  );
}

function Distribution({ rows }: { rows: any[] }) {
  const total = rows.reduce((s, r) => s + Number(r.value), 0);
  return (
    <div className="analytics-distribution">
      {rows.length ? (
        rows.map((row) => (
          <div key={row.label}>
            <div>
              <span>{row.label}</span>
              <strong>{integer.format(row.value)}</strong>
            </div>
            <i>
              <em style={{ width: `${total ? (row.value / total) * 100 : 0}%` }} />
            </i>
          </div>
        ))
      ) : (
        <Empty text="Dados ainda não disponíveis." />
      )}
    </div>
  );
}

function FunnelView({ rows }: { rows: any[] }) {
  const base = rows[0]?.value || 0;
  return (
    <div className="analytics-funnel">
      {rows.map((row, index) => {
        const previous = index ? rows[index - 1].value : row.value;
        const rate = previous ? (row.value / previous) * 100 : 0;
        return (
          <div className="analytics-funnel-step" key={row.event}>
            <div>
              <span>{row.label}</span>
              <strong>{integer.format(row.value)}</strong>
              <small>{index ? `${rate.toFixed(1)}% da etapa anterior` : "Entrada do funil"}</small>
            </div>
            <i style={{ width: `${base ? Math.max((row.value / base) * 100, 8) : 8}%` }} />
          </div>
        );
      })}
    </div>
  );
}

function Series({ rows, annotations = [] }: { rows: any[]; annotations?: any[] }) {
  if (!rows.length) return <Empty text="Ainda não há dados diários no período selecionado." />;
  const width = 700,
    height = 200,
    pad = 18;
  const max = Math.max(...rows.flatMap((r) => [Number(r.views || 0), Number(r.checkouts || 0), Number(r.sales || 0)]), 1);
  const points = (key: string) =>
    rows
      .map(
        (r, i) =>
          `${pad + (i * (width - pad * 2)) / Math.max(rows.length - 1, 1)},${height - pad - (Number(r[key] || 0) / max) * (height - pad * 2)}`,
      )
      .join(" ");
  return (
    <div className="analytics-chart">
      <div className="analytics-chart-legend">
        <span className="legend-view">Visualizações</span>
        <span className="legend-checkout">Checkouts</span>
        <span className="legend-sale">Vendas</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} aria-label="Evolução de dados">
        <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} />
        <polyline className="chart-view" points={points("views")} />
        <polyline className="chart-checkout" points={points("checkouts")} />
        <polyline className="chart-sale" points={points("sales")} />
      </svg>
      <div className="analytics-chart-labels">
        <span>{rows[0].day}</span>
        <span>{rows.at(-1).day}</span>
      </div>
      {annotations.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {annotations.slice(0, 5).map((ann: any) => (
            <span
              key={ann.id}
              style={{
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 6,
                background: "var(--a-panel-2)",
                border: "1px solid var(--a-line)",
                color: "var(--a-muted)",
              }}
            >
              📌 <strong>{ann.occurred_on}</strong>: {ann.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function LandingAdmin({
  searchParams,
}: {
  searchParams: {
    days?: string;
    page?: string;
    tab?: string;
    mode?: string;
    media?: string;
    since?: string;
    until?: string;
  };
}) {
  const days = Math.min(Math.max(Number(searchParams.days || 30), 1), 365);
  const page = searchParams.page && searchParams.page !== "all" ? searchParams.page : null;
  const tab = nav.some(([key]) => key === searchParams.tab) ? searchParams.tab || "overview" : "overview";
  const mode =
    searchParams.mode === "intermediario" || searchParams.mode === "completo" ? searchParams.mode : "simples";
  const mediaFilter = searchParams.media === "VIDEO" || searchParams.media === "IMAGE" ? searchParams.media : "ALL";

  const data = await getDashboard({
    days,
    pageKey: page,
    since: searchParams.since || null,
    until: searchParams.until || null,
  });
  const s = data.summary;
  const meta = data.meta;
  const mt = meta?.totals;
  const currency = meta?.account?.currency || "BRL";
  const active = nav.find(([key]) => key === tab)!;

  const link = (key: string, nextMode = mode) =>
    `/landing-admin?days=${days}&page=${encodeURIComponent(page || "all")}&tab=${key}&mode=${nextMode}`;

  const spend = mt?.spend ?? null;
  const impressions = mt?.impressions ?? null;
  const linkClicks = mt?.link_clicks ?? null;
  const outboundClicks = mt?.outbound_clicks ?? null;
  const netResultOverall = mt?.netResultOverall ?? (spend !== null ? s.commission - spend : null);

  // Executive KPIs
  const executiveMetrics = (
    <section className="analytics-metrics">
      <Metric
        label="1. Quanto investi (Meta)"
        value={fmtMoney(spend, currency)}
        detail={
          meta?.sync?.finished_at
            ? `Sincronizado em ${dateTime.format(new Date(meta.sync.finished_at))}`
            : "Sincronização Meta pendente"
        }
        Icon={CircleDollarSign}
      />
      <Metric
        label="2. Exibições e Cliques"
        value={impressions !== null ? `${integer.format(impressions)} exib.` : "N/D"}
        detail={
          linkClicks !== null
            ? `${integer.format(linkClicks)} cliques no link (CTR ${fmtPct(mt?.linkCtr)})`
            : "Aguardando dados da Meta"
        }
        Icon={MousePointerClick}
      />
      <Metric
        label="3. Visitas ao Site"
        value={`${integer.format(s.sessions)} sessões`}
        detail={`${integer.format(s.uniqueVisitors)} visitantes · ${integer.format(s.pageViews)} visualizações`}
        Icon={Users}
      />
      <Metric
        label="4. Cliques no Checkout"
        value={integer.format(s.checkouts)}
        detail={`${s.sessionCheckoutRate.toFixed(1)}% das sessões iniciaram compra`}
        Icon={CreditCard}
      />
      <Metric
        label="5. Compras e Comissões"
        value={`${integer.format(s.purchases)} vendas`}
        detail={`Comissão Hotmart: ${money.format(s.commission)} (Bruto: ${money.format(s.revenue)})`}
        Icon={ShoppingBag}
        tone={s.purchases > 0 ? "green" : "gray"}
      />
      <Metric
        label="6. Sobra após Anúncios"
        value={netResultOverall !== null ? fmtMoney(netResultOverall, currency) : money.format(s.commission)}
        detail={
          spend !== null
            ? `ROAS s/ comissão: ${mt?.roasCommissionOverall ? `${mt.roasCommissionOverall.toFixed(2)}×` : "—"} (Não é lucro contábil)`
            : "Sem gasto Meta sincronizado no período"
        }
        Icon={Award}
        tone={netResultOverall !== null ? (netResultOverall >= 0 ? "green" : "red") : "gray"}
      />
    </section>
  );

  // Plain-language explanation card for Simple Mode
  const simpleSummaryBox = (
    <Panel eyebrow="Resumo em linguagem simples" title="O que está acontecendo na sua operação">
      <div style={{ padding: "14px 19px", display: "grid", gap: 10, fontSize: 13, lineHeight: 1.6 }}>
        <p style={{ margin: 0 }}>
          •{" "}
          {impressions !== null ? (
            <>
              Seus anúncios apareceram <strong>{integer.format(impressions)} vezes</strong> (impressões, que incluem
              repetições para a mesma pessoa) e registraram{" "}
              <strong>{integer.format(linkClicks || 0)} cliques no link</strong>, com investimento de{" "}
              <strong>{fmtMoney(spend, currency)}</strong>.
            </>
          ) : (
            <>
              A integração com a Meta Ads está pronta em modo 100% leitura. Use o botão{" "}
              <strong>Sincronizar Meta Ads</strong> acima para importar o investimento e os cliques da sua conta.
            </>
          )}
        </p>
        <p style={{ margin: 0 }}>
          • O site registrou <strong>{integer.format(s.sessions)} sessões</strong> (sendo{" "}
          <strong>{integer.format(mt?.attributedSessions || 0)}</strong> atribuídas diretamente a campanhas por ID/UTM)
          e <strong>{integer.format(s.checkouts)} cliques para o checkout</strong> ({s.sessionCheckoutRate.toFixed(1)}%
          das sessões).
        </p>
        <p style={{ margin: 0 }}>
          • A Hotmart confirmou <strong>{integer.format(s.purchases)} venda(s) aprovada(s)</strong>, gerando{" "}
          <strong>{money.format(s.commission)} em comissões</strong> (receita bruta de {money.format(s.revenue)} e{" "}
          {integer.format(s.refunds)} reembolso/estorno).
          {spend !== null && (
            <>
              {" "}
              Descontando o investimento em anúncios ({fmtMoney(spend, currency)}), o resultado operacional após
              anúncios é de <strong>{fmtMoney(netResultOverall, currency)}</strong>.
            </>
          )}
        </p>
      </div>
    </Panel>
  );

  // Stage diagnostics visual component
  const stagePanel = (
    <Panel
      eyebrow="Diagnóstico visual por etapa"
      title="Saúde das 7 etapas do funil (Evidências, Volume e Próximo Ponto a Investigar)"
    >
      <div style={{ padding: 19, display: "grid", gap: 12 }}>
        {(meta?.stageDiagnostics || []).map((st: any) => (
          <article
            key={st.stageKey}
            style={{
              padding: 14,
              borderRadius: 11,
              border: "1px solid var(--a-line)",
              background: "var(--a-panel-2)",
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 14 }}>{st.stageLabel}</strong>
              <ToneBadge tone={st.tone} label={st.statusLabel} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, fontSize: 12 }}>
              <div>
                <span style={{ color: "var(--a-muted)" }}>Métrica observada: </span>
                <strong>{st.metricObserved}</strong>
              </div>
              <div>
                <span style={{ color: "var(--a-muted)" }}>Referência: </span>
                <span>{st.referenceUsed}</span>
              </div>
              <div>
                <span style={{ color: "var(--a-muted)" }}>Amostra: </span>
                <span>{st.sampleVolume}</span>
              </div>
            </div>
            <p style={{ margin: "2px 0", fontSize: 12, color: "var(--a-muted)" }}>
              <strong>Evidência:</strong> {st.evidence} · <strong>Hipótese:</strong> {st.possibleCause}
            </p>
            <small style={{ color: "#99afff", fontSize: 11 }}>
              🔍 <strong>Próximo ponto a investigar:</strong> {st.nextInvestigation}
            </small>
          </article>
        ))}
      </div>
    </Panel>
  );

  // 1. OVERVIEW
  const overview = (
    <>
      {executiveMetrics}
      {simpleSummaryBox}
      {mode !== "simples" && (
        <section className="analytics-metrics">
          <Metric label="CTR no link (Meta)" value={fmtPct(mt?.linkCtr)} detail="Cliques no link ÷ Impressões" Icon={BarChart3} />
          <Metric label="CPC no link (Meta)" value={fmtMoney(mt?.linkCpc, currency)} detail="Gasto ÷ Cliques no link" Icon={CircleDollarSign} />
          <Metric label="CPM (Custo / 1.000 exib.)" value={fmtMoney(mt?.cpm, currency)} detail="Preço médio do leilão" Icon={Gauge} />
          <Metric label="Custo por visita atribuída" value={fmtMoney(mt?.costPerSession, currency)} detail="Gasto ÷ Sessões atribuídas" Icon={Users} />
          <Metric label="CPA (Geral / Atribuído)" value={fmtMoney(mt?.cpaOverall, currency)} detail={`Atribuído: ${fmtMoney(mt?.cpaAttributed, currency)}`} Icon={Target} />
          <Metric label="ROAS Bruto / Comissão" value={mt?.roasGrossOverall ? `${mt.roasGrossOverall.toFixed(2)}×` : "N/D"} detail={`S/ comissão: ${mt?.roasCommissionOverall ? `${mt.roasCommissionOverall.toFixed(2)}×` : "N/D"}`} Icon={Award} />
        </section>
      )}
      <div className="analytics-grid analytics-grid-main">
        <Panel eyebrow="Desempenho diário" title="Evolução de visualizações, checkouts e vendas">
          <Series rows={data.daily} annotations={meta?.annotations || []} />
        </Panel>
        <Panel eyebrow="Conversão do site" title="Funil de eventos">
          <FunnelView rows={data.funnel} />
        </Panel>
      </div>
      {mode === "completo" && stagePanel}
      <div className="analytics-grid">
        <Panel
          eyebrow="Meta Ads"
          title="Principais campanhas"
          right={<Link href={link("campaigns")} style={{ fontSize: 12, color: "#99afff" }}>Ver todas →</Link>}
        >
          <Table>
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Gasto</th>
                <th>Cliques no link</th>
                <th>CTR</th>
                <th>Vendas atrib.</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {meta?.campaigns?.length ? (
                meta.campaigns.slice(0, 6).map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/landing-admin/meta/campaign/${c.id}?days=${days}`} style={{ color: "#99afff", fontWeight: 700 }}>
                        {short(c.name, 34)}
                      </Link>
                    </td>
                    <td>{fmtMoney(c.spend, currency)}</td>
                    <td>{fmtNum(c.link_clicks)}</td>
                    <td>{fmtPct(c.linkCtr)}</td>
                    <td>{c.sales ? integer.format(c.sales.sales) : "0"}</td>
                    <td>
                      <ToneBadge tone={c.primaryTone} label={c.result != null ? fmtMoney(c.result, currency) : "Sem atrib."} />
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow cols={6} text="Nenhuma campanha sincronizada ainda. Clique em 'Sincronizar Meta Ads' no topo." />
              )}
            </tbody>
          </Table>
        </Panel>
        <Panel
          eyebrow="Cursos Plugando IA"
          title="Rentabilidade por produto"
          right={<Link href={link("products")} style={{ fontSize: 12, color: "#99afff" }}>Ver todos →</Link>}
        >
          <Table>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Visitas</th>
                <th>Checkouts</th>
                <th>Vendas</th>
                <th>Comissão</th>
                <th>Conversão</th>
              </tr>
            </thead>
            <tbody>
              {data.catalogReport.slice(0, 6).map((row: any) => (
                <tr key={row.slug}>
                  <td>{short(row.title, 32)}</td>
                  <td>{integer.format(row.views)}</td>
                  <td>{integer.format(row.checkouts)}</td>
                  <td>{integer.format(row.sales)}</td>
                  <td>{money.format(row.commission)}</td>
                  <td>{row.views ? `${row.conversionRate.toFixed(2)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>
    </>
  );

  // 2. META ADS CENTRAL
  const metaTab = (
    <>
      <Panel
        eyebrow="Integração Oficial · Somente Leitura"
        title={`Conta Meta Ads: ${meta?.account?.name || process.env.META_AD_ACCOUNT_ID || "Configurada via ambiente"}`}
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <MetaSyncTrigger defaultDays={days} />
            <a
              href={`/landing-api/admin/meta/export-csv?days=${days}`}
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--a-line)",
                background: "var(--a-panel-2)",
                color: "var(--a-text)",
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
            <Link
              href={`/landing-admin/meta?days=${days}&mode=${mode}`}
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--a-line)",
                background: "var(--a-panel-2)",
                color: "#99afff",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
              }}
            >
              <ExternalLink size={14} /> Tela cheia Meta Ads
            </Link>
          </div>
        }
      >
        <div style={{ padding: "12px 19px", fontSize: 12, color: "var(--a-muted)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>🔒 <strong>Segurança:</strong> Modo 100% somente leitura (nenhuma operação de escrita é permitida)</span>
          <span>📅 <strong>Período:</strong> {meta?.period.since} a {meta?.period.until}</span>
          <span>💱 <strong>Moeda:</strong> {currency}</span>
          <span>🌐 <strong>Fuso da conta:</strong> {meta?.account?.timezone_name || "America/Sao_Paulo"}</span>
          <span>
            🔄 <strong>Última sincronização:</strong>{" "}
            {meta?.sync?.finished_at ? dateTime.format(new Date(meta.sync.finished_at)) : "Pendente"}
          </span>
        </div>
      </Panel>
      {executiveMetrics}
      <Panel eyebrow="Comparação de Período" title={`Período atual vs período anterior (${meta?.period.prevSince} a ${meta?.period.prevUntil})`}>
        <Table>
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Período Atual</th>
              <th>Período Anterior</th>
              <th>Leitura</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Investimento (Spend)</td>
              <td>{fmtMoney(mt?.spend, currency)}</td>
              <td>{fmtMoney(meta?.previousTotals?.spend, currency)}</td>
              <td>Comparação direta de gasto efetivo</td>
            </tr>
            <tr>
              <td>Impressões</td>
              <td>{fmtNum(mt?.impressions)}</td>
              <td>{fmtNum(meta?.previousTotals?.impressions)}</td>
              <td>Volume de exibições no leilão</td>
            </tr>
            <tr>
              <td>Cliques no link</td>
              <td>{fmtNum(mt?.link_clicks)}</td>
              <td>{fmtNum(meta?.previousTotals?.link_clicks)}</td>
              <td>Tráfego gerado nos anúncios</td>
            </tr>
            <tr>
              <td>CTR no link</td>
              <td>{fmtPct(mt?.linkCtr)}</td>
              <td>{fmtPct(meta?.previousTotals?.linkCtr)}</td>
              <td>Taxa de atração do criativo</td>
            </tr>
            <tr>
              <td>CPC no link</td>
              <td>{fmtMoney(mt?.linkCpc, currency)}</td>
              <td>{fmtMoney(meta?.previousTotals?.linkCpc, currency)}</td>
              <td>Eficiência de custo por clique</td>
            </tr>
          </tbody>
        </Table>
      </Panel>
    </>
  );

  // 3. CAMPAIGNS
  const campaignsTab = (
    <Panel
      eyebrow="Cruzamento Meta Ads × Site × Hotmart"
      title="Desempenho completo por campanha (clique na campanha para diagnóstico individual)"
      right={<MetaSyncTrigger defaultDays={days} />}
    >
      <Table>
        <thead>
          <tr>
            <th>Campanha</th>
            <th>Status</th>
            <th>Orçamento Config.</th>
            <th>Gasto Real</th>
            <th>Impressões</th>
            <th>Cliques Link</th>
            <th>Cliques Saída</th>
            <th>CTR Link</th>
            <th>CPC Link</th>
            <th>CPM</th>
            <th>Sessões Atrib.</th>
            <th>Checkouts Atrib.</th>
            <th>Vendas Atrib.</th>
            <th>Comissão Atrib.</th>
            <th>ROAS Bruto</th>
            <th>ROAS Comissão</th>
            <th>Resultado Após Ads</th>
            <th>Diagnóstico</th>
          </tr>
        </thead>
        <tbody>
          {meta?.campaigns?.length ? (
            meta.campaigns.map((c: any) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/landing-admin/meta/campaign/${c.id}?days=${days}`} style={{ color: "#99afff", fontWeight: 700 }}>
                    {c.name}
                  </Link>
                  <small className="analytics-contact">ID {c.id} · {c.objective || "Objetivo padrão"}</small>
                </td>
                <td><span className="analytics-status">{c.effective_status || c.status || "—"}</span></td>
                <td>
                  {c.daily_budget
                    ? `${fmtMoney(c.daily_budget, currency)}/dia`
                    : c.lifetime_budget
                      ? `${fmtMoney(c.lifetime_budget, currency)} vitalício`
                      : "No conjunto"}
                </td>
                <td><strong>{fmtMoney(c.spend, currency)}</strong></td>
                <td>{fmtNum(c.impressions)}</td>
                <td>{fmtNum(c.link_clicks)}</td>
                <td>{fmtNum(c.outbound_clicks)}</td>
                <td>{fmtPct(c.linkCtr)}</td>
                <td>{fmtMoney(c.linkCpc, currency)}</td>
                <td>{fmtMoney(c.cpm, currency)}</td>
                <td>{c.site ? integer.format(c.site.sessions) : "0"}</td>
                <td>{c.site ? integer.format(c.site.checkouts) : "0"}</td>
                <td>{c.sales ? integer.format(c.sales.sales) : "0"}</td>
                <td>{c.sales ? fmtMoney(c.sales.commission, currency) : "Não atribuído"}</td>
                <td>{c.roasGross != null ? `${c.roasGross.toFixed(2)}×` : "—"}</td>
                <td>{c.roasCommission != null ? `${c.roasCommission.toFixed(2)}×` : "—"}</td>
                <td style={{ fontWeight: 700, color: c.result != null ? (c.result >= 0 ? "#70d8a3" : "#f38e99") : undefined }}>
                  {c.result != null ? fmtMoney(c.result, currency) : "Não atribuído"}
                </td>
                <td>
                  <ToneBadge tone={c.primaryTone} label={c.diagnostics?.[0]?.title?.slice(0, 26) || "Ver"} />
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow cols={18} text="Nenhuma campanha importada ainda. Acione 'Sincronizar Meta Ads' acima." />
          )}
        </tbody>
      </Table>
    </Panel>
  );

  // 4. ADSETS
  const adsetsTab = (
    <Panel eyebrow="Conjuntos de anúncios" title="Desempenho, orçamento e otimização por conjunto (Adset)">
      <Table>
        <thead>
          <tr>
            <th>Conjunto (Adset)</th>
            <th>Status</th>
            <th>Otimização</th>
            <th>Orçamento Diário / Vitalício</th>
            <th>Gasto Real</th>
            <th>Impressões</th>
            <th>Cliques no Link</th>
            <th>CTR Link</th>
            <th>CPC Link</th>
            <th>CPM</th>
            <th>Sessões Atrib.</th>
            <th>Vendas Atrib.</th>
            <th>Resultado Após Ads</th>
          </tr>
        </thead>
        <tbody>
          {meta?.adsets?.length ? (
            meta.adsets.map((a: any) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/landing-admin/meta/adset/${a.id}?days=${days}`} style={{ color: "#99afff", fontWeight: 700 }}>
                    {a.name}
                  </Link>
                  <small className="analytics-contact">ID {a.id} · Campanha {a.campaign_id}</small>
                </td>
                <td><span className="analytics-status">{a.effective_status || a.status || "—"}</span></td>
                <td>{a.optimization_goal || "—"}</td>
                <td>
                  {a.daily_budget
                    ? `${fmtMoney(a.daily_budget, currency)}/dia`
                    : a.lifetime_budget
                      ? `${fmtMoney(a.lifetime_budget, currency)} total`
                      : "CBO (na campanha)"}
                </td>
                <td>{fmtMoney(a.spend, currency)}</td>
                <td>{fmtNum(a.impressions)}</td>
                <td>{fmtNum(a.link_clicks)}</td>
                <td>{fmtPct(a.linkCtr)}</td>
                <td>{fmtMoney(a.linkCpc, currency)}</td>
                <td>{fmtMoney(a.cpm, currency)}</td>
                <td>{a.site ? integer.format(a.site.sessions) : "0"}</td>
                <td>{a.sales ? integer.format(a.sales.sales) : "0"}</td>
                <td>{a.result != null ? fmtMoney(a.result, currency) : "—"}</td>
              </tr>
            ))
          ) : (
            <EmptyRow cols={13} text="Nenhum conjunto de anúncios sincronizado no período." />
          )}
        </tbody>
      </Table>
    </Panel>
  );

  // 5. CREATIVES & ADS
  const filteredAds = (meta?.ads || []).filter((a: any) =>
    mediaFilter === "ALL" ? true : a.mediaType === mediaFilter,
  );
  const creativesTab = (
    <Panel
      eyebrow="Biblioteca visual de criativos"
      title="Anúncios e Criativos autorizados"
      right={
        <div style={{ display: "flex", gap: 6 }}>
          {(["ALL", "IMAGE", "VIDEO"] as const).map((m) => (
            <Link
              key={m}
              href={`/landing-admin?days=${days}&tab=creatives&media=${m}`}
              style={{
                padding: "6px 10px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                textDecoration: "none",
                background: mediaFilter === m ? "var(--a-blue)" : "var(--a-panel-2)",
                color: mediaFilter === m ? "#fff" : "var(--a-muted)",
              }}
            >
              {m === "ALL" ? "Todos" : m === "VIDEO" ? "Vídeos" : "Imagens"}
            </Link>
          ))}
        </div>
      }
    >
      <Table>
        <thead>
          <tr>
            <th>Miniatura</th>
            <th>Anúncio / Criativo</th>
            <th>Mídia</th>
            <th>Status</th>
            <th>Gasto</th>
            <th>Impressões</th>
            <th>Cliques Link</th>
            <th>CTR Link</th>
            <th>CPC Link</th>
            <th>CPM</th>
            <th>Retenção Vídeo (ThruPlay / 75%)</th>
            <th>Visitas Atrib.</th>
            <th>Vendas Atrib.</th>
            <th>Resultado</th>
            <th>Rastreamento URL</th>
          </tr>
        </thead>
        <tbody>
          {filteredAds.length ? (
            filteredAds.map((ad: any) => (
              <tr key={ad.id}>
                <td>
                  {ad.thumbnail_url ? (
                    <img
                      src={ad.thumbnail_url}
                      alt={ad.name}
                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : (
                    <span style={{ fontSize: 10, color: "var(--a-muted)" }}>Sem prévia</span>
                  )}
                </td>
                <td>
                  <Link href={`/landing-admin/meta/ad/${ad.id}?days=${days}`} style={{ color: "#99afff", fontWeight: 700 }}>
                    {ad.name}
                  </Link>
                  <small className="analytics-contact">
                    ID {ad.id} {ad.creativeTitle ? `· ${short(ad.creativeTitle, 28)}` : ""}
                  </small>
                </td>
                <td><span className="analytics-event">{ad.mediaType}</span></td>
                <td>{ad.effective_status || ad.status || "—"}</td>
                <td>{fmtMoney(ad.spend, currency)}</td>
                <td>{fmtNum(ad.impressions)}</td>
                <td>{fmtNum(ad.link_clicks)}</td>
                <td>{fmtPct(ad.linkCtr)}</td>
                <td>{fmtMoney(ad.linkCpc, currency)}</td>
                <td>{fmtMoney(ad.cpm, currency)}</td>
                <td>
                  {ad.extras?.thruPlays
                    ? `${integer.format(ad.extras.thruPlays)} ThruPlay · ${ad.extras.videoP75 ? integer.format(ad.extras.videoP75) : 0} (75%)`
                    : "—"}
                </td>
                <td>{ad.site ? integer.format(ad.site.sessions) : "0"}</td>
                <td>{ad.sales ? integer.format(ad.sales.sales) : "0"}</td>
                <td>{ad.result != null ? fmtMoney(ad.result, currency) : "—"}</td>
                <td>
                  <ToneBadge
                    tone={ad.hasTrackingParams ? "green" : "yellow"}
                    label={ad.hasTrackingParams ? "UTM OK" : "Verificar UTM"}
                  />
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow cols={15} text="Nenhum criativo encontrado para o filtro selecionado." />
          )}
        </tbody>
      </Table>
    </Panel>
  );

  // 6. SITE TRAFFIC & LP QUALITY
  const trafficTab = (
    <>
      {executiveMetrics}
      <div className="analytics-grid analytics-grid-main">
        <Panel eyebrow="Audiência" title="Evolução de acessos">
          <Series rows={data.daily} annotations={meta?.annotations || []} />
        </Panel>
        <Panel eyebrow="Origens UTM" title="Principais origens e campanhas no site">
          <Table>
            <thead>
              <tr>
                <th>Origem</th>
                <th>Mídia</th>
                <th>Campanha / ID</th>
                <th>Sessões</th>
                <th>Checkouts</th>
              </tr>
            </thead>
            <tbody>
              {data.sources.length ? (
                data.sources.slice(0, 8).map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.source}</td>
                    <td>{r.medium}</td>
                    <td className="analytics-mono">{short(r.campaign, 24)}</td>
                    <td>{integer.format(r.sessions)}</td>
                    <td>{integer.format(r.checkouts)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow cols={5} text="Nenhuma origem identificada no período." />
              )}
            </tbody>
          </Table>
        </Panel>
      </div>
      <Panel
        eyebrow="Qualidade técnica e experiência da página"
        title="Performance das Landing Pages (Core Web Vitals, Rolagem, Erros JS e Conversão)"
      >
        <Table>
          <thead>
            <tr>
              <th>Landing Page</th>
              <th>Visitantes</th>
              <th>Sessões</th>
              <th>Visualizações</th>
              <th>Interações / CTAs</th>
              <th>Checkouts</th>
              <th>Vendas</th>
              <th>Conversão</th>
              <th>LCP médio</th>
              <th>CLS médio</th>
              <th>Scroll médio</th>
              <th>Erros JS</th>
            </tr>
          </thead>
          <tbody>
            {data.pagePerformance.length ? (
              data.pagePerformance.map((row: any) => {
                const q = data.pageQuality.find((pq: any) => pq.page_key === row.page_key);
                return (
                  <tr key={row.page_key}>
                    <td><strong>{row.title || row.page_key}</strong></td>
                    <td>{integer.format(row.visitors)}</td>
                    <td>{integer.format(row.sessions)}</td>
                    <td>{integer.format(row.views)}</td>
                    <td>{integer.format(row.interactions || 0)}</td>
                    <td>{integer.format(row.checkouts)}</td>
                    <td>{integer.format(row.sales)}</td>
                    <td>{row.views ? `${((row.sales / row.views) * 100).toFixed(2)}%` : "—"}</td>
                    <td>{q?.avg_lcp_ms ? `${Math.round(q.avg_lcp_ms)} ms` : "Aguardando amostra"}</td>
                    <td>{q?.avg_cls != null ? Number(q.avg_cls).toFixed(3) : "—"}</td>
                    <td>{q?.avg_scroll_depth ? `${Math.round(q.avg_scroll_depth)}%` : "—"}</td>
                    <td>{q?.js_errors ? integer.format(q.js_errors) : "0"}</td>
                  </tr>
                );
              })
            ) : (
              <EmptyRow cols={12} text="Nenhuma landing page com eventos registrados no período." />
            )}
          </tbody>
        </Table>
      </Panel>
    </>
  );

  // 7. FUNNEL & STAGE DIAGNOSTICS
  const funnelTab = (
    <>
      {stagePanel}
      <div className="analytics-grid">
        <Panel eyebrow="Funil do site" title="Contagem por etapa de evento">
          <FunnelView rows={data.funnel} />
        </Panel>
        <Panel eyebrow="Taxas de passagem" title="Indicadores de eficiência do funil">
          <div className="analytics-insights">
            <p>
              <strong>Taxa de chegada ao site (Sessões ÷ Cliques de saída):</strong>{" "}
              {mt?.arrivalRate != null ? `${(mt.arrivalRate * 100).toFixed(1)}%` : "Aguardando cliques da Meta"}
            </p>
            <p>
              <strong>Taxa de clique no checkout (Checkouts ÷ Sessões):</strong>{" "}
              {s.sessionCheckoutRate.toFixed(2)}% ({integer.format(s.checkouts)} de {integer.format(s.sessions)} sessões)
            </p>
            <p>
              <strong>Conversão de checkout em compra aprovada:</strong>{" "}
              {s.purchaseRate.toFixed(2)}% ({integer.format(s.purchases)} de {integer.format(s.checkouts)} checkouts)
            </p>
            <p>
              <strong>Conversão geral do site (Vendas ÷ Sessões):</strong> {s.siteConversionRate.toFixed(2)}%
            </p>
          </div>
        </Panel>
      </div>
    </>
  );

  // 8. AUDIENCE & BREAKDOWNS
  const audienceTab = (
    <>
      <Panel
        eyebrow="Segmentações agregadas da Meta Ads"
        title="Públicos, Idade, Gênero, Plataforma, Posicionamento e Região"
      >
        <p className="analytics-note">
          Dados agregados oficiais da Meta API. Nenhuma pessoa é identificada individualmente. Cada recorte é independente (não some alcance entre linhas).
        </p>
        <Table>
          <thead>
            <tr>
              <th>Tipo de Recorte (Breakdown)</th>
              <th>Segmento</th>
              <th>Investimento</th>
              <th>Impressões</th>
              <th>Cliques no Link</th>
              <th>CTR no Link</th>
              <th>CPC no Link</th>
            </tr>
          </thead>
          <tbody>
            {meta?.breakdowns?.length ? (
              meta.breakdowns.map((b: any, i: number) => {
                const bCtr = b.impressions > 0 ? (b.link_clicks || 0) / b.impressions : null;
                const bCpc = b.link_clicks > 0 ? (b.spend || 0) / b.link_clicks : null;
                return (
                  <tr key={i}>
                    <td><span className="analytics-event">{b.breakdown_key}</span></td>
                    <td><strong>{Object.values(b.breakdown || {}).filter(Boolean).join(" · ") || "Geral"}</strong></td>
                    <td>{fmtMoney(b.spend, currency)}</td>
                    <td>{fmtNum(b.impressions)}</td>
                    <td>{fmtNum(b.link_clicks)}</td>
                    <td>{fmtPct(bCtr)}</td>
                    <td>{fmtMoney(bCpc, currency)}</td>
                  </tr>
                );
              })
            ) : (
              <EmptyRow cols={7} text="Nenhum breakdown sincronizado ainda para este período." />
            )}
          </tbody>
        </Table>
      </Panel>
      <div className="analytics-grid">
        <Panel eyebrow="Site · Dispositivos" title="Acessos por dispositivo">
          <Distribution rows={data.devices} />
        </Panel>
        <Panel eyebrow="Site · Navegadores" title="Navegadores mais usados">
          <Distribution rows={data.browsers} />
        </Panel>
        <Panel eyebrow="Site · Sistemas" title="Sistemas operacionais">
          <Distribution rows={data.systems} />
        </Panel>
        <Panel eyebrow="Site · Localização" title="Cidades e regiões dos visitantes">
          <Table>
            <thead>
              <tr>
                <th>País</th>
                <th>Região</th>
                <th>Cidade</th>
                <th>Visualizações</th>
              </tr>
            </thead>
            <tbody>
              {data.locations.length ? (
                data.locations.map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.country}</td>
                    <td>{r.region}</td>
                    <td>{r.city}</td>
                    <td>{integer.format(r.value)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow cols={4} text="Nenhum dado geográfico registrado." />
              )}
            </tbody>
          </Table>
        </Panel>
      </div>
    </>
  );

  // 9. PRODUCTS, ORDER BUMPS & BUYERS
  const productsTab = (
    <>
      <Panel eyebrow="Catálogo Real Plugando IA" title="Análise comercial por curso">
        <Table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Preço Atual</th>
              <th>Visitantes</th>
              <th>Visualizações</th>
              <th>Checkouts</th>
              <th>Vendas Aprovadas</th>
              <th>Order Bumps</th>
              <th>Receita Bruta</th>
              <th>Comissões</th>
              <th>Reembolsos</th>
              <th>Taxa Checkout</th>
              <th>Conversão</th>
            </tr>
          </thead>
          <tbody>
            {data.catalogReport.map((row: any) => (
              <tr key={row.slug}>
                <td><strong>{row.title}</strong></td>
                <td>{money.format(row.price)}</td>
                <td>{integer.format(row.visitors)}</td>
                <td>{integer.format(row.views)}</td>
                <td>{integer.format(row.checkouts)}</td>
                <td><strong>{integer.format(row.sales)}</strong></td>
                <td>{integer.format(row.orderBumps)}</td>
                <td>{money.format(row.revenue)}</td>
                <td>{money.format(row.commission)}</td>
                <td>{integer.format(row.refunds)}</td>
                <td>{row.checkoutRate.toFixed(2)}%</td>
                <td>{row.conversionRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
      <div className="analytics-grid">
        <Panel eyebrow="Painel de Order Bumps" title="Participação de produtos adicionais na receita">
          <div style={{ padding: "14px 19px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div style={{ padding: 12, borderRadius: 9, background: "var(--a-panel-2)", border: "1px solid var(--a-line)" }}>
              <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Ofertas adicionais aceitas</small>
              <strong style={{ display: "block", fontSize: 18, marginTop: 4 }}>{integer.format(data.orderBumps.totalAccepted)}</strong>
            </div>
            <div style={{ padding: 12, borderRadius: 9, background: "var(--a-panel-2)", border: "1px solid var(--a-line)" }}>
              <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Receita adicional / Participação</small>
              <strong style={{ display: "block", fontSize: 18, marginTop: 4 }}>
                {money.format(data.orderBumps.additionalRevenue)} ({data.orderBumps.revenueSharePct.toFixed(1)}%)
              </strong>
            </div>
            <div style={{ padding: 12, borderRadius: 9, background: "var(--a-panel-2)", border: "1px solid var(--a-line)" }}>
              <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Ticket s/ Bump vs c/ Bump</small>
              <strong style={{ display: "block", fontSize: 15, marginTop: 4 }}>
                {data.orderBumps.ticketWithoutBump ? money.format(data.orderBumps.ticketWithoutBump) : "—"} →{" "}
                {data.orderBumps.ticketWithBump ? money.format(data.orderBumps.ticketWithBump) : "—"}
              </strong>
            </div>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Produto Order Bump</th>
                <th>Aceites</th>
                <th>Receita Adicional</th>
                <th>Comissão Adicional</th>
              </tr>
            </thead>
            <tbody>
              {data.orderBumps.items.length ? (
                data.orderBumps.items.map((ob: any, idx: number) => (
                  <tr key={idx}>
                    <td>{ob.bump_product}</td>
                    <td>{integer.format(ob.accepted_count)}</td>
                    <td>{money.format(ob.bump_revenue)}</td>
                    <td>{money.format(ob.bump_commission)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow cols={4} text="Nenhum order bump identificado nos webhooks deste período." />
              )}
            </tbody>
          </Table>
        </Panel>

        <Panel eyebrow="Compradores e Ofertas" title="Primeira compra vs Recompra e LTV">
          <div style={{ padding: "14px 19px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div style={{ padding: 12, borderRadius: 9, background: "var(--a-panel-2)", border: "1px solid var(--a-line)" }}>
              <small style={{ color: "var(--a-muted)", fontSize: 11 }}>1ª Compra vs Recorrentes</small>
              <strong style={{ display: "block", fontSize: 18, marginTop: 4 }}>
                {integer.format(data.buyerIntelligence.firstTimeBuyers)} / {integer.format(data.buyerIntelligence.repeatBuyers)}
              </strong>
            </div>
            <div style={{ padding: 12, borderRadius: 9, background: "var(--a-panel-2)", border: "1px solid var(--a-line)" }}>
              <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Taxa de Recompra</small>
              <strong style={{ display: "block", fontSize: 18, marginTop: 4 }}>
                {data.buyerIntelligence.repeatRatePct.toFixed(1)}%
              </strong>
            </div>
            <div style={{ padding: 12, borderRadius: 9, background: "var(--a-panel-2)", border: "1px solid var(--a-line)" }}>
              <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Valor Acumulado Médio (LTV)</small>
              <strong style={{ display: "block", fontSize: 18, marginTop: 4 }}>
                {money.format(data.buyerIntelligence.avgLtv)}
              </strong>
            </div>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Código da Oferta</th>
                <th>Produto</th>
                <th>Vendas</th>
                <th>Ticket Médio</th>
                <th>Receita</th>
                <th>Comissão</th>
              </tr>
            </thead>
            <tbody>
              {data.buyerIntelligence.offers.length ? (
                data.buyerIntelligence.offers.map((of: any, idx: number) => (
                  <tr key={idx}>
                    <td className="analytics-mono">{of.offer_code}</td>
                    <td>{short(of.product_name, 28)}</td>
                    <td>{integer.format(of.sales)}</td>
                    <td>{of.avg_price ? money.format(of.avg_price) : "—"}</td>
                    <td>{money.format(of.revenue)}</td>
                    <td>{money.format(of.commission)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow cols={6} text="Nenhuma oferta registrada no período." />
              )}
            </tbody>
          </Table>
        </Panel>
      </div>
    </>
  );

  // 10. HOTMART & ATTRIBUTION AUDIT
  const cc = meta?.conversionComparison;
  const ordersTab = (
    <>
      <Panel
        eyebrow="Regra de Ouro da Atribuição"
        title="Separação explícita das 3 contagens de conversão (Nunca somadas entre si)"
      >
        <div style={{ padding: 19, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--a-line)", background: "var(--a-panel-2)" }}>
            <span style={{ fontSize: 11, color: "var(--a-muted)" }}>1. Conversões reportadas pela Meta Ads</span>
            <strong style={{ display: "block", fontSize: 22, marginTop: 4 }}>
              {cc?.metaReportedPurchases != null ? integer.format(cc.metaReportedPurchases) : "Não disponível"}
            </strong>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
              Eventos Purchase contabilizados pela janela de atribuição da Meta (Pixel/CAPI).
            </small>
          </div>
          <div style={{ padding: 14, borderRadius: 10, border: "1px solid #276e50", background: "rgba(39,110,80,0.12)" }}>
            <span style={{ fontSize: 11, color: "#70d8a3" }}>2. Transações Reais Aprovadas na Hotmart</span>
            <strong style={{ display: "block", fontSize: 22, marginTop: 4, color: "#70d8a3" }}>
              {integer.format(cc?.hotmartRealSales ?? s.purchases)}
            </strong>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
              Fonte oficial financeira: R$ {decimal.format(cc?.hotmartRealCommission ?? s.commission)} em comissões.
            </small>
          </div>
          <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--a-line)", background: "var(--a-panel-2)" }}>
            <span style={{ fontSize: 11, color: "var(--a-muted)" }}>3. Transações Atribuídas às Campanhas</span>
            <strong style={{ display: "block", fontSize: 22, marginTop: 4 }}>
              {integer.format(cc?.systemAttributedSales ?? 0)} atribuídas · {integer.format(cc?.unattributedSales ?? 0)} sem atrib.
            </strong>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
              Vendas Hotmart com evidência técnica auditável (journey_id, session_id ou ID em UTM).
            </small>
          </div>
        </div>
      </Panel>
      <Panel eyebrow="Auditoria de Atribuição e Pedidos Hotmart" title="Transações consolidadas (1 única vez por transação)">
        <Table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Status</th>
              <th>Produto / Oferta</th>
              <th>Comprador</th>
              <th>Valor Bruto</th>
              <th>Comissão</th>
              <th>Campanha Identificada</th>
              <th>Regra e Evidência de Atribuição</th>
              <th>Confiança</th>
              <th>Transação</th>
            </tr>
          </thead>
          <tbody>
            {meta?.auditedSales?.length ? (
              meta.auditedSales.map((r: any, i: number) => (
                <tr key={i}>
                  <td>{dateTime.format(new Date(r.received_at))}</td>
                  <td><span className="analytics-status">{r.status || r.event_name}</span></td>
                  <td>
                    {short(r.product_name, 30)}
                    <small className="analytics-contact">Oferta: {r.offer_code || "—"} {r.is_order_bump ? "· [ORDER BUMP]" : ""}</small>
                  </td>
                  <td>
                    {r.buyer_name || "—"}
                    <small className="analytics-contact">{r.buyer_email || ""}</small>
                  </td>
                  <td>{r.amount == null ? "—" : money.format(r.amount)}</td>
                  <td>{r.producer_commission == null ? "—" : money.format(r.producer_commission)}</td>
                  <td>{r.resolvedCampaignName || "Não atribuído"}</td>
                  <td>
                    <strong>{r.ruleUsed}</strong>
                    <small className="analytics-contact">{r.evidence}</small>
                  </td>
                  <td>
                    <ToneBadge
                      tone={r.confidence === "alta" ? "green" : r.confidence === "média" ? "yellow" : "gray"}
                      label={r.confidence}
                    />
                  </td>
                  <td className="analytics-mono">{short(r.transaction_id, 18)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow cols={10} text="Nenhum pedido da Hotmart recebido neste período." />
            )}
          </tbody>
        </Table>
      </Panel>
    </>
  );

  // 11. FINANCIAL & PROFITABILITY SIMULATOR
  const financialTab = (
    <>
      <section className="analytics-metrics">
        <Metric label="Investimento Meta Ads" value={fmtMoney(spend, currency)} detail="Gasto publicitário no período" Icon={CircleDollarSign} />
        <Metric label="Receita Bruta Hotmart" value={money.format(s.revenue)} detail={`Líquida de reembolsos: ${money.format(s.netAdjustedRevenue)}`} Icon={ShoppingBag} />
        <Metric label="Comissões Hotmart" value={money.format(s.commission)} detail={`Ticket médio: ${money.format(s.avgTicket)}`} Icon={Award} />
        <Metric label="Reembolsos e Chargebacks" value={`${integer.format(s.refunds)} (${money.format(s.refundedAmount)})`} detail={`${integer.format(s.cancellations)} cancelados/expirados`} Icon={ReceiptText} />
        <Metric label="ROAS Bruto / ROAS Comissão" value={mt?.roasGrossOverall ? `${mt.roasGrossOverall.toFixed(2)}×` : "N/D"} detail={`Sobre comissão: ${mt?.roasCommissionOverall ? `${mt.roasCommissionOverall.toFixed(2)}×` : "N/D"}`} Icon={BarChart3} />
        <Metric
          label="Resultado Após Anúncios"
          value={netResultOverall !== null ? fmtMoney(netResultOverall, currency) : money.format(s.commission)}
          detail={
            mt?.marginAfterAdsPct != null
              ? `Margem após anúncios: ${(mt.marginAfterAdsPct * 100).toFixed(1)}% (Não é lucro contábil)`
              : "Comissão líquida menos anúncios"
          }
          Icon={ShieldCheck}
          tone={netResultOverall !== null ? (netResultOverall >= 0 ? "green" : "red") : "gray"}
        />
      </section>

      <Panel
        eyebrow="Simulador Interativo de Rentabilidade e Break-Even"
        title="Calcule CPA máximo, CPC máximo, impacto de Order Bumps e cenários por curso"
      >
        <ProfitabilitySimulator
          courses={data.catalogReport.map((c: any) => ({ slug: c.slug, title: c.title, price: c.price }))}
          defaultSpend={spend || 500}
        />
      </Panel>

      <Panel eyebrow="Metas e Planejamento Mensal" title="Planos financeiros ativos e progresso">
        <Table>
          <thead>
            <tr>
              <th>Plano</th>
              <th>Mês</th>
              <th>Orçamento Mensal</th>
              <th>Gasto Atual</th>
              <th>Meta de Receita</th>
              <th>Receita Atual</th>
              <th>CPA Máx. Aceitável</th>
              <th>CPA Atual</th>
            </tr>
          </thead>
          <tbody>
            {meta?.financialPlans?.length ? (
              meta.financialPlans.map((p: any) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.month_start}</td>
                  <td>{fmtMoney(p.monthly_budget, currency)}</td>
                  <td>{fmtMoney(spend, currency)}</td>
                  <td>{fmtMoney(p.target_revenue, currency)}</td>
                  <td>{money.format(s.revenue)}</td>
                  <td>{fmtMoney(p.max_cpa, currency)}</td>
                  <td>{fmtMoney(mt?.cpaOverall, currency)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow cols={8} text="Nenhum plano financeiro cadastrado. Configure suas metas na aba 'Comparativos e Testes'." />
            )}
          </tbody>
        </Table>
      </Panel>
    </>
  );

  // 12. COMPARATOR, EXPERIMENTS & OPERATIONS
  const compareTab = (
    <>
      <Panel eyebrow="Central de Comparação" title="Compare campanhas, anúncios e cursos lado a lado">
        <EntityComparator
          campaigns={meta?.campaigns || []}
          ads={meta?.ads || []}
          products={data.catalogReport || []}
        />
      </Panel>

      <Panel eyebrow="Módulo de Experimentos de Criativos" title="Testes documentados e verificação de amostra mínima">
        <Table>
          <thead>
            <tr>
              <th>Experimento</th>
              <th>Hipótese</th>
              <th>Status</th>
              <th>Criativos Comparados</th>
              <th>Avaliação Estatística</th>
            </tr>
          </thead>
          <tbody>
            {meta?.experiments?.length ? (
              meta.experiments.map((exp: any) => (
                <tr key={exp.id}>
                  <td><strong>{exp.name}</strong></td>
                  <td>{exp.hypothesis}</td>
                  <td><span className="analytics-status">{exp.status}</span></td>
                  <td>
                    {(exp.creatives || []).map((c: any) => c.label).join(" vs ") || "—"}
                  </td>
                  <td>
                    <ToneBadge
                      tone={exp.sufficientSample ? "green" : "gray"}
                      label={
                        exp.sufficientSample
                          ? "Amostra mínima atingida"
                          : "Amostra insuficiente (não declarar vencedor)"
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow cols={5} text="Nenhum experimento registrado ainda. Utilize o formulário abaixo para criar." />
            )}
          </tbody>
        </Table>
      </Panel>

      <Panel eyebrow="Gestão Operacional" title="Registrar Anotações de Histórico, Metas Financeiras e Experimentos">
        <OperationalForms campaigns={meta?.campaigns || []} />
      </Panel>
    </>
  );

  // 13. DIAGNOSTICS, ALERTS & GLOSSARY
  const diagnosticsTab = (
    <>
      <Panel eyebrow="Central de Alertas e Oportunidades" title="Sinais detectados automaticamente (Regras auditáveis)">
        <div style={{ padding: 19, display: "grid", gap: 12 }}>
          {meta?.alerts?.length ? (
            meta.alerts.map((al: any) => (
              <article
                key={al.id}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: "1px solid var(--a-line)",
                  background: "var(--a-panel-2)",
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <strong>{al.title}</strong>
                  <ToneBadge tone={al.tone} label={`Confiança ${al.confidence} · ${al.metricInvolved}`} />
                </div>
                <p style={{ margin: 0, fontSize: 12 }}>{al.simpleExplanation}</p>
                <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
                  <strong>Evidência ({al.periodLabel}):</strong> {al.evidence}
                </small>
                <small style={{ color: "#99afff", fontSize: 11 }}>
                  <strong>Ações de investigação:</strong> {al.investigationActions.join(" · ")}
                </small>
              </article>
            ))
          ) : (
            <Empty text="Nenhum alerta crítico detectado no período." />
          )}
        </div>
      </Panel>

      <Panel eyebrow="Central Educativa de Métricas" title="Glossário completo para gestores e administradores (Português Brasileiro)">
        <Table>
          <thead>
            <tr>
              <th>Termo Técnico</th>
              <th>Nome Amigável</th>
              <th>O que significa e Como interpretar</th>
              <th>Fórmula e Fonte</th>
              <th>Limitações e Exemplo</th>
            </tr>
          </thead>
          <tbody>
            {METRIC_GLOSSARY.map((g) => (
              <tr key={g.key}>
                <td><strong>{g.technicalName}</strong></td>
                <td>{g.friendlyName}</td>
                <td style={{ whiteSpace: "normal", minWidth: 260 }}>
                  {g.meaning} <br />
                  <small className="analytics-contact">{g.interpretation}</small>
                </td>
                <td style={{ whiteSpace: "normal", minWidth: 200 }}>
                  <code>{g.formula}</code>
                  <small className="analytics-contact">Fonte: {g.source}</small>
                </td>
                <td style={{ whiteSpace: "normal", minWidth: 240 }}>
                  <em>{g.example}</em>
                  <small className="analytics-contact">Limitação: {g.limitations}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </>
  );

  // 14. EVENTS
  const eventsTab = (
    <Panel eyebrow="Rastreamento de ponta a ponta" title="Últimos 100 eventos (Página, Web Vitals, Jornada e Campanha)">
      <Table>
        <thead>
          <tr>
            <th>Horário</th>
            <th>Evento</th>
            <th>Página</th>
            <th>Dispositivo</th>
            <th>Origem</th>
            <th>Campanha / ID</th>
            <th>Jornada / Sessão</th>
            <th>Detalhe</th>
          </tr>
        </thead>
        <tbody>
          {data.events.length ? (
            data.events.map((r: any, i: number) => (
              <tr key={i}>
                <td>{dateTime.format(new Date(r.occurred_at))}</td>
                <td><span className="analytics-event">{r.event_type}</span></td>
                <td>{r.page_key}</td>
                <td>{r.device_type || "—"} · {r.browser || "—"}</td>
                <td>{r.utm_source || short(r.referrer, 24)}</td>
                <td className="analytics-mono">{short(r.campaign_id || r.utm_campaign, 22)}</td>
                <td className="analytics-mono">{short(r.journey_id || r.session_id, 14)}</td>
                <td>{short(r.metadata?.metric ? `${r.metadata.metric}: ${r.metadata.value ?? ""}` : r.metadata?.eventName || r.checkout_url, 32)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow cols={8} text="Nenhum evento registrado neste período." />
          )}
        </tbody>
      </Table>
    </Panel>
  );

  // 15. SETTINGS & DATA HEALTH
  const dh = data.dataHealth;
  const settingsTab = (
    <>
      <div className="analytics-grid">
        <Panel eyebrow="Saúde e Confiabilidade dos Dados" title="Estado das Integrações e Credenciais (Sem expor segredos)">
          <div className="analytics-settings" style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Modo de Segurança Meta Ads</strong>
              <ToneBadge tone="green" label="100% SOMENTE LEITURA ATIVO" />
            </div>
            <p style={{ margin: 0 }}>
              Mesmo que o token possua permissões adicionais, o código bloqueia qualquer operação de criação, edição, pausa ou alteração de orçamento na Meta.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
              <div>• <strong>META_APP_ID:</strong> {dh.metaConfig.hasAppId ? "Configurado ✅" : "Ausente ❌"}</div>
              <div>• <strong>META_APP_SECRET:</strong> {dh.metaConfig.hasAppSecret ? "Configurado ✅" : "Ausente ❌"}</div>
              <div>• <strong>META_AD_ACCOUNT_ID:</strong> {dh.metaConfig.hasAdAccountId ? "Configurado ✅" : "Ausente ❌"}</div>
              <div>• <strong>META_ACCESS_TOKEN:</strong> {dh.metaConfig.hasAccessToken ? "Configurado ✅" : "Ausente ❌"}</div>
              <div>• <strong>Versão Graph API:</strong> {dh.metaConfig.apiVersion}</div>
              <div>• <strong>Fuso / Moeda Conta:</strong> {dh.accountTimezone} · {dh.accountCurrency}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <MetaSyncTrigger defaultDays={30} />
            </div>
          </div>
        </Panel>

        <Panel eyebrow="Qualidade da Coleta e Atribuição" title="Diagnóstico técnico de sincronização e webhooks">
          <div className="analytics-settings" style={{ display: "grid", gap: 8 }}>
            <div>
              • <strong>Última sincronização Meta Ads:</strong>{" "}
              {dh.lastMetaSync?.finished_at
                ? `${dateTime.format(new Date(dh.lastMetaSync.finished_at))} (${dh.lastMetaSync.status} · ${dh.lastMetaSync.imported_count} registros)`
                : "Ainda não executada"}
            </div>
            <div>
              • <strong>Último webhook Hotmart recebido:</strong>{" "}
              {dh.lastHotmartWebhookAt ? dateTime.format(new Date(dh.lastHotmartWebhookAt)) : "Nenhum no período"}
            </div>
            <div>
              • <strong>Deduplicação financeira Hotmart:</strong> {integer.format(dh.totalHotmartNotifications)} notificações recebidas →{" "}
              <strong>{integer.format(dh.uniqueHotmartTransactions)} transações únicas</strong> ({integer.format(dh.duplicateWebhookEvents)} eventos duplicados/atualizações consolidados).
            </div>
            <div>
              • <strong>Vendas sem atribuição de campanha:</strong> {integer.format(dh.unattributedSalesCount)} ({dh.unattributedSalesPct.toFixed(1)}% das vendas aprovadas).
            </div>
            <div>
              • <strong>Anúncios sem parâmetros UTM na URL de destino:</strong> {integer.format(dh.adsWithoutTrackingCount)} anúncio(s).
            </div>
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Histórico de Execuções do Sincronizador" title="Últimas sincronizações com a Meta Marketing API">
        <Table>
          <thead>
            <tr>
              <th>Início</th>
              <th>Fim</th>
              <th>Período Consultado</th>
              <th>Status</th>
              <th>Registros Importados</th>
              <th>Detalhe / Código de Erro</th>
            </tr>
          </thead>
          <tbody>
            {meta?.syncHistory?.length ? (
              meta.syncHistory.map((sh: any) => (
                <tr key={sh.id}>
                  <td>{dateTime.format(new Date(sh.started_at))}</td>
                  <td>{sh.finished_at ? dateTime.format(new Date(sh.finished_at)) : "Em execução"}</td>
                  <td>{sh.date_start} a {sh.date_end}</td>
                  <td>
                    <ToneBadge
                      tone={sh.status === "SUCCEEDED" ? "green" : sh.status === "FAILED" ? "red" : "yellow"}
                      label={sh.status}
                    />
                  </td>
                  <td>{integer.format(sh.imported_count || 0)}</td>
                  <td>{sh.error_message || "OK"}</td>
                </tr>
              ))
            ) : (
              <EmptyRow cols={6} text="Nenhuma execução de sincronização registrada ainda." />
            )}
          </tbody>
        </Table>
      </Panel>
    </>
  );

  const content = (
    {
      overview,
      meta: metaTab,
      campaigns: campaignsTab,
      adsets: adsetsTab,
      creatives: creativesTab,
      traffic: trafficTab,
      funnel: funnelTab,
      audience: audienceTab,
      products: productsTab,
      orders: ordersTab,
      financial: financialTab,
      compare: compareTab,
      diagnostics: diagnosticsTab,
      events: eventsTab,
      settings: settingsTab,
    } as Record<string, React.ReactNode>
  )[tab] || overview;

  return (
    <main className="analytics-app">
      <aside className="analytics-sidebar">
        <Link href="/landing-admin" className="analytics-brand">
          <span>PI</span>
          <div>
            <strong>Plugando IA</strong>
            <small>Analytics Pro</small>
          </div>
        </Link>
        <nav>
          {nav.map(([key, label, Icon]) => (
            <Link key={key} href={link(key)} className={tab === key ? "active" : ""}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="analytics-sidebar-footer">
          <span>🔒 Meta Ads 100% Somente Leitura</span>
          <form action="/landing-api/auth/logout" method="post">
            <button>Sair</button>
          </form>
        </div>
      </aside>
      <section className="analytics-content">
        <header className="analytics-topbar">
          <div>
            <p>Central de Inteligência Comercial, Tráfego Pago e Vendas</p>
            <h1>{active[1]}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div className="meta-mode-selector" aria-label="Modo de visualização">
              {(["simples", "intermediario", "completo"] as const).map((m) => (
                <Link key={m} className={mode === m ? "active" : ""} href={link(tab, m)}>
                  {m === "simples" ? "Simples" : m === "intermediario" ? "Intermediário" : "Completo"}
                </Link>
              ))}
            </div>
            <ThemeToggle />
            <form action="/landing-api/auth/logout" method="post">
              <button className="analytics-mobile-logout">Sair</button>
            </form>
          </div>
        </header>

        <form className="analytics-filters" method="get" style={{ flexWrap: "wrap" }}>
          <input type="hidden" name="tab" value={tab} />
          <input type="hidden" name="mode" value={mode} />
          <label>
            Período rápido
            <select name="days" defaultValue={String(days)}>
              <option value="1">Hoje (1 dia)</option>
              <option value="2">Últimos 2 dias</option>
              <option value="7">Últimos 7 dias</option>
              <option value="14">Últimos 14 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="60">Últimos 60 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="180">Últimos 180 dias</option>
              <option value="365">Último ano</option>
            </select>
          </label>
          <label>
            Início personalizado
            <input
              type="date"
              name="since"
              defaultValue={searchParams.since || ""}
              style={{
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--a-line)",
                background: "var(--a-panel-2)",
                color: "var(--a-text)",
                padding: "0 10px",
                fontSize: 12,
              }}
            />
          </label>
          <label>
            Fim personalizado
            <input
              type="date"
              name="until"
              defaultValue={searchParams.until || ""}
              style={{
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--a-line)",
                background: "var(--a-panel-2)",
                color: "var(--a-text)",
                padding: "0 10px",
                fontSize: 12,
              }}
            />
          </label>
          <label>
            Landing page / Curso
            <select name="page" defaultValue={page || "all"}>
              <option value="all">Todas as páginas</option>
              {data.pages.map((item: any) => (
                <option value={item.page_key} key={item.page_key}>
                  {item.title || item.page_key}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Aplicar filtros</button>
          <MetaSyncTrigger defaultDays={days} />
        </form>

        <div className="analytics-page">{content}</div>
      </section>
    </main>
  );
}

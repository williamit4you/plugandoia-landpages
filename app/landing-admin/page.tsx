import { getDashboard } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR");
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong>{detail ? <small>{detail}</small> : null}</article>;
}

function short(value: unknown, size = 42) {
  const result = String(value || "-");
  return result.length > size ? `${result.slice(0, size)}…` : result;
}

export default async function LandingAdmin({ searchParams }: { searchParams: { days?: string; page?: string } }) {
  const days = Number(searchParams.days || 30);
  const selectedPage = searchParams.page && searchParams.page !== "all" ? searchParams.page : null;
  const dashboard = await getDashboard({ days, pageKey: selectedPage });
  const summary = dashboard.summary;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><div className="admin-eyebrow">Plugando IA · Landpages</div><h1>Analytics de vendas</h1><p>Acessos, comportamento, campanhas e pedidos da Hotmart.</p></div>
        <form action="/landing-api/auth/logout" method="post"><button className="ghost-button">Sair</button></form>
      </header>

      <form className="filter-bar" method="get">
        <label>Página<select name="page" defaultValue={selectedPage || "all"}><option value="all">Todas</option>{dashboard.pages.map((item: any) => <option value={item.page_key} key={item.page_key}>{item.title || item.page_key}</option>)}</select></label>
        <label>Período<select name="days" defaultValue={String(days)}><option value="1">Hoje</option><option value="7">7 dias</option><option value="30">30 dias</option><option value="90">90 dias</option><option value="365">1 ano</option></select></label>
        <button type="submit">Aplicar</button>
      </form>

      <section className="metrics-grid">
        <Metric label="Visualizações" value={integer.format(summary.pageViews)} />
        <Metric label="Visitantes únicos" value={integer.format(summary.uniqueVisitors)} />
        <Metric label="Interações" value={integer.format(summary.interactions)} />
        <Metric label="Cliques no checkout" value={integer.format(summary.checkouts)} detail={`${summary.checkoutRate.toFixed(1)}% das visualizações`} />
        <Metric label="Vendas aprovadas" value={integer.format(summary.purchases)} detail={`${summary.purchaseRate.toFixed(1)}% dos checkouts`} />
        <Metric label="Receita" value={money.format(summary.revenue)} detail={`Comissão: ${money.format(summary.commission)}`} />
      </section>

      <section className="admin-panel">
        <div className="panel-title"><div><span>Conversão</span><h2>Funil das landing pages</h2></div></div>
        <div className="funnel-grid">{dashboard.funnel.map((item, index) => { const previous = index ? dashboard.funnel[index - 1].value : item.value; const rate = previous ? (item.value / previous) * 100 : 0; return <div className="funnel-step" key={item.label}><span>{item.label}</span><strong>{integer.format(item.value)}</strong><small>{index ? `${rate.toFixed(1)}% da etapa anterior` : "Entrada do funil"}</small></div>; })}</div>
      </section>

      <section className="admin-panel">
        <div className="panel-title"><div><span>Aquisição</span><h2>Origens e campanhas</h2></div></div>
        <div className="table-wrap"><table><thead><tr><th>Origem</th><th>Mídia</th><th>Campanha</th><th>Visitas</th><th>Sessões</th><th>Checkouts</th></tr></thead><tbody>{dashboard.sources.map((row: any, index: number) => <tr key={`${row.source}-${row.campaign}-${index}`}><td>{row.source}</td><td>{row.medium}</td><td>{row.campaign}</td><td>{row.views}</td><td>{row.sessions}</td><td>{row.checkouts}</td></tr>)}</tbody></table></div>
      </section>

      <section className="admin-panel">
        <div className="panel-title"><div><span>Hotmart</span><h2>Pedidos e vendas</h2></div><small>Dados pessoais visíveis somente neste painel autenticado.</small></div>
        <div className="table-wrap"><table><thead><tr><th>Recebido</th><th>Status</th><th>Produto</th><th>Comprador</th><th>Contato</th><th>Valor</th><th>Pagamento</th><th>Campanha</th><th>Transação</th></tr></thead><tbody>{dashboard.sales.map((row: any, index: number) => <tr key={`${row.transaction_id}-${row.event_name}-${index}`}><td>{dateTime.format(new Date(row.received_at))}</td><td><span className="status-pill">{row.status || row.event_name}</span></td><td>{short(row.product_name)}</td><td>{row.buyer_name || "-"}</td><td>{row.buyer_email || row.buyer_phone || "-"}</td><td>{row.amount == null ? "-" : money.format(Number(row.amount))}</td><td>{row.payment_type || "-"}{row.installments ? ` · ${row.installments}x` : ""}</td><td>{row.utm_campaign || row.source_code || "-"}</td><td className="mono">{short(row.transaction_id, 18)}</td></tr>)}</tbody></table></div>
      </section>

      <section className="admin-panel">
        <div className="panel-title"><div><span>Tempo real</span><h2>Últimos 100 eventos</h2></div></div>
        <div className="table-wrap"><table><thead><tr><th>Horário</th><th>Evento</th><th>Página</th><th>Dispositivo</th><th>Origem</th><th>Campanha</th><th>Sessão</th><th>Detalhe</th></tr></thead><tbody>{dashboard.events.map((row: any, index: number) => <tr key={`${row.session_id}-${row.occurred_at}-${index}`}><td>{dateTime.format(new Date(row.occurred_at))}</td><td><span className="event-pill">{row.event_type}</span></td><td>{row.page_key}</td><td>{row.device_type} · {row.browser}</td><td>{row.utm_source || short(row.referrer, 28)}</td><td>{row.utm_campaign || "-"}</td><td className="mono">{short(row.session_id, 10)}</td><td>{short(row.metadata?.eventName || row.checkout_url, 30)}</td></tr>)}</tbody></table></div>
      </section>
    </main>
  );
}

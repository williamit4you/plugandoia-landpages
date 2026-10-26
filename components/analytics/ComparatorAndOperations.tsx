"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR");

export function EntityComparator({
  campaigns,
  ads,
  products,
}: {
  campaigns: any[];
  ads: any[];
  products: any[];
}) {
  const [kind, setKind] = useState<"campaigns" | "ads" | "products">("campaigns");
  const [sortBy, setSortBy] = useState<"spend" | "ctr" | "cpc" | "sales" | "result">("result");
  const list = kind === "campaigns" ? campaigns : kind === "ads" ? ads : products;

  const sorted = [...list].sort((a, b) => {
    if (sortBy === "spend") return Number(b.spend || 0) - Number(a.spend || 0);
    if (sortBy === "ctr") return Number(b.linkCtr || b.conversionRate || 0) - Number(a.linkCtr || a.conversionRate || 0);
    if (sortBy === "cpc") return Number(a.linkCpc || 999999) - Number(b.linkCpc || 999999);
    if (sortBy === "sales") return Number(b.sales?.sales ?? b.sales ?? 0) - Number(a.sales?.sales ?? a.sales ?? 0);
    return Number(b.result ?? b.commission ?? -999999) - Number(a.result ?? a.commission ?? -999999);
  });

  // Identify highlights only when sample is sufficient
  const validCtr = list.filter((i) => Number(i.impressions || i.views || 0) >= 500);
  const bestCtrItem = [...validCtr].sort(
    (a, b) => Number(b.linkCtr || b.conversionRate || 0) - Number(a.linkCtr || a.conversionRate || 0),
  )[0];
  const validResult = list.filter((i) => Number(i.sales?.sales ?? i.sales ?? 0) >= 2);
  const bestResultItem = [...validResult].sort(
    (a, b) => Number(b.result ?? b.commission ?? -999999) - Number(a.result ?? a.commission ?? -999999),
  )[0];

  return (
    <div style={{ padding: 19, display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "var(--a-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          Dimensão:
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            style={{
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--a-line)",
              background: "var(--a-panel-2)",
              color: "var(--a-text)",
              padding: "0 10px",
              fontSize: 12,
            }}
          >
            <option value="campaigns">Campanhas ({campaigns.length})</option>
            <option value="ads">Anúncios / Criativos ({ads.length})</option>
            <option value="products">Produtos / Cursos ({products.length})</option>
          </select>
        </label>
        <label style={{ fontSize: 12, color: "var(--a-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          Ordenar por:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--a-line)",
              background: "var(--a-panel-2)",
              color: "var(--a-text)",
              padding: "0 10px",
              fontSize: 12,
            }}
          >
            <option value="result">Melhor resultado após anúncios / comissão</option>
            <option value="sales">Mais vendas atribuídas</option>
            <option value="ctr">Melhor taxa de clique / conversão</option>
            <option value="cpc">Menor custo por clique (CPC)</option>
            <option value="spend">Maior investimento</option>
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        <div style={{ padding: 12, borderRadius: 9, border: "1px solid var(--a-line)", background: "var(--a-panel-2)" }}>
          <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Destaque de Clique / Atração (amostra ≥ 500)</small>
          <strong style={{ display: "block", marginTop: 4, fontSize: 14 }}>
            {bestCtrItem ? bestCtrItem.name || bestCtrItem.title : "Evidência insuficiente (< 500 exibições)"}
          </strong>
        </div>
        <div style={{ padding: 12, borderRadius: 9, border: "1px solid var(--a-line)", background: "var(--a-panel-2)" }}>
          <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Destaque de Resultado Financeiro (≥ 2 vendas)</small>
          <strong style={{ display: "block", marginTop: 4, fontSize: 14 }}>
            {bestResultItem ? bestResultItem.name || bestResultItem.title : "Evidência insuficiente (< 2 vendas)"}
          </strong>
        </div>
      </div>

      <div className="analytics-table-wrap">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Item comparado</th>
              <th>Gasto / Preço</th>
              <th>Impressões / Visitas</th>
              <th>Cliques / Checkouts</th>
              <th>CTR / Taxa</th>
              <th>CPC</th>
              <th>Vendas</th>
              <th>Comissão</th>
              <th>Resultado após anúncios</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length ? (
              sorted.slice(0, 25).map((item, idx) => {
                const salesCount = Number(item.sales?.sales ?? item.sales ?? 0);
                const comm = item.sales?.commission ?? item.commission ?? null;
                const res = item.result ?? comm;
                return (
                  <tr key={item.id || item.slug || idx}>
                    <td>
                      <strong>{item.name || item.title}</strong>
                    </td>
                    <td>{item.spend != null ? money.format(item.spend) : item.price ? money.format(item.price) : "—"}</td>
                    <td>{integer.format(Number(item.impressions ?? item.views ?? 0))}</td>
                    <td>{integer.format(Number(item.link_clicks ?? item.checkouts ?? 0))}</td>
                    <td>
                      {item.linkCtr != null
                        ? `${(item.linkCtr * 100).toFixed(2)}%`
                        : item.conversionRate != null
                          ? `${Number(item.conversionRate).toFixed(2)}%`
                          : "—"}
                    </td>
                    <td>{item.linkCpc != null ? money.format(item.linkCpc) : "—"}</td>
                    <td>{integer.format(salesCount)}</td>
                    <td>{comm != null ? money.format(Number(comm)) : "—"}</td>
                    <td style={{ color: res != null ? (Number(res) >= 0 ? "#70d8a3" : "#f38e99") : undefined, fontWeight: 700 }}>
                      {res != null ? money.format(Number(res)) : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>Nenhum item disponível para comparação no período.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OperationalForms({ campaigns }: { campaigns: any[] }) {
  const router = useRouter();
  const [annTitle, setAnnTitle] = useState("");
  const [annCategory, setAnnCategory] = useState("CRIATIVO_SUBSTITUIDO");
  const [annDate, setAnnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [annDetails, setAnnDetails] = useState("");
  const [annCampaign, setAnnCampaign] = useState("");
  const [annStatus, setAnnStatus] = useState("");

  const [planName, setPlanName] = useState("Meta Mensal Principal");
  const [planBudget, setPlanBudget] = useState("3000");
  const [planRevenue, setPlanRevenue] = useState("9000");
  const [planMaxCpa, setPlanMaxCpa] = useState("65");
  const [planMinCtr, setPlanMinCtr] = useState("0.012");
  const [planMaxCpc, setPlanMaxCpc] = useState("2.50");
  const [planStatus, setPlanStatus] = useState("");

  const [expName, setExpName] = useState("");
  const [expHypothesis, setExpHypothesis] = useState("");
  const [expLabelA, setExpLabelA] = useState("Criativo A (Controle)");
  const [expLabelB, setExpLabelB] = useState("Criativo B (Variação)");
  const [expStatus, setExpStatus] = useState("");

  async function submitAnnotation(e: React.FormEvent) {
    e.preventDefault();
    setAnnStatus("Salvando...");
    const res = await fetch("/landing-api/admin/meta/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: annTitle,
        category: annCategory,
        occurredOn: annDate,
        details: annDetails,
        campaignId: annCampaign || null,
      }),
    });
    if (res.ok) {
      setAnnTitle("");
      setAnnDetails("");
      setAnnStatus("Anotação registrada!");
      router.refresh();
    } else {
      setAnnStatus("Erro ao salvar anotação.");
    }
  }

  async function submitPlan(e: React.FormEvent) {
    e.preventDefault();
    setPlanStatus("Salvando...");
    const res = await fetch("/landing-api/admin/meta/financial-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: planName,
        monthlyBudget: Number(planBudget),
        targetRevenue: Number(planRevenue),
        maxCpa: Number(planMaxCpa),
        minCtr: Number(planMinCtr),
        maxCpc: Number(planMaxCpc),
      }),
    });
    if (res.ok) {
      setPlanStatus("Meta financeira salva!");
      router.refresh();
    } else {
      setPlanStatus("Erro ao salvar meta.");
    }
  }

  async function submitExperiment(e: React.FormEvent) {
    e.preventDefault();
    setExpStatus("Salvando...");
    const res = await fetch("/landing-api/admin/meta/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: expName,
        hypothesis: expHypothesis,
        creatives: [{ label: expLabelA }, { label: expLabelB }],
      }),
    });
    if (res.ok) {
      setExpName("");
      setExpHypothesis("");
      setExpStatus("Experimento registrado!");
      router.refresh();
    } else {
      setExpStatus("Erro ao registrar experimento.");
    }
  }

  const inputStyle = {
    height: 34,
    borderRadius: 8,
    border: "1px solid var(--a-line)",
    background: "var(--a-panel-2)",
    color: "var(--a-text)",
    padding: "0 10px",
    fontSize: 12,
    width: "100%",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16, padding: 19 }}>
      <form onSubmit={submitAnnotation} style={{ display: "grid", gap: 8, padding: 14, borderRadius: 10, border: "1px solid var(--a-line)" }}>
        <strong style={{ fontSize: 13 }}>Registrar Anotação no Histórico</strong>
        <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
          Marque mudanças manuais (novo anúncio, alteração de preço ou página). Nenhuma alteração é enviada à Meta.
        </small>
        <input required placeholder="Título (ex: Novo vídeo no RabbitMQ)" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} style={inputStyle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <select value={annCategory} onChange={(e) => setAnnCategory(e.target.value)} style={inputStyle}>
            <option value="NOVO_ANUNCIO">Novo anúncio publicado</option>
            <option value="CRIATIVO_SUBSTITUIDO">Criativo substituído</option>
            <option value="ALTERACAO_PRECO">Alteração de preço</option>
            <option value="MUDANCA_LP">Mudança na landing page</option>
            <option value="PROMOCAO">Promoção iniciada/encerrada</option>
          </select>
          <input type="date" value={annDate} onChange={(e) => setAnnDate(e.target.value)} style={inputStyle} />
        </div>
        <select value={annCampaign} onChange={(e) => setAnnCampaign(e.target.value)} style={inputStyle}>
          <option value="">Todas as campanhas / Geral</option>
          {campaigns.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input placeholder="Observação opcional" value={annDetails} onChange={(e) => setAnnDetails(e.target.value)} style={inputStyle} />
        <button type="submit" style={{ height: 34, borderRadius: 8, background: "var(--a-blue)", color: "#fff", border: 0, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          Salvar Anotação
        </button>
        {annStatus && <small style={{ color: "#70d8a3", fontSize: 11 }}>{annStatus}</small>}
      </form>

      <form onSubmit={submitPlan} style={{ display: "grid", gap: 8, padding: 14, borderRadius: 10, border: "1px solid var(--a-line)" }}>
        <strong style={{ fontSize: 13 }}>Configurar Planejamento & Metas</strong>
        <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
          Define referências de orçamento mensal, CPA máximo, CTR mínimo e CPC máximo para os diagnósticos.
        </small>
        <input required placeholder="Nome do plano" value={planName} onChange={(e) => setPlanName(e.target.value)} style={inputStyle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input type="number" step="50" placeholder="Orçamento mensal (R$)" value={planBudget} onChange={(e) => setPlanBudget(e.target.value)} style={inputStyle} />
          <input type="number" step="100" placeholder="Meta de receita (R$)" value={planRevenue} onChange={(e) => setPlanRevenue(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <input type="number" step="1" placeholder="CPA máx (R$)" value={planMaxCpa} onChange={(e) => setPlanMaxCpa(e.target.value)} style={inputStyle} />
          <input type="number" step="0.001" placeholder="CTR mín (ex 0.01)" value={planMinCtr} onChange={(e) => setPlanMinCtr(e.target.value)} style={inputStyle} />
          <input type="number" step="0.1" placeholder="CPC máx (R$)" value={planMaxCpc} onChange={(e) => setPlanMaxCpc(e.target.value)} style={inputStyle} />
        </div>
        <button type="submit" style={{ height: 34, borderRadius: 8, background: "var(--a-blue)", color: "#fff", border: 0, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          Salvar Metas e Planejamento
        </button>
        {planStatus && <small style={{ color: "#70d8a3", fontSize: 11 }}>{planStatus}</small>}
      </form>

      <form onSubmit={submitExperiment} style={{ display: "grid", gap: 8, padding: 14, borderRadius: 10, border: "1px solid var(--a-line)" }}>
        <strong style={{ fontSize: 13 }}>Registrar Experimento de Criativos</strong>
        <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
          Documente hipóteses de teste A/B. O sistema evita declarar vencedor sem amostra mínima.
        </small>
        <input required placeholder="Nome do experimento" value={expName} onChange={(e) => setExpName(e.target.value)} style={inputStyle} />
        <input required placeholder="Hipótese testada (ex: Gancho de dor vs demonstração)" value={expHypothesis} onChange={(e) => setExpHypothesis(e.target.value)} style={inputStyle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input placeholder="Rótulo Variação A" value={expLabelA} onChange={(e) => setExpLabelA(e.target.value)} style={inputStyle} />
          <input placeholder="Rótulo Variação B" value={expLabelB} onChange={(e) => setExpLabelB(e.target.value)} style={inputStyle} />
        </div>
        <button type="submit" style={{ height: 34, borderRadius: 8, background: "var(--a-blue)", color: "#fff", border: 0, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          Criar Experimento
        </button>
        {expStatus && <small style={{ color: "#70d8a3", fontSize: 11 }}>{expStatus}</small>}
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { simulateProductProfitability } from "@/lib/metaDiagnostics";

type CourseOption = {
  slug: string;
  title: string;
  price: number;
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProfitabilitySimulator({
  courses,
  defaultSpend = 500,
}: {
  courses: CourseOption[];
  defaultSpend?: number;
}) {
  const initialCourse = courses[0] || { slug: "formacao-completa", title: "Formação Completa Plugando IA", price: 149.9 };
  const [selectedSlug, setSelectedSlug] = useState(initialCourse.slug);
  const [price, setPrice] = useState(initialCourse.price || 149.9);
  const [feePct, setFeePct] = useState(9.9);
  const [fixedFee, setFixedFee] = useState(2.49);
  const [extraCost, setExtraCost] = useState(0);
  const [marginPct, setMarginPct] = useState(25);
  const [conversionPct, setConversionPct] = useState(1.5);
  const [campaignSpend, setCampaignSpend] = useState(defaultSpend > 0 ? Math.round(defaultSpend) : 500);
  const [bumpPrice, setBumpPrice] = useState(27);
  const [bumpAcceptancePct, setBumpAcceptancePct] = useState(15);

  function handleCourseChange(slug: string) {
    setSelectedSlug(slug);
    const found = courses.find((c) => c.slug === slug);
    if (found && found.price > 0) setPrice(found.price);
  }

  const sim = simulateProductProfitability({
    productPrice: price,
    hotmartFeePct: feePct,
    fixedFeePerSale: fixedFee,
    additionalCostPerSale: extraCost,
    desiredMarginPct: marginPct,
    siteConversionRatePct: conversionPct,
    campaignSpend,
    orderBumpPrice: bumpPrice,
    orderBumpAcceptancePct: bumpAcceptancePct,
  });

  return (
    <div style={{ padding: 19, display: "grid", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
          gap: 12,
        }}
      >
        <label style={{ display: "grid", gap: 5, fontSize: 11, color: "var(--a-muted)", fontWeight: 700 }}>
          Curso de referência
          <select
            value={selectedSlug}
            onChange={(e) => handleCourseChange(e.target.value)}
            style={{
              height: 36,
              borderRadius: 8,
              border: "1px solid var(--a-line)",
              background: "var(--a-panel-2)",
              color: "var(--a-text)",
              padding: "0 10px",
              fontSize: 12,
            }}
          >
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title} ({money.format(c.price)})
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: 5, fontSize: 11, color: "var(--a-muted)", fontWeight: 700 }}>
          Preço de venda (R$)
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
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
        <label style={{ display: "grid", gap: 5, fontSize: 11, color: "var(--a-muted)", fontWeight: 700 }}>
          Taxa Hotmart (%)
          <input
            type="number"
            step="0.1"
            value={feePct}
            onChange={(e) => setFeePct(Number(e.target.value))}
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
        <label style={{ display: "grid", gap: 5, fontSize: 11, color: "var(--a-muted)", fontWeight: 700 }}>
          Custo extra / imposto por venda (R$)
          <input
            type="number"
            step="0.5"
            value={extraCost}
            onChange={(e) => setExtraCost(Number(e.target.value))}
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
        <label style={{ display: "grid", gap: 5, fontSize: 11, color: "var(--a-muted)", fontWeight: 700 }}>
          Conversão do site (%)
          <input
            type="number"
            step="0.1"
            value={conversionPct}
            onChange={(e) => setConversionPct(Number(e.target.value))}
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
        <label style={{ display: "grid", gap: 5, fontSize: 11, color: "var(--a-muted)", fontWeight: 700 }}>
          Margem desejada (%)
          <input
            type="number"
            step="1"
            value={marginPct}
            onChange={(e) => setMarginPct(Number(e.target.value))}
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
        <label style={{ display: "grid", gap: 5, fontSize: 11, color: "var(--a-muted)", fontWeight: 700 }}>
          Investimento simulado (R$)
          <input
            type="number"
            step="50"
            value={campaignSpend}
            onChange={(e) => setCampaignSpend(Number(e.target.value))}
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
        <label style={{ display: "grid", gap: 5, fontSize: 11, color: "var(--a-muted)", fontWeight: 700 }}>
          Order Bump (R$) · Aceitação (%)
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <input
              type="number"
              step="1"
              value={bumpPrice}
              onChange={(e) => setBumpPrice(Number(e.target.value))}
              aria-label="Preço do Order Bump"
              style={{
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--a-line)",
                background: "var(--a-panel-2)",
                color: "var(--a-text)",
                padding: "0 8px",
                fontSize: 12,
              }}
            />
            <input
              type="number"
              step="1"
              value={bumpAcceptancePct}
              onChange={(e) => setBumpAcceptancePct(Number(e.target.value))}
              aria-label="Taxa de aceitação do Order Bump"
              style={{
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--a-line)",
                background: "var(--a-panel-2)",
                color: "var(--a-text)",
                padding: "0 8px",
                fontSize: 12,
              }}
            />
          </div>
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--a-line)", background: "var(--a-panel-2)" }}>
          <span style={{ fontSize: 11, color: "var(--a-muted)" }}>Comissão líquida + Order Bump médio</span>
          <strong style={{ display: "block", fontSize: 20, marginTop: 4 }}>
            {money.format(sim.effectiveNetPerSale)}
          </strong>
          <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
            Base: {money.format(sim.netCommissionPerSale)} + Bump: {money.format(sim.orderBumpLiftPerSale)}/venda
          </small>
        </div>
        <div style={{ padding: 14, borderRadius: 10, border: "1px solid #276e50", background: "rgba(39,110,80,0.12)" }}>
          <span style={{ fontSize: 11, color: "#70d8a3" }}>CPA Máximo de Equilíbrio (Break-even)</span>
          <strong style={{ display: "block", fontSize: 20, marginTop: 4, color: "#70d8a3" }}>
            {money.format(sim.maxBreakEvenCpa)}
          </strong>
          <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
            CPA alvo com {marginPct}% margem: {money.format(sim.targetCpaWithMargin)}
          </small>
        </div>
        <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--a-line)", background: "var(--a-panel-2)" }}>
          <span style={{ fontSize: 11, color: "var(--a-muted)" }}>CPC Máximo de Equilíbrio</span>
          <strong style={{ display: "block", fontSize: 20, marginTop: 4 }}>
            {money.format(sim.maxBreakEvenCpc)}
          </strong>
          <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
            CPC alvo c/ margem: {money.format(sim.targetCpcWithMargin)} (conv. {conversionPct}%)
          </small>
        </div>
        <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--a-line)", background: "var(--a-panel-2)" }}>
          <span style={{ fontSize: 11, color: "var(--a-muted)" }}>Vendas p/ cobrir {money.format(campaignSpend)}</span>
          <strong style={{ display: "block", fontSize: 20, marginTop: 4 }}>
            {sim.salesToCoverSpend !== null ? `${sim.salesToCoverSpend} venda(s)` : "N/D"}
          </strong>
          <small style={{ color: "var(--a-muted)", fontSize: 11 }}>
            Ponto exato: {sim.exactBreakEvenSales ? sim.exactBreakEvenSales.toFixed(2) : "—"} vendas
          </small>
        </div>
      </div>

      <div className="analytics-table-wrap">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Cenário</th>
              <th>Conversão considerada</th>
              <th>Comissão efetiva / venda</th>
              <th>CPC máx. equilíbrio</th>
              <th>CPC alvo c/ margem</th>
              <th>Vendas estimadas ({money.format(campaignSpend)})</th>
              <th>Resultado após anúncios</th>
              <th>ROAS s/ comissão</th>
            </tr>
          </thead>
          <tbody>
            {sim.scenarios.map((sc) => (
              <tr key={sc.label}>
                <td>
                  <strong>{sc.label}</strong>
                </td>
                <td>{sc.conversionRatePct.toFixed(2)}%</td>
                <td>{money.format(sc.effectiveCommissionPerSale)}</td>
                <td>{money.format(sc.maxBreakEvenCpc)}</td>
                <td>{money.format(sc.targetCpcWithMargin)}</td>
                <td>{sc.estimatedSalesForSpend.toFixed(1)}</td>
                <td style={{ color: sc.estimatedNetResultForSpend >= 0 ? "#70d8a3" : "#f38e99", fontWeight: 700 }}>
                  {money.format(sc.estimatedNetResultForSpend)}
                </td>
                <td>{sc.roasOnCommission !== null ? `${sc.roasOnCommission.toFixed(2)}×` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

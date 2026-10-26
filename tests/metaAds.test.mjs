import test from "node:test";
import assert from "node:assert/strict";
import { allPages, MetaAdsError, metaConfigState } from "../lib/metaAds.ts";
import {
  diagnoseCampaign,
  diagnoseFunnelStages,
  METRIC_GLOSSARY,
  ratio,
  simulateProductProfitability,
} from "../lib/metaDiagnostics.ts";

test("pagina resultados e mantém token fora da URL (modo somente leitura GET)", async () => {
  const originalFetch = globalThis.fetch;
  const oldToken = process.env.META_ACCESS_TOKEN;
  const oldSecret = process.env.META_APP_SECRET;
  process.env.META_ACCESS_TOKEN = "test-token";
  process.env.META_APP_SECRET = "test-secret";
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), method: options.method, authorization: options.headers.Authorization });
    return new Response(
      JSON.stringify(
        calls.length === 1
          ? {
              data: [{ id: "1" }],
              paging: { next: "https://graph.facebook.com/v26.0/me/adaccounts?after=cursor&access_token=leaked" },
            }
          : { data: [{ id: "2" }] },
      ),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  try {
    const rows = await allPages("me/adaccounts", { fields: "id" });
    assert.deepEqual(
      rows.map((row) => row.id),
      ["1", "2"],
    );
    assert.equal(calls.length, 2);
    assert.ok(calls.every((call) => call.method === "GET"));
    assert.ok(calls.every((call) => call.authorization === "Bearer test-token"));
    assert.ok(calls.every((call) => !call.url.includes("access_token")));
  } finally {
    globalThis.fetch = originalFetch;
    if (oldToken === undefined) delete process.env.META_ACCESS_TOKEN;
    else process.env.META_ACCESS_TOKEN = oldToken;
    if (oldSecret === undefined) delete process.env.META_APP_SECRET;
    else process.env.META_APP_SECRET = oldSecret;
  }
});

test("classifica token expirado sem expor a mensagem privada da API", async () => {
  const originalFetch = globalThis.fetch;
  const oldToken = process.env.META_ACCESS_TOKEN;
  process.env.META_ACCESS_TOKEN = "test-token";
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { code: 190, message: "private-token" } }), { status: 401 });
  try {
    await assert.rejects(
      () => allPages("me/adaccounts", { fields: "id" }),
      (error) => {
        assert.ok(error instanceof MetaAdsError);
        assert.equal(error.code, "190");
        assert.ok(!error.message.includes("private-token"));
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (oldToken === undefined) delete process.env.META_ACCESS_TOKEN;
    else process.env.META_ACCESS_TOKEN = oldToken;
  }
});

test("trata limite da API (429 / código 17) com retry e preserva modo read-only", async () => {
  const originalFetch = globalThis.fetch;
  const oldToken = process.env.META_ACCESS_TOKEN;
  process.env.META_ACCESS_TOKEN = "test-token";
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts++;
    if (attempts === 1) {
      return new Response(JSON.stringify({ error: { code: 17, message: "User request limit reached" } }), {
        status: 429,
        headers: { "retry-after": "0" },
      });
    }
    return new Response(JSON.stringify({ data: [{ id: "act_123" }] }), { status: 200 });
  };
  try {
    const rows = await allPages("me/adaccounts", { fields: "id" });
    assert.equal(attempts, 2);
    assert.equal(rows[0].id, "act_123");
    assert.equal(metaConfigState().readOnlyMode, true);
  } finally {
    globalThis.fetch = originalFetch;
    if (oldToken === undefined) delete process.env.META_ACCESS_TOKEN;
    else process.env.META_ACCESS_TOKEN = oldToken;
  }
});

test("cálculos matemáticos de CTR, CPC, CPA, ROAS e simulador de rentabilidade com order bump", () => {
  assert.equal(ratio(150, 10000), 0.015);
  assert.equal(ratio(100, 0), null);
  assert.equal(ratio(null, 100), null);

  const sim = simulateProductProfitability({
    productPrice: 149.9,
    hotmartFeePct: 9.9,
    fixedFeePerSale: 2.49,
    additionalCostPerSale: 0,
    desiredMarginPct: 20,
    siteConversionRatePct: 2.0,
    campaignSpend: 500,
    orderBumpPrice: 27,
    orderBumpAcceptancePct: 20,
  });

  assert.ok(sim.netCommissionPerSale > 130 && sim.netCommissionPerSale < 135);
  assert.ok(sim.orderBumpLiftPerSale > 4.5);
  assert.equal(sim.effectiveNetPerSale, sim.netCommissionPerSale + sim.orderBumpLiftPerSale);
  assert.equal(sim.maxBreakEvenCpa, sim.effectiveNetPerSale);
  assert.ok(Math.abs(sim.maxBreakEvenCpc - sim.maxBreakEvenCpa * 0.02) < 0.0001);
  assert.equal(sim.salesToCoverSpend, 4);
  assert.equal(sim.scenarios.length, 3);
  assert.equal(sim.scenarios[0].label, "Pessimista");
  assert.equal(sim.scenarios[1].label, "Base");
  assert.equal(sim.scenarios[2].label, "Otimista");
});

test("diagnóstico inteligente respeita tamanho mínimo de amostra e avalia rentabilidade", () => {
  // Amostra insuficiente (5 impressões) -> deve ser cinza
  const smallSample = diagnoseCampaign(
    { id: "1", name: "Teste 5 imp", impressions: 5, link_clicks: 0, spend: 1.5 },
    0.015,
  );
  assert.equal(smallSample[0].tone, "gray");

  // Campanha rentável com comissão cobrindo investimento -> verde
  const profitable = diagnoseCampaign(
    {
      id: "2",
      name: "Campanha Vencedora",
      impressions: 5000,
      link_clicks: 90,
      spend: 120,
      site: { sessions: 80, checkouts: 10 },
      sales: { sales: 3, commission: 240, revenue: 269.7 },
    },
    0.015,
  );
  assert.ok(profitable.some((d) => d.tone === "green"));

  // Campanha com gasto elevado e 0 vendas -> vermelho
  const unprofitable = diagnoseCampaign(
    {
      id: "3",
      name: "Campanha Sem Retorno",
      impressions: 8000,
      link_clicks: 25,
      spend: 250,
      site: { sessions: 20, checkouts: 0 },
      sales: { sales: 0, commission: 0 },
    },
    0.015,
  );
  assert.ok(unprofitable.some((d) => d.tone === "red"));
});

test("diagnóstico visual avalia as 7 etapas do funil separadamente e glossário está completo", () => {
  const stages = diagnoseFunnelStages({
    impressions: 12000,
    cpm: 25,
    frequency: 1.8,
    linkClicks: 180,
    outboundClicks: 150,
    linkCtr: 0.015,
    linkCpc: 1.66,
    sessions: 125,
    attributedSessions: 115,
    contentViews: 70,
    interactions: 40,
    avgScrollDepth: 65,
    avgLcpMs: 1800,
    jsErrors: 0,
    checkouts: 15,
    purchases: 4,
    spend: 300,
    commission: 420,
    attributedCommission: 420,
  });

  assert.equal(stages.length, 7);
  assert.deepEqual(
    stages.map((s) => s.stageKey),
    [
      "delivery",
      "interest_clicks",
      "site_arrival",
      "lp_engagement",
      "checkout_click",
      "approved_purchase",
      "profitability",
    ],
  );
  assert.equal(stages[0].tone, "green");
  assert.equal(stages[6].tone, "green");
  assert.ok(METRIC_GLOSSARY.length >= 10);
});

export type DiagnosticTone = "green" | "yellow" | "red" | "gray";

export type Diagnostic = {
  tone: DiagnosticTone;
  title: string;
  evidence: string;
  action: string;
  metric?: string;
  reference?: string;
  sampleSize?: string;
  hypotheses?: string[];
};

export type StageDiagnostic = {
  stageKey:
    | "delivery"
    | "interest_clicks"
    | "site_arrival"
    | "lp_engagement"
    | "checkout_click"
    | "approved_purchase"
    | "profitability";
  stageLabel: string;
  tone: DiagnosticTone;
  statusLabel: string;
  metricObserved: string;
  referenceUsed: string;
  evidence: string;
  sampleVolume: string;
  possibleCause: string;
  nextInvestigation: string;
};

export type SmartAlert = {
  id: string;
  tone: DiagnosticTone;
  kind: "problem" | "attention" | "opportunity" | "data_health";
  title: string;
  metricInvolved: string;
  periodLabel: string;
  evidence: string;
  confidence: "alta" | "média" | "baixa";
  simpleExplanation: string;
  investigationActions: string[];
};

export type MetricGlossaryEntry = {
  key: string;
  technicalName: string;
  friendlyName: string;
  meaning: string;
  formula: string;
  source: string;
  interpretation: string;
  factors: string;
  limitations: string;
  example: string;
};

export const METRIC_GLOSSARY: MetricGlossaryEntry[] = [
  {
    key: "spend",
    technicalName: "Spend (Valor gasto)",
    friendlyName: "Quanto investi nos anúncios",
    meaning: "Valor efetivamente consumido pelos anúncios na Meta durante o período selecionado.",
    formula: "Soma de spend diário reportado pela Meta Insights API",
    source: "Meta Marketing API",
    interpretation: "Representa custo publicitário incorrido, diferente do orçamento configurado.",
    factors: "Alterações de orçamento, leilão, competitividade do público e tempo de veiculação.",
    limitations: "Pode sofrer pequenos ajustes de faturamento da Meta até o fechamento diário.",
    example: "Você investiu R$ 150,00 nos últimos 7 dias.",
  },
  {
    key: "impressions",
    technicalName: "Impressions (Impressões)",
    friendlyName: "Quantas vezes os anúncios apareceram",
    meaning: "Total de vezes que um anúncio foi exibido na tela, contando repetições para a mesma pessoa.",
    formula: "Contagem bruta de exibições na Meta",
    source: "Meta Marketing API",
    interpretation: "Indica volume de exposição. Não representa pessoas diferentes.",
    factors: "Orçamento investido, tamanho do público e CPM do leilão.",
    limitations: "Uma mesma pessoa pode gerar várias impressões.",
    example: "Seu anúncio apareceu 10 mil vezes.",
  },
  {
    key: "reach",
    technicalName: "Reach (Alcance)",
    friendlyName: "Pessoas alcançadas (estimativa)",
    meaning: "Estimativa da Meta de quantas pessoas diferentes viram o anúncio pelo menos uma vez.",
    formula: "Métrica agregada não aditiva calculada pela Meta",
    source: "Meta Marketing API",
    interpretation: "Ajuda a diferenciar expansão de público de repetição para as mesmas pessoas.",
    factors: "Tamanho do público, orçamento e duração da campanha.",
    limitations: "Não pode ser somado entre dias ou entre campanhas diferentes sem duplicar pessoas.",
    example: "Cerca de 6.200 pessoas únicas viram este anúncio no dia.",
  },
  {
    key: "frequency",
    technicalName: "Frequency (Frequência)",
    friendlyName: "Repetições por pessoa",
    meaning: "Média de vezes que cada pessoa alcançada viu o anúncio.",
    formula: "Impressões ÷ Alcance",
    source: "Meta Marketing API",
    interpretation: "Frequência muito alta acompanhada de queda no CTR e alta no CPC sugere saturação do criativo.",
    factors: "Público pequeno com orçamento elevado ou campanha rodando há muitos dias.",
    limitations: "É uma média; parte do público pode ter visto mais vezes que a média.",
    example: "Frequência de 2,4 significa que, em média, o anúncio apareceu 2,4 vezes por pessoa alcançada.",
  },
  {
    key: "cpm",
    technicalName: "CPM — Custo por mil impressões",
    friendlyName: "Custo para mostrar 1.000 vezes",
    meaning: "Quanto você paga, em média, a cada mil exibições do anúncio.",
    formula: "(Valor gasto ÷ Impressões) × 1.000",
    source: "Meta Marketing API",
    interpretation: "Mede o preço do leilão para o público e posicionamento escolhidos.",
    factors: "Concorrência no leilão, sazonalidade, segmentação restrita e qualidade percebida do anúncio.",
    limitations: "CPM baixo sozinho não garante cliques nem vendas.",
    example: "CPM de R$ 28,00 significa R$ 28 gastos a cada 1.000 exibições.",
  },
  {
    key: "link_clicks",
    technicalName: "Inline Link Clicks (Cliques no link)",
    friendlyName: "Cliques no link do anúncio",
    meaning: "Cliques especificamente no link ou botão principal que aponta para o destino do anúncio.",
    formula: "Contagem de inline_link_clicks na Meta",
    source: "Meta Marketing API",
    interpretation: "Mais preciso que cliques totais, pois exclui curtidas, cliques no perfil ou expansão de texto.",
    factors: "Atratividade da imagem/vídeo, clareza da promessa e chamada para ação (CTA).",
    limitations: "Nem todo clique no link aguarda a página carregar completamente no navegador.",
    example: "120 cliques no link foram registrados.",
  },
  {
    key: "outbound_clicks",
    technicalName: "Outbound Clicks (Cliques de saída)",
    friendlyName: "Cliques que saíram da Meta rumo ao site",
    meaning: "Cliques que levaram a pessoa para fora do ambiente do Facebook/Instagram.",
    formula: "Soma de outbound_clicks reportada pela Meta",
    source: "Meta Marketing API",
    interpretation: "É a métrica da Meta mais próxima da chegada à landing page.",
    factors: "Intenção real do clique e posicionamento do anúncio.",
    limitations: "Ainda pode ser maior que as sessões do site devido a fechamento antes do carregamento ou bloqueadores.",
    example: "105 cliques de saída registrados para 92 sessões carregadas no site.",
  },
  {
    key: "link_ctr",
    technicalName: "CTR no link — Taxa de cliques no link",
    friendlyName: "Percentual de exibições que clicaram no link",
    meaning: "Proporção de impressões que resultaram em clique no link principal.",
    formula: "(Cliques no link ÷ Impressões) × 100",
    source: "Meta Marketing API (calculado)",
    interpretation: "Mede o poder de atração do criativo e da oferta inicial perante o público.",
    factors: "Gancho visual nos primeiros segundos, título, adequação do público e posicionamento.",
    limitations: "Um CTR alto pode vir de curiosidade sem intenção de compra se a página não converter.",
    example: "CTR de 1,50% significa 15 cliques no link a cada 1.000 impressões.",
  },
  {
    key: "link_cpc",
    technicalName: "CPC no link — Custo por clique no link",
    friendlyName: "Quanto custou cada clique no link",
    meaning: "Valor médio investido para gerar cada clique no link do anúncio.",
    formula: "Valor gasto ÷ Cliques no link",
    source: "Meta Marketing API (calculado)",
    interpretation: "Resulta da combinação entre o preço do leilão (CPM) e a taxa de clique (CTR).",
    factors: "Se o CPM sobe ou o CTR cai, o CPC fica mais caro.",
    limitations: "Cliques baratos de públicos desqualificados não geram vendas.",
    example: "Gastando R$ 120 para 100 cliques no link, o CPC é R$ 1,20.",
  },
  {
    key: "cpa",
    technicalName: "CPA — Custo por aquisição atribuída",
    friendlyName: "Custo em anúncios por venda atribuída",
    meaning: "Quanto você investiu em anúncios para cada venda confirmada e atribuída.",
    formula: "Valor gasto ÷ Vendas aprovadas atribuídas",
    source: "Cruzamento Meta Ads × Hotmart",
    interpretation: "Se o CPA for menor que a comissão líquida do produto, a campanha se paga.",
    factors: "CPC do anúncio, conversão da landing page e conversão do checkout Hotmart.",
    limitations: "Depende da atribuição técnica (UTMs/sessão/jornada); vendas não atribuídas não entram no denominador da campanha.",
    example: "Você investiu R$ 150 para gerar 3 vendas atribuídas (CPA = R$ 50,00).",
  },
  {
    key: "roas",
    technicalName: "ROAS — Retorno sobre gasto publicitário",
    friendlyName: "Quantas vezes o valor investido voltou",
    meaning: "Relação entre a receita (bruta ou comissão líquida) e o valor investido em anúncios.",
    formula: "Receita (ou Comissão) atribuída ÷ Investimento correspondente",
    source: "Cruzamento Meta Ads × Hotmart",
    interpretation: "ROAS sobre comissão acima de 1,00× indica que a comissão superou o gasto em anúncios.",
    factors: "Ticket médio, order bumps, CPA e taxa de conversão da página.",
    limitations: "Nunca misture receita geral da empresa com gasto de apenas uma campanha para calcular ROAS individual.",
    example: "Gasto de R$ 100 com R$ 240 em comissões gera ROAS sobre comissão de 2,40×.",
  },
  {
    key: "net_result",
    technicalName: "Resultado após anúncios (Margem de contribuição de mídia)",
    friendlyName: "Quanto sobrou após pagar os anúncios",
    meaning: "Diferença entre a comissão líquida confirmada na Hotmart e o investimento em anúncios.",
    formula: "Comissão líquida ajustada − Investimento Meta Ads",
    source: "Cruzamento Meta Ads × Hotmart",
    interpretation: "Mostra se a operação comercial gerou caixa positivo após descontar o tráfego pago.",
    factors: "Volume de vendas, comissão por venda, reembolsos e gasto em anúncios.",
    limitations: "Não é lucro contábil definitivo da empresa (não desconta impostos corporativos ou custos fixos externos).",
    example: "Comissões de R$ 450 menos R$ 150 de anúncios = +R$ 300 após anúncios.",
  },
];

export const ratio = (numerator: number | null | undefined, denominator: number | null | undefined) =>
  numerator === null ||
  numerator === undefined ||
  denominator === null ||
  denominator === undefined ||
  denominator <= 0
    ? null
    : numerator / denominator;

export type CampaignDiagnosticInput = {
  id: string;
  name: string;
  impressions: number | null;
  link_clicks: number | null;
  outbound_clicks?: number | null;
  spend: number | null;
  frequency?: number | null;
  cpm?: number | null;
  sales?: { sales?: number; commission?: number | null; revenue?: number | null } | null;
  site?: { sessions?: number; views?: number; checkouts?: number; interactions?: number } | null;
};

export type DiagnosticTargets = {
  minCtr?: number | null; // e.g., 0.01 (1%)
  maxCpc?: number | null; // e.g., 2.50
  maxCpa?: number | null; // e.g., 60.00
  minCheckoutRate?: number | null; // e.g., 0.05 (5%)
  minPurchaseRate?: number | null; // e.g., 0.15 (15%)
};

export function diagnoseCampaign(
  campaign: CampaignDiagnosticInput,
  referenceCtr: number | null,
  targets?: DiagnosticTargets,
): Diagnostic[] {
  const impressions = campaign.impressions == null ? null : Number(campaign.impressions);
  const clicks = campaign.link_clicks == null ? null : Number(campaign.link_clicks);
  const outbound = campaign.outbound_clicks == null ? null : Number(campaign.outbound_clicks);
  const spend = campaign.spend == null ? null : Number(campaign.spend);
  const frequency = campaign.frequency == null ? null : Number(campaign.frequency);
  const ctr = ratio(clicks, impressions);
  const cpc = ratio(spend, clicks);
  const targetCtr = targets?.minCtr ?? referenceCtr;

  if (impressions === null || impressions < 200) {
    return [
      {
        tone: "gray",
        title: "Amostra insuficiente para diagnóstico conclusivo",
        metric: "Impressões",
        sampleSize: `${impressions ?? 0} impressões`,
        reference: "Mínimo recomendado: 200+ impressões para leitura inicial e 1.000+ para significância de CTR",
        evidence: `Impressões registradas: ${impressions ?? "indisponível"}. Um anúncio ou campanha com poucas impressões não pode receber diagnóstico definitivo.`,
        action: "Aguarde maior entrega ou amplie o período analisado antes de tomar qualquer decisão.",
      },
    ];
  }

  const result: Diagnostic[] = [];

  // 1. Muitas impressões e poucos cliques / CTR baixo
  if (impressions >= 1000 && ctr !== null && targetCtr !== null && ctr < targetCtr * 0.75) {
    const diffPct = ((ctr - targetCtr) / targetCtr) * 100;
    result.push({
      tone: ctr < targetCtr * 0.5 ? "red" : "yellow",
      title: "Muitas impressões e poucos cliques (CTR abaixo da referência)",
      metric: "CTR no link",
      sampleSize: `${impressions.toLocaleString("pt-BR")} impressões · ${clicks ?? 0} cliques`,
      reference: `${(targetCtr * 100).toFixed(2)}%`,
      evidence: `O anúncio está sendo exibido, mas gera poucos cliques em relação à referência utilizada: CTR atual de ${(ctr * 100).toFixed(2)}% (${diffPct.toFixed(1)}% vs referência de ${(targetCtr * 100).toFixed(2)}%).`,
      hypotheses: [
        "Criativo pouco atrativo nos primeiros segundos",
        "Mensagem ou promessa pouco clara no anúncio",
        "Público inadequado para a oferta",
        "Posicionamento de baixo desempenho",
      ],
      action: "Investigue os criativos e recortes de posicionamento. Estas hipóteses orientam a investigação e não são causas comprovadas.",
    });
  }

  // 2. CPC alto
  if (clicks !== null && clicks >= 25 && cpc !== null && targets?.maxCpc && cpc > targets.maxCpc) {
    result.push({
      tone: cpc > targets.maxCpc * 1.35 ? "red" : "yellow",
      title: "CPC acima da referência configurada",
      metric: "CPC no link",
      sampleSize: `${clicks} cliques no link`,
      reference: `Máximo de R$ ${targets.maxCpc.toFixed(2)}`,
      evidence: `Cada clique está custando R$ ${cpc.toFixed(2)}, acima da referência de R$ ${targets.maxCpc.toFixed(2)}.`,
      hypotheses: ["CPM elevado no leilão", "CTR abaixo do ideal encarecendo o clique", "Público muito restrito"],
      action: "Compare CPM, CTR, histórico e posicionamentos para identificar se o custo vem do leilão ou da taxa de clique.",
    });
  }

  // 3. Frequência crescente / elevada
  if (frequency !== null && frequency >= 2.8 && impressions >= 1500) {
    const lowCtr = ctr !== null && targetCtr !== null && ctr < targetCtr * 0.9;
    result.push({
      tone: lowCtr ? "yellow" : "gray",
      title: lowCtr
        ? "Frequência elevada acompanhada de sinal de desgaste"
        : "Frequência de exibição em elevação",
      metric: "Frequência",
      sampleSize: `${impressions.toLocaleString("pt-BR")} impressões`,
      reference: "Faixa usual de atenção: > 2,8 exibições por pessoa",
      evidence: `As mesmas pessoas estão recebendo o anúncio repetidamente, em média ${frequency.toFixed(2)} vezes.${lowCtr ? " Há também CTR abaixo da referência, sugerindo possível fadiga do criativo (sem afirmar causalidade)." : ""}`,
      hypotheses: ["Público pequeno para o orçamento", "Mesmo criativo em exibição prolongada"],
      action: "Compare a evolução diária de frequência, CTR e CPC antes de substituir criativos.",
    });
  }

  // 4. Muitos cliques e poucas visitas ao site
  const clickRef = outbound && outbound > 0 ? outbound : clicks;
  const sessions = campaign.site?.sessions ?? null;
  if (clickRef !== null && clickRef >= 40 && sessions !== null) {
    const arrivalRate = ratio(sessions, clickRef);
    if (arrivalRate !== null && arrivalRate < 0.55) {
      result.push({
        tone: arrivalRate < 0.35 ? "red" : "yellow",
        title: "Diferença elevada entre cliques e visitas atribuídas no site",
        metric: "Taxa de chegada ao site",
        sampleSize: `${clickRef} cliques vs ${sessions} sessões atribuídas`,
        reference: "Referência técnica usual: 65% a 85% de chegada após cliques de saída",
        evidence: `Apenas ${(arrivalRate * 100).toFixed(1)}% dos cliques resultaram em sessão atribuída por ID na página.`,
        hypotheses: [
          "URL do anúncio sem parâmetro campaign_id={{campaign.id}} ou utm_campaign",
          "Tempo de carregamento da página em redes móveis",
          "Abandono antes do carregamento completo ou bloqueadores de scripts",
        ],
        action: "Verifique a URL de destino do anúncio e os indicadores de Web Vitals (LCP) da landing page.",
      });
    }
  }

  // 5. Muitas visitas e poucos checkouts
  const checkouts = campaign.site?.checkouts ?? 0;
  if (sessions !== null && sessions >= 60) {
    const checkoutRate = checkouts / sessions;
    const minCheckout = targets?.minCheckoutRate ?? 0.03;
    if (checkoutRate < minCheckout) {
      result.push({
        tone: checkoutRate < minCheckout * 0.5 ? "red" : "yellow",
        title: "Muitas visitas atribuídas e poucos cliques no checkout",
        metric: "Taxa de clique no checkout",
        sampleSize: `${sessions} sessões atribuídas · ${checkouts} checkouts`,
        reference: `${(minCheckout * 100).toFixed(1)}%`,
        evidence: `${(checkoutRate * 100).toFixed(2)}% das sessões iniciaram o checkout (${checkouts} de ${sessions}).`,
        hypotheses: [
          "Clareza da oferta ou promessa da página",
          "Percepção de preço ou posicionamento do botão CTA",
          "Desalinhamento entre a promessa do anúncio e o conteúdo da landing page",
          "Experiência em dispositivos móveis",
        ],
        action: "Verifique profundidade de rolagem, cliques nos CTAs e compatibilidade entre criativo e landing page.",
      });
    }
  }

  // 6. Muitos checkouts e poucas compras
  const salesCount = Number(campaign.sales?.sales || 0);
  if (checkouts >= 20) {
    const purchaseRate = salesCount / checkouts;
    const minPurchase = targets?.minPurchaseRate ?? 0.1;
    if (purchaseRate < minPurchase) {
      result.push({
        tone: salesCount === 0 ? "red" : "yellow",
        title: "Muitos inícios de checkout e poucas compras confirmadas",
        metric: "Conversão de checkout em compra",
        sampleSize: `${checkouts} checkouts · ${salesCount} vendas atribuídas`,
        reference: `${(minPurchase * 100).toFixed(1)}%`,
        evidence: `Apenas ${(purchaseRate * 100).toFixed(1)}% dos checkouts atribuídos geraram compra aprovada na Hotmart.`,
        hypotheses: [
          "Atrito no preenchimento ou meios de pagamento no checkout",
          "Parcelamento ou valor total no checkout diferente da expectativa",
          "Vendas concluídas por outra sessão sem preservação do parâmetro SRC/journey_id",
        ],
        action: "Inspecione os eventos de webhook da Hotmart, meios de pagamento recusados e vendas sem atribuição.",
      });
    }
  }

  // 7. Gasto alto e poucas vendas / Avaliação financeira
  const commission = campaign.sales?.commission == null ? null : Number(campaign.sales.commission);
  const cpa = ratio(spend, salesCount);
  if (spend !== null && spend >= 50) {
    if (salesCount === 0 && spend >= 100) {
      result.push({
        tone: "red",
        title: "Investimento relevante sem vendas atribuídas no período",
        metric: "Resultado após anúncios",
        sampleSize: `Gasto: R$ ${spend.toFixed(2)} · 0 vendas atribuídas`,
        reference: "Ponto de equilíbrio (Comissão ≥ Investimento)",
        evidence: `Foram investidos R$ ${spend.toFixed(2)} sem registro de venda atribuída a esta campanha (verifique também se há vendas não atribuídas na Hotmart).`,
        action: "Audite se os parâmetros UTM/SRC estão ativos nos anúncios antes de concluir falta de conversão.",
      });
    } else if (commission !== null && salesCount >= 2) {
      if (commission >= spend) {
        result.push({
          tone: "green",
          title: "Desempenho favorável: comissão atribuída supera o investimento",
          metric: "ROAS sobre comissão / Resultado líquido",
          sampleSize: `${salesCount} vendas atribuídas · Gasto R$ ${spend.toFixed(2)}`,
          reference: targets?.maxCpa ? `CPA máx R$ ${targets.maxCpa.toFixed(2)}` : "Comissão atribuída ≥ Investimento",
          evidence: `Comissão atribuída de R$ ${commission.toFixed(2)} para R$ ${spend.toFixed(2)} investidos (saldo de +R$ ${(commission - spend).toFixed(2)}${cpa ? `, CPA de R$ ${cpa.toFixed(2)}` : ""}).`,
          action: "Mantenha o acompanhamento da estabilidade do CPA e da frequência do criativo.",
        });
      } else {
        result.push({
          tone: "red",
          title: "Gasto superior à comissão atribuída no período",
          metric: "Resultado após anúncios",
          sampleSize: `${salesCount} vendas atribuídas · Gasto R$ ${spend.toFixed(2)}`,
          reference: "Comissão atribuída ≥ Investimento",
          evidence: `Investimento de R$ ${spend.toFixed(2)} frente a R$ ${commission.toFixed(2)} de comissão atribuída (diferença de -R$ ${(spend - commission).toFixed(2)}).`,
          action: "Compare CPA atual com o CPA de equilíbrio do produto e verifique se há vendas não atribuídas.",
        });
      }
    }
  }

  if (!result.length) {
    result.push({
      tone: "gray",
      title: "Indicadores dentro da faixa esperada ou em maturação",
      evidence: `Volume analisado: ${impressions.toLocaleString("pt-BR")} impressões e ${clicks ?? 0} cliques no link. Nenhum desvio crítico ou ganho conclusivo detectado.`,
      action: "Continue monitorando a acumulação de dados e o funil completo.",
    });
  }

  return result;
}

export type FunnelStageInput = {
  impressions: number | null;
  cpm: number | null;
  frequency: number | null;
  linkClicks: number | null;
  outboundClicks: number | null;
  linkCtr: number | null;
  linkCpc: number | null;
  sessions: number | null;
  attributedSessions: number | null;
  contentViews: number | null;
  interactions: number | null;
  avgScrollDepth: number | null;
  avgLcpMs: number | null;
  jsErrors: number | null;
  checkouts: number | null;
  purchases: number | null;
  spend: number | null;
  commission: number | null;
  attributedCommission: number | null;
  targets?: DiagnosticTargets;
};

export function diagnoseFunnelStages(input: FunnelStageInput): StageDiagnostic[] {
  const stages: StageDiagnostic[] = [];

  // 1. Entrega dos anúncios
  const imp = input.impressions ?? 0;
  if (input.impressions === null || imp < 200) {
    stages.push({
      stageKey: "delivery",
      stageLabel: "1. Entrega dos anúncios",
      tone: "gray",
      statusLabel: "Dados insuficientes",
      metricObserved: `Impressões: ${input.impressions ?? "N/D"} · CPM: ${input.cpm ? `R$ ${input.cpm.toFixed(2)}` : "N/D"}`,
      referenceUsed: "Mínimo de 200 impressões no período",
      evidence: "Ainda não há volume suficiente de exibições sincronizadas da Meta Ads.",
      sampleVolume: `${imp} impressões`,
      possibleCause: "Campanha recém-iniciada, pausada ou sincronização pendente.",
      nextInvestigation: "Verifique o status de sincronização da Meta Ads e o período selecionado.",
    });
  } else {
    const highFreq = (input.frequency ?? 0) > 3.2;
    const highCpm = (input.cpm ?? 0) > 65;
    stages.push({
      stageKey: "delivery",
      stageLabel: "1. Entrega dos anúncios",
      tone: highFreq || highCpm ? "yellow" : "green",
      statusLabel: highFreq || highCpm ? "Atenção no leilão/frequência" : "Entrega saudável",
      metricObserved: `${imp.toLocaleString("pt-BR")} impressões · CPM ${input.cpm ? `R$ ${input.cpm.toFixed(2)}` : "N/D"} · Freq. ${input.frequency ? input.frequency.toFixed(2) : "N/D"}`,
      referenceUsed: "Frequência ≤ 3,2 e CPM estável no histórico da conta",
      evidence: highFreq
        ? `Frequência média de ${input.frequency?.toFixed(2)} indica repetição elevada para o mesmo público.`
        : `Entrega ativa com ${imp.toLocaleString("pt-BR")} exibições registradas.`,
      sampleVolume: `${imp.toLocaleString("pt-BR")} impressões`,
      possibleCause: highFreq ? "Público restrito frente ao orçamento diário." : "Distribuição normal no leilão.",
      nextInvestigation: "Compare o CPM e a frequência entre os posicionamentos (Feed, Stories, Reels).",
    });
  }

  // 2. Interesse e cliques
  const clicks = input.linkClicks ?? 0;
  const ctr = input.linkCtr;
  const minCtr = input.targets?.minCtr ?? 0.01;
  if (imp < 500 || ctr === null) {
    stages.push({
      stageKey: "interest_clicks",
      stageLabel: "2. Interesse e cliques",
      tone: "gray",
      statusLabel: "Amostra em formação",
      metricObserved: `CTR no link: ${ctr !== null ? `${(ctr * 100).toFixed(2)}%` : "N/D"} · CPC: ${input.linkCpc ? `R$ ${input.linkCpc.toFixed(2)}` : "N/D"}`,
      referenceUsed: `Meta de CTR ≥ ${(minCtr * 100).toFixed(2)}% com 500+ impressões`,
      evidence: "Volume de impressões ainda pequeno para classificar a atratividade dos criativos.",
      sampleVolume: `${imp} impressões · ${clicks} cliques`,
      possibleCause: "Período curto ou baixo investimento acumulado.",
      nextInvestigation: "Acompanhe até atingir pelo menos 500 a 1.000 impressões.",
    });
  } else {
    const tone: DiagnosticTone = ctr >= minCtr ? "green" : ctr >= minCtr * 0.7 ? "yellow" : "red";
    stages.push({
      stageKey: "interest_clicks",
      stageLabel: "2. Interesse e cliques",
      tone,
      statusLabel: tone === "green" ? "Boa atração de cliques" : tone === "yellow" ? "CTR abaixo do ideal" : "Baixa taxa de cliques",
      metricObserved: `CTR no link: ${(ctr * 100).toFixed(2)}% (${clicks} cliques) · CPC: ${input.linkCpc ? `R$ ${input.linkCpc.toFixed(2)}` : "N/D"}`,
      referenceUsed: `CTR de referência: ${(minCtr * 100).toFixed(2)}%`,
      evidence: `De ${imp.toLocaleString("pt-BR")} exibições, ${clicks.toLocaleString("pt-BR")} geraram clique no link.`,
      sampleVolume: `${imp.toLocaleString("pt-BR")} impressões`,
      possibleCause:
        tone === "green"
          ? "Criativo e chamada alinhados ao interesse do público."
          : "Gancho visual, título do anúncio ou segmentação com baixa resposta.",
      nextInvestigation: "Compare o CTR individual na aba Anúncios e Criativos.",
    });
  }

  // 3. Chegada ao site
  const refClicks = input.outboundClicks && input.outboundClicks > 0 ? input.outboundClicks : input.linkClicks;
  const sessions = input.sessions ?? 0;
  if (!refClicks || refClicks < 20) {
    stages.push({
      stageKey: "site_arrival",
      stageLabel: "3. Chegada ao site",
      tone: sessions > 0 ? "gray" : "gray",
      statusLabel: sessions > 0 ? "Tráfego direto/orgânico ou amostra baixa de cliques" : "Aguardando tráfego",
      metricObserved: `${sessions} sessões no site · ${refClicks ?? 0} cliques na Meta`,
      referenceUsed: "70%+ de conversão de clique de saída em sessão",
      evidence: `O site registrou ${sessions} sessões totais, mas há poucos cliques sincronizados da Meta para comparar taxa de chegada.`,
      sampleVolume: `${refClicks ?? 0} cliques · ${sessions} sessões`,
      possibleCause: "Acesso por outras origens ou sincronização Meta com poucos cliques no período.",
      nextInvestigation: "Verifique a aba Tráfego do Site e a saúde dos parâmetros UTM.",
    });
  } else {
    const baseSessions = input.attributedSessions && input.attributedSessions > 0 ? input.attributedSessions : sessions;
    const arrivalRate = Math.min(1, baseSessions / refClicks);
    const tone: DiagnosticTone = arrivalRate >= 0.7 ? "green" : arrivalRate >= 0.5 ? "yellow" : "red";
    stages.push({
      stageKey: "site_arrival",
      stageLabel: "3. Chegada ao site",
      tone,
      statusLabel: tone === "green" ? "Carregamento eficiente" : tone === "yellow" ? "Perda moderada no caminho" : "Alta perda entre clique e visita",
      metricObserved: `Taxa de chegada estimada: ${(arrivalRate * 100).toFixed(1)}% (${baseSessions} sessões para ${refClicks} cliques)`,
      referenceUsed: "Referência técnica: ≥ 70% dos cliques de saída gerando sessão",
      evidence: `Relação entre cliques medidos na Meta (${refClicks}) e sessões abertas no site (${baseSessions}).`,
      sampleVolume: `${refClicks} cliques`,
      possibleCause:
        tone === "green"
          ? "Página rápida e rastreamento UTM ativo."
          : "Lentidão em rede móvel, saída antes do carregamento ou links de anúncios sem UTMs.",
      nextInvestigation: "Confira o tempo de carregamento (LCP) e se todos os anúncios possuem utm_campaign/campaign_id.",
    });
  }

  // 4. Engajamento na landing page
  if (sessions < 20) {
    stages.push({
      stageKey: "lp_engagement",
      stageLabel: "4. Engajamento na landing page",
      tone: "gray",
      statusLabel: "Amostra insuficiente",
      metricObserved: `${sessions} sessões · ${input.contentViews ?? 0} leituras de conteúdo`,
      referenceUsed: "Mínimo de 20 sessões para leitura de engajamento",
      evidence: "Poucas sessões registradas no período selecionado.",
      sampleVolume: `${sessions} sessões`,
      possibleCause: "Baixo volume de acessos no filtro atual.",
      nextInvestigation: "Amplie o filtro de dias para avaliar comportamento na página.",
    });
  } else {
    const engagementRatio = ((input.contentViews || 0) + (input.interactions || 0)) / sessions;
    const lcpBad = input.avgLcpMs !== null && input.avgLcpMs > 4000;
    const tone: DiagnosticTone = lcpBad ? "yellow" : engagementRatio >= 0.4 ? "green" : engagementRatio >= 0.2 ? "yellow" : "red";
    stages.push({
      stageKey: "lp_engagement",
      stageLabel: "4. Engajamento na landing page",
      tone,
      statusLabel: tone === "green" ? "Visitantes interagem com a página" : "Atenção à retenção ou performance da página",
      metricObserved: `Conteúdo/Interações: ${(engagementRatio * 100).toFixed(1)}% das sessões${input.avgScrollDepth ? ` · Scroll médio: ${input.avgScrollDepth.toFixed(0)}%` : ""}${input.avgLcpMs ? ` · LCP: ${input.avgLcpMs.toFixed(0)}ms` : ""}`,
      referenceUsed: "Engajamento ≥ 40% das sessões e LCP ≤ 2.500ms",
      evidence: `${input.contentViews ?? 0} visualizações de seção/conteúdo, ${input.interactions ?? 0} interações em ${sessions} sessões.`,
      sampleVolume: `${sessions} sessões`,
      possibleCause: lcpBad
        ? "Carregamento acima de 4s pode aumentar rejeição inicial."
        : "Primeira dobra da página ou proposta de valor inicial.",
      nextInvestigation: "Analise a seção de Qualidade da Landing Page por curso.",
    });
  }

  // 5. Clique no checkout
  const checkouts = input.checkouts ?? 0;
  const minCheckoutRate = input.targets?.minCheckoutRate ?? 0.04;
  if (sessions < 30) {
    stages.push({
      stageKey: "checkout_click",
      stageLabel: "5. Clique no checkout",
      tone: "gray",
      statusLabel: "Volume insuficiente",
      metricObserved: `${checkouts} checkouts em ${sessions} sessões`,
      referenceUsed: `Taxa de checkout ≥ ${(minCheckoutRate * 100).toFixed(1)}% com 30+ sessões`,
      evidence: "Amostra abaixo de 30 sessões não permite julgar conversão para checkout.",
      sampleVolume: `${sessions} sessões`,
      possibleCause: "Volume de visitas ainda baixo.",
      nextInvestigation: "Acumule pelo menos 30 a 50 sessões na página.",
    });
  } else {
    const rate = checkouts / sessions;
    const tone: DiagnosticTone = rate >= minCheckoutRate ? "green" : rate >= minCheckoutRate * 0.6 ? "yellow" : "red";
    stages.push({
      stageKey: "checkout_click",
      stageLabel: "5. Clique no checkout",
      tone,
      statusLabel: tone === "green" ? "Boa passagem para checkout" : tone === "yellow" ? "Conversão para checkout moderada" : "Poucos visitantes avançam ao checkout",
      metricObserved: `${(rate * 100).toFixed(2)}% (${checkouts} cliques no checkout em ${sessions} sessões)`,
      referenceUsed: `Referência configurada: ${(minCheckoutRate * 100).toFixed(1)}%`,
      evidence: `De cada 100 sessões, ${(rate * 100).toFixed(1)} acionam o botão de compra rumo à Hotmart.`,
      sampleVolume: `${sessions} sessões`,
      possibleCause:
        tone === "green"
          ? "Oferta, preço e CTAs bem posicionados."
          : "Possível dúvida sobre conteúdo do curso, preço, garantia ou destaque do CTA.",
      nextInvestigation: "Compare a conversão por landing page na aba Produtos / Páginas.",
    });
  }

  // 6. Compra aprovada
  const purchases = input.purchases ?? 0;
  const minPurchaseRate = input.targets?.minPurchaseRate ?? 0.12;
  if (checkouts < 10) {
    stages.push({
      stageKey: "approved_purchase",
      stageLabel: "6. Compra aprovada (Hotmart)",
      tone: purchases > 0 ? "green" : "gray",
      statusLabel: purchases > 0 ? "Vendas registradas (amostra pequena)" : "Poucos checkouts para avaliar fechamento",
      metricObserved: `${purchases} compras aprovadas para ${checkouts} checkouts`,
      referenceUsed: `Conversão de checkout ≥ ${(minPurchaseRate * 100).toFixed(0)}% com 10+ checkouts`,
      evidence: `Foram iniciados ${checkouts} checkouts e confirmadas ${purchases} compras aprovadas.`,
      sampleVolume: `${checkouts} checkouts`,
      possibleCause: "Amostra de checkouts ainda reduzida no período.",
      nextInvestigation: "Verifique na aba Hotmart se há boletos/Pix aguardando pagamento.",
    });
  } else {
    const rate = purchases / checkouts;
    const tone: DiagnosticTone = rate >= minPurchaseRate ? "green" : rate >= minPurchaseRate * 0.6 ? "yellow" : "red";
    stages.push({
      stageKey: "approved_purchase",
      stageLabel: "6. Compra aprovada (Hotmart)",
      tone,
      statusLabel: tone === "green" ? "Fechamento saudável no checkout" : tone === "yellow" ? "Abandono de checkout em atenção" : "Alta perda no checkout",
      metricObserved: `${(rate * 100).toFixed(1)}% dos checkouts viraram compra aprovada (${purchases} de ${checkouts})`,
      referenceUsed: `Referência: ${(minPurchaseRate * 100).toFixed(0)}% de conversão do checkout`,
      evidence: `${purchases} transações aprovadas/completas na Hotmart frente a ${checkouts} cliques de checkout.`,
      sampleVolume: `${checkouts} checkouts`,
      possibleCause:
        tone === "green"
          ? "Checkout fluido e oferta coerente."
          : "Abandono no formulário da Hotmart, juros de parcelamento ou recusa de cartão.",
      nextInvestigation: "Analise os eventos de abandono/cancelamento e meios de pagamento na aba Hotmart.",
    });
  }

  // 7. Rentabilidade
  const spend = input.spend;
  const comm = input.attributedCommission !== null && input.attributedCommission > 0 ? input.attributedCommission : input.commission;
  if (spend === null || spend <= 0 || comm === null) {
    stages.push({
      stageKey: "profitability",
      stageLabel: "7. Rentabilidade após anúncios",
      tone: "gray",
      statusLabel: "Aguardando dados financeiros completos",
      metricObserved: `Gasto: ${spend !== null ? `R$ ${spend.toFixed(2)}` : "N/D"} · Comissão: ${comm !== null ? `R$ ${comm.toFixed(2)}` : "N/D"}`,
      referenceUsed: "Comissão líquida ≥ Investimento (ROAS sobre comissão ≥ 1,00×)",
      evidence: "Não há gasto sincronizado ou comissões suficientes para apurar retorno sobre o investimento.",
      sampleVolume: `${purchases} vendas`,
      possibleCause: "Sincronização da Meta pendente ou período sem gasto publicitário.",
      nextInvestigation: "Utilize o Simulador de Rentabilidade para planejar o CPA máximo de equilíbrio.",
    });
  } else {
    const net = comm - spend;
    const roasComm = comm / spend;
    const tone: DiagnosticTone = roasComm >= 1.15 ? "green" : roasComm >= 0.85 ? "yellow" : "red";
    stages.push({
      stageKey: "profitability",
      stageLabel: "7. Rentabilidade após anúncios",
      tone,
      statusLabel:
        tone === "green"
          ? "Operação positiva após anúncios"
          : tone === "yellow"
            ? "Próximo ao ponto de equilíbrio"
            : "Retorno abaixo do investimento",
      metricObserved: `Saldo: R$ ${net.toFixed(2)} · ROAS s/ comissão: ${roasComm.toFixed(2)}×`,
      referenceUsed: "ROAS sobre comissão ≥ 1,00× (Ponto de equilíbrio)",
      evidence: `Comissão considerada de R$ ${comm.toFixed(2)} frente a R$ ${spend.toFixed(2)} investidos em anúncios.`,
      sampleVolume: `R$ ${spend.toFixed(2)} investidos · ${purchases} vendas`,
      possibleCause:
        tone === "green"
          ? "CPA abaixo da comissão média por venda."
          : "CPA acima da comissão líquida ou parte das vendas sem atribuição.",
      nextInvestigation: "Compare o CPA real com o Simulador de Rentabilidade por produto.",
    });
  }

  return stages;
}

export type ProfitabilitySimulationInput = {
  productPrice: number;
  hotmartFeePct?: number; // default e.g. 9.9%
  fixedFeePerSale?: number; // default e.g. R$ 2.49
  additionalCostPerSale?: number; // taxes / support / infra
  netCommissionOverride?: number | null; // if producer already knows exact commission
  desiredMarginPct?: number; // e.g. 0.25 (25%)
  siteConversionRatePct?: number; // e.g. 1.5 (%)
  campaignSpend?: number; // e.g. R$ 500
  orderBumpPrice?: number; // e.g. R$ 29.90
  orderBumpAcceptancePct?: number; // e.g. 20 (%)
};

export type ScenarioOutcome = {
  label: "Pessimista" | "Base" | "Otimista";
  conversionRatePct: number;
  effectiveCommissionPerSale: number;
  maxBreakEvenCpc: number;
  targetCpcWithMargin: number;
  estimatedSalesForSpend: number;
  estimatedNetResultForSpend: number;
  roasOnCommission: number | null;
};

export function simulateProductProfitability(input: ProfitabilitySimulationInput) {
  const price = Math.max(0, Number(input.productPrice || 0));
  const feePct = Math.min(Math.max(Number(input.hotmartFeePct ?? 9.9), 0), 100) / 100;
  const fixedFee = Math.max(0, Number(input.fixedFeePerSale ?? 2.49));
  const extraCost = Math.max(0, Number(input.additionalCostPerSale ?? 0));
  const marginPct = Math.min(Math.max(Number(input.desiredMarginPct ?? 20), 0), 95) / 100;
  const convPct = Math.max(0.05, Number(input.siteConversionRatePct ?? 1.5));
  const convRate = convPct / 100;
  const spend = Math.max(0, Number(input.campaignSpend ?? 500));
  const bumpPrice = Math.max(0, Number(input.orderBumpPrice ?? 0));
  const bumpAcceptance = Math.min(Math.max(Number(input.orderBumpAcceptancePct ?? 0), 0), 100) / 100;

  const baseCommission =
    input.netCommissionOverride != null && input.netCommissionOverride > 0
      ? Number(input.netCommissionOverride) - extraCost
      : Math.max(0, price * (1 - feePct) - fixedFee - extraCost);

  const bumpNetCommission = bumpPrice > 0 ? Math.max(0, bumpPrice * (1 - feePct)) : 0;
  const orderBumpLiftPerSale = bumpNetCommission * bumpAcceptance;
  const effectiveNetPerSale = Math.max(0, baseCommission + orderBumpLiftPerSale);

  const maxBreakEvenCpa = effectiveNetPerSale;
  const targetCpaWithMargin = effectiveNetPerSale * (1 - marginPct);
  const maxBreakEvenCpc = maxBreakEvenCpa * convRate;
  const targetCpcWithMargin = targetCpaWithMargin * convRate;
  const salesToCoverSpend =
    spend > 0 && effectiveNetPerSale > 0 ? Math.ceil(spend / effectiveNetPerSale) : null;
  const exactBreakEvenSales =
    spend > 0 && effectiveNetPerSale > 0 ? spend / effectiveNetPerSale : null;

  const buildScenario = (
    label: "Pessimista" | "Base" | "Otimista",
    convMultiplier: number,
    bumpMultiplier: number,
    assumedCpc: number,
  ): ScenarioOutcome => {
    const scenarioConvPct = convPct * convMultiplier;
    const scenarioConvRate = scenarioConvPct / 100;
    const scenarioEffComm = Math.max(0, baseCommission + orderBumpLiftPerSale * bumpMultiplier);
    const clicks = assumedCpc > 0 ? spend / assumedCpc : 0;
    const estSales = clicks * scenarioConvRate;
    const estComm = estSales * scenarioEffComm;
    return {
      label,
      conversionRatePct: scenarioConvPct,
      effectiveCommissionPerSale: scenarioEffComm,
      maxBreakEvenCpc: scenarioEffComm * scenarioConvRate,
      targetCpcWithMargin: scenarioEffComm * (1 - marginPct) * scenarioConvRate,
      estimatedSalesForSpend: estSales,
      estimatedNetResultForSpend: estComm - spend,
      roasOnCommission: spend > 0 ? estComm / spend : null,
    };
  };

  const referenceCpc = maxBreakEvenCpc > 0 ? maxBreakEvenCpc * 0.8 : 1.5;

  return {
    netCommissionPerSale: baseCommission,
    orderBumpLiftPerSale,
    effectiveNetPerSale,
    maxBreakEvenCpa,
    targetCpaWithMargin,
    maxBreakEvenCpc,
    targetCpcWithMargin,
    salesToCoverSpend,
    exactBreakEvenSales,
    breakEvenRoasOnGross: effectiveNetPerSale > 0 && price > 0 ? price / effectiveNetPerSale : null,
    scenarios: [
      buildScenario("Pessimista", 0.7, 0.5, referenceCpc * 1.25),
      buildScenario("Base", 1.0, 1.0, referenceCpc),
      buildScenario("Otimista", 1.3, 1.25, referenceCpc * 0.85),
    ],
  };
}

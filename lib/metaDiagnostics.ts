import { ratio } from "@/lib/metaReport";
export type Diagnostic = { tone: "green" | "yellow" | "red" | "gray"; title: string; evidence: string; action: string };
type Campaign = { id: string; name: string; impressions: number | null; link_clicks: number | null; spend: number | null; sales?: { sales?: number; commission?: number | null } | null; site?: { sessions?: number; checkouts?: number } | null };
export function diagnoseCampaign(campaign: Campaign, referenceCtr: number | null): Diagnostic[] {
  const impressions = campaign.impressions == null ? null : Number(campaign.impressions);
  const clicks = campaign.link_clicks == null ? null : Number(campaign.link_clicks);
  const spend = campaign.spend == null ? null : Number(campaign.spend);
  const ctr = ratio(clicks,impressions);
  if (impressions === null || clicks === null || impressions < 1000 || referenceCtr === null)
    return [{ tone:"gray",title:"Dados insuficientes para avaliar os cliques",evidence:`Impressões: ${impressions ?? "indisponível"}. Referência interna: ${referenceCtr === null ? "indisponível" : (referenceCtr*100).toFixed(2)+"%"}.`,action:"Aguarde mais dados ou compare com outro período." }];
  const result: Diagnostic[] = [];
  if (ctr !== null && ctr < referenceCtr * 0.7) result.push({ tone:"yellow",title:"Cliques no link abaixo da referência",evidence:`CTR no link de ${(ctr*100).toFixed(2)}% diante da referência interna de ${(referenceCtr*100).toFixed(2)}%, com ${impressions} impressões.`,action:"Examine criativo, mensagem e público. Esses fatores são hipóteses, não causas comprovadas." });
  if (campaign.site && Number(campaign.site.sessions) >= 100 && Number(campaign.site.checkouts || 0) / Number(campaign.site.sessions) < 0.01)
    result.push({ tone:"yellow",title:"Visitas atribuídas com poucos checkouts",evidence:`${campaign.site.sessions} sessões e ${campaign.site.checkouts || 0} início(s) de checkout atribuídos por ID exato.`,action:"Confira oferta, CTA e experiência mobile na página." });
  const commission = campaign.sales?.commission == null ? null : Number(campaign.sales.commission);
  if (spend !== null && commission !== null && Number(campaign.sales?.sales || 0) >= 3)
    result.push(commission >= spend ?
      { tone:"green",title:"Comissão atribuída cobre o investimento",evidence:`Comissão atribuída: ${commission.toFixed(2)}; gasto: ${spend.toFixed(2)}; vendas atribuídas: ${campaign.sales?.sales}.`,action:"Acompanhe a consistência em períodos seguintes." } :
      { tone:"red",title:"Comissão atribuída abaixo do investimento",evidence:`Comissão atribuída: ${commission.toFixed(2)}; gasto: ${spend.toFixed(2)}; vendas atribuídas: ${campaign.sales?.sales}.`,action:"Confira atribuição, custos e desempenho antes de decidir mudanças." });
  if (!result.length) result.push({ tone:"gray",title:"Sem diagnóstico conclusivo",evidence:"Não há diferença ou volume suficiente para uma conclusão comercial.",action:"Continue acompanhando a evolução." });
  return result;
}

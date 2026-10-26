import { createHmac } from "node:crypto";

export type MetaLevel = "account" | "campaign" | "adset" | "ad";
export type MetaBreakdown = "age,gender" | "country" | "region" | "publisher_platform,platform_position" | "device_platform";
type MetaPage<T> = { data?: T[]; paging?: { next?: string; cursors?: { after?: string } }; error?: { code?: number; error_subcode?: number; message?: string } };
const graphOrigin = "https://graph.facebook.com";
const version = () => {
  const value = process.env.META_API_VERSION || "v26.0";
  if (!/^v\d+\.\d+$/.test(value)) throw new MetaAdsError("CONFIG", "Versão da API Meta inválida.");
  return value;
};
const accessToken = () => {
  const value = process.env.META_ACCESS_TOKEN?.trim();
  if (!value) throw new MetaAdsError("CONFIG", "Token Meta não configurado.");
  return value;
};
export function metaConfigured() {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET && process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
}
export class MetaAdsError extends Error {
  constructor(public code: string, message: string, public retryable = false) { super(message); }
}
function safeUrl(path: string, params: Record<string, string>) {
  const url = new URL(`/${version()}/${path.replace(/^\//, "")}`, graphOrigin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url;
}
function appSecretProof() {
  const secret = process.env.META_APP_SECRET;
  return secret ? createHmac("sha256", secret).update(accessToken()).digest("hex") : undefined;
}
async function get<T>(url: URL, attempts = 3): Promise<T> {
  if (url.origin !== graphOrigin) throw new MetaAdsError("PAGING", "Destino de paginação inválido.");
  // A URL de paginação pode incluir access_token. Nunca enviamos ou registramos esse parâmetro.
  url.searchParams.delete("access_token");
  const proof = appSecretProof();
  if (proof) url.searchParams.set("appsecret_proof", proof);
  for (let attempt = 0; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${accessToken()}` }, cache: "no-store", signal: controller.signal });
      const result = await response.json() as MetaPage<T>;
      if (response.ok && !result.error) return result as T;
      const code = String(result.error?.code || response.status);
      const retryable = response.status === 429 || response.status >= 500 || code === "4" || code === "17" || code === "32" || code === "613";
      if (retryable && attempt < attempts) {
        const retryAfter = Number(response.headers.get("retry-after") || 0);
        await new Promise((resolve) => setTimeout(resolve, Math.min(30_000, retryAfter > 0 ? retryAfter * 1000 : 750 * 2 ** attempt)));
        continue;
      }
      const label = response.status === 401 || code === "190" ? "Token Meta inválido ou expirado." : response.status === 403 ? "Conta sem permissão de leitura." : retryable ? "Limite ou instabilidade da Meta API." : "Consulta rejeitada pela Meta API.";
      throw new MetaAdsError(code, label, retryable);
    } catch (error) {
      if (error instanceof MetaAdsError) throw error;
      if (attempt === attempts) throw new MetaAdsError("NETWORK", "Falha de comunicação com a Meta API.", true);
      await new Promise((resolve) => setTimeout(resolve, 750 * 2 ** attempt));
    } finally { clearTimeout(timeout); }
  }
  throw new MetaAdsError("NETWORK", "Falha de comunicação com a Meta API.");
}
export async function allPages<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const rows: T[] = [];
  let url: URL | null = safeUrl(path, { limit: "200", ...params });
  let pageCount = 0;
  while (url) {
    if (++pageCount > 500) throw new MetaAdsError("PAGING", "Limite de páginas excedido.");
    const page: MetaPage<T> = await get<MetaPage<T>>(url);
    if (!Array.isArray(page.data)) throw new MetaAdsError("RESPONSE", "Resposta inválida da Meta API.");
    rows.push(...page.data);
    url = page.paging?.next ? new URL(page.paging.next) : null;
  }
  return rows;
}
const baseFields = "account_id,date_start,date_stop,spend,impressions,reach,frequency,clicks,inline_link_clicks,cpc,cpm,ctr,inline_link_click_ctr,cost_per_inline_link_click,outbound_clicks,outbound_clicks_ctr,cost_per_outbound_click,actions,action_values";
const objectFields: Record<MetaLevel, string> = { account: "", campaign: ",campaign_id", adset: ",campaign_id,adset_id", ad: ",campaign_id,adset_id,ad_id" };
export const meta = {
  accounts: () => allPages<Record<string, unknown>>("me/adaccounts", { fields: "id,name,currency,account_status,timezone_name" }),
  campaigns: (accountId: string) => allPages<Record<string, unknown>>(`${accountId}/campaigns`, { fields: "id,name,objective,status,effective_status,created_time,updated_time", limit: "200" }),
  adsets: (accountId: string) => allPages<Record<string, unknown>>(`${accountId}/adsets`, { fields: "id,campaign_id,name,status,effective_status,optimization_goal,daily_budget,lifetime_budget,start_time,end_time", limit: "200" }),
  ads: async (accountId: string) => {
    try {
      return await allPages<Record<string, unknown>>(`${accountId}/ads`, { fields: "id,campaign_id,adset_id,name,status,effective_status,creative{id,name,thumbnail_url},created_time,updated_time", limit: "200" });
    } catch (error) {
      if (error instanceof MetaAdsError && !error.retryable && error.code !== "190")
        return allPages<Record<string, unknown>>(`${accountId}/ads`, { fields: "id,campaign_id,adset_id,name,status,effective_status,creative,created_time,updated_time", limit: "200" });
      throw error;
    }
  },
  insights: (accountId: string, level: MetaLevel, since: string, until: string, breakdown?: MetaBreakdown) =>
    allPages<Record<string, unknown>>(`${accountId}/insights`, {
      level, time_increment: "1", time_range: JSON.stringify({ since, until }),
      fields: baseFields + objectFields[level],
      ...(breakdown ? { breakdowns: breakdown } : {}),
    }),
};

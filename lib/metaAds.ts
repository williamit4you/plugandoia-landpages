import { createHmac } from "node:crypto";

export type MetaLevel = "account" | "campaign" | "adset" | "ad";
export type MetaBreakdown =
  | "age,gender"
  | "country"
  | "region"
  | "publisher_platform,platform_position"
  | "device_platform";

type MetaPage<T> = {
  data?: T[];
  paging?: { next?: string; cursors?: { after?: string } };
  error?: { code?: number; error_subcode?: number; message?: string };
};

const graphOrigin = "https://graph.facebook.com";

const cleanEnv = (value: string | undefined) => String(value || "").trim().replace(/^["']|["']$/g, "");

export const metaApiVersion = () => {
  const value = cleanEnv(process.env.META_API_VERSION || process.env.META_GRAPH_API_VERSION) || "v26.0";
  if (!/^v\d+\.\d+$/.test(value)) throw new MetaAdsError("CONFIG", "Versão da API Meta inválida.");
  return value;
};

const accessToken = () => {
  const value = cleanEnv(process.env.META_ACCESS_TOKEN);
  if (!value) throw new MetaAdsError("CONFIG", "Token Meta não configurado.");
  return value;
};

export function metaConfigured() {
  return Boolean(
    cleanEnv(process.env.META_APP_ID) &&
      cleanEnv(process.env.META_APP_SECRET) &&
      cleanEnv(process.env.META_ACCESS_TOKEN) &&
      cleanEnv(process.env.META_AD_ACCOUNT_ID),
  );
}

export function metaConfigState() {
  return {
    configured: metaConfigured(),
    hasAppId: Boolean(cleanEnv(process.env.META_APP_ID)),
    hasAppSecret: Boolean(cleanEnv(process.env.META_APP_SECRET)),
    hasAccessToken: Boolean(cleanEnv(process.env.META_ACCESS_TOKEN)),
    hasAdAccountId: Boolean(cleanEnv(process.env.META_AD_ACCOUNT_ID)),
    apiVersion: cleanEnv(process.env.META_API_VERSION || process.env.META_GRAPH_API_VERSION) || "v26.0",
    readOnlyMode: true as const,
  };
}

export class MetaAdsError extends Error {
  code: string;
  retryable: boolean;
  constructor(code: string, message: string, retryable = false) {
    super(message);
    this.code = code;
    this.retryable = retryable;
  }
}

function safeUrl(path: string, params: Record<string, string>) {
  const url = new URL(`/${metaApiVersion()}/${path.replace(/^\//, "")}`, graphOrigin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url;
}

function appSecretProof() {
  const secret = cleanEnv(process.env.META_APP_SECRET);
  return secret ? createHmac("sha256", secret).update(accessToken()).digest("hex") : undefined;
}

async function get<T>(url: URL, attempts = 3): Promise<T> {
  if (url.origin !== graphOrigin) throw new MetaAdsError("PAGING", "Destino de paginação inválido.");
  // MODO 100% SOMENTE LEITURA: Apenas requisições GET são permitidas na Marketing API.
  // A URL de paginação pode incluir access_token. Nunca enviamos ou registramos esse parâmetro na URL.
  url.searchParams.delete("access_token");
  const proof = appSecretProof();
  if (proof) url.searchParams.set("appsecret_proof", proof);

  for (let attempt = 0; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken()}` },
        cache: "no-store",
        signal: controller.signal,
      });
      const result = (await response.json()) as MetaPage<T>;
      if (response.ok && !result.error) return result as T;
      const code = String(result.error?.code || response.status);
      const retryable =
        response.status === 429 ||
        response.status >= 500 ||
        code === "4" ||
        code === "17" ||
        code === "32" ||
        code === "613";
      if (retryable && attempt < attempts) {
        const retryAfter = Number(response.headers.get("retry-after") || 0);
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(30_000, retryAfter > 0 ? retryAfter * 1000 : 750 * 2 ** attempt)),
        );
        continue;
      }
      const label =
        response.status === 401 || code === "190"
          ? "Token Meta inválido ou expirado."
          : response.status === 403
            ? "Conta sem permissão de leitura."
            : retryable
              ? "Limite ou instabilidade da Meta API."
              : "Consulta rejeitada pela Meta API.";
      throw new MetaAdsError(code, label, retryable);
    } catch (error) {
      if (error instanceof MetaAdsError) throw error;
      if (attempt === attempts) throw new MetaAdsError("NETWORK", "Falha de comunicação com a Meta API.", true);
      await new Promise((resolve) => setTimeout(resolve, 750 * 2 ** attempt));
    } finally {
      clearTimeout(timeout);
    }
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

const baseFields =
  "account_id,date_start,date_stop,spend,impressions,reach,frequency,clicks,inline_link_clicks,cpc,cpm,ctr,inline_link_click_ctr,cost_per_inline_link_click,outbound_clicks,outbound_clicks_ctr,cost_per_outbound_click,actions,action_values";

const extendedFields =
  baseFields +
  ",cost_per_action_type,quality_ranking,engagement_rate_ranking,conversion_rate_ranking,video_play_actions,video_thruplay_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,video_p100_watched_actions,video_avg_time_watched_actions,cost_per_thruplay";

const objectFields: Record<MetaLevel, string> = {
  account: "",
  campaign: ",campaign_id,campaign_name",
  adset: ",campaign_id,adset_id,adset_name",
  ad: ",campaign_id,adset_id,ad_id,ad_name",
};

export const meta = {
  accounts: () =>
    allPages<Record<string, unknown>>("me/adaccounts", {
      fields: "id,name,currency,account_status,timezone_name",
    }),
  campaigns: async (accountId: string) => {
    try {
      return await allPages<Record<string, unknown>>(`${accountId}/campaigns`, {
        fields: "id,name,objective,status,effective_status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time",
        limit: "200",
      });
    } catch (error) {
      if (error instanceof MetaAdsError && !error.retryable && error.code !== "190") {
        return allPages<Record<string, unknown>>(`${accountId}/campaigns`, {
          fields: "id,name,objective,status,effective_status,created_time,updated_time",
          limit: "200",
        });
      }
      throw error;
    }
  },
  adsets: async (accountId: string) => {
    try {
      return await allPages<Record<string, unknown>>(`${accountId}/adsets`, {
        fields:
          "id,campaign_id,name,status,effective_status,optimization_goal,daily_budget,lifetime_budget,targeting,start_time,end_time",
        limit: "200",
      });
    } catch (error) {
      if (error instanceof MetaAdsError && !error.retryable && error.code !== "190") {
        return allPages<Record<string, unknown>>(`${accountId}/adsets`, {
          fields:
            "id,campaign_id,name,status,effective_status,optimization_goal,daily_budget,lifetime_budget,start_time,end_time",
          limit: "200",
        });
      }
      throw error;
    }
  },
  ads: async (accountId: string) => {
    try {
      return await allPages<Record<string, unknown>>(`${accountId}/ads`, {
        fields:
          "id,campaign_id,adset_id,name,status,effective_status,creative{id,name,title,body,object_type,thumbnail_url,image_url,link_url,object_story_spec},created_time,updated_time",
        limit: "200",
      });
    } catch (error) {
      if (error instanceof MetaAdsError && !error.retryable && error.code !== "190") {
        try {
          return await allPages<Record<string, unknown>>(`${accountId}/ads`, {
            fields: "id,campaign_id,adset_id,name,status,effective_status,creative{id,name,thumbnail_url},created_time,updated_time",
            limit: "200",
          });
        } catch {
          return allPages<Record<string, unknown>>(`${accountId}/ads`, {
            fields: "id,campaign_id,adset_id,name,status,effective_status,creative,created_time,updated_time",
            limit: "200",
          });
        }
      }
      throw error;
    }
  },
  insights: async (accountId: string, level: MetaLevel, since: string, until: string, breakdown?: MetaBreakdown) => {
    const timeRange = JSON.stringify({ since, until });
    if (!breakdown) {
      try {
        return await allPages<Record<string, unknown>>(`${accountId}/insights`, {
          level,
          time_increment: "1",
          time_range: timeRange,
          fields: extendedFields + objectFields[level],
        });
      } catch (error) {
        if (error instanceof MetaAdsError && !error.retryable && error.code !== "190") {
          return allPages<Record<string, unknown>>(`${accountId}/insights`, {
            level,
            time_increment: "1",
            time_range: timeRange,
            fields: baseFields + objectFields[level],
          });
        }
        throw error;
      }
    }
    return allPages<Record<string, unknown>>(`${accountId}/insights`, {
      level,
      time_increment: "1",
      time_range: timeRange,
      fields: baseFields + objectFields[level],
      breakdowns: breakdown,
    });
  },
};

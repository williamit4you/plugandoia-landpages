const rawSecret =
  process.env.META_SYNC_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  process.env.META_APP_SECRET ||
  "";
const secret = rawSecret.trim().replace(/^["']|["']$/g, "");

if (!secret) {
  console.log("[meta-sync] Agendamento desativado: nenhum segredo interno configurado.");
  process.exit(0);
}

const intervalHours = Math.min(Math.max(Number(process.env.META_SYNC_INTERVAL_HOURS || 6), 1), 24);
const origin = "http://127.0.0.1:" + (process.env.PORT || "3000");

async function run(initial = false) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000);
  try {
    const now = new Date();
    const daysBack = initial ? 29 : 6;
    const until = now.toISOString().slice(0, 10);
    const since = new Date(now.getTime() - daysBack * 86_400_000).toISOString().slice(0, 10);
    const response = await fetch(origin + "/landing-api/jobs/meta-sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ since, until }),
      signal: controller.signal,
    });
    console.log(`[meta-sync] ${new Date().toISOString()} initial=${initial} status=${response.status}`);
  } catch {
    console.error("[meta-sync] Falha ao acionar sincronização periódica.");
  } finally {
    clearTimeout(timeout);
  }
}

setTimeout(() => run(true), 15_000);
setInterval(() => run(false), intervalHours * 3_600_000);

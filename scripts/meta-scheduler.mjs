const secret = process.env.META_SYNC_SECRET;
if (!secret) {
  console.log("[meta-sync] Agendamento desativado: META_SYNC_SECRET ausente.");
  process.exit(0);
}
const intervalHours = Math.min(Math.max(Number(process.env.META_SYNC_INTERVAL_HOURS || 6), 1), 24);
const origin = "http://127.0.0.1:" + (process.env.PORT || "3000");
async function run() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000);
  try {
    const response = await fetch(origin + "/landing-api/jobs/meta-sync", {
      method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: "{}", signal: controller.signal,
    });
    console.log(`[meta-sync] ${new Date().toISOString()} status=${response.status}`);
  } catch {
    console.error("[meta-sync] Falha ao acionar sincronização periódica.");
  } finally { clearTimeout(timeout); }
}
setTimeout(run, 60_000);
setInterval(run, intervalHours * 3_600_000);

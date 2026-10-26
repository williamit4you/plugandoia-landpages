"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

export function MetaSyncTrigger({ defaultDays = 30 }: { defaultDays?: number }) {
  const router = useRouter();
  const [days, setDays] = useState(String(defaultDays));
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSync() {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch("/landing-api/jobs/meta-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: Number(days) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback({ ok: false, text: data.error || "Não foi possível sincronizar." });
      } else {
        setFeedback({
          ok: true,
          text: `Sincronizado (${data.imported ?? 0} registros atualizados de ${data.since} a ${data.until}).`,
        });
        router.refresh();
      }
    } catch {
      setFeedback({ ok: false, text: "Falha de comunicação ao acionar sincronização." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <select
        value={days}
        onChange={(e) => setDays(e.target.value)}
        disabled={loading}
        aria-label="Janela de sincronização Meta Ads"
        style={{
          height: 36,
          borderRadius: 8,
          border: "1px solid #36445d",
          background: "#1a2638",
          color: "#eff6ff",
          padding: "0 10px",
          fontSize: 12,
        }}
      >
        <option value="7">Sincronizar 7 dias</option>
        <option value="30">Sincronizar 30 dias</option>
        <option value="90">Importar 90 dias</option>
        <option value="180">Importar 180 dias</option>
      </select>
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        style={{
          height: 36,
          padding: "0 14px",
          borderRadius: 8,
          border: "1px solid #315cf5",
          background: "#315cf5",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.75 : 1,
        }}
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        {loading ? "Sincronizando..." : "Sincronizar Meta Ads"}
      </button>
      {feedback && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: feedback.ok ? "#70d8a3" : "#f38e99",
          }}
        >
          {feedback.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {feedback.text}
        </span>
      )}
    </div>
  );
}

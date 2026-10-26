"use client";
import Link from "next/link";
import { useEffect } from "react";
export type MetaMode = "simples" | "intermediario" | "completo";
export function MetaModeSelector({ mode, days }: { mode: MetaMode; days: number }) {
  useEffect(() => { window.localStorage.setItem("meta-analytics-mode", mode); }, [mode]);
  return <div className="meta-mode-selector" aria-label="Nível de detalhes">{(["simples","intermediario","completo"] as const).map((item) =>
    <Link key={item} className={mode === item ? "active" : ""} href={`/landing-admin/meta?days=${days}&mode=${item}`}>{item === "intermediario" ? "Intermediário" : item === "completo" ? "Completo" : "Simples"}</Link>)}</div>;
}

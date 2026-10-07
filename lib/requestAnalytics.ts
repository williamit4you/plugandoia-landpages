import { createHash } from "node:crypto";
import { NextRequest } from "next/server";

export function text(value: unknown, max = 500) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized.slice(0, max) : null;
}

export function number(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clientIp(request: NextRequest) {
  return text(request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip"), 100);
}

export function ipHash(request: NextRequest) {
  const ip = clientIp(request);
  if (!ip) return null;
  return createHash("sha256").update(`${process.env.ANALYTICS_IP_SALT || "landpages"}:${ip}`).digest("hex");
}

export function browserFromUa(userAgent: string | null) {
  const ua = (userAgent || "").toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome/")) return "Chrome";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("safari/")) return "Safari";
  return "Desconhecido";
}

export function osFromUa(userAgent: string | null) {
  const ua = (userAgent || "").toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  if (ua.includes("mac os")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  return "Desconhecido";
}

export function deviceFromUa(userAgent: string | null) {
  const ua = (userAgent || "").toLowerCase();
  if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider")) return "BOT";
  if (ua.includes("ipad") || ua.includes("tablet")) return "TABLET";
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return "MOBILE";
  return "DESKTOP";
}

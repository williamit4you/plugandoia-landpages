const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signature(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export async function createAdminSession(secret: string) {
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await signature(payload, secret)}`;
}

export async function verifyAdminSession(value: string | undefined, secret: string | undefined) {
  if (!value || !secret) return false;
  const [expiresAt, providedSignature] = value.split(".");
  if (!expiresAt || !providedSignature || Number(expiresAt) < Date.now()) return false;
  return (await signature(expiresAt, secret)) === providedSignature;
}

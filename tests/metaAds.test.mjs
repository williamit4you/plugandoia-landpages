import test from "node:test";
import assert from "node:assert/strict";
import { allPages, MetaAdsError } from "../lib/metaAds.ts";

test("pagina resultados e mantém token fora da URL", async () => {
  const originalFetch = globalThis.fetch;
  const oldToken = process.env.META_ACCESS_TOKEN;
  const oldSecret = process.env.META_APP_SECRET;
  process.env.META_ACCESS_TOKEN = "test-token";
  process.env.META_APP_SECRET = "test-secret";
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), authorization: options.headers.Authorization });
    return new Response(JSON.stringify(calls.length === 1
      ? { data: [{ id: "1" }], paging: { next: "https://graph.facebook.com/v26.0/me/adaccounts?after=cursor&access_token=leaked" } }
      : { data: [{ id: "2" }] }), { status: 200, headers: { "content-type": "application/json" } });
  };
  try {
    const rows = await allPages("me/adaccounts", { fields: "id" });
    assert.deepEqual(rows.map((row) => row.id), ["1","2"]);
    assert.equal(calls.length, 2);
    assert.ok(calls.every((call) => call.authorization === "Bearer test-token"));
    assert.ok(calls.every((call) => !call.url.includes("access_token")));
  } finally {
    globalThis.fetch = originalFetch;
    if (oldToken === undefined) delete process.env.META_ACCESS_TOKEN; else process.env.META_ACCESS_TOKEN = oldToken;
    if (oldSecret === undefined) delete process.env.META_APP_SECRET; else process.env.META_APP_SECRET = oldSecret;
  }
});

test("classifica token expirado sem expor a mensagem da API", async () => {
  const originalFetch = globalThis.fetch;
  const oldToken = process.env.META_ACCESS_TOKEN;
  process.env.META_ACCESS_TOKEN = "test-token";
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { code: 190, message: "private-token" } }), { status: 401 });
  try {
    await assert.rejects(() => allPages("me/adaccounts", { fields: "id" }), (error) => {
      assert.ok(error instanceof MetaAdsError);
      assert.equal(error.code, "190");
      assert.ok(!error.message.includes("private-token"));
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (oldToken === undefined) delete process.env.META_ACCESS_TOKEN; else process.env.META_ACCESS_TOKEN = oldToken;
  }
});

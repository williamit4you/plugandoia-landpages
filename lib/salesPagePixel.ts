export async function resolveSalesPageMetaPixelId(_pageKey?: string, _options?: { preferEnvFallback?: boolean }) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return pixelId || null;
}

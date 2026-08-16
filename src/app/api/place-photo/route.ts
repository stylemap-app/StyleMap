import { NextResponse } from "next/server";

// Places API (New) のphotoリソース名の形式のみ許可する。
// これがないと name パラメータ経由で任意のURLをサーバーに取得させられてしまう（SSRF対策）
const PHOTO_NAME_PATTERN = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

const MIN_WIDTH = 100;
const MAX_WIDTH = 1600;
const DEFAULT_WIDTH = 800;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const widthParam = searchParams.get("w");

  if (!name || !PHOTO_NAME_PATTERN.test(name)) {
    return NextResponse.json({ error: "invalid name" }, { status: 400 });
  }

  const parsedWidth = Number(widthParam);
  const maxWidthPx = Math.min(
    Math.max(Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : DEFAULT_WIDTH, MIN_WIDTH),
    MAX_WIDTH
  );

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  const upstreamUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidthPx}&key=${apiKey}`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl);
  } catch (err) {
    console.error("place-photo upstream fetch failed:", err);
    return NextResponse.json({ error: "photo fetch failed" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "photo fetch failed" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      // Places写真リソースは不変なので長期キャッシュ（place_cacheの期限とは独立でよい）
      "Cache-Control": "public, max-age=2592000, immutable",
    },
  });
}

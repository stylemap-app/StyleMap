// 動作確認用スクリプト（任意）
// Places API (New) の GET詳細エンドポイントに直接アクセスし、
// APIキー・FieldMaskが正しく機能するかをアプリのコードとは独立に確認する。
//
// 実行例:
//   node --env-file=.env.local scripts/test-places-api.mjs <placeId>
//
// placeId が分からない場合は、Google Maps で店舗を検索して
// 共有リンク等から place_id を控えるか、Places API の searchText で調べる。

const placeId = process.argv[2];
if (!placeId) {
  console.error("Usage: node --env-file=.env.local scripts/test-places-api.mjs <placeId>");
  process.exit(1);
}

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_PLACES_API_KEY が設定されていません（.env.local を確認してください）");
  process.exit(1);
}

const fieldMask = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "regularOpeningHours",
  "nationalPhoneNumber",
  "photos",
  "rating",
  "userRatingCount",
  "websiteUri",
  "googleMapsUri",
].join(",");

const res = await fetch(
  `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=ja&regionCode=JP`,
  {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
  }
);

console.log("status:", res.status);
console.log(JSON.stringify(await res.json(), null, 2));

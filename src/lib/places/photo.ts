// APIキーを含まない相対URLを返すだけの純粋関数。
// server-only にしない: サーバー/クライアント両方のコンポーネントから
// ImageWithFallback の src としてそのまま使えるようにするため。
export function getPlacePhotoUrl(photoName: string, maxWidth = 800): string {
  return `/api/place-photo?name=${encodeURIComponent(photoName)}&w=${maxWidth}`;
}

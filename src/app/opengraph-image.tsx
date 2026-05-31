import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "StyleMap - 自分に合う服屋を見つける";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 後で差し替え用の仮 OGP 画像（paper 背景 + StyleMap ロゴテキスト）
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F7F5F0",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: "bold",
            color: "#1A1816",
            letterSpacing: "-3px",
            lineHeight: 1,
          }}
        >
          StyleMap
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#D4714A",
            letterSpacing: "0px",
          }}
        >
          自分に合う服屋を見つける
        </div>
      </div>
    ),
    { ...size }
  );
}

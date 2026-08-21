import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// タグ推定に使うモデル。低コスト・低レイテンシ優先（Haiku 4.5）
export const TAG_INFERENCE_MODEL = "claude-haiku-4-5-20251001";

let cachedClient: Anthropic | null = null;

// ANTHROPIC_API_KEY 未設定時も例外を投げずnullを返す。
// 呼び出し元（inferStoreTags）がtry/catchでnullに丸める設計と方針を揃え、
// キー未設定でも管理画面全体が落ちないようにする
export function getClaudeClient(): Anthropic | null {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return null;
  }

  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

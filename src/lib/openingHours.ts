import type { OpeningPeriod, OpeningPeriodPoint } from "@/types/store";

// 「営業中かどうか」の判定結果。表示のたびに getOpeningStatus() で計算する
// （Places APIのopenNowのような取得時点のスナップショットを保存・再利用しない）
export type OpeningStatus =
  | { state: "open24h" }
  | { state: "open"; closesAt: { hour: number; minute: number } }
  | {
      state: "closed";
      // 次に開店する時刻。periods自体が無い等で分からない場合はnull
      opensAt: { dayOffset: number; hour: number; minute: number } | null;
    }
  | { state: "unknown" }; // periodsが無い（定休日情報が取れていない）店舗

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toWeekMinute(p: OpeningPeriodPoint): number {
  return p.day * MINUTES_PER_DAY + p.hour * 60 + p.minute;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// 指定時刻（省略時は実行時の日本時間）を基準に、periodsから営業中かどうかを判定する。
// 日をまたぐ営業（例: 20:00〜翌2:00）・24時間営業（closeが無いperiod）・
// periodsが無い店舗（定休日情報なし）に対応する純粋関数
export function getOpeningStatus(
  periods: OpeningPeriod[] | null | undefined,
  now: Date
): OpeningStatus {
  if (!periods || periods.length === 0) return { state: "unknown" };
  if (periods.some((p) => !p.close)) return { state: "open24h" };

  const nowWeekMinute = now.getDay() * MINUTES_PER_DAY + now.getHours() * 60 + now.getMinutes();

  // 各periodを「週の中の分」の区間[start, end)に正規化する。
  // 日をまたぐ営業は end <= start になるので、週をまたいで続くとみなし
  // endに1週間分足す。境界での判定漏れを防ぐため、now側を±1週間ずらした
  // 3パターンで照合する
  for (const period of periods) {
    const close = period.close!;
    const start = toWeekMinute(period.open);
    let end = toWeekMinute(close);
    if (end <= start) end += MINUTES_PER_WEEK;

    for (const shift of [0, MINUTES_PER_WEEK, -MINUTES_PER_WEEK]) {
      const candidate = nowWeekMinute + shift;
      if (candidate >= start && candidate < end) {
        return { state: "open", closesAt: { hour: close.hour, minute: close.minute } };
      }
    }
  }

  // 営業時間外: 直近（最大7日先まで）の次の開店時刻を探す
  let bestDiffMinutes = Infinity;
  let bestOpen: OpeningPeriodPoint | null = null;
  for (const period of periods) {
    const start = toWeekMinute(period.open);
    for (const shift of [0, MINUTES_PER_WEEK]) {
      const diff = start + shift - nowWeekMinute;
      if (diff > 0 && diff < bestDiffMinutes) {
        bestDiffMinutes = diff;
        bestOpen = period.open;
      }
    }
  }

  if (!bestOpen) return { state: "closed", opensAt: null };

  // 「何日後か」は分の差ではなくカレンダー日で数える
  // （日をまたぐ時刻だと分の差だけでは1日ズレることがあるため）
  const targetDate = new Date(now.getTime() + bestDiffMinutes * 60000);
  const dayOffset = Math.round(
    (startOfDay(targetDate).getTime() - startOfDay(now).getTime()) / MS_PER_DAY
  );

  return {
    state: "closed",
    opensAt: { dayOffset, hour: bestOpen.hour, minute: bestOpen.minute },
  };
}

export function isCurrentlyOpen(status: OpeningStatus): boolean {
  return status.state === "open" || status.state === "open24h";
}

function formatTime(t: { hour: number; minute: number }): string {
  return `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
}

// 表示用の日本語ラベルに変換する（例: 「営業中（〜20:00）」「営業時間外（明日 12:00〜）」）
export function formatOpeningStatus(status: OpeningStatus): string {
  switch (status.state) {
    case "open24h":
      return "営業中（24時間営業）";
    case "open":
      return `営業中（〜${formatTime(status.closesAt)}）`;
    case "closed":
      if (!status.opensAt) return "営業時間外";
      if (status.opensAt.dayOffset <= 0) return `営業時間外（本日 ${formatTime(status.opensAt)}〜）`;
      if (status.opensAt.dayOffset === 1) return `営業時間外（明日 ${formatTime(status.opensAt)}〜）`;
      return `営業時間外（${status.opensAt.dayOffset}日後 ${formatTime(status.opensAt)}〜）`;
    case "unknown":
      return "営業時間情報なし";
  }
}

// 実行時刻をAsia/Tokyoの壁時計時刻として扱えるDateに変換する。
// サーバー（VercelはUTC）・クライアント（訪問者のタイムゾーンは店舗と無関係）の
// どちらで呼んでも、常に店舗所在地（日本）の時刻で判定するために使う
export function getJstNow(baseDate: Date = new Date()): Date {
  return new Date(baseDate.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
}

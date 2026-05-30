export const ENTRY_SCORE_SLUGS = [
  "easy-solo",
  "beginner-friendly",
  "staff-quiet",
  "staff-helpful",
  "quiet-atmosphere",
] as const;

export const VIBE_BADGE_SLUGS = ["easy-solo", "beginner-friendly"] as const;

export const VIBE_BADGE_LABEL: Record<string, string> = {
  "easy-solo": "一人でOK",
  "beginner-friendly": "初心者向け",
};

type StoreTag = {
  tag_masters: { type: string; slug: string; label_ja: string } | null;
};

export function calcEntryScore(storeTags: StoreTag[]): number {
  const slugs = storeTags
    .map((st) => st.tag_masters?.slug)
    .filter((s): s is string => !!s);
  return ENTRY_SCORE_SLUGS.filter((s) => slugs.includes(s)).length;
}

export function getVibeBadges(storeTags: StoreTag[]): string[] {
  const slugs = storeTags
    .map((st) => st.tag_masters?.slug)
    .filter((s): s is string => !!s);
  return VIBE_BADGE_SLUGS.filter((s) => slugs.includes(s));
}

export type Area = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
};

export const AREAS: Area[] = [
  { slug: "shimokitazawa", name: "下北沢", lat: 35.6613, lng: 139.6680, zoom: 16 },
  { slug: "harajuku",      name: "原宿",   lat: 35.6702, lng: 139.7027, zoom: 16 },
  { slug: "shibuya",       name: "渋谷",   lat: 35.6580, lng: 139.7016, zoom: 15 },
  { slug: "shinjuku",      name: "新宿",   lat: 35.6896, lng: 139.6917, zoom: 15 },
];

export const AREA_ID_MAP: Record<string, string> = {
  shimokitazawa: "a0000000-0000-0000-0000-000000000001",
  harajuku:      "a0000000-0000-0000-0000-000000000002",
  shibuya:       "a0000000-0000-0000-0000-000000000003",
  shinjuku:      "a0000000-0000-0000-0000-000000000004",
};

export const DEFAULT_AREA_SLUG = "shimokitazawa";

export function getArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}

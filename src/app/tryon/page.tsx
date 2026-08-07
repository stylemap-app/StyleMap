import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import TryonClient from "./TryonClient";

export const metadata: Metadata = {
  title: "試着",
};

export type TryonCloth = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

export default async function TryonPage({
  searchParams,
}: {
  searchParams: { clothesId?: string };
}) {
  let initialCloth: TryonCloth | null = null;

  if (searchParams.clothesId) {
    const supabase = createClient();
    const { data } = await supabase
      .from("clothes")
      .select("id, name, price, image_url")
      .eq("id", searchParams.clothesId)
      .eq("is_published", true)
      .maybeSingle();
    initialCloth = data;
  }

  return <TryonClient initialCloth={initialCloth} />;
}

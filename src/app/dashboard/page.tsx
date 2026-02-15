import { createClient } from "@/lib/supabase-server";
import { getCurrentRoundKey } from "@/lib/constants";
import { redirect } from "next/navigation";
import DashboardClient from "./client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || !profile.onboarded) redirect("/onboarding");

  const roundKey = getCurrentRoundKey();

  const { data: poolEntry } = await supabase
    .from("matching_pool")
    .select("id")
    .eq("user_id", user.id)
    .eq("round_key", roundKey)
    .single();

  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("round_key", roundKey)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single();

  let status: "not_joined" | "queued" | "matched" = "not_joined";
  if (match) status = "matched";
  else if (poolEntry) status = "queued";

  return (
    <DashboardClient
      userId={user.id}
      email={user.email!}
      displayName={profile.display_name}
      isAdmin={profile.is_admin}
      roundKey={roundKey}
      initialStatus={status}
    />
  );
}
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
    .select("id, user1_id, user2_id")
    .eq("round_key", roundKey)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single();

  let status: "not_joined" | "queued" | "matched" = "not_joined";
  if (match) status = "matched";
  else if (poolEntry) status = "queued";

  let schedule = null;
  let tier = 1;
  let passed = false;

  if (status === "matched" && match) {
    const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;

    const { data: interestRows } = await supabase
      .from("match_interest")
      .select("user_id, interested, confirmed, passed")
      .eq("match_id", match.id);

    const myInterest = interestRows?.find((r) => r.user_id === user.id);
    const partnerInterest = interestRows?.find((r) => r.user_id === partnerId);

    passed = (myInterest?.passed || false) || (partnerInterest?.passed || false);

    const bothInterested = (myInterest?.interested || false) && (partnerInterest?.interested || false);
    const bothConfirmed = (myInterest?.confirmed || false) && (partnerInterest?.confirmed || false);

    if (bothConfirmed) tier = 3;
    else if (bothInterested) tier = 2;

    if (tier === 3 && !passed) {
      const { data: scheduleData } = await supabase
        .from("round_schedule")
        .select("date, time, location, notes")
        .eq("round_key", roundKey)
        .single();
      schedule = scheduleData;
    }
  }

  return (
    <DashboardClient
      userId={user.id}
      email={user.email!}
      displayName={profile.display_name}
      isAdmin={profile.is_admin}
      roundKey={roundKey}
      initialStatus={status}
      schedule={schedule}
      tier={tier}
      passed={passed}
    />
  );
}

import { createClient } from "@/lib/supabase-server";
import { getCurrentRoundKey, ICEBREAKER_QUESTION_IDS } from "@/lib/constants";
import { redirect } from "next/navigation";
import MatchClient from "./client";

export default async function MatchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || !profile.onboarded) redirect("/onboarding");

  const roundKey = getCurrentRoundKey();

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("round_key", roundKey)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single();

  if (!match) {
    return (
      <MatchClient
        userId={user.id}
        matchId=""
        email={user.email!}
        isAdmin={profile.is_admin}
        matchCard={null}
        partnerId=""
        tier={1}
        userInterested={false}
        partnerInterested={false}
        userConfirmed={false}
        partnerConfirmed={false}
      />
    );
  }

  const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;

  // Fetch interest state for both users
  const { data: interestRows } = await supabase
    .from("match_interest")
    .select("user_id, interested, confirmed")
    .eq("match_id", match.id);

  const myInterest = interestRows?.find((r) => r.user_id === user.id);
  const partnerInterest = interestRows?.find((r) => r.user_id === partnerId);

  const userInterested = myInterest?.interested || false;
  const partnerInterested = partnerInterest?.interested || false;
  const userConfirmed = myInterest?.confirmed || false;
  const partnerConfirmed = partnerInterest?.confirmed || false;

  const bothInterested = userInterested && partnerInterested;
  const bothConfirmed = userConfirmed && partnerConfirmed;

  let tier = 1;
  if (bothConfirmed) tier = 3;
  else if (bothInterested) tier = 2;

  // Always fetch basic profile info (Tier 1)
  const { data: partnerProfile } = await supabase
    .from("profiles")
    .select("display_name, pronouns, year, faculty, photo_url, instagram, phone")
    .eq("id", partnerId)
    .single();

  const { data: partnerAnswers } = await supabase
    .from("questionnaire_answers")
    .select("question_id, answer")
    .eq("user_id", partnerId)
    .in("question_id", ICEBREAKER_QUESTION_IDS);

  const { data: questions } = await supabase
    .from("questionnaire_questions")
    .select("id, text")
    .in("id", ICEBREAKER_QUESTION_IDS);

  const questionMap = Object.fromEntries((questions || []).map((q) => [q.id, q.text]));

  const icebreakers = (partnerAnswers || []).map((a) => ({
    question: questionMap[a.question_id] || a.question_id,
    answer: a.answer,
  }));

  const { data: scheduleData } = await supabase
    .from("round_schedule")
    .select("date, time, location, notes")
    .eq("round_key", roundKey)
    .single();

  const matchCard = partnerProfile
    ? {
        displayName: partnerProfile.display_name,
        pronouns: partnerProfile.pronouns,
        year: partnerProfile.year,
        faculty: partnerProfile.faculty,
        icebreakers,
        // Only include photo at Tier 2+, contact at Tier 3
        photoUrl: tier >= 2 ? partnerProfile.photo_url : null,
        instagram: tier >= 3 ? partnerProfile.instagram : null,
        phone: tier >= 3 ? partnerProfile.phone : null,
      }
    : null;

  return (
    <MatchClient
      userId={user.id}
      matchId={match.id}
      email={user.email!}
      isAdmin={profile.is_admin}
      matchCard={matchCard}
      partnerId={partnerId}
      schedule={scheduleData}
      tier={tier}
      userInterested={userInterested}
      partnerInterested={partnerInterested}
      userConfirmed={userConfirmed}
      partnerConfirmed={partnerConfirmed}
    />
  );
}

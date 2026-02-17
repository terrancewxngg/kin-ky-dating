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
        email={user.email!}
        isAdmin={profile.is_admin}
        matchCard={null}
        partnerEmail=""
      />
    );
  }

  const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;

  const { data: partnerProfile } = await supabase
    .from("profiles")
    .select("display_name, pronouns, year, faculty")
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
      }
    : null;

  return (
    <MatchClient
      userId={user.id}
      email={user.email!}
      isAdmin={profile.is_admin}
      matchCard={matchCard}
      partnerEmail={partnerId}
      schedule={scheduleData}
    />
  );
}
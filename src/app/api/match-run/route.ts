import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

function computeScore(
  answersA: Record<string, string>,
  answersB: Record<string, string>,
  questionTypes: Record<string, string>
): number {
  const questionIds = Object.keys(questionTypes);
  if (questionIds.length === 0) return 0;

  let total = 0;
  let count = 0;

  for (const qid of questionIds) {
    const a = answersA[qid];
    const b = answersB[qid];
    if (a === undefined || b === undefined) continue;

    const type = questionTypes[qid];

    if (type === "scale") {
      const diff = Math.abs(Number(a) - Number(b));
      total += 1 - diff / 4;
      count++;
    } else if (type === "choice") {
      total += a === b ? 1 : 0;
      count++;
    } else if (type === "multi_choice") {
      const setA = new Set(a.split(", ").filter(Boolean));
      const setB = new Set(b.split(", ").filter(Boolean));
      const intersection = [...setA].filter((x) => setB.has(x)).length;
      const union = new Set([...setA, ...setB]).size;
      total += union > 0 ? intersection / union : 0;
      count++;
    }
  }

  return count > 0 ? total / count : 0;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { roundKey } = await request.json();
  if (!roundKey) return NextResponse.json({ error: "roundKey required" }, { status: 400 });

  const admin = createAdminClient();

  // Get pool users for this round
  const { data: pool } = await admin.from("matching_pool").select("user_id").eq("round_key", roundKey);
  if (!pool || pool.length < 2) {
    return NextResponse.json({ error: "Not enough users in pool", matched: 0 });
  }

  // Get blocks
  const { data: blocks } = await admin.from("blocks").select("blocker_id, blocked_id");
  const blockSet = new Set((blocks || []).map((b) => `${b.blocker_id}:${b.blocked_id}`));
  const isBlocked = (a: string, b: string) => blockSet.has(`${a}:${b}`) || blockSet.has(`${b}:${a}`);

  // Get ALL past matches (across all rounds) to prevent rematching
  const { data: allMatches } = await admin.from("matches").select("user1_id, user2_id");
  const pastPairs = new Set<string>();
  const alreadyMatchedThisRound = new Set<string>();

  (allMatches || []).forEach((m) => {
    pastPairs.add(`${m.user1_id}:${m.user2_id}`);
    pastPairs.add(`${m.user2_id}:${m.user1_id}`);
  });

  // Check who's already matched THIS round
  const { data: existingMatches } = await admin.from("matches").select("user1_id, user2_id").eq("round_key", roundKey);
  (existingMatches || []).forEach((m) => {
    alreadyMatchedThisRound.add(m.user1_id);
    alreadyMatchedThisRound.add(m.user2_id);
  });

  const userIds = pool.map((p) => p.user_id).filter((id) => !alreadyMatchedThisRound.has(id));
  if (userIds.length < 2) {
    return NextResponse.json({ error: "Not enough unmatched users", matched: 0 });
  }

  // Fetch question types
  const { data: questions } = await admin.from("questionnaire_questions").select("id, type");
  const questionTypes: Record<string, string> = {};
  (questions || []).forEach((q) => { questionTypes[q.id] = q.type; });

  // Fetch all answers for pool users
  const { data: allAnswers } = await admin
    .from("questionnaire_answers")
    .select("user_id, question_id, answer")
    .in("user_id", userIds);

  const answerMap: Record<string, Record<string, string>> = {};
  (allAnswers || []).forEach((a) => {
    if (!answerMap[a.user_id]) answerMap[a.user_id] = {};
    answerMap[a.user_id][a.question_id] = a.answer;
  });

  // Score all valid pairs
  const scoredPairs: { a: string; b: string; score: number }[] = [];

  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      const a = userIds[i];
      const b = userIds[j];
      if (isBlocked(a, b)) continue;
      if (pastPairs.has(`${a}:${b}`)) continue;

      const score = computeScore(answerMap[a] || {}, answerMap[b] || {}, questionTypes);
      scoredPairs.push({ a, b, score });
    }
  }

  // Sort by score descending
  scoredPairs.sort((x, y) => y.score - x.score);

  // Greedy assign best pairs
  const newMatches: { round_key: string; user1_id: string; user2_id: string }[] = [];
  const used = new Set<string>();

  for (const pair of scoredPairs) {
    if (used.has(pair.a) || used.has(pair.b)) continue;
    newMatches.push({ round_key: roundKey, user1_id: pair.a, user2_id: pair.b });
    used.add(pair.a);
    used.add(pair.b);
  }

  if (newMatches.length > 0) {
    await admin.from("matches").insert(newMatches);
  }

  return NextResponse.json({
    ok: true,
    matched: newMatches.length * 2,
    leftover: userIds.length - newMatches.length * 2,
  });
}

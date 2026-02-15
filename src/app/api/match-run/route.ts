import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { roundKey } = await request.json();
  if (!roundKey) return NextResponse.json({ error: "roundKey required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: pool } = await admin.from("matching_pool").select("user_id").eq("round_key", roundKey);
  if (!pool || pool.length < 2) {
    return NextResponse.json({ error: "Not enough users in pool", matched: 0 });
  }

  const { data: blocks } = await admin.from("blocks").select("blocker_id, blocked_id");
  const blockSet = new Set((blocks || []).map((b) => `${b.blocker_id}:${b.blocked_id}`));
  const isBlocked = (a: string, b: string) => blockSet.has(`${a}:${b}`) || blockSet.has(`${b}:${a}`);

  const { data: existingMatches } = await admin.from("matches").select("user1_id, user2_id").eq("round_key", roundKey);
  const alreadyMatched = new Set<string>();
  (existingMatches || []).forEach((m) => {
    alreadyMatched.add(m.user1_id);
    alreadyMatched.add(m.user2_id);
  });

  const emails = pool.map((p) => p.user_id).filter((id) => !alreadyMatched.has(id));

  for (let i = emails.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emails[i], emails[j]] = [emails[j], emails[i]];
  }

  const newMatches: { round_key: string; user1_id: string; user2_id: string }[] = [];
  const used = new Set<string>();

  for (let i = 0; i < emails.length; i++) {
    if (used.has(emails[i])) continue;
    for (let j = i + 1; j < emails.length; j++) {
      if (used.has(emails[j])) continue;
      if (isBlocked(emails[i], emails[j])) continue;
      newMatches.push({ round_key: roundKey, user1_id: emails[i], user2_id: emails[j] });
      used.add(emails[i]);
      used.add(emails[j]);
      break;
    }
  }

  if (newMatches.length > 0) {
    await admin.from("matches").insert(newMatches);
  }

  return NextResponse.json({
    ok: true,
    matched: newMatches.length * 2,
    leftover: emails.length - newMatches.length * 2,
  });
}
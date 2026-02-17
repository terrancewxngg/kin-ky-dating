import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { sendMutualInterestNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId, action } = await request.json();
  if (!matchId || !action) return NextResponse.json({ error: "matchId and action required" }, { status: 400 });

  const admin = createAdminClient();

  // Verify user is part of this match
  const { data: match } = await admin.from("matches").select("user1_id, user2_id").eq("id", matchId).single();
  if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
    return NextResponse.json({ error: "Not your match" }, { status: 403 });
  }

  const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;

  if (action === "pass") {
    await admin.from("match_interest").upsert({
      match_id: matchId,
      user_id: user.id,
      passed: true,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "interested") {
    await admin.from("match_interest").upsert({
      match_id: matchId,
      user_id: user.id,
      interested: true,
    });

    // Check if partner is also interested
    const { data: partnerInterest } = await admin
      .from("match_interest")
      .select("interested")
      .eq("match_id", matchId)
      .eq("user_id", partnerId)
      .single();

    if (partnerInterest?.interested) {
      // Both are interested - send mutual interest emails
      const { data: userProfile } = await admin
        .from("profiles")
        .select("email, display_name, instagram")
        .eq("id", user.id)
        .single();

      const { data: partnerProfile } = await admin
        .from("profiles")
        .select("email, display_name, instagram")
        .eq("id", partnerId)
        .single();

      if (userProfile && partnerProfile) {
        await Promise.all([
          sendMutualInterestNotification(
            userProfile.email,
            partnerProfile.display_name,
            partnerProfile.instagram,
          ),
          sendMutualInterestNotification(
            partnerProfile.email,
            userProfile.display_name,
            userProfile.instagram,
          ),
        ]).catch(() => {
          // Don't fail the request if emails fail
        });
      }
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

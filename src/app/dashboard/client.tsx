"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Shell, Card, Nav, Btn } from "@/components/ui";

export default function DashboardClient({
  userId,
  email,
  displayName,
  isAdmin,
  roundKey,
  initialStatus,
  tier = 1,
  passed = false,
}: {
  userId: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  roundKey: string;
  initialStatus: "not_joined" | "queued" | "matched";
  tier?: number;
  passed?: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("matching_pool").insert({
      user_id: userId,
      round_key: roundKey,
    });
    setLoading(false);
    if (!error) setStatus("queued");
  };

  const statusConfig = {
    not_joined: { color: "var(--text-dim)", label: "Not joined", icon: "○" },
    queued: { color: "var(--accent)", label: "In the pool", icon: "◉" },
    matched: { color: "var(--success)", label: "You're matched!", icon: "♥" },
  };

  const sc = statusConfig[status];

  const matchedMessage = tier === 2
    ? "Photos and Instagram are unlocked! Reach out and make it happen."
    : "You've been matched! See your preview and decide if you're down.";

  return (
    <Shell>
      <Nav email={email} isAdmin={isAdmin} currentPage="dashboard" />
      <div style={{ flex: 1, width: "100%", maxWidth: 520, padding: "0 0 60px" }}>
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, marginBottom: 4 }}>
            Hey, {displayName} 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Round: {roundKey}</p>
        </div>

        <Card className={`fade-up fade-up-1 ${status === "matched" ? "glow-box" : ""}`} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 24 }}>{sc.icon}</div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: sc.color, fontFamily: "'Fraunces', serif" }}>{sc.label}</div>
            </div>
          </div>

          {status === "not_joined" && (
            <div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                Join this week&apos;s matching round. You&apos;ll be paired with one other UBC student for a blind date.
              </p>
              <Btn full onClick={handleJoin} disabled={loading}>
                {loading ? "Joining..." : "Join This Week's Round ✦"}
              </Btn>
            </div>
          )}
          {status === "queued" && (
            <div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                You&apos;re in the pool! Sit tight - matches will be revealed soon.
              </p>
              <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--accent-glow)", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 13, color: "var(--accent)" }}>Waiting for match...</span>
              </div>
            </div>
          )}
          {status === "matched" && passed && (
            <div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                This match didn&apos;t work out. No worries - a new match comes next week.
              </p>
            </div>
          )}
          {status === "matched" && !passed && (
            <div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                {matchedMessage}
              </p>
              <a href="/match"><Btn full>See Your Match →</Btn></a>
            </div>
          )}
        </Card>

        <Card className="fade-up fade-up-2">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "var(--text-muted)" }}>How the reveal works</h3>
          <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 6 }}><span style={{ color: "var(--accent)" }}>01</span> See their vibe - name, year, icebreakers</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 6 }}><span style={{ color: "var(--accent)" }}>02</span> Both say &quot;I&apos;m down&quot; → photos + Instagram unlock</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ color: "var(--accent)" }}>03</span> Reach out, meet up, make a story</div>
          </div>
        </Card>
      </div>
    </Shell>
  );
}

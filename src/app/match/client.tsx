"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Shell, Card, Nav, Btn, Alert, TextArea } from "@/components/ui";

interface MatchCard {
  displayName: string;
  pronouns: string | null;
  year: string | null;
  faculty: string | null;
  icebreakers: { question: string; answer: string }[];
}

interface Schedule {
  date: string;
  time: string;
  location: string;
  notes: string | null;
}

export default function MatchClient({
  userId,
  email,
  isAdmin,
  matchCard,
  partnerEmail,
  schedule,
}: {
  userId: string;
  email: string;
  isAdmin: boolean;
  matchCard: MatchCard | null;
  partnerEmail: string;
  schedule?: Schedule | null;
}) {
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [reported, setReported] = useState(false);

  const handleBlock = async () => {
    const supabase = createClient();
    const { error } = await supabase.from("blocks").insert({
      blocker_id: userId,
      blocked_id: partnerEmail,
    });
    if (!error) setBlocked(true);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    const supabase = createClient();
    const { error } = await supabase.from("reports").insert({
      reporter_id: userId,
      reported_id: partnerEmail,
      reason: reportReason.trim(),
    });
    if (!error) {
      setReported(true);
      setShowReport(false);
    }
  };

  if (!matchCard) {
    return (
      <Shell>
        <Nav email={email} isAdmin={isAdmin} currentPage="match" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Card className="fade-up" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤷</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, marginBottom: 8 }}>No match yet</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
              Join this week&apos;s round from your dashboard to get matched.
            </p>
            <a href="/dashboard"><Btn>Go to Dashboard</Btn></a>
          </Card>
        </div>
      </Shell>
    );
  }

  const suggestedMessages = [
    `Hey ${matchCard.displayName}! We matched on blind@ubc — want to grab a coffee this week?`,
    `Hi ${matchCard.displayName}! Looks like we're this week's match. What's your go-to spot on campus?`,
    `Hey! I'm your blind date match. Want to meet up sometime this week?`,
  ];

  return (
    <Shell>
      <Nav email={email} isAdmin={isAdmin} currentPage="match" />
      <div style={{ flex: 1, width: "100%", maxWidth: 520, padding: "0 0 60px" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: "var(--accent)", fontFamily: "'Fraunces', serif", fontStyle: "italic", marginBottom: 4 }}>
            This week&apos;s match
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700 }}>It&apos;s a date ✦</h1>
        </div>

        {blocked && <Alert type="info">You&apos;ve blocked this user. They won&apos;t appear in future matches.</Alert>}
        {reported && <Alert type="success">Report submitted. Thank you for keeping our community safe.</Alert>}

        <Card className="fade-up fade-up-1 glow-box" style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-soft))", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontFamily: "'Fraunces', serif", color: "var(--bg)", fontWeight: 700 }}>
            {matchCard.displayName[0]?.toUpperCase()}
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, marginBottom: 4 }}>{matchCard.displayName}</h2>
          {matchCard.pronouns && <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>{matchCard.pronouns}</div>}
          <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
            {[matchCard.year, matchCard.faculty].filter(Boolean).join(" · ") || "UBC Student"}
          </div>
        </Card>

        {schedule && (
          <Card className="fade-up fade-up-2" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your Date</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)" }}>
                    {new Date(schedule.date + "T00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    {(() => {
                      const [h, m] = schedule.time.split(":");
                      const hour = parseInt(h);
                      const ampm = hour >= 12 ? "PM" : "AM";
                      const h12 = hour % 12 || 12;
                      return `${h12}:${m} ${ampm}`;
                    })()}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📍</span>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)" }}>{schedule.location}</div>
              </div>
              {schedule.notes && (
                <div style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic", paddingLeft: 28, lineHeight: 1.5 }}>
                  {schedule.notes}
                </div>
              )}
            </div>
          </Card>
        )}

        {matchCard.icebreakers.length > 0 && (
          <Card className="fade-up fade-up-2" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>Icebreakers</h3>
            {matchCard.icebreakers.map((ib, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < matchCard.icebreakers.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 14, color: "var(--text-dim)" }}>{ib.question}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", background: "var(--accent-glow)", padding: "4px 10px", borderRadius: 6 }}>{ib.answer}</span>
              </div>
            ))}
          </Card>
        )}

        <Card className="fade-up fade-up-3" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggested opener</h3>
          {suggestedMessages.map((msg, i) => (
            <div key={i} onClick={() => navigator.clipboard?.writeText(msg)} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 10, marginBottom: i < suggestedMessages.length - 1 ? 8 : 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, cursor: "pointer", border: "1px solid var(--border)", transition: "border 0.2s" }}>
              {msg}
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>Click to copy</div>
            </div>
          ))}
        </Card>

        <Card className="fade-up fade-up-4">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>Safety</h3>
          {showReport ? (
            <div>
              <TextArea label="Why are you reporting this user?" value={reportReason} onChange={setReportReason} placeholder="Describe the issue..." rows={3} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="danger" onClick={handleReport} disabled={!reportReason.trim()}>Submit Report</Btn>
                <Btn variant="ghost" onClick={() => setShowReport(false)}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="danger" onClick={handleBlock} disabled={blocked}>{blocked ? "Blocked" : "Block User"}</Btn>
              <Btn variant="secondary" onClick={() => setShowReport(true)} disabled={reported}>{reported ? "Reported" : "Report User"}</Btn>
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
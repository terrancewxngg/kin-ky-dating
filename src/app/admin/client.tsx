"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Shell, Card, Nav, Input, Btn, Alert, TextArea } from "@/components/ui";

interface MatchPair {
  user1: { display_name: string; email: string };
  user2: { display_name: string; email: string };
}

interface Schedule {
  date: string;
  time: string;
  location: string;
  notes: string;
}

export default function AdminClient({
  email,
  isAdmin,
  currentRoundKey,
}: {
  email: string;
  isAdmin: boolean;
  currentRoundKey: string;
}) {
  const [roundKey, setRoundKey] = useState(currentRoundKey);
  const [result, setResult] = useState<{ ok?: boolean; error?: string; matched?: number; leftover?: number } | null>(null);
  const [reports, setReports] = useState<{ reporter_id: string; reported_id: string; reason: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [schedule, setSchedule] = useState<Schedule>({ date: "", time: "", location: "", notes: "" });
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [matches, setMatches] = useState<MatchPair[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: reps } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (reps) setReports(reps);

      const { data: sched } = await supabase.from("round_schedule").select("*").eq("round_key", currentRoundKey).single();
      if (sched) {
        setSchedule({ date: sched.date, time: sched.time, location: sched.location, notes: sched.notes || "" });
      }

      loadMatches(currentRoundKey);
    };
    load();
  }, [currentRoundKey]);

  const loadMatches = async (rk: string) => {
    setMatchesLoading(true);
    const supabase = createClient();
    const { data: matchRows } = await supabase
      .from("matches")
      .select("user1_id, user2_id")
      .eq("round_key", rk);

    if (!matchRows || matchRows.length === 0) {
      setMatches([]);
      setMatchesLoading(false);
      return;
    }

    const userIds = new Set<string>();
    matchRows.forEach((m) => { userIds.add(m.user1_id); userIds.add(m.user2_id); });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .in("id", Array.from(userIds));

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    const pairs: MatchPair[] = matchRows.map((m) => ({
      user1: profileMap[m.user1_id] || { display_name: "Unknown", email: "?" },
      user2: profileMap[m.user2_id] || { display_name: "Unknown", email: "?" },
    }));

    setMatches(pairs);
    setMatchesLoading(false);
  };

  const handleRunMatching = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/match-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundKey }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (data.ok) loadMatches(roundKey);
  };

  const handleSaveSchedule = async () => {
    if (!schedule.date || !schedule.time || !schedule.location) {
      setScheduleMsg({ type: "error", text: "Date, time, and location are required." });
      return;
    }
    setScheduleSaving(true);
    setScheduleMsg(null);
    const supabase = createClient();
    const { error } = await supabase.from("round_schedule").upsert({
      round_key: roundKey,
      date: schedule.date,
      time: schedule.time,
      location: schedule.location,
      notes: schedule.notes || null,
      updated_at: new Date().toISOString(),
    });
    setScheduleSaving(false);
    if (error) {
      setScheduleMsg({ type: "error", text: error.message });
    } else {
      setScheduleMsg({ type: "success", text: "Schedule saved!" });
    }
  };

  return (
    <Shell>
      <Nav email={email} isAdmin={isAdmin} currentPage="admin" />
      <div style={{ flex: 1, width: "100%", maxWidth: 600, padding: "0 0 60px" }}>
        <h1 className="fade-up" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, marginBottom: 24 }}>Admin Panel</h1>

        {/* Run Matching */}
        <Card className="fade-up fade-up-1" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Run Matching</h3>
          <Input label="Round Key" value={roundKey} onChange={setRoundKey} placeholder="2026-W07" />
          <Btn onClick={handleRunMatching} disabled={loading}>
            {loading ? "Running..." : `Run Matching for ${roundKey}`}
          </Btn>
          {result && (
            <div style={{ marginTop: 16 }}>
              {result.ok ? (
                <Alert type="success">Matched {result.matched} users! {(result.leftover ?? 0) > 0 ? `${result.leftover} leftover.` : ""}</Alert>
              ) : (
                <Alert type="error">{result.error}</Alert>
              )}
            </div>
          )}
        </Card>

        {/* Schedule Date */}
        <Card className="fade-up fade-up-2" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Schedule Date</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>Date</label>
            <input
              type="date"
              value={schedule.date}
              onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
              style={{ width: "100%", padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 15, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>Time</label>
            <input
              type="time"
              value={schedule.time}
              onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
              style={{ width: "100%", padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 15, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <Input label="Location" value={schedule.location} onChange={(v) => setSchedule({ ...schedule, location: v })} placeholder="e.g. The Nest, UBC" />
          <TextArea label="Notes (optional)" value={schedule.notes} onChange={(v) => setSchedule({ ...schedule, notes: v })} placeholder="e.g. Look for the reserved table near the window" rows={2} />
          <Btn onClick={handleSaveSchedule} disabled={scheduleSaving}>
            {scheduleSaving ? "Saving..." : "Save Schedule"}
          </Btn>
          {scheduleMsg && (
            <div style={{ marginTop: 12 }}>
              <Alert type={scheduleMsg.type}>{scheduleMsg.text}</Alert>
            </div>
          )}
        </Card>

        {/* Matches List */}
        <Card className="fade-up fade-up-3" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Matches ({matches.length})</h3>
          {matchesLoading ? (
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Loading...</p>
          ) : matches.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No matches for this round yet.</p>
          ) : (
            matches.map((m, i) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: i < matches.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{m.user1.display_name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", wordBreak: "break-all" }}>{m.user1.email}</div>
                  </div>
                  <span style={{ color: "var(--accent)", fontSize: 14, flexShrink: 0 }}>↔</span>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{m.user2.display_name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", wordBreak: "break-all" }}>{m.user2.email}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Reports */}
        <Card className="fade-up fade-up-4">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Reports ({reports.length})</h3>
          {reports.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No reports yet.</p>
          ) : (
            reports.map((r, i) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: i < reports.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--text)", fontWeight: 500 }}>{r.reporter_id.slice(0, 8)}...</span>
                  {" → "}
                  <span style={{ color: "var(--danger)" }}>{r.reported_id.slice(0, 8)}...</span>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 4, fontStyle: "italic" }}>
                  &ldquo;{r.reason}&rdquo;
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </Shell>
  );
}

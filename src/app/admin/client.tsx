"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Shell, Card, Nav, Input, Btn, Alert } from "@/components/ui";

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

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: reps } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (reps) setReports(reps);
    };
    load();
  }, []);

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
  };

  return (
    <Shell>
      <Nav email={email} isAdmin={isAdmin} currentPage="admin" />
      <div style={{ flex: 1, width: "100%", maxWidth: 600, padding: "0 0 60px" }}>
        <h1 className="fade-up" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, marginBottom: 24 }}>Admin Panel</h1>

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

        <Card className="fade-up fade-up-2">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Reports ({reports.length})</h3>
          {reports.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-dim)" }}>No reports yet. 🎉</p>
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
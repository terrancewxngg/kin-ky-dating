"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Shell, Card, Nav, Btn, Alert } from "@/components/ui";

export default function SettingsClient({
  email,
  isAdmin,
}: {
  email: string;
  isAdmin: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").delete().eq("id", user.id);
    }
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <Shell>
      <Nav email={email} isAdmin={isAdmin} currentPage="settings" />
      <div style={{ flex: 1, width: "100%", maxWidth: 520, padding: "0 0 60px" }}>
        <h1 className="fade-up" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, marginBottom: 24 }}>Settings</h1>

        <Card className="fade-up fade-up-1" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Account</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>Logged in as</p>
          <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{email}</p>
        </Card>

        <Card className="fade-up fade-up-2" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--danger)", marginBottom: 8 }}>Danger Zone</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
            Deleting your account removes all your data permanently. This cannot be undone.
          </p>
          {!confirmDelete ? (
            <Btn variant="danger" onClick={() => setConfirmDelete(true)}>Delete My Account</Btn>
          ) : (
            <div>
              <Alert type="error">Are you sure? This will permanently delete your account, profile, and all data.</Alert>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="danger" onClick={handleDelete} disabled={loading}>
                  {loading ? "Deleting..." : "Yes, Delete Everything"}
                </Btn>
                <Btn variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Shell, Card, Nav, Btn, Alert, Input } from "@/components/ui";

export default function SettingsClient({
  userId,
  email,
  isAdmin,
  photoUrl,
  instagram: initialIg,
}: {
  userId: string;
  email: string;
  isAdmin: boolean;
  photoUrl: string | null;
  instagram: string;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ig, setIg] = useState(initialIg);
  const [preview, setPreview] = useState<string | null>(photoUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setSaveMsg({ type: "error", text: "Photo must be under 5MB." }); return; }
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    const supabase = createClient();

    let newPhotoUrl = photoUrl;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${userId}/photo.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photoFile, { upsert: true });
      if (uploadError) { setSaving(false); setSaveMsg({ type: "error", text: uploadError.message }); return; }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      newPhotoUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("profiles").update({
      photo_url: newPhotoUrl,
      instagram: ig.trim() || null,
    }).eq("id", userId);

    setSaving(false);
    if (error) {
      setSaveMsg({ type: "error", text: error.message });
    } else {
      setSaveMsg({ type: "success", text: "Saved!" });
      setPhotoFile(null);
    }
  };

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

        <Card className="fade-up fade-up-2" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Profile</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>Photo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {preview ? (
                <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                  <img src={preview} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--bg)", border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: 24, flexShrink: 0 }}>+</div>
              )}
              <label style={{ padding: "8px 16px", borderRadius: 8, background: "var(--surface-hover)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>
                Change photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          <Input label="Instagram handle" value={ig} onChange={setIg} placeholder="@yourhandle" />

          <Btn onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Btn>
          {saveMsg && <div style={{ marginTop: 12 }}><Alert type={saveMsg.type}>{saveMsg.text}</Alert></div>}
        </Card>

        <Card className="fade-up fade-up-3" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
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

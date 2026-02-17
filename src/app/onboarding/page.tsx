"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { PRONOUNS_OPTIONS, YEAR_OPTIONS, FACULTY_OPTIONS, MAX_BIO } from "@/lib/constants";
import { Shell, Card, Input, TextArea, Select, Btn, Checkbox, Alert } from "@/components/ui";

interface Question {
  id: string;
  text: string;
  type: "scale" | "choice";
  options: string[] | null;
  left_label: string | null;
  right_label: string | null;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [year, setYear] = useState("");
  const [faculty, setFaculty] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadQuestions = async () => {
      const { data } = await supabase
        .from("questionnaire_questions")
        .select("*")
        .order("sort_order");
      if (data) setQuestions(data);
    };
    loadQuestions();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5MB."); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setError("");
    if (!displayName.trim()) return setError("Display name is required.");
    if (!photoFile) return setError("A photo is required.");
    if (!instagram.trim()) return setError("Instagram handle is required.");
    if (!phone.trim()) return setError("Phone number is required.");
    if (!confirmed) return setError("You must confirm you're a UBC student and 18+.");
    if (bio.length > MAX_BIO) return setError(`Bio must be under ${MAX_BIO} characters.`);

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return setError("Not logged in."); }

    // Upload photo
    const ext = photoFile.name.split(".").pop();
    const path = `${user.id}/photo.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photoFile, { upsert: true });
    if (uploadError) { setLoading(false); return setError(uploadError.message); }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      display_name: displayName.trim(),
      pronouns: pronouns || null,
      year: year || null,
      faculty: faculty || null,
      bio: bio.trim() || null,
      instagram: instagram.trim(),
      phone: phone.trim(),
      photo_url: urlData.publicUrl,
      confirmed_student: confirmed,
      onboarded: false,
    });
    setLoading(false);

    if (dbError) return setError(dbError.message);
    setStep(2);
  };

  const handleSaveAnswers = async () => {
    setError("");
    const answered = Object.keys(answers).length;
    if (answered < 10) return setError(`Please answer all 10 questions (${answered}/10).`);

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setError("Not logged in.");

    const rows = Object.entries(answers).map(([question_id, answer]) => ({
      user_id: user.id,
      question_id,
      answer: String(answer),
    }));

    const { error: dbError } = await supabase.from("questionnaire_answers").upsert(rows, {
      onConflict: "user_id,question_id",
    });

    if (dbError) { setLoading(false); return setError(dbError.message); }

    await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  const setAnswer = (qid: string, val: string | number) => setAnswers((prev) => ({ ...prev, [qid]: val }));

  if (step === 1) {
    return (
      <Shell>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "60px 0 40px" }}>
          <Card className="fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>1</div>
              <div style={{ flex: 1, height: 2, background: "var(--border)", borderRadius: 1 }}><div style={{ width: "50%", height: "100%", background: "var(--accent)", borderRadius: 1 }} /></div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--border)", color: "var(--text-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>2</div>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, marginBottom: 4 }}>Tell us about you</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Just the basics — keep it light.</p>
            {error && <Alert>{error}</Alert>}
            <Input label="Display name *" value={displayName} onChange={setDisplayName} placeholder="First name or nickname" />
            <Select label="Pronouns" value={pronouns} onChange={setPronouns} options={PRONOUNS_OPTIONS} placeholder="Select pronouns (optional)" />
            <Select label="Year" value={year} onChange={setYear} options={YEAR_OPTIONS} placeholder="Select year (optional)" />
            <Select label="Faculty / Program" value={faculty} onChange={setFaculty} options={FACULTY_OPTIONS} placeholder="Select faculty (optional)" />
            <TextArea label="Short bio" value={bio} onChange={setBio} placeholder="Something fun about you..." maxLength={MAX_BIO} />

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>Photo *</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {photoPreview ? (
                  <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                    <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--bg)", border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: 24, flexShrink: 0 }}>+</div>
                )}
                <div>
                  <label style={{ padding: "8px 16px", borderRadius: 8, background: "var(--surface-hover)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", display: "inline-block" }}>
                    {photoFile ? "Change photo" : "Upload photo"}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                  </label>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>Max 5MB. This will be revealed to your match.</div>
                </div>
              </div>
            </div>

            <Input label="Instagram handle *" value={instagram} onChange={setInstagram} placeholder="@yourhandle" />
            <Input label="Phone number *" value={phone} onChange={setPhone} placeholder="e.g. 604-555-1234" />

            <Checkbox label="I confirm I'm a current UBC student and at least 18 years old." checked={confirmed} onChange={setConfirmed} />
            <Btn full onClick={handleSaveProfile} disabled={!displayName.trim() || !photoFile || !instagram.trim() || !phone.trim() || !confirmed || loading}>
              {loading ? "Saving..." : "Continue to Questions →"}
            </Btn>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "60px 0 40px" }}>
        <Card className="fade-up" style={{ maxWidth: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--success)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✓</div>
            <div style={{ flex: 1, height: 2, background: "var(--accent)", borderRadius: 1 }} />
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>2</div>
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, marginBottom: 4 }}>Quick 10</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
            Answer these to help us find your person. {Object.keys(answers).length}/10 answered.
          </p>
          {error && <Alert>{error}</Alert>}
          {questions.map((q, qi) => (
            <div
              key={q.id}
              className={`fade-up fade-up-${Math.min(qi, 4)}`}
              style={{
                marginBottom: 24,
                padding: 16,
                borderRadius: 12,
                background: answers[q.id] !== undefined ? "var(--accent-glow)" : "var(--bg)",
                border: `1px solid ${answers[q.id] !== undefined ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
                transition: "all 0.3s",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                <span>{q.text}</span>
                <span style={{ color: "var(--text-dim)" }}>#{qi + 1}</span>
              </div>
              {q.type === "scale" ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>
                    <span>{q.left_label}</span>
                    <span>{q.right_label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAnswer(q.id, v)}
                        style={{
                          flex: 1, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
                          background: answers[q.id] === v ? "var(--accent)" : "var(--surface-hover)",
                          color: answers[q.id] === v ? "var(--bg)" : "var(--text-muted)",
                          fontWeight: answers[q.id] === v ? 700 : 400, fontSize: 14, transition: "all 0.2s", fontFamily: "inherit",
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(q.options || []).map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => setAnswer(q.id, opt)}
                      style={{
                        padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: answers[q.id] === opt ? "var(--accent)" : "var(--surface-hover)",
                        color: answers[q.id] === opt ? "var(--bg)" : "var(--text-muted)",
                        fontWeight: answers[q.id] === opt ? 600 : 400, fontSize: 13, transition: "all 0.2s", fontFamily: "inherit",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Btn full onClick={handleSaveAnswers} disabled={Object.keys(answers).length < 10 || loading} style={{ marginTop: 8 }}>
            {loading ? "Saving..." : `Complete Setup (${Object.keys(answers).length}/10) →`}
          </Btn>
        </Card>
      </div>
    </Shell>
  );
}
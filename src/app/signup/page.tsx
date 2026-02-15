"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { isUbcEmail } from "@/lib/constants";
import { Shell, Card, Logo, Input, Btn, Alert, Divider } from "@/components/ui";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!email || !password) return setError("All fields required.");
    if (!isUbcEmail(email)) return setError("Only UBC emails (@ubc.ca or @student.ubc.ca) are allowed.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (authError) return setError(authError.message);
    setSuccess(true);
  };

  if (success) {
    return (
      <Shell>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", padding: "40px 0" }}>
          <Card className="fade-up">
            <Logo size="large" />
            <Alert type="success">Account created! Check your email for a verification link.</Alert>
            <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
              We sent a confirmation email to <strong style={{ color: "var(--text)" }}>{email}</strong>. Click the link in the email, then log in.
            </p>
            <a href="/login"><Btn full>Go to Login →</Btn></a>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", padding: "40px 0" }}>
        <Card className="fade-up">
          <Logo size="large" />
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, textAlign: "center", marginBottom: 24 }}>Create your account</h2>
          {error && <Alert>{error}</Alert>}
          <Input label="UBC Email" type="email" value={email} onChange={setEmail} placeholder="you@student.ubc.ca" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 6 characters" />
          <Input label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Re-enter password" />
          <Btn full onClick={handleSignup} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Creating account..." : "Sign Up"}
          </Btn>
          <Divider text="or" />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Already have an account? </span>
            <a href="/login" style={{ fontSize: 14, color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>Log in</a>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
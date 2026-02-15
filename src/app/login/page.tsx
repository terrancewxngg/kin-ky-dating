"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { isUbcEmail } from "@/lib/constants";
import { Shell, Card, Logo, Input, Btn, Alert, Divider } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) return setError("All fields required.");
    if (!isUbcEmail(email)) return setError("Only UBC emails are allowed.");

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    setLoading(false);

    if (authError) {
      if (authError.message.includes("Email not confirmed")) {
        return setError("Please verify your email first. Check your inbox for the confirmation link.");
      }
      return setError(authError.message);
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Shell>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", padding: "40px 0" }}>
        <Card className="fade-up">
          <Logo size="large" />
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 22, textAlign: "center", marginBottom: 24 }}>Welcome back</h2>
          {error && <Alert>{error}</Alert>}
          <Input label="UBC Email" type="email" value={email} onChange={setEmail} placeholder="you@student.ubc.ca" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />
          <Btn full onClick={handleLogin} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Logging in..." : "Log In"}
          </Btn>
          <Divider text="or" />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>New here? </span>
            <a href="/signup" style={{ fontSize: 14, color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>Sign up</a>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
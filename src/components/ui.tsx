"use client";

import React from "react";

export function Logo({ size = "normal" }: { size?: "normal" | "large" }) {
  return (
    <div className="text-center" style={{ marginBottom: size === "large" ? 40 : 24, cursor: "default" }}>
      <div style={{ fontSize: size === "large" ? 40 : 28, fontFamily: "'Fraunces', serif", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        kin-ky
      </div>
    </div>
  );
}

export function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, ...style }}>
      {children}
    </div>
  );
}

export function Input({ label, type = "text", value, onChange, placeholder, maxLength, error, disabled }: { label?: string; type?: string; value: string; onChange: (val: string) => void; placeholder?: string; maxLength?: number; error?: string; disabled?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} disabled={disabled} style={{ width: "100%", padding: "12px 14px", background: "var(--bg)", border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`, borderRadius: 10, color: "var(--text)", fontSize: 15, outline: "none", transition: "border 0.2s", fontFamily: "inherit" }} onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = error ? "var(--danger)" : "var(--border)")} />
      {error && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>{error}</div>}
      {maxLength && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3, textAlign: "right" }}>{value?.length || 0}/{maxLength}</div>}
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder, maxLength, rows = 3 }: { label?: string; value: string; onChange: (val: string) => void; placeholder?: string; maxLength?: number; rows?: number }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>{label}</label>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={rows} style={{ width: "100%", padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 15, outline: "none", resize: "vertical", transition: "border 0.2s", lineHeight: 1.5, fontFamily: "inherit" }} onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
      {maxLength && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3, textAlign: "right" }}>{value?.length || 0}/{maxLength}</div>}
    </div>
  );
}

export function Select({ label, value, onChange, options, placeholder }: { label?: string; value: string; onChange: (val: string) => void; options: string[]; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, color: value ? "var(--text)" : "var(--text-dim)", fontSize: 15, outline: "none", cursor: "pointer", appearance: "none" as const, fontFamily: "inherit", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
        <option value="" disabled>{placeholder || "Select..."}</option>
        {options.map((o) => <option key={o} value={o} style={{ background: "var(--surface)", color: "var(--text)" }}>{o}</option>)}
      </select>
    </div>
  );
}export function Btn({ children, onClick, variant = "primary", disabled, full, style: s = {}, type = "button" }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  full?: boolean;
  style?: React.CSSProperties;
  type?: "button" | "submit";
}) {
  const variants = {
    primary: { background: "var(--accent)", color: "var(--bg)", fontWeight: 600, border: "none" },
    secondary: { background: "transparent", color: "var(--text)", border: "1px solid var(--border)" },
    danger: { background: "var(--danger-soft)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" },
    ghost: { background: "transparent", color: "var(--text-muted)", border: "none" },
  };
  const v = variants[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ padding: "12px 24px", borderRadius: 10, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all 0.2s", width: full ? "100%" : "auto", fontFamily: "inherit", ...v, ...s }}>
      {children}
    </button>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 16, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
      <div onClick={(e) => { e.preventDefault(); onChange(!checked); }} style={{ width: 20, height: 20, minWidth: 20, borderRadius: 6, border: `2px solid ${checked ? "var(--accent)" : "var(--border)"}`, background: checked ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, transition: "all 0.2s", cursor: "pointer" }}>
        {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span>{label}</span>
    </label>
  );
}

export function Alert({ type = "error", children }: { type?: "error" | "success" | "info"; children: React.ReactNode }) {
  const colors = {
    error: { bg: "var(--danger-soft)", border: "rgba(239,68,68,0.2)", text: "var(--danger)" },
    success: { bg: "var(--success-soft)", border: "rgba(34,197,94,0.2)", text: "var(--success)" },
    info: { bg: "var(--accent-soft)", border: "rgba(245,158,11,0.2)", text: "var(--accent)" },
  };
  const c = colors[type];
  return (
    <div style={{ padding: "12px 16px", borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px", background: `radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 60%), var(--bg)` }}>
      {children}
    </div>
  );
}

export function Divider({ text }: { text?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      {text && <span style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{text}</span>}
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

export function Nav({ email, isAdmin, currentPage }: { email: string; isAdmin: boolean; currentPage: string }) {
  return (
    <nav style={{ width: "100%", maxWidth: 960, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", marginBottom: 8 }}>
      <a href="/dashboard" style={{ textDecoration: "none" }}><Logo /></a>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isAdmin && (
          <a href="/admin">
            <Btn variant="ghost" style={{ fontSize: 13, padding: "8px 12px", color: currentPage === "admin" ? "var(--accent)" : "var(--text-muted)" }}>Admin</Btn>
          </a>
        )}
        <a href="/settings">
          <Btn variant="ghost" style={{ fontSize: 13, padding: "8px 12px", color: currentPage === "settings" ? "var(--accent)" : "var(--text-muted)" }}>Settings</Btn>
        </a>
        <form action="/api/logout" method="POST">
          <Btn variant="secondary" type="submit" style={{ fontSize: 13, padding: "8px 14px" }}>Log out</Btn>
        </form>
      </div>
    </nav>
  );
}
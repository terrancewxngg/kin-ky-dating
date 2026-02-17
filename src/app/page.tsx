"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Shell, Btn } from "@/components/ui";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("landing-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
        width: "100%",
        maxWidth: 960,
      }}
    >
      {children}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "20px 0",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          color: "var(--text)",
          fontSize: 16,
          fontWeight: 500,
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "inherit",
          padding: 0,
        }}
      >
        {question}
        <span
          style={{
            color: "var(--accent)",
            fontSize: 20,
            transition: "transform 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0)",
            marginLeft: 16,
            flexShrink: 0,
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? 200 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, paddingTop: 12 }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const steps = [
    { num: "01", title: "Sign up", desc: "Create your account with your @student.ubc.ca email." },
    { num: "02", title: "Answer questions", desc: "Tell us about yourself so we can find your best match." },
    { num: "03", title: "Get matched", desc: "Every week, we pair you with someone new based on compatibility." },
    { num: "04", title: "Meet your match", desc: "Get your match's contact and take it from there." },
  ];

  const stats = [
    { label: "UBC students only", desc: "Verified @student.ubc.ca emails keep it exclusive." },
    { label: "New matches weekly", desc: "Fresh connections every week, no swiping required." },
    { label: "100% free", desc: "No subscriptions, no premium tiers. Just matches." },
  ];

  const faqs = [
    { q: "How does matching work?", a: "Our algorithm pairs you based on compatibility from your questionnaire answers. Each week, you get one curated match." },
    { q: "What can my match see?", a: "At first, you both see each other's name, year, faculty, and icebreaker answers. If you both say 'I'm down', photos unlock. If you both confirm the date, contact info (Instagram & phone) is shared." },
    { q: "Is it free?", a: "Completely free. No hidden fees, no premium features behind a paywall." },
    { q: "Who can sign up?", a: "Anyone with a valid @student.ubc.ca email address. We verify every account to keep the community safe." },
    { q: "What if I don't like my match?", a: "No pressure! You're not obligated to reach out. A new match comes next week." },
  ];

  return (
    <Shell>
      {/* Hero */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "85vh",
          textAlign: "center",
          width: "100%",
          maxWidth: 640,
          padding: "60px 0 40px",
        }}
      >
        <p className="fade-up" style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 24 }}>
          Created by{" "}
          <a href="https://www.instagram.com/terrancewxngg/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Terrance
          </a>
        </p>

        <div className="fade-up" style={{ animation: "float 4s ease-in-out infinite" }}>
          <div
            style={{
              fontSize: "clamp(48px, 10vw, 72px)",
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            kin-ky
          </div>
        </div>

        <p
          className="fade-up fade-up-1"
          style={{
            fontSize: "clamp(18px, 4vw, 24px)",
            color: "var(--text-muted)",
            fontFamily: "'Fraunces', serif",
            marginTop: 12,
          }}
        >
          Get matched with a UBC student.
        </p>

        <p
          className="fade-up fade-up-2"
          style={{
            fontSize: 14,
            color: "var(--text-dim)",
            marginTop: 16,
            fontStyle: "italic",
          }}
        >
          yes, this actually works and people are actually meeting through this.
        </p>

        <div className="fade-up fade-up-3" style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Link href="/signup">
            <Btn style={{ fontSize: 17, padding: "14px 40px", borderRadius: 12 }}>Match me</Btn>
          </Link>
          <Link
            href="/login"
            style={{
              fontSize: 14,
              color: "var(--text-dim)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            Already have an account? <span style={{ color: "var(--accent)" }}>Log in</span>
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <Section>
        <div style={{ padding: "60px 0" }}>
          <h2
            style={{
              fontSize: 28,
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 48,
              color: "var(--text)",
            }}
          >
            How it works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {steps.map((s) => (
              <div
                key={s.num}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 28,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 700,
                    color: "var(--accent)",
                    marginBottom: 12,
                  }}
                >
                  {s.num}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Stats */}
      <Section delay={0.1}>
        <div style={{ padding: "40px 0 60px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 28,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--accent)",
                    marginBottom: 8,
                    fontFamily: "'Fraunces', serif",
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section delay={0.1}>
        <div style={{ padding: "40px 0 60px", maxWidth: 640, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 28,
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 32,
              color: "var(--text)",
            }}
          >
            Questions?
          </h2>
          {faqs.map((f) => (
            <FAQItem key={f.q} question={f.q} answer={f.a} />
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section delay={0.1}>
        <div
          style={{
            textAlign: "center",
            padding: "40px 0 60px",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Ready to meet someone new?
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 28 }}>
            It takes less than 5 minutes to sign up.
          </p>
          <Link href="/signup">
            <Btn style={{ fontSize: 17, padding: "14px 40px", borderRadius: 12 }}>Match me</Btn>
          </Link>
        </div>
      </Section>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          maxWidth: 960,
          borderTop: "1px solid var(--border)",
          padding: "32px 0 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          marginTop: 20,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          kin-ky
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
          <Link href="/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            Log in
          </Link>
          <Link href="/signup" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            Sign up
          </Link>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
          Questions? DM{" "}
          <a href="https://www.instagram.com/terrancewxngg/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
            @terrancewxngg
          </a>
          {" "}on ig or email{" "}
          <a href="mailto:terrancewxngg@gmail.com" style={{ color: "var(--accent)", textDecoration: "none" }}>
            terrancewxngg@gmail.com
          </a>
        </p>
      </footer>
    </Shell>
  );
}

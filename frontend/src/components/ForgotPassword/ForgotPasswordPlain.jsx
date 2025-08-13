import React, { useState } from "react";

// Extremely minimal fallback version (no external CSS) to ensure the page renders
export default function ForgotPasswordPlain() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const container = {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "grid",
    placeItems: "center",
    padding: 20,
  };
  const card = {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  };
  const h2 = { margin: 0, marginBottom: 12, color: "#1f2937" };
  const p = { marginTop: 0, marginBottom: 16, color: "#4b5563" };
  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "2px solid #e5e7eb",
    fontSize: 16,
    outline: "none",
    marginBottom: 12,
  };
  const button = {
    width: "100%",
    padding: 12,
    border: 0,
    borderRadius: 10,
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
  };
  const link = { color: "#667eea", textDecoration: "none", fontWeight: 600 };

  return (
    <div style={container}>
      <div style={card}>
        {step === 1 && (
          <div>
            <h2 style={h2}>Reset your password</h2>
            <p style={p}>Enter your email address. We will send you a code.</p>
            <input
              style={input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={button} onClick={() => setStep(2)}>
              Send code
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={h2}>Enter verification code</h2>
            <p style={p}>We sent a 6-digit code to {email || "your email"}.</p>
            <input
              style={input}
              type="text"
              placeholder="6-digit code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button style={button} onClick={() => setStep(3)}>
              Verify
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={h2}>Create new password</h2>
            <p style={p}>This is the minimal fallback page (no network requests).</p>
            <button style={button} onClick={() => setStep(1)}>
              Back to start
            </button>
          </div>
        )}

        <p style={{ ...p, textAlign: "center", marginTop: 16 }}>
          Remember your password? <a href="/signin" style={link}>Sign in</a>
        </p>
      </div>
    </div>
  );
}


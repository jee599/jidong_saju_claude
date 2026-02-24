"use client";

import { useState } from "react";

export function OpsLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ops/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        return;
      }

      // Redirect to dashboard
      window.location.href = "/log/dashboard";
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-elevated rounded-2xl p-8 border border-border">
      <p className="text-text-secondary text-sm text-center mb-6">
        Internal ops dashboard. Enter the password to continue.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-bg-sunken border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none transition text-sm"
          />
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-brand text-white font-medium py-3 rounded-lg hover:bg-brand-light transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

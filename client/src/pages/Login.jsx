import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import DeviceWarning from "../components/DeviceWarning.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function buildDeviceFingerprint() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    resolution: `${window.screen.width}x${window.screen.height}`,
    platform: navigator.platform
  };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, login, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [deviceWarning, setDeviceWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="screen-state">Checking session...</div>;
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setDeviceWarning("");

    try {
      const nextUser = await login({
        ...form,
        deviceFingerprint: buildDeviceFingerprint()
      });

      const destination =
        nextUser.role === "admin"
          ? "/admin"
          : location.state?.from || "/dashboard";

      navigate(destination, { replace: true });
    } catch (requestError) {
      const message = requestError.message || "Login failed";
      setError(message);

      if (message.toLowerCase().includes("device limit")) {
        setDeviceWarning(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  return (
    <section className="auth-screen">
      <div className="auth-hero">
        <p className="eyebrow">Verified learning access</p>
        <h1>ScholasticaStars keeps courses, classes, and payments under one controlled student workspace.</h1>
        <p>
          Student accounts stay locked until approval. Paid lessons stay closed until an admin verifies payment or assigns the course.
        </p>
      </div>

      <div className="auth-card">
        <DeviceWarning message={deviceWarning} onClose={() => setDeviceWarning("")} />
        <p className="eyebrow">Welcome back</p>
        <h2>Log in</h2>
        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              className="input"
              name="email"
              onChange={handleChange}
              placeholder="student@example.com"
              type="email"
              value={form.email}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              className="input"
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              type="password"
              value={form.password}
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="button button-primary button-full" disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>
        <p className="muted-copy">
          New student? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { loading, register, user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="screen-state">Checking session...</div>;
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await register(form);
      setMessage(response.message);
      window.setTimeout(() => navigate("/login"), 1000);
    } catch (requestError) {
      setError(requestError.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-hero">
        <p className="eyebrow">Student onboarding</p>
        <h1>Create your account, then wait for the admin team to verify your student access.</h1>
        <p>
          Once approved, your dashboard unlocks free lessons, assigned premium courses, live classes, and payment submission.
        </p>
      </div>

      <div className="auth-card">
        <p className="eyebrow">Registration</p>
        <h2>Open an account</h2>
        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Full name</span>
            <input className="input" name="name" onChange={handleChange} value={form.name} />
          </label>
          <label className="field">
            <span>Email</span>
            <input className="input" name="email" onChange={handleChange} type="email" value={form.email} />
          </label>
          <label className="field">
            <span>Student ID</span>
            <input className="input" name="studentId" onChange={handleChange} value={form.studentId} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              className="input"
              name="password"
              onChange={handleChange}
              type="password"
              value={form.password}
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}
          <button className="button button-primary button-full" disabled={submitting} type="submit">
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="muted-copy">
          Already registered? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </section>
  );
}

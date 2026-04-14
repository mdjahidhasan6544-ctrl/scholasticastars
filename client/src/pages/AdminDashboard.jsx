import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axiosInstance from "../api/axiosInstance.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const response = await axiosInstance.get("/api/admin/summary");

        if (!isMounted) {
          return;
        }

        setStats(response.data.stats);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load admin summary");
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="stack page-gap">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Operations snapshot</p>
          <h2>Monitor approvals, payments, course inventory, and live delivery from one console.</h2>
        </div>
      </section>

      {error ? <div className="content-panel error-text">{error}</div> : null}

      <div className="stats-grid">
        <article className="stat-card">
          <span>{stats?.pendingStudents ?? "--"}</span>
          <p>Pending students</p>
        </article>
        <article className="stat-card">
          <span>{stats?.pendingPayments ?? "--"}</span>
          <p>Pending payments</p>
        </article>
        <article className="stat-card">
          <span>{stats?.totalCourses ?? "--"}</span>
          <p>Total courses</p>
        </article>
        <article className="stat-card">
          <span>{stats?.publishedLiveClasses ?? "--"}</span>
          <p>Published live classes</p>
        </article>
      </div>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Next actions</p>
            <h3>Move through the queue</h3>
          </div>
        </div>
        <div className="button-row">
          <Link className="button button-primary" to="/admin/students">
            Review students
          </Link>
          <Link className="button button-secondary" to="/admin/payments">
            Review payments
          </Link>
          <Link className="button button-secondary" to="/admin/courses">
            Manage courses
          </Link>
        </div>
      </section>
    </div>
  );
}

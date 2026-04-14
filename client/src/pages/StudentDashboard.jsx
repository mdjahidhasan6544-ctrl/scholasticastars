import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axiosInstance from "../api/axiosInstance.js";
import CourseCard from "../components/CourseCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [coursesResponse, liveClassesResponse] = await Promise.all([
          axiosInstance.get("/api/courses"),
          axiosInstance.get("/api/live-classes")
        ]);

        if (!isMounted) {
          return;
        }

        setCourses(coursesResponse.data.courses);
        setLiveClasses(liveClassesResponse.data.liveClasses);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load dashboard");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const accessibleCourses = courses.filter((course) => course.isAccessible);
  const lockedCourses = courses.filter((course) => course.isLocked);
  const nextLiveClass = liveClasses.find((item) => item.isUpcoming) || liveClasses[0];

  return (
    <div className="stack page-gap">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Learning workspace</p>
          <h2>{user?.name}, your approved courses and live sessions are ready.</h2>
          <p>
            Free courses open instantly. Paid courses unlock after manual admin assignment or payment verification.
          </p>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span>{accessibleCourses.length}</span>
            <p>Open courses</p>
          </article>
          <article className="stat-card">
            <span>{lockedCourses.length}</span>
            <p>Locked courses</p>
          </article>
          <article className="stat-card">
            <span>{liveClasses.length}</span>
            <p>Live sessions</p>
          </article>
        </div>
      </section>

      {nextLiveClass ? (
        <section className="content-panel spotlight-row">
          <div>
            <p className="eyebrow">Next live class</p>
            <h3>{nextLiveClass.title}</h3>
            <p>{formatDateTime(nextLiveClass.scheduledAt)}</p>
          </div>
          <Link className="button button-primary" to="/live-classes">
            View live schedule
          </Link>
        </section>
      ) : null}

      {loading ? <div className="content-panel">Loading dashboard...</div> : null}
      {error ? <div className="content-panel error-text">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Continue learning</p>
                <h3>Accessible courses</h3>
              </div>
            </div>
            <div className="course-grid">
              {accessibleCourses.length > 0 ? (
                accessibleCourses.map((course) => <CourseCard course={course} key={course.id} />)
              ) : (
                <div className="content-panel">No accessible courses yet.</div>
              )}
            </div>
          </section>

          <section className="stack">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Premium track</p>
                <h3>Locked paid courses</h3>
              </div>
            </div>
            <div className="course-grid">
              {lockedCourses.length > 0 ? (
                lockedCourses.map((course) => <CourseCard course={course} key={course.id} />)
              ) : (
                <div className="content-panel">All published courses are already unlocked for you.</div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

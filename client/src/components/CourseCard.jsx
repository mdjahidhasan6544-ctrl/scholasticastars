import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <article className={`course-card ${course.isLocked ? "course-card-locked" : ""}`}>
      <div className="course-thumbnail">
        {course.thumbnail ? (
          <img alt={course.title} src={course.thumbnail} />
        ) : (
          <div className="course-thumbnail-fallback">
            <span>{course.type === "paid" ? "Premium" : "Open"}</span>
          </div>
        )}
      </div>
      <div className="course-card-body">
        <div className="course-card-topline">
          <span className={`pill ${course.type === "paid" ? "pill-warning" : "pill-success"}`}>
            {course.type}
          </span>
          {course.isLocked ? <span className="pill pill-danger">Locked</span> : null}
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="button-row">
          <Link className="button button-primary" to={`/courses/${course.id}`}>
            {course.isLocked ? "View outline" : "Open course"}
          </Link>
          {course.isLocked ? (
            <Link className="button button-secondary" to={`/payments?courseId=${course.id}`}>
              Enroll
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import axiosInstance from "../api/axiosInstance.js";
import { getLessonExternalUrl } from "../utils/lessonContent.js";

const lessonTypeLabels = {
  youtube: "Video",
  google_doc: "Google Doc",
  pdf: "PDF",
  pptx: "PPTX"
};

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/courses/${id}`);

        if (!isMounted) {
          return;
        }

        setCourse(response.data.course);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load course");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="content-panel">Loading course...</div>;
  }

  if (error) {
    return <div className="content-panel error-text">{error}</div>;
  }

  return (
    <div className="stack page-gap">
      <section className="hero-panel course-hero">
        <div>
          <p className="eyebrow">{course.type} course</p>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
        </div>
        <div className="button-row">
          {course.isAccessible ? null : (
            <Link className="button button-primary" to={`/payments?courseId=${course.id}`}>
              Submit payment
            </Link>
          )}
          <Link className="button button-secondary" to="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="stack">
        {course.modules.map((moduleItem) => (
          <article className="module-panel" key={moduleItem.id}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Module {moduleItem.order}</p>
                <h3>{moduleItem.title}</h3>
              </div>
            </div>
            <div className="stack">
              {moduleItem.lessons.map((lesson) => (
                <div className="lesson-row" key={lesson.id}>
                  <div>
                    <strong>{lesson.title}</strong>
                    <p>
                      {lesson.duration || "Duration pending"} | {lessonTypeLabels[lesson.contentType || "youtube"]}
                      {lesson.isFree ? " | Free lesson" : ""}
                    </p>
                  </div>
                  {lesson.isLocked ? (
                    <span className="pill pill-danger">Locked</span>
                  ) : lesson.contentType === "youtube" || !lesson.contentType ? (
                    <Link className="button button-secondary" to={`/lessons/${lesson.id}`}>
                      Play lesson
                    </Link>
                  ) : (
                    <a className="button button-secondary" href={getLessonExternalUrl(lesson)} rel="noreferrer" target="_blank">
                      Open file
                    </a>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

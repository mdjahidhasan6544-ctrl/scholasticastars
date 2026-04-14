import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";
import { extractYouTubeId } from "../utils/lessonContent.js";

const lessonTypeLabels = {
  youtube: "Video",
  google_doc: "Google Doc",
  pdf: "PDF",
  pptx: "PPTX"
};

function buildLessonEmbedUrl(lesson) {
  const contentType = lesson.contentType || "youtube";

  if (contentType === "youtube") {
    const videoId = extractYouTubeId(lesson.youtubeId);

    return videoId
      ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
      : "";
  }

  return "";
}

export default function VideoPlayer({ lessonId }) {
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLesson() {
      try {
        setLoading(true);
        setError("");
        const response = await axiosInstance.get(`/api/lessons/${lessonId}`);

        if (!isMounted) {
          return;
        }

        setLesson(response.data.lesson);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load lesson");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLesson();

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  if (loading) {
    return <div className="content-panel">Loading lesson...</div>;
  }

  if (error) {
    return <div className="content-panel error-text">{error}</div>;
  }

  const contentType = lesson.contentType || "youtube";
  const embedUrl = buildLessonEmbedUrl(lesson);
  return (
    <section className="video-shell">
      <div className="video-frame">
        {embedUrl ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            src={embedUrl}
            title={lesson.title}
          />
        ) : (
          <div className="content-panel compact-panel">
            This lesson opens in a new tab from the course page.
          </div>
        )}
      </div>
      <div className="content-panel compact-panel">
        <p className="eyebrow">{lessonTypeLabels[contentType]} lesson</p>
        <h2>{lesson.title}</h2>
        <p>{lesson.courseTitle}</p>
      </div>
    </section>
  );
}

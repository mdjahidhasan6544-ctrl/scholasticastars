import { Link, useParams } from "react-router-dom";

import VideoPlayer from "../components/VideoPlayer.jsx";

export default function LessonPlayer() {
  const { id } = useParams();

  return (
    <div className="stack page-gap">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lesson viewer</p>
          <h2>Secure lesson access</h2>
        </div>
        <Link className="button button-secondary" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
      <VideoPlayer lessonId={id} />
    </div>
  );
}

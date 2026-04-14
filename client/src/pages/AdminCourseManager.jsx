import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";

const initialCourseForm = {
  title: "",
  description: "",
  type: "free",
  thumbnail: "",
  order: 0,
  isPublished: false
};

const initialModuleForm = {
  courseId: "",
  title: "",
  order: 0
};

const initialVideoLessonForm = {
  moduleId: "",
  title: "",
  youtubeId: "",
  duration: "",
  order: "",
  isFree: false
};

const initialDocumentLessonForm = {
  moduleId: "",
  title: "",
  contentType: "google_doc",
  resourceUrl: "",
  duration: "",
  order: "",
  isFree: false
};

const documentTypeOptions = [
  { value: "google_doc", label: "Google document" },
  { value: "pdf", label: "PDF file" },
  { value: "pptx", label: "PPTX file" }
];

const lessonTypeLabels = {
  youtube: "Video",
  google_doc: "Google Doc",
  pdf: "PDF",
  pptx: "PPTX"
};

function getDocumentResourceMeta(contentType) {
  if (contentType === "google_doc") {
    return {
      label: "Google Docs or Drive URL",
      placeholder: "https://docs.google.com/... or https://drive.google.com/..."
    };
  }

  return {
    label: `${lessonTypeLabels[contentType]} file URL`,
    placeholder: "https://example.com/file"
  };
}

export default function AdminCourseManager() {
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [moduleForm, setModuleForm] = useState(initialModuleForm);
  const [videoLessonForm, setVideoLessonForm] = useState(initialVideoLessonForm);
  const [documentLessonForm, setDocumentLessonForm] = useState(initialDocumentLessonForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCourses() {
    try {
      const response = await axiosInstance.get("/api/admin/courses");
      setCourses(response.data.courses);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load courses");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function updateForm(setter, event) {
    const { name, type, value, checked } = event.target;
    setter((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function normalizeOptionalOrder(value) {
    return `${value}`.trim() === "" ? undefined : Number(value);
  }

  async function submitCourse(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await axiosInstance.post("/api/admin/courses", {
        ...courseForm,
        order: Number(courseForm.order)
      });
      setCourseForm(initialCourseForm);
      setMessage("Course created");
      await loadCourses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create course");
    }
  }

  async function togglePublish(course) {
    setError("");
    setMessage("");

    try {
      await axiosInstance.put(`/api/admin/courses/${course.id}`, {
        isPublished: !course.isPublished
      });
      setMessage("Course updated");
      await loadCourses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update course");
    }
  }

  async function submitModule(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await axiosInstance.post("/api/admin/modules", {
        ...moduleForm,
        order: Number(moduleForm.order)
      });
      setModuleForm(initialModuleForm);
      setMessage("Module created");
      await loadCourses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create module");
    }
  }

  async function submitVideoLesson(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await axiosInstance.post("/api/admin/lessons", {
        ...videoLessonForm,
        contentType: "youtube",
        youtubeId: videoLessonForm.youtubeId.trim(),
        order: normalizeOptionalOrder(videoLessonForm.order)
      });
      setVideoLessonForm(initialVideoLessonForm);
      setMessage("Video lesson created");
      await loadCourses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create video lesson");
    }
  }

  async function submitDocumentLesson(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await axiosInstance.post("/api/admin/lessons", {
        ...documentLessonForm,
        resourceUrl: documentLessonForm.resourceUrl.trim(),
        order: normalizeOptionalOrder(documentLessonForm.order)
      });
      setDocumentLessonForm(initialDocumentLessonForm);
      setMessage("Document lesson created");
      await loadCourses();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create document lesson");
    }
  }

  const modules = courses.flatMap((course) => course.modules || []);
  const documentResourceMeta = getDocumentResourceMeta(documentLessonForm.contentType);

  return (
    <div className="stack page-gap">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Curriculum</p>
          <h2>Create courses, add modules, and publish lessons.</h2>
        </div>
      </section>

      {error ? <div className="content-panel error-text">{error}</div> : null}
      {message ? <div className="content-panel success-text">{message}</div> : null}

      <div className="admin-grid">
        <form className="content-panel stack" onSubmit={submitCourse}>
          <h3>Create course</h3>
          <input
            className="input"
            name="title"
            onChange={(event) => updateForm(setCourseForm, event)}
            placeholder="Course title"
            value={courseForm.title}
          />
          <textarea
            className="input textarea"
            name="description"
            onChange={(event) => updateForm(setCourseForm, event)}
            placeholder="Course description"
            value={courseForm.description}
          />
          <select className="input" name="type" onChange={(event) => updateForm(setCourseForm, event)} value={courseForm.type}>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          <input
            className="input"
            name="thumbnail"
            onChange={(event) => updateForm(setCourseForm, event)}
            placeholder="Thumbnail URL"
            value={courseForm.thumbnail}
          />
          <input className="input" min="0" name="order" onChange={(event) => updateForm(setCourseForm, event)} type="number" value={courseForm.order} />
          <label className="checkbox-row">
            <input checked={courseForm.isPublished} name="isPublished" onChange={(event) => updateForm(setCourseForm, event)} type="checkbox" />
            <span>Publish immediately</span>
          </label>
          <button className="button button-primary" type="submit">
            Create course
          </button>
        </form>

        <form className="content-panel stack" onSubmit={submitModule}>
          <h3>Add module</h3>
          <select className="input" name="courseId" onChange={(event) => updateForm(setModuleForm, event)} value={moduleForm.courseId}>
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <input className="input" name="title" onChange={(event) => updateForm(setModuleForm, event)} placeholder="Module title" value={moduleForm.title} />
          <input className="input" min="0" name="order" onChange={(event) => updateForm(setModuleForm, event)} type="number" value={moduleForm.order} />
          <button className="button button-primary" type="submit">
            Add module
          </button>
        </form>

        <form className="content-panel stack" onSubmit={submitVideoLesson}>
          <h3>Add video lesson</h3>
          <select className="input" name="moduleId" onChange={(event) => updateForm(setVideoLessonForm, event)} value={videoLessonForm.moduleId}>
            <option value="">Select module</option>
            {modules.map((moduleItem) => (
              <option key={moduleItem.id} value={moduleItem.id}>
                {moduleItem.title}
              </option>
            ))}
          </select>
          <input className="input" name="title" onChange={(event) => updateForm(setVideoLessonForm, event)} placeholder="Lesson title" value={videoLessonForm.title} />
          <input
            className="input"
            name="youtubeId"
            onChange={(event) => updateForm(setVideoLessonForm, event)}
            placeholder="https://www.youtube.com/watch?v=... or video ID"
            value={videoLessonForm.youtubeId}
          />
          <input className="input" name="duration" onChange={(event) => updateForm(setVideoLessonForm, event)} placeholder="Duration" value={videoLessonForm.duration} />
          <input
            className="input"
            min="0"
            name="order"
            onChange={(event) => updateForm(setVideoLessonForm, event)}
            placeholder="Leave blank for next order"
            type="number"
            value={videoLessonForm.order}
          />
          <p className="muted-copy">Leave order blank to append the lesson after the current last lesson in this module.</p>
          <label className="checkbox-row">
            <input checked={videoLessonForm.isFree} name="isFree" onChange={(event) => updateForm(setVideoLessonForm, event)} type="checkbox" />
            <span>Mark lesson as free</span>
          </label>
          <button className="button button-primary" type="submit">
            Add video lesson
          </button>
        </form>

        <form className="content-panel stack" onSubmit={submitDocumentLesson}>
          <h3>Add document lesson</h3>
          <select className="input" name="moduleId" onChange={(event) => updateForm(setDocumentLessonForm, event)} value={documentLessonForm.moduleId}>
            <option value="">Select module</option>
            {modules.map((moduleItem) => (
              <option key={moduleItem.id} value={moduleItem.id}>
                {moduleItem.title}
              </option>
            ))}
          </select>
          <input
            className="input"
            name="title"
            onChange={(event) => updateForm(setDocumentLessonForm, event)}
            placeholder="Document lesson title"
            value={documentLessonForm.title}
          />
          <select
            className="input"
            name="contentType"
            onChange={(event) => updateForm(setDocumentLessonForm, event)}
            value={documentLessonForm.contentType}
          >
            {documentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            className="input"
            name="resourceUrl"
            onChange={(event) => updateForm(setDocumentLessonForm, event)}
            placeholder={documentResourceMeta.placeholder}
            value={documentLessonForm.resourceUrl}
          />
          <input
            className="input"
            name="duration"
            onChange={(event) => updateForm(setDocumentLessonForm, event)}
            placeholder="Duration"
            value={documentLessonForm.duration}
          />
          <input
            className="input"
            min="0"
            name="order"
            onChange={(event) => updateForm(setDocumentLessonForm, event)}
            placeholder="Leave blank for next order"
            type="number"
            value={documentLessonForm.order}
          />
          <p className="muted-copy">{documentResourceMeta.label}</p>
          <label className="checkbox-row">
            <input
              checked={documentLessonForm.isFree}
              name="isFree"
              onChange={(event) => updateForm(setDocumentLessonForm, event)}
              type="checkbox"
            />
            <span>Mark lesson as free</span>
          </label>
          <button className="button button-primary" type="submit">
            Add document lesson
          </button>
        </form>
      </div>

      <section className="stack">
        {courses.map((course) => (
          <article className="content-panel" key={course.id}>
            <div className="section-heading">
              <div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
              </div>
              <div className="button-row">
                <span className={`pill ${course.isPublished ? "pill-success" : "pill-warning"}`}>
                  {course.isPublished ? "Published" : "Draft"}
                </span>
                <button className="button button-secondary" onClick={() => togglePublish(course)} type="button">
                  Toggle publish
                </button>
              </div>
            </div>

            <div className="stack">
              {(course.modules || []).map((moduleItem) => (
                <div className="module-panel" key={moduleItem.id}>
                  <h4>{moduleItem.title}</h4>
                  {(moduleItem.lessons || []).map((lesson) => (
                    <div className="lesson-row" key={lesson.id}>
                      <div>
                        <strong>{lesson.title}</strong>
                        <p>
                          {lesson.duration || "Duration pending"} | {lessonTypeLabels[lesson.contentType || "youtube"]} | Order{" "}
                          {lesson.order}
                        </p>
                      </div>
                      <div className="button-row">
                        <span className="pill pill-secondary">{lessonTypeLabels[lesson.contentType || "youtube"]}</span>
                        <span className={`pill ${lesson.isFree ? "pill-success" : "pill-warning"}`}>
                          {lesson.isFree ? "Free" : "Premium"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

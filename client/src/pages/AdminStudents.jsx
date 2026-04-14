import { useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";
import { formatStatusLabel, getStatusTone } from "../utils/statusLabels.js";

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

function formatAmount(value) {
  return Number.isFinite(value) ? value.toLocaleString() : value;
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadStudents() {
    try {
      const response = await axiosInstance.get("/api/admin/students");
      setStudents(response.data.students);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load students");
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function updateStudent(studentId, payload) {
    setBusyId(studentId);
    setError("");

    try {
      await axiosInstance.patch(`/api/admin/students/${studentId}`, payload);
      await loadStudents();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update student");
    } finally {
      setBusyId("");
    }
  }

  async function removeDevice(deviceId) {
    setBusyId(deviceId);
    setError("");

    try {
      await axiosInstance.delete(`/api/admin/devices/${deviceId}`);
      await loadStudents();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to remove device");
    } finally {
      setBusyId("");
    }
  }

  function confirmStudentUpdate(student, payload, message) {
    if (!window.confirm(message)) {
      return;
    }

    updateStudent(student.id, payload);
  }

  return (
    <div className="stack page-gap">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Student access</p>
          <h2>Approve students, review profile details, and track payment progress in one place.</h2>
        </div>
      </section>

      {error ? <div className="content-panel error-text">{error}</div> : null}

      <div className="stack">
        {students.map((student) => (
          <article className="content-panel stack" key={student.id}>
            <div className="section-heading">
              <div>
                <h3>{student.name}</h3>
                <p>
                  {student.email} | {student.studentId} | Payment: {formatStatusLabel(student.paymentStatus)}
                </p>
              </div>
              <div className="button-row">
                <span className={`pill ${getStatusTone(student.approvalStatus)}`}>
                  Approval: {formatStatusLabel(student.approvalStatus)}
                </span>
                <span className={`pill ${getStatusTone(student.status)}`}>
                  Account: {formatStatusLabel(student.status)}
                </span>
                <span className={`pill ${getStatusTone(student.paymentStatus)}`}>
                  Payment: {formatStatusLabel(student.paymentStatus)}
                </span>
              </div>
            </div>

            <div className="button-row">
              <button
                className="button button-primary"
                disabled={busyId === student.id}
                onClick={() =>
                  confirmStudentUpdate(
                    student,
                    { isVerifiedStudent: true, status: "active" },
                    `Approve ${student.name} and set the account to active?`,
                  )
                }
                type="button"
              >
                Approve
              </button>
              <button
                className="button button-secondary"
                disabled={busyId === student.id}
                onClick={() =>
                  confirmStudentUpdate(
                    student,
                    { resetDevices: true },
                    `Reset all registered devices for ${student.name}? The student will need to log in again on a new device.`,
                  )
                }
                type="button"
              >
                Reset devices
              </button>
              <button
                className="button button-danger"
                disabled={busyId === student.id}
                onClick={() =>
                  confirmStudentUpdate(
                    student,
                    { status: "banned" },
                    `Ban ${student.name}? This will block access to the student account.`,
                  )
                }
                type="button"
              >
                Ban
              </button>
            </div>

            <div className="stack">
              <p className="eyebrow">Student profile details</p>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Phone</span>
                  <strong>{student.phone || "Not provided"}</strong>
                </div>
                <div className="detail-item">
                  <span>Institution</span>
                  <strong>{student.institution || "Not provided"}</strong>
                </div>
                <div className="detail-item">
                  <span>Class / Level</span>
                  <strong>{student.classLevel || "Not provided"}</strong>
                </div>
                <div className="detail-item">
                  <span>Registered devices</span>
                  <strong>{student.deviceCount}</strong>
                </div>
                <div className="detail-item detail-item-wide">
                  <span>Address</span>
                  <strong>{student.address || "Not provided"}</strong>
                </div>
              </div>
            </div>

            <div className="stack">
              <p className="eyebrow">Payment details</p>
              {student.payments.length ? (
                student.payments.map((payment) => (
                  <div className="payment-row" key={payment.id}>
                    <div>
                      <strong>{payment.courseTitle}</strong>
                      <p>
                        {payment.method.toUpperCase()} | Phone: {payment.phoneNumber || "Not provided"} | TXN: {payment.transactionId}
                      </p>
                    </div>
                    <div className="button-row">
                      <span className="muted-copy">Amount: {formatAmount(payment.amount)}</span>
                      <span className="muted-copy">Updated: {formatDateTime(payment.updatedAt)}</span>
                      <span className={`pill ${getStatusTone(payment.displayStatus)}`}>
                        {formatStatusLabel(payment.displayStatus)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted-copy">No payment records submitted yet.</p>
              )}
            </div>

            <div className="stack">
              <p className="eyebrow">Registered devices</p>
              {student.devices.length ? (
                student.devices.map((device) => (
                  <div className="device-row" key={device.id}>
                    <div>
                      <strong>{device.ip || "Unknown IP"}</strong>
                      <p>{device.userAgent || "Unknown device"}</p>
                    </div>
                    <div className="button-row">
                      <span className="muted-copy">{formatDateTime(device.lastSeen)}</span>
                      <button
                        className="button button-secondary"
                        disabled={busyId === device.id}
                        onClick={() => removeDevice(device.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted-copy">No devices recorded.</p>
              )}
            </div>
          </article>
        ))}
        {!students.length ? <div className="content-panel">No students found.</div> : null}
      </div>
    </div>
  );
}

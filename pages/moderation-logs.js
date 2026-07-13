import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function ModerationLogsPage() {
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/admin/moderation-logs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLogs(res.data.logs || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch moderation logs"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading moderation logs...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-admin-hero">
        <div>
          <div className="cf-kicker">Admin Audit Trail</div>

          <h1>Moderation Logs</h1>

          <p>
            Review platform-level moderation actions, role assignments,
            targets, reasons, and timestamps for accountability.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/admin-users")}
          >
            Back to Users
          </button>

          <button className="cf-btn-ghost" onClick={fetchLogs}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <section className="cf-error-state">{errorMessage}</section>}

      <section className="cf-collab-summary-grid">
        <div>
          <span>Total Logs</span>
          <strong>{logs.length}</strong>
        </div>

        <div>
          <span>Latest Action</span>
          <strong>{logs[0]?.action || "N/A"}</strong>
        </div>

        <div>
          <span>Latest Date</span>
          <strong>
            {logs[0]?.createdAt
              ? new Date(logs[0].createdAt).toLocaleDateString()
              : "N/A"}
          </strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{logs.length ? "Available" : "Empty"}</strong>
        </div>
      </section>

      {logs.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No moderation logs found</h2>
          <p>
            Role assignments and moderation actions will appear here after they
            are performed.
          </p>
        </section>
      ) : (
        <section className="cf-admin-log-list">
          {logs.map((log, index) => (
            <article key={log._id} className="cf-admin-log-card">
              <div className="cf-timeline-marker">
                <span>{index + 1}</span>
              </div>

              <div className="cf-admin-log-content">
                <div className="cf-notification-top">
                  <div>
                    <span className="cf-badge-dark">{log.action}</span>
                    <h2>{log.action}</h2>
                  </div>

                  <span className="cf-badge-muted">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>

                <div className="cf-project-info-grid">
                  <div>
                    <span>Moderator</span>
                    <strong>{log.moderatorId?.fullName || "Unknown"}</strong>
                  </div>

                  <div>
                    <span>Target Type</span>
                    <strong>{log.targetType || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Target ID</span>
                    <strong>{log.targetId || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Reason</span>
                    <strong>{log.reason || "No reason"}</strong>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
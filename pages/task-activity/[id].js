import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TaskActivityPage() {
  const router = useRouter();
  const { id } = router.query;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchTaskActivity();
    }
  }, [id]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchTaskActivity = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/activity/task/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActivities(res.data.activities || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch task activity"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading task activity...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-active-hero">
        <div>
          <div className="cf-kicker">Task Intelligence</div>

          <h1>Task Activity Timeline</h1>

          <p>
            Track every important task update, completion, comment, attachment,
            badge event, and teammate action in a clean timeline.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button className="cf-btn-ghost" onClick={() => router.back()}>
            Back
          </button>

          <button className="cf-btn-ghost" onClick={fetchTaskActivity}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <section className="cf-error-state">{errorMessage}</section>}

      <section className="cf-collab-summary-grid">
        <div>
          <span>Total Events</span>
          <strong>{activities.length}</strong>
        </div>

        <div>
          <span>Latest Event</span>
          <strong>
            {activities[0]?.createdAt
              ? new Date(activities[0].createdAt).toLocaleDateString()
              : "N/A"}
          </strong>
        </div>

        <div>
          <span>Task ID</span>
          <strong>{id || "N/A"}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{activities.length ? "Active" : "No Activity"}</strong>
        </div>
      </section>

      {activities.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No activity found</h2>

          <p>
            This task has no activity yet. Updates will appear here when team
            members create, comment, update, upload, or complete work.
          </p>
        </section>
      ) : (
        <section className="cf-timeline">
          {activities.map((activity, index) => (
            <article key={activity._id} className="cf-timeline-item">
              <div className="cf-timeline-marker">
                <span>{index + 1}</span>
              </div>

              <div className="cf-timeline-card">
                <div className="cf-timeline-top">
                  <div>
                    <span className="cf-badge-dark">{activity.type}</span>

                    <h2>{activity.title}</h2>
                  </div>

                  <span className="cf-badge-muted">
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>

                <p>{activity.description}</p>

                <div className="cf-project-info-grid">
                  <div>
                    <span>User</span>
                    <strong>{activity.userId?.fullName || "Unknown"}</strong>
                  </div>

                  <div>
                    <span>Type</span>
                    <strong>{activity.type}</strong>
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
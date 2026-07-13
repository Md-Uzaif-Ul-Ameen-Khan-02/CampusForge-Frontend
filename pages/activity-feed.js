import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function ActivityFeedPage() {
  const router = useRouter();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.get("http://localhost:5000/api/activity/feed");

      setActivities(res.data.activities || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch activity feed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading activity feed...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-active-hero">
        <div>
          <div className="cf-kicker">Platform Activity</div>

          <h1>Global Activity Feed</h1>

          <p>
            Track public CampusForge activity across projects, tasks,
            certificates, reviews, and collaboration events.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/my-activity")}
          >
            My Activity
          </button>

          <button className="cf-btn-ghost" onClick={fetchActivities}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

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
          <span>Feed Scope</span>
          <strong>Global</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{activities.length ? "Active" : "Empty"}</strong>
        </div>
      </section>

      {activities.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No activity found</h2>

          <p>
            Activity will appear here when students collaborate, complete work,
            update tasks, or trigger platform events.
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
                    <span className="cf-badge-dark">
                      {activity.type || "ACTIVITY"}
                    </span>

                    <h2>{activity.title || "Activity"}</h2>
                  </div>

                  <span className="cf-badge-muted">
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>

                <p>{activity.description || "No description available."}</p>

                <div className="cf-project-info-grid">
                  <div>
                    <span>User</span>
                    <strong>{activity.userId?.fullName || "Unknown"}</strong>
                  </div>

                  <div>
                    <span>Type</span>
                    <strong>{activity.type || "N/A"}</strong>
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
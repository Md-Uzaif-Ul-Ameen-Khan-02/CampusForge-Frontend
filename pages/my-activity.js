import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function MyActivityPage() {
  const router = useRouter();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchMyActivity();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMyActivity = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/activity/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setActivities(res.data.activities || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch my activity"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading your activity...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-active-hero">
        <div>
          <div className="cf-kicker">Personal Activity</div>

          <h1>My Activity</h1>

          <p>
            Review your own CampusForge actions, project updates, task work,
            and collaboration history.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/activity-feed")}
          >
            Activity Feed
          </button>

          <button className="cf-btn-ghost" onClick={fetchMyActivity}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {activities.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No activity found</h2>

          <p>Your personal activity will appear here after you use the platform.</p>
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
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
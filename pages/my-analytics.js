import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function MyAnalyticsPage() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchMyAnalytics();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMyAnalytics = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/analytics/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnalytics(res.data.analytics);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading your analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h2>No analytics found</h2>

          <p>{errorMessage || "Your analytics data could not be loaded."}</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </section>
      </div>
    );
  }

  const initials = analytics.fullName
    ? analytics.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CF";

  return (
    <div className="cf-page-shell">
      <section className="cf-public-profile-hero">
        <div className="cf-profile-identity">
          {analytics.profilePhoto ? (
            <img
              src={analytics.profilePhoto}
              alt="Profile"
              className="cf-profile-photo"
            />
          ) : (
            <div className="cf-profile-photo-fallback">{initials}</div>
          )}

          <div>
            <div className="cf-kicker">Personal Analytics</div>

            <h1>{analytics.fullName}</h1>

            <p>
              Track your reputation, completed projects, hackathon activity,
              completed tasks, and earned badges.
            </p>
          </div>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchMyAnalytics}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-analytics-grid">
        <article className="cf-analytics-card">
          <span>Reputation Score</span>
          <strong>{analytics.reputationScore || 0}</strong>
          <p>Your current platform reputation.</p>
        </article>

        <article className="cf-analytics-card">
          <span>Completed Projects</span>
          <strong>{analytics.completedProjects || 0}</strong>
          <p>Projects completed through CampusForge.</p>
        </article>

        <article className="cf-analytics-card">
          <span>Hackathons</span>
          <strong>{analytics.hackathonsParticipated || 0}</strong>
          <p>Hackathons you participated in.</p>
        </article>

        <article className="cf-analytics-card">
          <span>Tasks Completed</span>
          <strong>{analytics.tasksCompleted || 0}</strong>
          <p>Tasks marked complete by you.</p>
        </article>
      </section>

      <section className="cf-section">
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Badges</div>

            <h2>Your achievements</h2>
          </div>
        </div>

        <div className="cf-tech-stack">
          {analytics.badges?.length ? (
            analytics.badges.map((badge) => <span key={badge}>{badge}</span>)
          ) : (
            <span>No badges yet</span>
          )}
        </div>
      </section>
    </div>
  );
}
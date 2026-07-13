import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function PlatformAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    fetchPlatformAnalytics();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchPlatformAnalytics = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/analytics/platform",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics(res.data.analytics);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch platform analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading analytics...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only Super Admin can access platform analytics.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h2>Analytics not available</h2>

          <p>{errorMessage || "No analytics data was returned."}</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </section>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: analytics.totalUsers,
      text: "Registered platform accounts",
    },
    {
      label: "Total Projects",
      value: analytics.totalProjects,
      text: "Created student projects",
    },
    {
      label: "Total Tasks",
      value: analytics.totalTasks,
      text: "Tracked collaboration tasks",
    },
    {
      label: "Verified Students",
      value: analytics.verifiedStudents,
      text: "Approved student identities",
    },
  ];

  return (
    <div className="cf-page-shell">
      <section className="cf-admin-hero">
        <div>
          <div className="cf-kicker">Platform Intelligence</div>

          <h1>Platform Analytics</h1>

          <p>
            Monitor CampusForge activity, verified student growth, project
            creation, and task volume.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchPlatformAnalytics}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-analytics-grid">
        {cards.map((card) => (
          <article key={card.label} className="cf-analytics-card">
            <span>{card.label}</span>

            <strong>{card.value || 0}</strong>

            <p>{card.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
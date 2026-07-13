import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function EnvStatusPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [envStatus, setEnvStatus] = useState([]);
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

    fetchEnvStatus();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchEnvStatus = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/config/env-status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEnvStatus(res.data.status || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch environment status"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Checking environment status...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only Super Admin can access environment status.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-admin-hero">
        <div>
          <div className="cf-kicker">Configuration Audit</div>

          <h1>Environment Status</h1>

          <p>
            Check whether required backend environment variables are configured.
            Secret values are never shown.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchEnvStatus}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {envStatus.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No environment data found</h2>

          <p>No environment configuration records were returned.</p>
        </section>
      ) : (
        <section className="cf-env-grid">
          {envStatus.map((item) => (
            <article key={item.key} className="cf-env-card">
              <span
                className={
                  item.configured
                    ? "cf-status cf-status-success"
                    : "cf-priority cf-priority-high"
                }
              >
                {item.configured ? "CONFIGURED" : "MISSING"}
              </span>

              <h2>{item.key}</h2>

              <p>
                {item.configured
                  ? "This required environment variable is configured."
                  : "This required environment variable is missing."}
              </p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
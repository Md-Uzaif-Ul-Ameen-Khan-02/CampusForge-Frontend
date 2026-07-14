import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function SystemStatusPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

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

    checkSystemStatus();
  }, [authLoading, user]);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/health`);

      setStatus(res.data);
    } catch (error) {
      console.log(error);

      setStatus({
        success: false,
        message: "Backend is not reachable",
        server: "DOWN",
        database: "UNKNOWN",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Checking system status...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only Super Admin can access system status.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isWorking = Boolean(status?.success);

  return (
    <div className="cf-page-shell">
      <section className="cf-admin-hero">
        <div>
          <div className="cf-kicker">Infrastructure Health</div>

          <h1>System Status</h1>

          <p>
            Check backend reachability, server health, and database status
            before launch or testing.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={checkSystemStatus}>
            Refresh Status
          </button>
        </div>
      </section>

      <section className="cf-system-card">
        <div
          className={
            isWorking ? "cf-system-orb cf-orb-ok" : "cf-system-orb cf-orb-bad"
          }
        />

        <div>
          <span
            className={
              isWorking
                ? "cf-status cf-status-success"
                : "cf-priority cf-priority-high"
            }
          >
            {isWorking ? "WORKING" : "NOT WORKING"}
          </span>

          <h2>{status?.message || "No message returned"}</h2>

          <div className="cf-project-info-grid">
            <div>
              <span>Server</span>
              <strong>{status?.server || "UNKNOWN"}</strong>
            </div>

            <div>
              <span>Database</span>
              <strong>{status?.database || "UNKNOWN"}</strong>
            </div>

            <div>
              <span>Checked At</span>
              <strong>
                {status?.timestamp
                  ? new Date(status.timestamp).toLocaleString()
                  : "N/A"}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
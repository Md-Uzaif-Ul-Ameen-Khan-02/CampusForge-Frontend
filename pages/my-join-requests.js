import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function MyJoinRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isStudent =
    user?.role === "STUDENT" ||
    user?.role === "VERIFIED_STUDENT";

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isStudent) {
      setLoading(false);
      return;
    }

    fetchMyRequests();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMyRequests = async () => {
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
/api/join-requests/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(res.data.requests || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch join requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const confirmCancel = confirm(
        "Are you sure you want to cancel this join request?"
      );

      if (!confirmCancel) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/join-requests/cancel/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Join request cancelled");

      fetchMyRequests();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to cancel request"
      );
    }
  };

  const getRequestClass = (status) => {
    if (status === "APPROVED") return "cf-status cf-status-success";
    if (status === "REJECTED") return "cf-priority cf-priority-high";
    return "cf-status cf-status-warning";
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading your join requests...</div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>
          <p>Only students can access join requests.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-student-hero">
        <div>
          <div className="cf-kicker">Project Access</div>

          <h1>My Join Requests</h1>

          <p>
            Track projects you requested to join and cancel pending requests
            when needed.
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
            className="cf-btn-gold"
            onClick={() => router.push("/projects")}
          >
            Explore Projects
          </button>

          <button className="cf-btn-ghost" onClick={fetchMyRequests}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {requests.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No join requests yet</h2>

          <p>
            You have not sent any join requests yet. Explore projects and
            request to join a team that matches your skills.
          </p>

          <button onClick={() => router.push("/projects")}>
            Explore Projects
          </button>
        </section>
      ) : (
        <section className="cf-workflow-grid">
          {requests.map((request) => (
            <article key={request._id} className="cf-workflow-card">
              <div className="cf-workflow-card-top">
                <div>
                  <h2>{request.project?.title || "Project removed"}</h2>

                  {request.message && <p>{request.message}</p>}
                </div>

                <span className={getRequestClass(request.status)}>
                  {request.status}
                </span>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Requested On</span>
                  <strong>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleString()
                      : "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{request.status}</strong>
                </div>
              </div>

              {!request.project && (
                <div className="cf-error-state">
                  This project is no longer available.
                </div>
              )}

              <div className="cf-card-actions">
                {request.project && (
                  <button
                    onClick={() =>
                      router.push(`/projects/${request.project._id}`)
                    }
                  >
                    Open Project
                  </button>
                )}

                {request.status === "PENDING" && (
                  <button
                    onClick={() => cancelRequest(request._id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
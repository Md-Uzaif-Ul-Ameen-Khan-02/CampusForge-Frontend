import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function ProjectRequestsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchRequests();
    }
  }, [id]);

  const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const fetchProject = async () => {
    try {
      const token = getToken();

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setProject(res.data.project);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/join-requests/project/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(res.data.requests || []);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/join-requests/approve/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Request approved");
      fetchRequests();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Approval failed");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/join-requests/reject/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Request rejected");
      fetchRequests();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Rejection failed");
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading project join requests...</div>
      </div>
    );
  }

  const loggedInUserId = user?._id || user?.id;
  const projectOwnerId = project?.ownerId?._id || project?.ownerId;

  const isOwner =
    loggedInUserId &&
    projectOwnerId &&
    loggedInUserId.toString() === projectOwnerId.toString();

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "APPROVED"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "REJECTED"
  ).length;

  return (
    <div className="cf-page-shell">
      <section className="cf-collab-hero">
        <div>
          <div className="cf-kicker">Team Formation</div>

          <h1>Project Join Requests</h1>

          <p>
            Review students who want to join this project. Approve the right
            teammates and reject requests that do not fit the project.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push(`/projects/${id}`)}
          >
            Back to Project
          </button>

          <button className="cf-btn-ghost" onClick={fetchRequests}>
            Refresh
          </button>
        </div>
      </section>

      {!isOwner && (
        <section className="cf-access-card">
          <h2>Owner access required</h2>

          <p>Only the project owner can manage join requests.</p>
        </section>
      )}

      <section className="cf-collab-summary-grid">
        <div>
          <span>Project</span>
          <strong>{project?.title || "Project"}</strong>
        </div>

        <div>
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
        </div>

        <div>
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div>
          <span>Approved / Rejected</span>
          <strong>
            {approvedCount} / {rejectedCount}
          </strong>
        </div>
      </section>

      {requests.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No join requests found</h2>

          <p>
            When students request to join this project, they will appear here.
          </p>
        </section>
      ) : (
        <section className="cf-collab-grid">
          {requests.map((request) => (
            <article key={request._id} className="cf-collab-card">
              <div className="cf-collab-user-row">
                <div className="cf-user-avatar">
                  {request.user?.profilePhoto ? (
                    <img
                      src={request.user.profilePhoto}
                      alt={request.user?.fullName || "User"}
                    />
                  ) : (
                    <span>
                      {(request.user?.fullName || "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <span
                    className={
                      request.status === "APPROVED"
                        ? "cf-status cf-status-success"
                        : request.status === "REJECTED"
                        ? "cf-priority cf-priority-high"
                        : "cf-status cf-status-warning"
                    }
                  >
                    {request.status}
                  </span>

                  <h2>{request.user?.fullName || "Unknown User"}</h2>

                  <p>{request.user?.email || "No email available"}</p>
                </div>
              </div>

              {request.user?.skills?.length > 0 && (
                <div className="cf-tech-stack">
                  {request.user.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              )}

              {request.message && (
                <div className="cf-collab-message">
                  <strong>Message</strong>
                  <p>{request.message}</p>
                </div>
              )}

              <div className="cf-card-actions">
                <button
                  className="cf-btn-ghost-dark"
                  onClick={() => router.push(`/users/${request.user?._id}`)}
                >
                  View Profile
                </button>

                {isOwner && request.status === "PENDING" && (
                  <>
                    <button onClick={() => approveRequest(request._id)}>
                      Approve
                    </button>

                    <button
                      onClick={() => rejectRequest(request._id)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectInvitesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchInvites();
    }
  }, [id]);

  const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const fetchProject = async () => {
    try {
      const token = getToken();

      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setProject(res.data.project);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchInvites = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/project-invites/project/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInvites(res.data.invites || []);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch project invites");
    } finally {
      setLoading(false);
    }
  };

  const cancelInvite = async (inviteId) => {
    try {
      const confirmCancel = confirm(
        "Are you sure you want to cancel this invite?"
      );

      if (!confirmCancel) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/project-invites/cancel/${inviteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Invite cancelled successfully");
      fetchInvites();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to cancel invite");
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading project invites...</div>
      </div>
    );
  }

  const pendingCount = invites.filter(
    (invite) => invite.status === "PENDING"
  ).length;

  const acceptedCount = invites.filter(
    (invite) => invite.status === "ACCEPTED"
  ).length;

  const rejectedCount = invites.filter(
    (invite) => invite.status === "REJECTED"
  ).length;

  return (
    <div className="cf-page-shell">
      <section className="cf-collab-hero">
        <div>
          <div className="cf-kicker">Project Outreach</div>

          <h1>Project Invites</h1>

          <p>
            Track students invited to this project and manage pending
            collaboration invitations.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push(`/projects/${id}`)}
          >
            Back to Project
          </button>

          <button
            className="cf-btn-gold"
            onClick={() => router.push(`/invite-student/${id}`)}
          >
            Invite Student
          </button>

          <button className="cf-btn-ghost" onClick={fetchInvites}>
            Refresh
          </button>
        </div>
      </section>

      <section className="cf-collab-summary-grid">
        <div>
          <span>Project</span>
          <strong>{project?.title || "Project"}</strong>
        </div>

        <div>
          <span>Total Invites</span>
          <strong>{invites.length}</strong>
        </div>

        <div>
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div>
          <span>Accepted / Rejected</span>
          <strong>
            {acceptedCount} / {rejectedCount}
          </strong>
        </div>
      </section>

      {invites.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No invites sent yet</h2>

          <p>
            Invite students to join this project and track their responses here.
          </p>

          <button onClick={() => router.push(`/invite-student/${id}`)}>
            Invite Student
          </button>
        </section>
      ) : (
        <section className="cf-collab-grid">
          {invites.map((invite) => (
            <article key={invite._id} className="cf-collab-card">
              <div className="cf-collab-user-row">
                <div className="cf-user-avatar">
                  {invite.invitedUser?.profilePhoto ? (
                    <img
                      src={invite.invitedUser.profilePhoto}
                      alt={invite.invitedUser?.fullName || "User"}
                    />
                  ) : (
                    <span>
                      {(invite.invitedUser?.fullName || "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <span
                    className={
                      invite.status === "ACCEPTED"
                        ? "cf-status cf-status-success"
                        : invite.status === "REJECTED"
                        ? "cf-priority cf-priority-high"
                        : "cf-status cf-status-warning"
                    }
                  >
                    {invite.status}
                  </span>

                  <h2>{invite.invitedUser?.fullName || "Unknown User"}</h2>

                  <p>{invite.invitedUser?.email || "No email available"}</p>
                </div>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Role</span>
                  <strong>{invite.invitedUser?.role || "N/A"}</strong>
                </div>

                <div>
                  <span>Sent On</span>
                  <strong>
                    {invite.createdAt
                      ? new Date(invite.createdAt).toLocaleString()
                      : "N/A"}
                  </strong>
                </div>
              </div>

              {invite.message && (
                <div className="cf-collab-message">
                  <strong>Message</strong>
                  <p>{invite.message}</p>
                </div>
              )}

              <div className="cf-card-actions">
                <button
                  className="cf-btn-ghost-dark"
                  onClick={() =>
                    router.push(`/users/${invite.invitedUser?._id}`)
                  }
                >
                  View Profile
                </button>

                {invite.status === "PENDING" && (
                  <button
                    onClick={() => cancelInvite(invite._id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    Cancel Invite
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
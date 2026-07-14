import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function MyInvitesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [invites, setInvites] = useState([]);
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

    fetchMyInvites();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMyInvites = async () => {
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
/api/project-invites/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInvites(res.data.invites || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch project invites. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (inviteId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/project-invites/accept/${inviteId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Invite accepted successfully");

      fetchMyInvites();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to accept invite"
      );
    }
  };

  const rejectInvite = async (inviteId) => {
    try {
      const confirmReject = confirm(
        "Are you sure you want to reject this invite?"
      );

      if (!confirmReject) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/project-invites/reject/${inviteId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Invite rejected");

      fetchMyInvites();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to reject invite"
      );
    }
  };

  const getInviteClass = (status) => {
    if (status === "ACCEPTED") return "cf-status cf-status-success";
    if (status === "REJECTED") return "cf-priority cf-priority-high";
    return "cf-status cf-status-warning";
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading your project invites...</div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>
          <p>Only students can access project invites.</p>

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
          <div className="cf-kicker">Team Invitations</div>

          <h1>My Project Invites</h1>

          <p>
            Review invitations from project owners and choose which teams you
            want to join.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchMyInvites}>
            Refresh
          </button>

          <button
            className="cf-btn-gold"
            onClick={() => router.push("/projects")}
          >
            Explore Projects
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {invites.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No project invites yet</h2>

          <p>
            You do not have any project invites yet. When a project owner
            invites you to collaborate, it will appear here.
          </p>

          <button onClick={() => router.push("/projects")}>
            Explore Projects
          </button>
        </section>
      ) : (
        <section className="cf-workflow-grid">
          {invites.map((invite) => (
            <article key={invite._id} className="cf-workflow-card">
              <div className="cf-workflow-card-top">
                <div>
                  <h2>{invite.project?.title || "Project removed"}</h2>

                  {invite.message && <p>{invite.message}</p>}
                </div>

                <span className={getInviteClass(invite.status)}>
                  {invite.status}
                </span>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Invited By</span>
                  <strong>{invite.invitedBy?.fullName || "Unknown"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{invite.status}</strong>
                </div>
              </div>

              {!invite.project && (
                <div className="cf-error-state">
                  This project is no longer available.
                </div>
              )}

              <div className="cf-card-actions">
                {invite.project && (
                  <button
                    onClick={() =>
                      router.push(`/projects/${invite.project._id}`)
                    }
                  >
                    Open Project
                  </button>
                )}

                {invite.status === "PENDING" && (
                  <>
                    <button onClick={() => acceptInvite(invite._id)}>
                      Accept
                    </button>

                    <button
                      onClick={() => rejectInvite(invite._id)}
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
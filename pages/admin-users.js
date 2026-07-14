import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
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

    fetchUsers();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data.users || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const assignModerator = async (userId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/admin/assign-moderator/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Moderator assigned successfully");
      fetchUsers();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to assign moderator");
    }
  };

  const roleClass = (role) => {
    if (role === "SUPER_ADMIN") return "cf-badge-dark";
    if (role === "MODERATOR") return "cf-status cf-status-warning";
    if (role === "COLLEGE_ADMIN") return "cf-status cf-status-open";
    if (role === "VERIFIED_STUDENT") return "cf-status cf-status-success";
    return "cf-status cf-status-muted";
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading users...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only Super Admin can access user management.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const verifiedStudentsCount = users.filter(
    (item) => item.role === "VERIFIED_STUDENT"
  ).length;

  const collegeAdminsCount = users.filter(
    (item) => item.role === "COLLEGE_ADMIN"
  ).length;

  const moderatorsCount = users.filter(
    (item) => item.role === "MODERATOR"
  ).length;

  return (
    <div className="cf-page-shell">
      <section className="cf-admin-hero">
        <div>
          <div className="cf-kicker">Platform Users</div>

          <h1>User Management</h1>

          <p>
            Review users, inspect roles, view profiles, and assign moderator
            access only where needed.
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
            onClick={() => router.push("/moderation-logs")}
          >
            Moderation Logs
          </button>

          <button className="cf-btn-ghost" onClick={fetchUsers}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-admin-summary-grid">
        <div>
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>

        <div>
          <span>Verified Students</span>
          <strong>{verifiedStudentsCount}</strong>
        </div>

        <div>
          <span>College Admins</span>
          <strong>{collegeAdminsCount}</strong>
        </div>

        <div>
          <span>Moderators</span>
          <strong>{moderatorsCount}</strong>
        </div>
      </section>

      {users.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No users found</h2>

          <p>No user records are available yet.</p>
        </section>
      ) : (
        <section className="cf-admin-grid">
          {users.map((item) => (
            <article key={item._id} className="cf-admin-card">
              <div className="cf-admin-card-header">
                <div>
                  <span className={roleClass(item.role)}>{item.role}</span>

                  <h2>{item.fullName}</h2>

                  <p>{item.email}</p>
                </div>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Verification</span>
                  <strong>{item.verificationStatus || "N/A"}</strong>
                </div>

                <div>
                  <span>Reputation</span>
                  <strong>{item.reputationScore || 0}</strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>{item.role}</strong>
                </div>
              </div>

              <div className="cf-card-actions">
                <button onClick={() => router.push(`/users/${item._id}`)}>
                  View Profile
                </button>

                {item.role !== "MODERATOR" && item.role !== "SUPER_ADMIN" && (
                  <button
                    className="cf-btn-ghost-dark"
                    onClick={() => assignModerator(item._id)}
                  >
                    Assign Moderator
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
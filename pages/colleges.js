import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function CollegesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [colleges, setColleges] = useState([]);
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

    fetchColleges();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/colleges", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setColleges(res.data.colleges || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch colleges"
      );
    } finally {
      setLoading(false);
    }
  };

  const approveCollege = async (collegeId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/colleges/approve/${collegeId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("College approved successfully");
      fetchColleges();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to approve college");
    }
  };

  const rejectCollege = async (collegeId) => {
    try {
      const rejectionReason = prompt("Enter rejection reason:");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/colleges/reject/${collegeId}`,
        {
          rejectionReason: rejectionReason || "No reason provided",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("College rejected successfully");
      fetchColleges();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to reject college");
    }
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") return "cf-status cf-status-success";
    if (status === "REJECTED") return "cf-priority cf-priority-high";
    return "cf-status cf-status-warning";
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading colleges...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only Super Admin can manage colleges.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const approvedCount = colleges.filter(
    (college) => college.approvalStatus === "APPROVED"
  ).length;

  const pendingCount = colleges.filter(
    (college) => college.approvalStatus === "PENDING"
  ).length;

  const rejectedCount = colleges.filter(
    (college) => college.approvalStatus === "REJECTED"
  ).length;

  return (
    <div className="cf-page-shell">
      <section className="cf-admin-hero">
        <div>
          <div className="cf-kicker">College Governance</div>

          <h1>College Management</h1>

          <p>
            Review registered colleges, approve valid institutions, and reject
            invalid or incomplete college registrations.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchColleges}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-admin-summary-grid">
        <div>
          <span>Total Colleges</span>
          <strong>{colleges.length}</strong>
        </div>

        <div>
          <span>Approved</span>
          <strong>{approvedCount}</strong>
        </div>

        <div>
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div>
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </div>
      </section>

      {colleges.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No colleges found</h2>

          <p>No college registration records are available yet.</p>
        </section>
      ) : (
        <section className="cf-admin-grid">
          {colleges.map((college) => (
            <article key={college._id} className="cf-admin-card">
              <div className="cf-admin-card-header">
                <div>
                  <span className={getStatusClass(college.approvalStatus)}>
                    {college.approvalStatus}
                  </span>

                  <h2>{college.collegeName}</h2>

                  <p>{college.officialEmail}</p>
                </div>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Domain</span>
                  <strong>{college.domain}</strong>
                </div>

                <div>
                  <span>Official Email</span>
                  <strong>{college.officialEmail}</strong>
                </div>

                <div>
                  <span>Approved By</span>
                  <strong>{college.approvedBy?.fullName || "N/A"}</strong>
                </div>
              </div>

              <div className="cf-admin-note">
                <strong>Accreditation</strong>
                <p>{college.accreditationDetails || "N/A"}</p>
              </div>

              {college.rejectionReason && (
                <div className="cf-admin-warning">
                  <strong>Rejection Reason</strong>
                  <p>{college.rejectionReason}</p>
                </div>
              )}

              <div className="cf-card-actions">
                {college.approvalStatus !== "APPROVED" && (
                  <button onClick={() => approveCollege(college._id)}>
                    Approve
                  </button>
                )}

                {college.approvalStatus !== "REJECTED" && (
                  <button
                    onClick={() => rejectCollege(college._id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    Reject
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
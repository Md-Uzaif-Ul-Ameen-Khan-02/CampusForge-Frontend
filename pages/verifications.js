import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function VerificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [verifications, setVerifications] = useState([]);
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

    fetchVerifications();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchVerifications = async () => {
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
/api/verifications/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVerifications(res.data.verifications || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch verifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (verificationId) => {
    try {
      const token = getToken();

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/verifications/approve/${verificationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Student verification approved");

      fetchVerifications();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to approve verification"
      );
    }
  };

  const rejectVerification = async (verificationId) => {
    try {
      const rejectionReason = prompt("Enter rejection reason:");

      const token = getToken();

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/verifications/reject/${verificationId}`,
        {
          rejectionReason: rejectionReason || "No reason provided",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Student verification rejected");

      fetchVerifications();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to reject verification"
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">
          Loading verifications...
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>
            Only Super Admin can access all student verifications.
          </p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-verification-hero">
        <div>
          <div className="cf-kicker">Super Admin Verification Center</div>

          <h1>All Student Verifications</h1>

          <p>
            Review pending student identity requests across CampusForge.
            Approve valid students, reject invalid submissions, and keep the
            platform trust layer clean.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchVerifications}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && (
        <section className="cf-error-state">
          {errorMessage}
        </section>
      )}

      <section className="cf-admin-summary-grid">
        <div>
          <span>Pending Requests</span>
          <strong>{verifications.length}</strong>
        </div>

        <div>
          <span>With ID Card</span>
          <strong>
            {
              verifications.filter((item) => Boolean(item.idCardImage))
                .length
            }
          </strong>
        </div>

        <div>
          <span>Missing ID Card</span>
          <strong>
            {
              verifications.filter((item) => !item.idCardImage)
                .length
            }
          </strong>
        </div>

        <div>
          <span>Review Mode</span>
          <strong>Super Admin</strong>
        </div>
      </section>

      {verifications.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No pending student verifications</h2>

          <p>
            There are no student verification requests waiting for review.
          </p>
        </section>
      ) : (
        <section className="cf-verification-grid">
          {verifications.map((verification) => (
            <article key={verification._id} className="cf-verification-card">
              <div className="cf-verification-card-header">
                <span className="cf-status cf-status-warning">
                  {verification.verificationStatus || "PENDING"}
                </span>

                <h2>
                  {verification.userId?.fullName || "Unknown Student"}
                </h2>

                <p>{verification.userId?.email || "N/A"}</p>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>College</span>
                  <strong>
                    {verification.collegeId?.collegeName || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>College Domain</span>
                  <strong>
                    {verification.collegeId?.domain || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Student ID</span>
                  <strong>
                    {verification.studentIdNumber || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Course</span>
                  <strong>{verification.course || "N/A"}</strong>
                </div>

                <div>
                  <span>Current Year</span>
                  <strong>{verification.currentYear || "N/A"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {verification.verificationStatus || "N/A"}
                  </strong>
                </div>
              </div>

              <div className="cf-id-card-review">
                <h3>Student ID Card</h3>

                {verification.idCardImage ? (
                  verification.idCardImage.startsWith("http") ? (
                    <a
                      href={verification.idCardImage}
                      target="_blank"
                      rel="noreferrer"
                      className="cf-inline-link"
                    >
                      Open ID Card
                    </a>
                  ) : (
                    <p className="cf-danger-text">
                      Invalid old ID card link. Ask student to resubmit
                      verification.
                    </p>
                  )
                ) : (
                  <p className="cf-danger-text">
                    ID card image not available.
                  </p>
                )}
              </div>

              <div className="cf-card-actions">
                <button
                  onClick={() => approveVerification(verification._id)}
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectVerification(verification._id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                  }}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
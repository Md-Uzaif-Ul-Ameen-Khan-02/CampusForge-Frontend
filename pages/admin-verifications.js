import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function AdminVerificationsPage() {
  const router = useRouter();

  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchPendingVerifications = async () => {
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
          "Failed to fetch pending verifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (verificationId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

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

      alert("Verification approved successfully");
      fetchPendingVerifications();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Approval failed");
    }
  };

  const rejectVerification = async (verificationId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/verifications/reject/${verificationId}`,
        {
          rejectionReason:
            rejectionReasons[verificationId] ||
            "Verification rejected by admin",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Verification rejected");
      fetchPendingVerifications();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Rejection failed");
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading pending verifications...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-verification-hero">
        <div>
          <div className="cf-kicker">Admin Review</div>

          <h1>Pending Student Verifications</h1>

          <p>
            Review student verification requests, inspect student profiles,
            open ID proof links, and approve or reject submissions.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchPendingVerifications}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-collab-summary-grid">
        <div>
          <span>Pending</span>
          <strong>{verifications.length}</strong>
        </div>

        <div>
          <span>Review Type</span>
          <strong>Student</strong>
        </div>

        <div>
          <span>Decision</span>
          <strong>Approve / Reject</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{verifications.length ? "Action Needed" : "Clear"}</strong>
        </div>
      </section>

      {verifications.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No pending verifications found</h2>

          <p>There are no student verification requests waiting for review.</p>
        </section>
      ) : (
        <section className="cf-verification-grid">
          {verifications.map((verification) => (
            <article key={verification._id} className="cf-verification-card">
              <div className="cf-verification-card-header">
                <span className="cf-status cf-status-warning">
                  {verification.verificationStatus}
                </span>

                <h2>{verification.userId?.fullName || "Unknown Student"}</h2>

                <p>{verification.userId?.email || "No email available"}</p>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>College</span>
                  <strong>
                    {verification.collegeId?.collegeName || "Unknown College"}
                  </strong>
                </div>

                <div>
                  <span>Student ID</span>
                  <strong>{verification.studentIdNumber}</strong>
                </div>

                <div>
                  <span>Course</span>
                  <strong>{verification.course}</strong>
                </div>

                <div>
                  <span>Current Year</span>
                  <strong>{verification.currentYear}</strong>
                </div>
              </div>

              <div className="cf-id-card-review">
                <h3>ID Card</h3>

                {verification.idCardImage?.startsWith("http") ? (
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
                    {verification.idCardImage || "ID card image not available"}
                  </p>
                )}
              </div>

              <div className="cf-card-actions">
                <button
                  className="cf-btn-ghost-dark"
                  onClick={() =>
                    router.push(`/users/${verification.userId?._id}`)
                  }
                >
                  View Student Profile
                </button>

                <button onClick={() => approveVerification(verification._id)}>
                  Approve
                </button>
              </div>

              <div className="cf-rejection-box">
                <label>Rejection Reason</label>

                <input
                  type="text"
                  placeholder="Rejection reason"
                  value={rejectionReasons[verification._id] || ""}
                  onChange={(e) =>
                    setRejectionReasons({
                      ...rejectionReasons,
                      [verification._id]: e.target.value,
                    })
                  }
                />

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
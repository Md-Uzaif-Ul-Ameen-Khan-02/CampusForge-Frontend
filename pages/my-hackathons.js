import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function MyHackathonsPage() {
  const router = useRouter();

  const [registrations, setRegistrations] = useState([]);
  const [submissionLinks, setSubmissionLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/hackathons/my-registrations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRegistrations(res.data.registrations || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch registrations"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitProject = async (registrationId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const submissionLink = submissionLinks[registrationId];

      if (!submissionLink) {
        alert("Please enter submission link");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/hackathons/submit/${registrationId}`,
        {
          submissionLink,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Project submitted successfully");

      setSubmissionLinks((prev) => ({
        ...prev,
        [registrationId]: "",
      }));

      fetchMyRegistrations();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Project submission failed");
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading your hackathons...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-innovation-hero">
        <div>
          <div className="cf-kicker">My Competitions</div>

          <h1>My Hackathons</h1>

          <p>
            Track hackathon registrations, team details, project ideas,
            submissions, and current participation status.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/hackathons")}
          >
            Back to Hackathons
          </button>

          <button className="cf-btn-ghost" onClick={fetchMyRegistrations}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <section className="cf-error-state">{errorMessage}</section>}

      <section className="cf-collab-summary-grid">
        <div>
          <span>Total Registrations</span>
          <strong>{registrations.length}</strong>
        </div>

        <div>
          <span>Submitted</span>
          <strong>
            {registrations.filter((item) => item.status === "SUBMITTED").length}
          </strong>
        </div>

        <div>
          <span>Pending</span>
          <strong>
            {registrations.filter((item) => item.status !== "SUBMITTED").length}
          </strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{registrations.length ? "Active" : "Empty"}</strong>
        </div>
      </section>

      {registrations.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No hackathon registrations yet</h2>

          <p>
            You have not registered for any hackathons yet. Explore live
            challenges and join one with your team.
          </p>

          <button onClick={() => router.push("/hackathons")}>
            Explore Hackathons
          </button>
        </section>
      ) : (
        <section className="cf-innovation-grid">
          {registrations.map((registration) => (
            <article key={registration._id} className="cf-innovation-card">
              <div className="cf-card-topline">
                <span className="cf-badge-dark">
                  {registration.status || "REGISTERED"}
                </span>

                <span className="cf-badge">{registration.teamName}</span>
              </div>

              <h2>{registration.hackathonId?.title || "Hackathon"}</h2>

              <p>{registration.projectIdea || "No project idea added."}</p>

              <div className="cf-project-info-grid">
                <div>
                  <span>Organizer</span>
                  <strong>{registration.hackathonId?.organizer || "N/A"}</strong>
                </div>

                <div>
                  <span>Team Name</span>
                  <strong>{registration.teamName || "N/A"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{registration.status || "N/A"}</strong>
                </div>

                <div>
                  <span>Submission</span>
                  <strong>{registration.submissionLink ? "Added" : "Pending"}</strong>
                </div>
              </div>

              {registration.submissionLink && (
                <p>
                  <strong>Submission:</strong>{" "}
                  <a
                    href={registration.submissionLink}
                    target="_blank"
                    rel="noreferrer"
                    className="cf-inline-link"
                  >
                    Open Submission
                  </a>
                </p>
              )}

              {registration.status !== "SUBMITTED" && (
                <div className="cf-inline-submit-row">
                  <input
                    type="text"
                    placeholder="GitHub / Demo / Project link"
                    value={submissionLinks[registration._id] || ""}
                    onChange={(e) =>
                      setSubmissionLinks({
                        ...submissionLinks,
                        [registration._id]: e.target.value,
                      })
                    }
                  />

                  <button onClick={() => submitProject(registration._id)}>
                    Submit Project
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
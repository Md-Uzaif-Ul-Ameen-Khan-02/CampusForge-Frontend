import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function StartupDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mentorName, setMentorName] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStartup();
    }
  }, [id]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchStartup = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/startups");

      const selectedStartup = res.data.startups.find(
        (item) => item._id === id
      );

      setStartup(selectedStartup);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch startup");
    } finally {
      setLoading(false);
    }
  };

  const submitMentorInterest = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/startups/mentor-interest/${id}`,
        {
          mentorName,
          mentorEmail,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Mentor interest submitted successfully");

      setMentorName("");
      setMentorEmail("");
      setMessage("");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to submit mentor interest"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading startup details...</div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h2>Startup not found</h2>

          <p>
            This startup profile may have been removed or is currently
            unavailable.
          </p>

          <button onClick={() => router.push("/startups")}>
            Back to Startups
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-innovation-hero">
        <div>
          <div className="cf-kicker">Startup Profile</div>

          <h1>{startup.startupName}</h1>

          <p>
            Review the startup problem, solution, market, funding need,
            incubation status, and mentor or investor opportunity.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/startups")}
          >
            Back to Startups
          </button>

          <button className="cf-btn-ghost" onClick={fetchStartup}>
            Refresh
          </button>
        </div>
      </section>

      <section className="cf-collab-summary-grid">
        <div>
          <span>Founder</span>
          <strong>{startup.founderId?.fullName || "Unknown"}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{startup.status || "N/A"}</strong>
        </div>

        <div>
          <span>Incubation</span>
          <strong>{startup.incubationStatus || "N/A"}</strong>
        </div>

        <div>
          <span>Funding Required</span>
          <strong>{startup.fundingRequired || "Not mentioned"}</strong>
        </div>
      </section>

      <section className="cf-section">
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Venture Story</div>

            <h2>Problem, solution, and market</h2>
          </div>

          <span className="cf-badge-dark">
            {startup.status || "IDEA_STAGE"}
          </span>
        </div>

        <div className="cf-startup-story">
          <div>
            <span>Problem Statement</span>

            <p>{startup.problemStatement || "No problem statement added."}</p>
          </div>

          <div>
            <span>Solution</span>

            <p>{startup.solution || "No solution added."}</p>
          </div>

          <div>
            <span>Target Market</span>

            <p>{startup.targetMarket || "Target market not added."}</p>
          </div>
        </div>

        {startup.pitchDeckLink && (
          <div className="cf-card-actions">
            <a
              href={startup.pitchDeckLink}
              target="_blank"
              rel="noreferrer"
              className="cf-inline-link"
            >
              Open Pitch Deck
            </a>
          </div>
        )}
      </section>

      <section className="cf-form-layout">
        <div className="cf-form-card">
          <div className="cf-section-heading">
            <div>
              <div className="cf-kicker">Mentor / Investor Interest</div>

              <h2>Contact the founder</h2>
            </div>

            <span className="cf-badge">Interest Form</span>
          </div>

          <form onSubmit={submitMentorInterest} className="cf-smart-form">
            <div className="cf-form-grid">
              <div className="cf-form-group">
                <label>Your Name</label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  required
                />
              </div>

              <div className="cf-form-group">
                <label>Your Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={mentorEmail}
                  onChange={(e) => setMentorEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="cf-form-group">
              <label>Message to Founder</label>

              <textarea
                placeholder="Explain how you want to help, mentor, invest, or collaborate."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="cf-form-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Interest"}
              </button>
            </div>
          </form>
        </div>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Founder Signal</div>

          <h2>What to look for</h2>

          <ul>
            <li>Clear problem statement.</li>
            <li>Practical and focused solution.</li>
            <li>Defined target market.</li>
            <li>Realistic funding ask.</li>
            <li>Pitch deck or proof of progress.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
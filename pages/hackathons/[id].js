import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function HackathonDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);

  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHackathon();
    }
  }, [id]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchHackathon = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/hackathons`);

      const selectedHackathon = res.data.hackathons.find(
        (item) => item._id === id
      );

      setHackathon(selectedHackathon);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch hackathon");
    } finally {
      setLoading(false);
    }
  };

  const registerForHackathon = async (e) => {
    e.preventDefault();

    try {
      setRegistering(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      const membersArray = teamMembers
        ? teamMembers
            .split(",")
            .map((member) => member.trim())
            .filter(Boolean)
        : [];

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/hackathons/register/${id}`,
        {
          teamName,
          teamMembers: membersArray,
          projectIdea,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Registered successfully");

      setTeamName("");
      setTeamMembers("");
      setProjectIdea("");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Hackathon registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading hackathon...</div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h2>Hackathon not found</h2>

          <p>The hackathon may have been removed or is unavailable.</p>

          <button onClick={() => router.push("/hackathons")}>
            Back to Hackathons
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-innovation-hero">
        <div>
          <div className="cf-kicker">Hackathon Details</div>

          <h1>{hackathon.title}</h1>

          <p>{hackathon.description}</p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/hackathons")}
          >
            Back to Hackathons
          </button>

          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/my-hackathons")}
          >
            My Hackathons
          </button>
        </div>
      </section>

      <section className="cf-collab-summary-grid">
        <div>
          <span>Organizer</span>
          <strong>{hackathon.organizer || "N/A"}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{hackathon.status || "N/A"}</strong>
        </div>

        <div>
          <span>Max Team Size</span>
          <strong>{hackathon.maxTeamSize || "N/A"}</strong>
        </div>

        <div>
          <span>Prize Pool</span>
          <strong>{hackathon.prizePool || "Not mentioned"}</strong>
        </div>
      </section>

      <section className="cf-section">
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Timeline</div>

            <h2>Important dates</h2>
          </div>

          <span className="cf-badge-dark">{hackathon.status || "OPEN"}</span>
        </div>

        <div className="cf-summary-metrics">
          <div>
            <span>Start Date</span>
            <strong>
              {hackathon.startDate
                ? new Date(hackathon.startDate).toLocaleDateString()
                : "N/A"}
            </strong>
          </div>

          <div>
            <span>End Date</span>
            <strong>
              {hackathon.endDate
                ? new Date(hackathon.endDate).toLocaleDateString()
                : "N/A"}
            </strong>
          </div>

          <div>
            <span>Registration Deadline</span>
            <strong>
              {hackathon.registrationDeadline
                ? new Date(hackathon.registrationDeadline).toLocaleDateString()
                : "N/A"}
            </strong>
          </div>

          <div>
            <span>Team Size</span>
            <strong>{hackathon.maxTeamSize || "N/A"}</strong>
          </div>
        </div>
      </section>

      <section className="cf-form-layout">
        <div className="cf-form-card">
          <div className="cf-section-heading">
            <div>
              <div className="cf-kicker">Registration</div>

              <h2>Register your team</h2>
            </div>

            <span className="cf-badge">Team Entry</span>
          </div>

          <form onSubmit={registerForHackathon} className="cf-smart-form">
            <div className="cf-form-group">
              <label>Team Name</label>

              <input
                type="text"
                placeholder="e.g. Code Warriors"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-group">
              <label>Team Members</label>

              <input
                type="text"
                placeholder="Team Members User IDs comma separated"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
              />
            </div>

            <div className="cf-form-group">
              <label>Project Idea</label>

              <textarea
                placeholder="Describe the idea your team wants to build."
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
              />
            </div>

            <div className="cf-form-actions">
              <button type="submit" disabled={registering}>
                {registering ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Before Registering</div>

          <h2>Prepare your team</h2>

          <ul>
            <li>Pick a clear team name.</li>
            <li>Add member user IDs carefully.</li>
            <li>Write a strong project idea.</li>
            <li>Check the registration deadline.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
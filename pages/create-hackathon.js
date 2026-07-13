import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function CreateHackathonPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const createHackathon = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/hackathons/create",
        {
          title,
          description,
          organizer,
          startDate,
          endDate,
          registrationDeadline,
          maxTeamSize,
          prizePool,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Hackathon created successfully");

      router.push("/hackathons");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Hackathon creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-innovation-hero">
        <div>
          <div className="cf-kicker">Create Challenge</div>

          <h1>Create Hackathon</h1>

          <p>
            Launch a student innovation challenge with clear timelines,
            registration deadlines, team size rules, and prize details.
          </p>
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
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>
        </div>
      </section>

      <section className="cf-form-layout">
        <div className="cf-form-card">
          <div className="cf-section-heading">
            <div>
              <div className="cf-kicker">Hackathon Details</div>
              <h2>Build the event profile</h2>
            </div>

            <span className="cf-badge">CampusForge</span>
          </div>

          <form onSubmit={createHackathon} className="cf-smart-form">
            <div className="cf-form-group">
              <label>Hackathon Title</label>

              <input
                type="text"
                placeholder="e.g. Campus AI Buildathon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-group">
              <label>Description</label>

              <textarea
                placeholder="Describe the hackathon theme, goals, judging criteria, and expected outcomes."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-group">
              <label>Organizer</label>

              <input
                type="text"
                placeholder="Organizer name or college club"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-grid">
              <div className="cf-form-group">
                <label>Start Date</label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="cf-form-group">
                <label>End Date</label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="cf-form-grid">
              <div className="cf-form-group">
                <label>Registration Deadline</label>

                <input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="cf-form-group">
                <label>Max Team Size</label>

                <input
                  type="number"
                  placeholder="e.g. 4"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="cf-form-group">
              <label>Prize Pool</label>

              <input
                type="text"
                placeholder="e.g. ₹1,00,000"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
              />
            </div>

            <div className="cf-form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Hackathon"}
              </button>

              <button
                type="button"
                className="cf-btn-ghost-dark"
                onClick={() => router.push("/hackathons")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Launch Checklist</div>

          <h2>Make it serious</h2>

          <ul>
            <li>Use a clear hackathon title.</li>
            <li>Add real judging expectations.</li>
            <li>Set accurate start, end, and deadline dates.</li>
            <li>Keep team size realistic.</li>
            <li>Add prize details if available.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function CreateStartupPage() {
  const router = useRouter();

  const [startupName, setStartupName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [solution, setSolution] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [fundingRequired, setFundingRequired] = useState("");
  const [pitchDeckLink, setPitchDeckLink] = useState("");
  const [status, setStatus] = useState("IDEA_STAGE");
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const createStartup = async (e) => {
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
        `${process.env.NEXT_PUBLIC_API_URL}
/api/startups/create`,
        {
          startupName,
          problemStatement,
          solution,
          targetMarket,
          fundingRequired,
          pitchDeckLink,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Startup created successfully");

      router.push("/startups");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Startup creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-innovation-hero">
        <div>
          <div className="cf-kicker">Student Venture Builder</div>

          <h1>Create Startup</h1>

          <p>
            Turn your idea into a structured startup profile with a problem,
            solution, target market, funding need, and pitch deck.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/startups")}
          >
            Back to Startups
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
              <div className="cf-kicker">Startup Profile</div>

              <h2>Shape the venture</h2>
            </div>

            <span className="cf-badge-dark">{status}</span>
          </div>

          <form onSubmit={createStartup} className="cf-smart-form">
            <div className="cf-form-group">
              <label>Startup Name</label>

              <input
                type="text"
                placeholder="e.g. SkillBridge AI"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-group">
              <label>Problem Statement</label>

              <textarea
                placeholder="What real problem are you solving?"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-group">
              <label>Solution</label>

              <textarea
                placeholder="How does your startup solve the problem?"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-grid">
              <div className="cf-form-group">
                <label>Target Market</label>

                <input
                  type="text"
                  placeholder="e.g. College students, local businesses"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                />
              </div>

              <div className="cf-form-group">
                <label>Funding Required</label>

                <input
                  type="text"
                  placeholder="e.g. ₹5,00,000"
                  value={fundingRequired}
                  onChange={(e) => setFundingRequired(e.target.value)}
                />
              </div>
            </div>

            <div className="cf-form-group">
              <label>Pitch Deck Link</label>

              <input
                type="text"
                placeholder="Google Drive, Notion, Canva, or PDF link"
                value={pitchDeckLink}
                onChange={(e) => setPitchDeckLink(e.target.value)}
              />
            </div>

            <div className="cf-form-group">
              <label>Startup Stage</label>

              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="IDEA_STAGE">IDEA_STAGE</option>
                <option value="MVP_STAGE">MVP_STAGE</option>
                <option value="SEED_STAGE">SEED_STAGE</option>
                <option value="FUNDED">FUNDED</option>
              </select>
            </div>

            <div className="cf-form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Startup"}
              </button>

              <button
                type="button"
                className="cf-btn-ghost-dark"
                onClick={() => router.push("/startups")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Founder Note</div>

          <h2>Make it investor-ready</h2>

          <ul>
            <li>Write a sharp problem statement.</li>
            <li>Explain your solution simply.</li>
            <li>Define the market clearly.</li>
            <li>Add a pitch deck if available.</li>
            <li>Choose the correct startup stage.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
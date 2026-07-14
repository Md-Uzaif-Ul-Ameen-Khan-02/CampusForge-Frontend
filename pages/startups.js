import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function StartupsPage() {
  const router = useRouter();

  const [startups, setStartups] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async (searchValue = "") => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/startups?search=${encodeURIComponent(
          searchValue
        )}`
      );

      setStartups(res.data.startups || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch startups"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStartups(search);
  };

  const clearSearch = () => {
    setSearch("");
    fetchStartups("");
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-innovation-hero">
        <div>
          <div className="cf-kicker">Student Ventures</div>

          <h1>Startup Showcase</h1>

          <p>
            Explore student-founded startup ideas, problem statements,
            solutions, market opportunities, and early incubation progress.
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
            className="cf-btn-gold"
            onClick={() => router.push("/create-startup")}
          >
            Create Startup
          </button>
        </div>
      </section>

      <section className="cf-section">
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Explore</div>

            <h2>Find startups</h2>
          </div>

          <span className="cf-badge-muted">
            {startups.length} result{startups.length === 1 ? "" : "s"}
          </span>
        </div>

        <form className="cf-search-row" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search startup, problem, solution, market, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit">Search</button>

          <button
            type="button"
            className="cf-btn-ghost-dark"
            onClick={clearSearch}
          >
            Clear
          </button>
        </form>
      </section>

      {errorMessage && <section className="cf-error-state">{errorMessage}</section>}

      {loading ? (
        <div className="cf-loading-card">Loading startups...</div>
      ) : startups.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No startups found</h2>

          <p>
            No startup profiles matched your search. Create a startup profile to
            showcase your idea.
          </p>

          <button onClick={() => router.push("/create-startup")}>
            Create Startup
          </button>
        </section>
      ) : (
        <section className="cf-innovation-grid">
          {startups.map((startup) => (
            <article key={startup._id} className="cf-innovation-card">
              <div className="cf-card-topline">
                <span className="cf-badge-dark">
                  {startup.status || "IDEA"}
                </span>

                <span className="cf-badge">
                  {startup.incubationStatus || "Incubation"}
                </span>
              </div>

              <h2>{startup.startupName}</h2>

              <div className="cf-startup-story">
                <div>
                  <span>Problem</span>
                  <p>{startup.problemStatement}</p>
                </div>

                <div>
                  <span>Solution</span>
                  <p>{startup.solution}</p>
                </div>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Target Market</span>
                  <strong>{startup.targetMarket || "Not added"}</strong>
                </div>

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
              </div>

              <div className="cf-card-actions">
                <button onClick={() => router.push(`/startups/${startup._id}`)}>
                  View Details
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
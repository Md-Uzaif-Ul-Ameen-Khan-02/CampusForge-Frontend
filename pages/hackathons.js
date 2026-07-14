import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function HackathonsPage() {
  const router = useRouter();

  const [hackathons, setHackathons] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async (searchValue = "") => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/hackathons?search=${encodeURIComponent(
          searchValue
        )}`
      );

      setHackathons(res.data.hackathons || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch hackathons"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHackathons(search);
  };

  const clearSearch = () => {
    setSearch("");
    fetchHackathons("");
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-innovation-hero">
        <div>
          <div className="cf-kicker">Campus Challenges</div>

          <h1>Hackathons</h1>

          <p>
            Discover student hackathons, join competitive teams, build fast,
            and turn ideas into strong portfolio projects.
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
            onClick={() => router.push("/create-hackathon")}
          >
            Create Hackathon
          </button>

          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/my-hackathons")}
          >
            My Hackathons
          </button>
        </div>
      </section>

      <section className="cf-section">
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Explore</div>

            <h2>Find hackathons</h2>
          </div>

          <span className="cf-badge-muted">
            {hackathons.length} result{hackathons.length === 1 ? "" : "s"}
          </span>
        </div>

        <form className="cf-search-row" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search title, organizer, status, prize"
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
        <div className="cf-loading-card">Loading hackathons...</div>
      ) : hackathons.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No hackathons found</h2>

          <p>
            No hackathons matched your search. Try another keyword or create a
            new hackathon.
          </p>

          <button onClick={() => router.push("/create-hackathon")}>
            Create Hackathon
          </button>
        </section>
      ) : (
        <section className="cf-innovation-grid">
          {hackathons.map((hackathon) => (
            <article key={hackathon._id} className="cf-innovation-card">
              <div className="cf-card-topline">
                <span className="cf-badge-dark">
                  {hackathon.status || "OPEN"}
                </span>

                <span className="cf-badge">
                  Team {hackathon.maxTeamSize || "N/A"}
                </span>
              </div>

              <h2>{hackathon.title}</h2>

              <p>{hackathon.description}</p>

              <div className="cf-project-info-grid">
                <div>
                  <span>Organizer</span>
                  <strong>{hackathon.organizer || "N/A"}</strong>
                </div>

                <div>
                  <span>Prize Pool</span>
                  <strong>{hackathon.prizePool || "Not mentioned"}</strong>
                </div>

                <div>
                  <span>Registration Deadline</span>
                  <strong>
                    {hackathon.registrationDeadline
                      ? new Date(
                          hackathon.registrationDeadline
                        ).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Max Team Size</span>
                  <strong>{hackathon.maxTeamSize || "N/A"}</strong>
                </div>
              </div>

              <div className="cf-card-actions">
                <button onClick={() => router.push(`/hackathons/${hackathon._id}`)}>
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
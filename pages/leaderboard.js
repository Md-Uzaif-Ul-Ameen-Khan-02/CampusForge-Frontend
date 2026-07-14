import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function LeaderboardPage() {
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/analytics/leaderboard`
      );

      setLeaderboard(res.data.leaderboard || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch leaderboard"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-active-hero">
        <div>
          <div className="cf-kicker">CampusForge Rankings</div>

          <h1>Leaderboard</h1>

          <p>
            See top students ranked by reputation, completed work, and platform
            contribution.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchLeaderboard}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {leaderboard.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No users found</h2>

          <p>The leaderboard will appear when users earn reputation.</p>
        </section>
      ) : (
        <section className="cf-leaderboard-list">
          {leaderboard.map((student, index) => (
            <article key={student._id} className="cf-leaderboard-card">
              <div className="cf-rank-pill">#{index + 1}</div>

              <div className="cf-collab-user-row">
                <div className="cf-user-avatar">
                  {student.profilePhoto ? (
                    <img src={student.profilePhoto} alt="Profile" />
                  ) : (
                    <span>
                      {(student.fullName || "ST").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h2>{student.fullName}</h2>

                  <p>{student.email || "No email available"}</p>
                </div>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Reputation</span>
                  <strong>{student.reputationScore || 0}</strong>
                </div>

                <div>
                  <span>Badges</span>
                  <strong>{student.badges?.length || 0}</strong>
                </div>
              </div>

              <div className="cf-tech-stack">
                {student.badges?.length ? (
                  student.badges.map((badge) => <span key={badge}>{badge}</span>)
                ) : (
                  <span>No badges yet</span>
                )}
              </div>

              <div className="cf-card-actions">
                <button onClick={() => router.push(`/users/${student._id}`)}>
                  View Profile
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
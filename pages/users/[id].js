import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PublicUserProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/profile/${id}`);

      setUser(res.data.user);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading user profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h2>User not found</h2>

          <button onClick={() => router.back()}>Back</button>
        </section>
      </div>
    );
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CF";

  return (
    <div className="cf-page-shell">
      <section className="cf-public-profile-hero">
        <div className="cf-profile-identity">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt="Profile"
              className="cf-profile-photo"
            />
          ) : (
            <div className="cf-profile-photo-fallback">{initials}</div>
          )}

          <div>
            <div className="cf-kicker">Public Profile</div>

            <h1>{user.fullName}</h1>

            <p>{user.portfolioBio || "No bio added yet."}</p>

            <div className="cf-detail-badges">
              <span className="cf-badge-dark">{user.role}</span>

              <span className="cf-badge">{user.verificationStatus}</span>
            </div>
          </div>
        </div>

        <div className="cf-projects-hero-actions">
          <button className="cf-btn-ghost" onClick={() => router.back()}>
            Back
          </button>
        </div>
      </section>

      <section className="cf-profile-grid">
        <main className="cf-profile-main">
          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Profile Details</div>

                <h2>Student information</h2>
              </div>
            </div>

            <div className="cf-profile-stat-grid">
              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>Role</span>
                <strong>{user.role}</strong>
              </div>

              <div>
                <span>Verification</span>
                <strong>{user.verificationStatus}</strong>
              </div>

              <div>
                <span>Reputation</span>
                <strong>{user.reputationScore || 0}</strong>
              </div>

              <div>
                <span>Tasks Completed</span>
                <strong>{user.tasksCompleted || 0}</strong>
              </div>

              <div>
                <span>Badges</span>
                <strong>{user.badges?.length || 0}</strong>
              </div>
            </div>
          </section>

          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Skills</div>

                <h2>Technical strengths</h2>
              </div>
            </div>

            <div className="cf-tech-stack">
              {user.skills?.length ? (
                user.skills.map((skill) => <span key={skill}>{skill}</span>)
              ) : (
                <span>No skills added</span>
              )}
            </div>
          </section>

          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Badges</div>

                <h2>Achievements</h2>
              </div>
            </div>

            <div className="cf-tech-stack">
              {user.badges?.length ? (
                user.badges.map((badge) => <span key={badge}>{badge}</span>)
              ) : (
                <span>No badges yet</span>
              )}
            </div>
          </section>
        </main>

        <aside className="cf-profile-side">
          <section className="cf-upload-card">
            <div className="cf-kicker">Portfolio Links</div>

            <h2>External presence</h2>

            <p>
              <strong>GitHub:</strong> {user.githubUsername || "Not added"}
            </p>

            {user.resumeUrl && (
              <p>
                <strong>Resume:</strong>{" "}
                <a
                  href={user.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cf-inline-link"
                >
                  View Resume
                </a>
              </p>
            )}

            {user.socialLinks?.linkedin && (
              <p>
                <strong>LinkedIn:</strong>{" "}
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="cf-inline-link"
                >
                  Open LinkedIn
                </a>
              </p>
            )}

            {user.socialLinks?.portfolio && (
              <p>
                <strong>Portfolio:</strong>{" "}
                <a
                  href={user.socialLinks.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="cf-inline-link"
                >
                  Open Portfolio
                </a>
              </p>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}
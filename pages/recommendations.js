import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function RecommendationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isStudent =
    user?.role === "STUDENT" ||
    user?.role === "VERIFIED_STUDENT";

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isStudent) {
      setLoading(false);
      return;
    }

    fetchRecommendations();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/recommendations/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecommendations(res.data.recommendations || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">
          Loading recommended projects...
        </div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>
          <p>Only students can access project recommendations.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-student-hero">
        <div>
          <div className="cf-kicker">Smart Matching</div>

          <h1>Recommended Projects</h1>

          <p>
            CampusForge recommends projects based on your skills and profile
            signals.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchRecommendations}>
            Refresh
          </button>

          <button
            className="cf-btn-gold"
            onClick={() => router.push("/profile")}
          >
            Update Skills
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {recommendations.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No recommendations found</h2>

          <p>
            Add skills to your profile first. CampusForge uses your skills to
            recommend matching projects.
          </p>

          <div className="cf-card-actions">
            <button onClick={() => router.push("/profile")}>
              Add Skills in Profile
            </button>

            <button
              className="cf-btn-ghost-dark"
              onClick={() => router.push("/projects")}
            >
              Explore All Projects
            </button>
          </div>
        </section>
      ) : (
        <section className="cf-workflow-grid">
          {recommendations.map((item) => {
            const project = item.project;

            if (!project) return null;

            return (
              <article key={project._id} className="cf-workflow-card">
                <div className="cf-workflow-card-top">
                  <div>
                    <Link href={`/projects/${project._id}`}>
                      <a>
                        <h2>{project.title}</h2>
                      </a>
                    </Link>

                    <p>{project.description || "No description available."}</p>
                  </div>

                  <span className="cf-match-badge">
                    {item.matchScore || 0} Match
                  </span>
                </div>

                <div className="cf-project-info-grid">
                  <div>
                    <span>Domain</span>
                    <strong>{project.domain || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Owner</span>
                    <strong>{project.ownerId?.fullName || "Unknown"}</strong>
                  </div>
                </div>

                <div className="cf-tech-stack">
                  {Array.isArray(project.techStack) &&
                  project.techStack.length > 0 ? (
                    project.techStack.slice(0, 8).map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))
                  ) : (
                    <span>No tech stack added</span>
                  )}
                </div>

                <div className="cf-card-actions">
                  <button
                    onClick={() => router.push(`/projects/${project._id}`)}
                  >
                    Open Project
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
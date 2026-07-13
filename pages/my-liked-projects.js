import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function MyLikedProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [likedProjects, setLikedProjects] = useState([]);
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

    fetchLikedProjects();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchLikedProjects = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/projects/liked/my-projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLikedProjects(res.data.likedProjects || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch liked projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (projectId) => {
    try {
      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/projects/${projectId}/toggle-like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchLikedProjects();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to update like");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading your liked projects...</div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only students can access liked projects.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-showcase-hero">
        <div>
          <div className="cf-kicker">Your Saved Showcase</div>

          <h1>My Liked Projects</h1>

          <p>
            Keep track of completed projects you liked and want to revisit,
            verify, or review later.
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
            className="cf-btn-ghost"
            onClick={() => router.push("/completed-projects")}
          >
            Completed Projects
          </button>

          <button className="cf-btn-ghost" onClick={fetchLikedProjects}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {likedProjects.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No liked projects yet</h2>

          <p>
            You have not liked any completed projects yet. Explore completed
            showcases and like projects you find impressive.
          </p>

          <button onClick={() => router.push("/completed-projects")}>
            Browse Completed Projects
          </button>
        </section>
      ) : (
        <section className="cf-showcase-grid">
          {likedProjects.map((item) => {
            const project = item.project;

            if (!project) return null;

            return (
              <article key={project._id} className="cf-showcase-card">
                <div className="cf-showcase-card-top">
                  <div>
                    <span className="cf-badge">LIKED</span>

                    <h2>{project.title}</h2>

                    <p>{project.description || "No description available."}</p>
                  </div>
                </div>

                <div className="cf-tech-stack">
                  {Array.isArray(project.techStack) &&
                  project.techStack.length > 0 ? (
                    project.techStack.slice(0, 8).map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))
                  ) : (
                    <span>{project.techStack || "No tech stack added"}</span>
                  )}
                </div>

                <div className="cf-showcase-metrics">
                  <div>
                    <span>Progress</span>
                    <strong>{item.progress || 0}%</strong>
                  </div>

                  <div>
                    <span>Tasks</span>
                    <strong>
                      {item.completedTasks || 0}/{item.totalTasks || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Likes</span>
                    <strong>{project.likes?.length || 0}</strong>
                  </div>

                  <div>
                    <span>Rating</span>
                    <strong>{item.averageRating || 0}/5</strong>
                  </div>
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

                  <div>
                    <span>Reviews</span>
                    <strong>{item.totalReviews || 0}</strong>
                  </div>

                  <div>
                    <span>Certificate</span>
                    <strong>{item.certificateId || "N/A"}</strong>
                  </div>
                </div>

                <div className="cf-card-actions">
                  <button
                    onClick={() =>
                      router.push(`/completed-projects/${project._id}`)
                    }
                  >
                    Open Showcase
                  </button>

                  <button
                    className="cf-btn-ghost-dark"
                    onClick={() =>
                      router.push(
                        `/certificate-verify?certificateId=${item.certificateId}`
                      )
                    }
                  >
                    Verify
                  </button>

                  <button
                    onClick={() => toggleLike(project._id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    Unlike
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
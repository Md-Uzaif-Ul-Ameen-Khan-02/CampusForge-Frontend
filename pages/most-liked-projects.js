import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function MostLikedProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchMostLikedProjects();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMostLikedProjects = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/most-liked/showcase`
      );

      setProjects(res.data.mostLikedProjects || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch most liked projects. Please try again."
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
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/${projectId}/toggle-like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchMostLikedProjects();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to update like");
    }
  };

  const filteredProjects = projects.filter((item) => {
    const project = item.project;

    if (!project) return false;

    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    const techStackText = Array.isArray(project.techStack)
      ? project.techStack.join(" ")
      : project.techStack || "";

    return (
      project.title?.toLowerCase().includes(searchText) ||
      project.description?.toLowerCase().includes(searchText) ||
      project.domain?.toLowerCase().includes(searchText) ||
      project.ownerId?.fullName?.toLowerCase().includes(searchText) ||
      item.certificateId?.toLowerCase().includes(searchText) ||
      techStackText.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading most liked projects...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-showcase-hero">
        <div>
          <div className="cf-kicker">Community Favorites</div>

          <h1>Most Liked Projects</h1>

          <p>
            See which completed project showcases are getting the strongest
            community response.
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

          <button className="cf-btn-ghost" onClick={fetchMostLikedProjects}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-showcase-toolbar cf-showcase-toolbar-single">
        <div>
          <label>Search</label>

          <input
            type="text"
            placeholder="Search most liked projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="cf-btn-ghost-dark" onClick={() => setSearch("")}>
          Clear
        </button>
      </section>

      <p className="cf-results-line">
        Showing <strong>{filteredProjects.length}</strong> of{" "}
        <strong>{projects.length}</strong> projects
      </p>

      {projects.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No liked completed projects yet</h2>

          <p>
            Completed projects will appear here after users start liking public
            completed showcases.
          </p>

          <button onClick={() => router.push("/completed-projects")}>
            View Completed Projects
          </button>
        </section>
      ) : filteredProjects.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No projects match your search</h2>

          <p>Try another keyword or clear the search.</p>

          <button onClick={() => setSearch("")}>Clear Search</button>
        </section>
      ) : (
        <section className="cf-showcase-grid">
          {filteredProjects.map((item, index) => {
            const project = item.project;

            return (
              <article key={project._id} className="cf-showcase-card">
                <div className="cf-rank-pill">#{index + 1}</div>

                <div className="cf-showcase-card-top">
                  <div>
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
                    <span>Likes</span>
                    <strong>{item.likesCount || 0}</strong>
                  </div>

                  <div>
                    <span>Rating</span>
                    <strong>{item.averageRating || 0}/5</strong>
                  </div>

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
                    View Showcase
                  </button>

                  <button
                    className="cf-btn-ghost-dark"
                    onClick={() => toggleLike(project._id)}
                  >
                    Like / Unlike
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
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
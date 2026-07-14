import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isStudent =
    user?.role === "STUDENT" || user?.role === "VERIFIED_STUDENT";

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

    fetchProjects();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchProjects = async (searchValue = search) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects?search=${encodeURIComponent(
          searchValue
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(res.data.projects || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const searchProjects = (e) => {
    e.preventDefault();
    fetchProjects(search);
  };

  const clearSearch = () => {
    setSearch("");
    fetchProjects("");
  };

  const getStatusClass = (status) => {
    if (status === "COMPLETED") return "cf-status cf-status-success";
    if (status === "IN_PROGRESS") return "cf-status cf-status-warning";
    if (status === "OPEN") return "cf-status cf-status-open";
    return "cf-status cf-status-muted";
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading projects...</div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only students can explore and join projects.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-projects-hero">
        <div>
          <div className="cf-kicker">Student Project Network</div>

          <h1>Explore projects and find your next team.</h1>

          <p>
            Discover student-led projects, match with teams, and collaborate
            across verified campus profiles.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-gold"
            onClick={() => router.push("/create-project")}
          >
            Create Project
          </button>

          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/my-projects")}
          >
            My Projects
          </button>
        </div>
      </section>

      <section className="cf-toolbar-card">
        <form onSubmit={searchProjects} className="cf-search-form">
          <div>
            <label>Search projects</label>

            <input
              type="text"
              placeholder="Search by title, domain, tech stack, or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="cf-search-actions">
            <button type="submit">Search</button>

            <button
              type="button"
              className="cf-btn-ghost-dark"
              onClick={clearSearch}
            >
              Clear
            </button>

            <button
              type="button"
              className="cf-btn-ghost-dark"
              onClick={() => fetchProjects()}
            >
              Refresh
            </button>
          </div>
        </form>

        <p>
          Showing <strong>{projects.length}</strong>{" "}
          project{projects.length === 1 ? "" : "s"}
        </p>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {projects.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No projects found</h2>

          {search ? (
            <p>
              No projects matched your search. Try another keyword or clear the
              search.
            </p>
          ) : (
            <p>
              No public projects are available yet. Create the first project
              and start building your team.
            </p>
          )}

          <div className="cf-card-actions">
            <button onClick={() => router.push("/create-project")}>
              Create Project
            </button>

            {search && (
              <button className="cf-btn-ghost-dark" onClick={clearSearch}>
                Clear Search
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="cf-project-list-grid">
          {projects.map((project) => (
            <article key={project._id} className="cf-browse-project-card">
              <div className="cf-project-card-top">
                <span className={getStatusClass(project.status)}>
                  {project.status || "N/A"}
                </span>

                <span className="cf-badge-muted">
                  {project.visibility || "N/A"}
                </span>
              </div>

              <Link href={`/projects/${project._id}`}>
                <a>
                  <h2>{project.title}</h2>
                </a>
              </Link>

              <p>{project.description || "No description available."}</p>

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
                  <span>Team</span>
                  <strong>
                    {project.members?.length || 0}/
                    {project.teamSizeLimit || "N/A"}
                  </strong>
                </div>
              </div>

              <div className="cf-tech-stack">
                {Array.isArray(project.techStack) &&
                project.techStack.length > 0 ? (
                  project.techStack.slice(0, 6).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))
                ) : (
                  <span>No tech stack added</span>
                )}
              </div>

              <div className="cf-card-actions">
                <button onClick={() => router.push(`/projects/${project._id}`)}>
                  Open Project
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
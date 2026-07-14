import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function CompletedProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const canFeature = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchCompletedProjects = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/completed/showcase`
      );

      setCompletedProjects(res.data.completedProjects || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch completed projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const domains = [
    "ALL",
    ...new Set(
      completedProjects
        .map((item) => item.project?.domain)
        .filter(Boolean)
    ),
  ];

  const projectMatchesSearch = (item) => {
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
  };

  const filteredProjects = completedProjects
    .filter((item) => {
      const project = item.project;

      if (!project) return false;

      if (!projectMatchesSearch(item)) return false;

      if (domainFilter !== "ALL" && project.domain !== domainFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "TASKS") {
        return (b.totalTasks || 0) - (a.totalTasks || 0);
      }

      if (sortBy === "TEAM_SIZE") {
        return (
          (b.project?.members?.length || 0) -
          (a.project?.members?.length || 0)
        );
      }

      return (
        new Date(b.project?.updatedAt || 0) -
        new Date(a.project?.updatedAt || 0)
      );
    });

  const toggleFeatured = async (projectId) => {
    try {
      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/${projectId}/toggle-featured`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Featured status updated");
      fetchCompletedProjects();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to update featured status"
      );
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

      fetchCompletedProjects();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to update like");
    }
  };

  const copyCertificateId = async (certificateId) => {
    try {
      await navigator.clipboard.writeText(certificateId);
      alert("Certificate ID copied");
    } catch (error) {
      console.log(error);
      alert("Failed to copy certificate ID");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDomainFilter("ALL");
    setSortBy("NEWEST");
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading completed projects...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-showcase-hero">
        <div>
          <div className="cf-kicker">Public Showcase</div>

          <h1>Completed Projects</h1>

          <p>
            Discover verified student-built projects that reached completion,
            earned certificates, and are ready to be shown publicly.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchCompletedProjects}>
            Refresh
          </button>

          <button
            className="cf-btn-gold"
            onClick={() => router.push("/certificate-verify")}
          >
            Verify Certificate
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-showcase-toolbar">
        <div>
          <label>Search</label>

          <input
            type="text"
            placeholder="Search title, domain, tech stack, owner, certificate ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label>Domain</label>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Sort By</label>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="NEWEST">NEWEST</option>
            <option value="TASKS">MOST TASKS</option>
            <option value="TEAM_SIZE">LARGEST TEAM</option>
          </select>
        </div>

        <button className="cf-btn-ghost-dark" onClick={clearFilters}>
          Clear
        </button>
      </section>

      <p className="cf-results-line">
        Showing <strong>{filteredProjects.length}</strong> of{" "}
        <strong>{completedProjects.length}</strong> completed projects
      </p>

      {completedProjects.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No completed projects yet</h2>

          <p>
            Completed public projects will appear here after project tasks reach
            100% completion.
          </p>

          <button onClick={() => router.push("/projects")}>
            Explore Projects
          </button>
        </section>
      ) : filteredProjects.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No projects match your filters</h2>

          <p>Try changing your search text, domain filter, or sort option.</p>

          <button onClick={clearFilters}>Clear Filters</button>
        </section>
      ) : (
        <section className="cf-showcase-grid">
          {filteredProjects.map((item) => {
            const project = item.project;

            return (
              <article key={project._id} className="cf-showcase-card">
                <div className="cf-showcase-card-top">
                  <div>
                    <span className="cf-status cf-status-success">
                      COMPLETED
                    </span>

                    {project.isFeatured && (
                      <span className="cf-featured-pill">FEATURED</span>
                    )}

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
                    <span>Team Size</span>
                    <strong>{project.members?.length || 0}</strong>
                  </div>

                  <div>
                    <span>Certificate</span>
                    <strong>{item.certificateId || "N/A"}</strong>
                  </div>
                </div>

                <div className="cf-card-actions">
                  <button onClick={() => toggleLike(project._id)}>
                    Like / Unlike
                  </button>

                  <button
                    className="cf-btn-ghost-dark"
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
                    className="cf-btn-ghost-dark"
                    onClick={() => copyCertificateId(item.certificateId)}
                  >
                    Copy ID
                  </button>

                  {canFeature && (
                    <button onClick={() => toggleFeatured(project._id)}>
                      {project.isFeatured ? "Remove Featured" : "Mark Featured"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
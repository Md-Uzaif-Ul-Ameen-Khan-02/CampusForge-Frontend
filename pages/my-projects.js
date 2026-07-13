import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function MyProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [projectProgress, setProjectProgress] = useState({});

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

    fetchMyProjects();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/projects/my-projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const projectList = res.data.projects || [];

      setProjects(projectList);
      fetchAllProjectProgress(projectList);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch your projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjectProgress = async (projectList) => {
    try {
      const token = getToken();

      if (!token) return;

      const progressData = {};

      for (const project of projectList) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/tasks/project/${project._id}/progress`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          progressData[project._id] = res.data.progress;
        } catch (error) {
          console.log("Failed to fetch progress for project:", project._id);
        }
      }

      setProjectProgress(progressData);
    } catch (error) {
      console.log(error);
    }
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
        <div className="cf-loading-card">Loading your projects...</div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only students can access My Projects.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const ownedProjects = projects.filter((project) => {
    const loggedInUserId = user?._id || user?.id;
    const ownerId = project.ownerId?._id || project.ownerId;

    return (
      loggedInUserId &&
      ownerId &&
      loggedInUserId.toString() === ownerId.toString()
    );
  });

  const memberProjects = projects.filter((project) => {
    const loggedInUserId = user?._id || user?.id;
    const ownerId = project.ownerId?._id || project.ownerId;

    return !(
      loggedInUserId &&
      ownerId &&
      loggedInUserId.toString() === ownerId.toString()
    );
  });

  return (
    <div className="cf-page-shell">
      <section className="cf-projects-hero">
        <div>
          <div className="cf-kicker">Your Workspace</div>

          <h1>Manage every project you own or belong to.</h1>

          <p>
            Track progress, open task boards, review team size, and continue
            building your student portfolio.
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
            onClick={() => router.push("/projects")}
          >
            Explore Projects
          </button>

          <button className="cf-btn-ghost" onClick={fetchMyProjects}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-collab-summary-grid">
        <div>
          <span>Total Projects</span>
          <strong>{projects.length}</strong>
        </div>

        <div>
          <span>Owned By You</span>
          <strong>{ownedProjects.length}</strong>
        </div>

        <div>
          <span>Joined Projects</span>
          <strong>{memberProjects.length}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{projects.length ? "Active" : "Empty"}</strong>
        </div>
      </section>

      {projects.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No projects yet</h2>

          <p>
            You have not created or joined any projects yet. Create your first
            project or explore existing projects to join a team.
          </p>

          <div className="cf-card-actions">
            <button onClick={() => router.push("/create-project")}>
              Create Project
            </button>

            <button
              className="cf-btn-ghost-dark"
              onClick={() => router.push("/projects")}
            >
              Explore Projects
            </button>
          </div>
        </section>
      ) : (
        <section className="cf-project-list-grid">
          {projects.map((project) => {
            const progress = projectProgress[project._id];

            const loggedInUserId = user?._id || user?.id;
            const ownerId = project.ownerId?._id || project.ownerId;

            const isOwner =
              loggedInUserId &&
              ownerId &&
              loggedInUserId.toString() === ownerId.toString();

            return (
              <article key={project._id} className="cf-browse-project-card">
                <div className="cf-project-card-top">
                  <span className={getStatusClass(project.status)}>
                    {project.status || "N/A"}
                  </span>

                  <span className="cf-badge-muted">
                    {project.visibility || "N/A"}
                  </span>

                  <span className={isOwner ? "cf-badge-dark" : "cf-badge"}>
                    {isOwner ? "OWNER" : "MEMBER"}
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
                    <span>Members</span>
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

                {progress ? (
                  <div className="cf-progress-block">
                    <div className="cf-progress-row">
                      <strong>Progress</strong>
                      <span>{progress.progress}%</span>
                    </div>

                    <div className="cf-progress-track">
                      <div
                        className="cf-progress-fill"
                        style={{
                          width: `${progress.progress}%`,
                        }}
                      />
                    </div>

                    <p>
                      {progress.completedTasks}/{progress.totalTasks} tasks
                      completed
                    </p>
                  </div>
                ) : (
                  <div className="cf-progress-block">
                    <div className="cf-progress-row">
                      <strong>Progress</strong>
                      <span>N/A</span>
                    </div>

                    <p>Progress is not available yet.</p>
                  </div>
                )}

                <div className="cf-card-actions">
                  <button onClick={() => router.push(`/projects/${project._id}`)}>
                    Open Project
                  </button>

                  <button
                    className="cf-btn-ghost-dark"
                    onClick={() => router.push(`/project-tasks/${project._id}`)}
                  >
                    Open Tasks
                  </button>

                  <button
                    className="cf-btn-ghost-dark"
                    onClick={() => router.push(`/project-chat/${project._id}`)}
                  >
                    Chat
                  </button>

                  <button
                    className="cf-btn-ghost-dark"
                    onClick={() =>
                      router.push(`/project-summary/${project._id}`)
                    }
                  >
                    Summary
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
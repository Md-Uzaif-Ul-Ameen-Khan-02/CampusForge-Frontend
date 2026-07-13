import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ProjectDetails() {
  const router = useRouter();
  const { id } = router.query;

  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [taskProgress, setTaskProgress] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTaskProgress();
    }
  }, [id]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      setProject(res.data.project);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to load project details."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskProgress = async () => {
    try {
      const token = getToken();

      if (!token) return;

      const res = await axios.get(
        `http://localhost:5000/api/tasks/project/${id}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTaskProgress(res.data.progress);
    } catch (error) {
      console.log(error);
    }
  };

  const handleJoinRequest = async () => {
    try {
      setJoining(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/join-requests",
        {
          projectId: id,
          message: "I would like to join this project.",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Join request sent successfully");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to send request");
    } finally {
      setJoining(false);
    }
  };

  const deleteProject = async () => {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete this project?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(`http://localhost:5000/api/projects/${project._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Project deleted successfully");

      router.push("/projects");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to delete project");
    }
  };

  const leaveProject = async () => {
    try {
      const confirmLeave = confirm(
        "Are you sure you want to leave this project?"
      );

      if (!confirmLeave) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/projects/${project._id}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("You left the project successfully");

      router.push("/my-projects");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to leave project");
    }
  };

  const removeMember = async (memberId) => {
    try {
      const confirmRemove = confirm(
        "Are you sure you want to remove this member?"
      );

      if (!confirmRemove) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/projects/${project._id}/remove-member/${memberId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Member removed successfully");

      fetchProject();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  const getStatusClass = (status) => {
    if (status === "COMPLETED") return "cf-status cf-status-success";
    if (status === "IN_PROGRESS") return "cf-status cf-status-warning";
    if (status === "OPEN") return "cf-status cf-status-open";
    return "cf-status cf-status-muted";
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Project not found</h1>

          <p>{errorMessage || "This project could not be loaded."}</p>

          <button onClick={() => router.push("/projects")}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const loggedInUserId = user?._id || user?.id;
  const ownerId = project?.ownerId?._id || project?.ownerId;

  const isOwner =
    loggedInUserId &&
    ownerId &&
    loggedInUserId.toString() === ownerId.toString();

  const isMember =
    loggedInUserId &&
    project?.members?.some(
      (member) => member._id?.toString() === loggedInUserId.toString()
    );

  const canManageProject = isOwner || isMember;

  return (
    <div className="cf-page-shell">
      <section className="cf-detail-hero">
        <div>
          <div className="cf-kicker">Project Workspace</div>

          <h1>{project.title}</h1>

          <p>{project.description || "No description available."}</p>

          <div className="cf-detail-badges">
            <span className={getStatusClass(project.status)}>
              {project.status || "N/A"}
            </span>

            <span className="cf-badge-dark">{project.visibility || "N/A"}</span>

            <span className="cf-badge">{project.domain || "N/A"}</span>
          </div>
        </div>

        <div className="cf-detail-side">
          <div>
            <span>Owner</span>
            <strong>{project.ownerId?.fullName || "Unknown"}</strong>
          </div>

          <div>
            <span>Team</span>
            <strong>
              {project.members?.length || 0}/{project.teamSizeLimit || "N/A"}
            </strong>
          </div>

          <div>
            <span>Access</span>
            <strong>
              {isOwner ? "Owner" : isMember ? "Member" : "Visitor"}
            </strong>
          </div>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-detail-grid">
        <div className="cf-detail-main">
          <div className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Overview</div>

                <h2>Project information</h2>
              </div>
            </div>

            <div className="cf-project-info-grid">
              <div>
                <span>Domain</span>
                <strong>{project.domain || "N/A"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{project.status || "N/A"}</strong>
              </div>

              <div>
                <span>Visibility</span>
                <strong>{project.visibility || "N/A"}</strong>
              </div>

              <div>
                <span>Team Limit</span>
                <strong>{project.teamSizeLimit || "N/A"}</strong>
              </div>
            </div>

            <div className="cf-tech-stack">
              {Array.isArray(project.techStack) &&
              project.techStack.length > 0 ? (
                project.techStack.map((tech) => <span key={tech}>{tech}</span>)
              ) : (
                <span>No tech stack added</span>
              )}
            </div>

            {project.githubLink && (
              <p>
                <strong>GitHub:</strong>{" "}
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="cf-inline-link"
                >
                  Open repository
                </a>
              </p>
            )}
          </div>

          {taskProgress && canManageProject && (
            <div className="cf-section">
              <div className="cf-section-heading">
                <div>
                  <div className="cf-kicker">Progress</div>

                  <h2>Project task progress</h2>
                </div>

                <button
                  className="cf-btn-ghost-dark"
                  onClick={() => router.push(`/project-tasks/${project._id}`)}
                >
                  Open Tasks
                </button>
              </div>

              <div className="cf-progress-block">
                <div className="cf-progress-row">
                  <strong>{taskProgress.progress}% Complete</strong>

                  <span>
                    {taskProgress.completedTasks}/{taskProgress.totalTasks}{" "}
                    tasks
                  </span>
                </div>

                <div className="cf-progress-track">
                  <div
                    className="cf-progress-fill"
                    style={{
                      width: `${taskProgress.progress}%`,
                    }}
                  />
                </div>

                <div className="cf-task-mini-grid">
                  <div>
                    <span>Total</span>
                    <strong>{taskProgress.totalTasks}</strong>
                  </div>

                  <div>
                    <span>Done</span>
                    <strong>{taskProgress.completedTasks}</strong>
                  </div>

                  <div>
                    <span>In Progress</span>
                    <strong>{taskProgress.inProgressTasks}</strong>
                  </div>

                  <div>
                    <span>Pending</span>
                    <strong>{taskProgress.pendingTasks}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Team</div>

                <h2>Project members</h2>
              </div>
            </div>

            {project.members?.length > 0 ? (
              <div className="cf-member-grid">
                {project.members.map((member) => (
                  <div key={member._id} className="cf-member-card">
                    <div className="cf-member-avatar">
                      {member.fullName
                        ? member.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "U"}
                    </div>

                    <div>
                      <h3>{member.fullName}</h3>

                      <button
                        className="cf-btn-ghost-dark"
                        onClick={() => router.push(`/users/${member._id}`)}
                      >
                        View Profile
                      </button>

                      {isOwner && member._id !== ownerId && (
                        <button
                          onClick={() => removeMember(member._id)}
                          style={{
                            backgroundColor: "red",
                            color: "white",
                            marginLeft: "8px",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cf-empty-state">No members yet.</div>
            )}
          </div>
        </div>

        <aside className="cf-detail-actions-card">
          <div className="cf-kicker">Actions</div>

          <h2>Project controls</h2>

          {!isOwner && !isMember && (
            <button
              className="cf-btn-gold"
              onClick={handleJoinRequest}
              disabled={joining}
            >
              {joining ? "Sending..." : "Join Team"}
            </button>
          )}

          {isOwner && (
            <>
              <button
                onClick={() => router.push(`/project-requests/${project._id}`)}
              >
                View Join Requests
              </button>

              <button
                onClick={() => router.push(`/edit-project/${project._id}`)}
              >
                Edit Project
              </button>

              <button
                onClick={() =>
                  router.push(`/recommended-students/${project._id}`)
                }
              >
                Recommended Students
              </button>

              <button
                onClick={() => router.push(`/invite-student/${project._id}`)}
              >
                Invite Student
              </button>

              <button
                onClick={() => router.push(`/project-invites/${project._id}`)}
              >
                View Sent Invites
              </button>
            </>
          )}

          {canManageProject && (
            <>
              <button
                onClick={() => router.push(`/project-tasks/${project._id}`)}
              >
                View Tasks
              </button>

              <button
                onClick={() => router.push(`/project-chat/${project._id}`)}
              >
                Open Chat
              </button>

              <button
                onClick={() => router.push(`/project-summary/${project._id}`)}
              >
                Project Summary
              </button>
            </>
          )}

          {isMember && !isOwner && (
            <button
              onClick={leaveProject}
              style={{
                backgroundColor: "red",
                color: "white",
              }}
            >
              Leave Project
            </button>
          )}

          {isOwner && (
            <button
              onClick={deleteProject}
              style={{
                backgroundColor: "red",
                color: "white",
              }}
            >
              Delete Project
            </button>
          )}

          <button
            className="cf-btn-ghost-dark"
            onClick={() => router.push("/projects")}
          >
            Back to Projects
          </button>
        </aside>
      </section>
    </div>
  );
}
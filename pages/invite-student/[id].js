import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function InviteStudentPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const fetchProject = async () => {
    try {
      const token = getToken();

      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setProject(res.data.project);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (e) => {
    e.preventDefault();

    try {
      setSearching(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/profile/search/users?keyword=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(res.data.users || []);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();

    try {
      setSending(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      if (!selectedUser) {
        alert("Please select a user first");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/project-invites",
        {
          projectId: id,
          invitedUserId: selectedUser._id,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Project invite sent successfully");

      setSelectedUser(null);
      setSearch("");
      setUsers([]);
      setMessage("");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to send invite");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading invite workspace...</div>
      </div>
    );
  }

  const projectTechStack = Array.isArray(project?.techStack)
    ? project.techStack
    : project?.techStack
    ? project.techStack.split(",").map((tech) => tech.trim())
    : [];

  return (
    <div className="cf-page-shell">
      <section className="cf-invite-hero">
        <div>
          <div className="cf-kicker">Team Building</div>

          <h1>Invite Student</h1>

          <p>
            Search students by name or skill, review their profile strength,
            select the right collaborator, and send a professional project
            invitation.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push(`/projects/${id}`)}
          >
            Back to Project
          </button>

          <button
            className="cf-btn-ghost"
            onClick={() => router.push(`/project-invites/${id}`)}
          >
            Sent Invites
          </button>

          <button
            className="cf-btn-gold"
            onClick={() => router.push(`/recommended-students/${id}`)}
          >
            Recommended Students
          </button>
        </div>
      </section>

      <section className="cf-invite-project-card">
        <div>
          <span className="cf-kicker">Current Project</span>

          <h2>{project?.title || "Project"}</h2>

          <p>{project?.description || "No project description available."}</p>
        </div>

        <div className="cf-invite-project-stats">
          <div>
            <span>Domain</span>
            <strong>{project?.domain || "N/A"}</strong>
          </div>

          <div>
            <span>Team Size</span>
            <strong>
              {project?.members?.length || 0}/{project?.teamSizeLimit || "N/A"}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{project?.status || "N/A"}</strong>
          </div>
        </div>

        <div className="cf-tech-stack">
          {projectTechStack.length > 0 ? (
            projectTechStack.map((tech) => <span key={tech}>{tech}</span>)
          ) : (
            <span>No tech stack added</span>
          )}
        </div>
      </section>

      <section className="cf-invite-layout">
        <main className="cf-invite-main">
          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Student Search</div>
                <h2>Find a teammate</h2>
              </div>

              <span className="cf-badge-muted">
                {users.length} result{users.length === 1 ? "" : "s"}
              </span>
            </div>

            <form className="cf-invite-search-form" onSubmit={searchUsers}>
              <input
                type="text"
                placeholder="Search by student name or skill, e.g. React, Node, MongoDB"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />

              <button type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </form>
          </section>

          {users.length === 0 ? (
            <section className="cf-empty-state cf-empty-large">
              <h2>No students shown yet</h2>

              <p>
                Search by student name or skill. Good searches: React, Node,
                MongoDB, Python, UI, backend, full stack.
              </p>
            </section>
          ) : (
            <section className="cf-student-result-grid">
              {users.map((student) => {
                const isSelected = selectedUser?._id === student._id;

                return (
                  <article
                    key={student._id}
                    className={
                      isSelected
                        ? "cf-student-result-card cf-student-result-selected"
                        : "cf-student-result-card"
                    }
                  >
                    <div className="cf-student-result-top">
                      <div className="cf-user-avatar">
                        {student.profilePhoto ? (
                          <img
                            src={student.profilePhoto}
                            alt={student.fullName}
                          />
                        ) : (
                          <span>
                            {(student.fullName || "ST")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="cf-badge-dark">
                          {student.role || "STUDENT"}
                        </span>

                        <h2>{student.fullName}</h2>

                        <p>{student.email}</p>
                      </div>
                    </div>

                    <div className="cf-student-meta-grid">
                      <div>
                        <span>Reputation</span>
                        <strong>{student.reputationScore || 0}</strong>
                      </div>

                      <div>
                        <span>Tasks Done</span>
                        <strong>{student.tasksCompleted || 0}</strong>
                      </div>

                      <div>
                        <span>Verification</span>
                        <strong>{student.verificationStatus || "N/A"}</strong>
                      </div>
                    </div>

                    <div className="cf-tech-stack">
                      {student.skills?.length ? (
                        student.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))
                      ) : (
                        <span>No skills added</span>
                      )}
                    </div>

                    <div className="cf-card-actions">
                      <button type="button" onClick={() => setSelectedUser(student)}>
                        {isSelected ? "Selected" : "Select Student"}
                      </button>

                      <button
                        type="button"
                        className="cf-btn-ghost-dark"
                        onClick={() => router.push(`/users/${student._id}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>

        <aside className="cf-invite-side">
          <section className="cf-send-invite-card">
            <div className="cf-kicker">Send Invite</div>

            <h2>Invitation Panel</h2>

            {selectedUser ? (
              <div className="cf-selected-user-box">
                <div className="cf-selected-user-main">
                  <div className="cf-user-avatar cf-user-avatar-small">
                    {selectedUser.profilePhoto ? (
                      <img
                        src={selectedUser.profilePhoto}
                        alt={selectedUser.fullName}
                      />
                    ) : (
                      <span>
                        {(selectedUser.fullName || "ST")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <strong>{selectedUser.fullName}</strong>
                    <span>{selectedUser.email}</span>
                  </div>
                </div>

                <div className="cf-tech-stack">
                  {selectedUser.skills?.length ? (
                    selectedUser.skills
                      .slice(0, 5)
                      .map((skill) => <span key={skill}>{skill}</span>)
                  ) : (
                    <span>No skills added</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="cf-no-selection-box">
                <strong>No student selected</strong>

                <p>
                  Select a student from the search results to prepare an
                  invitation.
                </p>
              </div>
            )}

            <form onSubmit={sendInvite}>
              <label>Invite Message</label>

              <textarea
                placeholder="Write a short message explaining why this student fits your project..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send Project Invite"}
              </button>
            </form>
          </section>
        </aside>
      </section>
    </div>
  );
}
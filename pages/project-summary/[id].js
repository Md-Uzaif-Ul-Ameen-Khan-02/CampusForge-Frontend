import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectSummaryPage() {
  const router = useRouter();
  const { id } = router.query;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchSummary();
    }
  }, [id]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchSummary = async () => {
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
/api/projects/${id}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummary(res.data.summary);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch project summary"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading project summary...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h2>Summary not found</h2>

          <p>{errorMessage || "Project summary could not be loaded."}</p>

          <button onClick={() => router.push(`/projects/${id}`)}>
            Back to Project
          </button>
        </section>
      </div>
    );
  }

  const project = summary.project;
  const certificateId = `CF-CERT-${project._id.slice(-8).toUpperCase()}`;

  const copyCertificateId = async () => {
    try {
      await navigator.clipboard.writeText(certificateId);
      alert("Certificate ID copied");
    } catch (error) {
      console.log(error);
      alert("Failed to copy Certificate ID");
    }
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-active-hero">
        <div>
          <div className="cf-kicker">Project Intelligence</div>

          <h1>Project Summary</h1>

          <p>
            View project health, progress, task completion, team members, and
            certificate readiness in one professional summary.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push(`/projects/${id}`)}
          >
            Back to Project
          </button>

          <button className="cf-btn-ghost" onClick={fetchSummary}>
            Refresh
          </button>
        </div>
      </section>

      <section className="cf-summary-overview">
        <div className="cf-summary-main-card">
          <div className="cf-kicker">Project</div>

          <h2>{project.title}</h2>

          <p>{project.description}</p>

          <div className="cf-tech-stack">
            {Array.isArray(project.techStack) && project.techStack.length > 0 ? (
              project.techStack.map((tech) => <span key={tech}>{tech}</span>)
            ) : project.techStack ? (
              <span>{project.techStack}</span>
            ) : (
              <span>No tech stack added</span>
            )}
          </div>
        </div>

        <div className="cf-summary-side-card">
          <div className="cf-progress-ring">
            <span>{summary.progress}%</span>
          </div>

          <h2>Completion</h2>

          <p>
            {summary.progress === 100
              ? "This project is complete and certificate-ready."
              : "Project progress is still ongoing."}
          </p>
        </div>
      </section>

      <section className="cf-collab-summary-grid">
        <div>
          <span>Domain</span>
          <strong>{project.domain}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{project.status}</strong>
        </div>

        <div>
          <span>Visibility</span>
          <strong>{project.visibility}</strong>
        </div>

        <div>
          <span>Owner</span>
          <strong>{project.ownerId?.fullName || "Unknown"}</strong>
        </div>
      </section>

      <section className="cf-section">
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Task Progress</div>
            <h2>Execution breakdown</h2>
          </div>

          <span className="cf-badge">{summary.progress}% Done</span>
        </div>

        <div className="cf-progress-track">
          <div
            className="cf-progress-fill"
            style={{
              width: `${summary.progress}%`,
            }}
          />
        </div>

        <div className="cf-summary-metrics">
          <div>
            <span>Total Tasks</span>
            <strong>{summary.totalTasks}</strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>{summary.completedTasks}</strong>
          </div>

          <div>
            <span>In Progress</span>
            <strong>{summary.inProgressTasks}</strong>
          </div>

          <div>
            <span>Pending</span>
            <strong>{summary.pendingTasks}</strong>
          </div>
        </div>
      </section>

      <section className="cf-section">
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Team</div>
            <h2>Project members</h2>
          </div>

          <span className="cf-badge-muted">
            {project.members?.length || 0} member
            {project.members?.length === 1 ? "" : "s"}
          </span>
        </div>

        {project.members?.length === 0 ? (
          <div className="cf-empty-state">
            <h2>No members found</h2>
            <p>This project does not have any listed members yet.</p>
          </div>
        ) : (
          <div className="cf-team-grid">
            {project.members.map((member) => (
              <article key={member._id} className="cf-team-card">
                <div className="cf-user-avatar">
                  <span>
                    {(member.fullName || "ST").slice(0, 2).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3>{member.fullName}</h3>
                  <p>{member.email}</p>

                  <button
                    className="cf-btn-ghost-dark"
                    onClick={() => router.push(`/users/${member._id}`)}
                  >
                    View Profile
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {(project.status === "COMPLETED" || summary.progress === 100) && (
        <section className="cf-certificate-preview-card">
          <div>
            <div className="cf-kicker">Certificate Preview</div>

            <h2>Completion Certificate Ready</h2>

            <p>
              This certifies that the team successfully completed{" "}
              <strong>{project.title}</strong>.
            </p>

            <div className="cf-certificate-id-box">
              <span>Certificate ID</span>
              <strong>{certificateId}</strong>
            </div>
          </div>

          <div className="cf-projects-hero-actions">
            <button onClick={copyCertificateId}>Copy Certificate ID</button>

            <button
              className="cf-btn-gold"
              onClick={() => router.push(`/project-certificate/${project._id}`)}
            >
              Open Certificate
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
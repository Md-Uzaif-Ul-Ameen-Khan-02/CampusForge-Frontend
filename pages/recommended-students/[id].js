import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function RecommendedStudentsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [recommendations, setRecommendations] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchRecommendedStudents();
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
    }
  };

  const fetchRecommendedStudents = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/recommendations/students/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const filtered = (res.data.recommendations || []).filter(
        (item) => item.matchScore > 0
      );

      setRecommendations(filtered);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message || "Failed to fetch recommended students"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading recommended students...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-collab-hero">
        <div>
          <div className="cf-kicker">Smart Matching</div>

          <h1>Recommended Students</h1>

          <p>
            These students match your project based on skills and profile data.
            Review their profiles and invite them from the invite page.
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
            className="cf-btn-gold"
            onClick={() => router.push(`/invite-student/${id}`)}
          >
            Invite Student
          </button>

          <button className="cf-btn-ghost" onClick={fetchRecommendedStudents}>
            Refresh
          </button>
        </div>
      </section>

      <section className="cf-collab-summary-grid">
        <div>
          <span>Project</span>
          <strong>{project?.title || "Project"}</strong>
        </div>

        <div>
          <span>Domain</span>
          <strong>{project?.domain || "N/A"}</strong>
        </div>

        <div>
          <span>Matches</span>
          <strong>{recommendations.length}</strong>
        </div>

        <div>
          <span>Team Size</span>
          <strong>
            {project?.members?.length || 0}/{project?.teamSizeLimit || "N/A"}
          </strong>
        </div>
      </section>

      <section className="cf-section">
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Project Tech Stack</div>

            <h2>Matching is based on these skills</h2>
          </div>
        </div>

        <div className="cf-tech-stack">
          {Array.isArray(project?.techStack) && project.techStack.length > 0 ? (
            project.techStack.map((tech) => <span key={tech}>{tech}</span>)
          ) : (
            <span>{project?.techStack || "No tech stack added"}</span>
          )}
        </div>
      </section>

      {recommendations.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No matching students found</h2>

          <p>Try searching manually from the invite student page.</p>

          <button onClick={() => router.push(`/invite-student/${id}`)}>
            Search Students
          </button>
        </section>
      ) : (
        <section className="cf-collab-grid">
          {recommendations.map((item) => (
            <article key={item.user._id} className="cf-collab-card">
              <div className="cf-collab-user-row">
                <div className="cf-user-avatar">
                  {item.user.profilePhoto ? (
                    <img src={item.user.profilePhoto} alt="Profile" />
                  ) : (
                    <span>
                      {(item.user.fullName || "ST").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <span className="cf-badge">MATCH {item.matchScore}</span>

                  <h2>{item.user.fullName}</h2>

                  <p>{item.user.email}</p>
                </div>
              </div>

              <div className="cf-tech-stack">
                {item.user.skills?.length ? (
                  item.user.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))
                ) : (
                  <span>No skills added</span>
                )}
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Match Score</span>
                  <strong>{item.matchScore}</strong>
                </div>

                <div>
                  <span>Reputation</span>
                  <strong>{item.user.reputationScore || 0}</strong>
                </div>
              </div>

              <div className="cf-card-actions">
                <button onClick={() => router.push(`/users/${item.user._id}`)}>
                  View Profile
                </button>

                <button
                  className="cf-btn-ghost-dark"
                  onClick={() => router.push(`/invite-student/${id}`)}
                >
                  Invite Page
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [techStack, setTechStack] = useState("");
  const [teamSizeLimit, setTeamSizeLimit] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [visibility, setVisibility] = useState("PUBLIC");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
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

      const token = getToken();

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/projects/${id}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      const project = res.data.project;

      setTitle(project.title || "");
      setDescription(project.description || "");
      setDomain(project.domain || "");

      setTechStack(
        Array.isArray(project.techStack)
          ? project.techStack.join(", ")
          : project.techStack || ""
      );

      setTeamSizeLimit(project.teamSizeLimit || "");
      setGithubLink(project.githubLink || "");
      setStatus(project.status || "OPEN");
      setVisibility(project.visibility || "PUBLIC");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/${id}`,
        {
          title,
          description,
          domain,
          techStack,
          teamSizeLimit,
          githubLink,
          status,
          visibility,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Project updated successfully");

      router.push(`/projects/${id}`);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Project update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading project editor...</div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-active-hero">
        <div>
          <div className="cf-kicker">Project Editor</div>

          <h1>Edit Project</h1>

          <p>
            Update your project title, description, domain, tech stack, GitHub
            link, visibility, and current progress status.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push(`/projects/${id}`)}
          >
            Back to Project
          </button>

          <button className="cf-btn-ghost" onClick={fetchProject}>
            Reload
          </button>
        </div>
      </section>

      <section className="cf-form-layout">
        <div className="cf-form-card">
          <div className="cf-section-heading">
            <div>
              <div className="cf-kicker">Project Details</div>

              <h2>Update project profile</h2>
            </div>

            <span className="cf-badge-dark">{status}</span>
          </div>

          <form onSubmit={updateProject} className="cf-smart-form">
            <div className="cf-form-group">
              <label>Project Title</label>

              <input
                type="text"
                placeholder="Project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-group">
              <label>Description</label>

              <textarea
                placeholder="Describe the project, goals, and outcome."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-grid">
              <div className="cf-form-group">
                <label>Domain</label>

                <input
                  type="text"
                  placeholder="e.g. AI, Web, HealthTech"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                />
              </div>

              <div className="cf-form-group">
                <label>Team Size Limit</label>

                <input
                  type="number"
                  placeholder="Team size limit"
                  value={teamSizeLimit}
                  onChange={(e) => setTeamSizeLimit(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="cf-form-group">
              <label>Tech Stack</label>

              <input
                type="text"
                placeholder="Comma separated, e.g. React, Node, MongoDB"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>

            <div className="cf-form-group">
              <label>GitHub Link</label>

              <input
                type="text"
                placeholder="https://github.com/..."
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
              />
            </div>

            <div className="cf-form-grid">
              <div className="cf-form-group">
                <label>Project Status</label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div className="cf-form-group">
                <label>Visibility</label>

                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="PRIVATE">PRIVATE</option>
                </select>
              </div>
            </div>

            <div className="cf-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Project"}
              </button>

              <button
                type="button"
                className="cf-btn-ghost-dark"
                onClick={() => router.push(`/projects/${id}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Editing Guide</div>

          <h2>Keep the project accurate</h2>

          <ul>
            <li>Use a clear and searchable title.</li>
            <li>Keep the domain specific.</li>
            <li>Update tech stack when tools change.</li>
            <li>Set status carefully before completion.</li>
            <li>Use private visibility only when needed.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
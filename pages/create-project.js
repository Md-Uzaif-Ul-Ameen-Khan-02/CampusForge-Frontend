import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function CreateProject() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [techStack, setTechStack] = useState("");
  const [teamSizeLimit, setTeamSizeLimit] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");

  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isStudent =
    user?.role === "STUDENT" || user?.role === "VERIFIED_STUDENT";

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setPageReady(true);
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const createProject = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      const cleanTechStack = techStack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean);

      const res = await axios.post(
        "http://localhost:5000/api/projects",
        {
          title,
          description,
          domain,
          techStack: cleanTechStack,
          teamSizeLimit: Number(teamSizeLimit),
          visibility,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Project created successfully");

      const createdProjectId = res.data.project?._id;

      if (createdProjectId) {
        router.push(`/projects/${createdProjectId}`);
      } else {
        router.push("/my-projects");
      }
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      setErrorMessage(
        error.response?.data?.message ||
          "Project creation failed. Please check the details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !pageReady) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading create project page...</div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only students can create projects.</p>

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
          <div className="cf-kicker">Create Project</div>

          <h1>Start a serious student project.</h1>

          <p>
            Define your idea, choose your domain, list the required tech stack,
            and open the project for verified students to collaborate.
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
            onClick={() => router.push("/my-projects")}
          >
            My Projects
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-form-layout">
        <form className="cf-pro-form" onSubmit={createProject}>
          <div className="cf-form-section">
            <h2>Project Details</h2>

            <p>
              Write the title and description clearly so students understand
              what you are building and why it matters.
            </p>

            <label>Project Title</label>

            <input
              type="text"
              placeholder="Example: AI Study Planner for Engineering Students"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label>Description</label>

            <textarea
              placeholder="Explain the problem, goal, main features, and what kind of teammates you need."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <label>Domain</label>

            <input
              type="text"
              placeholder="Example: AI, Web Development, Healthcare, FinTech"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>

          <div className="cf-form-section">
            <h2>Team Setup</h2>

            <p>
              Add the technologies and team limit. You can manage members,
              tasks, and progress after creating the project.
            </p>

            <label>Tech Stack</label>

            <input
              type="text"
              placeholder="React, Node.js, MongoDB, Python"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
            />

            <label>Team Size Limit</label>

            <input
              type="number"
              placeholder="Example: 4"
              value={teamSizeLimit}
              onChange={(e) => setTeamSizeLimit(e.target.value)}
              min="1"
              max="20"
              required
            />

            <label>Visibility</label>

            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </div>

          <div className="cf-form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </button>

            <button
              type="button"
              className="cf-btn-ghost-dark"
              onClick={() => router.push("/projects")}
            >
              Cancel
            </button>
          </div>
        </form>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Project Quality Tips</div>

          <h2>Make your project attractive to teammates.</h2>

          <ul>
            <li>Write a clear problem statement.</li>
            <li>Mention expected features.</li>
            <li>List the exact skills needed.</li>
            <li>Keep team size realistic.</li>
            <li>Use public visibility if you want join requests.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
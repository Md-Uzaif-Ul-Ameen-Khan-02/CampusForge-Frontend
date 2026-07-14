import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function MyTasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

    fetchMyTasks();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMyTasks = async () => {
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
/api/tasks/my-tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(res.data.tasks || []);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch your tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/tasks/status/${taskId}`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchMyTasks();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  const clearFilters = () => {
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setSortBy("NEWEST");
  };

  const getStatusClass = (status) => {
    if (status === "DONE") return "cf-status cf-status-success";
    if (status === "IN_PROGRESS") return "cf-status cf-status-warning";
    if (status === "TODO") return "cf-status cf-status-open";
    return "cf-status cf-status-muted";
  };

  const getPriorityClass = (priority) => {
    if (priority === "HIGH") return "cf-priority cf-priority-high";
    if (priority === "MEDIUM") return "cf-priority cf-priority-medium";
    return "cf-priority cf-priority-low";
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) {
        return false;
      }

      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "DUE_DATE") {
        const dateA = a.dueDate
          ? new Date(a.dueDate).getTime()
          : Infinity;

        const dateB = b.dueDate
          ? new Date(b.dueDate).getTime()
          : Infinity;

        return dateA - dateB;
      }

      if (sortBy === "PRIORITY") {
        const priorityOrder = {
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };

        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading your tasks...</div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only students can access My Tasks.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-student-hero">
        <div>
          <div className="cf-kicker">Student Workflow</div>

          <h1>My Tasks</h1>

          <p>
            Track your assigned work, update task status, and jump directly
            into the project workspace.
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

          <button className="cf-btn-ghost" onClick={fetchMyTasks}>
            Refresh
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      <section className="cf-toolbar-card">
        <div className="cf-workflow-filter-grid">
          <div>
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">ALL</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div>
            <label>Priority</label>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">ALL</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div>
            <label>Sort By</label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="NEWEST">NEWEST</option>
              <option value="DUE_DATE">DUE DATE</option>
              <option value="PRIORITY">PRIORITY</option>
            </select>
          </div>

          <div className="cf-workflow-filter-actions">
            <button className="cf-btn-ghost-dark" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        <p>
          Showing <strong>{filteredTasks.length}</strong> of{" "}
          <strong>{tasks.length}</strong> tasks
        </p>
      </section>

      {tasks.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No assigned tasks yet</h2>

          <p>
            You do not have any assigned tasks yet. Open your projects and
            create or assign tasks to start tracking work.
          </p>

          <button onClick={() => router.push("/my-projects")}>
            Go to My Projects
          </button>
        </section>
      ) : filteredTasks.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No tasks match your filters</h2>

          <p>Try changing the status, priority, or sort option.</p>

          <button onClick={clearFilters}>Clear Filters</button>
        </section>
      ) : (
        <section className="cf-workflow-grid">
          {filteredTasks.map((task) => (
            <article key={task._id} className="cf-workflow-card">
              <div className="cf-workflow-card-top">
                <div>
                  <h2>{task.title}</h2>

                  <p>{task.description || "No description added."}</p>
                </div>

                <div className="cf-task-badges">
                  <span className={getStatusClass(task.status)}>
                    {task.status}
                  </span>

                  <span className={getPriorityClass(task.priority)}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="cf-project-info-grid">
                <div>
                  <span>Project</span>
                  <strong>{task.projectId?.title || "Project removed"}</strong>
                </div>

                <div>
                  <span>Domain</span>
                  <strong>{task.projectId?.domain || "N/A"}</strong>
                </div>

                <div>
                  <span>Created By</span>
                  <strong>{task.createdBy?.fullName || "Unknown"}</strong>
                </div>

                <div>
                  <span>Due Date</span>
                  <strong>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No due date"}
                  </strong>
                </div>
              </div>

              <div className="cf-card-actions">
                {task.projectId && (
                  <>
                    <button
                      onClick={() =>
                        router.push(`/projects/${task.projectId._id}`)
                      }
                    >
                      Open Project
                    </button>

                    <button
                      className="cf-btn-ghost-dark"
                      onClick={() =>
                        router.push(`/project-tasks/${task.projectId._id}`)
                      }
                    >
                      Project Tasks
                    </button>
                  </>
                )}
              </div>

              <div className="cf-status-action-row">
                <button
                  disabled={task.status === "TODO"}
                  className="cf-btn-ghost-dark"
                  onClick={() => updateTaskStatus(task._id, "TODO")}
                >
                  TODO
                </button>

                <button
                  disabled={task.status === "IN_PROGRESS"}
                  className="cf-btn-ghost-dark"
                  onClick={() => updateTaskStatus(task._id, "IN_PROGRESS")}
                >
                  In Progress
                </button>

                <button
                  disabled={task.status === "DONE"}
                  onClick={() => updateTaskStatus(task._id, "DONE")}
                >
                  Done
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
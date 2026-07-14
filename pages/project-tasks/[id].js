import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function ProjectTasksPage() {
  const router = useRouter();
  const { id } = router.query;

  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assignedFilter, setAssignedFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const [taskComments, setTaskComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const [taskAttachments, setTaskAttachments] = useState({});
  const [attachmentInputs, setAttachmentInputs] = useState({});

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
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
      const token = getToken();

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/projects/${id}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      setProject(res.data.project);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTasks = async () => {
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
/api/tasks/project/${id}`,
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
        error.response?.data?.message || "Failed to fetch tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/tasks/create`,
        {
          projectId: id,
          title,
          description,
          assignedTo: assignedTo || null,
          priority,
          dueDate: dueDate || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Task created successfully");

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setPriority("MEDIUM");
      setDueDate("");

      fetchTasks();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Task creation failed");
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

      fetchTasks();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to update task");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}
/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Task deleted");

      fetchTasks();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to delete task");
    }
  };

  const fetchTaskComments = async (taskId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/task-comments/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTaskComments((prev) => ({
        ...prev,
        [taskId]: res.data.comments || [],
      }));
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to fetch comments");
    }
  };

  const addTaskComment = async (taskId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const comment = commentInputs[taskId];

      if (!comment || !comment.trim()) {
        alert("Please write a comment");
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/task-comments/${taskId}`,
        {
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCommentInputs((prev) => ({
        ...prev,
        [taskId]: "",
      }));

      fetchTaskComments(taskId);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteTaskComment = async (taskId, commentId) => {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete this comment?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/task-comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTaskComments(taskId);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const fetchTaskAttachments = async (taskId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/task-attachments/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTaskAttachments((prev) => ({
        ...prev,
        [taskId]: res.data.attachments || [],
      }));
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to fetch attachments");
    }
  };

  const uploadTaskAttachment = async (taskId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const file = attachmentInputs[taskId];

      if (!file) {
        alert("Please select a file");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/task-attachments/${taskId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Attachment uploaded successfully");

      setAttachmentInputs((prev) => ({
        ...prev,
        [taskId]: null,
      }));

      fetchTaskAttachments(taskId);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to upload attachment");
    }
  };

  const deleteTaskAttachment = async (taskId, attachmentId) => {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete this attachment?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/task-attachments/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Attachment deleted successfully");

      fetchTaskAttachments(taskId);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to delete attachment");
    }
  };

  const getStatusClass = (status) => {
    if (status === "DONE") return "cf-status cf-status-success";
    if (status === "IN_PROGRESS") return "cf-status cf-status-warning";
    if (status === "TODO") return "cf-status cf-status-open";
    return "cf-status cf-status-muted";
  };

  const getPriorityClass = (taskPriority) => {
    if (taskPriority === "HIGH") return "cf-priority cf-priority-high";
    if (taskPriority === "MEDIUM") return "cf-priority cf-priority-medium";
    return "cf-priority cf-priority-low";
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading project tasks...</div>
      </div>
    );
  }

  const loggedInUserId = user?._id || user?.id;
  const ownerId = project?.ownerId?._id || project?.ownerId;

  const isProjectOwner =
    loggedInUserId &&
    ownerId &&
    loggedInUserId.toString() === ownerId.toString();

  const isProjectMember =
    loggedInUserId &&
    project?.members?.some(
      (member) => member._id?.toString() === loggedInUserId.toString()
    );

  const canAccessTasks = isProjectOwner || isProjectMember;

  const filteredTasks = tasks
    .filter((task) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        task.title?.toLowerCase().includes(searchText) ||
        task.description?.toLowerCase().includes(searchText);

      if (search && !matchesSearch) return false;
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;

      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
        return false;
      }

      if (assignedFilter !== "ALL" && task.assignedTo?._id !== assignedFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "DUE_DATE") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
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

  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;
  const todoTasks = tasks.filter((task) => task.status === "TODO").length;

  return (
    <div className="cf-page-shell">
      <section className="cf-detail-hero">
        <div>
          <div className="cf-kicker">Task Board</div>

          <h1>{project?.title || "Project Tasks"}</h1>

          <p>
            Create, assign, update, comment, and attach files to project tasks.
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
            onClick={() => router.push(`/project-summary/${id}`)}
          >
            Summary
          </button>

          <button className="cf-btn-ghost" onClick={fetchTasks}>
            Refresh Tasks
          </button>
        </div>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {!canAccessTasks ? (
        <div className="cf-access-card">
          <h1>Restricted</h1>

          <p>Only project members can view and manage tasks.</p>

          <button onClick={() => router.push(`/projects/${id}`)}>
            Back to Project
          </button>
        </div>
      ) : (
        <>
          <section className="cf-collab-summary-grid">
            <div>
              <span>Total Tasks</span>
              <strong>{tasks.length}</strong>
            </div>

            <div>
              <span>Done</span>
              <strong>{doneTasks}</strong>
            </div>

            <div>
              <span>In Progress</span>
              <strong>{inProgressTasks}</strong>
            </div>

            <div>
              <span>Todo</span>
              <strong>{todoTasks}</strong>
            </div>
          </section>

          <section className="cf-task-layout">
            <form className="cf-task-create-card" onSubmit={createTask}>
              <div className="cf-kicker">Create Task</div>

              <h2>Add a new task</h2>

              <label>Task Title</label>

              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label>Description</label>

              <textarea
                placeholder="Task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label>Assign To</label>

              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>

                {project?.members?.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.fullName}
                  </option>
                ))}
              </select>

              <label>Priority</label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>

              <label>Due Date</label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <button type="submit" className="cf-btn-gold">
                Create Task
              </button>
            </form>

            <div className="cf-task-main">
              <section className="cf-toolbar-card">
                <div className="cf-task-filter-grid">
                  <input
                    type="text"
                    placeholder="Search task title or description"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">ALL STATUS</option>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="ALL">ALL PRIORITY</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>

                  <select
                    value={assignedFilter}
                    onChange={(e) => setAssignedFilter(e.target.value)}
                  >
                    <option value="ALL">ALL ASSIGNEES</option>

                    {project?.members?.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.fullName}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="NEWEST">NEWEST</option>
                    <option value="DUE_DATE">DUE DATE</option>
                    <option value="PRIORITY">PRIORITY</option>
                  </select>
                </div>

                <p>
                  Showing <strong>{filteredTasks.length}</strong> of{" "}
                  <strong>{tasks.length}</strong> tasks
                </p>
              </section>

              {filteredTasks.length === 0 ? (
                <div className="cf-empty-state cf-empty-large">
                  <h2>No tasks found</h2>

                  <p>Create a task or change your filters.</p>
                </div>
              ) : (
                <div className="cf-task-card-list">
                  {filteredTasks.map((task) => {
                    const canUpdateTask =
                      isProjectOwner ||
                      task.createdBy?._id === loggedInUserId ||
                      task.assignedTo?._id === loggedInUserId;

                    const canDeleteTask =
                      isProjectOwner ||
                      task.createdBy?._id === loggedInUserId;

                    return (
                      <article key={task._id} className="cf-task-card">
                        <div className="cf-task-card-header">
                          <div>
                            <h3>{task.title}</h3>

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
                            <span>Assigned To</span>
                            <strong>
                              {task.assignedTo?.fullName || "Unassigned"}
                            </strong>
                          </div>

                          <div>
                            <span>Created By</span>
                            <strong>
                              {task.createdBy?.fullName || "Unknown"}
                            </strong>
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
                          {canUpdateTask ? (
                            <>
                              <button
                                className="cf-btn-ghost-dark"
                                onClick={() =>
                                  updateTaskStatus(task._id, "TODO")
                                }
                              >
                                TODO
                              </button>

                              <button
                                className="cf-btn-ghost-dark"
                                onClick={() =>
                                  updateTaskStatus(task._id, "IN_PROGRESS")
                                }
                              >
                                In Progress
                              </button>

                              <button
                                onClick={() =>
                                  updateTaskStatus(task._id, "DONE")
                                }
                              >
                                Done
                              </button>
                            </>
                          ) : (
                            <p>You can view this task, but cannot update it.</p>
                          )}

                          {canDeleteTask && (
                            <button
                              onClick={() => deleteTask(task._id)}
                              style={{
                                backgroundColor: "red",
                                color: "white",
                              }}
                            >
                              Delete
                            </button>
                          )}

                          <button
                            className="cf-btn-ghost-dark"
                            onClick={() =>
                              router.push(`/task-activity/${task._id}`)
                            }
                          >
                            Activity
                          </button>
                        </div>

                        <div className="cf-task-subsection">
                          <div className="cf-task-subsection-header">
                            <h4>Comments</h4>

                            <button
                              className="cf-btn-ghost-dark"
                              onClick={() => fetchTaskComments(task._id)}
                            >
                              Load Comments
                            </button>
                          </div>

                          {taskComments[task._id]?.length > 0 ? (
                            <div className="cf-comment-list">
                              {taskComments[task._id].map((comment) => {
                                const canDeleteComment =
                                  isProjectOwner ||
                                  comment.userId?._id === loggedInUserId;

                                return (
                                  <div
                                    key={comment._id}
                                    className="cf-comment-card"
                                  >
                                    <strong>
                                      {comment.userId?.fullName ||
                                        "Unknown User"}
                                    </strong>

                                    <p>{comment.comment}</p>

                                    <small>
                                      {new Date(
                                        comment.createdAt
                                      ).toLocaleString()}
                                    </small>

                                    {canDeleteComment && (
                                      <button
                                        onClick={() =>
                                          deleteTaskComment(
                                            task._id,
                                            comment._id
                                          )
                                        }
                                        style={{
                                          backgroundColor: "red",
                                          color: "white",
                                        }}
                                      >
                                        Delete Comment
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p>No comments loaded or no comments yet.</p>
                          )}

                          <textarea
                            placeholder="Write a comment..."
                            value={commentInputs[task._id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [task._id]: e.target.value,
                              }))
                            }
                          />

                          <button onClick={() => addTaskComment(task._id)}>
                            Add Comment
                          </button>
                        </div>

                        <div className="cf-task-subsection">
                          <div className="cf-task-subsection-header">
                            <h4>Attachments</h4>

                            <button
                              className="cf-btn-ghost-dark"
                              onClick={() => fetchTaskAttachments(task._id)}
                            >
                              Load Attachments
                            </button>
                          </div>

                          {taskAttachments[task._id]?.length > 0 ? (
                            <div className="cf-attachment-list">
                              {taskAttachments[task._id].map((attachment) => {
                                const canDeleteAttachment =
                                  isProjectOwner ||
                                  attachment.uploadedBy?._id === loggedInUserId;

                                return (
                                  <div
                                    key={attachment._id}
                                    className="cf-attachment-card"
                                  >
                                    <div>
                                      <strong>{attachment.fileName}</strong>

                                      <p>
                                        Uploaded by{" "}
                                        {attachment.uploadedBy?.fullName ||
                                          "Unknown"}
                                      </p>
                                    </div>

                                    <a
                                      href={attachment.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="cf-inline-link"
                                    >
                                      Open
                                    </a>

                                    {canDeleteAttachment && (
                                      <button
                                        onClick={() =>
                                          deleteTaskAttachment(
                                            task._id,
                                            attachment._id
                                          )
                                        }
                                        style={{
                                          backgroundColor: "red",
                                          color: "white",
                                        }}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p>No attachments loaded or no attachments yet.</p>
                          )}

                          <input
                            type="file"
                            onChange={(e) =>
                              setAttachmentInputs((prev) => ({
                                ...prev,
                                [task._id]: e.target.files[0],
                              }))
                            }
                          />

                          <button onClick={() => uploadTaskAttachment(task._id)}>
                            Upload Attachment
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
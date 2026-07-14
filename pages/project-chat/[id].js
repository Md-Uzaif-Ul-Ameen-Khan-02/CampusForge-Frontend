import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

import socket from "../../src/utils/socket";

export default function ProjectChatPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    if (!id) return;

    socket.emit("joinRoom", id);

    fetchProject();
    fetchMessages();

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.emit("leaveRoom", id);
      socket.off("receiveMessage", handleReceiveMessage);
    };
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

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/chat/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(res.data.messages || []);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      if (!text.trim()) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/chat/send`,
        {
          projectId: id,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setText("");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-chat-hero">
        <div>
          <div className="cf-kicker">Live Collaboration</div>

          <h1>Project Chat</h1>

          <p>
            Discuss updates, blockers, decisions, and next steps with your
            project team in real time.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push(`/projects/${id}`)}
          >
            Back to Project
          </button>

          <button className="cf-btn-ghost" onClick={fetchMessages}>
            Refresh Chat
          </button>
        </div>
      </section>

      <section className="cf-chat-project-card">
        <div>
          <span className="cf-kicker">Current Project</span>

          <h2>{project?.title || "Project"}</h2>

          <p>{project?.description || "No project description available."}</p>
        </div>

        <div className="cf-chat-project-meta">
          <div>
            <span>Domain</span>
            <strong>{project?.domain || "N/A"}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{project?.status || "N/A"}</strong>
          </div>

          <div>
            <span>Messages</span>
            <strong>{messages.length}</strong>
          </div>
        </div>
      </section>

      <section className="cf-chat-layout">
        <main className="cf-chat-panel">
          <div className="cf-chat-panel-header">
            <div>
              <div className="cf-kicker">Team Room</div>

              <h2>Conversation</h2>
            </div>

            <span className="cf-badge-muted">
              {messages.length} message{messages.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="cf-chat-messages">
            {loadingMessages ? (
              <div className="cf-loading-card">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="cf-empty-state">
                <h2>No messages yet</h2>

                <p>
                  Start the conversation by sharing an update, task status, or
                  question for the team.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <article
                  key={message._id || `${message.text}-${index}`}
                  className="cf-chat-message"
                >
                  <div className="cf-user-avatar cf-user-avatar-small">
                    <span>
                      {(message.senderId?.fullName || "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>

                  <div className="cf-chat-bubble">
                    <div className="cf-chat-bubble-top">
                      <strong>{message.senderId?.fullName || "User"}</strong>

                      {message.createdAt && (
                        <span>
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p>{message.text}</p>
                  </div>
                </article>
              ))
            )}
          </div>

          <form className="cf-chat-compose" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button type="submit">Send</button>
          </form>
        </main>

        <aside className="cf-chat-side">
          <section className="cf-send-invite-card">
            <div className="cf-kicker">Chat Tips</div>

            <h2>Use this room well</h2>

            <ul>
              <li>Share blockers clearly.</li>
              <li>Confirm task ownership.</li>
              <li>Keep project decisions visible.</li>
              <li>Use tasks for formal tracking.</li>
            </ul>

            <button onClick={() => router.push(`/project-tasks/${id}`)}>
              Open Project Tasks
            </button>
          </section>
        </aside>
      </section>
    </div>
  );
}
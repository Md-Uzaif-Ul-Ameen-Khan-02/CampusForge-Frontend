import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../src/utils/socket";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);

  const projectId = "YOUR_PROJECT_ID_HERE";

  useEffect(() => {
    socket.emit("joinRoom", projectId);

    fetchMessages();

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.emit("leaveRoom", projectId);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);

      const token = getToken();

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}
/api/chat/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(res.data.messages || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    try {
      if (!text.trim()) return;

      const token = getToken();

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/chat/send`,
        {
          projectId,
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
    }
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-chat-hero">
        <div>
          <div className="cf-kicker">Socket Test Room</div>

          <h1>CampusForge Chat</h1>

          <p>
            This is a temporary chat test page. For real project chat, use the
            project-specific chat route.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button className="cf-btn-ghost" onClick={fetchMessages}>
            Refresh Messages
          </button>
        </div>
      </section>

      <section className="cf-chat-layout">
        <main className="cf-chat-panel">
          <div className="cf-chat-panel-header">
            <div>
              <div className="cf-kicker">Room</div>

              <h2>{projectId}</h2>
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

                <p>Send the first message in this temporary chat room.</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <article
                  key={msg._id || index}
                  className="cf-chat-message"
                >
                  <div className="cf-user-avatar cf-user-avatar-small">
                    <span>
                      {(msg.senderId?.fullName || "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>

                  <div className="cf-chat-bubble">
                    <div className="cf-chat-bubble-top">
                      <strong>{msg.senderId?.fullName || "User"}</strong>

                      {msg.createdAt && (
                        <span>{new Date(msg.createdAt).toLocaleString()}</span>
                      )}
                    </div>

                    <p>{msg.text}</p>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="cf-chat-compose">
            <input
              type="text"
              placeholder="Type message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </main>

        <aside className="cf-chat-side">
          <section className="cf-send-invite-card">
            <div className="cf-kicker">Important</div>

            <h2>Temporary project ID</h2>

            <p>
              This page still uses <strong>YOUR_PROJECT_ID_HERE</strong>. Real
              chat should happen from <strong>/project-chat/[projectId]</strong>.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
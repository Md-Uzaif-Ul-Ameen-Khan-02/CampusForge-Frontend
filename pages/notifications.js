import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchNotifications();
  }, [authLoading, user]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.patch(
        `http://localhost:5000/api/notifications/read/${notificationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(res.data.unreadCount || 0);
      fetchNotifications();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.patch(
        "http://localhost:5000/api/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(res.data.unreadCount || 0);
      fetchNotifications();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete this notification?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(res.data.unreadCount || 0);
      fetchNotifications();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to delete notification");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete all notifications?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.delete(
        "http://localhost:5000/api/notifications/delete-all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(res.data.unreadCount || 0);
      setNotifications([]);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete all notifications"
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading notifications...</div>
      </div>
    );
  }

  const readCount = notifications.length - unreadCount;

  return (
    <div className="cf-page-shell">
      <section className="cf-active-hero">
        <div>
          <div className="cf-kicker">CampusForge Updates</div>

          <h1>Notifications</h1>

          <p>
            Stay updated on join requests, project invites, approvals, tasks,
            reviews, activity, and important platform events.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </button>

          <button className="cf-btn-ghost" onClick={fetchNotifications}>
            Refresh
          </button>

          {unreadCount > 0 && (
            <button onClick={markAllAsRead}>Mark All Read</button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={deleteAllNotifications}
              style={{
                backgroundColor: "red",
                color: "white",
              }}
            >
              Delete All
            </button>
          )}
        </div>
      </section>

      {errorMessage && <section className="cf-error-state">{errorMessage}</section>}

      <section className="cf-collab-summary-grid">
        <div>
          <span>Total</span>
          <strong>{notifications.length}</strong>
        </div>

        <div>
          <span>Unread</span>
          <strong>{unreadCount}</strong>
        </div>

        <div>
          <span>Read</span>
          <strong>{readCount < 0 ? 0 : readCount}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{unreadCount > 0 ? "Action Needed" : "Clear"}</strong>
        </div>
      </section>

      {notifications.length === 0 ? (
        <section className="cf-empty-state cf-empty-large">
          <h2>No notifications yet</h2>

          <p>
            When someone sends you a request, invite, task update, review,
            approval update, or project event, it will appear here.
          </p>
        </section>
      ) : (
        <section className="cf-notification-list">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={
                notification.isRead
                  ? "cf-notification-card"
                  : "cf-notification-card cf-notification-unread"
              }
            >
              <div className="cf-notification-icon">
                {notification.isRead ? "✓" : "!"}
              </div>

              <div className="cf-notification-content">
                <div className="cf-notification-top">
                  <div>
                    <span
                      className={
                        notification.isRead ? "cf-badge-muted" : "cf-badge"
                      }
                    >
                      {notification.isRead ? "READ" : "NEW"}
                    </span>

                    <h2>{notification.title || "Notification"}</h2>
                  </div>

                  <span className="cf-badge-dark">
                    {notification.type || "SYSTEM"}
                  </span>
                </div>

                <p>{notification.message || "No message available."}</p>

                <div className="cf-project-info-grid">
                  <div>
                    <span>Status</span>
                    <strong>{notification.isRead ? "Read" : "Unread"}</strong>
                  </div>

                  <div>
                    <span>Date</span>
                    <strong>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : "N/A"}
                    </strong>
                  </div>
                </div>

                <div className="cf-card-actions">
                  {notification.relatedProjectId && (
                    <button
                      onClick={() =>
                        router.push(`/projects/${notification.relatedProjectId}`)
                      }
                    >
                      Open Project
                    </button>
                  )}

                  {!notification.isRead && (
                    <button
                      className="cf-btn-ghost-dark"
                      onClick={() => markAsRead(notification._id)}
                    >
                      Mark as Read
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notification._id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
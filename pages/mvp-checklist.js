import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const checklistItems = [
  "Register/Login works",
  "Student profile works",
  "Student verification submission works",
  "Admin can approve verification",
  "Project creation works",
  "Project edit/delete works",
  "Join request send/approve/reject works",
  "Project invite send/accept/reject works",
  "My Projects works",
  "My Join Requests works",
  "Tasks create/update/delete works",
  "Task comments work",
  "Task attachments work",
  "Task activity timeline works",
  "Project chat works",
  "Notifications work",
  "Recommendations work",
  "Project progress works",
  "Project summary works",
  "Certificate page works",
  "Certificate verification works",
  "Completed projects showcase works",
  "Featured projects works",
  "Most liked projects works",
  "Project likes work",
  "Project reviews work",
  "System status works",
  "Environment status works for super admin",
  "Frontend route protection works",
  "Backend role protection reviewed",
];

export default function MVPChecklistPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [checkedItems, setCheckedItems] = useState({});

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const toggleItem = (item) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const completedCount = checklistItems.filter((item) => checkedItems[item])
    .length;

  const progress = Math.round((completedCount / checklistItems.length) * 100);

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading checklist...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");

    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Redirecting...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="cf-page-shell">
        <div className="cf-access-card">
          <h1>Unauthorized</h1>

          <p>Only Super Admin can access the MVP checklist.</p>

          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-page-shell">
      <section className="cf-admin-hero">
        <div>
          <div className="cf-kicker">Launch Readiness</div>

          <h1>CampusForge MVP Checklist</h1>

          <p>
            Manually verify every major platform workflow before launch, demo,
            or deployment.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>
        </div>
      </section>

      <section className="cf-checklist-progress-card">
        <div>
          <span>MVP Progress</span>

          <strong>{progress}%</strong>

          <p>
            {completedCount}/{checklistItems.length} checks completed
          </p>
        </div>

        <div className="cf-progress-track">
          <div
            className="cf-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      <section className="cf-checklist-grid">
        {checklistItems.map((item) => (
          <label key={item} className="cf-checklist-item">
            <input
              type="checkbox"
              checked={Boolean(checkedItems[item])}
              onChange={() => toggleItem(item)}
            />

            <span>{item}</span>
          </label>
        ))}
      </section>

      {completedCount === checklistItems.length && (
        <section className="cf-launch-complete-card">
          <h2>Strong MVP Checklist Completed</h2>

          <p>All major CampusForge MVP modules have been manually checked.</p>
        </section>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const router = useRouter();

  const { user, loading } = useAuth();

  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");

  const isStudent =
    user?.role === "STUDENT" ||
    user?.role === "VERIFIED_STUDENT";

  const isCollegeAdmin = user?.role === "COLLEGE_ADMIN";
  const isModerator = user?.role === "MODERATOR";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (loading) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    fetchFeaturedProjects();
  }, [loading, user]);

  const fetchFeaturedProjects = async () => {
    try {
      setFeaturedLoading(true);
      setFeaturedError("");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/featured/showcase`
      );

      setFeaturedProjects(res.data.featuredProjects || []);
    } catch (error) {
      console.log(error);

      setFeaturedError(
        error.response?.data?.message ||
          "Failed to load featured projects."
      );
    } finally {
      setFeaturedLoading(false);
    }
  };

  const goTo = (path) => {
    router.push(path);
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return "Super Admin";
    if (isCollegeAdmin) return "College Admin";
    if (isModerator) return "Moderator";
    if (user?.role === "VERIFIED_STUDENT") return "Verified Student";
    return "Student";
  };

  const getHeroTitle = () => {
    if (isSuperAdmin) return "Command your CampusForge platform.";
    if (isCollegeAdmin) return "Manage verified students from your college.";
    if (isModerator) return "Review student approvals with controlled access.";
    return "Build, join, and showcase real student projects.";
  };

  const getHeroText = () => {
    if (isSuperAdmin) {
      return "Oversee colleges, users, verification requests, analytics, system checks, hackathons, community activity, and final MVP readiness from one secure control center.";
    }

    if (isCollegeAdmin) {
      return "Approve only your own college students, review verification documents, and keep your campus access clean and trusted.";
    }

    if (isModerator) {
      return "Assist with scoped verification workflows without full platform-level administrative access.";
    }

    return "Create project teams, manage tasks, join hackathons, explore startups, earn reputation, and publish completed work with certificates.";
  };

  const primaryActions = [];

  if (isStudent) {
    if (user?.verificationStatus !== "APPROVED") {
      primaryActions.push({
        title: "Submit Verification",
        description: "Upload your student ID and select your approved college.",
        path: "/submit-verification",
      });
    }

    primaryActions.push(
      {
        title: "Create Project",
        description: "Start a new student project and invite teammates.",
        path: "/create-project",
      },
      {
        title: "Explore Projects",
        description: "Find open projects and send join requests.",
        path: "/projects",
      },
      {
        title: "My Projects",
        description: "View projects you created or joined.",
        path: "/my-projects",
      },
      {
        title: "My Tasks",
        description: "Track assigned work and update progress.",
        path: "/my-tasks",
      },
      {
        title: "Recommended Projects",
        description: "Get project suggestions based on your skills.",
        path: "/recommendations",
      },
      {
        title: "My Analytics",
        description:
          "Track your reputation, badges, projects, hackathons, and task progress.",
        path: "/my-analytics",
      },
      {
        title: "My Activity",
        description:
          "Review your personal activity history across CampusForge.",
        path: "/my-activity",
      },
      {
        title: "Explore Hackathons",
        description: "Find hackathons and register your team.",
        path: "/hackathons",
      },
      {
        title: "My Hackathons",
        description: "Track registrations and submit hackathon projects.",
        path: "/my-hackathons",
      },
      {
        title: "Explore Startups",
        description: "Browse student startup ideas and ventures.",
        path: "/startups",
      },
      {
        title: "Create Startup",
        description: "Create a startup profile for your idea.",
        path: "/create-startup",
      }
    );
  }

  if (isCollegeAdmin) {
    primaryActions.push(
      {
        title: "Student Approvals",
        description: "Approve or reject students from your own college.",
        path: "/college-verifications",
      },
      {
        title: "Notifications",
        description: "View approval and platform updates.",
        path: "/notifications",
      },
      {
        title: "College Admin Profile",
        description: "Review your account details.",
        path: "/profile",
      }
    );
  }

  if (isModerator) {
    primaryActions.push(
      {
        title: "Student Approvals",
        description: "Review assigned verification requests.",
        path: "/college-verifications",
      },
      {
        title: "Notifications",
        description: "View moderation and approval updates.",
        path: "/notifications",
      },
      {
        title: "Moderator Profile",
        description: "Review your account details.",
        path: "/profile",
      }
    );
  }

  if (isSuperAdmin) {
    primaryActions.push(
      {
        title: "Manage Users",
        description: "View users and assign allowed platform roles.",
        path: "/admin-users",
      },
      {
        title: "Admin Verifications",
        description: "Review pending student verification requests.",
        path: "/admin-verifications",
      },
      {
        title: "All Verifications",
        description: "Review the full verification workflow.",
        path: "/verifications",
      },
      {
        title: "Manage Colleges",
        description: "Approve or reject college registrations.",
        path: "/colleges",
      },
      {
        title: "Platform Analytics",
        description: "Review platform-wide growth and usage numbers.",
        path: "/platform-analytics",
      },
      {
        title: "Create Hackathon",
        description: "Launch a new platform hackathon.",
        path: "/create-hackathon",
      },
      {
        title: "System Status",
        description: "Check backend and database health.",
        path: "/system-status",
      },
      {
        title: "Environment Status",
        description: "Check required backend environment configuration.",
        path: "/env-status",
      },
      {
        title: "MVP Checklist",
        description: "Track final readiness before launch.",
        path: "/mvp-checklist",
      }
    );
  }

  const adminLaunchpadActions = [
    {
      title: "Manage Users",
      description: "View users, roles, reputation, and verification states.",
      path: "/admin-users",
    },
    {
      title: "Admin Verifications",
      description: "Review pending student verification requests.",
      path: "/admin-verifications",
    },
    {
      title: "Manage Colleges",
      description: "Approve or reject registered colleges.",
      path: "/colleges",
    },
    {
      title: "Platform Analytics",
      description: "Track platform-wide users, projects, tasks, and growth.",
      path: "/platform-analytics",
    },
    {
      title: "System Status",
      description: "Check backend and database health.",
      path: "/system-status",
    },
    {
      title: "Environment Status",
      description: "Confirm required backend environment variables.",
      path: "/env-status",
    },
    {
      title: "Create Hackathon",
      description: "Create a platform hackathon for students.",
      path: "/create-hackathon",
    },
    {
      title: "MVP Checklist",
      description: "Review launch readiness before deployment.",
      path: "/mvp-checklist",
    },
  ];

  const showcaseActions = [
    {
      title: "Completed Projects",
      description: "Browse completed public student projects.",
      path: "/completed-projects",
    },
    {
      title: "Featured Projects",
      description: "See top selected completed projects.",
      path: "/featured-projects",
    },
    {
      title: "Most Liked Projects",
      description: "Explore projects with the strongest community response.",
      path: "/most-liked-projects",
    },
    {
      title: "Verify Certificate",
      description: "Validate a project certificate ID.",
      path: "/certificate-verify",
    },
  ];

  const communityActions = [
    {
      title: "Activity Feed",
      description: "See platform-wide collaboration activity.",
      path: "/activity-feed",
    },
    {
      title: "Leaderboard",
      description: "View top students ranked by reputation and contribution.",
      path: "/leaderboard",
    },
  ];

  if (isStudent) {
    communityActions.push(
      {
        title: "My Activity",
        description: "Review your own CampusForge activity history.",
        path: "/my-activity",
      },
      {
        title: "My Analytics",
        description: "Track your personal CampusForge performance.",
        path: "/my-analytics",
      }
    );
  }

  const permissions = [];

  if (isStudent) {
    permissions.push(
      "Create and join student projects",
      "Send join requests and accept project invites",
      "Manage project tasks and teammate collaboration",
      "Join hackathons and submit project links",
      "Create and browse student startup profiles",
      "View personal analytics and activity history",
      "Chat with project teammates",
      "Upload profile photo and resume",
      "Like and review completed public projects",
      "Earn reputation and badges through completed work"
    );
  }

  if (isCollegeAdmin) {
    permissions.push(
      "View pending student verification requests for your own college",
      "Approve valid students from your own college",
      "Reject invalid student verification requests",
      "Receive notifications for approval activity",
      "Cannot manage platform users",
      "Cannot assign moderators",
      "Cannot approve or reject colleges",
      "Cannot access platform analytics or environment status"
    );
  }

  if (isModerator) {
    permissions.push(
      "Assist with scoped student verification review",
      "Access student approval workflow if assigned",
      "Cannot manage platform users",
      "Cannot approve colleges",
      "Cannot access platform analytics or environment status"
    );
  }

  if (isSuperAdmin) {
    permissions.push(
      "Manage users and platform roles",
      "Approve or reject college registrations",
      "View all student verification requests",
      "Review admin verification queue",
      "Create platform hackathons",
      "Feature completed public projects",
      "Access platform analytics",
      "Check system and environment status",
      "Run the MVP checklist before launch"
    );
  }

  const sectionStyle = {
    display: "block",
    width: "100%",
    marginTop: "28px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  };

  if (loading) {
    return (
      <div className="cf-dashboard-shell">
        <div className="cf-loading-card">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cf-dashboard-shell">
        <div className="cf-loading-card">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="cf-dashboard-shell">
      <section className="cf-dashboard-hero">
        <div>
          <div className="cf-kicker">CampusForge Control Center</div>

          <h1>{getHeroTitle()}</h1>

          <p>{getHeroText()}</p>

          <div className="cf-hero-actions">
            {primaryActions.slice(0, 2).map((action) => (
              <button
                key={action.path}
                className="cf-btn-gold"
                onClick={() => goTo(action.path)}
              >
                {action.title}
              </button>
            ))}

            <button
              className="cf-btn-ghost"
              onClick={() => goTo("/notifications")}
            >
              Notifications
            </button>
          </div>
        </div>

        <div className="cf-identity-card">
          <div className="cf-profile-orb">
            {user?.fullName
              ? user.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "CF"}
          </div>

          <h2>{user?.fullName || "User"}</h2>

          <p>{user?.email || "N/A"}</p>

          <div className="cf-profile-meta">
            <span className="cf-badge-dark">{getRoleLabel()}</span>

            {isStudent && (
              <span className="cf-badge">
                {user?.verificationStatus || "NOT_SUBMITTED"}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="cf-stats-grid">
        <div className="cf-stat-card">
          <span>Role</span>
          <strong>{getRoleLabel()}</strong>
          <p>Your current access level.</p>
        </div>

        {isStudent && (
          <>
            <div className="cf-stat-card">
              <span>Verification</span>
              <strong>{user?.verificationStatus || "N/A"}</strong>
              <p>Student trust status.</p>
            </div>

            <div className="cf-stat-card">
              <span>Reputation</span>
              <strong>{user?.reputationScore || 0}</strong>
              <p>Earned through project work.</p>
            </div>
          </>
        )}

        {isSuperAdmin && (
          <>
            <div className="cf-stat-card">
              <span>Control</span>
              <strong>Platform</strong>
              <p>Full admin access.</p>
            </div>

            <div className="cf-stat-card">
              <span>Readiness</span>
              <strong>MVP v1</strong>
              <p>Strong MVP completed.</p>
            </div>
          </>
        )}

        {(isCollegeAdmin || isModerator) && (
          <>
            <div className="cf-stat-card">
              <span>Scope</span>
              <strong>College</strong>
              <p>Student approval workflow.</p>
            </div>

            <div className="cf-stat-card">
              <span>Access</span>
              <strong>Limited</strong>
              <p>No platform admin rights.</p>
            </div>
          </>
        )}
      </section>

      {isSuperAdmin && (
        <section className="cf-section" style={sectionStyle}>
          <div className="cf-section-heading">
            <div>
              <div className="cf-kicker">Admin Launchpad</div>
              <h2>Super Admin control shortcuts</h2>
            </div>
          </div>

          <div className="cf-action-grid" style={gridStyle}>
            {adminLaunchpadActions.map((action) => (
              <button
                key={action.path}
                className="cf-action-card"
                onClick={() => goTo(action.path)}
              >
                <span>{action.title}</span>
                <p>{action.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="cf-section" style={sectionStyle}>
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Quick Actions</div>
            <h2>{getRoleLabel()} Workspace</h2>
          </div>
        </div>

        <div className="cf-action-grid" style={gridStyle}>
          {primaryActions.length === 0 ? (
            <div className="cf-empty-state">
              <h3>No quick actions available</h3>
              <p>No dashboard actions are configured for this role.</p>
            </div>
          ) : (
            primaryActions.map((action) => (
              <button
                key={action.path}
                className="cf-action-card"
                onClick={() => goTo(action.path)}
              >
                <span>{action.title}</span>
                <p>{action.description}</p>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="cf-section" style={sectionStyle}>
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Public Showcase</div>
            <h2>Explore verified project outcomes</h2>
          </div>
        </div>

        <div className="cf-action-grid" style={gridStyle}>
          {showcaseActions.map((action) => (
            <button
              key={action.path}
              className="cf-action-card cf-action-card-light"
              onClick={() => goTo(action.path)}
            >
              <span>{action.title}</span>
              <p>{action.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="cf-section" style={sectionStyle}>
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Community</div>
            <h2>CampusForge activity and rankings</h2>
          </div>
        </div>

        <div className="cf-action-grid" style={gridStyle}>
          {communityActions.map((action) => (
            <button
              key={action.path}
              className="cf-action-card cf-action-card-light"
              onClick={() => goTo(action.path)}
            >
              <span>{action.title}</span>
              <p>{action.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="cf-section" style={sectionStyle}>
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Featured Work</div>
            <h2>Featured completed projects</h2>
          </div>

          <button className="cf-btn-ghost" onClick={fetchFeaturedProjects}>
            Refresh
          </button>
        </div>

        {featuredLoading ? (
          <div className="cf-empty-state">Loading featured projects...</div>
        ) : featuredError ? (
          <div className="cf-error-state">{featuredError}</div>
        ) : featuredProjects.length === 0 ? (
          <div className="cf-empty-state">
            <h3>No featured projects yet</h3>

            <p>
              Featured completed projects will appear here after Super Admin
              marks completed showcases as featured.
            </p>

            <button onClick={() => goTo("/completed-projects")}>
              View Completed Projects
            </button>
          </div>
        ) : (
          <div className="cf-project-grid">
            {featuredProjects.map((item) => {
              const project = item.project;

              if (!project) return null;

              return (
                <article key={project._id} className="cf-project-card">
                  <div className="cf-project-card-top">
                    <span className="cf-badge">Featured</span>

                    <span className="cf-badge-muted">
                      {item.progress || 0}% Complete
                    </span>
                  </div>

                  <h3>{project.title}</h3>

                  <p>{project.description || "No description available."}</p>

                  <div className="cf-project-meta">
                    <span>
                      <strong>Domain:</strong> {project.domain || "N/A"}
                    </span>

                    <span>
                      <strong>Owner:</strong>{" "}
                      {project.ownerId?.fullName || "Unknown"}
                    </span>

                    <span>
                      <strong>Certificate:</strong>{" "}
                      {item.certificateId || "N/A"}
                    </span>
                  </div>

                  <div className="cf-card-actions">
                    <button
                      onClick={() =>
                        goTo(`/completed-projects/${project._id}`)
                      }
                    >
                      View Showcase
                    </button>

                    <button
                      className="cf-btn-ghost-dark"
                      onClick={() =>
                        goTo(
                          `/certificate-verify?certificateId=${item.certificateId}`
                        )
                      }
                    >
                      Verify Certificate
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="cf-section" style={sectionStyle}>
        <div className="cf-section-heading">
          <div>
            <div className="cf-kicker">Access Rules</div>
            <h2>{getRoleLabel()} permissions</h2>
          </div>
        </div>

        <div className="cf-permission-card">
          {permissions.map((item) => (
            <div key={item} className="cf-permission-item">
              <span>◆</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
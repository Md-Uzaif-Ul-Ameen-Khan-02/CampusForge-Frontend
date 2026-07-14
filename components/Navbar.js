import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const navRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  const isStudent =
    user?.role === "STUDENT" ||
    user?.role === "VERIFIED_STUDENT";

  const isCollegeAdmin = user?.role === "COLLEGE_ADMIN";
  const isModerator = user?.role === "MODERATOR";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const canApproveStudents =
    isSuperAdmin || isCollegeAdmin || isModerator;

  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }

    setUnreadCount(0);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
        setNavOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!token) {
        setUnreadCount(0);
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const goTo = (path) => {
    setOpenMenu(null);
    setNavOpen(false);
    router.push(path);
  };

  const toggleMenu = (menuName) => {
    setOpenMenu((currentMenu) =>
      currentMenu === menuName ? null : menuName
    );
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return router.pathname === "/dashboard";
    }

    return router.pathname.startsWith(path);
  };

  const navButtonClass = (path) => {
    return isActive(path)
      ? "cf-nav-btn cf-nav-btn-active"
      : "cf-nav-btn";
  };

  const menuButtonClass = (paths, menuName) => {
    const active =
      paths.some((path) => isActive(path)) ||
      openMenu === menuName;

    return active
      ? "cf-nav-btn cf-nav-btn-active cf-menu-trigger"
      : "cf-nav-btn cf-menu-trigger";
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }

    setUnreadCount(0);
    setOpenMenu(null);
    setNavOpen(false);

    router.push("/login");
  };

  return (
    <nav className="cf-navbar" ref={navRef}>
      <div className="cf-navbar-inner">
        <div
          className="cf-brand"
          onClick={() => goTo(user ? "/dashboard" : "/login")}
        >
          <div className="cf-brand-mark">
            <span className="cf-brand-mark-main">CF</span>
            <span className="cf-brand-spark">◆</span>
          </div>

          <div className="cf-brand-text">
            <span className="cf-brand-name">CampusForge</span>
            <span className="cf-brand-subtitle">
              Verified campus collaboration
            </span>
          </div>
        </div>

        <button
          type="button"
          className="cf-nav-toggle"
          aria-expanded={navOpen}
          aria-label="Toggle navigation"
          onClick={() => setNavOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={
            navOpen ? "cf-nav-actions cf-nav-actions-open" : "cf-nav-actions"
          }
        >
          {!user && (
            <>
              <button
                className={navButtonClass("/login")}
                onClick={() => goTo("/login")}
              >
                Login
              </button>

              <button
                className="cf-nav-btn cf-nav-btn-primary"
                onClick={() => goTo("/register")}
              >
                Register
              </button>
            </>
          )}

          {user && (
            <>
              <button
                className={navButtonClass("/dashboard")}
                onClick={() => goTo("/dashboard")}
              >
                Dashboard
              </button>

              <button
                className={navButtonClass("/profile")}
                onClick={() => goTo("/profile")}
              >
                Profile
              </button>

              {isStudent && (
                <div className="cf-nav-menu">
                  <button
                    type="button"
                    className={menuButtonClass(
                      [
                        "/submit-verification",
                        "/projects",
                        "/recommendations",
                        "/my-projects",
                        "/my-tasks",
                        "/my-join-requests",
                        "/my-invites",
                        "/my-liked-projects",
                        "/my-activity",
                        "/my-analytics",
                        "/hackathons",
                        "/my-hackathons",
                        "/startups",
                      ],
                      "student"
                    )}
                    onClick={() => toggleMenu("student")}
                  >
                    Student
                    <span className="cf-menu-arrow">
                      {openMenu === "student" ? "▴" : "▾"}
                    </span>
                  </button>

                  {openMenu === "student" && (
                    <div className="cf-dropdown">
                      <button onClick={() => goTo("/submit-verification")}>
                        Submit Verification
                      </button>

                      <button onClick={() => goTo("/projects")}>
                        Explore Projects
                      </button>

                      <button onClick={() => goTo("/recommendations")}>
                        Recommended Projects
                      </button>

                      <button onClick={() => goTo("/my-projects")}>
                        My Projects
                      </button>

                      <button onClick={() => goTo("/my-tasks")}>
                        My Tasks
                      </button>

                      <button onClick={() => goTo("/my-join-requests")}>
                        My Join Requests
                      </button>

                      <button onClick={() => goTo("/my-invites")}>
                        My Invites
                      </button>

                      <button onClick={() => goTo("/my-liked-projects")}>
                        My Liked Projects
                      </button>

                      <button onClick={() => goTo("/my-activity")}>
                        My Activity
                      </button>

                      <button onClick={() => goTo("/my-analytics")}>
                        My Analytics
                      </button>

                      <button onClick={() => goTo("/hackathons")}>
                        Hackathons
                      </button>

                      <button onClick={() => goTo("/my-hackathons")}>
                        My Hackathons
                      </button>

                      <button onClick={() => goTo("/startups")}>
                        Startups
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="cf-nav-menu">
                <button
                  type="button"
                  className={menuButtonClass(
                    [
                      "/completed-projects",
                      "/featured-projects",
                      "/most-liked-projects",
                      "/certificate-verify",
                    ],
                    "showcase"
                  )}
                  onClick={() => toggleMenu("showcase")}
                >
                  Showcase
                  <span className="cf-menu-arrow">
                    {openMenu === "showcase" ? "▴" : "▾"}
                  </span>
                </button>

                {openMenu === "showcase" && (
                  <div className="cf-dropdown">
                    <button onClick={() => goTo("/completed-projects")}>
                      Completed Projects
                    </button>

                    <button onClick={() => goTo("/featured-projects")}>
                      Featured Projects
                    </button>

                    <button onClick={() => goTo("/most-liked-projects")}>
                      Most Liked Projects
                    </button>

                    <button onClick={() => goTo("/certificate-verify")}>
                      Verify Certificate
                    </button>
                  </div>
                )}
              </div>

              <div className="cf-nav-menu">
                <button
                  type="button"
                  className={menuButtonClass(
                    [
                      "/activity-feed",
                      "/leaderboard",
                      "/my-activity",
                      "/my-analytics",
                    ],
                    "community"
                  )}
                  onClick={() => toggleMenu("community")}
                >
                  Community
                  <span className="cf-menu-arrow">
                    {openMenu === "community" ? "▴" : "▾"}
                  </span>
                </button>

                {openMenu === "community" && (
                  <div className="cf-dropdown">
                    <button onClick={() => goTo("/activity-feed")}>
                      Activity Feed
                    </button>

                    <button onClick={() => goTo("/leaderboard")}>
                      Leaderboard
                    </button>

                    {isStudent && (
                      <>
                        <button onClick={() => goTo("/my-activity")}>
                          My Activity
                        </button>

                        <button onClick={() => goTo("/my-analytics")}>
                          My Analytics
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {canApproveStudents && (
                <button
                  className={navButtonClass("/college-verifications")}
                  onClick={() => goTo("/college-verifications")}
                >
                  Student Approvals
                </button>
              )}

              {isSuperAdmin && (
                <div className="cf-nav-menu">
                  <button
                    type="button"
                    className={menuButtonClass(
                      [
                        "/verifications",
                        "/admin-verifications",
                        "/admin-users",
                        "/platform-analytics",
                        "/colleges",
                        "/system-status",
                        "/env-status",
                        "/mvp-checklist",
                        "/create-hackathon",
                      ],
                      "admin"
                    )}
                    onClick={() => toggleMenu("admin")}
                  >
                    Admin
                    <span className="cf-menu-arrow">
                      {openMenu === "admin" ? "▴" : "▾"}
                    </span>
                  </button>

                  {openMenu === "admin" && (
                    <div className="cf-dropdown cf-dropdown-right">
                      <button onClick={() => goTo("/verifications")}>
                        All Verifications
                      </button>

                      <button onClick={() => goTo("/admin-verifications")}>
                        Admin Verifications
                      </button>

                      <button onClick={() => goTo("/admin-users")}>
                        Manage Users
                      </button>

                      <button onClick={() => goTo("/platform-analytics")}>
                        Platform Analytics
                      </button>

                      <button onClick={() => goTo("/colleges")}>
                        Colleges
                      </button>

                      <button onClick={() => goTo("/system-status")}>
                        System Status
                      </button>

                      <button onClick={() => goTo("/env-status")}>
                        Environment Status
                      </button>

                      <button onClick={() => goTo("/mvp-checklist")}>
                        MVP Checklist
                      </button>

                      <button onClick={() => goTo("/create-hackathon")}>
                        Create Hackathon
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                className={navButtonClass("/notifications")}
                onClick={() => goTo("/notifications")}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="cf-notification-pill">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                className="cf-nav-btn cf-nav-btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState("");
  const [portfolioBio, setPortfolioBio] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [twitter, setTwitter] = useState("");

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchProfile = async () => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentUser = res.data.user;

      setUser(currentUser);
      setFullName(currentUser.fullName || "");
      setPortfolioBio(currentUser.portfolioBio || "");
      setGithubUsername(currentUser.githubUsername || "");

      setSkills(
        Array.isArray(currentUser.skills)
          ? currentUser.skills.join(", ")
          : ""
      );

      setLinkedin(currentUser.socialLinks?.linkedin || "");
      setPortfolio(currentUser.socialLinks?.portfolio || "");
      setTwitter(currentUser.socialLinks?.twitter || "");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const isStudent =
        user?.role === "STUDENT" || user?.role === "VERIFIED_STUDENT";

      let payload = {
        fullName,
      };

      if (isStudent) {
        payload = {
          fullName,
          portfolioBio,
          githubUsername,
          skills,
          socialLinks: {
            linkedin,
            portfolio,
            twitter,
          },
        };
      }

      const res = await axios.put(
        "http://localhost:5000/api/profile/update",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data.user);

      alert("Profile updated successfully");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Profile update failed");
    }
  };

  const uploadProfilePhoto = async (e) => {
    e.preventDefault();

    try {
      if (!profilePhoto) {
        alert("Please select a profile photo");
        return;
      }

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("image", profilePhoto);

      await axios.post(
        "http://localhost:5000/api/upload/profile-photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile photo uploaded successfully");

      setProfilePhoto(null);

      fetchProfile();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Profile photo upload failed");
    }
  };

  const uploadResume = async (e) => {
    e.preventDefault();

    try {
      if (!resume) {
        alert("Please select a resume file");
        return;
      }

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("resume", resume);

      await axios.post("http://localhost:5000/api/upload/resume", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Resume uploaded successfully");

      setResume(null);

      fetchProfile();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Resume upload failed");
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading profile...</div>
      </div>
    );
  }

  const isStudent =
    user?.role === "STUDENT" || user?.role === "VERIFIED_STUDENT";

  const isCollegeAdmin = user?.role === "COLLEGE_ADMIN";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isModerator = user?.role === "MODERATOR";

  const profileInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CF";

  const roleLabel = isSuperAdmin
    ? "Super Admin"
    : isCollegeAdmin
    ? "College Admin"
    : isModerator
    ? "Moderator"
    : user?.role === "VERIFIED_STUDENT"
    ? "Verified Student"
    : "Student";

  return (
    <div className="cf-page-shell">
      <section className="cf-profile-hero">
        <div className="cf-profile-identity">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt="Profile"
              className="cf-profile-photo"
            />
          ) : (
            <div className="cf-profile-photo-fallback">{profileInitials}</div>
          )}

          <div>
            <div className="cf-kicker">Verified Identity</div>

            <h1>{user?.fullName || "My Profile"}</h1>

            <p>{user?.email || "No email available"}</p>

            <div className="cf-detail-badges">
              <span className="cf-badge-dark">{roleLabel}</span>

              {isStudent && (
                <span className="cf-badge">
                  {user?.verificationStatus || "NOT_SUBMITTED"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>

          {isStudent && user?.verificationStatus !== "APPROVED" && (
            <button
              className="cf-btn-gold"
              onClick={() => router.push("/submit-verification")}
            >
              Submit Verification
            </button>
          )}
        </div>
      </section>

      <section className="cf-profile-grid">
        <div className="cf-profile-main">
          {isStudent && (
            <section className="cf-section">
              <div className="cf-section-heading">
                <div>
                  <div className="cf-kicker">Student Profile</div>
                  <h2>Academic and portfolio details</h2>
                </div>
              </div>

              <div className="cf-profile-stat-grid">
                <div>
                  <span>Verification</span>
                  <strong>{user?.verificationStatus || "N/A"}</strong>
                </div>

                <div>
                  <span>College</span>
                  <strong>
                    {user?.collegeId?.collegeName ||
                      user?.collegeId?._id ||
                      user?.collegeId ||
                      "Not linked"}
                  </strong>
                </div>

                <div>
                  <span>Reputation</span>
                  <strong>{user?.reputationScore || 0}</strong>
                </div>

                <div>
                  <span>Tasks Completed</span>
                  <strong>{user?.tasksCompleted || 0}</strong>
                </div>

                <div>
                  <span>Completed Projects</span>
                  <strong>{user?.completedProjects || 0}</strong>
                </div>

                <div>
                  <span>Hackathons</span>
                  <strong>{user?.hackathonsParticipated || 0}</strong>
                </div>
              </div>

              <div className="cf-profile-info-block">
                <h3>Skills</h3>

                <div className="cf-tech-stack">
                  {user?.skills?.length ? (
                    user.skills.map((skill) => <span key={skill}>{skill}</span>)
                  ) : (
                    <span>No skills added</span>
                  )}
                </div>
              </div>

              <div className="cf-profile-info-block">
                <h3>Portfolio</h3>

                <p>
                  <strong>GitHub:</strong>{" "}
                  {user?.githubUsername || "Not added"}
                </p>

                <p>
                  <strong>Bio:</strong> {user?.portfolioBio || "Not added"}
                </p>

                {user?.resumeUrl && (
                  <p>
                    <strong>Resume:</strong>{" "}
                    <a
                      href={user.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cf-inline-link"
                    >
                      View Resume
                    </a>
                  </p>
                )}
              </div>
            </section>
          )}

          {isCollegeAdmin && (
            <section className="cf-section">
              <div className="cf-kicker">College Admin Profile</div>
              <h2>Student verification management</h2>

              <div className="cf-profile-stat-grid">
                <div>
                  <span>Name</span>
                  <strong>{user?.fullName}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{user?.email}</strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>COLLEGE_ADMIN</strong>
                </div>

                <div>
                  <span>Linked College</span>
                  <strong>
                    {user?.collegeId?.collegeName ||
                      user?.collegeId?._id ||
                      user?.collegeId ||
                      "Not linked"}
                  </strong>
                </div>
              </div>

              <p>
                This account manages student verification requests for its own
                college only. It cannot approve other colleges or manage
                platform-level admin features.
              </p>

              <button onClick={() => router.push("/college-verifications")}>
                Manage Student Approvals
              </button>
            </section>
          )}

          {isModerator && (
            <section className="cf-section">
              <div className="cf-kicker">Moderator Profile</div>
              <h2>Scoped review access</h2>

              <div className="cf-profile-stat-grid">
                <div>
                  <span>Name</span>
                  <strong>{user?.fullName}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{user?.email}</strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>MODERATOR</strong>
                </div>

                <div>
                  <span>Assigned College</span>
                  <strong>
                    {user?.collegeId?.collegeName ||
                      user?.collegeId?._id ||
                      user?.collegeId ||
                      "Not linked"}
                  </strong>
                </div>
              </div>

              <button onClick={() => router.push("/college-verifications")}>
                Student Approvals
              </button>
            </section>
          )}

          {isSuperAdmin && (
            <section className="cf-section">
              <div className="cf-kicker">Super Admin Profile</div>
              <h2>Platform-level access</h2>

              <div className="cf-profile-stat-grid">
                <div>
                  <span>Name</span>
                  <strong>{user?.fullName}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{user?.email}</strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>SUPER_ADMIN</strong>
                </div>
              </div>

              <p>This account has platform-level administrative access.</p>

              <div className="cf-card-actions">
                <button onClick={() => router.push("/admin-users")}>
                  Manage Users
                </button>

                <button
                  className="cf-btn-ghost-dark"
                  onClick={() => router.push("/colleges")}
                >
                  Manage Colleges
                </button>

                <button
                  className="cf-btn-ghost-dark"
                  onClick={() => router.push("/platform-analytics")}
                >
                  Platform Analytics
                </button>
              </div>
            </section>
          )}

          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Profile Settings</div>

                <h2>
                  {isStudent
                    ? "Update student profile"
                    : "Update basic profile"}
                </h2>
              </div>
            </div>

            <form className="cf-pro-form-compact" onSubmit={updateProfile}>
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              {isStudent && (
                <>
                  <label>Portfolio Bio</label>

                  <textarea
                    placeholder="Write a short professional bio"
                    value={portfolioBio}
                    onChange={(e) => setPortfolioBio(e.target.value)}
                  />

                  <label>GitHub Username</label>

                  <input
                    type="text"
                    placeholder="GitHub Username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                  />

                  <label>Skills</label>

                  <input
                    type="text"
                    placeholder="React, Node, MongoDB"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />

                  <label>LinkedIn URL</label>

                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />

                  <label>Portfolio URL</label>

                  <input
                    type="text"
                    placeholder="Portfolio URL"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                  />

                  <label>Twitter URL</label>

                  <input
                    type="text"
                    placeholder="Twitter URL"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </>
              )}

              <button type="submit">Update Profile</button>
            </form>
          </section>
        </div>

        <aside className="cf-profile-side">
          <section className="cf-upload-card">
            <div className="cf-kicker">Profile Photo</div>

            <h2>Upload photo</h2>

            <form onSubmit={uploadProfilePhoto}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePhoto(e.target.files[0])}
              />

              <button type="submit">Upload Photo</button>
            </form>
          </section>

          {isStudent && (
            <section className="cf-upload-card">
              <div className="cf-kicker">Resume</div>

              <h2>Upload resume</h2>

              <form onSubmit={uploadResume}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                />

                <button type="submit">Upload Resume</button>
              </form>
            </section>
          )}
        </aside>
      </section>
    </div>
  );
}
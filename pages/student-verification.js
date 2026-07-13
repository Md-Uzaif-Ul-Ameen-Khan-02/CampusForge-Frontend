import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function StudentVerificationPage() {
  const router = useRouter();

  const [collegeId, setCollegeId] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [course, setCourse] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [idCard, setIdCard] = useState(null);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const submitVerification = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      if (!idCard) {
        alert("Please upload your student ID card");
        return;
      }

      const formData = new FormData();

      formData.append("collegeId", collegeId);
      formData.append("studentIdNumber", studentIdNumber);
      formData.append("course", course);
      formData.append("currentYear", currentYear);
      formData.append("idCard", idCard);

      await axios.post(
        "http://localhost:5000/api/verifications/submit",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Verification submitted successfully");

      router.push("/profile");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Verification submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-verification-hero">
        <div>
          <div className="cf-kicker">Manual Verification</div>

          <h1>Student Verification</h1>

          <p>
            Submit your college ID, student details, and ID card. Use this page
            only when you already know the approved MongoDB college ID.
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
            onClick={() => router.push("/submit-verification")}
          >
            Search College Instead
          </button>
        </div>
      </section>

      <section className="cf-form-layout">
        <form className="cf-pro-form" onSubmit={submitVerification}>
          <div className="cf-form-section">
            <h2>College Details</h2>

            <p>
              This manual page requires the exact college ID from MongoDB. For
              normal student flow, use Submit Verification.
            </p>

            <label>College ID</label>

            <input
              type="text"
              placeholder="College ID from MongoDB"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              required
            />
          </div>

          <div className="cf-form-section">
            <h2>Student Details</h2>

            <label>Student ID Number</label>

            <input
              type="text"
              placeholder="Student ID Number"
              value={studentIdNumber}
              onChange={(e) => setStudentIdNumber(e.target.value)}
              required
            />

            <label>Course</label>

            <input
              type="text"
              placeholder="Course, e.g. B.Tech CSE"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            />

            <label>Current Year</label>

            <input
              type="text"
              placeholder="Current Year, e.g. 3rd Year"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              required
            />

            <label>Upload Student ID Card</label>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdCard(e.target.files[0])}
              required
            />
          </div>

          <div className="cf-form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Verification"}
            </button>

            <button
              type="button"
              className="cf-btn-ghost-dark"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Recommendation</div>

          <h2>Use the safer flow</h2>

          <ul>
            <li>This page requires manual college ID input.</li>
            <li>The improved page lets students search approved colleges.</li>
            <li>Normal users should use Submit Verification.</li>
            <li>This page is useful for testing or admin-assisted flows.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
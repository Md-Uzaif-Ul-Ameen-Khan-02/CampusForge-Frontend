import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function RegisterStudentPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/auth/register", {
        fullName,
        email,
        password,
      });

      alert("Student registration successful. Please login.");

      router.push("/login");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Student registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-auth-shell">
      <section className="cf-auth-panel">
        <div className="cf-auth-brand">
          <div className="cf-brand-mark cf-auth-mark">
            <span className="cf-brand-mark-main">CF</span>
            <span className="cf-brand-spark">◆</span>
          </div>

          <div>
            <div className="cf-kicker">Student Registration</div>
            <h1>Start building with verified peers</h1>
            <p>
              Create your student account first. After login, submit your
              college verification to unlock trusted collaboration features.
            </p>
          </div>
        </div>

        <div className="cf-auth-highlights">
          <div>
            <strong>Step 1</strong>
            <span>Create student account.</span>
          </div>

          <div>
            <strong>Step 2</strong>
            <span>Submit student verification.</span>
          </div>

          <div>
            <strong>Step 3</strong>
            <span>Build and showcase projects.</span>
          </div>
        </div>
      </section>

      <section className="cf-auth-card">
        <div className="cf-auth-card-header">
          <div>
            <div className="cf-kicker">Create Student Account</div>
            <h2>Register as Student</h2>
          </div>

          <span className="cf-badge">Student</span>
        </div>

        <form onSubmit={registerUser} className="cf-smart-form">
          <div className="cf-form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="cf-form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="cf-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Register Student"}
          </button>
        </form>

        <div className="cf-auth-footer-actions">
          <button
            type="button"
            className="cf-btn-ghost-dark"
            onClick={() => router.push("/register")}
          >
            Back
          </button>

          <button
            type="button"
            className="cf-btn-ghost-dark"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </div>
      </section>
    </div>
  );
}
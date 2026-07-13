import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      login({
        user: res.data.user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });

      alert("Login Successful");

      router.push("/dashboard");
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Login Failed");
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
            <div className="cf-kicker">CampusForge Access</div>
            <h1>Welcome back</h1>
            <p>
              Login to continue building projects, managing teams, tracking
              tasks, and accessing your verified student workspace.
            </p>
          </div>
        </div>

        <div className="cf-auth-highlights">
          <div>
            <strong>Verified Students</strong>
            <span>Collaborate with trusted campus profiles.</span>
          </div>

          <div>
            <strong>Project Teams</strong>
            <span>Create, join, invite, and manage real teams.</span>
          </div>

          <div>
            <strong>Showcase Ready</strong>
            <span>Publish completed work with certificates.</span>
          </div>
        </div>
      </section>

      <section className="cf-auth-card">
        <div className="cf-auth-card-header">
          <div>
            <div className="cf-kicker">Secure Login</div>
            <h2>Sign in to CampusForge</h2>
          </div>

          <span className="cf-badge-dark">Protected</span>
        </div>

        <form onSubmit={loginUser} className="cf-smart-form">
          <div className="cf-form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your login email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="cf-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="cf-auth-divider">
          <span>New to CampusForge?</span>
        </div>

        <button
          type="button"
          className="cf-btn-ghost-dark cf-auth-wide-btn"
          onClick={() => router.push("/register")}
        >
          Create New Account
        </button>
      </section>
    </div>
  );
}
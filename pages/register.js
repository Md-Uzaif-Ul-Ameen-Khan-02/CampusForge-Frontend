import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="cf-auth-shell">
      <section className="cf-auth-panel">
        <div className="cf-auth-brand">
          <div className="cf-brand-mark cf-auth-mark">
            <span className="cf-brand-mark-main">CF</span>
            <span className="cf-brand-spark">◆</span>
          </div>

          <div>
            <div className="cf-kicker">Join CampusForge</div>
            <h1>Choose your account type</h1>
            <p>
              CampusForge separates student collaboration from college approval
              workflows, so every account starts with the correct access level.
            </p>
          </div>
        </div>

        <div className="cf-auth-highlights">
          <div>
            <strong>Students</strong>
            <span>Create projects, join teams, and build reputation.</span>
          </div>

          <div>
            <strong>Colleges</strong>
            <span>Register institutions for Super Admin approval.</span>
          </div>

          <div>
            <strong>Trust Layer</strong>
            <span>Verification keeps the platform student-focused.</span>
          </div>
        </div>
      </section>

      <section className="cf-auth-card cf-register-choice-card">
        <div className="cf-auth-card-header">
          <div>
            <div className="cf-kicker">Account Setup</div>
            <h2>Register on CampusForge</h2>
          </div>

          <span className="cf-badge">New Account</span>
        </div>

        <div className="cf-choice-grid">
          <button
            className="cf-choice-card"
            onClick={() => router.push("/register-student")}
          >
            <span>Student Account</span>
            <p>
              For students who want to create projects, join teams, manage
              tasks, participate in hackathons, and showcase work.
            </p>
          </button>

          <button
            className="cf-choice-card cf-choice-card-dark"
            onClick={() => router.push("/register-college")}
          >
            <span>College / Mentor Account</span>
            <p>
              For college-side registration that must be approved by Super
              Admin before student approvals begin.
            </p>
          </button>
        </div>

        <div className="cf-auth-divider">
          <span>Already registered?</span>
        </div>

        <button
          type="button"
          className="cf-btn-ghost-dark cf-auth-wide-btn"
          onClick={() => router.push("/login")}
        >
          Login
        </button>
      </section>
    </div>
  );
}
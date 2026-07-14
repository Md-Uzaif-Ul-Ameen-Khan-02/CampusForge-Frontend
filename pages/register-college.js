import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function RegisterCollegePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [collegeName, setCollegeName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [accreditationDetails, setAccreditationDetails] = useState("");

  const [loading, setLoading] = useState(false);

  const registerCollege = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}
/api/auth/register-college`, {
        fullName,
        email,
        password,
        collegeName,
        officialEmail,
        domain,
        accreditationDetails,
      });

      alert(
        "College registration submitted successfully. Wait for Super Admin approval."
      );

      router.push("/login");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "College registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-auth-shell cf-auth-shell-wide">
      <section className="cf-auth-panel">
        <div className="cf-auth-brand">
          <div className="cf-brand-mark cf-auth-mark">
            <span className="cf-brand-mark-main">CF</span>
            <span className="cf-brand-spark">◆</span>
          </div>

          <div>
            <div className="cf-kicker">College Registration</div>
            <h1>Request institution access</h1>
            <p>
              College accounts are reviewed by Super Admin. Once approved,
              college admins can approve students only from their own college.
            </p>
          </div>
        </div>

        <div className="cf-auth-highlights">
          <div>
            <strong>Institution First</strong>
            <span>College must be approved before student approval flow.</span>
          </div>

          <div>
            <strong>Limited Scope</strong>
            <span>College admins cannot approve other colleges.</span>
          </div>

          <div>
            <strong>Trust Workflow</strong>
            <span>Students become verified after college approval.</span>
          </div>
        </div>
      </section>

      <section className="cf-auth-card cf-auth-card-wide">
        <div className="cf-auth-card-header">
          <div>
            <div className="cf-kicker">College / Mentor Account</div>
            <h2>Register as College / Mentor</h2>
          </div>

          <span className="cf-badge-dark">Admin Review</span>
        </div>

        <form onSubmit={registerCollege} className="cf-smart-form">
          <div className="cf-subsection-title">
            <span>01</span>
            <h3>Mentor Account Details</h3>
          </div>

          <div className="cf-form-grid">
            <div className="cf-form-group">
              <label>Mentor Full Name</label>
              <input
                type="text"
                placeholder="Enter mentor full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-group">
              <label>Mentor Login Email</label>
              <input
                type="email"
                placeholder="Enter login email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
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

          <div className="cf-subsection-title">
            <span>02</span>
            <h3>College Details</h3>
          </div>

          <div className="cf-form-grid">
            <div className="cf-form-group">
              <label>College Name</label>
              <input
                type="text"
                placeholder="Enter college name"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>

            <div className="cf-form-group">
              <label>Official College Email</label>
              <input
                type="email"
                placeholder="Enter official college email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="cf-form-group">
            <label>College Domain</label>
            <input
              type="text"
              placeholder="e.g. pes.edu"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>

          <div className="cf-form-group">
            <label>Accreditation Details</label>
            <textarea
              placeholder="Add accreditation details, official recognition, or verification notes."
              value={accreditationDetails}
              onChange={(e) => setAccreditationDetails(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit College Registration"}
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
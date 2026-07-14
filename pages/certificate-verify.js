import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function CertificateVerifyPage() {
  const router = useRouter();

  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryCertificateId = router.query.certificateId;

    if (queryCertificateId) {
      setCertificateId(queryCertificateId);
      verifyCertificateFromQuery(queryCertificateId);
    }
  }, [router.query.certificateId]);

  const verifyCertificateFromQuery = async (idToVerify) => {
    try {
      setLoading(true);
      setCertificate(null);
      setErrorMessage("");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/certificate/verify/${idToVerify}`
      );

      setCertificate(res.data.certificate);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Certificate verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyCertificate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setCertificate(null);
      setErrorMessage("");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/certificate/verify/${certificateId}`
      );

      setCertificate(res.data.certificate);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message || "Certificate verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-page-shell">
      <section className="cf-certificate-hero">
        <div>
          <div className="cf-kicker">Certificate Verification</div>

          <h1>Verify CampusForge certificates.</h1>

          <p>
            Enter a certificate ID to confirm that a project was completed and
            certified by CampusForge.
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
            onClick={() => router.push("/completed-projects")}
          >
            Completed Projects
          </button>
        </div>
      </section>

      <section className="cf-certificate-layout">
        <form
          className="cf-certificate-search-card"
          onSubmit={verifyCertificate}
        >
          <div className="cf-kicker">Verify ID</div>

          <h2>Enter certificate ID</h2>

          <input
            type="text"
            placeholder="Example: CF-CERT-1B98822D"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Certificate"}
          </button>
        </form>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Validation</div>

          <h2>What this confirms</h2>

          <ul>
            <li>The certificate ID exists in CampusForge records.</li>
            <li>The linked project reached completion.</li>
            <li>The project owner and team members are visible.</li>
            <li>The project progress and task completion count are shown.</li>
          </ul>
        </aside>
      </section>

      {errorMessage && <div className="cf-error-state">{errorMessage}</div>}

      {certificate && (
        <section className="cf-verified-certificate-card">
          <div className="cf-verified-seal">✓</div>

          <div>
            <span className="cf-status cf-status-success">
              CERTIFICATE VERIFIED
            </span>

            <h2>{certificate.projectTitle}</h2>

            <p>{certificate.domain}</p>

            <div className="cf-certificate-id">
              {certificate.certificateId}
            </div>

            <div className="cf-tech-stack">
              {Array.isArray(certificate.techStack) &&
              certificate.techStack.length > 0 ? (
                certificate.techStack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))
              ) : (
                <span>{certificate.techStack || "No tech stack added"}</span>
              )}
            </div>

            <div className="cf-showcase-metrics">
              <div>
                <span>Status</span>
                <strong>{certificate.status}</strong>
              </div>

              <div>
                <span>Progress</span>
                <strong>{certificate.progress || 0}%</strong>
              </div>

              <div>
                <span>Tasks</span>
                <strong>
                  {certificate.completedTasks || 0}/
                  {certificate.totalTasks || 0}
                </strong>
              </div>

              <div>
                <span>Owner</span>
                <strong>{certificate.owner?.fullName || "Unknown"}</strong>
              </div>
            </div>

            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Team Members</div>

                <h2>Certified contributors</h2>
              </div>
            </div>

            {certificate.members?.length > 0 ? (
              <div className="cf-member-grid">
                {certificate.members.map((member) => (
                  <div key={member._id} className="cf-member-card">
                    <strong>{member.fullName}</strong>

                    <span>{member.email}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No team members found.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectCertificatePage() {
  const router = useRouter();
  const { id } = router.query;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSummary();
    }
  }, [id]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/projects/${id}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSummary(res.data.summary);
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to fetch certificate");
    } finally {
      setLoading(false);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading certificate...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h2>Certificate not found</h2>

          <button onClick={() => router.push(`/project-summary/${id}`)}>
            Back to Summary
          </button>
        </section>
      </div>
    );
  }

  const project = summary.project;

  const certificateId = `CF-CERT-${project._id.slice(-8).toUpperCase()}`;

  const verificationLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/certificate-verify?certificateId=${certificateId}`
      : "";

  const qrCodeUrl = verificationLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        verificationLink
      )}`
    : "";

  const isCompleted =
    project.status === "COMPLETED" || summary.progress === 100;

  const copyVerificationLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationLink);
      alert("Verification link copied");
    } catch (error) {
      console.log(error);
      alert("Failed to copy verification link");
    }
  };

  if (!isCompleted) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h1>Certificate Not Available</h1>

          <p>
            This project is not completed yet. Complete all tasks to unlock the
            certificate.
          </p>

          <button onClick={() => router.push(`/project-summary/${id}`)}>
            Back to Summary
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="cf-certificate-page">
      <div className="cf-certificate-toolbar no-print">
        <button onClick={() => router.push(`/project-summary/${id}`)}>
          Back to Summary
        </button>

        <button onClick={printCertificate}>Print / Save as PDF</button>

        <button onClick={copyVerificationLink}>Copy Verification Link</button>
      </div>

      <section className="cf-certificate-sheet">
        <div className="cf-certificate-border">
          <div className="cf-certificate-brand">
            <span>CampusForge</span>
            <small>Verified Campus Collaboration</small>
          </div>

          <div className="cf-certificate-title-block">
            <h1>Certificate of Project Completion</h1>

            <p>
              This certificate is proudly presented to the team of
            </p>

            <h2>{project.title}</h2>

            <p>
              for successfully completing the project with full task completion.
            </p>
          </div>

          <div className="cf-certificate-meta-grid">
            <div>
              <span>Certificate ID</span>
              <strong>{certificateId}</strong>
            </div>

            <div>
              <span>Issued On</span>
              <strong>{new Date().toLocaleDateString()}</strong>
            </div>

            <div>
              <span>Domain</span>
              <strong>{project.domain}</strong>
            </div>

            <div>
              <span>Progress</span>
              <strong>{summary.progress}%</strong>
            </div>
          </div>

          <div className="cf-certificate-section">
            <h3>Project Details</h3>

            <p>
              <strong>Tech Stack:</strong>{" "}
              {Array.isArray(project.techStack)
                ? project.techStack.join(", ")
                : project.techStack}
            </p>

            <p>
              <strong>Total Tasks:</strong> {summary.totalTasks}
            </p>

            <p>
              <strong>Completed Tasks:</strong> {summary.completedTasks}
            </p>
          </div>

          <div className="cf-certificate-section">
            <h3>Project Owner</h3>

            <p>{project.ownerId?.fullName || "Unknown"}</p>
          </div>

          <div className="cf-certificate-section">
            <h3>Team Members</h3>

            {project.members?.length ? (
              project.members.map((member) => (
                <p key={member._id}>
                  {member.fullName} - {member.email}
                </p>
              ))
            ) : (
              <p>No team members listed.</p>
            )}
          </div>

          <div className="cf-certificate-verification">
            <div>
              <h3>Verify Online</h3>

              <p>{verificationLink}</p>

              <small>CampusForge Project Completion Certificate</small>
            </div>

            {qrCodeUrl && (
              <div>
                <img
                  src={qrCodeUrl}
                  alt="Certificate Verification QR Code"
                />

                <small>Scan to verify certificate</small>
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx global>{`
        @media print {
          .app-navbar,
          .cf-navbar,
          .no-print {
            display: none !important;
          }

          body {
            margin: 0;
            background: white !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }

          .cf-certificate-page {
            padding: 0 !important;
            background: white !important;
          }

          .cf-certificate-sheet {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
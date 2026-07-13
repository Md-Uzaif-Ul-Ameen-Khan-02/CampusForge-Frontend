import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CompletedProjectDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [showcase, setShowcase] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchShowcaseDetails();
      fetchReviews();
    }
  }, [id]);

  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const fetchShowcaseDetails = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await axios.get(
        `http://localhost:5000/api/projects/completed/showcase/${id}`
      );

      setShowcase(res.data.showcase);
    } catch (error) {
      console.log(error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch completed project details"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/project-reviews/${id}`
      );

      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/project-reviews/${id}`,
        {
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Review saved successfully");

      setRating(5);
      setComment("");

      fetchReviews();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const confirmDelete = confirm(
        "Are you sure you want to delete this review?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/project-reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to delete review");
    }
  };

  const copyCertificateId = async () => {
    try {
      await navigator.clipboard.writeText(showcase.certificateId);
      alert("Certificate ID copied");
    } catch (error) {
      console.log(error);
      alert("Failed to copy certificate ID");
    }
  };

  const toggleLike = async () => {
    try {
      const token = getToken();

      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/projects/${id}/toggle-like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchShowcaseDetails();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to update like");
    }
  };

  if (loading) {
    return (
      <div className="cf-page-shell">
        <div className="cf-loading-card">Loading showcase...</div>
      </div>
    );
  }

  if (!showcase) {
    return (
      <div className="cf-page-shell">
        <section className="cf-empty-state cf-empty-large">
          <h2>Completed project not found</h2>

          <p>{errorMessage || "This completed project could not be loaded."}</p>

          <button onClick={() => router.push("/completed-projects")}>
            Back to Completed Projects
          </button>
        </section>
      </div>
    );
  }

  const project = showcase.project;

  return (
    <div className="cf-page-shell">
      <section className="cf-showcase-detail-hero">
        <div>
          <div className="cf-kicker">Completed Project Showcase</div>

          <h1>{project.title}</h1>

          <p>{project.description || "No description available."}</p>

          <div className="cf-detail-badges">
            <span className="cf-status cf-status-success">
              {project.status}
            </span>

            <span className="cf-badge-dark">{project.domain}</span>

            <span className="cf-badge">Rating {averageRating}/5</span>
          </div>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/completed-projects")}
          >
            Back
          </button>

          <button className="cf-btn-gold" onClick={toggleLike}>
            Like / Unlike
          </button>
        </div>
      </section>

      <section className="cf-showcase-detail-grid">
        <main className="cf-showcase-detail-main">
          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Project Overview</div>

                <h2>Build details</h2>
              </div>
            </div>

            <div className="cf-tech-stack">
              {Array.isArray(project.techStack) &&
              project.techStack.length > 0 ? (
                project.techStack.map((tech) => <span key={tech}>{tech}</span>)
              ) : (
                <span>{project.techStack || "No tech stack added"}</span>
              )}
            </div>

            <div className="cf-project-info-grid">
              <div>
                <span>Owner</span>
                <strong>{project.ownerId?.fullName || "Unknown"}</strong>
              </div>

              <div>
                <span>Likes</span>
                <strong>{project.likes?.length || 0}</strong>
              </div>

              <div>
                <span>Average Rating</span>
                <strong>{averageRating}/5</strong>
              </div>

              <div>
                <span>Total Reviews</span>
                <strong>{reviews.length}</strong>
              </div>
            </div>
          </section>

          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Completion Stats</div>

                <h2>Project progress</h2>
              </div>
            </div>

            <div className="cf-large-progress">
              <div className="cf-progress-track">
                <div
                  className="cf-progress-fill"
                  style={{
                    width: `${showcase.progress || 0}%`,
                  }}
                />
              </div>

              <strong>{showcase.progress || 0}% complete</strong>
            </div>

            <div className="cf-showcase-metrics">
              <div>
                <span>Total Tasks</span>
                <strong>{showcase.totalTasks || 0}</strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>{showcase.completedTasks || 0}</strong>
              </div>

              <div>
                <span>In Progress</span>
                <strong>{showcase.inProgressTasks || 0}</strong>
              </div>

              <div>
                <span>Pending</span>
                <strong>{showcase.pendingTasks || 0}</strong>
              </div>
            </div>
          </section>

          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Team</div>

                <h2>Project members</h2>
              </div>
            </div>

            {project.members?.length === 0 ? (
              <p>No members found.</p>
            ) : (
              <div className="cf-member-grid">
                {project.members.map((member) => (
                  <div key={member._id} className="cf-member-card">
                    <strong>{member.fullName}</strong>

                    <span>{member.email}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="cf-section">
            <div className="cf-section-heading">
              <div>
                <div className="cf-kicker">Reviews</div>

                <h2>Community feedback</h2>
              </div>

              <span className="cf-badge">Average {averageRating}/5</span>
            </div>

            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="cf-review-list">
                {reviews.map((review) => (
                  <article key={review._id} className="cf-review-card">
                    <div>
                      <strong>{review.userId?.fullName || "Unknown"}</strong>

                      <span>{review.rating}/5</span>
                    </div>

                    <p>{review.comment}</p>

                    <small>
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleString()
                        : "N/A"}
                    </small>

                    <button
                      onClick={() => deleteReview(review._id)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                      }}
                    >
                      Delete Review
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="cf-showcase-detail-side">
          <section className="cf-certificate-card">
            <div className="cf-kicker">Certificate</div>

            <h2>Completion Certificate</h2>

            <p>
              This project has a CampusForge completion certificate linked to
              its final task progress.
            </p>

            <div className="cf-certificate-id">
              {showcase.certificateId}
            </div>

            <div className="cf-card-actions">
              <button onClick={copyCertificateId}>Copy ID</button>

              <button
                className="cf-btn-ghost-dark"
                onClick={() =>
                  router.push(
                    `/certificate-verify?certificateId=${showcase.certificateId}`
                  )
                }
              >
                Verify
              </button>
            </div>
          </section>

          <section className="cf-review-form-card">
            <div className="cf-kicker">Leave a Review</div>

            <h2>Rate this project</h2>

            <form onSubmit={submitReview}>
              <label>Rating</label>

              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Very Poor</option>
              </select>

              <label>Comment</label>

              <textarea
                placeholder="Write your feedback about this project..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                required
              />

              <p>{comment.length}/500 characters</p>

              <button type="submit">Submit Review</button>
            </form>
          </section>
        </aside>
      </section>
    </div>
  );
}
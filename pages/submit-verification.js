import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function SubmitVerificationPage() {
  const router = useRouter();

  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);

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

  const searchColleges = async (value) => {
    try {
      setCollegeSearch(value);
      setSelectedCollege(null);

      if (!value.trim() || value.trim().length < 2) {
        setCollegeSuggestions([]);
        return;
      }

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/colleges/approved/search?search=${encodeURIComponent(
          value
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCollegeSuggestions(res.data.colleges || []);
    } catch (error) {
      console.log(error);
      setCollegeSuggestions([]);
    }
  };

  const selectCollege = (college) => {
    setSelectedCollege(college);
    setCollegeSearch(`${college.collegeName} (${college.domain})`);
    setCollegeSuggestions([]);
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

      if (!selectedCollege) {
        alert("Please select your college from the suggestions");
        return;
      }

      if (!idCard) {
        alert("Please upload your student ID card");
        return;
      }

      const formData = new FormData();

      formData.append("collegeId", selectedCollege._id);
      formData.append("studentIdNumber", studentIdNumber);
      formData.append("course", course);
      formData.append("currentYear", currentYear);
      formData.append("idCard", idCard);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/verifications/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(res.data.message || "Verification submitted successfully");

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
          <div className="cf-kicker">Student Verification</div>

          <h1>Verify your student identity.</h1>

          <p>
            Select your approved college, enter your student details, and upload
            your ID card for review.
          </p>
        </div>

        <div className="cf-projects-hero-actions">
          <button
            className="cf-btn-ghost"
            onClick={() => router.push("/profile")}
          >
            Back to Profile
          </button>
        </div>
      </section>

      <section className="cf-form-layout">
        <form className="cf-pro-form" onSubmit={submitVerification}>
          <div className="cf-form-section">
            <h2>College Selection</h2>

            <p>
              Start typing your college name. Only approved colleges will appear
              in suggestions.
            </p>

            <label>College Name</label>

            <div className="cf-college-autocomplete">
              <input
                type="text"
                placeholder="Start typing your approved college name"
                value={collegeSearch}
                onChange={(e) => searchColleges(e.target.value)}
                required
              />

              {collegeSuggestions.length > 0 && (
                <div className="cf-college-suggestions">
                  {collegeSuggestions.map((college) => (
                    <button
                      type="button"
                      key={college._id}
                      onClick={() => selectCollege(college)}
                    >
                      <strong>{college.collegeName}</strong>

                      <span>
                        Domain: {college.domain} | Official Email:{" "}
                        {college.officialEmail}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCollege && (
              <div className="cf-selected-college">
                Selected College: <strong>{selectedCollege.collegeName}</strong>
              </div>
            )}
          </div>

          <div className="cf-form-section">
            <h2>Student Details</h2>

            <label>Student ID / Roll Number</label>

            <input
              type="text"
              placeholder="Student ID / Roll Number"
              value={studentIdNumber}
              onChange={(e) => setStudentIdNumber(e.target.value)}
              required
            />

            <label>Course</label>

            <input
              type="text"
              placeholder="Example: B.Tech Computer Science"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            />

            <label>Current Year</label>

            <input
              type="text"
              placeholder="Example: 2nd Year"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              required
            />

            <label>Upload Student ID Card</label>

            <input
              type="file"
              accept="image/*"
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
              onClick={() => router.push("/profile")}
            >
              Cancel
            </button>
          </div>
        </form>

        <aside className="cf-form-side-card">
          <div className="cf-kicker">Trust System</div>

          <h2>Why verification matters</h2>

          <ul>
            <li>Only approved colleges appear in the college field.</li>
            <li>Your college ID is sent safely through the form request.</li>
            <li>Your ID card helps confirm you are a real current student.</li>
            <li>Approved students become verified project collaborators.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
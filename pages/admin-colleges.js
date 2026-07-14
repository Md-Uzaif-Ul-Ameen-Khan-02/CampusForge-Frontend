import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function AdminCollegesPage() {
  const router = useRouter();

  const [colleges, setColleges] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingColleges();
  }, []);

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  const fetchPendingColleges = async () => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/colleges/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setColleges(res.data.colleges || []);
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          "Failed to fetch pending colleges"
      );
    } finally {
      setLoading(false);
    }
  };

  const approveCollege = async (collegeId) => {
    try {
      const token = getToken();

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/colleges/approve/${collegeId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("College approved successfully");

      fetchPendingColleges();
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          "College approval failed"
      );
    }
  };

  const rejectCollege = async (collegeId) => {
    try {
      const token = getToken();

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/colleges/reject/${collegeId}`,
        {
          rejectionReason:
            rejectionReasons[collegeId] ||
            "College rejected by admin",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("College rejected");

      fetchPendingColleges();
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          "College rejection failed"
      );
    }
  };

  if (loading) {
    return <h2 style={{ padding: "30px" }}>Loading...</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Pending Colleges</h1>

      <button onClick={() => router.push("/dashboard")}>
        Back to Dashboard
      </button>

      <br />
      <br />

      {colleges.length === 0 ? (
        <p>No pending colleges found</p>
      ) : (
        colleges.map((college) => (
          <div
            key={college._id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h2>{college.collegeName}</h2>

            <p>
              <strong>Email:</strong> {college.officialEmail}
            </p>

            <p>
              <strong>Domain:</strong> {college.domain}
            </p>

            <p>
              <strong>Status:</strong> {college.approvalStatus}
            </p>

            <p>
              <strong>Accreditation:</strong>{" "}
              {college.accreditationDetails || "Not added"}
            </p>

            <button onClick={() => approveCollege(college._id)}>
              Approve
            </button>

            <br />
            <br />

            <input
              type="text"
              placeholder="Rejection reason"
              value={rejectionReasons[college._id] || ""}
              onChange={(e) =>
                setRejectionReasons({
                  ...rejectionReasons,
                  [college._id]: e.target.value,
                })
              }
            />

            {" "}

            <button onClick={() => rejectCollege(college._id)}>
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
}
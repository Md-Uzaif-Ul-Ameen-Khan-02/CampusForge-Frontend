import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const projectId = localStorage.getItem("projectId");

      if (!projectId) {
        alert("No project selected");
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/join-requests/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(res.data.requests || []);
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}
/api/join-requests/approve/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Approved");

      fetchRequests();
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
          "Approval failed"
      );
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Join Requests</h1>

      {requests.length === 0 ? (
        <p>No join requests found</p>
      ) : (
        requests.map((request) => (
          <div
            key={request._id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h3>
              {request.user?.fullName || "Unknown User"}
            </h3>

            <p>{request.user?.email}</p>

            <p>Status: {request.status}</p>

            {request.message && (
              <p>Message: {request.message}</p>
            )}

            {request.status === "PENDING" && (
              <button
                onClick={() =>
                  approveRequest(request._id)
                }
              >
                Approve
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
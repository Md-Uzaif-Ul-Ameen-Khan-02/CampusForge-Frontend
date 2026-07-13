import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Projects() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (searchValue = "") => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/projects?search=${searchValue}`
      );

      setProjects(res.data.projects || []);
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          "Failed to fetch projects"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    fetchProjects(search);
  };

  const clearSearch = () => {
    setSearch("");
    fetchProjects("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>All Projects</h1>

      <button onClick={() => router.push("/dashboard")}>
        Back to Dashboard
      </button>

      {" "}

      <button onClick={() => router.push("/create-project")}>
        Create Project
      </button>

      <br />
      <br />

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by title, domain, or tech stack"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            marginRight: "10px",
          }}
        />

        <button type="submit">Search</button>

        {" "}

        <button type="button" onClick={clearSearch}>
          Clear
        </button>
      </form>

      <br />

      {loading ? (
        <h2>Loading...</h2>
      ) : projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        projects.map((project) => (
          <div
            key={project._id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <Link href={`/projects/${project._id}`}>
              <a>
                <h2
                  style={{
                    color: "blue",
                    cursor: "pointer",
                  }}
                >
                  {project.title}
                </h2>
              </a>
            </Link>

            <p>{project.description}</p>

            <p>
              <strong>Domain:</strong>{" "}
              {project.domain}
            </p>

            <p>
              <strong>Tech Stack:</strong>{" "}
              {Array.isArray(project.techStack)
                ? project.techStack.join(", ")
                : project.techStack}
            </p>

            <p>
              <strong>Team Limit:</strong>{" "}
              {project.teamSizeLimit}
            </p>

            <p>
              <strong>Members:</strong>{" "}
              {project.members?.length || 0}
            </p>

            <p>
              <strong>Owner:</strong>{" "}
              {project.ownerId?.fullName || "Unknown"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
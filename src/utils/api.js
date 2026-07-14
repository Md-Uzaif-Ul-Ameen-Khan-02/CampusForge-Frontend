import axios from "axios";

const API = axios.create({
  baseURL:
    `${process.env.NEXT_PUBLIC_API_URL}
/api`,
});

// ATTACH ACCESS TOKEN
API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
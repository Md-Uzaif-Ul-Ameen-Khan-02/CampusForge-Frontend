import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`
;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAccessToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const getRefreshToken = () => {
    return (
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken")
    );
  };

  const saveTokens = (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("refreshToken", refreshToken);
    }
  };

  const restoreLocalStorageFromSession = () => {
    const sessionAccessToken = sessionStorage.getItem("accessToken");
    const sessionRefreshToken = sessionStorage.getItem("refreshToken");

    if (!localStorage.getItem("accessToken") && sessionAccessToken) {
      localStorage.setItem("accessToken", sessionAccessToken);
    }

    if (!localStorage.getItem("refreshToken") && sessionRefreshToken) {
      localStorage.setItem("refreshToken", sessionRefreshToken);
    }
  };

  const clearAuthStorageOnlyOnManualLogout = () => {
    console.trace("TOKENS REMOVED ONLY BY MANUAL LOGOUT");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  };

  const getProfileWithToken = async (token) => {
    const res = await axios.get(`${API_BASE_URL}/api/profile/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.user;
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken();

      console.log("REFRESH TOKEN CHECK:", {
        hasRefreshToken: Boolean(refreshToken),
      });

      if (!refreshToken) {
        return null;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/refresh-token`,
        {
          refreshToken,
        }
      );

      console.log("REFRESH RESPONSE:", res.data);

      const newAccessToken = res.data.accessToken;

      if (!newAccessToken) {
        return null;
      }

      saveTokens(newAccessToken, refreshToken);

      return newAccessToken;
    } catch (error) {
      console.log(
        "REFRESH FAILED:",
        error.response?.status,
        error.response?.data || error.message
      );

      // Do not remove tokens here.
      // We only remove tokens when user clicks Logout.
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);

      restoreLocalStorageFromSession();

      let accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      console.log("AUTH CHECK:", {
        hasAccessToken: Boolean(accessToken),
        hasRefreshToken: Boolean(refreshToken),
      });

      if (!accessToken && !refreshToken) {
        setUser(null);
        return;
      }

      if (!accessToken && refreshToken) {
        accessToken = await refreshAccessToken();

        if (!accessToken) {
          setUser(null);
          return;
        }
      }

      try {
        const currentUser = await getProfileWithToken(accessToken);
        setUser(currentUser);
        return;
      } catch (error) {
        console.log(
          "PROFILE FETCH FAILED:",
          error.response?.status,
          error.response?.data || error.message
        );

        if (error.response?.status === 401 && refreshToken) {
          const newAccessToken = await refreshAccessToken();

          if (!newAccessToken) {
            setUser(null);
            return;
          }

          const currentUser = await getProfileWithToken(newAccessToken);
          setUser(currentUser);
          return;
        }

        // Do not remove tokens here.
        setUser(null);
      }
    } catch (error) {
      console.log(
        "AUTH CONTEXT ERROR:",
        error.response?.data || error.message
      );

      // Do not remove tokens here.
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/api/auth/login") &&
          !originalRequest.url?.includes("/api/auth/register") &&
          !originalRequest.url?.includes("/api/auth/register-college") &&
          !originalRequest.url?.includes("/api/auth/refresh-token")
        ) {
          originalRequest._retry = true;

          const newAccessToken = await refreshAccessToken();

          if (!newAccessToken) {
            return Promise.reject(error);
          }

          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };

          return axios(originalRequest);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = ({ user, accessToken, refreshToken }) => {
    saveTokens(accessToken, refreshToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken && refreshToken) {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {
            refreshToken,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      clearAuthStorageOnlyOnManualLogout();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        fetchProfile,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
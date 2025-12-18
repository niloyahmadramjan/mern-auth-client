import axios from "axios";

const server = process.env.BACKEND_URL || "http://localhost:5000";

const getCookie = (name) => {
  const value = `;${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  // if (parts === 2) return parts.pop().split(";").shift();
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
};

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (["post", "put", "delete"].includes(config.method)) {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let isRefreshingCSRFToken = false;
let failedQueue = [];
let csrffailedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const processCSRFQueue = (error, token = null) => {
  csrffailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  csrffailedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 403 &&
      !originalRequest._csrfRetry &&
      !originalRequest._authRetry
    ) {
      const errorCode = error.response.data.code || "";
      if (errorCode.startsWith("CSRF_")) {
        if (isRefreshingCSRFToken) {
          return new Promise((resolve, reject) => {
            csrffailedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }
        // originalRequest._retry = true;
        originalRequest._csrfRetry = true;
        isRefreshingCSRFToken = true;

        try {
          // await api.post("/api/v1/refresh-csrf");
          // processCSRFQueue(null);
          // return api(originalRequest);
          await api.post("/api/v1/refresh-csrf");

          const newCsrf = getCookie("csrfToken");
          if (newCsrf) {
            originalRequest.headers["x-csrf-token"] = newCsrf;
          }

          processCSRFQueue(null);
          return api(originalRequest);
        } catch (error) {
          processCSRFQueue(error);
          console.error("Failed to refresh csrf token : ", error);
          return Promise.reject(error);
        } finally {
          isRefreshingCSRFToken = false;
        }
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
      }

      // originalRequest._retry = true;
      originalRequest._authRetry = true;
      isRefreshing = true;

      try {
        await api.post("/api/v1/refresh-token");
        processQueue(null);
        return api(originalRequest);
      } catch (error) {
        processQueue(error, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

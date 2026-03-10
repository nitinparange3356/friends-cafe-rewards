/**
 * Get the API base URL based on environment
 * - Development: localhost:3001 (dev server)
 * - Production: /api (Vercel serverless)
 */
export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // Development: use dev server on port 3002
    return "http://localhost:3002";
  }
  // Production: API is served from same origin
  return "";
};

/**
 * Make a POST request to the API
 */
export const apiPost = async (endpoint: string, options?: RequestInit) => {
  const url = `${getApiUrl()}${endpoint}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
};

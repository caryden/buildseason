import { hc } from "hono/client";
import type { ApiRoutes } from "@buildseason/api/client";

// Create typed API client
// In development, Vite proxies /api to the backend
// In production, the API is on the same origin
const baseUrl = "";

export const api = hc<ApiRoutes>(baseUrl, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: "include", // Send cookies for auth
    }),
});

// Type-safe API error
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// Helper to handle API responses
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "An error occurred";
    let code: string | undefined;

    try {
      const data = await response.json();
      message = data.error || message;
      code = data.code;
    } catch {
      // Response wasn't JSON
    }

    throw new ApiError(message, response.status, code);
  }

  return response.json();
}

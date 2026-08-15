import type { ApiResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const TOKEN_KEY = "skillforge_token";
export const USER_KEY = "skillforge_user";

export class ApiError extends Error {
  statusCode: number;
  errors?: string[];

  constructor(message: string, statusCode: number, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  signal?: AbortSignal;
}

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, auth = true, signal } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const token = getToken();
  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      credentials: "include",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError("Network error. Please check your connection.", 0);
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("Something went wrong. Please try again.", response.status);
  }

  if (!response.ok || !payload.success) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearToken();
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/register")) {
        window.location.assign(window.location.origin + "/login");
      }
    }
    throw new ApiError(payload.message || "Request failed", response.status, payload.errors);
  }

  return payload;
}

export const get = <T>(path: string, options?: RequestOptions) =>
  api<T>(path, { ...options, method: "GET" });

export const post = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  api<T>(path, { ...options, method: "POST", body });

export const put = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  api<T>(path, { ...options, method: "PUT", body });

export const del = <T>(path: string, options?: RequestOptions) =>
  api<T>(path, { ...options, method: "DELETE" });

export async function uploadFile(
  file: File,
  folder = "general",
): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload?folder=${folder}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message || "Upload failed", response.status);
  }
  return payload.data;
}

export { BASE_URL };

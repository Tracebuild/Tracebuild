const BASE = "/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.detail ?? json.error ?? "Fehler");
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail ?? json.error ?? "Fehler");
  if (json.error) throw new Error(json.error);
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: <T>(path: string, formData: FormData) => requestForm<T>(path, formData),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

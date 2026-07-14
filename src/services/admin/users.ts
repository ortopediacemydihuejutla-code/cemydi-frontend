import { adminRequest } from "./request";
import type {
  AdminUser,
  CreateUserPayload,
  PaginationMeta,
  UpdateUserPayload,
} from "./types";

export function listUsers(params?: { page?: number; pageSize?: number }) {
  const search = new URLSearchParams();
  search.set("page", String(params?.page ?? 1));
  search.set("pageSize", String(params?.pageSize ?? 200));

  return adminRequest<{ users: AdminUser[]; pagination?: PaginationMeta }>(
    `/users?${search.toString()}`,
    { method: "GET" },
  );
}

export function createUser(payload: CreateUserPayload) {
  return adminRequest<{ user: AdminUser; message: string }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: number, payload: UpdateUserPayload) {
  return adminRequest<{ user: AdminUser; message: string }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: number) {
  return adminRequest<{ message: string }>(`/users/${id}`, {
    method: "DELETE",
  });
}

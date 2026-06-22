import { adminRequest } from "./request";
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "./types";

export function listUsers() {
  return adminRequest<{ users: AdminUser[] }>("/users", { method: "GET" });
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

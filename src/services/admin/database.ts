import { downloadBinaryResponse, adminRequest } from "./request";
import type {
  AuthSecurityOverview,
  DatabaseBackupRecord,
  DatabaseBackupSchedule,
  DatabaseStatus,
  MaintenanceOperation,
  MaintenanceRunResult,
  MaintenanceSchedule,
} from "./types";

export async function downloadDatabaseBackup() {
  return downloadBinaryResponse(
    "/backups/database",
    `cemydi-backup-${new Date().toISOString().slice(0, 10)}.tar`,
    "No se pudo generar el respaldo de base de datos",
  );
}

export function listDatabaseBackups() {
  return adminRequest<{ backups: DatabaseBackupRecord[] }>(
    "/backups/database/history",
    { method: "GET" },
  );
}

export function createDatabaseBackupRecord() {
  return adminRequest<{
    backup: DatabaseBackupRecord;
    message: string;
  }>("/backups/database", {
    method: "POST",
  });
}

export function createSingleTableDatabaseBackupRecord(tableName: string) {
  return adminRequest<{
    backup: DatabaseBackupRecord;
    message: string;
  }>("/backups/database/table", {
    method: "POST",
    body: JSON.stringify({ tableName }),
  });
}

export function deleteDatabaseBackupRecord(id: number) {
  return adminRequest<{
    backup: DatabaseBackupRecord;
    message: string;
  }>(`/backups/database/${id}`, {
    method: "DELETE",
  });
}

export function restoreDatabaseBackupById(id: number) {
  return adminRequest<{
    message: string;
    logText: string;
  }>(`/backups/database/${id}/restore`, {
    method: "POST",
  });
}

export async function downloadDatabaseBackupById(id: number) {
  return downloadBinaryResponse(
    `/backups/database/${id}/download`,
    `cemydi_backup_${id}.tar`,
    "No se pudo descargar el respaldo",
  );
}

export function getDatabaseStatus() {
  return adminRequest<{ status: DatabaseStatus }>(
    "/backups/database/status",
    { method: "GET" },
  );
}

export function getAuthSecurityOverview() {
  return adminRequest<{ overview: AuthSecurityOverview }>(
    "/auth/security-overview",
    { method: "GET" },
  );
}

export function getDatabaseBackupSchedule() {
  return adminRequest<{ schedule: DatabaseBackupSchedule }>(
    "/backups/database/schedule",
    { method: "GET" },
  );
}

export function deleteDatabaseBackupSchedule() {
  return adminRequest<{
    schedule: DatabaseBackupSchedule;
    message: string;
  }>("/backups/database/schedule", {
    method: "DELETE",
  });
}

export function updateDatabaseBackupSchedule(payload: {
  enabled: boolean;
  everyDays: number;
  runAtTime: string;
  retentionDays: number;
}) {
  return adminRequest<{
    schedule: DatabaseBackupSchedule;
    message: string;
  }>("/backups/database/schedule", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function runMaintenance(payload: {
  operation: MaintenanceOperation;
  schemaName?: string | null;
  tableName?: string | null;
}) {
  return adminRequest<MaintenanceRunResult>("/maintenance/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMaintenanceSchedule() {
  return adminRequest<{ schedule: MaintenanceSchedule }>(
    "/maintenance/schedule",
    { method: "GET" },
  );
}

export function updateMaintenanceSchedule(payload: {
  enabled: boolean;
  everyDays: number;
  runAtTime: string;
  operation: MaintenanceOperation;
  schemaName?: string | null;
  tableName?: string | null;
}) {
  return adminRequest<{ schedule: MaintenanceSchedule; message: string }>(
    "/maintenance/schedule",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteMaintenanceSchedule() {
  return adminRequest<{ schedule: MaintenanceSchedule; message: string }>(
    "/maintenance/schedule",
    { method: "DELETE" },
  );
}

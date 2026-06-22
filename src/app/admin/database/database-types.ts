import type { DatabaseBackupRecord, MaintenanceOperation } from "@/services/admin";

export const BACKUP_PAGE_SIZE = 10;

export const defaultScheduleForm = {
  enabled: false,
  everyDays: "1",
  runAtTime: "03:00",
  retentionDays: "7",
};

export type ScheduleFormState = typeof defaultScheduleForm;

export type MainTab = "monitoreo" | "seguridad" | "respaldos" | "mantenimiento";

export type MaintenanceFormState = {
  enabled: boolean;
  everyDays: string;
  runAtTime: string;
  operation: MaintenanceOperation;
  schemaName: string;
  tableName: string;
};

export const defaultMaintenanceForm: MaintenanceFormState = {
  enabled: false,
  everyDays: "1",
  runAtTime: "04:00",
  operation: "VACUUM_ANALYZE",
  schemaName: "public",
  tableName: "",
};

export type PendingAction =
  | { kind: "delete-backup"; backup: DatabaseBackupRecord }
  | { kind: "restore-backup"; backup: DatabaseBackupRecord }
  | { kind: "delete-schedule" }
  | null;

export type ConsoleLogKind = "cmd" | "info" | "success" | "error" | "warn";

export type ConsoleLogEntry = {
  id: number;
  timestamp: string;
  message: string;
  kind: ConsoleLogKind;
};

export type ConsoleOperationType = "backup-full" | "backup-table" | "restore";

export type SaveFilePickerType = {
  description: string;
  accept: Record<string, string[]>;
};

export type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: SaveFilePickerType[];
};

export type SaveFilePickerWritable = {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
};

export type SaveFilePickerHandle = {
  createWritable(): Promise<SaveFilePickerWritable>;
};

export type SavePickerWindow = Window & {
  showSaveFilePicker?: (
    options?: SaveFilePickerOptions,
  ) => Promise<SaveFilePickerHandle>;
};

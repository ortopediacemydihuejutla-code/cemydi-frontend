"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import type { AuthUserProfile } from "@/providers/AuthContext";
import {
  type AuthSecurityOverview,
  type DatabaseBackupRecord,
  type DatabaseBackupSchedule,
  type DatabaseStatus,
  createDatabaseBackupRecord,
  createSingleTableDatabaseBackupRecord,
  deleteDatabaseBackupRecord,
  deleteDatabaseBackupSchedule,
  downloadDatabaseBackupById,
  getAuthSecurityOverview,
  getDatabaseBackupSchedule,
  getDatabaseStatus,
  listDatabaseBackups,
  restoreDatabaseBackupById,
  updateDatabaseBackupSchedule,
  runMaintenance,
  getMaintenanceSchedule,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule,
  type MaintenanceSchedule,
} from "@/services/admin";
import {
  BACKUP_PAGE_SIZE,
  defaultMaintenanceForm,
  defaultScheduleForm,
  type ConsoleLogEntry,
  type ConsoleLogKind,
  type ConsoleOperationType,
  type MainTab,
  type MaintenanceFormState,
  type PendingAction,
  type ScheduleFormState,
} from "./database-types";
import {
  formatBytes,
  nowTime,
  sleep,
} from "./database-formatters";
import { saveBlobAsFile } from "./database-file-utils";
import { toScheduleForm, validateScheduleForm } from "./database-schedule-utils";
import { normalizeDatabaseStatus } from "./database-status-utils";

export type DatabaseAdminState = {
  dbStatus: DatabaseStatus | null;
  securityOverview: AuthSecurityOverview | null;
  backupRecords: DatabaseBackupRecord[];
  backupSchedule: DatabaseBackupSchedule | null;
  scheduleForm: ScheduleFormState;
  setScheduleForm: React.Dispatch<React.SetStateAction<ScheduleFormState>>;

  loadingDbStatus: boolean;
  loadingBackupRecords: boolean;
  loadingBackupSchedule: boolean;
  loadingAuthSecurityOverview: boolean;
  initialLoading: boolean;

  selectedBackupTable: string;
  setSelectedBackupTable: React.Dispatch<React.SetStateAction<string>>;
  historyQuery: string;
  setHistoryQuery: React.Dispatch<React.SetStateAction<string>>;
  backupPage: number;
  setBackupPage: React.Dispatch<React.SetStateAction<number>>;
  generatingBackup: boolean;
  generatingTableBackup: boolean;
  savingSchedule: boolean;
  downloadingBackupId: number | null;
  deletingBackupId: number | null;
  pendingAction: PendingAction;
  setPendingAction: React.Dispatch<React.SetStateAction<PendingAction>>;

  maintenanceSchedule: MaintenanceSchedule | null;
  maintenanceForm: MaintenanceFormState;
  setMaintenanceForm: React.Dispatch<React.SetStateAction<MaintenanceFormState>>;
  loadingMaintenanceSchedule: boolean;
  savingMaintenanceSchedule: boolean;
  runningMaintenance: boolean;

  allSessionsOpen: boolean;
  setAllSessionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allAuditOpen: boolean;
  setAllAuditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mainTab: MainTab;
  setMainTab: React.Dispatch<React.SetStateAction<MainTab>>;
  scheduleDialogOpen: boolean;
  setScheduleDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tableBackupDialogOpen: boolean;
  setTableBackupDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  databaseSummaryOpen: boolean;
  setDatabaseSummaryOpen: React.Dispatch<React.SetStateAction<boolean>>;

  consoleOpen: boolean;
  setConsoleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  consoleLogs: ConsoleLogEntry[];
  consoleOpType: ConsoleOperationType;
  consoleRunning: boolean;
  consoleStatus: "running" | "success" | "error";
  consoleEndRef: React.RefObject<HTMLDivElement | null>;

  dbTableItems: NonNullable<DatabaseStatus["tables"]["items"]>;
  heaviestDbTable: NonNullable<DatabaseStatus["tables"]["items"]>[number] | null;
  securitySummary: AuthSecurityOverview["summary"] | null;
  activeSessions: AuthSecurityOverview["activeSessions"];
  loginAuditItems: AuthSecurityOverview["loginAttempts"];
  visibleActiveSessions: AuthSecurityOverview["activeSessions"];
  visibleLoginAuditItems: AuthSecurityOverview["loginAttempts"];
  filteredBackups: DatabaseBackupRecord[];
  totalBackupPages: number;
  currentBackupPage: number;
  paginatedBackups: DatabaseBackupRecord[];
  anyLoading: boolean;

  loadDatabaseStats: () => Promise<void>;
  loadAuthSecurityOverviewData: () => Promise<void>;
  loadBackupRecordsData: () => Promise<void>;
  loadBackupScheduleData: () => Promise<void>;
  loadMaintenanceScheduleData: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  syncScheduleFormWithCurrentRecord: (notify?: boolean) => void;
  openScheduleDialog: () => void;
  generateBackup: () => Promise<void>;
  generateSingleTableBackup: () => Promise<void>;
  handleRunMaintenance: () => Promise<void>;
  handleSaveMaintenanceSchedule: (e: React.FormEvent) => Promise<void>;
  handleRemoveMaintenanceSchedule: () => Promise<void>;
  downloadBackupRecord: (backup: DatabaseBackupRecord) => Promise<void>;
  saveSchedule: () => Promise<void>;
  executePendingAction: () => Promise<void>;
};

export function useDatabaseAdminState(user: AuthUserProfile | null): DatabaseAdminState {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [securityOverview, setSecurityOverview] =
    useState<AuthSecurityOverview | null>(null);
  const [backupRecords, setBackupRecords] = useState<DatabaseBackupRecord[]>([]);
  const [backupSchedule, setBackupSchedule] =
    useState<DatabaseBackupSchedule | null>(null);
  const [scheduleForm, setScheduleForm] =
    useState<ScheduleFormState>(defaultScheduleForm);

  const [loadingDbStatus, setLoadingDbStatus] = useState(false);
  const [loadingBackupRecords, setLoadingBackupRecords] = useState(false);
  const [loadingBackupSchedule, setLoadingBackupSchedule] = useState(false);
  const [loadingAuthSecurityOverview, setLoadingAuthSecurityOverview] =
    useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedBackupTable, setSelectedBackupTable] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [backupPage, setBackupPage] = useState(1);
  const [generatingBackup, setGeneratingBackup] = useState(false);
  const [generatingTableBackup, setGeneratingTableBackup] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [downloadingBackupId, setDownloadingBackupId] = useState<number | null>(
    null,
  );
  const [deletingBackupId, setDeletingBackupId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule | null>(null);
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceFormState>(defaultMaintenanceForm);
  const [loadingMaintenanceSchedule, setLoadingMaintenanceSchedule] = useState(false);
  const [savingMaintenanceSchedule, setSavingMaintenanceSchedule] = useState(false);
  const [runningMaintenance, setRunningMaintenance] = useState(false);

  const [allSessionsOpen, setAllSessionsOpen] = useState(false);
  const [allAuditOpen, setAllAuditOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("monitoreo");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [tableBackupDialogOpen, setTableBackupDialogOpen] = useState(false);
  const [databaseSummaryOpen, setDatabaseSummaryOpen] = useState(false);

  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([]);
  const [consoleOpType, setConsoleOpType] = useState<ConsoleOperationType>("backup-full");
  const [consoleRunning, setConsoleRunning] = useState(false);
  const [consoleStatus, setConsoleStatus] = useState<"running" | "success" | "error">("running");
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const consoleLogIdRef = useRef(0);

  const loadDatabaseStats = useCallback(async () => {
    try {
      setLoadingDbStatus(true);
      const result = await getDatabaseStatus();
      setDbStatus(normalizeDatabaseStatus(result.status));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo consultar el estado de la base de datos.",
      );
    } finally {
      setLoadingDbStatus(false);
    }
  }, []);

  const loadAuthSecurityOverviewData = useCallback(async () => {
    try {
      setLoadingAuthSecurityOverview(true);
      const result = await getAuthSecurityOverview();
      setSecurityOverview(result.overview);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el resumen de seguridad.",
      );
    } finally {
      setLoadingAuthSecurityOverview(false);
    }
  }, []);

  const loadBackupRecordsData = useCallback(async () => {
    try {
      setLoadingBackupRecords(true);
      const result = await listDatabaseBackups();
      setBackupRecords(result.backups);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial de respaldos.",
      );
    } finally {
      setLoadingBackupRecords(false);
    }
  }, []);

  const loadBackupScheduleData = useCallback(async () => {
    try {
      setLoadingBackupSchedule(true);
      const result = await getDatabaseBackupSchedule();
      setBackupSchedule(result.schedule);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la programación de respaldos.",
      );
    } finally {
      setLoadingBackupSchedule(false);
    }
  }, []);

  const loadMaintenanceScheduleData = useCallback(async () => {
    try {
      setLoadingMaintenanceSchedule(true);
      const result = await getMaintenanceSchedule();
      setMaintenanceSchedule(result.schedule);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la programación de mantenimiento.",
      );
    } finally {
      setLoadingMaintenanceSchedule(false);
    }
  }, []);

  const dbTableItems = useMemo(
    () => dbStatus?.tables.items ?? [],
    [dbStatus],
  );

  const heaviestDbTable = useMemo(() => {
    if (dbTableItems.length === 0) return null;
    return [...dbTableItems].reduce((a, b) =>
      b.sizeBytes > a.sizeBytes ? b : a,
    );
  }, [dbTableItems]);

  const securitySummary = securityOverview?.summary ?? null;
  const activeSessions = useMemo(
    () => securityOverview?.activeSessions ?? [],
    [securityOverview],
  );
  const loginAuditItems = useMemo(
    () => securityOverview?.loginAttempts ?? [],
    [securityOverview],
  );

  const visibleActiveSessions = useMemo(
    () => activeSessions.slice(0, 3),
    [activeSessions],
  );
  const visibleLoginAuditItems = useMemo(
    () => loginAuditItems.slice(0, 3),
    [loginAuditItems],
  );

  const filteredBackups = useMemo(
    () =>
      backupRecords.filter((backup) =>
        backup.fileName.toLowerCase().includes(historyQuery.trim().toLowerCase()),
      ),
    [backupRecords, historyQuery],
  );

  const totalBackupPages = Math.max(
    1,
    Math.ceil(filteredBackups.length / BACKUP_PAGE_SIZE),
  );
  const currentBackupPage = Math.min(backupPage, totalBackupPages);
  const paginatedBackups = useMemo(() => {
    const start = (currentBackupPage - 1) * BACKUP_PAGE_SIZE;
    return filteredBackups.slice(start, start + BACKUP_PAGE_SIZE);
  }, [currentBackupPage, filteredBackups]);

  useEffect(() => {
    setScheduleForm(toScheduleForm(backupSchedule));
  }, [backupSchedule]);

  useEffect(() => {
    if (dbTableItems.length === 0) {
      setSelectedBackupTable("");
      return;
    }
    const exists = dbTableItems.some((t) => t.tableName === selectedBackupTable);
    if (!exists) {
      setSelectedBackupTable(dbTableItems[0]?.tableName ?? "");
    }
  }, [dbTableItems, selectedBackupTable]);

  useEffect(() => {
    if (backupPage > totalBackupPages) {
      setBackupPage(totalBackupPages);
    }
  }, [backupPage, totalBackupPages]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    async function loadAll() {
      setInitialLoading(true);
      await Promise.allSettled([
        loadDatabaseStats(),
        loadAuthSecurityOverviewData(),
        loadBackupRecordsData(),
        loadBackupScheduleData(),
        loadMaintenanceScheduleData(),
      ]);
      if (!cancelled) {
        setInitialLoading(false);
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    loadDatabaseStats,
    loadAuthSecurityOverviewData,
    loadBackupRecordsData,
    loadBackupScheduleData,
    loadMaintenanceScheduleData,
  ]);

  useEffect(() => {
    if (consoleOpen) {
      consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs, consoleOpen]);

  const anyLoading =
    loadingAuthSecurityOverview ||
    loadingDbStatus ||
    loadingBackupRecords ||
    loadingBackupSchedule ||
    loadingMaintenanceSchedule;

  async function refreshAllData() {
    if (!user) return;
    await Promise.all([
      loadDatabaseStats(),
      loadAuthSecurityOverviewData(),
      loadBackupRecordsData(),
      loadBackupScheduleData(),
      loadMaintenanceScheduleData(),
    ]);
    toast.success("Datos actualizados.");
  }

  const syncScheduleFormWithCurrentRecord = useCallback((notify = false) => {
    if (!backupSchedule) {
      setScheduleForm(defaultScheduleForm);
      if (notify) {
        toast.success("Formulario restablecido al modo manual.");
      }
      return;
    }
    setScheduleForm({
      enabled: backupSchedule.enabled,
      everyDays: String(backupSchedule.everyDays),
      runAtTime: backupSchedule.runAtTime,
      retentionDays: String(backupSchedule.retentionDays),
    });
    if (!notify) {
      return;
    }
    toast.success("Registro de programación cargado para edición.");
  }, [backupSchedule]);

  const openScheduleDialog = useCallback(() => {
    syncScheduleFormWithCurrentRecord(false);
    setScheduleDialogOpen(true);
  }, [syncScheduleFormWithCurrentRecord]);

  function pushLog(kind: ConsoleLogKind, message: string) {
    const id = ++consoleLogIdRef.current;
    setConsoleLogs((prev) => [...prev, { id, timestamp: nowTime(), message, kind }]);
  }

  function openConsole(opType: ConsoleOperationType) {
    consoleLogIdRef.current = 0;
    setConsoleLogs([]);
    setConsoleOpType(opType);
    setConsoleRunning(true);
    setConsoleStatus("running");
    setConsoleOpen(true);
  }

  async function generateBackup() {
    if (!user) return;

    setGeneratingBackup(true);
    openConsole("backup-full");

    try {
      pushLog("cmd", "$ pg_dump --format=tar --no-password cemydi_db");
      await sleep(350);
      pushLog("info", "Conectando con el servidor de base de datos...");
      await sleep(500);
      pushLog("success", "Conexión establecida ✓");
      await sleep(300);
      pushLog("info", "Analizando esquema y tablas...");
      await sleep(600);
      pushLog("info", "Iniciando exportación completa de datos...");

      const result = await createDatabaseBackupRecord();

      await sleep(250);
      pushLog("info", `Serializando ${result.backup.fileName}...`);
      await sleep(400);
      pushLog("success", `Archivo generado: ${result.backup.fileName} (${formatBytes(result.backup.sizeBytes)})`);
      await sleep(200);
      pushLog("info", "Registrando entrada en el historial de respaldos...");
      await sleep(300);
      pushLog("success", "Respaldo completado exitosamente ✓");

      setBackupRecords((current) => [result.backup, ...current]);
      setBackupPage(1);
      setConsoleStatus("success");
      await loadDatabaseStats();
    } catch (error) {
      pushLog("error", `ERROR: ${error instanceof Error ? error.message : "No se pudo generar el respaldo completo."}`);
      pushLog("warn", "El proceso fue interrumpido. Verifica la conexión con el servidor.");
      setConsoleStatus("error");
    } finally {
      setConsoleRunning(false);
      setGeneratingBackup(false);
    }
  }

  async function generateSingleTableBackup() {
    if (!user) return;

    if (!selectedBackupTable) {
      toast.error("Selecciona una tabla para generar el respaldo.");
      return;
    }

    setTableBackupDialogOpen(false);
    setGeneratingTableBackup(true);
    openConsole("backup-table");

    try {
      pushLog("cmd", `$ pg_dump --format=tar --table=${selectedBackupTable} cemydi_db`);
      await sleep(350);
      pushLog("info", "Conectando con el servidor de base de datos...");
      await sleep(500);
      pushLog("success", "Conexión establecida ✓");
      await sleep(300);
      pushLog("info", `Localizando tabla: ${selectedBackupTable}...`);
      await sleep(450);
      pushLog("info", `Exportando registros de "${selectedBackupTable}"...`);

      const result = await createSingleTableDatabaseBackupRecord(selectedBackupTable);

      await sleep(250);
      pushLog("info", `Serializando ${result.backup.fileName}...`);
      await sleep(400);
      pushLog("success", `Archivo generado: ${result.backup.fileName} (${formatBytes(result.backup.sizeBytes)})`);
      await sleep(200);
      pushLog("info", "Registrando entrada en el historial de respaldos...");
      await sleep(300);
      pushLog("success", `Respaldo de tabla "${selectedBackupTable}" completado ✓`);

      setBackupRecords((current) => [result.backup, ...current]);
      setBackupPage(1);
      setConsoleStatus("success");
      await loadDatabaseStats();
    } catch (error) {
      pushLog("error", `ERROR: ${error instanceof Error ? error.message : "No se pudo generar el respaldo de la tabla."}`);
      pushLog("warn", "El proceso fue interrumpido. Verifica la conexión con el servidor.");
      setConsoleStatus("error");
    } finally {
      setConsoleRunning(false);
      setGeneratingTableBackup(false);
    }
  }

  useEffect(() => {
    if (maintenanceSchedule) {
      setMaintenanceForm({
        enabled: maintenanceSchedule.enabled,
        everyDays: String(maintenanceSchedule.everyDays),
        runAtTime: maintenanceSchedule.runAtTime,
        operation: maintenanceSchedule.operation,
        schemaName: maintenanceSchedule.schemaName || "public",
        tableName: maintenanceSchedule.tableName || "",
      });
    } else {
      setMaintenanceForm(defaultMaintenanceForm);
    }
  }, [maintenanceSchedule]);

  async function handleRunMaintenance() {
    if (!user) return;
    try {
      setRunningMaintenance(true);
      const payload = {
        operation: maintenanceForm.operation,
        schemaName: maintenanceForm.schemaName || null,
        tableName: maintenanceForm.tableName || null,
      };
      await runMaintenance(payload);
      toast.success("Mantenimiento ejecutado exitosamente.");
      await loadDatabaseStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al ejecutar mantenimiento.");
    } finally {
      setRunningMaintenance(false);
    }
  }

  async function handleSaveMaintenanceSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const everyDays = Number(maintenanceForm.everyDays);
    if (!Number.isInteger(everyDays) || everyDays < 1) {
      toast.error("Los días deben ser un número válido.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(maintenanceForm.runAtTime.trim())) {
      toast.error("La hora debe tener formato HH:mm.");
      return;
    }

    try {
      setSavingMaintenanceSchedule(true);
      const payload = {
        enabled: maintenanceForm.enabled,
        everyDays,
        runAtTime: maintenanceForm.runAtTime,
        operation: maintenanceForm.operation,
        schemaName: maintenanceForm.schemaName || null,
        tableName: maintenanceForm.tableName || null,
      };
      const result = await updateMaintenanceSchedule(payload);
      setMaintenanceSchedule(result.schedule);
      toast.success("Programación de mantenimiento actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar programación.");
    } finally {
      setSavingMaintenanceSchedule(false);
    }
  }

  async function handleRemoveMaintenanceSchedule() {
    if (!user) return;
    if (!window.confirm("¿Seguro que deseas eliminar la programación de mantenimiento?")) return;
    try {
      setSavingMaintenanceSchedule(true);
      const result = await deleteMaintenanceSchedule();
      setMaintenanceSchedule(result.schedule || null);
      toast.success("Programación de mantenimiento eliminada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar programación.");
    } finally {
      setSavingMaintenanceSchedule(false);
    }
  }

  async function downloadBackupRecord(backup: DatabaseBackupRecord) {
    if (!user) return;

    try {
      setDownloadingBackupId(backup.id);
      const download = await downloadDatabaseBackupById(backup.id);
      const saved = await saveBlobAsFile(download.blob, download.fileName);

      if (!saved) {
        toast.error("Descarga cancelada.");
        return;
      }

      toast.success(`Respaldo descargado: ${download.fileName}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo descargar el respaldo.",
      );
    } finally {
      setDownloadingBackupId(null);
    }
  }

  async function saveSchedule() {
    if (!user) return;

    const validationError = validateScheduleForm(scheduleForm);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSavingSchedule(true);
      const result = await updateDatabaseBackupSchedule({
        enabled: scheduleForm.enabled,
        everyDays: Number(scheduleForm.everyDays),
        runAtTime: scheduleForm.runAtTime.trim(),
        retentionDays: Number(scheduleForm.retentionDays),
      });
      setBackupSchedule(result.schedule);
      toast.success(
        result.message ||
          "La programación automática de respaldos se actualizó correctamente.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la programación automática.",
      );
    } finally {
      setSavingSchedule(false);
    }
  }

  async function executePendingAction() {
    if (!user || !pendingAction) return;

    if (pendingAction.kind === "restore-backup") {
      const targetBackup = pendingAction.backup;
      setPendingAction(null);
      openConsole("restore");

      try {
        pushLog("cmd", `$ pg_restore --clean --if-exists --no-owner -d cemydi_db ${targetBackup.fileName}`);
        await sleep(300);
        pushLog("info", `Descargando ${targetBackup.fileName} desde Google Drive...`);
        await sleep(400);
        pushLog("info", `Tamaño del archivo: ${formatBytes(targetBackup.sizeBytes)}`);
        await sleep(200);
        pushLog("warn", "ADVERTENCIA: Los datos actuales serán reemplazados permanentemente.");
        await sleep(300);
        pushLog("info", "Iniciando pg_restore...");

        const result = await restoreDatabaseBackupById(targetBackup.id);

        if (result.logText) {
          const lines = result.logText.split("\n").filter((l) => l.trim());
          for (const line of lines) {
            const trimmed = line.trim();
            const kind: ConsoleLogKind =
              trimmed.startsWith("pg_restore: error")
                ? "error"
                : trimmed.startsWith("pg_restore: warning")
                  ? "warn"
                  : "info";
            pushLog(kind, trimmed);
            await sleep(12);
          }
        }

        pushLog("success", "Base de datos restaurada exitosamente ✓");
        pushLog("info", "Recargando estado del sistema...");
        setConsoleStatus("success");
        await loadDatabaseStats();
        pushLog("success", "Estado actualizado ✓");
      } catch (error) {
        const msg = error instanceof Error ? error.message : "No se pudo restaurar la base de datos.";
        const lines = msg.split("\n").filter((l) => l.trim());
        for (const line of lines) {
          pushLog("error", line.trim());
        }
        pushLog("warn", "Verifica que pg_restore esté instalado y que el archivo exista en Google Drive.");
        setConsoleStatus("error");
      } finally {
        setConsoleRunning(false);
      }

      return;
    }

    if (pendingAction.kind === "delete-backup") {
      try {
        setDeletingBackupId(pendingAction.backup.id);
        const result = await deleteDatabaseBackupRecord(pendingAction.backup.id);
        setBackupRecords((current) =>
          current.filter((item) => item.id !== pendingAction.backup.id),
        );
        toast.success(
          result.message ||
            `Respaldo eliminado: ${pendingAction.backup.fileName}`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el respaldo.",
        );
      } finally {
        setDeletingBackupId(null);
        setPendingAction(null);
      }

      return;
    }

    try {
      setSavingSchedule(true);
      const result = await deleteDatabaseBackupSchedule();
      setBackupSchedule(result.schedule);
      toast.success(
        result.message || "La programación automática fue eliminada.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la programación automática.",
      );
    } finally {
      setSavingSchedule(false);
      setPendingAction(null);
    }
  }

  return {
    dbStatus,
    securityOverview,
    backupRecords,
    backupSchedule,
    scheduleForm,
    setScheduleForm,
    loadingDbStatus,
    loadingBackupRecords,
    loadingBackupSchedule,
    loadingAuthSecurityOverview,
    initialLoading,
    selectedBackupTable,
    setSelectedBackupTable,
    historyQuery,
    setHistoryQuery,
    backupPage,
    setBackupPage,
    generatingBackup,
    generatingTableBackup,
    savingSchedule,
    downloadingBackupId,
    deletingBackupId,
    pendingAction,
    setPendingAction,
    maintenanceSchedule,
    maintenanceForm,
    setMaintenanceForm,
    loadingMaintenanceSchedule,
    savingMaintenanceSchedule,
    runningMaintenance,
    allSessionsOpen,
    setAllSessionsOpen,
    allAuditOpen,
    setAllAuditOpen,
    mainTab,
    setMainTab,
    scheduleDialogOpen,
    setScheduleDialogOpen,
    tableBackupDialogOpen,
    setTableBackupDialogOpen,
    databaseSummaryOpen,
    setDatabaseSummaryOpen,
    consoleOpen,
    setConsoleOpen,
    consoleLogs,
    consoleOpType,
    consoleRunning,
    consoleStatus,
    consoleEndRef,
    dbTableItems,
    heaviestDbTable,
    securitySummary,
    activeSessions,
    loginAuditItems,
    visibleActiveSessions,
    visibleLoginAuditItems,
    filteredBackups,
    totalBackupPages,
    currentBackupPage,
    paginatedBackups,
    anyLoading,
    loadDatabaseStats,
    loadAuthSecurityOverviewData,
    loadBackupRecordsData,
    loadBackupScheduleData,
    loadMaintenanceScheduleData,
    refreshAllData,
    syncScheduleFormWithCurrentRecord,
    openScheduleDialog,
    generateBackup,
    generateSingleTableBackup,
    handleRunMaintenance,
    handleSaveMaintenanceSchedule,
    handleRemoveMaintenanceSchedule,
    downloadBackupRecord,
    saveSchedule,
    executePendingAction,
  };
}

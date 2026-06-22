import type { DatabaseBackupRecord } from "@/services/admin";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(value);
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Sin datos";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Sin datos";
  }

  return parsed.toLocaleString("es-MX");
}

export function formatScheduleDateTime(value: string | null) {
  if (!value) {
    return "Sin programar";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Sin programar";
  }

  return parsed.toLocaleString("es-MX");
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) {
    return "Sin actividad reciente";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Sin actividad reciente";
  }

  const diffMs = Date.now() - parsed.getTime();

  if (diffMs < 60_000) {
    return "Hace un momento";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}

export function formatUptime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "Sin datos";
  }

  const totalSeconds = Math.floor(seconds);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function formatTableName(tableName: string) {
  return tableName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatAuditReason(reason: string | null) {
  switch (reason) {
    case "LOGIN_OK":
      return "Acceso correcto";
    case "USER_NOT_FOUND":
      return "Usuario no encontrado";
    case "INVALID_PASSWORD":
      return "Password incorrecto";
    case "USER_INACTIVE":
      return "Usuario inactivo";
    default:
      return reason ? reason.replace(/_/g, " ") : "Sin detalle";
  }
}

export function formatBackupRecordDate(backup: DatabaseBackupRecord) {
  const fileNameMatch = backup.fileName.match(/_(\d{8})_(\d{6})(\d{0,3})\.tar$/i);
  if (fileNameMatch) {
    const [, datePart, timePart, millisecondPart] = fileNameMatch;
    const year = Number(datePart.slice(0, 4));
    const month = Number(datePart.slice(4, 6));
    const day = Number(datePart.slice(6, 8));
    const hour = Number(timePart.slice(0, 2));
    const minute = Number(timePart.slice(2, 4));
    const second = Number(timePart.slice(4, 6));
    const millisecond = Number((millisecondPart || "").padEnd(3, "0") || "0");
    const parsedFromFileName = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond,
    );

    if (!Number.isNaN(parsedFromFileName.getTime())) {
      return parsedFromFileName.toLocaleString("es-MX");
    }
  }

  const parsedCreatedAt = new Date(backup.createdAt);
  if (!Number.isNaN(parsedCreatedAt.getTime())) {
    return parsedCreatedAt.toLocaleString("es-MX");
  }

  return "Sin fecha";
}

export function getInitialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "NA";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function nowTime() {
  return new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

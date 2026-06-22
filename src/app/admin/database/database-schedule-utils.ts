import type { DatabaseBackupSchedule } from "@/services/admin";
import {
  defaultScheduleForm,
  type ScheduleFormState,
} from "./database-types";

export function toScheduleForm(
  schedule: DatabaseBackupSchedule | null,
): ScheduleFormState {
  if (!schedule) {
    return defaultScheduleForm;
  }

  return {
    enabled: schedule.enabled,
    everyDays: String(schedule.everyDays),
    runAtTime: schedule.runAtTime,
    retentionDays: String(schedule.retentionDays),
  };
}

export function validateScheduleForm(form: ScheduleFormState) {
  const everyDays = Number(form.everyDays);
  const retentionDays = Number(form.retentionDays);

  if (!Number.isInteger(everyDays) || everyDays < 1 || everyDays > 365) {
    return "Cada cuántos días debe ser un número entero entre 1 y 365.";
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.runAtTime.trim())) {
    return "La hora debe tener formato HH:mm.";
  }

  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
    return "La retención debe ser un número entero entre 1 y 3650 días.";
  }

  return null;
}

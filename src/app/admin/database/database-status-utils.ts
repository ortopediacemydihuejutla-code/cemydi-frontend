import type { DatabaseStatus } from "@/services/admin";
import { formatBytes } from "./database-formatters";

export function normalizeDatabaseStatus(
  status: Partial<DatabaseStatus> | null | undefined,
): DatabaseStatus {
  const sizeBytes =
    typeof status?.sizeBytes === "number" && Number.isFinite(status.sizeBytes)
      ? status.sizeBytes
      : 0;

  const connections = status?.connections;
  const transactions = status?.transactions;
  const tables = status?.tables;
  const tableItems = Array.isArray(tables?.items) ? tables.items : [];
  const totalSizeBytes =
    typeof tables?.totalSizeBytes === "number" &&
    Number.isFinite(tables.totalSizeBytes)
      ? tables.totalSizeBytes
      : tableItems.reduce((sum, table) => {
          const tableSize =
            typeof table.sizeBytes === "number" && Number.isFinite(table.sizeBytes)
              ? table.sizeBytes
              : 0;
          return sum + tableSize;
        }, 0);

  return {
    checkedAt: typeof status?.checkedAt === "string" ? status.checkedAt : "",
    isOnline: Boolean(status?.isOnline),
    databaseName:
      typeof status?.databaseName === "string" ? status.databaseName : "",
    dbVersion: typeof status?.dbVersion === "string" ? status.dbVersion : "",
    uptimeSeconds:
      typeof status?.uptimeSeconds === "number" &&
      Number.isFinite(status.uptimeSeconds)
        ? status.uptimeSeconds
        : 0,
    sizeBytes,
    sizePretty:
      typeof status?.sizePretty === "string" && status.sizePretty.trim()
        ? status.sizePretty
        : formatBytes(sizeBytes),
    connections: {
      total:
        typeof connections?.total === "number" && Number.isFinite(connections.total)
          ? connections.total
          : 0,
      active:
        typeof connections?.active === "number" &&
        Number.isFinite(connections.active)
          ? connections.active
          : 0,
      idle:
        typeof connections?.idle === "number" && Number.isFinite(connections.idle)
          ? connections.idle
          : 0,
    },
    transactions: {
      commits:
        typeof transactions?.commits === "number" &&
        Number.isFinite(transactions.commits)
          ? transactions.commits
          : 0,
      rollbacks:
        typeof transactions?.rollbacks === "number" &&
        Number.isFinite(transactions.rollbacks)
          ? transactions.rollbacks
          : 0,
    },
    tables: {
      totalRows:
        typeof tables?.totalRows === "number" && Number.isFinite(tables.totalRows)
          ? tables.totalRows
          : tableItems.reduce((sum, table) => {
              const rowCount =
                typeof table.rowCount === "number" && Number.isFinite(table.rowCount)
                  ? table.rowCount
                  : 0;
              return sum + rowCount;
            }, 0),
      totalSizeBytes,
      totalSizePretty:
        typeof tables?.totalSizePretty === "string" && tables.totalSizePretty.trim()
          ? tables.totalSizePretty
          : formatBytes(totalSizeBytes),
      items: tableItems.map((table) => {
        const tableSize =
          typeof table.sizeBytes === "number" && Number.isFinite(table.sizeBytes)
            ? table.sizeBytes
            : 0;

        return {
          tableName:
            typeof table.tableName === "string" ? table.tableName : "unknown_table",
          rowCount:
            typeof table.rowCount === "number" && Number.isFinite(table.rowCount)
              ? table.rowCount
              : 0,
          sizeBytes: tableSize,
          sizePretty:
            typeof table.sizePretty === "string" && table.sizePretty.trim()
              ? table.sizePretty
              : formatBytes(tableSize),
        };
      }),
    },
    backup: {
      format:
        typeof status?.backup?.format === "string" && status.backup.format.trim()
          ? status.backup.format
          : "tar",
      fileExtension:
        typeof status?.backup?.fileExtension === "string" &&
        status.backup.fileExtension.trim()
          ? status.backup.fileExtension
          : "tar",
      provider:
        typeof status?.backup?.provider === "string" &&
        status.backup.provider.trim()
          ? status.backup.provider
          : undefined,
    },
  };
}

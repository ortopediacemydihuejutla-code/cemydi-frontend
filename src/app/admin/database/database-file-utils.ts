import type { SavePickerWindow } from "./database-types";

export async function saveBlobAsFile(blob: Blob, fileName: string) {
  const safeWindow = window as SavePickerWindow;

  if (typeof safeWindow.showSaveFilePicker === "function") {
    try {
      const handle = await safeWindow.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "Respaldo de base de datos (.tar)",
            accept: {
              "application/x-tar": [".tar"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return false;
      }
      throw error;
    }
  }

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
  return true;
}

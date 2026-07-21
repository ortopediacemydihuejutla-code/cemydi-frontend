export const PRESCRIPTION_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp";

const ALLOWED_MIME_BY_EXTENSION = new Map([
  ["pdf", "application/pdf"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
]);

export const MAX_PRESCRIPTION_BYTES = 8 * 1024 * 1024;

export function validatePrescriptionFile(file: File) {
  if (file.size <= 0) return "La receta está vacía.";

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const expectedMime = ALLOWED_MIME_BY_EXTENSION.get(extension);
  if (!expectedMime || file.type !== expectedMime) {
    return "La extensión y el tipo de archivo deben corresponder a PDF, JPG, JPEG, PNG o WEBP.";
  }

  if (file.size > MAX_PRESCRIPTION_BYTES) {
    return "La receta no debe superar 8 MB.";
  }

  return null;
}

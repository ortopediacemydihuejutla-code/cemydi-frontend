import { adminRequest } from "./request";
import type { AboutPageContent } from "@/services/about-page";

export type UpdateAboutPagePayload = Omit<
  AboutPageContent,
  "id" | "updatedAt" | "createdAt"
>;

export type UpdateAboutPageOptions = {
  heroImageFile?: File | null;
  secondaryImageFile?: File | null;
};

export async function getAdminAboutPage() {
  return adminRequest<{ aboutPage: AboutPageContent | null }>("/about-page");
}

function buildAboutPageFormData(
  payload: UpdateAboutPagePayload,
  options?: UpdateAboutPageOptions,
) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "values" && Array.isArray(value)) {
      value.forEach((item) => formData.append("values", item));
      return;
    }

    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });

  if (options?.heroImageFile) {
    formData.append("heroImage", options.heroImageFile);
  }

  if (options?.secondaryImageFile) {
    formData.append("secondaryImage", options.secondaryImageFile);
  }

  return formData;
}

export async function updateAdminAboutPage(
  payload: UpdateAboutPagePayload,
  options?: UpdateAboutPageOptions,
) {
  const body =
    options?.heroImageFile || options?.secondaryImageFile
      ? buildAboutPageFormData(payload, options)
      : JSON.stringify(payload);

  return adminRequest<{
    message: string;
    aboutPage: AboutPageContent;
  }>("/about-page", {
    method: "PATCH",
    body,
  });
}

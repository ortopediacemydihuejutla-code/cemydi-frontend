import { ApiError, ApiResponseValidationError } from "@/lib/api-error";
export function canUseOfflineFallback(error: unknown) {
  return error instanceof TypeError || (error instanceof ApiError && !(error instanceof ApiResponseValidationError) && error.status >= 500 && error.status <= 599);
}

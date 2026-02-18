import { INTERNAL_API_KEY } from "@/lib/config";

export function hasInternalAccess(request: Request): boolean {
  if (!INTERNAL_API_KEY) {
    return false;
  }

  return request.headers.get("x-internal-api-key") === INTERNAL_API_KEY;
}

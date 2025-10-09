import { ApiResponse } from "../../shared/types"
type QueryParamValue = string | number | string[] | undefined | null;
type QueryParams = Record<string, QueryParamValue>;
export async function api<T>(path: string, init?: RequestInit, params?: QueryParams): Promise<T> {
  try {
    const url = new URL(path, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              url.searchParams.append(key, value.join(','));
            }
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }
    const res = await fetch(url.toString(), { headers: { 'Content-Type': 'application/json' }, ...init });
    if (!res.ok) {
      const errorText = await res.text();
      try {
        // Try to parse as our standard error format
        const jsonError = JSON.parse(errorText) as ApiResponse;
        throw new Error(jsonError.error || `Request failed with status ${res.status}`);
      } catch (e) {
        // If parsing fails, it's not our standard error format (e.g., HTML error page)
        const truncatedError = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText;
        throw new Error(truncatedError || `Request failed with status ${res.status}`);
      }
    }
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success || json.data === undefined) {
      throw new Error(json.error || 'API returned success=false but no error message');
    }
    return json.data;
  } catch (error) {
    console.error(`API Client Error:`, error);
    if (error instanceof Error) {
      throw error; // Re-throw if it's already a standard Error object
    }
    // Ensure we always throw a standard Error object
    throw new Error('An unexpected network error occurred. Please check your connection.');
  }
}
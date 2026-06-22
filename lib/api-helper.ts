export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export async function safeApiCall<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, init);

    // 1. Check response first: if (!res.ok) -> return structured error
    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: 'Service temporarily unavailable'
      };
    }

    // 2. Validate content-type: must include "application/json"
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        data: null,
        error: 'Service temporarily unavailable'
      };
    }

    // 3. Only then parse JSON safely
    const payload = await res.json();
    if (payload && typeof payload === 'object' && 'success' in payload) {
      return {
        success: payload.success,
        data: payload.data ?? null,
        error: payload.error ?? null
      };
    }

    return {
      success: true,
      data: payload as T,
      error: null
    };
  } catch (err: any) {
    console.error('[safeApiCall] Exception:', err);
    return {
      success: false,
      data: null,
      error: 'Service temporarily unavailable'
    };
  }
}

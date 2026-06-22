export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export async function safeFetch<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, init);

    // 1. Check response first
    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: 'Service temporarily unavailable'
      };
    }

    // 2. Validate content-type is application/json
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        data: null,
        error: 'Service temporarily unavailable'
      };
    }

    // 3. Parse JSON safely
    const payload = await res.json();

    if (payload && typeof payload === 'object') {
      return {
        success: typeof payload.success === 'boolean' ? payload.success : true,
        data: 'data' in payload ? payload.data : payload,
        error: typeof payload.error === 'string' ? payload.error : null
      };
    }

    return {
      success: true,
      data: payload as T,
      error: null
    };
  } catch (err: any) {
    console.error('[safeFetch] Exception:', err);
    return {
      success: false,
      data: null,
      error: 'Service temporarily unavailable'
    };
  }
}

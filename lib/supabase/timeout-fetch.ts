/**
 * Custom fetch wrapper with timeout functionality using AbortController.
 * This wraps Supabase client requests only, preserving Next.js fetch extensions,
 * cookies, headers, and cache settings.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  // Merge any signal already present on the request
  if (init?.signal) {
    const originalSignal = init.signal;
    if (originalSignal.aborted) {
      controller.abort();
    } else {
      originalSignal.addEventListener('abort', () => {
        controller.abort();
      });
    }
  }

  // Preserve all original fetch options (next, cache, headers, cookies, credentials, etc.)
  const fetchOptions: RequestInit = {
    ...init,
    signal: controller.signal,
  };

  try {
    const response = await fetch(input, fetchOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : (input as Request).url || 'unknown url');
      console.warn(`[TimeoutFetch] Supabase request to ${urlStr} aborted after ${timeoutMs}ms`);
      throw new Error(`ConnectTimeoutError: Connect Timeout Error to Supabase after ${timeoutMs}ms`);
    }
    
    throw error;
  }
}

/**
 * Helper function to call Dixa API through Netlify Function proxy
 * This avoids CORS issues when calling the Dixa API directly from the browser
 */
export async function dixaApi<T = any>(
  apiToken: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const response = await fetch('/.netlify/functions/dixa-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiToken,
      endpoint,
      method,
      body,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'API request failed' }));
    throw new Error(error.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}

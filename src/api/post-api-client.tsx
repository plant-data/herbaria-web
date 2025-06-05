/**
 * A generic API client for making POST requests.
 * It centralizes fetch logic, headers, and error handling.
 * @param url - The endpoint URL.
 * @param body - The request payload.
 * @param signal - An AbortSignal for query cancellation.
 * @returns The JSON response from the server.
 */
export async function postApiClient<T>(
  url: string,
  body: T,
  signal: AbortSignal
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    // Provide more context in error messages.
    const errorText = await response.text();
    throw new Error(
      `API request failed with status ${response.status}: ${errorText}`
    );
  }

  return response.json();
};
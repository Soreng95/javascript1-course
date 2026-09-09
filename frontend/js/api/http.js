import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config.js';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const NETWORK_MESSAGE =
  'Could not reach the Rainy Days API. Make sure the backend is running on port 8080, then try again.';

const TIMEOUT_MESSAGE = 'The request took too long to respond. Please try again.';

const readBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const messageFor = (body, response) => {
  if (body && typeof body === 'object' && body.message) {
    return Array.isArray(body.message) ? body.message.join(' ') : body.message;
  }

  if (response.status === 404) return 'We could not find what you were looking for.';

  return `Something went wrong (${response.status}). Please try again.`;
};

export const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });

    const body = await readBody(response);

    if (!response.ok) {
      throw new ApiError(messageFor(body, response), response.status);
    }

    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') throw new ApiError(TIMEOUT_MESSAGE);
    throw new ApiError(NETWORK_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
};

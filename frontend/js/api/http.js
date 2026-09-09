import { DEBUG, REQUEST_TIMEOUT_MS } from '../config.js';
import { toAbsoluteUrl } from './endpoints.js';
import { ValidationError, isFunction, isNonEmptyString, isObject } from '../lib/types.js';

export class ApiError extends Error {
  constructor(message, status = 0, body = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const NETWORK_MESSAGE =
  'Could not reach the Rainy Days API. Make sure the backend is running, then try again.';

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
  if (isObject(body) && body.message) {
    return Array.isArray(body.message) ? body.message.join(' ') : body.message;
  }

  if (response.status === 404) return 'We could not find what you were looking for.';
  if (response.status === 400) return 'That request was not valid. Please check the details and try again.';

  return `Something went wrong (${response.status}). Please try again.`;
};

export const request = async (endpoint, { method = 'GET', body, validate, headers } = {}) => {
  if (!isNonEmptyString(endpoint)) {
    throw new ValidationError('endpoint must be a non-empty string', { field: 'endpoint' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = toAbsoluteUrl(endpoint);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const payload = await readBody(response);

    if (!response.ok) {
      throw new ApiError(messageFor(payload, response), response.status, payload);
    }

    if (isFunction(validate)) return validate(payload);

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof ValidationError) {
      if (DEBUG) window.console.error(`${method} ${url} returned unexpected data`, error);
      throw new ApiError(
        'The server returned data in an unexpected format. Please try again later.',
        0,
        error.message,
      );
    }
    if (error.name === 'AbortError') throw new ApiError(TIMEOUT_MESSAGE);
    throw new ApiError(NETWORK_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const get = (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' });

export const post = (endpoint, body, options = {}) =>
  request(endpoint, { ...options, method: 'POST', body });

export const put = (endpoint, body, options = {}) =>
  request(endpoint, { ...options, method: 'PUT', body });

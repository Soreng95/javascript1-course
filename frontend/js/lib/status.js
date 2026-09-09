import { clear, el } from './dom.js';

export const showLoading = (container, message = 'Loading') => {
  if (!container) return;

  clear(container);
  container.setAttribute('aria-busy', 'true');
  container.append(
    el('div', { class: 'status status--loading', role: 'status' }, [
      el('span', { class: 'status__spinner', 'aria-hidden': 'true' }),
      el('p', { class: 'status__message', text: message }),
    ]),
  );
};

export const showError = (container, message, onRetry) => {
  if (!container) return;

  clear(container);
  container.setAttribute('aria-busy', 'false');
  container.append(
    el('div', { class: 'status status--error', role: 'alert' }, [
      el('p', { class: 'status__message', text: message }),
      onRetry &&
        el('button', { class: 'status__retry', type: 'button', onclick: onRetry, text: 'Try again' }),
    ]),
  );
};

export const showEmpty = (container, message) => {
  if (!container) return;

  clear(container);
  container.setAttribute('aria-busy', 'false');
  container.append(
    el('div', { class: 'status status--empty', role: 'status' }, [
      el('p', { class: 'status__message', text: message }),
    ]),
  );
};

export const clearStatus = (container) => {
  if (!container) return;

  clear(container);
  container.setAttribute('aria-busy', 'false');
};

export const withStatus = async (container, task, { loadingMessage, onRetry } = {}) => {
  showLoading(container, loadingMessage);

  try {
    const result = await task();
    clearStatus(container);
    return result;
  } catch (error) {
    showError(container, error.message, onRetry);
    return null;
  }
};

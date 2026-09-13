import '../main.js';
import { createOrder } from '../api/orders.js';
import { initCartView } from '../components/cart-view.js';
import { renderSuggestions } from '../components/suggestions.js';
import { qs } from '../lib/dom.js';
import { clearCart, isEmpty, toOrderPayload } from '../store/cart.js';
import { routes } from '../routes.js';

const form = qs('[data-checkout-form]');
const payButton = qs('[data-pay]');
const feedback = qs('[data-checkout-feedback]');

const say = (message, isError = false) => {
  feedback.textContent = message;
  feedback.classList.toggle('checkout-feedback--error', isError);
};

const submit = async (event) => {
  event.preventDefault();

  if (isEmpty()) {
    say('Your cart is empty.', true);
    return;
  }

  if (!form.reportValidity()) return;

  payButton.disabled = true;
  say('Placing your order...');

  try {
    const order = await createOrder(toOrderPayload(form.elements.email.value));
    clearCart();
    window.location.href = routes.confirmation(order.id);
  } catch (error) {
    say(error.message, true);
    payButton.disabled = false;
  }
};

form.addEventListener('submit', submit);

initCartView('checkout');
renderSuggestions();

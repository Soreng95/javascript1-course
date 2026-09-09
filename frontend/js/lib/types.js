// javascript => typescript 

export class ValidationError extends Error {
  constructor(message, { field = null, expected = null, received = null } = {}) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.expected = expected;
    this.received = received;
  }
}

export const typeOf = (value) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isNaN(value)) return 'NaN';
  return typeof value;
};

export const isNullish = (value) => value === null || value === undefined;

export const isString = (value) => typeof value === 'string';

export const isNonEmptyString = (value) => isString(value) && value.trim().length > 0;

export const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export const isInteger = (value) => Number.isInteger(value);

export const isPositiveNumber = (value) => isNumber(value) && value > 0;

export const isBoolean = (value) => typeof value === 'boolean';

export const isArray = (value) => Array.isArray(value);

export const isArrayOf = (value, guard) => isArray(value) && value.every((entry) => guard(entry));

export const isObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isFunction = (value) => typeof value === 'function';

export const isOneOf = (value, allowed) => isArray(allowed) && allowed.includes(value);

export const isEmail = (value) => isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isUrl = (value) => {
  if (!isNonEmptyString(value)) return false;

  try {
    return Boolean(new URL(value, window.location.origin));
  } catch {
    return false;
  }
};

const fail = (field, expected, received) => {
  throw new ValidationError(
    `${field} must be ${expected}, received ${typeOf(received)}`,
    { field, expected, received },
  );
};

export const assert = (condition, message) => {
  if (!condition) throw new ValidationError(message);
  return true;
};

export const assertString = (value, field = 'value') =>
  isString(value) ? value : fail(field, 'a string', value);

export const assertNonEmptyString = (value, field = 'value') =>
  isNonEmptyString(value) ? value : fail(field, 'a non-empty string', value);

export const assertNumber = (value, field = 'value') =>
  isNumber(value) ? value : fail(field, 'a number', value);

export const assertInteger = (value, field = 'value') =>
  isInteger(value) ? value : fail(field, 'an integer', value);

export const assertPositiveNumber = (value, field = 'value') =>
  isPositiveNumber(value) ? value : fail(field, 'a positive number', value);

export const assertBoolean = (value, field = 'value') =>
  isBoolean(value) ? value : fail(field, 'a boolean', value);

export const assertArray = (value, field = 'value') =>
  isArray(value) ? value : fail(field, 'an array', value);

export const assertObject = (value, field = 'value') =>
  isObject(value) ? value : fail(field, 'an object', value);

export const assertOneOf = (value, allowed, field = 'value') =>
  isOneOf(value, allowed) ? value : fail(field, `one of ${allowed.join(', ')}`, value);

export const ensure = (value, guard, fallback) => (guard(value) ? value : fallback);

export const ensureString = (value, fallback = '') => ensure(value, isString, fallback);

export const ensureNumber = (value, fallback = 0) => ensure(value, isNumber, fallback);

export const ensureBoolean = (value, fallback = false) => ensure(value, isBoolean, fallback);

export const ensureArray = (value, fallback = []) => ensure(value, isArray, fallback);

export const ensureObject = (value, fallback = {}) => ensure(value, isObject, fallback);

export const field = {
  string: { check: isString, expected: 'a string' },
  nonEmptyString: { check: isNonEmptyString, expected: 'a non-empty string' },
  number: { check: isNumber, expected: 'a number' },
  integer: { check: isInteger, expected: 'an integer' },
  positiveNumber: { check: isPositiveNumber, expected: 'a positive number' },
  boolean: { check: isBoolean, expected: 'a boolean' },
  array: { check: isArray, expected: 'an array' },
  object: { check: isObject, expected: 'an object' },
  stringArray: { check: (value) => isArrayOf(value, isString), expected: 'an array of strings' },
  email: { check: isEmail, expected: 'an email address' },
  url: { check: isUrl, expected: 'a URL' },
};

export const optional = (rule) => ({ ...rule, optional: true });

export const shapeOf = (schema) => ({
  check: (value) => isValidShape(value, schema),
  expected: 'an object',
  schema,
});

export const validateShape = (value, schema, label = 'value') => {
  assertObject(value, label);

  Object.entries(schema).forEach(([key, rule]) => {
    const entry = value[key];
    const path = `${label}.${key}`;

    if (isNullish(entry)) {
      if (rule.optional) return;
      throw new ValidationError(`${path} is required`, { field: path, expected: rule.expected });
    }

    if (rule.schema) {
      validateShape(entry, rule.schema, path);
      return;
    }

    if (!rule.check(entry)) fail(path, rule.expected, entry);
  });

  return value;
};

export const isValidShape = (value, schema) => {
  try {
    validateShape(value, schema);
    return true;
  } catch {
    return false;
  }
};

export const validateList = (value, schema, label = 'list') => {
  assertArray(value, label);
  value.forEach((entry, index) => validateShape(entry, schema, `${label}[${index}]`));
  return value;
};

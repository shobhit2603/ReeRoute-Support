/**
 * Wraps an async Express route handler and forwards any thrown errors
 * to the next() middleware, eliminating repetitive try/catch blocks.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

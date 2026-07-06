import ApiError from '../utils/apiError.js';

/**
 * Middleware factory for request validation using Zod schemas.
 * Validates req.body, req.query, and req.params against the provided schema.
 *
 * @param {import('zod').ZodObject} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => {
        const path = issue.path.join('.');
        return `${path}: ${issue.message}`;
      });
      return next(new ApiError(400, errorMessages.join('; ')));
    }

    next();
  };
};

export default validateRequest;

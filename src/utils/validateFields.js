import createError from 'http-errors'
/**
 * Validates that only allowed fields are present in the body.
 *
 * @private
 * @param {object} body - The request body.
 * @param {string[]} allowedFields - The list of allowed fields.
 */
export function validateAllowedFields (body, allowedFields) {
  const invalidFields = Object.keys(body).filter(field => !allowedFields.includes(field))
  if (invalidFields.length > 0) {
    throw createError(400, `You cant update the following fields: ${invalidFields.join(', ')}`)
  }
}

/**
 * Validates that all required fields are present.
 *
 * @private
 * @param {object} body - The object to validate.
 * @param {string[]} requiredFields - Array of required field names.
 */
export function validateRequiredFields (body, requiredFields) {
  const missing = requiredFields.filter(field => !body[field])
  if (missing.length > 0) {
    throw createError(400, `Missing required fields: ${missing.join(', ')}`)
  }
}

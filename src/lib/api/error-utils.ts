/**
 * Utility functions for parsing API validation errors.
 * Handles both ASP.NET ProblemDetails format and FluentValidation array format.
 */

/**
 * FluentValidation error item format
 */
interface FluentValidationError {
  field: string
  message: string
}

/**
 * ASP.NET ProblemDetails errors format
 */
type ProblemDetailsErrors = Record<string, string[]>

/**
 * Union type for validation errors from API
 */
type ValidationErrors = ProblemDetailsErrors | FluentValidationError[]

/**
 * Normalized validation error format
 */
export interface ParsedValidationError {
  field: string
  messages: string[]
}

/**
 * Parse validation errors from API response.
 * Handles both formats:
 * - ASP.NET ProblemDetails: { Title: ["msg1", "msg2"], DueDate: ["msg"] }
 * - FluentValidation array: [{ field: "Title", message: "msg" }]
 */
export function parseValidationErrors(
  errors: ValidationErrors | undefined
): ParsedValidationError[] {
  if (!errors) {
    return []
  }

  // Check if it's FluentValidation array format
  if (Array.isArray(errors)) {
    const grouped = new Map<string, string[]>()
    for (const error of errors) {
      if (error.field && error.message) {
        const existing = grouped.get(error.field) || []
        existing.push(error.message)
        grouped.set(error.field, existing)
      }
    }
    return Array.from(grouped.entries()).map(([field, messages]) => ({
      field,
      messages,
    }))
  }

  // ProblemDetails format: Record<string, string[]>
  if (typeof errors === 'object') {
    return Object.entries(errors).map(([field, messages]) => ({
      field,
      messages: Array.isArray(messages) ? messages : [String(messages)],
    }))
  }

  return []
}

/**
 * Format field name for display (e.g., "DueDate" -> "Due Date")
 */
function formatFieldName(field: string): string {
  // Handle nested fields like "request.title" or "$[0].field"
  const baseName = field.split('.').pop() || field
  // Remove array notation
  const cleanName = baseName.replace(/\[\d+\]/g, '')
  // Convert camelCase/PascalCase to Title Case with spaces
  return cleanName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (str) => str.toUpperCase())
}

/**
 * Format parsed validation errors into a readable string.
 * Returns a string like "Title: Error message. Due Date: Another error."
 */
export function formatValidationErrors(
  errors: ParsedValidationError[]
): string {
  if (errors.length === 0) {
    return ''
  }

  return errors
    .map(({ field, messages }) => {
      const fieldName = formatFieldName(field)
      const messagesText = messages.join(' ')
      return `${fieldName}: ${messagesText}`
    })
    .join(' ')
}

/**
 * API error structure from the client interceptor
 */
interface ApiErrorWithValidation {
  message?: string
  errors?: ValidationErrors
}

/**
 * Extract the best error message from an API error.
 * Prioritizes specific validation errors over generic messages.
 */
export function getValidationErrorMessage(
  error: unknown,
  fallback: string = 'An error occurred'
): string {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const apiError = error as ApiErrorWithValidation

  // First, try to parse validation errors
  if (apiError.errors) {
    const parsed = parseValidationErrors(apiError.errors)
    if (parsed.length > 0) {
      return formatValidationErrors(parsed)
    }
  }

  // Fall back to message if available and not a generic validation message
  if (apiError.message) {
    const genericMessages = [
      'One or more validation errors occurred.',
      'Validation failed',
      'Bad Request',
    ]
    if (!genericMessages.some((msg) => apiError.message?.includes(msg))) {
      return apiError.message
    }
  }

  return fallback
}

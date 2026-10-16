import { z } from 'zod'

// Spaces between words are fine; leading spaces and space-only values are not.

/** Compulsory text: rejects only-spaces and a leading space, and checks the trimmed length. */
export function requiredText(schema: z.ZodString, label: string, minLength = 1) {
  return schema
    .refine((val) => val.trim().length > 0, `${label} cannot be only spaces`)
    .refine((val) => !val.trim() || !/^\s/.test(val), `${label} cannot start with a space`)
    .refine(
      (val) => !val.trim() || val.trim().length >= minLength,
      `${label} must be at least ${minLength} characters`
    )
}

/** Optional text: empty is allowed, but only-spaces and a leading space are not. */
export function optionalText(schema: z.ZodString, label: string) {
  return schema
    .optional()
    .refine((val) => !val || val.trim().length > 0, `${label} cannot be only spaces`)
    .refine((val) => !val || !val.trim() || !/^\s/.test(val), `${label} cannot start with a space`)
}

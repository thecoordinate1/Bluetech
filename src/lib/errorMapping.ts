/**
 * Centralized error mapping for Supabase and application errors.
 * Converts technical database errors into user-friendly messages.
 */

interface SupabaseError {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
}

export function mapSupabaseError(error: any, context: string = 'Operation'): Error {
    if (!error) {
        // If error is null/undefined/empty but we expected one (e.g. data returned null unexpectedly)
        return new Error(`${context} failed. You may not have permission to perform this action.`);
    }

    // Handle specific Postgres error codes
    // https://www.postgresql.org/docs/current/errcodes-appendix.html

    // Unique violation (e.g., duplicate slug, email, username)
    if (error.code === '23505') {
        if (error.message?.includes('slug')) {
            return new Error(`A ${context.toLowerCase()} with this web address (URL) already exists.`);
        }
        if (error.message?.includes('email')) {
            return new Error(`An account with this email address already exists.`);
        }
        if (error.message?.includes('name')) {
            return new Error(`A ${context.toLowerCase()} with this name already exists.`);
        }
        if (error.message?.includes('sku')) {
            return new Error(`A product with this SKU already exists.`);
        }
        return new Error(`This ${context.toLowerCase()} already exists.`);
    }

    // Foreign key violation (e.g., trying to create a store for a non-existent vendor)
    if (error.code === '23503') {
        if (error.message?.includes('vendor_id')) {
            return new Error(`Unable to link this ${context.toLowerCase()} to your account. Please try signing in again.`);
        }
        if (error.message?.includes('store_id')) {
            return new Error(`The store associated with this ${context.toLowerCase()} could not be found.`);
        }
        return new Error(`This record references a missing item.`);
    }

    // Not Null violation
    if (error.code === '23502') {
        return new Error(`A required field is missing for ${context.toLowerCase()}.`);
    }

    // RLS or Permissions (often manifests as empty error or specific 403-like messages depending on client)
    // If the error object is empty but truthy (sometimes happens with empty objects {}), handle it.
    if (typeof error === 'object' && Object.keys(error).length === 0) {
        return new Error(`Permission denied. You may not be allowed to perform this action on ${context.toLowerCase()}.`);
    }

    // Default fallback
    const message = error.message && typeof error.message === 'string' && error.message.trim() !== ''
        ? error.message
        : `An unexpected error occurred during ${context.toLowerCase()}.`;

    return new Error(message);
}

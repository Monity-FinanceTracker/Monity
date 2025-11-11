import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Optimized debounce hook with cleanup and performance improvements
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} Debounced value
 */
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, delay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedValue;
};

/**
 * Debounced callback hook for function calls
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array
 * @returns {Function} Debounced callback
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedCallback = useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [delay, ...deps]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
};

/**
 * Search debounce hook specifically optimized for search inputs
 * @param {string} searchTerm - Search term to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {string} Debounced search term
 */
export const useSearchDebounce = (searchTerm, delay = 300) => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Don't debounce empty strings - clear immediately
        if (!searchTerm.trim()) {
            setDebouncedSearchTerm('');
            return;
        }

        // Set new timeout for non-empty search terms
        timeoutRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchTerm, delay]);

    return debouncedSearchTerm;
};

export default useDebounce;

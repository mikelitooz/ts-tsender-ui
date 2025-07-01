import { describe, it, expect } from "vitest"
import { calculateTotal } from "./calculateTotal"

describe('calculateTotal', () => {
    it('returns 0 for empty string', () => {
        expect(calculateTotal('')).toBe(0);
    });

    it('returns 0 for whitespace-only input', () => {
        expect(calculateTotal('   \n  \t ')).toBe(0);
    });

    it('handles single numeric value', () => {
        expect(calculateTotal('42')).toBe(42);
    });

    it('handles comma-separated values', () => {
        expect(calculateTotal('1,2,3,4')).toBe(10);
    });

    it('handles newline-separated values', () => {
        expect(calculateTotal('1\n2\n3\n4')).toBe(10);
    });

    it('handles mixed separators (commas and newlines)', () => {
        expect(calculateTotal('1,2\n3,4')).toBe(10);
    });

    it('handles values with whitespace', () => {
        expect(calculateTotal(' 1.5 ,  2.5 \n 3.5 ')).toBe(7.5);
    });

    it('ignores empty entries between separators', () => {
        expect(calculateTotal('1,,2,\n3,,\n\n4')).toBe(10);
    });

    it('handles decimal values', () => {
        expect(calculateTotal('1.1,2.2,3.3')).toBeCloseTo(6.6);
    });

    it('handles negative numbers', () => {
        expect(calculateTotal('5,-3,10,-2')).toBe(10);
    });

    it('filters out non-numeric values', () => {
        expect(calculateTotal('1,abc,3,4.5.6,7')).toBe(15.5);
    });

    it('handles complex mixed input', () => {
        expect(calculateTotal('1.5\n, 2.5, apple\n3.0,, \n -1, banana5')).toBe(6);
    });
});
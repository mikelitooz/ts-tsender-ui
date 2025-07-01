export function calculateTotal(amounts: string): number {
    if (!amounts.trim()) return 0;

    return amounts
        .split(/[\n,]+/)       // Split by both new lines and commas
        .map(amt => amt.trim())  // Remove whitespace from each item
        .filter(amt => amt !== '')  // Remove empty items
        .reduce((total, current) => {
            const num = parseFloat(current);
            // Handle invalid numbers and NaN cases
            return total + (isNaN(num) ? 0 : num);
        }, 0);
}
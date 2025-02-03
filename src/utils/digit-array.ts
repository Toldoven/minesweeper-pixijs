/**
 * Converts a number into an array of its digits.
 * @param number - The input number.
 * @returns An array of the number's digits.
 */
export function getDigitArray(number: number): number[] {

    if (number === 0) return [0];

    number = Math.abs(number);

    // Count digits
    const digits = Math.floor(Math.log10(Math.abs(number))) + 1;

    const result: number[] = [];
  
    for (let i = digits - 1; i >= 0; i--) {
        const divisor = 10 ** i;
        result.push(Math.floor(number / divisor));
        number %= divisor;
    }

    return result;
}

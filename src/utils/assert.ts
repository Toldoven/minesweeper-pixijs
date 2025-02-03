/**
 * Throws an error if the given condition is false.
 *
 * @param condition - The condition to check.
 * @param message - The error message to throw if the condition is false. Defaults to "Assertion failed!".
 * @throws {Error} If the condition is false.
 */
export function assert(
    condition: boolean,
    message: string = "Assertion failed!",
): asserts condition {
    if (condition) return;
    throw new Error(message);
}
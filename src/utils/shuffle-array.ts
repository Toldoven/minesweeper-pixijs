/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * All possible permutations are equally likely.
 *
 * @see {@link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle|Fisher-Yates Shuffle - Wikipedia}
 * 
 * @typeParam T - The type of elements in the array.
 * @param array - The array to shuffle. It's modified in place.
 * @returns The shuffled array.
 */
export function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
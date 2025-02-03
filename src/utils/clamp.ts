import { assert } from "./assert";

/**
 * Clamps a number within the inclusive range [min, max].
 * 
 * @param value - The number to clamp.
 * @param min - The lower bound of the range.
 * @param max - The upper bound of the range.
 * @returns The clamped value within the range [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
    assert(min <= max, "The 'min' value cannot be greater than the 'max' value.");
    return Math.min(Math.max(value, min), max);
}
  
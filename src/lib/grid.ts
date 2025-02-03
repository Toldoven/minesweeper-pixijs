import { assert } from "../utils/assert";

/**
 * Represents a point on a 2D Grid.
 */
export type Point = {
    x: number;
    y: number;
};

/** A generator over eight-way neighbors of a point.
 * .....
 * .▆▆▆.
 * .▆X▆.
 * .▆▆▆.
 * .....
 *
 * @param point - The point for which you get the neighbors.
 * @returns A generator that yields Point for every eight-way neighbor of a point.
 */
export function *eightWayNeighbors(point: Point): Generator<Point> {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            yield { x: point.x + dx, y: point.y + dy };
        }
    }
}

/**
 * A 2D grid storing elements in a row-major order.
 * 
 * Data is stored in a one dimensional array using row-major order
 * 
 * @see {@link https://en.wikipedia.org/wiki/Row-_and_column-major_order|Row and column major order - Wikipedia}
 *
 * @typeParam T - The type of elements in the grid.
 */
export class Grid<T> {
    readonly width: number;
    readonly height: number;
    readonly size: number;

    private array: T[];

    /**
     * Creates a grid with the given dimensions and optional initial data.
     *
     * @param width - The width of the grid.
     * @param height - The height of the grid.
     * @param array - Optional initial data for the grid. Must match the grid's size.
     * @throws {Error} If the width or height is not greater than zero or if the array length does not match the grid size.
     */
    constructor(width: number, height: number, array?: T[]) {
        assert(width > 0, "Width should be greater than zero");
        assert(height > 0, "Height should be greater than zero");

        this.width = width;
        this.height = height;
        this.size = width * height;

        if (array) {
            assert(
                array.length === this.size,
                "Size of the array should be equal to the size of the grid",
            );
        }

        this.array = array || new Array(this.size);
    }

    /**
     * Generates all points on the grid.
     *
     * @returns A generator yielding all points on the grid.
     */
    public *points(): Generator<Point> {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                yield { x, y };
            }
        }
    }

    /**
     * Generates all rows of the grid as arrays.
     *
     * @returns A generator yielding each row as an array.
     */
    public *lines(): Generator<T[]> {
        for (let y = 0; y < this.height; y++) {
            const slice = this.array.slice(y * this.width, ((y + 1) * this.width));
            yield slice;
        }   
    }

    /**
     * Executes a function for each value in the grid.
     *
     * @param action - The function to execute for each value.
     */
    public forEach(action: (value: T) => void) {
        for (const point of this.points()) {
            action(this.get(point));
        }
    }

    /**
     * Maps the grid to a new grid by applying a transformation function to each point and value.
     *
     * @typeParam R - The type of elements in the resulting grid.
     * @param transform - The function to transform each value with its point.
     * @returns A new grid with transformed values.
     */
    public mapIndexed<R>(transform: (point: Point, value: T) => R): Grid<R> {

        const newArray = Array.from(this.points(), (point, _index) => {

            const value = this.get(point);

            return transform(point, value);
        });

        return new Grid(this.width, this.height, newArray);
    }

    /**
     * Checks if a point is within the grid bounds.
     *
     * @param point - The point to check.
     * @returns `true` if the point is within bounds, otherwise `false`.
     */
    public isInBounds(point: Point): boolean {
        return (
            point.x < this.width &&
            point.y < this.height &&
            point.x >= 0 &&
            point.y >= 0
        )
    }

    /**
     * Gets the value at a point or returns `null` if out of bounds.
     *
     * @param point - The point to retrieve the value from.
     * @returns The value at the point or `null` if out of bounds.
     */
    public getOrNull(point: Point): T | null {
        const index = this.pointToArrayIndex(point);

        if (index === null) return null;

        return this.array[index];
    }

    /**
     * Gets the value at a point.
     *
     * @param point - The point to retrieve the value from.
     * @returns The value at the point.
     * @throws {Error} If the point is out of bounds.
     */
    public get(point: Point): T {

        const value = this.getOrNull(point);

        if (value === null) {
            throw new Error(
                `Tried to get a point on a grid that is out of bounds: ${point.x}, ${point.y}`,
            );
        }

        return value;
    }

    /**
     * Converts a point to its corresponding index in the internal array.
     *
     * @param point - The point to convert.
     * @returns The index in the array, or `null` if out of bounds.
     */
    private pointToArrayIndex(point: Point): number | null {
        return this.isInBounds(point) ? point.x + this.width * point.y : null;
    }
}

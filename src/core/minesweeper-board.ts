
import { Grid, Point, eightWayNeighbors } from "../lib/grid";
import { Signal } from "../lib/signal";
import { assert } from "../utils/assert";
import { shuffleArray } from "../utils/shuffle-array";

/**
 * Represents an empty tile. Also contains a number of neighboring bombs.
 */
export type EmptyTile = {
    readonly type: "empty";
    readonly bombNeighbors: number;
};

/**
 * Represents a bomb tile.
 */
export type BombTile = {
    readonly type: "bomb";
};

const BOMB_TILE = {
    type: "bomb",
} as const satisfies BombTile;

/**
 * Represents data of a tile on a board.
 */
export type TileData = EmptyTile | BombTile;

/**
 * Represents the mutable state of a tile.
 */
export type TileState = {
    state: "default" | "flag";
    isOpen: boolean;
    wasClicked: boolean;
};

/**
 * Represents the state of the game.
 */
export type BoardState = "not_started" | "active" | "won" | "lost";

/**
 * Represents the Minesweeper board and manages the game logic.
 * It only contains the game logic and is completely independent of presentation layer.
 */
export class MinesweeperBoard {

    /** 
     * Board state. Active, won or lost.
     */
    private _boardState: BoardState = "not_started";

    /** 
     * Immutable board data.
     */
    private readonly tileData: Grid<TileData>; 

    /** 
     * Mutable board state.
     */
    private readonly tileState: Grid<TileState>;
    
    /** 
     * Number of bombs on the board.
     */
    readonly bombCount: number;

    /** 
     * The player wins when this number reaches zero.
     * It's decremented when the player opens a tile.
     */
    private tilesLeftToOpenToWin: number;

    /** 
     * This signal is emitted when a tile changes in any way.
     * You can listen to it to update the visual representation of the board in the presentation layer.
     */
    readonly tileChangedSignal: Signal<Point> = new Signal();

    /**
     * This signal is emitted when the state of the game changes when the player wins or loses.
     */
    readonly boardStateChangedSignal: Signal<BoardState> = new Signal();

    /**
     * Checks if a point is within the board bounds.
     * @param point - The point to check.
     * @returns True if the point is within bounds, false otherwise.
     */
    public isPointInBounds(point: Point): boolean {
        return this.tileData.isInBounds(point);
    }

    /**
     * Retrieves the state of a tile at a given point.
     * @param point - The point of the tile.
     * @returns The state of the tile.
     */
    public getTileState(point: Point): TileState {
        return this.tileState.get(point)
    }

    /**
     * Retrieves the data of a tile at a given point.
     * @param point - The point of the tile.
     * @returns The data of the tile.
     */
    public getTileData(point: Point): TileData {
        return this.tileData.get(point)
    }

    /**
     * Generates all points on the board.
     * @returns A generator that yields points.
     */
    public points(): Generator<Point> {
        return this.tileData.points()
    }

    /**
     * Creates a new Minesweeper board with random bomb placement.
     * @param width - Width of the board.
     * @param height - Height of the board.
     * @param bombs - Number of bombs on the board.
     * @returns A new Minesweeper board.
     * @throws {Error} If the width or height is not greater than zero.
     */
    public static generate(width: number, height: number, bombs: number): MinesweeperBoard {
        
        // boolean: true for bomb tile, false for empty tiles.
        // Generate array filled with bomb tiles and empty tiles.
        const bombsArray: boolean[] = new Array(width * height)
            .fill(true, 0, bombs)
            .fill(false, bombs);

        // Shuffle the array to randomize the position.
        shuffleArray(bombsArray);

        return new MinesweeperBoard(width, height, bombsArray);
    }
    
    /**
     * Creates a Minesweeper board.
     * @param width - Width of the board.
     * @param height - Height of the board.
     * @param bombsArray - Array indicating bomb positions (true for bomb, false for empty).
     * @throws {Error} If the width or height is not greater than zero.
     */
    constructor(width: number, height: number, bombsArray: boolean[]) {
        assert(width > 0, "Width should be greater than zero");
        assert(height > 0, "Height should be greater than zero");
        assert(bombsArray.length === width * height, "Bomb array should be as long as the size of the cells of the grid");

        // TODO: Check what cell did the player click first, if it's a bomb, find a first empty cell and swap them.

        // Create an intermediary bomb grid so we can calculate the bomb neighbors.
        const bombsGrid = new Grid(width, height, bombsArray);

        this.tileData = bombsGrid.mapIndexed((point, isBomb) => {
            if (isBomb) return BOMB_TILE;
                
            // If the tile is not a bomb, count how many bombs are near it
            const bombNeighbors = Array.from(eightWayNeighbors(point))
                .filter(point => bombsGrid.getOrNull(point) ?? false)
                .length;

            const tileData: TileData = {
                type: "empty",
                bombNeighbors,
            } as const;

            return tileData;
        });

        const tileStateArray: TileState[] = Array.from(
            { length: width * height },
            () => ({
                state: "default",
                isOpen: false,
                wasClicked: false,
            }),
        );

        this.tileState = new Grid(width, height, tileStateArray);

        // Count bombs and store the number.
        this.bombCount = bombsArray.filter(isBomb => isBomb).length;

        // Calculate the number of tiles player needs to open to win the game.
        this.tilesLeftToOpenToWin = (width * height) - this.bombCount;
    }

    /**
     * Checks if the player has won the game.
     * If the player has won, all bombs are flagged, and the board state is updated.
     */
    private checkWin() {
        assert(this.tilesLeftToOpenToWin >= 0, "This number should never be negative");

        if (this.tilesLeftToOpenToWin !== 0) return;

        // Flag all bombs
        for (const point of this.tileData.points()) {
            const tileData = this.tileData.get(point);

            if (tileData.type !== "bomb") continue;

            const tileState = this.tileState.get(point);

            if (tileState.state === "flag") continue;

            tileState.state = "flag";

            this.tileChangedSignal.emit(point);
        }

        this.boardState = "won";
    }

    /**
     * Toggles the state of a tile between "default" and "flag".
     * @param point - The point of the tile to change.
     */
    public changeTileState(point: Point) {

        if (this.boardState === "not_started") {
            this.boardState = "active";
        }

        if (this._boardState !== "active") return;

        const tileState = this.tileState.get(point);

        if (tileState.isOpen) return;

        switch (tileState.state) {
            case "default":
                tileState.state = "flag";
                break;
            case "flag":
                tileState.state = "default";
                break;
        }

        this.tileChangedSignal.emit(point);
    }

    /**
     * Gets the current state of the board.
     * @returns The current board state.
     */
    public get boardState(): BoardState {
        return this._boardState;
    }

    /**
     * Updates the board state and emits the change.
     * @param newState - The new state of the board.
     */
    private set boardState(newState: BoardState) {
        this._boardState = newState
        this.boardStateChangedSignal.emit(this._boardState);
    }

    /**
     * Opens a tile and recursively opens neighboring tiles if there are no bomb neighbors.
     * The tile should not be open and be in the `default` state.
     * This method won't work if you need to open a tile in the `flag` state.
     * @param point - The point of the tile to open.
     * @param wasClicked - Whether the tile was opened by a direct click.
     */
    private setTileOpen(point: Point, wasClicked: boolean = false) {
        
        const tileState = this.tileState.get(point);
        const tileData = this.tileData.get(point);

        if (tileState.isOpen) {
            console.warn(`Tried to open a tile that was already open: ${point.x}, ${point.y}`);
            return;
        };

        if (tileState.state !== "default") {
            console.warn(`Tried to open a tile not in the default state. Current state: ${tileState.state}. At: ${point.x}, ${point.y}`);
            return;
        }

        tileState.isOpen = true;
        tileState.wasClicked = wasClicked;

        this.tileChangedSignal.emit(point);

        if (tileData.type !== "empty") return;

        this.tilesLeftToOpenToWin -= 1;

        if (tileData.bombNeighbors !== 0) return;
    
        // Continue opening tiles recursively
        for (const neighborPoint of eightWayNeighbors(point)) {
            if (!this.tileData.isInBounds(neighborPoint)) continue;
            this.setTileOpen(neighborPoint);
        }
    }

    /**
     * Opens a tile if it's not open. Open the neighbors of the tile if it's open.
     * @param point - The point of the tile to click.
     */
    public clickTile(point: Point) {

        if (this.boardState === "not_started") {
            this.boardState = "active";
        }

        if (this.boardState !== "active") {
            console.warn("Tried to click on tile when the board is not in the active state");
            return;
        };

        const tileState = this.getTileState(point);

        if (tileState.isOpen) {
            this.openNeighbors(point);
        } else {
            this.openTile(point);
        }
    }

    /**
     * Opens a tile if it's in the "default" state.
     * Triggers win or lose conditions.
     * @param point - The point of the tile to open.
     */
    private openTile(point: Point) {
        const tileState = this.tileState.get(point);

        if (tileState.state !== "default") {
            console.warn("Tried to open tile not in the default state");
            return;
        };

        this.setTileOpen(point, true);
        
        const tileData = this.tileData.get(point);

        if (tileData.type === "bomb") {
            this.handleLose();
        } else {
            this.checkWin();
        }
    }

    /**
     * Opens the neighbors of a tile if enough flags are present.
     * @param point - The point of the tile whose neighbors to open.
     */
    private openNeighbors(point: Point) {
        const tileState = this.tileState.get(point);

        if (!tileState.isOpen) {
            console.warn("Tried to open neighbors of a closed tile");
            return;
        }

        const tileData = this.tileData.get(point);

        assert(
            tileData.type === "empty",
            "Bomb tile can't be open, while the game is still running and you can click stuff",
        );

        const neighbors = Array.from(eightWayNeighbors(point)).filter(neighborPoint => {
            return this.tileData.isInBounds(neighborPoint);
        });

        const flagNeighbors = neighbors.filter(neighborPoint => {
            const neighborTileState = this.tileState.get(neighborPoint);
            return !neighborTileState.isOpen && neighborTileState.state === "flag";
        });

        // We can only open neighbors if there are enough flags nearby.
        if (flagNeighbors.length !== tileData.bombNeighbors) return;

        const neighborsToOpen = neighbors.filter(neighborPoint => {
            const neighborTileState = this.tileState.get(neighborPoint);
            return !neighborTileState.isOpen && neighborTileState.state !== "flag";
        });

        for (const neighborPoint of neighborsToOpen) {
            this.setTileOpen(neighborPoint, true);            
        }

        // Separate loop, because we want to open all tiles first, before checking if player lost.
        for (const neighborPoint of neighborsToOpen) {
            const neighborTileData = this.tileData.get(neighborPoint);

            if (neighborTileData.type === "bomb") {
                this.handleLose();
                return;
            }
        }

        this.checkWin();
    }

    /**
     * Called when the player loses the game to update the board and board state.
     */
    private handleLose() {
        for (const point of this.tileData.points()) {
            const tileData = this.tileData.get(point);
            const tileState = this.tileState.get(point);

            const isUnflaggedBomb = tileData.type === "bomb" && tileState.state === "default";
            const isIncorrectFlag = tileData.type === "empty" && tileState.state === "flag";

            if (!isUnflaggedBomb && !isIncorrectFlag) continue;

            tileState.isOpen = true;
            this.tileChangedSignal.emit(point);
        }

        this.boardState = "lost";
    }

    /**
     * Disconnect all callbacks connected to signals.
     */
    public clearSignals() {
        this.tileChangedSignal.clear();
        this.boardStateChangedSignal.clear();
    }
}

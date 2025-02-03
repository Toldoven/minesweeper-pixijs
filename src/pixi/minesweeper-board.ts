import { Container, FederatedPointerEvent } from "pixi.js";
import { TILE_SIZE_PX } from "..";
import { MinesweeperTilePixi } from "./minesweeper-tile";
import { Point, eightWayNeighbors } from "../lib/grid";
import { MinesweeperBoard } from "../core/minesweeper-board";
import { assert } from "../utils/assert";

export class MinesweeperBoardPixi extends Container {

    private board: MinesweeperBoard;

    private isMousePressed: boolean = false;

    private lastHoveredTile: Point | null = null;

    // Key is JSON.stringify Point
    // TODO: Is there a better way? At least can use a custom serialization function
    private pointToTile: Map<string, MinesweeperTilePixi> = new Map();

    // Value is JSON.stringify Point
    private highlightedTiles: Set<string> = new Set();

    private getTileByPoint(point: Point): MinesweeperTilePixi | undefined {
        return this.pointToTile.get(JSON.stringify(point));
    }

    private onTileChanged(point: Point) {
        const tile = this.getTileByPoint(point);

        if (tile === undefined) {
            console.error(`Clicked on a tile that is not mapped: ${tile}`);
            return;
        }

        this.updateTileTexture(point);
    }

    private updateTileTexture(point: Point) {
        const tile = this.getTileByPoint(point);
        if (tile === undefined) {
            console.warn(`Tried to update a tile that is out of bounds: ${point.x}, ${point.y}`);
            return;
        }
        tile.updateTexture(
            this.board.getTileData(point),
            this.board.getTileState(point)
        );
    }

    private clearHighlight() {
        for (const pointString of this.highlightedTiles) {
            const point: Point = JSON.parse(pointString);
            const tile = this.getTileByPoint(point);
            assert(tile !== undefined, "Can't be undefined, because in order to set the highlight, you need to get it first.");
            tile.highlight = false;
            this.updateTileTexture(point);
        }
        this.highlightedTiles.clear();
    }

    private highlightTile(point: Point) {

        const tile = this.getTileByPoint(point);

        if (tile === undefined) return;

        tile.highlight = true;
        this.highlightedTiles.add(JSON.stringify(point));
        this.updateTileTexture(point);
    }

    private updateHighlight() {
        this.clearHighlight();

        if (this.board.boardState !== "active") return;

        if (!this.isMousePressed) return;

        if (this.lastHoveredTile === null) return;

        const lastHoveredTileState = this.board.getTileState(this.lastHoveredTile);

        if (!lastHoveredTileState.isOpen && lastHoveredTileState.state === "default") {
            this.highlightTile(this.lastHoveredTile);
            return;
        }

        for (const point of eightWayNeighbors(this.lastHoveredTile)) {

            if (!this.board.isPointInBounds(point)) continue;

            const tileState = this.board.getTileState(point);

            if (tileState.state !== "default") continue;

            this.highlightTile(point);
        }
    }

    // Returns true if updated, false if not
    private updateLastHovered(event: FederatedPointerEvent): boolean {

        const { x, y } = event.getLocalPosition(this);

        const newPoint: Point = {
            x: Math.floor(x / TILE_SIZE_PX),
            y: Math.floor(y / TILE_SIZE_PX),
        };

        if (newPoint.x === this.lastHoveredTile?.x && newPoint.y === this.lastHoveredTile?.y) {
            return false;
        }

        this.lastHoveredTile = newPoint;

        return true;
    }

    public clearSignals() {
        this.board.clearSignals();
    }

    constructor(board: MinesweeperBoard) {

        super();

        this.board = board;

        for (const point of board.points()) {
            const pixiTile = new MinesweeperTilePixi();

            pixiTile.position = {
                x: point.x * TILE_SIZE_PX,
                y: point.y * TILE_SIZE_PX,
            };

            this.addChild(pixiTile);

            this.pointToTile.set(JSON.stringify(point), pixiTile);
        }

        this.eventMode = "static";

        this.on('mouseenter', (event) => {
            this.updateLastHovered(event);
            this.updateHighlight();
        });

        this.on('mousemove', (event) => {
            const wasUpdated = this.updateLastHovered(event);
            if (wasUpdated) this.updateHighlight();
        });

        this.on('mouseleave', (_event) => {
            this.lastHoveredTile = null;
            this.clearHighlight();
        });

        this.on('mousedown', (_event) => {
            this.isMousePressed = true;
            this.updateHighlight();
        });

        this.on('mouseup', (_event) => {
            this.clearHighlight();
            if (!this.isMousePressed) return;
            this.isMousePressed = false;
            if (this.lastHoveredTile === null) return;
            this.board.clickTile(this.lastHoveredTile);
        });

        this.on('mouseupoutside', (_event) => {
            this.clearHighlight();
            this.isMousePressed = false;
        });

        this.on('rightup', (_event) => {
            if (this.lastHoveredTile === null) return;
            this.board.changeTileState(this.lastHoveredTile);
        });

        this.board.tileChangedSignal.connect((point) => {
            this.onTileChanged(point);
        });
    }
}

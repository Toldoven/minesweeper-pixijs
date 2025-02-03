import { Assets, Sprite, Spritesheet } from "pixi.js";
import { TileData, TileState } from "../core/minesweeper-board";

export class MinesweeperTilePixi extends Sprite {

    /**
     * Array of texture paths for number tiles.
     * Indexed by the amount of adjacent bombs.
     */
    static readonly numberTextures = ["empty", "1", "2", "3", "4", "5", "6", "7", "8"].map(number => `cell/open/${number}.png`);

    highlight: boolean = false;

    private getTextureKey(tileData: TileData, tileState: TileState): string {

        // Tile is not open.
        if (!tileState.isOpen) {
            switch (tileState.state) {
                case "default":
                    return this.highlight ? "cell/open/empty.png" : "cell/filled/empty.png";
                case "flag":
                    return "cell/filled/flag.png";
            }
        }

        // Is open and not a bomb.
        if (tileData.type === "empty") {
            switch (tileState.state) {
                case "default":
                    return MinesweeperTilePixi.numberTextures[tileData.bombNeighbors - 0];
                case "flag":
                    return "cell/open/no_mine.png";
            }
        }

        // Is open and is a bomb.
        return tileState.wasClicked ? "cell/open/mine_red.png" : "cell/open/mine.png";
    }

    public updateTexture(tileData: TileData, tileState: TileState) {

        const spritesheet: Spritesheet = Assets.get("spritesheet");

        this.texture = spritesheet.textures[this.getTextureKey(tileData, tileState)];
    }

    constructor() {
        super();

        const spritesheet: Spritesheet = Assets.get("spritesheet");

        this.texture = spritesheet.textures["cell/filled/empty.png"];
    }
}

import "./style.css";
import {
    Application,
    Assets,
    AssetsManifest,
    BaseTexture,
    SCALE_MODES,
} from "pixi.js";
import { getUrlParamsBoardSettings } from "./board-settings";
import { MinesweeperPixi } from "./pixi/minesweeper";

const SCALE = 2;

export const WINDOW_PADDING_X_PX: number = 9 
export const WINDOW_PADDING_Y_PX: number = 8

export const TILE_SIZE_PX: number = 16

export const BOARD_PADDING_PX: number = 3

export const HEADER_BOARD_GAP_PX: number = 5
export const HEADER_HEIGHT_PX: number = 37
export const HEADER_PADDING_PX: number = 6

export const NUMBER_DISPLAY_PADDING_PX: number = 1
export const NUMBER_DISPLAY_CELL_WIDTH_PX: number = 13

const boardSettings = getUrlParamsBoardSettings();

const windowWidth = (WINDOW_PADDING_X_PX * 2) + (boardSettings.width * TILE_SIZE_PX) + (BOARD_PADDING_PX * 2);
const windowHeight = (WINDOW_PADDING_Y_PX * 2) + (boardSettings.height * TILE_SIZE_PX) + (BOARD_PADDING_PX * 2) + HEADER_BOARD_GAP_PX + HEADER_HEIGHT_PX;

const app = new Application<HTMLCanvasElement>({
    backgroundColor: 0x000000,
    width: windowWidth * SCALE,
    height: windowHeight * SCALE,
    resolution: window.devicePixelRatio || 1,
    antialias: false,
    autoDensity: true,
});

app.stage.scale.set(SCALE);

// Allow right click
app.view.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});
  
window.onload = async (): Promise<void> => {
    await loadGameAssets();

    document.body.appendChild(app.view);    

    const minesweeper = new MinesweeperPixi(boardSettings.width, boardSettings.height, boardSettings.bombs);

    app.stage.addChild(minesweeper);
};

async function loadGameAssets(): Promise<void> {
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

    const manifest: AssetsManifest = {
        bundles: [
            {
                name: "spritesheet",
                assets: [
                    {
                        alias: "spritesheet",
                        src: "./assets/winmine_31.json",
                    },
                ],
            },
        ],
    };

    await Assets.init({ manifest });
    await Assets.loadBundle(["spritesheet"]);
}
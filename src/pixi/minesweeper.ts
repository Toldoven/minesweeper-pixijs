import { Assets, Container, NineSlicePlane, Spritesheet } from "pixi.js";
import { BOARD_PADDING_PX, HEADER_BOARD_GAP_PX, HEADER_HEIGHT_PX, HEADER_PADDING_PX, NUMBER_DISPLAY_CELL_WIDTH_PX, NUMBER_DISPLAY_PADDING_PX, TILE_SIZE_PX, WINDOW_PADDING_X_PX, WINDOW_PADDING_Y_PX } from "..";
import { Stopwatch } from "../lib/stopwatch";
import { BoardState, MinesweeperBoard } from "../core/minesweeper-board";
import { MinesweeperBoardPixi } from "./minesweeper-board";
import { MinesweeperButtonPixi } from "./minesweeper-button";
import { MinesweeperNumberDisplayPixi } from "./minesweeper-number-display";

export class MinesweeperPixi extends Container {

    private boardWidthTiles: number;
    private boardHeightTiles: number;
    private bombCount: number;

    private boardContainer: Container;
    private boardPixi: MinesweeperBoardPixi | null = null;

    private stopwatch: Stopwatch;

    private rightNumberDisplay: MinesweeperNumberDisplayPixi;
    // private leftNumberDisplay: MinesweeperNumberDisplayPixi;
    private button: MinesweeperButtonPixi;

    private onBoardStateChanged(newState: BoardState) {
        this.button.changeState(newState);

        switch (newState) {
            case "not_started":
            case "won":
            case "lost":
                this.stopwatch.pause();
                break;
            case "active":
                this.stopwatch.start();
                break;
        }
    }

    private setupBoard() {

        if (this.boardPixi !== null) {
            this.boardPixi.clearSignals();
            this.boardContainer.removeChild(this.boardPixi);
        }

        const board = MinesweeperBoard.generate(this.boardWidthTiles, this.boardHeightTiles, this.bombCount);

        this.boardPixi = new MinesweeperBoardPixi(board);

        this.boardPixi.position.set(BOARD_PADDING_PX);

        this.boardContainer.addChild(this.boardPixi);

        board.boardStateChangedSignal.connect((newState) => this.onBoardStateChanged(newState));

        this.button.changeState(board.boardState);

        // Update counters
        this.stopwatch.reset();

        // Connect signals
    }

    constructor(width: number, height: number, bombCount: number) {
        super();

        const spritesheet: Spritesheet = Assets.get("spritesheet");

        this.boardWidthTiles = width;
        this.boardHeightTiles = height;
        this.bombCount = bombCount;

        const boardWidthPx = this.boardWidthTiles * TILE_SIZE_PX;
        const boardHeightPx = this.boardHeightTiles * TILE_SIZE_PX;

        // # Window Background
        const windowBackground = new NineSlicePlane(
            spritesheet.textures["background/main.png"]
        );

        windowBackground.width = (WINDOW_PADDING_X_PX * 2) + boardWidthPx + (BOARD_PADDING_PX * 2);
        windowBackground.height = (WINDOW_PADDING_Y_PX * 2) + boardHeightPx + (BOARD_PADDING_PX * 2) + HEADER_BOARD_GAP_PX + HEADER_HEIGHT_PX;

        this.addChild(windowBackground);

        // # Board Container
        this.boardContainer = new Container();

        this.boardContainer.position.x = WINDOW_PADDING_X_PX;
        this.boardContainer.position.y = WINDOW_PADDING_Y_PX + HEADER_HEIGHT_PX + HEADER_BOARD_GAP_PX;

        this.addChild(this.boardContainer);

        // ## Board Background
        const boardBackground = new NineSlicePlane(
            spritesheet.textures["background/secondary.png"]
        );

        boardBackground.width = boardWidthPx + (BOARD_PADDING_PX * 2);
        boardBackground.height = boardHeightPx + (BOARD_PADDING_PX * 2);

        this.boardContainer.addChild(boardBackground);

        // # Header Container
        const headerContainer = new Container();

        headerContainer.position.set(WINDOW_PADDING_X_PX);

        this.addChild(headerContainer);

        // ## Header Background
        const headerBackground = new NineSlicePlane(
            spritesheet.textures["background/secondary.png"]
        );

        const headerWidth = boardWidthPx + (BOARD_PADDING_PX * 2);

        headerBackground.width = headerWidth;
        headerBackground.height = HEADER_HEIGHT_PX;

        headerBackground.addChild(headerBackground);

        headerContainer.addChild(headerBackground);

        // ## Counters

        const leftCounter = new MinesweeperNumberDisplayPixi();

        leftCounter.position.set(HEADER_PADDING_PX);

        headerContainer.addChild(leftCounter);

        this.rightNumberDisplay = new MinesweeperNumberDisplayPixi();

        headerContainer.addChild(this.rightNumberDisplay);

        const counterWidth = (NUMBER_DISPLAY_CELL_WIDTH_PX * 3) + (NUMBER_DISPLAY_PADDING_PX * 2);

        this.rightNumberDisplay.position.x = headerWidth - counterWidth - HEADER_PADDING_PX;

        this.rightNumberDisplay.position.y = HEADER_PADDING_PX;

        // ## Stopwatch 

        this.stopwatch = new Stopwatch();

        this.stopwatch.secondsUpdate.connect((seconds) => {
            this.rightNumberDisplay.value = seconds;
        });

        // ## Button
        
        this.button = new MinesweeperButtonPixi();

        headerContainer.addChild(this.button);

        this.button.position.set(headerWidth / 2, HEADER_HEIGHT_PX / 2);

        // # Setup
        
        this.setupBoard();

        this.button.pressedSignal.connect(() => this.setupBoard());
    }
}

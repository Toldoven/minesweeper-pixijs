import { Assets, Container, Sprite, Spritesheet } from "pixi.js";
import { Signal } from "../lib/signal";
import { BoardState } from "../core/minesweeper-board";

export class MinesweeperButtonPixi extends Container {

    private boardState: BoardState = "not_started";

    private isPressed: boolean = false;

    public readonly pressedSignal: Signal<void> = new Signal();

    private sprite: Sprite = new Sprite();

    private getTextureKey(): string {
        if (this.isPressed) return "face/happy_pressed.png";

        switch (this.boardState) {
            case "not_started":
            case "active":
                return "face/happy.png";
            case "won":
                return "face/sunglasses.png";
            case "lost":
                return "face/dead.png";
        }
    }

    private updateTexture() {
        const spritesheet: Spritesheet = Assets.get("spritesheet");
        const texture = spritesheet.textures[this.getTextureKey()];
        this.sprite.texture = texture;
    }

    public changeState(newState: BoardState) {
        this.boardState = newState;
        this.updateTexture();
    }

    constructor() {

        super();

        const backgroundTexture = Assets.get("spritesheet").textures["background/face.png"];

        const backgroundSprite = new Sprite(backgroundTexture);

        backgroundSprite.anchor.set(0.5);

        this.addChild(backgroundSprite);

        this.sprite.anchor.set(0.5);

        this.addChild(this.sprite);

        this.updateTexture();

        this.sprite.eventMode = "static";

        this.sprite.on('mouseleave', (_event) => {
            if (!this.isPressed) return;
            this.isPressed = false;
            this.updateTexture();
        });

        this.sprite.on('mousedown', (_event) => {
            this.isPressed = true;
            this.updateTexture();
        });

        this.sprite.on('mouseup', (_event) => {
            if (!this.isPressed) return;
            this.isPressed = false;
            this.updateTexture();
            this.pressedSignal.emit();
        });
    }
}

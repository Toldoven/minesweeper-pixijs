import { Assets, Container, Sprite, Spritesheet } from "pixi.js";
import { NUMBER_DISPLAY_CELL_WIDTH_PX, NUMBER_DISPLAY_PADDING_PX } from "..";
import { assert } from "../utils/assert";
import { clamp } from "../utils/clamp";
import { getDigitArray } from "../utils/digit-array";

export class MinesweeperNumberDisplayPixi extends Container {

    static readonly digitTextures = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(number => `number/${number}.png`);

    private _value: number = 0;

    private digitSpriteArray: Sprite[] = new Array(3);

    public get value() {
        return this._value;
    }

    public set value(newValue: number) {
        this._value = newValue;
        this.updateDisplay();
    }

    private updateDisplay() {

        const isNegative = this.value < 0;

        // Because we have only 3 display cells - we can only display numbers from -99 to 999.
        const clampedValue = Math.abs(clamp(this.value, -99, 999));

        const digitArray = getDigitArray(clampedValue);

        assert(digitArray.length > 0, "There can't be less than one digit");

        if (isNegative) {
            assert(digitArray.length <= 2, "Can only display 2 digits when the number is negative");
        } else {
            assert(digitArray.length <= 3, "Can only display 3 digits when the number is positive");
        }

        // Index in the digitSpriteArray at which the digits begin to display.
        //
        // E.g.
        // 01    012 
        // 99 -> _99
        //        ↑ The 'digitsStartAtIndex' is 1, because we only have 2 digits.
        const digitsStartAtIndex = 3 - digitArray.length;

        const spritesheet: Spritesheet = Assets.get("spritesheet");

        for (const [index, sprite] of this.digitSpriteArray.entries()) {

            // If the number is negative, and we're at the index that is one before the digits start — it's a minus sign.
            if (isNegative && index === digitsStartAtIndex - 1) {
                sprite.texture = spritesheet.textures["number/minus.png"];
                continue;
            }

            // If digits didn't start yet, then it's just an empty cell.
            if (index < digitsStartAtIndex) {
                sprite.texture = spritesheet.textures["number/empty.png"];
                continue;
            }

            // Index in `digitArray` for the current `digitSpriteArray` index.
            const digitIndex = index - digitsStartAtIndex;
            const digit = digitArray[digitIndex];

            assert(digit >= 0 && digit <= 9, `Digit can't be bigger than 9 or less than 0. The digit is '${digit}'`);

            // Use digit as an index of digitTextures array to get the texture name.
            const texture = MinesweeperNumberDisplayPixi.digitTextures[digit];
            sprite.texture = spritesheet.textures[texture];
        }
    }

    constructor() {
        super();

        const spritesheet: Spritesheet = Assets.get("spritesheet");

        const background = new Sprite(spritesheet.textures["background/counter.png"]);

        background.anchor.x = 0;
        background.anchor.y = 0;

        this.addChild(background);

        const emptyCellTexture = spritesheet.textures["number/empty.png"];

        for (let i = 0; i < 3; i++) {
            const cellSprite = new Sprite(emptyCellTexture);

            cellSprite.x = NUMBER_DISPLAY_PADDING_PX + (i * NUMBER_DISPLAY_CELL_WIDTH_PX);
            cellSprite.y = NUMBER_DISPLAY_PADDING_PX;

            cellSprite.anchor.x = 0;
            cellSprite.anchor.y = 0;

            this.digitSpriteArray[i] = cellSprite;

            this.addChild(cellSprite);
        }

        this.updateDisplay();
    }
}

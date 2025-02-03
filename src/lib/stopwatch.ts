import { Ticker } from "pixi.js";
import { Signal } from "../lib/signal";

/**
 * A simple stopwatch that tracks elapsed time in seconds and emits updates.
 * Uses PixiJS {@link Ticker} under the hood.
 */
export class Stopwatch {

    private ticker: Ticker;

    /**
     * Elapsed time in milliseconds.
     */
    private elapsedMS: number = 0.0;

    /**
     * Internal value for elapsed time in seconds.
     */
    private _elapsedSeconds: number = 0;

    /**
     * Signal that emits when the value of elapsed seconds changes.
     */
    public secondsUpdate: Signal<number> = new Signal();

    /**
     * Elapsed time in seconds.
     */
    public get seconds() {
        return this._elapsedSeconds;
    }

    /**
     * Sets the elapsed time in seconds and emits an update if the value changes.
     */
    private set seconds(newSeconds: number) {

        newSeconds = Math.floor(newSeconds);

        if (newSeconds === this._elapsedSeconds) return;

        this._elapsedSeconds = newSeconds;
        this.secondsUpdate.emit(this._elapsedSeconds);
    }

    /**
     * Starts the stopwatch.
     */
    public start() {
        this.ticker.start();
    }

    /**
     * Pauses the stopwatch.
     */
    public pause() {
        this.ticker.stop();
    }

    /**
     * Resets the stopwatch to 0 seconds and pauses it. 
     */
    public reset() {
        this.ticker.stop();
        this.elapsedMS = 0.0;
        this.seconds = 0;
    }

    /**
     * Update function called by the ticker.
     */
    private update() {
        this.elapsedMS += this.ticker.deltaMS;
        this.seconds = this.elapsedMS / 1000;
    }

    /**
     * Creates a new Stopwatch instance.
     */
    constructor() {
        this.ticker = new Ticker();
        this.ticker.add(this.update, this);
    }
}
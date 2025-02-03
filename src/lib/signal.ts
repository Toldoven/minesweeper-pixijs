/**
 * A callback function type for signal events.
 *
 * @typeParam T - The type of data passed to the callback.
 */
export type SignalCallback<T> = (data: T) => void;

/**
 * A lightweight signal/observer implementation for event handling.
 *
 * @typeParam T - The type of data emitted by the signal.
 */
export class Signal<T> {
    private callbacks: Set<SignalCallback<T>> = new Set();

    /**
     * Connects a callback to the signal. The callback will be called when the signal is emitted.
     *
     * @param callback - The function to connect to the signal.
     */
    public connect(callback: SignalCallback<T>) {
        this.callbacks.add(callback);
    }

    /**
     * Disconnects a callback from the signal. The callback will no longer be called when the signal is emitted.
     *
     * @param callback - The function to disconnect from the signal.
     */
    public disconnect(callback: SignalCallback<T>) {
        this.callbacks.delete(callback);
    }

    /**
     * Emits the signal, calling all connected callbacks with the provided data.
     *
     * @param data - The data to pass to the connected callbacks.
     */
    public emit(data: T) {
        for (const callback of this.callbacks) {
            callback(data);
        }
    }

    /**
     * Disconnects all connected callbacks.
     */
    public clear() {
        this.callbacks.clear();
    }
}
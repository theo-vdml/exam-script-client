/**
 * Base class for managing game state, lifecycle, and event hooks.
 * Intended to be extended by specific game implementations.
 */
import type { HookCallable } from './game';

export const GameStatus = {
	IDLE: 0,
	RUNNING: 1,
	ENDED: 2,
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export default class BaseGame {
	/**
	 * The current status of the game (e.g., idle, running, paused).
	 */
	private _status: GameStatus = GameStatus.IDLE;

	/**
	 * A registry mapping event names to arrays of callback functions (hooks).
	 */
	private _hooks: Map<string, HookCallable[]> = new Map();

	/**
	 * Gets the current status of the game.
	 *
	 * @returns The game's current status.
	 */
	public get status(): GameStatus {
		return this._status;
	}

	/**
	 * Updates the game status. If the new status is different from the current one,
	 * emits a `status:change` event with the new and old statuses.
	 *
	 * @param newStatus - The new status to assign to the game.
	 */
	public set status(newStatus: GameStatus) {
		if (newStatus !== this._status) {
			const oldStatus: GameStatus = this._status;
			this._status = newStatus;
			this.fire('status:change', newStatus, oldStatus);
		}
	}

	/**
	 * Subscribes a callback function to a specific event.
	 *
	 * @param event - The name of the event to listen to.
	 * @param callback - The function to invoke when the event is fired.
	 */
	public on(event: string, callback: HookCallable): void {
		if (!this._hooks.has(event)) {
			this._hooks.set(event, []);
		}
		this._hooks.get(event)!.push(callback);
	}

	/**
	 * Unsubscribes a callback function from a specific event.
	 * If the callback is registered for the event, it will be removed from the list.
	 * Does nothing if the event has no listeners or the callback is not found.
	 *
	 * @param event - The name of the event to remove the callback from.
	 * @param callback - The callback function to remove.
	 */
	public off(event: string, callback: HookCallable): void {
		const callbacks = this._hooks.get(event);
		if (callbacks) {
			this._hooks.set(
				event,
				callbacks.filter((cb) => cb !== callback)
			);
		}
	}

	/**
	 * Triggers an event, executing all associated callbacks with the given arguments.
	 *
	 * @param event - The name of the event to trigger.
	 * @param args - Optional arguments to pass to each callback function.
	 */
	public fire(event: string, ...args: any[]) {
		const callbacks = this._hooks.get(event);
		if (callbacks) {
			callbacks.forEach((cb) => cb(...args));
		}
	}
}

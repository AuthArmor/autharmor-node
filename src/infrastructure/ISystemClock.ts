/**
 * Provides the current date and time.
 */
export interface ISystemClock {
    /**
     * @returns The current date and time.
     */
    now: () => Date;
}

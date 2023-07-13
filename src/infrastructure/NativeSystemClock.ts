import { ISystemClock } from "./ISystemClock";

/**
 * Provides the current date and time using the native Date class.
 */
export class NativeSystemClock implements ISystemClock {
    /**
     * @inheritdoc
     */
    public now(): Date {
        return new Date();
    }
}

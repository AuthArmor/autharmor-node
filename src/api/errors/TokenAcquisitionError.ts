export class TokenAcquisitionError extends Error {
    public constructor(public readonly message: string) {
        super(message);
    }
}

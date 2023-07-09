export class ApiError extends Error {
    public constructor(
        public readonly statusCode: number,
        public readonly statusMessage: string
    ) {
        super(`${statusCode} ${statusMessage}`);
    }
}

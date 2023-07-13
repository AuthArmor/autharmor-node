export interface IPagingRequest<T> {
    pageNumber?: number;
    pageSize?: number;
    sortDirection?: SortDirection;
    sortColumn?: keyof T & string;
}

export type SortDirection = "asc" | "desc";

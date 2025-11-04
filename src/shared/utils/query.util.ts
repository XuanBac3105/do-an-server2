import { EnumOrder } from '../constants/enum-order.constant';

export function buildSearchFilter<T>(
    search: string | undefined,
    fields: string[],
): { OR: Array<Record<string, { contains: string; mode: 'insensitive' }>> } | undefined {
    if (!search || search.trim() === '') {
        return undefined;
    }

    return {
        OR: fields.map((field) => ({
            [field]: {
                contains: search,
                mode: 'insensitive' as const,
            },
        })),
    };
}

export function calculatePagination(page: number, limit: number) {
    return {
        skip: (page - 1) * limit,
        take: limit,
    };
}

export function buildListResponse<T>(
    page: number,
    limit: number,
    total: number,
    data: T[],
) {
    return {
        page,
        limit,
        total,
        data,
    };
}

export function buildOrderBy<T>(
    sortBy: string,
    order: EnumOrder,
): Record<string, EnumOrder> {
    return {
        [sortBy]: order,
    };
}

/* eslint-disable prettier/prettier */
import { IPaginationMeta } from "nestjs-typeorm-paginate";

export function paginateResponse({ query, totalCount, take, page }) {
    const totalItems = +totalCount;
    const totalPages = Math.ceil(totalItems / take);

    const meta: IPaginationMeta = {
        totalItems: totalItems,
        totalPages: totalPages,
        itemsPerPage: take,
        itemCount: query.length % 10 === 0 ? 10 : query.length % 10,
        currentPage: page,
    };
    return { items: query, meta: meta };

}
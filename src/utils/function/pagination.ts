/* eslint-disable prettier/prettier */
import { IPaginationMeta } from 'nestjs-typeorm-paginate';

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

export function paginateResponseforTotal({ user,query, totalCount, userOrderData, take, page }) {
  const totalItems = +totalCount;
  const totalPages = Math.ceil(totalItems / take);

  const meta: IPaginationMeta = {
    totalItems: totalItems,
    totalPages: totalPages,
    itemsPerPage: take,
    itemCount: Math.min(take, query.length),
    currentPage: page,
  };

  return { items: query,user, userOrderData, meta: meta };
}

export function paginateResponseforUser({ query, totalCount, totalOrders, take, page }) {
  const totalItems = +totalCount;
  const totalPages = Math.ceil(totalItems / take);

  const itemsWithOrderCount = query.map(user => {
    const matchingOrder = totalOrders.find(order => order.user_id === user.id);
    const orderCount = matchingOrder && matchingOrder.orderCount !== null ? parseInt(matchingOrder.orderCount, 10) : 0;
    const totalAmount = matchingOrder && matchingOrder.totalAmount !== null ? parseInt(matchingOrder.totalAmount, 10) : 0;
    
    return {
      ...user,
      orderCount: orderCount,
      earning: totalAmount
    };
  });
  
  const meta: IPaginationMeta = {
    totalItems: totalItems,
    totalPages: totalPages,
    itemsPerPage: take,
    itemCount: Math.min(take, query.length),
    currentPage: page,
  };

  return { items: itemsWithOrderCount, meta: meta };
}




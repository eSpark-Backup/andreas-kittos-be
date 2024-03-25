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

export function paginateResponseforTotal({ query, totalCount, userOrderData, take, page }) {
  const totalItems = +totalCount;
  const totalPages = Math.ceil(totalItems / take);

  const meta: IPaginationMeta = {
    totalItems: totalItems,
    totalPages: totalPages,
    itemsPerPage: take,
    itemCount: Math.min(take, query.length),
    currentPage: page,
  };

  return { items: query, userOrderData, meta: meta };
}

export function paginateResponseforUser({ query, totalCount, totalOrders, take, page }) {
  const totalItems = +totalCount;
  const totalPages = Math.ceil(totalItems / take);

  // Merge orderCount into each user object
  const itemsWithOrderCount = query.map(user => {
    const matchingOrder = totalOrders.find(order => order.user_id === user.id);
    const orderCount = matchingOrder && matchingOrder.orderCount !== null ? parseInt(matchingOrder.orderCount, 10) : 0;
    
    return {
      ...user,
      orderCount: orderCount,
      Earnings: matchingOrder.totalAmount
    };
  });
  
  console.log("All users in query:");
  console.log("Count of users in query:", query.length);


  const meta: IPaginationMeta = {
    totalItems: totalItems,
    totalPages: totalPages,
    itemsPerPage: take,
    itemCount: Math.min(take, query.length),
    currentPage: page,
  };

  return { items: itemsWithOrderCount, meta: meta };
}




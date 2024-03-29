/* eslint-disable prettier/prettier */
export function generateOrderId(): string {

    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); 
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0'); 
    const hours = date.getHours().toString().padStart(2, '0'); 
    const minutes = date.getMinutes().toString().padStart(2, '0'); 
    const seconds = date.getSeconds().toString().padStart(2, '0'); 

    const orderId = `${year}${month}${day}${hours}${minutes}${seconds}${randomNumber}`;
    
    return orderId;
}
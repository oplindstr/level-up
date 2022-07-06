export default interface Order {
    id: string;
    date: Date;
    recipients: string;
    cancelled: boolean;
    contents: string;
    processed: boolean;
}

/* 
  Created a function for checking expiration since it was checked in many different sections and 
  there even seemed to be a mistake where the expiration time was 11 years instead of 1.
*/
export const yearsToExpire: number = 1

export const isExpired = (order: Order) => {
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() - yearsToExpire);

    return !(order.date > expirationDate)
}
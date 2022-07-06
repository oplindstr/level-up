import Mailer from "./Mailer";
import Database from "./Database";
import Order, { isExpired } from "./Order";

// Very naive implementation, but sufficient for this issue
const isValidEmail = (email: string) => email.includes('@');

export default class OrderProcessor {
    private mailer: Mailer;
    private orderDatabase: Database;
  
    constructor(mailer: Mailer, orderDatabase: Database) {
      this.mailer = mailer;
      this.orderDatabase = orderDatabase;
    }
  
    async orderProcessor(order?: Order): Promise<Order> {

      if (!order) {
        throw new Error('Order is missing');
      }
      if (!order.cancelled && !isExpired(order)) {
        // Update processed value after the update is done
        await this.orderDatabase.update(order.id, order);
        order.processed = true;
      }
  
      return order;
    }
  
    async sendConfirmationMail(order: Order, email: string): Promise<void> {
  
      /*
        Added throwing the other possible errors and refactored into guard clauses instead of nested if statements
      */
      if (order.cancelled) {
        throw new Error('Order has been cancelled');
      }
      else if (isExpired(order)) {
        throw new Error('Order has expired');
      }
      else if (!order.processed) {
        throw new Error("Order hasn't been processed yet");
      }
      else if (!isValidEmail(email)) {
        throw new Error('Invalid email');
      }
      else {
        this.mailer.sendEmail(email, order.contents);
      }
   }
}
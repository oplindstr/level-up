import Order from "./Order";
import OrderProcessor from "./OrderProcessor";
import { isExpired } from "./Order";

export default class OrderQueue {
    private itemArray: Order[] = [];
    private processed: Order[] = [];
    private processor: OrderProcessor;
    // Updated variable name to be more descriptive
    private isProcessing: Boolean = false;
    private MaxItemsToProcess = 5
  
    constructor(processor: OrderProcessor) {
      this.processor = processor;
    }
  
    public addOrder(order: Order) {
      this.itemArray.push(order);
    }
  
    public getProcessedOrders() {
      return this.processed;
    }
  
    public async processNextBatch(): Promise<void> {
      if (!this.isProcessing) {
        this.isProcessing = true;
  
        const batch = this.itemArray.splice(0, this.MaxItemsToProcess);
  
        // Make sure orders are processed in correct order. This is crucial
        // so that the items are delivered based on when the order has
        // been made (our stock may run out of items and we want those that ordered
        // first to receive the items).
        const promises = batch.map(async (order) => {
          if (!order.cancelled && !isExpired(order)) {
            await this.processor.orderProcessor(order);
  
            const emails = order.recipients.split(';');

            /* 
              Async/Await inside forEach doesn't actually wait.
              Wait for sending emails with Promise.all and map function to ensure that all emails are sent before continuing.
              I think, in theory, we shouldn't have to wait here. We could just send requests to the mailer and proceed in this program immediately.
              There were problems as stated in the issue #6 however, and that's why I'm changing this anyway.
            */
            await Promise.all(emails.map(async (email) => {
              // Let's not cancel the whole batch if one email is invalid, for example. This would, for example, send an alert email somewhere in a real setting.
              try {
                await this.processor.sendConfirmationMail(order, email);
              }
              catch (error) {
                console.log(error)
              }
            }));
          }
  
          return order;
        });
  
        // Wait for all orders to be processed
        this.processed = this.processed.concat(await Promise.all(promises));
  
        // We're ready to process the next batch
        this.isProcessing = false;
      }
    }
  }
  
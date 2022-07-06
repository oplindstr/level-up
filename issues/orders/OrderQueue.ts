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
            emails.forEach(async (email) => {
              await this.processor.sendConfirmationMail(order, email);
            });
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
  
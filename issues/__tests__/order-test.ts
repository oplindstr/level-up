import OrderProcessor from '../orders/OrderProcessor';
import OrderQueue from '../orders/OrderQueue';
import Mailer from '../orders/Mailer';
import Database from '../orders/Database';
import { yearsToExpire } from '../orders/Order';

const MOCK_ORDER = {
  id: 'abc',
  date: new Date(),
  recipients: 'john@google.com;jane@google.com;op@google.com',
  cancelled: false,
  contents: 'Item1\nItem2',
  processed: false,
};

const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() - yearsToExpire);

describe('order-module', () => {
  let processor: OrderProcessor;
  let queue: OrderQueue;
  let mockMailer: Mailer;
  let mockDatabase: Database;

  beforeEach(() => {
    mockMailer = {
      sendEmail: jest.fn(() => Promise.resolve()),
    };

    mockDatabase = {
      update: jest.fn(() => Promise.resolve()),
    };

    processor = new OrderProcessor(mockMailer, mockDatabase);
    queue = new OrderQueue(processor);
  });

  describe('OrderProcessor', () => {
    test('process order', async () => {
      expect(await processor.orderProcessor({ ...MOCK_ORDER })).toHaveProperty(
        'processed',
        true
      );
    });

    test('process cancelled order', async () => {
      const order = await processor.orderProcessor({
        ...MOCK_ORDER,
        cancelled: true,
      });

      expect(order).toHaveProperty('processed', false);
    });

    test('process expired order', async () => {
      const order = await processor.orderProcessor({
        ...MOCK_ORDER,
        date: expirationDate
      });

      expect(order).toHaveProperty('processed', false);
    });

    test('send confirmation email', async () => {
      await processor.sendConfirmationMail(
        {
          ...MOCK_ORDER,
          processed: true,
        },
        'john@google.com'
      );

      expect(mockMailer.sendEmail).toHaveBeenCalledWith(
        'john@google.com',
        MOCK_ORDER.contents
      );
    });

    test('send confirmation email with invalid email', async () => {
      return expect(
        processor.sendConfirmationMail(
          {
            ...MOCK_ORDER,
            processed: true,
          },
          'johngoogle.com'
        )
      ).rejects.toThrowError('Invalid email');
    });

    test('send confirmation email with cancelled order', async () => {
      return expect(
        processor.sendConfirmationMail(
          {
            ...MOCK_ORDER,
            cancelled: true
          },
          'johngoogle.com'
        )
      ).rejects.toThrowError('Order has been cancelled');
    });

    test('send confirmation email with expired order', async () => {
      return expect(
        processor.sendConfirmationMail(
          {
            ...MOCK_ORDER,
            date: expirationDate
          },
          'johngoogle.com'
        )
      ).rejects.toThrowError('Order has expired');
    });

    test('send confirmation email with unprocessed order', async () => {
      return expect(
        processor.sendConfirmationMail(
          MOCK_ORDER,
          'johngoogle.com'
        )
      ).rejects.toThrowError("Order hasn't been processed yet");
    });
  });

  describe('OrderQueue', () => {
    test('process order', async () => {
      queue.addOrder({ ...MOCK_ORDER });
      await queue.processNextBatch();

      expect(queue.getProcessedOrders()[0]).toEqual({
        ...MOCK_ORDER,
        processed: true,
      });

    });

    // 
    test('send emails to all recipients specified in an order', async () => {
      queue.addOrder({ ...MOCK_ORDER });
      await queue.processNextBatch();

      expect(mockMailer.sendEmail).toHaveBeenCalledWith(
        'john@google.com',
        MOCK_ORDER.contents
      );

      expect(mockMailer.sendEmail).toHaveBeenCalledWith(
        'jane@google.com',
        MOCK_ORDER.contents
      );

      expect(mockMailer.sendEmail).toHaveBeenCalledWith(
        'op@google.com',
        MOCK_ORDER.contents
      );
    })

    test('process order with an invalid email', async () => {
      queue.addOrder({
         ...MOCK_ORDER, 
         recipients: 'john@google.com;opgoogle.com;jane@google.com'
      });

      await queue.processNextBatch();
      
      expect(queue.getProcessedOrders()[0]).toEqual({
        ...MOCK_ORDER,
        recipients: 'john@google.com;opgoogle.com;jane@google.com',
        processed: true,
      });

      expect(mockMailer.sendEmail).toHaveBeenCalledWith(
        'john@google.com',
        MOCK_ORDER.contents
      );

      expect(mockMailer.sendEmail).not.toHaveBeenCalledWith(
        'opgoogle.com',
        MOCK_ORDER.contents
      );

      expect(mockMailer.sendEmail).toHaveBeenCalledWith(
        'jane@google.com',
        MOCK_ORDER.contents
      );
    })

    test('add multiple orders (batch size + 1) and process twice', async () => {
      for (let i = 0; i < 6; i++) {
        queue.addOrder({ ...MOCK_ORDER });
      }

      await queue.processNextBatch();
      expect(queue.getProcessedOrders().length).toBe(5);

      await queue.processNextBatch();
      expect(queue.getProcessedOrders().length).toBe(6);
    });
  });
});

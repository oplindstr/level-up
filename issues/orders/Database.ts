import Order from './Order'

export default interface Database {
    update(id: string, specs: Partial<Order>): Promise<void>;
}
import { OrderStatus } from "../../order/interfaces/OrderStatus";

export interface IObserver {
    update(status: OrderStatus): void;
}

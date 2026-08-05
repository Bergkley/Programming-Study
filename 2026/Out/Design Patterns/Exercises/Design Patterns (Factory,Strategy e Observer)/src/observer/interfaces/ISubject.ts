import { OrderStatus } from "../../order/interfaces/OrderStatus";
import { IObserver } from "./IObserver";

export interface ISubject {
    subscribe(observer: IObserver): void;
    unsubscribe(observer: IObserver): void;
    notify(status: OrderStatus): void;
    setState(status: OrderStatus): void;
}

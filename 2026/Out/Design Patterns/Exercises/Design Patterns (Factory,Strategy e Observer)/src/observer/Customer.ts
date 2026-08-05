import { OrderStatus } from "../order/interfaces/OrderStatus";
import { IObserver } from "./interfaces/IObserver";

export class Customer implements IObserver {
    update(status: OrderStatus): void {
        console.log("Customer received:");
        console.log(status);
    }
}

import { OrderStatus } from "../order/interfaces/OrderStatus";
import { IObserver } from "./interfaces/IObserver";

export class Inventory implements IObserver {
    update(status: OrderStatus): void {
        console.log("Inventory received:");
        console.log(status);
    }
}

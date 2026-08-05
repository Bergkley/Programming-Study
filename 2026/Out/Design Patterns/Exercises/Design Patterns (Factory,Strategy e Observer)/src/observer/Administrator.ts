import { OrderStatus } from "../order/interfaces/OrderStatus";
import { IObserver } from "./interfaces/IObserver";

export class Administrator implements IObserver {
    update(status: OrderStatus): void {
        console.log("Administrator received:");
        console.log(status);
    }
}

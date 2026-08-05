import { IObserver } from "../observer/interfaces/IObserver";
import { ISubject } from "../observer/interfaces/ISubject";
import { OrderStatus } from "./interfaces/OrderStatus";

export class Order implements ISubject {
    private observers: IObserver[] = [];
    private status: OrderStatus = "PAYMENT_PENDING";

    subscribe(observer: IObserver): void {
        this.observers.push(observer);
    }

    unsubscribe(observer: IObserver): void {
        this.observers = this.observers.filter(
            obs => obs !== observer
        );
    }

    notify(status: OrderStatus): void {
        this.observers.forEach(observer => {
            observer.update(status);
        });
    }

    setState(status: OrderStatus): void {
        this.status = status;

        console.log("\n==============================");
        console.log(`Status: ${this.status}`);
        console.log("==============================");

        this.notify(this.status);

        if (status === "PAYMENT_APPROVED") {
            this.status = "PREPARING_ORDER";

            console.log("\n==============================");
            console.log(`Status: ${this.status}`);
            console.log("==============================");

            this.notify(this.status);
        }
    }
}

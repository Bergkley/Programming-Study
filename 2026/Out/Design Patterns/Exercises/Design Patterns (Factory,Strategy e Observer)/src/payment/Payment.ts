import { IPayment } from "./interfaces/IPayment";
import { IStrategyPayment } from "./interfaces/IStrategyPayment";

export class Payment implements IPayment {
    constructor(
        private readonly strategy: IStrategyPayment
    ) {}

    pay(value: number): void {
        this.strategy.send(value);
    }
}

import { IStrategyPayment } from "../interfaces/IStrategyPayment";

export class StrategyCard implements IStrategyPayment {
    send(value: number): void {
        console.log("Payment completed with Card.");
        console.log(`Amount: $ ${value.toFixed(2)}`);
    }
}

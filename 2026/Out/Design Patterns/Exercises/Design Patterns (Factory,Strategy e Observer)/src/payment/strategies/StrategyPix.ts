import { IStrategyPayment } from "../interfaces/IStrategyPayment";

export class StrategyPix implements IStrategyPayment {
    send(value: number): void {
        console.log("Payment completed via Pix.");
        console.log(`Amount: $ ${value.toFixed(2)}`);
    }
}

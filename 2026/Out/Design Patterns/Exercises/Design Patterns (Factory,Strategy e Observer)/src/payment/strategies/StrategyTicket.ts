import { IStrategyPayment } from "../interfaces/IStrategyPayment";

export class StrategyTicket implements IStrategyPayment {
    send(value: number): void {
        console.log("Ticket generated successfully.");
        console.log(`Amount: $ ${value.toFixed(2)}`);
    }
}

import { IPayment } from "./interfaces/IPayment";
import { Payment } from "./Payment";
import { StrategyCard } from "./strategies/StrategyCard";
import { StrategyPix } from "./strategies/StrategyPix";
import { StrategyTicket } from "./strategies/StrategyTicket";

type FormPayment = "Pix" | "Card" | "Ticket";

export class PaymentFactory {
    private static payments = {
        Pix: () => new Payment(new StrategyPix()),
        Card: () => new Payment(new StrategyCard()),
        Ticket: () => new Payment(new StrategyTicket()),
    };

    static create(type: FormPayment): IPayment {
        const payment = this.payments[type];

        if (!payment) {
            throw new Error("Invalid payment type.");
        }

        return payment();
    }
}

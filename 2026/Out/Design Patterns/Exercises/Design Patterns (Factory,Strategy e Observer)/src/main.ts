import { Order } from "./order/Order";
import { PaymentFactory } from "./payment/PaymentFactory";
import { Administrator } from "./observer/Administrator";
import { Customer } from "./observer/Customer";
import { Inventory } from "./observer/Inventory";

const order = new Order();

order.subscribe(new Customer());
order.subscribe(new Administrator());
order.subscribe(new Inventory());

const payment = PaymentFactory.create("Pix");

payment.pay(250);

order.setState("PAYMENT_APPROVED");

order.setState("ORDER_SENT");

order.setState("ORDER_DELIVERED");

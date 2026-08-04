// Design Patterns: Factory Pattern in TypeScript

// problema inicial: se quisermos adicionar um novo tipo de pagamento, precisaríamos modificar a classe PaymentProcessor.

class CartaoCredito {
  pay(amount: number): void {
    console.log(`Processing credit card payment of ${amount}`);
  }
}

const pagamento = new CartaoCredito();


// solução: podemos criar uma interface PaymentMethod e implementar diferentes classes de pagamento, permitindo que o PaymentProcessor utilize qualquer método de pagamento sem precisar ser modificado.

interface PaymentMethod {
  pay(amount: number): void;
}

class CartaoCredito2 implements PaymentMethod {
  pay(amount: number): void {
    console.log(`Processing credit card payment of ${amount}`);
  }
}

class Pix implements PaymentMethod {
  pay(amount: number): void {
    console.log(`Processing Pix payment of ${amount}`);
  }
}


class paymentFactory {
    static createPaymentMethod(type: string): PaymentMethod {
        if (type === 'credit_card') {
            return new CartaoCredito2();
        } else if (type === 'pix') {
            return new Pix();
        }
        throw new Error('Invalid payment type');
    }
}


const pagamento2 = paymentFactory.createPaymentMethod('credit_card');
pagamento2.pay(100);


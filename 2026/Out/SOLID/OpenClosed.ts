// Solid - Open/Closed Principle (OCP)

// Problema inicial
// a classe PaymentProcessor tem um método processPayment que lida com diferentes tipos de pagamento. Se quisermos adicionar um novo tipo de pagamento, precisaríamos modificar essa classe, o que viola o princípio aberto/fechado.

class PaymentProcessor {
    processPayment(paymentType: string, amount: number): void {
        if (paymentType === "creditCard") {
            console.log(`Processing credit card payment of ${amount}`);
        } else if (paymentType === "paypal") {
            console.log(`Processing PayPal payment of ${amount}`);
        } else {
            throw new Error("Unsupported payment type");
        }
    }
}

// Solução:  Uso de interfaces para permitir a extensão sem modificação.

interface PaymentMethod {
    pay(amount: number): void;
}

class CreditCardPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Processing credit card payment of ${amount}`);
    }
}

class PayPalPayment implements PaymentMethod {
    pay(amount: number): void {
        console.log(`Processing PayPal payment of ${amount}`);
    }
}

class PaymentProcessor2 {
    processPayment(paymentMethod: PaymentMethod, amount: number): void {
        paymentMethod.pay(amount);
    }
}
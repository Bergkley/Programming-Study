export interface Item {
  nome: string;
  preco: number;
  quantidade: number;
}

export interface Pedido {
  emailCliente: string;
  itens: Item[];
}

export class PedidoService {
  private log: string[] = [];

  public processarPedido(
    pedido: Pedido,
    tipoPagamento: string
  ): void {
    if (!pedido) {
      throw new Error("Pedido inválido.");
    }

    if (!pedido.itens || pedido.itens.length === 0) {
      throw new Error("O pedido deve possuir itens.");
    }

    // Cálculo do total
    let total = 0;

    for (const item of pedido.itens) {
      total += item.preco * item.quantidade;
    }

    // Desconto
    if (total > 500) {
      total *= 0.9;
    }

    // Pagamento
    if (tipoPagamento.toUpperCase() === "CARTAO") {
      console.log("Pagamento realizado com cartão.");
    } else if (tipoPagamento.toUpperCase() === "PIX") {
      console.log("Pagamento realizado via PIX.");
    } else if (tipoPagamento.toUpperCase() === "BOLETO") {
      console.log("Pagamento realizado com boleto.");
    } else {
      throw new Error("Forma de pagamento inválida.");
    }

    // Persistência (simulada)
    console.log("Pedido salvo no banco.");

    // Envio de e-mail
    console.log(
      `Enviando e-mail de confirmação para ${pedido.emailCliente}`
    );

    // Log
    this.log.push(
      `Pedido processado para ${pedido.emailCliente}`
    );

    // Relatório
    console.log("===== RELATÓRIO =====");
    console.log(`Cliente: ${pedido.emailCliente}`);
    console.log(`Quantidade de itens: ${pedido.itens.length}`);
    console.log(`Valor final: R$ ${total.toFixed(2)}`);
  }
}

// Refatoração para seguir o princípio aberto/fechado (OCP) e SRP (Single Responsibility Principle)

export interface Item {
    nome: string;
    preco: number;
    quantidade: number;
}

export interface Pedido {
    emailCliente: string;
    itens: Item[];
}

export interface IPayment {
    pay(): string;
}

export interface IDiscount {
    apply(total: number): number;
}


class OrderValidation {
    validationOrder(pedido: Pedido) {
        if (!pedido) {
            throw new Error("Pedido inválido.");
        }

        if (!pedido.itens || pedido.itens.length === 0) {
            throw new Error("O pedido deve possuir itens.");
        }
    }
}


class ValueTotal {
    calculate(pedido: Pedido): number {
        let total = 0;

        for (const item of pedido.itens) {
            total += item.preco * item.quantidade;
        }

        return total;
    }
}


class NoDiscount implements IDiscount {
    apply(total: number): number {
        return total;
    }
}


class PremiumDiscount implements IDiscount {
    apply(total: number): number {
        return total * 0.8; 
    }
}

class CardPayment implements IPayment {
    pay(): string {
        return "Pagamento realizado via cartão.";
    }
}


class PixPayment implements IPayment {
    pay(): string {
        return "Pagamento realizado via PIX.";
    }
}


class TicketPayment implements IPayment {
    pay(): string {
        return "Pagamento realizado via boleto.";
    }
}


class OrderRepository {
    save(): string {
        return "Pedido salvo no banco.";
    }
}


class SendEmail {
    send(pedido: Pedido): string {
        return `E-mail enviado para ${pedido.emailCliente}.`;
    }
}


class LogOrder {
    log(logs: string[]) {
        console.log("\n===== LOGS DO PEDIDO =====");

        for (const log of logs) {
            console.log(log);
        }
    }
}


class ReportOrder {
    report(pedido: Pedido, total: number) {
        console.log("\n===== RELATÓRIO =====");
        console.log(`Cliente: ${pedido.emailCliente}`);
        console.log(`Quantidade de itens: ${pedido.itens.length}`);
        console.log(`Valor final: R$ ${total.toFixed(2)}`);
    }
}


class PedidoService2 {

    private logs: string[] = [];

    constructor(
        private validator: OrderValidation,
        private valueTotal: ValueTotal,
        private discount: IDiscount,
        private payment: IPayment,
        private repository: OrderRepository,
        private email: SendEmail,
        private logger: LogOrder,
        private report: ReportOrder
    ) {}


    process(pedido: Pedido) {

        this.validator.validationOrder(pedido);
        this.logs.push("Pedido validado.");


        let total = this.valueTotal.calculate(pedido);
        this.logs.push(
            `Total calculado: R$ ${total.toFixed(2)}`
        );


        total = this.discount.apply(total);
        this.logs.push(
            `Total final: R$ ${total.toFixed(2)}`
        );


        
        this.logs.push(this.payment.pay());


        this.logs.push(this.repository.save());


        this.logs.push(this.email.send(pedido));


        this.logger.log(this.logs);


        this.report.report(pedido, total);
    }
}


const pedido: Pedido = {
    emailCliente: "cliente@email.com",

    itens: [
        {
            nome: "Notebook",
            preco: 3000,
            quantidade: 1
        },
        {
            nome: "Mouse",
            preco: 100,
            quantidade: 2
        }
    ]
};


const pedidoService = new PedidoService2(
    new OrderValidation(),
    new ValueTotal(),
    new PremiumDiscount(),
    new PixPayment(),
    new OrderRepository(),
    new SendEmail(),
    new LogOrder(),
    new ReportOrder()
);


pedidoService.process(pedido);
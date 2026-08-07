// Exercício: Identifique e refatore os Code Smells deste código.
//
// Objetivos:
// 1. Encontrar os problemas de design.
// 2. Refatorar sem alterar o comportamento.
// 3. Deixar o código mais legível, reutilizável e fácil de manter.

class Pedido {
  constructor(
    public cliente: string,
    public itens: { nome: string; preco: number; quantidade: number }[],
    public tipoCliente: string // "comum", "premium" ou "vip"
  ) {}

  calcularTotal() {
    let total = 0;

    for (let i = 0; i < this.itens.length; i++) {
      total += this.itens[i].preco * this.itens[i].quantidade;
    }

    if (this.tipoCliente === "comum") {
      total = total;
    } else if (this.tipoCliente === "premium") {
      total = total * 0.9;
    } else if (this.tipoCliente === "vip") {
      total = total * 0.8;
    }

    return total;
  }

  imprimirPedido() {
    console.log("Cliente: " + this.cliente);

    for (let i = 0; i < this.itens.length; i++) {
      console.log(
        this.itens[i].nome +
          " - " +
          this.itens[i].quantidade +
          " x " +
          this.itens[i].preco
      );
    }

    console.log("Total: " + this.calcularTotal());
  }
}

const pedido = new Pedido(
  "João",
  [
    { nome: "Mouse", preco: 100, quantidade: 2 },
    { nome: "Teclado", preco: 200, quantidade: 1 },
  ],
  "premium"
);

pedido.imprimirPedido();

// solução :

type CustomerType = "Common" | "Premium" | "Vip";

type Product = {
  name: string;
  price: number;
  quantity: number;
};

class DiscountCalculator {
  private static readonly discounts: Record<CustomerType, number> = {
    Common: 1,
    Premium: 0.9,
    Vip: 0.8,
  };

  static apply(customerType: CustomerType, subtotal: number): number {
    const discount = this.discounts[customerType];
    return subtotal * discount;
  }
}

class OrderLogger {
  static print(customer: string, products: Product[], total: number): void {
    console.log(`Customer: ${customer}`);

    products.forEach((product) => {
      console.log(
        `${product.name} - ${product.quantity} x $${product.price.toFixed(2)}`
      );
    });

    console.log(`Total: $${total.toFixed(2)}`);
  }
}

class Order {
  constructor(
    public customer: string,
    public products: Product[],
    public customerType: CustomerType
  ) {}

  private calculateSubtotal(): number {
    return this.products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }

  checkout(): void {
    const subtotal = this.calculateSubtotal();

    const total = DiscountCalculator.apply(
      this.customerType,
      subtotal
    );

    OrderLogger.print(this.customer, this.products, total);
  }
}

const order = new Order(
  "John",
  [
    {
      name: "Mouse",
      price: 100,
      quantity: 2,
    },
    {
      name: "Keyboard",
      price: 200,
      quantity: 1,
    },
  ],
  "Premium"
);

order.checkout();

interface Product {
  name: string;
  price: number;
  quantity: number;
}

enum CustomerType {
  VIP = "VIP",
  EMPLOYEE = "EMPLOYEE",
  NEW = "NEW",
}

enum Coupon {
  DISCOUNT10 = "DISCOUNT10",
  DISCOUNT20 = "DISCOUNT20",
}

interface DiscountStrategy {
  apply(total: number): number;
}

class VipDiscount implements DiscountStrategy {
  apply(total: number): number {
    return total * 0.8;
  }
}

class EmployeeDiscount implements DiscountStrategy {
  apply(total: number): number {
    return total * 0.7;
  }
}

class NewCustomerDiscount implements DiscountStrategy {
  apply(total: number): number {
    return total * 0.9;
  }
}

class NoCustomerDiscount implements DiscountStrategy {
  apply(total: number): number {
    return total;
  }
}

class Discount10Coupon implements DiscountStrategy {
  apply(total: number): number {
    return total * 0.9;
  }
}

class Discount20Coupon implements DiscountStrategy {
  apply(total: number): number {
    return total * 0.8;
  }
}

class NoCouponDiscount implements DiscountStrategy {
  apply(total: number): number {
    return total;
  }
}

class SubtotalCalculator {
  calculate(products: Product[]): number {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }
}

class CustomerDiscountFactory {
  static create(customerType: CustomerType): DiscountStrategy {
    switch (customerType) {
      case CustomerType.VIP:
        return new VipDiscount();

      case CustomerType.EMPLOYEE:
        return new EmployeeDiscount();

      case CustomerType.NEW:
        return new NewCustomerDiscount();

      default:
        return new NoCustomerDiscount();
    }
  }
}

class CouponDiscountFactory {
  static create(coupon: Coupon | null): DiscountStrategy {
    switch (coupon) {
      case Coupon.DISCOUNT10:
        return new Discount10Coupon();

      case Coupon.DISCOUNT20:
        return new Discount20Coupon();

      default:
        return new NoCouponDiscount();
    }
  }
}

class LargeOrderDiscount {
  apply(total: number): number {
    return total > 1000 ? total - 50 : total;
  }
}

class OrderLogger {
  log(customer: CustomerType, products: Product[], total: number): void {
    console.log(
      "Cliente:",
      customer,
      "Comprou:",
      products.length,
      "produtos",
      "Total:",
      total
    );
  }
}

class Order {
  constructor(
    private readonly products: Product[],
    private readonly customerType: CustomerType,
    private readonly coupon: Coupon | null
  ) {}

  calculate(): number {
    const subtotalCalculator = new SubtotalCalculator();
    const logger = new OrderLogger();
    const largeOrderDiscount = new LargeOrderDiscount();

    let total = subtotalCalculator.calculate(this.products);

    console.log("Valor inicial:");
    console.log(total);

    total = CustomerDiscountFactory.create(this.customerType).apply(total);

    console.log("Desconto cliente VIP (20%):");
    console.log(total);

    total = CouponDiscountFactory.create(this.coupon).apply(total);

    console.log("Cupom DISCOUNT10 (10%):");
    console.log(total);

    total = largeOrderDiscount.apply(total);

    console.log("Desconto pedido grande:");
    console.log(total);

    logger.log(this.customerType, this.products, total);

    return total;
  }
}

const order = new Order(
  [
    {
      name: "Notebook",
      price: 5000,
      quantity: 1,
    },
    {
      name: "Mouse",
      price: 100,
      quantity: 2,
    },
  ],
  CustomerType.VIP,
  Coupon.DISCOUNT10
);

const result = order.calculate();

console.log("\nResultado final esperado:");
console.log(result);

const FREE_SHIPPING_MINIMUM_VALUE = 1000
const SHIPPING_VALUE = 50

type Product = {
    name: string;
    price: number;
    quantity: number;
};

type CustomerType = "VIP" | "EMPLOYEE" | "NEW"

type CouponType = "DISCOUNT10" | "DISCOUNT20" | null

class calculeProduct {
    static valueTotal(products: Product[]) {
        let total = 0;

        for (let i = 0; i < products.length; i++) {
            total += products[i].price * products[i].quantity;
        }
        return total
    }
}

class ProductCalculator {
    static calculateTotal(products: Product[]): number {
        return products.reduce(
            (total, product) => total + product.price * product.quantity,
            0
        );
    }
}


class DiscountRule {
    private static discounts: Record<CustomerType, number> = {
        VIP: 20,
        EMPLOYEE: 30,
        NEW: 10,
    };

    static apply(customerType: CustomerType, total: number): number {
        const discount = this.discounts[customerType];

        if (!discount) {
            throw new Error("Invalid customer type");
        }

        return total - (total * discount) / 100;
    }
}


class CouponRule {
    private static coupons: Record<Exclude<CouponType, null>, number> = {
        DISCOUNT10: 10,
        DISCOUNT20: 20,
    };

    static apply(coupon: CouponType, total: number): number {
        if (!coupon) {
            return total;
        }

        const discount = this.coupons[coupon];

        return total - (total * discount) / 100;
    }
}

class ShippingRule {

    static calculeShipping(total: number) {
        if (total > FREE_SHIPPING_MINIMUM_VALUE) {
            return total = total - 50
        }
        return total
    }
}

class PurchaseLogger {
    static LogFinishPurchase(client: CustomerType, products: Product[], total: number) {
        console.log({
            Cliente: client,
            Produtos: products.length,
            Total: `R$${total}`
        });
    }
}


class Order {
    products: Product[];
    customerType: CustomerType;
    coupon: CouponType;

    constructor(products: Product[], customerType: CustomerType, coupon: CouponType) {
        this.products = products;
        this.customerType = customerType;
        this.coupon = coupon;
    }

    calculate() {
        let total = ProductCalculator.calculateTotal(this.products);

        total = DiscountRule.apply(
            this.customerType,
            total
        );

        total = CouponRule.apply(
            this.coupon,
            total
        );

        total = ShippingRule.calculeShipping(total);

        PurchaseLogger.LogFinishPurchase(
            this.customerType,
            this.products,
            total
        );

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
    "VIP",
    "DISCOUNT10"
);

order.calculate();
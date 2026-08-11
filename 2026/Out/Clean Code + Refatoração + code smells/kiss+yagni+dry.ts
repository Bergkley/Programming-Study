// Kiss (Keep It Simple, Stupid!) = mantem o código simples e fácil de entender

class Product {
    constructor(public name: string, public price: number) {}
}

class Order {
    constructor(public customer: string, public products: Product[]) {}
}


// YAGNI (You Ain't Gonna Need It) = não faça coisas que você não precisa


// DRY (Don't Repeat Yourself) = não repita o mesmo código
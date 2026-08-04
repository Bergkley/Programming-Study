/**
 * ==========================================================
 * EXERCÍCIOS DE DESIGN PATTERNS (Factory e Strategy)
 * Total: 10 exercícios
 * Objetivo: praticar os padrões Factory Method e Strategy
 * ==========================================================
 *
 * Regras:
 * - Resolva utilizando TypeScript.
 * - Não altere os enunciados.
 * - Sempre que possível, utilize interfaces.
 * - Explique (em comentários) qual Design Pattern foi utilizado.
 */

/* ==========================================================
   EXERCÍCIO 1 - FACTORY
   ==========================================================

Problema:
O sistema cria veículos utilizando vários if/else.

Tarefa:
Crie uma Factory responsável por criar:

- Carro
- Moto
- Caminhão

Todos devem possuir o método:

start()

*/

class VehicleService {
  create(type: string) {
    if (type === "car") {
      return {
        start() {
          console.log("Carro ligado");
        },
      };
    }

    if (type === "motorcycle") {
      return {
        start() {
          console.log("Moto ligada");
        },
      };
    }

    return {
      start() {
        console.log("Caminhão ligado");
      },
    };
  }
}

// Sua solução aqui...

interface ITurnOn {
  start(): void;
}

class Car implements ITurnOn {
  start() {
    console.log("Carro ligado");
  }
}
class Motorcycle implements ITurnOn {
  start() {
    console.log("Moto ligada");
  }
}
class Truck implements ITurnOn {
  start() {
    console.log("Caminhão ligado");
  }
}

class VehicleFactory {
  create(type: string): ITurnOn {
    switch (type) {
      case "car":
        return new Car();

      case "motorcycle":
        return new Motorcycle();

      case "truck":
        return new Truck();

      default:
        throw new Error("Tipo inválido");
    }
  }
}

class VehicleService2 {
  constructor(private factory = new VehicleFactory()) {}

  create(type: string): ITurnOn {
    return this.factory.create(type);
  }
}

const service = new VehicleService();

const car = service.create("car");
car.start();

const moto = service.create("motorcycle");
moto.start();

const truck = service.create("truck");
truck.start();

/* ==========================================================
   EXERCÍCIO 2 - FACTORY
   ==========================================================

Problema:
Uma aplicação cria notificações utilizando vários if.

Tarefa:
Implemente uma Factory para criar:

- Email
- SMS
- Push Notification

Todos devem implementar:

send(message: string)

*/

class NotificationService {
  create(type: string) {
    if (type === "email") {
      console.log("Email");
    }

    if (type === "sms") {
      console.log("SMS");
    }

    if (type === "push") {
      console.log("Push");
    }
  }
}

// Sua solução aqui...

interface INotification {
  send(message: string): void;
}
class NotificationEmail implements INotification {
  send(message: string) {
    console.log("mensagem via email: " + message);
  }
}

class NotificationSMS implements INotification {
  send(message: string) {
    console.log("mensagem via SMS: " + message);
  }
}

class NotificationPushNotification implements INotification {
  send(message: string) {
    console.log("mensagem via PushNotification: " + message);
  }
}

class NotificationFactory {
  create(type: string): INotification {
    switch (type) {
      case "email":
        return new NotificationEmail();

      case "sms":
        return new NotificationSMS();

      case "push":
        return new NotificationPushNotification();

      default:
        throw new Error("Tipo inválido");
    }
  }
}

class NotificationService2 {
  constructor(private factory = new NotificationFactory()) {}

  create(type: string): INotification {
    return this.factory.create(type);
  }
}

const service2 = new NotificationService2();

const notification = service2.create("email");
notification.send("Olá, mundo!");

/* ==========================================================
   EXERCÍCIO 3 - FACTORY
   ==========================================================

Problema:
O sistema cria processadores de pagamento
diretamente com new.

Tarefa:

Criar uma Factory responsável por criar:

- Pix
- Cartão
- Boleto

Todos devem implementar:

pay(value: number)

*/

class Checkout2 {
  finish(type: string, value: number) {
    if (type === "pix") {
      console.log(`PIX: ${value}`);
    }

    if (type === "card") {
      console.log(`Cartão: ${value}`);
    }

    if (type === "boleto") {
      console.log(`Boleto: ${value}`);
    }
  }
}

// Sua solução aqui...

class Checkout3 {
  create(type: string, value: number) {
    if (type === "pix") {
      console.log(`PIX: ${value}`);
    }

    if (type === "card") {
      console.log(`Cartão: ${value}`);
    }

    if (type === "boleto") {
      console.log(`Boleto: ${value}`);
    }
  }
}

type PaymentType = "pix" | "card" | "boleto";
interface IPayment {
  pay(value: number): void;
}

class Pix3 implements IPayment {
  pay(value: number) {
    console.log(`PIX: ${value}`);
  }
}
class Card implements IPayment {
  pay(value: number) {
    console.log(`Card: ${value}`);
  }
}
class Boleto implements IPayment {
  pay(value: number) {
    console.log(`Boleto: ${value}`);
  }
}

class CheckoutFactory {
  create(type: string): IPayment {
    switch (type) {
      case "pix":
        return new Pix3();

      case "card":
        return new Card();

      case "boleto":
        return new Boleto();

      default:
        throw new Error("Tipo inválido");
    }
  }
}

class CheckoutService {
  constructor(private factory = new CheckoutFactory()) {}

  finish(type: PaymentType, value: number) {
    const payment = this.factory.create(type);
    payment.pay(value);
  }
}
const pay = new CheckoutService();
pay.finish("pix", 100);

/* ==========================================================
   EXERCÍCIO 4 - FACTORY
   ==========================================================

Problema:
O sistema exporta arquivos utilizando if.

Tarefa:

Criar uma Factory para exportadores:

- PDF
- CSV
- JSON

Todos devem possuir:

export()

*/

class ExportService {
  export(type: string) {
    if (type === "pdf") {
      console.log("PDF");
    }

    if (type === "csv") {
      console.log("CSV");
    }

    if (type === "json") {
      console.log("JSON");
    }
  }
}

// Sua solução aqui...

interface IExport {
  export(): void;
}
type ExportType = "pdf" | "csv" | "json";

class PdfExport implements IExport {
  export() {
    console.log("PDF");
  }
}
class CsvExport implements IExport {
  export() {
    console.log("Csv");
  }
}
class JsonExport implements IExport {
  export() {
    console.log("Json");
  }
}

class ExportFactory {
  create(type: string): IExport {
    switch (type) {
      case "pdf":
        return new PdfExport();

      case "csv":
        return new CsvExport();

      case "json":
        return new JsonExport();

      default:
        throw new Error("Tipo inválido");
    }
  }
}

class ExportService2 {
  constructor(private factory = new ExportFactory()) {}
  export(type: ExportType) {
    return this.factory.create(type).export();
  }
}

const pdf = new ExportService2();
pdf.export("pdf");

/* ==========================================================
   EXERCÍCIO 5 - FACTORY
   ==========================================================

Problema:
Uma fábrica de personagens cria objetos usando if.

Tarefa:

Criar uma CharacterFactory.

Personagens:

- Guerreiro
- Mago
- Arqueiro

Todos possuem:

attack()

*/

// Sua solução aqui...

type CharacterType = "Warrior" | "Wizard" | "Archer";

interface ICharacter {
    attack(): void;
}

class Warrior implements ICharacter {
    attack(): void {
        console.log("Sword");
    }
}

class Wizard implements ICharacter {
    attack(): void {
        console.log("Magic");
    }
}

class Archer implements ICharacter {
    attack(): void {
        console.log("Archery");
    }
}

class CharacterFactory {
    create(type: CharacterType): ICharacter {
        switch (type) {
            case "Warrior":
                return new Warrior();

            case "Wizard":
                return new Wizard();

            case "Archer":
                return new Archer();
        }
    }
}

class CharacterService {
    constructor(private factory = new CharacterFactory()) {}

    attack(type: CharacterType): void {
        const character = this.factory.create(type);
        character.attack();
    }
}
const warrior = new CharacterService()
warrior.attack('Warrior')

/* ==========================================================
   EXERCÍCIO 6 - STRATEGY
   ==========================================================

Problema:
O cálculo de frete depende de vários if.

Tarefa:

Criar estratégias para:

- Correios
- Transportadora
- Retirada na Loja

Todas devem implementar:

calculate(weight: number)

*/

class ShippingCalculator {
  calculate(type: string, weight: number) {
    if (type === "correios") {
      return weight * 2;
    }

    if (type === "transportadora") {
      return weight * 3;
    }

    return 0;
  }
}

// Sua solução aqui...

interface ICalculator {
    calculate(weight: number): number;
}

class Mail implements ICalculator {
    calculate(weight: number): number {
        return weight * 2;
    }
}

class Carrier implements ICalculator {
    calculate(weight: number): number {
        return weight * 3;
    }
}

class StorePickup implements ICalculator {
    calculate(weight: number): number {
        return 0;
    }
}

// Contexto
class ShippingCalculator2 {
    constructor(private calculator: ICalculator) {}

    setStrategy(calculator: ICalculator) {
        this.calculator = calculator;
    }

    calculate(weight: number): number {
        return this.calculator.calculate(weight);
    }
}

const shipping = new ShippingCalculator2(new Mail());

console.log(shipping.calculate(10)); 

shipping.setStrategy(new Carrier());
console.log(shipping.calculate(10)); 

shipping.setStrategy(new StorePickup());
console.log(shipping.calculate(10)); 


/* ==========================================================
   EXERCÍCIO 7 - STRATEGY
   ==========================================================

Problema:
O sistema calcula descontos utilizando if.

Tarefa:

Criar estratégias para:

- Cliente Comum
- Cliente VIP
- Cliente Premium

Todas devem implementar:

calculate(price: number)

*/

class DiscountService {
  calculate(type: string, value: number) {
    if (type === "common") {
      return value;
    }

    if (type === "vip") {
      return value * 0.9;
    }

    return value * 0.8;
  }
}

// Sua solução aqui...

interface IDiscount {
    calculate(price: number): number
}


class ClientCommon implements IDiscount {
    calculate(price: number): number {
        return price * 0.10
    }

}

class ClientVip implements IDiscount {
    calculate(price: number): number {
        return price * 0.30
    }

}

class ClientPremium implements IDiscount {
    calculate(price: number): number {
        return price * 0.50
    }
}

class Party {
    constructor(private discountClient : IDiscount){}
    
    setDiscountClient(type:IDiscount){
        this.discountClient = type
    }

    discount(prince:number){
        return this.discountClient.calculate(prince)
    }
}

const party = new Party(new ClientCommon());

console.log(party.discount(100)); 

party.setDiscountClient(new ClientVip());
console.log(party.discount(100)); 

party.setDiscountClient(new ClientPremium());
console.log(party.discount(100));

/* ==========================================================
   EXERCÍCIO 8 - STRATEGY
   ==========================================================

Problema:
Uma lista pode ser ordenada de diversas maneiras.

Tarefa:

Criar estratégias para:

- Crescente
- Decrescente
- Aleatória

Todas devem implementar:

sort(values: number[])

*/

// Sua solução aqui...

interface ISort {
    sort(values: number[]): number[];
}

class Ascending implements ISort {
    sort(values: number[]): number[] {
        return [...values].sort((a, b) => a - b);
    }
}

class Descending implements ISort {
    sort(values: number[]): number[] {
        return [...values].sort((a, b) => b - a);
    }
}

class RandomOrder implements ISort {
    sort(values: number[]): number[] {
        return [...values].sort(() => Math.random() - 0.5);
    }
}

class Sort {
    constructor(private strategy: ISort) {}

    setStrategy(strategy: ISort): void {
        this.strategy = strategy;
    }

    order(values: number[]): number[] {
        return this.strategy.sort(values);
    }
}

const numbers = [5, 2, 9, 1, 7];

const sorter = new Sort(new Ascending());

console.log(sorter.order(numbers));

sorter.setStrategy(new Descending());

console.log(sorter.order(numbers));

sorter.setStrategy(new RandomOrder());

console.log(sorter.order(numbers));


/* ==========================================================
   EXERCÍCIO 9 - STRATEGY
   ==========================================================

Problema:
O sistema possui vários algoritmos de compressão.

Tarefa:

Criar estratégias para:

- ZIP
- RAR
- GZIP

Todas devem implementar:

compress(file: string)

*/

// Sua solução aqui...

interface ICompression {
    compress(file: string): string;
}

class ZipCompression implements ICompression {
    compress(file: string): string {
        return `Arquivo ${file} comprimido usando ZIP`;
    }
}

class RarCompression implements ICompression {
    compress(file: string): string {
        return `Arquivo ${file} comprimido usando RAR`;
    }
}

class GzipCompression implements ICompression {
    compress(file: string): string {
        return `Arquivo ${file} comprimido usando GZIP`;
    }
}

class Compressor {
    constructor(private strategy: ICompression) {}

    setStrategy(strategy: ICompression): void {
        this.strategy = strategy;
    }

    compress(file: string): string {
        return this.strategy.compress(file);
    }
}

const compressor = new Compressor(new ZipCompression());

console.log(compressor.compress("document.txt"));


compressor.setStrategy(new RarCompression());

console.log(compressor.compress("document.txt"));

compressor.setStrategy(new GzipCompression());

console.log(compressor.compress("document.txt"));


/* ==========================================================
   EXERCÍCIO 10 - DESAFIO FINAL
   FACTORY + STRATEGY
   ==========================================================

Sistema de Pagamentos.

Requisitos:

✔ Uma Factory deve criar o método de pagamento.

Métodos:

- PIX
- Cartão
- Boleto

Cada método de pagamento deve utilizar uma Strategy
para calcular a taxa da operação.

Exemplos:

PIX -> taxa 1%
Cartão -> taxa 5%
Boleto -> taxa fixa de R$4,00

Objetivos:

✔ Aplicar Factory Method
✔ Aplicar Strategy
✔ Utilizar Interfaces
✔ Evitar if/else fora da Factory
✔ Permitir adicionar novos pagamentos sem modificar o código existente.

Bônus:

Utilize Injeção de Dependência.

*/

// Sua solução aqui...

type TypePayment = "Pix" | "Card" | "Ticket";


interface ITaxStrategy {
    calculate(value: number): number;
}


interface IPayment2 {
    pay(value: number): string;
}



class PixTax implements ITaxStrategy {
    calculate(value: number): number {
        return value * 1.01;
    }
}


class CardTax implements ITaxStrategy {
    calculate(value: number): number {
        return value * 1.05;
    }
}


class TicketTax implements ITaxStrategy {
    calculate(value: number): number {
        return value + 4;
    }
}



class Payment implements IPayment2 {

    constructor(
        private readonly strategy: ITaxStrategy,
        private readonly name: string
    ) {}

    pay(value: number): string {

        const total = this.strategy.calculate(value);

        return `Pagamento ${this.name}: R$ ${total.toFixed(2)}`;
    }
}



class PaymentFactory {

    private static payments = {
        Pix: () => new Payment(new PixTax(), "PIX"),
        Card: () => new Payment(new CardTax(), "Cartão"),
        Ticket: () => new Payment(new TicketTax(), "Boleto")
    };


    static create(type: TypePayment): IPayment2 {

        const payment = this.payments[type];

        if (!payment) {
            throw new Error("Tipo de pagamento inválido");
        }

        return payment();
    }
}



const pix = PaymentFactory.create("Pix");
console.log(pix.pay(100));


const card = PaymentFactory.create("Card");
console.log(card.pay(100));


const boleto = PaymentFactory.create("Ticket");
console.log(boleto.pay(100));

/* ==========================================================
   FIM DOS EXERCÍCIOS
   ========================================================== */

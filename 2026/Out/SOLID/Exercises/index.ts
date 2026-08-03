/**
 * ==========================================================
 * EXERCÍCIOS DE SOLID (TypeScript)
 * Total: 10 exercícios
 * Objetivo: praticar os 5 princípios do SOLID
 * ==========================================================
 *
 * Regras:
 * - Resolva utilizando TypeScript.
 * - Não altere os enunciados.
 * - Sempre que possível, aplique boas práticas.
 * - Explique (em comentários) qual princípio do SOLID foi utilizado.
 */

/* ==========================================================
   EXERCÍCIO 1 - SRP (Single Responsibility Principle)
   ==========================================================

Problema:
A classe abaixo possui mais de uma responsabilidade.

Tarefa:
- Separar as responsabilidades.
- Criar classes específicas para:
  - gerar relatório
  - salvar arquivo
  - enviar e-mail

*/

class ReportService {
  generateReport() {
    console.log("Gerando relatório...");
  }

  saveToFile() {
    console.log("Salvando relatório...");
  }

  sendEmail() {
    console.log("Enviando relatório por e-mail...");
  }
}


// solução :
class ReportGenerator {
  generateReport() {
    console.log("Gerando relatório...");
  }
}

class ReportFileSaver {
  saveToFile() {
    console.log("Salvando relatório...");
  }
}

class ReportEmailSender {
  sendEmail() {
    console.log("Enviando relatório por e-mail...");
  }
}

const generator = new ReportGenerator();
const fileSaver = new ReportFileSaver();
const emailSender = new ReportEmailSender();

generator.generateReport();
fileSaver.saveToFile();
emailSender.sendEmail();
/* ==========================================================
   EXERCÍCIO 2 - SRP
   ==========================================================

Problema:
A classe User faz muitas coisas.

Tarefa:
Divida as responsabilidades em classes diferentes.

*/

class User {
  createUser() {
    console.log("Criando usuário");
  }

  validatePassword() {
    console.log("Validando senha");
  }

  sendWelcomeEmail() {
    console.log("Enviando e-mail");
  }
}

// solução:

class validatePasswordUser {
    validatePassword() {
    console.log("Validando senha");
  }
}


class createUser {
    createUser() {
    console.log("Criando usuário");
  }
}

class sendWelcomeEmailUser {
     sendWelcomeEmail() {
    console.log("Enviando e-mail");
  }
}

const user = new createUser()
const validatePassword = new validatePasswordUser()
const sendEmail = new sendWelcomeEmailUser()

user.createUser()
validatePassword.validatePassword()
sendEmail.sendWelcomeEmail()

/* ==========================================================
   EXERCÍCIO 3 - OCP (Open/Closed Principle)
   ==========================================================

Problema:
Sempre que surgir um novo desconto,
precisamos modificar a classe.

Tarefa:
Refatore utilizando abstração.

*/

class Discount {
  calculate(type: string, value: number) {
    if (type === "regular") {
      return value * 0.9;
    }

    if (type === "vip") {
      return value * 0.8;
    }

    return value;
  }
}

// solução:

interface IDiscount {
  discount(value: number): number;
}

class RegularDiscount implements IDiscount {
  discount(value: number): number {
    return value * 0.9;
  }
}

class VipDiscount implements IDiscount {
  discount(value: number): number {
    return value * 0.8;
  }
}

class Discount2 {
  calculate(type: IDiscount, value: number): number {
    return type.discount(value);
  }
}

const calculator = new Discount2();

console.log(calculator.calculate(new RegularDiscount(), 100));
console.log(calculator.calculate(new VipDiscount(), 100));     

/* ==========================================================
   EXERCÍCIO 4 - OCP
   ==========================================================

Problema:
Adicionar novos formatos exige alterar a classe.

Tarefa:
Permita adicionar novos formatos
sem modificar a classe principal.

*/

class Exporter {
  export(format: string) {
    if (format === "pdf") {
      console.log("Exportando PDF");
    }

    if (format === "excel") {
      console.log("Exportando Excel");
    }
  }
}

// solução

interface IExporter {
  export(): void;
}

class PdfExporter implements IExporter {
  export(): void {
    console.log("Exportando PDF");
  }
}

class CsvExporter implements IExporter {
  export(): void {
    console.log("Exportando CSV");
  }
}

class XlsxExporter implements IExporter {
  export(): void {
    console.log("Exportando XLSX");
  }
}

class Exporter2 {
  export(exporter: IExporter): void {
    exporter.export();
  }
}

const exporter = new Exporter2();

exporter.export(new PdfExporter());
exporter.export(new CsvExporter());
exporter.export(new XlsxExporter());


/* ==========================================================
   EXERCÍCIO 5 - LSP (Liskov Substitution Principle)
   ==========================================================

Problema:
O Pinguim não voa.

Tarefa:
Refatore corretamente.

*/

class Bird {
  fly() {
    console.log("Voando...");
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error("Pinguins não voam.");
  }
}

// solução :
class Bird2 {
  eat() {
    console.log("Comendo...");
  }
}

class FlyingBird extends Bird2 {
  fly() {
    console.log("Flying...");
  }
}

class Eagle extends FlyingBird {}

class Penguin2 extends Bird2 {
  swim() {
    console.log("Swimming...");
  }
}

/* ==========================================================
   EXERCÍCIO 6 - LSP
   ==========================================================

Problema:
Quadrado não pode herdar de Retângulo
da forma abaixo.

Tarefa:
Refatore respeitando o LSP.

*/

class Rectangle {
  width = 0;
  height = 0;

  setWidth(width: number) {
    this.width = width;
  }

  setHeight(height: number) {
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  override setWidth(width: number) {
    this.width = width;
    this.height = width;
  }

  override setHeight(height: number) {
    this.width = height;
    this.height = height;
  }
}

// solução :

interface Shape {
  area(): number;
}

class Rectangle2 implements Shape {
    constructor(
    private width: number,
    private height: number
  ) {}

    setWidth(width: number) {
    this.width = width;
  }

  setHeight(height: number) {
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
  
}

class Square2 implements Shape {
    constructor(private side: number) {}

  area(): number {
    return this.side * this.side;
  }
}


const rectangle = new Rectangle2(10, 20);
const square = new Square2(10);

console.log(rectangle.area()); 
console.log(square.area());   
/* ==========================================================
   EXERCÍCIO 7 - ISP (Interface Segregation Principle)
   ==========================================================

Problema:
Nem todo trabalhador precisa comer.

Tarefa:
Separe as interfaces.

*/

interface Worker2 {
  work(): void;
  eat(): void;
}

class Human implements Worker2 {
  work() {}
  eat() {}
}

class Robot implements Worker2 {
  work() {}

  eat() {
    throw new Error("Robôs não comem.");
  }
}

// solução
interface IWorkable {
  work(): void;
}

interface IEatable {
  eat(): void;
}

class Human2 implements IWorkable, IEatable {
  work(): void {
    console.log("Humano trabalhando");
  }

  eat(): void {
    console.log("Humano comendo");
  }
}

class Robot3 implements IWorkable {
  work(): void {
    console.log("Robô trabalhando");
  }
}

/* ==========================================================
   EXERCÍCIO 8 - ISP
   ==========================================================

Problema:
Uma impressora simples não faz scan.

Tarefa:
Divida as interfaces.

*/

interface Machine {
  print(): void;
  scan(): void;
  fax(): void;
}

class BasicPrinter implements Machine {
  print() {}

  scan() {
    throw new Error("Não suporta.");
  }

  fax() {
    throw new Error("Não suporta.");
  }
}

// solução :

interface IPrinter {
  print(): void;
}

interface IScanner {
  scan(): void;
}

interface IFax {
  fax(): void;
}

class BasicPrinter2 implements IPrinter {
  print(): void {
    console.log("Imprimindo...");
  }
}

class ProfessionalPrinter implements IPrinter, IScanner, IFax {
  print(): void {
    console.log("Imprimindo...");
  }

  scan(): void {
    console.log("Escaneando...");
  }

  fax(): void {
    console.log("Enviando fax...");
  }
}

/* ==========================================================
   EXERCÍCIO 9 - DIP (Dependency Inversion Principle)
   ==========================================================

Problema:
PaymentService depende diretamente
da implementação do PayPal.

Tarefa:
Aplicar DIP.

*/

class Paypal {
  pay(value: number) {
    console.log(`Pagamento: ${value}`);
  }
}

class PaymentService {
  private paypal = new Paypal();

  checkout(value: number) {
    this.paypal.pay(value);
  }
}

// solução
interface IPayment {
  pay(value: number): void;
}

class PayPal implements IPayment {
  pay(value: number): void {
    console.log(`Pagamento: ${value}`);
  }
}

class PaymentService2 {
  constructor(private payment: IPayment) {}

  checkout(value: number): void {
    this.payment.pay(value);
  }
}

const paypal = new PayPal();
const service = new PaymentService2(paypal);

service.checkout(100);


/* ==========================================================
   EXERCÍCIO 10 - DESAFIO FINAL (Aplicando TODOS os princípios)
   ==========================================================

Sistema de Notificações.

Hoje existe apenas envio por e-mail,
mas futuramente haverá:

- SMS
- WhatsApp
- Push Notification
- Discord

Requisitos:

✔ Aplicar SRP
✔ Aplicar OCP
✔ Aplicar LSP
✔ Aplicar ISP
✔ Aplicar DIP

Crie uma arquitetura onde seja possível
adicionar novos meios de notificação
sem modificar as classes existentes.

Bônus:
Use Injeção de Dependência.

*/

/* ==========================================================
   FIM DOS EXERCÍCIOS
   ========================================================== */


interface INotificationSender {
  sendNotification(): void;
}

class EmailNotification implements INotificationSender {
  sendNotification(): void {
    console.log("Enviando e-mail");
  }
}

class SmsNotification implements INotificationSender {
  sendNotification(): void {
    console.log("Enviando SMS");
  }
}

class WhatsAppNotification implements INotificationSender {
  sendNotification(): void {
    console.log("Enviando WhatsApp");
  }
}

class NotificationService3 {
  constructor(
    private sender: INotificationSender
  ) {}

  send(): void {
    this.sender.sendNotification();
  }
}
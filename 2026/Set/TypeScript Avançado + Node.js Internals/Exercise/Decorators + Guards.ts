// ==========================================================
// EXERCÍCIOS - TYPE GUARDS
// ==========================================================

// ----------------------------------------------------------
// Exercício 1 - Typeof
// Crie uma função chamada mostrarValor que receba um parâmetro
// do tipo string | number.
//
// Se for string, exiba:
// "Texto: <valor em maiúsculo>"
//
// Se for number, exiba:
// "Número ao quadrado: <valor²>"
//
// Utilize o Type Guard "typeof".
// ----------------------------------------------------------


function showValue(value: string | number) {
    if (typeof value === 'string') {
        console.log(`Text: ${value.toUpperCase()}`)
    } else {
        console.log(`Number squared: ${value ** 2}`);
    }
}

showValue('berg')
showValue(2)

// ----------------------------------------------------------
// Exercício 2 - Instanceof
// Crie duas classes:
//
// Cachorro
// - método latir()
//
// Gato
// - método miar()
//
// Crie uma função fazerSom(animal) que receba
// Cachorro | Gato.
//
// Utilize instanceof para descobrir o tipo e chamar
// o método correto.
// ----------------------------------------------------------


class Dog2 {
    public bark(): string {
        return 'Au au!';
    }
}

class Cat2 {
    public meow(): string {
        return 'Miau!';
    }
}

function isDog2(animal: Dog2 | Cat2): animal is Dog2 {
    return animal instanceof Dog2;
}

function logPet2(animal: Dog2 | Cat2): string {
    if (isDog2(animal)) {
        return animal.bark();
    }

    return animal.meow();
}

const dog = new Dog2();
const cat = new Cat2();

console.log(logPet2(dog));
console.log(logPet2(cat));

// ----------------------------------------------------------
// Exercício 3 - Operador "in"
// Crie duas interfaces:
//
// Professor
// {
//    nome: string
//    disciplina: string
// }
//
// Aluno
// {
//    nome: string
//    matricula: number
// }
//
// Crie uma função apresentarPessoa(pessoa)
// que informe:
//
// Professor de Matemática
//
// ou
//
// Aluno matrícula 123
//
// Utilize o operador "in".
// ----------------------------------------------------------

interface Teacher {
    name: string;
    discipline: string;
}

interface Student {
    name: string;
    enrollment: string;
}

function greetPerson(person: Teacher | Student): void {
    if ("discipline" in person) {
        console.log(
            `The teacher ${person.name} will teach ${person.discipline}.`
        );
    } else {
        console.log(
            `The student ${person.name} has the enrollment number ${person.enrollment}.`
        );
    }
}

const student:Student = {
    name:'berg',
    enrollment:'1'
}


const teacher:Teacher = {
    name:'berg',
    discipline:'Math'
}

greetPerson(student)
greetPerson(teacher)


// ----------------------------------------------------------
// Exercício 4 - Type Predicate
// Crie:
//
// interface Carro
// interface Moto
//
// Carro possui "portas"
// Moto possui "cilindradas"
//
// Crie uma função:
//
// function isCarro(veiculo): veiculo is Carro
//
// Depois crie outra função que utilize esse predicate
// para imprimir informações específicas do veículo.
// ----------------------------------------------------------

interface Car {
    doors: number;
}

interface Motorcycle {}

function isCar(vehicle: Car | Motorcycle): vehicle is Car {
    return "doors" in vehicle;
}

function vehicle(value: Car | Motorcycle): void {
    if (isCar(value)) {
        console.log(`It is a car with ${value.doors} doors.`);
    } else {
        console.log("It is a motorcycle.");
    }
}

const car:Car = {
    doors: 4
}

const motorcycle:Motorcycle = {}

vehicle(car)
vehicle(motorcycle)

// ----------------------------------------------------------
// Exercício 5 - União de tipos
// Crie uma função calcular(a, b)
//
// onde:
//
// a: string | number
// b: string | number
//
// Regras:
//
// se ambos forem números
// -> somar
//
// se ambos forem strings
// -> concatenar
//
// caso contrário
// -> informar que os tipos são incompatíveis.
//
// Utilize Type Guards.
// ----------------------------------------------------------



function calculate<T extends string | number>(a: T, b: T): string | number {
    if (typeof a === "number" && typeof b === "number") {
        return a + b;
    }

    if (typeof a === "string" && typeof b === "string") {
        return `${a}${b}`;
    }

    throw new Error("Incorrect type");
}

console.log(calculate(1, 2));       
console.log(calculate("1", "2"));   



// ==========================================================
// EXERCÍCIOS - DECORATORS
// ==========================================================


// ----------------------------------------------------------
// Exercício 6 - Class Decorator
//
// Crie um decorator chamado @LogClasse
//
// Sempre que uma classe for criada,
// exiba:
//
// "Classe criada!"
//
// Depois aplique na classe Produto.
// ----------------------------------------------------------

function LogClass(target:Function) {
    return console.log(`Classe Criada :` + target.name)
}

@LogClass
class Product2 {
    name:string
    constructor(m: string) {
        this.name = m;
    }
}



// ----------------------------------------------------------
// Exercício 7 - Method Decorator
//
// Crie um decorator chamado @LogMetodo
//
// Antes da execução do método,
// exiba:
//
// "Executando método..."
//
// Depois aplique ao método sacar()
// da classe Conta.
// ----------------------------------------------------------

function LogMethod(target: any, originalMethodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
        console.log(`Executing the method ${originalMethodName}`)
        return originalMethod.apply(this, args)
    }
}

class Account {
    price: number

    constructor(value: number) {
        this.price = value
    }

    @LogMethod
    without() {
        return this.price
    }
}

const account = new Account(10)
console.log('account', account.without())

// ----------------------------------------------------------
// Exercício 8 - Property Decorator
//
// Crie um decorator chamado @SomenteLeitura
//
// O objetivo é impedir alterações
// em determinada propriedade.
//
// Aplique na propriedade "cpf"
// da classe Pessoa.
// ----------------------------------------------------------


function Readonly(target: any, propertyKey: string) {
    let value: string;
    let defined = false;

    const getter = function () {
        return value;
    };

    const setter = function (newVal: string) {
        if (defined) {
            console.log(`It is not possible to change ${propertyKey}`);
            return;
        }

        value = newVal;
        defined = true;
    };

    Object.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });
}

class People2 {
    name: string;

    @Readonly
    cpf: string;

    constructor(name: string, cpf: string) {
        this.name = name;
        this.cpf = cpf;
    }
}

const berg = new People2('Berg', '123');

console.log(berg.cpf); 

berg.cpf = '456'; 

console.log(berg.cpf);

// ----------------------------------------------------------
// Exercício 9 - Parameter Decorator
//
// Crie um decorator chamado @LogParametro
//
// Sempre que um método for chamado,
// informe qual parâmetro recebeu o decorator.
//
// Utilize no método:
//
// enviarMensagem(@LogParametro texto: string)
//
// ----------------------------------------------------------

function LogParameter(
    target: any,
    propertyKey: string,
    parameterIndex: number
) {
    console.log(
        `Parameter ${parameterIndex} of method ${propertyKey} received the decorator`
    );
}

class MessageService {

    sendMessage(@LogParameter text: string) {
        console.log(`Message sent: ${text}`);
    }
}

const service = new MessageService();

service.sendMessage('Hello, world!');

// ----------------------------------------------------------
// Exercício 10 - Decorators combinados
//
// Crie uma classe Usuario.
//
// Aplique:
//
// @LogClasse
//
// Crie um método login()
//
// Aplique:
//
// @LogMetodo
//
// O método deve imprimir:
//
// "Usuário autenticado"
//
// Execute o código para observar
// a ordem de execução dos decorators.
// ----------------------------------------------------------

function LogClasse(target: Function) {
    console.log(`Decorator de classe executado: ${target.name}`);
}


function LogMetodo(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const metodoOriginal = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {

        if (!this.name || !this.password) {
            throw new Error("Usuário inválido: name e password são obrigatórios");
        }

        console.log(`Executando método: ${propertyKey}`);

        return metodoOriginal.apply(this, args);
    };
}


@LogClasse
class Usuario {
    constructor(
        public name: string,
        public password: string
    ) {}

    @LogMetodo
    login() {
        console.log("Usuário autenticado");
        return true;
    }
}


const usuario1 = new Usuario("João", "123456");
usuario1.login();


const usuario2 = new Usuario("", "");
usuario2.login();
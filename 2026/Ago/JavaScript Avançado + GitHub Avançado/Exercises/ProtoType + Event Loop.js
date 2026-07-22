/**
 * ============================================
 * Lista de Exercícios - JavaScript
 * Tema: Protótipos e Event Loop
 * Total: 10 exercícios
 * ============================================
 */

/* ==========================================================
   PARTE 1 - PROTÓTIPOS (5 exercícios)
   ========================================================== */

/*
Exercício 1 - Criando objetos com protótipos

Crie um objeto chamado Animal contendo a propriedade:
- tipo

Depois:
1. Adicione ao protótipo o método emitirSom().
2. Crie dois objetos (cachorro e gato) que herdem de Animal.
3. Cada objeto deve emitir um som diferente.
*/

const Animal = {
  tipo: "",
};

Animal.emitSound = function (som) {
  console.log(`Sound ${som}`);
};

const dog = Object.create(Animal);
dog.tipo = "Dog";
dog.emitSound("auaua");

const cat = Object.create(Animal);
cat.tipo = "cat";
cat.emitSound("Miau");

/*
Exercício 2 - Função Construtora

Crie uma função construtora Pessoa(nome, idade).

Depois:
1. Adicione ao Pessoa.prototype o método apresentar().
2. O método deve imprimir:

"Olá, meu nome é João e tenho 20 anos."

3. Crie três objetos diferentes utilizando new.
*/

function People(name, age) {
  this.name = name;
  this.age = age;
}

People.prototype.introduce = function () {
  console.log(`Hello, my name is ${this.name} and have ${this.age} years`);
};

const joao = new People("Joao", 20);
joao.introduce();

const berg = new People("Berg", 21);
berg.introduce();

const maria = new People("Maria", 20);
maria.introduce();

/*
Exercício 3 - Herança por protótipos

Crie:

- Veiculo
- Carro

Requisitos:
1. Veiculo deve possuir o método ligar().
2. Carro deve herdar de Veiculo.
3. Carro deve possuir o método acelerar().
4. Teste ambos os métodos.
*/

function Vehicle() {}

Vehicle.prototype.turnOn = function () {
  console.log("Turn on Car");
};

function Car() {}

Car.prototype = Object.create(Vehicle.prototype);
Car.prototype.constructor = Car;

Car.prototype.accelerate = function () {
  console.log("Accelerating!");
};

const Corsa = new Car();

Corsa.turnOn();
Corsa.accelerate();

/*
Exercício 4 - Sobrescrita de métodos

Crie:

- Funcionario
- Programador

Requisitos:
1. Funcionario deve possuir o método trabalhar().
2. Programador deve herdar de Funcionario.
3. Sobrescreva o método trabalhar().
4. Compare o comportamento dos dois objetos.
*/
function Employee(name) {
  this.name = name;
}

Employee.prototype.work = function () {
  console.log(`${this.name} is working.`);
};

function Developer(name) {
  Employee.call(this, name);
}

Developer.prototype = Object.create(Employee.prototype);
Developer.prototype.constructor = Developer;

Developer.prototype.work = function () {
  console.log(`${this.name} is programming.`);
};

const employee = new Employee("John");
const developer = new Developer("Mary");

employee.work();
developer.work();

/*
Exercício 5 - Explorando protótipos

Crie uma função construtora Livro.

Depois:

1. Crie um objeto livro.
2. Utilize:

- instanceof
- Object.getPrototypeOf()
- hasOwnProperty()

3. Explique o resultado de cada um.
*/

function Book(title, author, year) {
  this.title = title;
  this.author = author;
  this.year = year;
}

const bookBerg = new Book("Advancing in Programming", "Berg", 2026);

console.log("instanceof:", bookBerg instanceof Book);
// Verifica se o objeto bookBerg foi criado usando a função construtora Book.
// O resultado será true, pois bookBerg é uma instância de Book.


console.log("Object.getPrototypeOf:", Object.getPrototypeOf(bookBerg) === Book.prototype);
// Verifica se o protótipo de bookBerg é igual ao protótipo da função construtora Book.
// O resultado será true, pois objetos criados com new Book() herdam de Book.prototype.


console.log("hasOwnProperty title:", bookBerg.hasOwnProperty("title"));
// Verifica se a propriedade title pertence diretamente ao objeto bookBerg.
// O resultado será true, pois title foi criada dentro do construtor usando this.


console.log("hasOwnProperty author:", bookBerg.hasOwnProperty("author"));
// Verifica se a propriedade author pertence diretamente ao objeto bookBerg.
// O resultado será true, pois author foi criada dentro do construtor usando this.


console.log("hasOwnProperty year:", bookBerg.hasOwnProperty("year"));
// Verifica se a propriedade year pertence diretamente ao objeto bookBerg.
// O resultado será true, pois year foi criada dentro do construtor usando this.

/* ==========================================================
   PARTE 2 - EVENT LOOP (5 exercícios)
   ========================================================== */

/*
Exercício 6 - Ordem de execução

Sem executar, informe a saída do código.

Explique por que isso acontece.

----------------------------------------------------------*/

console.log("A"); '1'

setTimeout(() => {
  console.log("B"); '3'
}, 0);

console.log("C"); '2'

/*
Exercício 7 - Promise x setTimeout

Sem executar, informe a ordem da saída.



----------------------------------------------------------*/

console.log("Início"); '1'

setTimeout(() => {
  console.log("Timeout"); '4'
}, 0);

Promise.resolve().then(() => {
  console.log("Promise"); '3'
});

console.log("Fim"); '2'

/*
Exercício 8 - Múltiplas Promises

Determine a saída do código abaixo.

Explique por que ela ocorre nessa ordem.

----------------------------------------------------------*/

console.log(1); '1'

Promise.resolve().then(() => {
  console.log(2); '3'
});

Promise.resolve().then(() => {
  console.log(3); '4'
});

console.log(4); '2'

/*
Exercício 9 - Event Loop completo

Determine a ordem da saída.



----------------------------------------------------------*/

console.log("A"); '1'

setTimeout(() => {
  console.log("B"); '4'

  Promise.resolve().then(() => {
    console.log("C"); '5'
  });
}, 0);

Promise.resolve().then(() => {
  console.log("D"); '3'
});

console.log("E"); '2'

/*
Exercício 10 - Simulando uma requisição

Crie uma função buscarDados() utilizando Promise
e setTimeout.

Requisitos:

1. Mostrar:
   "Buscando dados..."

2. Esperar 2 segundos.

3. Mostrar:
   "Dados carregados!"

*/

function fetchData() {
    console.log('Fetching data...');

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Data loaded!');
        }, 2000);
    });
}

fetchData().then((message) => {
    console.log(message);
});


/* ===========================
   Fim da Lista de Exercícios
   =========================== */

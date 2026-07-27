/**
 * ===========================================
 * Exercícios de TypeScript
 * Tema: Generics e Utility Types
 * ===========================================
 *
 * Instruções:
 * Resolva os exercícios diretamente neste arquivo.
 * Não altere os enunciados.
 */

/* =====================================================
   PARTE 1 - GENERICS
===================================================== */

/**
 * Exercício 1
 *
 * Crie uma função genérica chamada `identity`
 * que receba um valor de qualquer tipo e
 * retorne exatamente esse mesmo valor.
 *
 * Exemplo:
 *
 * identity(10);      // 10
 * identity("Olá");   // "Olá"
 * identity(true);    // true
 */

function identity<T>(value: T) {
  return console.log(value);
}

identity(10);
identity("hello");
identity(true);

/* --------------------------------------------------- */

/**
 * Exercício 2
 *
 * Crie uma função chamada `firstElement`
 * que receba um array de qualquer tipo e
 * retorne o primeiro elemento.
 *
 * Exemplo:
 *
 * firstElement([1,2,3]);          // 1
 * firstElement(["a","b","c"]);    // "a"
 */


function firstElement<T>(array: T[]) {
  return console.log(array[0]);
}

firstElement([1,2,3]);
firstElement(["a","b","c"]); 



/* --------------------------------------------------- */

/**
 * Exercício 3
 *
 * Crie uma interface genérica chamada
 * ApiResponse<T>.
 *
 * Ela deve possuir:
 *
 * - success
 * - data
 *
 * Depois utilize essa interface para representar:
 *
 * - resposta de um usuário
 * - resposta de uma lista de produtos
 */

interface ApiResponse<T> {
    success: boolean,
    data: T
}


function getUser(): ApiResponse<string> {
    return {
        success: true,
        data: "Berg",
    };
}


function listProduct(): ApiResponse<string[]> {
    return { success: true, data: ['keyboard', 'mouse'] }
}

console.log(getUser())
console.log(listProduct())

/* --------------------------------------------------- */

/**
 * Exercício 4
 *
 * Crie uma classe genérica chamada Box<T>.
 *
 * Ela deve possuir:
 *
 * - atributo privado value
 * - método setValue()
 * - método getValue()
 *
 * Depois instancie:
 *
 * const numberBox = new Box<number>();
 *
 * const stringBox = new Box<string>();
 */

class Box<T> {
  private value!: T;

  setValue(value: T): void {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}
const numberBox = new Box<number>();
const stringBox = new Box<string>();


numberBox.setValue(10)

console.log(numberBox.getValue())


stringBox.setValue('berg')

console.log(stringBox.getValue())

/* --------------------------------------------------- */

/**
 * Exercício 5
 *
 * Crie uma função chamada mergeObjects.
 *
 * Ela deve receber dois objetos de tipos diferentes
 * e retornar um único objeto contendo todas
 * as propriedades.
 *
 * Exemplo:
 *
 * mergeObjects(
 *   { nome: "João" },
 *   { idade: 25 }
 * );
 *
 * Resultado esperado:
 *
 * {
 *   nome: "João",
 *   idade: 25
 * }
 */

function mergeObjects<T, U>(obj1: T, obj2: U): T & U {
  return {
    ...obj1,
    ...obj2
  };
}


console.log(mergeObjects(
   { nome: "João" },
  { idade: 25 }
 ))

/* =====================================================
   PARTE 2 - UTILITY TYPES
===================================================== */

/**
 * Considere a interface abaixo para os
 * próximos exercícios.
 */

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  age: number;
}

/* --------------------------------------------------- */

/**
 * Exercício 6
 *
 * Crie um tipo chamado UserUpdate utilizando
 * Partial<User>.
 *
 * Depois crie um objeto contendo apenas
 * o campo "name".
 */

type UserUpdate = Partial<User>

const usr:UserUpdate = {
    name:'berg'

}

/* --------------------------------------------------- */

/**
 * Exercício 7
 *
 * Crie um tipo chamado CompleteUser utilizando
 * Required<User>.
 *
 * Depois crie um objeto válido contendo
 * todas as propriedades.
 */

type CompleteUser = Required<User>

const usr2: CompleteUser = {
    name:'berg',
    age: 21,
    email: "test@gmail.com",
    password: "123456",
    id: 1
}
/* --------------------------------------------------- */

/**
 * Exercício 8
 *
 * Crie um tipo chamado UserProfile utilizando
 * Pick<User, ...>.
 *
 * Ele deve conter apenas:
 *
 * - id
 * - name
 * - email
 */

type UserProfile =Pick<User,"id" | "name" | "email">

const usr3:UserProfile = {
    id:2,
    name:"berg",
    email:"test@gmail.com"
} 

/* --------------------------------------------------- */

/**
 * Exercício 9
 *
 * Crie um tipo chamado PublicUser utilizando
 * Omit<User, ...>.
 *
 * Ele deve possuir todos os dados do usuário,
 * exceto:
 *
 * - password
 */

type PublicUser = Omit<User,"password">

const usr4:PublicUser = {
    name:'berg3',
    age: 21,
    email: "test@gmail.com",
    id: 3
}

/* --------------------------------------------------- */

/**
 * Exercício 10
 *
 * Crie um tipo chamado UserRoles utilizando
 * Record.
 *
 * As chaves devem ser:
 *
 * - "admin"
 * - "user"
 * - "guest"
 *
 * Os valores devem ser do tipo string.
 *
 * Exemplo esperado:
 *
 * const roles: UserRoles = {
 *   admin: "Administrador",
 *   user: "Usuário",
 *   guest: "Visitante",
 * };
 */

type keys = "admin" | "user" | "guest"
type UserRoles = Record<keys, string>

const roles: UserRoles = {
  admin: 'Administrador',
  user: 'Usuário comum',
  guest: 'Convidado'
}


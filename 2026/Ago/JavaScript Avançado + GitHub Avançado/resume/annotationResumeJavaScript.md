# Async+Await

Aqui está uma versão mais completa, organizada e didática do seu arquivo Markdown:

# JavaScript — Async e Await

## O que são `async` e `await`?

`async` e `await` são recursos (sintaxe) do JavaScript que facilitam o trabalho com operações assíncronas (promise), tornando o código mais legível e próximo de um código síncrono.

Esses recursos foram introduzidos no **ES2017 (ES8)** e são construídos sobre **Promises**.

---

## O que é uma função `async`?

Uma função declarada com a palavra-chave `async` sempre retorna uma **Promise**, mesmo que o valor retornado não seja uma Promise.

### Exemplo

```javascript
async function saudacao() {
  return "Olá!";
}

saudacao().then(console.log);
// Olá!
```

---

## O que faz o `await`?

A palavra-chave `await` faz com que a execução da função espere até que uma Promise seja resolvida ou rejeitada.

> O `await` só pode ser utilizado dentro de funções `async` (exceto em módulos JavaScript que suportam Top-Level Await).

### Exemplo

```javascript
function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function executar() {
  console.log("Início");

  await esperar(2000);

  console.log("Fim");
}

executar();
```

**Saída:**

```
Início
(2 segundos depois)
Fim
```

---

## Consumindo uma API

Um dos usos mais comuns de `async` e `await` é fazer requisições HTTP.

```javascript
async function buscarUsuario() {
  const resposta = await fetch(
    "https://jsonplaceholder.typicode.com/users/1"
  );

  const usuario = await resposta.json();

  console.log(usuario);
}

buscarUsuario();
```

---

## Tratando erros

Sempre que possível, utilize `try...catch` para capturar erros durante operações assíncronas.

```javascript
async function buscarDados() {
  try {
    const resposta = await fetch("https://api.exemplo.com/dados");

    if (!resposta.ok) {
      throw new Error("Erro ao buscar dados");
    }

    const dados = await resposta.json();

    console.log(dados);
  } catch (erro) {
    console.error("Erro:", erro.message);
  }
}
```

---

## Async/Await vs `.then()`

### Utilizando `.then()`

```javascript
fetch("/usuarios")
  .then((resposta) => resposta.json())
  .then((dados) => {
    console.log(dados);
  })
  .catch((erro) => {
    console.error(erro);
  });
```

### Utilizando `async/await`

```javascript
async function buscarUsuarios() {
  try {
    const resposta = await fetch("/usuarios");
    const dados = await resposta.json();

    console.log(dados);
  } catch (erro) {
    console.error(erro);
  }
}
```

O código com `async/await` costuma ser mais fácil de ler, principalmente quando existem várias operações assíncronas encadeadas.

---

## Boas práticas

- Utilize `try...catch` para tratar erros.
- Evite usar `await` quando as operações podem ocorrer em paralelo.
- Quando possível, utilize `Promise.all()` para executar várias Promises simultaneamente.
- Dê nomes claros para funções assíncronas (`buscarUsuarios`, `salvarPedido`, etc.).
- Evite misturar `.then()` e `await` na mesma lógica, salvo quando houver necessidade.

### Exemplo com `Promise.all()`

```javascript
async function buscarTudo() {
  const [usuarios, produtos] = await Promise.all([
    fetch("/usuarios").then((r) => r.json()),
    fetch("/produtos").then((r) => r.json()),
  ]);

  console.log(usuarios);
  console.log(produtos);
}
```

---

## Resumo

- `async` transforma uma função em uma função que retorna uma Promise.
- `await` pausa a execução até que a Promise seja resolvida.
- `try...catch` é a forma recomendada para tratar erros.
- `async/await` melhora a legibilidade do código assíncrono.
- `Promise.all()` permite executar várias operações em paralelo.

---

## Referências
- Vídeo: https://www.youtube.com/watch?v=WUmAAxH9n-A




---

# Bind,Apply,Call

# JavaScript Avançado

# `this`, `bind`, `call` e `apply`

Em JavaScript, a palavra-chave **`this`** representa o **contexto de execução** de uma função, ou seja, o objeto ao qual ela está associada no momento em que é chamada.

Entender o funcionamento do `this` é essencial para utilizar corretamente os métodos **`bind`**, **`call`** e **`apply`**, que permitem controlar explicitamente esse contexto.

---

# O que é o `this`?

O valor de `this` **não depende de onde a função foi criada**, mas sim **de como ela é chamada**.

Veja o exemplo:

```javascript
const pessoa = {
  nome: "João",

  apresentar() {
    console.log(`Olá, meu nome é ${this.nome}`);
  },
};

pessoa.apresentar();
```

Saída:

```text
Olá, meu nome é João
```

Nesse caso, `this` aponta para o objeto `pessoa`.

---

# Exemplo sem contexto

```javascript
const pessoa = {
  nome: "João",

  apresentar() {
    console.log(this.nome);
  },
};

const apresentar = pessoa.apresentar;

apresentar();
```

Saída (modo estrito):

```text
undefined
```

Ou em alguns ambientes:

```text
TypeError
```

Isso acontece porque a função foi executada **sem um objeto associado**, fazendo com que o `this` perca sua referência original.

---

# Como o `this` funciona?

O valor de `this` depende da forma como a função é chamada.

| Chamada | Valor de `this` |
|----------|-----------------|
| `obj.metodo()` | `obj` |
| Função comum | `undefined` (modo estrito) ou objeto global |
| `new Funcao()` | Nova instância criada |
| Arrow Function | Herda o `this` do escopo externo |
| `call`, `apply` ou `bind` | Definido manualmente |

---

# Arrow Functions

Arrow Functions **não possuem seu próprio `this`**.

Elas utilizam o `this` do escopo onde foram criadas.

```javascript
const pessoa = {
  nome: "Maria",

  falar() {
    const mensagem = () => {
      console.log(this.nome);
    };

    mensagem();
  },
};

pessoa.falar();
```

Saída:

```text
Maria
```

Nesse exemplo, a Arrow Function herda o `this` do método `falar`.

---

# O método `call()`

O método `call()` executa uma função imediatamente, permitindo definir qual será o valor de `this`.

Sintaxe:

```javascript
funcao.call(thisArg, arg1, arg2, arg3);
```

---

## Exemplo

```javascript
function apresentar(cidade) {
  console.log(`${this.nome} mora em ${cidade}`);
}

const pessoa = {
  nome: "Carlos",
};

apresentar.call(pessoa, "Fortaleza");
```

Saída:

```text
Carlos mora em Fortaleza
```

O primeiro argumento é o objeto que será utilizado como `this`.

Os demais argumentos são passados normalmente.

---

# O método `apply()`

O `apply()` funciona praticamente igual ao `call()`.

A diferença é que os argumentos são enviados em um **array**.

Sintaxe:

```javascript
funcao.apply(thisArg, [arg1, arg2]);
```

---

## Exemplo

```javascript
function apresentar(cidade, estado) {
  console.log(`${this.nome} mora em ${cidade} - ${estado}`);
}

const pessoa = {
  nome: "Ana",
};

apresentar.apply(pessoa, ["Fortaleza", "CE"]);
```

Saída:

```text
Ana mora em Fortaleza - CE
```

---

# Diferença entre `call()` e `apply()`

### call()

Argumentos separados.

```javascript
funcao.call(objeto, arg1, arg2);
```

---

### apply()

Argumentos dentro de um array.

```javascript
funcao.apply(objeto, [arg1, arg2]);
```

---

# O método `bind()`

O `bind()` também permite definir o valor de `this`.

A principal diferença é que **ele não executa a função imediatamente**.

Ele retorna uma **nova função** com o `this` fixado.

Sintaxe:

```javascript
const novaFuncao = funcao.bind(thisArg);
```

---

## Exemplo

```javascript
const pessoa = {
  nome: "Pedro",
};

function apresentar() {
  console.log(this.nome);
}

const apresentarPedro = apresentar.bind(pessoa);

apresentarPedro();
```

Saída:

```text
Pedro
```

Observe que `bind()` cria uma nova função.

---

## Outro exemplo

Imagine um botão em uma página HTML.

```javascript
class Contador {
  constructor() {
    this.valor = 0;
  }

  incrementar() {
    this.valor++;
    console.log(this.valor);
  }
}

const contador = new Contador();

setTimeout(contador.incrementar, 1000);
```

Resultado:

```text
undefined
```

Isso acontece porque o método perdeu o contexto.

A solução:

```javascript
setTimeout(contador.incrementar.bind(contador), 1000);
```

Agora o método será executado corretamente.

---

# Comparação entre `call`, `apply` e `bind`

| Método | Executa imediatamente? | Argumentos | Retorna |
|----------|-----------------------|------------|----------|
| `call()` | ✅ Sim | Separados | Resultado da função |
| `apply()` | ✅ Sim | Array | Resultado da função |
| `bind()` | ❌ Não | Separados (opcionalmente no bind) | Nova função |

---

# Exemplo comparando os três

```javascript
function saudacao(cidade) {
  console.log(`${this.nome} mora em ${cidade}`);
}

const pessoa = {
  nome: "Lucas",
};

// Executa imediatamente
saudacao.call(pessoa, "Recife");

// Executa imediatamente
saudacao.apply(pessoa, ["Recife"]);

// Retorna uma nova função
const apresentar = saudacao.bind(pessoa);

apresentar("Recife");
```

Todos produzem:

```text
Lucas mora em Recife
```

A diferença está **na forma de execução**.

---

# Quando usar cada um?

## Use `call()`

- Quando deseja executar a função imediatamente.
- Quando possui poucos argumentos.

```javascript
funcao.call(objeto, arg1, arg2);
```

---

## Use `apply()`

- Quando os argumentos já estão em um array.

```javascript
funcao.apply(objeto, argumentos);
```

---

## Use `bind()`

- Quando deseja reutilizar a função depois.
- Em callbacks e eventos.
- Para evitar a perda do contexto (`this`).

```javascript
const novaFuncao = funcao.bind(objeto);
```

---

# Resumo

| Recurso | Finalidade |
|----------|------------|
| `this` | Representa o contexto de execução da função. |
| `call()` | Executa a função imediatamente com um `this` definido. |
| `apply()` | Igual ao `call()`, mas recebe os argumentos em um array. |
| `bind()` | Retorna uma nova função com o `this` permanentemente associado. |
| Arrow Function | Não possui `this` próprio; utiliza o do escopo externo. |

---

# Fluxo mental

```
Preciso mudar o this?

        │
        ▼
Executar agora?
        │
   ┌────┴────┐
   │         │
  Sim       Não
   │         │
   ▼         ▼
Argumentos   bind()
em array?
   │
 ┌─┴──┐
 │    │
Sim  Não
 │     │
 ▼     ▼
apply() call()
```

---

# Boas práticas

- Evite armazenar métodos em variáveis sem considerar o contexto de `this`.
- Prefira Arrow Functions quando quiser preservar o `this` do escopo externo.
- Utilize `bind()` em callbacks (`setTimeout`, `setInterval`, eventos etc.) quando precisar manter o contexto.
- Escolha entre `call()` e `apply()` conforme a forma como os argumentos já estão disponíveis.

---

# Referências
- Vídeo: https://www.youtube.com/watch?v=wjMCSsfx9kg

---

# Closures

### Closures

- Definição: Uma closure é uma função que mantém acesso/referência  às variáveis do escopo em que foi criada, mesmo após esse escopo já ter sido finalizado.


### Referência

https://www.youtube.com/watch?v=Tr_fjFTK7wI

https://www.youtube.com/watch?v=l32Q7FRvwAQ

---

# Currying

# JavaScript Avançado

## Currying

**Currying** é uma técnica de programação funcional que transforma uma função que recebe **vários argumentos** em uma sequência de funções que recebem **apenas um argumento por vez**.

Em vez de chamar uma função passando todos os parâmetros de uma só vez, cada chamada retorna uma nova função que recebe o próximo argumento.

Essa técnica facilita a reutilização de código, a criação de funções mais específicas e a composição de funções.

---

## Sem Currying

Considere uma função que soma três números:

```javascript
function soma(a, b, c) {
  return a + b + c;
}

console.log(soma(10, 20, 30)); // 60
```

Todos os argumentos precisam ser passados na mesma chamada.

---

## Com Currying

Utilizando Currying, a função é dividida em várias funções menores:

```javascript
function soma(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

console.log(soma(10)(20)(30)); // 60
```

Cada função recebe apenas um argumento e retorna outra função até possuir todas as informações necessárias para executar o cálculo.

---

## Utilizando Arrow Functions

Uma forma mais comum de escrever Currying em JavaScript moderno é utilizando Arrow Functions:

```javascript
const soma = (a) => (b) => (c) => a + b + c;

console.log(soma(10)(20)(30)); // 60
```

Esse formato é bastante utilizado em bibliotecas de programação funcional.

---

## Exemplo prático

Imagine uma função para calcular descontos.

Sem Currying:

```javascript
function aplicarDesconto(desconto, valor) {
  return valor - valor * desconto;
}

console.log(aplicarDesconto(0.1, 500)); // 450
```

Se você precisar aplicar sempre o mesmo desconto, terá que informar o percentual todas as vezes.

Com Currying:

```javascript
const aplicarDesconto = (desconto) => (valor) =>
  valor - valor * desconto;

const desconto10 = aplicarDesconto(0.10);
const desconto20 = aplicarDesconto(0.20);

console.log(desconto10(500)); // 450
console.log(desconto10(1000)); // 900

console.log(desconto20(500)); // 400
```

Agora foi possível criar funções especializadas:

- `desconto10`
- `desconto20`

Cada uma reutiliza o percentual informado anteriormente.

---

## Outro exemplo

Criando uma função de saudação:

```javascript
const saudacao = (cumprimento) => (nome) =>
  `${cumprimento}, ${nome}!`;

const bomDia = saudacao("Bom dia");
const boaNoite = saudacao("Boa noite");

console.log(bomDia("Maria"));
// Bom dia, Maria!

console.log(boaNoite("João"));
// Boa noite, João!
```

Observe que o cumprimento foi definido apenas uma vez.

---

## Currying vs Função comum

### Função comum

```javascript
const multiplicar = (a, b) => a * b;

multiplicar(5, 10);
```

### Currying

```javascript
const multiplicar = (a) => (b) => a * b;

multiplicar(5)(10);
```

A versão com Currying permite reutilizar parte da função:

```javascript
const dobrar = multiplicar(2);

console.log(dobrar(8)); // 16
console.log(dobrar(20)); // 40
console.log(dobrar(100)); // 200
```

---

## Vantagens

- Reutilização de código.
- Criação de funções mais específicas.
- Facilita a composição de funções.
- Reduz repetição de parâmetros.
- Muito utilizada em programação funcional.

---

## Quando usar?

O Currying é indicado quando:

- Você utiliza frequentemente os mesmos argumentos.
- Deseja criar funções reutilizáveis a partir de funções genéricas.
- Está trabalhando com bibliotecas funcionais, como **Ramda** ou **Lodash FP**.
- Quer tornar a composição de funções mais simples.

---

## Quando NÃO usar?

Nem toda função precisa ser transformada em uma função curried.

Evite utilizar Currying quando:

- A função é simples e usada apenas uma vez.
- O código fica mais difícil de ler do que a versão tradicional.
- Não existe benefício em reutilizar argumentos parcialmente.

O objetivo é tornar o código mais reutilizável, e não mais complexo.

---

## Resumo

| Função comum | Currying |
|--------------|----------|
| Recebe todos os argumentos de uma vez | Recebe um argumento por chamada |
| `soma(1, 2, 3)` | `soma(1)(2)(3)` |
| Menos reutilizável | Permite criar funções especializadas |
| Mais simples para casos básicos | Excelente para programação funcional |

---

## Referências

- Vídeo: https://www.youtube.com/watch?v=rec4I8zfYjc

---

# Event Loop

# JavaScript Event Loop

## O que é o Event Loop?

O **Event Loop** é o mecanismo responsável por coordenar a execução do código JavaScript, permitindo que operações assíncronas (como requisições HTTP, `setTimeout` e eventos do navegador) sejam executadas sem bloquear a *thread* principal.

Embora o JavaScript seja **single-threaded** (executa uma instrução por vez), o Event Loop trabalha em conjunto com a **Call Stack**, as **Web APIs** (ou APIs do ambiente de execução, como Node.js) e as **Filas de Tarefas (Task Queue e Microtask Queue)** para gerenciar a execução de tarefas assíncronas.

## Como funciona?

O fluxo básico é o seguinte:

1. O código é executado na **Call Stack**.
2. Operações assíncronas são delegadas para as APIs do ambiente (Browser APIs ou Node.js APIs).
3. Quando a operação termina, seu callback é colocado em uma fila:
   - **Microtask Queue**: `Promise.then`, `catch`, `finally`, `queueMicrotask`, `MutationObserver`.
   - **Task Queue (Macrotask Queue)**: `setTimeout`, `setInterval`, eventos de usuário, I/O.
4. O Event Loop verifica se a **Call Stack** está vazia.
5. Se estiver vazia:
   - Executa todas as **Microtasks** pendentes.
   - Em seguida, executa uma tarefa da **Task Queue**.
6. O processo se repete continuamente.

## Ordem de prioridade

```
Call Stack
    ↓
Microtask Queue
    ↓
Task Queue (Macrotasks)
```

## Exemplo

```javascript
console.log("Início");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise");
});

console.log("Fim");
```

### Saída

```
Início
Fim
Promise
setTimeout
```

### Explicação

- `console.log("Início")` é executado imediatamente.
- O `setTimeout` é enviado para as APIs do ambiente.
- A `Promise` é resolvida e seu callback entra na **Microtask Queue**.
- `console.log("Fim")` é executado.
- A Call Stack fica vazia.
- O Event Loop executa primeiro as **Microtasks** (`Promise`).
- Depois executa a **Task Queue** (`setTimeout`).

## Componentes envolvidos

- **Call Stack**: executa as funções.
- **Web APIs / Node.js APIs**: executam operações assíncronas.
- **Microtask Queue**: possui prioridade sobre a Task Queue.
- **Task Queue (Macrotask Queue)**: armazena callbacks de timers, eventos e I/O.
- **Event Loop**: coordena quando cada fila deve ser processada.

## Resumo

O Event Loop é o mecanismo que torna possível a programação assíncrona em JavaScript. Ele monitora a **Call Stack** e, sempre que ela fica vazia, processa primeiro as **Microtasks** e depois as **Tasks**, garantindo que o código seja executado de forma eficiente e sem bloquear a aplicação.

## Referências

- https://www.youtube.com/watch?v=ndZNQSQpSys


---

# Execution Context JS

# JavaScript Contexto de Execução

### Call Stack (Pilha de Chamados)

É uma pilha que controla a ordem de execução das funções. Quando uma função é chamada, ela entra na pilha. Quando termina, ela sai da pilha. A última função que entra é a primeira que sai.

### Contexto de Execução (Execution Context)

É o ambiente criado pelo JavaScript para executar um código (global ou uma função). Cada função chamada cria seu próprio contexto de execução, onde ficam suas variáveis, parâmetros e outras informações necessárias para funcionar.

### `this` no Contexto de Execução

Todo contexto de execução possui um valor para `this`. O valor de `this` depende de como a função foi chamada. No contexto global do navegador, `this` normalmente aponta para o objeto `window`.

### Ambiente Léxico (Lexical Environment)

É o lugar onde o JavaScript guarda as variáveis e funções de um contexto. Também mantém uma referência ao ambiente externo, permitindo que uma função acesse variáveis declaradas fora dela, seguindo a cadeia de escopos.


### Referência
https://www.youtube.com/watch?v=k8SAA979zAk

https://www.youtube.com/watch?v=MwHAeAzqVR0

---

# Hoisting

# JavaScript - Hoisting

## O que é Hoisting?

Hoisting é o comportamento do JavaScript de mover **declarações** de variáveis e funções para o topo do seu escopo durante a fase de compilação.

> Importante: apenas as **declarações** são elevadas, não as inicializações.

## Funciona com:

- ✅ `var`
- ✅ **Function Declaration**

## Não funciona com:

- ❌ `let`
- ❌ `const`
- ❌ Function Expression
- ❌ Arrow Function

### Referência
https://www.youtube.com/watch?v=i1msQOvoz1A

https://www.youtube.com/watch?v=MPdw7GwHc7A

---

# Micro-Macro task Js

Macro-Task Queue (Task Queue)

A Macro Task Queue armazena tarefas assíncronas maiores que aguardam para serem executadas pelo JavaScript.

Exemplos de Macro Tasks:

setTimeout;
setInterval;
Eventos do navegador;
Algumas operações de rede.

Essas tarefas são executadas uma por vez, seguindo a ordem em que foram adicionadas à fila.

Micro-Task Queue

A Micro Task Queue possui prioridade maior que a Macro Task Queue.

Ela armazena tarefas pequenas que precisam ser executadas assim que o código síncrono termina.

Exemplos de Micro Tasks:

Promise.then();
Promise.catch();
async/await;
queueMicrotask().

Antes de executar uma nova Macro Task, o JavaScript sempre verifica se existem Micro Tasks pendentes.

---

# Módules ES6

# JavaScript - Módulos ES6

## O que são Módulos ES6?

Os **Módulos ES6 (ECMAScript Modules - ESM)** são um recurso do JavaScript que permite dividir o código em arquivos menores e reutilizáveis. Cada módulo pode exportar funcionalidades (como funções, classes, objetos e constantes) para serem utilizadas em outros arquivos.

Essa abordagem torna o código mais organizado, facilita a manutenção e promove a reutilização de componentes.

## Vantagens

- Organização do código em arquivos independentes.
- Reutilização de funções, classes e objetos.
- Melhor manutenção e escalabilidade da aplicação.
- Evita a poluição do escopo global.
- Possibilita o carregamento de apenas aquilo que é necessário.

## Exportando módulos

É possível exportar elementos de duas formas:

### Named Export

```javascript
// math.js
export function sum(a, b) {
  return a + b;
}

export const PI = 3.14159;
```

### Default Export

```javascript
// logger.js
export default function log(message) {
  console.log(message);
}
```

## Importando módulos

### Importando Named Exports

```javascript
import { sum, PI } from "./math.js";

console.log(sum(2, 3));
console.log(PI);
```

### Importando Default Export

```javascript
import log from "./logger.js";

log("Olá, mundo!");
```

### Importando tudo

```javascript
import * as MathUtils from "./math.js";

console.log(MathUtils.sum(5, 10));
```

## Renomeando importações

```javascript
import { sum as add } from "./math.js";

console.log(add(2, 5));
```

## Exportando diretamente

```javascript
export const version = "1.0.0";

export function hello() {
  console.log("Olá!");
}
```

## Boas práticas

- Utilize um módulo para cada responsabilidade.
- Prefira **Named Exports** quando houver múltiplas exportações.
- Utilize **Default Export** quando o módulo possuir apenas uma funcionalidade principal.
- Sempre utilize caminhos relativos (`./` ou `../`) ao importar arquivos locais.
- Mantenha nomes claros e consistentes para arquivos e funções.

## Quando utilizar?

Os módulos ES6 são recomendados para praticamente todos os projetos JavaScript modernos, incluindo aplicações com:

- JavaScript puro
- Node.js (com suporte a ES Modules)
- React
- Vue
- Angular
- Vite
- Next.js

## Referências

- Vídeo: JavaScript ES6 Modules  
  https://www.youtube.com/watch?v=vylVbb2PY0M

---

# Promises

# JavaScript - Promises

## O que são Promises?

Uma **Promise** é um objeto que representa o resultado futuro de uma operação assíncrona. Ela permite escrever código mais organizado e previsível ao lidar com tarefas que podem demorar para serem concluídas, como:

- Requisições HTTP (APIs)
- Leitura e escrita de arquivos
- Consultas a bancos de dados
- Operações com temporizadores (`setTimeout`)

Uma Promise pode estar em um dos seguintes estados:

- **Pending (Pendente):** a operação ainda está em execução.
- **Fulfilled (Cumprida):** a operação foi concluída com sucesso.
- **Rejected (Rejeitada):** a operação falhou e retornou um erro.

---

## Estados da Promise

| Estado | Descrição |
|--------|-----------|
| **Pending** | A operação ainda não foi concluída. |
| **Fulfilled** | A Promise foi resolvida com sucesso. |
| **Rejected** | A Promise foi rejeitada devido a um erro. |

---

## Métodos da classe `Promise`

### `Promise.all()`

Executa várias Promises em paralelo e retorna uma única Promise.

- ✅ Resolve quando **todas** as Promises forem resolvidas.
- ❌ Rejeita imediatamente caso **uma** Promise seja rejeitada.

**Quando usar:**

- Buscar dados de várias APIs.
- Executar tarefas independentes em paralelo.

---

### `Promise.allSettled()`

Executa todas as Promises e aguarda que todas terminem, independentemente do resultado.

Retorna um array contendo o status de cada Promise:

- `fulfilled`
- `rejected`

**Quando usar:**

- Quando é necessário conhecer o resultado de todas as operações, mesmo que algumas falhem.

---

### `Promise.race()`

Retorna o resultado da **primeira Promise que terminar**, seja ela resolvida ou rejeitada.

**Quando usar:**

- Implementar timeout.
- Utilizar o primeiro servidor que responder.

---

### `Promise.any()`

Retorna a **primeira Promise resolvida com sucesso**.

Ignora as Promises rejeitadas e somente gera erro quando **todas** forem rejeitadas.

**Quando usar:**

- Buscar o primeiro resultado válido.
- Trabalhar com múltiplos servidores (fallback).

---

### `Promise.resolve()`

Cria uma Promise já resolvida.

É útil para transformar um valor comum em uma Promise.

---

### `Promise.reject()`

Cria uma Promise já rejeitada.

É utilizada para retornar um erro imediatamente.

---

## Resumo

| Método | Descrição |
|---------|-----------|
| `Promise.all()` | Aguarda todas as Promises serem resolvidas. |
| `Promise.allSettled()` | Aguarda todas terminarem, com sucesso ou erro. |
| `Promise.race()` | Retorna a primeira Promise que terminar. |
| `Promise.any()` | Retorna a primeira Promise resolvida com sucesso. |
| `Promise.resolve()` | Cria uma Promise resolvida imediatamente. |
| `Promise.reject()` | Cria uma Promise rejeitada imediatamente. |

---

### Referência

- https://www.youtube.com/watch?v=WUmAAxH9n-A

---

# Prototype

# JavaScript - Prototype

## O que é Prototype?

Em JavaScript, **Prototype** é o mecanismo que permite que um objeto herde propriedades e métodos de outro objeto. Essa herança acontece por meio da **Prototype Chain** (cadeia de protótipos).

Quando tentamos acessar uma propriedade ou método em um objeto, o JavaScript segue a seguinte ordem:

1. Verifica se a propriedade existe no próprio objeto.
2. Se não existir, procura no seu **prototype**.
3. Se ainda não encontrar, continua procurando nos prototypes superiores da cadeia até chegar em `Object.prototype`.
4. Se a propriedade não existir em nenhum nível da cadeia, o resultado será `undefined`.

## Exemplo

Considere um array:

```javascript
const numeros = [1, 2, 3];

numeros.push(4);
```

O objeto `numeros` não possui o método `push` diretamente.

Quando executamos:

```javascript
numeros.push(4);
```

O JavaScript faz a seguinte busca:

```
numeros
   ↓
Array.prototype
   ↓
Object.prototype
   ↓
null
```

* Primeiro, verifica se `push` existe em `numeros`.
* Como não existe, procura em `Array.prototype`.
* Encontra o método `push` e o executa.
* Se não encontrasse em `Array.prototype`, continuaria procurando em `Object.prototype`.

Essa busca por propriedades e métodos é chamada de **Prototype Chain** (cadeia de protótipos).


### Referência:
https://www.youtube.com/watch?v=waOO3KxLohk

---

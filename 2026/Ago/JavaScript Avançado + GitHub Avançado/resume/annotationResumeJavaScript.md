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

# Closures

### Closures

- Definição: Uma closure é uma função que mantém acesso/referência  às variáveis do escopo em que foi criada, mesmo após esse escopo já ter sido finalizado.


### Referência

https://www.youtube.com/watch?v=Tr_fjFTK7wI

https://www.youtube.com/watch?v=l32Q7FRvwAQ

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


---

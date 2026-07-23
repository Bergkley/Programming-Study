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
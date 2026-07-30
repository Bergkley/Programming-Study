# Node.js Avançado

# O que são Child Process, Worker Threads e Cluster?

> **Observação:** Este é um guia resumido contendo os principais conceitos.

## Como o Node.js funciona?

O JavaScript do Node.js executa em uma única thread (Event Loop). Operações de I/O são tratadas pela libuv, mas tarefas pesadas de CPU podem bloquear a aplicação.

Quando isso acontece, existem três abordagens principais:

- **Child Process** → cria novos processos do sistema operacional.
- **Worker Threads** → cria novas threads para executar JavaScript em paralelo.
- **Cluster** → cria vários processos Node.js para aproveitar todos os núcleos da CPU em servidores.

---

## Child Process

Permite executar outro processo.

Principais funções:

- `spawn()` → ideal para grandes volumes de saída (Streams).
- `exec()` → executa um comando no shell e retorna toda a saída.
- `execFile()` → executa um binário diretamente, sem shell.
- `fork()` → inicia outro processo Node.js com comunicação IPC.

### Exemplo

```ts
import { spawn } from "node:child_process";

const proc = spawn("node", ["worker.js"]);

proc.stdout.on("data", (data) => {
  console.log(data.toString());
});
```

### Comunicação (IPC)

```ts
// principal
worker.send({ numero: 10 });

// filho
process.on("message", (msg) => {
  console.log(msg);
});

process.send?.({ resultado: 20 });
```

---

## Worker Threads

Executam código JavaScript em paralelo sem criar um novo processo.

### Exemplo

```ts
import { Worker } from "node:worker_threads";

const worker = new Worker("./worker.js");

worker.postMessage(100);

worker.on("message", (msg) => {
  console.log(msg);
});
```

### worker.js

```ts
import { parentPort } from "node:worker_threads";

parentPort?.on("message", (n) => {
  let soma = 0;

  for (let i = 0; i < n; i++) {
    soma += i;
  }

  parentPort?.postMessage(soma);
});
```

### workerData

Também é possível enviar dados na criação:

```ts
new Worker("./worker.js", {
  workerData: { nome: "João" },
});
```

### SharedArrayBuffer

Permite compartilhar memória entre threads.

```ts
const buffer = new SharedArrayBuffer(4);
```

### Atomics

Usado para sincronizar acesso ao SharedArrayBuffer.

---

## Cluster

Cria vários processos do mesmo servidor.

```ts
import cluster from "node:cluster";
import os from "node:os";

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  console.log(process.pid);
}
```

Ideal para servidores HTTP.

---

## Comparação

| Recurso | Melhor uso |
|----------|------------|
| Child Process | Executar programas externos |
| Worker Threads | Processamento pesado em JavaScript |
| Cluster | Escalar servidores HTTP |

---

## Fluxograma

```text
Preciso paralelizar?

        │
   ┌────┴────┐
   │         │
Servidor?   CPU pesada?
   │         │
 Sim        Sim
   │         │
Cluster  Worker Threads

Executar outro programa?

        │
       Sim
        │
 Child Process
```

---

## Boas práticas

- Use Worker Threads para cálculos pesados.
- Use Child Process para executar programas externos (FFmpeg, Git, Docker).
- Use Cluster para aumentar a capacidade de servidores HTTP.
- Evite criar processos/threads sem necessidade.

---

## Referências

- https://nodejs.org/docs/latest/api/child_process.html
- https://nodejs.org/docs/latest/api/worker_threads.html
- https://nodejs.org/docs/latest/api/cluster.html

- Vídeo: https://www.youtube.com/watch?v=9ThVMous-io
- Vídeo: https://www.youtube.com/watch?v=qwbkBBeh5rM
- Vídeo: https://www.youtube.com/watch?v=3bKF8TirsYg

# Node.js Internals - ChildProcess + Cluster

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
## Diferença entre Worker Threads X Child Process
Worker Threads compartilham o mesmo ambiente de execução e a memória do processo pai. (usar para CPU e Memoria Ram)

Child Processes são instâncias separadas, com ambientes de execução e memórias isolados. (assíncronas em segundo plano)
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


---

# Node.js Internals - Streams

# Node.js Avançado

# O que são Streams?

As **Streams** são uma das funcionalidades mais importantes do Node.js para manipulação de dados.

Elas permitem **processar dados aos poucos (em partes ou chunks)**, em vez de carregar todo o conteúdo na memória antes de utilizá-lo.

Isso torna aplicações mais eficientes, principalmente ao trabalhar com:

- Arquivos grandes
- Uploads e downloads
- Vídeos e áudios
- APIs
- Comunicação entre serviços
- Compressão de arquivos

Em outras palavras:

> **Uma Stream representa um fluxo contínuo de dados que pode ser lido ou escrito conforme os dados ficam disponíveis.**

---

# Por que usar Streams?

Imagine um arquivo de **5 GB**.

Sem Streams:

```
Arquivo (5 GB)

↓

Carrega tudo na memória

↓

Processa os dados
```

Problemas:

- Alto consumo de memória.
- Processamento mais lento.
- Risco de travar a aplicação.

---

Com Streams:

```
Arquivo (5 GB)

↓

Chunk 1 (64 KB)

↓

Processa

↓

Chunk 2 (64 KB)

↓

Processa

↓

Chunk 3 (64 KB)

↓

...
```

A aplicação nunca precisa carregar o arquivo inteiro na memória.

---

# O que é um Chunk?

Um **chunk** é um pequeno bloco de dados transmitido por uma Stream.

Por exemplo, um arquivo de 1 GB pode ser dividido em milhares de chunks menores.

```
Arquivo

┌──────────────────────────┐
│                          │
└──────────────────────────┘

↓

┌────┐ ┌────┐ ┌────┐ ┌────┐
│ C1 │ │ C2 │ │ C3 │ │ C4 │ ...
└────┘ └────┘ └────┘ └────┘
```

Cada chunk é processado individualmente.

---

# O que é um Buffer?

Antes de entender completamente as Streams, é importante conhecer o conceito de **Buffer**.

Um **Buffer** é uma região temporária da memória utilizada para armazenar dados binários enquanto eles estão sendo lidos ou escritos.

Em outras palavras:

> **O Buffer funciona como uma área de espera para os dados antes que eles sejam processados.**

Imagine uma torneira enchendo um balde.

```
Dados

↓

┌────────────┐
│   Buffer   │
└────────────┘

↓

Aplicação
```

Nas Streams, os dados normalmente chegam em pequenos pedaços (**chunks**) e cada chunk geralmente é representado por um `Buffer`.

---

## Exemplo

```typescript
import fs from "node:fs";

const stream = fs.createReadStream("arquivo.txt");

stream.on("data", (chunk) => {
  console.log(chunk);
});
```

Saída:

```text
<Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>
```

Observe que o conteúdo recebido não é uma `string`, mas sim um objeto `Buffer`.

---

## Convertendo Buffer para String

```typescript
stream.on("data", (chunk) => {
  console.log(chunk.toString());
});
```

Saída:

```text
Hello World
```

---

## Criando um Buffer manualmente

```typescript
const buffer = Buffer.from("Node.js");

console.log(buffer);
```

Resultado:

```text
<Buffer 4e 6f 64 65 2e 6a 73>
```

Convertendo novamente:

```typescript
console.log(buffer.toString());
```

Saída:

```text
Node.js
```

---

## Buffer x Stream

É comum confundir esses conceitos.

| Buffer | Stream |
|----------|---------|
| Armazena dados temporariamente | Transporta dados |
| Fica na memória | Representa um fluxo contínuo |
| Contém um único bloco de dados | Trabalha com vários chunks |
| É utilizado pelas Streams | Utiliza Buffers para transportar dados |

---

## Relação entre Buffer e Stream

```
Arquivo

↓

Chunk 1 (Buffer)

↓

Chunk 2 (Buffer)

↓

Chunk 3 (Buffer)

↓

Aplicação
```

Cada evento `data` normalmente entrega um novo objeto `Buffer`.

---

# Tipos de Streams

O Node.js possui quatro tipos principais de Streams.

| Tipo | Função |
|-------|---------|
| Readable | Ler dados |
| Writable | Escrever dados |
| Duplex | Ler e escrever |
| Transform | Ler, transformar e escrever |

---

# Readable Stream

Uma **Readable Stream** fornece dados para serem consumidos.

Exemplos:

- Ler arquivos.
- Receber uma requisição HTTP.
- Ler dados de um banco de dados.
- Consumir dados de uma API.

---

## Exemplo

```typescript
import fs from "node:fs";

const stream = fs.createReadStream("arquivo.txt");

stream.on("data", (chunk) => {
  console.log(chunk.toString());
});
```

Sempre que um novo chunk for lido, o evento `data` será executado.

---

# Writable Stream

Uma **Writable Stream** recebe dados.

Exemplos:

- Escrever arquivos.
- Enviar uma resposta HTTP.
- Salvar dados em disco.

---

## Exemplo

```typescript
import fs from "node:fs";

const stream = fs.createWriteStream("saida.txt");

stream.write("Olá\n");

stream.write("Mundo\n");

stream.end();
```

Cada chamada ao método `write()` envia um novo chunk para o arquivo.

---

# Duplex Stream

Uma **Duplex Stream** pode ler e escrever dados.

Ela combina os comportamentos de uma Readable e de uma Writable Stream.

Exemplos:

- WebSockets.
- Conexões TCP.
- Comunicação entre processos.

```
Leitura

◄──────────►

Escrita
```

---

# Transform Stream

Uma **Transform Stream** é um tipo especial de Duplex Stream.

Ela recebe dados, transforma esses dados e envia o resultado.

```
Entrada

"node"

↓

Transformação

↓

"NODE"
```

Exemplos:

- Compressão (`gzip`)
- Criptografia
- Conversão de texto
- Conversão de imagens
- Parser de arquivos

---

## Exemplo

```typescript
import { Transform } from "node:stream";

const upperCase = new Transform({
  transform(chunk, _, callback) {
    callback(
      null,
      chunk.toString().toUpperCase()
    );
  },
});

upperCase.on("data", console.log);

upperCase.write("node");
upperCase.write("streams");

upperCase.end();
```

Saída:

```text
NODE

STREAMS
```

---

# Pipe

O método `pipe()` conecta uma Stream à outra.

```
Arquivo

↓

Readable Stream

↓

Transform Stream

↓

Writable Stream

↓

Novo Arquivo
```

Esse é um dos conceitos mais importantes do Node.js.

---

## Exemplo

```typescript
import fs from "node:fs";

const leitura = fs.createReadStream("entrada.txt");

const escrita = fs.createWriteStream("copia.txt");

leitura.pipe(escrita);
```

Nesse exemplo, o Node copia o arquivo utilizando Streams, sem carregar todo o conteúdo na memória.

---

# Pipeline

Embora o método `pipe()` seja bastante utilizado, o Node.js oferece uma alternativa mais robusta chamada **`pipeline()`**.

A função `pipeline()` conecta várias Streams e faz o gerenciamento automático de:

- Erros.
- Fechamento das Streams.
- Limpeza de recursos.
- Backpressure.

Na maioria das aplicações modernas, ela é a forma recomendada para conectar Streams.

---

## Sintaxe

```typescript
pipeline(
  origem,
  transformacao,
  destino,
  callback
);
```

---

## Exemplo

```typescript
import fs from "node:fs";
import { pipeline } from "node:stream";
import zlib from "node:zlib";

pipeline(
  fs.createReadStream("entrada.txt"),
  zlib.createGzip(),
  fs.createWriteStream("entrada.txt.gz"),
  (erro) => {
    if (erro) {
      console.error(erro);
      return;
    }

    console.log("Arquivo compactado!");
  }
);
```

Fluxo:

```
entrada.txt

↓

Readable

↓

Gzip

↓

Writable

↓

entrada.txt.gz
```

---

## `pipe()` x `pipeline()`

### Utilizando `pipe()`

```typescript
readable
  .pipe(transform)
  .pipe(writable);
```

Caso alguma Stream gere erro, será necessário tratá-lo manualmente.

---

### Utilizando `pipeline()`

```typescript
pipeline(
  readable,
  transform,
  writable,
  (erro) => {
    if (erro) {
      console.error(erro);
    }
  }
);
```

O `pipeline()` fecha todas as Streams corretamente e propaga os erros automaticamente.

---

## Pipeline com Promises

Também existe uma versão baseada em Promises.

```typescript
import { pipeline } from "node:stream/promises";

await pipeline(
  fs.createReadStream("video.mp4"),
  zlib.createGzip(),
  fs.createWriteStream("video.mp4.gz")
);
```

Essa versão funciona muito bem com `async/await`.

---

# Encadeando Streams

É possível conectar várias Streams.

```text
Arquivo

↓

Leitura

↓

Compressão

↓

Criptografia

↓

Escrita
```

Exemplo:

```typescript
readable
  .pipe(gzip)
  .pipe(writeStream);
```

Cada Stream executa uma responsabilidade específica.

---

# Exemplo com Gzip

```typescript
import fs from "node:fs";
import zlib from "node:zlib";

fs.createReadStream("video.mp4")
  .pipe(zlib.createGzip())
  .pipe(
    fs.createWriteStream("video.mp4.gz")
  );
```

---

# Streams em HTTP

As requisições e respostas HTTP do Node.js já são Streams.

```typescript
import http from "node:http";
import fs from "node:fs";

http.createServer((req, res) => {
  fs.createReadStream("video.mp4")
    .pipe(res);
}).listen(3000);
```

Quando um cliente acessa a rota, o vídeo é enviado aos poucos.

---

# Streams e Backpressure

Imagine que uma Stream lê dados muito mais rápido do que outra consegue escrever.

```
Leitura

██████████████████

↓

Escrita

██
```

Esse problema é chamado de **Backpressure**.

O Node.js controla automaticamente esse fluxo quando utilizamos `pipe()` ou `pipeline()`, evitando consumo excessivo de memória.

---

# Eventos mais comuns

## `data`

Executado sempre que um novo chunk é recebido.

```typescript
stream.on("data", (chunk) => {
  console.log(chunk);
});
```

---

## `end`

Executado quando toda a leitura termina.

```typescript
stream.on("end", () => {
  console.log("Fim");
});
```

---

## `error`

Executado quando ocorre algum erro.

```typescript
stream.on("error", (erro) => {
  console.error(erro);
});
```

---

## `finish`

Executado quando uma Writable Stream termina de escrever.

```typescript
writeStream.on("finish", () => {
  console.log("Arquivo salvo");
});
```

---

# Exemplo completo

```typescript
import fs from "node:fs";

const origem = fs.createReadStream("entrada.pdf");

const destino = fs.createWriteStream("saida.pdf");

origem.pipe(destino);
```

Fluxo:

```
entrada.pdf

↓

Readable Stream

↓

pipe()

↓

Writable Stream

↓

saida.pdf
```

---

# Streams x Leitura tradicional

Sem Stream:

```typescript
const conteudo = fs.readFileSync("video.mp4");
```

```
Arquivo inteiro

↓

Memória

↓

Processamento
```

---

Com Stream:

```typescript
fs.createReadStream("video.mp4");
```

```
Chunk

↓

Processa

↓

Próximo Chunk

↓

Processa
```

---

# Quando usar Streams?

Utilize Streams quando trabalhar com:

- Arquivos grandes.
- Uploads.
- Downloads.
- APIs.
- Vídeos.
- Áudios.
- Compressão.
- Criptografia.
- Processamento contínuo de dados.

---

# Quando NÃO usar?

Nem sempre Streams são necessárias.

Para arquivos pequenos:

```typescript
const conteudo = fs.readFileSync(
  "config.json",
  "utf8"
);
```

Essa abordagem é mais simples e perfeitamente aceitável.

---

# Boas práticas

- Prefira `pipeline()` em aplicações de produção.
- Utilize `pipe()` para exemplos simples e encadeamentos rápidos.
- Sempre trate erros utilizando o evento `error` ou o callback da `pipeline()`.
- Evite `readFile()` e `readFileSync()` para arquivos grandes.
- Mantenha cada Stream responsável por apenas uma tarefa.
- Lembre-se de que os dados trafegam em **Buffers**, normalmente representados pelos chunks recebidos nos eventos `data`.

---

# Resumo

| Conceito | Descrição |
|-----------|-----------|
| Buffer | Área temporária da memória que armazena dados binários |
| Chunk | Pequeno bloco de dados transportado por uma Stream |
| Readable | Lê dados |
| Writable | Escreve dados |
| Duplex | Lê e escreve |
| Transform | Lê, transforma e escreve |
| pipe() | Conecta Streams |
| pipeline() | Conecta Streams com tratamento automático de erros |
| Backpressure | Controle do fluxo entre leitura e escrita |

---

# Fluxo mental

```
Preciso processar muitos dados?

             │
        ┌────┴────┐
        │         │
       Não       Sim
        │         │
        ▼         ▼
 readFile()   Use Streams

                  │
                  ▼
        Readable Stream

                  │
                  ▼
         Transform Stream

                  │
                  ▼
        Writable Stream

                  │
                  ▼
            pipeline()
```

---

# Referências

- Documentação oficial do Node.js - Streams: https://nodejs.org/docs/latest/api/stream.html
- Documentação oficial do Node.js - Buffer: https://nodejs.org/docs/latest/api/buffer.html
- Documentação oficial do Node.js - File System (`fs`): https://nodejs.org/docs/latest/api/fs.html
- Vídeo: https://www.youtube.com/watch?v=6yvBVShDW0M
- Vídeo: https://www.youtube.com/watch?v=pB5-QzabL2I

---

# TypeScript Avançado + Node.js Internals - Garbage Collector

# TypeScript Avançado

# O que é o Garbage Collector?

O **Garbage Collector (GC)** é um mecanismo automático responsável por gerenciar a memória utilizada por aplicações JavaScript e TypeScript.

Sua principal função é:

> **Liberar automaticamente da memória os objetos que não são mais utilizados pela aplicação.**

Isso significa que, na maioria dos casos, o desenvolvedor **não precisa alocar ou liberar memória manualmente**, como acontece em linguagens como C e C++.

---

# Por que o Garbage Collector existe?

Imagine que toda vez que você criasse um objeto fosse necessário liberar sua memória manualmente.

Em C, por exemplo:

```c
int* numero = malloc(sizeof(int));

free(numero);
```

Caso o `free()` fosse esquecido, ocorreria um **Memory Leak**.

No JavaScript isso não acontece.

```typescript
const usuario = {
  nome: "João",
};
```

Quando esse objeto deixar de ser utilizado, o Garbage Collector poderá removê-lo automaticamente.

---

# Como funciona a memória no JavaScript?

A memória pode ser dividida em duas regiões principais.

```
┌────────────┐
│   Stack    │
└────────────┘
        │
        ▼
Guarda:

- Variáveis primitivas
- Referências para objetos
- Chamadas de função

───────────────

┌────────────┐
│    Heap    │
└────────────┘
        │
        ▼

Guarda:

- Objetos
- Arrays
- Funções
- Classes
- Maps
- Sets
```

---

# Exemplo

```typescript
const usuario = {
  nome: "Maria",
  idade: 25,
};
```

Na memória:

```
Stack

usuario
   │
   ▼

Heap

{
 nome: "Maria",
 idade: 25
}
```

A variável `usuario` guarda apenas uma referência.

O objeto fica armazenado na Heap.

---

# Quando um objeto pode ser removido?

Observe o código.

```typescript
let usuario = {
  nome: "João",
};

usuario = null;
```

Agora temos:

```
Heap

{
 nome: "João"
}

❌ Nenhuma referência
```

Como ninguém mais consegue acessar esse objeto, o Garbage Collector poderá removê-lo.

---

# O que significa "Objeto alcançável"?

Um objeto é considerado **alcançável (reachable)** quando ainda existe algum caminho que permita acessá-lo.

Exemplo:

```typescript
const usuario = {
  nome: "Pedro",
};
```

```
Stack

usuario
   │
   ▼

Heap

Objeto
```

Existe uma referência.

Logo, o objeto continua vivo.

---

Agora:

```typescript
usuario = null;
```

```
Objeto

↓

Sem referências

↓

Inalcançável
```

O Garbage Collector poderá removê-lo.

---

# O algoritmo Mark-and-Sweep

Os motores JavaScript modernos, como o **V8**, utilizam principalmente um algoritmo chamado **Mark-and-Sweep**.

Ele funciona em duas etapas.

---

## 1. Mark (Marcar)

O Garbage Collector começa procurando todas as referências existentes.

```
Variáveis

↓

Objetos

↓

Outros objetos

↓

Arrays

↓

Funções
```

Todos os objetos encontrados são marcados como:

```
✔ Alcançáveis
```

---

## 2. Sweep (Limpar)

Após marcar todos os objetos alcançáveis:

```
Heap

✔ Objeto A

✔ Objeto B

❌ Objeto C

✔ Objeto D

❌ Objeto E
```

Os objetos não marcados são removidos.

---

# Exemplo

```typescript
let pessoa = {
  nome: "Ana",
};

let outra = pessoa;

pessoa = null;
```

Na memória:

```
Stack

outra

 │

 ▼

Heap

Objeto
```

O objeto continua existindo porque ainda existe a variável `outra`.

Agora:

```typescript
outra = null;
```

Não existem mais referências.

O objeto poderá ser coletado.

---

# Objetos aninhados

```typescript
const usuario = {
  endereco: {
    cidade: "São Paulo",
  },
};
```

```
usuario

↓

Objeto

↓

endereco

↓

Outro objeto
```

Enquanto `usuario` existir, o objeto `endereco` também continuará vivo.

---

# Garbage Collection em ciclos

No passado, alguns Garbage Collectors tinham dificuldades com referências circulares.

Hoje, o algoritmo **Mark-and-Sweep** resolve esse problema.

```typescript
const a = {};
const b = {};

a.ref = b;
b.ref = a;
```

Mesmo havendo referência circular, se ninguém mais conseguir acessar `a` ou `b`, ambos poderão ser removidos.

---

# Quando o Garbage Collector é executado?

Não existe um momento fixo.

O motor JavaScript decide automaticamente quando executar a coleta.

Alguns fatores considerados:

- quantidade de memória utilizada;
- pressão de memória;
- quantidade de objetos criados;
- estratégia interna do motor JavaScript.

---

# O Garbage Collector pausa a aplicação?

Sim.

Durante a coleta, parte da execução da aplicação pode ser interrompida.

Motores modernos utilizam técnicas como:

- Incremental GC
- Concurrent GC
- Parallel GC

Essas técnicas reduzem bastante o tempo de pausa.

---

# O Garbage Collector remove tudo?

Não.

Ele remove apenas objetos que não podem mais ser alcançados.

Exemplo:

```typescript
const usuarios = [];

usuarios.push({
  nome: "João",
});
```

O objeto continuará existindo.

```
usuarios

↓

[]

↓

Objeto
```

Como ainda existe uma referência dentro do array, ele não poderá ser removido.

---

# Quando o Garbage Collector NÃO consegue liberar memória?

Exemplo:

```typescript
const cache = [];
```

```typescript
cache.push({
  nome: "João",
});
```

Mesmo que nunca utilizemos esse objeto novamente, ele continuará vivo.

```
cache

↓

Objeto
```

Isso pode gerar um **Memory Leak**.

---

# WeakMap

Um `WeakMap` permite que as chaves sejam removidas automaticamente.

```typescript
const cache = new WeakMap();

const usuario = {};

cache.set(usuario, "dados");
```

Quando `usuario` deixar de existir:

```typescript
usuario = null;
```

A entrada poderá ser removida pelo Garbage Collector.

---

# WeakSet

Da mesma forma:

```typescript
const objetos = new WeakSet();
```

Os objetos armazenados poderão ser coletados automaticamente quando não houver mais referências.

---

# Exemplo prático

```typescript
function criarUsuario() {
  return {
    nome: "Carlos",
  };
}

let usuario = criarUsuario();

usuario = null;
```

Depois que `usuario` recebe `null`, o objeto criado poderá ser removido.

---

# Heap x Stack

```
          Stack

usuario

 │

 ▼

──────────────

          Heap

{
 nome: "João"
}
```

A Stack guarda referências.

A Heap guarda os objetos.

---

# Exemplo visual

```
Objeto criado

        │

        ▼

Existe referência?

        │

   ┌────┴─────┐

   │          │

 Sim         Não

   │          │

   ▼          ▼

 Continua    Garbage
 na memória  Collector
             remove
```

---

# Garbage Collector x Memory Leak

É comum confundir esses conceitos.

| Garbage Collector | Memory Leak |
|-------------------|-------------|
| Libera memória automaticamente | Memória que nunca é liberada |
| Remove objetos inalcançáveis | Objetos continuam referenciados |
| Funciona automaticamente | Geralmente é causado pelo código da aplicação |

---

# Como evitar problemas?

Algumas boas práticas:

- Remova referências desnecessárias.
- Limpe arrays e caches.
- Utilize `clearInterval()` quando necessário.
- Remova Event Listeners.
- Utilize `WeakMap` e `WeakSet` quando apropriado.
- Evite armazenar objetos grandes sem necessidade.

---

# Curiosidade

O Garbage Collector do **V8** é bastante sofisticado.

Ele utiliza diferentes estratégias para diferentes tipos de objetos.

Algumas delas:

- Scavenger (objetos jovens)
- Mark-Compact
- Mark-Sweep
- Incremental Marking
- Concurrent Marking

Tudo isso acontece automaticamente, sem intervenção do desenvolvedor.

---

# Relação com TypeScript

Apesar deste conteúdo estar na trilha de **TypeScript**, o Garbage Collector **não faz parte do TypeScript**.

O TypeScript é convertido para JavaScript.

Quem realmente executa o código é o motor JavaScript (como o **V8**), que também é responsável pelo gerenciamento da memória.

---

# Boas práticas

- Não mantenha referências desnecessárias.
- Evite caches infinitos.
- Limpe timers e listeners.
- Utilize `WeakMap` e `WeakSet` quando fizer sentido.
- Monitore o consumo de memória em aplicações grandes.
- Utilize Heap Snapshots para investigar possíveis Memory Leaks.

---

# Resumo

| Conceito | Descrição |
|----------|-----------|
| Garbage Collector | Libera memória automaticamente |
| Heap | Onde os objetos são armazenados |
| Stack | Guarda referências e chamadas de função |
| Reachable | Objeto ainda acessível |
| Unreachable | Objeto sem referências |
| Mark-and-Sweep | Principal algoritmo utilizado pelo V8 |
| WeakMap | Permite coleta automática das chaves |
| WeakSet | Permite coleta automática dos objetos |

---

# Fluxo mental

```
Objeto criado

        │

        ▼

Existe alguma referência?

      ┌────┴────┐
      │         │
     Sim       Não
      │         │
      ▼         ▼

 Continua   Garbage Collector
 vivo        remove o objeto

```

---

# Referências

- Documentação oficial do V8: https://v8.dev/
- Documentação do Node.js (V8): https://nodejs.org/docs/latest/api/v8.html
- MDN - Memory Management: https://developer.mozilla.org/docs/Web/JavaScript/Memory_Management
- Vídeo: https://www.youtube.com/shorts/eC8Dwa-FHi0

---

# TypeScript Avançado + Node.js Internals - Memory Leak

# TypeScript Avançado

# O que são Memory Leaks?

Um **Memory Leak** (vazamento de memória) acontece quando uma aplicação continua ocupando memória que **não é mais necessária**, mas que também **não pode ser liberada pelo Garbage Collector (GC)**.

Em outras palavras:

> **Um Memory Leak ocorre quando objetos que já deveriam ter sido removidos da memória continuam sendo referenciados pela aplicação.**

Com o tempo, esses objetos se acumulam, aumentando o consumo de memória e podendo causar lentidão, travamentos ou até a finalização da aplicação por falta de memória.

---

# Como funciona a memória no JavaScript?

JavaScript possui gerenciamento automático de memória.

Quando criamos uma variável:

```typescript
const usuario = {
  nome: "João",
  idade: 30,
};
```

O objeto é armazenado na **Heap Memory**.

```
Stack

usuario
   │
   ▼

Heap

{
 nome: "João",
 idade: 30
}
```

A variável `usuario` mantém uma referência para o objeto na Heap.

---

# O que é o Garbage Collector?

O **Garbage Collector (GC)** é responsável por liberar automaticamente objetos que não possuem mais referências.

Exemplo:

```typescript
let usuario = {
  nome: "Maria",
};

usuario = null;
```

Agora:

```
Heap

{
 nome: "Maria"
}

❌ Nenhuma referência
```

Como não existe mais nenhuma referência apontando para o objeto, o Garbage Collector poderá removê-lo da memória.

---

# Quando acontece um Memory Leak?

Um Memory Leak acontece quando um objeto continua sendo referenciado mesmo não sendo mais utilizado.

Exemplo:

```typescript
const usuarios = [];

function adicionarUsuario() {
  usuarios.push({
    nome: "João",
  });
}
```

Se essa função for chamada milhares de vezes:

```typescript
setInterval(() => {
  adicionarUsuario();
}, 1000);
```

O array crescerá indefinidamente.

```
usuarios

↓

[{}, {}, {}, {}, {}, {}, ...]
```

Como o array ainda possui referência para todos os objetos, o Garbage Collector **não poderá removê-los**.

---

# Principais causas de Memory Leak

Os casos mais comuns são:

- Variáveis globais.
- Arrays ou objetos que nunca são limpos.
- Timers (`setInterval`).
- Event Listeners não removidos.
- Closures.
- Cache sem limite.
- Objetos grandes mantidos em memória.
- Referências circulares (em alguns cenários).

---

# Variáveis globais

Evite armazenar dados desnecessários em variáveis globais.

```typescript
const cache = [];
```

```typescript
function salvar() {
  cache.push({
    dados: "..."
  });
}
```

Como `cache` existe durante toda a execução da aplicação, seus dados também permanecerão na memória.

---

# Arrays que nunca são limpos

```typescript
const logs = [];

function registrar() {
  logs.push(new Date());
}
```

Após algumas horas:

```
logs

↓

[100000 itens]
```

Se esses dados nunca forem removidos, a memória continuará aumentando.

---

# Timers (`setInterval`)

Um erro bastante comum.

```typescript
setInterval(() => {
  console.log("Executando...");
}, 1000);
```

Se esse timer não for encerrado:

```typescript
clearInterval(intervalo);
```

Ele continuará executando indefinidamente.

Em aplicações maiores, isso pode manter objetos vivos na memória.

---

# Event Listeners

Outro problema muito comum.

```typescript
button.addEventListener(
  "click",
  clicar
);
```

Quando o componente deixa de existir:

```typescript
button.removeEventListener(
  "click",
  clicar
);
```

Caso contrário, o listener continuará mantendo referências ao componente.

---

# Closures

Closures podem manter objetos vivos sem necessidade.

```typescript
function criar() {

  const dados =
    new Array(1000000);

  return function () {
    console.log(dados.length);
  };

}
```

Enquanto a função retornada existir, `dados` continuará ocupando memória.

---

# Cache sem limite

Imagine um cache.

```typescript
const cache = new Map();
```

```typescript
cache.set(
  id,
  respostaAPI
);
```

Se nunca removermos itens:

```
Map

↓

100

↓

1000

↓

10000

↓

100000
```

A memória crescerá continuamente.

---

# Objetos grandes

```typescript
const imagens = [];
```

```typescript
imagens.push(
  arquivoGrande
);
```

Mesmo que a imagem nunca mais seja utilizada, ela continuará ocupando memória enquanto existir uma referência.

---

# Exemplo do mundo real

Imagine uma API.

```typescript
const requisicoes = [];
```

```typescript
app.use((req, res, next) => {

  requisicoes.push(req);

  next();

});
```

Cada requisição ficará armazenada para sempre.

Após milhares de acessos:

```
Heap

██████████████████
```

A aplicação começará a consumir muita memória.

---

# Como evitar Memory Leaks?

## Remova referências desnecessárias

```typescript
objeto = null;
```

ou

```typescript
array.length = 0;
```

---

## Limpe Arrays

```typescript
usuarios.length = 0;
```

ou

```typescript
usuarios = [];
```

---

## Utilize `clearInterval`

```typescript
const intervalo =
  setInterval(...);

clearInterval(intervalo);
```

---

## Remova Event Listeners

```typescript
element.removeEventListener(
  "click",
  handler
);
```

---

## Limite o Cache

```typescript
if (cache.size > 100) {
  cache.clear();
}
```

Ou utilize bibliotecas de cache com TTL (Time To Live), como LRU Cache.

---

## Utilize WeakMap

Um `WeakMap` permite que suas chaves sejam coletadas pelo Garbage Collector quando não houver mais referências para elas.

```typescript
const cache =
  new WeakMap();
```

Quando o objeto utilizado como chave deixar de existir, sua entrada poderá ser removida automaticamente.

---

## Utilize WeakSet

Da mesma forma:

```typescript
const objetos =
  new WeakSet();
```

Os objetos poderão ser coletados automaticamente.

---

# Heap x Stack

```
Stack

↓

Referências

↓

Heap

↓

Objetos
```

O Garbage Collector observa as referências existentes na Stack.

Se um objeto não puder mais ser alcançado, ele poderá ser removido da Heap.

---

# Como identificar Memory Leaks?

Alguns sinais comuns:

- Consumo de memória aumenta continuamente.
- Aplicação fica lenta após horas de uso.
- Alto uso de CPU pelo Garbage Collector.
- Erros de **Out of Memory**.
- Travamentos inesperados.

---

# Ferramentas

No ecossistema Node.js e JavaScript, algumas ferramentas ajudam a identificar Memory Leaks:

- Chrome DevTools (Memory Profiler).
- Node.js Inspector.
- Heap Snapshots.
- Allocation Timeline.
- Clinic.js.
- heapdump.

---

# Exemplo com Heap Snapshot

1. Execute a aplicação.
2. Abra o DevTools.
3. Vá até **Memory**.
4. Tire um **Heap Snapshot**.
5. Execute algumas ações.
6. Tire outro Snapshot.
7. Compare os objetos.

Se objetos antigos continuam existindo sem necessidade, provavelmente existe um Memory Leak.

---

# Memory Leak x Alto consumo de memória

Nem todo consumo elevado de memória é um Memory Leak.

Por exemplo:

```typescript
const dados =
  await buscar100MilRegistros();
```

Consumir muita memória temporariamente é esperado.

Um Memory Leak ocorre quando essa memória **nunca é liberada**, mesmo após os dados deixarem de ser utilizados.

---

# Exemplo prático

Errado:

```typescript
const cache = [];

function salvar(obj) {
  cache.push(obj);
}
```

Melhor:

```typescript
const cache = new Map();

function salvar(id, obj) {

  if (cache.size > 1000) {
    cache.clear();
  }

  cache.set(id, obj);
}
```

Ou utilize uma política de expiração (TTL).

---

# Fluxo de um Memory Leak

```
Objeto criado

        │

        ▼

Objeto armazenado

        │

        ▼

Nunca removido

        │

        ▼

Garbage Collector

não consegue liberar

        │

        ▼

Consumo de memória cresce
```

---

# Relação entre Garbage Collector e Memory Leak

```
Objeto

↓

Existe referência?

      │

 ┌────┴─────┐

 │          │

Sim        Não

 │          │

 ▼          ▼

Permanece  Garbage
na memória Collector
            remove
```

---

# Boas práticas

- Evite variáveis globais desnecessárias.
- Limpe arrays, listas e caches quando não forem mais utilizados.
- Utilize `clearInterval()` e `clearTimeout()`.
- Remova Event Listeners.
- Limite o tamanho de caches.
- Prefira `WeakMap` e `WeakSet` quando apropriado.
- Monitore o consumo de memória em produção.
- Utilize Heap Snapshots para investigar problemas.

---

# Resumo

| Conceito | Descrição |
|----------|-----------|
| Memory Leak | Memória que não pode ser liberada pelo Garbage Collector |
| Garbage Collector | Remove objetos sem referências |
| Heap | Região onde os objetos são armazenados |
| Stack | Guarda referências e chamadas de função |
| WeakMap | Permite coleta automática das chaves |
| WeakSet | Permite coleta automática dos objetos |
| Heap Snapshot | Captura o estado da memória para análise |

---

# Fluxo mental

```
Consumo de memória aumenta?

            │
            ▼

Os objetos ainda possuem referência?

      ┌─────┴─────┐
      │           │
     Sim         Não
      │           │
      ▼           ▼

Memory Leak   Garbage Collector
                 remove

```

---

# Curiosidade

Apesar deste material estar na trilha de **TypeScript**, **Memory Leak não é um conceito específico do TypeScript**.

O TypeScript é compilado para JavaScript e, em tempo de execução, quem gerencia a memória é o motor JavaScript (como o **V8**, utilizado pelo Node.js e pelo Google Chrome).

Ou seja, os mesmos problemas de Memory Leak podem acontecer tanto em projetos JavaScript quanto TypeScript.

---

# Referências

- Documentação do V8 - Garbage Collection: https://v8.dev/
- Documentação do Node.js - Memory: https://nodejs.org/docs/latest/api/v8.html
- Chrome DevTools - Memory Profiling: https://developer.chrome.com/docs/devtools/memory/
- Vídeo: https://www.youtube.com/watch?v=4LQlf80bMac

---

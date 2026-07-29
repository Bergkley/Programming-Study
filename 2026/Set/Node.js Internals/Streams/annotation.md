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
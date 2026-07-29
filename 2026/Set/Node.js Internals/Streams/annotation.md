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
      │
      ▼
Carrega tudo na memória
      │
      ▼
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

      │
      ▼
Chunk 1 (64 KB)

      ▼
Processa

      ▼
Chunk 2 (64 KB)

      ▼
Processa

      ▼
Chunk 3 (64 KB)

      ▼
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

- Ler arquivos
- Receber uma requisição HTTP
- Ler dados de um banco de dados
- Consumir dados de uma API

---

## Exemplo

```typescript
import fs from "node:fs";

const stream = fs.createReadStream(
  "arquivo.txt"
);

stream.on("data", (chunk) => {
  console.log(chunk);
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

const stream =
  fs.createWriteStream(
    "saida.txt"
  );

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

- WebSockets
- Conexões TCP
- Comunicação entre processos

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

        │
        ▼

Transformação

        │
        ▼

"NODE"
```

Exemplos:

- Compressão (`gzip`)
- Criptografia
- Conversão de texto
- Conversão de imagens
- Parser de arquivos

---

# Exemplo de Transform

```typescript
import { Transform } from "node:stream";

const upperCase =
  new Transform({
    transform(chunk, _, callback) {
      callback(
        null,
        chunk
          .toString()
          .toUpperCase()
      );
    },
  });

upperCase.on(
  "data",
  console.log
);

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

const leitura =
  fs.createReadStream(
    "entrada.txt"
  );

const escrita =
  fs.createWriteStream(
    "copia.txt"
  );

leitura.pipe(escrita);
```

Nesse exemplo, o Node copia o arquivo utilizando Streams, sem carregar todo o conteúdo na memória.

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
    fs.createWriteStream(
      "video.mp4.gz"
    )
  );
```

Nesse fluxo:

1. O arquivo é lido.
2. Os dados são comprimidos.
3. O resultado é salvo em outro arquivo.

Tudo acontece em fluxo contínuo.

---

# Streams em HTTP

As requisições e respostas HTTP do Node.js já são Streams.

Servidor:

```typescript
import http from "node:http";
import fs from "node:fs";

http
  .createServer((req, res) => {
    fs.createReadStream("video.mp4")
      .pipe(res);
  })
  .listen(3000);
```

Quando um cliente acessa a rota, o vídeo é enviado aos poucos.

O servidor não precisa carregar o arquivo inteiro na memória.

---

# Streams e Backpressure

Imagine que uma Stream lê dados muito mais rápido do que outra consegue escrever.

```
Leitura

██████████████

↓

Escrita

██
```

Esse problema é chamado de **Backpressure**.

O Node.js controla automaticamente esse fluxo quando utilizamos `pipe()`.

Isso evita consumo excessivo de memória e torna o processamento mais eficiente.

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
writeStream.on(
  "finish",
  () => {
    console.log(
      "Arquivo salvo"
    );
  }
);
```

---

# Exemplo completo

Copiando um arquivo.

```typescript
import fs from "node:fs";

const origem =
  fs.createReadStream(
    "entrada.pdf"
  );

const destino =
  fs.createWriteStream(
    "saida.pdf"
  );

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
const conteudo =
  fs.readFileSync(
    "video.mp4"
  );
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
fs.createReadStream(
  "video.mp4"
);
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

Para arquivos pequenos, como um arquivo JSON de poucos kilobytes:

```typescript
const conteudo =
  fs.readFileSync(
    "config.json",
    "utf8"
  );
```

Essa abordagem é mais simples e perfeitamente aceitável.

Streams fazem mais sentido quando o volume de dados é grande ou contínuo.

---

# Boas práticas

- Prefira `pipe()` para conectar Streams, pois ele gerencia o fluxo e o **backpressure** automaticamente.
- Sempre trate erros utilizando o evento `error`.
- Utilize Streams para uploads, downloads e manipulação de arquivos grandes.
- Evite `readFile()` ou `readFileSync()` para arquivos muito grandes.
- Mantenha cada Stream com uma responsabilidade específica (ler, transformar ou escrever).

---

# Resumo

| Tipo | Descrição |
|-------|-----------|
| `Readable` | Lê dados |
| `Writable` | Escreve dados |
| `Duplex` | Lê e escreve |
| `Transform` | Lê, transforma e escreve |
| `pipe()` | Conecta Streams |
| `chunk` | Pequeno bloco de dados |
| `backpressure` | Controle do fluxo entre leitura e escrita |

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
      Ler → Transformar → Escrever

                  │
                  ▼
              pipe()
```

---

# Referências

- Documentação oficial do Node.js - Streams: https://nodejs.org/docs/latest/api/stream.html
- Documentação oficial do Node.js - File System (`fs`): https://nodejs.org/docs/latest/api/fs.html
- Vídeo: https://www.youtube.com/watch?v=6yvBVShDW0M
- Vídeo: https://www.youtube.com/watch?v=pB5-QzabL2I
````

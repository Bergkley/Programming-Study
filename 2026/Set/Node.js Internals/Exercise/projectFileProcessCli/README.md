# File Processor CLI

Ferramenta de linha de comando em Node.js que le, transforma e exporta arquivos grandes usando Streams, Buffers e Worker Threads.

## Objetivo

O projeto processa um arquivo CSV em fluxo, sem carregar todo o conteudo em memoria. Cada pedaco do arquivo passa por um `Transform Stream`, que envia o trabalho de transformacao para uma Worker Thread.

Atualmente, a transformacao aplicada e converter o conteudo para letras maiusculas.

## Estrutura

```text
projectFileProcessCli/
  cli.mjs
  index.mjs
  data/
  src/
    streams/
      reader.mjs
      transformer.mjs
      writer.mjs
    workers/
      worker.mjs
```

## Arquivos principais

- `cli.mjs`: ponto de entrada da CLI.
- `index.mjs`: coordena o pipeline de processamento.
- `src/streams/reader.mjs`: cria o stream de leitura do arquivo.
- `src/streams/transformer.mjs`: cria o transform stream que conversa com o worker.
- `src/streams/writer.mjs`: cria o stream de escrita.
- `src/workers/worker.mjs`: recebe chunks, usa `Buffer` e aplica a transformacao.

## Como rodar

Entre na pasta do projeto:

```powershell
cd "C:\Users\Pichau\Desktop\Project GitHub\Programming-Study\2026\Set\Node.js Internals\Exercise\projectFileProcessCli"
```

Rode com os caminhos padrao:

```powershell
node cli.mjs
```

Por padrao, o projeto tenta ler:

```text
data/customers-500000.csv
```

E gera:

```text
data/customers-500000-transformed.csv
```

Tambem e possivel informar os arquivos manualmente:

```powershell
node cli.mjs .\data\input.csv .\data\output.csv
```

## Teste rapido

Crie um arquivo pequeno:

```powershell
Set-Content -Path ".\data\teste.csv" -Value "nome,email`nana,ana@email.com"
```

Execute a CLI:

```powershell
node cli.mjs .\data\teste.csv .\data\teste-transformado.csv
```

Leia o resultado:

```powershell
Get-Content .\data\teste-transformado.csv
```

Saida esperada:

```text
NOME,EMAIL
ANA,ANA@EMAIL.COM
```

## Tratamento de erro

Se o arquivo de entrada nao existir, o projeto deve falhar sem criar o arquivo final de saida.

Exemplo:

```powershell
node cli.mjs .\data\arquivo-inexistente.csv .\data\saida.csv
```

Saida esperada:

```text
Erro ao processar arquivo: Input file not found: ...
```

Nesse caso, `saida.csv` nao deve ser criado.

## Fluxo interno

```text
createFileReader -> createUppercaseTransform -> createFileWriter
```

O `index.mjs` usa:

```js
const pipelineAsync = promisify(pipeline);
```

Assim, o pipeline pode ser executado com `await` e os erros podem ser tratados com `try/catch`.

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
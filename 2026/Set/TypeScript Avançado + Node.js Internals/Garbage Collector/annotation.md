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
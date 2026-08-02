# TypeScript Avançado

# O que são `new Set()` e `new Map()`?

No JavaScript e TypeScript, **`Set`** e **`Map`** são estruturas de dados que oferecem funcionalidades além dos objetos (`Object`) e arrays (`Array`).

Elas foram introduzidas no **ES6 (ECMAScript 2015)** para resolver problemas comuns de forma mais eficiente.

Em resumo:

- **`Set`** → Armazena **valores únicos**.
- **`Map`** → Armazena **pares de chave e valor**, permitindo que qualquer tipo seja utilizado como chave.

---

# Por que usar Set e Map?

Imagine que você possui uma lista de IDs.

```typescript
const ids = [1, 2, 3, 2, 1, 4];
```

Como remover os duplicados?

Uma forma simples é utilizar um **Set**.

```typescript
const unicos = new Set(ids);

console.log(unicos);
```

Resultado:

```text
Set(4) {1, 2, 3, 4}
```

---

Agora imagine um sistema onde o usuário é um objeto.

```typescript
const usuario = {
  id: 1,
};
```

Um objeto comum não permite utilizar outro objeto como chave.

Para isso existe o **Map**.

---

# O que é um Set?

Um **Set** é uma coleção de valores **únicos**.

Isso significa que um mesmo valor não pode existir duas vezes.

```
Set

↓

1

2

3

4
```

Se tentar adicionar novamente:

```
1

2

3

3

4
```

O resultado continuará sendo:

```
1

2

3

4
```

---

# Criando um Set

```typescript
const numeros = new Set();
```

Também é possível inicializá-lo com valores.

```typescript
const numeros = new Set([
  1,
  2,
  3,
]);
```

---

# Adicionando elementos

Utilize o método `add()`.

```typescript
const frutas = new Set();

frutas.add("Maçã");
frutas.add("Banana");
frutas.add("Laranja");
```

---

# Valores duplicados

```typescript
const numeros = new Set();

numeros.add(10);
numeros.add(10);
numeros.add(10);
```

Resultado:

```text
Set(1) {10}
```

O valor é armazenado apenas uma vez.

---

# Removendo duplicados de um Array

Esse é um dos usos mais comuns.

```typescript
const numeros = [
  1,
  2,
  2,
  3,
  3,
  4,
];

const unicos = [
  ...new Set(numeros),
];

console.log(unicos);
```

Resultado:

```typescript
[1, 2, 3, 4]
```

---

# Verificando se um valor existe

```typescript
const usuarios = new Set([
  "João",
  "Maria",
]);

console.log(
  usuarios.has("Maria")
);
```

Resultado:

```text
true
```

---

# Removendo um item

```typescript
usuarios.delete("Maria");
```

---

# Limpando o Set

```typescript
usuarios.clear();
```

---

# Obtendo o tamanho

```typescript
console.log(
  usuarios.size
);
```

---

# Percorrendo um Set

```typescript
for (const nome of usuarios) {
  console.log(nome);
}
```

Ou:

```typescript
usuarios.forEach((nome) => {
  console.log(nome);
});
```

---

# Set com Objetos

Um detalhe importante.

```typescript
const usuario1 = {
  id: 1,
};

const usuario2 = {
  id: 1,
};

const usuarios = new Set();

usuarios.add(usuario1);

usuarios.add(usuario2);
```

Resultado:

```text
Set(2)
```

Mesmo possuindo os mesmos dados, são objetos diferentes na memória.

---

# O que é um Map?

Um **Map** é uma coleção de pares:

```
Chave

↓

Valor
```

Semelhante a um objeto.

Porém, possui diversas vantagens.

---

# Criando um Map

```typescript
const usuarios = new Map();
```

---

# Adicionando valores

```typescript
usuarios.set(
  1,
  "João"
);

usuarios.set(
  2,
  "Maria"
);
```

---

# Obtendo um valor

```typescript
console.log(
  usuarios.get(1)
);
```

Resultado:

```text
João
```

---

# Verificando existência

```typescript
usuarios.has(2);
```

---

# Removendo

```typescript
usuarios.delete(2);
```

---

# Limpando

```typescript
usuarios.clear();
```

---

# Obtendo o tamanho

```typescript
usuarios.size;
```

---

# Percorrendo um Map

```typescript
for (const [id, nome] of usuarios) {
  console.log(id, nome);
}
```

Ou:

```typescript
usuarios.forEach(
  (nome, id) => {
    console.log(id, nome);
  }
);
```

---

# Map aceita qualquer chave

Essa é uma das maiores diferenças em relação ao objeto.

```typescript
const usuario = {
  id: 1,
};

const cache = new Map();

cache.set(
  usuario,
  "Administrador"
);
```

Recuperando:

```typescript
cache.get(usuario);
```

---

# Objeto como chave

Isso não funciona corretamente em um objeto comum.

```typescript
const objeto = {};

const usuario = {
  id: 1,
};

objeto[usuario] = "João";
```

Internamente:

```text
"[object Object]"
```

Todos os objetos acabam sendo convertidos para string.

Já o `Map` preserva a referência do objeto.

---

# Tipando um Set

No TypeScript:

```typescript
const numeros =
  new Set<number>();
```

Outro exemplo:

```typescript
const nomes =
  new Set<string>();
```

---

# Tipando um Map

```typescript
const usuarios =
  new Map<number, string>();
```

Primeiro tipo:

```
Chave
```

Segundo tipo:

```
Valor
```

Outro exemplo:

```typescript
interface Usuario {
  nome: string;
}

const mapa =
  new Map<number, Usuario>();
```

---

# Set x Array

| Set | Array |
|------|-------|
| Valores únicos | Permite duplicados |
| Busca mais eficiente (`has`) | Busca linear (`includes`) |
| Não possui índice | Possui índice |
| Ideal para eliminar duplicados | Ideal para listas ordenadas |

---

# Map x Object

| Map | Object |
|------|---------|
| Qualquer tipo pode ser chave | Apenas `string`, `symbol` ou `number` (convertidos) |
| Mantém a ordem de inserção | Ordem pode variar conforme o tipo das chaves |
| Possui `size` | É necessário usar `Object.keys()` |
| Melhor para coleções dinâmicas | Melhor para objetos de domínio |

---

# Complexidade (Big O)

| Operação | Set | Map |
|----------|-----|-----|
| Inserção | O(1) |
| Busca | O(1) |
| Remoção | O(1) |

Essas operações são, em média, de tempo constante.

---

# WeakMap

Existe também o **WeakMap**.

```typescript
const cache = new WeakMap();
```

Diferenças:

- Apenas objetos podem ser utilizados como chave.
- As chaves podem ser removidas automaticamente pelo Garbage Collector.
- Não é iterável.

Muito utilizado para:

- Cache.
- Dados privados.
- Metadados.

---

# WeakSet

Da mesma forma:

```typescript
const objetos = new WeakSet();
```

Características:

- Armazena apenas objetos.
- Não é iterável.
- Objetos podem ser coletados automaticamente.

---

# Quando usar Set?

Utilize quando precisar:

- Remover valores duplicados.
- Garantir unicidade.
- Verificar rapidamente se um valor existe.
- Trabalhar com listas onde repetição não faz sentido.

---

# Quando usar Map?

Utilize quando:

- Precisar associar chaves e valores.
- A chave não for uma string.
- Precisar manter a ordem de inserção.
- Trabalhar com caches.
- Associar informações a objetos.

---

# Quando NÃO usar?

Não utilize `Map` apenas para substituir objetos simples.

```typescript
const usuario = {
  nome: "João",
  idade: 30,
};
```

Nesse caso, um objeto é mais simples e legível.

Da mesma forma, não utilize `Set` quando a aplicação precisa manter valores duplicados.

---

# Exemplo prático

Removendo usuários repetidos.

```typescript
const usuarios = [
  "Ana",
  "João",
  "Ana",
  "Maria",
];

const unicos = [
  ...new Set(usuarios),
];

console.log(unicos);
```

Resultado:

```typescript
["Ana", "João", "Maria"]
```

---

# Exemplo com Cache

```typescript
interface Usuario {
  nome: string;
}

const cache =
  new Map<number, Usuario>();

cache.set(1, {
  nome: "João",
});

const usuario =
  cache.get(1);

console.log(usuario);
```

---

# Fluxo mental

```
Preciso armazenar...

            │
     ┌──────┴───────┐
     │              │
 Valores únicos?  Chave → Valor?
     │              │
    Sim            Sim
     │              │
     ▼              ▼

    Set            Map

```

---

# Boas práticas

- Utilize `Set` para eliminar duplicados.
- Utilize `Map` quando precisar de chaves que não sejam apenas strings.
- Prefira `WeakMap` para caches associados a objetos.
- Prefira `WeakSet` quando os objetos puderem ser liberados automaticamente.
- Tipar `Set` e `Map` no TypeScript aumenta a segurança e melhora o autocomplete.

---

# Resumo

| Estrutura | Utilização |
|-----------|------------|
| `Set` | Coleção de valores únicos |
| `Map` | Coleção de chave e valor |
| `WeakSet` | Conjunto de objetos com coleta automática |
| `WeakMap` | Mapa com chaves em objetos e coleta automática |

---

# Curiosidade

Apesar deste conteúdo estar na trilha de **TypeScript**, **`Set` e `Map` fazem parte do JavaScript (ES6)**.

O TypeScript apenas adiciona suporte à tipagem estática, permitindo especificar os tipos armazenados nessas estruturas, como `Set<string>` ou `Map<number, Usuario>`.

---

# Referências

- Documentação oficial - `Set`: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set
- Documentação oficial - `Map`: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map
- Documentação oficial - `WeakSet`: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
- Documentação oficial - `WeakMap`: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
- Vídeo: https://www.youtube.com/watch?v=DNmCS4PT9bc
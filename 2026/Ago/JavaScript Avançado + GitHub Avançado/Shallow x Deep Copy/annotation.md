# JavaScript Avançado

# Shallow Copy x Deep Copy

Ao trabalhar com objetos e arrays em JavaScript, é muito importante entender a diferença entre **Shallow Copy (cópia rasa)** e **Deep Copy (cópia profunda)**.

Essa diferença evita bugs relacionados ao compartilhamento de referências entre variáveis.

---

# Entendendo referências

Em JavaScript, os tipos podem ser divididos em duas categorias:

## Tipos primitivos

São copiados por **valor**.

Exemplos:

- String
- Number
- Boolean
- BigInt
- Symbol
- Undefined
- Null

```javascript
let a = 10;
let b = a;

b = 20;

console.log(a); // 10
console.log(b); // 20
```

Cada variável possui seu próprio valor.

---

## Objetos

Objetos, arrays e funções são armazenados por **referência**.

```javascript
const pessoa1 = {
  nome: "João",
};

const pessoa2 = pessoa1;

pessoa2.nome = "Maria";

console.log(pessoa1.nome); // Maria
console.log(pessoa2.nome); // Maria
```

Embora existam duas variáveis, ambas apontam para o **mesmo objeto na memória**.

```
pessoa1 ─────┐
             ▼
        {
          nome: "Maria"
        }
             ▲
pessoa2 ─────┘
```

---

# O que é Shallow Copy?

Uma **Shallow Copy (cópia rasa)** cria um **novo objeto**, porém apenas o primeiro nível é copiado.

Se existirem objetos ou arrays aninhados, eles continuarão sendo compartilhados.

```
Novo objeto
      │
      ▼
{
  nome: "João",
  endereco ─────────────┐
}                       │
                        ▼
                 {
                   cidade: "Fortaleza"
                 }
                        ▲
Objeto original ────────┘
```

---

# Exemplo com Spread Operator

```javascript
const pessoa1 = {
  nome: "João",
  endereco: {
    cidade: "Fortaleza",
  },
};

const pessoa2 = {
  ...pessoa1,
};

pessoa2.nome = "Maria";

console.log(pessoa1.nome); // João
console.log(pessoa2.nome); // Maria
```

Até aqui tudo funciona porque `nome` é uma propriedade simples.

Mas observe o objeto interno:

```javascript
pessoa2.endereco.cidade = "Recife";

console.log(pessoa1.endereco.cidade);
// Recife
```

Mesmo copiando o objeto com o operador `...`, o objeto `endereco` continua sendo compartilhado.

---

# Outros exemplos de Shallow Copy

## Object.assign()

```javascript
const copia = Object.assign({}, pessoa1);
```

Também realiza apenas uma cópia rasa.

---

## Arrays

```javascript
const numeros = [1, 2, 3];

const copia = [...numeros];
```

Para arrays contendo apenas valores primitivos, isso é suficiente.

Porém:

```javascript
const pessoas = [
  { nome: "João" },
  { nome: "Maria" },
];

const copia = [...pessoas];

copia[0].nome = "Carlos";

console.log(pessoas[0].nome);
// Carlos
```

Os objetos internos continuam sendo compartilhados.

---

# O que é Deep Copy?

Uma **Deep Copy (cópia profunda)** cria uma cópia completamente independente.

Todos os objetos internos também são copiados.

```
Objeto Original

{
  nome
  endereco ───► { cidade }
}

                ↓

Deep Copy

{
  nome
  endereco ───► { cidade }
}
```

Agora cada objeto possui suas próprias referências.

---

# Exemplo utilizando `structuredClone()`

A maneira moderna de realizar uma Deep Copy é usando:

```javascript
const pessoa2 = structuredClone(pessoa1);
```

Exemplo completo:

```javascript
const pessoa1 = {
  nome: "João",
  endereco: {
    cidade: "Fortaleza",
  },
};

const pessoa2 = structuredClone(pessoa1);

pessoa2.endereco.cidade = "Recife";

console.log(pessoa1.endereco.cidade);
// Fortaleza
```

Agora os objetos são totalmente independentes.

---

# Utilizando JSON

Durante muitos anos era comum utilizar:

```javascript
const copia = JSON.parse(JSON.stringify(objeto));
```

Exemplo:

```javascript
const pessoa2 = JSON.parse(
  JSON.stringify(pessoa1)
);
```

Embora funcione em muitos casos, essa técnica possui limitações.

Ela **não copia corretamente**:

- Funções
- `Date`
- `Map`
- `Set`
- `undefined`
- `BigInt`
- Objetos com referências circulares
- Instâncias de classes

Por isso, hoje é recomendado utilizar `structuredClone()` sempre que possível.

---

# Comparando as abordagens

## Spread

```javascript
const copia = {
  ...objeto,
};
```

✅ Simples

❌ Apenas Shallow Copy

---

## Object.assign

```javascript
const copia = Object.assign({}, objeto);
```

✅ Simples

❌ Apenas Shallow Copy

---

## structuredClone

```javascript
const copia = structuredClone(objeto);
```

✅ Deep Copy

✅ Copia objetos aninhados

✅ Mais segura

---

## JSON

```javascript
JSON.parse(JSON.stringify(objeto));
```

✅ Deep Copy em objetos simples

❌ Possui diversas limitações

---

# Exemplo comparando os dois

```javascript
const usuario = {
  nome: "Ana",
  preferencias: {
    tema: "dark",
  },
};

const shallow = {
  ...usuario,
};

const deep = structuredClone(usuario);

shallow.preferencias.tema = "light";

console.log(usuario.preferencias.tema);
// light

deep.preferencias.tema = "blue";

console.log(usuario.preferencias.tema);
// light
```

Observe que apenas a Deep Copy cria uma estrutura completamente independente.

---

# Quando usar Shallow Copy?

Utilize quando:

- O objeto possui apenas propriedades primitivas.
- Você deseja copiar apenas o primeiro nível.
- Não existem objetos aninhados.

Exemplo:

```javascript
const usuario = {
  nome: "Lucas",
  idade: 25,
};

const copia = { ...usuario };
```

---

# Quando usar Deep Copy?

Utilize quando:

- Existem objetos aninhados.
- Existem arrays dentro de objetos.
- Você precisa garantir que alterações na cópia não afetem o objeto original.

Exemplo:

```javascript
const estado = structuredClone(state);
```

Esse cenário é comum em aplicações React, Redux e Vue.

---

# Resumo

| Característica | Shallow Copy | Deep Copy |
|----------------|--------------|-----------|
| Cria novo objeto | ✅ | ✅ |
| Copia apenas o primeiro nível | ✅ | ❌ |
| Copia objetos internos | ❌ | ✅ |
| Compartilha referências | ✅ | ❌ |
| Mais rápido | ✅ | Geralmente não |
| Mais seguro para objetos complexos | ❌ | ✅ |

---

# Fluxo mental

```
Preciso copiar um objeto?

          │
          ▼
Possui objetos ou arrays internos?
          │
     ┌────┴────┐
     │         │
    Não       Sim
     │         │
     ▼         ▼
Shallow     Deep Copy
 Copy     (structuredClone)
```

---

# Boas práticas

- Utilize **Spread (`...`)** ou `Object.assign()` para objetos simples.
- Prefira **`structuredClone()`** para objetos complexos com estruturas aninhadas.
- Evite usar `JSON.parse(JSON.stringify())` em aplicações modernas, pois essa abordagem possui diversas limitações.
- Lembre-se de que arrays também podem conter objetos e sofrer os mesmos problemas de compartilhamento de referência.

---

# Referências

- Documentação MDN - `structuredClone()`: https://developer.mozilla.org/pt-BR/docs/Web/API/Window/structuredClone
- Documentação MDN - Spread Syntax: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Spread_syntax
- Vídeo: https://www.youtube.com/watch?v=4L4HUjr9Zlg
# TypeScript Avançado

# O que são Conditional Types, Mapped Types e `infer`?

O TypeScript possui recursos avançados que permitem **criar tipos dinamicamente**, tornando o código mais reutilizável, seguro e expressivo.

Os três recursos mais importantes para manipulação de tipos são:

- **Conditional Types** → Criam tipos com base em condições.
- **Mapped Types** → Transformam propriedades de um tipo.
- **`infer`** → Extrai tipos automaticamente durante uma condição.

Esses recursos são amplamente utilizados nas bibliotecas modernas, como React, NestJS, Prisma, Zod e TanStack Query.

---

# Por que aprender esses recursos?

Imagine a seguinte interface:

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
}
```

Você pode precisar:

- Tornar todas as propriedades opcionais.
- Tornar todas obrigatórias.
- Alterar o tipo de todas as propriedades.
- Descobrir automaticamente o tipo de retorno de uma função.
- Criar tipos diferentes dependendo de uma condição.

Sem esses recursos, seria necessário criar vários tipos manualmente.

Com eles, o próprio TypeScript faz esse trabalho.

---

# Conditional Types

Um **Conditional Type** funciona de maneira semelhante a um `if...else`, mas aplicado aos tipos.

Sintaxe:

```typescript
T extends U ? X : Y
```

Lê-se:

> Se `T` estende `U`, então utilize `X`; caso contrário, utilize `Y`.

---

## Primeiro exemplo

```typescript
type Resultado<T> =
  T extends string
    ? "Texto"
    : "Outro tipo";
```

Uso:

```typescript
type A = Resultado<string>;
// "Texto"

type B = Resultado<number>;
// "Outro tipo"
```

---

## Outro exemplo

```typescript
type EhNumero<T> =
  T extends number
    ? true
    : false;
```

```typescript
type A = EhNumero<number>;
// true

type B = EhNumero<boolean>;
// false
```

---

## Exemplo prático

Imagine uma função que aceita apenas arrays.

```typescript
type Elemento<T> =
  T extends Array<any>
    ? "É um array"
    : "Não é um array";
```

```typescript
type A = Elemento<string[]>;
// "É um array"

type B = Elemento<number>;
// "Não é um array"
```

---

# Distribuição sobre Union Types

Uma característica importante é que os Conditional Types são **distributivos** sobre unions.

```typescript
type Teste<T> =
  T extends number
    ? "Número"
    : "Outro";
```

```typescript
type Resultado =
  Teste<number | string>;
```

O TypeScript avalia cada membro da união separadamente.

Resultado:

```typescript
"Número" | "Outro"
```

---

# Mapped Types

Os **Mapped Types** permitem criar novos tipos percorrendo todas as propriedades de outro tipo.

A ideia é semelhante ao método `.map()` de arrays, mas aplicada às propriedades de um objeto.

Sintaxe:

```typescript
{
  [K in keyof T]: ...
}
```

---

## Exemplo básico

```typescript
interface Usuario {
  nome: string;
  idade: number;
}
```

```typescript
type UsuarioBoolean = {
  [K in keyof Usuario]: boolean;
};
```

Resultado:

```typescript
{
  nome: boolean;
  idade: boolean;
}
```

Observe que todas as propriedades foram transformadas.

---

## Criando um tipo somente leitura

```typescript
type SomenteLeitura<T> = {
  readonly [K in keyof T]: T[K];
};
```

Uso:

```typescript
type UsuarioReadonly =
  SomenteLeitura<Usuario>;
```

Resultado:

```typescript
{
  readonly nome: string;
  readonly idade: number;
}
```

É exatamente esse conceito que o `Readonly<T>` da biblioteca padrão utiliza.

---

## Tornando propriedades opcionais

```typescript
type Opcional<T> = {
  [K in keyof T]?: T[K];
};
```

Resultado:

```typescript
{
  nome?: string;
  idade?: number;
}
```

Esse é o mesmo princípio utilizado pelo `Partial<T>`.

---

## Removendo propriedades opcionais

Também podemos remover o modificador `?`.

```typescript
type Obrigatorio<T> = {
  [K in keyof T]-?: T[K];
};
```

---

## Removendo `readonly`

```typescript
type Mutavel<T> = {
  -readonly [K in keyof T]: T[K];
};
```

---

# Combinando com `keyof`

O `keyof` retorna todas as chaves de um tipo.

```typescript
interface Produto {
  id: number;
  nome: string;
  preco: number;
}
```

```typescript
type Chaves =
  keyof Produto;
```

Resultado:

```typescript
"id" | "nome" | "preco"
```

Essas chaves são utilizadas pelos Mapped Types.

---

# O que é `infer`?

A palavra-chave **`infer`** permite **extrair automaticamente um tipo** dentro de um Conditional Type.

Em vez de informar explicitamente o tipo desejado, o TypeScript tenta descobri-lo.

---

# Primeiro exemplo

Imagine:

```typescript
type TipoArray<T> =
  T extends Array<infer U>
    ? U
    : never;
```

Agora:

```typescript
type A =
  TipoArray<string[]>;
```

Resultado:

```typescript
string
```

Outro exemplo:

```typescript
type B =
  TipoArray<number[]>;
```

Resultado:

```typescript
number
```

O `infer U` capturou automaticamente o tipo interno do array.

---

# Extraindo o retorno de uma função

```typescript
type MeuReturnType<T> =
  T extends (...args: any[]) => infer R
    ? R
    : never;
```

Uso:

```typescript
function criarUsuario() {
  return {
    nome: "João",
  };
}

type Usuario =
  MeuReturnType<
    typeof criarUsuario
  >;
```

Resultado:

```typescript
{
  nome: string;
}
```

Esse é praticamente o funcionamento interno do `ReturnType<T>`.

---

# Extraindo parâmetros

```typescript
type MeusParametros<T> =
  T extends (
    ...args: infer P
  ) => any
    ? P
    : never;
```

Uso:

```typescript
function login(
  email: string,
  senha: string
) {}
```

```typescript
type Params =
  MeusParametros<
    typeof login
  >;
```

Resultado:

```typescript
[string, string]
```

---

# Extraindo o tipo de uma Promise

```typescript
type Awaited<T> =
  T extends Promise<infer U>
    ? U
    : T;
```

Uso:

```typescript
type Usuario =
  Awaited<
    Promise<string>
  >;
```

Resultado:

```typescript
string
```

Esse conceito é utilizado pelo utility type `Awaited<T>` do TypeScript.

---

# Combinando Conditional + Mapped Types

Imagine que queremos substituir todas as propriedades `string` por `boolean`.

```typescript
type Converter<T> = {
  [K in keyof T]:
    T[K] extends string
      ? boolean
      : T[K];
};
```

```typescript
interface Usuario {
  nome: string;
  idade: number;
}
```

Resultado:

```typescript
{
  nome: boolean;
  idade: number;
}
```

Observe que percorremos todas as propriedades e aplicamos uma condição em cada uma.

---

# Outro exemplo

Transformando todas as propriedades em `string`.

```typescript
type ComoString<T> = {
  [K in keyof T]: string;
};
```

```typescript
interface Produto {
  id: number;
  preco: number;
}
```

Resultado:

```typescript
{
  id: string;
  preco: string;
}
```

---

# Exemplo do mundo real

Imagine uma API.

```typescript
interface Usuario {
  id: number;
  nome: string;
  ativo: boolean;
}
```

Queremos transformar todos os campos em opcionais e somente leitura.

```typescript
type UsuarioDTO = {
  readonly [K in keyof Usuario]?:
    Usuario[K];
};
```

Resultado:

```typescript
{
  readonly id?: number;
  readonly nome?: string;
  readonly ativo?: boolean;
}
```

Esse padrão aparece com frequência em DTOs, formulários e bibliotecas de validação.

---

# Relação entre os recursos

```
                TypeScript

                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
 Conditional     Mapped         infer
   Types          Types

      │              │
      └──────┐  ┌────┘
             ▼  ▼
       Criam tipos dinâmicos
```

---

# Comparação

| Recurso | O que faz |
|----------|-----------|
| `Conditional Types` | Cria tipos com base em condições (`extends ? :`) |
| `Mapped Types` | Percorre e transforma propriedades de um tipo |
| `infer` | Extrai automaticamente um tipo durante uma condição |
| `keyof` | Obtém as chaves de um tipo |
| `typeof` | Obtém o tipo de uma variável ou função |

---

# Quando usar?

## Conditional Types

- Adaptar tipos conforme uma condição.
- Criar tipos inteligentes.
- Trabalhar com unions.

---

## Mapped Types

- Transformar propriedades.
- Criar versões `readonly`, opcionais ou obrigatórias.
- Evitar duplicação de tipos.

---

## `infer`

- Descobrir tipos automaticamente.
- Extrair o retorno de funções.
- Extrair parâmetros.
- Trabalhar com arrays, Promises e funções genéricas.

---

# Boas práticas

- Prefira utilizar Utility Types (`Partial`, `Readonly`, `ReturnType`, etc.) quando eles já resolverem o problema.
- Crie Conditional Types apenas quando a lógica realmente depender do tipo recebido.
- Use `infer` para evitar repetir tipos e tornar suas definições mais reutilizáveis.
- Combine Mapped Types com Conditional Types para criar tipos altamente flexíveis.
- Evite criar tipos excessivamente complexos, pois podem dificultar a leitura e a manutenção do código.

---

# Resumo

| Recurso | Exemplo |
|----------|----------|
| Conditional Types | `T extends U ? X : Y` |
| Mapped Types | `[K in keyof T]: T[K]` |
| `infer` | `infer R` |
| `keyof` | `"nome" \| "idade"` |
| `typeof` | Obtém o tipo de uma variável ou função |

---

# Referências

- Documentação oficial - Conditional Types: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
- Documentação oficial - Mapped Types: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
- Documentação oficial - Utility Types: https://www.typescriptlang.org/docs/handbook/utility-types.html
- Vídeo: https://www.youtube.com/watch?v=kq-7J5w_LUA
- Vídeo: https://www.youtube.com/watch?v=IdW0Z9npMb8
- Vídeo: https://www.youtube.com/watch?v=0iDDpKGPvYA
````

# TypeScript Avançado

# O que são Type Guards?

Os **Type Guards** (ou **Guardiões de Tipo**) são recursos do TypeScript que permitem **identificar ou restringir o tipo de uma variável durante a execução do código**.

Eles ajudam o compilador a entender qual é o tipo exato de um valor em determinado trecho do código, permitindo acessar propriedades e métodos com segurança.

Em outras palavras:

> **Type Guards refinam um tipo amplo (como uma união) para um tipo mais específico.**

---

# Por que usar Type Guards?

Imagine a seguinte função:

```typescript
function imprimir(valor: string | number) {
  console.log(valor);
}
```

A variável `valor` pode ser uma `string` ou um `number`.

Se tentarmos utilizar um método exclusivo de `string`:

```typescript
function imprimir(valor: string | number) {
  console.log(valor.toUpperCase());
}
```

O TypeScript gera um erro:

```text
Property 'toUpperCase' does not exist on type 'string | number'.
```

O compilador não sabe qual será o tipo em tempo de execução.

É exatamente nesse momento que utilizamos um **Type Guard**.

---

# Como funciona?

Um Type Guard faz uma verificação em tempo de execução.

Depois dessa verificação, o TypeScript consegue "refinar" o tipo da variável.

```typescript
function imprimir(valor: string | number) {
  if (typeof valor === "string") {
    console.log(valor.toUpperCase());
  } else {
    console.log(valor.toFixed(2));
  }
}
```

Agora o TypeScript sabe que:

- Dentro do `if`, `valor` é uma `string`.
- Dentro do `else`, `valor` é um `number`.

---

# Principais Type Guards

Os mais utilizados são:

- `typeof`
- `instanceof`
- `in`
- Comparação direta (`===`)
- Predicados de tipo (`is`)
- Discriminated Unions (Uniões Discriminadas)

---

# Type Guard com `typeof`

O `typeof` é utilizado para verificar tipos primitivos.

```typescript
function exibir(valor: string | number) {
  if (typeof valor === "string") {
    console.log(valor.toUpperCase());
  } else {
    console.log(valor.toFixed(2));
  }
}
```

Tipos suportados:

```typescript
typeof valor === "string"

typeof valor === "number"

typeof valor === "boolean"

typeof valor === "undefined"

typeof valor === "function"

typeof valor === "object"

typeof valor === "bigint"

typeof valor === "symbol"
```

---

# Exemplo

```typescript
function processar(valor: string | boolean) {
  if (typeof valor === "boolean") {
    console.log(valor ? "Sim" : "Não");
  } else {
    console.log(valor.toUpperCase());
  }
}
```

---

# Type Guard com `instanceof`

Utilizado para verificar se um objeto foi criado a partir de uma determinada classe.

```typescript
class Cachorro {}

class Gato {}
```

```typescript
function brincar(animal: Cachorro | Gato) {
  if (animal instanceof Cachorro) {
    console.log("É um cachorro");
  } else {
    console.log("É um gato");
  }
}
```

Outro exemplo:

```typescript
const hoje = new Date();

if (hoje instanceof Date) {
  console.log(hoje.getFullYear());
}
```

---

# Type Guard com `in`

O operador `in` verifica se uma propriedade existe em um objeto.

```typescript
interface Pessoa {
  nome: string;
}

interface Empresa {
  cnpj: string;
}
```

```typescript
function imprimir(
  entidade: Pessoa | Empresa
) {
  if ("nome" in entidade) {
    console.log(entidade.nome);
  } else {
    console.log(entidade.cnpj);
  }
}
```

Muito útil quando duas interfaces possuem propriedades diferentes.

---

# Comparação direta (`===`)

Às vezes basta comparar um valor conhecido.

```typescript
type Status =
  | "ativo"
  | "inativo";
```

```typescript
function verificar(status: Status) {
  if (status === "ativo") {
    console.log("Usuário ativo");
  } else {
    console.log("Usuário inativo");
  }
}
```

O TypeScript entende exatamente qual é o tipo em cada bloco.

---

# User-Defined Type Guards (`is`)

Também podemos criar nossos próprios Type Guards.

Sintaxe:

```typescript
function nome(valor): valor is Tipo
```

---

## Exemplo

```typescript
interface Usuario {
  nome: string;
}
```

```typescript
function ehUsuario(
  valor: any
): valor is Usuario {
  return (
    valor &&
    typeof valor.nome === "string"
  );
}
```

Uso:

```typescript
const dado = {
  nome: "João",
};

if (ehUsuario(dado)) {
  console.log(dado.nome);
}
```

Depois da chamada de `ehUsuario`, o TypeScript sabe que `dado` é um `Usuario`.

---

# Outro exemplo

```typescript
interface Cachorro {
  latir(): void;
}

interface Gato {
  miar(): void;
}
```

```typescript
function ehCachorro(
  animal: Cachorro | Gato
): animal is Cachorro {
  return "latir" in animal;
}
```

Uso:

```typescript
if (ehCachorro(animal)) {
  animal.latir();
} else {
  animal.miar();
}
```

---

# Discriminated Unions

Uma das formas mais elegantes de utilizar Type Guards.

Cada tipo possui uma propriedade em comum que identifica seu tipo.

```typescript
interface Circulo {
  tipo: "circulo";
  raio: number;
}

interface Retangulo {
  tipo: "retangulo";
  largura: number;
  altura: number;
}
```

```typescript
type Forma =
  | Circulo
  | Retangulo;
```

Agora:

```typescript
function calcularArea(
  forma: Forma
) {
  switch (forma.tipo) {
    case "circulo":
      return (
        Math.PI *
        forma.raio **
          2
      );

    case "retangulo":
      return (
        forma.largura *
        forma.altura
      );
  }
}
```

O TypeScript identifica automaticamente o tipo em cada `case`.

Esse padrão é muito comum em aplicações React e APIs.

---

# Exemplo do mundo real

Imagine uma resposta de API.

```typescript
interface Sucesso {
  sucesso: true;
  dados: string[];
}

interface Erro {
  sucesso: false;
  mensagem: string;
}
```

```typescript
type Resposta =
  | Sucesso
  | Erro;
```

```typescript
function processar(
  resposta: Resposta
) {
  if (resposta.sucesso) {
    console.log(resposta.dados);
  } else {
    console.log(resposta.mensagem);
  }
}
```

Observe que o TypeScript entende automaticamente qual interface está sendo utilizada.

---

# Comparando os Type Guards

| Type Guard | Quando usar |
|-------------|-------------|
| `typeof` | Tipos primitivos (`string`, `number`, etc.) |
| `instanceof` | Classes e objetos criados com `new` |
| `in` | Verificar existência de propriedades |
| `===` | Comparar valores literais |
| `is` | Criar verificações personalizadas |
| Discriminated Union | Trabalhar com unions de objetos |

---

# Fluxo de decisão

```
Preciso descobrir o tipo?

          │
          ▼
É um tipo primitivo?
          │
     ┌────┴────┐
     │         │
    Sim       Não
     │         │
     ▼         ▼
 typeof     É uma classe?
                 │
            ┌────┴────┐
            │         │
           Sim       Não
            │         │
            ▼         ▼
      instanceof   Tem propriedade única?
                         │
                    ┌────┴────┐
                    │         │
                   Sim       Não
                    │         │
                    ▼         ▼
                    in     Use um
                          Type Guard
                         personalizado (`is`)
```

---

# Boas práticas

- Prefira utilizar `typeof` para tipos primitivos.
- Utilize `instanceof` apenas para classes.
- Use o operador `in` para diferenciar interfaces com propriedades distintas.
- Crie Type Guards personalizados (`is`) quando a lógica de verificação for reutilizada em vários pontos da aplicação.
- Sempre que possível, modele seus tipos utilizando **Discriminated Unions**, pois elas tornam o código mais seguro e fácil de manter.

---

# Erro comum

Evite utilizar *type assertion* (`as`) quando uma verificação pode ser feita.

❌ Menos seguro:

```typescript
const usuario = dado as Usuario;

console.log(usuario.nome);
```

✅ Mais seguro:

```typescript
if (ehUsuario(dado)) {
  console.log(dado.nome);
}
```

O TypeScript verifica o tipo antes de permitir o acesso às propriedades.

---

# Resumo

| Recurso | Exemplo |
|----------|----------|
| `typeof` | `typeof valor === "string"` |
| `instanceof` | `obj instanceof Date` |
| `in` | `"nome" in objeto` |
| `===` | `status === "ativo"` |
| `is` | `valor is Usuario` |
| Discriminated Union | `switch (obj.tipo)` |

---

# Referências

- Documentação oficial - Narrowing (Type Guards): https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Documentação oficial do TypeScript: https://www.typescriptlang.org/docs/
- Vídeo: https://www.youtube.com/watch?v=DNmCS4PT9bc
````

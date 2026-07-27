# TypeScript Avançado

# O que são Generics?

Os **Generics** são um recurso do TypeScript que permite criar **funções, interfaces, classes e tipos reutilizáveis**, mantendo a segurança de tipos.

Em vez de criar uma função para cada tipo de dado (`string`, `number`, `boolean`, etc.), você cria uma única implementação que funciona com diferentes tipos, preservando a tipagem.

Em outras palavras:

> **Generics permitem escrever código flexível sem perder a segurança oferecida pelo TypeScript.**

---

# Por que usar Generics?

Imagine uma função que retorna o mesmo valor recebido.

Sem Generics:

```typescript
function identity(valor: string): string {
  return valor;
}
```

Ela funciona apenas com `string`.

Se você precisar aceitar `number`, terá que criar outra função:

```typescript
function identityNumber(valor: number): number {
  return valor;
}
```

E depois outra para `boolean`...

Isso gera repetição de código.

---

# Utilizando Generics

Com Generics, basta uma única função.

```typescript
function identity<T>(valor: T): T {
  return valor;
}
```

Agora ela funciona com qualquer tipo.

```typescript
const nome = identity("João");

const idade = identity(25);

const ativo = identity(true);
```

O TypeScript identifica automaticamente o tipo.

---

# O que significa `<T>`?

O `<T>` representa um **parâmetro de tipo**.

Você pode imaginar como uma variável, mas em vez de armazenar um valor, ela armazena um **tipo**.

```typescript
function identity<T>(valor: T): T {
  return valor;
}
```

Quando chamamos:

```typescript
identity("Maria");
```

O TypeScript entende:

```typescript
T = string
```

Quando chamamos:

```typescript
identity(10);
```

Ele entende:

```typescript
T = number
```

---

# Informando o tipo manualmente

Também é possível informar o tipo explicitamente.

```typescript
identity<string>("Maria");

identity<number>(10);

identity<boolean>(true);
```

Na maioria dos casos isso não é necessário, pois o TypeScript faz a inferência automaticamente.

---

# Exemplo prático

Imagine uma função que retorna o primeiro item de um array.

Sem Generics:

```typescript
function primeiroElemento(lista: string[]): string {
  return lista[0];
}
```

Ela só aceita arrays de `string`.

Com Generics:

```typescript
function primeiroElemento<T>(lista: T[]): T {
  return lista[0];
}
```

Agora funciona para qualquer tipo.

```typescript
const nome = primeiroElemento(["Ana", "Carlos"]);

const numero = primeiroElemento([10, 20, 30]);

const ativo = primeiroElemento([true, false]);
```

---

# Generics em Arrays

Você provavelmente já utiliza Generics sem perceber.

Estas duas declarações são equivalentes:

```typescript
const nomes: string[] = [];
```

```typescript
const nomes: Array<string> = [];
```

O tipo `Array<T>` é um Generic.

Outro exemplo:

```typescript
const numeros: Array<number> = [1, 2, 3];
```

---

# Generics com Interfaces

Também podemos criar interfaces reutilizáveis.

Sem Generics:

```typescript
interface Usuario {
  dados: string;
}
```

Com Generics:

```typescript
interface ApiResponse<T> {
  sucesso: boolean;
  dados: T;
}
```

Agora podemos reutilizar essa interface.

```typescript
interface Usuario {
  id: number;
  nome: string;
}

const resposta: ApiResponse<Usuario> = {
  sucesso: true,
  dados: {
    id: 1,
    nome: "João",
  },
};
```

Outro exemplo:

```typescript
const respostaProdutos: ApiResponse<string[]> = {
  sucesso: true,
  dados: ["Notebook", "Mouse"],
};
```

---

# Generics com Type Alias

Também funcionam com `type`.

```typescript
type Resultado<T> = {
  sucesso: boolean;
  valor: T;
};
```

Exemplo:

```typescript
const resultado: Resultado<number> = {
  sucesso: true,
  valor: 100,
};
```

---

# Generics com Classes

Classes também podem utilizar Generics.

```typescript
class Caixa<T> {
  constructor(public valor: T) {}
}

const caixaNumero = new Caixa<number>(100);

const caixaTexto = new Caixa<string>("Olá");
```

Agora cada instância mantém seu próprio tipo.

---

# Generics com múltiplos tipos

Uma função pode receber mais de um Generic.

```typescript
function criarPar<K, V>(chave: K, valor: V) {
  return {
    chave,
    valor,
  };
}
```

Uso:

```typescript
const usuario = criarPar("nome", "João");

const produto = criarPar(1, {
  descricao: "Notebook",
});
```

Nesse caso:

- `K` representa a chave.
- `V` representa o valor.

---

# Nomes mais comuns

Embora você possa usar qualquer nome, alguns são convenções da comunidade.

| Nome | Significado |
|------|-------------|
| `T` | Type |
| `K` | Key |
| `V` | Value |
| `E` | Element |
| `R` | Return |
| `P` | Props ou Parameters |

Exemplo:

```typescript
function merge<T, U>(obj1: T, obj2: U) {
  return {
    ...obj1,
    ...obj2,
  };
}
```

---

# Restringindo tipos (Constraints)

Às vezes queremos limitar quais tipos podem ser utilizados.

Utilizamos a palavra-chave `extends`.

```typescript
function mostrarNome<T extends { nome: string }>(objeto: T) {
  console.log(objeto.nome);
}
```

Funciona:

```typescript
mostrarNome({
  nome: "Carlos",
  idade: 30,
});
```

Não funciona:

```typescript
mostrarNome({
  idade: 30,
});
```

Erro:

```text
Property 'nome' is missing...
```

---

# Outro exemplo com `keyof`

Podemos garantir que uma chave exista em um objeto.

```typescript
function obterValor<T, K extends keyof T>(
  objeto: T,
  chave: K
) {
  return objeto[chave];
}
```

Uso:

```typescript
const usuario = {
  nome: "Maria",
  idade: 28,
};

obterValor(usuario, "nome");

obterValor(usuario, "idade");
```

Isso evita acessar propriedades inexistentes.

---

# Exemplo do mundo real

Imagine uma função para buscar dados de uma API.

```typescript
interface ApiResponse<T> {
  data: T;
}

async function buscar<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);

  return response.json();
}
```

Uso:

```typescript
interface Usuario {
  id: number;
  nome: string;
}

const usuarios = await buscar<Usuario[]>("/usuarios");
```

Agora o TypeScript sabe exatamente o formato da resposta.

---

# Vantagens

- Evita duplicação de código.
- Mantém a segurança de tipos.
- Facilita a reutilização de funções.
- Melhora a inferência do TypeScript.
- Torna bibliotecas e APIs mais flexíveis.

---

# Quando usar?

Utilize Generics quando:

- Uma função deve funcionar com vários tipos.
- Você deseja criar componentes reutilizáveis.
- Está desenvolvendo bibliotecas.
- Está criando classes, interfaces ou tipos genéricos.

---

# Quando NÃO usar?

Evite Generics quando o tipo é sempre conhecido.

Exemplo:

```typescript
function calcularIdade(idade: number) {
  return idade;
}
```

Nesse caso, usar Generic apenas adicionaria complexidade desnecessária.

---

# Resumo

| Sem Generics | Com Generics |
|--------------|--------------|
| Código duplicado para cada tipo | Uma única implementação |
| Menor reutilização | Alta reutilização |
| Tipagem fixa | Tipagem flexível e segura |
| Pouca escalabilidade | Fácil manutenção |

---

# Fluxo mental

```
Minha função funciona
com mais de um tipo?

          │
     ┌────┴────┐
     │         │
    Não       Sim
     │         │
     ▼         ▼
 Tipo fixo   Use Generics
              <T>
```

---

# Boas práticas

- Utilize nomes descritivos quando houver mais de um Generic (`T`, `K`, `V`, etc.).
- Prefira deixar o TypeScript inferir os tipos sempre que possível.
- Utilize `extends` para restringir os tipos aceitos.
- Evite criar Generics quando um tipo específico atende ao problema.
- Não exagere na quantidade de parâmetros genéricos; isso pode dificultar a leitura do código.

---

# Referências

- Documentação oficial do TypeScript - Generics: https://www.typescriptlang.org/docs/handbook/2/generics.html
- Documentação oficial do TypeScript: https://www.typescriptlang.org/docs/
- Vídeo: https://www.youtube.com/watch?v=Q3TWre2DNT8
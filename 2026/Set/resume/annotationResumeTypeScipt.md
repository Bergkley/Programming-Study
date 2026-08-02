# TypeScript Avançado + Node.js Internals - Conditional+Mapped Ts

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


---

# TypeScript Avançado + Node.js Internals - TypeScript Decorators

# TypeScript Avançado

# O que são TypeScript Decorators?

Os **Decorators** são um recurso do TypeScript que permite **adicionar ou modificar comportamentos de classes, métodos, propriedades, parâmetros e acessores**, sem alterar diretamente o código original.

Eles seguem o padrão de **Metaprogramação (Metaprogramming)**, ou seja, código que modifica ou adiciona comportamento a outro código.

Em outras palavras:

> **Um Decorator é uma função que é executada quando uma classe ou um de seus membros é definido, permitindo estender seu comportamento.**

Decorators são muito utilizados em frameworks como:

- Angular
- NestJS
- TypeORM
- TypeGraphQL
- class-validator
- class-transformer

---

# Importante

Atualmente, os Decorators fazem parte do ecossistema JavaScript e TypeScript, porém existem diferenças entre:

- **Decorators legados (Legacy Decorators)** → utilizados pelo TypeScript há muitos anos e amplamente adotados por frameworks como Angular e NestJS.
- **Decorators do padrão ECMAScript** → versão padronizada da linguagem JavaScript.

Neste material, utilizaremos a sintaxe mais conhecida e presente na maioria dos projetos TypeScript atuais (Legacy Decorators).

Para utilizá-los, normalmente é necessário habilitar a opção:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Em alguns projetos também é utilizado:

```json
{
  "emitDecoratorMetadata": true
}
```

Principalmente quando frameworks precisam acessar informações sobre os tipos em tempo de execução.

---

# O que é um Decorator?

Um Decorator é apenas uma função.

Ela recebe informações sobre o elemento decorado e pode modificar seu comportamento.

Exemplo:

```typescript
function Log(constructor: Function) {
  console.log("Classe criada!");
}

@Log
class Usuario {}
```

Saída:

```text
Classe criada!
```

Observe que o Decorator foi executado **quando a classe foi definida**, e não quando uma instância foi criada.

---

# Sintaxe

Decorators utilizam o símbolo `@`.

```typescript
@Decorator
class MinhaClasse {}
```

Também podem receber parâmetros.

```typescript
@Decorator("Admin")
class Usuario {}
```

---

# Tipos de Decorators

O TypeScript permite criar Decorators para:

- Classes
- Métodos
- Propriedades
- Acessores (`get` e `set`)
- Parâmetros

---

# Class Decorator

É aplicado sobre uma classe inteira.

```typescript
function Logger(constructor: Function) {
  console.log(
    `${constructor.name} foi criada`
  );
}

@Logger
class Produto {}
```

Saída:

```text
Produto foi criada
```

---

## Modificando a classe

Um Class Decorator também pode retornar uma nova classe.

```typescript
function CriadoEm<T extends new (...args: any[]) => {}>(
  constructor: T
) {
  return class extends constructor {
    criadoEm = new Date();
  };
}

@CriadoEm
class Usuario {
  nome = "João";
}

const usuario = new Usuario();

console.log(usuario);
```

Resultado:

```typescript
{
  nome: "João",
  criadoEm: Date(...)
}
```

---

# Method Decorator

Permite interceptar chamadas de métodos.

```typescript
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const metodoOriginal =
    descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(
      `Executando ${propertyKey}`
    );

    return metodoOriginal.apply(
      this,
      args
    );
  };
}
```

Uso:

```typescript
class Usuario {
  @Log
  salvar() {
    console.log("Salvando...");
  }
}

new Usuario().salvar();
```

Saída:

```text
Executando salvar

Salvando...
```

Esse padrão é muito utilizado para:

- Logs
- Auditoria
- Cache
- Controle de permissões
- Monitoramento

---

# Property Decorator

É aplicado sobre propriedades.

```typescript
function Obrigatorio(
  target: any,
  propertyKey: string
) {
  console.log(
    `Propriedade: ${propertyKey}`
  );
}

class Usuario {
  @Obrigatorio
  nome!: string;
}
```

Embora Property Decorators possam registrar metadados, eles **não conseguem alterar diretamente o comportamento da propriedade** da mesma forma que Method Decorators.

---

# Accessor Decorator

É aplicado sobre métodos `get` e `set`.

```typescript
function LogAccessor(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  console.log(
    `Accessor: ${propertyKey}`
  );
}

class Produto {
  private _preco = 100;

  @LogAccessor
  get preco() {
    return this._preco;
  }
}
```

---

# Parameter Decorator

Permite observar informações sobre um parâmetro.

```typescript
function ParamInfo(
  target: any,
  propertyKey: string,
  parameterIndex: number
) {
  console.log(
    `Parâmetro ${parameterIndex}`
  );
}

class Usuario {
  salvar(
    @ParamInfo nome: string
  ) {}
}
```

É bastante utilizado por frameworks de injeção de dependências.

---

# Decorators com parâmetros

Um Decorator pode ser configurável.

Nesse caso, criamos uma função que retorna o Decorator.

```typescript
function Perfil(tipo: string) {
  return function (
    constructor: Function
  ) {
    console.log(
      `Perfil: ${tipo}`
    );
  };
}
```

Uso:

```typescript
@Perfil("Administrador")
class Usuario {}
```

Saída:

```text
Perfil: Administrador
```

---

# Ordem de execução

Quando existem vários Decorators, eles são avaliados de cima para baixo, mas executados de baixo para cima.

```typescript
@Primeiro
@Segundo
class Usuario {}
```

Ordem de execução:

```
Segundo

Primeiro
```

Esse comportamento é semelhante à composição de funções.

---

# Exemplo do mundo real

No NestJS é muito comum encontrar algo como:

```typescript
@Controller("usuarios")
export class UsuarioController {}
```

Outro exemplo:

```typescript
@Get()
listarUsuarios() {}
```

Ou ainda:

```typescript
@Injectable()
export class UsuarioService {}
```

Todos esses são Decorators.

Eles adicionam metadados que o framework utiliza para:

- Criar rotas.
- Registrar serviços.
- Fazer injeção de dependências.
- Configurar autenticação.
- Aplicar interceptadores e filtros.

---

# Outro exemplo

Criando um Decorator para medir tempo de execução.

```typescript
function TempoExecucao(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original =
    descriptor.value;

  descriptor.value = function (...args: any[]) {
    const inicio = performance.now();

    const resultado = original.apply(
      this,
      args
    );

    console.log(
      performance.now() - inicio
    );

    return resultado;
  };
}
```

Uso:

```typescript
class Relatorio {
  @TempoExecucao
  gerar() {
    // código...
  }
}
```

---

# Vantagens

- Evitam repetição de código.
- Facilitam reutilização de comportamentos.
- Deixam regras transversais (logs, cache, autorização etc.) separadas da lógica principal.
- São muito utilizados em frameworks modernos.
- Facilitam a criação de APIs declarativas.

---

# Desvantagens

- Podem tornar o fluxo de execução menos evidente.
- Exigem conhecimento sobre metaprogramação.
- O uso excessivo pode dificultar a depuração.
- Nem sempre são a melhor escolha para aplicações pequenas.

---

# Quando usar?

Utilize Decorators quando precisar adicionar comportamentos reutilizáveis, como:

- Logs
- Cache
- Autorização
- Validação
- Injeção de dependências
- Registro de metadados
- Monitoramento
- Auditoria

---

# Quando NÃO usar?

Evite Decorators quando:

- Uma função comum resolve o problema.
- O comportamento é específico de apenas um lugar da aplicação.
- O código fica mais difícil de entender do que a implementação tradicional.

Decorators são excelentes para funcionalidades transversais (**cross-cutting concerns**), mas não devem substituir boas práticas de organização do código.

---

# Resumo

| Tipo | Atua sobre |
|-------|------------|
| Class Decorator | Classe |
| Method Decorator | Métodos |
| Property Decorator | Propriedades |
| Accessor Decorator | `get` e `set` |
| Parameter Decorator | Parâmetros |

---

# Fluxo mental

```
Quero adicionar um comportamento
sem alterar a classe?

             │
             ▼
      Use um Decorator

             │
 ┌───────────┼────────────┐
 │           │            │
 ▼           ▼            ▼
Classe     Método     Propriedade

             │
      Também existem
      Accessor e
      Parameter Decorators
```

---

# Boas práticas

- Utilize Decorators para comportamentos reutilizáveis e independentes da lógica de negócio.
- Evite colocar regras complexas diretamente dentro dos Decorators.
- Prefira nomes claros, como `@Log`, `@Cache`, `@Authorize` e `@Validate`.
- Conheça a diferença entre os Decorators legados do TypeScript e os Decorators padronizados do JavaScript, especialmente ao iniciar novos projetos.
- Em aplicações com NestJS ou Angular, aproveite os Decorators fornecidos pelo framework antes de criar os seus próprios.

---

# Referências

- Documentação oficial do TypeScript - Decorators: https://www.typescriptlang.org/docs/handbook/decorators.html
- Proposta de Decorators (TC39): https://github.com/tc39/proposal-decorators
- Vídeo: https://www.youtube.com/watch?v=KquAqdsucTM
````


---

# TypeScript Avançado + Node.js Internals - TypeScript Generics

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

---

# TypeScript Avançado + Node.js Internals - TypeScript Guards

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


---

# TypeScript Avançado + Node.js Internals - TypeScript Map & Set

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

---

# TypeScript Avançado + Node.js Internals - TypeScript Utility Types

# TypeScript Avançado

# O que são Utility Types?

Os **Utility Types** são tipos utilitários fornecidos pelo próprio TypeScript para **transformar, reutilizar e manipular outros tipos** de forma simples e segura.

Eles evitam a duplicação de código e tornam a tipagem mais flexível e fácil de manter.

Em vez de criar novos tipos manualmente, você pode reutilizar tipos existentes e modificá-los conforme a necessidade.

---

# Por que usar Utility Types?

Imagine a seguinte interface:

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}
```

Agora imagine que você precisa de:

- Um tipo para criação de usuário.
- Um tipo para atualização.
- Um tipo para exibição.
- Um tipo apenas com algumas propriedades.

Criar várias interfaces seria repetitivo.

Com Utility Types isso fica muito mais simples.

---

# Principais Utility Types

Os Utility Types mais utilizados são:

- `Partial<T>`
- `Required<T>`
- `Readonly<T>`
- `Pick<T, K>`
- `Omit<T, K>`
- `Record<K, T>`
- `Exclude<T, U>`
- `Extract<T, U>`
- `NonNullable<T>`
- `ReturnType<T>`
- `Parameters<T>`

---

# Partial

Transforma **todas as propriedades em opcionais**.

```typescript
interface Usuario {
  nome: string;
  email: string;
}
```

Sem `Partial`:

```typescript
const usuario: Usuario = {
  nome: "João",
};
```

Erro:

```text
Property 'email' is missing...
```

Com `Partial`:

```typescript
const usuario: Partial<Usuario> = {
  nome: "João",
};
```

Agora todas as propriedades são opcionais.

Resultado equivalente:

```typescript
{
  nome?: string;
  email?: string;
}
```

---

# Exemplo prático

Muito utilizado em atualizações.

```typescript
interface Usuario {
  nome: string;
  email: string;
}

function atualizarUsuario(
  dados: Partial<Usuario>
) {}
```

Agora é possível atualizar apenas um campo.

```typescript
atualizarUsuario({
  nome: "Maria",
});
```

---

# Required

Faz o contrário do `Partial`.

Todas as propriedades tornam-se obrigatórias.

```typescript
interface Config {
  tema?: string;
  idioma?: string;
}
```

```typescript
type ConfigCompleta = Required<Config>;
```

Resultado:

```typescript
{
  tema: string;
  idioma: string;
}
```

---

# Readonly

Impede alterações após a criação do objeto.

```typescript
interface Produto {
  id: number;
  nome: string;
}

const produto: Readonly<Produto> = {
  id: 1,
  nome: "Notebook",
};

produto.nome = "Mouse";
```

Erro:

```text
Cannot assign to 'nome'
because it is a read-only property.
```

---

# Pick

Seleciona apenas algumas propriedades de outro tipo.

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}
```

```typescript
type UsuarioPublico = Pick<
  Usuario,
  "id" | "nome"
>;
```

Resultado:

```typescript
{
  id: number;
  nome: string;
}
```

Muito útil para esconder informações sensíveis.

---

# Omit

Remove propriedades de um tipo.

```typescript
type UsuarioSemSenha = Omit<
  Usuario,
  "senha"
>;
```

Resultado:

```typescript
{
  id: number;
  nome: string;
  email: string;
}
```

É bastante utilizado em respostas de APIs.

---

# Pick x Omit

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}
```

Usando `Pick`:

```typescript
type UsuarioPublico = Pick<
  Usuario,
  "id" | "nome"
>;
```

Usando `Omit`:

```typescript
type UsuarioSemSenha = Omit<
  Usuario,
  "senha"
>;
```

- **Pick** → escolhe o que manter.
- **Omit** → remove o que não interessa.

---

# Record

Cria um objeto utilizando um conjunto de chaves.

Sintaxe:

```typescript
Record<Chaves, Tipo>
```

Exemplo:

```typescript
type Cargos = Record<
  string,
  number
>;

const salarios: Cargos = {
  Desenvolvedor: 6000,
  Designer: 5000,
  QA: 4500,
};
```

Outro exemplo:

```typescript
type Status = "ativo" | "inativo";

const usuarios: Record<Status, number> = {
  ativo: 15,
  inativo: 3,
};
```

---

# Exclude

Remove tipos de uma união.

```typescript
type Status =
  | "ativo"
  | "inativo"
  | "bloqueado";
```

```typescript
type NovoStatus = Exclude<
  Status,
  "bloqueado"
>;
```

Resultado:

```typescript
"ativo" | "inativo"
```

---

# Extract

Faz o contrário do `Exclude`.

Mantém apenas os tipos desejados.

```typescript
type Status =
  | "ativo"
  | "inativo"
  | "bloqueado";
```

```typescript
type ApenasAtivo = Extract<
  Status,
  "ativo"
>;
```

Resultado:

```typescript
"ativo"
```

---

# NonNullable

Remove `null` e `undefined`.

```typescript
type Usuario =
  | string
  | null
  | undefined;
```

```typescript
type UsuarioValido =
  NonNullable<Usuario>;
```

Resultado:

```typescript
string
```

---

# ReturnType

Obtém automaticamente o tipo de retorno de uma função.

```typescript
function criarUsuario() {
  return {
    nome: "João",
    idade: 25,
  };
}
```

```typescript
type Usuario = ReturnType<
  typeof criarUsuario
>;
```

Resultado:

```typescript
{
  nome: string;
  idade: number;
}
```

---

# Parameters

Obtém os parâmetros de uma função.

```typescript
function login(
  email: string,
  senha: string
) {}
```

```typescript
type LoginParams =
  Parameters<typeof login>;
```

Resultado:

```typescript
[string, string]
```

---

# Exemplo do mundo real

Imagine uma API.

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}
```

Cadastro:

```typescript
type CriarUsuario =
  Omit<Usuario, "id">;
```

Atualização:

```typescript
type AtualizarUsuario =
  Partial<Usuario>;
```

Resposta pública:

```typescript
type UsuarioResponse =
  Omit<Usuario, "senha">;
```

Observe que nenhuma interface precisou ser duplicada.

---

# Comparação dos principais Utility Types

| Utility Type | O que faz |
|---------------|-----------|
| `Partial<T>` | Torna todas as propriedades opcionais |
| `Required<T>` | Torna todas as propriedades obrigatórias |
| `Readonly<T>` | Impede alterações nas propriedades |
| `Pick<T, K>` | Seleciona propriedades específicas |
| `Omit<T, K>` | Remove propriedades específicas |
| `Record<K, T>` | Cria um objeto com chaves e valores tipados |
| `Exclude<T, U>` | Remove tipos de uma união |
| `Extract<T, U>` | Mantém apenas tipos específicos |
| `NonNullable<T>` | Remove `null` e `undefined` |
| `ReturnType<T>` | Obtém o tipo de retorno de uma função |
| `Parameters<T>` | Obtém os tipos dos parâmetros de uma função |

---

# Quando usar?

Use Utility Types quando:

- Deseja evitar duplicação de tipos.
- Precisa adaptar uma interface existente.
- Está trabalhando com APIs.
- Precisa reutilizar modelos em diferentes contextos.
- Quer manter a tipagem consistente durante a evolução do projeto.

---

# Boas práticas

- Prefira reutilizar tipos existentes em vez de criar interfaces quase iguais.
- Use `Partial` para operações de atualização (`PATCH`).
- Use `Omit` para remover informações sensíveis, como senhas.
- Use `Pick` quando precisar expor apenas alguns campos.
- Utilize `Readonly` para objetos que não devem ser modificados.
- Combine Utility Types com Generics para criar soluções ainda mais reutilizáveis.

---

# Resumo

```
Tenho um tipo existente
          │
          ▼
Preciso modificar esse tipo?
          │
 ┌────────┼─────────┐
 │        │         │
 ▼        ▼         ▼
Adicionar  Remover  Tornar
opcional? propriedades? imutável?
 │         │         │
 ▼         ▼         ▼
Partial   Omit   Readonly

Selecionar apenas algumas?
        │
        ▼
      Pick

Criar objeto tipado?
        │
        ▼
      Record

Trabalhar com unions?
        │
   ┌────┴────┐
   ▼         ▼
Exclude   Extract

Remover null?
        │
        ▼
NonNullable

Obter tipos de funções?
        │
   ┌────┴─────┐
   ▼          ▼
ReturnType Parameters
```

---

# Referências

- Documentação oficial do TypeScript - Utility Types: https://www.typescriptlang.org/docs/handbook/utility-types.html
- Documentação oficial do TypeScript: https://www.typescriptlang.org/docs/
-Vídeo - https://www.youtube.com/watch?v=vVmfmc02AOc

---

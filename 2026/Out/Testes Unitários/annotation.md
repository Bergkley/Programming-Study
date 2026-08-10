# Testes Unitários

# Jest

Os **Testes Unitários** são testes automatizados que verificam se uma pequena parte do sistema (geralmente uma função, método ou classe) funciona corretamente de forma **isolada**, sem depender de banco de dados, APIs externas ou outras partes da aplicação.

O **Jest** é um framework de testes para JavaScript e TypeScript, criado pelo Facebook, muito utilizado em projetos Node.js e React por já vir com **test runner**, **assertions** e **mocking** integrados, sem precisar instalar várias bibliotecas separadas.

Os três pilares principais para trabalhar com testes unitários no Jest são:

- Estrutura de testes (describe, it/test, expect)
- Mocks e Spies
- Cobertura de código (coverage)

---

# Por que escrever testes unitários?

Imagine uma aplicação crescendo ao longo do tempo.

Sem testes:

- medo de alterar qualquer código;
- bugs só descobertos em produção;
- retrabalho constante;
- difícil garantir que uma correção não quebrou outra parte.

Com testes unitários:

- confiança para refatorar;
- bugs encontrados antes de ir para produção;
- documentação viva do comportamento esperado;
- integração mais segura entre desenvolvedores.

---

# Visão geral

```
Testes Automatizados

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Unitário Integração  E2E
```

O Jest é focado principalmente em **testes unitários** e **testes de integração** mais simples, sendo o ponto de partida da pirâmide de testes.

---

# Instalação

```bash
npm install --save-dev jest @types/jest ts-jest typescript
```

Configuração básica (`jest.config.js`):

```typescript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
};
```

Script no `package.json`:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

---

# Estrutura básica de um teste

```typescript
describe("Calculadora", () => {

  it("deve somar dois números", () => {

    const resultado = 2 + 2;

    expect(resultado).toBe(4);

  });

});
```

- `describe`: agrupa testes relacionados.
- `it` (ou `test`): define um caso de teste.
- `expect`: define o resultado esperado.

---

# Problema

Imagine uma função de soma sem testes.

```typescript
function somar(a: number, b: number) {
  return a + b;
}
```

Como garantir que ela sempre funcionará corretamente, mesmo após futuras alterações?

---

# Solução

```typescript
function somar(a: number, b: number) {
  return a + b;
}
```

```typescript
describe("somar", () => {

  it("deve retornar a soma de dois números positivos", () => {
    expect(somar(2, 3)).toBe(5);
  });

  it("deve retornar a soma quando um número é negativo", () => {
    expect(somar(-2, 3)).toBe(1);
  });

});
```

Agora, qualquer alteração futura que quebre essa regra será identificada automaticamente.

---

# Principais Matchers do Jest

- `toBe(valor)`: compara valores primitivos (igualdade exata).
- `toEqual(valor)`: compara objetos e arrays (igualdade de valor).
- `toBeTruthy()` / `toBeFalsy()`: verifica se é verdadeiro ou falso.
- `toBeNull()` / `toBeUndefined()`: verifica valores nulos ou indefinidos.
- `toContain(item)`: verifica se um array ou string contém um item.
- `toThrow()`: verifica se uma função lança um erro.
- `toHaveBeenCalled()`: verifica se uma função mock foi chamada.

---

# Exemplo — toEqual

```typescript
function criarUsuario(nome: string) {
  return { nome, ativo: true };
}
```

```typescript
it("deve criar um usuário ativo", () => {

  const usuario = criarUsuario("Sheila");

  expect(usuario).toEqual({
    nome: "Sheila",
    ativo: true,
  });

});
```

---

# O que são Mocks?

**Mocks** são versões falsas de funções, módulos ou dependências, utilizadas para **isolar** o que está sendo testado.

```
Função real

↓

Substituída por

↓

Mock (versão falsa)
```

Usados quando a função depende de:

- chamadas HTTP;
- banco de dados;
- serviços externos;
- funções demoradas ou não determinísticas.

---

# Exemplo — Mock de função

```typescript
const buscarUsuario = jest.fn().mockReturnValue({
  nome: "Sheila",
  ativo: true,
});
```

```typescript
it("deve retornar o usuário mockado", () => {

  const usuario = buscarUsuario();

  expect(usuario.nome).toBe("Sheila");
  expect(buscarUsuario).toHaveBeenCalled();

});
```

---

# Exemplo — Mock de módulo

```typescript
import { enviarEmail } from "./email";

jest.mock("./email");

it("deve chamar o envio de email", () => {

  enviarEmail("teste@teste.com");

  expect(enviarEmail).toHaveBeenCalledWith(
    "teste@teste.com"
  );

});
```

---

# Testando funções assíncronas

```typescript
async function buscarDados() {
  return "dados";
}
```

```typescript
it("deve retornar os dados", async () => {

  const resultado = await buscarDados();

  expect(resultado).toBe("dados");

});
```

Também é possível utilizar `.resolves` e `.rejects`:

```typescript
it("deve resolver com os dados", () => {
  return expect(buscarDados()).resolves.toBe("dados");
});
```

---

# beforeEach, afterEach e afterAll

Utilizados para preparar e limpar o ambiente de teste.

```typescript
describe("UsuarioService", () => {

  let usuarios: string[];

  beforeEach(() => {
    usuarios = [];
  });

  it("deve adicionar um usuário", () => {
    usuarios.push("Sheila");
    expect(usuarios).toContain("Sheila");
  });

  it("deve começar vazio a cada teste", () => {
    expect(usuarios.length).toBe(0);
  });

});
```

Isso garante que um teste não interfira no resultado do outro.

---

# Cobertura de Código (Coverage)

O Jest consegue gerar um relatório mostrando quanto do código está coberto por testes.

```bash
npx jest --coverage
```

```
--------------|---------|----------|---------|---------|
File          | % Stmts | % Branch | % Funcs | % Lines |
--------------|---------|----------|---------|---------|
somar.ts      |   100   |   100    |   100   |   100   |
--------------|---------|----------|---------|---------|
```

Cobertura alta não significa ausência de bugs, mas ajuda a identificar partes do código sem nenhum teste.

---

# O que é TDD?

**TDD (Test-Driven Development)**, ou Desenvolvimento Orientado a Testes, é uma prática em que o teste é escrito **antes** do código de produção.

Em vez de programar e depois testar, a lógica se inverte:

> **Primeiro escrevo o teste que descreve o comportamento esperado, depois escrevo o código mínimo para fazê-lo passar.**

---

# O ciclo Red - Green - Refactor

```
Red

↓

Escrever um teste que falha

↓

Green

↓

Escrever o código mínimo

para o teste passar

↓

Refactor

↓

Melhorar o código

mantendo os testes passando
```

- **Red**: escreve um teste para uma funcionalidade que ainda não existe. Ele falha, pois o código ainda não foi implementado.
- **Green**: implementa o código mais simples possível apenas para o teste passar.
- **Refactor**: melhora a estrutura do código (aplicando Clean Code, removendo Code Smells) sem quebrar o teste.

Esse ciclo se repete a cada nova funcionalidade ou regra de negócio.

---

# Exemplo — Ciclo completo

**1. Red — escrevendo o teste primeiro**

```typescript
describe("somar", () => {

  it("deve retornar a soma de dois números", () => {
    expect(somar(2, 3)).toBe(5);
  });

});
```

Nesse momento, a função `somar` ainda **não existe**. O teste falha.

**2. Green — implementando o mínimo necessário**

```typescript
function somar(a: number, b: number) {
  return a + b;
}
```

O teste agora passa.

**3. Refactor — melhorando se necessário**

```typescript
function somar(a: number, b: number): number {
  return a + b;
}
```

Nesse caso simples a refatoração é mínima, mas em funções mais complexas é aqui que se aplicam boas práticas de Clean Code.

---

# Exemplo — Adicionando uma nova regra

Suponha que agora seja necessário validar que os números não podem ser negativos.

**Red**

```typescript
it("deve lançar erro se algum número for negativo", () => {

  expect(() => somar(-1, 5)).toThrow(
    "Números não podem ser negativos"
  );

});
```

**Green**

```typescript
function somar(a: number, b: number): number {

  if (a < 0 || b < 0) {
    throw new Error("Números não podem ser negativos");
  }

  return a + b;

}
```

**Refactor**

```typescript
function validarNumerosPositivos(...numeros: number[]) {
  if (numeros.some((n) => n < 0)) {
    throw new Error("Números não podem ser negativos");
  }
}

function somar(a: number, b: number): number {
  validarNumerosPositivos(a, b);
  return a + b;
}
```

Todos os testes continuam passando, mas o código ficou mais legível e reutilizável.

---

# Vantagens do TDD

- Garante que todo código escrito tem um motivo (um teste que exige sua existência).
- Reduz código desnecessário, já que só se implementa o suficiente para passar no teste.
- Gera uma suíte de testes robusta como consequência natural do processo.
- Facilita o design do código, pois pensar no teste antes ajuda a definir interfaces mais simples.
- Dá segurança para refatorar constantemente.

---

# Desafios do TDD

- Exige disciplina e mudança de hábito.
- Pode parecer mais lento no início.
- Nem todo cenário é simples de testar antes de existir (ex.: integrações complexas, UI).
- Requer prática para escrever bons testes antes da implementação.

---

# Quando aplicar TDD?

Utilize quando:

- a regra de negócio for clara o suficiente para ser descrita em um teste;
- for uma função ou módulo com lógica importante;
- quiser garantir cobertura desde o início do desenvolvimento;
- estiver corrigindo um bug (escreva primeiro o teste que reproduz o bug).

TDD é mais difícil de aplicar em cenários muito exploratórios, onde o comportamento esperado ainda não está bem definido.

---

# TDD x Testes escritos depois

| TDD (testes antes) | Testes escritos depois |
|----------|----------|
| Teste guia o design do código | Código já existe, teste apenas valida |
| Menor chance de código não testado | Pode haver trechos sem cobertura |
| Ciclo Red-Green-Refactor | Sem ciclo definido |
| Exige mais disciplina | Mais flexível, porém mais fácil de negligenciar |

---

# Vantagens de usar Jest

- Configuração simples, tudo em uma única ferramenta.
- Suporte nativo a mocks e spies.
- Relatórios de cobertura integrados.
- Grande comunidade e boa integração com TypeScript e React.
- Execução rápida com testes em paralelo.

---

# Quando escrever testes unitários?

Utilize quando:

- criar uma função com regra de negócio importante;
- corrigir um bug (crie um teste que comprove a correção);
- for refatorar um trecho de código;
- quiser garantir que uma funcionalidade não quebre no futuro.

---

# Comparando os tipos de teste

| Tipo | Objetivo |
|---------|----------|
| Unitário | Testar uma função/classe isolada |
| Integração | Testar a comunicação entre partes do sistema |
| E2E | Testar o fluxo completo, como um usuário real |

---

# Exemplo prático

Imagine um serviço de pagamento.

```
Função pagar()

        │

        ▼

Teste unitário

        │

        ▼

Mock do serviço externo

        │

        ▼

Verifica retorno

        │

        ▼

Verifica se o mock

foi chamado corretamente

        │

        ▼

Relatório de cobertura
```

Nesse fluxo:

- O **teste unitário** isola a função `pagar()`.
- O **mock** substitui a chamada real ao serviço externo.
- O **coverage** mostra se a função está bem testada.

---

# Mock x Spy

É comum confundir esses dois conceitos.

| Mock | Spy |
|----------|----------|
| Substitui completamente a função | Observa a função real, sem substituí-la totalmente |
| `jest.fn()` | `jest.spyOn()` |
| Não executa a lógica original (a menos que configurado) | Pode manter a lógica original |

```typescript
const spy = jest.spyOn(console, "log");

console.log("teste");

expect(spy).toHaveBeenCalledWith("teste");
```

---

# toBe x toEqual

| toBe | toEqual |
|-----------|----------|
| Compara referência/valor primitivo | Compara valor de objetos e arrays |
| Usa `Object.is` | Compara estrutura recursivamente |
| Ideal para números, strings, booleanos | Ideal para objetos e arrays |

---

# Testes + Clean Code

Testes bem escritos seguem os mesmos princípios de Clean Code.

```typescript
// Ruim: nome genérico, não explica o cenário
it("teste 1", () => {
  expect(somar(2, 2)).toBe(4);
});
```

```typescript
// Bom: nome descreve claramente o comportamento esperado
it("deve retornar 4 ao somar 2 e 2", () => {
  expect(somar(2, 2)).toBe(4);
});
```

Nomes claros em `it`/`describe` tornam o teste também uma forma de documentação.

---

# Boas práticas

- Um teste deve validar apenas um comportamento por vez.
- Utilize nomes descritivos em `describe` e `it`.
- Prefira `toEqual` para objetos e `toBe` para primitivos.
- Isole dependências externas com mocks.
- Utilize `beforeEach` para evitar duplicação de setup.
- Não teste detalhes de implementação, teste comportamento.
- Rode os testes com frequência, principalmente antes de dar push.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Teste Unitário | Garantir que uma função/classe funciona isoladamente |
| Mock | Isolar dependências externas |
| Coverage | Medir quanto do código está coberto por testes |
| TDD | Guiar o desenvolvimento a partir dos testes (Red-Green-Refactor) |

---

# Fluxo mental

```
Preciso garantir que...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Uma função  Uma dependência  O quanto do
funciona    externa não      código está
sozinha     interfere        testado

   │        │        │

Teste     Mock/Spy   Coverage
Unitário
```

---

# Referências

- Documentação oficial do Jest: https://jestjs.io/pt-BR/
- ts-jest (suporte a TypeScript): https://kulshekhar.github.io/ts-jest/
- Testing Library (para testes de componentes React): https://testing-library.com/
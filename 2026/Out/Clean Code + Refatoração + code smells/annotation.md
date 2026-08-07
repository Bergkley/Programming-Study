# Clean Code

# Refatoração e Code Smells

O **Clean Code (Código Limpo)** é um conjunto de princípios e boas práticas que ajudam a escrever código legível, simples e fácil de manter.

**Code Smells (Cheiros de Código)** são sinais de que algo no código pode estar mal estruturado, mesmo que ainda funcione corretamente.

**Refatoração** é o processo de melhorar a estrutura interna do código **sem alterar seu comportamento externo**.

Esses três conceitos ficaram amplamente conhecidos após o livro **Clean Code: A Handbook of Agile Software Craftsmanship**, escrito por **Robert C. Martin (Uncle Bob)**, e também com o livro **Refactoring**, de **Martin Fowler**.

Os três temas mais importantes nesse contexto são:

- Clean Code
- Code Smells
- Refatoração

---

# Por que se preocupar com isso?

Imagine uma aplicação crescendo ao longo do tempo.

Sem cuidado com o código:

- funções gigantes e confusas;
- nomes de variáveis sem sentido;
- duplicação constante;
- medo de mexer no código;
- bugs difíceis de encontrar.

Com Clean Code, Refatoração e atenção aos Code Smells:

- código fácil de ler;
- fácil de testar;
- fácil de manter;
- menos bugs;
- times trabalham com mais confiança.

---

# Visão geral

```
Qualidade de Código

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Clean  Code    Refatoração
Code   Smells
```

Os três conceitos se conectam: **Code Smells** indicam o problema, **Refatoração** é a ação, e **Clean Code** é o objetivo final.

---

# O que é Clean Code?

**Clean Code** não é um padrão de projeto, mas sim um conjunto de **princípios de escrita de código**.

Seu objetivo é:

> **Escrever código que outras pessoas (e você mesmo no futuro) consigam entender facilmente.**

---

# Problema

```typescript
function calc(a: number, b: number, t: number) {

  if (t === 1) {
    return a + b;
  }

  if (t === 2) {
    return a - b;
  }

}
```

O que essa função faz? O que significa `t`? O que significa `1` e `2`?

O código até funciona, mas é **difícil de entender**.

---

# Solução

```typescript
function somar(a: number, b: number) {
  return a + b;
}

function subtrair(a: number, b: number) {
  return a - b;
}
```

Nomes claros. Funções pequenas. Responsabilidade única.

---

# Princípios de Clean Code

- **Nomes significativos**: variáveis e funções devem explicar sua intenção.
- **Funções pequenas**: cada função deve fazer apenas uma coisa.
- **Evitar comentários desnecessários**: o código deve se explicar sozinho.
- **Evitar duplicação (DRY)**: não repetir a mesma lógica.
- **Consistência**: seguir o mesmo padrão em todo o projeto.
- **Poucos parâmetros**: funções com muitos parâmetros são difíceis de usar.

---

# Exemplo

Antes:

```typescript
function verifica(u: any) {

  if (u.idade >= 18 && u.ativo === true) {
    return true;
  }

  return false;

}
```

Depois:

```typescript
interface Usuario {
  idade: number;
  ativo: boolean;
}

function usuarioPodeAcessar(usuario: Usuario): boolean {
  const maiorDeIdade = usuario.idade >= 18;
  return maiorDeIdade && usuario.ativo;
}
```

---

# Vantagens do Clean Code

- Facilita a leitura.
- Reduz o tempo de manutenção.
- Facilita a integração de novos desenvolvedores.
- Reduz a quantidade de bugs.
- Facilita testes automatizados.

---

# Quando aplicar Clean Code?

Utilize sempre que:

- estiver escrevendo código novo;
- estiver revisando um Pull Request;
- perceber que um trecho é difícil de entender;
- outra pessoa (ou você) demorar para entender o próprio código.

---

# O que são Code Smells?

**Code Smells** são indícios de que o código **pode** ter um problema de design, mesmo sem ser um erro ou bug.

Não são falhas técnicas, mas sim **sinais de alerta**.

---

# Principais Code Smells

```
Code Smell

↓

Sinal de alerta

↓

Não quebra o sistema,

mas dificulta manutenção
```

- **Código Duplicado**: mesma lógica repetida em vários lugares.
- **Função Longa**: funções que fazem várias coisas ao mesmo tempo.
- **Classe Inchada (God Class)**: uma classe que centraliza responsabilidades demais.
- **Muitos Parâmetros**: funções difíceis de chamar corretamente.
- **Nomes Ruins**: variáveis como `x`, `temp`, `dados2`.
- **Comentários Excessivos**: geralmente escondem código confuso.
- **Aninhamento Profundo**: muitos `if` dentro de `if` dentro de `if`.
- **Números Mágicos**: valores soltos no código sem explicação.

---

# Exemplo — Número Mágico

```typescript
function calcularDesconto(valor: number) {
  return valor * 0.9;
}
```

O que significa `0.9`? Fica melhor assim:

```typescript
const DESCONTO_PADRAO = 0.9;

function calcularDesconto(valor: number) {
  return valor * DESCONTO_PADRAO;
}
```

---

# Exemplo — Aninhamento Profundo

```typescript
function verificar(usuario: any) {

  if (usuario) {
    if (usuario.ativo) {
      if (usuario.idade >= 18) {
        return true;
      }
    }
  }

  return false;

}
```

Melhor com **early return**:

```typescript
function verificar(usuario: Usuario) {

  if (!usuario) return false;
  if (!usuario.ativo) return false;
  if (usuario.idade < 18) return false;

  return true;

}
```

---

# Quando identificar Code Smells?

Preste atenção quando:

- for necessário reler um trecho várias vezes para entendê-lo;
- uma função tiver mais de 20-30 linhas;
- surgir a vontade de copiar e colar código;
- existir dificuldade em nomear algo corretamente.

---

# O que é Refatoração?

**Refatoração** é a técnica de reestruturar o código interno **sem alterar seu comportamento**.

```
Código funcional

↓

Refatoração

↓

Código funcional,

porém mais limpo
```

O sistema continua funcionando exatamente igual para quem o utiliza; apenas a estrutura interna melhora.

---

# Passo a passo típico

1. Ter testes automatizados (ou validar manualmente o comportamento atual).
2. Identificar o Code Smell.
3. Aplicar uma pequena melhoria por vez.
4. Rodar os testes novamente.
5. Repetir o processo.

---

# Técnicas comuns de Refatoração

- **Extrair Função**: transformar um trecho de código em uma função nomeada.
- **Renomear Variável**: dar nomes mais claros.
- **Remover Duplicação**: unificar lógica repetida.
- **Substituir Condicional por Polimorfismo**: trocar grandes `if/switch` por classes (aqui entra o **Strategy**).
- **Extrair Classe**: dividir uma classe com responsabilidades demais.
- **Simplificar Expressões Condicionais**: reduzir complexidade de `if`.

---

# Exemplo — Extrair Função

Antes:

```typescript
function processarPedido(pedido: Pedido) {

  const total = pedido.itens.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  );

  console.log(`Total: ${total}`);

}
```

Depois:

```typescript
function calcularTotal(pedido: Pedido): number {
  return pedido.itens.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  );
}

function processarPedido(pedido: Pedido) {
  const total = calcularTotal(pedido);
  console.log(`Total: ${total}`);
}
```

---

# Vantagens da Refatoração

- Reduz a complexidade do código.
- Facilita a adição de novas funcionalidades.
- Diminui o risco de bugs futuros.
- Melhora a legibilidade sem quebrar o sistema.

---

# Quando refatorar?

Utilize quando:

- identificar um Code Smell;
- for adicionar uma nova funcionalidade em um trecho confuso;
- o código estiver difícil de testar;
- antes de um Pull Request, para deixar o código mais limpo.

**Evite** refatorar código que não será mais tocado ou sem necessidade real — refatoração deve ter um motivo.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Clean Code | Escrever código legível desde o início |
| Code Smells | Identificar sinais de problemas no código |
| Refatoração | Corrigir a estrutura sem mudar o comportamento |

---

# Exemplo prático

Imagine um sistema de pedidos.

```
Código com Code Smells

        │

        ▼

Identificar problemas

        │

        ▼

Função longa, muitos ifs,

nomes ruins

        │

        ▼

Refatoração

↓

Extrair funções

↓

Renomear variáveis

↓

Remover duplicação

        │

        ▼

Código limpo (Clean Code)

        │

        ▼

Fácil manutenção
```

Nesse fluxo:

- **Code Smells** apontam o que está ruim.
- **Refatoração** é a ação de corrigir.
- **Clean Code** é o resultado final desejado.

---

# Code Smells x Bugs

É comum confundir esses dois conceitos.

| Code Smell | Bug |
|----------|----------|
| Código funciona, mas é mal estruturado | Código não funciona corretamente |
| Problema de design/legibilidade | Problema de comportamento |
| Não gera erro imediato | Gera erro ou resultado incorreto |

---

# Refatoração x Reescrita

| Refatoração | Reescrita |
|-----------|----------|
| Muda a estrutura interna | Muda tudo, do zero |
| Comportamento permanece igual | Comportamento pode mudar |
| Passos pequenos e seguros | Alto risco |
| Mais rápida e segura | Mais demorada e arriscada |

---

# Clean Code + Design Patterns

É comum utilizar Clean Code junto com padrões de projeto durante a refatoração.

```typescript
// Code smell: vários "if" para calcular pagamento
function calcular(tipo: string, valor: number) {

  if (tipo === "pix") return valor;
  if (tipo === "cartao") return valor * 1.05;

}
```

```typescript
// Refatorado com Strategy
interface Pagamento {
  calcular(valor: number): number;
}

class Pix implements Pagamento {
  calcular(valor: number) {
    return valor;
  }
}

class Cartao implements Pagamento {
  calcular(valor: number) {
    return valor * 1.05;
  }
}
```

A refatoração eliminou o Code Smell aplicando o padrão **Strategy**, resultando em código mais limpo.

---

# Boas práticas

- Escreva pensando em quem vai ler o código depois.
- Refatore em pequenos passos, testando sempre.
- Não misture refatoração com criação de novas funcionalidades no mesmo commit/PR.
- Nomeie bem desde o início — evita retrabalho.
- Combine Clean Code com Design Patterns quando fizer sentido.
- Refatore com propósito, não por perfeccionismo.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Clean Code | Legibilidade e manutenibilidade do código |
| Code Smells | Identificação de problemas estruturais |
| Refatoração | Melhoria da estrutura sem quebrar comportamento |

---

# Fluxo mental

```
Meu código está...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Difícil   Com sinal   Precisando
de ler    de alerta   de melhoria

   │        │        │

Clean   Code       Refatoração
Code    Smell
```

---

# Referências

- Clean Code: A Handbook of Agile Software Craftsmanship — Robert C. Martin (Uncle Bob)
- Refactoring: Improving the Design of Existing Code — Martin Fowler
- Refactoring Guru — Code Smells: https://refactoring.guru/refactoring/smells
- Refactoring Guru — Techniques: https://refactoring.guru/refactoring/techniques
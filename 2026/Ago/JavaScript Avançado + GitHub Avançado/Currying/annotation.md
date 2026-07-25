# JavaScript Avançado

## Currying

**Currying** é uma técnica de programação funcional que transforma uma função que recebe **vários argumentos** em uma sequência de funções que recebem **apenas um argumento por vez**.

Em vez de chamar uma função passando todos os parâmetros de uma só vez, cada chamada retorna uma nova função que recebe o próximo argumento.

Essa técnica facilita a reutilização de código, a criação de funções mais específicas e a composição de funções.

---

## Sem Currying

Considere uma função que soma três números:

```javascript
function soma(a, b, c) {
  return a + b + c;
}

console.log(soma(10, 20, 30)); // 60
```

Todos os argumentos precisam ser passados na mesma chamada.

---

## Com Currying

Utilizando Currying, a função é dividida em várias funções menores:

```javascript
function soma(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

console.log(soma(10)(20)(30)); // 60
```

Cada função recebe apenas um argumento e retorna outra função até possuir todas as informações necessárias para executar o cálculo.

---

## Utilizando Arrow Functions

Uma forma mais comum de escrever Currying em JavaScript moderno é utilizando Arrow Functions:

```javascript
const soma = (a) => (b) => (c) => a + b + c;

console.log(soma(10)(20)(30)); // 60
```

Esse formato é bastante utilizado em bibliotecas de programação funcional.

---

## Exemplo prático

Imagine uma função para calcular descontos.

Sem Currying:

```javascript
function aplicarDesconto(desconto, valor) {
  return valor - valor * desconto;
}

console.log(aplicarDesconto(0.1, 500)); // 450
```

Se você precisar aplicar sempre o mesmo desconto, terá que informar o percentual todas as vezes.

Com Currying:

```javascript
const aplicarDesconto = (desconto) => (valor) =>
  valor - valor * desconto;

const desconto10 = aplicarDesconto(0.10);
const desconto20 = aplicarDesconto(0.20);

console.log(desconto10(500)); // 450
console.log(desconto10(1000)); // 900

console.log(desconto20(500)); // 400
```

Agora foi possível criar funções especializadas:

- `desconto10`
- `desconto20`

Cada uma reutiliza o percentual informado anteriormente.

---

## Outro exemplo

Criando uma função de saudação:

```javascript
const saudacao = (cumprimento) => (nome) =>
  `${cumprimento}, ${nome}!`;

const bomDia = saudacao("Bom dia");
const boaNoite = saudacao("Boa noite");

console.log(bomDia("Maria"));
// Bom dia, Maria!

console.log(boaNoite("João"));
// Boa noite, João!
```

Observe que o cumprimento foi definido apenas uma vez.

---

## Currying vs Função comum

### Função comum

```javascript
const multiplicar = (a, b) => a * b;

multiplicar(5, 10);
```

### Currying

```javascript
const multiplicar = (a) => (b) => a * b;

multiplicar(5)(10);
```

A versão com Currying permite reutilizar parte da função:

```javascript
const dobrar = multiplicar(2);

console.log(dobrar(8)); // 16
console.log(dobrar(20)); // 40
console.log(dobrar(100)); // 200
```

---

## Vantagens

- Reutilização de código.
- Criação de funções mais específicas.
- Facilita a composição de funções.
- Reduz repetição de parâmetros.
- Muito utilizada em programação funcional.

---

## Quando usar?

O Currying é indicado quando:

- Você utiliza frequentemente os mesmos argumentos.
- Deseja criar funções reutilizáveis a partir de funções genéricas.
- Está trabalhando com bibliotecas funcionais, como **Ramda** ou **Lodash FP**.
- Quer tornar a composição de funções mais simples.

---

## Quando NÃO usar?

Nem toda função precisa ser transformada em uma função curried.

Evite utilizar Currying quando:

- A função é simples e usada apenas uma vez.
- O código fica mais difícil de ler do que a versão tradicional.
- Não existe benefício em reutilizar argumentos parcialmente.

O objetivo é tornar o código mais reutilizável, e não mais complexo.

---

## Resumo

| Função comum | Currying |
|--------------|----------|
| Recebe todos os argumentos de uma vez | Recebe um argumento por chamada |
| `soma(1, 2, 3)` | `soma(1)(2)(3)` |
| Menos reutilizável | Permite criar funções especializadas |
| Mais simples para casos básicos | Excelente para programação funcional |

---

## Referências

- Vídeo: https://www.youtube.com/watch?v=rec4I8zfYjc
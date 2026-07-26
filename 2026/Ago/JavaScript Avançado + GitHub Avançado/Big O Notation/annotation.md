# JavaScript Avançado

# Big O Notation

A **Big O Notation (Notação Big O)** é uma forma de medir a **complexidade de um algoritmo**, indicando como seu tempo de execução ou consumo de memória cresce conforme a quantidade de dados aumenta.

Ela **não mede exatamente quantos segundos um algoritmo demora**, mas sim **como ele escala** quando o volume de dados aumenta.

A Notação Big O é amplamente utilizada para comparar algoritmos e escolher a solução mais eficiente para um determinado problema.

---

# Por que aprender Big O?

Imagine que você possui um algoritmo que funciona muito bem com 100 registros.

Mas e se o sistema passar a processar:

- 1.000 registros?
- 100.000 registros?
- 10 milhões de registros?

Um algoritmo ineficiente pode deixar uma aplicação lenta, consumir muita memória e até tornar o sistema inutilizável.

A Big O ajuda justamente a prever esse comportamento.

---

# Complexidade de Tempo x Complexidade de Espaço

Existem dois tipos principais de análise.

## Complexidade de Tempo

Mede **quanto o tempo de execução aumenta para executar uma tarefa** conforme a entrada cresce.

Exemplo:

```javascript
const numeros = [1, 2, 3, 4, 5];

for (const numero of numeros) {
  console.log(numero);
}
```

Quanto maior o array, mais iterações serão realizadas.

---

## Complexidade de Espaço

Mede **quanto de memória é consumida para poder executar essa tarefa** o algoritmo precisa.

Exemplo:

```javascript
function copiarArray(array) {
  const copia = [];

  for (const item of array) {
    copia.push(item);
  }

  return copia;
}
```

Quanto maior o array original, maior será o espaço ocupado pela cópia.

---

# Principais complexidades

## O(1) — Constante

O algoritmo sempre executa praticamente a mesma quantidade de operações, independentemente do tamanho da entrada.

```javascript
const numeros = [10, 20, 30, 40];

console.log(numeros[0]);
```

Mesmo que o array tenha milhões de elementos, acessar um índice específico continua sendo uma operação constante.

```
Entrada

10
100
1000
100000

Tempo

█
█
█
█
```

✅ Excelente desempenho.

---

## O(log n) — Logarítmica

A cada passo, metade dos dados é descartada.

O exemplo clássico é a **Busca Binária (Binary Search)**.

Imagine procurar um número em um array ordenado:

```
1 2 3 4 5 6 7 8 9 10
```

Você verifica o elemento do meio.

Se o número procurado for maior, elimina toda a metade esquerda.

Depois faz o mesmo novamente.

A quantidade de verificações cresce muito lentamente.

```
1024 elementos

↓

512

↓

256

↓

128

↓

64
```

Esse crescimento é muito eficiente.

---

## O(n) — Linear

O número de operações cresce proporcionalmente à quantidade de elementos.

```javascript
const numeros = [1, 2, 3, 4];

for (const numero of numeros) {
  console.log(numero);
}
```

Se o array dobrar de tamanho, o número de iterações também dobra.

```
10 elementos → 10 operações

100 elementos → 100 operações

1000 elementos → 1000 operações
```

---

## O(n log n)

É muito comum em algoritmos eficientes de ordenação, como:

- Merge Sort
- Heap Sort
- Quick Sort (caso médio)

Exemplo:

```javascript
const numeros = [4, 2, 7, 1];

numeros.sort((a, b) => a - b);
```

Embora a implementação interna do `sort()` varie conforme o mecanismo JavaScript (V8, SpiderMonkey, JavaScriptCore etc.), algoritmos de ordenação eficientes costumam apresentar complexidade média de **O(n log n)**.

---

## O(n²) — Quadrática

Ocorre quando existe um laço dentro de outro.

```javascript
const numeros = [1, 2, 3];

for (const a of numeros) {
  for (const b of numeros) {
    console.log(a, b);
  }
}
```

Quantidade de operações:

```
3 elementos → 9 operações

10 elementos → 100 operações

100 elementos → 10.000 operações
```

Esse crescimento acontece muito rapidamente.

---

## O(2ⁿ) — Exponencial

Cada novo elemento praticamente dobra o trabalho realizado.

Exemplo clássico:

```javascript
function fibonacci(n) {
  if (n <= 1) return n;

  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

Para valores pequenos funciona bem.

Para valores maiores, o número de chamadas cresce exponencialmente.

---

## O(n!)

É uma das piores complexidades.

Aparece em problemas envolvendo todas as permutações possíveis.

Exemplo:

```javascript
function permutacoes(array) {
  // gera todas as permutações
}
```

Quantidade aproximada:

```
5 elementos → 120 possibilidades

10 elementos → 3.628.800 possibilidades
```

---

# Comparando as complexidades

| Complexidade | Nome | Desempenho |
|---------------|------|------------|
| **O(1)** | Constante | ⭐ Excelente |
| **O(log n)** | Logarítmica | ⭐ Excelente |
| **O(n)** | Linear | ✅ Boa |
| **O(n log n)** | Linearítmica | ✅ Boa |
| **O(n²)** | Quadrática | ⚠️ Pode ficar lenta |
| **O(2ⁿ)** | Exponencial | ❌ Muito lenta |
| **O(n!)** | Fatorial | ❌ Extremamente lenta |

---

# Comparação visual

```
Tempo
^

|
|                                   O(n!)
|                              *
|                           *
|                        *
|                    O(2ⁿ)
|                 *
|              *
|          O(n²)
|        *
|      *
|    O(n log n)
|   *
|  O(n)
| *
|O(log n)
|______________________________> Entrada
 O(1)
```

Quanto mais "reta" for a curva, melhor o algoritmo escala.

---

# Exemplos do dia a dia em JavaScript

## Acesso a um índice

```javascript
const frutas = ["Maçã", "Banana", "Uva"];

console.log(frutas[2]);
```

Complexidade:

```
O(1)
```

---

## Procurando um elemento

```javascript
const frutas = ["Maçã", "Banana", "Uva"];

frutas.includes("Uva");
```

No pior caso, será necessário percorrer todo o array.

```
O(n)
```

---

## Encontrando um objeto

```javascript
const usuarios = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
];

usuarios.find((usuario) => usuario.id === 3);
```

Também possui complexidade linear.

```
O(n)
```

---

## Dois loops

```javascript
for (const usuario of usuarios) {
  for (const pedido of pedidos) {
    console.log(usuario, pedido);
  }
}
```

Complexidade:

```
O(n²)
```

---

# Dicas para melhorar a performance

- Evite loops aninhados quando possível.
- Utilize estruturas de dados adequadas, como `Map` e `Set`, para buscas rápidas.
- Evite recalcular valores que podem ser armazenados em cache.
- Escolha algoritmos eficientes para ordenação e busca.
- Meça o desempenho apenas quando houver necessidade; nem sempre o algoritmo mais complexo é um problema em conjuntos de dados pequenos.

---

# Mito comum

> **"Big O mede o tempo em segundos."**

Isso é um mito.

A Big O mede **como o algoritmo cresce** em relação ao tamanho da entrada, não o tempo exato de execução.

Dois algoritmos com complexidade **O(n)** podem ter tempos diferentes, mas ambos crescem de forma proporcional ao aumento dos dados.

---

# Resumo

| Complexidade | Exemplo em JavaScript |
|---------------|----------------------|
| **O(1)** | `array[0]` |
| **O(log n)** | Busca binária |
| **O(n)** | `find()`, `includes()`, `for` |
| **O(n log n)** | Algoritmos eficientes de ordenação |
| **O(n²)** | Dois `for` aninhados |
| **O(2ⁿ)** | Fibonacci recursivo ingênuo |
| **O(n!)** | Permutações |

---

# Quando se preocupar?

Nem todo algoritmo precisa ser otimizado.

Em muitos casos:

- Um algoritmo `O(n)` é suficiente.
- Um `O(n²)` pode ser aceitável para poucos elementos.
- A legibilidade do código pode ser mais importante do que uma pequena otimização.

O ideal é buscar um equilíbrio entre **clareza**, **manutenibilidade** e **performance**.

---

# Referências

- Documentação MDN - Performance: https://developer.mozilla.org/pt-BR/docs/Web/Performance
- Visualgo (visualização de algoritmos): https://visualgo.net
- Big-O Cheat Sheet: https://www.bigocheatsheet.com/
- Vídeo: https://www.youtube.com/watch?v=WUmAAxH9n-A
# JavaScript Avançado

# `this`, `bind`, `call` e `apply`

Em JavaScript, a palavra-chave **`this`** representa o **contexto de execução** de uma função, ou seja, o objeto ao qual ela está associada no momento em que é chamada.

Entender o funcionamento do `this` é essencial para utilizar corretamente os métodos **`bind`**, **`call`** e **`apply`**, que permitem controlar explicitamente esse contexto.

---

# O que é o `this`?

O valor de `this` **não depende de onde a função foi criada**, mas sim **de como ela é chamada**.

Veja o exemplo:

```javascript
const pessoa = {
  nome: "João",

  apresentar() {
    console.log(`Olá, meu nome é ${this.nome}`);
  },
};

pessoa.apresentar();
```

Saída:

```text
Olá, meu nome é João
```

Nesse caso, `this` aponta para o objeto `pessoa`.

---

# Exemplo sem contexto

```javascript
const pessoa = {
  nome: "João",

  apresentar() {
    console.log(this.nome);
  },
};

const apresentar = pessoa.apresentar;

apresentar();
```

Saída (modo estrito):

```text
undefined
```

Ou em alguns ambientes:

```text
TypeError
```

Isso acontece porque a função foi executada **sem um objeto associado**, fazendo com que o `this` perca sua referência original.

---

# Como o `this` funciona?

O valor de `this` depende da forma como a função é chamada.

| Chamada | Valor de `this` |
|----------|-----------------|
| `obj.metodo()` | `obj` |
| Função comum | `undefined` (modo estrito) ou objeto global |
| `new Funcao()` | Nova instância criada |
| Arrow Function | Herda o `this` do escopo externo |
| `call`, `apply` ou `bind` | Definido manualmente |

---

# Arrow Functions

Arrow Functions **não possuem seu próprio `this`**.

Elas utilizam o `this` do escopo onde foram criadas.

```javascript
const pessoa = {
  nome: "Maria",

  falar() {
    const mensagem = () => {
      console.log(this.nome);
    };

    mensagem();
  },
};

pessoa.falar();
```

Saída:

```text
Maria
```

Nesse exemplo, a Arrow Function herda o `this` do método `falar`.

---

# O método `call()`

O método `call()` executa uma função imediatamente, permitindo definir qual será o valor de `this`.

Sintaxe:

```javascript
funcao.call(thisArg, arg1, arg2, arg3);
```

---

## Exemplo

```javascript
function apresentar(cidade) {
  console.log(`${this.nome} mora em ${cidade}`);
}

const pessoa = {
  nome: "Carlos",
};

apresentar.call(pessoa, "Fortaleza");
```

Saída:

```text
Carlos mora em Fortaleza
```

O primeiro argumento é o objeto que será utilizado como `this`.

Os demais argumentos são passados normalmente.

---

# O método `apply()`

O `apply()` funciona praticamente igual ao `call()`.

A diferença é que os argumentos são enviados em um **array**.

Sintaxe:

```javascript
funcao.apply(thisArg, [arg1, arg2]);
```

---

## Exemplo

```javascript
function apresentar(cidade, estado) {
  console.log(`${this.nome} mora em ${cidade} - ${estado}`);
}

const pessoa = {
  nome: "Ana",
};

apresentar.apply(pessoa, ["Fortaleza", "CE"]);
```

Saída:

```text
Ana mora em Fortaleza - CE
```

---

# Diferença entre `call()` e `apply()`

### call()

Argumentos separados.

```javascript
funcao.call(objeto, arg1, arg2);
```

---

### apply()

Argumentos dentro de um array.

```javascript
funcao.apply(objeto, [arg1, arg2]);
```

---

# O método `bind()`

O `bind()` também permite definir o valor de `this`.

A principal diferença é que **ele não executa a função imediatamente**.

Ele retorna uma **nova função** com o `this` fixado.

Sintaxe:

```javascript
const novaFuncao = funcao.bind(thisArg);
```

---

## Exemplo

```javascript
const pessoa = {
  nome: "Pedro",
};

function apresentar() {
  console.log(this.nome);
}

const apresentarPedro = apresentar.bind(pessoa);

apresentarPedro();
```

Saída:

```text
Pedro
```

Observe que `bind()` cria uma nova função.

---

## Outro exemplo

Imagine um botão em uma página HTML.

```javascript
class Contador {
  constructor() {
    this.valor = 0;
  }

  incrementar() {
    this.valor++;
    console.log(this.valor);
  }
}

const contador = new Contador();

setTimeout(contador.incrementar, 1000);
```

Resultado:

```text
undefined
```

Isso acontece porque o método perdeu o contexto.

A solução:

```javascript
setTimeout(contador.incrementar.bind(contador), 1000);
```

Agora o método será executado corretamente.

---

# Comparação entre `call`, `apply` e `bind`

| Método | Executa imediatamente? | Argumentos | Retorna |
|----------|-----------------------|------------|----------|
| `call()` | ✅ Sim | Separados | Resultado da função |
| `apply()` | ✅ Sim | Array | Resultado da função |
| `bind()` | ❌ Não | Separados (opcionalmente no bind) | Nova função |

---

# Exemplo comparando os três

```javascript
function saudacao(cidade) {
  console.log(`${this.nome} mora em ${cidade}`);
}

const pessoa = {
  nome: "Lucas",
};

// Executa imediatamente
saudacao.call(pessoa, "Recife");

// Executa imediatamente
saudacao.apply(pessoa, ["Recife"]);

// Retorna uma nova função
const apresentar = saudacao.bind(pessoa);

apresentar("Recife");
```

Todos produzem:

```text
Lucas mora em Recife
```

A diferença está **na forma de execução**.

---

# Quando usar cada um?

## Use `call()`

- Quando deseja executar a função imediatamente.
- Quando possui poucos argumentos.

```javascript
funcao.call(objeto, arg1, arg2);
```

---

## Use `apply()`

- Quando os argumentos já estão em um array.

```javascript
funcao.apply(objeto, argumentos);
```

---

## Use `bind()`

- Quando deseja reutilizar a função depois.
- Em callbacks e eventos.
- Para evitar a perda do contexto (`this`).

```javascript
const novaFuncao = funcao.bind(objeto);
```

---

# Resumo

| Recurso | Finalidade |
|----------|------------|
| `this` | Representa o contexto de execução da função. |
| `call()` | Executa a função imediatamente com um `this` definido. |
| `apply()` | Igual ao `call()`, mas recebe os argumentos em um array. |
| `bind()` | Retorna uma nova função com o `this` permanentemente associado. |
| Arrow Function | Não possui `this` próprio; utiliza o do escopo externo. |

---

# Fluxo mental

```
Preciso mudar o this?

        │
        ▼
Executar agora?
        │
   ┌────┴────┐
   │         │
  Sim       Não
   │         │
   ▼         ▼
Argumentos   bind()
em array?
   │
 ┌─┴──┐
 │    │
Sim  Não
 │     │
 ▼     ▼
apply() call()
```

---

# Boas práticas

- Evite armazenar métodos em variáveis sem considerar o contexto de `this`.
- Prefira Arrow Functions quando quiser preservar o `this` do escopo externo.
- Utilize `bind()` em callbacks (`setTimeout`, `setInterval`, eventos etc.) quando precisar manter o contexto.
- Escolha entre `call()` e `apply()` conforme a forma como os argumentos já estão disponíveis.

---

# Referências
- Vídeo: https://www.youtube.com/watch?v=wjMCSsfx9kg
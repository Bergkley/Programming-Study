Aqui está uma versão mais completa, organizada e didática do seu arquivo Markdown:

# JavaScript — Async e Await

## O que são `async` e `await`?

`async` e `await` são recursos (sintaxe) do JavaScript que facilitam o trabalho com operações assíncronas (promise), tornando o código mais legível e próximo de um código síncrono.

Esses recursos foram introduzidos no **ES2017 (ES8)** e são construídos sobre **Promises**.

---

## O que é uma função `async`?

Uma função declarada com a palavra-chave `async` sempre retorna uma **Promise**, mesmo que o valor retornado não seja uma Promise.

### Exemplo

```javascript
async function saudacao() {
  return "Olá!";
}

saudacao().then(console.log);
// Olá!
```

---

## O que faz o `await`?

A palavra-chave `await` faz com que a execução da função espere até que uma Promise seja resolvida ou rejeitada.

> O `await` só pode ser utilizado dentro de funções `async` (exceto em módulos JavaScript que suportam Top-Level Await).

### Exemplo

```javascript
function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function executar() {
  console.log("Início");

  await esperar(2000);

  console.log("Fim");
}

executar();
```

**Saída:**

```
Início
(2 segundos depois)
Fim
```

---

## Consumindo uma API

Um dos usos mais comuns de `async` e `await` é fazer requisições HTTP.

```javascript
async function buscarUsuario() {
  const resposta = await fetch(
    "https://jsonplaceholder.typicode.com/users/1"
  );

  const usuario = await resposta.json();

  console.log(usuario);
}

buscarUsuario();
```

---

## Tratando erros

Sempre que possível, utilize `try...catch` para capturar erros durante operações assíncronas.

```javascript
async function buscarDados() {
  try {
    const resposta = await fetch("https://api.exemplo.com/dados");

    if (!resposta.ok) {
      throw new Error("Erro ao buscar dados");
    }

    const dados = await resposta.json();

    console.log(dados);
  } catch (erro) {
    console.error("Erro:", erro.message);
  }
}
```

---

## Async/Await vs `.then()`

### Utilizando `.then()`

```javascript
fetch("/usuarios")
  .then((resposta) => resposta.json())
  .then((dados) => {
    console.log(dados);
  })
  .catch((erro) => {
    console.error(erro);
  });
```

### Utilizando `async/await`

```javascript
async function buscarUsuarios() {
  try {
    const resposta = await fetch("/usuarios");
    const dados = await resposta.json();

    console.log(dados);
  } catch (erro) {
    console.error(erro);
  }
}
```

O código com `async/await` costuma ser mais fácil de ler, principalmente quando existem várias operações assíncronas encadeadas.

---

## Boas práticas

- Utilize `try...catch` para tratar erros.
- Evite usar `await` quando as operações podem ocorrer em paralelo.
- Quando possível, utilize `Promise.all()` para executar várias Promises simultaneamente.
- Dê nomes claros para funções assíncronas (`buscarUsuarios`, `salvarPedido`, etc.).
- Evite misturar `.then()` e `await` na mesma lógica, salvo quando houver necessidade.

### Exemplo com `Promise.all()`

```javascript
async function buscarTudo() {
  const [usuarios, produtos] = await Promise.all([
    fetch("/usuarios").then((r) => r.json()),
    fetch("/produtos").then((r) => r.json()),
  ]);

  console.log(usuarios);
  console.log(produtos);
}
```

---

## Resumo

- `async` transforma uma função em uma função que retorna uma Promise.
- `await` pausa a execução até que a Promise seja resolvida.
- `try...catch` é a forma recomendada para tratar erros.
- `async/await` melhora a legibilidade do código assíncrono.
- `Promise.all()` permite executar várias operações em paralelo.

---

## Referências
- Vídeo: https://www.youtube.com/watch?v=WUmAAxH9n-A



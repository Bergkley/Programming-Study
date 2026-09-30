# 🚀 Desafio React — `React.memo` e `useMemo`

## 🎯 Objetivo

Praticar o uso de:

- `useMemo`
- `React.memo`
- Array de dependências
- Otimização de renderizações

## 🧩 Código inicial

Você recebeu uma aplicação de uma pequena loja:

```jsx
import React, { useMemo, useState } from 'react';

const produtosIniciais = [
  { id: 1, nome: 'Notebook', preco: 3500 },
  { id: 2, nome: 'Mouse', preco: 100 },
  { id: 3, nome: 'Teclado', preco: 250 },
  { id: 4, nome: 'Monitor', preco: 1200 },
  { id: 5, nome: 'Headset', preco: 300 },
];

function Produto({ produto }) {
  console.log('Renderizou:', produto.nome);

  return (
    <li>
      {produto.nome} - R$ {produto.preco}
    </li>
  );
}

function App() {
  const [count, setCount] = useState(0);
  const [busca, setBusca] = useState('');
  const [produtos, setProdutos] = useState(produtosIniciais);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const total = produtosFiltrados.reduce(
    (soma, produto) => soma + produto.preco,
    0
  );

  function adicionarProduto() {
    const novoProduto = {
      id: produtos.length + 1,
      nome: 'Câmera',
      preco: 1800,
    };

    setProdutos([...produtos, novoProduto]);
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Loja</h1>

      <button onClick={() => setCount(count + 1)}>
        Contador: {count}
      </button>

      <button onClick={adicionarProduto}>
        Adicionar produto
      </button>

      <br />
      <br />

      <input
        type="text"
        placeholder="Buscar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <h2>Total: R$ {total}</h2>

      <ul>
        {produtosFiltrados.map((produto) => (
          <Produto key={produto.id} produto={produto} />
        ))}
      </ul>
    </div>
  );
}

export default App;
```

## 📋 Desafio

Utilize `useMemo` e `React.memo` para melhorar a performance da aplicação.
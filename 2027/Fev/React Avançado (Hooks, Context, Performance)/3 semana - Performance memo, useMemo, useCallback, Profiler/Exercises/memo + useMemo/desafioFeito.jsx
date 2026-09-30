import React, { useMemo, useState } from "react";

const produtosIniciais = [
  { id: 1, nome: "Notebook", preco: 3500 },
  { id: 2, nome: "Mouse", preco: 100 },
  { id: 3, nome: "Teclado", preco: 250 },
  { id: 4, nome: "Monitor", preco: 1200 },
  { id: 5, nome: "Headset", preco: 300 },
];


function ProdutoComponents({ produto }) {
  console.log("Renderizou:", produto.nome);

  return (
    <li>
      {produto.nome} - R$ {produto.preco}
    </li>
  );
}

const Produto = React.memo(ProdutoComponents);

function App() {
  const [count, setCount] = useState(0);
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState(produtosIniciais);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase()),
    );
  }, [busca, produtos]);

  const total = useMemo(() => {
    return produtosFiltrados.reduce((soma, produto) => soma + produto.preco, 0);
  }, [produtosFiltrados]);

  function adicionarProduto() {
    const novoProduto = {
      id: produtos.length + 1,
      nome: "Câmera",
      preco: 1800,
    };

    setProdutos([...produtos, novoProduto]);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Loja</h1>

      <button onClick={() => setCount(count + 1)}>Contador: {count}</button>

      <button onClick={adicionarProduto}>Adicionar produto</button>

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

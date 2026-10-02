# React.memo, useMemo

# + useCallback

`React.memo`, `useMemo` e `useCallback` são as três ferramentas de **otimização de performance** mais utilizadas no React. Todas resolvem o mesmo problema de fundo — **evitar trabalho desnecessário** — mas atuam em pontos diferentes do ciclo de renderização.

Os três pilares principais desse tema são:

- `React.memo`: evita que um **componente** renderize de novo sem necessidade.
- `useMemo`: evita que um **valor calculado** seja recalculado sem necessidade.
- `useCallback`: evita que uma **função** seja recriada sem necessidade.

---

# Por que isso importa?

Imagine uma aplicação React crescendo, com listas grandes, cálculos pesados e muitos componentes filhos.

Sem essas ferramentas (ou usadas incorretamente):

- componentes "caros" renderizando a cada pequena mudança de estado;
- cálculos pesados sendo refeitos a cada renderização, mesmo sem necessidade;
- funções recriadas a cada render, quebrando otimizações de componentes filhos;
- aplicação ficando perceptivelmente lenta conforme cresce.

Usando corretamente:

- componentes só renderizam quando realmente precisam;
- cálculos custosos só rodam quando seus dados de entrada mudam;
- funções mantêm a mesma referência entre renders, permitindo otimizações em cascata;
- performance previsível, mesmo em telas complexas.

---

# Visão geral

```
Otimização de Performance

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

React.memo useMemo  useCallback

(componente) (valor)  (função)
```

---

# Pré-requisito — Igualdade por referência

Para entender por que essas três ferramentas existem, é preciso entender como o JavaScript compara valores.

```typescript
const a = { nome: "Sheila" };
const b = { nome: "Sheila" };

console.log(a === b); // false
```

Mesmo com o **mesmo conteúdo**, `a` e `b` são objetos **diferentes na memória** — o React compara props, dependências e valores por **referência**, não por conteúdo.

```
Objetos e funções

criados dentro de um componente

↓

Uma "nova instância" é criada

a cada renderização

↓

O React enxerga como

"diferente", mesmo sendo

visualmente igual
```

Esse é o motivo de existir `React.memo`, `useMemo` e `useCallback`.

---

# O que é React.memo?

`React.memo` é uma função de **ordem superior** que envolve um componente, fazendo o React **comparar as props** antes de decidir se deve renderizá-lo novamente.

```typescript
const Produto = React.memo(function Produto({ nome, preco }: Props) {
  console.log("Produto renderizou:", nome);
  return <div>{nome} - R$ {preco}</div>;
});
```

```
Componente pai renderiza

↓

React.memo compara

as props novas com as antigas

↓

Props iguais?

   │           │
  Sim          Não

   ▼            ▼

Não            Renderiza
renderiza      novamente
de novo
```

---

# Problema — Sem React.memo

```typescript
function ListaProdutos({ produtos }: { produtos: Produto[] }) {

  const [busca, setBusca] = useState("");

  return (
    <div>
      <input value={busca} onChange={(e) => setBusca(e.target.value)} />
      {produtos.map((produto) => (
        <Produto key={produto.id} nome={produto.nome} preco={produto.preco} />
      ))}
    </div>
  );

}
```

A cada letra digitada no campo de busca, `busca` muda, `ListaProdutos` re-renderiza, e **todos os `Produto`** re-renderizam junto — mesmo que `produtos` não tenha mudado.

---

# Solução — Com React.memo

```typescript
const Produto = React.memo(function Produto({ nome, preco }: Props) {
  console.log("Produto renderizou:", nome);
  return <div>{nome} - R$ {preco}</div>;
});
```

Agora, como as props `nome` e `preco` de cada `Produto` continuam as mesmas, o `React.memo` impede a renderização desnecessária, mesmo com `ListaProdutos` renderizando novamente.

---

# Comparação customizada no React.memo

Por padrão, `React.memo` faz uma comparação **rasa** (shallow) das props. É possível customizar essa comparação:

```typescript
const Produto = React.memo(
  function Produto({ produto }: { produto: Produto }) {
    return <div>{produto.nome}</div>;
  },
  (propsAnteriores, propsNovas) => {
    return propsAnteriores.produto.id === propsNovas.produto.id;
  }
);
```

Retornar `true` significa **"as props são iguais, não renderize"**; retornar `false` significa **"renderize novamente"** — o inverso do que normalmente se espera de uma função de comparação.

---

# Quando usar React.memo?

Utilize quando:

- o componente renderiza com **frequência**, mas suas props **mudam raramente**;
- o componente é **custoso** de renderizar (listas grandes, cálculos visuais complexos);
- o componente recebe **props simples** (primitivos ou objetos/funções já memorizados).

**Evite** quando:

- o componente é simples e barato de renderizar — o custo da comparação pode superar o ganho;
- as props mudam a quase toda renderização de qualquer forma (o `memo` não tem efeito nesse caso).

---

# O que é useMemo?

`useMemo` memoriza o **resultado de um cálculo**, recalculando apenas quando uma das dependências listadas mudar.

```typescript
const valor = useMemo(() => calcular(a, b), [a, b]);
```

```
Renderização acontece

↓

Dependências mudaram

desde a última vez?

   │           │
  Sim          Não

   ▼            ▼

Recalcula    Reutiliza o
o valor      valor anterior
```

---

# Problema — Cálculo custoso repetido

```typescript
function ListaProdutos({ produtos, filtro }: Props) {

  const [paginaAtual, setPaginaAtual] = useState(1);

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // recalculado mesmo ao apenas trocar de página,
  // sem "produtos" ou "filtro" terem mudado

}
```

---

# Solução

```typescript
const produtosFiltrados = useMemo(() => {
  return produtos.filter((p) =>
    p.nome.toLowerCase().includes(filtro.toLowerCase())
  );
}, [produtos, filtro]);
```

Agora, trocar de página (`paginaAtual`) não dispara o recálculo do filtro, já que `produtos` e `filtro` continuam os mesmos.

---

# useMemo para manter a referência de um objeto

Além de cálculos pesados, `useMemo` também é usado para **evitar que um objeto mude de referência** a cada renderização — especialmente importante ao passar esse objeto como prop para um componente otimizado com `React.memo`.

```typescript
const estiloCard = useMemo(
  () => ({ padding: 16, borderRadius: 8 }),
  []
);

return <CardMemoizado estilo={estiloCard} />;
```

Sem o `useMemo`, um **novo objeto** `{ padding: 16, borderRadius: 8 }` seria criado a cada render, fazendo o `React.memo` do `CardMemoizado` considerar a prop "diferente" e renderizar de novo, mesmo sem mudança real.

---

# O que é useCallback?

`useCallback` é equivalente ao `useMemo`, mas memoriza uma **função** em vez de um valor calculado.

```typescript
const funcaoMemorizada = useCallback(() => {
  fazerAlgo(a, b);
}, [a, b]);
```

Na prática, isso é o mesmo que:

```typescript
const funcaoMemorizada = useMemo(() => {
  return () => fazerAlgo(a, b);
}, [a, b]);
```

`useCallback(fn, deps)` é um **atalho** para `useMemo(() => fn, deps)`.

---

# Problema — Função recriada quebrando o React.memo

```typescript
function Pai() {

  const [contador, setContador] = useState(0);

  const handleClick = () => {
    console.log("Clicado");
  };

  return (
    <div>
      <button onClick={() => setContador((c) => c + 1)}>
        {contador}
      </button>
      <FilhoMemoizado onClick={handleClick} />
    </div>
  );

}

const FilhoMemoizado = React.memo(function Filho({ onClick }: Props) {
  console.log("Filho renderizou");
  return <button onClick={onClick}>Clique</button>;
});
```

Mesmo com `React.memo`, `FilhoMemoizado` **renderiza de novo** a cada clique no contador — porque `handleClick` é uma **função nova** a cada renderização de `Pai`, e o `React.memo` enxerga isso como "prop diferente".

---

# Solução

```typescript
const handleClick = useCallback(() => {
  console.log("Clicado");
}, []);
```

Agora `handleClick` mantém a **mesma referência** entre renderizações (já que não depende de nada que mude), permitindo que `React.memo` realmente evite a renderização de `FilhoMemoizado`.

---

# useMemo x useCallback — resumo visual

```
useMemo(() => valor, deps)

↓

memoriza o RESULTADO

useCallback(fn, deps)

↓

memoriza a PRÓPRIA FUNÇÃO

(equivalente a useMemo(() => fn, deps))
```

| useMemo | useCallback |
|----------|----------|
| Memoriza o **resultado** de uma função | Memoriza a **referência** de uma função |
| Ideal para valores derivados (listas filtradas, totais calculados) | Ideal para funções passadas como props ou usadas como dependência de outro hook |
| `useMemo(() => calcular(), [dep])` | `useCallback(() => fn(), [dep])` |

---

# Os três trabalhando juntos

```typescript
const ListaProdutos = React.memo(function ListaProdutos({
  produtos,
  filtro,
  onSelecionar,
}: Props) {

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => p.nome.includes(filtro));
  }, [produtos, filtro]);

  return (
    <ul>
      {produtosFiltrados.map((produto) => (
        <li key={produto.id} onClick={() => onSelecionar(produto.id)}>
          {produto.nome}
        </li>
      ))}
    </ul>
  );

});
```

```typescript
function Pagina() {

  const [filtro, setFiltro] = useState("");
  const [favorito, setFavorito] = useState<string | null>(null);

  const produtos = useProdutos(); // vem de uma API, por exemplo

  const handleSelecionar = useCallback((id: string) => {
    setFavorito(id);
  }, []);

  return (
    <div>
      <input value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      <ListaProdutos
        produtos={produtos}
        filtro={filtro}
        onSelecionar={handleSelecionar}
      />
    </div>
  );

}
```

- `React.memo` evita que `ListaProdutos` renderize quando `Pagina` renderiza por outro motivo (ex.: `favorito` mudou).
- `useMemo` evita recalcular `produtosFiltrados` quando `produtos` e `filtro` não mudaram.
- `useCallback` garante que `handleSelecionar` mantenha a mesma referência, preservando o efeito do `React.memo`.

---

# O erro mais comum — Otimizar sem necessidade

```typescript
function Saudacao({ nome }: { nome: string }) {

  const mensagem = useMemo(() => `Olá, ${nome}!`, [nome]);

  return <p>{mensagem}</p>;

}
```

Aqui, `useMemo` **não traz benefício real**: concatenar uma string é uma operação extremamente barata, e o próprio `useMemo` tem um custo (guardar a dependência, comparar, acessar o cache). Nesse caso, é mais simples e até mais rápido escrever:

```typescript
function Saudacao({ nome }: { nome: string }) {
  return <p>Olá, {nome}!</p>;
}
```

**Regra prática:** `useMemo` e `useCallback` só compensam quando o custo do cálculo (ou o impacto de uma nova referência) é maior que o custo da própria memorização.

---

# Quando realmente vale a pena otimizar?

Utilize `useMemo`/`useCallback`/`React.memo` quando:

- o cálculo for **comprovadamente custoso** (ordenação, filtragem ou agregação de listas grandes);
- a função/valor for passado como prop para um componente **envolvido em `React.memo`**;
- a função/valor for usado como **dependência de outro hook** (`useEffect`, `useMemo`), evitando loops ou execuções desnecessárias;
- houver uma métrica real (React DevTools Profiler) mostrando o problema — não apenas uma suposição.

---

# useCallback como dependência de useEffect

Um uso frequentemente esquecido: estabilizar uma função que é usada **dentro de um `useEffect`**, evitando que o efeito rode repetidamente sem necessidade.

```typescript
function usarBuscaDebounced(busca: string) {

  const buscar = useCallback(async () => {
    const resultado = await buscarProdutos(busca);
    console.log(resultado);
  }, [busca]);

  useEffect(() => {
    buscar();
  }, [buscar]);

}
```

Sem o `useCallback`, `buscar` seria recriada a cada renderização, fazendo o `useEffect` (que depende dela) rodar **toda vez**, mesmo sem `busca` ter mudado.

---

# Comparando as três ferramentas

| Ferramenta | Memoriza | Usado em |
|---------|----------|----------|
| React.memo | O componente inteiro (evita re-render) | Ao exportar/definir o componente |
| useMemo | O resultado de um cálculo | Dentro do componente, para valores |
| useCallback | A referência de uma função | Dentro do componente, para funções |

---

# React.memo x useMemo x useCallback — quando cada um resolve o problema

| Sintoma | Ferramenta indicada |
|---------|----------|
| Um componente filho renderiza mesmo com as mesmas props | React.memo |
| Um cálculo pesado roda em toda renderização, sem necessidade | useMemo |
| Uma função passada como prop quebra a otimização do React.memo | useCallback |
| Um objeto/array recriado quebra a otimização do React.memo | useMemo |

---

# Exemplo prático

Imagine um dashboard com uma tabela grande e um filtro de busca.

```
Usuário digita no filtro

        │

        ▼

useState atualiza "filtro"

        │

        ▼

useMemo recalcula

apenas "dadosFiltrados"

(não recalcula tudo mais)

        │

        ▼

useCallback mantém

a referência de "onLinhaClicada"

        │

        ▼

React.memo na <Tabela />

evita renderizar

se nada relevante mudou

        │

        ▼

Apenas a tabela (quando

necessário) é atualizada
```

---

# Boas práticas

- Não otimize por padrão — meça primeiro (React DevTools Profiler), otimize depois.
- Use `React.memo` em componentes custosos e com props estáveis.
- Use `useMemo` para cálculos realmente pesados, não para operações triviais.
- Use `useCallback` principalmente quando a função for prop de um componente memoizado, ou dependência de outro hook.
- Lembre-se: `useMemo` e `useCallback` têm custo — usá-los em excesso pode até piorar a performance.
- Combine as três ferramentas de forma consciente: `React.memo` no componente, `useMemo`/`useCallback` no que é passado como prop para ele.
- Sempre liste corretamente as dependências — otimizações com dependências erradas escondem bugs sutis.

---

# Resumo

| Conceito | Resolve |
|---------|----------|
| React.memo | Evita re-render de um componente quando as props não mudam |
| useMemo | Evita recalcular um valor quando as dependências não mudam |
| useCallback | Evita recriar uma função quando as dependências não mudam |

---

# Fluxo mental

```
Algo está renderizando

ou recalculando demais...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

É um          É um cálculo    É uma função
componente    repetido sem    recriada a
renderizando  necessidade     cada render
sem precisar

   │        │        │

React.memo  useMemo    useCallback

            │
            ▼
      O ganho realmente
      compensa o custo?
            │
            ▼
      Medir com o Profiler
      antes de aplicar
```

---

# Referências

- Documentação oficial do React — memo: https://react.dev/reference/react/memo
- Documentação oficial do React — useMemo: https://react.dev/reference/react/useMemo
- Documentação oficial do React — useCallback: https://react.dev/reference/react/useCallback
- Documentação oficial do React — You Might Not Need an Effect / otimizações: https://react.dev/learn/you-might-not-need-an-effect
- video: https://www.youtube.com/watch?v=NmU2nNehNNY
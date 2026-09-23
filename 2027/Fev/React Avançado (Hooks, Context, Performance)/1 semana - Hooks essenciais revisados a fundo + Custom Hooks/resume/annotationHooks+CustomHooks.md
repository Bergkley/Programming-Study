# Hooks Essenciais

# Revisados a Fundo + Custom Hooks

**Hooks** são funções que permitem utilizar recursos do React (estado, ciclo de vida, contexto, entre outros) dentro de **componentes funcionais**, sem a necessidade de escrever classes.

Além dos hooks nativos do React, é possível criar **Custom Hooks**: funções próprias que encapsulam lógica reutilizável, seguindo as mesmas regras dos hooks oficiais.

Os hooks essenciais para dominar a fundo são:

- `useState`
- `useEffect`
- `useRef`
- `useMemo` e `useCallback`
- `useContext`
- Custom Hooks

---

# Por que revisar hooks a fundo?

Usar hooks "no automático" costuma gerar problemas conforme a aplicação cresce.

Sem entender a fundo:

- re-renderizações desnecessárias e componentes lentos;
- bugs sutis causados por **stale closures** (valores "presos" no tempo);
- efeitos colaterais disparando em momentos errados;
- lógica duplicada entre vários componentes.

Entendendo a fundo:

- controle real sobre quando e por que um componente renderiza de novo;
- efeitos colaterais previsíveis e bem isolados;
- performance otimizada apenas onde realmente importa;
- lógica reutilizável, testável e organizada através de Custom Hooks.

---

# Visão geral

```
Hooks do React

        │

 ┌──────┼────┬─────┬────────┐

 ▼      ▼    ▼     ▼        ▼

useState useEffect useRef useMemo/  useContext
                          useCallback
                                        │
                                        ▼
                                  Custom Hooks
```

---

# Regras dos Hooks

Antes de qualquer hook específico, duas regras são obrigatórias:

- **Só chame hooks no nível superior**: nunca dentro de `if`, `for` ou funções aninhadas.
- **Só chame hooks dentro de componentes React ou de outros hooks**: nunca em funções JavaScript comuns.

```typescript
// Errado
if (usuario) {
  const [nome, setNome] = useState("");
}
```

```typescript
// Certo
const [nome, setNome] = useState("");

if (usuario) {
  // usa "nome" aqui dentro, se precisar
}
```

Isso garante que o React consiga associar corretamente cada hook à sua "posição" entre as renderizações.

---

# useState

O `useState` armazena um valor que, ao ser alterado, **dispara uma nova renderização** do componente.

```typescript
const [contador, setContador] = useState(0);
```

---

# Problema — Atualização baseada no valor antigo

```typescript
function incrementarDuasVezes() {
  setContador(contador + 1);
  setContador(contador + 1);
}
```

O contador só aumenta **1**, não 2 — porque ambas as chamadas usam o mesmo valor "congelado" de `contador` durante essa renderização.

---

# Solução — Função de atualização

```typescript
function incrementarDuasVezes() {
  setContador((valorAtual) => valorAtual + 1);
  setContador((valorAtual) => valorAtual + 1);
}
```

Ao usar a forma funcional, cada chamada recebe o valor **mais atualizado**, garantindo o resultado correto (+2).

---

# useState com objetos

```typescript
const [usuario, setUsuario] = useState({ nome: "", idade: 0 });

function atualizarNome(novoNome: string) {
  setUsuario((atual) => ({ ...atual, nome: novoNome }));
}
```

O React **não faz merge automático** de objetos no `useState` (diferente do `setState` de classes) — é necessário espalhar (`...atual`) o valor anterior manualmente.

---

# useEffect

O `useEffect` executa **efeitos colaterais**: código que interage com algo fora do fluxo de renderização (requisições, subscriptions, manipulação direta do DOM, timers).

```typescript
useEffect(() => {
  console.log("Componente renderizado");
});
```

---

# Array de dependências

```
useEffect(fn)          → executa após toda renderização

useEffect(fn, [])      → executa apenas uma vez (montagem)

useEffect(fn, [valor]) → executa quando "valor" mudar
```

```typescript
useEffect(() => {
  console.log("Executa apenas na montagem");
}, []);
```

```typescript
useEffect(() => {
  console.log("Executa quando 'usuarioId' mudar");
}, [usuarioId]);
```

---

# Função de limpeza (cleanup)

Quando o efeito "cria" algo (timer, subscription, listener), é necessário "desfazer" isso antes do próximo efeito rodar ou quando o componente for desmontado.

```typescript
useEffect(() => {

  const intervalo = setInterval(() => {
    console.log("Executando...");
  }, 1000);

  return () => {
    clearInterval(intervalo);
  };

}, []);
```

Sem essa limpeza, múltiplos intervalos ficariam ativos ao mesmo tempo, causando **memory leaks** e comportamento inesperado.

---

# Problema — Dependência esquecida

```typescript
function Perfil({ usuarioId }: { usuarioId: string }) {

  const [dados, setDados] = useState(null);

  useEffect(() => {
    buscarUsuario(usuarioId).then(setDados);
  }, []); // usuarioId não está no array

  return <div>{dados?.nome}</div>;

}
```

Se `usuarioId` mudar, o efeito **não roda de novo**, e a tela continua mostrando os dados do usuário anterior — um bug clássico de dependência esquecida.

---

# Solução

```typescript
useEffect(() => {
  buscarUsuario(usuarioId).then(setDados);
}, [usuarioId]);
```

**Regra prática:** toda variável usada dentro do `useEffect` que vem de fora dele (props, state) geralmente deve estar no array de dependências.

---

# useRef

O `useRef` cria uma referência que **persiste entre renderizações**, mas que, diferente do `useState`, **não dispara uma nova renderização** quando alterada.

```typescript
const contadorRef = useRef(0);

function incrementar() {
  contadorRef.current += 1; // não causa re-render
}
```

---

# useRef para acessar elementos do DOM

```typescript
function CampoComFoco() {

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;

}
```

---

# useRef x useState

| useRef | useState |
|----------|----------|
| Não causa nova renderização ao mudar | Causa nova renderização ao mudar |
| Valor acessado via `.current` | Valor acessado diretamente |
| Ideal para valores "fora" do fluxo visual (timers, DOM, valores anteriores) | Ideal para dados que afetam o que é exibido na tela |

---

# useMemo

O `useMemo` **memoriza o resultado** de um cálculo, recalculando apenas quando uma das dependências mudar.

```typescript
const totalCarrinho = useMemo(() => {
  return itens.reduce((soma, item) => soma + item.preco, 0);
}, [itens]);
```

---

# Problema — Cálculo custoso repetido

```typescript
function ListaProdutos({ produtos, filtro }: Props) {

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.includes(filtro)
  );

  // recalculado em TODA renderização,
  // mesmo quando "produtos" e "filtro" não mudaram

}
```

---

# Solução

```typescript
const produtosFiltrados = useMemo(() => {
  return produtos.filter((p) => p.nome.includes(filtro));
}, [produtos, filtro]);
```

Agora o filtro só é recalculado quando `produtos` ou `filtro` realmente mudarem.

---

# useCallback

O `useCallback` é parecido com o `useMemo`, mas memoriza uma **função** em vez de um valor — útil para evitar que uma nova função seja criada a cada renderização.

```typescript
const handleClick = useCallback(() => {
  console.log("Clicado");
}, []);
```

---

# Por que isso importa?

```typescript
function Pai() {

  const [contador, setContador] = useState(0);

  const handleClick = () => {
    console.log("Clicado");
  };

  return <FilhoMemoizado onClick={handleClick} />;

}

const FilhoMemoizado = React.memo(function Filho({ onClick }: Props) {
  console.log("Filho renderizou");
  return <button onClick={onClick}>Clique</button>;
});
```

Mesmo usando `React.memo`, o `FilhoMemoizado` **renderiza de novo** a cada render do `Pai`, porque `handleClick` é uma **função nova** a cada vez.

---

# Solução

```typescript
const handleClick = useCallback(() => {
  console.log("Clicado");
}, []);
```

Agora a mesma referência de função é reaproveitada entre renderizações, permitindo que o `React.memo` do filho realmente evite renderizações desnecessárias.

---

# useMemo x useCallback

| useMemo | useCallback |
|----------|----------|
| Memoriza o **resultado** de uma função | Memoriza a **própria função** |
| `useMemo(() => calcular(), [dep])` | `useCallback(() => fn(), [dep])` |
| Usado para valores derivados custosos | Usado para funções passadas como props |

**Atenção:** `useMemo` e `useCallback` não são "gratuitos" — eles também têm um custo. Use apenas quando houver um ganho real de performance (cálculo pesado, componente filho memoizado, dependência de outro hook).

---

# useContext

O `useContext` permite consumir um **Context**, evitando a necessidade de passar props manualmente por vários níveis de componentes (**prop drilling**).

```typescript
const TemaContext = createContext<"claro" | "escuro">("claro");

function App() {
  return (
    <TemaContext.Provider value="escuro">
      <Pagina />
    </TemaContext.Provider>
  );
}

function BotaoTema() {
  const tema = useContext(TemaContext);
  return <button className={tema}>Alternar tema</button>;
}
```

---

# Problema — Prop Drilling

```
App

↓ passa "tema"

Layout

↓ passa "tema"

Sidebar

↓ passa "tema"

BotaoTema
```

Cada componente intermediário precisa repassar a prop `tema`, mesmo sem utilizá-la diretamente.

---

# Solução com Context

```
App (Provider)

↓

Qualquer componente

dentro da árvore

↓

useContext(TemaContext)

acessa direto, sem prop drilling
```

**Atenção:** todo componente que consome um Context re-renderiza quando o valor do `Provider` muda — em contexts que mudam com frequência, isso pode impactar a performance se não for bem estruturado.

---

# O que são Custom Hooks?

**Custom Hooks** são funções criadas pelo próprio desenvolvedor, que **combinam hooks nativos** para encapsular uma lógica reutilizável.

```
Lógica repetida

em vários componentes

↓

Extraída para

um Custom Hook

↓

Reutilizada de forma

simples e consistente
```

Por convenção, todo Custom Hook **deve começar com `use`**, para que o React (e o ESLint) consiga aplicar corretamente as regras dos hooks.

---

# Problema — Lógica duplicada

```typescript
function PerfilUsuario({ id }: { id: string }) {

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    buscarUsuario(id)
      .then(setDados)
      .finally(() => setCarregando(false));
  }, [id]);

  // ...
}
```

Se outro componente também precisar buscar dados de forma parecida, essa lógica de `loading`/`fetch` acaba sendo **copiada e colada**.

---

# Solução — Extraindo um Custom Hook

```typescript
function useUsuario(id: string) {

  const [dados, setDados] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {

    let ativo = true;

    setCarregando(true);

    buscarUsuario(id)
      .then((resultado) => {
        if (ativo) setDados(resultado);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };

  }, [id]);

  return { dados, carregando };

}
```

```typescript
function PerfilUsuario({ id }: { id: string }) {

  const { dados, carregando } = useUsuario(id);

  if (carregando) return <p>Carregando...</p>;

  return <p>{dados?.nome}</p>;

}
```

A variável `ativo` evita atualizar o estado caso o componente seja desmontado antes da requisição terminar, prevenindo o aviso clássico de "atualização de estado em componente desmontado".

---

# Exemplo — Custom Hook com useRef e useEffect

```typescript
function useDebounce<T>(valor: T, delay: number): T {

  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {

    const timeout = setTimeout(() => {
      setValorDebounced(valor);
    }, delay);

    return () => clearTimeout(timeout);

  }, [valor, delay]);

  return valorDebounced;

}
```

```typescript
function CampoBusca() {

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 500);

  useEffect(() => {
    if (buscaDebounced) {
      buscarProdutos(buscaDebounced);
    }
  }, [buscaDebounced]);

  return (
    <input
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
    />
  );

}
```

Esse `useDebounce` evita disparar uma busca a cada tecla digitada, esperando o usuário parar de digitar por um tempo antes de executar a requisição.

---

# Exemplo — Custom Hook combinando useContext

```typescript
function useTema() {

  const contexto = useContext(TemaContext);

  if (!contexto) {
    throw new Error("useTema deve ser usado dentro de um TemaProvider");
  }

  return contexto;

}
```

Encapsular o `useContext` em um Custom Hook permite validar o uso correto e simplificar o consumo em outros componentes.

---

# Quando criar um Custom Hook?

Utilize quando:

- a mesma lógica de estado/efeito se repetir em mais de um componente;
- a lógica for complexa o suficiente para "poluir" o componente visual;
- for necessário testar a lógica separadamente da renderização;
- quiser dar um nome claro a um comportamento (ex.: `useDebounce`, `useUsuario`, `useOnlineStatus`).

---

# Comparando os hooks

| Hook | Objetivo |
|---------|----------|
| useState | Armazenar um valor que afeta a renderização |
| useEffect | Executar efeitos colaterais |
| useRef | Guardar um valor mutável sem causar re-render |
| useMemo | Memorizar o resultado de um cálculo |
| useCallback | Memorizar a referência de uma função |
| useContext | Consumir dados de um Context, evitando prop drilling |
| Custom Hook | Encapsular e reutilizar lógica baseada em outros hooks |

---

# Exemplo prático

Imagine uma tela de busca de produtos com tema claro/escuro.

```
CampoBusca

        │

        ▼

useDebounce(busca, 500)

        │

        ▼

useEffect dispara

buscarProdutos()

        │

        ▼

useMemo calcula

produtosFiltrados

        │

        ▼

useCallback memoriza

onSelecionarProduto

        │

        ▼

useContext(TemaContext)

aplica o tema atual

        │

        ▼

Tela renderizada

de forma otimizada
```

---

# useEffect x useLayoutEffect

Vale mencionar essa diferença, comum em revisões mais profundas.

| useEffect | useLayoutEffect |
|-----------|----------|
| Executa **depois** que o navegador pinta a tela | Executa **antes** do navegador pintar a tela |
| Não bloqueia a renderização visual | Pode bloquear, use com cuidado |
| Ideal para a maioria dos efeitos (fetch, subscriptions) | Ideal para medir/ajustar o DOM antes do usuário ver (ex.: evitar "piscar") |

---

# Boas práticas

- Sempre declare todas as dependências reais no array do `useEffect` (deixe o ESLint te ajudar com o plugin `react-hooks`).
- Use funções de limpeza (`return () => {}`) sempre que o efeito criar algo persistente (timer, listener, subscription).
- Não use `useMemo`/`useCallback` em tudo — aplique apenas onde há ganho real de performance.
- Prefira `useState` funcional (`setValor(atual => ...)`) quando a atualização depender do valor anterior.
- Nomeie Custom Hooks sempre começando com `use`.
- Extraia lógica repetida para Custom Hooks assim que ela aparecer em um segundo componente.
- Combine `useContext` com um Custom Hook próprio para validar o uso e melhorar a experiência de quem consome.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| useState | Estado que afeta a interface |
| useEffect | Efeitos colaterais e sincronização com sistemas externos |
| useRef | Valores mutáveis persistentes sem re-render |
| useMemo / useCallback | Otimização de cálculos e referências de função |
| useContext | Compartilhamento de dados sem prop drilling |
| Custom Hooks | Reutilização de lógica baseada em outros hooks |

---

# Fluxo mental

```
Preciso guardar/otimizar algo...

            │

  ┌─────────┼─────┬─────┬─────────┐

  ▼         ▼     ▼     ▼         ▼

Estado que  Efeito  Valor  Evitar     Compartilhar
afeta a UI  colateral sem   recálculo/ dado sem
            re-render re-render prop drilling

  │         │     │     │         │

useState  useEffect useRef useMemo/  useContext
                          useCallback

                    │
                    ▼
              Lógica repetida?
                    │
                    ▼
              Custom Hook
```

---

# Referências

- Documentação oficial do React — Hooks: https://react.dev/reference/react/hooks
- Documentação oficial do React — Reusing Logic with Custom Hooks: https://react.dev/learn/reusing-logic-with-custom-hooks
- Documentação oficial do React — useEffect: https://react.dev/reference/react/useEffect
- Documentação oficial do React — useMemo e useCallback: https://react.dev/reference/react/useMemo
- Vídeo : https://www.youtube.com/watch?v=Fc-___dblSI
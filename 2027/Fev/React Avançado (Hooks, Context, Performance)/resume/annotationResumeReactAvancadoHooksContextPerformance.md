# React Avançado (Hooks, Context, Performance) - 1 semana - Hooks essenciais revisados a fundo + Custom Hooks

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

---

# React Avançado (Hooks, Context, Performance) - 2 semana - Context API e armadilhas de re-render

# Context API

# + Re-render

A **Context API** é o mecanismo nativo do React para compartilhar dados entre componentes **sem precisar passar props manualmente** em cada nível da árvore.

Entender como a Context API funciona é inseparável de entender **como e por que o React re-renderiza** componentes — usar Context sem esse entendimento é uma das causas mais comuns de problemas de performance em aplicações React.

Os três pilares principais desse tema são:

- Criação e uso de Context (`createContext`, `Provider`, `useContext`)
- Como o React decide re-renderizar um componente
- Como evitar re-renders desnecessários causados pelo Context

---

# Por que entender isso a fundo?

Imagine uma aplicação React crescendo, com vários componentes consumindo o mesmo Context.

Sem entender re-render:

- toda a árvore de componentes re-renderiza a cada pequena mudança de estado;
- a aplicação fica lenta conforme cresce, sem um motivo aparente;
- otimizações (`React.memo`, `useMemo`) são aplicadas "no escuro", sem resolver o problema real;
- Contexts viram um "estado global" mal estruturado, re-renderizando tudo.

Entendendo a fundo:

- capacidade de identificar **exatamente** por que um componente renderizou;
- Contexts bem estruturados, afetando apenas quem realmente precisa;
- otimizações aplicadas nos pontos certos, com resultado mensurável;
- decisões mais conscientes entre Context API, bibliotecas de estado global e prop drilling.

---

# Visão geral

```
Context API + Re-render

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Context  Como o React   Como evitar
API      decide         re-renders
         re-renderizar  desnecessários
```

---

# O que é a Context API?

A Context API permite criar um "canal" de dados que qualquer componente dentro de uma árvore pode acessar, sem depender de props intermediárias.

```
createContext()

↓

Provider

(fornece o valor)

↓

useContext()

(consome o valor)
```

---

# Criando e usando um Context

```typescript
type TemaContextType = {
  tema: "claro" | "escuro";
  alternarTema: () => void;
};

const TemaContext = createContext<TemaContextType | null>(null);
```

```typescript
function TemaProvider({ children }: { children: React.ReactNode }) {

  const [tema, setTema] = useState<"claro" | "escuro">("claro");

  const alternarTema = () => {
    setTema((atual) => (atual === "claro" ? "escuro" : "claro"));
  };

  return (
    <TemaContext.Provider value={{ tema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  );

}
```

```typescript
function useTema() {

  const contexto = useContext(TemaContext);

  if (!contexto) {
    throw new Error("useTema deve ser usado dentro de um TemaProvider");
  }

  return contexto;

}
```

```typescript
function BotaoTema() {

  const { tema, alternarTema } = useTema();

  return (
    <button onClick={alternarTema}>
      Tema atual: {tema}
    </button>
  );

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

Cada componente intermediário precisa receber e repassar a prop `tema`, mesmo sem utilizá-la diretamente — isso é o **prop drilling**.

---

# Solução — Context evita o prop drilling

```
App

  └── TemaProvider

        └── Layout

              └── Sidebar

                    └── BotaoTema
                         │
                         ▼
                  useContext(TemaContext)
                  (acessa direto, sem
                   passar por Layout/Sidebar)
```

---

# Como o React decide re-renderizar?

Antes de falar sobre o impacto do Context, é essencial entender a regra geral: um componente **re-renderiza** quando:

- seu próprio **estado** (`useState`, `useReducer`) muda;
- o **componente pai** re-renderiza (por padrão, os filhos também renderizam);
- um **Context** que ele consome (`useContext`) tem seu valor alterado;
- suas **props** mudam (embora isso, por si só, não impeça a renderização — quem decide é o React.memo).

```
Estado muda

↓

Componente re-renderiza

↓

Todos os filhos também

re-renderizam por padrão

(mesmo sem props terem mudado)
```

---

# Problema — Re-render em cascata

```typescript
function App() {

  const [contador, setContador] = useState(0);

  return (
    <div>
      <button onClick={() => setContador((c) => c + 1)}>
        Contador: {contador}
      </button>
      <ComponenteCaro />
    </div>
  );

}

function ComponenteCaro() {
  console.log("ComponenteCaro renderizou");
  return <div>Não depende do contador</div>;
}
```

Mesmo `ComponenteCaro` **não utilizando** `contador`, ele re-renderiza toda vez que o botão é clicado, simplesmente por ser filho de `App`.

---

# Solução — React.memo

```typescript
const ComponenteCaro = React.memo(function ComponenteCaro() {
  console.log("ComponenteCaro renderizou");
  return <div>Não depende do contador</div>;
});
```

Com `React.memo`, o componente só re-renderiza se **suas próprias props** mudarem — nesse caso, como não recebe props, ele deixa de renderizar junto com o `App`.

---

# O verdadeiro impacto do Context no Re-render

**Toda vez que o valor de um `Provider` muda, TODOS os componentes que consomem aquele Context (via `useContext`) re-renderizam — mesmo que usem apenas uma parte específica do valor.**

```
Provider muda o valor

↓

TODOS os consumidores

desse Context re-renderizam

↓

Mesmo os que usam apenas

uma parte do objeto
```

---

# Problema — Context "genérico" demais

```typescript
type AppContextType = {
  usuario: Usuario;
  tema: "claro" | "escuro";
  notificacoes: Notificacao[];
};

const AppContext = createContext<AppContextType | null>(null);
```

```typescript
function BotaoTema() {
  const { tema } = useContext(AppContext)!;
  return <button>{tema}</button>;
}
```

Se `notificacoes` mudar (ex.: uma nova notificação chegou), o `BotaoTema` **também re-renderiza**, mesmo utilizando apenas `tema` — porque o valor do `Provider` como um todo mudou.

---

# Solução 1 — Dividir em Contexts menores

```typescript
const TemaContext = createContext<TemaContextType | null>(null);
const UsuarioContext = createContext<Usuario | null>(null);
const NotificacoesContext = createContext<Notificacao[] | null>(null);
```

```
AppProvider

  ├── TemaProvider

  ├── UsuarioProvider

  └── NotificacoesProvider
```

Agora, uma mudança em `notificacoes` só afeta quem consome `NotificacoesContext`, sem impactar `BotaoTema`.

---

# Solução 2 — Memorizar o valor do Provider

```typescript
function TemaProvider({ children }: Props) {

  const [tema, setTema] = useState<"claro" | "escuro">("claro");

  const alternarTema = useCallback(() => {
    setTema((atual) => (atual === "claro" ? "escuro" : "claro"));
  }, []);

  const valor = useMemo(
    () => ({ tema, alternarTema }),
    [tema, alternarTema]
  );

  return (
    <TemaContext.Provider value={valor}>
      {children}
    </TemaContext.Provider>
  );

}
```

Sem o `useMemo`, um **novo objeto** `{ tema, alternarTema }` é criado a cada renderização do `Provider`, fazendo o React considerar que o valor "mudou" mesmo quando `tema` continua o mesmo — disparando re-renders desnecessários em todos os consumidores.

---

# Solução 3 — Separar Context de leitura e de escrita

Quando o Context expõe tanto o valor quanto a função de atualização, é possível separá-los em dois Contexts distintos.

```typescript
const TemaValorContext = createContext<"claro" | "escuro">("claro");
const TemaSetterContext = createContext<() => void>(() => {});
```

```typescript
function TemaProvider({ children }: Props) {

  const [tema, setTema] = useState<"claro" | "escuro">("claro");

  const alternarTema = useCallback(() => {
    setTema((atual) => (atual === "claro" ? "escuro" : "claro"));
  }, []);

  return (
    <TemaSetterContext.Provider value={alternarTema}>
      <TemaValorContext.Provider value={tema}>
        {children}
      </TemaValorContext.Provider>
    </TemaSetterContext.Provider>
  );

}
```

Componentes que só **disparam** a alternância de tema (e não precisam saber o valor atual) consomem apenas `TemaSetterContext`, que praticamente nunca muda — evitando re-renders desnecessários.

---

# children como otimização

Uma técnica menos conhecida: passar `children` como prop evita que o conteúdo interno seja recriado a cada renderização do componente pai.

```typescript
function Layout({ children }: { children: React.ReactNode }) {

  const [contador, setContador] = useState(0);

  return (
    <div>
      <button onClick={() => setContador((c) => c + 1)}>
        {contador}
      </button>
      {children}
    </div>
  );

}
```

```typescript
<Layout>
  <ComponenteCaro />
</Layout>
```

Como `<ComponenteCaro />` é criado **fora** do `Layout` (no componente pai que o renderiza), o React reconhece que o elemento não mudou entre as renderizações do `Layout`, evitando recriá-lo — mesmo sem usar `React.memo`.

---

# Verificando re-renders na prática

O React DevTools permite visualizar renderizações em tempo real, através da aba **Profiler** e da opção **"Highlight updates when components render"**.

```typescript
useEffect(() => {
  console.log("Componente X renderizou");
});
```

Adicionar esse log temporário em componentes suspeitos é uma forma simples de confirmar se uma otimização realmente teve efeito.

---

# Quando dividir um Context?

Utilize Contexts separados quando:

- diferentes partes do valor mudam em **frequências diferentes** (ex.: tema muda raramente, notificações mudam o tempo todo);
- componentes distintos consomem partes distintas do valor;
- o Context estiver crescendo e virando um "estado global" genérico demais.

---

# Quando NÃO usar Context?

Context não é uma ferramenta de gerenciamento de estado completa. Evite quando:

- o valor muda com **muita frequência** e é consumido por **muitos componentes** (ex.: posição do mouse, valor de um input em tempo real) — nesse caso, bibliotecas como Zustand, Redux ou Jotai lidam melhor com re-renders seletivos;
- o dado só é necessário em um ponto específico da árvore — nesse caso, passar via props diretamente é mais simples e mais rápido de entender.

---

# Comparando as soluções de otimização

| Técnica | O que resolve |
|---------|----------|
| React.memo | Evita re-render do componente quando as props não mudam |
| useMemo (no valor do Provider) | Evita recriar o objeto de valor a cada renderização |
| Dividir Contexts | Evita que mudanças em uma parte afetem consumidores de outra |
| children como prop | Evita recriação de elementos filhos ao otimizar o componente pai |

---

# Exemplo prático

Imagine uma aplicação com tema, usuário logado e notificações em tempo real.

```
AppProvider (mal estruturado)

↓

Um único Context com

{ tema, usuario, notificacoes }

↓

Notificação chega

↓

TODOS os consumidores

re-renderizam (tema, header, sidebar...)

        │

        ▼ (refatorado)

TemaProvider + UsuarioProvider

+ NotificacoesProvider

↓

Notificação chega

↓

Apenas quem consome

NotificacoesContext re-renderiza
```

---

# React.memo x useMemo x useCallback

É comum confundir essas três ferramentas de otimização.

| React.memo | useMemo | useCallback |
|----------|----------|----------|
| Envolve um **componente** | Memoriza um **valor calculado** | Memoriza uma **função** |
| Evita re-render se as props não mudarem | Evita recálculo se as dependências não mudarem | Evita recriar a função se as dependências não mudarem |
| Usado ao exportar o componente | Usado dentro do componente | Usado dentro do componente |

---

# Context API x Bibliotecas de estado global

| Context API | Redux / Zustand / Jotai |
|-----------|----------|
| Nativo do React, sem dependências extras | Requer instalação de biblioteca externa |
| Re-render afeta todos os consumidores do mesmo Context | Permite assinar apenas partes específicas do estado (seletores) |
| Ideal para dados que mudam pouco (tema, autenticação) | Ideal para estados complexos e que mudam com frequência |
| Mais simples de configurar | Mais ferramentas de debug e escalabilidade |

---

# Boas práticas

- Nunca coloque tudo em um único Context "genérico" — divida por domínio (tema, usuário, notificações).
- Sempre memorize (`useMemo`) o objeto de valor passado ao `Provider`.
- Use `useCallback` para funções expostas pelo Context, evitando recriações desnecessárias.
- Separe Context de leitura e de escrita quando fizer sentido, reduzindo o escopo de re-render.
- Use `React.memo` em componentes "caros" que não dependem diretamente do estado que mudou.
- Passe `children` como prop para evitar recriação de elementos filhos ao otimizar um componente pai.
- Avalie uma biblioteca de estado global quando o Context começar a re-renderizar partes demais da aplicação.
- Use o React DevTools Profiler para validar otimizações com dados reais, não apenas suposição.

---

# Resumo

| Conceito | Resolve |
|---------|----------|
| Context API | Compartilhar dados sem prop drilling |
| Re-render em cascata | Entender por que componentes filhos renderizam sem necessidade |
| Divisão de Contexts | Evitar que mudanças em uma parte afetem consumidores de outra |
| React.memo / useMemo / useCallback | Reduzir renderizações e recriações desnecessárias |

---

# Fluxo mental

```
Meu Context está causando

muitos re-renders...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

O valor do    Componentes    Componentes
Provider é    "caros" são    filhos são
recriado toda filhos de      recriados a
renderização  quem renderiza cada render

   │        │        │

useMemo no  React.memo   children
valor                    como prop

            │
            ▼
      Ainda assim muito
      dinâmico e amplo?
            │
            ▼
      Dividir Contexts /
      considerar estado global
```

---

# Referências

- Documentação oficial do React — passing data deeply with Context: https://react.dev/learn/passing-data-deeply-with-context
- Documentação oficial do React — Scaling Up with Reducer and Context: https://react.dev/learn/scaling-up-with-reducer-and-context
- Documentação oficial do React — React.memo: https://react.dev/reference/react/memo
- Documentação oficial do React — render and commit: https://react.dev/learn/render-and-commit

---

# React Avançado (Hooks, Context, Performance) - 3 semana - Performance memo, useMemo, useCallback, Profiler

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

---

# React Avançado (Hooks, Context, Performance) - 4 semana - Lazy Loading, Suspense, Code Splitting

# Lazy Loading, Suspense

# + Code Splitting

Conforme uma aplicação React cresce, o **bundle** (arquivo JavaScript final enviado ao navegador) também cresce, aumentando o tempo de carregamento inicial. **Lazy Loading**, **Code Splitting** e **Suspense** são técnicas que trabalham juntas para carregar apenas o que é **necessário no momento**, em vez de tudo de uma vez.

- **Code Splitting**: dividir o bundle em pedaços menores (chunks).
- **Lazy Loading**: carregar cada pedaço **sob demanda**, apenas quando necessário.
- **Suspense**: exibir uma interface de carregamento enquanto o conteúdo "preguiçoso" ainda não chegou.

---

# Por que isso importa?

Imagine uma aplicação React crescendo ao longo do tempo, com várias telas, bibliotecas e funcionalidades.

Sem essas técnicas:

- o usuário baixa o código de **todas** as telas, mesmo as que nunca vai acessar;
- o tempo até a aplicação ficar interativa (TTI) aumenta a cada nova funcionalidade;
- bibliotecas pesadas (editores de texto, gráficos, mapas) são carregadas mesmo quando não utilizadas naquela sessão;
- a experiência em conexões mais lentas (mobile, 3G/4G) piora significativamente.

Com Code Splitting, Lazy Loading e Suspense:

- o carregamento inicial contém apenas o essencial;
- telas e componentes pesados só são baixados quando o usuário realmente os acessa;
- a aplicação "sente-se" mais rápida, mesmo sem reduzir o código total;
- há controle total sobre o que exibir enquanto algo carrega.

---

# Visão geral

```
Performance de Carregamento

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Code    Lazy      Suspense
Splitting Loading
```

O **Code Splitting** divide o código, o **Lazy Loading** decide quando carregar cada parte, e o **Suspense** cuida da experiência visual durante essa espera.

---

# O que é Code Splitting?

**Code Splitting** é o processo de dividir o bundle de uma aplicação em **múltiplos arquivos menores (chunks)**, em vez de um único arquivo gigante.

```
Sem Code Splitting

↓

app.bundle.js (3 MB)

↓

Tudo carregado de uma vez,

mesmo o que não será usado

Com Code Splitting

↓

main.js (200 KB)
dashboard.chunk.js (500 KB)
relatorios.chunk.js (800 KB)
configuracoes.chunk.js (300 KB)

↓

Cada chunk carregado

apenas quando necessário
```

Ferramentas como **Vite** e **Webpack** fazem esse split automaticamente a partir de `import()` dinâmicos.

---

# Problema — Bundle único

```typescript
import Dashboard from "./paginas/Dashboard";
import Relatorios from "./paginas/Relatorios";
import Configuracoes from "./paginas/Configuracoes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
    </Routes>
  );
}
```

Mesmo que o usuário acesse apenas o `/`, o código de `Relatorios` e `Configuracoes` é incluído no **mesmo bundle inicial**, aumentando o tempo de carregamento sem necessidade.

---

# O que é Lazy Loading?

**Lazy Loading** ("carregamento preguiçoso") significa adiar o carregamento de um recurso até o momento em que ele é **realmente necessário**.

No React, isso é feito com a função `lazy()`, combinada a um `import()` dinâmico.

```typescript
import { lazy } from "react";

const Relatorios = lazy(() => import("./paginas/Relatorios"));
```

Em vez de importar o componente diretamente no topo do arquivo, o `import()` dinâmico retorna uma **Promise**, que só é resolvida (baixando o código) quando o componente precisa ser renderizado.

---

# O que é Suspense?

Como o carregamento de um componente `lazy` é **assíncrono**, é necessário informar ao React o que exibir **enquanto** esse carregamento acontece. É para isso que existe o `<Suspense>`.

```typescript
import { Suspense } from "react";

function App() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <Relatorios />
    </Suspense>
  );
}
```

```
Componente lazy

é renderizado

↓

Código ainda

não chegou?

   │           │
  Sim          Não

   ▼            ▼

Exibe o        Exibe o
"fallback"     componente
do Suspense    normalmente
```

---

# Solução — Dashboard com Lazy Loading e Suspense

```typescript
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Dashboard = lazy(() => import("./paginas/Dashboard"));
const Relatorios = lazy(() => import("./paginas/Relatorios"));
const Configuracoes = lazy(() => import("./paginas/Configuracoes"));

function App() {
  return (
    <Suspense fallback={<p>Carregando página...</p>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Routes>
    </Suspense>
  );
}
```

Agora, o código de `Relatorios` só é baixado quando o usuário **navega** até `/relatorios` — e, enquanto isso acontece, a mensagem "Carregando página..." é exibida.

---

# Múltiplos Suspense (granularidade)

É possível (e recomendado) ter **vários `Suspense`** em diferentes níveis da aplicação, exibindo fallbacks mais específicos para cada parte.

```typescript
function Dashboard() {
  return (
    <div>
      <Cabecalho />

      <Suspense fallback={<SkeletonGrafico />}>
        <GraficoVendas />
      </Suspense>

      <Suspense fallback={<SkeletonTabela />}>
        <TabelaPedidosRecentes />
      </Suspense>
    </div>
  );
}
```

```
Sem granularidade

↓

Um Suspense "engole" a tela toda

enquanto qualquer parte carrega

Com granularidade

↓

Cabeçalho aparece na hora,

só o gráfico e a tabela têm

seus próprios "esqueletos"
```

Isso evita que a tela inteira fique em branco (ou com um único spinner genérico) enquanto apenas uma parte específica ainda está carregando.

---

# Lazy Loading em interações, não apenas em rotas

Lazy Loading não se limita a páginas — também é muito útil para componentes **pesados que só aparecem sob interação do usuário**.

```typescript
const ModalEdicaoAvancada = lazy(() => import("./ModalEdicaoAvancada"));

function Formulario() {

  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div>
      <button onClick={() => setMostrarModal(true)}>
        Edição avançada
      </button>

      {mostrarModal && (
        <Suspense fallback={<p>Abrindo...</p>}>
          <ModalEdicaoAvancada onFechar={() => setMostrarModal(false)} />
        </Suspense>
      )}
    </div>
  );

}
```

O código de `ModalEdicaoAvancada` (que pode incluir bibliotecas pesadas, como um editor de texto rico) só é baixado quando o usuário realmente **clica** no botão.

---

# Tratando erros com Error Boundary

Se o carregamento de um chunk **falhar** (ex.: problema de rede, deploy no meio do carregamento), o `Suspense` sozinho não trata esse erro — é necessário combiná-lo com um **Error Boundary**.

```typescript
class ErrorBoundary extends React.Component<Props, State> {

  state = { comErro: false };

  static getDerivedStateFromError() {
    return { comErro: true };
  }

  render() {
    if (this.state.comErro) {
      return <p>Não foi possível carregar esta parte da página.</p>;
    }

    return this.props.children;
  }

}
```

```typescript
<ErrorBoundary>
  <Suspense fallback={<p>Carregando...</p>}>
    <Relatorios />
  </Suspense>
</ErrorBoundary>
```

```
Falha ao baixar o chunk

↓

Sem Error Boundary

↓

Tela quebra / erro não tratado

↓

Com Error Boundary

↓

Mensagem de erro amigável,

resto da aplicação continua
```

---

# Code Splitting por biblioteca

Também é comum aplicar Lazy Loading a **bibliotecas de terceiros** pesadas, carregando-as apenas quando necessárias.

```typescript
const GraficoPesado = lazy(() => import("./componentes/GraficoComChartJs"));
```

Isso evita que uma biblioteca de gráficos (ou um editor de texto rico, um leitor de PDF, etc.) seja incluída no bundle principal, mesmo em páginas que nunca a utilizam.

---

# Prefetch — carregando antes do clique

Em alguns casos, vale **antecipar** o carregamento de um chunk antes mesmo do usuário navegar até ele, melhorando a experiência percebida.

```typescript
function LinkRelatorios() {

  const carregarRelatorios = () => {
    import("./paginas/Relatorios");
  };

  return (
    <Link
      to="/relatorios"
      onMouseEnter={carregarRelatorios}
    >
      Relatórios
    </Link>
  );

}
```

Ao passar o mouse sobre o link, o chunk já começa a ser baixado em segundo plano — quando o clique realmente acontecer, o conteúdo pode já estar pronto (ou quase).

---

# Verificando o resultado (bundle analyzer)

Ferramentas como o **Vite Bundle Visualizer** ou o **Webpack Bundle Analyzer** permitem visualizar o tamanho de cada chunk gerado, confirmando se o Code Splitting está realmente funcionando.

```bash
npm install --save-dev rollup-plugin-visualizer
```

```
Antes do Code Splitting

↓

app.js — 3.2 MB

Depois do Code Splitting

↓

main.js — 180 KB
dashboard.chunk.js — 420 KB
relatorios.chunk.js — 650 KB
```

---

# Quando usar Lazy Loading?

Utilize quando:

- a aplicação tiver **múltiplas rotas/páginas**, especialmente em um SPA;
- houver componentes **pesados** que nem todo usuário acessa (modais complexos, editores, gráficos, mapas);
- bibliotecas de terceiros grandes forem usadas apenas em partes específicas da aplicação;
- o objetivo for melhorar métricas como **tempo até interatividade (TTI)** e **First Contentful Paint**.

**Evite** aplicar lazy loading em componentes muito pequenos ou que aparecem **imediatamente** na tela (ex.: cabeçalho, menu principal) — o overhead da requisição extra pode não compensar.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Code Splitting | Dividir o bundle em partes menores |
| Lazy Loading | Carregar cada parte apenas quando necessária |
| Suspense | Controlar a interface exibida durante o carregamento |

---

# Exemplo prático

Imagine uma aplicação de dashboard administrativo.

```
Usuário acessa "/"

        │

        ▼

Apenas o chunk do Dashboard

é baixado (main + dashboard)

        │

        ▼

Usuário clica em "Relatórios"

        │

        ▼

lazy() dispara o import()

        │

        ▼

Suspense exibe o fallback

("Carregando página...")

        │

        ▼

Chunk de Relatórios chega

        │

        ▼

Suspense renderiza

o componente real

        │

        ▼

Se falhar: Error Boundary

exibe mensagem amigável
```

---

# Lazy (React) x Dynamic Import (JavaScript)

É comum confundir esses dois conceitos.

| import() dinâmico | React.lazy |
|----------|----------|
| Recurso nativo do JavaScript/ES Modules | Recurso do React, construído sobre o `import()` |
| Retorna uma Promise com o módulo | Retorna um componente que o React sabe "suspender" |
| Pode ser usado para qualquer módulo (não só componentes) | Específico para componentes React |
| Não lida sozinho com estados de carregamento | Precisa ser usado dentro de um `Suspense` |

---

# Suspense sem Lazy x Suspense com Lazy

| Sem lazy | Com lazy |
|-----------|----------|
| Componente já está no bundle principal | Componente é baixado sob demanda |
| Suspense não tem efeito perceptível | Suspense exibe o fallback durante o download |
| Bundle inicial maior | Bundle inicial menor, carregamento incremental |

---

# Boas práticas

- Aplique Lazy Loading principalmente em **rotas** e **componentes pesados** sob interação.
- Use `Suspense` em múltiplos níveis, evitando telas inteiras "em branco" enquanto uma parte pequena carrega.
- Sempre combine `Suspense` com um **Error Boundary**, tratando falhas de carregamento.
- Use fallbacks que já indiquem o layout final (skeletons), evitando "pulos" bruscos na interface.
- Evite lazy loading em componentes pequenos e sempre visíveis — o ganho não compensa o overhead.
- Utilize um bundle analyzer periodicamente, para confirmar que o Code Splitting está realmente reduzindo o bundle inicial.
- Considere `prefetch` em ações prováveis (hover em links, por exemplo) para melhorar a experiência percebida.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Code Splitting | Dividir o bundle em chunks menores |
| Lazy Loading | Carregar cada chunk apenas quando necessário |
| Suspense | Exibir uma interface de carregamento durante a espera |

---

# Fluxo mental

```
Minha aplicação está

carregando lenta demais...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

O bundle    Preciso        Preciso de uma
inicial     adiar o        interface durante
é grande    carregamento   o carregamento
            de uma parte

   │        │        │

Code       Lazy       Suspense
Splitting  Loading    (+ Error Boundary)
```

---

# Referências

- Documentação oficial do React — lazy: https://react.dev/reference/react/lazy
- Documentação oficial do React — Suspense: https://react.dev/reference/react/Suspense
- Documentação do Vite — Build e Code Splitting: https://vitejs.dev/guide/build.html
- web.dev — Code Splitting: https://web.dev/articles/code-splitting-suspense
- video: https://www.youtube.com/watch?v=h1OdrtXmmmw&pp=ygULcmVhY3QgbGF6eSA%3D

---

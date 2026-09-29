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
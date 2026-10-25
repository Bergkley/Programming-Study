# React Hook Form

# + Zod

Formulários são uma das partes mais trabalhosas de qualquer aplicação React: controle de estado dos campos, validação, mensagens de erro, envio e performance. **React Hook Form** e **Zod** resolvem esse problema em conjunto:

- **React Hook Form (RHF)**: biblioteca para **gerenciar formulários** de forma performática, com pouco código e poucas re-renderizações.
- **Zod**: biblioteca de **validação e declaração de schemas** com suporte total a TypeScript, que valida dados e **infere os tipos automaticamente**.

Os três pilares principais desse tema são:

- Gerenciamento do formulário (`useForm`, `register`, `handleSubmit`)
- Validação por schema (Zod)
- Integração entre os dois (`zodResolver`)

---

# Por que usar React Hook Form + Zod?

Imagine um formulário de cadastro crescendo ao longo do tempo, com vários campos, regras e mensagens de erro.

Sem essas bibliotecas (formulário "na mão"):

- um `useState` para cada campo, mais um para cada erro;
- re-renderização do formulário inteiro a cada tecla digitada;
- validações espalhadas em vários `if` dentro do componente;
- tipos do formulário e regras de validação escritos duas vezes, podendo ficar fora de sincronia.

Com React Hook Form + Zod:

- campos não controlados por padrão, com pouquíssimas re-renderizações;
- validação declarativa em um único schema;
- tipo TypeScript **inferido** do schema, sem duplicação;
- mensagens de erro organizadas e fáceis de exibir.

---

# Visão geral

```
Formulários em React

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

React     Zod      zodResolver
Hook Form (schema) (integração)
```

O **React Hook Form** controla o formulário, o **Zod** define as regras, e o **zodResolver** conecta os dois.

---

# Instalação

```bash
npm install react-hook-form zod @hookform/resolvers
```

---

# Problema — Formulário controlado "na mão"

```typescript
function Cadastro() {

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erros, setErros] = useState<{ nome?: string; email?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const novosErros: typeof erros = {};

    if (nome.length < 3) {
      novosErros.nome = "Nome deve ter ao menos 3 caracteres";
    }

    if (!email.includes("@")) {
      novosErros.email = "E-mail inválido";
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length === 0) {
      enviar({ nome, email });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={nome} onChange={(e) => setNome(e.target.value)} />
      {erros.nome && <span>{erros.nome}</span>}

      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {erros.email && <span>{erros.email}</span>}

      <button type="submit">Enviar</button>
    </form>
  );

}
```

Cada tecla digitada atualiza um estado e **re-renderiza o formulário inteiro**, e a validação fica misturada com a lógica do componente.

---

# O que é React Hook Form?

O **React Hook Form** gerencia o estado do formulário usando **inputs não controlados** (via `ref`), lendo os valores diretamente do DOM apenas quando necessário — em vez de armazenar cada valor em um `useState`.

```
Usuário digita

↓

Valor fica no DOM

(sem re-render)

↓

Ao enviar / validar

↓

React Hook Form lê

os valores e processa
```

---

# Uso básico

```typescript
import { useForm } from "react-hook-form";

type FormData = {
  nome: string;
  email: string;
};

function Cadastro() {

  const { register, handleSubmit } = useForm<FormData>();

  function onSubmit(dados: FormData) {
    console.log(dados);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("nome")} />
      <input {...register("email")} />
      <button type="submit">Enviar</button>
    </form>
  );

}
```

- `useForm`: cria o formulário e retorna os utilitários.
- `register`: conecta um input ao formulário (nome, `ref`, `onChange`, `onBlur`).
- `handleSubmit`: envolve a função de envio, só chamando-a se a validação passar.

---

# Validação nativa do React Hook Form

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

<input
  {...register("nome", {
    required: "Nome é obrigatório",
    minLength: { value: 3, message: "Mínimo de 3 caracteres" },
  })}
/>
{errors.nome && <span>{errors.nome.message}</span>}
```

Funciona bem para formulários simples, mas as regras ficam **espalhadas** pelos inputs e **não geram o tipo TypeScript** automaticamente. É aí que o Zod entra.

---

# O que é Zod?

O **Zod** permite declarar um **schema** (a "forma" esperada dos dados, com suas regras) e usá-lo tanto para **validar** quanto para **inferir o tipo TypeScript**.

```typescript
import { z } from "zod";

const cadastroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  idade: z.number().min(18, "Deve ser maior de idade"),
});
```

---

# Inferindo o tipo a partir do schema

```typescript
type CadastroData = z.infer<typeof cadastroSchema>;

// Equivalente a:
// {
//   nome: string;
//   email: string;
//   idade: number;
// }
```

Uma única fonte de verdade: o **schema** define as regras **e** o tipo. Se uma regra mudar, o tipo muda junto, sem risco de ficarem fora de sincronia.

---

# Validando dados com Zod diretamente

```typescript
const resultado = cadastroSchema.safeParse({
  nome: "Sh",
  email: "invalido",
  idade: 15,
});

if (!resultado.success) {
  console.log(resultado.error.issues);
}
```

```
[
  { path: ["nome"], message: "Nome deve ter ao menos 3 caracteres" },
  { path: ["email"], message: "E-mail inválido" },
  { path: ["idade"], message: "Deve ser maior de idade" }
]
```

`safeParse` retorna um objeto com `success` e `data`/`error`, sem lançar exceções. Já o `parse` lança um erro se os dados forem inválidos.

---

# Integrando: zodResolver

O `zodResolver` conecta o schema do Zod ao React Hook Form, que passa a usar o schema como fonte das regras de validação.

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const cadastroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  idade: z.coerce.number().min(18, "Deve ser maior de idade"),
});

type CadastroData = z.infer<typeof cadastroSchema>;

function Cadastro() {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroData>({
    resolver: zodResolver(cadastroSchema),
  });

  async function onSubmit(dados: CadastroData) {
    await enviarCadastro(dados);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      <input {...register("nome")} placeholder="Nome" />
      {errors.nome && <span>{errors.nome.message}</span>}

      <input {...register("email")} placeholder="E-mail" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("idade")} type="number" placeholder="Idade" />
      {errors.idade && <span>{errors.idade.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>

    </form>
  );

}
```

Note o `z.coerce.number()`: inputs HTML sempre devolvem **strings**, e o `coerce` converte o valor para número antes de validar.

---

# Fluxo completo

```
Usuário preenche e envia

        │

        ▼

handleSubmit

        │

        ▼

zodResolver valida

com o schema

        │

        ▼

Válido?

   │           │
  Sim          Não

   ▼            ▼

onSubmit(dados)  errors preenchido

com dados        com as mensagens

tipados          do schema
```

---

# Validações comuns do Zod

```typescript
z.string().min(3)
z.string().max(100)
z.string().email()
z.string().url()
z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
z.number().int().positive()
z.boolean()
z.enum(["admin", "usuario"])
z.string().optional()
z.string().nullable()
z.array(z.string()).min(1, "Selecione ao menos um item")
z.date()
```

---

# Validação entre campos (refine)

Para regras que dependem de **mais de um campo** (ex.: confirmação de senha), usa-se `refine` / `superRefine` no schema.

```typescript
const senhaSchema = z
  .object({
    senha: z.string().min(8, "Mínimo de 8 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });
```

O `path` indica em qual campo o erro será exibido (`errors.confirmarSenha`).

---

# Valores padrão (defaultValues)

```typescript
const { register } = useForm<CadastroData>({
  resolver: zodResolver(cadastroSchema),
  defaultValues: {
    nome: "",
    email: "",
  },
});
```

Útil para formulários de **edição**, onde os campos começam preenchidos com dados já existentes.

---

# Componentes controlados (Controller)

Alguns componentes (ex.: selects de bibliotecas de UI, datepickers) não aceitam `ref` do jeito que o `register` exige. Nesses casos, usa-se o `Controller`.

```typescript
import { Controller } from "react-hook-form";

<Controller
  name="categoria"
  control={control}
  render={({ field }) => (
    <SelectBiblioteca
      value={field.value}
      onChange={field.onChange}
      options={opcoes}
    />
  )}
/>
```

---

# Modos de validação (mode)

```typescript
useForm({
  resolver: zodResolver(schema),
  mode: "onBlur",
});
```

- **onSubmit** (padrão): valida apenas ao enviar.
- **onBlur**: valida quando o campo perde o foco.
- **onChange**: valida a cada alteração (mais re-renders).
- **onTouched**: valida no primeiro blur e, depois, a cada alteração.
- **all**: valida em blur e change.

---

# Tratando erros vindos do servidor

```typescript
const { setError } = useForm<CadastroData>();

async function onSubmit(dados: CadastroData) {
  try {
    await enviarCadastro(dados);
  } catch (erro: any) {
    if (erro.campo === "email") {
      setError("email", {
        type: "server",
        message: "Este e-mail já está cadastrado",
      });
    }
  }
}
```

O `setError` permite exibir erros de validação **do back-end** no mesmo lugar dos erros do schema.

---

# Reaproveitando o schema no back-end

Como o Zod funciona em qualquer ambiente JavaScript/TypeScript, o **mesmo schema** pode ser usado no front-end e no back-end (Node.js), garantindo que as regras de validação sejam idênticas.

```typescript
// compartilhado
export const cadastroSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
});

// back-end (Express)
app.post("/cadastro", (req, res) => {
  const resultado = cadastroSchema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(422).json({ erros: resultado.error.issues });
  }

  // dados validados e tipados
  const dados = resultado.data;
});
```

Isso conecta com o tema de **status codes** visto antes: erros de validação de dados bem formados retornam `422`.

---

# Quando usar React Hook Form + Zod?

Utilize quando:

- o formulário tiver **vários campos** e regras de validação;
- for importante ter **tipagem forte** entre as regras e os dados;
- houver preocupação com **performance** (formulários grandes, muitos campos);
- as regras de validação precisarem ser **compartilhadas** entre front-end e back-end.

**Evite** quando:

- o formulário for muito simples (um único campo de busca, por exemplo) — um `useState` já resolve.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| React Hook Form | Gerenciar o estado e o envio do formulário com alta performance |
| Zod | Declarar regras de validação e inferir tipos TypeScript |
| zodResolver | Conectar o schema do Zod ao React Hook Form |

---

# Exemplo prático

Imagine uma tela de cadastro de usuário.

```
Definir o schema Zod

(regras + tipos)

        │

        ▼

useForm com zodResolver

        │

        ▼

register conecta

cada input ao formulário

        │

        ▼

Usuário envia

        │

        ▼

Schema valida os dados

        │

        ▼

Inválido: errors exibidos

Válido: onSubmit com dados tipados

        │

        ▼

Erro do servidor?

↓

setError exibe no campo certo
```

---

# register x Controller

É comum confundir quando usar cada um.

| register | Controller |
|----------|----------|
| Para inputs HTML nativos (`input`, `select`, `textarea`) | Para componentes controlados de bibliotecas de UI |
| Usa `ref` (não controlado) | Usa `value`/`onChange` (controlado) |
| Menos código e melhor performance | Mais código, necessário quando `register` não funciona |

---

# parse x safeParse

| parse | safeParse |
|-----------|----------|
| Lança uma exceção se os dados forem inválidos | Retorna `{ success, data/error }` sem lançar |
| Exige `try/catch` | Permite tratar o resultado com `if` |
| Útil quando o erro deve interromper o fluxo | Útil para validar e responder ao usuário com os erros |

---

# Validação nativa do RHF x Zod

| Validação nativa do RHF | Zod |
|-----------|----------|
| Regras definidas em cada `register` | Regras centralizadas em um único schema |
| Não gera tipo TypeScript | Infere o tipo com `z.infer` |
| Difícil reaproveitar no back-end | Reaproveitável em qualquer ambiente JS/TS |
| Bom para formulários simples | Ideal para formulários médios e grandes |

---

# Boas práticas

- Defina o schema Zod **fora** do componente, evitando recriá-lo a cada renderização.
- Use `z.infer` para gerar o tipo do formulário, em vez de escrevê-lo manualmente.
- Use `z.coerce` para campos numéricos e de data vindos de inputs HTML.
- Defina `defaultValues` sempre que possível (principalmente em formulários de edição).
- Exiba `isSubmitting` para desabilitar o botão e evitar envios duplicados.
- Use `setError` para exibir erros retornados pelo servidor no campo correspondente.
- Compartilhe o schema entre front-end e back-end sempre que o projeto permitir.
- Prefira `register` por padrão, e use `Controller` apenas quando necessário.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| React Hook Form | Gerenciamento de formulário com poucas re-renderizações |
| Zod | Validação declarativa e tipos inferidos |
| zodResolver | Integração entre as regras do schema e o formulário |

---

# Fluxo mental

```
Preciso de um formulário...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Gerenciar   Validar      Conectar
campos e    com regras   as duas
envio       e tipos      partes

   │        │        │

React Hook  Zod      zodResolver
Form
```

---

# Referências

- Documentação oficial do React Hook Form: https://react-hook-form.com/
- Documentação oficial do Zod: https://zod.dev/
- @hookform/resolvers: https://github.com/react-hook-form/resolvers
- React Hook Form — Get Started (com Zod): https://react-hook-form.com/get-started#SchemaValidation
# TypeScript Avançado

# O que são Utility Types?

Os **Utility Types** são tipos utilitários fornecidos pelo próprio TypeScript para **transformar, reutilizar e manipular outros tipos** de forma simples e segura.

Eles evitam a duplicação de código e tornam a tipagem mais flexível e fácil de manter.

Em vez de criar novos tipos manualmente, você pode reutilizar tipos existentes e modificá-los conforme a necessidade.

---

# Por que usar Utility Types?

Imagine a seguinte interface:

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}
```

Agora imagine que você precisa de:

- Um tipo para criação de usuário.
- Um tipo para atualização.
- Um tipo para exibição.
- Um tipo apenas com algumas propriedades.

Criar várias interfaces seria repetitivo.

Com Utility Types isso fica muito mais simples.

---

# Principais Utility Types

Os Utility Types mais utilizados são:

- `Partial<T>`
- `Required<T>`
- `Readonly<T>`
- `Pick<T, K>`
- `Omit<T, K>`
- `Record<K, T>`
- `Exclude<T, U>`
- `Extract<T, U>`
- `NonNullable<T>`
- `ReturnType<T>`
- `Parameters<T>`

---

# Partial

Transforma **todas as propriedades em opcionais**.

```typescript
interface Usuario {
  nome: string;
  email: string;
}
```

Sem `Partial`:

```typescript
const usuario: Usuario = {
  nome: "João",
};
```

Erro:

```text
Property 'email' is missing...
```

Com `Partial`:

```typescript
const usuario: Partial<Usuario> = {
  nome: "João",
};
```

Agora todas as propriedades são opcionais.

Resultado equivalente:

```typescript
{
  nome?: string;
  email?: string;
}
```

---

# Exemplo prático

Muito utilizado em atualizações.

```typescript
interface Usuario {
  nome: string;
  email: string;
}

function atualizarUsuario(
  dados: Partial<Usuario>
) {}
```

Agora é possível atualizar apenas um campo.

```typescript
atualizarUsuario({
  nome: "Maria",
});
```

---

# Required

Faz o contrário do `Partial`.

Todas as propriedades tornam-se obrigatórias.

```typescript
interface Config {
  tema?: string;
  idioma?: string;
}
```

```typescript
type ConfigCompleta = Required<Config>;
```

Resultado:

```typescript
{
  tema: string;
  idioma: string;
}
```

---

# Readonly

Impede alterações após a criação do objeto.

```typescript
interface Produto {
  id: number;
  nome: string;
}

const produto: Readonly<Produto> = {
  id: 1,
  nome: "Notebook",
};

produto.nome = "Mouse";
```

Erro:

```text
Cannot assign to 'nome'
because it is a read-only property.
```

---

# Pick

Seleciona apenas algumas propriedades de outro tipo.

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}
```

```typescript
type UsuarioPublico = Pick<
  Usuario,
  "id" | "nome"
>;
```

Resultado:

```typescript
{
  id: number;
  nome: string;
}
```

Muito útil para esconder informações sensíveis.

---

# Omit

Remove propriedades de um tipo.

```typescript
type UsuarioSemSenha = Omit<
  Usuario,
  "senha"
>;
```

Resultado:

```typescript
{
  id: number;
  nome: string;
  email: string;
}
```

É bastante utilizado em respostas de APIs.

---

# Pick x Omit

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}
```

Usando `Pick`:

```typescript
type UsuarioPublico = Pick<
  Usuario,
  "id" | "nome"
>;
```

Usando `Omit`:

```typescript
type UsuarioSemSenha = Omit<
  Usuario,
  "senha"
>;
```

- **Pick** → escolhe o que manter.
- **Omit** → remove o que não interessa.

---

# Record

Cria um objeto utilizando um conjunto de chaves.

Sintaxe:

```typescript
Record<Chaves, Tipo>
```

Exemplo:

```typescript
type Cargos = Record<
  string,
  number
>;

const salarios: Cargos = {
  Desenvolvedor: 6000,
  Designer: 5000,
  QA: 4500,
};
```

Outro exemplo:

```typescript
type Status = "ativo" | "inativo";

const usuarios: Record<Status, number> = {
  ativo: 15,
  inativo: 3,
};
```

---

# Exclude

Remove tipos de uma união.

```typescript
type Status =
  | "ativo"
  | "inativo"
  | "bloqueado";
```

```typescript
type NovoStatus = Exclude<
  Status,
  "bloqueado"
>;
```

Resultado:

```typescript
"ativo" | "inativo"
```

---

# Extract

Faz o contrário do `Exclude`.

Mantém apenas os tipos desejados.

```typescript
type Status =
  | "ativo"
  | "inativo"
  | "bloqueado";
```

```typescript
type ApenasAtivo = Extract<
  Status,
  "ativo"
>;
```

Resultado:

```typescript
"ativo"
```

---

# NonNullable

Remove `null` e `undefined`.

```typescript
type Usuario =
  | string
  | null
  | undefined;
```

```typescript
type UsuarioValido =
  NonNullable<Usuario>;
```

Resultado:

```typescript
string
```

---

# ReturnType

Obtém automaticamente o tipo de retorno de uma função.

```typescript
function criarUsuario() {
  return {
    nome: "João",
    idade: 25,
  };
}
```

```typescript
type Usuario = ReturnType<
  typeof criarUsuario
>;
```

Resultado:

```typescript
{
  nome: string;
  idade: number;
}
```

---

# Parameters

Obtém os parâmetros de uma função.

```typescript
function login(
  email: string,
  senha: string
) {}
```

```typescript
type LoginParams =
  Parameters<typeof login>;
```

Resultado:

```typescript
[string, string]
```

---

# Exemplo do mundo real

Imagine uma API.

```typescript
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}
```

Cadastro:

```typescript
type CriarUsuario =
  Omit<Usuario, "id">;
```

Atualização:

```typescript
type AtualizarUsuario =
  Partial<Usuario>;
```

Resposta pública:

```typescript
type UsuarioResponse =
  Omit<Usuario, "senha">;
```

Observe que nenhuma interface precisou ser duplicada.

---

# Comparação dos principais Utility Types

| Utility Type | O que faz |
|---------------|-----------|
| `Partial<T>` | Torna todas as propriedades opcionais |
| `Required<T>` | Torna todas as propriedades obrigatórias |
| `Readonly<T>` | Impede alterações nas propriedades |
| `Pick<T, K>` | Seleciona propriedades específicas |
| `Omit<T, K>` | Remove propriedades específicas |
| `Record<K, T>` | Cria um objeto com chaves e valores tipados |
| `Exclude<T, U>` | Remove tipos de uma união |
| `Extract<T, U>` | Mantém apenas tipos específicos |
| `NonNullable<T>` | Remove `null` e `undefined` |
| `ReturnType<T>` | Obtém o tipo de retorno de uma função |
| `Parameters<T>` | Obtém os tipos dos parâmetros de uma função |

---

# Quando usar?

Use Utility Types quando:

- Deseja evitar duplicação de tipos.
- Precisa adaptar uma interface existente.
- Está trabalhando com APIs.
- Precisa reutilizar modelos em diferentes contextos.
- Quer manter a tipagem consistente durante a evolução do projeto.

---

# Boas práticas

- Prefira reutilizar tipos existentes em vez de criar interfaces quase iguais.
- Use `Partial` para operações de atualização (`PATCH`).
- Use `Omit` para remover informações sensíveis, como senhas.
- Use `Pick` quando precisar expor apenas alguns campos.
- Utilize `Readonly` para objetos que não devem ser modificados.
- Combine Utility Types com Generics para criar soluções ainda mais reutilizáveis.

---

# Resumo

```
Tenho um tipo existente
          │
          ▼
Preciso modificar esse tipo?
          │
 ┌────────┼─────────┐
 │        │         │
 ▼        ▼         ▼
Adicionar  Remover  Tornar
opcional? propriedades? imutável?
 │         │         │
 ▼         ▼         ▼
Partial   Omit   Readonly

Selecionar apenas algumas?
        │
        ▼
      Pick

Criar objeto tipado?
        │
        ▼
      Record

Trabalhar com unions?
        │
   ┌────┴────┐
   ▼         ▼
Exclude   Extract

Remover null?
        │
        ▼
NonNullable

Obter tipos de funções?
        │
   ┌────┴─────┐
   ▼          ▼
ReturnType Parameters
```

---

# Referências

- Documentação oficial do TypeScript - Utility Types: https://www.typescriptlang.org/docs/handbook/utility-types.html
- Documentação oficial do TypeScript: https://www.typescriptlang.org/docs/
-Vídeo - https://www.youtube.com/watch?v=vVmfmc02AOc
# Git Avançado

## Git merge x Git rebase

Tanto o **Git Merge** quanto o **Git Rebase** são utilizados para integrar alterações de diferentes branches, porém cada um possui um comportamento diferente no histórico do Git.

### Git Merge

O `git merge` une duas branches criando um **commit de merge**, preservando o histórico exatamente como ele aconteceu.

Exemplo:

```bash
git checkout main
git merge feature/login
```

### Histórico antes do merge

```text
A---B---C (main)
     \
      D---E (feature/login)
```

### Histórico após o merge

```text
A---B---C---------M (main)
     \           /
      D---------E (feature/login)
```

Onde:

- `M` é o commit de merge.
- O histórico mantém o formato de árvore.
- É possível visualizar claramente quando uma branch foi integrada.

### Vantagens

- Preserva o histórico original.
- Mais seguro para branches compartilhadas.
- Facilita auditoria e rastreamento de alterações.

### Desvantagens

- O histórico pode ficar mais poluído com diversos commits de merge.
- Em projetos grandes, a visualização pode ficar mais difícil.

---

## Git Rebase

O `git rebase` reescreve o histórico da branch atual, movendo seus commits para o topo de outra branch.

Em vez de criar um commit de merge, os commits são "reaplicados".

Exemplo:

```bash
git checkout feature/login
git rebase main
```

### Histórico antes do rebase

```text
A---B---C (main)
     \
      D---E (feature/login)
```

### Histórico após o rebase

```text
A---B---C---D'---E' (feature/login)
```

Observe que:

- `D'` e `E'` são novos commits.
- O Git recria esses commits sobre a branch `main`.
- O histórico fica linear.

Após isso, normalmente fazemos o merge:

```bash
git checkout main
git merge feature/login
```

Como a branch já está "à frente" da `main`, o merge será um **Fast-Forward**.

Resultado:

```text
A---B---C---D'---E' (main)
```

Não existe commit de merge.

### Vantagens

- Histórico limpo e linear.
- Facilita leitura do histórico.
- Muito utilizado antes de abrir Pull Requests.

### Desvantagens

- Reescreve o histórico.
- Pode causar problemas se utilizada em branches já compartilhadas.
- Exige cuidado ao fazer `push` após um rebase (normalmente utiliza-se `git push --force-with-lease`).

---

## Comparação

| Git Merge | Git Rebase |
|-----------|------------|
| Cria commit de merge | Não cria commit de merge |
| Preserva o histórico original | Reescreve o histórico |
| Histórico em árvore | Histórico linear |
| Seguro para branches públicas | Ideal para branches locais |
| Fácil auditoria | Histórico mais limpo |

---

## Quando usar cada um?

### Use **Merge** quando

- A branch já foi compartilhada.
- Várias pessoas trabalham na mesma branch.
- Você deseja preservar o histórico completo.
- Está integrando uma feature em produção.

### Use **Rebase** quando

- Sua branch ainda é local.
- Deseja um histórico limpo.
- Vai atualizar sua branch antes de abrir um Pull Request.
- Quer evitar commits de merge desnecessários.

---

## Exemplo prático

Imagine a seguinte situação:

```text
main

A---B---C
```

Você cria uma branch:

```text
main

A---B---C
         \
feature   D---E
```

Enquanto isso, outra pessoa adiciona novos commits na `main`:

```text
A---B---C---F---G (main)
         \
          D---E (feature)
```

### Com Merge

```bash
git checkout feature
git merge main
```

Resultado:

```text
A---B---C---F---G
         \       \
          D---E---M
```

---

### Com Rebase

```bash
git checkout feature
git rebase main
```

Resultado:

```text
A---B---C---F---G---D'---E'
```

Depois:

```bash
git checkout main
git merge feature
```

Resultado final:

```text
A---B---C---F---G---D'---E'
```

Sem commit de merge.

---

## Resumo

- **Merge** une históricos e cria um commit de merge.
- **Rebase** reorganiza os commits para manter um histórico linear.
- **Merge** é mais seguro para trabalho colaborativo.
- **Rebase** deixa o histórico mais limpo, mas deve ser usado com cuidado.

Uma regra bastante utilizada é:

> **Nunca faça rebase em uma branch pública que outras pessoas já estejam utilizando.**

---

# Referências Git Merge x Git Rebase

- Vídeo: https://www.youtube.com/watch?v=LpeI6-cPlK4

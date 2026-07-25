# Git Avançado

## Git Cherry-pick

O **Git Cherry-pick** é um comando utilizado para **copiar um ou mais commits específicos de uma branch para outra**, sem precisar fazer um `merge` completo.

Ele é muito útil quando você deseja levar apenas uma correção ou funcionalidade para outra branch.

### Quando usar?

Alguns cenários comuns:

- Corrigir um bug na `main` e levar essa mesma correção para uma branch de homologação.
- Aproveitar apenas um commit de uma feature sem trazer toda a branch.
- Recuperar um commit que foi feito na branch errada.

---

## Sintaxe

```bash
git cherry-pick <hash-do-commit>
```

Também é possível aplicar vários commits:

```bash
git cherry-pick <hash1> <hash2> <hash3>
```

Ou um intervalo de commits:

```bash
git cherry-pick <commit-inicial>^..<commit-final>
```

---

## Exemplo prático

Imagine o seguinte cenário:

```
main
A --- B --- C

feature/login
       \
        D --- E
```

Na branch `feature/login` foram feitos dois commits:

- D → Criação da tela de login
- E → Correção de um bug importante

Agora você deseja levar **somente a correção (commit E)** para a `main`, sem levar a tela de login.

Primeiro, copie o hash do commit:

```bash
git log --oneline
```

Resultado:

```text
3f4d2ab Correção no login
8b72c91 Tela de login
```

Depois vá para a branch desejada:

```bash
git checkout main
```

Execute:

```bash
git cherry-pick 3f4d2ab
```

Agora o histórico ficará assim:

```
main
A --- B --- C --- E'

feature/login
       \
        D --- E
```

Observe que foi criado um **novo commit (E')**, com o mesmo conteúdo do commit original, mas com um novo hash.

---

## Cherry-pick de vários commits

Você pode aplicar vários commits de uma vez:

```bash
git cherry-pick 3f4d2ab 91ad82c 8fa72bd
```

---

## Cherry-pick de um intervalo

Para aplicar um conjunto de commits consecutivos:

```bash
git cherry-pick A^..D
```

Isso aplica os commits:

```
A
B
C
D
```

---

## Conflitos

Assim como no `merge`, podem ocorrer conflitos.

Quando isso acontecer:

1. Resolva os conflitos manualmente.
2. Adicione os arquivos corrigidos:

```bash
git add .
```

3. Continue o cherry-pick:

```bash
git cherry-pick --continue
```

Caso queira cancelar a operação:

```bash
git cherry-pick --abort
```

---

## Dicas

✅ Use `git log --oneline` para localizar rapidamente o hash do commit.

```bash
git log --oneline
```

Exemplo:

```text
3f4d2ab Corrige bug no login
91ad82c Adiciona validação
7f9d111 Cria tela de login
```

---

## Quando NÃO usar

Evite usar `cherry-pick` quando o objetivo é trazer **todas as alterações** de uma branch.

Nesses casos, prefira:

- `git merge`
- `git rebase`

O `cherry-pick` é indicado apenas para reaproveitar commits específicos.

---

# Resumo

| Comando | Descrição |
|----------|-----------|
| `git cherry-pick <hash>` | Copia um commit específico |
| `git cherry-pick hash1 hash2` | Copia vários commits |
| `git cherry-pick A^..D` | Copia um intervalo de commits |
| `git cherry-pick --continue` | Continua após resolver conflitos |
| `git cherry-pick --abort` | Cancela a operação |

---

# Referências

- Vídeo: https://www.youtube.com/watch?v=Wi1vdL57gd0
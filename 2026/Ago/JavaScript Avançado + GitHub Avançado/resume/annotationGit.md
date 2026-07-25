# Git - gitBisect

# Git Avançado

## Git Bisect

O **Git Bisect** é uma ferramenta que ajuda a **descobrir qual commit introduziu um bug** no projeto.

Ele utiliza uma **busca binária (Binary Search)** no histórico de commits, reduzindo drasticamente a quantidade de testes necessários para encontrar o commit problemático.

Em vez de verificar cada commit manualmente, o Git seleciona automaticamente um commit intermediário para você testar.

---

## Quando usar?

O `git bisect` é útil quando:

- Um bug apareceu, mas você não sabe em qual commit ele foi introduzido.
- O projeto possui muitos commits e localizar o problema manualmente seria demorado.
- Você deseja identificar rapidamente a alteração responsável por uma regressão.

---

## Como funciona?

O processo é simples:

1. Informe ao Git um commit onde o projeto está **funcionando**.
2. Informe um commit onde o projeto está **com problema**.
3. O Git escolherá um commit intermediário.
4. Você testa esse commit.
5. Diz ao Git se ele está **bom** (`good`) ou **ruim** (`bad`).
6. O Git repete o processo até encontrar o commit responsável.

Como ele utiliza busca binária, o número de testes é muito pequeno.

Por exemplo:

| Quantidade de commits | Testes aproximados |
|-----------------------:|-------------------:|
| 100 | 7 |
| 1.000 | 10 |
| 10.000 | 14 |

---

## Exemplo prático

Imagine o seguinte histórico:

```
A --- B --- C --- D --- E --- F --- G
```

Sabemos que:

- O commit **A** funciona corretamente.
- O commit **G** possui um bug.

Inicie o processo:

```bash
git bisect start
```

Informe o commit com problema:

```bash
git bisect bad G
```

Agora informe um commit que funciona:

```bash
git bisect good A
```

O Git escolherá automaticamente um commit intermediário, por exemplo:

```
A --- B --- C --- D --- E --- F --- G
              ^
```

Suponha que o Git escolheu o commit **D**.

Você testa a aplicação.

### Caso 1 — O bug existe

```bash
git bisect bad
```

Agora o Git sabe que o problema está entre:

```
D --- E --- F --- G
```

---

### Caso 2 — O bug não existe

```bash
git bisect good
```

Agora o Git reduz a busca para:

```
A --- B --- C
```

---

O processo continua até encontrar exatamente o commit responsável.

Resultado final:

```text
8d32f91 is the first bad commit
```

---

## Exemplo completo

```bash
git bisect start

git bisect bad HEAD

git bisect good v1.2.0
```

Agora o Git irá posicionar você em um commit intermediário.

Depois de testar:

```bash
git bisect good
```

ou

```bash
git bisect bad
```

Repita até que o Git encontre o commit responsável.

---

## Encerrando o Bisect

Depois de localizar o problema, retorne para sua branch original:

```bash
git bisect reset
```

Isso encerra o modo Bisect e restaura o estado anterior do repositório.

---

## Automatizando os testes

Se existir um script que verifica automaticamente se o projeto está funcionando, o processo pode ser totalmente automatizado.

Exemplo:

```bash
git bisect start

git bisect bad

git bisect good v1.2.0

git bisect run ./test.sh
```

O script deve retornar:

- **0** → Projeto funcionando.
- **Valor diferente de 0** → Projeto com problema.

Assim, o Git executará o script em cada commit automaticamente até encontrar o commit que introduziu o bug.

Esse recurso é muito útil em projetos que possuem testes automatizados.

---

## Ignorando commits

Alguns commits podem não compilar ou não ser possíveis de testar.

Nesses casos:

```bash
git bisect skip
```

O Git ignorará esse commit e continuará procurando outro.

---

## Comandos principais

| Comando | Descrição |
|----------|-----------|
| `git bisect start` | Inicia o processo |
| `git bisect bad` | Marca o commit atual como problemático |
| `git bisect good` | Marca o commit atual como funcionando |
| `git bisect skip` | Ignora o commit atual |
| `git bisect reset` | Finaliza o Bisect |
| `git bisect run <script>` | Automatiza os testes |

---

## Dicas

- Utilize o `git bisect` sempre que um bug aparecer após várias alterações e você não souber onde ele foi introduzido.
- Quanto mais automatizados forem os testes do projeto, mais eficiente será o processo.
- O `git bisect run` pode economizar muito tempo em projetos grandes.

---

## Quando NÃO usar

O `git bisect` não é a melhor opção quando:

- Você já sabe exatamente qual commit causou o problema.
- O bug não pode ser reproduzido de forma consistente.
- O histórico possui poucas alterações e é fácil localizar o erro manualmente.

---

# Resumo

| Objetivo | Comando |
|----------|----------|
| Iniciar o Bisect | `git bisect start` |
| Marcar commit ruim | `git bisect bad` |
| Marcar commit bom | `git bisect good` |
| Ignorar commit | `git bisect skip` |
| Automatizar testes | `git bisect run ./script.sh` |
| Encerrar o Bisect | `git bisect reset` |

---

# Referências

- Vídeo: https://www.youtube.com/watch?v=oDOwve4eR-k

---

# Git - gitCherryPick

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

---

# Git - gitMerge+rebase

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


---

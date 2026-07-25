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
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const perguntas = [
  {
    pergunta: "1) O que é o Event Loop no JavaScript?",
    alternativas: [
      "A) Um mecanismo que gerencia a execução assíncrona do JavaScript",
      "B) Uma função para criar loops infinitos",
      "C) Um tipo de variável",
      "D) Um método de array"
    ],
    resposta: "A"
  },
  {
    pergunta: "2) Qual é a principal característica do JavaScript no navegador?",
    alternativas: [
      "A) Executa várias threads simultaneamente por padrão",
      "B) Possui uma única thread de execução principal",
      "C) Não suporta código assíncrono",
      "D) Não possui memória"
    ],
    resposta: "B"
  },
  {
    pergunta: "3) Qual fila é processada antes das tarefas comuns no Event Loop?",
    alternativas: [
      "A) Callback Queue",
      "B) Microtask Queue",
      "C) Render Queue",
      "D) Task Queue"
    ],
    resposta: "B"
  },
  {
    pergunta: "4) Qual destes exemplos cria uma Microtask?",
    alternativas: [
      "A) setTimeout()",
      "B) setInterval()",
      "C) Promise.then()",
      "D) console.log()"
    ],
    resposta: "C"
  },
  {
    pergunta: "5) Analise o código e escolha a ordem correta:",
    alternativas: [
      "A) setTimeout → Promise → console.log",
      "B) console.log → Promise → setTimeout",
      "C) Promise → setTimeout → console.log",
      "D) Todas executam ao mesmo tempo"
    ],
    resposta: "B"
  },
  {
    pergunta: "6) O que acontece quando uma função assíncrona termina sua execução?",
    alternativas: [
      "A) Ela é removida imediatamente sem retorno",
      "B) Seu callback pode ser colocado em uma fila para execução posterior",
      "C) Ela bloqueia o navegador permanentemente",
      "D) Ela reinicia o Event Loop"
    ],
    resposta: "B"
  },
  {
    pergunta: "7) Qual API normalmente coloca uma tarefa na fila de macrotasks?",
    alternativas: [
      "A) Promise.resolve()",
      "B) queueMicrotask()",
      "C) setTimeout()",
      "D) async/await"
    ],
    resposta: "C"
  }
];

let indice = 0;
let pontos = 0;

function iniciarQuiz() {

  if (indice >= perguntas.length) {
    console.log("\n======================");
    console.log("Quiz finalizado!");
    console.log(`Sua pontuação: ${pontos}/${perguntas.length}`);
    console.log("======================");

    rl.close();
    return;
  }

  const atual = perguntas[indice];

  console.log("\n" + atual.pergunta);

  atual.alternativas.forEach((alternativa) => {
    console.log(alternativa);
  });

  rl.question("\nSua resposta: ", (respostaUsuario) => {

    if (respostaUsuario.toUpperCase() === atual.resposta) {
      console.log("✅ Correto!");
      pontos++;
    } else {
      console.log(`❌ Errado! A resposta correta é: ${atual.resposta}`);
    }

    indice++;

    iniciarQuiz();
  });
}

console.log("================================");
console.log("   Quiz: Event Loop JavaScript");
console.log("================================");

iniciarQuiz();


// Diagrama : 

// Código Síncrono
//         ↓
// Call Stack
//         ↓
// Micro Task Queue
//         ↓
// Macro Task Queue
//         ↓
// Renderização da Tela
//         ↓
// Novo ciclo do Event Loop
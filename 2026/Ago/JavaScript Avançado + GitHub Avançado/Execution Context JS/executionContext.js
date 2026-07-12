// Contexto de Execução

function b() {
  console.log(myVar);
}

function a() {
  var myVar = 2;
  b();
}

let myVar = 1;

a(); // 1

// Motivo : b ele estar dentro do contexto global, então ele vai procurar a variável no contexto global, e não no contexto da função a.

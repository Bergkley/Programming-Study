/*
==============================================================
        EXERCÍCIOS - EXECUTION CONTEXT E HOISTING
==============================================================
*/

console.log("===== DESAFIO 1 =====");
console.log(nome);
var nome = "Maria";
// Resposta: undefined


console.log("===== DESAFIO 2 =====");
try {
  console.log(idade);
  let idade = 20;
} catch (e) {
  console.log("Erro:", e.message);
}
// Resposta: ReferenceError (Cannot access 'idade' before initialization)


console.log("===== DESAFIO 3 =====");
boasVindas();
function boasVindas() {
  console.log("Bem-vindo!");
}
// Resposta: "Bem-vindo!"


console.log("===== DESAFIO 4 =====");
try {
  cumprimentar();
  var cumprimentar = function () {
    console.log("Olá!");
  };
} catch (e) {
  console.log("Erro:", e.message);
}
// Resposta: TypeError (cumprimentar is not a function)


console.log("===== DESAFIO 5 =====");
var numero = 10;
function teste() {
  console.log(numero);
  var numero = 50;
  console.log(numero);
}
teste();
// Resposta: undefined, depois 50


console.log("===== DESAFIO 6 =====");
var mensagem = "Global";
function imprimir() {
  console.log(mensagem);
  var mensagem = "Local";
  console.log(mensagem);
}
imprimir();
console.log(mensagem);
// Resposta: undefined, Local, Global


console.log("===== DESAFIO 7 =====");
var nomeGlobal = "João";
function primeira() {
  console.log(nomeGlobal);
}
function segunda() {
  var nomeGlobal2 = "Pedro"; 
  primeira();
}
segunda();
// Resposta: João


console.log("===== DESAFIO 8 =====");
var a = 10;
function soma(x, y) {
  var resultado = x + y;
  return resultado;
}
var total = soma(5, 3);
console.log(total);
// Resposta: 8


console.log("===== DESAFIO 9 =====");
function primeiraF() {
  console.log("Primeira");
  segundaF();
  console.log("Fim Primeira");
}
function segundaF() {
  console.log("Segunda");
  terceiraF();
  console.log("Fim Segunda");
}
function terceiraF() {
  console.log("Terceira");
}
primeiraF();
// Resposta: Primeira, Segunda, Terceira, Fim Segunda, Fim Primeira
// Call Stack no pico: terceiraF -> segundaF -> primeiraF -> Global


console.log("===== DESAFIO 10 (FINAL) =====");
var nomeFinal = "Lucas";
function primeiraD() {
  console.log("1");
  segundaD();
  console.log(nomeFinal);
}
function segundaD() {
  console.log("2");
  terceiraD();
}
function terceiraD() {
  console.log(nomeFinal2);
  var nomeFinal2 = "Carlos";
  console.log(nomeFinal2);
}
primeiraD();
// Resposta: 1, 2, undefined, Carlos, Lucas
// Call Stack no pico: terceiraD -> segundaD -> primeiraD -> Global
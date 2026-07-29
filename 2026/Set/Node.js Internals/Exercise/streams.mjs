import fs, { ReadStream } from "fs";
import { Transform } from "stream";

/**
 * ============================================
 * Lista de Exercícios - Streams (JavaScript)
 * ============================================
 * Objetivo: praticar o uso de Streams, leitura,
 * escrita e manipulação de arquivos com Node.js.
 */

// ============================================
// Exercício 1
// ============================================
// Crie um programa que leia o conteúdo de um
// arquivo chamado "entrada.txt" utilizando
// ReadStream e exiba o conteúdo no console.
//
// Requisitos:
// - Utilize fs.createReadStream()
// - Defina a codificação como UTF-8
// - Trate possíveis erros.

const stream = fs.createReadStream('entrada.txt',{
    encoding: 'UTF-8'
});

stream.on('data', (chunk) => {
    console.log(chunk);
});

stream.on('error', (err) => {
    console.error(err);
});

// ============================================
// Exercício 2
// ============================================
// Crie um programa que copie o conteúdo de
// "origem.txt" para "destino.txt" utilizando
// Streams.
//
// Requisitos:
// - Utilize createReadStream()
// - Utilize createWriteStream()
// - Conecte as streams com pipe().

const stream = fs.createReadStream('./fileTxt/origem.txt', { encoding: 'utf8' });
const writeStream = fs.createWriteStream('./fileTxt/destino.txt');

stream.pipe(writeStream);

stream.on('error', (err) => {
	console.error('Erro ao ler arquivo:', err.message);
});

writeStream.on('finish', () => {
	console.log('Cópia concluída: fileTxt/destino.txt');
});

writeStream.on('error', (err) => {
	console.error('Erro ao escrever arquivo:', err.message);
});

// ============================================
// Exercício 3
// ============================================
// Crie um programa que leia um arquivo de texto
// e conte:
//
// - Quantidade de linhas
// - Quantidade de palavras
// - Quantidade de caracteres
//
// Utilize Streams para realizar a leitura.


const readStream = fs.createReadStream('./fileTxt/count.txt', {
  encoding: 'utf8'
});

let content = '';

readStream.on('data', (chunk) => {
  content += chunk;
});

readStream.on('end', () => {
  const lines = content.split('\n').length;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const characters = content.length;

  console.log(`Quantidade de linhas: ${lines}`);
  console.log(`Quantidade de palavras: ${words}`);
  console.log(`Quantidade de caracteres: ${characters}`);
});

readStream.on('error', (err) => {
  console.error(err);
});
// ============================================
// Exercício 4
// ============================================
// Crie um programa que leia um arquivo
// "nomes.txt" e grave apenas os nomes que
// começam com a letra "A" em um novo arquivo
// chamado "nomesA.txt".
//
// Requisitos:
// - Utilize ReadStream
// - Utilize WriteStream
// - Faça o filtro antes de escrever.

const readStream = fs.createReadStream('./fileTxt/nomes.txt', {
  encoding: 'utf8'
});

const writeSteam = fs.createWriteStream('./fileTxt/nomesA.txt');

readStream.on('data', (chunk) => {
  const lines = chunk.split('\n');

  for (let i =0 ; i < lines.length; i++) {
    if(lines[i].startsWith('A')) {
      writeSteam.write(lines[i] + '\n');
    }
  }
});

readStream.on('end', () => {
  writeSteam.end();
});

writeSteam.on('finish', () => {
  console.log('Arquivo gravado com sucesso! fileTxt/nomesA.txt');
});

readStream.on('error', (err) => {
  console.error(err);
});


// ============================================
// Exercício 5
// ============================================
// Crie um programa que leia um arquivo grande
// utilizando Streams e converta todo o texto
// para letras maiúsculas antes de gravar em um
// novo arquivo.
//
// Dica:
// Utilize um Transform Stream para modificar os
// dados antes de gravá-los.
//
// Fluxo esperado:
//
// arquivo.txt
//      ↓
// ReadStream
//      ↓
// Transform (toUpperCase)
//      ↓
// WriteStream
//      ↓
// arquivo_maiusculo.txt
//


const readStream = fs.createReadStream("./fileTxt/arquivo.txt", {
  encoding: "utf8",
});

const writeStream = fs.createWriteStream("./fileTxt/arquivo_maiusculo.txt");

const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});

readStream
  .pipe(upperCaseTransform)
  .pipe(writeStream);

writeStream.on("finish", () => {
  console.log("Arquivo convertido para maiúsculas com sucesso!");
});

readStream.on("error", (err) => {
  console.error("Erro ao ler o arquivo:", err.message);
});

writeStream.on("error", (err) => {
  console.error("Erro ao escrever o arquivo:", err.message);
});
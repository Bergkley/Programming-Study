// ===============================
// Shallow Copy (Cópia Rasa)
// ===============================
// O operador spread (...) cria uma cópia apenas do primeiro nível.
// Objetos e arrays internos continuam compartilhando a mesma referência.

const pessoas = ['berg', 'joao', 'maria', ['outra']];

const copiaShallow = [...pessoas];

copiaShallow[1] = 'pessoa';           // Apenas na cópia
copiaShallow[3][0] = 'Qualquer coisa'; // Altera também o array original

console.log('Array original:', pessoas);
console.log('Shallow Copy:', copiaShallow);

console.log('----------------------------------------------');


// ===============================
// Deep Copy (Cópia Profunda)
// ===============================
// Cria uma cópia completamente independente.

const pessoas2 = ['berg', 'joao', 'maria', ['outra']];

const copiaDeep = JSON.parse(JSON.stringify(pessoas2));

copiaDeep[1] = 'pessoa';             // Apenas na cópia
copiaDeep[3][0] = 'Qualquer coisa';  // Não altera o original

console.log('Array original:', pessoas2);
console.log('Deep Copy:', copiaDeep);
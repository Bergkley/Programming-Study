// Event loop

console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

setTimeout(() => console.log("4"), 1000);

Promise.resolve().then(() => {
    setTimeout(() => console.log("5"), 1000);
})

console.log("6");

// Resposta: 1, 6, 3, 2, 4, 5

// Síncrono = 1, 6
// MicroTask = 3
// MacroTask = 2, 4, 5
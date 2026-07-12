// Hoisting 

nome = 'berg'

console.log('Ola ' + nome); // Ola berg

var nome

apresentar() // Ola mundo

despetir() // undefined

// function declariation
function apresentar() {
    console.log('Ola mundo');
}

// function expression
var despetir = function() {
    console.log('Adeus');
}

var carroFavorito = 'Fusca'

var dizerCarroFavorito = function() {
    console.log('Meu carro favorito é ' + carroFavorito);

    var carroFavorito = 'Celta'

    console.log('Meu carro favorito agora é ' + carroFavorito);
}

dizerCarroFavorito()
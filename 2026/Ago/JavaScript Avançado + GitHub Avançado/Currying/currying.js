// Currying

//  comum 

function somar(a, b) {
    return a + b;
}

somar(2, 3); // 5

// Currying

function somar(a) {
    return function(b) {
        return a + b;
    }
}

somar(2)(3); // 5


// Solid - Liskov Substitution Principle (LSP)

// problema inicial
// a classe Bird tem um método fly que lida com diferentes tipos de aves. Se quisermos adicionar um novo tipo de ave, precisaríamos modificar essa classe, o que viola o princípio Liskov.

class Bird {
    fly() {
        console.log("I can fly!");
    }
}

class Eagle extends Bird {
  fly() {
    console.log("I can soar!");
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error("I can't fly!");
  }
}

function makeBirdFly(bird: Bird) {
    bird.fly();
}

const eagle = new Eagle();
const penguin = new Penguin();

makeBirdFly(eagle);
makeBirdFly(penguin);

// solução : Estrutura adequada que respeita a substituição correta de classes.
// para resolver o problema, podemos utilizar o princípio Liskov Substitution Principle (LSP) para permitir a extensão sem modificar a classe existente e permitir que novos tipos de aves sejam adicionados sem violar o princípio Liskov.


class Bird2  {
    move() {
        console.log("Flying!");
    }
}

class Eagle2 extends Bird2 {
      move() {
        console.log("Flying!");
    }
}

class Penguin2 implements Bird2 {
    
    move() {
        console.log("Swimming!");
    }
}

function makeBirdFly2(bird: Bird2) {
    bird.move();
}

makeBirdFly2(new Eagle2());
makeBirdFly2(new Penguin2());
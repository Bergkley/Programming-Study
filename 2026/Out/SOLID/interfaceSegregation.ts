// Solid = interface Segregation Principle (ISP)

// problema inicial

// A interface Person tem dois métodos: work e eat. A classe Robot implementa a interface Person, mas não precisa do método eat, o que viola o princípio de segregação de interfaces.
interface Person {
    work(): void;
    eat(): void;
}

class Robot implements Person {
    work(): void {
        console.log("Robot is working");
    }
    eat(): void {
        throw new Error("Robots do not eat");
    }
}

// solução : Divisão de interfaces para atender necessidades específicas.

interface Workble{
    work(): void;
}

interface Eatable{
    eat(): void;
}

class Human implements Workble, Eatable {
    work(): void {
        console.log("Human is working");
    }
    eat(): void {
        console.log("Human is eating");
    }
}

class Robot2 implements Workble {
    work(): void {
        console.log("Robot is working");
    }
}
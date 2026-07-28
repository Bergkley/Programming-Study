// TypeScript Guards

// TypeOf ( usando para tipos primitivos )


function logValue(x: number | string) {
    if (typeof x === "number") {
        console.log(x.toFixed(2));
    } else {
        console.log(x.toUpperCase());
    }
}


// InstanceOf ( usando para classes )

class Dog {
    name: string;
    breed: string;
    constructor(name: string, breed: string) {
        this.name = name;
        this.breed = breed;
    }
}

function isDog(arg: any): arg is Dog {
    return arg instanceof Dog;
}

function logPet(pet: Dog | string) {
    if (isDog(pet)) {
        console.log(pet.name);
        console.log(pet.breed);
    } else {
        console.log(pet.toUpperCase());
    }
}

// in ( usando para objetos )

function getProperty(obj: any, key: string) {
    if (key in obj) {
        console.log(obj[key]);
    } else {
        console.log("Propriedade inexistente");
    }
}


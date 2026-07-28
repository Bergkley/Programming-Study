// Decorators

// Class Decorator
function LogClasse(constructor: Function) {
    console.log(`[LogClasse] ${constructor.name}`);
}
@LogClasse
class Greeter {
    property = "property";
    hello: string;
    constructor(m: string) {
        this.hello = m;
    }
}

// Method Decorator
function LogMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
        console.log(`[LogMethod] chamando ${target.constructor.name}.${propertyKey}`);
        return originalMethod.apply(this, args);
    };
}
class Greeter2 {
    property = "property";
    hello: string;
    constructor(m: string) {
        this.hello = m;
    }
    @LogMethod
    greet() {
        console.log(`Hello ${this.hello}`);
    }
}

// Property Decorator
function LogProperty(target: any, propertyKey: string) {
    let value: string;
    const getter = function () {
        console.log(`[LogProperty] lendo ${target.constructor.name}.${propertyKey}`);
        return value;
    };
    const setter = function (newVal: string) {
        console.log(`[LogProperty] alterando ${target.constructor.name}.${propertyKey}`);
        value = newVal;
    };
    Object.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
    });
}

class Greeter3 {
    property = "property";
    @LogProperty
    hello: string;
    constructor(m: string) {
        this.hello = m;
    }
} 

// Factory Decorator
function Logger(logString: string) {
    return function (constructor: Function) {
        console.log(logString);
        console.log(constructor);
    };
}

@Logger('logando...')
class Greeter4 {
    property = "property";
    hello: string;
    constructor(m: string) {
        this.hello = m;
    }
}
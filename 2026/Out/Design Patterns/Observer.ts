// Design Patterns: Observer Pattern in TypeScript

interface IObserver {
    update(data: any): void;
}

interface ISubject {
    subscribe(observer: IObserver): void;
    unsubscribe(observer: IObserver): void;
    notify(data: any): void;
}

class Subject implements ISubject {
    private observers: IObserver[] = [];

    subscribe(observer: IObserver): void {
        this.observers.push(observer);
    }

    unsubscribe(observer: IObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(data: any): void {
        this.observers.forEach(observer => observer.update(data));
    }
}


class Observer implements IObserver {
    update(data: any): void {
        console.log(`Observer updated with data: ${data}`);
    }
}

const subject = new Subject();

const observer1 = new Observer();
const observer2 = new Observer();

subject.subscribe(observer1);
subject.subscribe(observer2);

subject.notify("Hello, world!");

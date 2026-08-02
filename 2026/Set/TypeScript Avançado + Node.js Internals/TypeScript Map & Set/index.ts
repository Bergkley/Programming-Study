// Set

const arr = [1, 2,2, 3, 4, 5, 6, 7, 8, 9, 10];

const uniqueArr = arr.filter((value, index, self) => {
    return self.indexOf(value) === index;
});

const uniqueSet =[...new Set(arr)];

const arrSet = new Set();

arrSet.add(1);
arrSet.add(2);
arrSet.add(2);
arrSet.add(3);
arrSet.add(4);
arrSet.add(5);
arrSet.add(6);
arrSet.add(7);
arrSet.add(8);
arrSet.add(9);

console.log(arrSet);

console.log(arrSet.has(2));
console.log(arrSet.size);
console.log(arrSet.delete(2));
console.log(arrSet);

// Map

const people = [
    { id: 1,name: "Joao", age: 20 },
    { id: 3,name: "Berg", age: 21 },
    { id: 2,name: "Maria", age: 20 },
];

const newPeople = {} as Record<number, { id: number,name: string; age: number }>;
for(const person of people ) {
    const {id} = person;

    newPeople[id] = person;
}

console.log('Sem Map',newPeople); "coloca em oderm crescente e key é string"

const map = new Map();

for(const person of people) {
    const {id} = person;
    map.set(id, person);
}

console.log('Map',map); "deixa na ordem que estava e key é number";
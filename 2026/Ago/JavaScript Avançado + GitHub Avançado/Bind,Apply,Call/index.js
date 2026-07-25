// Bind

const person = {
  firstName: "John",
  lastName: "Doe",
  fullName: function () {
    return this.firstName + " " + this.lastName;
  },
};

const person2 = {
  firstName: "Berg",
  lastName: "Brazil",
};

const fullNamePerson2 = person.fullName.bind(person2);

console.log("Bind", fullNamePerson2());

// Call

const data = { name: "Berg" };

const greeting = function (profession, age) {
  console.log(`Hello ${this.name} ${profession} ${age}`);
};

greeting.call(data, "Developer", 20);

// Apply

const data2 = { name: "Berg" };

const greeting2 = function (profession, age) {
  console.log(`Hello ${this.name} ${profession} ${age}`);
};

greeting2.apply(data2, ["Developer", 21]);
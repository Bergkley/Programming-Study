// ProtoType

const prototypes = {
  String: String.prototype,
  Object: Object.prototype,
  Array: Array.prototype,
  Function: Function.prototype,
};

for (const [name, prototype] of Object.entries(prototypes)) {
  console.log(`\n${'='.repeat(20)} ${name}.prototype ${'='.repeat(20)}`);

  Object.getOwnPropertyNames(prototype).forEach((property) => {
    console.log(`- ${property}`);
  });
}
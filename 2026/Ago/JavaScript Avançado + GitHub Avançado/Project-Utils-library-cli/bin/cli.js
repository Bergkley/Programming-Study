#!/usr/bin/env node

import * as utils from "../src/index.js";

const args = process.argv.slice(2);

switch (args[0]) {
  case "sum":
    console.log(utils.sum(Number(args[1]), Number(args[2])));
    break;

  case "capitalize":
    console.log(utils.capitalize(args[1]));
    break;

  case "reverse":
    console.log(utils.reverse(args[1]));
    break;

  default:
    console.log(`
Utils Library CLI

Comandos:

node bin/cli.js  sum 5 3
node bin/cli.js  capitalize joao
node bin/cli.js  reverse chatgpt
`);
}
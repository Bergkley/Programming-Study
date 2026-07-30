import { v1 } from "uuid";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import querystring from "node:querystring";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const BC_URL =
  "https://erickwendel.github.io/business-card-template/index.html";
const __dirname = dirname(fileURLToPath(import.meta.url));

function createQueryStringFromObject(data) {
  const separator = null;
  const keyDelimiter = null;
  const options = { encodeURIComponent: querystring.unescape };
  const qs = querystring.stringify(data, separator, keyDelimiter, options);
  return qs;
}

async function render({ finalUrl, name }) {
  const output = join(__dirname, `/../output/${name}-${v1()}.pdf`);
  await mkdir(dirname(output), { recursive: true });

  const browser = await puppeteer.launch({
    // headless: false,
  });
  const page = await browser.newPage();
  await page.goto(finalUrl, { waitUntil: "networkidle2" });
  await page.waitForFunction(() => document.querySelector("#name")?.textContent.trim());

  await page.pdf({
    path: output,
    format: "A4",
    landscape: true,
    printBackground: true,
  });

  await browser.close();
}

async function main(message) {
  const pid = process.pid;
  console.log(`Worker ${pid} received message:`, message.name);
  const qs = createQueryStringFromObject(message);
  const finalUrl = `${BC_URL}?${qs}`;

  try {
    await render({ finalUrl, name: message.name });
    process.send(`${pid} has finished`);
  } catch (error) {
    process.send(`${pid} has crashed: ${error.stack}`);
  }
}
process.once("message", main);

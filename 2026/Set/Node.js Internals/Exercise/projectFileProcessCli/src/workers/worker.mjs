import { parentPort } from "worker_threads";

function transformChunk(chunk, operation, encoding) {
  const input = Buffer.from(chunk).toString(encoding);

  if (operation === "uppercase") {
    return Buffer.from(input.toUpperCase(), encoding);
  }

  return Buffer.from(input, encoding);
}

parentPort.on("message", ({ id, chunk, operation, encoding = "utf8" }) => {
  try {
    const result = transformChunk(chunk, operation, encoding);
    parentPort.postMessage({ id, result });
  } catch (error) {
    parentPort.postMessage({
      id,
      error: error.message,
    });
  }
});

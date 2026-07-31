import { Transform } from "stream";
import { Worker } from "worker_threads";

export class WorkerTransformStream extends Transform {
  constructor(options = {}) {
    super();

    const {
      operation = "uppercase",
      encoding = "utf8",
      workerPath = new URL("../workers/worker.mjs", import.meta.url),
    } = options;

    this.operation = operation;
    this.textEncoding = encoding;
    this.nextId = 1;
    this.callbacks = new Map();
    this.worker = new Worker(workerPath);

    this.worker.on("message", (message) => this.handleWorkerMessage(message));
    this.worker.on("error", (error) => this.destroy(error));
  }

  handleWorkerMessage({ id, result, error }) {
    const callback = this.callbacks.get(id);

    if (!callback) {
      return;
    }

    this.callbacks.delete(id);

    if (error) {
      callback(new Error(error));
      return;
    }

    callback(null, Buffer.from(result));
  }

  _transform(chunk, encoding, callback) {
    const id = this.nextId++;
    this.callbacks.set(id, callback);

    this.worker.postMessage({
      id,
      chunk,
      operation: this.operation,
      encoding: this.textEncoding,
    });
  }

  _final(callback) {
    this.worker.terminate().then(() => callback(), callback);
  }

  _destroy(error, callback) {
    for (const pendingCallback of this.callbacks.values()) {
      pendingCallback(error);
    }

    this.callbacks.clear();
    this.worker.terminate().finally(() => callback(error));
  }
}

export function createUppercaseTransform(options = {}) {
  return new WorkerTransformStream({
    ...options,
    operation: "uppercase",
  });
}

//
// Auto-load wasm binary in Node.js / Bun environments if not already provided
//
if (typeof process !== "undefined" && process.versions && (process.versions.node || process.versions.bun) && typeof require === "function") {
  if (typeof Module["wasmBinary"] === "undefined") {
    try {
      const _fs = require("fs");
      const _path = require("path");
      const _wasmFile = _path.resolve(__dirname, "stockfish.wasm");
      if (_fs.existsSync(_wasmFile)) {
        Module["wasmBinary"] = _fs.readFileSync(_wasmFile);
      }
    } catch (e) {}
  }
}

//
// Simple queue with async get (assume single consumer)
//
class Queue {
  constructor() {
    this.getter = null;
    this.list = [];
  }
  async get() {
    if (this.list.length > 0) {
      return this.list.shift();
    }
    return await new Promise((resolve) => (this.getter = resolve));
  }
  put(x) {
    if (this.getter) {
      this.getter(x);
      this.getter = null;
      return;
    }
    this.list.push(x);
  }
}

Module["queue"] = new Queue();

//
// Post message: if multithreaded (PThread workers available), post to workers;
// if single-threaded, put directly into Module["queue"].
//
Module["postCustomMessage"] = (data) => {
  if (typeof PThread !== "undefined" && PThread.runningWorkers && PThread.runningWorkers.length > 0) {
    for (let worker of PThread.runningWorkers) {
      worker.postMessage({ "cmd": "custom", "userData": data });
    }
  } else {
    Module["queue"].put(data);
  }
};

Module["onCustomMessage"] = (data) => {
  Module["queue"].put(data);
};

//
// API
//

// Align to the same API as niklasf's stockfish
Module["postMessage"] = Module["postCustomMessage"];

const listeners = [];

Module["addMessageListener"] = (listener) => {
  listeners.push(listener);
};

Module["removeMessageListener"] = (listener) => {
  const i = listeners.indexOf(listener);
  if (i >= 0) {
    listeners.splice(i, 1);
  }
};

Module["print"] = Module["printErr"] = (data) => {
  if (listeners.length === 0) {
    console.log(data);
    return;
  }
  for (let listener of listeners) {
    listener(data);
  }
};

Module["terminate"] = () => {
  if (typeof PThread !== "undefined" && typeof PThread.terminateAllThreads === "function") {
    PThread.terminateAllThreads();
  }
};

## fairy-stockfish-nnue.wasm (Single-Thread & Multi-Thread)

WebAssembly port of [Fairy-Stockfish](https://github.com/ianfab/Fairy-Stockfish) with NNUE and extensive chess variant support.

### Single-Threaded Build (`single-thread` branch)

The single-threaded build (`pthreads=no`) provides **universal browser compatibility**:
- **No `SharedArrayBuffer` requirement**: Runs in standard web contexts and userscripts without requiring Cross-Origin Isolation (`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers).
- **Works on Chess.com, Lichess, and any web page**: Can be loaded directly in browsers, Web Workers, Node.js, and Bun.
- **Full Variant & NNUE Support**: Supports King of the Hill, 3-Check, Atomic, Antichess, Crazyhouse, Horde, Racing Kings, and standard chess with embedded NNUE evaluation.

### Building Locally

Using Podman or Docker:

```bash
# Single-threaded build (recommended for universal web & userscript use)
podman run --rm -v $(pwd):/app -w /app/src/emscripten docker.io/emscripten/emsdk:2.0.26 \
  make -C .. emscripten_build ARCH=wasm pthreads=no wasm_simd=yes -j$(nproc)

# Multi-threaded build (requires SharedArrayBuffer & COOP/COEP)
podman run --rm -v $(pwd):/app -w /app/src/emscripten docker.io/emscripten/emsdk:2.0.26 \
  make -C .. emscripten_build ARCH=wasm pthreads=yes wasm_simd=yes -j$(nproc)
```

### Running with Bun or Node.js

```bash
# Interactive UCI shell
bun src/emscripten/public/uci.js

# Benchmark
bun src/emscripten/public/uci.js "bench 16 1 13 default depth"
```

### Browser / Userscript Usage (via jsDelivr CDN)

```javascript
import Stockfish from 'https://cdn.jsdelivr.net/gh/quantavil/fairy-stockfish.wasm@v1.0.0-single/dist/fairy-stockfish.js';

const sf = await Stockfish();
sf.addMessageListener((line) => {
  console.log(line);
});

sf.postMessage('uci');
sf.postMessage('setoption name UCI_Variant value kingofthehill');
sf.postMessage('position startpos');
sf.postMessage('go depth 12');
```

For development details, see [`src/emscripten/README.md`](src/emscripten/README.md).


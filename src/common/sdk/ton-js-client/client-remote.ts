import { tonWasmUrl } from "@/common/lib/constants";
import { TONClient } from "ton-client-js";
const workerScript = `

const wasmWrapper = (function() {
let wasm = null;
const result = {
    setup: (newWasm) => {
        wasm = newWasm;
    },
};


const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
* @returns {number}
*/
result.core_create_context = function() {
    var ret = wasm.core_create_context();
    return ret >>> 0;
}

/**
* @param {number} context
*/
result.core_destroy_context = function(context) {
    wasm.core_destroy_context(context);
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
/**
* @param {number} context
* @param {string} method
* @param {string} params_json
* @returns {string}
*/
result.core_json_request = function(context, method, params_json) {
    try {
        var ptr0 = passStringToWasm0(method, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(params_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        wasm.core_json_request(8, context, ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_free(r0, r1);
    }
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
    result.wbg = {};
    result.wbg.__wbg_new0_8d817915cd890bd8 = function() {
        var ret = new Date();
        return addHeapObject(ret);
    };
    result.wbg.__wbg_getTime_8e7a0578598e5039 = function(arg0) {
        var ret = getObject(arg0).getTime();
        return ret;
    };
    result.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    result.wbg.__wbg_static_accessor_MODULE_abf5ae284bffdf45 = function() {
        var ret = module;
        return addHeapObject(ret);
    };
    result.wbg.__wbg_self_1c83eb4471d9eb9b = handleError(function() {
        var ret = self.self;
        return addHeapObject(ret);
    });
    result.wbg.__wbg_require_5b2b5b594d809d9f = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    result.wbg.__wbg_crypto_c12f14e810edcaa2 = function(arg0) {
        var ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    result.wbg.__wbg_msCrypto_679be765111ba775 = function(arg0) {
        var ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    result.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    result.wbg.__wbg_getRandomValues_05a60bf171bfc2be = function(arg0) {
        var ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    result.wbg.__wbg_getRandomValues_3ac1b33c90b52596 = function(arg0, arg1, arg2) {
        getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
    };
    result.wbg.__wbg_randomFillSync_6f956029658662ec = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };
    result.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
   return result;
})()


self.onmessage = (e) => {
    const message = e.data;
    const setup = message.setup;
    if (setup) {
        (async () => {
            const instance = (await WebAssembly.instantiate(setup.wasmModule, {
                wbg: wasmWrapper.wbg
            })).exports;
            wasmWrapper.setup(instance);
            postMessage({
                setup: {}
            })
        })();
        return;
    }
    const request = message.request;
    if (request) {
        let result;
        try {
            if (request.method === 'context.create') {
                const context = wasmWrapper.core_create_context();
                result = JSON.stringify({result_json: JSON.stringify(context), error_json: ''});
            } else if (request.method === 'context.destroy') {
                wasmWrapper.core_destroy_context(request.context);
                result = JSON.stringify({result_json: '', error_json: ''});
            } else {
                result = wasmWrapper.core_json_request(request.context, request.method, request.params);
            }
        } catch (error) {
            result = JSON.stringify({
                result_json: '',
                error_json: JSON.stringify({
                    code: 6,
                    message: error.toString()
                })
            });
        }
        postMessage({
            response: {
                id: request.id,
                result,
            }
        });
    }
};
`;

const wasmOptions = {
  debugLog: console.log,
  binaryURL: tonWasmUrl,
};

function debugLog(message) {
  if (typeof wasmOptions === "object" && wasmOptions.debugLog) {
    (wasmOptions as any).debugLog(message);
  }
}

const createLibrary = async () => {
  const workerBlob = new Blob([workerScript], {
    type: "application/javascript",
  });
  const workerUrl = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerUrl);

  const activeRequests = new Map();

  // Deferred requests are accumulated before WASM module have been loaded
  let deferredRequests = [];

  let nextActiveRequestId = 1;

  worker.onerror = (evt) => {
    console.log(`Error from Web Worker: ${evt.message}`);
  };

  const coreRequest = (context, method, params, callback) => {
    const id = nextActiveRequestId;
    nextActiveRequestId += 1;
    const request = {
      id,
      context,
      method,
      params,
    };
    const isDeferredSetup = method === "setup" && deferredRequests !== null;
    activeRequests.set(id, {
      callback: isDeferredSetup ? () => {} : callback,
    });
    if (deferredRequests !== null) {
      (deferredRequests as any).push(request);
    } else {
      worker.postMessage({ request });
    }
    if (isDeferredSetup) {
      callback("", "");
    }
  };

  let legacyCoreContext = null;
  const library = {
    coreCreateContext: (callback) => {
      coreRequest(0, "context.create", "", (resultJson) => {
        if (callback) {
          const context = JSON.parse(resultJson);
          callback(context);
        }
      });
    },
    coreDestroyContext: (context, callback) => {
      coreRequest(context, "context.destroy", "", () => {
        if (callback) {
          callback();
        }
      });
    },
    coreRequest,
    request: (method, params, callback) => {
      if (legacyCoreContext === null) {
        library.coreCreateContext((context) => {
          legacyCoreContext = context;
          coreRequest(legacyCoreContext, method, params, callback);
        });
      } else {
        coreRequest(legacyCoreContext, method, params, callback);
      }
    },
  };

  worker.onmessage = (evt) => {
    const setup = evt.data.setup;
    if (setup) {
      for (const request of deferredRequests) {
        worker.postMessage({ request });
      }
      (deferredRequests as any) = null;
      return;
    }

    const response = evt.data.response;
    if (response) {
      const activeRequest = activeRequests.get(response.id);
      if (!activeRequest) {
        return;
      }
      activeRequests.delete(response.id);
      if (activeRequest.callback) {
        let { result } = response;
        // Remove BOM from result
        result = result.charCodeAt(0) === 0xfeff ? result.substr(1) : result;
        const { result_json, error_json } = JSON.parse(result);
        activeRequest.callback(result_json, error_json);
      }
    }
  };

  (async () => {
    const e = Date.now();
    let wasmModule;
    const fetched = fetch(wasmOptions.binaryURL);
    if (WebAssembly.compileStreaming) {
      debugLog("compileStreaming binary");
      wasmModule = await WebAssembly.compileStreaming(fetched);
    } else {
      debugLog("compile binary");
      wasmModule = await WebAssembly.compile(
        await (await fetched).arrayBuffer()
      );
    }
    worker.postMessage({
      setup: {
        wasmModule,
      },
    });
    debugLog(`compile time ${Date.now() - e}`);
  })();

  return Promise.resolve(library);
};

function setWasmOptions(options) {
  Object.assign(wasmOptions, options);
}

const clientPlatform = {
  fetch: window ? window.fetch.bind(window) : fetch,
  WebSocket,
  createLibrary,
};

function initTONClient(tonClientClass) {
  tonClientClass.setLibrary(clientPlatform);
}

initTONClient(TONClient);

export {
  createLibrary,
  setWasmOptions,
  clientPlatform,
  initTONClient,
  TONClient,
};

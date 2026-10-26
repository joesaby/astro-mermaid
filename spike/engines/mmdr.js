// mermaid-rs-renderer (mmdr) via the Typst wasm-minimal-protocol build.
export const name = 'mmdr';
let inst, args;
const enc = new TextEncoder(), dec = new TextDecoder();
let result;
export async function init() {
  const bytes = await (await fetch('/engines/typst_mmdr.wasm')).arrayBuffer();
  ({ instance: inst } = await WebAssembly.instantiate(bytes, {
    typst_env: {
      wasm_minimal_protocol_write_args_to_buffer: ptr => new Uint8Array(inst.exports.memory.buffer, ptr).set(args),
      wasm_minimal_protocol_send_result_to_host: (ptr, len) => { result = dec.decode(new Uint8Array(inst.exports.memory.buffer, ptr, len).slice()); },
    },
  }));
}
export async function render(src) {
  const parts = [src, 'default', '', ''].map(s => enc.encode(s));
  args = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let o = 0; for (const p of parts) { args.set(p, o); o += p.length; }
  result = undefined;
  const rc = inst.exports.render(...parts.map(p => p.length));
  if (rc !== 0) throw new Error('mmdr: ' + result);
  return result;
}

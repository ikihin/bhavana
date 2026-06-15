import { Buffer } from "buffer";

// Solana libraries require Buffer in the browser
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

import '@testing-library/jest-dom'
import { webcrypto } from 'node:crypto'
import { TextEncoder, TextDecoder } from 'node:util'

// Polyfill TextEncoder/TextDecoder — not always available in jsdom
Object.assign(globalThis, { TextEncoder, TextDecoder })

// Expose Web Crypto API (window.crypto.subtle) — jsdom doesn't wire this up by default
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
  configurable: true,
  writable: true,
})

// Polyfill Blob.prototype.arrayBuffer — not implemented in this jsdom version
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}

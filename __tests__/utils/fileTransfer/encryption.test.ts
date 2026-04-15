import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateEncryptionKey,
  exportKeyToString,
  importKeyFromString,
  encryptData,
  decryptData,
  encryptJSON,
  decryptJSON,
} from '@/utils/fileTransfer/encryption'

describe('arrayBufferToBase64', () => {
  it('converts an ArrayBuffer to a base64 string', () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
    expect(arrayBufferToBase64(bytes.buffer)).toBe('SGVsbG8=')
  })

  it('accepts a Uint8Array directly', () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111])
    expect(arrayBufferToBase64(bytes)).toBe('SGVsbG8=')
  })

  it('handles an empty buffer', () => {
    expect(arrayBufferToBase64(new ArrayBuffer(0))).toBe('')
  })
})

describe('base64ToArrayBuffer', () => {
  it('converts a base64 string to ArrayBuffer', () => {
    const result = new Uint8Array(base64ToArrayBuffer('SGVsbG8='))
    expect(Array.from(result)).toEqual([72, 101, 108, 108, 111])
  })

  it('roundtrips with arrayBufferToBase64', () => {
    const original = new Uint8Array([10, 20, 30, 40, 50])
    const b64 = arrayBufferToBase64(original.buffer)
    const restored = new Uint8Array(base64ToArrayBuffer(b64))
    expect(Array.from(restored)).toEqual([10, 20, 30, 40, 50])
  })
})

describe('generateEncryptionKey', () => {
  it('generates a secret CryptoKey for AES-GCM-256', async () => {
    const key = await generateEncryptionKey()
    expect(key.type).toBe('secret')
    expect(key.algorithm.name).toBe('AES-GCM')
    expect((key.algorithm as AesKeyAlgorithm).length).toBe(256)
    expect(key.extractable).toBe(true)
  })

  it('generates a different key on each call', async () => {
    const key1 = await generateEncryptionKey()
    const key2 = await generateEncryptionKey()
    const str1 = await exportKeyToString(key1)
    const str2 = await exportKeyToString(key2)
    expect(str1).not.toBe(str2)
  })
})

describe('exportKeyToString / importKeyFromString', () => {
  it('exports a key to a non-empty base64 string', async () => {
    const key = await generateEncryptionKey()
    const str = await exportKeyToString(key)
    expect(typeof str).toBe('string')
    expect(str.length).toBeGreaterThan(0)
  })

  it('imported key has the same algorithm as the original', async () => {
    const key = await generateEncryptionKey()
    const str = await exportKeyToString(key)
    const imported = await importKeyFromString(str)
    expect(imported.type).toBe('secret')
    expect(imported.algorithm.name).toBe('AES-GCM')
  })
})

describe('encryptData / decryptData', () => {
  it('encrypts data and produces iv and ciphertext fields', async () => {
    const key = await generateEncryptionKey()
    const data = new TextEncoder().encode('test payload')
    const encrypted = await encryptData(data, key)
    expect(typeof encrypted.iv).toBe('string')
    expect(typeof encrypted.ciphertext).toBe('string')
    expect(encrypted.iv.length).toBeGreaterThan(0)
    expect(encrypted.ciphertext.length).toBeGreaterThan(0)
  })

  it('decrypts back to the original plaintext', async () => {
    const key = await generateEncryptionKey()
    const original = 'Hello, secure world!'
    const data = new TextEncoder().encode(original)
    const encrypted = await encryptData(data, key)
    const decrypted = await decryptData(encrypted, key)
    expect(new TextDecoder().decode(decrypted)).toBe(original)
  })

  it('produces different ciphertext for the same plaintext (random IV)', async () => {
    const key = await generateEncryptionKey()
    const data = new TextEncoder().encode('same data')
    const enc1 = await encryptData(data, key)
    const enc2 = await encryptData(data, key)
    expect(enc1.iv).not.toBe(enc2.iv)
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext)
  })
})

describe('encryptJSON / decryptJSON', () => {
  it('encrypts and decrypts a JSON object correctly', async () => {
    const key = await generateEncryptionKey()
    const data = { message: 'hello', count: 42, nested: { ok: true } }
    const encrypted = await encryptJSON(data, key)
    const decrypted = await decryptJSON(encrypted, key)
    expect(decrypted).toEqual(data)
  })
})

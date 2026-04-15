import {
  createNewKey,
  createKeyExchangeMessage,
  importKeyFromExchange,
  isValidKeyString,
} from '@/utils/fileTransfer/keyManagement'

// Valid base64 string representing 32 bytes (AES-256 key length)
// 32 bytes of 0x41 ('A') in base64
const VALID_KEY_STRING = 'QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE='

describe('isValidKeyString', () => {
  it('returns true for a valid 44-character base64 string', () => {
    expect(isValidKeyString(VALID_KEY_STRING)).toBe(true)
  })

  it('returns false for a short string', () => {
    expect(isValidKeyString('abc')).toBe(false)
  })

  it('returns false for a string with invalid base64 characters', () => {
    expect(isValidKeyString('!'.repeat(44))).toBe(false)
  })

  it('returns false for a base64 string that is too long', () => {
    expect(isValidKeyString('A'.repeat(48))).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isValidKeyString('')).toBe(false)
  })
})

describe('createNewKey', () => {
  it('returns a CryptoKey usable for AES-GCM', async () => {
    const key = await createNewKey()
    expect(key.type).toBe('secret')
    expect(key.algorithm.name).toBe('AES-GCM')
  })
})

describe('createKeyExchangeMessage', () => {
  it('creates a message with type "key-exchange"', async () => {
    const key = await createNewKey()
    const msg = await createKeyExchangeMessage(key)
    expect(msg.type).toBe('key-exchange')
  })

  it('includes a non-empty base64 encryptionKey', async () => {
    const key = await createNewKey()
    const msg = await createKeyExchangeMessage(key)
    expect(typeof msg.encryptionKey).toBe('string')
    expect(msg.encryptionKey.length).toBeGreaterThan(0)
  })
})

describe('importKeyFromExchange', () => {
  it('imports a CryptoKey from a key-exchange message', async () => {
    const key = await createNewKey()
    const msg = await createKeyExchangeMessage(key)
    const imported = await importKeyFromExchange(msg)
    expect(imported.type).toBe('secret')
    expect(imported.algorithm.name).toBe('AES-GCM')
  })

  it('imports the same key that was exported', async () => {
    const key = await createNewKey()
    const msg = await createKeyExchangeMessage(key)
    const imported = await importKeyFromExchange(msg)
    // Verify by encrypting with original and decrypting with imported
    const { encryptData, decryptData } = await import('@/utils/fileTransfer/encryption')
    const data = new TextEncoder().encode('roundtrip test')
    const encrypted = await encryptData(data, key)
    const decrypted = await decryptData(encrypted, imported)
    expect(new TextDecoder().decode(decrypted)).toBe('roundtrip test')
  })
})

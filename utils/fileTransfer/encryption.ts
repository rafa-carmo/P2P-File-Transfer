/**
 * Funções de criptografia AES-GCM para P2P file transfer
 * Usa Web Crypto API nativa do navegador
 */

export interface EncryptedData {
  iv: string; // Base64
  ciphertext: string; // Base64
  salt: string; // Base64
}

/**
 * Gera uma chave criptográfica aleatória para AES-256
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable
    ["encrypt", "decrypt"],
  );
}

/**
 * Exporta a chave para compartilhamento (Base64)
 */
export async function exportKeyToString(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

/**
 * Importa a chave de uma string (Base64)
 */
export async function importKeyFromString(keyString: string): Promise<CryptoKey> {
  const buffer = base64ToArrayBuffer(keyString);
  return await window.crypto.subtle.importKey("raw", buffer, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Criptografa um ArrayBuffer
 */
export async function encryptData(
  data: ArrayBuffer,
  key: CryptoKey,
): Promise<EncryptedData> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV para GCM

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(encrypted),
    salt: "", // Adding salt field for consistency, not used in this mode
  };
}

/**
 * Descriptografa um EncryptedData
 */
export async function decryptData(
  encryptedData: EncryptedData,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  const iv = base64ToArrayBuffer(encryptedData.iv);
  const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);

  return await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
}

/**
 * Converte ArrayBuffer para Base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converte Base64 para ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Criptografa um objeto JSON
 */
export async function encryptJSON(
  data: Record<string, any>,
  key: CryptoKey,
): Promise<EncryptedData> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);

  return encryptData(dataBuffer, key);
}

/**
 * Descriptografa um objeto JSON
 */
export async function decryptJSON(
  encryptedData: EncryptedData,
  key: CryptoKey,
): Promise<Record<string, any>> {
  const decrypted = await decryptData(encryptedData, key);
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decrypted);

  return JSON.parse(jsonString);
}

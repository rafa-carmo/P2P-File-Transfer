import {
  generateEncryptionKey,
  exportKeyToString,
  importKeyFromString,
} from "./encryption";

export interface KeyExchange {
  type: "key-exchange";
  encryptionKey: string; // Base64 encoded key
}

/**
 * Gera uma nova chave de criptografia
 */
export async function createNewKey(): Promise<CryptoKey> {
  return await generateEncryptionKey();
}

/**
 * Cria uma mensagem de compartilhamento de chave
 */
export async function createKeyExchangeMessage(
  key: CryptoKey,
): Promise<KeyExchange> {
  const exportedKey = await exportKeyToString(key);

  return {
    type: "key-exchange",
    encryptionKey: exportedKey,
  };
}

/**
 * Importa uma chave de um mensagem de compartilhamento
 */
export async function importKeyFromExchange(
  message: KeyExchange,
): Promise<CryptoKey> {
  return await importKeyFromString(message.encryptionKey);
}

/**
 * Valida se uma chave está no formato correto
 */
export function isValidKeyString(keyString: string): boolean {
  try {
    // Tenta decodificar o base64
    atob(keyString);
    // Verifica se tem comprimento válido para AES-256 (32 bytes = 44 caracteres em base64)
    return keyString.length === 44; // 256 bits / 6 bits por char ≈ 43-44 chars
  } catch {
    return false;
  }
}

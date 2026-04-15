import { FileMeta } from "./types";
import { decryptData, EncryptedData } from "./encryption";

export interface ReceiveFileState {
  fileMeta: FileMeta & { encrypted?: boolean } | null;
  receivedBuffers: ArrayBuffer[];
  receivedSize: number;
}

export function initializeReceiveState(): ReceiveFileState {
  return {
    fileMeta: null,
    receivedBuffers: [],
    receivedSize: 0,
  };
}

export function addReceivedChunk(
  state: ReceiveFileState,
  chunk: ArrayBuffer,
  decryptionKey?: CryptoKey,
): Promise<number> | number {
  state.receivedBuffers.push(chunk);
  state.receivedSize += chunk.byteLength;

  if (state.fileMeta) {
    return (state.receivedSize / state.fileMeta.size) * 100;
  }

  return 0;
}

export async function addReceivedEncryptedChunk(
  state: ReceiveFileState,
  encryptedData: EncryptedData,
  decryptionKey: CryptoKey,
): Promise<number> {
  const decrypted = await decryptData(encryptedData, decryptionKey);
  state.receivedBuffers.push(decrypted);
  state.receivedSize += decrypted.byteLength;

  if (state.fileMeta) {
    return (state.receivedSize / state.fileMeta.size) * 100;
  }

  return 0;
}

export function setReceivedFileMeta(
  state: ReceiveFileState,
  meta: FileMeta & { encrypted?: boolean },
): void {
  state.fileMeta = meta;
  state.receivedBuffers = [];
  state.receivedSize = 0;
}

export function getReceivedFile(state: ReceiveFileState): Blob {
  return new Blob(state.receivedBuffers);
}

export function getReceiveProgress(state: ReceiveFileState): number {
  if (!state.fileMeta) return 0;
  return (state.receivedSize / state.fileMeta.size) * 100;
}

export function isFileEncrypted(state: ReceiveFileState): boolean {
  return state.fileMeta?.encrypted ?? false;
}

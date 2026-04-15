import { FileMeta } from "./types";

export interface ReceiveFileState {
  fileMeta: FileMeta | null;
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
): number {
  state.receivedBuffers.push(chunk);
  state.receivedSize += chunk.byteLength;

  if (state.fileMeta) {
    return (state.receivedSize / state.fileMeta.size) * 100;
  }

  return 0;
}

export function setReceivedFileMeta(
  state: ReceiveFileState,
  meta: FileMeta,
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

import { CHUNK_SIZE, MAX_BUFFER } from "./constants";
import { encryptData, EncryptedData } from "./encryption";

export interface SendFileState {
  offset: number;
  totalSize: number;
  isSending: boolean;
}

export async function sendFileMetadata(
  channel: RTCDataChannel,
  file: File,
  encryptionKey?: CryptoKey,
): Promise<void> {
  const metadata = {
    type: "meta",
    name: file.name,
    size: file.size,
    encrypted: !!encryptionKey,
  };

  channel.send(JSON.stringify(metadata));
}

export async function sendFileChunk(
  channel: RTCDataChannel,
  file: File,
  offset: number,
  encryptionKey?: CryptoKey,
): Promise<ArrayBuffer> {
  const endOffset = Math.min(offset + CHUNK_SIZE, file.size);
  const slice = file.slice(offset, endOffset);
  const buffer = await slice.arrayBuffer();

  if (encryptionKey) {
    // Criptografa o chunk
    const encrypted = await encryptData(buffer, encryptionKey);
    const encryptedMessage = {
      type: "chunk",
      data: encrypted,
    };
    channel.send(JSON.stringify(encryptedMessage));
  } else {
    // Envia sem criptografia
    channel.send(buffer);
  }

  return buffer;
}

export async function sendFile(
  channel: RTCDataChannel,
  file: File,
  onProgress: (progress: number) => void,
  encryptionKey?: CryptoKey,
): Promise<void> {
  if (channel.readyState !== "open") {
    throw new Error("Canal não está aberto");
  }

  await sendFileMetadata(channel, file, encryptionKey);

  let offset = 0;

  const sendChunk = async (): Promise<void> => {
    if (offset >= file.size) {
      channel.send(JSON.stringify({ type: "end" }));
      onProgress(100);
      return;
    }

    if (channel.bufferedAmount > MAX_BUFFER) {
      // Aguarda o buffer esvaziar
      return new Promise((resolve) => {
        channel.onbufferedamountlow = () => {
          resolve(sendChunk());
        };
      });
    }

    await sendFileChunk(channel, file, offset, encryptionKey);

    offset += CHUNK_SIZE;
    onProgress((offset / file.size) * 100);

    // Agenda próximo chunk
    await new Promise((resolve) => setTimeout(resolve, 0));
    return sendChunk();
  };

  return sendChunk();
}

export function getSendProgress(offset: number, totalSize: number): number {
  if (totalSize === 0) return 0;
  return (offset / totalSize) * 100;
}

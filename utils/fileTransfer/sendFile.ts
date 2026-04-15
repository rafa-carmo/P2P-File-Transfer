import { CHUNK_SIZE, MAX_BUFFER } from "./constants";

export interface SendFileState {
  offset: number;
  totalSize: number;
  isSending: boolean;
}

export async function sendFileMetadata(
  channel: RTCDataChannel,
  file: File,
): Promise<void> {
  const metadata = {
    type: "meta",
    name: file.name,
    size: file.size,
  };

  channel.send(JSON.stringify(metadata));
}

export async function sendFileChunk(
  channel: RTCDataChannel,
  file: File,
  offset: number,
): Promise<ArrayBuffer> {
  const endOffset = Math.min(offset + CHUNK_SIZE, file.size);
  const slice = file.slice(offset, endOffset);
  const buffer = await slice.arrayBuffer();

  channel.send(buffer);

  return buffer;
}

export async function sendFile(
  channel: RTCDataChannel,
  file: File,
  onProgress: (progress: number) => void,
): Promise<void> {
  if (channel.readyState !== "open") {
    throw new Error("Canal não está aberto");
  }

  await sendFileMetadata(channel, file);

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

    await sendFileChunk(channel, file, offset);

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

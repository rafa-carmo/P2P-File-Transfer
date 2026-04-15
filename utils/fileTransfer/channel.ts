import { MAX_BUFFER, CHANNEL_NAME } from "./constants";
import { DataChannelMessage, FileMeta } from "./types";
import { EncryptedData } from "./encryption";

export function createDataChannel(
  pc: RTCPeerConnection,
): RTCDataChannel {
  const channel = pc.createDataChannel(CHANNEL_NAME);
  channel.binaryType = "arraybuffer";
  channel.bufferedAmountLowThreshold = MAX_BUFFER;

  return channel;
}

export interface ChannelListenerOptions {
  decryptionKey?: CryptoKey;
  onEncryptedChunkError?: (error: Error) => void;
}

export function setupChannelListeners(
  channel: RTCDataChannel,
  onOpen: () => void,
  onMetaReceived: (meta: FileMeta) => void,
  onDataReceived: (data: ArrayBuffer) => void | Promise<void>,
  onTransferComplete: () => void,
  options?: ChannelListenerOptions,
) {
  channel.onopen = () => {
    console.log("Canal aberto");
    onOpen();
  };

  channel.onmessage = async (e) => {
    if (typeof e.data === "string") {
      const msg: any = JSON.parse(e.data);

      if (msg.type === "meta") {
        onMetaReceived(msg as FileMeta);
      }

      if (msg.type === "end") {
        onTransferComplete();
      }

      if (msg.type === "chunk" && options?.decryptionKey) {
        // Mensagem contém chunk criptografado
        try {
          const decrypted = await import("./encryption").then((m) =>
            m.decryptData(msg.data as EncryptedData, options.decryptionKey!),
          );
          await onDataReceived(decrypted);
        } catch (error) {
          const err = error instanceof Error ? error : new Error("Erro ao descriptografar");
          options.onEncryptedChunkError?.(err);
        }
      }
      return;
    }

    await onDataReceived(e.data);
  };

  channel.onerror = (error) => {
    console.error("Erro no canal:", error);
  };

  channel.onclose = () => {
    console.log("Canal fechado");
  };
}

export function isChannelReady(channel: RTCDataChannel | null): boolean {
  return channel !== null && channel.readyState === "open";
}

export function setupOndatachannel(
  pc: RTCPeerConnection,
  onDataChannelReceived: (channel: RTCDataChannel) => void,
) {
  pc.ondatachannel = (e) => {
    const channel = e.channel;
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = MAX_BUFFER;
    onDataChannelReceived(channel);
  };
}
